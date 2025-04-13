import Parser from "rss-parser";
const parser = new Parser();

export async function handler() {
  try {
    const sources = [
      "https://feeds.bbci.co.uk/news/rss.xml",
      "https://www.pbs.org/newshour/feeds/rss/headlines",
      "https://abcnews.go.com/abcnews/topstories",
      //"https://www.aljazeera.com/xml/rss/all.xml",
      "https://www.vox.com/rss/index.xml",
      "https://www.cbsnews.com/latest/rss/main",
      "https://abcnews.go.com/abcnews/usheadlines",
      "https://feeds.content.dowjones.io/public/rss/RSSUSnews"
    ];

    const allStories = await Promise.all(
      sources.map(async (url) => {
        try {
          const feed = await parser.parseURL(url);
          return feed.items.map((item) => ({
            title: item.title,
            description: item.contentSnippet || item.content || "",
            link: item.link,
            pubDate: item.pubDate,
            sourceLabel: feed.title,
            image_url: item.enclosure?.url || null,
          }));
        } catch (err) {
          console.error(`Failed to fetch ${url}`, err);
          return [];
        }
      })
    );

    const flat = allStories.flat();
    const seen = new Set();
    const deduped = flat.filter((story) => {
      if (!story.link || seen.has(story.link)) return false;
      seen.add(story.link);
      return true;
    });

    return {
      statusCode: 200,
      body: JSON.stringify(deduped),
    };
  } catch (err) {
    console.error("❌ Error in fetchTopStories:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch top stories." }),
    };
  }
}
