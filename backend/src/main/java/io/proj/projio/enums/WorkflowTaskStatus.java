package io.proj.projio.enums;

/**
 * Lifecycle status for a {@link io.proj.projio.entity.WorkflowTask}.
 *
 * <p><strong>MVP contract:</strong> {@code TODO} maps to "unchecked" and {@code DONE} maps to
 * "checked" in the frontend UI. The boolean {@code completed} flag on the DTO layer is derived
 * from this enum so that existing frontend code continues to work without modification.
 *
 * <p><strong>Extensibility note:</strong> Additional statuses (e.g. {@code IN_PROGRESS},
 * {@code BLOCKED}, {@code SKIPPED}) can be inserted here when the AI-assisted workflow
 * feature lands. The DTO bridge layer will remain backward-compatible.
 */
public enum WorkflowTaskStatus {
    TODO,
    DONE
}
