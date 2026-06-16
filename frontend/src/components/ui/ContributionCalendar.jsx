import React, { useMemo, useState } from 'react';
import '../../styles/dashboard.css';

// Constants
const TODAY = new Date(2026, 5, 13); // June 13, 2026
const START_DATE = new Date(2025, 5, 13); // June 13, 2025
const MONTH_NAMES = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

export function ContributionCalendar() {
  const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, translateX: '-50%', data: null });

  const { monthsData } = useMemo(() => {
    const dataMap = new Map();
    let state = 'QUIET'; 
    let daysInState = 0;
    let targetDays = 5; 
    let prevLevel = 0;

    let current = new Date(START_DATE);
    
    // 1. Build Activity Data Map for all days up to TODAY
    while (current <= TODAY) {
      const yyyy = current.getFullYear();
      const mm = String(current.getMonth() + 1).padStart(2, '0');
      const dd = String(current.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      
      let level = 0;
      let tasks = 0;
      const isMarch = current.getMonth() === 2;
      
      if (daysInState >= targetDays) {
        if (state === 'QUIET') {
          state = 'SPRINT';
          targetDays = Math.floor(Math.random() * 8) + 7;
        } else {
          state = 'QUIET';
          targetDays = Math.floor(Math.random() * 6) + 5;
        }
        daysInState = 0;
      }

      if (isMarch && state === 'QUIET' && Math.random() < 0.3) {
        state = 'SPRINT';
        targetDays = Math.floor(Math.random() * 8) + 7;
        daysInState = 0;
      }

      const isWeekend = current.getDay() === 0 || current.getDay() === 6;

      if (state === 'SPRINT') {
        if (isWeekend && Math.random() < (isMarch ? 0.3 : 0.6)) {
          level = 0;
        } else {
          const r = Math.random();
          if (prevLevel === 4) {
             level = r < 0.6 ? 2 : 3;
          } else {
             if (r < 0.4) level = 2;
             else if (r < 0.8) level = 3;
             else level = 4;
          }
        }
      } else {
        if (isWeekend && Math.random() < 0.8) {
           level = 0;
        } else {
           const r = Math.random();
           if (r < 0.7) level = 0;
           else level = 1;
        }
      }

      if (level === 0) tasks = 0;
      else if (level === 1) tasks = 1;
      else if (level === 2) tasks = Math.floor(Math.random() * 2) + 2; // 2-3
      else if (level === 3) tasks = Math.floor(Math.random() * 2) + 4; // 4-5
      else if (level === 4) tasks = Math.floor(Math.random() * 3) + 6; // 6+

      dataMap.set(dateString, { level, tasks });
      
      prevLevel = level;
      daysInState++;
      current.setDate(current.getDate() + 1);
    }

    // 2. Build Grid Data from START_DATE to end of the week containing TODAY
    const gridMonths = [];
    let currentMonthObj = null;
    let currentColumn = new Array(7).fill(null);
    
    current = new Date(START_DATE);
    const endOfGrid = new Date(TODAY);
    const diffToSat = 6 - endOfGrid.getDay();
    endOfGrid.setDate(endOfGrid.getDate() + diffToSat);

    while (current <= endOfGrid) {
      const yyyy = current.getFullYear();
      const mm = current.getMonth();
      const dayOfWeek = current.getDay();
      
      const isFutureDate = current > TODAY;
      const dateString = `${yyyy}-${String(mm + 1).padStart(2, '0')}-${String(current.getDate()).padStart(2, '0')}`;
      
      let dayData = { level: 'future', tasks: 0 };
      if (!isFutureDate && dataMap.has(dateString)) {
        dayData = dataMap.get(dateString);
      }
      
      const cellData = {
        id: dateString,
        date: new Date(current),
        isFutureDate,
        level: isFutureDate ? 'future' : dayData.level,
        tasks: dayData.tasks
      };

      if (!currentMonthObj || currentMonthObj.monthIndex !== mm) {
         if (currentMonthObj) {
           currentMonthObj.columns.push(currentColumn);
           gridMonths.push(currentMonthObj);
         }
         currentMonthObj = { monthIndex: mm, year: yyyy, name: MONTH_NAMES[mm], columns: [] };
         currentColumn = new Array(7).fill(null);
      } else if (dayOfWeek === 0) {
         currentMonthObj.columns.push(currentColumn);
         currentColumn = new Array(7).fill(null);
      }
      
      currentColumn[dayOfWeek] = cellData;
      current.setDate(current.getDate() + 1);
    }
    
    if (currentMonthObj) {
       currentMonthObj.columns.push(currentColumn);
       gridMonths.push(currentMonthObj);
    }
    
    return { monthsData: gridMonths };
  }, []);

  const handleMouseEnter = (e, cellData) => {
    if (!cellData) return;
    const rect = e.target.getBoundingClientRect();
    const container = e.target.closest('.nb-contribution-calendar');
    if (!container) return;
    const containerRect = container.getBoundingClientRect();
    
    const x = rect.left - containerRect.left + (rect.width / 2);
    let translateX = '-50%';
    
    // Clamp tooltip near scroll boundaries
    if (x < 75) {
      translateX = '-10%';
    } else if (containerRect.width - x < 75) {
      translateX = '-90%';
    }
    
    setTooltip({
      visible: true,
      x: x,
      y: rect.top - containerRect.top,
      translateX,
      data: cellData
    });
  };

  const handleMouseLeave = () => {
    setTooltip(prev => ({ ...prev, visible: false }));
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="nb-card nb-contribution-calendar" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
      {/* INJECTED STYLES FOR CONTINUOUS HORIZONTAL STRIP */}
      <style>{`
        .nb-strip-wrapper {
          width: 100%;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        
        .nb-strip-container {
          display: flex;
          flex-direction: row;
          gap: 16px; /* Month gap */
          width: max-content;
        }
        
        .nb-y-axis {
          display: grid;
          grid-template-rows: repeat(7, 1fr);
          gap: 3px;
          padding-right: 8px;
          margin-top: 20px; /* Offset to align perfectly with the cells below month labels */
        }
        
        .nb-y-axis span {
          font-family: var(--font-body);
          font-size: 0.7rem;
          color: var(--text-tertiary);
          display: flex;
          align-items: center;
          height: 14px;
          line-height: 1;
        }
        
        .nb-month-block {
          display: flex;
          flex-direction: column;
        }
        
        .nb-month-label {
          font-family: var(--font-body);
          font-size: 0.75rem;
          color: var(--text-tertiary);
          height: 20px;
          display: flex;
          justify-content: center;
          align-items: flex-end;
          padding-bottom: 4px;
          width: 100%;
        }
        
        .nb-week-grid {
          display: grid;
          grid-template-rows: repeat(7, 1fr);
          grid-auto-flow: column;
          gap: 3px;
        }
        
        .nb-strip-container .nb-heatmap-cell {
          width: 14px;
          height: 14px;
          border-radius: 2px;
          margin: 0;
          transition: opacity 120ms ease;
        }

        .nb-strip-container .nb-heatmap-cell:hover {
          opacity: 0.7;
        }
        
        .nb-heatmap-cell-padding {
          width: 14px;
          height: 14px;
          visibility: hidden;
        }

        .nb-calendar-tooltip {
          position: absolute;
          background: #1a1a1a;
          color: #fff;
          padding: 8px 12px;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
          font-family: var(--font-body);
          font-size: 0.85rem;
          pointer-events: none;
          z-index: 100;
          margin-top: -8px;
          opacity: 0;
          transition: opacity 120ms ease;
          white-space: nowrap;
          border: 1px solid #333;
        }
        
        .nb-calendar-tooltip.visible {
          opacity: 1;
        }
      `}</style>

      <h2 style={{ fontFamily: 'var(--font-heading)', margin: 0 }}>Contribution Calendar</h2>
      
      {/* Summary Banner (Untouched) */}
      <div className="nb-calendar-banner">
        <div className="nb-calendar-stat"><span>Contributions This Year</span> <strong>142</strong></div>
        <div className="nb-calendar-stat"><span>Projects Completed</span> <strong>12</strong></div>
        <div className="nb-calendar-stat"><span>Current Streak</span> <strong>14 days</strong></div>
        <div className="nb-calendar-stat"><span>Longest Streak</span> <strong>31 days</strong></div>
        <div className="nb-calendar-stat"><span>Most Productive Month</span> <strong>March</strong></div>
      </div>

      {/* Scrolling Continuous Strip */}
      <div className="nb-strip-wrapper" onMouseLeave={handleMouseLeave}>
        <div className="nb-strip-container">
          
          {/* Y-axis Day Labels */}
          <div className="nb-y-axis">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Month Blocks */}
          {monthsData.map((month) => (
            <div key={`${month.year}-${month.monthIndex}`} className="nb-month-block">
              {/* Month Label */}
              <div className="nb-month-label">
                {month.name}
              </div>
              
              {/* Week Columns Grid */}
              <div className="nb-week-grid">
                {month.columns.map((col, cIdx) => (
                  col.map((cell, rIdx) => {
                    if (!cell) {
                      return <div key={`pad-${cIdx}-${rIdx}`} className="nb-heatmap-cell-padding" />;
                    }
                    
                    return (
                      <div 
                        key={cell.id} 
                        className={`nb-heatmap-cell activity-level-${cell.level}`}
                        onMouseEnter={(e) => handleMouseEnter(e, cell)}
                      />
                    );
                  })
                ))}
              </div>
            </div>
          ))}

        </div>
      </div>

      {/* Floating Tooltip */}
      <div 
        className={`nb-calendar-tooltip ${tooltip.visible && tooltip.data ? 'visible' : ''}`}
        style={{ 
          left: tooltip.x, 
          top: tooltip.y, 
          transform: `translate(${tooltip.translateX}, -100%)`
        }}
      >
        {tooltip.data && (
          <>
            <div style={{ fontWeight: 600, color: 'inherit', marginBottom: tooltip.data.isFutureDate ? 0 : '4px' }}>
              {formatDate(tooltip.data.date)}
            </div>
            {!tooltip.data.isFutureDate ? (
              <div style={{ color: '#A8A39C', fontSize: '0.8rem' }}>
                Tasks Completed: {tooltip.data.tasks}
              </div>
            ) : (
              <div style={{ color: '#A8A39C', fontSize: '0.8rem' }}>
                Future date
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
}
