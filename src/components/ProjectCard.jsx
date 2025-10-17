function ProjectCard({ project }) {
  const getStatusColor = (status) => {
    const colors = {
      "On Track": "bg-green-100 text-green-800",
      "In Progress": "bg-blue-100 text-blue-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-lg">{project.name}</h3>
        <span
          className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
            project.status
          )}`}
        >
          {project.status}
        </span>
      </div>
      <div className="mt-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>{project.phase}</span>
          <span>Data Sources: {project.dataSources}</span>
        </div>
      </div>
    </div>
  );
}

export default ProjectCard;
