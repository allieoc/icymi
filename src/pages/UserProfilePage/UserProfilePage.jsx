import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase } from "../../utils/supabaseClient";
import AddFriendButton from "../../components/AddFriendButton/AddFriendButton";
import { useAuth } from "../../context/AuthContext";

export default function UserProfilePage() {
  const { user } = useAuth();
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [isFriend, setIsFriend] = useState(false);
  const [sharedItems, setSharedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [friendStatus, setFriendStatus] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchProfileAndFriendship = async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("id, username, name, avatar_url, bio")
        .eq("id", id)
        .single();

      setProfile(profileData);

      if (user) {
        const { data: friendData } = await supabase
          .from("friends")
          .select("*")
          .eq("user_id", user.id)
          .eq("friend_id", id)
          .maybeSingle();
      
        setFriendStatus(friendData?.status || null);
        setIsFriend(friendData?.status === "accepted");
      }
    };

    fetchProfileAndFriendship();
  }, [id, user]);

  useEffect(() => {
    const fetchSharedItems = async () => {
      if (!user || !id) return;

      const { data: theirSaves } = await supabase
        .from("saved_items")
        .select("url, title, item_type, source")
        .eq("user_id", id)
        .limit(10);

      const { data: yourSaves } = await supabase
        .from("saved_items")
        .select("url")
        .eq("user_id", user.id);

      const yourLinks = new Set(yourSaves.map(item => item.url));
      const shared = theirSaves.filter(item => yourLinks.has(item.url));

      setSharedItems(shared);
      setLoading(false);
    };

    fetchSharedItems();
  }, [id, user]);

  if (!profile) return <p className="p-6">Loading profile...</p>;

  return (
    <div className="p-6 text-indigo-950 max-w-2xl mx-auto min-h-screen">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        {profile.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center text-white text-xl">
            {profile.name?.[0] || "👤"}
          </div>
        )}

        {/* Info */}
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-2xl font-bold">{profile.username || profile.name}</h1>
            {user && user.id !== profile.id && (
                friendStatus === "accepted" ? (
                    <div className="flex gap-2 mt-2 items-center">
                    <span className="text-sm bg-green-500 text-white px-4 py-2 rounded-full">Friends</span>
                    <Link
                        to={`/messages/${profile.id}`}
                        className="bg-indigo-500 text-white text-sm px-4 py-2 rounded-full hover:bg-indigo-600 transition"
                    >
                        Message
                    </Link>
                    </div>
                ) : friendStatus === "pending" ? (
                    <span className="text-sm bg-orange-400 text-white px-4 py-2 rounded-full">Request Pending</span>
                ) : (
                    <AddFriendButton targetUserId={profile.id} />
                )
                )}
          </div>
          {profile.bio && <p className="text-sm text-zinc-700 whitespace-pre-line">{profile.bio}</p>}
        </div>
      </div>

      {/* Shared saves */}
      {sharedItems.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">You both saved</h2>
          <ul className="grid grid-cols-2 gap-4">
            {sharedItems.map((item) => (
              <li key={item.url} className="bg-indigo-950 p-3 rounded-md text-white">
                <p className="text-sm mb-1">{item.title}</p>
                <p className="text-xs text-zinc-400">{item.source}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* No shared content */}
      {!loading && sharedItems.length === 0 && (
        <p className="text-sm text-zinc-400 mt-6">No shared saves yet.</p>
      )}
    </div>
  );
}
