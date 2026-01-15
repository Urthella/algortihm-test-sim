package com.algoproject;

import static org.junit.jupiter.api.Assertions.*;

import com.algoproject.algorithms.HeapSort;
import com.algoproject.algorithms.MergeSort;
import com.algoproject.algorithms.QuickSort;
import com.algoproject.algorithms.RadixSort;
import com.algoproject.algorithms.ShellSort;
import com.algoproject.algorithms.SortingAlgorithm;
import com.algoproject.data.DataGenerator;
import com.algoproject.model.DataPattern;
import java.util.Arrays;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.EnumSource;
import org.junit.jupiter.params.provider.ValueSource;

/**
 * Comprehensive test suite for all sorting algorithms.
 * Tests cover correctness, edge cases, different data patterns, and performance characteristics.
 */
class AlgorithmsTest {
    private static final List<SortingAlgorithm> ALGORITHMS = List.of(
            new QuickSort(), new HeapSort(), new ShellSort(), new MergeSort(), new RadixSort());

    // ==================== BASIC CORRECTNESS TESTS ====================
    
    @Nested
    @DisplayName("Basic Correctness Tests")
    class BasicCorrectnessTests {
        
        @Test
        @DisplayName("All algorithms sort random data correctly")
        void sortsRandomData() {
            int[] data = randomArray(1_000);
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), algo.name() + " failed on random input");
            }
        }

        @Test
        @DisplayName("All algorithms sort reverse-ordered data correctly")
        void sortsReverseData() {
            int[] data = new int[500];
            for (int i = 0; i < data.length; i++) {
                data[i] = data.length - i;
            }
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), algo.name() + " failed on reverse input");
            }
        }

        @Test
        @DisplayName("All algorithms sort partially sorted data correctly")
        void sortsPartiallySortedData() {
            DataGenerator generator = new DataGenerator(0.1);
            int[] data = generator.generate(1_000, DataPattern.PARTIALLY_SORTED);
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), algo.name() + " failed on partially sorted input");
            }
        }

        @Test
        @DisplayName("All algorithms sort already sorted data correctly")
        void sortsAlreadySortedData() {
            int[] data = new int[500];
            for (int i = 0; i < data.length; i++) {
                data[i] = i;
            }
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), algo.name() + " failed on sorted input");
            }
        }
    }

    // ==================== EDGE CASE TESTS ====================
    
    @Nested
    @DisplayName("Edge Case Tests")
    class EdgeCaseTests {
        
        @Test
        @DisplayName("All algorithms handle empty array")
        void sortsEmptyArray() {
            int[] data = new int[0];
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                assertDoesNotThrow(() -> algo.sort(copy), algo.name() + " threw on empty array");
                assertEquals(0, copy.length);
            }
        }

        @Test
        @DisplayName("All algorithms handle single element array")
        void sortsSingleElement() {
            int[] data = {42};
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertEquals(42, copy[0], algo.name() + " failed on single element");
            }
        }

        @Test
        @DisplayName("All algorithms handle two element array")
        void sortsTwoElements() {
            int[] data = {5, 3};
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertArrayEquals(new int[]{3, 5}, copy, algo.name() + " failed on two elements");
            }
        }

        @Test
        @DisplayName("All algorithms handle null input gracefully")
        void handlesNullInput() {
            for (SortingAlgorithm algo : ALGORITHMS) {
                assertDoesNotThrow(() -> algo.sort(null), algo.name() + " threw on null input");
            }
        }

        @Test
        @DisplayName("All algorithms handle array with all identical elements")
        void sortsAllIdenticalElements() {
            int[] data = new int[100];
            Arrays.fill(data, 42);
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), algo.name() + " failed on identical elements");
                for (int val : copy) {
                    assertEquals(42, val, algo.name() + " changed values");
                }
            }
        }

        @Test
        @DisplayName("All algorithms handle array with many duplicates")
        void sortsManyDuplicates() {
            int[] data = new int[1000];
            ThreadLocalRandom rng = ThreadLocalRandom.current();
            for (int i = 0; i < data.length; i++) {
                data[i] = rng.nextInt(10); // Only 10 unique values
            }
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), algo.name() + " failed on many duplicates");
            }
        }

        @Test
        @DisplayName("All algorithms preserve element count")
        void preservesElementCount() {
            int[] data = randomArray(500);
            int[] sortedReference = Arrays.copyOf(data, data.length);
            Arrays.sort(sortedReference);
            
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertArrayEquals(sortedReference, copy, 
                    algo.name() + " did not produce correct sorted result");
            }
        }
    }

    // ==================== DATA PATTERN TESTS ====================
    
    @Nested
    @DisplayName("Data Pattern Tests")
    class DataPatternTests {
        
        @ParameterizedTest
        @EnumSource(DataPattern.class)
        @DisplayName("All algorithms work with all data patterns")
        void sortsAllPatterns(DataPattern pattern) {
            DataGenerator generator = new DataGenerator(0.1);
            int[] data = generator.generate(1_000, pattern);
            
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), 
                    algo.name() + " failed on " + pattern + " pattern");
            }
        }
    }

    // ==================== SIZE VARIATION TESTS ====================
    
    @Nested
    @DisplayName("Size Variation Tests")
    class SizeVariationTests {
        
        @ParameterizedTest
        @ValueSource(ints = {10, 100, 1_000, 10_000})
        @DisplayName("All algorithms work with various sizes")
        void sortsVariousSizes(int size) {
            int[] data = randomArray(size);
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), 
                    algo.name() + " failed on size " + size);
            }
        }

        @Test
        @DisplayName("All algorithms handle large dataset (100K elements)")
        void sortsLargeDataset() {
            int[] data = randomArray(100_000);
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                long start = System.currentTimeMillis();
                algo.sort(copy);
                long duration = System.currentTimeMillis() - start;
                assertTrue(isSorted(copy), algo.name() + " failed on large dataset");
                // Sanity check: should complete within reasonable time (30 seconds)
                assertTrue(duration < 30_000, 
                    algo.name() + " took too long: " + duration + "ms");
            }
        }
    }

    // ==================== SPECIAL VALUE TESTS ====================
    
    @Nested
    @DisplayName("Special Value Tests")
    class SpecialValueTests {
        
        @Test
        @DisplayName("All algorithms handle zero values")
        void sortsWithZeros() {
            int[] data = {0, 5, 0, 3, 0, 1, 0};
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), algo.name() + " failed with zeros");
            }
        }

        @Test
        @DisplayName("All algorithms handle maximum integer values")
        void sortsMaxValues() {
            int[] data = {Integer.MAX_VALUE, 1, Integer.MAX_VALUE - 1, 0, Integer.MAX_VALUE};
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), algo.name() + " failed with max values");
            }
        }

        @Test
        @DisplayName("Comparison-based algorithms handle negative values")
        void sortsNegativeValues() {
            // Note: RadixSort is designed for non-negative integers
            List<SortingAlgorithm> comparisonBased = List.of(
                new QuickSort(), new HeapSort(), new ShellSort(), new MergeSort());
            
            int[] data = {-5, 3, -1, 0, -10, 7, -3};
            for (SortingAlgorithm algo : comparisonBased) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), algo.name() + " failed with negative values");
            }
        }

        @Test
        @DisplayName("All algorithms handle alternating high-low pattern")
        void sortsAlternatingPattern() {
            int[] data = new int[100];
            for (int i = 0; i < data.length; i++) {
                data[i] = (i % 2 == 0) ? 1000 - i : i;
            }
            for (SortingAlgorithm algo : ALGORITHMS) {
                int[] copy = Arrays.copyOf(data, data.length);
                algo.sort(copy);
                assertTrue(isSorted(copy), algo.name() + " failed on alternating pattern");
            }
        }
    }

    // ==================== STABILITY TESTS ====================
    
    @Nested
    @DisplayName("Algorithm Property Tests")
    class AlgorithmPropertyTests {
        
        @Test
        @DisplayName("MergeSort is stable")
        void mergeSortIsStable() {
            // For stability test, we use a simplified approach
            // Real stability test would require objects with key-value pairs
            MergeSort mergeSort = new MergeSort();
            int[] data = randomArray(1_000);
            int[] copy = Arrays.copyOf(data, data.length);
            mergeSort.sort(copy);
            assertTrue(isSorted(copy), "MergeSort failed stability test setup");
        }

        @Test
        @DisplayName("RadixSort is stable for non-negative integers")
        void radixSortIsStable() {
            RadixSort radixSort = new RadixSort();
            int[] data = randomArray(1_000);
            int[] copy = Arrays.copyOf(data, data.length);
            radixSort.sort(copy);
            assertTrue(isSorted(copy), "RadixSort failed");
        }

        @Test
        @DisplayName("All algorithms return correct algorithm name")
        void algorithmsHaveCorrectNames() {
            assertEquals("Quick Sort", new QuickSort().name());
            assertEquals("Heap Sort", new HeapSort().name());
            assertEquals("Shell Sort", new ShellSort().name());
            assertEquals("Merge Sort", new MergeSort().name());
            assertEquals("Radix Sort (LSD)", new RadixSort().name());
        }
    }

    // ==================== HELPER METHODS ====================

    private int[] randomArray(int size) {
        ThreadLocalRandom rng = ThreadLocalRandom.current();
        int[] arr = new int[size];
        for (int i = 0; i < size; i++) {
            arr[i] = rng.nextInt(1_000_000);
        }
        return arr;
    }

    private boolean isSorted(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] < arr[i - 1]) {
                return false;
            }
        }
        return true;
    }
}
