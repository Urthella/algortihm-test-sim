package com.algoproject.model;

/**
 * Enumeration of data patterns used for testing sorting algorithms.
 * 
 * <p>Different patterns help evaluate algorithm performance under various conditions:</p>
 * 
 * <ul>
 *   <li><b>RANDOM</b> - Average case scenario; tests general performance</li>
 *   <li><b>PARTIALLY_SORTED</b> - Near-sorted data; tests adaptive algorithms</li>
 *   <li><b>REVERSE_SORTED</b> - Worst case for some algorithms (e.g., naive QuickSort)</li>
 * </ul>
 * 
 * @author Algorithm Analysis Project
 * @version 1.0
 */
public enum DataPattern {
    /** Uniformly distributed random data */
    RANDOM,
    /** Mostly sorted with ~10% disorder */
    PARTIALLY_SORTED,
    /** Completely reverse sorted (descending order) */
    REVERSE_SORTED
}
