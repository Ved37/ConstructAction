// components/ProjectDetail.jsx
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";

function ProjectDetail() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(location.state?.project || null);
  const [loading, setLoading] = useState(!project);
  const [error, setError] = useState(null);
  const [docs, setDocs] = useState([]);
  const [docsLoading, setDocsLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [askText, setAskText] = useState("");
  const [asking, setAsking] = useState(false);
  const [askError, setAskError] = useState("");
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // If we already have the project (via Link state), skip fetch
    if (project) return;

    // Otherwise, fetch the project by id (deep-link)
    const id = params.id;
    if (!id) return;

    async function fetchProject() {
      try {
        setLoading(true);
        const data = await apiFetch(`/api/projects/${id}`);
        setProject(data);
      } catch (err) {
        setError(err.message || "Error loading project");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [params.id, project]);

  useEffect(() => {
    const id = project?.project_id || params.id;
    if (!id) return;
    async function fetchDocs() {
      try {
        setDocsLoading(true);
        const data = await apiFetch(
          `/api/projects/${id}/documents?limit=50&offset=0`
        );
        setDocs(Array.isArray(data) ? data : []);
      } catch (e) {
        // Keep documents section optional on error
        console.error("Failed to load documents", e);
      } finally {
        setDocsLoading(false);
      }
    }
    fetchDocs();
  }, [project, params.id]);

  useEffect(() => {
    const id = project?.project_id || params.id;
    if (!id) return;
    async function fetchStats() {
      try {
        setStatsLoading(true);
        const data = await apiFetch(`/api/projects/${id}/stats`);
        setStats(data);
      } catch (e) {
        console.error("Failed to load stats", e);
      } finally {
        setStatsLoading(false);
      }
    }
    fetchStats();
  }, [project, params.id]);

  const handleUpload = async (e) => {
    if (!project) return;
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    try {
      setUploading(true);
      const form = new FormData();
      form.append("file", file);
      await apiFetch(`/api/projects/${project.project_id}/upload`, {
        method: "POST",
        body: form,
      });
      // Refresh documents after successful upload
      const refreshed = await apiFetch(
        `/api/projects/${project.project_id}/documents?limit=50&offset=0`
      );
      setDocs(Array.isArray(refreshed) ? refreshed : []);
    } catch (e2) {
      setUploadError(e2?.data?.detail || e2?.message || "Upload failed");
    } finally {
      setUploading(false);
      // reset the input so same file can be reselected
      e.target.value = "";
    }
  };

  const handleAsk = async (e) => {
    e.preventDefault();
    if (!project || !askText.trim()) return;
    setAskError("");
    const q = askText.trim();
    setMessages((prev) => [
      ...prev,
      { role: "user", content: q, ts: Date.now() },
    ]);
    setAskText("");
    try {
      setAsking(true);
      const form = new URLSearchParams();
      form.set("question", q);
      if (chatId != null) form.set("chat_id", String(chatId));
      const res = await apiFetch(`/api/projects/${project.project_id}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: form,
      });
      const newChatId = res?.chat_id ?? chatId;
      if (newChatId != null && newChatId !== chatId) setChatId(newChatId);
      const answer =
        res?.answer ||
        res?.response ||
        res?.message ||
        res?.result ||
        JSON.stringify(res);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: answer, ts: Date.now() },
      ]);
    } catch (e2) {
      setAskError(e2?.data?.detail || e2?.message || "Failed to get answer");
    } finally {
      setAsking(false);
    }
  };

  if (loading) return <div className="p-6">Loading project...</div>;
  if (error) return <div className="p-6 text-red-600">{error}</div>;
  if (!project) return <div className="p-6">Project not found</div>;

  return (
    <div className="p-6 flex-1 overflow-y-auto">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-2 rounded-md border hover:bg-gray-50"
      >
        ← Back
      </button>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{project.name}</h2>
            <p className="text-sm text-gray-500">
              {project.project_type || "Project"} • Created{" "}
              {project.created_at
                ? new Date(project.created_at).toLocaleString()
                : ""}
            </p>
          </div>
          <div className="text-right text-sm text-gray-600">
            Updated{" "}
            {project.updated_at
              ? new Date(project.updated_at).toLocaleString()
              : ""}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <div className="font-medium">Location</div>
            <div>{project.location || "—"}</div>
          </div>
          <div>
            <div className="font-medium">Type</div>
            <div>{project.project_type || "—"}</div>
          </div>
          <div className="col-span-2">
            <div className="font-medium">Description</div>
            <div className="mt-1 text-gray-600">
              {project.description || "—"}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Stats</h3>
          {statsLoading ? (
            <div>Loading stats...</div>
          ) : !stats ? (
            <div className="text-gray-600">No stats available.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              {Object.entries(stats).map(([k, v]) => (
                <div key={k} className="bg-gray-50 border rounded p-3">
                  <div className="text-gray-500 text-xs uppercase tracking-wide">
                    {k.replaceAll("_", " ")}
                  </div>
                  <div className="font-medium break-words">{String(v)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ask a question */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Ask about this project</h3>
          <form onSubmit={handleAsk} className="space-y-2">
            <textarea
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              rows={3}
              placeholder="e.g., Summarize the latest document updates"
              className="w-full border rounded-lg px-3 py-2"
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                disabled={asking || !askText.trim()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-60"
              >
                {asking ? "Asking..." : "Ask"}
              </button>
              {askError && (
                <span className="text-sm text-red-600">{askError}</span>
              )}
            </div>
          </form>
          {messages.length > 0 && (
            <div className="mt-4 space-y-3">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={
                    m.role === "user"
                      ? "text-gray-800"
                      : "bg-gray-50 border rounded p-3"
                  }
                >
                  <div className="text-xs text-gray-500 mb-1">
                    {m.role === "user" ? "You" : "Assistant"} •{" "}
                    {new Date(m.ts).toLocaleTimeString()}
                  </div>
                  <div className="whitespace-pre-wrap">{m.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">Documents</h3>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="file"
              accept="application/pdf"
              onChange={handleUpload}
              disabled={uploading}
            />
            {uploading && (
              <span className="text-sm text-gray-600">Uploading...</span>
            )}
          </div>
          {uploadError && (
            <div className="mb-3 p-3 rounded bg-red-100 text-red-700 text-sm">
              {uploadError}
            </div>
          )}
          {docsLoading ? (
            <div>Loading documents...</div>
          ) : docs.length === 0 ? (
            <div className="text-gray-600">No documents yet.</div>
          ) : (
            <ul className="divide-y">
              {docs.map((d) => (
                <li
                  key={d.document_id}
                  className="py-2 flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium">{d.file_name}</div>
                    <div className="text-xs text-gray-500">
                      {d.processing_status} •{" "}
                      {d.created_at
                        ? new Date(d.created_at).toLocaleString()
                        : ""}
                    </div>
                  </div>
                  {typeof d.file_size === "number" && (
                    <div className="text-xs text-gray-500">
                      {(d.file_size / 1024).toFixed(1)} KB
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProjectDetail;
