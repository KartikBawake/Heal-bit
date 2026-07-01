package com.healbit.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.healbit.dto.AdminDashboardResponse;
import com.healbit.dto.HospitalResponse;
import com.healbit.dto.PatientProfileResponse;
import com.healbit.entity.AppointmentStatus;
import com.healbit.entity.Hospital;
import com.healbit.entity.HospitalStatus;
import com.healbit.entity.Patient;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.repository.AppointmentRepository;
import com.healbit.repository.DoctorRepository;
import com.healbit.repository.HospitalRepository;
import com.healbit.repository.PatientRepository;

@Transactional
@Service
public class AdminService {

    private final HospitalRepository hospitalRepository;
    private final PatientRepository patientRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    public AdminService(HospitalRepository hospitalRepository,
                        PatientRepository patientRepository,
                        DoctorRepository doctorRepository,
                        AppointmentRepository appointmentRepository) {
        this.hospitalRepository = hospitalRepository;
        this.patientRepository = patientRepository;
        this.doctorRepository = doctorRepository;
        this.appointmentRepository = appointmentRepository;
    }

    public List<HospitalResponse> getAllHospitals() {
        return hospitalRepository.findAllByDeletedFalse()
                .stream().map(this::toHospitalResponse).collect(Collectors.toList());
    }

    public HospitalResponse approveHospital(Long hospitalId) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));
        hospital.setStatus(HospitalStatus.ACTIVE);
        return toHospitalResponse(hospitalRepository.save(hospital));
    }

    public HospitalResponse rejectHospital(Long hospitalId) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));
        hospital.setStatus(HospitalStatus.REJECTED);
        return toHospitalResponse(hospitalRepository.save(hospital));
    }

    public void removeHospital(Long hospitalId) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));
        hospital.setDeleted(true);
        hospitalRepository.save(hospital);
    }

    public List<PatientProfileResponse> getAllPatients() {
        return patientRepository.findAllByDeletedFalse()
                .stream().map(this::toPatientResponse).collect(Collectors.toList());
    }

    public void deletePatient(Long patientId) {
        Patient patient = patientRepository.findByPatientIdAndDeletedFalse(patientId)
                .orElseThrow(() -> new ResourceNotFoundException("Patient not found with id " + patientId));
        patient.setDeleted(true);
        patientRepository.save(patient);
    }

    public AdminDashboardResponse getDashboard() {
        AdminDashboardResponse dto = new AdminDashboardResponse();
        dto.setTotalPatients(patientRepository.countByDeletedFalse());
        dto.setTotalHospitals(hospitalRepository.countByDeletedFalse());
        dto.setPendingHospitals(hospitalRepository.countByStatusAndDeletedFalse(HospitalStatus.PENDING));
        dto.setActiveHospitals(hospitalRepository.countByStatusAndDeletedFalse(HospitalStatus.ACTIVE));
        dto.setRejectedHospitals(hospitalRepository.countByStatusAndDeletedFalse(HospitalStatus.REJECTED));
        dto.setTotalDoctors(doctorRepository.countByDeletedFalse());
        dto.setTotalAppointments(appointmentRepository.count());
        dto.setPendingAppointments(appointmentRepository.countByStatus(AppointmentStatus.PENDING));
        dto.setConfirmedAppointments(appointmentRepository.countByStatus(AppointmentStatus.CONFIRMED));
        dto.setCompletedAppointments(appointmentRepository.countByStatus(AppointmentStatus.COMPLETED));
        dto.setCancelledAppointments(appointmentRepository.countByStatus(AppointmentStatus.CANCELLED));
        return dto;
    }

    private HospitalResponse toHospitalResponse(Hospital h) {
        HospitalResponse r = new HospitalResponse();
        r.setHospitalId(h.getHospitalId());
        r.setHospitalName(h.getHospitalName());
        r.setRegistrationNumber(h.getRegistrationNumber());
        r.setEmail(h.getEmail());
        r.setPhone(h.getPhone());
        r.setAddress(h.getAddress());
        r.setCity(h.getCity());
        r.setState(h.getState());
        r.setPincode(h.getPincode());
        r.setDescription(h.getDescription());
        r.setStatus(h.getStatus());
        r.setCreatedAt(h.getCreatedAt());
        return r;
    }

    private PatientProfileResponse toPatientResponse(Patient p) {
        PatientProfileResponse r = new PatientProfileResponse();
        r.setPatientId(p.getPatientId());
        r.setFullName(p.getFullName());
        r.setEmail(p.getEmail());
        r.setPhoneNumber(p.getPhoneNumber());
        r.setAge(p.getAge());
        r.setGender(p.getGender());
        r.setAddress(p.getAddress());
        r.setCreatedAt(p.getCreatedAt());
        return r;
    }
}
