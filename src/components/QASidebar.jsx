import React, { useEffect, useState } from "react";

const EXAMPLES = [
  "Where is the footing detail?",
  "Summarize fire protection requirements for the lobby",
  "What sheets mention elevator pit waterproofing?",
  "List all references to mechanical room dimensions",
];

const RECENTS_KEY = "qa_recent_questions";

function loadRecents() {
  try {
    const raw = localStorage.getItem(RECENTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function QASidebar() {
  const [recents, setRecents] = useState([]);

  useEffect(() => {
    setRecents(loadRecents());
    const onUpdated = (e) => {
      const list = Array.isArray(e?.detail) ? e.detail : loadRecents();
      setRecents(list);
    };
    window.addEventListener("qa-recent-updated", onUpdated);
    return () => window.removeEventListener("qa-recent-updated", onUpdated);
  }, []);

  const sendExample = (text) => {
    try {
      const ev = new CustomEvent("qa-insert-text", { detail: text });
      window.dispatchEvent(ev);
    } catch {
      // noop
    }
  };
  const clearRecents = () => {
    try {
      localStorage.removeItem(RECENTS_KEY);
      const ev = new CustomEvent("qa-recent-updated", { detail: [] });
      window.dispatchEvent(ev);
      setRecents([]);
    } catch {
      setRecents([]);
    }
  };

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-full flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-sm font-semibold text-gray-800">Quick prompts</h2>
        <p className="text-xs text-gray-500 mt-1">Click to insert.</p>
      </div>
      <div className="p-3 space-y-2 overflow-y-auto">
        {EXAMPLES.map((ex, idx) => (
          <button
            key={`ex-${idx}`}
            onClick={() => sendExample(ex)}
            className="w-full text-left text-sm px-3 py-2 rounded-md border border-gray-200 hover:bg-gray-50 cursor-pointer"
          >
            {ex}
          </button>
        ))}

        <div className="pt-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-800">Recent</h3>
            {recents.length > 0 && (
              <button
                onClick={clearRecents}
                className="text-xs text-blue-600 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
          {recents.length === 0 ? (
            <p className="text-xs text-gray-500">No recent questions.</p>
          ) : (
            <div className="space-y-2">
              {recents.map((q, idx) => (
                <button
                  key={`r-${idx}`}
                  onClick={() => sendExample(q)}
                  className="block w-full text-left text-xs px-3 py-2 rounded-md bg-gray-50 border border-gray-200 hover:bg-gray-100 cursor-pointer"
                  title={q}
                >
                  <span className="line-clamp-2">{q}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
      <div className="mt-auto p-4 border-t border-gray-200 text-xs text-gray-600">
        Tips:
        <ul className="list-disc pl-5 mt-1 space-y-1">
          <li>Be specific about sheet names or details.</li>
          <li>Add keywords like "detail", "section", "schedule".</li>
          <li>Use follow-ups to refine results.</li>
        </ul>
      </div>
    </aside>
  );
}
