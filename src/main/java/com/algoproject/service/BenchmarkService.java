package com.algoproject.service;

import com.algoproject.algorithms.*;
import com.algoproject.bench.BenchmarkRunner;
import com.algoproject.data.DataGenerator;
import com.algoproject.dto.BenchmarkRequest;
import com.algoproject.dto.CompareRequest;
import com.algoproject.dto.CompareResponse;
import com.algoproject.dto.CompareResponse.AlgorithmSummary;
import com.algoproject.dto.CompareResponse.ComparisonSummary;
import com.algoproject.model.BenchmarkResult;
import com.algoproject.model.ComplexityInfo;
import com.algoproject.model.DataPattern;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class BenchmarkService {

    private final Map<String, SortingAlgorithm> algorithms;
    private final DataGenerator generator;

    public BenchmarkService() {
        this.generator = new DataGenerator(0.1); // Default disorder
        List<SortingAlgorithm> algoList = List.of(
            new QuickSort(),
            new HeapSort(),
            new ShellSort(),
            new MergeSort(),
            new RadixSort(),
            new BogoSort()  // 🎲 For fun only!
        );
        this.algorithms = algoList.stream()
            .collect(Collectors.toMap(SortingAlgorithm::name, Function.identity()));
    }

    public BenchmarkResult runBenchmark(BenchmarkRequest request) {
        SortingAlgorithm algorithm = algorithms.get(request.algorithm());
        if (algorithm == null) {
            throw new IllegalArgumentException("Unknown algorithm: " + request.algorithm());
        }

        BenchmarkRunner runner = new BenchmarkRunner(List.of(algorithm), generator, request.trials());
        List<BenchmarkResult> results = runner.run(
            new int[]{request.size()},
            new DataPattern[]{request.pattern()}
        );

        return results.isEmpty() ? null : results.get(0);
    }
    
    // Algorithms that are too slow for batch comparison (e.g., O(n!) complexity)
    private static final Set<String> COMPARISON_EXCLUDED_ALGORITHMS = Set.of("Bogo Sort 🎲");
    
    /**
     * Run comprehensive comparison of algorithms.
     */
    public CompareResponse runComparison(CompareRequest request) {
        long startTime = System.currentTimeMillis();
        
        // Determine which algorithms to test (exclude slow fun algorithms from batch comparison)
        List<SortingAlgorithm> algosToTest;
        if (request.algorithms() == null || request.algorithms().isEmpty()) {
            // Exclude BogoSort and other slow algorithms from "Compare All"
            algosToTest = algorithms.values().stream()
                .filter(a -> !COMPARISON_EXCLUDED_ALGORITHMS.contains(a.name()))
                .collect(Collectors.toCollection(ArrayList::new));
        } else {
            algosToTest = request.algorithms().stream()
                .map(algorithms::get)
                .filter(Objects::nonNull)
                .toList();
        }
        
        // Determine which patterns to test
        DataPattern[] patternsToTest;
        if (request.patterns() == null || request.patterns().isEmpty()) {
            patternsToTest = DataPattern.values();
        } else {
            patternsToTest = request.patterns().toArray(new DataPattern[0]);
        }
        
        // Convert sizes to array
        int[] sizes = request.sizes().stream().mapToInt(Integer::intValue).toArray();
        
        // Run benchmarks
        BenchmarkRunner runner = new BenchmarkRunner(algosToTest, generator, request.trials());
        List<BenchmarkResult> results = runner.run(sizes, patternsToTest);
        
        // Build complexity info map
        Map<String, ComplexityInfo> complexityMap = algosToTest.stream()
            .collect(Collectors.toMap(
                SortingAlgorithm::name,
                SortingAlgorithm::getComplexityInfo
            ));
        
        // Build summary
        ComparisonSummary summary = buildSummary(results, System.currentTimeMillis() - startTime);
        
        return new CompareResponse(results, complexityMap, summary);
    }
    
    private ComparisonSummary buildSummary(List<BenchmarkResult> results, long totalTimeMs) {
        if (results.isEmpty()) {
            return new ComparisonSummary(null, null, totalTimeMs, 0, Map.of());
        }
        
        // Group by algorithm
        Map<String, List<BenchmarkResult>> byAlgorithm = results.stream()
            .collect(Collectors.groupingBy(BenchmarkResult::algorithm));
        
        // Build algorithm summaries
        Map<String, AlgorithmSummary> summaries = new LinkedHashMap<>();
        String fastest = null;
        double fastestAvg = Double.MAX_VALUE;
        String mostEfficient = null;
        double lowestMem = Double.MAX_VALUE;
        
        for (Map.Entry<String, List<BenchmarkResult>> entry : byAlgorithm.entrySet()) {
            String algo = entry.getKey();
            List<BenchmarkResult> algoResults = entry.getValue();
            
            double avgTime = algoResults.stream()
                .mapToDouble(BenchmarkResult::meanMillis).average().orElse(0);
            double avgMem = algoResults.stream()
                .mapToDouble(r -> r.memoryBytes() / 1024.0).average().orElse(0);
            double minTime = algoResults.stream()
                .mapToDouble(BenchmarkResult::bestMillis).min().orElse(0);
            double maxTime = algoResults.stream()
                .mapToDouble(BenchmarkResult::worstMillis).max().orElse(0);
            
            summaries.put(algo, new AlgorithmSummary(
                algo, avgTime, avgMem, minTime, maxTime, algoResults.size()
            ));
            
            if (avgTime < fastestAvg) {
                fastestAvg = avgTime;
                fastest = algo;
            }
            if (avgMem < lowestMem) {
                lowestMem = avgMem;
                mostEfficient = algo;
            }
        }
        
        return new ComparisonSummary(
            fastest,
            mostEfficient,
            totalTimeMs,
            results.size(),
            summaries
        );
    }
    
    public List<String> getAvailableAlgorithms() {
        return algorithms.keySet().stream().sorted().toList();
    }
    
    /**
     * Get complexity information for all algorithms.
     */
    public Map<String, ComplexityInfo> getAllComplexityInfo() {
        return algorithms.values().stream()
            .collect(Collectors.toMap(
                SortingAlgorithm::name,
                SortingAlgorithm::getComplexityInfo
            ));
    }
    
    /**
     * Get complexity information for a specific algorithm.
     */
    public ComplexityInfo getComplexityInfo(String algorithmName) {
        SortingAlgorithm algo = algorithms.get(algorithmName);
        if (algo == null) {
            throw new IllegalArgumentException("Unknown algorithm: " + algorithmName);
        }
        return algo.getComplexityInfo();
    }
}
