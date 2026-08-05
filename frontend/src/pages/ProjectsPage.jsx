import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService } from '../services/projectService';
import ProjectCard from '../components/project/ProjectCard';
import ProjectFormModal from '../components/project/ProjectFormModal';
import { PlusIcon, NotebookIcon } from '../components/ui/Icons';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectService.getAll({
        archived: false,
        page: 0,
        size: 10,
      });
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (payload) => {
    const newProject = await projectService.create(payload);
    setProjects(prev => [newProject, ...prev]);
  };

  if (loading) {
    return (
      <div className="loader" style={{ minHeight: '50vh' }}>
        <div className="loader-spinner" />
      </div>
    );
  }

  return (
    <div>
      {projects.length > 0 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1.5rem' }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <PlusIcon size={16} />
            New Project
          </button>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <NotebookIcon size={64} />
          </div>
          <h3>This place looks empty.</h3>
          <p>Every great product starts with a single idea.</p>
          <button className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
            <PlusIcon size={18} />
            Create Your First Project
          </button>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      <ProjectFormModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleCreateProject}
      />
    </div>
  );
}