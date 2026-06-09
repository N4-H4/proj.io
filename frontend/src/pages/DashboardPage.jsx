import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import { projectService } from '../services/projectService';
import { formatDate, getRelativeTime, isDeadlineUrgent, isDeadlinePassed } from '../utils/dateUtils';
import { PROJECT_STATUS_LABELS, STATUS_BADGE_CLASS } from '../utils/constants';
import { WorkshopCharts } from '../components/ui/WorkshopCharts';
import { ConsistencyTracker } from '../components/ui/ConsistencyTracker';
import '../styles/dashboard.css';

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

  const activeProject = recentProjects.length > 0 ? recentProjects[0] : null;

  const mockTasksLifetime = 142;
  const mockTasksMonth = 28;
  const mockTasksWeek = 5;
  const mockTasksToday = 2;

  const getDaysRemaining = (dateString) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(dateString);
    deadlineDate.setHours(0, 0, 0, 0);
    const diffTime = deadlineDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  const getUrgencyClass = (days) => {
    if (days <= 0) return 'overdue';
    if (days <= 6) return 'urgent';
    return 'safe';
  };

  const mockNextTasks = [
    { id: 1, title: "Create API endpoints", project: "E-commerce Backend", deadline: new Date(Date.now() + 86400000 * 2).toISOString() },
    { id: 2, title: "Design Landing Page", project: "Portfolio V2", deadline: new Date(Date.now() + 86400000 * 4).toISOString() },
    { id: 3, title: "Fix login bug", project: "Proj.io", deadline: new Date(Date.now() + 86400000 * 6).toISOString() },
    { id: 4, title: "Write documentation", project: "Proj.io", deadline: new Date(Date.now() + 86400000 * 8).toISOString() },
    { id: 5, title: "Deploy to Vercel", project: "Portfolio V2", deadline: new Date(Date.now() + 86400000 * 10).toISOString() },
  ].sort((a, b) => new Date(a.deadline) - new Date(b.deadline));

  const mockDeadlines = [
    { id: 101, type: "PROJECT", title: "Proj.io Beta", daysRemaining: -1, deadline: new Date(Date.now() - 86400000).toISOString() },
    { id: 102, type: "TASK", title: "Fix login bug", projectTitle: "Proj.io", daysRemaining: 2, deadline: new Date(Date.now() + 86400000 * 2).toISOString() },
    { id: 103, type: "PROJECT", title: "Portfolio V2", daysRemaining: 5, deadline: new Date(Date.now() + 86400000 * 5).toISOString() },
    { id: 104, type: "TASK", title: "Write documentation", projectTitle: "Proj.io", daysRemaining: 8, deadline: new Date(Date.now() + 86400000 * 8).toISOString() },
  ].sort((a, b) => a.daysRemaining - b.daysRemaining);

  const mockJournal = [
    { id: 1, action: "Updated workflow stage to", subject: "Implementation", time: "2 hours ago", icon: "workflow" },
    { id: 2, action: "Completed task", subject: "Design database schema", time: "5 hours ago", icon: "check" },
    { id: 3, action: "Added brain dump note to", subject: "Proj.io", time: "Yesterday", icon: "braindump" },
    { id: 4, action: "Created task", subject: "Setup Redux store", time: "2 days ago", icon: "plus" },
    { id: 5, action: "Created project", subject: "Portfolio V2", time: "3 days ago", icon: "project" },
    { id: 6, action: "Updated workflow stage to", subject: "Design", time: "3 days ago", icon: "workflow" },
    { id: 7, action: "Completed task", subject: "Wireframing", time: "4 days ago", icon: "check" },
    { id: 8, action: "Added brain dump note to", subject: "Portfolio V2", time: "4 days ago", icon: "braindump" },
    { id: 9, action: "Created task", subject: "Wireframing", time: "5 days ago", icon: "plus" },
    { id: 10, action: "Created project", subject: "Proj.io", time: "1 week ago", icon: "project" },
  ];

  const mockWorkspaceOverview = {
    projectsCreated: 12,
    tasksCreated: 142,
    tasksCompleted: 118,
    completionRate: 83,
    avgProgress: 65
  };

  const mockProjectShelf = [
    { id: 10, title: "Proj.io Redesign", openedAt: "2 hours ago" },
    { id: 11, title: "Portfolio V2", openedAt: "yesterday" },
    { id: 12, title: "E-commerce Backend", openedAt: "3 days ago" },
    { id: 13, title: "Habit Tracker", openedAt: "1 week ago" }
  ];

  const deadlineItemsToUse = stats?.upcomingDeadlines?.length > 0 ? stats.upcomingDeadlines : mockDeadlines;
  // Make sure they are sorted nearest first
  const sortedDeadlines = [...deadlineItemsToUse].sort((a, b) => {
    const aDays = a.daysRemaining !== undefined ? a.daysRemaining : getDaysRemaining(a.deadline);
    const bDays = b.daysRemaining !== undefined ? b.daysRemaining : getDaysRemaining(b.deadline);
    return aDays - bDays;
  });

  return (
    <div className="notebook-dashboard">
      {/* ROW 1: Welcome + Continue Building */}
      <div className="nb-row nb-row-1">
        <div className="nb-card nb-welcome">
          <div className="nb-pin"></div>
          <h1>Welcome back, {user?.name || 'Developer'}</h1>
          <p className="nb-welcome-text">
            You completed {mockTasksWeek} tasks this week. {stats?.upcomingDeadlines?.length > 0 ? `${stats.upcomingDeadlines.length} deadline(s) approaching.` : ''} Keep it up.
          </p>
        </div>
        
        {activeProject ? (
          <div className="nb-card nb-continue-building">
            <div className="nb-tape"></div>
            <div className="nb-card-header">
              <h2>Continue where you left off</h2>
              <span className={`badge ${STATUS_BADGE_CLASS[activeProject.status] || 'badge-planned'}`}>
                Current stage — {PROJECT_STATUS_LABELS[activeProject.status] || activeProject.status}
              </span>
            </div>
            <h3 className="nb-handwritten" style={{ fontSize: '2rem', marginTop: '0.75rem', marginBottom: '0.5rem' }}>{activeProject.title}</h3>
            <div className="nb-progress-wrap">
              <div className="nb-progress-bar">
                <div className="nb-progress-fill" style={{ width: `${activeProject.progress || 0}%` }} />
              </div>
              <span className="nb-progress-text" style={{ fontFamily: 'var(--font-body)' }}>{activeProject.progress || 0}% complete</span>
            </div>
            <p className="nb-meta" style={{ fontFamily: 'var(--font-body)' }}>
              {activeProject.deadline ? `${getRelativeTime(activeProject.deadline)} remaining` : 'No deadline set'}
            </p>
            <button className="btn btn-primary" style={{ fontFamily: 'var(--font-body)' }} onClick={() => navigate(`/projects/${activeProject.id}`)}>
              Open project
            </button>
          </div>
        ) : (
          <div className="nb-card nb-continue-building empty">
            <div className="nb-tape"></div>
            <h2>Start building</h2>
            <p className="nb-meta" style={{ fontFamily: 'var(--font-body)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>Your workspace is ready.</p>
            <button className="btn btn-primary" style={{ fontFamily: 'var(--font-body)' }} onClick={() => navigate('/projects')}>
              Create your first project
            </button>
          </div>
        )}
      </div>

      {/* ROW 2: Workshop Stats (Visual Charts) */}
      <div className="nb-row nb-row-2">
        <WorkshopCharts />
      </div>

      {/* ROW 3: Next Up + Deadline Watch */}
      <div className="nb-row nb-row-3">
        <div className="nb-card nb-next-up">
          <div className="nb-paperclip"></div>
          <h2>Next Up</h2>
          {mockNextTasks.length > 0 ? (
            <ul className="nb-task-list">
              {mockNextTasks.map(t => (
                <li key={t.id}>
                  <span className="nb-task-title" style={{ fontFamily: 'var(--font-body)' }}>{t.title}</span>
                  <span className="nb-task-project" style={{ fontFamily: 'var(--font-body)' }}>{t.project}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="nb-empty-text" style={{ fontFamily: 'var(--font-body)', marginTop: '1rem', color: 'var(--text-tertiary)' }}>
              No tasks yet. Add your first task to get started.
            </p>
          )}
        </div>
        
        <div className="nb-card nb-deadline-watch">
          <h2>Deadline Watch</h2>
          {sortedDeadlines.length > 0 ? (
            <ul className="nb-deadline-list">
              {sortedDeadlines.slice(0, 5).map(item => {
                const daysRemaining = item.daysRemaining !== undefined ? item.daysRemaining : getDaysRemaining(item.deadline);
                const statusClass = getUrgencyClass(daysRemaining);
                return (
                  <li key={`${item.type || 'MOCK'}-${item.id}`} className={`nb-deadline-item ${statusClass}`}>
                    <div className="nb-dl-info">
                      <span className="nb-dl-title" style={{ fontFamily: 'var(--font-body)' }}>{item.title}</span>
                      <span className="nb-dl-project" style={{ fontFamily: 'var(--font-body)' }}>
                        {item.type === 'PROJECT' ? 'Project' : `Task in ${item.projectTitle}`}
                      </span>
                    </div>
                    <div className="nb-dl-time" style={{ fontFamily: 'var(--font-body)' }}>
                      <span className="nb-dl-status"></span>
                      {daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : daysRemaining === 0 ? 'Today' : `${daysRemaining}d left`}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
             <p className="nb-empty-text" style={{ fontFamily: 'var(--font-body)', marginTop: '1rem', color: 'var(--text-tertiary)' }}>
               No upcoming deadlines.
             </p>
          )}
        </div>
      </div>

      {/* ROW 4: Project Journal */}
      <div className="nb-row nb-row-4">
        <div className="nb-card nb-project-journal">
          <h2>Project Journal</h2>
          <div className="nb-journal-entries">
            {mockJournal.map(entry => (
              <div key={entry.id} className="nb-journal-entry">
                <div className="nb-journal-icon">
                  {entry.icon === 'check' && <span style={{ color: 'var(--status-done)' }}>✓</span>}
                  {entry.icon === 'plus' && <span style={{ color: 'var(--accent-primary)' }}>+</span>}
                  {entry.icon === 'workflow' && <span style={{ color: 'var(--info)' }}>→</span>}
                  {entry.icon === 'braindump' && <span style={{ color: 'var(--warning)' }}>✎</span>}
                  {entry.icon === 'project' && <span style={{ color: 'var(--accent-secondary)' }}>★</span>}
                </div>
                <div className="nb-journal-content" style={{ fontFamily: 'var(--font-body)' }}>
                  <span className="nb-journal-action">{entry.action}</span>{' '}
                  <strong style={{ fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--text-primary)' }}>{entry.subject}</strong>
                </div>
                <div className="nb-journal-time" style={{ fontFamily: 'var(--font-body)' }}>{entry.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ROW 5: Workspace Overview */}
      <div className="nb-row nb-row-5">
        <div className="nb-card nb-workspace-overview">
          <h2 style={{ fontFamily: 'var(--font-heading)', width: '100%', marginBottom: '1rem' }}>Workspace Overview</h2>
          <div className="nb-wo-stats-container">
            <div className="nb-wo-stat">
              <strong>{mockWorkspaceOverview.projectsCreated}</strong>
              <span>Projects created</span>
            </div>
            <div className="nb-wo-stat">
              <strong>{mockWorkspaceOverview.tasksCreated}</strong>
              <span>Tasks created</span>
            </div>
            <div className="nb-wo-stat">
              <strong>{mockWorkspaceOverview.tasksCompleted}</strong>
              <span>Tasks completed</span>
            </div>
            <div className="nb-wo-stat">
              <strong>{mockWorkspaceOverview.completionRate}%</strong>
              <span>Completion rate</span>
            </div>
            <div className="nb-wo-stat">
              <strong>{mockWorkspaceOverview.avgProgress}%</strong>
              <span>Avg project progress</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 6: Consistency Tracker */}
      <div className="nb-row nb-row-6">
        <ConsistencyTracker />
      </div>

      {/* ROW 7: Project Shelf */}
      <div className="nb-row nb-row-7">
        <div className="nb-card nb-project-shelf">
          <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: '1rem' }}>Project Shelf</h2>
          <div className="nb-shelf-grid">
            {mockProjectShelf.map(proj => (
              <div key={proj.id} className="nb-shelf-card" onClick={() => navigate(`/projects/${proj.id}`)}>
                <div className="nb-shelf-tape"></div>
                <div className="nb-shelf-title">{proj.title}</div>
                <div className="nb-shelf-meta">Opened {proj.openedAt}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
