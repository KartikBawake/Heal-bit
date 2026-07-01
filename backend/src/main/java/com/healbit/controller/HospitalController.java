package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.ApiResponse;
import com.healbit.dto.HospitalResponse;
import com.healbit.dto.HospitalUpdateRequest;
import com.healbit.service.HospitalService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/hospitals")
public class HospitalController {

    private final HospitalService hospitalService;

    public HospitalController(HospitalService hospitalService) {
        this.hospitalService = hospitalService;
    }

    /** Public: browse + search active hospitals. Optional ?city= or ?name= filters. */
    @GetMapping
    public ResponseEntity<List<HospitalResponse>> browse(
            @RequestParam(required = false) String city,
            @RequestParam(required = false) String name) {
        return ResponseEntity.ok(hospitalService.browseHospitals(city, name));
    }

    @GetMapping("/{id}")
    public ResponseEntity<HospitalResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(hospitalService.getById(id));
    }

    /** Hospital updates its own profile. */
    @PutMapping
    public ResponseEntity<HospitalResponse> updateProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody HospitalUpdateRequest request) {
        return ResponseEntity.ok(hospitalService.updateProfile(principal.getId(), request));
    }

    /** Hospital soft-deletes (deactivates) its own account. */
    @DeleteMapping
    public ResponseEntity<ApiResponse> delete(@AuthenticationPrincipal UserPrincipal principal) {
        hospitalService.softDelete(principal.getId());
        return ResponseEntity.ok(new ApiResponse(true, "Hospital account deactivated"));
    }
}
