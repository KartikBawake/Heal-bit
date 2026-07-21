package com.healbit.service;

import com.healbit.dto.HospitalResponse;
import org.springframework.data.domain.Sort;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Page;
import com.healbit.dto.PageResponse;
import com.healbit.dto.HospitalUpdateRequest;
import com.healbit.entity.Hospital;
import com.healbit.entity.HospitalStatus;
import com.healbit.exception.ResourceNotFoundException;
import com.healbit.repository.HospitalRepository;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import org.springframework.transaction.annotation.Transactional;
@Transactional
@Service
public class HospitalService {

    private final HospitalRepository hospitalRepository;

    public HospitalService(HospitalRepository hospitalRepository) {
        this.hospitalRepository = hospitalRepository;
    }

    /**
     * Public browse + optional search by city, name, or pincode. Only ACTIVE, non-deleted
     * hospitals are visible. Server-side paginated (default 10 per page).
     */
    public PageResponse<HospitalResponse> browseHospitals(String city, String name, String pincode, int page, int size) {
        // Normalise: trim so stray spaces don't break matching.
        city = city == null ? null : city.trim();
        name = name == null ? null : name.trim();
        pincode = pincode == null ? null : pincode.trim();

        int pageNumber = Math.max(page, 0);
        int pageSize = (size <= 0 || size > 100) ? 10 : size;
        Pageable pageable = PageRequest.of(pageNumber, pageSize, Sort.by("hospitalName").ascending());

        Page<Hospital> result;
        if (StringUtils.hasText(pincode)) {
            result = hospitalRepository
                    .findByStatusAndDeletedFalseAndPincodeContaining(HospitalStatus.ACTIVE, pincode, pageable);
        } else if (StringUtils.hasText(city)) {
            result = hospitalRepository
                    .findByStatusAndDeletedFalseAndCityContainingIgnoreCase(HospitalStatus.ACTIVE, city, pageable);
        } else if (StringUtils.hasText(name)) {
            result = hospitalRepository
                    .findByStatusAndDeletedFalseAndHospitalNameContainingIgnoreCase(HospitalStatus.ACTIVE, name, pageable);
        } else {
            result = hospitalRepository.findByStatusAndDeletedFalse(HospitalStatus.ACTIVE, pageable);
        }
        return PageResponse.from(result.map(this::toResponse));
    }

    public HospitalResponse getById(Long hospitalId) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));
        return toResponse(hospital);
    }

    public HospitalResponse updateProfile(Long hospitalId, HospitalUpdateRequest request) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));

        if (StringUtils.hasText(request.getHospitalName())) hospital.setHospitalName(request.getHospitalName());
        if (request.getPhone() != null) hospital.setPhone(request.getPhone());
        if (request.getAddress() != null) hospital.setAddress(request.getAddress());
        if (request.getCity() != null) hospital.setCity(request.getCity());
        if (request.getState() != null) hospital.setState(request.getState());
        if (request.getPincode() != null) hospital.setPincode(request.getPincode());
        if (request.getDescription() != null) hospital.setDescription(request.getDescription());
        if (request.getImage() != null) {
            hospital.setImageData(request.getImage().isBlank() ? null : ImageValidator.validateAndClean(request.getImage()));
        }

        return toResponse(hospitalRepository.save(hospital));
    }

    /** Soft delete: a hospital deactivates its own account. */
    public void softDelete(Long hospitalId) {
        Hospital hospital = hospitalRepository.findByHospitalIdAndDeletedFalse(hospitalId)
                .orElseThrow(() -> new ResourceNotFoundException("Hospital not found with id " + hospitalId));
        hospital.setDeleted(true);
        hospitalRepository.save(hospital);
    }

    private HospitalResponse toResponse(Hospital hospital) {
        HospitalResponse response = new HospitalResponse();
        response.setHospitalId(hospital.getHospitalId());
        response.setHospitalName(hospital.getHospitalName());
        response.setRegistrationNumber(hospital.getRegistrationNumber());
        response.setEmail(hospital.getEmail());
        response.setPhone(hospital.getPhone());
        response.setAddress(hospital.getAddress());
        response.setCity(hospital.getCity());
        response.setState(hospital.getState());
        response.setPincode(hospital.getPincode());
        response.setDescription(hospital.getDescription());
        response.setImageUrl(hospital.getImageData());
        response.setStatus(hospital.getStatus());
        response.setCreatedAt(hospital.getCreatedAt());
        return response;
    }
}
