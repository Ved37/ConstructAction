import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  listProjectDocuments,
  uploadProjectFiles,
  createChatSession,
  getProject,
} from "../lib/projects";
import { useAuth } from "../context/AuthContext";

export default function ProjectPage() {
  const { projectId } = useParams();
  const { user, logout } = useAuth();
  const [project, setProject] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const navigate = useNavigate();

  const loadDocs = async () => {
    setError("");
    setLoading(true);
    try {
      const data = await listProjectDocuments(projectId);
      setDocuments(data.documents || []);
    } catch (err) {
      if (err.status === 401) {
        await logout();
        navigate("/login", { replace: true });
        return;
      }
      setError(err.message || "Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadProject = async () => {
      setLoadingProject(true);
      setError("");
      try {
        const data = await getProject(projectId);
        setProject(data);
      } catch (err) {
        if (err.status === 401) {
          await logout();
          navigate("/login", { replace: true });
          return;
        }
        setError(err.message || "Failed to load project");
      } finally {
        setLoadingProject(false);
      }
    };

    if (user) {
      loadProject();
      loadDocs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, projectId]);

  const onUpload = async (e) => {
    const files = e?.target?.files || fileRef.current?.files;
    if (!files || files.length === 0) return;
    const fd = new FormData();
    for (const f of files) fd.append("files", f);
    setUploading(true);
    setError("");
    try {
      const res = await uploadProjectFiles(projectId, fd);
      // backend returns uploaded array
      await loadDocs();
      return res;
    } catch (err) {
      setError(err.message || "Upload failed");
      if (err.status === 401) {
        await logout();
        navigate("/login", { replace: true });
      }
    } finally {
      setUploading(false);
    }
  };

  const onCreateSession = async () => {
    setError("");
    try {
      const title = `Project Chat ${new Date().toLocaleString()}`;
      const res = await createChatSession({
        title,
        project_id: Number(projectId),
      });
      if (res?.session_id) {
        // navigate to chat route and pass session id via state
        navigate("/chat", { state: { sessionId: res.session_id } });
      }
    } catch (err) {
      setError(err.message || "Failed to create session");
    }
  };

  return (
    <div className="p-6 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-semibold">
            {loadingProject
              ? "Loading…"
              : project?.name || `Project ${projectId}`}
          </h2>
          {project && (
            <div className="text-xs text-gray-600 mt-1">
              <span className="badge">{project.status || "unknown"}</span>
              {project.location && (
                <span className="ml-2">• {project.location}</span>
              )}
              {project.project_code && (
                <span className="ml-2">• {project.project_code}</span>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="px-4 py-2 bg-white border rounded cursor-pointer">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="application/pdf"
              onChange={onUpload}
              className="hidden"
            />
            {uploading ? "Uploading…" : "Upload PDFs"}
          </label>
          <button onClick={onCreateSession} className="btn-brand">
            New Chat Session
          </button>
        </div>
      </div>
      {project && (
        <div className="card p-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Client</div>
            <div className="font-medium">{project.client_name || "—"}</div>
          </div>
          <div>
            <div className="text-gray-500">Budget</div>
            <div className="font-medium">
              {project.budget ? `$${project.budget.toLocaleString()}` : "—"}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Dates</div>
            <div className="font-medium">
              {project.start_date || "—"} → {project.end_date || "—"}
            </div>
          </div>
        </div>
      )}
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {loading ? (
        <div className="text-gray-500">Loading documents…</div>
      ) : documents.length === 0 ? (
        <div className="text-gray-600">No documents uploaded yet.</div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {documents.map((d) => (
            <div key={d.doc_id} className="bg-white p-4 rounded shadow">
              <div className="font-medium">{d.file_name}</div>
              <div className="text-sm text-gray-600">{d.file_type}</div>
              <div className="text-xs text-gray-500 mt-2">
                Uploaded: {d.uploaded_at}
              </div>
              {d.url && (
                <a
                  href={d.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 underline text-sm mt-2 block"
                >
                  View PDF
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
