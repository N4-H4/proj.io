package io.proj.projio.repository;

import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.enums.WorkflowStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkflowPhaseRepository extends JpaRepository<WorkflowPhase, Long> {

    List<WorkflowPhase> findByProjectIdOrderByPhaseOrderAsc(Long projectId);

    Optional<WorkflowPhase> findByIdAndProjectId(Long id, Long projectId);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, WorkflowStatus status);
}
