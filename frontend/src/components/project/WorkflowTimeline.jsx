import { useState, useEffect, useRef } from 'react';
import { WORKFLOW_STATUS_LABELS } from '../../utils/constants';
import { CheckIcon, ClockIcon } from '../ui/Icons';
import { workflowService } from '../../services/workflowService';

/**
 * Virtual sentinel index for the "General" criterion (mirrors WorkflowTaskService.GENERAL_CRITERION_INDEX).
 * Tasks stored with this index are informational and never block phase completion.
 */
const GENERAL_CRITERION_INDEX = -1;

// ─────────────────────────────────────────────────────────────────────────────
// CriterionBlock — renders a single acceptance criterion + its tasks
// ─────────────────────────────────────────────────────────────────────────────

function CriterionBlock({
  criterionIndex,
  criterionText,
  tasks,
  onToggleTask,
  onDeleteTask,
  onAddTask,
}) {
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskSaving, setTaskSaving] = useState(false);
  const addInputRef = useRef(null);

  const criterionTasks = tasks.filter(t => t.criterionIndex === criterionIndex);
  const allDone = criterionTasks.length > 0 && criterionTasks.every(t => t.status === 'DONE');

  useEffect(() => {
    if (addingTask) addInputRef.current?.focus();
  }, [addingTask]);

  const handleCreate = async () => {
    const title = newTaskTitle.trim();
    if (!title || taskSaving) return;
    setTaskSaving(true);
    try {
      await onAddTask(title, criterionIndex);
      setNewTaskTitle('');
      setAddingTask(false);
    } finally {
      setTaskSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') { setAddingTask(false); setNewTaskTitle(''); }
  };

  return (
    <div className="criterion-block">
      {/* Criterion header — read-only computed checkbox */}
      <div className="criterion-header">
        <span
          className={`phase-criteria-checkbox criterion-checkbox-computed ${allDone ? 'criterion-checkbox-done' : ''}`}
          aria-label={allDone ? 'Criterion complete' : 'Criterion incomplete'}
          aria-readonly="true"
          role="checkbox"
          aria-checked={allDone}
        >
          {allDone ? '☑' : '☐'}
        </span>
        <span className="criterion-label">{criterionText}</span>
      </div>

      {/* Tasks nested under this criterion */}
      {criterionTasks.length > 0 && (
        <ul className="phase-tasks-list criterion-tasks-list" role="list">
          {criterionTasks.map(task => (
            <li
              key={task.id}
              className={`phase-task-item ${task.status === 'DONE' ? 'phase-task-completed' : ''}`}
            >
              <button
                className="phase-task-checkbox"
                onClick={() => onToggleTask(task)}
                aria-label={task.status === 'DONE' ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
                aria-pressed={task.status === 'DONE'}
              >
                {task.status === 'DONE' ? '☑' : '☐'}
              </button>
              <span className="phase-task-title">{task.title}</span>
              <button
                className="phase-task-delete"
                onClick={() => onDeleteTask(task)}
                aria-label={`Delete task "${task.title}"`}
                title="Delete task"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Inline add-task row */}
      {addingTask ? (
        <div className="phase-task-add-row criterion-add-row">
          <input
            ref={addInputRef}
            className="phase-task-input"
            type="text"
            placeholder="Task title… (Enter to save, Esc to cancel)"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={200}
            disabled={taskSaving}
          />
        </div>
      ) : (
        <button
          className="phase-task-add-btn criterion-add-btn"
          onClick={() => setAddingTask(true)}
        >
          + Add Task
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// GeneralCriterionBlock — housekeeping tasks not tied to any specific criterion
// ─────────────────────────────────────────────────────────────────────────────

function GeneralCriterionBlock({ tasks, onToggleTask, onDeleteTask, onAddTask }) {
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskSaving, setTaskSaving] = useState(false);
  const addInputRef = useRef(null);

  const generalTasks = tasks.filter(t => t.criterionIndex === GENERAL_CRITERION_INDEX);

  useEffect(() => {
    if (addingTask) addInputRef.current?.focus();
  }, [addingTask]);

  const handleCreate = async () => {
    const title = newTaskTitle.trim();
    if (!title || taskSaving) return;
    setTaskSaving(true);
    try {
      await onAddTask(title, GENERAL_CRITERION_INDEX);
      setNewTaskTitle('');
      setAddingTask(false);
    } finally {
      setTaskSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleCreate();
    if (e.key === 'Escape') { setAddingTask(false); setNewTaskTitle(''); }
  };

  return (
    <div className="criterion-block criterion-block-general">
      <div className="criterion-header">
        <span
          className="phase-criteria-checkbox criterion-checkbox-computed criterion-checkbox-general"
          aria-label="General housekeeping tasks (informational)"
          aria-readonly="true"
          role="presentation"
        >
          📋
        </span>
        <span className="criterion-label criterion-label-general">General</span>
        <span className="criterion-general-hint">Housekeeping — does not affect phase completion</span>
      </div>

      {generalTasks.length > 0 && (
        <ul className="phase-tasks-list criterion-tasks-list" role="list">
          {generalTasks.map(task => (
            <li
              key={task.id}
              className={`phase-task-item ${task.status === 'DONE' ? 'phase-task-completed' : ''}`}
            >
              <button
                className="phase-task-checkbox"
                onClick={() => onToggleTask(task)}
                aria-label={task.status === 'DONE' ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
                aria-pressed={task.status === 'DONE'}
              >
                {task.status === 'DONE' ? '☑' : '☐'}
              </button>
              <span className="phase-task-title">{task.title}</span>
              <button
                className="phase-task-delete"
                onClick={() => onDeleteTask(task)}
                aria-label={`Delete task "${task.title}"`}
                title="Delete task"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {addingTask ? (
        <div className="phase-task-add-row criterion-add-row">
          <input
            ref={addInputRef}
            className="phase-task-input"
            type="text"
            placeholder="General task title… (Enter to save, Esc to cancel)"
            value={newTaskTitle}
            onChange={e => setNewTaskTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            maxLength={200}
            disabled={taskSaving}
          />
        </div>
      ) : (
        <button
          className="phase-task-add-btn criterion-add-btn criterion-add-btn-general"
          onClick={() => setAddingTask(true)}
        >
          + Add General Task
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PhaseCard — single phase with nested criteria → tasks hierarchy
// ─────────────────────────────────────────────────────────────────────────────

function PhaseCard({ phase, index, totalPhases, isActive }) {
  const [expanded, setExpanded] = useState(isActive);

  const [tasks, setTasks] = useState([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);

  const statusClass = phase.status.toLowerCase().replace(/_/g, '-');

  // Parse completion criteria lines (split on \n, filter blanks)
  const criteriaLines = phase.completionCriteria
    ? phase.completionCriteria.split('\n').map(l => l.trim()).filter(Boolean)
    : [];

  // Fetch tasks once — cached in local state; collapse/re-expand never refetches
  useEffect(() => {
    if (expanded && !tasksLoaded && !tasksLoading) {
      setTasksLoading(true);
      workflowService.getTasksByPhase(phase.id)
        .then(data => setTasks(data))
        .catch(err => console.error('Failed to load tasks:', err))
        .finally(() => {
          setTasksLoaded(true);
          setTasksLoading(false);
        });
    }
  }, [expanded, tasksLoaded, tasksLoading, phase.id]);

  // ── Task handlers ──────────────────────────────────────────────────────

  const handleToggleTask = async (task) => {
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    const snapshot = tasks;
    setTasks(prev =>
      prev.map(t => t.id === task.id ? { ...t, status: nextStatus, completed: nextStatus === 'DONE' } : t)
    );
    try {
      const updated = await workflowService.updateTask(task.id, { status: nextStatus });
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (err) {
      console.error('Failed to toggle task:', err);
      setTasks(snapshot);
    }
  };

  const handleDeleteTask = async (task) => {
    const snapshot = tasks;
    setTasks(prev => prev.filter(t => t.id !== task.id));
    try {
      await workflowService.deleteTask(task.id);
    } catch (err) {
      console.error('Failed to delete task:', err);
      setTasks(snapshot);
    }
  };

  const handleAddTask = async (title, criterionIndex) => {
    const created = await workflowService.createTask({
      phaseId: phase.id,
      title,
      criterionIndex,
    });
    setTasks(prev => [...prev, created]);
  };

  const handleExpandToggle = (e) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };

  const doneCount = tasks.filter(t => t.status === 'DONE').length;

  return (
    <div
      className={`workflow-phase workflow-phase-${statusClass} ${isActive ? 'workflow-phase-active' : ''}`}
      role="article"
      aria-label={`Phase: ${phase.name}`}
    >
      {/* Vertical connector line between phases */}
      {index < totalPhases - 1 && <div className="workflow-connector" />}

      {/* ── Phase Header Row ── */}
      <div
        className="workflow-phase-header"
        role="button"
        tabIndex={0}
        onClick={handleExpandToggle}
        onKeyDown={(e) => e.key === 'Enter' && handleExpandToggle(e)}
        aria-expanded={expanded}
        aria-label={`${phase.name} — status: ${WORKFLOW_STATUS_LABELS[phase.status]}`}
      >
        {/* Status indicator dot */}
        <div className={`workflow-status-dot workflow-dot-${statusClass}`}>
          {phase.status === 'COMPLETED' ? (
            <CheckIcon size={12} />
          ) : phase.status === 'IN_PROGRESS' ? (
            <ClockIcon size={12} />
          ) : (
            <span className="workflow-dot-number">{index + 1}</span>
          )}
        </div>

        {/* Title + badges */}
        <div className="workflow-phase-title-group">
          <div className="workflow-phase-title-row">
            <h4 className="workflow-phase-name">{phase.name}</h4>
            <div className="workflow-phase-badges">
              <span className={`badge workflow-badge workflow-badge-${statusClass}`}>
                {WORKFLOW_STATUS_LABELS[phase.status]}
              </span>
              {isActive && (
                <span className="badge workflow-badge-active-phase">
                  ⚡ Active Phase
                </span>
              )}
              {tasksLoaded && tasks.length > 0 && (
                <span className="phase-tasks-count">
                  {doneCount}/{tasks.length}
                </span>
              )}
            </div>
          </div>

          {/* Collapsible toggle hint */}
          <button
            className="workflow-phase-toggle"
            onClick={handleExpandToggle}
            aria-expanded={expanded}
            aria-label={expanded ? 'Collapse phase details' : 'Expand phase details'}
          >
            <span className={`workflow-toggle-arrow ${expanded ? 'workflow-toggle-arrow-open' : ''}`}>▾</span>
            <span className="workflow-toggle-label">{expanded ? 'Hide details' : 'View details'}</span>
          </button>
        </div>
      </div>

      {/* ── Phase Workspace Body ── */}
      {expanded && (
        <div className="workflow-phase-body" onClick={(e) => e.stopPropagation()}>

          {/* 1. Guidance */}
          {phase.guidance && (
            <div className="phase-section phase-section-guidance">
              <div className="phase-section-header">
                <span className="phase-section-icon">🧭</span>
                <span className="phase-section-title">Guidance</span>
              </div>
              <p className="phase-section-content">{phase.guidance}</p>
            </div>
          )}

          {/* 2. Expected Outcome */}
          {phase.expectedOutcome && (
            <div className="phase-section phase-section-outcome">
              <div className="phase-section-header">
                <span className="phase-section-icon">🎯</span>
                <span className="phase-section-title">Expected Outcome</span>
              </div>
              <p className="phase-section-content">{phase.expectedOutcome}</p>
            </div>
          )}

          {/* 3. Acceptance Criteria → Tasks (nested hierarchy) */}
          {criteriaLines.length > 0 && (
            <div className="phase-section phase-section-criteria">
              <div className="phase-section-header">
                <span className="phase-section-icon">✅</span>
                <span className="phase-section-title">Acceptance Criteria</span>
              </div>

              {tasksLoading && (
                <p className="phase-tasks-empty">Loading tasks…</p>
              )}

              {!tasksLoading && (
                <ul className="phase-criteria-list" role="list">
                  {criteriaLines.map((line, i) => (
                    <li key={i} className="phase-criteria-item phase-criteria-item-expandable">
                      <CriterionBlock
                        criterionIndex={i}
                        criterionText={line}
                        tasks={tasks}
                        onToggleTask={handleToggleTask}
                        onDeleteTask={handleDeleteTask}
                        onAddTask={handleAddTask}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* 4. General — housekeeping tasks not tied to any acceptance criterion */}
          {tasksLoaded && (
            <div className="phase-section phase-section-general">
              <GeneralCriterionBlock
                tasks={tasks}
                onToggleTask={handleToggleTask}
                onDeleteTask={handleDeleteTask}
                onAddTask={handleAddTask}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WorkflowTimeline — top-level component
// ─────────────────────────────────────────────────────────────────────────────

export default function WorkflowTimeline({ projectId, phases, onPhaseUpdate, projectProgress, domain, activePhaseId, onActivePhaseUpdate }) {
  const [showReevaluate, setShowReevaluate] = useState(false);

  const sortedPhases = [...(phases || [])].sort((a, b) => (a.phaseOrder || 0) - (b.phaseOrder || 0));

  const handleReevaluate = async (phase) => {
    try {
      await workflowService.updateActivePhase(projectId, phase.id);
      setShowReevaluate(false);
      onActivePhaseUpdate();
    } catch (err) {
      console.error('Failed to update active phase:', err);
    }
  };

  return (
    <div className="workflow-timeline">
      {/* ── Toolbar ── */}
      <div className="workflow-actions">
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => setShowReevaluate(!showReevaluate)}
        >
          Re-evaluate
        </button>
      </div>

      {showReevaluate && (
        <div className="reevaluate-phase-selector">
          <p>Select the phase you want to revisit:</p>
          {sortedPhases.map((phase) => (
            <button
              key={phase.id}
              className="btn btn-secondary"
              onClick={() => handleReevaluate(phase)}
            >
              {phase.name}
            </button>
          ))}
        </div>
      )}

      {/* ── Progress Summary ── */}
      <div className="workflow-progress-summary">
        <div className="workflow-progress-info">
          <span className="workflow-progress-label">Development Progress</span>
          <span className="workflow-progress-value">{projectProgress}%</span>
        </div>
        <div className="progress-bar workflow-progress-bar">
          <div className="progress-fill" style={{ width: `${projectProgress}%` }} />
        </div>
      </div>

      {/* ── Phase Cards ── */}
      <div className="workflow-phases">
        {sortedPhases.map((phase, index) => (
          <PhaseCard
            key={phase.id}
            phase={phase}
            index={index}
            totalPhases={sortedPhases.length}
            isActive={phase.id === activePhaseId}
          />
        ))}
      </div>
    </div>
  );
}
