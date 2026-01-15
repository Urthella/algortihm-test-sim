# Sorting Algorithm Performance Analysis

A comprehensive Java/Spring Boot + React application for analyzing and comparing sorting algorithm performance.

## 🚀 Quick Start

### Backend (Spring Boot)
```bash
mvnw.cmd spring-boot:run
```
API runs at: http://localhost:8080

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
UI runs at: http://localhost:5173

## 📊 Algorithms Analyzed

| Algorithm | Best | Average | Worst | Space | Stable |
|-----------|------|---------|-------|-------|--------|
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Heap Sort | O(n log n) | O(n log n) | O(n log n) | O(1) | No |
| Shell Sort | O(n log n) | O(n^1.25) | O(n²) | O(1) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |
| Radix Sort | O(nk) | O(nk) | O(nk) | O(n+k) | Yes |

## 🎯 Features

### Analysis Capabilities
- **Time Complexity**: Theoretical vs practical measurements
- **Memory Usage**: Heap memory tracking per algorithm
- **Data Patterns**: Random, Partially Sorted, Reverse Sorted
- **Multiple Sizes**: 1K, 10K, 100K, 500K elements

### Web Interface
- Single algorithm benchmarking
- Full comparison mode (all algorithms)
- Interactive charts (Line, Bar, Radar)
- Complexity information display
- CSV/JSON export

### API Endpoints
```
GET  /api/algorithms           - List algorithms
GET  /api/patterns             - List data patterns  
GET  /api/algorithms/complexity - Get complexity info
POST /api/benchmark            - Run single benchmark
POST /api/benchmark/compare    - Run full comparison
```

## 📁 Project Structure

```
├── src/main/java/com/algoproject/
│   ├── algorithms/      # QuickSort, HeapSort, ShellSort, MergeSort, RadixSort
│   ├── bench/           # BenchmarkRunner
│   ├── controller/      # REST API
│   ├── data/            # DataGenerator
│   ├── dto/             # Request/Response DTOs
│   ├── model/           # BenchmarkResult, ComplexityInfo, DataPattern
│   ├── service/         # BenchmarkService
│   └── util/            # Stats, MemoryUtil, ResultsExporter
├── src/test/java/       # Unit tests
├── frontend/            # React application
└── REQUIREMENTS.md      # Full setup guide
```

## 🧪 Testing

```bash
# Run all tests
mvnw.cmd test

# Test categories:
# - Basic Correctness Tests
# - Edge Case Tests (empty, single, duplicates)
# - Data Pattern Tests
# - Size Variation Tests
# - Special Value Tests
```

## 📈 Sample Output

```
Algorithm            Pattern           Size      Mean (ms)    Memory (KB)
--------------------------------------------------------------------------------
Quick Sort           RANDOM           100000        12.345         1024.0
Heap Sort            RANDOM           100000        18.234          512.0
Merge Sort           RANDOM           100000        15.678         2048.0
Shell Sort           RANDOM           100000        25.432          256.0
Radix Sort (LSD)     RANDOM           100000         8.765         1536.0
```

## 📋 Requirements

- Java 17+
- Maven 3.8+
- Node.js 18+ (for frontend)

See [REQUIREMENTS.md](REQUIREMENTS.md) for detailed setup instructions.

## 🎓 Course Project

Algorithms Course Term Project: Performance Analysis of Sorting Algorithms

### Evaluation Criteria
- Technical Implementation (40 points)
- Analysis and Reporting (40 points)
- Visualization and Presentation (20 points)

## Running Modes

### Mode 1: Web Interface (Recommended)
1. Start backend: `mvnw.cmd spring-boot:run`
2. Start frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173

### Mode 2: Swing GUI (Desktop)
```bash
java -cp target/sorting-analysis-0.1.0.jar com.algoproject.App --gui
```

### Mode 3: Console Benchmark
```bash
java -cp target/sorting-analysis-0.1.0.jar com.algoproject.App --bench --export results.csv
```
