// netlify/functions/fetchPolitics.js
const Parser = require("rss-parser");

const parser = new Parser();

const feeds = [
  { url: "https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml", sourceLabel: "NYT Politics" },
  { url: "http://feeds.bbci.co.uk/news/politics/rss.xml", sourceLabel: "BBC Politics" },
  { url: "http://rss.cnn.com/rss/cnn_allpolitics.rss", sourceLabel: "CNN Politics" },
  { url: "https://rss.politico.com/politics-news.xml", sourceLabel: "Politico"},
  { url: "https://www.thenation.com/subject/politics/feed/", sourceLabel: "The Nation"},
  { url: "https://www.cbsnews.com/latest/rss/politics", sourceLabel: "CBS Politics"},
  {url: "https://feeds.content.dowjones.io/public/rss/socialpoliticsfeed", sourceLabel: "WSJ Politics"}
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
    console.error("❌ Error fetching politics feeds:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch politics news" }),
    };
  }
}
