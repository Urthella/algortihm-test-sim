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
 * Note: Negative integers are supported by flipping the sign bit on the most
 * significant byte pass, which maps two's-complement order onto unsigned order.
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
                count[bucketOf(value, shift)]++;
            }
            for (int i = 1; i < RADIX; i++) {
                count[i] += count[i - 1];
            }
            for (int i = arr.length - 1; i >= 0; i--) {
                int value = arr[i];
                output[--count[bucketOf(value, shift)]] = value;
            }
            System.arraycopy(output, 0, arr, 0, arr.length);
        }
    }

    private int bucketOf(int value, int shift) {
        int bucket = (value >>> shift) & BYTE_MASK;
        // The top byte carries the sign bit: flip it so negative values
        // (0x80..0xFF unsigned) land in buckets below positive ones.
        return shift == 24 ? bucket ^ 0x80 : bucket;
    }
}
