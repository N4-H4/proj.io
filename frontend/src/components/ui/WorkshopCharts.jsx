import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import '../../styles/dashboard.css';

const PROJECT_DATA = [
  { name: 'Active', value: 4, color: 'var(--accent-primary)' },
  { name: 'Completed', value: 5, color: 'var(--success)' },
  { name: 'Archived', value: 1, color: 'var(--text-tertiary)' }
];

const TASK_DATA = [
  { name: 'To Do', value: 8, color: 'var(--status-todo)' },
  { name: 'In Progress', value: 11, color: 'var(--info)' },
  { name: 'Done', value: 13, color: 'var(--status-done)' }
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="nb-tooltip">
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
          <strong>{payload[0].name}</strong>: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export function WorkshopCharts() {
  return (
    <div className="nb-card nb-workshop-stats" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
      {/* Chart 1: Projects Distribution */}
      <div className="nb-chart-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <span className="nb-stats-title" style={{ fontFamily: 'var(--font-body)', marginBottom: '0.5rem', fontWeight: 600 }}>Projects Distribution</span>
        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={PROJECT_DATA}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {PROJECT_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {PROJECT_DATA.map(entry => (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: entry.color }} />
              <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Chart 2: Tasks Distribution */}
      <div className="nb-chart-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', borderLeft: '1px dashed var(--border)', paddingLeft: '2rem' }}>
        <span className="nb-stats-title" style={{ fontFamily: 'var(--font-body)', marginBottom: '0.5rem', fontWeight: 600 }}>Tasks Distribution</span>
        <div style={{ width: '100%', height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={TASK_DATA}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
                stroke="none"
              >
                {TASK_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          {TASK_DATA.map(entry => (
            <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontFamily: 'var(--font-body)' }}>
              <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: entry.color }} />
              <span style={{ color: 'var(--text-secondary)' }}>{entry.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
