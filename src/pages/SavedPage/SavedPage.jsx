import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import "./SavedPage.css";

export default function SavedPage() {
  const { user } = useAuth();
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    const fetchSavedItems = async () => {
      const { data, error } = await supabase
        .from("saved_items")
        .select("*")
        .eq("user_id", user.id);

      if (error) console.error("Error fetching saved items:", error);
      else setSavedItems(data);
    };

    if (user) fetchSavedItems();
  }, [user]);

  return (
    <div className="saved-page">
      <h1>Your Saved Items</h1>
      {savedItems.length === 0 ? (
        <p>You haven’t saved anything yet!</p>
      ) : (
        <ul>
          {savedItems.map((item) => (
            <li key={item.id}>
              <a href={item.url} target="_blank" rel="noreferrer">
                {item.title}
              </a>
              <p className="source">{item.source}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
