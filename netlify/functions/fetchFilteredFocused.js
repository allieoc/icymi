const Parser = require("rss-parser");
const cheerio = require("cheerio");
const fetch = (...args) => import("node-fetch").then(({default: fetch}) => fetch(...args));
const parser = new Parser();

const fallbackImage = "https://moodscroll.co/assets/featured-story.png";

async function getOgImage(url) {
  try {
    const res = await fetch(url, { timeout: 7000 });
    const html = await res.text();
    const $ = cheerio.load(html);
    const ogImage = $('meta[property="og:image"]').attr("content");
    console.log(`🔍 OG Image for ${url}:`, ogImage);
    return ogImage || null;
  } catch (err) {
    console.error(`❌ Failed to fetch OG image for ${url}:`, err);
    return null;
  }
}

async function parseFeed(url, blockedKeywords = []) {
  try {
    console.log(`📡 Fetching feed: ${url}`);
    const feed = await parser.parseURL(url);
    const enhancedItems = await Promise.all(
      feed.items.map(async (item) => {
        const content = `${item.title} ${item.contentSnippet || item.content || ""}`.toLowerCase();
        const isBlocked = blockedKeywords.some((k) => content.includes(k));
        if (isBlocked) {
          console.log(`🚫 Blocked due to keyword match: ${item.title}`);
          return null;
        }

        const image = await getOgImage(item.link);
        return {
          title: item.title,
          description: item.contentSnippet || item.content || "",
          link: item.link,
          pubDate: item.pubDate,
          sourceLabel: feed.title,
          image_url: image || null,
        };
      })
    );

    const results = enhancedItems.filter(Boolean);
    console.log(`✅ Parsed ${results.length} stories from ${url}`);
    return results;
  } catch (err) {
    console.error(`❌ Failed to parse ${url}`, err);
    return [];
  }
}

exports.handler = async function (event) {
  let blockedKeywords = [];

  try {
    const body = JSON.parse(event.body || "{}");
    blockedKeywords = (body.excludeKeywords || []).map((k) => k.trim().toLowerCase());
  } catch (err) {
    console.error("❌ Failed to parse POST body:", err);
  }

  console.log("🧹 Blocked keywords:", blockedKeywords);

  const sources = {
    top: [
      "https://www.pbs.org/newshour/feeds/rss/headlines",
      "https://abcnews.go.com/abcnews/topstories",
      "https://www.cbsnews.com/latest/rss/main",
    ],
    politics: [
      "https://feeds.a.dj.com/rss/RSSPoliticsNews.xml",
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
        urls.map((url) => parseFeed(url, blockedKeywords))
      );

      const flat = categoryStories.flat();
      const dedupedMap = new Map();
      flat.forEach((story) => {
        if (!dedupedMap.has(story.link)) {
          dedupedMap.set(story.link, story);
        }
      });
      const deduped = Array.from(dedupedMap.values()).slice(0, 6);
      console.log(`📦 Final ${category} stories:`, deduped.length);

      if (category === "top" && deduped[0] && !deduped[0].image_url) {
        console.log("🌟 Applying fallback image to top story");
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
