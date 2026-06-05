export default function DashboardPage() {
  return (
    <div>
      <div className="page-header">
        <h1>📊 Dashboard</h1>
      </div>

      <div className="dashboard-grid">
        {['Total Projects', 'Active', 'Completed', 'Pending Tasks'].map((label) => (
          <div key={label} className="card stat-card">
            <div className="stat-value">—</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="empty-state">
        <div className="empty-state-icon">📓</div>
        <h3>Your notebook is empty</h3>
        <p>Create your first project to get started!</p>
      </div>
    </div>
  );
}
