package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.ApiResponse;
import com.healbit.dto.DoctorRequest;
import com.healbit.dto.DoctorResponse;
import com.healbit.service.DoctorService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/doctors")
public class DoctorController {

    private final DoctorService doctorService;

    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }

    /**
     * Public listing. ?hospitalId= lists a single hospital's doctors; ?mine=true (hospital token)
     * lists the authenticated hospital's own doctors.
     */
    @GetMapping
    public ResponseEntity<List<DoctorResponse>> list(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long hospitalId,
            @RequestParam(required = false, defaultValue = "false") boolean mine) {
        if (mine && principal != null && "HOSPITAL".equals(principal.getRole())) {
            return ResponseEntity.ok(doctorService.listOwnDoctors(principal.getId()));
        }
        return ResponseEntity.ok(doctorService.listDoctors(hospitalId));
    }

    /** Hospital adds a doctor (assigned to the authenticated hospital). */
    @PostMapping
    public ResponseEntity<DoctorResponse> add(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DoctorRequest request) {
        return new ResponseEntity<>(doctorService.addDoctor(principal.getId(), request), HttpStatus.CREATED);
    }

    /** Hospital updates one of its own doctors (doctorId supplied in body). */
    @PutMapping
    public ResponseEntity<DoctorResponse> update(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody DoctorRequest request) {
        return ResponseEntity.ok(doctorService.updateDoctor(principal.getId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        doctorService.deleteDoctor(principal.getId(), id);
        return ResponseEntity.ok(new ApiResponse(true, "Doctor removed"));
    }
}
