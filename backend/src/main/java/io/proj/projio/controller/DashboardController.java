package io.proj.projio.controller;

import io.proj.projio.dto.response.DashboardStatsResponse;
import io.proj.projio.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsResponse> getStats() {
        return ResponseEntity.ok(dashboardService.getStats());
    }

    @GetMapping("/deadlines")
    public ResponseEntity<List<DashboardStatsResponse.DeadlineItem>> getDeadlines(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(dashboardService.getDeadlines(days));
    }
}
