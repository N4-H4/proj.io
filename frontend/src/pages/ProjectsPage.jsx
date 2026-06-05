export default function ProjectsPage() {
  return (
    <div>
      <div className="page-header">
        <h1>📁 Projects</h1>
        <button className="btn btn-primary">+ New Project</button>
      </div>

      <div className="empty-state">
        <div className="empty-state-icon">📋</div>
        <h3>No projects yet</h3>
        <p>Start by creating your first project. Every great idea begins here!</p>
      </div>
    </div>
  );
}
