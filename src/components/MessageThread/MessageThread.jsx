import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabaseClient";

export default function MessageThread() {
  const { user } = useAuth();
  const { userId: recipientId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [recipient, setRecipient] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef();

  useEffect(() => {
    if (!user || !recipientId) return;

    const fetchThread = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .order("sent_at", { ascending: true });

      if (error) {
        console.error("❌ Error fetching messages:", error);
      } else {
        setMessages(data);
        scrollToBottom();
      }
    };

    fetchThread();
  }, [user, recipientId]);

  useEffect(() => {
    const markAsRead = async () => {
        const now = new Date().toISOString();
      
        const { error } = await supabase
          .from("messages")
          .update({ read: true, read_at: now })
          .eq("recipient_id", user.id)
          .eq("sender_id", recipientId)
          .is("read", false); // only update unread messages
      
        if (error) {
          console.error("❌ Failed to mark messages as read:", error);
        }
      };
  }, [user?.id, recipientId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    const { data, error } = await supabase
      .from("messages")
      .insert({
        sender_id: user.id,
        recipient_id: recipientId,
        content: newMessage.trim(),
      })
      .select();

    if (!error && data?.length > 0) {
      setMessages((prev) => [...prev, data[0]]);
      setNewMessage("");
      scrollToBottom();
    } else {
      console.error("❌ Error sending message:", error);
    }
  };

  const lastReadMessageId = messages
  .filter((m) => m.sender_id === user.id && m.read)
  .slice(-1)[0]?.id;

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="p-4 border-b flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="text-indigo-600 hover:text-indigo-950 hover:bg-white">
          ← Back
        </button>
        <h2 className="text-lg font-semibold text-indigo-900">
          {recipient?.username || "Conversation"}
        </h2>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.map((msg, index) => {
          const isSender = msg.sender_id === user.id;
          const timestamp = msg.sent_at
            ? new Date(msg.sent_at).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "";

          return (
            <div
              key={index}
              className={`max-w-[70%] px-3 py-2 rounded-lg ${
                isSender
                  ? "bg-indigo-500 text-white ml-auto"
                  : "bg-zinc-100 text-indigo-950"
              }`}
            >
              <p className="text-sm">{msg.content}</p>

              <div className="text-[10px] mt-1 text-right">
                <span className={isSender ? "text-zinc-200" : "text-zinc-500"}>
                  {timestamp}
                </span>
                {isSender && msg.id === lastReadMessageId && (
                <span className="ml-2 text-white">✓ Read</span>
                )}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t flex gap-2">
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 border rounded-full px-4 py-2 text-sm text-indigo-900"
        />
        <button
          onClick={handleSend}
          className="bg-indigo-600 text-white px-4 py-2 rounded-full text-sm hover:bg-indigo-950"
        >
          Send
        </button>
      </div>
    </div>
  );
}
