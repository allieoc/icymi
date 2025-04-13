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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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

   
      

    const channel = supabase
      .channel('message-thread')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `sender_id=eq.${recipientId}`,
        },
        (payload) => {
          const newMsg = payload.new;
          if (
            (newMsg.sender_id === recipientId && newMsg.recipient_id === user.id) ||
            (newMsg.sender_id === user.id && newMsg.recipient_id === recipientId)
          ) {
            setMessages((prev) => [...prev, newMsg]);
            scrollToBottom();
          }
        }
      )
      .subscribe();
  
    return () => {
      supabase.removeChannel(channel);
    };

    
  }, [user, recipientId]);

  useEffect(() => {
    const markAsRead = async () => {
        const { error } = await supabase
          .from("messages")
          .update({ read_at: new Date().toISOString() })
          .eq("recipient_id", user.id)
          .eq("sender_id", recipientId)
          .is("read_at", null);
    
        if (error) {
          console.error("❌ Failed to mark messages as read:", error);
        } else {
          // Trigger a re-fetch in the inbox (optional optimization)
          // This would ideally update some global state or invalidate a query if you're using SWR/React Query/etc
        }
      };
    
      if (user?.id && recipientId) {
        markAsRead();
      }
  }, [user?.id, recipientId]);



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

  function linkifyText(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, i) =>
      urlRegex.test(part) ? (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-indigo-950 underline">
          {part}
        </a>
      ) : (
        part
      )
    );
  }

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
      className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm ${
        isSender
          ? "bg-indigo-600 text-white self-end ml-auto"
          : "bg-zinc-100 text-indigo-900 self-start mr-auto"
      }`}
    >
      <p className={`text-sm ${isSender ? "text-white" : "text-indigo-950"}`}>
        {linkifyText(msg.content)}
      </p>
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
