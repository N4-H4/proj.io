import { useState, useEffect } from 'react';
import { workflowService } from '../../services/workflowService';
import { WORKFLOW_STATUS_LABELS } from '../../utils/constants';
import { CheckIcon, ClockIcon } from '../ui/Icons';

const STATUS_CYCLE = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

export default function WorkflowTimeline({ projectId }) {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPhases();
  }, [projectId]);

  const loadPhases = async () => {
    try {
      const data = await workflowService.getPhases(projectId);
      setPhases(data);
    } catch (err) {
      console.error('Failed to load workflow:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCycleStatus = async (phase) => {
    const currentIndex = STATUS_CYCLE.indexOf(phase.status);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];

    // Optimistic update
    setPhases((prev) =>
      prev.map((p) => (p.id === phase.id ? { ...p, status: nextStatus } : p))
    );

    try {
      await workflowService.updatePhaseStatus(projectId, phase.id, { status: nextStatus });
    } catch (err) {
      // Revert on failure
      setPhases((prev) =>
        prev.map((p) => (p.id === phase.id ? { ...p, status: phase.status } : p))
      );
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="loader-spinner" />
      </div>
    );
  }

  const completedCount = phases.filter((p) => p.status === 'COMPLETED').length;
  const progressPct = phases.length > 0 ? Math.round((completedCount / phases.length) * 100) : 0;

  return (
    <div className="workflow-timeline">
      {/* Progress Summary */}
      <div className="workflow-progress-summary">
        <div className="workflow-progress-info">
          <span className="workflow-progress-label">Development Progress</span>
          <span className="workflow-progress-value">{completedCount} / {phases.length} phases</span>
        </div>
        <div className="progress-bar workflow-progress-bar">
          <div className="progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Phase Cards */}
      <div className="workflow-phases">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className={`workflow-phase workflow-phase-${phase.status.toLowerCase().replace('_', '-')}`}
            onClick={() => handleCycleStatus(phase)}
            role="button"
            tabIndex={0}
            title={`Click to change status — currently: ${WORKFLOW_STATUS_LABELS[phase.status]}`}
          >
            {/* Connector line */}
            {index < phases.length - 1 && <div className="workflow-connector" />}

            {/* Status indicator */}
            <div className={`workflow-status-dot workflow-dot-${phase.status.toLowerCase().replace('_', '-')}`}>
              {phase.status === 'COMPLETED' ? (
                <CheckIcon size={12} />
              ) : phase.status === 'IN_PROGRESS' ? (
                <ClockIcon size={12} />
              ) : (
                <span className="workflow-dot-number">{index + 1}</span>
              )}
            </div>

            {/* Phase info */}
            <div className="workflow-phase-info">
              <h4 className="workflow-phase-name">{phase.name}</h4>
              <p className="workflow-phase-desc">{phase.description}</p>
              <span className={`badge workflow-badge workflow-badge-${phase.status.toLowerCase().replace('_', '-')}`}>
                {WORKFLOW_STATUS_LABELS[phase.status]}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
