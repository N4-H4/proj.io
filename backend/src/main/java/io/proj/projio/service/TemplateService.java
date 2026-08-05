package io.proj.projio.service;

import io.proj.projio.config.DomainTemplateConfig;
import io.proj.projio.config.PhaseTemplate;
import io.proj.projio.entity.Project;
import io.proj.projio.entity.WorkflowPhase;
import io.proj.projio.enums.WorkflowStatus;
import io.proj.projio.repository.WorkflowPhaseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TemplateService {

    private final WorkflowPhaseRepository workflowPhaseRepository;

    /**
     * Spawns workflow phases for the given project based on its domain.
     *
     * <p>Retrieves the ordered {@link PhaseTemplate} blueprint list from
     * {@link DomainTemplateConfig#getTemplates(String)} — which handles all
     * null/blank/unrecognised domain fallback internally — then maps each
     * blueprint onto a persisted {@link WorkflowPhase} entity.
     *
     * <p><strong>Tasks are NOT auto-generated.</strong> Each phase starts with an
     * empty task list. Users create their own tasks via the WorkflowTask API.
     *
     * <h3>Field mapping — Phase</h3>
     * <ul>
     *   <li>{@code PhaseTemplate.name()}               → {@code WorkflowPhase.name}</li>
     *   <li>{@code PhaseTemplate.guidance()}            → {@code WorkflowPhase.guidance} (TEXT)</li>
     *   <li>{@code PhaseTemplate.guidance()}            → {@code WorkflowPhase.description}
     *       (also written for backward compatibility with legacy consumers)</li>
     *   <li>{@code PhaseTemplate.expectedOutcome()}     → {@code WorkflowPhase.expectedOutcome} (TEXT)</li>
     *   <li>{@code PhaseTemplate.completionCriteria()}  → {@code WorkflowPhase.completionCriteria} (TEXT,
     *       newline-separated checklist)</li>
     *   <li>{@code PhaseTemplate.order()}               → {@code WorkflowPhase.phaseOrder}</li>
     *   <li>{@code WorkflowStatus.NOT_STARTED}          → {@code WorkflowPhase.status} (default)</li>
     * </ul>
     *
     * @param project the newly created project whose domain drives template selection
     */
    public void spawnPhases(Project project) {
        List<PhaseTemplate> templates = DomainTemplateConfig.getTemplates(project.getDomain());

        for (PhaseTemplate template : templates) {
            WorkflowPhase phase = WorkflowPhase.builder()
                    .project(project)
                    .name(template.name())
                    .description(template.guidance())   // backward-compat copy
                    .guidance(template.guidance())
                    .expectedOutcome(template.expectedOutcome())
                    .completionCriteria(template.completionCriteria())
                    .phaseOrder(template.order())
                    .status(WorkflowStatus.NOT_STARTED)
                    .build();
            workflowPhaseRepository.save(phase);
        }
    }
}