// netlify/functions/fetchTrending.js
import Parser from "rss-parser";

const parser = new Parser();

const feeds = [
  { url: "https://www.reddit.com/r/news/.rss", sourceLabel: "Reddit /r/news" },
  { url: "https://www.reddit.com/r/worldnews/.rss", sourceLabel: "Reddit /r/worldnews" },
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
          image_url: null, // Reddit feeds don't include images
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
    console.error("❌ Error fetching trending feeds:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch trending news" }),
    };
  }
}
