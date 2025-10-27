import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createSession, listSessions } from "../lib/chat";

function Sidebar({ selectedSessionId, onSelectSession }) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { logout } = useAuth();

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await listSessions();
      setSessions(data.sessions || []);
    } catch (err) {
      if (err.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(err.message || "Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onNewChat = async () => {
    setError("");
    setLoading(true);
    try {
      const title = `Project Q&A ${new Date().toLocaleString()}`;
      const res = await createSession({ title });
      await load();
      onSelectSession?.(res.session_id);
    } catch (err) {
      if (err.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(err.message || "Failed to create session");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-80 bg-gray-100 border-r border-gray-200 flex flex-col h-full min-h-0">
      <div className="p-4 border-b border-gray-200 space-y-2">
        <button
          onClick={onNewChat}
          disabled={loading}
          className="w-full py-2 bg-white px-4 border font-medium border-gray-300 text-gray-900 rounded-lg flex items-center justify-center cursor-pointer transition-colors duration-500 hover:bg-gray-100 disabled:opacity-60"
        >
          <span>+ New Chat</span>
        </button>
        {error && (
          <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {loading && sessions.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">Loading sessions…</div>
        ) : sessions.length === 0 ? (
          <div className="p-4 text-sm text-gray-500">No sessions yet</div>
        ) : (
          sessions.map((s) => {
            const isActive = s.session_id === selectedSessionId;
            return (
              <button
                key={s.session_id}
                onClick={() => onSelectSession?.(s.session_id)}
                className={`w-full text-left p-4 border border-gray-200 rounded-sm my-3 mx-2 bg-white hover:bg-gray-50 cursor-pointer ${
                  isActive ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-medium text-gray-900 truncate">
                    {s.title}
                  </h3>
                  <span className="text-xs text-gray-500 ml-2 shrink-0">
                    {s.last_message_at
                      ? new Date(s.last_message_at).toLocaleString()
                      : ""}
                  </span>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {s.message_count} messages • {s.session_type}
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Sidebar;
