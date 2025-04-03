import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function FriendsList({ onLoad }) {
    const [friends, setFriends] = useState([]);
    const { user } = useAuth();


    // Gradient color palette
    const gradients = [
        "from-pink-400 to-red-500",
        "from-green-400 to-blue-500",
        "from-yellow-400 to-pink-500",
        "from-purple-400 to-indigo-500",
        "from-blue-400 to-cyan-500",
        "from-rose-400 to-pink-500",
    ];
    
    function getRandomGradient(seed) {
        const index = seed % gradients.length;
        return gradients[index];
    }
  
    useEffect(() => {
      const fetchFriends = async () => {
        if (!user) return;
        const { data, error } = await supabase
          .from("friends")
          .select("friend_id")
          .eq("user_id", user.id);
  
        if (!error) {
          const friendIds = data.map((f) => f.friend_id);
          const { data: friendProfiles } = await supabase
            .from("profiles")
            .select("id, username, avatar_url, full_name")
            .in("id", friendIds);
  
          setFriends(friendProfiles || []);
  
          // 👇 Send data up to parent
          if (onLoad) {
            onLoad(friendProfiles || []);
          }
        }
      };
  
      fetchFriends();
    }, [user, onLoad]);

  if (!friends.length) {
    return <p className="text-zinc-400">No friends yet.</p>;
  }

  return (
    <div className="flex gap-4 overflow-x-auto py-2">
      {friends.map((friend, idx) => {
        const hasAvatar = !!friend.avatar_url;
        const name = friend.full_name || "";
        const firstInitial = name.charAt(0).toUpperCase();
        const gradient = getRandomGradient(idx); // Stable gradient per friend index

        return (
          <div key={friend.id} className="flex flex-col items-center min-w-[60px]">
            {hasAvatar ? (
              <img
                src={friend.avatar_url}
                alt={name}
                className="w-12 h-12 rounded-full object-cover border-2 border-white"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-lg font-semibold`}
              >
                {firstInitial || ""}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
