import { useParams } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { NewsContext } from "../../context/NewsContext";
import KeywordTagInput from "../../components/KeywordTagInput/KeywordTagInput";
import "./CategoryPage.css";

export default function CategoryPage() {
  const { categorySlug } = useParams();
  const { newsState } = useContext(NewsContext);
  const [filterKeywords, setFilterKeywords] = useState([]);
  const [filteredStories, setFilteredStories] = useState([]);
  const [feedUpdated, setFeedUpdated] = useState(false);

  async function fetchCategoryFeed(slug) {
    try {
      const endpoint = `/.netlify/functions/fetch${capitalize(slug)}`;
      const res = await fetch(endpoint);
      const data = await res.json();
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch category:", slug, err);
      return [];
    }
  }
  
  function capitalize(slug) {
    return slug.charAt(0).toUpperCase() + slug.slice(1);
  }

  useEffect(() => {
    const stored = localStorage.getItem("filterKeywords");
    if (stored) {
      const parsed = JSON.parse(stored);
      setFilterKeywords(parsed);
    }
  }, []);

  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

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
  async function loadStories() {
    let stories = newsState[categorySlug] || [];

    // If no stories in context, fetch from Netlify
    if (stories.length === 0) {
      stories = await fetchCategoryFeed(categorySlug);
    }

    const filtered = stories.filter((story) => {
      const content = `${story.title} ${story.description || ""}`.toLowerCase();
      const pubDate = new Date(story.pubDate);
      return pubDate > oneMonthAgo && !filterKeywords.some((keyword) => content.includes(keyword));
    });

    const interleaved = interleaveBySource(filtered);
    setFilteredStories(interleaved);
  }

  if (categorySlug) {
    loadStories();
  }
}, [newsState, categorySlug, filterKeywords]);


  function timeAgo(dateString) {
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now - then) / 1000);

    const dayInSeconds = 86400;

    if (seconds > dayInSeconds) {
      return then.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      });
    }

    const intervals = [
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 },
    ];

    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
      }
    }

    return "just now";
  }

  const handleApplyFilter = async () => {
    await refetchNews(filterKeywords);
    setFeedUpdated(true);
    setTimeout(() => setFeedUpdated(false), 3000);
  };

  return (
    <div className="category-page">
      <div className="category-hero">
        <h2 className="category-title">{categorySlug.replace("-", " ").toUpperCase()}</h2>
      </div>

      <div className="m-auto mt-6 mb-6 w-full max-w-md">
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
            </div>

      <div className="category-content">
        {filteredStories.length === 0 ? (
          <p>No stories available.</p>
        ) : (
          filteredStories.map((story, index) => (
            <div key={story.link + index} className="category-content">
              <a
                href={story.link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <div className="category-story">
                  <p className="headline">{story.title}</p>
                  <div className="story-data">
                    <span className="source">{story.sourceLabel}</span>
                    <span className="time-stamp">
                      {story.pubDate && ` • ${timeAgo(story.pubDate)}`}
                    </span>
                  </div>
                </div>
              </a>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
