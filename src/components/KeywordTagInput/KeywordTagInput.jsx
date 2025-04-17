import React from "react";

export default function KeywordTagInput({ tags, setTags }) {
  const [inputValue, setInputValue] = React.useState("");

  const handleKeyDown = (e) => {
    if (e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const newTag = inputValue.trim().toLowerCase();
      if (newTag && !tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setInputValue("");
    }
  };

  const removeTag = (indexToRemove) => {
    setTags(tags.filter((_, i) => i !== indexToRemove));
  };

  const clearAll = () => {
    setTags([]);
  };

  return (
    <div className="bg-white border border-zinc-300 rounded-md p-2 flex flex-wrap items-center gap-2">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="bg-indigo-700 text-white text-sm px-3 py-1 rounded-full flex items-center gap-2"
        >
          {tag}
          <button
            onClick={() => removeTag(i)}
            className="text-white hover:text-zinc-200"
          >
            ✕
          </button>
        </span>
      ))}
      <input
        type="text"
        className="flex-1 min-w-[120px] border-none focus:outline-none text-sm text-indigo-900"
        placeholder="Type and press comma"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {tags.length > 0 && (
        <button
          onClick={clearAll}
          className="ml-2 text-zinc-400 hover:text-red-400 text-sm"
          title="Clear all"
        >
          ✕
        </button>
      )}
    </div>
  );
}
