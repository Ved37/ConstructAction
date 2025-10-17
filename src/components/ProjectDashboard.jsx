import ProjectCard from "./ProjectCard";

function ProjectDashboard() {
  const projects = [
    {
      name: "Downtown Office Complex",
      phase: "Phase 2",
      status: "On Track",
      dataSources: "3/4",
      statusColor: "green",
    },
    {
      name: "Riverside Mall Renovation",
      phase: "Phase 1",
      status: "In Progress",
      dataSources: "2/3",
      statusColor: "blue",
    },
    // Add more projects as needed
  ];

  return (
    <div className="p-6 flex-1 overflow-y-auto">
      <div className="grid grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))}
      </div>
    </div>
  );
}

export default ProjectDashboard;
