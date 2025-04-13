import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from '../../utils/supabaseClient';
import { useAuth } from '../../context/AuthContext';

export default function FriendsList({ refreshTrigger, setHasFriends }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);


  useEffect(() => {
    if (!user?.id) {
      console.log("⛔ No user yet, skipping fetchFriends()");
      return;
    }
  
    const fetchFriends = async () => {
  
      const { data, error } = await supabase
        .from("friends")
        .select("friend_id")
        .eq("user_id", user.id)
        .eq("status", "accepted");
  
      if (error) {
        console.error("❌ Error fetching friend_ids:", error);
        return;
      }
  
      const friendIds = data.map((f) => f.friend_id);
  
      if (friendIds.length === 0) {
        setFriends([]);
        if (setHasFriends) setHasFriends(false);
        return;
      }
  
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, username, avatar_url, name")
        .in("id", friendIds);
  
      if (profilesError) {
        console.error("❌ Error fetching friend profiles:", profilesError);
      } else {
        setFriends(profiles || []);
        if (setHasFriends) {
          setHasFriends((profiles || []).length > 0);
        }
      }
    };
  
    fetchFriends();
  }, [user?.id, refreshTrigger]); // <— watch user.id specifically


  const gradientClasses = [
    "from-blue-400 to-indigo-500",
    "from-purple-500 to-pink-500",
    "from-green-400 to-blue-500",
    "from-yellow-400 to-red-500",
    "from-pink-400 to-purple-600",
  ];

  return (
    <div className="flex overflow-x-auto gap-4 py-2">
      {friends.map((friend, index) => {
        const hasAvatar = friend.avatar_url;
        const initial = friend.name?.[0]?.toUpperCase() || "";
        const gradient = gradientClasses[index % gradientClasses.length];

        return (
          <Link to={`/profile/${friend.id}`} key={friend.id}>
            {hasAvatar ? (
              <img
                src={friend.avatar_url}
                alt={friend.username || "Friend"}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-semibold bg-gradient-to-br ${gradient}`}
              >
                {initial || ""}
              </div>
            )}
              {friend.username && (
              <p className="text-xs text-indigo-950 mt-1">{friend.username}</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
