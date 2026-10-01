package com.vpf.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@Entity
@Table(name = "palm_oil")
public class PalmOil extends BaseAuditEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDate oilDate;

    @Column(nullable = false, precision = 14, scale = 3)
    private BigDecimal weight;

    @Column(nullable = false, precision = 14, scale = 2)
    private BigDecimal rate;

    @Column(nullable = false, precision = 16, scale = 2)
    private BigDecimal total;
}
