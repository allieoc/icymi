import { useParams } from "react-router-dom";
import { useContext } from "react";
import { NewsContext } from "../../context/NewsContext";
import './CategoryPage.css'

export default function CategoryPage() {
  const { categorySlug } = useParams(); // ← Grab from URL
  const { newsState } = useContext(NewsContext);

  const stories = newsState[categorySlug] || [];

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
                    <span className="source">{story.sourceLabel}</span>
                </div>
                
            </a>
          </div>
        ))
      )}
      </div>
    </div>
  );
}
