import { useState, useEffect } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";


export default function SharePopup({ url, title, onClose }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [friends, setFriends] = useState([]);
  const [selectedFriendId, setSelectedFriendId] = useState("");
  const [showShare, setShowShare] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("❌ Failed to copy:", err);
    }
  };

  const navigate = useNavigate();

const handleSend = async () => {
  if (!selectedFriendId || !url || !title) return;

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id: selectedFriendId,
    content: `${title} — ${url}`,
  });

  if (error) {
    console.error("❌ Failed to send message:", error);
  } else {
    onClose(); // Close popup
    navigate(`/messages/${selectedFriendId}`);
  }
};

  useEffect(() => {
    const fetchFriends = async () => {
      if (!user) return;

      const { data: friendRows, error } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user.id)
        .eq("status", "accepted");

      if (error) {
        console.error("❌ Error fetching friends:", error);
        return;
      }

      const ids = friendRows.map((f) => f.friend_id);
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username")
        .in("id", ids);

      if (profilesError) {
        console.error("❌ Error fetching friend profiles:", profilesError);
      } else {
        setFriends(profiles);
      }
    };

    fetchFriends();
  }, [user]);

  return (
    <div className="absolute top-10 right-4 bg-white border p-4 rounded shadow z-50 w-64 text-sm text-indigo-900">
      <p className="font-semibold mb-2">Share</p>

      <div className="mb-3">
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
        }}
          className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-700 text-xs"
        >
          📋 {copied ? "Copied!" : "Copy Link"}
        </button>
      </div>

      <div className="mb-2">
        <label htmlFor="friendSelect" className="block mb-1 text-xs">Send to friend</label>
        <select
          id="friendSelect"
          value={selectedFriendId}
          onChange={(e) => {
            setSelectedFriendId(e.target.value);
            e.stopPropagation();
            }}
          className="w-full text-xs px-2 py-1 border rounded"
        >
          <option value="">Select a friend</option>
          {friends.map((f) => (
            <option key={f.id} value={f.id}>
              {f.username}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={(e) => {
            e.stopPropagation();
            handleSend();
        }}
        disabled={!selectedFriendId}
        className="bg-indigo-600 text-white text-xs px-3 py-1 rounded hover:bg-indigo-800 disabled:opacity-50"
      >
        ✉️ Send
      </button>

      <button
        onClick={(e) => {
            e.stopPropagation();
            onClose();
        }}
        className="block text-xs text-zinc-500 mt-3 hover:underline"
      >
        Close
      </button>
    </div>
  );
}
