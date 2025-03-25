const Parser = require("rss-parser");
const parser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0" },
});

exports.handler = async function () {
  try {
    const feed = await parser.parseURL("https://www.nih.gov/news-events/news-releases/rss.xml");

    const stories = feed.items.slice(0, 10).map((item) => ({
      title: item.title,
      description: item.contentSnippet || item.content || "",
      link: item.link,
      image_url: null, // NIH rarely embeds images in RSS
      pubDate: item.pubDate,
      sourceLabel: "NIH",
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(stories),
    };
  } catch (err) {
    console.error("❌ NIH fetch failed:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch NIH feed." }),
    };
  }
};
