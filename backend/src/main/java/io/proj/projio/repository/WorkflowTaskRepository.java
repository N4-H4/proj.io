package io.proj.projio.repository;

import io.proj.projio.entity.WorkflowTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowTaskRepository extends JpaRepository<WorkflowTask, Long> {

    /** All tasks for a phase, ordered for display. */
    List<WorkflowTask> findByWorkflowPhaseIdOrderByTaskOrderAsc(Long phaseId);

    /** Verify a task belongs to the given phase (guards against cross-phase mutations). */
    Optional<WorkflowTask> findByIdAndWorkflowPhaseId(Long id, Long phaseId);

    /** Max taskOrder in a phase — used to append new tasks at the end. */
    @Query("SELECT COALESCE(MAX(t.taskOrder), -1) FROM WorkflowTask t WHERE t.workflowPhase.id = :phaseId")
    int findMaxTaskOrderByPhaseId(@Param("phaseId") Long phaseId);

    /** Delete all tasks belonging to a phase (used if a phase is deleted). */
    void deleteAllByWorkflowPhaseId(Long phaseId);
}
