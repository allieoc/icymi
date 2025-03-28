import { Listbox } from "@headlessui/react";
import { useState } from "react";
import { ChevronUpDownIcon, CheckIcon } from "@heroicons/react/20/solid";

const moods = [
  { name: "Focused" },
  { name: "Mellow" },
  { name: "Ready to Listen" },
];

export default function MoodDropdown({ selectedMood, setSelectedMood }) {
  return (
    <div className="w-full max-w-md mx-auto">
      <Listbox value={selectedMood} onChange={setSelectedMood}>
        <div className="relative mt-3">
        <Listbox.Button className="relative w-full cursor-pointer rounded-xl bg-white py-3 pl-4 pr-10 text-left text-lg shadow-md ring-2 ring-indigo-400 hover:bg-indigo-50 hover:ring-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all">
        <span className="block truncate">
            {selectedMood ? selectedMood.name : "Choose your own adventure"}
        </span>
            <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <ChevronUpDownIcon className="h-5 w-5 text-indigo-500" aria-hidden="true" />
            </span>
          </Listbox.Button>
          <Listbox.Options className="absolute mt-2 max-h-60 w-full overflow-auto rounded-xl bg-white py-1 text-lg shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
            {moods.map((mood, index) => (
              <Listbox.Option
                key={index}
                value={mood}
                className={({ active }) =>
                  `relative cursor-pointer select-none px-4 py-2 transition-all duration-150 rounded-lg ${
                    active ? "bg-indigo-100 text-indigo-800" : "text-gray-900"

                  }`
                }
              >
                {({ selected }) => (
                  <>
                    <span className={`block truncate ${selected ? "font-semibold" : ""}`}>
                      {mood.name}
                    </span>
                    {selected && (
                      <span className="absolute inset-y-0 right-4 flex items-center text-indigo-600">
                        <CheckIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </>
                )}
              </Listbox.Option>
            ))}
          </Listbox.Options>
        </div>
      </Listbox>
    </div>
  );
}
