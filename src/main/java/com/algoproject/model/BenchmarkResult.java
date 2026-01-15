package com.algoproject.model;

/**
 * Immutable record containing the results of a single benchmark run.
 * 
 * <p>Contains timing statistics and memory usage information for a specific
 * combination of algorithm, data pattern, and data size.</p>
 * 
 * <h2>Fields:</h2>
 * <ul>
 *   <li><b>algorithm</b> - Name of the sorting algorithm tested</li>
 *   <li><b>pattern</b> - Data pattern used (RANDOM, PARTIALLY_SORTED, REVERSE_SORTED)</li>
 *   <li><b>size</b> - Number of elements in the test dataset</li>
 *   <li><b>meanMillis</b> - Average execution time across all trials (milliseconds)</li>
 *   <li><b>stddevMillis</b> - Standard deviation of execution time (milliseconds)</li>
 *   <li><b>bestMillis</b> - Minimum execution time across all trials (milliseconds)</li>
 *   <li><b>worstMillis</b> - Maximum execution time across all trials (milliseconds)</li>
 *   <li><b>memoryBytes</b> - Maximum memory usage observed (bytes)</li>
 * </ul>
 * 
 * @author Algorithm Analysis Project
 * @version 1.0
 */
public record BenchmarkResult(
        String algorithm,
        DataPattern pattern,
        int size,
        double meanMillis,
        double stddevMillis,
        double bestMillis,
        double worstMillis,
        long memoryBytes
) {
}
