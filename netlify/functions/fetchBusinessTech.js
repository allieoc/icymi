// netlify/functions/fetchBusinessTech.js
import Parser from "rss-parser";

const parser = new Parser();

const feeds = [
  { url: "https://feeds.feedburner.com/TechCrunch/", sourceLabel: "TechCrunch" },
  { url: "https://feeds.a.dj.com/rss/RSSMarketsMain.xml", sourceLabel: "WSJ Markets" },
  { url: "https://www.wired.com/feed/rss", sourceLabel: "Wired" },
];

export async function handler() {
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
    console.error("❌ Error fetching business/tech feeds:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch business/tech news" }),
    };
  }
}
