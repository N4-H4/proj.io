package io.proj.projio.repository;

import io.proj.projio.entity.BrainDumpNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BrainDumpNoteRepository extends JpaRepository<BrainDumpNote, Long> {

    List<BrainDumpNote> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<BrainDumpNote> findByUserIdAndProjectIdOrderByCreatedAtDesc(Long userId, Long projectId);

    List<BrainDumpNote> findByUserIdAndProjectIsNullOrderByCreatedAtDesc(Long userId);

    Optional<BrainDumpNote> findByIdAndUserId(Long id, Long userId);
}
