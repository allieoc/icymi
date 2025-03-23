import React from "react";
import "./StoryCard.css";

export default function StoryCard({ story, isFeatured = false }) {
  return (
    <div className={`story-card ${isFeatured ? "featured" : "standard"}`}>
      {story.image_url && (
        <img src={story.image_url} alt={story.title} />
      )}
      <div>
        <h3>{story.title}</h3>
        {isFeatured && <p>{story.description}</p>}
        <div className="meta-info">
      {story.sourceLabel && <span className="source-badge">{story.sourceLabel}</span>}
      {story.pubDate && (
        <span className="timestamp">
          {new Date(story.pubDate).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric"
          })}
        </span>
      )}
    </div>
        <a href={story.link} target="_blank" rel="noopener noreferrer">
          
          Read more →
        </a>

      </div>
    </div>
  );
}


