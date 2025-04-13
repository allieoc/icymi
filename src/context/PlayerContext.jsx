// context/PlayerContext.jsx
import { createContext, useContext, useState, useRef, useEffect } from "react";

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(new Audio());
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const expandPlayer = () => setIsExpanded(true);
  const minimizePlayer = () => setIsExpanded(false);

  const seekTo = (time) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };


  const playTrack = (newTrack) => {
    if (track?.audioUrl !== newTrack.audioUrl) {
      audioRef.current.src = newTrack.audioUrl;
      setTrack(newTrack);
    }
    audioRef.current.play();
    setIsPlaying(true);
  };

  const pause = () => {
    audioRef.current.pause();
    setIsPlaying(false);
  };

  const togglePlay = () => {
    if (isPlaying) pause();
    else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const skipForward = () => {
    audioRef.current.currentTime += 15;
  };

  const skipBackward = () => {
    audioRef.current.currentTime -= 15;
  };

  useEffect(() => {
    const audio = audioRef.current;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);

    return () => {
        audio.removeEventListener("timeupdate", updateTime);
        audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  

  return (
    <PlayerContext.Provider
      value={{
        track,
        isPlaying,
        currentTime,
        duration,
        playTrack,
        pause,
        togglePlay,
        skipForward,
        skipBackward,
        seekTo,
        isExpanded,
        expandPlayer,
        minimizePlayer
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
