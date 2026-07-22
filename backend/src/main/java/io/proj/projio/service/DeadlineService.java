package io.proj.projio.service;

import io.proj.projio.dto.request.DeadlineUpdateRequest;
import io.proj.projio.dto.response.DeadlineHistoryResponse;
import io.proj.projio.dto.response.DeadlineResponse;
import io.proj.projio.entity.DeadlineHistory;
import io.proj.projio.entity.Task;
import io.proj.projio.enums.DeadlineAction;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.DeadlineHistoryRepository;
import io.proj.projio.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class DeadlineService {

    private final TaskRepository taskRepository;
    private final DeadlineHistoryRepository deadlineHistoryRepository;
    private final UserService userService;

    /**
     * Fetches all deadline-bearing tasks for the currently authenticated user,
     * sorted chronologically ascending by due date.
     *
     * @return a chronologically sorted {@link List} of {@link DeadlineResponse};
     *         never {@code null}, empty when no task deadlines exist.
     */
    public List<DeadlineResponse> getUpcomingDeadlines() {
        Long userId = userService.getCurrentUserId();
        log.debug("Fetching upcoming task deadlines for userId={}", userId);

        return taskRepository
                .findAllWithDueDateByUserId(userId)
                .stream()
                .map(this::toTaskDeadline)
                .sorted(Comparator.comparing(DeadlineResponse::getDeadline))
                .collect(Collectors.toList());
    }

    /**
     * Updates the {@code dueDate} of the task identified by {@code id}, provided
     * the task belongs to the currently authenticated user.
     *
     * <p>A {@link DeadlineHistory} record is written after a successful save if and
     * only if the new date differs from the previous value (diff-check). Setting a
     * date for the first time records {@link DeadlineAction#DEADLINE_SET};
     * changing an existing date records {@link DeadlineAction#DEADLINE_RESCHEDULED}.
     *
     * @param id      primary key of the task whose deadline is being updated
     * @param request validated request body containing the new deadline date
     * @return the updated {@link DeadlineResponse}
     * @throws ResourceNotFoundException if no task with the given {@code id}
     *                                   exists for the authenticated user
     */
    @Transactional
    public DeadlineResponse updateDeadline(Long id, DeadlineUpdateRequest request) {
        Long userId = userService.getCurrentUserId();
        log.debug("Updating deadline for taskId={} by userId={}", id, userId);

        Task task = taskRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", id));

        // ── Diff-check: capture the old value BEFORE mutating the entity ──────
        LocalDate oldDate = task.getDueDate();
        LocalDate newDate = request.getDeadline();

        task.setDueDate(newDate);
        Task saved = taskRepository.save(task);

        // Only write a history record when the date actually changed.
        if (!newDate.equals(oldDate)) {
            DeadlineAction action = (oldDate == null)
                    ? DeadlineAction.DEADLINE_SET
                    : DeadlineAction.DEADLINE_RESCHEDULED;
            recordHistory(saved, action, oldDate, newDate);
            log.info("Deadline {} for taskId={} — old={}, new={}", action, id, oldDate, newDate);
        } else {
            log.debug("Deadline unchanged for taskId={} ({}), skipping history record.", id, newDate);
        }

        return toTaskDeadline(saved);
    }

    /**
     * Returns the full history of due-date changes for the task identified by
     * {@code taskId}, ordered newest-first.
     *
     * <p>Ownership is validated using the same {@code findByIdAndUserId} query
     * employed by {@link #updateDeadline}, ensuring cross-user reads are rejected
     * with a {@code 404}.
     *
     * @param taskId primary key of the task (i.e. the deadline ID in the API)
     * @return a list of {@link DeadlineHistoryResponse}; empty when no history
     *         exists yet for a valid task
     * @throws ResourceNotFoundException if no task with the given {@code id}
     *                                   exists for the authenticated user
     */
    public List<DeadlineHistoryResponse> getDeadlineHistory(Long taskId) {
        Long userId = userService.getCurrentUserId();
        log.debug("Fetching deadline history for taskId={} by userId={}", taskId, userId);

        // Ownership check — throws 404 for unknown or un-owned tasks.
        taskRepository.findByIdAndUserId(taskId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        return deadlineHistoryRepository
                .findByTaskIdOrderByCreatedAtDesc(taskId)
                .stream()
                .map(this::toHistoryResponse)
                .collect(Collectors.toList());
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Persists a single {@link DeadlineHistory} record. Kept private to ensure
     * all history-creation paths remain inside this service.
     *
     * @param task          the already-saved task entity
     * @param action        the type of deadline change
     * @param previousDate  the due date prior to this update; {@code null} when
     *                      this is the first assignment
     * @param newDate       the due date after this update
     */
    private void recordHistory(Task task, DeadlineAction action,
                               LocalDate previousDate, LocalDate newDate) {
        String changedBy = SecurityContextHolder.getContext()
                .getAuthentication()
                .getName();  // Returns the email used as the principal in this project.

        DeadlineHistory history = DeadlineHistory.builder()
                .task(task)
                .action(action)
                .previousValue(previousDate != null ? previousDate.toString() : null)
                .newValue(newDate.toString())
                .changedBy(changedBy)
                .build();

        deadlineHistoryRepository.save(history);
    }

    /**
     * Maps a {@link Task} entity to a {@link DeadlineResponse}. The parent
     * project's {@code id} and {@code title} are read from the already-fetched
     * join (no lazy-load).
     */
    private DeadlineResponse toTaskDeadline(Task task) {
        return DeadlineResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .deadline(task.getDueDate())
                .projectId(task.getProject().getId())
                .projectTitle(task.getProject().getTitle())
                .extensionCount(deadlineHistoryRepository.countByTaskId(task.getId()))
                .build();
    }

    /**
     * Maps a {@link DeadlineHistory} entity to its response DTO.
     */
    private DeadlineHistoryResponse toHistoryResponse(DeadlineHistory h) {
        return DeadlineHistoryResponse.builder()
                .id(h.getId())
                .taskId(h.getTask().getId())
                .action(h.getAction().name())
                .previousValue(h.getPreviousValue())
                .newValue(h.getNewValue())
                .changedBy(h.getChangedBy())
                .createdAt(h.getCreatedAt())
                .build();
    }
}
