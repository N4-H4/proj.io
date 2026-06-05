import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService } from '../services/dashboardService';
import { DeadlinesIcon } from '../components/ui/Icons';
import { formatDate, getRelativeTime, isDeadlineUrgent, isDeadlinePassed } from '../utils/dateUtils';

export default function DeadlinesPage() {
  const [deadlines, setDeadlines] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDeadlines();
  }, []);

  const loadDeadlines = async () => {
    try {
      const data = await dashboardService.getDeadlines(365);
      setDeadlines(data);
    } catch (err) {
      console.error('Failed to load deadlines:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loader" style={{ minHeight: '50vh' }}>
        <div className="loader-spinner" />
      </div>
    );
  }

  const projectDeadlines = deadlines.filter((d) => d.type === 'PROJECT');
  const taskDeadlines = deadlines.filter((d) => d.type === 'TASK');

  return (
    <div>
      <div className="page-header">
        <h1>Deadlines</h1>
      </div>

      {deadlines.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <DeadlinesIcon size={48} />
          </div>
          <h3>No upcoming deadlines</h3>
          <p>Add deadlines to your projects and tasks to see them here.</p>
        </div>
      ) : (
        <>
          {/* Project Deadlines */}
          {projectDeadlines.length > 0 && (
            <section className="deadline-section">
              <h2 className="section-title">Project Deadlines</h2>
              <div className="deadline-table">
                <div className="deadline-table-header">
                  <span>Project</span>
                  <span>Deadline</span>
                  <span>Time Left</span>
                  <span>Status</span>
                </div>
                {projectDeadlines.map((item) => {
                  const urgent = isDeadlineUrgent(item.deadline);
                  const passed = isDeadlinePassed(item.deadline);
                  return (
                    <div
                      key={`project-${item.id}`}
                      className={`deadline-table-row ${passed ? 'deadline-overdue' : urgent ? 'deadline-urgent' : ''}`}
                      onClick={() => navigate(`/projects/${item.id}`)}
                    >
                      <span className="deadline-row-title">{item.title}</span>
                      <span className="deadline-row-date">{formatDate(item.deadline)}</span>
                      <span className={`deadline-row-relative ${passed ? 'text-danger' : urgent ? 'text-warning' : ''}`}>
                        {getRelativeTime(item.deadline)}
                      </span>
                      <span className="deadline-row-status">
                        <span className={`badge badge-${item.status === 'COMPLETED' ? 'done' : item.status === 'IN_PROGRESS' ? 'progress' : 'planned'}`}>
                          {item.status?.replace('_', ' ') || 'Planned'}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Task Deadlines */}
          {taskDeadlines.length > 0 && (
            <section className="deadline-section">
              <h2 className="section-title">Task Deadlines</h2>
              <div className="deadline-table">
                <div className="deadline-table-header">
                  <span>Task</span>
                  <span>Project</span>
                  <span>Deadline</span>
                  <span>Time Left</span>
                </div>
                {taskDeadlines.map((item) => {
                  const urgent = isDeadlineUrgent(item.deadline);
                  const passed = isDeadlinePassed(item.deadline);
                  return (
                    <div
                      key={`task-${item.id}`}
                      className={`deadline-table-row ${passed ? 'deadline-overdue' : urgent ? 'deadline-urgent' : ''}`}
                    >
                      <span className="deadline-row-title">{item.title}</span>
                      <span className="deadline-row-project">{item.projectTitle}</span>
                      <span className="deadline-row-date">{formatDate(item.deadline)}</span>
                      <span className={`deadline-row-relative ${passed ? 'text-danger' : urgent ? 'text-warning' : ''}`}>
                        {getRelativeTime(item.deadline)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
