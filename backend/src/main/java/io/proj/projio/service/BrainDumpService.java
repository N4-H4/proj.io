package io.proj.projio.service;

import io.proj.projio.dto.request.BrainDumpNoteRequest;
import io.proj.projio.dto.response.BrainDumpNoteResponse;
import io.proj.projio.entity.BrainDumpNote;
import io.proj.projio.entity.Project;
import io.proj.projio.exception.ResourceNotFoundException;
import io.proj.projio.repository.BrainDumpNoteRepository;
import io.proj.projio.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BrainDumpService {

    private final BrainDumpNoteRepository noteRepository;
    private final ProjectRepository projectRepository;
    private final UserService userService;

    public List<BrainDumpNoteResponse> getAllNotes(Long projectId) {
        Long userId = userService.getCurrentUserId();
        List<BrainDumpNote> notes;

        if (projectId != null) {
            notes = noteRepository.findByUserIdAndProjectIdOrderByCreatedAtDesc(userId, projectId);
        } else {
            notes = noteRepository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return notes.stream().map(BrainDumpNoteResponse::from).collect(Collectors.toList());
    }

    public List<BrainDumpNoteResponse> getGlobalNotes() {
        Long userId = userService.getCurrentUserId();
        return noteRepository.findByUserIdAndProjectIsNullOrderByCreatedAtDesc(userId)
                .stream().map(BrainDumpNoteResponse::from).collect(Collectors.toList());
    }

    public BrainDumpNoteResponse getNote(Long id) {
        BrainDumpNote note = findNoteByIdAndUser(id);
        return BrainDumpNoteResponse.from(note);
    }

    @Transactional
    public BrainDumpNoteResponse createNote(BrainDumpNoteRequest request) {
        Project project = null;
        if (request.getProjectId() != null) {
            Long userId = userService.getCurrentUserId();
            project = projectRepository.findByIdAndUserId(request.getProjectId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));
        }

        BrainDumpNote note = BrainDumpNote.builder()
                .user(userService.getCurrentUser())
                .project(project)
                .content(request.getContent())
                .build();

        return BrainDumpNoteResponse.from(noteRepository.save(note));
    }

    @Transactional
    public BrainDumpNoteResponse updateNote(Long id, BrainDumpNoteRequest request) {
        BrainDumpNote note = findNoteByIdAndUser(id);
        note.setContent(request.getContent());

        if (request.getProjectId() != null) {
            Long userId = userService.getCurrentUserId();
            Project project = projectRepository.findByIdAndUserId(request.getProjectId(), userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Project", "id", request.getProjectId()));
            note.setProject(project);
        } else {
            note.setProject(null);
        }

        return BrainDumpNoteResponse.from(noteRepository.save(note));
    }

    @Transactional
    public void deleteNote(Long id) {
        BrainDumpNote note = findNoteByIdAndUser(id);
        noteRepository.delete(note);
    }

    private BrainDumpNote findNoteByIdAndUser(Long id) {
        Long userId = userService.getCurrentUserId();
        return noteRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Brain dump note", "id", id));
    }
}
