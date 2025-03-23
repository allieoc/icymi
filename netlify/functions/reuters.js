import Parser from "rss-parser";

const parser = new Parser();

export async function handler(event, context) {
  try {
    const feed = await parser.parseURL("https://www.reutersagency.com/feed/?best-topics=top-news");
    const stories = feed.items.slice(0, 10).map((item) => ({
      title: item.title,
      description: item.contentSnippet || "",
      link: item.link,
      image_url: item.enclosure?.url || null,
      sourceLabel: "Reuters",
      pubDate: item.pubDate,
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(stories),
    };
  } catch (err) {
    console.error("❌ Failed to parse Reuters feed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch Reuters feed" }),
    };
  }
}
