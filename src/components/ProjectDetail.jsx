/* eslint-disable no-unused-vars */
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
  const id = params.projectId;
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
  }, [params.projectId, project]);

  useEffect(() => {
  const id = project?.project_id || params.projectId;
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
  }, [project, params.projectId]);

  useEffect(() => {
  const id = project?.project_id || params.projectId;
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
  }, [project, params.projectId]);

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
      </div>
    </div>
  );
}

export default ProjectDetail;
