package com.algoproject.algorithms;

import com.algoproject.model.ComplexityInfo;

/**
 * Shell Sort implementation using Ciura's gap sequence.
 * Generalization of insertion sort that allows exchange of far-apart elements.
 * 
 * Time Complexity: Best O(n log n), Average O(n^1.25), Worst O(n²)
 * Space Complexity: O(1)
 * In-place: Yes
 * Stable: No
 */
public class ShellSort implements SortingAlgorithm {
    private static final int[] CIURA_GAPS = {701, 301, 132, 57, 23, 10, 4, 1};

    @Override
    public String name() {
        return "Shell Sort";
    }

    @Override
    public ComplexityInfo getComplexityInfo() {
        return ComplexityInfo.shellSort();
    }

    @Override
    public void sort(int[] data) {
        if (data == null || data.length < 2) {
            return;
        }
        shellSort(data);
    }

    private void shellSort(int[] arr) {
        int n = arr.length;
        for (int gap : CIURA_GAPS) {
            if (gap > n) {
                continue;
            }
            for (int i = gap; i < n; i++) {
                int temp = arr[i];
                int j = i;
                while (j >= gap && arr[j - gap] > temp) {
                    arr[j] = arr[j - gap];
                    j -= gap;
                }
                arr[j] = temp;
            }
        }
    }
}
