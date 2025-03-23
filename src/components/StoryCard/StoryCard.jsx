import React from "react";

export default function StoryCard({ story, isFeatured = false }) {
  return (
    <div className={`story-card ${isFeatured ? "featured" : "standard"}`}>
      {story.image_url && (
        <img src={story.image_url} alt={story.title} />
      )}
      <div>
        <h3>{story.title}</h3>
        {isFeatured && <p>{story.description}</p>}
        <a href={story.link} target="_blank" rel="noopener noreferrer">
          Read more →
        </a>
      </div>
    </div>
  );
}


