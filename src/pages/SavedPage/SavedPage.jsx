// pages/SavedPage.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Link } from "react-router-dom";
import { useAuth } from '../../context/AuthContext';
import { useSavedItems } from "../../context/SavedItemsContext";
import PodcastCard from "../../components/PodcastCard/PodcastCard";
import { usePlayer } from "../../context/PlayerContext";

export default function SavedPage() {
    const { user } = useAuth();
    const { playTrack, expandPlayer } = usePlayer();
    const [savedArticles, setSavedArticles] = useState([]);
    const [savedPodcasts, setSavedPodcasts] = useState([]); 
    const [savedItems, setSavedItems] = useState([]);
    
  
    useEffect(() => {
        const fetchSavedItems = async () => {
          if (!user) return;
          const { data, error } = await supabase
            .from("saved_items")
            .select("*")
            .eq("user_id", user.id)
            .order("published_at", { ascending: false });
        setSavedItems(data);
          if (error) {
            console.error("Error fetching saved items:", error);
          } else {
            const articles = data.filter(item => item.type === "article" || !item.audio_url);
            const podcasts = data.filter(item => item.type === "podcast" || item.audio_url);
            setSavedArticles(articles);
            setSavedPodcasts(podcasts);
          }
        };
      
        fetchSavedItems();
      }, [user]);
  
    const handleUnsave = async (url) => {
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", user.id)
        .eq("url", url);
  
      if (!error) {
        setSavedArticles((prev) => prev.filter((item) => item.url !== url));
        setSavedPodcasts((prev) => prev.filter((item) => item.url !== url));
      } else {
        console.error("Error unsaving:", error);
 
      }
    };
 
    if (!user) {
      return <div className="p-8 text-center text-white">Please log in to view your saved items.</div>;
    }

  return (
    <div className="p-8 text-white min-h-screen">
        <div className="mb-5">
            <Link to="/focused" className="text-indigo-400 underline mr-3">
            Back to Focus
            </Link>
            <Link to="/mellow" className="text-indigo-400 underline mr-3">
            Back to Mellow
            </Link>
            <Link to="/ready-to-listen" className="text-indigo-400 underline">
            Back to Listening
            </Link>
        </div>
        
      <h1 className="text-indigo-950 text-center text-2xl font-bold mb-6">Saved For Later</h1>

      {/* Podcasts */}
        {savedPodcasts.length > 0 && (
            <>
            <h2 className="text-xl font-semibold mb-4">Podcasts</h2>
            <div className="podcast-grid mb-8">
                {savedPodcasts.map((podcast, i) => (
                <PodcastCard key={podcast.id} podcast={podcast} showRemove />          
                ))}
            </div>
            </>
        )}

       {/* Articles */}
  {savedArticles.length > 0 && (
    <>
      <h2 className="text-xl font-semibold mb-4">Articles</h2>
      <div className="grid gap-6">
        {savedArticles.map((item) => (
          <div key={item.id} className="bg-indigo-950 p-4 rounded-md shadow-md relative">
            <button
              className="absolute top-2 right-2 text-zinc-200 hover:text-zinc-300"
              onClick={async () => {
                await supabase.from("saved_items").delete().eq("id", item.id);
                setSavedArticles((prev) => prev.filter((x) => x.id !== item.id));
              }}
            >
              ✕
            </button>
            <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-lg font-semibold hover:underline">
              {item.title}
            </a>
            <p className="text-sm text-zinc-400 mt-1">{item.source}</p>
          </div>
        ))}
      </div>
    </>
  )}

    {savedArticles.length === 0 && savedPodcasts.length === 0 && (
        <p className="text-indigo-950 text-center">You haven't saved anything yet.</p>
    )}
    </div>
  );
}
