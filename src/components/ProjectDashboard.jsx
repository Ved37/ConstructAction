// components/ProjectDashboard.jsx
import { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import ProjectFormModal from "./ProjectFormModal";
import { apiFetch } from "../lib/api";

function ProjectDashboard() {
  const [showModal, setShowModal] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadProjects = async () => {
    setError("");
    try {
      setLoading(true);
      const data = await apiFetch(`/api/projects/?limit=50&offset=0`);
      setProjects(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e?.data?.detail || e?.message || "Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return (
    <div className="p-6 flex-1 overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Project
        </button>
      </div>
      {error && (
        <div className="mb-4 p-3 rounded bg-red-100 text-red-700 text-sm">
          {error}
        </div>
      )}
      {loading ? (
        <div>Loading projects...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <ProjectCard key={project.project_id ?? index} project={project} />
          ))}
          {projects.length === 0 && (
            <div className="text-gray-600">
              No projects yet. Create your first project.
            </div>
          )}
        </div>
      )}
      {showModal && (
        <ProjectFormModal
          onClose={() => setShowModal(false)}
          onCreated={(p) => {
            setShowModal(false);
            setProjects((prev) => [p, ...prev]);
          }}
        />
      )}
    </div>
  );
}

export default ProjectDashboard;
