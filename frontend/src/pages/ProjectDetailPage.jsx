import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import ProjectOverview from '../components/project/ProjectOverview';
import WorkflowTimeline from '../components/project/WorkflowTimeline';
import KanbanBoard from '../components/task/KanbanBoard';
import BrainDumpSection from '../components/braindump/BrainDumpSection';
import { ArrowLeftIcon, ProjectsIcon, WorkflowIcon, KanbanIcon, BrainIcon } from '../components/ui/Icons';

const TABS = [
  { key: 'overview', label: 'Overview', Icon: ProjectsIcon },
  { key: 'workflow', label: 'Workflow', Icon: WorkflowIcon },
  { key: 'tasks', label: 'Tasks', Icon: KanbanIcon },
  { key: 'braindump', label: 'Brain Dump', Icon: BrainIcon },
];

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [error, setError] = useState(null);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projectService.getById(id);
      setProject(data);
    } catch (err) {
      setError('Project not found');
      console.error('Failed to load project:', err);
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

  if (error || !project) {
    return (
      <div className="empty-state" style={{ minHeight: '50vh' }}>
        <h3>Project not found</h3>
        <p>The project you're looking for doesn't exist or has been deleted.</p>
        <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={() => navigate('/projects')}>
          Back to Projects
        </button>
      </div>
    );
  }

  return (
    <div className="project-detail-page">
      {/* Header */}
      <div className="project-detail-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/projects')}>
          <ArrowLeftIcon size={16} /> Projects
        </button>
        <div className="project-detail-title-row">
          <h1>{project.title}</h1>
          {project.domain && <span className="domain-tag">{project.domain}</span>}
        </div>
      </div>

      {/* Tabs */}
      <div className="project-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`project-tab ${activeTab === tab.key ? 'project-tab-active' : ''}`}
            onClick={() => setActiveTab(tab.key)}
            id={`tab-${tab.key}`}
          >
            <tab.Icon size={16} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="project-tab-content">
        {activeTab === 'overview' && (
          <ProjectOverview
            project={project}
            onProjectUpdated={(updated) => setProject(updated)}
          />
        )}
        {activeTab === 'workflow' && (
          <WorkflowTimeline projectId={project.id} />
        )}
        {activeTab === 'tasks' && (
          <KanbanBoard projectId={project.id} />
        )}
        {activeTab === 'braindump' && (
          <BrainDumpSection projectId={project.id} />
        )}
      </div>
    </div>
  );
}
