import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { Link } from "react-router-dom";

export default function MessagesInbox() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchMessages = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("messages")
        .select("*, sender:profiles(id, username, avatar_url)")
        .eq("recipient_id", user.id)
        .order("sent_at", { ascending: false });

      if (error) {
        console.error("❌ Error fetching messages:", error);
      } else {
        setMessages(data);
      }

      setLoading(false);
    };

    fetchMessages();
  }, [user]);

  if (!user) return <p className="p-6">Please log in to view your messages.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto text-indigo-950 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">📨 Messages</h1>
      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-zinc-500">You don't have any messages yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <Link
              to={`/messages/${msg.sender.id}`}
              key={msg.id}
              className="flex items-start gap-4 bg-white p-4 rounded-md shadow hover:bg-zinc-100 transition"
            >
              {msg.sender.avatar_url ? (
                <img
                  src={msg.sender.avatar_url}
                  alt={msg.sender.username}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-300 flex items-center justify-center text-white font-bold text-lg">
                  {msg.sender.username?.[0]?.toUpperCase() || "?"}
                </div>
              )}
              <div className="flex-1">
                <p className="font-semibold">{msg.sender.username || "Unknown User"}</p>
                <p className="text-sm text-zinc-600 truncate">{msg.message}</p>
                <p className="text-xs text-zinc-400 mt-1">
                  {new Date(msg.sent_at).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
