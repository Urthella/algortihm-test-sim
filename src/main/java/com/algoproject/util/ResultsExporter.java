package com.algoproject.util;

import com.algoproject.model.BenchmarkResult;
import com.algoproject.model.ComplexityInfo;
import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Utility class for exporting benchmark results to various formats.
 * Supports CSV and JSON export formats.
 */
public final class ResultsExporter {
    private ResultsExporter() {
    }

    /**
     * Exports benchmark results to CSV format.
     * @param results List of benchmark results to export
     * @param path Path to the output CSV file
     * @throws IOException if file writing fails
     */
    public static void toCsv(List<BenchmarkResult> results, Path path) throws IOException {
        Files.createDirectories(path.toAbsolutePath().getParent());
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(path.toFile(), false))) {
            writer.write("algorithm,pattern,size,mean_ms,stddev_ms,best_ms,worst_ms,memory_bytes");
            writer.newLine();
            for (BenchmarkResult r : results) {
                writer.write(String.format("%s,%s,%d,%.6f,%.6f,%.6f,%.6f,%d", 
                    r.algorithm(), r.pattern(), r.size(), r.meanMillis(), 
                    r.stddevMillis(), r.bestMillis(), r.worstMillis(), r.memoryBytes()));
                writer.newLine();
            }
        }
    }

    /**
     * Exports benchmark results to JSON format.
     * @param results List of benchmark results to export
     * @param path Path to the output JSON file
     * @throws IOException if file writing fails
     */
    public static void toJson(List<BenchmarkResult> results, Path path) throws IOException {
        Files.createDirectories(path.toAbsolutePath().getParent());
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(path.toFile(), false))) {
            writer.write("{\n");
            writer.write("  \"exportDate\": \"" + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "\",\n");
            writer.write("  \"totalResults\": " + results.size() + ",\n");
            writer.write("  \"results\": [\n");
            
            for (int i = 0; i < results.size(); i++) {
                BenchmarkResult r = results.get(i);
                writer.write("    {\n");
                writer.write("      \"algorithm\": \"" + r.algorithm() + "\",\n");
                writer.write("      \"pattern\": \"" + r.pattern() + "\",\n");
                writer.write("      \"size\": " + r.size() + ",\n");
                writer.write("      \"meanMillis\": " + String.format("%.6f", r.meanMillis()) + ",\n");
                writer.write("      \"stddevMillis\": " + String.format("%.6f", r.stddevMillis()) + ",\n");
                writer.write("      \"bestMillis\": " + String.format("%.6f", r.bestMillis()) + ",\n");
                writer.write("      \"worstMillis\": " + String.format("%.6f", r.worstMillis()) + ",\n");
                writer.write("      \"memoryBytes\": " + r.memoryBytes() + "\n");
                writer.write("    }" + (i < results.size() - 1 ? "," : "") + "\n");
            }
            
            writer.write("  ]\n");
            writer.write("}\n");
        }
    }

    /**
     * Exports benchmark results with complexity information to JSON format.
     * @param results List of benchmark results to export
     * @param complexityInfo Map of algorithm names to their complexity info
     * @param path Path to the output JSON file
     * @throws IOException if file writing fails
     */
    public static void toJsonWithComplexity(List<BenchmarkResult> results, 
                                            Map<String, ComplexityInfo> complexityInfo, 
                                            Path path) throws IOException {
        Files.createDirectories(path.toAbsolutePath().getParent());
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(path.toFile(), false))) {
            writer.write("{\n");
            writer.write("  \"exportDate\": \"" + LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "\",\n");
            writer.write("  \"totalResults\": " + results.size() + ",\n");
            
            // Write complexity info
            writer.write("  \"complexityInfo\": {\n");
            int complexityIndex = 0;
            for (Map.Entry<String, ComplexityInfo> entry : complexityInfo.entrySet()) {
                ComplexityInfo c = entry.getValue();
                writer.write("    \"" + entry.getKey() + "\": {\n");
                writer.write("      \"bestCase\": \"" + c.bestCase() + "\",\n");
                writer.write("      \"averageCase\": \"" + c.averageCase() + "\",\n");
                writer.write("      \"worstCase\": \"" + c.worstCase() + "\",\n");
                writer.write("      \"spaceComplexity\": \"" + c.spaceComplexity() + "\",\n");
                writer.write("      \"isStable\": " + c.isStable() + ",\n");
                writer.write("      \"isInPlace\": " + c.isInPlace() + ",\n");
                writer.write("      \"description\": \"" + escapeJson(c.description()) + "\"\n");
                writer.write("    }" + (complexityIndex < complexityInfo.size() - 1 ? "," : "") + "\n");
                complexityIndex++;
            }
            writer.write("  },\n");
            
            // Write results
            writer.write("  \"results\": [\n");
            for (int i = 0; i < results.size(); i++) {
                BenchmarkResult r = results.get(i);
                writer.write("    {\n");
                writer.write("      \"algorithm\": \"" + r.algorithm() + "\",\n");
                writer.write("      \"pattern\": \"" + r.pattern() + "\",\n");
                writer.write("      \"size\": " + r.size() + ",\n");
                writer.write("      \"meanMillis\": " + String.format("%.6f", r.meanMillis()) + ",\n");
                writer.write("      \"stddevMillis\": " + String.format("%.6f", r.stddevMillis()) + ",\n");
                writer.write("      \"bestMillis\": " + String.format("%.6f", r.bestMillis()) + ",\n");
                writer.write("      \"worstMillis\": " + String.format("%.6f", r.worstMillis()) + ",\n");
                writer.write("      \"memoryBytes\": " + r.memoryBytes() + "\n");
                writer.write("    }" + (i < results.size() - 1 ? "," : "") + "\n");
            }
            writer.write("  ]\n");
            writer.write("}\n");
        }
    }

    /**
     * Generates a summary report in plain text format.
     * @param results List of benchmark results
     * @param path Path to the output text file
     * @throws IOException if file writing fails
     */
    public static void toSummaryReport(List<BenchmarkResult> results, Path path) throws IOException {
        Files.createDirectories(path.toAbsolutePath().getParent());
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(path.toFile(), false))) {
            writer.write("=".repeat(80) + "\n");
            writer.write("SORTING ALGORITHM BENCHMARK REPORT\n");
            writer.write("Generated: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) + "\n");
            writer.write("=".repeat(80) + "\n\n");

            // Group by algorithm
            Map<String, List<BenchmarkResult>> byAlgorithm = results.stream()
                .collect(java.util.stream.Collectors.groupingBy(BenchmarkResult::algorithm));

            for (Map.Entry<String, List<BenchmarkResult>> entry : byAlgorithm.entrySet()) {
                writer.write("-".repeat(40) + "\n");
                writer.write(entry.getKey().toUpperCase() + "\n");
                writer.write("-".repeat(40) + "\n");
                
                List<BenchmarkResult> algoResults = entry.getValue();
                double avgTime = algoResults.stream().mapToDouble(BenchmarkResult::meanMillis).average().orElse(0);
                double avgMem = algoResults.stream().mapToDouble(r -> r.memoryBytes() / 1024.0).average().orElse(0);
                double minTime = algoResults.stream().mapToDouble(BenchmarkResult::bestMillis).min().orElse(0);
                double maxTime = algoResults.stream().mapToDouble(BenchmarkResult::worstMillis).max().orElse(0);
                
                writer.write(String.format("  Average Time:    %.3f ms\n", avgTime));
                writer.write(String.format("  Average Memory:  %.1f KB\n", avgMem));
                writer.write(String.format("  Best Time:       %.3f ms\n", minTime));
                writer.write(String.format("  Worst Time:      %.3f ms\n", maxTime));
                writer.write(String.format("  Tests Run:       %d\n\n", algoResults.size()));
                
                writer.write("  By Pattern:\n");
                Map<String, List<BenchmarkResult>> byPattern = algoResults.stream()
                    .collect(java.util.stream.Collectors.groupingBy(r -> r.pattern().toString()));
                for (Map.Entry<String, List<BenchmarkResult>> patternEntry : byPattern.entrySet()) {
                    double patternAvg = patternEntry.getValue().stream()
                        .mapToDouble(BenchmarkResult::meanMillis).average().orElse(0);
                    writer.write(String.format("    %-20s %.3f ms\n", patternEntry.getKey(), patternAvg));
                }
                writer.write("\n");
            }

            writer.write("=".repeat(80) + "\n");
            writer.write("END OF REPORT\n");
            writer.write("=".repeat(80) + "\n");
        }
    }

    private static String escapeJson(String text) {
        return text.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }
}