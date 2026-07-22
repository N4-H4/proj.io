package io.proj.projio.repository;

import io.proj.projio.entity.Project;
import io.proj.projio.enums.ProjectStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    Page<Project> findByUserId(Long userId, Pageable pageable);

    List<Project> findByUserIdAndArchivedOrderByCreatedAtDesc(Long userId, Boolean archived);

    List<Project> findByUserIdAndStatusAndArchivedOrderByCreatedAtDesc(Long userId, ProjectStatus status, Boolean archived);

    List<Project> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Project> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, ProjectStatus status);

    long countByUserIdAndArchived(Long userId, Boolean archived);

    Optional<Project> findFirstByUserIdAndStatusAndArchivedFalseOrderByUpdatedAtDesc(
            Long userId, ProjectStatus status);

}
