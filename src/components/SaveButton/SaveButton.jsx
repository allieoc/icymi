// components/SaveButton.jsx
import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import "./SaveButton.css"
import { useAuth } from "../../context/AuthContext";

export default function SaveButton({ story }) {
    const { user } = useAuth();
    const [isSaved, setIsSaved] = useState(false);
  
    if (!story || !story.link) return null; // 🛡 prevent undefined error


  
    useEffect(() => {
      const checkIfSaved = async () => {
        if (!user) return;
        const { data, error } = await supabase
          .from("saved_items")
          .select("id")
          .eq("user_id", user.id)
          .eq("url", story.link)
          .maybeSingle();
  
        if (data) setIsSaved(true);
        else (error);
      };
  
      checkIfSaved();
    }, [user, story.link]);
  
    const handleSave = async () => {
      if (!user) {
        alert("Please log in to save items");
        return;
      }
  
      const { error } = await supabase.from("saved_items").insert([
        {
          user_id: user.id,
          title: story.title,
          url: story.link,
          source: story.sourceLabel,
          image_url: story.image_url || null,
          published_at: story.publishedAt || null,
        },
      ]);
  
      if (error) {
        console.error("Error saving item:", error);
      } else {
        setIsSaved(true);
      }
    };
  
    return (
      <button
        onClick={handleSave}
        disabled={isSaved}
        className="save-btn"
      >
        {isSaved ? "Saved" : "Save for later"}
      </button>
    );
  }