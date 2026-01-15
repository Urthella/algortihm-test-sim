package com.algoproject.util;

/**
 * Statistical utility functions for benchmark analysis.
 * 
 * <p>Provides basic statistical calculations for arrays of long values,
 * commonly used for analyzing timing measurements.</p>
 * 
 * @author Algorithm Analysis Project
 * @version 1.0
 */
public final class Stats {
    private Stats() {
    }

    /**
     * Calculates the arithmetic mean of an array.
     * @param values Array of long values
     * @return Mean value, or 0.0 if array is empty
     */
    public static double mean(long[] values) {
        if (values.length == 0) {
            return 0.0;
        }
        long sum = 0;
        for (long v : values) {
            sum += v;
        }
        return (double) sum / values.length;
    }

    public static double stddev(long[] values) {
        if (values.length == 0) {
            return 0.0;
        }
        double mean = mean(values);
        double sumSq = 0.0;
        for (long v : values) {
            double diff = v - mean;
            sumSq += diff * diff;
        }
        return Math.sqrt(sumSq / values.length);
    }

    public static long min(long[] values) {
        if (values.length == 0) {
            return 0;
        }
        long min = values[0];
        for (long v : values) {
            if (v < min) {
                min = v;
            }
        }
        return min;
    }

    public static long max(long[] values) {
        if (values.length == 0) {
            return 0;
        }
        long max = values[0];
        for (long v : values) {
            if (v > max) {
                max = v;
            }
        }
        return max;
    }
}
