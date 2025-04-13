const Parser = require("rss-parser");
const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
});

exports.handler = async function () {
  try {
    const feed = await parser.parseURL("https://www.cnbc.com/id/10001147/device/rss/rss.html");
    const stories = feed.items.slice(0, 20).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.content || "",
      link: item.link,
      pubDate: item.pubDate,
      sourceLabel: "CNBC",
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(stories),
    };
  } catch (err) {
    console.error("❌ CNBC fetch failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch CNBC feed." }),
    };
  }
};
