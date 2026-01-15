package com.algoproject.model;

/**
 * Represents the theoretical complexity information for a sorting algorithm.
 * Contains time complexity (best, average, worst cases), space complexity,
 * and algorithm properties like stability and in-place sorting.
 */
public record ComplexityInfo(
    String algorithmName,
    String bestCase,
    String averageCase,
    String worstCase,
    String spaceComplexity,
    boolean isStable,
    boolean isInPlace,
    String description,
    String bestCaseScenario,
    String worstCaseScenario
) {
    
    /**
     * Creates ComplexityInfo for Quick Sort algorithm.
     */
    public static ComplexityInfo quickSort() {
        return new ComplexityInfo(
            "Quick Sort",
            "O(n log n)",
            "O(n log n)",
            "O(n²)",
            "O(log n)",
            false,
            true,
            "Divide-and-conquer algorithm that selects a pivot element and partitions the array around it. " +
            "Uses median-of-three pivot selection and switches to insertion sort for small subarrays.",
            "When the pivot consistently divides the array into roughly equal halves",
            "When the array is already sorted or reverse sorted (without good pivot selection)"
        );
    }
    
    /**
     * Creates ComplexityInfo for Heap Sort algorithm.
     */
    public static ComplexityInfo heapSort() {
        return new ComplexityInfo(
            "Heap Sort",
            "O(n log n)",
            "O(n log n)",
            "O(n log n)",
            "O(1)",
            false,
            true,
            "Comparison-based algorithm that builds a max-heap from the array and repeatedly extracts " +
            "the maximum element. Guarantees O(n log n) performance regardless of input.",
            "Performance is consistent across all input patterns",
            "No true worst case - always O(n log n), but has poor cache locality"
        );
    }
    
    /**
     * Creates ComplexityInfo for Shell Sort algorithm.
     */
    public static ComplexityInfo shellSort() {
        return new ComplexityInfo(
            "Shell Sort",
            "O(n log n)",
            "O(n^1.25) to O(n^1.5)",
            "O(n²)",
            "O(1)",
            false,
            true,
            "Generalization of insertion sort that allows exchange of items that are far apart. " +
            "Uses Ciura's gap sequence (701, 301, 132, 57, 23, 10, 4, 1) for optimal performance.",
            "When the array is already partially sorted",
            "Depends on gap sequence; with poor gaps can degrade to O(n²)"
        );
    }
    
    /**
     * Creates ComplexityInfo for Merge Sort algorithm.
     */
    public static ComplexityInfo mergeSort() {
        return new ComplexityInfo(
            "Merge Sort",
            "O(n log n)",
            "O(n log n)",
            "O(n log n)",
            "O(n)",
            true,
            false,
            "Divide-and-conquer algorithm that divides the array into halves, recursively sorts them, " +
            "and merges the sorted halves. Guarantees O(n log n) and maintains stability.",
            "Performance is consistent across all input patterns",
            "No true worst case - always O(n log n), but requires O(n) additional space"
        );
    }
    
    /**
     * Creates ComplexityInfo for Radix Sort algorithm.
     */
    public static ComplexityInfo radixSort() {
        return new ComplexityInfo(
            "Radix Sort (LSD)",
            "O(nk)",
            "O(nk)",
            "O(nk)",
            "O(n + k)",
            true,
            false,
            "Non-comparison sorting algorithm that sorts integers by processing individual digits. " +
            "Uses LSD (Least Significant Digit) approach with radix 256. k = number of digits (4 for 32-bit integers).",
            "When k (number of digits) is small relative to n",
            "When numbers have many digits or when n is small (overhead dominates)"
        );
    }
    
    /**
     * Returns a formatted string representation for display.
     */
    public String toDisplayString() {
        return String.format(
            "%s:\n" +
            "  Time Complexity: Best=%s, Average=%s, Worst=%s\n" +
            "  Space: %s | Stable: %s | In-place: %s\n" +
            "  Description: %s",
            algorithmName, bestCase, averageCase, worstCase,
            spaceComplexity, isStable ? "Yes" : "No", isInPlace ? "Yes" : "No",
            description
        );
    }
}
