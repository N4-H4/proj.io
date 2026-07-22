package io.proj.projio.controller;

import io.proj.projio.dto.request.DeadlineUpdateRequest;
import io.proj.projio.dto.response.DeadlineHistoryResponse;
import io.proj.projio.dto.response.DeadlineResponse;
import io.proj.projio.service.DeadlineService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/deadlines")
@RequiredArgsConstructor
public class DeadlineController {

    private final DeadlineService deadlineService;

    @GetMapping
    public ResponseEntity<List<DeadlineResponse>> getUpcomingDeadlines() {
        return ResponseEntity.ok(deadlineService.getUpcomingDeadlines());
    }

    @PatchMapping("/{id}")
    public ResponseEntity<DeadlineResponse> extendDeadline(
            @PathVariable Long id,
            @Valid @RequestBody DeadlineUpdateRequest request) {
        return ResponseEntity.ok(deadlineService.updateDeadline(id, request));
    }

    /**
     * Returns the full audit trail of due-date changes for the given task/deadline.
     *
     * <p>Returns {@code 200 OK} with an empty list when the task exists but has
     * never been rescheduled. Returns {@code 404} when the task does not exist or
     * does not belong to the authenticated user.
     *
     * @param id the task ID (which serves as the deadline ID in this API)
     */
    @GetMapping("/{id}/history")
    public ResponseEntity<List<DeadlineHistoryResponse>> getDeadlineHistory(
            @PathVariable Long id) {
        return ResponseEntity.ok(deadlineService.getDeadlineHistory(id));
    }
}
