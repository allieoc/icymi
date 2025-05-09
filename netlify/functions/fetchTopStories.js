const Parser = require("rss-parser");
const fallbackImage = "https://moodscroll.co/assets/featured-story.png"; 
const parser = new Parser();
const cheerio = require("cheerio");
const fetch = require("node-fetch");


async function getOgImage(url) {
  try {
    const res = await fetch(url, { timeout: 7000 });
    const html = await res.text();
    const $ = cheerio.load(html);
    const ogImage = $('meta[property="og:image"]').attr("content");
    console.log(`🔍 OG image for ${url}:`, ogImage);
    return ogImage || null;
  } catch (err) {
    return null;
  }
}

exports.handler = async function () {
  try {
    const sources = [
      "https://www.pbs.org/newshour/feeds/rss/headlines",
      "https://abcnews.go.com/abcnews/topstories",
      "https://www.cbsnews.com/latest/rss/main",
      "https://abcnews.go.com/abcnews/usheadlines",
      "https://feeds.content.dowjones.io/public/rss/RSSUSnews"
    ];

    const allStories = await Promise.all(
      sources.map(async (url) => {
        try {
          const feed = await parser.parseURL(url);
          const enhancedItems = await Promise.all(
            feed.items.map(async (item) => {
              const image = await getOgImage(item.link);
              return {
                title: item.title,
                description: item.contentSnippet || item.content || "",
                link: item.link,
                pubDate: item.pubDate,
                sourceLabel: feed.title,
                image_url: image || fallbackImage,
              };
            })
          );
         
          return enhancedItems;
        } catch (err) {
          console.error(`Failed to fetch ${url}`, err);
          return [];
        }
      })
    );

    const flat = allStories.flat();
    const seen = new Set();
    const deduped = flat.filter((story) => {
      if (!story.link || seen.has(story.link)) return false;
      seen.add(story.link);
      return true;
    });

    return {
      statusCode: 200,
      body: JSON.stringify(deduped),
    };
  } catch (err) {
    console.error("❌ Error in fetchTopStories:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch top stories." }),
    };
  }
}
