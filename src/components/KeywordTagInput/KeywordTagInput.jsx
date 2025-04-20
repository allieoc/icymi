import { useState } from "react";

export default function KeywordTagInput({ tags, setTags, onTagsChange }) {
  const [input, setInput] = useState("");

  const removeTag = (indexToRemove) => {
    const newTags = tags.filter((_, i) => i !== indexToRemove);
    setTags(newTags);
    onTagsChange?.(newTags);
  };

  const clearAllTags = () => {
    setTags([]);
    onTagsChange?.([]);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = input.trim();
      if (trimmed && !tags.includes(trimmed.toLowerCase())) {
        const updated = [...tags, trimmed.toLowerCase()];
        setTags(updated);
        setInput("");
        onTagsChange?.(updated);
      }
    }
  };

  return (
    <div className="flex flex-wrap gap-2 items-center border border-zinc-300 rounded-md px-3 py-2 bg-white">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="bg-indigo-100 text-indigo-800 text-sm px-2 py-1 rounded-full flex items-center gap-1"
        >
          {tag}
          <button
            onClick={() => removeTag(i)}
            className="text-indigo-500 hover:text-indigo-700"
          >
            ✕
          </button>
        </span>
      ))}

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type keyword and hit Enter"
        className="flex-1 min-w-[120px] text-sm px-2 py-1 outline-none text-indigo-900"
      />

      {tags.length > 0 && (
        <button
          onClick={clearAllTags}
          className="ml-auto text-zinc-400 hover:text-red-500 text-sm"
        >
          Clear all ✕
        </button>
      )}
    </div>
  );
}
