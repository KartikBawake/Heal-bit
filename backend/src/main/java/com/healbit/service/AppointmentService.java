package com.healbit.service;

import com.healbit.dto.AppointmentRequest;
import com.healbit.dto.AppointmentResponse;
import com.healbit.dto.AppointmentStatusUpdateRequest;
import com.healbit.entity.*;
import com.healbit.exception.AppointmentConflictException;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.exception.UnauthorizedException;
import com.healbit.repository.AppointmentRepository;
import com.healbit.repository.DoctorRepository;
import com.healbit.repository.PatientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Comparator;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Transactional
@Service
public class AppointmentService {

    private static final Set<AppointmentStatus> LIVE =
            EnumSet.of(AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED);

    private final AppointmentRepository appointmentRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;

    public AppointmentService(AppointmentRepository appointmentRepository,
                              PatientRepository patientRepository,
                              DoctorRepository doctorRepository) {
        this.appointmentRepository = appointmentRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
    }

    public AppointmentResponse bookAppointment(Long patientId, AppointmentRequest request) {
        Patient patient = patientRepository.findByPatientIdAndDeletedFalse(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + patientId));

        Doctor doctor = doctorRepository.findByDoctorIdAndDeletedFalse(request.getDoctorId())
                .orElseThrow(() -> new ResourceNotFoundException("Doctor not found with id " + request.getDoctorId()));

        Hospital hospital = doctor.getHospital();
        LocalDate date = request.getAppointmentDate();
        LocalTime time = request.getAppointmentTime();

        // Rule: cannot book past dates / times.
        if (date.isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Appointment date cannot be in the past");
        }
        if (date.equals(LocalDate.now()) && !time.isAfter(LocalTime.now())) {
            throw new IllegalArgumentException("Appointment time has already passed");
        }

        // Rule: the doctor must have a configured weekly schedule.
        if (!ScheduleUtil.scheduleConfigured(doctor)) {
            throw new AppointmentConflictException("This doctor has not published a schedule yet");
        }

        // Rule: the chosen day must be one of the doctor's working days.
        Set<DayOfWeek> days = ScheduleUtil.parseWorkingDays(doctor.getWorkingDays());
        if (!days.contains(date.getDayOfWeek())) {
            throw new AppointmentConflictException("The doctor does not work on the selected day");
        }

        // Rule: the time must be an exact 30-minute slot inside the working window.
        if (!ScheduleUtil.generateSlots(doctor.getStartTime(), doctor.getEndTime()).contains(time)) {
            throw new AppointmentConflictException(
                    "Please choose a valid 30-minute slot within the doctor's working hours");
        }

        // Rule: the slot must be free (fixed 30-min slots => one appointment per slot).
        boolean slotTaken = appointmentRepository
                .existsByDoctor_DoctorIdAndAppointmentDateAndAppointmentTimeAndStatusIn(
                        doctor.getDoctorId(), date, time, LIVE);
        if (slotTaken) {
            throw new AppointmentConflictException("That slot has just been booked. Please pick another time");
        }

        Appointment appointment = new Appointment();
        appointment.setPatient(patient);
        appointment.setHospital(hospital);
        appointment.setDoctor(doctor);
        appointment.setAppointmentDate(date);
        appointment.setAppointmentTime(time);
        appointment.setReason(request.getReason());
        appointment.setStatus(AppointmentStatus.PENDING);

        return toResponse(appointmentRepository.save(appointment));
    }

    public List<AppointmentResponse> getPatientAppointments(Long patientId) {
        return appointmentRepository.findByPatient_PatientId(patientId)
                .stream().map(this::toResponse).sorted(byDateTimeDesc()).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getHospitalAppointments(Long hospitalId) {
        return appointmentRepository.findByHospital_HospitalId(hospitalId)
                .stream().map(this::toResponse).sorted(byDateTimeDesc()).collect(Collectors.toList());
    }

    public List<AppointmentResponse> getDoctorAppointments(Long doctorId) {
        return appointmentRepository.findByDoctor_DoctorId(doctorId)
                .stream().map(this::toResponse).sorted(byDateTimeDesc()).collect(Collectors.toList());
    }

    /** Doctor confirms / rejects / completes one of their own appointments. */
    public AppointmentResponse updateStatusByDoctor(Long doctorId, AppointmentStatusUpdateRequest request) {
        Appointment appointment = appointmentRepository.findById(request.getAppointmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Appointment not found with id " + request.getAppointmentId()));

        if (!appointment.getDoctor().getDoctorId().equals(doctorId)) {
            throw new UnauthorizedException("Doctors can only manage their own appointments");
        }

        AppointmentStatus target = request.getStatus();
        AppointmentStatus current = appointment.getStatus();

        if (current == AppointmentStatus.CANCELLED || current == AppointmentStatus.COMPLETED
                || current == AppointmentStatus.REJECTED) {
            throw new AppointmentConflictException("This appointment can no longer be changed");
        }
        Set<AppointmentStatus> allowed =
                EnumSet.of(AppointmentStatus.CONFIRMED, AppointmentStatus.REJECTED, AppointmentStatus.COMPLETED);
        if (!allowed.contains(target)) {
            throw new IllegalArgumentException("A doctor can only confirm, reject, or complete an appointment");
        }
        if (target == AppointmentStatus.COMPLETED && current != AppointmentStatus.CONFIRMED) {
            throw new AppointmentConflictException("Only a confirmed appointment can be marked completed");
        }

        appointment.setStatus(target);
        return toResponse(appointmentRepository.save(appointment));
    }

    /** Patient cancels their own appointment (soft cancel -> status CANCELLED, preserves history). */
    public void cancelAppointment(Long patientId, Long appointmentId) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Appointment not found with id " + appointmentId));

        if (!appointment.getPatient().getPatientId().equals(patientId)) {
            throw new UnauthorizedException("You can only cancel your own appointments");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new AppointmentConflictException("A completed appointment cannot be cancelled");
        }

        appointment.setStatus(AppointmentStatus.CANCELLED);
        appointmentRepository.save(appointment);
    }

    private Comparator<AppointmentResponse> byDateTimeDesc() {
        return Comparator
                .comparing(AppointmentResponse::getAppointmentDate, Comparator.reverseOrder())
                .thenComparing(AppointmentResponse::getAppointmentTime, Comparator.reverseOrder());
    }

    private AppointmentResponse toResponse(Appointment a) {
        AppointmentResponse r = new AppointmentResponse();
        r.setAppointmentId(a.getAppointmentId());
        r.setPatientId(a.getPatient().getPatientId());
        r.setPatientName(a.getPatient().getFullName());
        r.setHospitalId(a.getHospital().getHospitalId());
        r.setHospitalName(a.getHospital().getHospitalName());
        r.setDoctorId(a.getDoctor().getDoctorId());
        r.setDoctorName(a.getDoctor().getDoctorName());
        r.setDoctorSpecialization(a.getDoctor().getSpecialization());
        r.setAppointmentDate(a.getAppointmentDate());
        r.setAppointmentTime(a.getAppointmentTime());
        r.setReason(a.getReason());
        r.setStatus(a.getStatus());
        r.setCreatedAt(a.getCreatedAt());
        return r;
    }
}
