// components/SaveButton.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useSavedItems } from "../../context/SavedItemsContext";

export default function SaveButton({ story }) {
  const { user } = useAuth();
  const { fetchSavedCount } = useSavedItems();
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);

  if (!story || !story.link) return null;

  useEffect(() => {
    const checkIfSaved = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("saved_items")
        .select("id")
        .eq("user_id", user.id)
        .ilike("url", `%${story.link}%`)
        .maybeSingle();

      if (data?.id) {
        setIsSaved(true);
        fetchSavedCount();
        setSavedId(data.id);
      }
    };

    checkIfSaved();
  }, [user, story.link]);

  const handleToggleSave = async () => {
    if (!user) {
      alert("Please log in to save items");
      return;
    }
  
    const isPodcast = !!story.audioUrl;
  
    if (isSaved) {
      // Unsave
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", user.id)
        .eq("url", story.link || story.url);
  
      if (error) {
        console.error("Error unsaving item:", error);
      } else {
        setIsSaved(false);
      }
    } else {
      // Save
      const { error } = await supabase.from("saved_items").insert([
        {
          user_id: user.id,
          title: story.title,
          url: story.link || story.url,
          source: story.sourceLabel || story.source,
          image_url: story.image_url || null,
          audio_url: story.audioUrl || null,
          published_at: story.publishedAt || story.pubDate || null,
          item_type: isPodcast ? "podcast" : "article", // ✅ now safe to reference
        },
      ]);
  
      if (error) {
        console.error("Error saving item:", error);
      } else {
        setIsSaved(true);
      }
    }
  };

  return (
    <button
    onClick={handleToggleSave}
    className={`text-sm p-1 ${
      isSaved
        ? "text-indigo-600 bg-indigo-200 hover:bg-indigo-200 "
        : "text-indigo-900 bg-indigo-200 hover:bg-indigo-200"
    }`}
  >
    {isSaved ? "Saved" : "Save for later"}
  </button>
  );
}
