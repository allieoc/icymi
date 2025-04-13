const Parser = require("rss-parser");
const parser = new Parser();

exports.handler = async function () {
    try {
      const feed = await parser.parseURL("https://www.aljazeera.com/xml/rss/all.xml");
      const stories = feed.items.map((item) => ({
        title: item.title,
        description: item.contentSnippet || item.content || "",
        link: item.link,
        image_url: item.enclosure?.url || null,
        pubDate: item.pubDate,
        sourceLabel: "Al Jazeera",
      }));
      return {
        statusCode: 200,
        body: JSON.stringify(stories),
      };
    } catch (err) {
      console.error("❌ Failed to parse Al Jazeera feed:", err);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Failed to fetch Al Jazeera feed" }),
      };
    }
  };