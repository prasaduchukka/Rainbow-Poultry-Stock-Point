package com.vpf.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class PalmOilResponse {
    private Long id;
    private LocalDate oilDate;
    private BigDecimal weight;
    private BigDecimal rate;
    private BigDecimal total;
    private String createdBy;
    private LocalDateTime createdDate;
}
