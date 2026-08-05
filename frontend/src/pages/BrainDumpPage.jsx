export default function BrainDumpPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
        <button className="btn btn-primary">+ New Note</button>
      </div>

      <div className="empty-state">
        <div className="empty-state-icon">💭</div>
        <h3>Your mind is clear</h3>
        <p>Jot down ideas, plans, and random thoughts here. No structure needed!</p>
      </div>
    </div>
  );
}
