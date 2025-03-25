const Parser = require("rss-parser");

const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" }, // ScienceDaily may block generic bots
});

exports.handler = async function () {
  try {
    const feed = await parser.parseURL("https://www.sciencedaily.com/rss/top/science.xml");

    const stories = feed.items.slice(0, 10).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.content || "",
      link: item.link,
      image_url: extractImageFromContent(item.content || item.contentSnippet),
      pubDate: item.pubDate,
      sourceLabel: "Science Daily",
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(stories),
    };
  } catch (err) {
    console.error("❌ ScienceDaily fetch failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch Science Daily feed." }),
    };
  }
};

// Optional: Try to extract an image from content HTML
function extractImageFromContent(content) {
  const match = content?.match(/<img.*?src=["'](.*?)["']/);
  return match ? match[1] : null;
}
