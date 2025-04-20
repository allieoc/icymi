// netlify/functions/fetchFilteredFocused.js

const Parser = require("rss-parser");
const parser = new Parser();

const fallbackImage = "https://moodscroll.co/assets/featured-story.png";

exports.handler = async function (event) {
  const blockedKeywords = (() => {
    try {
      const body = JSON.parse(event.body || "{}");
      return (body.excludeKeywords || []).map((k) => k.trim().toLowerCase());
    } catch (e) {
      return [];
    }
  })();

  console.log("🧹 Blocked keywords:", blockedKeywords);

  const sources = {
    top: [
      "https://www.pbs.org/newshour/feeds/rss/headlines",
      "https://abcnews.go.com/abcnews/topstories",
      "https://www.cbsnews.com/latest/rss/main",
      "https://abcnews.go.com/abcnews/usheadlines",
      "https://feeds.content.dowjones.io/public/rss/RSSUSnews"
    ],
    politics: [
      "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml",
      "http://feeds.bbci.co.uk/news/politics/rss.xml",
      "http://rss.cnn.com/rss/cnn_allpolitics.rss",
      "https://rss.politico.com/politics-news.xml",
      "https://www.thenation.com/subject/politics/feed/",
      "https://www.cbsnews.com/latest/rss/politics",
      "https://feeds.content.dowjones.io/public/rss/socialpoliticsfeed",
    ],
    world: [
      "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
      "https://www.aljazeera.com/xml/rss/all.xml",
      "http://feeds.bbci.co.uk/news/world/rss.xml", 
      "https://www.cbsnews.com/latest/rss/world",
      "https://feeds.content.dowjones.io/public/rss/RSSWorldNews",
    ],
    business: [
      "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
      "https://feeds.feedburner.com/TechCrunch/",
      "https://www.wired.com/feed/rss",
      "https://www.cbsnews.com/latest/rss/technology",
      "https://www.cbsnews.com/latest/rss/moneywatch",
      "https://feeds.content.dowjones.io/public/rss/WSJcomUSBusiness",
      "https://feeds.content.dowjones.io/public/rss/RSSWSJD",
    ],
    health: [
      "https://www.npr.org/rss/rss.php?id=1128",
      "https://www.statnews.com/feed/",
      "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml",
      "https://www.cbsnews.com/latest/rss/health",
      "https://www.cbsnews.com/latest/rss/science",
      "https://feeds.content.dowjones.io/public/rss/socialhealth", 
    ],
    trending: [
      "https://www.reddit.com/r/news/.rss",
      "https://www.reddit.com/r/worldnews/.rss",
    ],
  };

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  try {
    const results = {};

    for (const [category, urls] of Object.entries(sources)) {
      console.log(`\n🔍 Parsing category: ${category}`);
      const categoryStories = await Promise.all(
        urls.map(async (url) => {
          try {
            const feed = await parser.parseURL(url);
            const filtered = feed.items.filter((item) => {
              const content = `${item.title} ${item.contentSnippet || item.content || ""}`.toLowerCase();
              const pubDate = new Date(item.pubDate);
              return (
                pubDate > oneMonthAgo &&
                !blockedKeywords.some((keyword) => content.includes(keyword))
              );
            });
            return filtered.map((item) => ({
              title: item.title,
              description: item.contentSnippet || item.content || "",
              link: item.link,
              pubDate: item.pubDate,
              sourceLabel: feed.title,
            }));
          } catch (err) {
            console.error(`❌ Failed to parse ${url}`, err);
            return [];
          }
        })
      );

      // Interleave by source
      const groupedBySource = categoryStories.filter(Boolean).filter(arr => arr.length).reduce((acc, curr) => {
        const source = curr[0].sourceLabel || "unknown";
        acc[source] = curr;
        return acc;
      }, {});

      const interleaved = [];
      let round = 0;
      let added = true;

      while ((category === "top" ? interleaved.length < 6 : true) && added) {
        added = false;
        for (const source in groupedBySource) {
          if (groupedBySource[source][round]) {
            interleaved.push(groupedBySource[source][round]);
            added = true;
            if (category === "top" && interleaved.length === 6) break;
          }
        }
        round++;
      }

      if (category === "top" && interleaved[0]) {
        interleaved[0].image_url = "https://moodscroll.co/assets/featured-story.png";
      }

      results[category] = category === "top" ? interleaved.slice(0, 6) : interleaved;
    }

    return {
      statusCode: 200,
      body: JSON.stringify(results),
    };
  } catch (err) {
    console.error("❌ Error in fetchFilteredFocused:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch filtered focused stories." }),
    };
  }
};
