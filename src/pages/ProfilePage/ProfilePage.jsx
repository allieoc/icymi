// pages/ProfilePage.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabaseClient";

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [friends, setFriends] = useState([]);
  const [uploadErrorMsg, setUploadErrorMsg] = useState("");

  console.log("🔐 User from AuthContext:", user);

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
      }
    };

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
          .select("id, username, avatar_url")
          .in("id", friendIds);
        setFriends(friendProfiles || []);
      }
    };

    fetchProfile();
    fetchFriends();
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
        message = "This image is too large. Try one under 2MB.";
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

  if (!user) return <p className="p-6 text-white">Please log in to view your profile.</p>;

  return (
    <div className="p-6 text-indigo-950 max-w-2xl mx-auto min-h-screen">
      <div className="flex items-start gap-4">
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

        <div>
          <h1 className="text-2xl font-bold mb-4">Your Profile</h1>
          {profile && (
            <div className="mb-6 bg-zinc-800 p-4 rounded text-white">
              <p>
                <strong>Username:</strong> {profile.username || "(not set)"}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
            </div>
          )}
        </div>
      </div>

      <h2 className="text-xl font-semibold mb-2 mt-4">Friends</h2>
      <div className="grid grid-cols-2 gap-4">
        {friends.length > 0 ? (
          friends.map((friend) => (
            <div key={friend.id} className="bg-zinc-700 p-3 rounded text-white">
              {friend.avatar_url && (
                <img
                  src={friend.avatar_url}
                  alt={friend.username}
                  className="w-12 h-12 rounded-full mb-1"
                />
              )}
              <p className="text-sm">{friend.username}</p>
            </div>
          ))
        ) : (
          <p className="col-span-2 text-sm text-zinc-400">No friends yet.</p>
        )}
      </div>
    </div>
  );
}
