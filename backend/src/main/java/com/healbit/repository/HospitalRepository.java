package com.healbit.repository;

import com.healbit.entity.Hospital;
import com.healbit.entity.HospitalStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HospitalRepository extends JpaRepository<Hospital, Long> {

    Optional<Hospital> findByEmail(String email);

    Optional<Hospital> findByEmailAndDeletedFalse(String email);

    boolean existsByEmail(String email);

    boolean existsByRegistrationNumber(String registrationNumber);

    Optional<Hospital> findByHospitalIdAndDeletedFalse(Long hospitalId);

    List<Hospital> findAllByStatusAndDeletedFalse(HospitalStatus status);

    List<Hospital> findAllByDeletedFalse();

    List<Hospital> findByStatusAndDeletedFalseAndCityContainingIgnoreCase(HospitalStatus status, String city);

    List<Hospital> findByStatusAndDeletedFalseAndHospitalNameContainingIgnoreCase(HospitalStatus status, String hospitalName);

    long countByStatusAndDeletedFalse(HospitalStatus status);

    long countByDeletedFalse();
}
