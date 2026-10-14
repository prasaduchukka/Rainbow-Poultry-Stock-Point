package com.vpf.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class PalmOilRequest {
    @NotNull
    private LocalDate oilDate;
    @NotNull
    @Positive
    private BigDecimal weight;
    @NotNull
    @Positive
    private BigDecimal rate;
    private String createdBy;
}
