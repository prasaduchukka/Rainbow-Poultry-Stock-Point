package com.vpf.service;

import com.vpf.dto.VehicleRequest;
import com.vpf.dto.VehicleResponse;
import com.vpf.entity.Vehicle;
import com.vpf.exception.ResourceNotFoundException;
import com.vpf.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleResponse create(VehicleRequest req) {
        Vehicle v = new Vehicle();
        apply(v, req);
        vehicleRepository.save(v);
        return toResponse(v);
    }

    public VehicleResponse update(Long id, VehicleRequest req) {
        Vehicle v = getOrThrow(id);
        apply(v, req);
        vehicleRepository.save(v);
        return toResponse(v);
    }

    public void delete(Long id) {
        vehicleRepository.delete(getOrThrow(id));
    }

    public List<VehicleResponse> findAll() {
        return vehicleRepository.findAll().stream().map(this::toResponse).toList();
    }

    public VehicleResponse findById(Long id) {
        return toResponse(getOrThrow(id));
    }

    public Vehicle getOrThrow(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found: " + id));
    }

    private void apply(Vehicle v, VehicleRequest req) {
        v.setOwnerName(req.getOwnerName());
        v.setVehicleNumber(req.getVehicleNumber().trim());
        v.setInsuranceDueDate(req.getInsuranceDueDate());
        v.setBrakeDueDate(req.getBrakeDueDate());
        v.setPermitDueDate(req.getPermitDueDate());
        v.setRoadTaxDueDate(req.getRoadTaxDueDate());
        v.setPollutionDueDate(req.getPollutionDueDate());
        v.setNotes(req.getNotes());
    }

    private VehicleResponse toResponse(Vehicle v) {
        return VehicleResponse.builder()
                .id(v.getId())
                .ownerName(v.getOwnerName())
                .vehicleNumber(v.getVehicleNumber())
                .insuranceDueDate(v.getInsuranceDueDate())
                .brakeDueDate(v.getBrakeDueDate())
                .permitDueDate(v.getPermitDueDate())
                .roadTaxDueDate(v.getRoadTaxDueDate())
                .pollutionDueDate(v.getPollutionDueDate())
                .notes(v.getNotes())
                .build();
    }
}
