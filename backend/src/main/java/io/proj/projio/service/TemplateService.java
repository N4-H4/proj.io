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
     * <h3>Field mapping</h3>
     * <ul>
     *   <li>{@code PhaseTemplate.name()}            → {@code WorkflowPhase.name}</li>
     *   <li>{@code PhaseTemplate.guidance()}         → {@code WorkflowPhase.description}
     *       (populates the existing {@code description TEXT} column with meaningful context)</li>
     *   <li>{@code PhaseTemplate.order()}            → {@code WorkflowPhase.phaseOrder}</li>
     *   <li>{@code WorkflowStatus.NOT_STARTED}       → {@code WorkflowPhase.status} (default)</li>
     * </ul>
     *
     * <h3>Future AI-readiness extension point</h3>
     * {@code PhaseTemplate.expectedOutcome()} is intentionally <em>not</em> persisted today.
     * Once {@code WorkflowPhase} gains an {@code expected_outcome} column (and the corresponding
     * migration), map it here:
     * <pre>
     *   // TODO(AI-READINESS): .expectedOutcome(template.expectedOutcome())
     * </pre>
     * This field exists on the blueprint so the data model is correct from day one
     * and the future column can be back-filled from the static config without any
     * structural changes to {@link DomainTemplateConfig} or {@link PhaseTemplate}.
     *
     * @param project the newly created project whose domain drives template selection
     */
    public void spawnPhases(Project project) {
        List<PhaseTemplate> templates = DomainTemplateConfig.getTemplates(project.getDomain());

        for (PhaseTemplate template : templates) {
            WorkflowPhase phase = WorkflowPhase.builder()
                    .project(project)
                    .name(template.name())
                    .description(template.guidance())
                    .phaseOrder(template.order())
                    .status(WorkflowStatus.NOT_STARTED)
                    // TODO(AI-READINESS): .expectedOutcome(template.expectedOutcome())
                    //   Deferred until WorkflowPhase gains an expected_outcome column.
                    //   See PhaseTemplate.expectedOutcome() for the ready-to-use value.
                    .build();
            workflowPhaseRepository.save(phase);
        }
    }
}