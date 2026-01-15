package com.algoproject.dto;

import com.algoproject.model.DataPattern;

public record BenchmarkRequest(
    String algorithm,
    DataPattern pattern,
    int size,
    int trials
) {}
