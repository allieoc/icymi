import { usePlayer } from "../../context/PlayerContext";
import { supabase } from "../../utils/supabaseClient";
import SaveButton from "../SaveButton/SaveButton";


export default function PodcastCard({ podcast, showRemove = false, onClick }) {
  const { playTrack, expandPlayer } = usePlayer();

  const handleClick = () => {
    playTrack({
      title: podcast.title,
      channel: podcast.source || podcast.sourceLabel,
      audioUrl: podcast.audio_url || podcast.audioUrl, // handle both keys
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
      // You can pass a callback prop if you want to refresh the saved list after
      window.location.reload(); // Quick and dirty for now
    }
  };

  return (
    <div
    onClick={(e) => {
      handleClick(); // existing internal click behavior
      if (onClick) onClick(e); // 🔥 external click from parent
    }}
    className="relative cursor-pointer bg-indigo-950 rounded-xl p-4 hover:bg-indigo-900 transition shadow-md"
    >
      {showRemove && (
        <button
          onClick={handleUnsave}
          className="absolute top-2 right-2 text-sm text-zinc-400 hover:text-red-400 bg-white"
        >
          ✖
        </button>
      )}

      <img
        src={podcast.image_url}
        alt={podcast.title}
        className="w-full aspect-square object-cover rounded-md mb-3"
      />
      <h3 className="text-white text-sm font-semibold line-clamp-2">
        {podcast.title}
      </h3>
      <p className="text-xs text-zinc-400 mt-1">
        {podcast.source || podcast.sourceLabel}
      </p>

      {!showRemove && (
        <div onClick={(e) => e.stopPropagation()} className="absolute bottom-2 right-2">
          <SaveButton story={podcast} />
        </div>
      )}
    </div>
  );
}
