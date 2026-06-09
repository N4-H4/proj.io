import React, { useMemo } from 'react';
import '../../styles/dashboard.css';

export function ConsistencyTracker() {
  const days = 90;
  
  // Generate random data for 90 days. 0 to 4.
  const activityData = useMemo(() => {
    const data = [];
    for (let i = 0; i < days; i++) {
      const rand = Math.random();
      let level = 0;
      if (rand > 0.4) level = 1;
      if (rand > 0.7) level = 2;
      if (rand > 0.85) level = 3;
      if (rand > 0.95) level = 4;
      data.push({ id: i, level });
    }
    return data;
  }, [days]);

  return (
    <div className="nb-card nb-consistency-tracker" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Consistency Tracker</h2>
      <div className="nb-heatmap-container">
        <div className="nb-heatmap-grid">
          {activityData.map(day => (
            <div key={day.id} className={`nb-heatmap-cell activity-level-${day.level}`} />
          ))}
        </div>
        <div className="nb-heatmap-legend">
          <span>Less</span>
          <div className="nb-heatmap-cell activity-level-0" />
          <div className="nb-heatmap-cell activity-level-1" />
          <div className="nb-heatmap-cell activity-level-2" />
          <div className="nb-heatmap-cell activity-level-3" />
          <div className="nb-heatmap-cell activity-level-4" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
