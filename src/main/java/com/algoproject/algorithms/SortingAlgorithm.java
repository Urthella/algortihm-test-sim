package com.algoproject.algorithms;

import com.algoproject.model.ComplexityInfo;

/**
 * Interface for sorting algorithms.
 * Each implementation must provide its name, sorting logic, and complexity information.
 */
public interface SortingAlgorithm {
    
    /**
     * Returns the display name of the algorithm.
     * @return algorithm name
     */
    String name();
    
    /**
     * Sorts the given array in ascending order.
     * @param data the array to sort (modified in place)
     */
    void sort(int[] data);
    
    /**
     * Returns theoretical complexity information for this algorithm.
     * @return ComplexityInfo containing time/space complexity and properties
     */
    ComplexityInfo getComplexityInfo();
}
