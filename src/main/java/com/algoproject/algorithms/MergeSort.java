package com.algoproject.algorithms;

import com.algoproject.model.ComplexityInfo;

/**
 * Merge Sort implementation using divide-and-conquer approach.
 * Divides array into halves, recursively sorts them, and merges sorted halves.
 * 
 * Time Complexity: O(n log n) for all cases
 * Space Complexity: O(n) for the buffer array
 * In-place: No
 * Stable: Yes
 */
public class MergeSort implements SortingAlgorithm {
    @Override
    public String name() {
        return "Merge Sort";
    }

    @Override
    public ComplexityInfo getComplexityInfo() {
        return ComplexityInfo.mergeSort();
    }

    @Override
    public void sort(int[] data) {
        if (data == null || data.length < 2) {
            return;
        }
        int[] buffer = new int[data.length];
        mergeSort(data, buffer, 0, data.length - 1);
    }

    private void mergeSort(int[] arr, int[] buffer, int left, int right) {
        if (left >= right) {
            return;
        }
        int mid = left + ((right - left) >>> 1);
        mergeSort(arr, buffer, left, mid);
        mergeSort(arr, buffer, mid + 1, right);
        merge(arr, buffer, left, mid, right);
    }

    private void merge(int[] arr, int[] buffer, int left, int mid, int right) {
        int i = left;
        int j = mid + 1;
        int k = left;
        while (i <= mid && j <= right) {
            if (arr[i] <= arr[j]) {
                buffer[k++] = arr[i++];
            } else {
                buffer[k++] = arr[j++];
            }
        }
        while (i <= mid) {
            buffer[k++] = arr[i++];
        }
        while (j <= right) {
            buffer[k++] = arr[j++];
        }
        for (int idx = left; idx <= right; idx++) {
            arr[idx] = buffer[idx];
        }
    }
}
