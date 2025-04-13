import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "./AuthContext";

const SavedItemsContext = createContext();
export const useSavedItems = () => useContext(SavedItemsContext);

export const SavedItemsProvider = ({ children }) => {
  const { user } = useAuth();
  const [savedCount, setSavedCount] = useState(0);

  const fetchSavedCount = async () => {
    if (!user) return;
    const { count, error } = await supabase
      .from("saved_items")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id);

    if (!error && typeof count === "number") {
      setSavedCount(count);
    }
  };

  const incrementSavedCount = () => {
    setSavedCount((prev) => prev + 1);
  };

  const decrementSavedCount = () => {
    setSavedCount((prev) => Math.max(prev - 1, 0));
  };

  useEffect(() => {
    fetchSavedCount();
  }, [user]);

  return (
    <SavedItemsContext.Provider
      value={{
        savedCount,
        fetchSavedCount,
        incrementSavedCount,
        decrementSavedCount,
      }}
    >
      {children}
    </SavedItemsContext.Provider>
  );
};
