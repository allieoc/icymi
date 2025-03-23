import React, { useEffect, useState } from "react";
import StoryCard from "../../components/StoryCard/StoryCard";

export default function Homepage() {
 const [topStories, setTopStories] = useState([]);
  const [politicsNews, setPoliticsNews] = useState([]);
  const [healthNews, setHealthNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  //const [guardianTop, setGuardianTop] = useState([]);
  //const [guardianPolitics, setGuardianPolitics] = useState([]);
 // const [guardianHealth, setGuardianHealth] = useState([]);



  const newsdataKey = import.meta.env.VITE_NEWSDATA_API_KEY;
  const newsdataBase = import.meta.env.VITE_NEWSDATA_BASE_URL;

  


  async function fetchGuardianSection(guardianSection, sourceLabel = "The Guardian") {
    const key = import.meta.env.VITE_GUARDIAN_API_KEY;
    const url = `https://content.guardianapis.com/search?api-key=${key}&show-fields=thumbnail,headline,trailText,short-url&order-by=newest&section=${guardianSection}&page-size=10`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (!Array.isArray(data.response.results)) {

        console.warn("⚠️ Unexpected Guardian response:", data);
        return [];
      }
  
      return data.response.results.map((story) => ({
        title: story.webTitle,
        description: story.fields?.trailText || "",
        link: story.webUrl,
        image_url: story.fields?.thumbnail || null,
        sourceLabel,
      }));
    } catch (err) {
      console.error(`❌ Error fetching Guardian ${guardianSection} stories:`, err);
      return [];
    }
  }

  // Fetch stories from GNews
  async function fetchGNewsSection(topic = "world", sourceLabel = "GNews") {
    const key = import.meta.env.VITE_GNEWS_API_KEY;
    const url = `https://gnews.io/api/v4/top-headlines?token=${key}&topic=${topic}&lang=en&country=us&max=10`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
  
      if (!Array.isArray(data.articles)) {
        console.warn("⚠️ Unexpected GNews response:", data);
        return [];
      }
  
      return data.articles.map((story) => ({
        title: story.title,
        description: story.description,
        link: story.url,
        image_url: story.image,
        sourceLabel,
        pubDate: story.publishedAt,
      }));
    } catch (err) {
      console.error(`❌ Error fetching GNews "${topic}" section:`, err);
      return [];
    }
  }
  
  
  

  // Fetch stories from NewsData.io
  async function fetchNewsDataSection(category, sourceLabel = "NewsData.io") {
    const url = `${newsdataBase}?apikey=${newsdataKey}&country=us&language=en&category=${category}`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
  
      if (data.status === "error") {
        console.warn(`❌ NewsData API error for "${category}":`, data);
        return [];
      }
  
      if (!Array.isArray(data.results)) {
        console.warn(`⚠️ Unexpected format for "${category}":`, data);
        return [];
      }
  
      return data.results.map((story) => ({
        ...story,
        sourceLabel,
      }));
    } catch (err) {
      console.error(`❌ Fetch failed for category "${category}":`, err);
      return [];
    }
  }
  
  
  function isNationalNews(story) {
    const title = story.title?.toLowerCase() || "";
    const description = story.description?.toLowerCase() || "";
    const link = story.link?.toLowerCase() || "";
    const sourceName = story.source_name?.toLowerCase() || story.sourceLabel?.toLowerCase() || "";
  
    // 🚫 Fluff, soft content, or low-signal topics
    const excludedKeywords = [
      // Local
      "town hall", "county", "mayor", "city council", "village", "sheriff", "school board", "township",
  
      // Shopping & affiliate
      "essentials", "best deals", "must-have", "available now", "buy now", "promo code", "amazon picks",
      "gift guide", "shopping list", "wishlist", "discount", "shop with us", "sponsored",
  
      // Entertainment & pop culture
      "celebrity", "oscars", "grammys", "trailer", "blockbuster", "tv show", "finale", "season premiere",
      "red carpet", "movie preview", "cast revealed", "reality show", "music video",
  
      // Wellness & lifestyle
      "wellness", "hydration", "skin care", "routine", "mental health tips", "self-care", "how to sleep better",
      "fitness tips", "diet", "nutrition", "gut health", "yoga", "meditation", "mindfulness",
  
      // Opinion or first-person
      "opinion:", "editorial:", "i believe", "my take", "guest essay", "column:", "viewpoint", "perspective",

      // Soft or human-interest topics
      "bald eagle", "rescued", "adopted", "foster", "puppy", "kitten", "animal shelter", 
      "surprise reunion", "heartwarming", "hero dog", "animal saves", "go fund me",
      "emotional support", "zoo", "baby animal", "caretaker", "rehab center", 
      "elderly couple", "birthday wish", "community rallies", "reunited"

    ];
  
    const excludedSources = [
      "us weekly", "tmz", "eonline", "thecouriertimes", "sports illustrated", "espn", "et online",
      "buzzfeed", "shape", "goop", "well+good", "mindbodygreen", "parade", "everyday health", "daily press", "Analytics And Insight"
    ];

    const isTooShort = (story.description?.length || 0) < 50;

  
    const hasFluffKeyword = excludedKeywords.some((word) =>
      title.includes(word) || description.includes(word)
    );
    
    const isFromFluffSource = excludedSources.some((src) =>
      sourceName.includes(src) || link.includes(src)
    );
  
    const isFromOpinionSection =
      link.includes("/opinion/") || link.includes("/editorial/") || link.includes("/perspective/");

    const hasImage = !!story.image_url;

    return !hasFluffKeyword && !isFromFluffSource && !isFromOpinionSection && isTooShort && hasImage;
  }
  
  
  
  
  
  

  // Fetch trending stories from Reddit
  async function fetchRedditTrending() {
    try {
      const res = await fetch("https://www.reddit.com/r/news/top.json?limit=10");
      const data = await res.json();

      return data.data.children.map((post) => ({
        title: post.data.title,
        description: "",
        link: `https://reddit.com${post.data.permalink}`,
        image_url: post.data.thumbnail?.startsWith("http")
          ? post.data.thumbnail
          : null,
        sourceLabel: "Reddit",
        pubDate: new Date(post.data.created_utc * 1000).toISOString(),
      }));
    } catch (err) {
      console.error("❌ Error fetching Reddit:", err);
      return [];
    }
  }

  function dedupeStoriesByLink(stories) {
    const seen = new Set();
    return stories.filter((story) => {
      if (seen.has(story.link)) return false;
      seen.add(story.link);
      return true;
    });
  }


  async function safeFetch(fetchFn) {
    try {
      const result = await fetchFn();
      return result || [];
    } catch (err) {
      console.error("❌ Safe fetch failed:", err);
      return [];
    }
  }
  

  // Load all sections
  useEffect(() => {
    async function fetchAllNews() {
      setLoading(true);

      const [
        newsdataPolitics,
        newsdataWorld,
        newsdataBusiness,
        newsdataHealth, // Optional
        guardianUS,
        guardianWorld,
        gnewsWorld,
        gnewsNation,
        reddit
      ] = await Promise.all([
        safeFetch(() => fetchNewsDataSection("politics")),
        safeFetch(() => fetchNewsDataSection("world")),
        safeFetch(() => fetchNewsDataSection("business")),
        safeFetch(() => fetchGuardianSection("us-news")),
        safeFetch(() => fetchGuardianSection("world")),
        safeFetch(() => fetchGNewsSection("world")),
        safeFetch(() => fetchGNewsSection("nation")),
        safeFetch(fetchRedditTrending)
      ]);


 
      
      // Combine curated categories for Top Stories
      const allTopCandidates = [
        ...guardianUS,
        ...guardianWorld,
        ...gnewsWorld,
        ...gnewsNation,
        ...newsdataPolitics,
        ...newsdataWorld,
        ...newsdataBusiness,
      ].filter(isNationalNews);

        const dedupedTop = dedupeStoriesByLink(allTopCandidates);

        // Sort by pubDate
        const sortedTopStories = dedupedTop.sort(
          (a, b) => new Date(b.pubDate || b.date || 0) - new Date(a.pubDate || a.date || 0)
        );
        

        // Grab the top 6
        const top6 = sortedTopStories.slice(0, 6);
        setTopStories(top6);
        setPoliticsNews([...newsdataPolitics, ...guardianUS].filter(isNationalNews));
        setHealthNews(newsdataHealth.filter(isNationalNews));
        setTrendingNews(reddit);

        console.log("🧠 Curated Top 6:", top6);

      
    setLoading(false);
    }

    fetchAllNews();

    
  }, []);


  if (loading) return <p>Loading the world…</p>;


  return (
    
    <div className="homepage">

    <section className="top-stories">
      <h2>Top Stories</h2>

      <div className="featured-and-list">
        {/* === FEATURED STORY === */}
        <div className="featured-story">
          {topStories[0] && (
            <StoryCard story={topStories[0]} isFeatured={true} />
          )}
        </div>

        {/* === SMALLER STORIES === */}
        <div className="side-list">
          {topStories.slice(1, 6).map((story) => (
            <StoryCard key={story.link} story={story} />
          ))}
        </div>
      </div>
    </section>


      {/* === Politics Section === */}
      <section>
        <h2>Politics</h2>
        {politicsNews?.length > 0 && politicsNews.slice(0, 5).map((story) => (
          <StoryCard key={story.link} story={story} />
        ))}
      </section>

      {/* === Health Section === */}
      <section>
        <h2>Health</h2>
        {healthNews?.length > 0 && healthNews.slice(0, 5).map((story) => (
          <StoryCard key={story.link} story={story} />
        ))}
      </section>

      {/* === Trending Stories Section === */}
      <section>
        <h2>Trending on Reddit</h2>
        {trendingNews?.length > 0 && trendingNews.slice(0, 5).map((story) => (
          <StoryCard key={story.link} story={story} />
        ))}
      </section>
    </div>
  );
}
