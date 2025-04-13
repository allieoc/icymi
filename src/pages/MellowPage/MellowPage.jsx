import React, { useEffect, useState } from 'react'
import "./MellowPage.css"
import SaveButton from '../../components/SaveButton/SaveButton';
import { useAuth } from '../../context/AuthContext';
import { logView } from '../../utils/logView';
import SharePopup from '../../components/SharePopup/SharePopup';

function MellowPage() {
    const [mellowNews, setMellowNews] = useState();
    const [loading, setLoading] = useState (true);
    const { user } = useAuth();
    const [shareItem, setShareItem] = useState(null);

    async function fetchGoodGoodGood() {
        try {
          const res = await fetch("/.netlify/functions/goodgoodgood");
          const data = await res.json();
          return data;
        } catch (err) {
          console.error("❌ Failed to fetch Good Good Good feed:", err);
          return [];
        }
      }

      async function fetchGoodNewsNetwork() {
        try {
          const res = await fetch("/.netlify/functions/goodnewsnetwork");
          const data = await res.json();
          return data;
        } catch (err) {
          console.error("❌ Failed to fetch Good News Network feed:", err);
          return [];
        }
      }

      async function fetchPositiveNews() {
        try {
          const res = await fetch("/.netlify/functions/positivenews");
          const data = await res.json();
          return data;
        } catch (err) {
          console.error("❌ Failed to fetch Positive News feed:", err);
          return [];
        }
      }

      async function fetchReasonsToBeCheerful() {
        try {
          const res = await fetch("/.netlify/functions/reasonstobecheerful");
          const data = await res.json();
          return data;
        } catch (err) {
          console.error("❌ Failed to fetch Reasons To Be Cheerful feed:", err);
          return [];
        }
      }


      async function fetchTheOptimistDaily() {
        try {
          const res = await fetch("/.netlify/functions/theoptimistdaily");
          const data = await res.json();
          return data;
        } catch (err) {
          console.error("❌ Failed to fetch The Optimist Daily feed:", err);
          return [];
        }
      }

      async function safeFetch(fetchFn) {
        try {
          const result = await fetchFn();
          return result || [];
        } catch (err) {
          console.error("❌ Safe fetch failed:", err);
          return [];
        }
      }

      function interleaveBySource(stories) {
        const groups = stories.reduce((acc, story) => {
          const source = story.sourceLabel || "unknown";
          if (!acc[source]) acc[source] = [];
          acc[source].push(story);
          return acc;
        }, {});

        const result = [];
        const groupKeys = Object.keys(groups);
      
        let added = true;
        while (added) {
          added = false;
          for (const key of groupKeys) {
            const group = groups[key];
            if (group.length) {
              result.push(group.shift());
              added = true;
            }
          }
        }
      
        return result;
      }
      
// Load all sections
useEffect(() => {
  async function fetchMellowNews() {
    const [goodGoodGood, goodNewsNetwork, positiveNews, reasonsToBeCheerful, theOptimistDaily] =
      await Promise.all([
        safeFetch(fetchGoodGoodGood),
        safeFetch(fetchGoodNewsNetwork),
        safeFetch(fetchPositiveNews),
        safeFetch(fetchReasonsToBeCheerful),
        safeFetch(fetchTheOptimistDaily),
      ]);

    const allMellowNews = interleaveBySource([
      ...goodGoodGood,
      ...goodNewsNetwork,
      ...positiveNews,
      ...reasonsToBeCheerful,
      ...theOptimistDaily,
    ]);

    const sortedMellow = allMellowNews.sort(
      (a, b) => new Date(b.pubDate || b.date || 0) - new Date(a.pubDate || a.date || 0)
    );

    setMellowNews(sortedMellow);
    setLoading(false);
  }

  fetchMellowNews();
}, []);

return (
  <div className="mellow-page">
    <h1 className="text-4xl font-semibold text-white mb-6 text-center">Breathe In, Scroll Out</h1>

    {loading ? (
      <p className="loading">Loading feel-good stories...</p>
    ) : (
      mellowNews.map((story, index) => (
        <div key={`${story.link}-${index}`} className="mellow-story relative">
          <a
            href={story.link}
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
                    source: story.sourceLabel,
                  },
                });
              }
            }}
          >
            <h1>{story.title}</h1>
          </a>

          <SaveButton className="save-btn" story={story} />

          {/* Share Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShareItem(story);
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
      ))
    )}

    {shareItem && (
      <SharePopup
        url={shareItem.link}
        title={shareItem.title}
        onClose={() => setShareItem(null)}
      />
    )}
  </div>
);
}

export default MellowPage;