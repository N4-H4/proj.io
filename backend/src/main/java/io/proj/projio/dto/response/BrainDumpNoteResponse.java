package io.proj.projio.dto.response;

import io.proj.projio.entity.BrainDumpNote;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BrainDumpNoteResponse {

    private Long id;
    private String content;
    private Long projectId;
    private String projectTitle;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static BrainDumpNoteResponse from(BrainDumpNote note) {
        return BrainDumpNoteResponse.builder()
                .id(note.getId())
                .content(note.getContent())
                .projectId(note.getProject() != null ? note.getProject().getId() : null)
                .projectTitle(note.getProject() != null ? note.getProject().getTitle() : null)
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
