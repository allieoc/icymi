import React, { useEffect, useState } from 'react'
import "./MellowPage.css"
import SaveButton from '../../components/SaveButton/SaveButton';

function MellowPage() {
    const [mellowNews, setMellowNews] = useState();
    const [loading, setLoading] = useState (true);

    async function fetchGoodGoodGood() {
        try {
          const res = await fetch("/.netlify/functions/goodgoodgood");
          const data = await res.json();
          console.log("Good Good Good fetch:", data);
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
          console.log("Good News Network fetch:", data);
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
          console.log("Positive News fetch:", data);
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
          console.log("Reasons To Be Cheerful fetch:", data);
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
          console.log("The Optimist Daily fetch:", data);
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
    setLoading(true);
    async function fetchMellowNews() {
        const [
            goodGoodGood,
            goodNewsNetwork,
            positiveNews,
            reasonsToBeCheerful,
            theOptimistDaily,
        ] =
        await Promise.all([
            safeFetch(fetchGoodGoodGood),
            safeFetch(fetchGoodNewsNetwork),
            safeFetch(fetchPositiveNews),
            safeFetch(fetchReasonsToBeCheerful),
            safeFetch(fetchTheOptimistDaily),
        ])

        const allMellowNews = interleaveBySource([
            ...goodGoodGood,
            ...goodNewsNetwork,
            ...positiveNews,
            ...reasonsToBeCheerful,
            ...theOptimistDaily,
        ])

        const sortedMellow = allMellowNews.sort((a, b) =>
            new Date(b.pubDate || b.date || 0) - new Date(a.pubDate || a.date || 0))

        setMellowNews(sortedMellow);
        console.log("Sources used:", allMellowNews.map(s => s.sourceLabel));


    }

   setLoading(false);
   fetchMellowNews();



    }, [])



  return (
    <div className="mellow-page">
    <h1 className="text-4xl font-semibold text-white mb-6 text-center">Breathe In, Scroll Out</h1>

       {mellowNews && mellowNews.length > 0 ? (
        mellowNews.map((story, index) => (
            <div className="mellow-story">
    <a
      key={`${story.link}-${index}`}
      href={story.link}
      target="_blank"
      rel="noopener noreferrer"
    >
      <h1>{story.title}</h1>
      
    </a>
    <SaveButton className="save-btn" story={story} />
    </div>
  ))
) : (
  <p className="loading">Loading feel-good stories...</p>
)}

  </div>
  )
}

export default MellowPage