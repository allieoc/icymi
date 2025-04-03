// components/AddFriendButton.jsx
import { useState, useEffect } from "react";
import { supabase } from "../utils/supabaseClient";
import { useAuth } from "../context/AuthContext";

export default function AddFriendButton({ targetUserId }) {
  const { user } = useAuth();
  const [isFriend, setIsFriend] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkIfFriend = async () => {
      if (!user || !targetUserId) return;

      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .eq("user_id", user.id)
        .eq("friend_id", targetUserId)
        .maybeSingle();

      if (data) setIsFriend(true);
    };

    checkIfFriend();
  }, [user, targetUserId]);

  const handleAddFriend = async () => {
    if (!user || !targetUserId) return;
    setLoading(true);

    const { error } = await supabase
      .from("friends")
      .insert([{ user_id: user.id, friend_id: targetUserId }]);

    if (error) {
      console.error("❌ Error adding friend:", error);
    } else {
      setIsFriend(true);
    }
    setLoading(false);
  };

  if (isFriend) {
    return <button className="text-xs bg-green-200 text-green-900 px-2 py-1 rounded-full" disabled>✓ Friend</button>;
  }

  return (
    <button
      onClick={handleAddFriend}
      disabled={loading}
      className="text-xs bg-indigo-500 text-white px-2 py-1 rounded-full hover:bg-indigo-600 transition"
    >
      {loading ? "Adding..." : "Add Friend"}
    </button>
  );
}
