
# Sorting Algorithm Performance Analysis - Requirements & Setup Guide

> **Not:** Bu dosya, projenin [GitHub reposunda](https://github.com/Urthella/algortihm-test-sim) güncel tutulmaktadır. Kurulum ve gereksinimler için lütfen aşağıdaki adımları takip edin.

## Project Overview
This project provides a comprehensive performance analysis framework for comparing sorting algorithms. For full documentation and source code, visit the [GitHub repository](https://github.com/Urthella/algortihm-test-sim).
- **Quick Sort** - Divide-and-conquer with median-of-three pivot
- **Heap Sort** - In-place comparison sort using binary heap
- **Shell Sort** - Generalized insertion sort with Ciura's gap sequence
- **Merge Sort** - Stable divide-and-conquer sort
- **Radix Sort (LSD)** - Non-comparison sort for integers

## System Requirements


### Backend (Java)
| Requirement | Version |
|-------------|---------|
| Java JDK    | 17 or higher |
| Maven       | 3.8+        |
| Memory      | Minimum 2GB RAM recommended |

### Frontend (React)
| Requirement | Version |
|-------------|---------|
| Node.js     | 18.0+   |
| npm         | 9.0+    |

## Project Structure
```
├── src/main/java/com/algoproject/
│   ├── algorithms/          # Sorting algorithm implementations
│   ├── bench/               # Benchmark runner
│   ├── controller/          # REST API endpoints
│   ├── data/                # Test data generator
│   ├── dto/                 # Data transfer objects
│   ├── model/               # Domain models
│   ├── service/             # Business logic
│   └── util/                # Utilities (Stats, MemoryUtil, ResultsExporter)
├── src/test/java/           # Unit tests
├── frontend/                # React web interface
├── pom.xml                  # Maven configuration
└── README.md
```

## Installation & Setup


### 1. Clone/Download the Project
```bash
git clone https://github.com/Urthella/algortihm-test-sim.git
cd algortihm-test-sim
```

### 2. Backend Setup (Spring Boot)

#### Build the project:
```bash
# Windows
mvnw.cmd clean package

# Linux/macOS
./mvnw clean package
```

#### Run the Spring Boot server:
```bash
# Windows
mvnw.cmd spring-boot:run

# Linux/macOS
./mvnw spring-boot:run
```

The backend API will be available at: `http://localhost:8080`

### 3. Frontend Setup (React + Vite)

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at: `http://localhost:5173`

## Running the Application

1. Start the backend: `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`)
2. Start the frontend: `cd frontend && npm run dev`
3. Open http://localhost:5173 in your browser

The REST API can also be used directly (e.g. with `curl` or Postman) — see the endpoints below.

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/algorithms` | GET | List available algorithms |
| `/api/patterns` | GET | List data patterns |
| `/api/algorithms/complexity` | GET | Get complexity info for all algorithms |
| `/api/algorithms/{name}/complexity` | GET | Get complexity info for one algorithm |
| `/api/benchmark` | POST | Run single benchmark |
| `/api/benchmark/compare` | POST | Run comprehensive comparison |

Validation limits: `size` 1 – 1,000,000 and `trials` 1 – 50; invalid requests return HTTP 400 with an error message.

### Example API Request
```json
POST /api/benchmark
{
  "algorithm": "Quick Sort",
  "pattern": "RANDOM",
  "size": 10000,
  "trials": 5
}
```

### Example Compare Request
```json
POST /api/benchmark/compare
{
  "algorithms": [],
  "patterns": [],
  "sizes": [1000, 10000, 100000],
  "trials": 5
}
```

## Running Tests
```bash
# Run all tests
./mvnw test          # Windows: mvnw.cmd test

# Run a single test class
./mvnw test -Dtest=AlgorithmsTest
```

## Dependencies

### Backend (pom.xml)
- Spring Boot 3.2.2
- Spring Boot Web Starter
- Spring Boot DevTools
- JUnit 5 (testing)

### Frontend (package.json)
- React 19
- Recharts (charts)
- Axios (HTTP client)
- Tailwind CSS (styling)
- Lucide React (icons)
- Vite (build tool)

## Features

### ✅ Implemented
- [x] 5 sorting algorithm implementations
- [x] Time and memory benchmarking
- [x] 3 data patterns (Random, Partially Sorted, Reverse)
- [x] Multiple dataset sizes (1K, 10K, 100K, 500K)
- [x] REST API for benchmarking
- [x] Modern React web interface
- [x] Interactive charts (Line, Bar, Radar)
- [x] Algorithm comparison mode
- [x] Theoretical complexity information
- [x] CSV and JSON export
- [x] Comprehensive unit tests
- [x] Request validation with descriptive HTTP 400 errors
- [x] GitHub Actions CI (backend tests + frontend lint/build)

### Export Formats
- **CSV** - Spreadsheet compatible
- **JSON** - Full data with complexity info
- **Text Report** - Summary statistics

## Configuration

### Benchmark Settings
| Setting | Default | Description |
|---------|---------|-------------|
| Trials | 5 | Number of runs per test |
| Disorder Ratio | 0.1 (10%) | For partially sorted data |
| Sizes | 1000, 10000, 100000 | Test dataset sizes |

### Algorithm-Specific Notes
- **RadixSort**: Supports negative integers via sign-bit remapping on the most significant byte
- **QuickSort**: Uses insertion sort for subarrays ≤16 elements
- **ShellSort**: Uses Ciura's optimized gap sequence

## Troubleshooting

### Backend won't start
```bash
# Check Java version
java -version  # Should be 17+

# Clean and rebuild
mvnw.cmd clean package -DskipTests
```

### Frontend connection errors
- Ensure backend is running on port 8080
- Check CORS settings in `BenchmarkController.java`

### Out of memory errors
```bash
# Increase heap size when running the packaged jar
java -Xmx4g -jar target/sorting-analysis-0.1.0.jar
```

## Performance Tips
1. Close other applications during benchmarking
2. Run multiple trials for consistent results
3. Use Release/Production builds for accurate measurements
4. Warm up JVM with initial runs before recording

## License
MIT — see [LICENSE](https://github.com/Urthella/algortihm-test-sim/blob/master/LICENSE) for details.

## Authors
- [Utku Demirtaş](https://github.com/Urthella)
- [Furkan Karafil](https://github.com/thefcan)
