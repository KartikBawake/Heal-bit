package com.healbit.controller;

import com.healbit.config.UserPrincipal;
import com.healbit.dto.ApiResponse;
import com.healbit.dto.AppointmentRequest;
import com.healbit.dto.AppointmentResponse;
import com.healbit.dto.AppointmentStatusUpdateRequest;
import com.healbit.service.AppointmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/appointments")
public class AppointmentController {

    private final AppointmentService appointmentService;

    public AppointmentController(AppointmentService appointmentService) {
        this.appointmentService = appointmentService;
    }

    /** Patient books an appointment. */
    @PostMapping
    public ResponseEntity<AppointmentResponse> book(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AppointmentRequest request) {
        return new ResponseEntity<>(appointmentService.bookAppointment(principal.getId(), request), HttpStatus.CREATED);
    }

    /**
     * Returns appointments for the current actor:
     * patients get their own history; hospitals get appointments made at their hospital.
     */
    @GetMapping
    public ResponseEntity<List<AppointmentResponse>> list(@AuthenticationPrincipal UserPrincipal principal) {
        if ("PATIENT".equals(principal.getRole())) {
            return ResponseEntity.ok(appointmentService.getPatientAppointments(principal.getId()));
        } else if ("HOSPITAL".equals(principal.getRole())) {
            return ResponseEntity.ok(appointmentService.getHospitalAppointments(principal.getId()));
        }
        return ResponseEntity.ok(Collections.emptyList());
    }

    /** Hospital accepts/rejects/completes an appointment. */
    @PutMapping("/status")
    public ResponseEntity<AppointmentResponse> updateStatus(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AppointmentStatusUpdateRequest request) {
        return ResponseEntity.ok(appointmentService.updateStatus(principal.getId(), request));
    }

    /** Patient cancels their own appointment. */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> cancel(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        appointmentService.cancelAppointment(principal.getId(), id);
        return ResponseEntity.ok(new ApiResponse(true, "Appointment cancelled"));
    }
}
