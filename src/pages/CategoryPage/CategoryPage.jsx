import { useParams } from "react-router-dom";
import { useContext } from "react";
import { NewsContext } from "../../context/NewsContext";
import './CategoryPage.css'

export default function CategoryPage() {
  const { categorySlug } = useParams(); // ← Grab from URL
  const { newsState } = useContext(NewsContext);

  const stories = newsState[categorySlug] || [];

  function timeAgo(dateString) {
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now - then) / 1000);
  
    const dayInSeconds = 86400;
  
    if (seconds > dayInSeconds) {
      return then.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }); // e.g. Mar 25
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

  return (
    <div className="category-page">
        <div className="category-hero">
            <h2 className="category-title">{categorySlug.replace("-", " ").toUpperCase()}</h2>
        </div>
      <div className="category-content">
      {stories.length === 0 ? (
        <p>No stories available.</p>
      ) : (
        stories.map((story, index) => (
          <div className="category-content">
            <a
                key={story.link + index}
                href={story.link}
                target="_blank"
                rel="noopener noreferrer"
               
            >
                <div className="category-story">
                    <p className="headline">{story.title}</p>
                    <div className="story-data">
                    <span className="source">{story.sourceLabel}</span>
                    <span className="time-stamp">{story.pubDate && ` • ${timeAgo(story.pubDate)}`}</span>
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
