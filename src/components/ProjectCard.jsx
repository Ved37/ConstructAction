// components/ProjectCard.jsx
import { Link } from "react-router-dom";

function ProjectCard({ project }) {
  const id =
    project.project_id ??
    project.id ??
    project.projectCode ??
    project.project_code ??
    project.name;
  const subtitle = project.location || project.project_type || "";
  const rightTop = project.project_type || "Project";
  const created = project.created_at
    ? new Date(project.created_at).toLocaleDateString()
    : "";

  return (
    <Link to={`/projects/${id}`} state={{ project }} className="block">
      <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-lg">{project.name}</h3>
          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
            {rightTop}
          </span>
        </div>
        <div className="mt-2 text-sm text-gray-600">{subtitle}</div>
        <div className="mt-4 text-xs text-gray-500">Created {created}</div>
      </div>
    </Link>
  );
}

export default ProjectCard;
