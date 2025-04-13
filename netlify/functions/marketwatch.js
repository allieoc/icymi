const Parser = require("rss-parser");
const parser = new Parser();

exports.handler = async function () {
  try {
    const feed = await parser.parseURL("https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines");

    const stories = feed.items.slice(0, 10).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.content || "",
      link: item.link,
      image_url: extractImageFromContent(item.content || item["content:encoded"]),
      pubDate: item.pubDate,
      sourceLabel: "MarketWatch",
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(stories),
    };
  } catch (err) {
    console.error("❌ MarketWatch fetch failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch MarketWatch feed." }),
    };
  }
};

function extractImageFromContent(content) {
  const match = content?.match(/<img.*?src=["'](.*?)["']/);
  return match ? match[1] : null;
}
