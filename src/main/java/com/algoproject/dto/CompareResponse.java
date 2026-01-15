package com.algoproject.dto;

import com.algoproject.model.BenchmarkResult;
import com.algoproject.model.ComplexityInfo;
import java.util.List;
import java.util.Map;

/**
 * Response DTO containing comprehensive comparison results.
 */
public record CompareResponse(
    List<BenchmarkResult> results,
    Map<String, ComplexityInfo> complexityInfo,
    ComparisonSummary summary
) {
    
    /**
     * Summary statistics for the comparison.
     */
    public record ComparisonSummary(
        String fastestAlgorithm,
        String mostMemoryEfficient,
        long totalBenchmarkTimeMs,
        int totalRuns,
        Map<String, AlgorithmSummary> algorithmSummaries
    ) {}
    
    /**
     * Summary for a single algorithm across all tests.
     */
    public record AlgorithmSummary(
        String algorithm,
        double avgTimeMs,
        double avgMemoryKb,
        double minTimeMs,
        double maxTimeMs,
        int testCount
    ) {}
}
