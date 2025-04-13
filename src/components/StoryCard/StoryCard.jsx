import React, { useState } from "react";
import "./StoryCard.css";
import decodeHtml from "../../utils/decodeHtml";
import fallbackImage from "../../utils/fallbackImage";
import SharePopup from "../SharePopup/SharePopup";

export default function StoryCard({
  story,
  isFeatured = false,
  isCompact = false,
  hideImage,
  onClick
}) {
  const [showShare, setShowShare] = useState(false);

  if (!story) return null;

  const { title, description, link, image_url, sourceLabel, pubDate } = story;
  const cleanTitle = decodeHtml(title);
  const cleanDescription = decodeHtml(description);

  function timeAgo(dateString) {
    const now = new Date();
    const then = new Date(dateString);
    const seconds = Math.floor((now - then) / 1000);
    if (seconds > 86400) {
      return then.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    }
    const intervals = [
      { label: "hour", seconds: 3600 },
      { label: "minute", seconds: 60 }
    ];
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) return `${count} ${interval.label}${count > 1 ? "s" : ""} ago`;
    }
    return "just now";
  }

  return (
    <div className="story-wrapper relative" onClick={onClick}>
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
            {!hideImage && image_url && <img src={image_url} alt={title} />}
            <div className="compact-text">
              {cleanTitle && <h3>{cleanTitle}</h3>}
              <span className="meta">
                {sourceLabel}
                {pubDate && ` • ${timeAgo(pubDate)}`}
              </span>
            </div>
          </>
        )}

        {!isFeatured && !isCompact && (
          <>
            {!hideImage && image_url && <img src={image_url} alt={title} />}
            {cleanTitle && <h3>{cleanTitle}</h3>}
            {cleanDescription && <p>{cleanDescription}</p>}
            {pubDate && <p className="meta">• {timeAgo(pubDate)}</p>}
          </>
        )}
      </a>

      {/* Share Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setShowShare(true);
        }}
        className="absolute bottom-2 right-2 text-indigo-300 hover:bg-indigo-300 hover:text-white"
        title="Share"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-share"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>

      {/* Share Popup */}
      {showShare && (
        <SharePopup
          url={link}
          title={title}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  );
}
