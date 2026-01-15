package com.algoproject.algorithms;

import com.algoproject.model.ComplexityInfo;

/**
 * Heap Sort implementation using iterative heapify.
 * Builds a max-heap and repeatedly extracts the maximum element.
 * 
 * Time Complexity: O(n log n) for all cases
 * Space Complexity: O(1)
 * In-place: Yes
 * Stable: No
 */
public class HeapSort implements SortingAlgorithm {
    @Override
    public String name() {
        return "Heap Sort";
    }

    @Override
    public ComplexityInfo getComplexityInfo() {
        return ComplexityInfo.heapSort();
    }

    @Override
    public void sort(int[] data) {
        if (data == null || data.length < 2) {
            return;
        }
        heapSort(data);
    }

    private void heapSort(int[] arr) {
        int n = arr.length;
        for (int i = (n / 2) - 1; i >= 0; i--) {
            heapify(arr, n, i);
        }
        for (int i = n - 1; i > 0; i--) {
            swap(arr, 0, i);
            heapify(arr, i, 0);
        }
    }

    private void heapify(int[] arr, int size, int root) {
        int largest = root;
        while (true) {
            int left = 2 * largest + 1;
            int right = 2 * largest + 2;
            int maxIndex = largest;
            if (left < size && arr[left] > arr[maxIndex]) {
                maxIndex = left;
            }
            if (right < size && arr[right] > arr[maxIndex]) {
                maxIndex = right;
            }
            if (maxIndex == largest) {
                return;
            }
            swap(arr, largest, maxIndex);
            largest = maxIndex;
        }
    }

    private void swap(int[] arr, int i, int j) {
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}
