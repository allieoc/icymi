import React, { useEffect, useState, useContext } from "react";
import StoryCard from "../../components/StoryCard/StoryCard";
import SaveButton from "../../components/SaveButton/SaveButton";
import { logView } from "../../utils/logView";
import { useAuth } from "../../context/AuthContext";
import { NewsContext } from "../../context/NewsContext";
import defaultImage from "../../assets/featured-story.png";
import "./FocusedPage.css"
import SharePopup from "../../components/SharePopup/SharePopup";
import { Link } from "react-router-dom";
import KeywordTagInput from "../../components/KeywordTagInput/KeywordTagInput";

export default function FocusedPage() {
  const { user } = useAuth();
  const { setNewsState } = useContext(NewsContext);
  const [featuredStory, setFeaturedStory] = useState(null);
  const [sideStories, setSideStories] = useState([]);
  const [politicsNews, setPoliticsNews] = useState([]);
  const [worldNews, setWorldNews] = useState([]);
  const [businessTechNews, setBusinessTechNews] = useState([]);
  const [healthScienceNews, setHealthScienceNews] = useState([]);
  const [trendingNews, setTrendingNews] = useState([]);
  const [showShare, setShowShare] = useState(false);
  const [filterInput, setFilterInput] = useState("");
  const [filterKeywords, setFilterKeywords] = useState([]);
  const [feedUpdated, setFeedUpdated] = useState(false);

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

  useEffect(() => {
    const stored = localStorage.getItem("filterKeywords");
    if (stored) {
      const parsed = JSON.parse(stored);
      setFilterKeywords(parsed);
      refetchNews(parsed);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("filterKeywords", JSON.stringify(filterKeywords));
  }, [filterKeywords]);

  useEffect(() => {
    async function fetchNews() {
      try {
        const [
          topResponse,
          politicsResponse,
          worldResponse,
          businessResponse,
          healthResponse,
          trendingResponse
        ] = await Promise.all([
          fetch("/.netlify/functions/fetchTopStories").then((res) => res.json()),
          fetch("/.netlify/functions/fetchPolitics").then((res) => res.json()),
          fetch("/.netlify/functions/fetchWorld").then((res) => res.json()),
          fetch("/.netlify/functions/fetchBusinessTech").then((res) => res.json()),
          fetch("/.netlify/functions/fetchHealthScience").then((res) => res.json()),
          fetch("/.netlify/functions/fetchTrending").then((res) => res.json()),
        ]);

        const interleavedTop = interleaveBySource(topResponse);
        setFeaturedStory(interleavedTop[0]);
        setSideStories(interleavedTop.slice(1));
        setPoliticsNews(interleaveBySource(politicsResponse));
        setWorldNews(interleaveBySource(worldResponse));
        setBusinessTechNews(interleaveBySource(businessResponse));
        setHealthScienceNews(interleaveBySource(healthResponse));
        setTrendingNews(interleaveBySource(trendingResponse));

        setNewsState({
          politics: politicsResponse,
          world: worldResponse,
          business: businessResponse,
          health: healthResponse,
          trending: trendingResponse,
        });
      } catch (err) {
        console.error("❌ Error fetching focused page news:", err);
      }
    }

    fetchNews();
  }, []);

  const renderStory = (story) => (
    <div key={story.link} className="section-block-story relative">
      <StoryCard
        story={story}
        isCompact={true}
        onClick={() => {
          if (user?.id && story?.link) {
            logView({
              userId: user.id,
              content: {
                id: story.link,
                content_type: "article",
                title: story.title,
                url: story.link,
                source: story.sourceLabel,
              },
            });
          }
        }}
      />
      <SaveButton className="save-btn" story={story} />
    </div>
  );

  const handleApplyFilter = async () => {
    await refetchNews(filterKeywords);
    setFeedUpdated(true);
    setTimeout(() => setFeedUpdated(false), 3000);
  };

  const refetchNews = async (keywords = []) => {
    try {
      const res = await fetch("/.netlify/functions/fetchFilteredFocused", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ excludeKeywords: keywords }),
      });

      const filtered = await res.json();

      const interleavedTop = interleaveBySource(filtered.top || []);
      setFeaturedStory(interleavedTop[0]);
      setSideStories(interleavedTop.slice(1));

      setPoliticsNews(interleaveBySource(filtered.politics || []));
      setWorldNews(interleaveBySource(filtered.world || []));
      setBusinessTechNews(interleaveBySource(filtered.business || []));
      setHealthScienceNews(interleaveBySource(filtered.health || []));
      setTrendingNews(interleaveBySource(filtered.trending || []));
    } catch (err) {
      console.error("❌ Error refetching filtered stories:", err);
    }
  };

  return (
    <div className="focused-page">
      <div className="m-auto mt-6 w-full max-w-md">
        <label className="block text-sm font-medium text-indigo-900 mb-1">
          Please don’t show me stories about…
        </label>
        <KeywordTagInput 
          tags={filterKeywords} 
          setTags={(tags) => {
            setFilterKeywords(tags);
            setFeedUpdated(false);
          }}
        />
        <button
          type="submit"
          onClick={handleApplyFilter}
          className="mt-4 bg-indigo-600 text-white text-sm px-4 py-2 rounded-md hover:bg-indigo-800"
        >
          {feedUpdated ? "Feed Updated" : "Update Feed"}
        </button>
      </div>

      <section className="top-stories">
        <h2>Latest News</h2>
        <div className="top-grid">
          <div className="featured-story">
            {featuredStory && (
              <>
                <StoryCard
                  story={featuredStory}
                  isFeatured={true}
                  onClick={() => {
                    if (user?.id && featuredStory?.link) {
                      logView({
                        userId: user.id,
                        content: {
                          id: featuredStory.link,
                          content_type: "article",
                          title: featuredStory.title,
                          url: featuredStory.link,
                          source: featuredStory.sourceLabel,
                        },
                      });
                    }
                  }}
                />
                <SaveButton className="save-btn" story={featuredStory} />
              </>
            )}
          </div>
          <div className="side-stories">
            {sideStories.map((story) => (
              <div key={story.link} className="side-story">
                <StoryCard
                  story={story}
                  isCompact={true}
                  hideImage={true}
                  onClick={() => {
                    if (user?.id && story?.link) {
                      logView({
                        userId: user.id,
                        content: {
                          id: story.link,
                          content_type: "article",
                          title: story.title,
                          url: story.link,
                          source: story.sourceLabel,
                        },
                      });
                    }
                  }}
                />
                <SaveButton className="save-btn" story={story} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-grid">
        <div className="section-block politics">
          <Link to='/category/politics'>Politics</Link>
          {politicsNews.slice(0, 5).map(renderStory)}
        </div>

        <div className="section-block health">
          <Link to='/category/health'>Health & Science</Link>
          {healthScienceNews.slice(0, 5).map(renderStory)}
        </div>

        <div className="section-block world">
          <Link to='/category/world'>World News</Link>
          {worldNews.slice(0, 5).map(renderStory)}
        </div>

        <div className="section-block tech">
          <Link to='/category/business'>Business & Tech</Link>
          {businessTechNews.slice(0, 5).map(renderStory)}
        </div>

        <div className="section-block trending">
          <Link to='/category/trending'>Trending on Reddit</Link>
          {trendingNews.slice(0, 5).map(renderStory)}
        </div>
      </section>
    </div>
  );
}
