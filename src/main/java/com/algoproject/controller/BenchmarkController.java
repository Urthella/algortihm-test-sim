package com.algoproject.controller;

import com.algoproject.dto.BenchmarkRequest;
import com.algoproject.dto.CompareRequest;
import com.algoproject.dto.CompareResponse;
import com.algoproject.model.BenchmarkResult;
import com.algoproject.model.ComplexityInfo;
import com.algoproject.model.DataPattern;
import com.algoproject.service.BenchmarkService;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class BenchmarkController {

    private final BenchmarkService benchmarkService;

    public BenchmarkController(BenchmarkService benchmarkService) {
        this.benchmarkService = benchmarkService;
    }

    /**
     * Run a single benchmark for one algorithm/pattern/size combination.
     */
    @PostMapping("/benchmark")
    public BenchmarkResult runBenchmark(@RequestBody BenchmarkRequest request) {
        return benchmarkService.runBenchmark(request);
    }

    /**
     * Run comprehensive comparison across multiple algorithms, patterns, and sizes.
     */
    @PostMapping("/benchmark/compare")
    public CompareResponse runComparison(@RequestBody CompareRequest request) {
        return benchmarkService.runComparison(request);
    }

    /**
     * Get list of available algorithm names.
     */
    @GetMapping("/algorithms")
    public List<String> getAlgorithms() {
        return benchmarkService.getAvailableAlgorithms();
    }

    /**
     * Get available data patterns.
     */
    @GetMapping("/patterns")
    public List<DataPattern> getPatterns() {
        return Arrays.asList(DataPattern.values());
    }

    /**
     * Get complexity information for all algorithms.
     */
    @GetMapping("/algorithms/complexity")
    public Map<String, ComplexityInfo> getAllComplexity() {
        return benchmarkService.getAllComplexityInfo();
    }

    /**
     * Get complexity information for a specific algorithm.
     */
    @GetMapping("/algorithms/{name}/complexity")
    public ComplexityInfo getAlgorithmComplexity(@PathVariable String name) {
        return benchmarkService.getComplexityInfo(name);
    }
}
