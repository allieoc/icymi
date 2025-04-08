import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { Link } from "react-router-dom";

export default function MessagesInbox() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendRequests, setFriendRequests] = useState([]);

useEffect(() => {
  const fetchFriendRequests = async () => {
    const { data, error } = await supabase
      .from("friends")
      .select("*, sender: user_id (id, username, avatar_url)")
      .eq("friend_id", user.id)
      .eq("status", "pending");

    if (error) {
      console.error("❌ Error fetching friend requests:", error);
    } else {
      setFriendRequests(data);
    }
  };

  if (user) {
    fetchFriendRequests();
  }
}, [user]);

  useEffect(() => {
    if (!user) return;
  
    const fetchMessages = async () => {
      setLoading(true);
  
      const { data, error } = await supabase
        .from("messages")
        .select('*, sender:sender_id(*), recipient:recipient_id(*)')
        .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`) // get all related messages
        .order("sent_at", { ascending: false });
  
      if (error) {
        console.error("❌ Error fetching messages:", error);
      } else {
        const threads = {};

        for (const msg of data) {
            const otherUser = msg.sender_id === user.id ? msg.recipient : msg.sender;
            const otherUserId = otherUser?.id;
          
            if (
              !threads[otherUserId] ||
              new Date(msg.sent_at) > new Date(threads[otherUserId].sent_at)
            ) {
              threads[otherUserId] = {
                ...msg,
                threadWith: otherUser,
              };
            }
          }
  
        setMessages(Object.values(threads));
      }
  
      setLoading(false);
    };
  
    fetchMessages();
  }, [user]);

  const handleAccept = async (requestId, senderId) => {
    const { error: updateError } = await supabase
      .from("friends")
      .update({ status: "accepted" })
      .eq("id", requestId);
  
    if (updateError) {
      console.error("❌ Error accepting request:", updateError);
      return;
    }
  
    // Insert the reciprocal friend row
    const { error: insertError } = await supabase
      .from("friends")
      .upsert([
        {
          user_id: user.id,       // the current user
          friend_id: senderId,    // the one who sent the request
          status: "accepted"
        }
      ], { onConflict: ['user_id', 'friend_id'] }); // avoid duplicates
  
    if (insertError) {
      console.error("❌ Error inserting reciprocal friend row:", insertError);
      return;
    }
  
    // Remove from friendRequests list
    setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
  };
  
  
  const handleDecline = async (requestId) => {
    const { error } = await supabase
      .from("friends")
      .delete()
      .eq("id", requestId);
  
    if (!error) {
      setFriendRequests((prev) => prev.filter((req) => req.id !== requestId));
    }
  };

  if (!user) return <p className="p-6">Please log in to view your messages.</p>;

  return (
    <div className="p-6 max-w-2xl mx-auto text-indigo-950 min-h-screen overflow-x-hidden break-words">
      <h1 className="text-2xl font-bold mb-4">📨 Messages</h1>
      {loading ? (
        <p>Loading messages...</p>
      ) : messages.length === 0 ? (
        <p className="text-zinc-500">You don't have any messages yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {messages.map((msg) => (
            <Link
                to={`/messages/${msg.threadWith.id}`}
                key={msg.id}
                className="flex items-start gap-4 bg-white p-4 rounded-md shadow hover:bg-zinc-100 transition"
            >
                {msg.threadWith.avatar_url ? (
                <img
                    src={msg.threadWith.avatar_url}
                    alt={msg.threadWith.username}
                    className="w-12 h-12 rounded-full object-cover"
                />
                ) : (
                <div className="w-12 h-12 rounded-full bg-indigo-300 flex items-center justify-center text-white font-bold text-lg overflow-x-hidden break-words">
                    {msg.threadWith.username?.[0]?.toUpperCase() || "?"}
                </div>
                )}
                <div className="flex flex-col gap-4 overflow-x-hidden break-words">
                <p className="font-semibold">{msg.threadWith.username || "Unknown User"}</p>
                <p className="text-sm text-zinc-600 break-words overflow-hidden">{msg.content}</p>
                <p className="text-xs text-zinc-400 mt-1">
                    {new Date(msg.sent_at).toLocaleString()}
                </p>
                </div>
            </Link>
            ))}
        </div>
      )}
        {friendRequests.length > 0 && (
        <div className="mt-6">
            <h2 className="text-xl font-bold mb-2">👥 Friend Requests</h2>
            <div className="flex flex-col gap-4">
            {friendRequests.map((req) => (
                <div
                key={req.id}
                className="flex items-center gap-4 bg-white p-4 rounded-md shadow"
                >
                {req.sender.avatar_url ? (
                    <img
                    src={req.sender.avatar_url}
                    alt={req.sender.username}
                    className="w-10 h-10 rounded-full object-cover"
                    />
                ) : (
                    <div className="w-10 h-10 rounded-full bg-indigo-300 flex items-center justify-center text-white font-bold text-lg">
                    {req.sender.username?.[0]?.toUpperCase() || "?"}
                    </div>
                )}

                <div className="flex-1">
                    <p className="font-semibold">{req.sender.username}</p>
                    <p className="text-sm text-zinc-600">wants to be friends</p>
                </div>

                <div className="flex gap-2">
                    <button 
                    onClick={() => handleAccept(req.id, req.user_id)}
                    className="text-sm px-3 py-1 rounded-full bg-green-500 text-white"
                    >
                    Accept
                    </button>
                    <button
                    onClick={() => handleDecline(req.id)}
                    className="text-sm px-3 py-1 rounded-full bg-red-500 text-white"
                    >
                    Decline
                    </button>
                </div>
                </div>
            ))}
            </div>
        </div>
        )}
    </div>
  );
}
