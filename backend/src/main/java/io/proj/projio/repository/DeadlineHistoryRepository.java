package io.proj.projio.repository;

import io.proj.projio.entity.DeadlineHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Persistence layer for {@link DeadlineHistory} audit records.
 */
@Repository
public interface DeadlineHistoryRepository extends JpaRepository<DeadlineHistory, Long> {

    /**
     * Returns all history entries for the given task, newest first.
     *
     * @param taskId the primary key of the task acting as the deadline
     * @return an ordered list; empty if no history exists yet
     */
    List<DeadlineHistory> findByTaskIdOrderByCreatedAtDesc(Long taskId);

    /**
     * Returns the total number of history records for the given task.
     * Used to populate the {@code extensionCount} field on {@link io.proj.projio.dto.response.DeadlineResponse}.
     *
     * @param taskId the primary key of the task
     * @return the count of history entries; 0 if none exist
     */
    long countByTaskId(Long taskId);
}
