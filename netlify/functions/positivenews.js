const Parser = require("rss-parser");
const parser = new Parser();

exports.handler = async function () {
    try {
      const feed = await parser.parseURL("https://www.positive.news/feed/");
      const stories = feed.items.map((item) => ({
        title: item.title,
        description: item.contentSnippet || item.content || "",
        link: item.link,
        image_url: item.enclosure?.url || null,
        pubDate: item.pubDate,
        sourceLabel: "Positive News",
      }));
      return {
        statusCode: 200,
        body: JSON.stringify(stories),
      };
    } catch (err) {
      console.error("❌ Failed to parse Positive News feed:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to fetch Positive News feed" }),
      };
    }
  };