import { motion, AnimatePresence } from "framer-motion";
import { usePlayer } from "../../context/PlayerContext";
import { Pause, Play, X, Rewind, FastForward } from "lucide-react";
import placeholderImg from "../../assets/pod-placeholder.png";

export default function FullPlayer() {
  const {
    track,
    isExpanded,
    minimizePlayer,
    isPlaying,
    togglePlay,
    currentTime,
    duration,
    seekTo,
    skipForward,
    skipBackward
  } = usePlayer();

  if (!isExpanded || !track) return null;

  const {
    title,
    channel,
    image_url,
    channelImage,
  } = track;
  
  const imageToUse =
    image_url || // episode-level image from podcast.js
    channelImage || // fallback from feed
    placeholderImg;

  return (
    <AnimatePresence>
  <motion.div
    key="full-player"
    initial={{ y: "100%" }}
    animate={{ y: 0 }}
    exit={{ y: "100%" }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
    drag="y"
    dragConstraints={{ top: 0, bottom: 0 }}
    onDragEnd={(e, info) => {
      if (info.offset.y > 100) minimizePlayer();
    }}
    className="fixed inset-0 z-[9999] bg-zinc-900 text-white flex flex-col"
  >
    {/* Top bar */}
    <div className="flex justify-between items-center h-14 p-4 border-b border-zinc-700">
      <span className="text-xs uppercase tracking-widest text-zinc-400">
        Now Playing
      </span>
      <button onClick={minimizePlayer}>
        <X size={20} />
      </button>
    </div>

    {/* Vertically centered content area */}
    <div className="flex-1 flex flex-col justify-center items-center px-6 text-center gap-6 overflow-hidden">
      <img
        src={imageToUse}
        alt={title}
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = placeholderImg;
        }}
        className="w-full max-w-[350px] aspect-square object-cover rounded-xl shadow-md bg-zinc-800"
      />

      {/* Title and channel */}
      <div>
        <h2 className="text-xl font-bold text-white">{title}</h2>
        <p className="text-sm text-zinc-400 mt-1">{channel}</p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-[400px]">
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={(e) => seekTo(Number(e.target.value))}
          className="w-full accent-blue-400"
        />
        <div className="flex justify-between text-xs text-zinc-400 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Play/pause */}
      <div className="flex justify-center">
      <button onClick={skipBackward}><Rewind size={20} /></button>
        <button
          onClick={togglePlay}
          className="bg-white text-zinc-900 p-4 rounded-full shadow-md hover:bg-zinc-100 transition mr-10 ml-10"
        >
          {isPlaying ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button onClick={skipForward}><FastForward size={20} /></button>
      </div>
    </div>
  </motion.div>
</AnimatePresence>

  );
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60) || 0;
  const secs = Math.floor(seconds % 60) || 0;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
