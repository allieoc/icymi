// netlify/functions/fetchWorld.js
const Parser = require("rss-parser");

const parser = new Parser();

const feeds = [
  { url: "http://feeds.bbci.co.uk/news/world/rss.xml", sourceLabel: "BBC World" },
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/World.xml", sourceLabel: "NYT World" },
  { url: "https://www.aljazeera.com/xml/rss/all.xml", sourceLabel: "Al Jazeera" },
  {url: "https://www.cbsnews.com/latest/rss/world", sourceLabel: "CBS World"},
  {url: "https://feeds.content.dowjones.io/public/rss/RSSWorldNews", sourceLabel: "WSJ World"}
];

exports.handler = async function () {
  try {
    const allItems = await Promise.all(
      feeds.map(async ({ url, sourceLabel }) => {
        const feed = await parser.parseURL(url);
        return feed.items.map((item) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          sourceLabel,
          image_url: item.enclosure?.url || null,
          description: item.contentSnippet || item.content || "",
        }));
      })
    );

    const flatItems = allItems.flat();
    const sortedItems = flatItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return {
      statusCode: 200,
      body: JSON.stringify(sortedItems),
    };
  } catch (error) {
    console.error("❌ Error fetching world news feeds:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch world news" }),
    };
  }
}
