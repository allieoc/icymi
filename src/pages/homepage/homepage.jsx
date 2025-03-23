import React, { useEffect, useState } from "react";
import StoryCard from "../../components/StoryCard/StoryCard";


export default function Homepage() {
 const [topStories, setTopStories] = useState([]);
  const [politicsNews, setPoliticsNews] = useState([]);
  const [healthNews, setHealthNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [worldNews, setWorldNews] = useState([]);
  const [businessTechNews, setBusinessTechNews] = useState([]);
  const [healthScienceNews, setHealthScienceNews] = useState([]);

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
  
    const strictKeywords = [
      "nutrition", "hydration", "routine", "mindfulness", "diet",
      "yoga", "meditation", "perspective", "opinion", "editorial", "baby photo",
      "column", "investors", "box office", "sale", "celebrity", "agriculture", "books",
      "book club", "true crime", "culture wars",
    ];
  
    const looseKeywords = [
      "shop with us", "puppy", "kitten", "zoo", "rescued", "gift guide",
      "promo code", "bald eagle", "baby animal", "surprise reunion",
      "gut health", "best deals", "hero dog", "trends", "instagram", "shocking",
      "surprising", "you won't believe", "blog", "interface", "fans", 
    ];
  
    const excludedSources = [
      "us weekly", "tmz", "eonline", "thecouriertimes", "sports illustrated", "espn", "et online",
      "buzzfeed", "shape", "goop", "well+good", "mindbodygreen", "parade", "everyday health", "daily press", 
      "Analytics And Insight", "forbes", "daily mail", "dailymail", "alternet", "digitaltrends", "hothardware",
      "zme science", "oc register", "orange county register", "hello magazine", "boston herald",
    ];

    const sportsKeywords = [
      "nfl", "nba", "mlb", "nhl", "ncaa", "march madness", "super bowl", "playoffs",
      "world cup", "olympics", "final four", "championship", "draft pick", "trade rumors",
      "preseason", "postseason", "spring training", "game recap", "injury report", "sideline",
      "touchdown", "halftime", "quarterback", "pitcher", "home run", "goalkeeper", "soccer match",
      "football game", "basketball game", "baseball game", "tennis match", "golf tournament",
      "sports update", "sports roundup", "player profile", "athlete", "coach", "team", "scoreboard",
      "locker room", "buzzer beater", "highlight reel", "sports drama", "sports controversy", "ufc", "premier league",
      "horse racing", "gold medal", "silver medal", "bronze medal",
    ];

    const sportsSources = [
      "espn", "bleacher report", "sports illustrated", "cbssports", "nbcsports",
      "fox sports", "sporting news", "barstool sports", "mlb.com", "nba.com", "nfl.com",
      "the athletic", "skysports", "yahoo sports", "sb nation", "247sports", "tennis.com",
      "golf digest", "draft kings", "fanduel", "sportsnet", "usatoday sports", "hockey news",
      "the ringer sports"
    ];
    
    
  
    //const isTooShort = (story.description?.length || 0) < 50;
    //const hasImage = !!story.image_url;
  
    // Check strict keywords using word boundaries
    const hitStrict = strictKeywords.some((word) => {
      const regex = new RegExp(`\\b${word}\\b`, "i");
      return regex.test(title) || regex.test(description);
    });
  
    // Check loose keywords with basic substring match
    const hitLoose = looseKeywords.some((word) =>
      title.includes(word) || description.includes(word)
    );
  
    const isFromFluffSource = excludedSources.some((src) =>
      sourceName.includes(src) || link.includes(src)
    );
  
    const isFromOpinionSection =
      link.includes("/opinion/") || link.includes("/editorial/") || link.includes("/perspective/");

      const isSportsStory =
      sportsKeywords.some((word) =>
        title.includes(word) || description.includes(word)
      ) ||
      sportsSources.some((src) =>
        sourceName.includes(src) || link.includes(src)
      );

      if (isSportsStory) {
        console.log("🚫 Rejected for SPORTS:", story.title);
      }

      const isMediastack = sourceName.includes("mediastack");
      if (isMediastack) {
        const mediastackFluff = [
          "horse racing", "consensus picks", "powerball numbers", "lotto", "snow white",
          "opens to", "box office", "celebrity", "fun fact", "kicks off", "fashion", "tv show",
          "santa anita", "red carpet", "bachelorette", "netflix releases", "cast revealed", "spoiler alert",
          "dating rumors", "love island"
        ];

        const hasMediastackFluff = mediastackFluff.some((term) =>
          title.includes(term) || description.includes(term)
        );

        const isTooShort = title.length < 40;
        const isLikelyFluff = hasMediastackFluff || isTooShort;

        if (isLikelyFluff) {
          console.log("🚫 Rejected from Mediastack:", title);
          return false;
        }
      }


  
    const isFluff = hitStrict || hitLoose || isFromFluffSource || isFromOpinionSection || isSportsStory; //|| isTooShort || !hasImage;
  
    if (isFluff) {
      console.log("🚫 Rejected:", {
        title: story.title,
        source: sourceName,
        hitStrict,
        hitLoose,
        isFromFluffSource,
        isFromOpinionSection,
        isSportsStory,
        //isTooShort,
        //hasImage
      });
    }
  
    return !isFluff;
  }
  
  
  
  
  
  async function fetchMediastackNews(sourceLabel = "Mediastack") {
    const key = import.meta.env.VITE_MEDIASTACK_API_KEY;
    const url = `http://api.mediastack.com/v1/news?access_key=${key}&countries=us&languages=en&limit=10&sort=published_desc`;
  
    try {
      const res = await fetch(url);
      const data = await res.json();
  
      if (!Array.isArray(data.data)) {
        console.warn("⚠️ Unexpected Mediastack response:", data);
        return [];
      }
  
      return data.data.map((story) => ({
        title: story.title,
        description: story.description,
        link: story.url,
        image_url: story.image,
        sourceLabel,
        pubDate: story.published_at,
      }));
    } catch (err) {
      console.error("❌ Error fetching Mediastack news:", err);
      return [];
    }
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

  function dedupedStories(stories) {
    const seen = new Set();
    return stories.filter((story) => {
      if (seen.has(story.link + story.title)) return false;
      seen.add(story.link);
      return true;
    });
  }

  const preferredSources = [
    "mediastack",
    "reuters",
    "associated press",
    "npr",
    "bbc",
    "the guardian",
    "cnn",
    "axios",
    "politico"
  ];

  function sortBySourcePriority(stories) {
    return stories.sort((a, b) => {
      const aSource = a.sourceLabel?.toLowerCase() || "";
      const bSource = b.sourceLabel?.toLowerCase() || "";
  
      const aIndex = preferredSources.findIndex(src => aSource.includes(src));
      const bIndex = preferredSources.findIndex(src => bSource.includes(src));
  
      // If both found, sort by index
      if (aIndex !== -1 && bIndex !== -1) return aIndex - bIndex;
  
      // If one is found, prioritize it
      if (aIndex !== -1) return -1;
      if (bIndex !== -1) return 1;
  
      // Fallback to date
      return new Date(b.pubDate || b.date || 0) - new Date(a.pubDate || a.date || 0);
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

  function isTrulyHardNews(story) {
    const fluffIndicators = [
      "conan", "celebrity", "award", "prize", "mark twain", "funny", "humor",
      "sports", "pitch count", "miami open", "mets", "yankees", "nfl", "nba",
      "steelers", "patriots", "trade", "coach", "mlb", "mls", "tennis", "soccer",
      "stadium", "tournament", "draft", "game", "championship", "player",
      "next-generation", "tech upgrade", "product release", "bandwidth",
      "influencer", "viral", "tiktok", "trend", "stock", "pricing",
    ];
  
    const title = story.title?.toLowerCase() || "";
    return !fluffIndicators.some((keyword) => title.includes(keyword));
  }


  function belongsToPolitics(story) {
    const title = story.title?.toLowerCase() || "";
    return title.includes("biden") || title.includes("trump") ||
           title.includes("congress") || title.includes("senate") ||
           title.includes("election") || title.includes("white house") ||
           title.includes("governor") || title.includes("house speaker");
  }
  
  function belongsToHealthScience(story) {
    const title = story.title?.toLowerCase() || "";
    return title.includes("covid") || title.includes("vaccine") ||
           title.includes("cdc") || title.includes("health") ||
           title.includes("virus") || title.includes("outbreak") ||
           title.includes("study") || title.includes("research") ||
           title.includes("cancer") || title.includes("medical");
  }
  
  function belongsToWorld(story) {
    const title = story.title?.toLowerCase() || "";
    return title.includes("gaza") || title.includes("ukraine") ||
           title.includes("russia") || title.includes("china") ||
           title.includes("iran") || title.includes("israel") ||
           title.includes("un") || title.includes("foreign") ||
           title.includes("eu") || title.includes("global");
  }
  
  function belongsToBusinessTech(story) {
    const title = story.title?.toLowerCase() || "";
    return title.includes("tech") || title.includes("ai") ||
           title.includes("stock") || title.includes("startup") ||
           title.includes("economy") || title.includes("inflation") ||
           title.includes("bank") || title.includes("crypto") ||
           title.includes("layoffs") || title.includes("google") ||
           title.includes("apple") || title.includes("microsoft");
  }
  

  // Load all sections
  useEffect(() => {
    async function fetchAllNews() {
      setLoading(true);
  
      const [
        newsdataPolitics,
        newsdataWorld,
        newsdataBusiness,
        newsdataHealth,
        guardianUS,
        guardianWorld,
        gnewsWorld,
        gnewsNation,
        mediastackNews,
        reddit
      ] = await Promise.all([
        safeFetch(() => fetchNewsDataSection("politics")),
        safeFetch(() => fetchNewsDataSection("world")),
        safeFetch(() => fetchNewsDataSection("business")),
        safeFetch(() => fetchNewsDataSection("health")),
        safeFetch(() => fetchGuardianSection("us-news")),
        safeFetch(() => fetchGuardianSection("world")),
        safeFetch(() => fetchGNewsSection("world")),
        safeFetch(() => fetchGNewsSection("nation")),
        safeFetch(fetchMediastackNews),
        safeFetch(fetchRedditTrending),
      ]);

      

  
      // 🧠 Merge all top candidates
      const allTopCandidates = [
        ...newsdataPolitics,
        ...newsdataWorld,
        ...newsdataBusiness,
        ...guardianUS,
        ...guardianWorld,
        ...gnewsWorld,
        ...gnewsNation,
        ...mediastackNews,
      ].filter(isNationalNews);
  
      // 🧽 De-duplicate
      const deduped = dedupedStories(allTopCandidates);

      //Sort by source preference
      const sortedByPriority = sortBySourcePriority(deduped);


      console.log("📥 All top candidates before filtering:", allTopCandidates.length);
      console.log("🧹 Deduped top candidates:", deduped.length);
  
      // 🧹 Remove soft stories from FEATURED story only
      const hardNews = sortedByPriority.filter(isTrulyHardNews);
      const softNews = sortedByPriority.filter((story) => !isTrulyHardNews(story));      
  
      // 🗂️ Sort by date
      const sortedHard = hardNews.sort((a, b) =>
        new Date(b.pubDate || b.date || 0) - new Date(a.pubDate || a.date || 0)
      );
      const sortedSoft = softNews.sort((a, b) =>
        new Date(b.pubDate || b.date || 0) - new Date(a.pubDate || a.date || 0)
      );
  
      // ⭐ Pick one hard news story as FEATURED
      const featured = sortedHard[0];
  
      // 📝 Get up to 5 side stories (de-duped)
      let sideStories = sortedHard
        .filter((s) => s.link !== featured?.link)
        .slice(0, 5);
  
      // 💬 Backfill with soft stories if needed
      if (sideStories.length < 5) {
        const fillCount = 5 - sideStories.length;
        sideStories = [...sideStories, ...sortedSoft.slice(0, fillCount)];
      }
  
      // 📰 Final list of 6 top stories
      setTopStories([featured, ...sideStories]);

      // ✨ Track used links
      const usedLinks = new Set([
        featured?.link,
        ...sideStories.map((s) => s.link),
      ]);

      function fillSection(label, stories, fallbackPool) {
        // Deduped by link
        const uniqueStories = stories.filter((s) => !usedLinks.has(s.link)).slice(0, 5);

        // If less than 5, backfill from general pool
        let finalStories = [...uniqueStories];
        if (finalStories.length < 5) {
          const fillers = fallbackPool.filter(
            (s) => !usedLinks.has(s.link) && !uniqueStories.includes(s)
          ).slice(0, 5 - finalStories.length);

          finalStories = [...finalStories, ...fillers];
        }

        // Update usedLinks
        finalStories.forEach((s) => usedLinks.add(s.link));

        // Set the state
        switch (label) {
          case "politics":
            setPoliticsNews(finalStories);
            break;
          case "world":
            setWorldNews(finalStories);
            break;
          case "businessTech":
            setBusinessTechNews(finalStories);
            break;
          case "healthScience":
            setHealthScienceNews(finalStories);
            break;
        }
      }

      // 📥 Other stories not in Top 6
      const otherStories = deduped.filter((s) => !usedLinks.has(s.link));

      // 🔄 Fill each section with fallback logic
      fillSection("politics", otherStories.filter(belongsToPolitics).filter(isNationalNews), otherStories);
      fillSection("world", otherStories.filter(belongsToWorld).filter(isNationalNews), otherStories);
      fillSection("businessTech", otherStories.filter(belongsToBusinessTech).filter(isNationalNews), otherStories);
      fillSection("healthScience", otherStories.filter(belongsToHealthScience).filter(isNationalNews), otherStories);

      // 🎯 Trending is separate (Reddit only)
      setTrendingNews(reddit.slice(0, 5));

  
      // 🔍 Helpful logs
      console.log("🧠 Featured:", featured?.title);
      console.log("📄 Side stories:", sideStories.map((s) => s.title));
      console.log("🗞 Mediastack stories:", mediastackNews.map((s) => s.title));
  
      setLoading(false);
    }
    
  
    fetchAllNews();
  }, []);
  
  if (!topStories.length || !topStories[0]) return <p>No stories available right now.</p>;
  if (loading) return <p>Loading the world…</p>;


  return (
    
    <div className="homepage">

    <section className="top-stories">
      <h2>Top Stories</h2>

      {/* === FEATURED STORY === */}
      <div className="featured-story">
        {topStories[0] && (
          <StoryCard story={topStories[0]} isFeatured={true} />
        )}
      </div>

      {/* === SMALLER STORIES === */}
      <div className="side-list">
        {topStories.slice(1).map((story) => (
          <StoryCard key={story.link} story={story} />
        ))}
      </div>

    </section>


            {/* === Politics Section === */}
      <section>
        <h2>Politics</h2>
        {politicsNews?.length > 0 && politicsNews.map((story) => (
          <StoryCard key={story.link} story={story} />
        ))}
      </section>

      {/* === Health & Science Section === */}
      <section>
        <h2>Health & Science</h2>
        {healthScienceNews?.length > 0 && healthScienceNews.map((story) => (
          <StoryCard key={story.link} story={story} />
        ))}
      </section>

      {/* === World News Section === */}
      <section>
        <h2>World News</h2>
        {worldNews?.length > 0 && worldNews.map((story) => (
          <StoryCard key={story.link} story={story} />
        ))}
      </section>

      {/* === Business & Tech Section === */}
      <section>
        <h2>Business & Tech</h2>
        {businessTechNews?.length > 0 && businessTechNews.map((story) => (
          <StoryCard key={story.link} story={story} />
        ))}
      </section>

      {/* === Trending Stories Section === */}
      <section>
        <h2>Trending on Reddit</h2>
        {trendingNews?.length > 0 && trendingNews.map((story) => (
          <StoryCard key={story.link} story={story} />
        ))}
      </section>

    </div>
  );
}
