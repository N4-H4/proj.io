package io.proj.projio.config;

import java.util.List;

/**
 * Immutable blueprint for a single workflow phase within a domain template.
 *
 * <p>This is a <em>static configuration value object</em> — it is never persisted.
 * It exists solely to carry rich, structured context from {@link DomainTemplateConfig}
 * into {@link io.proj.projio.service.TemplateService}, which maps it onto the
 * {@link io.proj.projio.entity.WorkflowPhase} JPA entity at project-creation time.
 *
 * <h3>Field responsibilities</h3>
 * <ul>
 *   <li>{@code order}               — Deterministic zero-based position within the domain workflow.
 *                                     Maps directly to {@code WorkflowPhase.phaseOrder}.</li>
 *   <li>{@code name}                — Human-readable phase label shown in the UI.
 *                                     Maps to {@code WorkflowPhase.name}.</li>
 *   <li>{@code guidance}            — The <em>purpose</em> of this phase: what the team should
 *                                     focus on and why. Maps to {@code WorkflowPhase.guidance}
 *                                     (TEXT column).</li>
 *   <li>{@code expectedOutcome}     — A concrete, testable definition of "done" for this phase.
 *                                     Maps to {@code WorkflowPhase.expectedOutcome} (TEXT column).
 *                                     Also serves as AI-readiness context for future task generation.</li>
 *   <li>{@code completionCriteria}  — A newline-separated checklist of concrete steps that must
 *                                     be satisfied before this phase is considered complete
 *                                     (e.g. {@code "Identify entities\nDefine relationships\nCreate schema"}).
 *                                     Maps to {@code WorkflowPhase.completionCriteria} (TEXT column).</li>
 *   <li>{@code tasks}               — Ordered list of default task titles to spawn as
 *                                     {@link io.proj.projio.entity.WorkflowTask} entities when the phase
 *                                     is created. Titles are concise, actionable strings.</li>
 * </ul>
 */
public record PhaseTemplate(
        int          order,
        String       name,
        String       guidance,
        String       expectedOutcome,
        String       completionCriteria,
        List<String> tasks
) {}

