package io.proj.projio.service;

import io.proj.projio.dto.request.WorkflowPhaseRequest;
import io.proj.projio.dto.response.WorkflowPhaseResponse;
import io.proj.projio.entity.Project;
import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.WorkflowPhaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkflowService {

    private final WorkflowPhaseRepository workflowPhaseRepository;
    private final ProjectService projectService;

    public List<WorkflowPhaseResponse> getPhases(Long projectId) {
        // Verify project belongs to current user
        projectService.findProjectByIdAndUser(projectId);

        return workflowPhaseRepository.findByProjectIdOrderByPhaseOrderAsc(projectId)
                .stream()
                .map(WorkflowPhaseResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkflowPhaseResponse updatePhaseStatus(Long projectId, Long phaseId, WorkflowPhaseRequest request) {
        // Verify project belongs to current user
        projectService.findProjectByIdAndUser(projectId);

        WorkflowPhase phase = workflowPhaseRepository.findByIdAndProjectId(phaseId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("WorkflowPhase", "id", phaseId));

        phase.setStatus(request.getStatus());
        return WorkflowPhaseResponse.from(workflowPhaseRepository.save(phase));
    }
}
