import React, { useEffect, useMemo, useRef, useState } from "react";
import { Send, MessageCircle, Menu } from "lucide-react";
import { ask, buildSourceUrl } from "../lib/qa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";

function CitationList({ sources }) {
  if (!sources || sources.length === 0) return null;
  return (
    <div className="mt-3">
      <div className="text-xs font-semibold text-gray-700 mb-2">Sources</div>
      <div className="grid gap-2">
        {sources.map((s, idx) => (
          <div key={idx} className="card p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <span className="badge badge-pdf">PDF</span>
                <a
                  href={s.dropbox_link || undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline"
                  title={s.pdf_name}
                >
                  {s.pdf_name}
                </a>
                <span className="text-gray-500">• p. {s.page}</span>
              </div>
              <button
                onClick={() => navigator.clipboard?.writeText(s.snippet || "")}
                className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-50"
                title="Copy snippet"
              >
                Copy
              </button>
            </div>
            {s.snippet && (
              <p className="text-xs text-gray-700 mt-2 line-clamp-4 whitespace-pre-wrap">
                {s.snippet}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChatInterface({ onToggleSidebar }) {
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const scrollRef = useRef(null);

  // Listen for sidebar example prompt insertions
  useEffect(() => {
    const handler = (e) => {
      const text = e?.detail;
      if (typeof text === "string") setInput(text);
    };
    window.addEventListener("qa-insert-text", handler);
    return () => window.removeEventListener("qa-insert-text", handler);
  }, []);

  // Auto-scroll to bottom on updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, loading]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setError("");
    setLoading(true);
    const tempUser = {
      chat_id: `temp-user-${Date.now()}`,
      query: text,
      response: "",
      sources_cited: [],
      created_at: new Date().toISOString(),
      optimistic: true,
    };
    setHistory((h) => [...h, tempUser]);
    setInput("");
    try {
      const ans = await ask({ question: text, top_k: 5 });
      // Update recent questions
      try {
        const key = "qa_recent_questions";
        const raw = localStorage.getItem(key);
        const arr = raw ? JSON.parse(raw) : [];
        const next = [text, ...arr.filter((q) => q !== text)].slice(0, 10);
        localStorage.setItem(key, JSON.stringify(next));
        const ev = new CustomEvent("qa-recent-updated", { detail: next });
        window.dispatchEvent(ev);
      } catch {
        // ignore localStorage issues
      }
      // Map retrieved list to existing UI shape
      const sources = Array.isArray(ans.retrieved)
        ? ans.retrieved.map((r, i) => ({
            doc_id: i,
            pdf_name: r.source?.split("/").pop() || r.source || "source",
            page: r.page_number,
            dropbox_link: buildSourceUrl(r.source),
            snippet: r.snippet,
            score: undefined,
          }))
        : [];
      const aiItem = {
        chat_id: `ans-${Date.now()}`,
        query: text,
        response: ans.answer || "",
        sources_cited: sources,
        created_at: new Date().toISOString(),
      };
      setHistory((h) => {
        const withoutTemp = h.filter((it) => it !== tempUser);
        return [...withoutTemp, { ...tempUser, optimistic: false }, aiItem];
      });
    } catch (err) {
      setError(err.message || "Failed to send message");
      setHistory((h) => h.filter((it) => it !== tempUser));
    } finally {
      setLoading(false);
    }
  };

  const pairs = useMemo(() => {
    return history.flatMap((item) => {
      const userMsg = {
        key: `${item.chat_id}-q`,
        role: "user",
        text: item.query,
        created_at: item.created_at,
      };
      const aiMsg = {
        key: `${item.chat_id}-a`,
        role: "assistant",
        markdown: item.response,
        sources: item.sources_cited,
        created_at: item.created_at,
      };
      return [userMsg, aiMsg];
    });
  }, [history]);

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b bg-white">
        <div className="flex items-center gap-2 text-sm text-gray-700">
          <button
            className="md:hidden inline-flex items-center justify-center p-2 rounded border border-gray-300"
            onClick={onToggleSidebar}
            title="Toggle sidebar"
          >
            <Menu size={16} />
          </button>
          <MessageCircle size={16} className="text-blue-600" />
          <span className="font-medium">Q&A</span>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
      >
        {!pairs.length && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              AI
            </div>
            <div className="bg-white p-4 rounded-lg shadow max-w-2xl">
              <p>
                Hello! I'm your construction project copilot. I can help you
                find information across all your project data sources. What
                would you like to know?
              </p>
            </div>
          </div>
        )}

        {pairs.map((msg) =>
          msg.role === "user" ? (
            <div
              key={msg.key}
              className="flex items-start space-x-3 justify-end"
            >
              <div className="bg-blue-600 text-white p-3 rounded-lg shadow max-w-2xl">
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-white">
                U
              </div>
            </div>
          ) : (
            <div key={msg.key} className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                AI
              </div>
              <div className="bg-white p-4 rounded-lg shadow max-w-2xl prose prose-sm">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeSanitize]}
                >
                  {msg.markdown || ""}
                </ReactMarkdown>
                <div className="mt-3">
                  <CitationList sources={msg.sources} />
                </div>
              </div>
            </div>
          )
        )}

        {error && (
          <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
              AI
            </div>
            <div className="card p-4 max-w-2xl w-full">
              <div className="space-y-2">
                <div className="skeleton h-4 w-3/4"></div>
                <div className="skeleton h-4 w-full"></div>
                <div className="skeleton h-4 w-5/6"></div>
              </div>
              <div className="mt-3 grid gap-2">
                <div className="skeleton h-16 w-full rounded"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white">
        <div className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about your project..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={send}
            disabled={loading || !input.trim()}
            className="btn-brand gap-1 flex items-center"
          >
            <Send size={16} />
            {loading ? "Sending…" : "Ask"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChatInterface;
