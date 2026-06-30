import { WORKFLOW_STATUS_LABELS } from '../../utils/constants';
import { CheckIcon, ClockIcon } from '../ui/Icons';

const STATUS_CYCLE = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

export default function WorkflowTimeline({ projectId, phases, onPhaseUpdate, projectProgress }) {
  const handleCycleStatus = (phase) => {
    const currentIndex = STATUS_CYCLE.indexOf(phase.status);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
    
    onPhaseUpdate(phase.id, nextStatus);
  };

  const sortedPhases = [...(phases || [])].sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0));
  const completedCount = sortedPhases.filter((p) => p.status === 'COMPLETED').length;

  return (
    <div className="workflow-timeline">
      {/* Progress Summary */}
      <div className="workflow-progress-summary">
        <div className="workflow-progress-info">
          <span className="workflow-progress-label">Development Progress</span>
          <span className="workflow-progress-value">{projectProgress}%</span>
        </div>
        <div className="progress-bar workflow-progress-bar">
          <div className="progress-fill" style={{ width: `${projectProgress}%` }} />
        </div>
      </div>

      {/* Phase Cards */}
      <div className="workflow-phases">
        {sortedPhases.map((phase, index) => (
          <div
            key={phase.id}
            className={`workflow-phase workflow-phase-${phase.status.toLowerCase().replace('_', '-')}`}
            onClick={() => handleCycleStatus(phase)}
            role="button"
            tabIndex={0}
            title={`Click to change status — currently: ${WORKFLOW_STATUS_LABELS[phase.status]}`}
          >
            {/* Connector line */}
            {index < sortedPhases.length - 1 && <div className="workflow-connector" />}

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
