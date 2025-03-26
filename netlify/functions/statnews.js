const Parser = require("rss-parser");
const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
});

exports.handler = async function () {
  try {
    const feed = await parser.parseURL("https://www.statnews.com/feed");
    const stories = feed.items.slice(0, 10).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.content || "",
      link: item.link,
      image_url: extractImageFromContent(item.content || ""),
      pubDate: item.pubDate,
      sourceLabel: "Stat News",
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(stories),
    };
  } catch (err) {
    console.error("❌ Stat News fetch failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch Stat News feed." }),
    };
  }
};

function extractImageFromContent(content) {
  const match = content.match(/<img[^>]*src=["'](.*?)["']/);
  return match ? match[1] : null;
}
