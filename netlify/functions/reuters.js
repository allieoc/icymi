// netlify/functions/reuters.js

import Parser from 'rss-parser';

const parser = new Parser();

export async function handler(event, context) {
  const feedUrl = 'https://www.reutersagency.com/feed/?best-topics=top-news'; // Top news RSS

  try {
    const feed = await parser.parseURL(feedUrl);

    const articles = feed.items.map((item) => ({
      title: item.title,
      description: item.contentSnippet || "",
      link: item.link,
      pubDate: item.pubDate,
      image_url: item.enclosure?.url || null,
      sourceLabel: "Reuters",
    }));

    return {
      statusCode: 200,
      body: JSON.stringify(articles),
    };
  } catch (error) {
    console.error("❌ Error parsing Reuters feed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to parse feed" }),
    };
  }
}
