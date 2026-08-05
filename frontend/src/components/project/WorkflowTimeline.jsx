import { useState, useEffect, useRef } from 'react';
import { WORKFLOW_STATUS_LABELS } from '../../utils/constants';
import { CheckIcon, ClockIcon } from '../ui/Icons';
import { workflowService } from '../../services/workflowService';



const STATUS_CYCLE = ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'];

/** Display-only checkbox — purely visual, no state or handlers */
const CHECKBOX_EMPTY = '☐';

/** Single phase card — extracted for clarity */
function PhaseCard({ phase, index, totalPhases, isActive, onCycleStatus }) {
  const [expanded, setExpanded] = useState(isActive);

  // ── Task state ─────────────────────────────────────────────────────────
  const [tasks, setTasks] = useState([]);
  const [tasksLoaded, setTasksLoaded] = useState(false);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [addingTask, setAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskSaving, setTaskSaving] = useState(false);
  const addInputRef = useRef(null);

  const statusClass = phase.status.toLowerCase().replace('_', '-');

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

  // Focus the input whenever the add-row becomes visible
  useEffect(() => {
    if (addingTask) addInputRef.current?.focus();
  }, [addingTask]);

  // ── Task handlers ──────────────────────────────────────────────────────

  const handleToggleTask = async (task) => {
    // Derive next status from current status (enum contract: DONE | TODO)
    const nextStatus = task.status === 'DONE' ? 'TODO' : 'DONE';
    // Optimistic update — reflect toggle instantly
    const snapshot = tasks;
    setTasks(prev =>
      prev.map(t => t.id === task.id ? { ...t, status: nextStatus, completed: nextStatus === 'DONE' } : t)
    );
    try {
      // Reconcile with server response — canonical source of truth
      const updated = await workflowService.updateTask(task.id, { status: nextStatus });
      setTasks(prev => prev.map(t => t.id === updated.id ? updated : t));
    } catch (err) {
      console.error('Failed to toggle task:', err);
      setTasks(snapshot); // revert on error
    }
  };

  const handleDeleteTask = async (task) => {
    // Optimistic removal
    const snapshot = tasks;
    setTasks(prev => prev.filter(t => t.id !== task.id));
    try {
      await workflowService.deleteTask(task.id);
      // DELETE returns 204 No Content — nothing to reconcile; optimistic state is correct
    } catch (err) {
      console.error('Failed to delete task:', err);
      setTasks(snapshot); // revert on error
    }
  };

  const handleCreateTask = async () => {
    const title = newTaskTitle.trim();
    if (!title || taskSaving) return;
    setTaskSaving(true);
    try {
      const created = await workflowService.createTask({
        phaseId: phase.id,
        title,
        taskOrder: tasks.length,
      });
      setTasks(prev => [...prev, created]);
      setNewTaskTitle('');
      setAddingTask(false);
    } catch (err) {
      console.error('Failed to create task:', err);
    } finally {
      setTaskSaving(false);
    }
  };

  const handleAddKeyDown = (e) => {
    if (e.key === 'Enter') handleCreateTask();
    if (e.key === 'Escape') {
      setAddingTask(false);
      setNewTaskTitle('');
    }
  };

  // ── Existing header handlers ────────────────────────────────────────────

  const handleHeaderClick = () => {
    onCycleStatus(phase);
  };

  const handleExpandToggle = (e) => {
    e.stopPropagation();
    setExpanded(prev => !prev);
  };

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
        onClick={handleHeaderClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleHeaderClick(e)}
        title={`Click to change status — currently: ${WORKFLOW_STATUS_LABELS[phase.status]}`}
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

          {/* 1. Guidance — primary instructional text (phase.description is retired) */}
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

          {/* 3. Completion Criteria — display-only ☐ checkboxes, no state or handlers */}
          {criteriaLines.length > 0 && (
            <div className="phase-section phase-section-criteria">
              <div className="phase-section-header">
                <span className="phase-section-icon">✅</span>
                <span className="phase-section-title">Completion Criteria</span>
              </div>
              <ul className="phase-criteria-list" role="list">
                {criteriaLines.map((line, i) => (
                  <li key={i} className="phase-criteria-item">
                    <span className="phase-criteria-checkbox" aria-hidden="true">{CHECKBOX_EMPTY}</span>
                    <span className="phase-criteria-text">{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* 4. Tasks — interactive checklist; spacing via CSS margin-top, no <hr> */}
          <div className="phase-section phase-section-tasks">
            <div className="phase-section-header">
              <span className="phase-section-icon">📋</span>
              <span className="phase-section-title">Tasks</span>
              {tasks.length > 0 && (
                <span className="phase-tasks-count">
                  {tasks.filter(t => t.status === 'DONE').length}/{tasks.length}
                </span>
              )}
            </div>

            {/* Loading indicator — shown only during initial fetch */}
            {tasksLoading && (
              <p className="phase-tasks-empty">Loading tasks…</p>
            )}

            {tasksLoaded && tasks.length === 0 && !addingTask && (
              <p className="phase-tasks-empty">No tasks yet.</p>
            )}

            {tasks.length > 0 && (
              <ul className="phase-tasks-list" role="list">
                {tasks.map(task => (
                  <li key={task.id} className={`phase-task-item ${task.status === 'DONE' ? 'phase-task-completed' : ''}`}>
                    <button
                      className="phase-task-checkbox"
                      onClick={() => handleToggleTask(task)}
                      aria-label={task.status === 'DONE' ? `Mark "${task.title}" incomplete` : `Mark "${task.title}" complete`}
                      aria-pressed={task.status === 'DONE'}
                    >
                      {task.status === 'DONE' ? '☑' : '☐'}
                    </button>
                    <span className="phase-task-title">{task.title}</span>
                    <button
                      className="phase-task-delete"
                      onClick={() => handleDeleteTask(task)}
                      aria-label={`Delete task "${task.title}"`}
                      title="Delete task"
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {/* Inline add row */}
            {addingTask ? (
              <div className="phase-task-add-row">
                <input
                  ref={addInputRef}
                  className="phase-task-input"
                  type="text"
                  placeholder="Task title… (Enter to save, Esc to cancel)"
                  value={newTaskTitle}
                  onChange={e => setNewTaskTitle(e.target.value)}
                  onKeyDown={handleAddKeyDown}
                  maxLength={200}
                  disabled={taskSaving}
                />
              </div>
            ) : (
              <button
                className="phase-task-add-btn"
                onClick={() => setAddingTask(true)}
              >
                + Add Task
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function WorkflowTimeline({ projectId, phases, onPhaseUpdate, projectProgress, domain, activePhaseId, onActivePhaseUpdate }) {
  const [showReevaluate, setShowReevaluate] = useState(false);

  const handleCycleStatus = (phase) => {
    const currentIndex = STATUS_CYCLE.indexOf(phase.status);
    const nextStatus = STATUS_CYCLE[(currentIndex + 1) % STATUS_CYCLE.length];
    onPhaseUpdate(phase.id, nextStatus);
  };

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
            onCycleStatus={handleCycleStatus}
          />
        ))}
      </div>
    </div>
  );
}
