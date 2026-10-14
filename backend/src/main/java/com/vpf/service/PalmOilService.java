package com.vpf.service;

import com.vpf.dto.PalmOilRequest;
import com.vpf.dto.PalmOilResponse;
import com.vpf.entity.PalmOil;
import com.vpf.exception.ResourceNotFoundException;
import com.vpf.repository.PalmOilRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class PalmOilService {
    private final PalmOilRepository repository;

    public PalmOilResponse create(PalmOilRequest req) {
        PalmOil p = new PalmOil();
        apply(p, req);
        repository.save(p);
        return toResponse(p);
    }

    public PalmOilResponse update(Long id, PalmOilRequest req) {
        PalmOil p = repository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Palm oil record not found: " + id));
        apply(p, req);
        repository.save(p);
        return toResponse(p);
    }

    public void delete(Long id) {
        if (!repository.existsById(id)) throw new ResourceNotFoundException("Palm oil record not found: " + id);
        repository.deleteById(id);
    }

    public List<PalmOilResponse> findAll() {
        return repository.findAll().stream().sorted(java.util.Comparator.comparing(PalmOil::getOilDate)).map(this::toResponse).toList();
    }

    public List<PalmOilResponse> findByDateRange(LocalDate from, LocalDate to) {
        return repository.findByOilDateBetweenOrderByOilDateAsc(from, to).stream().map(this::toResponse).toList();
    }

    private void apply(PalmOil p, PalmOilRequest req) {
        p.setOilDate(req.getOilDate());
        p.setWeight(req.getWeight());
        p.setRate(req.getRate());
        p.setTotal(req.getWeight().multiply(req.getRate()).setScale(2, RoundingMode.HALF_UP));
        if (p.getCreatedBy() == null) p.setCreatedBy(req.getCreatedBy());
    }

    private PalmOilResponse toResponse(PalmOil p) {
        return PalmOilResponse.builder()
                .id(p.getId()).oilDate(p.getOilDate()).weight(p.getWeight()).rate(p.getRate())
                .total(p.getTotal()).createdBy(p.getCreatedBy()).createdDate(p.getCreatedDate()).build();
    }
}
