package io.proj.projio.repository;

import io.proj.projio.entity.Task;
import io.proj.projio.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {

    List<Task> findByProjectIdOrderByPositionAsc(Long projectId);

    List<Task> findByProjectIdAndStatusOrderByPositionAsc(Long projectId, TaskStatus status);

    List<Task> findByProjectId(Long projectId);

    List<Task> findByProjectIdAndStatus(Long projectId, TaskStatus status);

    long countByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, TaskStatus status);

    Optional<Task> findByIdAndProjectId(Long id, Long projectId);

    @Query("SELECT t FROM Task t JOIN t.project p WHERE p.user.id = :userId ORDER BY t.dueDate ASC")
    List<Task> findAllByUserId(@Param("userId") Long userId);

    @Query("SELECT t FROM Task t JOIN t.project p WHERE p.user.id = :userId AND t.status = :status ORDER BY t.dueDate ASC")
    List<Task> findAllByUserIdAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);

    @Query("SELECT COUNT(t) FROM Task t JOIN t.project p WHERE p.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT COUNT(t) FROM Task t JOIN t.project p WHERE p.user.id = :userId AND t.status = :status")
    long countByUserIdAndStatus(@Param("userId") Long userId, @Param("status") TaskStatus status);

    @Query("SELECT t FROM Task t JOIN t.project p WHERE p.user.id = :userId AND t.dueDate IS NOT NULL AND t.dueDate >= :fromDate AND t.status != 'DONE' ORDER BY t.dueDate ASC")
    List<Task> findUpcomingDeadlinesByUserId(@Param("userId") Long userId, @Param("fromDate") LocalDate fromDate);

    @Query("SELECT COALESCE(MAX(t.position), -1) FROM Task t WHERE t.project.id = :projectId")
    int findMaxPositionByProjectId(@Param("projectId") Long projectId);

    @Query("SELECT COUNT(t) FROM Task t JOIN t.project p WHERE p.user.id = :userId AND t.status = 'DONE' AND t.updatedAt >= :since")
    long countCompletedByUserSince(@Param("userId") Long userId, @Param("since") java.time.LocalDateTime since);
}
