package com.healbit.repository;

import com.healbit.entity.Appointment;
import com.healbit.entity.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

    List<Appointment> findByPatient_PatientId(Long patientId);

    List<Appointment> findByHospital_HospitalId(Long hospitalId);

    List<Appointment> findByDoctor_DoctorId(Long doctorId);

    boolean existsByPatient_PatientIdAndDoctor_DoctorIdAndAppointmentDateAndAppointmentTimeAndStatusNot(
            Long patientId, Long doctorId, LocalDate appointmentDate, LocalTime appointmentTime, AppointmentStatus status);

    long count();

    long countByStatus(AppointmentStatus status);
}
