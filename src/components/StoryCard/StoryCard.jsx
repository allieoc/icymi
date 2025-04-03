import React from "react";
import "./StoryCard.css";
import decodeHtml from "../../utils/decodeHtml";
import fallbackImage from "../../utils/fallbackImage";

export default function StoryCard({ story, isFeatured = false, isCompact = false, hideImage, onClick }) {
  if (!story) return null;

  const { title, description, link, image_url, sourceLabel } = story;


  const cleanTitle = decodeHtml(title);
  const cleanDescription = decodeHtml(description);

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
    <div className="story-wrapper" onClick={onClick}> 
    <a
      href={link}
      className={`story-card ${isFeatured ? "featured" : ""} ${isCompact ? "compact" : ""}`}
      target="_blank"
      rel="noopener noreferrer"
    >
      {isFeatured && (
    <>
    {image_url && (
      <img src={fallbackImage(story)} alt={cleanTitle} className="featured-image" />
    )}
    <div className="featured-text">
    {cleanTitle && <h3>{cleanTitle}</h3>}
    {cleanDescription && <p>{cleanDescription}</p>}
      <p className="source">{sourceLabel}</p>
    </div>
   </>
)}

      {isCompact && (
        <>
          {!hideImage && story.image_url && (
  <img src={story.image_url} alt={story.title} />
)}
          <div className="compact-text">
          {cleanTitle && <h3>{cleanTitle}</h3>}
          <span className="meta">
            {story.sourceLabel}
            {story.pubDate && ` • ${timeAgo(story.pubDate)}`}
          </span>



          </div>
        </>
      )}

      {!isFeatured && !isCompact && (
        <>
          {!hideImage && story.image_url && (
  <img src={story.image_url} alt={story.title} />
)}
         {cleanTitle && <h3>{cleanTitle}</h3>}
         {cleanDescription && <p>{cleanDescription}</p>}

         {story.pubDate && (
            <>
              {" • "}
              {timeAgo(story.pubDate)}
            </>
          )}

        </>
      )}
    </a>


  </div>
  );
}
