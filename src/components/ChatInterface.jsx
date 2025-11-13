import React, { useCallback, useRef, useState } from "react";
import QASidebar from "./QASidebar";
import { ask, buildSourceUrl } from "../lib/qa";

function mdToElements(text) {
  // Minimal markdown handling: headers, bold, italics, code blocks
  const lines = String(text || "").split(/\n/);
  return (
    <div className="prose prose-sm max-w-none">
      {lines.map((line, idx) => {
        if (line.startsWith("### ")) return <h3 key={idx}>{line.slice(4)}</h3>;
        if (line.startsWith("## ")) return <h2 key={idx}>{line.slice(3)}</h2>;
        if (line.startsWith("# ")) return <h1 key={idx}>{line.slice(2)}</h1>;
        // inline bold/italics
        const parts = [];
        let rest = line;
        while (rest.length) {
          const mBold = rest.match(/\*\*(.+?)\*\*/);
          const mIt = rest.match(/\*(.+?)\*/);
          const m = mBold && (!mIt || mBold.index < mIt.index) ? mBold : mIt;
          if (!m) {
            parts.push(rest);
            break;
          }
          const i = m.index;
          if (i > 0) parts.push(rest.slice(0, i));
          parts.push(
            m === mBold ? (
              <strong key={parts.length}>{m[1]}</strong>
            ) : (
              <em key={parts.length}>{m[1]}</em>
            )
          );
          rest = rest.slice(i + m[0].length);
        }
        return (
          <p key={idx}>
            {parts.map((p, i) => (
              <React.Fragment key={i}>{p}</React.Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}

export default function ChatInterface() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I'm your construction project copilot. Ask me anything about your project documents.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const scrollerRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    const el = scrollerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, []);

  const send = useCallback(
    async (q) => {
      const question = (q ?? input).trim();
      if (!question) return;
      setInput("");
      setMessages((m) => [...m, { role: "user", content: question }]);
      setLoading(true);
      try {
        const res = await ask({ question });
        setMessages((m) => [
          ...m,
          {
            role: "assistant",
            content: res?.answer || "(no answer)",
            sources: res?.sources || [],
          },
        ]);
      } catch (e) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: `Error: ${e?.message || e}` },
        ]);
      } finally {
        setLoading(false);
        setTimeout(scrollToBottom, 50);
      }
    },
    [input, scrollToBottom]
  );

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex h-full w-full overflow-hidden">
      <QASidebar onAsk={send} />
      <div className="flex-1 flex flex-col bg-gray-50">
        <div
          ref={scrollerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 pb-24"
        >
          {messages.map((m, idx) => (
            <div key={idx} className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                  m.role === "assistant" ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                {m.role === "assistant" ? "AI" : "You"}
              </div>
              <div className="bg-white p-4 rounded-lg shadow max-w-2xl w-full">
                {mdToElements(m.content)}
                {m.sources?.length ? (
                  <div className="mt-3 border-t pt-2">
                    <div className="text-xs font-semibold text-gray-500 mb-1">
                      Sources
                    </div>
                    <ul className="space-y-1 list-disc pl-5">
                      {m.sources.map((s, i) => (
                        <li key={i} className="text-xs text-gray-600">
                          <a
                            className="text-blue-600 hover:underline"
                            href={buildSourceUrl(s.path)}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {s.path} {s.page ? `(p.${s.page})` : ""}
                          </a>
                          {s.snippet ? (
                            <div className="text-gray-500 italic">
                              {s.snippet}
                            </div>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
          {loading && <div className="text-sm text-gray-500">Thinking…</div>}
        </div>

        <div className="p-4 border-t bg-white">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about your project..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => send()}
              disabled={loading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 disabled:opacity-50"
            >
              Ask
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
