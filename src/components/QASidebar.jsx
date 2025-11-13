import React, { useEffect, useState } from "react";

const RECENT_KEY = "qa_recent_questions";
const EXAMPLES = [
  "Where is the footing detail?",
  "Summarize the rebar schedule for the podium.",
  "List all RFIs related to waterproofing.",
  "What are the fire-stopping requirements?",
];

export default function QASidebar({ onAsk }) {
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENT_KEY);
      setRecent(raw ? JSON.parse(raw) : []);
    } catch {
      setRecent([]);
    }
  }, []);

  const addRecent = (q) => {
    const next = [q, ...recent.filter((r) => r !== q)].slice(0, 10);
    setRecent(next);
    try {
      localStorage.setItem(RECENT_KEY, JSON.stringify(next));
    } catch {
      // ignore storage errors in private mode
      void 0;
    }
  };

  const handleClick = (q) => {
    addRecent(q);
    onAsk?.(q);
  };

  return (
    <aside className="w-72 border-r bg-white flex flex-col">
      <div className="p-4 border-b">
        <h2 className="text-sm font-semibold text-gray-700">Examples</h2>
        <div className="mt-2 space-y-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => handleClick(ex)}
              className="text-left text-sm w-full px-3 py-2 rounded-md bg-gray-50 hover:bg-gray-100 border"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4">
        <h2 className="text-sm font-semibold text-gray-700">Recent</h2>
        <div className="mt-2 space-y-1">
          {recent.length === 0 && (
            <div className="text-xs text-gray-500">No recent questions</div>
          )}
          {recent.map((q) => (
            <button
              key={q}
              onClick={() => handleClick(q)}
              className="block text-left text-sm w-full px-2 py-1 rounded hover:bg-gray-100"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </aside>
  );
}
