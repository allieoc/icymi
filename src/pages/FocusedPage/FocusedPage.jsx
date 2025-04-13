import React, { useEffect, useState, useContext } from "react";
import StoryCard from "../../components/StoryCard/StoryCard";
import SaveButton from "../../components/SaveButton/SaveButton";
import { logView } from "../../utils/logView";
import { useAuth } from "../../context/AuthContext";
import { NewsContext } from "../../context/NewsContext";
import defaultImage from "../../assets/featured-story.png";
import "./FocusedPage.css"
import SharePopup from "../../components/SharePopup/SharePopup";


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

  const getStoryImage = async (story) => {
    return story.image_url?.trim() ? story.image_url : defaultImage;
  };

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
  
        // Interleave & enhance top stories
        const interleavedTop = interleaveBySource(topResponse);
        const enhancedTop = await Promise.all(
          interleavedTop.slice(0, 6).map(async (story) => ({
            ...story,
            image_url: await getStoryImage(story),
          }))
        );
  
        setFeaturedStory(enhancedTop[0]);
        setSideStories(enhancedTop.slice(1));
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
  
  return (
    <div className="focused-page">
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
          <h2>Politics</h2>
          {politicsNews.slice(0, 5).map(renderStory)}
        </div>

        <div className="section-block health">
          <h2>Health & Science</h2>
          {healthScienceNews.slice(0, 5).map(renderStory)}
        </div>

        <div className="section-block world">
          <h2>World News</h2>
          {worldNews.slice(0, 5).map(renderStory)}
        </div>

        <div className="section-block tech">
          <h2>Business & Tech</h2>
          {businessTechNews.slice(0, 5).map(renderStory)}
        </div>

        <div className="section-block trending">
          <h2>Trending on Reddit</h2>
          {trendingNews.slice(0, 5).map(renderStory)}
        </div>
      </section>
    </div>
  );
}
