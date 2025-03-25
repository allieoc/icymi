const Parser = require("rss-parser");
const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
});

exports.handler = async function () {
  try {
    const feed = await parser.parseURL("https://www.newscientist.com/subject/health/feed/");

    const stories = feed.items.slice(0, 10).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.content || "",
      link: item.link,
      image_url: extractImageFromContent(item.content || ""),
      pubDate: item.pubDate,
      sourceLabel: "New Scientist",
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(stories),
    };
  } catch (err) {
    console.error("❌ New Scientist fetch failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch New Scientist feed." }),
    };
  }
};

function extractImageFromContent(content) {
  const match = content.match(/<img[^>]*src=["'](.*?)["']/);
  return match ? match[1] : null;
}
