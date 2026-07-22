package io.proj.projio.enums;

/**
 * Represents the type of change recorded in a {@code DeadlineHistory} entry.
 *
 * <ul>
 *   <li>{@link #DEADLINE_SET} – a due date was assigned to a task that previously had none.</li>
 *   <li>{@link #DEADLINE_RESCHEDULED} – an existing due date was changed to a different value.</li>
 * </ul>
 */
public enum DeadlineAction {
    DEADLINE_SET,
    DEADLINE_RESCHEDULED
}
