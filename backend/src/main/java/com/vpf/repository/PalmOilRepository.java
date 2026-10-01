package com.vpf.repository;

import com.vpf.entity.PalmOil;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface PalmOilRepository extends JpaRepository<PalmOil, Long> {
    List<PalmOil> findByOilDateBetweenOrderByOilDateAsc(LocalDate from, LocalDate to);
    List<PalmOil> findByOilDate(LocalDate date);
}
