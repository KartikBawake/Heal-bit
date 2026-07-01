package com.healbit.controller;

import com.healbit.dto.*;
import com.healbit.service.AuthenticationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationService authenticationService;

    public AuthController(AuthenticationService authenticationService) {
        this.authenticationService = authenticationService;
    }

    @PostMapping("/patient/register")
    public ResponseEntity<LoginResponse> registerPatient(@Valid @RequestBody PatientRegisterRequest request) {
        return new ResponseEntity<>(authenticationService.registerPatient(request), HttpStatus.CREATED);
    }

    @PostMapping("/patient/login")
    public ResponseEntity<LoginResponse> loginPatient(@Valid @RequestBody PatientLoginRequest request) {
        return ResponseEntity.ok(authenticationService.loginPatient(request));
    }

    @PostMapping("/hospital/register")
    public ResponseEntity<LoginResponse> registerHospital(@Valid @RequestBody HospitalRegisterRequest request) {
        return new ResponseEntity<>(authenticationService.registerHospital(request), HttpStatus.CREATED);
    }

    @PostMapping("/hospital/login")
    public ResponseEntity<LoginResponse> loginHospital(@Valid @RequestBody HospitalLoginRequest request) {
        return ResponseEntity.ok(authenticationService.loginHospital(request));
    }

    @PostMapping("/admin/login")
    public ResponseEntity<LoginResponse> loginAdmin(@Valid @RequestBody AdminLoginRequest request) {
        return ResponseEntity.ok(authenticationService.loginAdmin(request));
    }
}
