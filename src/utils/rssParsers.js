import Parser from "rss-parser";

const parser = new Parser();

export async function fetchReutersTopNews(sourceLabel = "Reuters") {
  const url = "https://feeds.reuters.com/reuters/topNews";
  
  try {
    const feed = await parser.parseURL(url);
    return feed.items.map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.summary || "",
      link: item.link,
      pubDate: item.isoDate || item.pubDate,
      image_url: item.enclosure?.url || null,
      sourceLabel,
    }));
  } catch (err) {
    console.error("❌ Error fetching Reuters top news:", err);
    return [];
  }
}