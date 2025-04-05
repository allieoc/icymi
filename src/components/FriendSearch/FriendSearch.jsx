import { useEffect, useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { useAuth } from "../../context/AuthContext";

export default function FriendSearch() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      // Get all users except the current one
      const { data: allUsers, error: usersError } = await supabase
        .from("profiles")
        .select("id, username, name, avatar_url")
        .neq("id", user.id);

      if (usersError) {
        console.error("❌ Error fetching users:", usersError);
        return;
      }

      setUsers(allUsers);

      // Fetch friend relationships
      const { data: friendData } = await supabase
        .from("friends")
        .select("friend_id, status")
        .eq("user_id", user.id);

      const accepted = friendData.filter((f) => f.status === "accepted").map((f) => f.friend_id);
      const pending = friendData.filter((f) => f.status === "pending").map((f) => f.friend_id);

      setFriends(accepted);
      setPendingRequests(pending);
    };

    fetchData();
  }, [user]);

  const handleAddFriend = async (targetId) => {
    const { error } = await supabase.from("friends").insert({
      user_id: user.id,
      friend_id: targetId,
      status: "pending",
    });

    if (error) {
      console.error("❌ Error sending friend request:", error);
    } else {
      setPendingRequests((prev) => [...prev, targetId]);
    }
  };

  const filteredUsers = users.filter((u) =>
    (u.username || u.name)?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-4 min-h-screen">
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border rounded px-3 py-2 mb-4"
      />

      <div className="flex flex-col gap-3">
        {filteredUsers.map((u) => {
          const isFriend = friends.includes(u.id);
          const isPending = pendingRequests.includes(u.id);
          const initial = u.name?.[0]?.toUpperCase() || u.username?.[0]?.toUpperCase() || "?";

          return (
            <div
              key={u.id}
              className="flex items-center gap-4 bg-white p-3 rounded shadow"
            >
              {u.avatar_url ? (
                <img
                  src={u.avatar_url}
                  alt={u.username}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-300 flex items-center justify-center text-white font-bold text-lg">
                  {initial}
                </div>
              )}

              <div className="flex-1">
                <p className="font-semibold">{u.username || u.name}</p>
              </div>

              {isFriend ? (
                <span className="text-sm px-3 py-1 bg-green-500 text-white rounded-full">
                  Friends
                </span>
              ) : isPending ? (
                <span className="text-sm px-3 py-1 bg-yellow-400 text-white rounded-full">
                  Pending
                </span>
              ) : (
                <button
                  onClick={() => handleAddFriend(u.id)}
                  className="text-sm px-3 py-1 bg-indigo-500 text-white rounded-full hover:bg-indigo-600"
                >
                  Add Friend
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
