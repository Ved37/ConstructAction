// components/ProjectDashboard.jsx
import ProjectCard from "./ProjectCard";

function ProjectDashboard() {
  const projects = [
    {
      project_id: 1,
      name: "Downtown Office Complex",
      budget: "$2,000,000",
      status: "On Track",
      dataSources: "3/4",
      owner: "Alice Johnson",
      description: "Office complex with 10 floors. Major milestones: foundation complete.",
      client_name: "Acme Corp",
      project_code: "DT-001",
      start_date: "2024-01-05",
      end_date: "2025-06-30",
      location: "Downtown",
    },
    {
      project_id: 2,
      name: "Riverside Mall Renovation",
      budget: "$1,200,000",
      status: "In Progress",
      dataSources: "2/3",
      owner: "Bob Smith",
      description: "Renovation of existing mall, includes HVAC upgrades.",
      client_name: "Riverside Holdings",
      project_code: "RV-002",
      start_date: "2024-04-10",
      end_date: "2024-12-15",
      location: "Riverside",
    },
    // Add more projects...
  ];

  return (
    <div className="p-6 flex-1 overflow-y-auto">
      <div className="grid grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.project_id ?? index} project={project} />
        ))}
      </div>
    </div>
  );
}

export default ProjectDashboard;
