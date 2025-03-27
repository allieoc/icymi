import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MoodDropdown from "../../components/MoodDropdown/MoodDropdown";
import './MoodSelector.css';


const moodDescriptions = {
    focused: "Hard news only. No fluff. Just the need-to-know stuff.",
    mellow: "Only the gentlest scroll. Good vibes, no chaos.",
    "ready to listen": "No reading required. Just press play on podcasts and videos."
  };
  
  export default function MoodSelector() {
    const [selectedMood, setSelectedMood] = useState("");
    const navigate = useNavigate();
  
    function handleSubmit(e) {
      e.preventDefault();
      if (selectedMood) {
        navigate("/home?mood=" + selectedMood);
      }
    }
  
    return (
      <div className="mood-selector-wrapper">
        <div className="mood-selector">
          <h1 className="title">What mood are you in?</h1>
          <form>
          <MoodDropdown value={selectedMood} onChange={setSelectedMood} />
  
          {/* <form onSubmit={handleSubmit}>
            <select
              value={selectedMood}
              onChange={(e) => setSelectedMood(e.target.value)}
            >
              <option value="" disabled>
                Select your mood
              </option>
              <option value="focused">Focused</option>
              <option value="mellow">Mellow</option>
              <option value="ready to listen">Ready to Listen</option>
            </select> */}
  
            {selectedMood && (
              <p className="mood-description">{moodDescriptions[selectedMood]}</p>
            )}
  
            <button
            className="mt-6 bg-indigo-900 hover:bg-indigo-500 text-white font-semibold py-3 px-6 rounded-xl shadow-md transition duration-200"
            >
            Enter Moodscroll
            </button>

          </form>
        </div>
      </div>
    );
  }
  