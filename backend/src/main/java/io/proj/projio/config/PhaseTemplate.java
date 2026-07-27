package io.proj.projio.config;

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
 *   <li>{@code order}           — Deterministic zero-based position within the domain workflow.
 *                                 Maps directly to {@code WorkflowPhase.phaseOrder}.</li>
 *   <li>{@code name}            — Human-readable phase label shown in the UI.
 *                                 Maps to {@code WorkflowPhase.name}.</li>
 *   <li>{@code guidance}        — The <em>purpose</em> of this phase: what the team should
 *                                 focus on and why. Maps to {@code WorkflowPhase.description}.</li>
 *   <li>{@code expectedOutcome} — A concrete, testable definition of "done" for this phase.
 *                                 Carried in the blueprint for future AI context but intentionally
 *                                 not persisted today — see TODO in TemplateService.</li>
 * </ul>
 *
 * <h3>AI-Readiness note</h3>
 * {@code guidance} and {@code expectedOutcome} together form the semantic scaffold that a
 * future AI task-generation feature can consume to produce contextually appropriate tasks
 * rather than generic placeholders. Today, only {@code guidance} is written to the DB
 * ({@code WorkflowPhase.description}). {@code expectedOutcome} is preserved here as a
 * first-class field so the data model is correct from day one.
 */
public record PhaseTemplate(
        int    order,
        String name,
        String guidance,
        String expectedOutcome
) {}
