// components/ProjectDetail.jsx
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

function ProjectDetail() {
  const location = useLocation();
  const params = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(location.state?.project || null);
  const [loading, setLoading] = useState(!project);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If we already have the project (via Link state), skip fetch
    if (project) return;

    // Otherwise, fetch the project by id (deep-link)
    const id = params.id;
    if (!id) return;

    async function fetchProject() {
      try {
        setLoading(true);
        // Example fetch — replace with your real API endpoint
        // const res = await fetch(`/api/projects/${id}`);
        // if (!res.ok) throw new Error("Failed to fetch project");
        // const data = await res.json();
        // setProject(data);

        // Mock fallback (if no backend available)
        // You can remove the below block and uncomment the fetch above when API exists
        const mock = {
          project_id: id,
          name: "Loaded Project " + id,
          description: "Loaded from server for id " + id,
          budget: "$X",
          status: "On Track",
          dataSources: "3/4",
          owner: "Remote Owner",
          client_name: "Remote Client",
          project_code: `CODE-${id}`,
          start_date: "2024-01-01",
          end_date: "2024-12-31",
          location: "Unknown",
        };
        // simulate network
        await new Promise((r) => setTimeout(r, 400));
        setProject(mock);
      } catch (err) {
        setError(err.message || "Error loading project");
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [params.id, project]);

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
            <p className="text-sm text-gray-500">{project.project_code} • {project.client_name}</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-medium">{project.budget}</div>
            <div className="text-sm text-gray-600">{project.status}</div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <div className="font-medium">Owner</div>
            <div>{project.owner}</div>
          </div>
          <div>
            <div className="font-medium">Location</div>
            <div>{project.location}</div>
          </div>
          <div>
            <div className="font-medium">Start Date</div>
            <div>{project.start_date}</div>
          </div>
          <div>
            <div className="font-medium">End Date</div>
            <div>{project.end_date}</div>
          </div>
          <div className="col-span-2">
            <div className="font-medium">Description</div>
            <div className="mt-1 text-gray-600">{project.description}</div>
          </div>
        </div>

        {/* Add more cards/sections for data sources, timeline, attachments etc. */}
      </div>
    </div>
  );
}

export default ProjectDetail;
