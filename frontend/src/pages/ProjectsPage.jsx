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
      const data = await projectService.getAll({ archived: false });
      setProjects(data);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (payload) => {
    const newProject = await projectService.create(payload);
    navigate(`/projects/${newProject.id}`);
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
      <div className="page-header">
        <h1>Projects</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)} id="new-project-btn">
          <PlusIcon size={16} />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            <NotebookIcon size={64} />
          </div>
          <h3>No projects yet</h3>
          <p>Start by creating your first project. Every great idea begins here!</p>
          <button className="btn btn-primary btn-lg" style={{ marginTop: '1rem' }} onClick={() => setShowModal(true)}>
            <PlusIcon size={18} />
            Create Project
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
