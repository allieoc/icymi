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
    ],
    politics: [
      "https://www.npr.org/rss/rss.php?id=1014",
    ],
    world: [
      "https://rss.nytimes.com/services/xml/rss/nyt/World.xml",
      "https://www.aljazeera.com/xml/rss/all.xml",
    ],
    business: [
      "https://feeds.a.dj.com/rss/RSSMarketsMain.xml",
      "https://feeds.feedburner.com/TechCrunch/",
    ],
    health: [
      "https://www.npr.org/rss/rss.php?id=1128",
      "https://www.statnews.com/feed/",
    ],
    trending: [
      "https://www.reddit.com/r/news/.rss",
      "https://www.reddit.com/r/worldnews/.rss",
    ],
  };

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
              return !blockedKeywords.some((keyword) => content.includes(keyword));
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

      const flat = categoryStories.flat();
      const seen = new Set();
      const deduped = flat.filter((story) => {
        if (!story.link || seen.has(story.link)) return false;
        seen.add(story.link);
        return true;
      }).slice(0, 6);

      if (category === "top" && deduped[0]) {
        deduped[0].image_url = fallbackImage;
      }

      results[category] = deduped;
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
