package com.algoproject.algorithms;

import com.algoproject.model.ComplexityInfo;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Bogo Sort (a.k.a. Permutation Sort, Stupid Sort, Monkey Sort)
 * 
 * <p><b>⚠️ WARNING: FOR EDUCATIONAL/ENTERTAINMENT PURPOSES ONLY!</b></p>
 * 
 * <p>This algorithm randomly shuffles the array until it happens to be sorted.
 * It is hilariously inefficient and should NEVER be used in production.</p>
 * 
 * <p>Average case requires (n-1)×n! shuffles to sort n elements.</p>
 * 
 * <h2>Fun Facts:</h2>
 * <ul>
 *   <li>Expected time to sort 10 elements: ~36 million operations</li>
 *   <li>Expected time to sort 13 elements: longer than the age of the universe</li>
 *   <li>Also known as "Quantum Bogosort" in theoretical discussions</li>
 * </ul>
 * 
 * Time Complexity: Best O(n), Average O((n-1)×n!), Worst O(∞)
 * Space Complexity: O(1)
 * In-place: Yes
 * Stable: No (very no)
 * 
 * @author Algorithm Analysis Project
 * @version 1.0
 */
public class BogoSort implements SortingAlgorithm {
    
    // Maximum iterations to prevent infinite loops
    private static final int MAX_ITERATIONS = 10_000_000;
    
    // Maximum size we'll attempt (anything larger would take forever)
    private static final int MAX_SAFE_SIZE = 10;

    @Override
    public String name() {
        return "Bogo Sort 🎲";
    }

    @Override
    public ComplexityInfo getComplexityInfo() {
        return new ComplexityInfo(
            "Bogo Sort 🎲",
            "O(n)",
            "O((n-1)×n!)",
            "O(∞)",
            "O(1)",
            false,
            true,
            "Randomly shuffles the array until it's sorted. The most inefficient sorting algorithm known. " +
            "Included purely for entertainment and to demonstrate what NOT to do. " +
            "For n=10, average case requires about 36 million shuffles!",
            "When the array is already sorted (miracle!)",
            "Could theoretically never finish (heat death of universe scenario)"
        );
    }

    @Override
    public void sort(int[] data) {
        if (data == null || data.length < 2) {
            return;
        }
        
        // Safety check: refuse to sort large arrays
        if (data.length > MAX_SAFE_SIZE) {
            System.out.println("⚠️ Bogo Sort: Array too large (" + data.length + 
                " elements). Max safe size is " + MAX_SAFE_SIZE + 
                ". Using fallback sort instead.");
            fallbackSort(data);
            return;
        }
        
        ThreadLocalRandom rng = ThreadLocalRandom.current();
        int iterations = 0;
        
        while (!isSorted(data)) {
            shuffle(data, rng);
            iterations++;
            
            // Safety valve
            if (iterations >= MAX_ITERATIONS) {
                System.out.println("⚠️ Bogo Sort gave up after " + iterations + 
                    " iterations. Using fallback sort.");
                fallbackSort(data);
                return;
            }
        }
    }

    private boolean isSorted(int[] arr) {
        for (int i = 1; i < arr.length; i++) {
            if (arr[i] < arr[i - 1]) {
                return false;
            }
        }
        return true;
    }

    private void shuffle(int[] arr, ThreadLocalRandom rng) {
        // Fisher-Yates shuffle
        for (int i = arr.length - 1; i > 0; i--) {
            int j = rng.nextInt(i + 1);
            int temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
    }

    private void fallbackSort(int[] arr) {
        // Simple insertion sort as fallback
        for (int i = 1; i < arr.length; i++) {
            int key = arr[i];
            int j = i - 1;
            while (j >= 0 && arr[j] > key) {
                arr[j + 1] = arr[j];
                j--;
            }
            arr[j + 1] = key;
        }
    }
}
