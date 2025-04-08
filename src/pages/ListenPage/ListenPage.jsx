import React, { useEffect, useState } from "react";
import "./ListenPage.css";
import { useRef } from "react";
import { usePlayer } from "../../context/PlayerContext";
import {formatTime} from "../../utils/formatTime";
import SaveButton from "../../components/SaveButton/SaveButton";
import { logView } from "../../utils/logView";
import { useAuth } from "../../context/AuthContext";
import SharePopup from "../../components/SharePopup/SharePopup";



export default function ListenPage() {
  const [podcastStories, setPodcastStories] = useState([]);
  const [videoStories, setVideoStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef(null);
  const { expandPlayer, duration, currentTime, playTrack, track, isPlaying, handleScrub } = usePlayer();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [shareItem, setShareItem] = useState(null);


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
      const [theDaily, upFirst, pivot, todayExplained, podSaveAmerica, rachelMaddow, morningBrewDaily, whatNext, theDiaryOfACEO, assemblyRequired] = await Promise.all([
        fetchFeed("thedaily"),
        fetchFeed("upfirst"),
        fetchFeed("pivot"),
        fetchFeed("todayexplained"),
        fetchFeed("podsaveamerica"),
        fetchFeed("therachelmaddowshow"),
        fetchFeed("morningbrewdaily"),
        fetchFeed("whatnext"),
        fetchFeed("thediaryofaceo"),
        fetchFeed("assemblyrequired")
      ]);
      const podcasts = [
        ...theDaily, 
        ...upFirst, 
        ...pivot, 
        ...todayExplained, 
        ...podSaveAmerica, 
        ...rachelMaddow, 
        ...morningBrewDaily, 
        ...whatNext,
        ...theDiaryOfACEO,
        ...assemblyRequired
      ];
      const sorted = podcasts.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      const finalPodcasts = sorted.splice(1, 30);
      setPodcastStories(finalPodcasts);
      setSearchTerm(""); // Clear search on fresh load
      


      const videos = await fetchVideos();
      setVideoStories(videos);


      setLoading(false);
    }

    loadContent();
  }, []);

  const filteredPodcasts = podcastStories.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.sourceLabel?.toLowerCase().includes(searchTerm.toLowerCase())
  );


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
                <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShareItem({ type: "video", item: video }); 
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

                </div>
              ))}
            </div>
            
            <button className="scroll-btn right" onClick={() => scrollCarousel('right')}>
              ▶
            </button>
          </div>

          <div className="search-bar-wrapper">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search for your favorite podcast..."
              className="podcast-search-input"
            />
          </div>


        {/* Podcast grid */}
        <div className="podcast-grid">
        {filteredPodcasts.map((podcast, i) => (
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
          <button
        onClick={(e) => {
          e.stopPropagation();
          setShareItem({ type: "podcast", item: podcast });
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
      

        {podcast.image_url && (
          <img src={podcast.image_url} alt={podcast.title} />
        )}

        <h2>{podcast.title}</h2>

        {podcast.sourceLabel && (
          <p className="source-label">{podcast.sourceLabel}</p>
        )}

        <span className="pub-date">{new Date(podcast.pubDate).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}</span>
        
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
    {shareItem && (
  <SharePopup
    url={shareItem.item.link}
    title={shareItem.item.title}
    onClose={() => setShareItem(null)}
  />
)}
  </div>
); 
} 