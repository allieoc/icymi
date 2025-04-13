import { usePlayer } from "../../context/PlayerContext";
import { supabase } from "../../utils/supabaseClient";
import SaveButton from "../SaveButton/SaveButton";
import { useState } from "react";
import SharePopup from "../SharePopup/SharePopup";

export default function PodcastCard({ podcast, showRemove = false, onClick }) {
  const { playTrack, expandPlayer } = usePlayer();
  const [showShare, setShowShare] = useState(false);

  const handlePlay = () => {
    playTrack({
      title: podcast.title,
      channel: podcast.source || podcast.sourceLabel,
      audioUrl: podcast.audio_url || podcast.audioUrl,
    });
    expandPlayer();
  };

  const handleUnsave = async (e) => {
    e.stopPropagation();
    const { error } = await supabase
      .from("saved_items")
      .delete()
      .eq("id", podcast.id);
    if (error) {
      console.error("Error unsaving podcast:", error);
    } else {
      window.location.reload(); // Quick refresh
    }
  };

  return (
    <div
      onClick={() => {
        if (!showShare) handlePlay();
        if (onClick) onClick();
      }}
      className="relative cursor-pointer bg-indigo-950 rounded-xl p-4 hover:bg-indigo-900 transition shadow-md"
    >
      {/* Unsave Button */}
      {showRemove && (
        <button
          onClick={handleUnsave}
          className="absolute top-2 right-2 text-sm text-zinc-400 hover:text-red-400 bg-white"
        >
          ✖
        </button>
      )}

      {/* Thumbnail */}
      <img
        src={podcast.image_url}
        alt={podcast.title}
        className="w-full aspect-square object-cover rounded-md mb-3"
      />
      <h3 className="text-white text-sm font-semibold line-clamp-2">{podcast.title}</h3>
      <p className="text-xs text-zinc-400 mt-1">{podcast.source || podcast.sourceLabel}</p>

      {/* Share Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowShare(true);
        }}
        className="absolute bottom-2 right-2 text-indigo-300 hover:bg-indigo-300 hover:text-white"
        title="Share"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-share"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16 6 12 2 8 6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
      </button>

      {/* SharePopup */}
      {showShare && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="z-50 absolute top-0 left-0 w-full h-full flex justify-center items-center bg-black bg-opacity-40"
        >
          <SharePopup
            url={podcast.link}
            title={podcast.title}
            onClose={() => setShowShare(false)}
          />
        </div>
      )}

      {/* Save Button */}
      {!showRemove && (
        <div onClick={(e) => e.stopPropagation()} className="absolute top-2 left-2">
          <SaveButton story={podcast} />
        </div>
      )}
    </div>
  );
}
