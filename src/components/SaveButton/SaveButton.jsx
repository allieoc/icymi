// components/SaveButton.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useSavedItems } from "../../context/SavedItemsContext";

export default function SaveButton({ story }) {
  const { user } = useAuth();
  const { fetchSavedCount, incrementSavedCount, decrementSavedCount } = useSavedItems();
  const [isSaved, setIsSaved] = useState(false);
  const [savedId, setSavedId] = useState(null);
  const [saveCount, setSaveCount] = useState(0);

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

  useEffect(() => {
    const fetchCount = async () => {
      const { count } = await supabase
        .from("saved_items")
        .select("*", { count: "exact", head: true })
        .eq("url", story.link || story.url);
  
      if (typeof count === "number") {
        setSaveCount(count);
      }
    };
  
    if (story.link || story.url) {
      fetchCount();
    }
  }, [story.link, story.url]);

  const handleToggleSave = async () => {
    if (!user) {
      alert("Please log in to save items");
      return;
    }
  
    const isPodcast = !!story.audioUrl;
  
    if (isSaved) {
      setIsSaved(false);
      decrementSavedCount();
  
      const { error } = await supabase
        .from("saved_items")
        .delete()
        .eq("user_id", user.id)
        .eq("url", story.link || story.url);
  
      if (error) {
        console.error("Error unsaving item:", error);
        setIsSaved(true); // roll back if it fails
      }
    } else {
      // Optimistically save
      setIsSaved(true);
      incrementSavedCount();
   
  
      const { error } = await supabase.from("saved_items").insert([
        {
          user_id: user.id,
          title: story.title,
          url: story.link || story.url,
          source: story.sourceLabel || story.source,
          image_url: story.image_url || null,
          audio_url: story.audioUrl || null,
          saved_at: new Date().toISOString(),
          item_type: isPodcast ? "podcast" : "article",
        },
      ]);
  
      if (error) {
        console.error("Error saving item:", error);
        setIsSaved(false); // roll back if it fails
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
