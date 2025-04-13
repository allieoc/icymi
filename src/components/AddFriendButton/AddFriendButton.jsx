// components/AddFriendButton.jsx
import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function AddFriendButton({ targetUserId, onStatusChange }) {
  const { user } = useAuth();
  const [status, setStatus] = useState(null); // null | pending | accepted | none
  const [incomingRequest, setIncomingRequest] = useState(false);

  useEffect(() => {
    if (!user || !targetUserId) return;

    const fetchFriendship = async () => {
      const { data, error } = await supabase
        .from("friends")
        .select("*")
        .or(
          `and(user_id.eq.${user.id},friend_id.eq.${targetUserId}),and(user_id.eq.${targetUserId},friend_id.eq.${user.id})`
        );

      if (error) {
        console.error("❌ Error fetching friend status:", error);
        return;
      }

      if (data.length === 0) {
        setStatus("none");
      } else {
        const record = data[0];
        setStatus(record.status);
        if (record.friend_id === user.id && record.status === "pending") {
          setIncomingRequest(true);
        }
      }
    };

    fetchFriendship();
  }, [user, targetUserId]);

  const sendRequest = async () => {
    const { error } = await supabase.from("friends").insert({
      user_id: user.id,
      friend_id: targetUserId,
      status: "pending",
      requested_at: new Date().toISOString(),
    });

    if (!error) {
      setStatus("pending");
      onStatusChange?.("pending");
    } else {
      console.error("❌ Error sending friend request:", error);
    }
  };

  const acceptRequest = async () => {
    const { error } = await supabase
      .from("friends")
      .update({ status: "accepted", accepted_at: new Date().toISOString() })
      .eq("user_id", targetUserId)
      .eq("friend_id", user.id)
      .eq("status", "pending");

    if (!error) {
      setStatus("accepted");
      setIncomingRequest(false);
      onStatusChange?.("accepted");
    } else {
      console.error("❌ Error accepting friend request:", error);
    }
  };

  if (status === "accepted") {
    return <span className="text-sm text-green-600 font-medium">✅ Friends</span>;
  }

  if (incomingRequest) {
    return (
      <button onClick={acceptRequest} className="text-sm bg-green-500 text-white px-3 py-1 rounded">
        Accept Friend
      </button>
    );
  }

  if (status === "pending") {
    return <span className="text-sm text-yellow-600 font-medium">⏳ Pending</span>;
  }

  return (
    <button onClick={sendRequest} className="text-sm bg-indigo-500 text-white px-3 py-1 rounded">
      Add Friend
    </button>
  );
}
