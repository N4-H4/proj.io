import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { projectService } from '../services/projectService';
import { NotebookIcon, ProjectsIcon, ClockIcon, CheckIcon, AlertIcon } from '../components/ui/Icons';
import { formatDate, getRelativeTime, isDeadlineUrgent, isDeadlinePassed } from '../utils/dateUtils';
import { PROJECT_STATUS_LABELS, STATUS_BADGE_CLASS } from '../utils/constants';

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const [statsData, projectsData] = await Promise.all([
        dashboardService.getStats(),
        projectService.getAll({ archived: false }),
      ]);
      setStats(statsData);
      setRecentProjects(projectsData.slice(0, 4));
    } catch (err) {
      console.error('Failed to load dashboard:', err);
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

  const hasProjects = stats && stats.totalProjects > 0;

  return (
    <div className="dashboard-page">
      {/* Welcome Section */}
      <div className="dashboard-welcome">
        <div className="dashboard-welcome-text">
          <h1>Welcome back, {user?.name || 'Developer'}</h1>
          <p>Here's what's happening with your projects</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="dashboard-grid">
        <div className="card stat-card">
          <div className="stat-icon stat-icon-projects">
            <ProjectsIcon size={22} />
          </div>
          <div className="stat-value">{stats?.totalProjects ?? 0}</div>
          <div className="stat-label">Total Projects</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon stat-icon-active">
            <ClockIcon size={22} />
          </div>
          <div className="stat-value">{stats?.activeProjects ?? 0}</div>
          <div className="stat-label">Active</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon stat-icon-completed">
            <CheckIcon size={22} />
          </div>
          <div className="stat-value">{stats?.completedProjects ?? 0}</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon stat-icon-tasks">
            <AlertIcon size={22} />
          </div>
          <div className="stat-value">{stats?.pendingTasks ?? 0}</div>
          <div className="stat-label">Pending Tasks</div>
        </div>
      </div>

      {!hasProjects ? (
        /* Empty State */
        <div className="empty-state">
          <div className="empty-state-icon">
            <NotebookIcon size={64} />
          </div>
          <h3>Your notebook is empty</h3>
          <p>Create your first project to get started!</p>
          <button className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }} onClick={() => navigate('/projects')}>
            Start a Project
          </button>
        </div>
      ) : (
        <>
          {/* Upcoming Deadlines */}
          {stats?.upcomingDeadlines?.length > 0 && (
            <section className="dashboard-section">
              <h2 className="section-title">Upcoming Deadlines</h2>
              <div className="deadline-list">
                {stats.upcomingDeadlines.slice(0, 5).map((item) => {
                  const urgent = isDeadlineUrgent(item.deadline);
                  const passed = isDeadlinePassed(item.deadline);
                  return (
                    <div
                      key={`${item.type}-${item.id}`}
                      className={`deadline-item ${passed ? 'deadline-overdue' : urgent ? 'deadline-urgent' : ''}`}
                      onClick={() => {
                        if (item.type === 'PROJECT') navigate(`/projects/${item.id}`);
                      }}
                    >
                      <div className="deadline-type-badge">
                        {item.type === 'PROJECT' ? 'Project' : 'Task'}
                      </div>
                      <div className="deadline-info">
                        <span className="deadline-title">{item.title}</span>
                        {item.type === 'TASK' && (
                          <span className="deadline-project">{item.projectTitle}</span>
                        )}
                      </div>
                      <div className="deadline-date">
                        <span className="deadline-relative">{getRelativeTime(item.deadline)}</span>
                        <span className="deadline-absolute">{formatDate(item.deadline)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Recent Projects */}
          {recentProjects.length > 0 && (
            <section className="dashboard-section">
              <div className="section-header">
                <h2 className="section-title">Recent Projects</h2>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
                  View all
                </button>
              </div>
              <div className="recent-projects-grid">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="card recent-project-card"
                    onClick={() => navigate(`/projects/${project.id}`)}
                  >
                    <div className="recent-project-header">
                      <h3 className="recent-project-title">{project.title}</h3>
                      <span className={`badge ${STATUS_BADGE_CLASS[project.status] || 'badge-planned'}`}>
                        {PROJECT_STATUS_LABELS[project.status] || project.status}
                      </span>
                    </div>
                    {project.domain && <span className="domain-tag">{project.domain}</span>}
                    {project.description && (
                      <p className="recent-project-desc">{project.description}</p>
                    )}
                    <div className="recent-project-footer">
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${project.progress || 0}%` }} />
                      </div>
                      <span className="progress-text">{project.progress || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
