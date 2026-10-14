package com.vpf.controller;

import com.vpf.dto.PalmOilRequest;
import com.vpf.service.PalmOilService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/palm-oil")
@RequiredArgsConstructor
public class PalmOilController {
    private final PalmOilService service;

    @GetMapping
    public Object findAll(@RequestParam(required = false) LocalDate from,
                          @RequestParam(required = false) LocalDate to) {
        return (from != null && to != null) ? service.findByDateRange(from, to) : service.findAll();
    }

    @PostMapping
    public Object create(@Valid @RequestBody PalmOilRequest req) { return service.create(req); }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{id}")
    public Object update(@PathVariable Long id, @Valid @RequestBody PalmOilRequest req) { return service.update(id, req); }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}
