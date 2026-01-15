package com.algoproject.data;

import com.algoproject.model.DataPattern;
import java.util.concurrent.ThreadLocalRandom;

/**
 * Generates test datasets with various patterns for sorting algorithm benchmarks.
 * 
 * <p>Supports three data patterns:</p>
 * <ul>
 *   <li><b>RANDOM</b> - Uniformly distributed random integers (0 to 999,999)</li>
 *   <li><b>PARTIALLY_SORTED</b> - Sorted array with a percentage of random swaps</li>
 *   <li><b>REVERSE_SORTED</b> - Array sorted in descending order</li>
 * </ul>
 * 
 * <h2>Usage Example:</h2>
 * <pre>{@code
 * DataGenerator generator = new DataGenerator(0.1); // 10% disorder
 * int[] randomData = generator.generate(10000, DataPattern.RANDOM);
 * int[] partialData = generator.generate(10000, DataPattern.PARTIALLY_SORTED);
 * }</pre>
 * 
 * @author Algorithm Analysis Project
 * @version 1.0
 */
public class DataGenerator {
    private static final int DEFAULT_BOUND = 1_000_000;
    private final double disorderRatio;

    public DataGenerator() {
        this(0.1); // 10% disorder by default for partially sorted sets
    }

    public DataGenerator(double disorderRatio) {
        this.disorderRatio = Math.max(0.0, Math.min(1.0, disorderRatio));
    }

    public int[] generate(int size, DataPattern pattern) {
        int[] data = new int[size];
        ThreadLocalRandom rng = ThreadLocalRandom.current();
        switch (pattern) {
            case RANDOM -> fillRandom(data, rng);
            case REVERSE_SORTED -> fillReverse(data);
            case PARTIALLY_SORTED -> fillPartiallySorted(data, rng);
            default -> throw new IllegalArgumentException("Unsupported pattern: " + pattern);
        }
        return data;
    }

    private void fillRandom(int[] data, ThreadLocalRandom rng) {
        for (int i = 0; i < data.length; i++) {
            data[i] = rng.nextInt(DEFAULT_BOUND);
        }
    }

    private void fillReverse(int[] data) {
        for (int i = 0; i < data.length; i++) {
            data[i] = data.length - i;
        }
    }

    private void fillPartiallySorted(int[] data, ThreadLocalRandom rng) {
        // Start sorted, then perform a limited number of swaps to introduce disorder.
        for (int i = 0; i < data.length; i++) {
            data[i] = i;
        }
        int swaps = (int) (data.length * disorderRatio);
        for (int i = 0; i < swaps; i++) {
            int a = rng.nextInt(data.length);
            int b = rng.nextInt(data.length);
            swap(data, a, b);
        }
    }

    private void swap(int[] arr, int i, int j) {
        int tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }
}
