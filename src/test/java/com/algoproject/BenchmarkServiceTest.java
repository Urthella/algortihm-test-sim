package com.algoproject;

import static org.junit.jupiter.api.Assertions.*;

import com.algoproject.dto.BenchmarkRequest;
import com.algoproject.dto.CompareRequest;
import com.algoproject.dto.CompareResponse;
import com.algoproject.model.BenchmarkResult;
import com.algoproject.model.DataPattern;
import com.algoproject.service.BenchmarkService;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

/**
 * Tests for BenchmarkService request validation and benchmark execution.
 */
class BenchmarkServiceTest {

    private final BenchmarkService service = new BenchmarkService();

    @Test
    @DisplayName("Valid benchmark request returns a result")
    void runsValidBenchmark() {
        BenchmarkRequest request = new BenchmarkRequest("Quick Sort", DataPattern.RANDOM, 1_000, 3);
        BenchmarkResult result = service.runBenchmark(request);

        assertNotNull(result);
        assertEquals("Quick Sort", result.algorithm());
        assertEquals(1_000, result.size());
        assertTrue(result.meanMillis() >= 0);
    }

    @Test
    @DisplayName("Unknown algorithm is rejected")
    void rejectsUnknownAlgorithm() {
        BenchmarkRequest request = new BenchmarkRequest("Bubble Sort", DataPattern.RANDOM, 1_000, 3);
        assertThrows(IllegalArgumentException.class, () -> service.runBenchmark(request));
    }

    @Test
    @DisplayName("Out-of-range sizes are rejected")
    void rejectsInvalidSizes() {
        assertThrows(IllegalArgumentException.class, () -> service.runBenchmark(
            new BenchmarkRequest("Quick Sort", DataPattern.RANDOM, 0, 3)));
        assertThrows(IllegalArgumentException.class, () -> service.runBenchmark(
            new BenchmarkRequest("Quick Sort", DataPattern.RANDOM, BenchmarkService.MAX_SIZE + 1, 3)));
    }

    @Test
    @DisplayName("Out-of-range trial counts are rejected")
    void rejectsInvalidTrials() {
        assertThrows(IllegalArgumentException.class, () -> service.runBenchmark(
            new BenchmarkRequest("Quick Sort", DataPattern.RANDOM, 1_000, 0)));
        assertThrows(IllegalArgumentException.class, () -> service.runBenchmark(
            new BenchmarkRequest("Quick Sort", DataPattern.RANDOM, 1_000, BenchmarkService.MAX_TRIALS + 1)));
    }

    @Test
    @DisplayName("Comparison with unknown algorithm name is rejected")
    void rejectsUnknownAlgorithmInComparison() {
        CompareRequest request = new CompareRequest(
            List.of("Quick Sort", "Nope Sort"), null, List.of(100), 2);
        assertThrows(IllegalArgumentException.class, () -> service.runComparison(request));
    }

    @Test
    @DisplayName("Comparison excludes BogoSort from default algorithm set")
    void comparisonExcludesBogoSortByDefault() {
        CompareRequest request = new CompareRequest(null, List.of(DataPattern.RANDOM), List.of(100), 1);
        CompareResponse response = service.runComparison(request);

        assertFalse(response.results().isEmpty());
        assertTrue(response.results().stream()
            .noneMatch(r -> r.algorithm().contains("Bogo")),
            "Compare All should not include BogoSort");
    }

    @Test
    @DisplayName("Comparison returns results for every requested combination")
    void comparisonCoversAllCombinations() {
        CompareRequest request = new CompareRequest(
            List.of("Quick Sort", "Merge Sort"),
            List.of(DataPattern.RANDOM, DataPattern.REVERSE_SORTED),
            List.of(100, 500),
            1);
        CompareResponse response = service.runComparison(request);

        // 2 algorithms x 2 patterns x 2 sizes
        assertEquals(8, response.results().size());
        assertNotNull(response.summary());
        assertNotNull(response.summary().fastestAlgorithm());
    }
}
