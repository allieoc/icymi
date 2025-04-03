import React, { useEffect, useState } from "react";
import "./ListenPage.css";
import { useRef } from "react";
import { usePlayer } from "../../context/PlayerContext";
import {formatTime} from "../../utils/formatTime";
import SaveButton from "../../components/SaveButton/SaveButton";
import { logView } from "../../utils/logView";
import { useAuth } from "../../context/AuthContext";


export default function ListenPage() {
  const [podcastStories, setPodcastStories] = useState([]);
  const [videoStories, setVideoStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const { expandPlayer, duration, currentTime, playTrack, track, isPlaying, handleScrub } = usePlayer();
  const { user } = useAuth();


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
      return data;
    } catch (err) {
      console.error("❌ Failed to fetch videos", err);
      return [];
    }
  }

  useEffect(() => {
    setLoading(true);
    async function loadContent() {
      const [npr, theDaily, upFirst, pivot, todayExplained] = await Promise.all([
        fetchFeed("nprnewsnow"),
        fetchFeed("thedaily"),
        fetchFeed("upfirst"),
        fetchFeed("pivot"),
        fetchFeed("todayexplained")
      ]);

      const podcasts = [...npr, ...theDaily, ...upFirst, ...pivot, ...todayExplained];
      const sorted = podcasts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      setPodcastStories(sorted);

      const videos = await fetchVideos();
      setVideoStories(videos);


      setLoading(false);
    }

    loadContent();
  }, []);


  return (
    <div className="tunedin-page">
      <h1>Press Play 🎧</h1>

      {loading ? (
        <p className="loading-text">Headphones in, volume up...</p>
      ) : (
        <>
          {/* Video carousel */}
            <div className="video-carousel-wrapper">
            <button className="scroll-btn left" onClick={() => scrollCarousel('left')}>
              ◀
            </button>
            
            <div className="video-carousel" ref={carouselRef}>

              {videoStories.map((video, i) => (
                <div key={video.id} className="video-card">
                <a
                  key={video.id}
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                          if (user?.id && story?.link) {
                            logView({
                              userId: user.id,
                              content: {
                                id: story.link,
                                content_type: "article",
                                title: story.title,
                                url: story.link,
                               // image_url: story.image_url,
                                source: story.sourceLabel,
                              },
                            });
                          } else {
                            console.warn("⛔ Missing user or story data", { user, story });
                          }
                        }}
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


                </div>
              ))}
            </div>
            
            <button className="scroll-btn right" onClick={() => scrollCarousel('right')}>
              ▶
            </button>
          </div>

        {/* Podcast grid */}
        <div className="podcast-grid">
          {podcastStories.map((podcast, i) => (
          <div
            className="podcast-card cursor-pointer"
            key={`${podcast.link}-${i}`}
            onClick={() => {
            playTrack({
            title: podcast.title,
            channel: podcast.sourceLabel,
            audioUrl: podcast.audioUrl,
            })
            expandPlayer(); // Show full player
            if (user?.id && podcast?.link) {
              logView({
                userId: user.id,
                content: {
                  id: podcast.link,
                  content_type: "podcast",
                  title: podcast.title,
                  url: podcast.link,
                  image_url: podcast.image_url,
                  source: podcast.sourceLabel,
                },
              });
            } else {
              console.warn("⛔ Missing user or story data", { user, story });
            }
                  
           
        }}
        >
        {podcast.image_url && (
          <img src={podcast.image_url} alt={podcast.title} />
        )}

        <h2>{podcast.title}</h2>

        {podcast.sourceLabel && (
          <p className="source-label">{podcast.sourceLabel}</p>

          
        )}

      {/* SaveButton: stopPropagation so it doesn't trigger the play */}
      <div className="mt-5"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <SaveButton story={podcast} />
      </div>
    </div>
  ))}
</div> 
      </>
    )}
  </div>
); 
} 