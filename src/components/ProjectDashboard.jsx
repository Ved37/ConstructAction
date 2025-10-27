// components/ProjectDashboard.jsx
import { useState } from "react";
import ProjectCard from "./ProjectCard";
import ProjectFormModal from "./ProjectFormModal";

function ProjectDashboard() {
  const [showModal, setShowModal] = useState(false);

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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Projects</h2>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + New Project
        </button>
      </div>
      <div className="grid grid-cols-2 gap-6">
        {projects.map((project, index) => (
          <ProjectCard key={project.project_id ?? index} project={project} />
        ))}
      </div>
            {showModal && <ProjectFormModal onClose={() => setShowModal(false)} />}

    </div>
  );
}

export default ProjectDashboard;
