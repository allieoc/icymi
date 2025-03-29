import React, { useEffect, useState } from "react";
import "./ListenPage.css";
import { useRef } from "react";
import { usePlayer } from "../../context/PlayerContext";
import {formatTime} from "../../utils/formatTime";

export default function ListenPage() {
  const [podcastStories, setPodcastStories] = useState([]);
  const [videoStories, setVideoStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const { duration, currentTime, playTrack, track, isPlaying, handleScrub } = usePlayer();


  function scrollCarousel(direction) {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    carouselRef.current.scrollBy({
      left: direction === "right" ? scrollAmount : -scrollAmount,
      behavior: "smooth"
    });
  }

  async function fetchFeed(endpoint) {
    try {
      const res = await fetch(`/.netlify/functions/podcast?feed=${endpoint}`);
      const data = await res.json();

      if (!Array.isArray(data)) {
        console.warn(`⚠️ ${endpoint} returned non-array:`, data);
        return [];
      }

      return data;
    } catch (err) {
      console.error(`❌ Failed to fetch ${endpoint}`, err);
      return [];
    }
  }

  async function fetchVideos() {
    try {
      const res = await fetch("/.netlify/functions/videos");
      const data = await res.json();
      console.log("Video Data Fetched:", data);
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch videos", err);
      return [];
    }
  }

  useEffect(() => {
    setLoading(true);
    async function loadContent() {
      const [npr, theDaily, upFirst, morningBrewDaily, pivot, todayExplained] = await Promise.all([
        fetchFeed("nprnewsnow"),
        fetchFeed("thedaily"),
        fetchFeed("upfirst"),
        fetchFeed("morningbrewdaily"),
        fetchFeed("pivot"),
        fetchFeed("todayexplained")
      ]);

      const podcasts = [...npr, ...theDaily, ...upFirst, ...morningBrewDaily, ...pivot, ...todayExplained];
      const sorted = podcasts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setPodcastStories(sorted);

      const videos = await fetchVideos();
      setVideoStories(videos);
      console.log("🎬 Videos loaded:", videos);


      setLoading(false);
    }

    loadContent();
  }, []);

  return (
    <div className="tunedin-page">
      <h1>Press Play 🎧</h1>

      {loading ? (
        <p className="loading-text">Loading audio stories...</p>
      ) : (
        <>
          {/* Video carousel */}
            <div className="video-carousel-wrapper">
            <button className="scroll-btn left" onClick={() => scrollCarousel('left')}>
              ◀
            </button>
            
            <div className="video-carousel" ref={carouselRef}>

              {videoStories.map((video, i) => (
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="video-card"
                >
                  <img src={video.thumbnail} alt={video.title} className="video-thumbnail" />
                  <p className="video-title">{video.title}</p>
                  <div className="video-meta">
                    <span className="video-channel">{video.channel}</span>
                    <span className="video-date">{new Date(video.publishedAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
                  </div>

                </a>
              ))}
            </div>
            
            <button className="scroll-btn right" onClick={() => scrollCarousel('right')}>
              ▶
            </button>
          </div>

          {/* Podcast grid */}
          <div className="podcast-grid">
            {podcastStories.map((story, i) => (
              <div
              key={`${story.link}-${i}`}
              className="podcast-card cursor-pointer"
              onClick={() =>
                playTrack({
                  title: story.title,
                  channel: story.sourceLabel,
                  audioUrl: story.audioUrl,
                })
              }
            >
              {story.image_url && <img src={story.image_url} alt={story.title} />}
              <h2>{story.title}</h2>
              {story.sourceLabel && <p className="source-label">{story.sourceLabel}</p>}
  
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevents the parent div click from firing again
                  playTrack({
                    title: story.title,
                    channel: story.sourceLabel,
                    audioUrl: story.audioUrl,
                  });
                }}
              >
                ▶️ Listen
              </button>
            </div>
            
            ))}
          </div>
        </>
      )}
    </div>
  );
}