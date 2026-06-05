export default function TasksPage() {
  return (
    <div>
      <div className="page-header">
        <h1>✅ Tasks</h1>
      </div>

      <div className="empty-state">
        <div className="empty-state-icon">📝</div>
        <h3>No tasks yet</h3>
        <p>Tasks will appear here once you create them inside your projects.</p>
      </div>
    </div>
  );
}
