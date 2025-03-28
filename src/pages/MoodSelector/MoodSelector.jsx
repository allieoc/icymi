import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MoodDropdown from "../../components/MoodDropdown/MoodDropdown";
import './MoodSelector.css';
  
  export default function MoodSelector() {
    const navigate = useNavigate();
    const [selectedMood, setSelectedMood] = useState(null);

    const handleEnter = () => {
        if (!selectedMood) return;
        const moodSlug = selectedMood.name.toLowerCase().replace(/\s+/g, "-");
        navigate(`/${moodSlug}`);
    };

    const moodDescriptions = {
        focused: "Regular ol' news site.\nGet all your updates for the day.",
        mellow: "Only the gentlest scroll.\nGood vibes, no chaos.",
        "ready to listen": "No reading required.\nJust press play on podcasts and videos."
    };


    return (
      <div className="mood-selector-wrapper">
        <div className="mood-selector">
          <h1 className="title">What mood are you in?</h1>
          <form>
          <MoodDropdown selectedMood={selectedMood} setSelectedMood={setSelectedMood} />

          {selectedMood && (
            <p className="mt-4 text-lg text-slate-800 whitespace-pre-line transition-opacity duration-700 ease-in-out opacity-0 animate-fade-in">
                {moodDescriptions[selectedMood.name.toLowerCase()]}
            </p>
            )}


  
            <button
                onClick={handleEnter}
                className="mt-6 bg-indigo-900 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-200"
            >
                Enter Moodscroll
            </button>

          </form>
        </div>
      </div>
    );
  }
  