package com.algoproject.dto;

import com.algoproject.model.DataPattern;
import java.util.List;

/**
 * Request DTO for comparing all algorithms across multiple sizes and patterns.
 */
public record CompareRequest(
    List<String> algorithms,      // Empty or null means all algorithms
    List<DataPattern> patterns,   // Empty or null means all patterns
    List<Integer> sizes,          // Required: sizes to test
    int trials                    // Number of trials per combination
) {
    public CompareRequest {
        if (sizes == null || sizes.isEmpty()) {
            sizes = List.of(1000, 10000, 100000);
        }
        if (trials <= 0) {
            trials = 5;
        }
    }
}
