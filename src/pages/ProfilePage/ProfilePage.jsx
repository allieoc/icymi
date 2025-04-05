// pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabaseClient";
import { useSavedItems } from "../../context/SavedItemsContext";
import { Link } from "react-router-dom";
import PodcastCard from "../../components/PodcastCard/PodcastCard";
import FriendsList from "../../components/FriendsList/FriendsList";
import AddFriendButton from "../../components/AddFriendButton/AddFriendButton";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");
  const [editedUsername, setEditedUsername] = useState("");
  const [editedBio, setEditedBio] = useState("");
  const [editingField, setEditingField] = useState(null); // "username" | "bio" | null
  const [savedItems, setSavedItems] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const { savedArticles = [], savedPodcasts = [] } = useSavedItems();
  const [friends, setFriends] = useState([]);
  const [friendRefreshKey, setFriendRefreshKey] = useState(0);
  const [hasFriends, setHasFriends] = useState(false);
  const [inboxCount, setInboxCount] = useState(0);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (error) {
        console.error("Error fetching profile:", error);
        return;
      }

      if (data) {
        setProfile(data);
        setEditedUsername(data.username || "");
        setEditedBio(data.bio || "");
      }
    };

    const fetchSavedItems = async () => {
      const { data, error } = await supabase
        .from("saved_items")
        .select("*")
        .eq("user_id", user.id)
        .order("saved_at", { ascending: false })
        .limit(4);
    
      if (error) {
        console.error("❌ Error fetching saved_items:", error.message, error.details);
      } else {
        console.log("✅ saved_items fetched:", data);
        setSavedItems(data);
      }
    };
    
    if (!user || !user.id) return; // ✅ make sure user is loaded

    
    const fetchRecentlyViewed = async () => {
      const { data, error } = await supabase
        .from("recently_viewed")
        .select("*")
        .eq("user_id", user.id)
        .order("viewed_at", { ascending: false })
        .limit(4);
  
      if (error) {
        console.error("❌ Error fetching recently viewed:", error.message, error.details);
      } else {
        console.log("📦 Recently viewed data:", data);
        setRecentlyViewed(data);
      }
    };

    fetchProfile();
    fetchSavedItems();
    fetchRecentlyViewed();

    
  }, [user]);

  useEffect(() => {
    const fetchInboxCounts = async () => {
      if (!user?.id) return;
  
      // Fetch unread messages
      const { data: unreadMessages } = await supabase
        .from("messages")
        .select("id")
        .eq("recipient_id", user.id)
        .is("read_at", null);
  
      // Fetch pending friend requests
      const { data: pendingRequests } = await supabase
        .from("friends")
        .select("id")
        .eq("friend_id", user.id)
        .eq("status", "pending");
  
      const count = (unreadMessages?.length || 0) + (pendingRequests?.length || 0);
      setInboxCount(count);
    };
  
    fetchInboxCounts();
  }, [user]);

  const handleUpload = async (e) => {
    if (!user || !user.id) {
      console.warn("Upload aborted: User not ready");
      return;
    }

    const file = e.target.files[0];
    if (!file) return;

    const maxFileSizeMB = 2;
    const maxBytes = maxFileSizeMB * 1024 * 1024;

    if (file.size > maxBytes) {
      setUploadErrorMsg(`File too large. Max allowed size is ${maxFileSizeMB}MB.`);
      return;
    }

    

    const fileExt = file.name.split(".").pop();
    const fileName = `${user.id}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
        .from("profile-photos")
        .upload(filePath, file, {
            upsert: true, // this ensures the file is overwritten if it exists
        });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      let message = "Upload failed. Please try again.";
      if (uploadError.message.includes("file size")) {
        message = "This image is too large. Try one under 50MB.";
      }
      setUploadErrorMsg(message);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("profile-photos")
      .getPublicUrl(filePath);

    const imageUrl = publicUrlData.publicUrl;

    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: imageUrl })
      .eq("id", user.id);

    if (updateError) {
      console.error("Error updating profile image:", updateError);
      return;
    }

    setProfile((prev) => ({ ...prev, avatar_url: imageUrl }));
    setUploadErrorMsg("");
  };

  const handleSave = async () => {
    if (!user || !profile) return;
  
    const updates = {};
    if (editingField === "username" && editedUsername !== profile.username) {
      updates.username = editedUsername;
    }
    if (editingField === "bio" && editedBio !== profile.bio) {
      updates.bio = editedBio;
    }
  
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user.id);
  
      if (error) {
        console.error("Error saving profile updates:", error);
      } else {
        setProfile((prev) => ({ ...prev, ...updates }));
      }
    }
  
    setEditingField(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSave();
      e.target.blur(); // Optional: exit editing mode
    }
  };

  const combinedSaved = [...savedArticles, ...savedPodcasts]
  .sort((a, b) => new Date(b.saved_at) - new Date(a.saved_at))
  .slice(0, 4);


  if (!user) return <p className="p-6 text-indigo-950 min-h-screen">Please log in to view your profile.</p>;

  console.log("🧩 FriendsList component rendered");

  return (
    <div className="p-6 text-indigo-950 max-w-2xl mx-auto min-h-screen">
      <div className="flex items-start gap-4">
        {/* Profile Photo */}
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="flex-col">
            <label className="relative cursor-pointer">
              <div className="w-24 h-24 rounded-full bg-zinc-700 flex items-center justify-center text-center text-xs text-white hover:bg-zinc-600">
                Upload <br />
                Profile Photo
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleUpload}
                disabled={!user}
                className="hidden"
              />
            </label>
            {uploadErrorMsg && (
              <p className="text-sm text-red-500 mt-2 w-24">{uploadErrorMsg}</p>
            )}
          </div>
        )}
  
        {/* Profile Info */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-indigo-950">Your Profile</h1>
            {profile?.id !== user?.id && (
              <AddFriendButton 
              targetUserId={profile?.id} 
              onFriendAdded={() => setFriendRefreshKey((prev) => prev + 1)} 
            />
            )}
          </div>
          <Link
            to="/inbox"
            className="relative bg-indigo-500 text-white text-sm px-4 py-2 rounded-full hover:bg-indigo-600 transition inline-block"
          >
            Inbox
            {inboxCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {inboxCount}
              </span>
            )}
          </Link>

  
          {profile && (
            <div className="mb-6 p-4 rounded text-white">
              {/* Username */}
              <div className="mb-2">
                {editingField === "username" ? (
                  <input
                  type="text"
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="bg-white text-indigo-950 rounded w-full"
                />
                
                ) : (
                  <h2
                    className="text-lg font-semibold text-indigo-950 cursor-pointer hover:underline"
                    onClick={() => setEditingField("username")}
                  >
                    {profile.username || "Tap to set username"}
                  </h2>
                )}
              </div>
  
              {/* Bio */}
              <div className="mb-2">
                {editingField === "bio" ? (
                  <textarea
                  value={editedBio}
                  onChange={(e) => setEditedBio(e.target.value)}
                  onBlur={handleSave}
                  onKeyDown={handleKeyDown}
                  autoFocus
                  className="bg-white text-indigo-950 p-1 rounded w-full resize-none"
                  rows={2}
                />
                
                ) : (
                  <p
                    className="text-sm text-indigo-950 cursor-pointer hover:underline whitespace-pre-line"
                    onClick={() => setEditingField("bio")}
                  >
                    {profile.bio || "Tap to add a bio"}
                  </p>
                )}
              </div>
  
              {/* Email (non-editable) */}
              <p className="text-sm text-zinc-400 mt-2">{user.email}</p>
            </div>
          )}
        </div>
      </div>
  
  {/*Friends Section */}
      <h2 className="text-xl font-semibold text-indigo-950 mb-2 mt-4">Friends</h2>
      <Link
        to="/friend-search"
        className="text-sm text-indigo-500 underline hover:text-indigo-700 mb-2 inline-block"
      >
        + Add More Friends
      </Link>

      <FriendsList refreshTrigger={friendRefreshKey} setHasFriends={setHasFriends} />

      {!hasFriends && (
        <p className="text-sm text-zinc-400 mb-4">You haven't added any friends yet.</p>
      )}

      
      {/* Saved Items */}

        <h1 className="text-xl font-semibold text-indigo-950 mt-4">⭐️ Saved</h1>
        {savedItems.length === 0 ? (
  <p className="text-sm text-zinc-400">You haven't saved anything yet. Go find something cool to come back to!</p>
) : (
  <div className="mb-6">
          {/* Podcasts */}
          {savedItems.some(item => item.item_type === "podcast") && (
            <div>
              <h3 className="text-md font-semibold mb-2 mt-4">🎧 Podcasts</h3>
              <div className="grid grid-cols-2 gap-4">
                {savedItems
                  .filter(item => item.item_type === "podcast")
                  .map(podcast => (
                    <PodcastCard
                      podcast={podcast}
                      key={podcast.id}
                      onClick={() => {
                       logView({
                        userId: user.id,
                        content: {
                          id: podcast.id,
                          content_type: "podcast",
                          title: podcast.title,
                          url: podcast.link,
                          image_url: podcast.image_url,
                          source: podcast.source,
                        },
                      });
                      }}
                    />
                  ))}
              </div>
            </div>
          )}

        {/* Articles */}
        {savedItems.some(item => item.item_type === "article") && (
          <>
            <h3 className="text-md font-semibold mb-6 mt-6">📰 Articles</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {savedItems
                .filter(item => item.item_type === "article")
                .map(article => (
                  <Link
                    key={article.id}
                    to={article.url}
                    className="block bg-indigo-950 p-3 rounded-md text-white"
                  >
                    <p className="text-md mb-2">{article.title}</p>
                    <p className="text-xs text-zinc-400">{article.source}</p>
                  </Link>
                ))}
            </div>
            
          </>
          
        )}
        <div className="mt-6">
        <Link to="/saved" className="text-md text-indigo-950 font-bold">View all saved</Link>
        </div>
        </div>
    )}


          {/* Recently Viewed */}
          <h2 className="text-xl font-semibold mt-8">🕘 Recently Viewed</h2>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {recentlyViewed.map((item) =>
              item.content_type === "podcast" ? (
                <PodcastCard key={item.id} podcast={item} />
              ) : (
                <Link key={item.id} to={item.url} className="block bg-indigo-950 p-3 rounded-lg text-white">
                  <p className="text-sm">{item.title}</p>
                  <p className="text-xs text-zinc-400">{item.source}</p>
                </Link>
              )
            )}
          </div>
    </div>
  )};