// netlify/functions/fetchHealthScience.js
const Parser = require("rss-parser");

const parser = new Parser();

const feeds = [
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Health.xml", sourceLabel: "NYT Health" },
  { url: "https://www.npr.org/rss/rss.php?id=1007", sourceLabel: "NPR Health" },
  { url: "https://www.statnews.com/feed/", sourceLabel: "STAT News" },
  { url: "https://www.cbsnews.com/latest/rss/health", sourceLabel: "CBS Health"},
  {url: "https://www.cbsnews.com/latest/rss/science", sourceLabel: "CBS Science"},
  {url: "https://feeds.content.dowjones.io/public/rss/socialhealth", sourceLabel: "WSJ Health"}
];

exports.handler = async function () {
  try {
    const allItems = await Promise.all(
      feeds.map(async ({ url, sourceLabel }) => {
        const feed = await parser.parseURL(url);
        return feed.items.map((item) => ({
          title: item.title,
          link: item.link,
          pubDate: item.pubDate,
          sourceLabel,
          image_url: item.enclosure?.url || null,
          description: item.contentSnippet || item.content || "",
        }));
      })
    );

    const flatItems = allItems.flat();
    const sortedItems = flatItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));

    return {
      statusCode: 200,
      body: JSON.stringify(sortedItems),
    };
  } catch (error) {
    console.error("❌ Error fetching health/science feeds:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch health/science news" }),
    };
  }
}
