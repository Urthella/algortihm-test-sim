package com.algoproject.algorithms;

import com.algoproject.model.ComplexityInfo;

/**
 * Radix Sort (LSD - Least Significant Digit) implementation.
 * Non-comparison sorting algorithm that processes individual digits/bytes.
 * Uses radix 256 (byte-level processing) for efficiency.
 * 
 * Time Complexity: O(nk) where k = number of digits (4 for 32-bit integers)
 * Space Complexity: O(n + k)
 * In-place: No
 * Stable: Yes
 * Note: Designed for non-negative integers only.
 */
public class RadixSort implements SortingAlgorithm {
    private static final int RADIX = 256;
    private static final int BYTE_MASK = RADIX - 1;

    @Override
    public String name() {
        return "Radix Sort (LSD)";
    }

    @Override
    public ComplexityInfo getComplexityInfo() {
        return ComplexityInfo.radixSort();
    }

    @Override
    public void sort(int[] data) {
        if (data == null || data.length < 2) {
            return;
        }
        // Designed for non-negative ints. Negatives would need offset handling.
        radixLsd(data);
    }

    private void radixLsd(int[] arr) {
        int[] output = new int[arr.length];
        int[] count = new int[RADIX];

        for (int shift = 0; shift <= 24; shift += 8) {
            for (int i = 0; i < RADIX; i++) {
                count[i] = 0;
            }
            for (int value : arr) {
                int bucket = (value >>> shift) & BYTE_MASK;
                count[bucket]++;
            }
            for (int i = 1; i < RADIX; i++) {
                count[i] += count[i - 1];
            }
            for (int i = arr.length - 1; i >= 0; i--) {
                int value = arr[i];
                int bucket = (value >>> shift) & BYTE_MASK;
                output[--count[bucket]] = value;
            }
            System.arraycopy(output, 0, arr, 0, arr.length);
        }
    }
}
