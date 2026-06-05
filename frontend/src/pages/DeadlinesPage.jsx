export default function DeadlinesPage() {
  return (
    <div>
      <div className="page-header">
        <h1>📅 Deadlines</h1>
      </div>

      <div className="empty-state">
        <div className="empty-state-icon">⏰</div>
        <h3>No upcoming deadlines</h3>
        <p>Add deadlines to your projects and tasks to see them here.</p>
      </div>
    </div>
  );
}
