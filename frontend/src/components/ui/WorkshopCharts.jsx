import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../../styles/dashboard.css';

const PROJECT_DATA = [
  { name: 'Active', value: 35, color: 'var(--accent-primary)' },
  { name: 'Completed', value: 30, color: 'var(--accent-success)' },
  { name: 'Planning', value: 15, color: 'var(--accent-yellow-muted)' },
  { name: 'On Hold', value: 10, color: 'var(--accent-warn-orange)' },
  { name: 'Archived', value: 10, color: 'var(--soft-charcoal)' }
];

const TASK_DATA = [
  { name: 'To Do', value: 20, color: 'var(--status-todo)' },
  { name: 'In Progress', value: 25, color: 'var(--info)' },
  { name: 'Review', value: 15, color: 'var(--warning)' },
  { name: 'Blocked', value: 10, color: 'var(--danger)' },
  { name: 'Done', value: 30, color: 'var(--status-done)' }
];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="nb-tooltip">
        <p style={{ margin: 0, fontFamily: 'var(--font-body)', fontSize: '0.85rem' }}>
          <strong>{payload[0].name}</strong>: {payload[0].value}%
        </p>
      </div>
    );
  }
  return null;
};

// Custom label to put percentage outside with line
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 20; // push outside
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="var(--text-secondary)" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      fontSize="12px"
      fontFamily="var(--font-body)"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const renderLegend = (props) => {
  const { payload } = props;
  return (
    <ul style={{ 
      listStyle: 'none', 
      padding: 0, 
      display: 'flex', 
      flexWrap: 'wrap', 
      justifyContent: 'center', 
      gap: '12px',
      margin: '10px 0 0 0'
    }}>
      {payload.map((entry, index) => (
        <li key={`item-${index}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', fontFamily: 'var(--font-body)', color: 'var(--text-secondary)' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: entry.color }} />
          <span>{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

export function WorkshopCharts() {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', width: '100%' }}>
      {/* Card A: Projects (Pie) */}
      <div className="nb-card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>Projects</h2>
        <div style={{ flex: 1, width: '100%', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={PROJECT_DATA}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
                labelLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                label={renderCustomizedLabel}
              >
                {PROJECT_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Card B: Tasks (Donut) */}
      <div className="nb-card" style={{ flex: '1 1 300px', display: 'flex', flexDirection: 'column', minHeight: '340px' }}>
        <div className="nb-tape"></div>
        <h2 style={{ fontSize: '1.1rem', margin: '0 0 1rem 0' }}>Tasks</h2>
        <div style={{ flex: 1, width: '100%', position: 'relative' }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <Pie
                data={TASK_DATA}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                stroke="none"
                labelLine={{ stroke: 'var(--border)', strokeWidth: 1 }}
                label={renderCustomizedLabel}
              >
                {TASK_DATA.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend content={renderLegend} verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
