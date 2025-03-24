import React from "react";
import "./StoryCard.css";
import decodeHtml from "../../utils/decodeHtml";
import fallbackImage from "../../utils/fallbackImage";


export default function StoryCard({ story, isFeatured = false, isCompact = false }) {
  if (!story) return null;

  const { title, description, link, image_url, sourceLabel } = story;


  const cleanTitle = decodeHtml(title);
  const cleanDescription = decodeHtml(description);

  return (
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
          {image_url && (
            <img src={fallbackImage(story)} alt={cleanTitle} className="thumbnail" />
          )}
          <div className="compact-text">
          {cleanTitle && <h3>{cleanTitle}</h3>}
            <p className="source">{sourceLabel}</p>
          </div>
        </>
      )}

      {!isFeatured && !isCompact && (
        <>
          {image_url && (
            <img src={fallbackImage(story)} alt={cleanTitle} className="standard-image" />
          )}
         {cleanTitle && <h3>{cleanTitle}</h3>}
         {cleanDescription && <p>{cleanDescription}</p>}
          <p className="source">{sourceLabel}</p>
        </>
      )}
    </a>
  );
}
