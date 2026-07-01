package com.healbit.service;

import com.healbit.dto.*;
import com.healbit.entity.Admin;
import com.healbit.entity.Hospital;
import com.healbit.entity.HospitalStatus;
import com.healbit.entity.Patient;
import com.healbit.exception.DuplicateResourceException;
import com.healbit.exception.HospitalNotApprovedException;
import com.healbit.exception.UnauthorizedException;
import com.healbit.repository.AdminRepository;
import com.healbit.repository.HospitalRepository;
import com.healbit.repository.PatientRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
@Transactional
@Service
public class AuthenticationService {

    private final PatientRepository patientRepository;
    private final HospitalRepository hospitalRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthenticationService(PatientRepository patientRepository,
                                 HospitalRepository hospitalRepository,
                                 AdminRepository adminRepository,
                                 PasswordEncoder passwordEncoder,
                                 JwtService jwtService) {
        this.patientRepository = patientRepository;
        this.hospitalRepository = hospitalRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    // ---------------- PATIENT ----------------

    public LoginResponse registerPatient(PatientRegisterRequest request) {
        if (patientRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A patient with this email already exists");
        }

        Patient patient = new Patient();
        patient.setFullName(request.getFullName());
        patient.setEmail(request.getEmail());
        patient.setPassword(passwordEncoder.encode(request.getPassword()));
        patient.setPhoneNumber(request.getPhoneNumber());
        patient.setAge(request.getAge());
        patient.setGender(request.getGender());
        patient.setAddress(request.getAddress());

        Patient saved = patientRepository.save(patient);

        String token = jwtService.generateToken(saved.getPatientId(), saved.getEmail(), "PATIENT");
        return new LoginResponse(token, saved.getPatientId(), saved.getFullName(), saved.getEmail(), "PATIENT");
    }

    public LoginResponse loginPatient(PatientLoginRequest request) {
        Patient patient = patientRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), patient.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(patient.getPatientId(), patient.getEmail(), "PATIENT");
        return new LoginResponse(token, patient.getPatientId(), patient.getFullName(), patient.getEmail(), "PATIENT");
    }

    // ---------------- HOSPITAL ----------------

    public LoginResponse registerHospital(HospitalRegisterRequest request) {
        if (hospitalRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("A hospital with this email already exists");
        }
        if (hospitalRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateResourceException("A hospital with this registration number already exists");
        }

        Hospital hospital = new Hospital();
        hospital.setHospitalName(request.getHospitalName());
        hospital.setRegistrationNumber(request.getRegistrationNumber());
        hospital.setEmail(request.getEmail());
        hospital.setPassword(passwordEncoder.encode(request.getPassword()));
        hospital.setPhone(request.getPhone());
        hospital.setAddress(request.getAddress());
        hospital.setCity(request.getCity());
        hospital.setState(request.getState());
        hospital.setPincode(request.getPincode());
        hospital.setDescription(request.getDescription());
        hospital.setStatus(HospitalStatus.PENDING);

        Hospital saved = hospitalRepository.save(hospital);

        // No token at registration: hospital must be approved by an admin before it can log in.
        LoginResponse response = new LoginResponse();
        response.setToken(null);
        response.setUserId(saved.getHospitalId());
        response.setName(saved.getHospitalName());
        response.setEmail(saved.getEmail());
        response.setRole("HOSPITAL");
        return response;
    }

    public LoginResponse loginHospital(HospitalLoginRequest request) {
        Hospital hospital = hospitalRepository.findByEmailAndDeletedFalse(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), hospital.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (hospital.getStatus() != HospitalStatus.ACTIVE) {
            throw new HospitalNotApprovedException(
                    "Hospital account is " + hospital.getStatus() + ". Login is allowed only after admin approval.");
        }

        String token = jwtService.generateToken(hospital.getHospitalId(), hospital.getEmail(), "HOSPITAL");
        return new LoginResponse(token, hospital.getHospitalId(), hospital.getHospitalName(), hospital.getEmail(), "HOSPITAL");
    }

    // ---------------- ADMIN ----------------

    public LoginResponse loginAdmin(AdminLoginRequest request) {
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        String token = jwtService.generateToken(admin.getAdminId(), admin.getEmail(), "ADMIN");
        return new LoginResponse(token, admin.getAdminId(), "Administrator", admin.getEmail(), "ADMIN");
    }
}
