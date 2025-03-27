import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MoodDropdown from "../../components/MoodDropdown/MoodDropdown";


export default function MoodSelector() {
  const [selectedMood, setSelectedMood] = useState({ name: "Choose your mood" });
  const navigate = useNavigate();

  
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      <div className="rounded-2xl bg-white bg-opacity-70 p-8 shadow-xl text-center w-full max-w-lg">
        <h1 className="text-3xl font-bold text-indigo-800 mb-4">What's your mood?</h1>
        <MoodDropdown selectedMood={selectedMood} setSelectedMood={setSelectedMood} />
        <button
          className="mt-6 px-6 py-3 bg-black text-white rounded-xl hover:bg-gray-900 transition duration-200"
          disabled={selectedMood.name === "Choose your mood"}
        >
          Let's Go
        </button>
      </div>
    </div>
  );
}
