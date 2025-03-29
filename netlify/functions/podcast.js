const Parser = require("rss-parser");
const parser = new Parser();

const feeds = [
  {
    url: "https://www.npr.org/rss/podcast.php?id=500005",
    label: "NPR News Now",
    name: "nprnewsnow"
  },
  {
    url: "https://feeds.simplecast.com/54nAGcIl",
    label: "The Daily",
    name: "thedaily"
  },
  {
    url: "https://feeds.npr.org/510318/podcast.xml",
    label: "Up First",
    name: "upfirst"
  },
  {
    url: "https://feeds.megaphone.fm/morningbrewdaily",
    label: "Morning Brew Daily",
    name: "morningbrewdaily"
  },
  {
    url: "https://feeds.megaphone.fm/pivot",
    label: "Pivot",
    name: "pivot"
  },
  {
    url: "https://feeds.megaphone.fm/VMP5705694065",
    label: "Today, Explained",
    name: "todayexplained"
  }
];

exports.handler = async function(event) {
  try {
    const feedParam = event.queryStringParameters?.feed;
    const feedConfig = feeds.find((f) => f.name === feedParam);

    if (!feedConfig) {
      return {
        statusCode: 404,
        body: JSON.stringify({ error: `Podcast feed '${feedParam}' not found.` })
      };
    }

    const feed = await parser.parseURL(feedConfig.url);
    const fallbackImage = feed.image?.url || "";

    const stories = feed.items.map((item) => {
      let image_url =
        item.itunes?.image ||
        item["media:content"]?.url ||
        fallbackImage;

      return {
        title: item.title,
        description: item.contentSnippet || "",
        link: item.link,
        image_url,
        pubDate: item.pubDate,
        sourceLabel: feedConfig.label
      };
    });

    return {
      statusCode: 200,
      body: JSON.stringify(stories)
    };
  } catch (err) {
    console.error("❌ Podcast fetch error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch podcast feed." })
    };
  }
};
