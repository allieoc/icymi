import React, { useEffect, useState } from "react";
import StoryCard from "../../components/StoryCard/StoryCard";
import './Homepage.css';
import { useContext } from "react";
import { NewsContext } from "../../context/NewsContext";
import defaultImage from "src/assets/featured-story.png";

export default function Homepage() {
  const [featuredStory, setFeaturedStory] = useState(null);
  const [sideStories, setSideStories] = useState([]);  
  const [politicsNews, setPoliticsNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [worldNews, setWorldNews] = useState([]);
  const [businessTechNews, setBusinessTechNews] = useState([]);
  const [healthScienceNews, setHealthScienceNews] = useState([]);
  const { setNewsState } = useContext(NewsContext);

  

  const newsdataKey = import.meta.env.VITE_NEWSDATA_API_KEY;
  const newsdataBase = import.meta.env.VITE_NEWSDATA_BASE_URL;
  
  
  async function getStoryImage(story) {
    if (story.image_url && story.image_url.trim() !== "" && story.image_url !== "null") {
      return story.image_url;
    }
  
    return defaultImage;
  }

  async function fetchStatNews() {
    try {
      const res = await fetch("/.netlify/functions/statnews");
      const data = await res.json();
      console.log("Stat news fetch:", data);
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch Stat News feed:", err);
      return [];
    }
  }
  

  async function fetchCNBC() {
    try {
      const res = await fetch("/.netlify/functions/cnbc");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch CNBC feed:", err);
      return [];
    }
  }

  async function fetchMarketWatch() {
    try {
      const res = await fetch("/.netlify/functions/marketwatch");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch MarketWatch feed:", err);
      return [];
    }
  }
  

  async function fetchBloomberg() {
    try {
      const res = await fetch("/.netlify/functions/bloomberg");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch Bloomberg feed:", err);
      return [];
    }
  }
 
  async function fetchNewScientist() {
    try {
      const res = await fetch("/.netlify/functions/newscientist");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch New Scientist feed:", err);
      return [];
    }
  }
  

  async function fetchScienceDaily() {
    try {
      const res = await fetch("/.netlify/functions/sciencedaily");
      const data = await res.json();
      return data
    } catch (err) {
      console.error("❌ Failed to fetch Science Daily:", err);
      return [];
    }
  }  

  async function fetchBBCWorld() {
    try {
      const res = await fetch("/.netlify/functions/bbc");
      const data = await res.json();
      return data
      
    } catch (err) {
      console.error("❌ Failed to fetch BBC:", err);
      return [];
    }
  }  

  async function fetchABC() {
    try {
      const res = await fetch("/.netlify/functions/abc");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch ABC:", err);
      return [];
    }
  }  

  async function fetchAlJazeera() {
    try {
      const res = await fetch("/.netlify/functions/aljazeera");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch Al Jazeera:", err);
      return [];
    }
  }  


  async function fetchPBS() {
    try {
      const res = await fetch("/.netlify/functions/pbs");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch PBS:", err);
      return [];
    }
  }  


  async function fetchNPRTop() {
    try {
      const res = await fetch("/.netlify/functions/npr");
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch NPR feed:", err);
      return [];
    }
  }

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

  
  function isNationalNews(story) {
    const title = story.title?.toLowerCase() || "";
    const description = story.description?.toLowerCase() || "";
    const link = story.link?.toLowerCase() || "";
    const sourceLabel = story.source_name?.toLowerCase() || story.sourceLabel?.toLowerCase() || "";
  
    const strictKeywords = [
     "perspective", "opinion", "editorial", "baby photo",
      "column", "investors", "box office", "sale", "celebrity", "agriculture", "books",
      "book club", "true crime", "culture wars", "watch",
    ];
  
    const looseKeywords = [
      "shop with us", "puppy", "kitten", "zoo", "rescued", "gift guide",
      "promo code", "bald eagle", "baby animal", "surprise reunion",
      "gut health", "best deals", "hero dog", "trends", "instagram", "shocking",
      "surprising", "you won't believe", "blog", "interface", "fans", "k-pop"
    ];
  
    const excludedSources = [
      "us weekly", "tmz", "eonline", "thecouriertimes", "sports illustrated", "espn", "et online",
      "buzzfeed", "parade", "everyday health", "daily press", 
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
      "horse racing", "gold medal", "silver medal", "bronze medal", "major league", "minor league",
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
      sourceLabel.includes(src) || link.includes(src)
    );
  
    const isFromOpinionSection =
      link.includes("/opinion/") || link.includes("/editorial/") || link.includes("/perspective/");

      const isSportsStory =
      sportsKeywords.some((word) =>
        title.includes(word) || description.includes(word)
      ) ||
      sportsSources.some((src) =>
        sourceLabel.includes(src) || link.includes(src)
      );

      const isMediastack = sourceLabel.includes("mediastack");
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
          return false;
        }
      }
  
    const isFluff = hitStrict || hitLoose || isFromFluffSource || isFromOpinionSection || isSportsStory; //|| isTooShort || !hasImage;
  
    return !isFluff;
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
    "associated press",
    "pbs",
    "abc news",
    "al jazeera",
    "npr",
    "bbc",
    "reuters",
    "mediastack",
    "the guardian",
    "cnn",
    "axios",
    "politico",
    "bloomberg",
    "cnbc",
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
    const source = story.sourceLabel?.toLowerCase() || "";
  
    const healthKeywords = [
      "covid", "vaccine", "cdc", "health", "virus", "outbreak",
      "study", "research", "cancer", "medical", "clinical trial",
      "public health", "infection", "disease", "epidemic", "pandemic"
    ];
  
    const healthSources = [
      "new scientist",
      "science daily"
    ];
  
    const isKeywordMatch = healthKeywords.some(word => title.includes(word));
    const isFromHealthSource = healthSources.includes(source);
  
    return isKeywordMatch || isFromHealthSource;
  }
  
  
  function belongsToWorld(story) {
    const title = story.title?.toLowerCase() || "";
    //const description = story.description?.toLowerCase() || "";
    const worldKeywords = ["gaza", "ukraine", "russia", "china", "iran", "israel", "un", "foreign", "eu", "global",
      "europe", "asia", "africa", "south america", "world", "conflict", "terrorism", "nato", "war"]

    const worldKeywordMatch = worldKeywords.some(word => title.includes(word))
    
    return worldKeywordMatch;
  }
  
  function belongsToBusinessTech(story) {
    const title = story.title?.toLowerCase() || "";
    const source = story.sourceLabel?.toLowerCase() || "";
  
    const businessKeywords = [
      "tech", "ai", "stock", "startup", "economy", "inflation",
      "bank", "crypto", "layoffs", "google", "apple", "microsoft",
      "investment", "finance", "earnings", "merger", "ipo", "business", "sells",
      "business deal", "selling", "equity", "assets",
    ];
  
    const businessSources = [
      "marketwatch", 
      "bloomberg", 
      "cnbc", 
      "business insider", 
      "financial times"
    ];
  
    const keywordMatch = businessKeywords.some(word => title.includes(word));
    const sourceMatch = businessSources.includes(source);
  
    return keywordMatch || sourceMatch;
  }
  
  function interleaveBySource(stories) {
    const groups = stories.reduce((acc, story) => {
      const source = story.sourceLabel || "unknown";
      if (!acc[source]) acc[source] = [];
      acc[source].push(story);
      return acc;
    }, {});
  
    const result = [];
    const groupKeys = Object.keys(groups);
  
    let added = true;
    while (added) {
      added = false;
      for (const key of groupKeys) {
        const group = groups[key];
        if (group.length) {
          result.push(group.shift());
          added = true;
        }
      }
    }
  
    return result;
  }
  
  // Load all sections
  useEffect(() => {
    setLoading(true);
    async function fetchAllNews() {

  
      const [
        newsdataPolitics,
        newsdataWorld,
        newsdataBusiness,
        guardianUS,
        guardianWorld,
        gnewsWorld,
        gnewsNation,
        mediastackNews,
        reddit,
        nprTop,
        bbc,
        pbsTop,
        abcTop,
        aljazeeraTop,
        scienceDaily,
        newScientist,
        marketWatch,
        bloomberg,
        cnbc,
        statNews,
      ] = await Promise.all([
        safeFetch(() => fetchNewsDataSection("politics")),
        safeFetch(() => fetchNewsDataSection("world")),
        safeFetch(() => fetchNewsDataSection("business")),
        safeFetch(() => fetchGuardianSection("us-news")),
        safeFetch(() => fetchGuardianSection("world")),
        safeFetch(() => fetchGNewsSection("world")),
        safeFetch(() => fetchGNewsSection("nation")),
        safeFetch(fetchMediastackNews),
        safeFetch(fetchRedditTrending),
        safeFetch(fetchNPRTop),
        safeFetch(fetchBBCWorld),
        safeFetch(fetchPBS),
        safeFetch(fetchABC),
        safeFetch(fetchAlJazeera),
        safeFetch(fetchScienceDaily),
        safeFetch(fetchNewScientist),
        safeFetch(fetchMarketWatch),
        safeFetch(fetchBloomberg),
        safeFetch(fetchCNBC),
        safeFetch(fetchStatNews),
      ]);
      console.log("🧾 CNBC stories:", cnbc);
      console.log("Modern Healthcare stories:", statNews);

      

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
        ...nprTop,
        ...bbc,
        ...pbsTop,
        ...abcTop,
        ...aljazeeraTop,
      ].filter(isNationalNews);

      // 🧽 De-duplicate
      const deduped = dedupedStories(allTopCandidates);

      //Sort by source preference
      const sortedByPriority = sortBySourcePriority(deduped);

  
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


      const featured = sortedHard[0];
      let side = sortedHard.slice(1, 6);

      const top6 = [featured, ...side];

      // 🔁 Enhance image fallback
      const topWithImages = await Promise.all(
        top6.map(async (story) => ({
          ...story,
          image_url: await getStoryImage(story),
        }))
      );

      // 🧠 Final split
      const enhancedFeatured = topWithImages[0];
      const enhancedSide = topWithImages.slice(1);


      // 💬 Backfill with soft stories if needed
      if (side.length < 5) {
        const fillCount = 5 - side.length;
        side = [...side, ...sortedSoft.slice(0, fillCount)];
      }

      // Set top stories
      setFeaturedStory(enhancedFeatured);
      setSideStories(enhancedSide);      


      // ✨ Track used links
      const usedLinks = new Set([
        featured?.link,
        ...side.map((s) => s.link),
      ]);

      const healthCandidates = interleaveBySource([
        ...scienceDaily,
        ...newScientist,
        ...statNews
      ]);      

      const businessCandidates = interleaveBySource([
        ...marketWatch,
        ...bloomberg,
        ...cnbc,
      ]);

      console.log("💼 Business candidates:", businessCandidates);
      console.log("🧬 Health candidates:", healthCandidates);
    


      const fallbackHealth = deduped.filter(belongsToHealthScience);
      const fallbackBusiness = deduped.filter(belongsToBusinessTech);

      function fillSection(label, stories, fallbackPool) {

        // Deduped by link
        const uniqueStories = stories.filter((s) => !usedLinks.has(s.link)).slice(0, 15);

        // If less than 5, backfill from general pool
        let finalStories = [...uniqueStories];
        if (finalStories.length < 5) {
          const fillers = fallbackPool.filter(
            (s) => !usedLinks.has(s.link) && !uniqueStories.includes(s)
          ).slice(0, 15 - finalStories.length);

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

      console.log("🧠 Final other stories:", otherStories);

      // 🔄 Fill each section with fallback logic
      fillSection(
        "politics",
        interleaveBySource(otherStories.filter(belongsToPolitics).filter(isNationalNews)),
        otherStories
      );

      console.log(politicsNews)

      fillSection("world", interleaveBySource(otherStories.filter(belongsToWorld).filter(isNationalNews)), otherStories);
      
      fillSection(
        "businessTech",
        (businessCandidates.filter(isNationalNews)), fallbackBusiness);
        console.log("🧠 businessTechNews:", businessTechNews);


      fillSection("healthScience", (healthCandidates.filter(isNationalNews)), fallbackHealth);
      
      // 🎯 Trending is separate (Reddit only)
      setTrendingNews(reddit.slice(0, 15));

  
    
    }
    setLoading(false);
    fetchAllNews();
  }, []);

  useEffect(() => {
    if (healthScienceNews.length > 0) {
      setNewsState((prev) => ({
        ...prev,
        health: healthScienceNews,
      }));
    }
  }, [healthScienceNews]);

  useEffect(() => {
    if (businessTechNews.length > 0) {
      setNewsState((prev) => ({
        ...prev,
        business: businessTechNews,
      }));
    }
  }, [businessTechNews]);

  useEffect(() => {
    if (politicsNews.length > 0) {
      setNewsState((prev) => ({
        ...prev,
        politics: politicsNews,
      }));
    }
  }, [politicsNews]);

  useEffect(() => {
    if (worldNews.length > 0) {
      setNewsState((prev) => ({
        ...prev,
        world: worldNews,
      }));
    }
  }, [worldNews]);

  useEffect(() => {
    if (trendingNews.length > 0) {
      setNewsState((prev) => ({
        ...prev,
        trending: trendingNews,
      }));
    }
  }, [trendingNews]);

    return (
      

      <div className="homepage">
      <section className="top-stories">
      <h2>Latest News</h2>
      <div className="top-grid">
        <div className="featured-story">
        {featuredStory && (
        <>
          {featuredStory.title && (
            <StoryCard story={featuredStory} isFeatured={true} />
          )}
        </>
        )}

        </div>

        <div className="side-stories">
          {sideStories.map((story, index) => (
            <StoryCard key={`${story.link}-${index}`} story={story} isCompact={true} hideImage={true} />
          ))}
          

        </div>
      </div>
    </section>

      <section className="section-grid">
  {/* Politics */}
  <div className="section-block politics">
    <h2>Politics</h2>
    {politicsNews.slice(0, 5).map((story, index) => (
      <a
        key={`${story.link}-${index}`}
        href={story.link}
        className="headline"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p>{story.title}</p>
        <span className="source">{story.sourceLabel}</span>
      </a>
    ))}
  </div>

  {/* Health & Science */}
  <div className="section-block health">
    <h2>Health & Science</h2>
    {healthScienceNews.slice(0, 5).map((story, index) => (
      <a
        key={`${story.link}-${index}`}
        href={story.link}
        className="headline"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p>{story.title}</p>
        <span className="source">{story.sourceLabel}</span>
      </a>
    ))}
  </div>

  {/* World News */}
  <div className="section-block world">
    <h2>World News</h2>
    {worldNews.slice(0, 5).map((story, index) => (
      <a
        key={`${story.link}-${index}`}
        href={story.link}
        className="headline"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p>{story.title}</p>
        <span className="source">{story.sourceLabel}</span>
      </a>
    ))}
  </div>

  {/* Business & Tech */}
  <div className="section-block tech">
    <h2>Business & Tech</h2>
    {businessTechNews.slice(0, 5).map((story, index) => (
      <a
        key={`${story.link}-${index}`}
        href={story.link}
        className="headline"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p>{story.title}</p>
        <span className="source">{story.sourceLabel}</span>
      </a>
    ))}
  </div>

  {/* Trending on Reddit */}
  <div className="section-block trending">
    <h2>Trending on Reddit</h2>
    {trendingNews.slice(0,5).map((story, index) => (
      <a
        key={`${story.link}-${index}`}
        href={story.link}
        className="headline"
        target="_blank"
        rel="noopener noreferrer"
      >
        <p>{story.title}</p>
        <span className="source">{story.sourceLabel}</span>
      </a>
    ))}
  </div>
</section>
</div>
  );
}