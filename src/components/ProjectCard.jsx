function ProjectCard({ project }) {
  const statusClasses = {
    active: "bg-green-100 text-green-800",
    completed: "bg-gray-200 text-gray-800",
    on_hold: "bg-yellow-100 text-yellow-800",
    cancelled: "bg-red-100 text-red-700",
  };
  const badgeClass =
    statusClasses[project.status] || "bg-gray-100 text-gray-800";
  const updated = project.updated_at
    ? new Date(project.updated_at).toLocaleDateString()
    : null;

  return (
    <div className="card p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start gap-3">
        <h3 className="font-semibold text-lg text-gray-900 truncate">
          {project.name}
        </h3>
        {project.status && (
          <span className={`badge ${badgeClass}`}>{project.status}</span>
        )}
      </div>
      {project.description && (
        <p className="text-sm text-gray-600 mt-2 line-clamp-2">
          {project.description}
        </p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-gray-600">
        <div>
          <div className="text-gray-500">Client</div>
          <div className="font-medium">{project.client_name || "—"}</div>
        </div>
        <div>
          <div className="text-gray-500">Location</div>
          <div className="font-medium">{project.location || "—"}</div>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
        <div>
          {project.start_date || project.end_date ? (
            <span>
              {project.start_date || "—"} → {project.end_date || "—"}
            </span>
          ) : (
            <span>&nbsp;</span>
          )}
        </div>
        {updated && <div>Updated {updated}</div>}
      </div>
    </div>
  );
}

export default ProjectCard;
