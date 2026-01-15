package com.algoproject.bench;

import com.algoproject.algorithms.SortingAlgorithm;
import com.algoproject.data.DataGenerator;
import com.algoproject.model.BenchmarkResult;
import com.algoproject.model.DataPattern;
import com.algoproject.util.MemoryUtil;
import com.algoproject.util.Stats;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

/**
 * Executes performance benchmarks for sorting algorithms.
 * 
 * <p>The BenchmarkRunner measures execution time and memory usage for each
 * algorithm across different data patterns and sizes. Multiple trials are
 * run for statistical reliability.</p>
 * 
 * <h2>Usage Example:</h2>
 * <pre>{@code
 * List<SortingAlgorithm> algorithms = List.of(new QuickSort(), new MergeSort());
 * DataGenerator generator = new DataGenerator(0.1);
 * BenchmarkRunner runner = new BenchmarkRunner(algorithms, generator, 5);
 * 
 * int[] sizes = {1000, 10000, 100000};
 * DataPattern[] patterns = DataPattern.values();
 * List<BenchmarkResult> results = runner.run(sizes, patterns);
 * }</pre>
 * 
 * <h2>Measurements:</h2>
 * <ul>
 *   <li>Mean execution time (milliseconds)</li>
 *   <li>Standard deviation of execution time</li>
 *   <li>Best and worst case times</li>
 *   <li>Approximate memory usage (bytes)</li>
 * </ul>
 * 
 * @author Algorithm Analysis Project
 * @version 1.0
 */
public class BenchmarkRunner {
    private final List<SortingAlgorithm> algorithms;
    private final DataGenerator generator;
    private final int trials;

    public BenchmarkRunner(List<SortingAlgorithm> algorithms, DataGenerator generator, int trials) {
        this.algorithms = algorithms;
        this.generator = generator;
        this.trials = trials;
    }

    public List<BenchmarkResult> run(int[] sizes, DataPattern[] patterns) {
        List<BenchmarkResult> results = new ArrayList<>();
        for (SortingAlgorithm algorithm : algorithms) {
            for (DataPattern pattern : patterns) {
                for (int size : sizes) {
                    results.add(runSingle(algorithm, pattern, size));
                }
            }
        }
        return results;
    }

    private BenchmarkResult runSingle(SortingAlgorithm algorithm, DataPattern pattern, int size) {
        long[] durations = new long[trials];
        long[] memUsages = new long[trials];
        
        // Warmup run (not measured) to trigger JIT compilation
        int[] warmup = generator.generate(size, pattern);
        algorithm.sort(warmup);
        
        for (int i = 0; i < trials; i++) {
            int[] data = generator.generate(size, pattern);
            
            // Measure memory separately (includes GC overhead - not timed)
            int[] memCopy = Arrays.copyOf(data, data.length);
            memUsages[i] = MemoryUtil.measureTaskMemory(() -> algorithm.sort(memCopy));
            
            // Measure time separately (clean timing without GC interference)
            int[] timeCopy = Arrays.copyOf(data, data.length);
            long start = System.nanoTime();
            algorithm.sort(timeCopy);
            long end = System.nanoTime();
            durations[i] = end - start;
        }
        
        double meanMs = nanosecondsToMillis(Stats.mean(durations));
        double stddevMs = nanosecondsToMillis(Stats.stddev(durations));
        double bestMs = nanosecondsToMillis(Stats.min(durations));
        double worstMs = nanosecondsToMillis(Stats.max(durations));
        long memoryBytes = Stats.max(memUsages);
        
        return new BenchmarkResult(algorithm.name(), pattern, size, meanMs, stddevMs, bestMs, worstMs, memoryBytes);
    }

    private double nanosecondsToMillis(double nanos) {
        return nanos / 1_000_000.0;
    }
}
