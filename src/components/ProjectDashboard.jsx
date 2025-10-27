import ProjectCard from "./ProjectCard";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { listProjects, createProject } from "../lib/projects";
import { Link, useNavigate } from "react-router-dom";

function ProjectDashboard() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setError("");
      setLoading(true);
      try {
        const data = await listProjects();
        if (!mounted) return;
        const list = Array.isArray(data) ? data : data?.projects || [];
        setProjects(list);
      } catch (err) {
        setError(err?.message || "Failed to load projects");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (user) load();
    return () => {
      mounted = false;
    };
  }, [user]);

  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  const onCreate = async () => {
    setCreating(true);
    try {
      const res = await createProject({ name: newName, description: newDesc });
      const id = res?.project_id || res?.project?.project_id;
      const updated = await listProjects();
      const list = Array.isArray(updated) ? updated : updated?.projects || [];
      setProjects(list);
      setNewName("");
      setNewDesc("");
      if (id) navigate(`/projects/${id}`);
    } catch (err) {
      setError(err.message || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">
                Welcome{user?.name ? `, ${user.name}` : ""}
              </h1>
              <p className="text-white/90 text-sm mt-1">
                Manage projects and documents, then ask questions in Chat.
              </p>
            </div>
            <button
              onClick={() =>
                document.getElementById("new-project-modal")?.showModal()
              }
              className="btn-brand"
            >
              + New Project
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-6">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="skeleton h-5 w-1/2"></div>
              <div className="skeleton h-4 w-1/3 mt-3"></div>
              <div className="skeleton h-4 w-2/3 mt-2"></div>
            </div>
            <div className="card p-6">
              <div className="skeleton h-5 w-1/2"></div>
              <div className="skeleton h-4 w-1/3 mt-3"></div>
              <div className="skeleton h-4 w-2/3 mt-2"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-red-600 bg-red-50 border border-red-100 rounded p-3">
            {error}
          </div>
        ) : projects.length === 0 ? (
          <div className="card p-8 text-center text-gray-700">
            <h3 className="font-medium text-lg">No projects yet</h3>
            <p className="text-sm text-gray-500 mt-1">
              Create your first project to get started.
            </p>
            <button
              onClick={() =>
                document.getElementById("new-project-modal")?.showModal()
              }
              className="btn-brand mt-4"
            >
              + New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <Link
                key={project.project_id}
                to={`/projects/${project.project_id}`}
              >
                <ProjectCard project={project} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* New project modal */}
      <dialog id="new-project-modal" className="modal">
        <div className="card p-6 w-[92vw] max-w-md">
          <h3 className="text-lg font-semibold">Create project</h3>
          <div className="mt-4 space-y-3">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                placeholder="Project name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                placeholder="Optional description"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                className="w-full border rounded px-3 py-2"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <button
              className="px-4 py-2 border border-gray-300 rounded"
              onClick={() =>
                document.getElementById("new-project-modal")?.close()
              }
            >
              Cancel
            </button>
            <button
              onClick={onCreate}
              disabled={!newName.trim() || creating}
              className="btn-brand"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </dialog>
    </div>
  );
}

export default ProjectDashboard;
