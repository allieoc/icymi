// components/NowPlayingBar.jsx
import { usePlayer } from "../../context/PlayerContext";
import { formatTime } from "../../utils/formatTime";
import { Rewind, Play, Pause, FastForward } from "lucide-react";



export default function NowPlayingBar() {
  const {
    track,
    isPlaying,
    togglePlay,
    skipForward,
    skipBackward,
    currentTime,
    duration,
    expandPlayer,
    seekTo,
  } = usePlayer();


  if (!track) return null;

 
  const handleScrub = (e) => {
    const newTime = Number(e.target.value);
    const audio = document.querySelector("audio");
    if (audio) {
      audio.currentTime = newTime;
    }
  };

  return (
    
<div className="fixed bottom-0 left-0 w-full bg-zinc-900 text-white p-4 z-50 shadow-lg flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
  <div onClick={() => {
        expandPlayer();
    }}
    className="flex-1 overflow-hidden">
    <div className="text-sm font-semibold truncate">{track.title}</div>
    <div className="text-xs text-gray-400">{track.channel}</div>
  </div>

  <div className="w-full sm:w-1/2">
    <input
      type="range"
      min="0"
      max={duration || 0}
      value={currentTime}
      onChange={(e) => seekTo(Number(e.target.value))}
      className="w-full accent-blue-400"
    />
    <div className="flex justify-between text-xs text-gray-400">
      <span>{formatTime(currentTime)}</span>
      <span>{formatTime(duration)}</span>
    </div>
  </div>

  <div className="flex gap-4 mt-2 sm:mt-0">
    <button onClick={skipBackward}><Rewind size={20} /></button>
    <button onClick={togglePlay}>
      {isPlaying ? <Pause size={20} /> : <Play size={20} />}
    </button>
    <button onClick={skipForward}><FastForward size={20} /></button>
  </div>
</div>

  );
}
