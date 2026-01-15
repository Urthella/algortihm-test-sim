package com.algoproject.algorithms;

import com.algoproject.model.ComplexityInfo;
import java.util.ArrayDeque;
import java.util.Deque;

/**
 * Quick Sort implementation using iterative approach with median-of-three pivot selection.
 * Switches to insertion sort for small subarrays (threshold: 16 elements).
 * 
 * Time Complexity: Best O(n log n), Average O(n log n), Worst O(n²)
 * Space Complexity: O(log n) for the stack
 * In-place: Yes (with auxiliary stack)
 * Stable: No
 */
public class QuickSort implements SortingAlgorithm {
    private static final int INSERTION_SORT_THRESHOLD = 16;

    @Override
    public String name() {
        return "Quick Sort";
    }

    @Override
    public ComplexityInfo getComplexityInfo() {
        return ComplexityInfo.quickSort();
    }

    @Override
    public void sort(int[] data) {
        if (data == null || data.length < 2) {
            return;
        }
        iterativeQuickSort(data);
    }

    private void iterativeQuickSort(int[] arr) {
        Deque<int[]> stack = new ArrayDeque<>();
        stack.push(new int[]{0, arr.length - 1});

        while (!stack.isEmpty()) {
            int[] range = stack.pop();
            int left = range[0];
            int right = range[1];
            if (right - left <= INSERTION_SORT_THRESHOLD) {
                insertionSort(arr, left, right);
                continue;
            }

            int pivotIndex = partition(arr, left, right);
            // Push larger partition first to keep stack shallow.
            if (pivotIndex - 1 - left > right - (pivotIndex + 1)) {
                if (left < pivotIndex - 1) {
                    stack.push(new int[]{left, pivotIndex - 1});
                }
                if (pivotIndex + 1 < right) {
                    stack.push(new int[]{pivotIndex + 1, right});
                }
            } else {
                if (pivotIndex + 1 < right) {
                    stack.push(new int[]{pivotIndex + 1, right});
                }
                if (left < pivotIndex - 1) {
                    stack.push(new int[]{left, pivotIndex - 1});
                }
            }
        }
    }

    private int partition(int[] arr, int left, int right) {
        int mid = left + ((right - left) >>> 1);
        int pivotIndex = medianOfThree(arr, left, mid, right);
        int pivotValue = arr[pivotIndex];
        swap(arr, pivotIndex, right);
        int store = left;
        for (int i = left; i < right; i++) {
            if (arr[i] <= pivotValue) {
                swap(arr, i, store);
                store++;
            }
        }
        swap(arr, store, right);
        return store;
    }

    private int medianOfThree(int[] arr, int a, int b, int c) {
        int x = arr[a], y = arr[b], z = arr[c];
        if (x < y) {
            if (y < z) {
                return b;
            } else if (x < z) {
                return c;
            } else {
                return a;
            }
        } else {
            if (x < z) {
                return a;
            } else if (y < z) {
                return c;
            } else {
                return b;
            }
        }
    }

    private void insertionSort(int[] arr, int left, int right) {
        for (int i = left + 1; i <= right; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= left && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }

    private void swap(int[] arr, int i, int j) {
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}
