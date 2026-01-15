import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Play, 
  Settings, 
  BarChart3, 
  Cpu, 
  Zap, 
  Clock, 
  Database,
  Activity,
  Download,
  GitCompare,
  Info,
  TrendingUp,
  CheckCircle,
  XCircle,
  Layers,
  Shuffle,
  ArrowDownRight,
  Maximize2,
  X
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Brush
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Types
interface BenchmarkResult {
  algorithm: string;
  pattern: string;
  size: number;
  meanMillis: number;
  stddevMillis: number;
  bestMillis: number;
  worstMillis: number;
  memoryBytes: number;
}

interface BenchmarkRequest {
  algorithm: string;
  pattern: string;
  size: number;
  trials: number;
}

interface ComplexityInfo {
  algorithmName: string;
  bestCase: string;
  averageCase: string;
  worstCase: string;
  spaceComplexity: string;
  isStable: boolean;
  isInPlace: boolean;
  description: string;
  bestCaseScenario: string;
  worstCaseScenario: string;
}

interface AlgorithmSummary {
  algorithm: string;
  avgTimeMs: number;
  avgMemoryKb: number;
  minTimeMs: number;
  maxTimeMs: number;
  testCount: number;
}

interface ComparisonSummary {
  fastestAlgorithm: string;
  mostMemoryEfficient: string;
  totalBenchmarkTimeMs: number;
  totalRuns: number;
  algorithmSummaries: Record<string, AlgorithmSummary>;
}

interface CompareResponse {
  results: BenchmarkResult[];
  complexityInfo: Record<string, ComplexityInfo>;
  summary: ComparisonSummary;
}

// Components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden", className)}>
    {children}
  </div>
);

const StatCard = ({ title, value, unit, icon: Icon, color }: { title: string; value: string; unit: string; icon: React.ElementType; color: string }) => (
  <Card className="p-6 flex items-center space-x-4 hover:shadow-xl transition-shadow">
    <div className={cn("p-3 rounded-lg", color)}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-slate-400">{title}</p>
      <div className="flex items-baseline space-x-1">
        <h3 className="text-2xl font-bold text-slate-100">{value}</h3>
        <span className="text-sm text-slate-400">{unit}</span>
      </div>
    </div>
  </Card>
);

const TabButton = ({ active, onClick, children, icon: Icon }: { active: boolean; onClick: () => void; children: React.ReactNode; icon: React.ElementType }) => (
  <button
    onClick={onClick}
    className={cn(
      "flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all",
      active 
        ? "bg-primary-600 text-white shadow-lg shadow-primary-500/30" 
        : "bg-slate-700 text-slate-300 hover:bg-slate-600"
    )}
  >
    <Icon className="w-4 h-4" />
    <span>{children}</span>
  </button>
);

// Algorithm colors for charts
const ALGO_COLORS: Record<string, string> = {
  'Quick Sort': '#3b82f6',
  'Heap Sort': '#8b5cf6',
  'Shell Sort': '#10b981',
  'Merge Sort': '#f59e0b',
  'Radix Sort (LSD)': '#ef4444',
  'Bogo Sort 🎲': '#ec4899'  // Pink for the silly one
};

// Algorithms to exclude from charts (but show in tables)
const CHART_EXCLUDED_ALGORITHMS = ['Bogo Sort 🎲'];

function App() {
  const [algorithms, setAlgorithms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BenchmarkResult | null>(null);
  const [history, setHistory] = useState<BenchmarkResult[]>([]);
  const [activeTab, setActiveTab] = useState<'benchmark' | 'compare' | 'analysis'>('benchmark');
  const [complexityInfo, setComplexityInfo] = useState<Record<string, ComplexityInfo>>({});
  const [compareResults, setCompareResults] = useState<CompareResponse | null>(null);
  const [comparingLoading, setComparingLoading] = useState(false);
  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  
  const [config, setConfig] = useState<BenchmarkRequest>({
    algorithm: 'Quick Sort',
    pattern: 'RANDOM',
    size: 10000,
    trials: 5
  });


  const [compareConfig, setCompareConfig] = useState({
    sizes: [1000, 10000, 100000],
    trials: 5
  });

  useEffect(() => {
    // Fetch available algorithms
    axios.get('http://localhost:8080/api/algorithms')
      .then(res => {
        setAlgorithms(res.data);
        if (res.data.length > 0) setConfig(c => ({ ...c, algorithm: res.data[0] }));
      })
      .catch(err => console.error("Failed to fetch algorithms", err));
    
    // Fetch complexity info
    axios.get('http://localhost:8080/api/algorithms/complexity')
      .then(res => setComplexityInfo(res.data))
      .catch(err => console.error("Failed to fetch complexity info", err));
  }, []);

  const runBenchmark = async () => {
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/benchmark', config);
      setResult(res.data);
      setHistory(prev => [...prev, res.data]);
    } catch (err) {
      console.error("Benchmark failed", err);
    } finally {
      setLoading(false);
    }
  };

  const runComparison = async () => {
    setComparingLoading(true);
    try {
      const res = await axios.post('http://localhost:8080/api/benchmark/compare', {
        algorithms: [],
        patterns: [],
        sizes: compareConfig.sizes,
        trials: compareConfig.trials
      });
      setCompareResults(res.data);
      // Also add to history for tracking
      setHistory(prev => [...prev, ...res.data.results]);
    } catch (err) {
      console.error("Comparison failed", err);
    } finally {
      setComparingLoading(false);
    }
  };

  const exportToJson = () => {
    const data = compareResults || { results: history };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmark-results-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const exportToCsv = () => {
    const results = compareResults?.results || history;
    if (results.length === 0) return;
    
    const headers = ['Algorithm', 'Pattern', 'Size', 'Mean (ms)', 'Stddev', 'Best (ms)', 'Worst (ms)', 'Memory (KB)'];
    const rows = results.map(r => [
      r.algorithm, r.pattern, r.size, r.meanMillis.toFixed(3), 
      r.stddevMillis.toFixed(3), r.bestMillis.toFixed(3), 
      r.worstMillis.toFixed(3), (r.memoryBytes / 1024).toFixed(1)
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `benchmark-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Calculate theoretical complexity value for a given n
  const calculateTheoreticalOps = (complexity: string, n: number): string => {
    const k = Math.ceil(Math.log10(n + 1)); // number of digits for radix sort
    
    if (complexity.includes('n²') || complexity.includes('n^2')) {
      return (n * n).toLocaleString();
    } else if (complexity.includes('n log n')) {
      return Math.round(n * Math.log2(n)).toLocaleString();
    } else if (complexity.includes('nk') || complexity.includes('n + k')) {
      return Math.round(n * k).toLocaleString();
    } else if (complexity.includes('n^1.25') || complexity.includes('n^1.5')) {
      return Math.round(Math.pow(n, 1.3)).toLocaleString(); // average ~n^1.3
    } else if (complexity.includes('(n-1)×n!') || complexity.includes('n!')) {
      return n <= 10 ? ((n - 1) * factorial(n)).toLocaleString() : '∞';
    } else if (complexity === 'O(n)') {
      return n.toLocaleString();
    } else if (complexity === 'O(1)') {
      return '1';
    } else if (complexity === 'O(log n)') {
      return Math.round(Math.log2(n)).toLocaleString();
    }
    return '-';
  };

  // Factorial helper for Bogo Sort
  const factorial = (n: number): number => {
    if (n <= 1) return 1;
    if (n > 10) return Infinity;
    return n * factorial(n - 1);
  };

  // Get max size from compare results for theoretical calculation
  const getMaxTestedSize = (): number => {
    if (!compareResults?.results.length) return 10000;
    return Math.max(...compareResults.results.map(r => r.size));
  };

  // Prepare comparison chart data (excluding Bogo Sort)
  // Average across all patterns for each algorithm at each size
  const getComparisonChartData = () => {
    if (!compareResults) return [];
    
    // Group by size, then by algorithm - collect all times to average
    const groupedBySize: Record<number, Record<string, { sum: number; count: number }>> = {};
    
    compareResults.results
      .filter(r => !CHART_EXCLUDED_ALGORITHMS.includes(r.algorithm))
      .forEach(r => {
        if (!groupedBySize[r.size]) {
          groupedBySize[r.size] = {};
        }
        if (!groupedBySize[r.size][r.algorithm]) {
          groupedBySize[r.size][r.algorithm] = { sum: 0, count: 0 };
        }
        groupedBySize[r.size][r.algorithm].sum += r.meanMillis;
        groupedBySize[r.size][r.algorithm].count += 1;
      });
    
    // Convert to averaged values
    return Object.entries(groupedBySize)
      .map(([size, algos]) => {
        const result: Record<string, number> = { size: Number(size) };
        Object.entries(algos).forEach(([algo, data]) => {
          result[algo] = data.sum / data.count;
        });
        return result;
      })
      .sort((a, b) => a.size - b.size);
  };

  // Prepare radar chart data for algorithm comparison (excluding Bogo Sort)
  const getRadarData = () => {
    if (!compareResults) return [];
    
    const summaries = compareResults.summary.algorithmSummaries;
    const filteredSummaries = Object.values(summaries)
      .filter(s => !CHART_EXCLUDED_ALGORITHMS.includes(s.algorithm));
    
    const maxTime = Math.max(...filteredSummaries.map(s => s.avgTimeMs));
    const minTime = Math.min(...filteredSummaries.map(s => s.avgTimeMs));
    const maxMem = Math.max(...filteredSummaries.map(s => s.avgMemoryKb));
    const minMem = Math.min(...filteredSummaries.map(s => s.avgMemoryKb));
    
    return filteredSummaries.map(s => {
      // Better normalization: fastest gets 100, slowest gets 20 (not 0)
      const speedScore = maxTime === minTime ? 100 : 
        Math.round(100 - ((s.avgTimeMs - minTime) / (maxTime - minTime) * 80));
      
      const memoryScore = maxMem === minMem ? 100 :
        Math.round(100 - ((s.avgMemoryKb - minMem) / (maxMem - minMem) * 80));
      
      // Consistency based on coefficient of variation
      const cv = s.avgTimeMs > 0 ? ((s.maxTimeMs - s.minTimeMs) / s.avgTimeMs) : 0;
      const consistencyScore = Math.round(Math.max(20, 100 - cv * 100));
      
      return {
        algorithm: s.algorithm.replace(' Sort', '').replace(' (LSD)', ''),
        speed: speedScore,
        memory: memoryScore,
        consistency: consistencyScore,
        // Raw values for tooltip
        rawTime: s.avgTimeMs,
        rawMemory: s.avgMemoryKb,
        rawVariance: s.maxTimeMs - s.minTimeMs,
      };
    });
  };

  // Get algorithms for chart lines (excluding Bogo Sort)
  const getChartAlgorithms = () => {
    return algorithms.filter(algo => !CHART_EXCLUDED_ALGORITHMS.includes(algo));
  };

  return (
    <div className="min-h-screen bg-slate-900 px-4 py-8 font-sans">
      <div className="max-w-[1800px] mx-auto space-y-8">
        
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-100 tracking-tight">
              🔬 Sorting Algorithm Analysis
            </h1>
            <p className="text-slate-400 mt-1">Performance benchmarking & visualization tool for Quick, Heap, Shell, Merge, and Radix Sort</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="px-4 py-2 bg-slate-800 rounded-full border border-slate-700 text-sm font-medium text-slate-300 flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 mr-2 animate-pulse"></div>
              System Ready
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex space-x-2">
          <TabButton 
            active={activeTab === 'benchmark'} 
            onClick={() => setActiveTab('benchmark')}
            icon={Play}
          >
            Single Benchmark
          </TabButton>
          <TabButton 
            active={activeTab === 'compare'} 
            onClick={() => setActiveTab('compare')}
            icon={GitCompare}
          >
            Compare All
          </TabButton>
          <TabButton 
            active={activeTab === 'analysis'} 
            onClick={() => setActiveTab('analysis')}
            icon={TrendingUp}
          >
            Analysis
          </TabButton>
        </div>

        {/* Single Benchmark Tab */}
        {activeTab === 'benchmark' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {/* Sidebar / Controls */}
            <div className="xl:col-span-2 space-y-6">
              <Card className="p-6 space-y-6">
                <div className="flex items-center space-x-2 text-slate-200 mb-4">
                  <Settings className="w-5 h-5" />
                  <h2 className="font-semibold">Configuration</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Algorithm</label>
                    <select 
                      className="w-full rounded-lg bg-slate-700 border-slate-600 text-slate-200 text-sm focus:ring-2 focus:ring-primary-500"
                      value={config.algorithm}
                      onChange={e => setConfig({...config, algorithm: e.target.value})}
                    >
                      {algorithms.map(algo => (
                        <option key={algo} value={algo}>{algo}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Data Pattern</label>
                    <select 
                      className="w-full rounded-lg bg-slate-700 border-slate-600 text-slate-200 text-sm focus:ring-2 focus:ring-primary-500"
                      value={config.pattern}
                      onChange={e => setConfig({...config, pattern: e.target.value})}
                    >
                      <option value="RANDOM">Random</option>
                      <option value="PARTIALLY_SORTED">Partially Sorted</option>
                      <option value="REVERSE_SORTED">Reverse Sorted</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Dataset Size</label>
                    <select 
                      className="w-full rounded-lg bg-slate-700 border-slate-600 text-slate-200 text-sm focus:ring-2 focus:ring-primary-500"
                      value={config.size}
                      onChange={e => setConfig({...config, size: Number(e.target.value)})}
                    >
                      <option value="1000">1,000 (Small)</option>
                      <option value="10000">10,000 (Medium)</option>
                      <option value="100000">100,000 (Large)</option>
                      <option value="500000">500,000 (X-Large)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Trials</label>
                    <input 
                      type="number" 
                      className="w-full rounded-lg bg-slate-700 border-slate-600 text-slate-200 text-sm focus:ring-2 focus:ring-primary-500"
                      value={config.trials}
                      onChange={e => setConfig({...config, trials: Number(e.target.value)})}
                      min="1" max="20"
                    />
                  </div>
                </div>

                <button
                  onClick={runBenchmark}
                  disabled={loading}
                  className="w-full py-3 px-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg font-medium flex items-center justify-center transition-colors shadow-lg shadow-primary-500/20"
                >
                  {loading ? (
                    <Activity className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Running...' : 'Run Benchmark'}
                </button>
              </Card>

              {/* Algorithm Info Card */}
              {complexityInfo[config.algorithm] && (
                <Card className="p-6">
                  <div className="flex items-center space-x-2 text-slate-200 mb-4">
                    <Info className="w-5 h-5" />
                    <h3 className="font-semibold">Algorithm Info</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Best Case:</span>
                      <span className="font-mono text-green-400">{complexityInfo[config.algorithm].bestCase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Average:</span>
                      <span className="font-mono text-blue-400">{complexityInfo[config.algorithm].averageCase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Worst Case:</span>
                      <span className="font-mono text-red-400">{complexityInfo[config.algorithm].worstCase}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Space:</span>
                      <span className="font-mono text-purple-400">{complexityInfo[config.algorithm].spaceComplexity}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Stable:</span>
                      {complexityInfo[config.algorithm].isStable ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">In-place:</span>
                      {complexityInfo[config.algorithm].isInPlace ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Main Content */}
            <div className="xl:col-span-10 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard 
                  title="Execution Time" 
                  value={result ? result.meanMillis.toFixed(3) : '-'} 
                  unit="ms" 
                  icon={Clock} 
                  color="bg-blue-500" 
                />
                <StatCard 
                  title="Memory Usage" 
                  value={result ? (result.memoryBytes / 1024).toFixed(1) : '-'} 
                  unit="KB" 
                  icon={Database} 
                  color="bg-purple-500" 
                />
                <StatCard 
                  title="Throughput" 
                  value={result ? (result.size / (result.meanMillis / 1000)).toFixed(0) : '-'} 
                  unit="ops/sec" 
                  icon={Zap} 
                  color="bg-orange-500" 
                />
              </div>

              {/* Charts Area */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-200 flex items-center">
                      <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
                      Time Performance
                      <span className="ml-2 text-xs text-slate-500">({history.length} runs)</span>
                    </h3>
                    <button
                      onClick={() => setHistory([])}
                      disabled={history.length === 0}
                      className="px-3 py-1 text-xs bg-red-900/50 hover:bg-red-800/50 disabled:opacity-50 disabled:cursor-not-allowed text-red-400 rounded-lg transition-colors flex items-center"
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Clear Charts
                    </button>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history.map((h, i) => ({ ...h, index: i + 1 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="index" 
                          tick={{fontSize: 12, fill: '#94a3b8'}} 
                          label={{ value: 'Run #', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                          stroke="#475569"
                        />
                        <YAxis 
                          tick={{fontSize: 12, fill: '#94a3b8'}} 
                          tickFormatter={(value) => `${value.toFixed(2)}`}
                          width={70}
                          label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                          stroke="#475569"
                        />
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#e2e8f0'}}
                          formatter={(value, _name, props) => {
                            const v = typeof value === 'number' ? value : 0;
                            const payload = props?.payload as BenchmarkResult;
                            return [`${v.toFixed(4)} ms`, `${payload?.algorithm || ''} (${payload?.pattern || ''})`];
                          }}
                          labelFormatter={(label) => `Run #${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="meanMillis" 
                          name="Time (ms)" 
                          stroke="#3b82f6" 
                          strokeWidth={2} 
                          dot={{ r: 5, fill: '#3b82f6' }}
                          activeDot={{ r: 7, fill: '#1d4ed8' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>

                <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-semibold text-slate-200 flex items-center">
                      <Cpu className="w-5 h-5 mr-2 text-purple-400" />
                      Memory Consumption
                      <span className="ml-2 text-xs text-slate-500">({history.length} runs)</span>
                    </h3>
                  </div>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={history.map((h, i) => ({ ...h, index: i + 1 }))}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis 
                          dataKey="index" 
                          tick={{fontSize: 12, fill: '#94a3b8'}} 
                          label={{ value: 'Run #', position: 'insideBottom', offset: -5, fill: '#94a3b8' }}
                          stroke="#475569"
                        />
                        <YAxis 
                          tick={{fontSize: 12, fill: '#94a3b8'}} 
                          tickFormatter={(value) => `${(value / 1024).toFixed(0)}`}
                          width={70}
                          label={{ value: 'Memory (KB)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }}
                          stroke="#475569"
                        />
                        <Tooltip 
                          contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#e2e8f0'}}
                          formatter={(value, _name, props) => {
                            const v = typeof value === 'number' ? value : 0;
                            const payload = props?.payload as BenchmarkResult;
                            return [`${(v / 1024).toFixed(2)} KB`, `${payload?.algorithm || ''} (${payload?.pattern || ''})`];
                          }}
                          labelFormatter={(label) => `Run #${label}`}
                        />
                        <Legend />
                        <Line 
                          type="monotone" 
                          dataKey="memoryBytes" 
                          name="Memory (KB)" 
                          stroke="#8b5cf6" 
                          strokeWidth={2} 
                          dot={{ r: 5, fill: '#8b5cf6' }}
                          activeDot={{ r: 7, fill: '#6d28d9' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </Card>
              </div>

              {/* Detailed Results Table */}
              <Card className="overflow-hidden">
                <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="font-semibold text-slate-200">Recent Benchmarks</h3>
                  <div className="flex space-x-2">
                    <button 
                      onClick={exportToCsv}
                      disabled={history.length === 0}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition-colors text-slate-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>CSV</span>
                    </button>
                    <button 
                      onClick={exportToJson}
                      disabled={history.length === 0}
                      className="flex items-center space-x-1 px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-lg transition-colors text-slate-300"
                    >
                      <Download className="w-4 h-4" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700/50 text-slate-400 font-medium">
                      <tr>
                        <th className="px-6 py-3">Algorithm</th>
                        <th className="px-6 py-3">Pattern</th>
                        <th className="px-6 py-3">Size</th>
                        <th className="px-6 py-3">Mean Time</th>
                        <th className="px-6 py-3">Memory</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {history.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                            No benchmarks run yet. Start by clicking "Run Benchmark".
                          </td>
                        </tr>
                      ) : (
                        history.slice().reverse().map((h, i) => (
                          <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-3 font-medium text-slate-200">{h.algorithm}</td>
                            <td className="px-6 py-3 text-slate-400">{h.pattern}</td>
                            <td className="px-6 py-3 text-slate-400">{h.size.toLocaleString()}</td>
                            <td className="px-6 py-3 text-slate-400">{h.meanMillis.toFixed(3)} ms</td>
                            <td className="px-6 py-3 text-slate-400">{(h.memoryBytes / 1024).toFixed(1)} KB</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Compare All Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            {/* Compare Controls */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <GitCompare className="w-5 h-5 text-primary-400" />
                    <h2 className="font-semibold text-slate-200">Compare All Algorithms</h2>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="text-sm text-slate-400 mr-2">Sizes:</label>
                      <select 
                        className="rounded-lg bg-slate-700 border-slate-600 text-slate-200 text-sm"
                        value={compareConfig.sizes.join(',')}
                        onChange={e => setCompareConfig({
                          ...compareConfig, 
                          sizes: e.target.value.split(',').map(Number)
                        })}
                      >
                        <option value="1000,10000,100000">1K, 10K, 100K</option>
                        <option value="1000,5000,10000,50000,100000">Full Range (1000,5000,10000,50000,100000)</option>
                        <option value="1000,10000,100000,500000">Large Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-slate-400 mr-2">Trials:</label>
                      <input 
                        type="number" 
                        className="w-16 rounded-lg bg-slate-700 border-slate-600 text-slate-200 text-sm"
                        value={compareConfig.trials}
                        onChange={e => setCompareConfig({...compareConfig, trials: Number(e.target.value)})}
                        min="1" max="10"
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={runComparison}
                  disabled={comparingLoading}
                  className="py-2 px-6 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white rounded-lg font-medium flex items-center transition-colors"
                >
                  {comparingLoading ? (
                    <Activity className="w-5 h-5 animate-spin mr-2" />
                  ) : (
                    <Play className="w-5 h-5 mr-2" />
                  )}
                  {comparingLoading ? 'Running...' : 'Run Comparison'}
                </button>
              </div>
            </Card>

            {/* Comparison Summary */}
            {compareResults && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <StatCard 
                    title="Fastest Algorithm" 
                    value={compareResults.summary.fastestAlgorithm?.replace(' Sort', '') || '-'} 
                    unit="" 
                    icon={Zap} 
                    color="bg-green-500" 
                  />
                  <StatCard 
                    title="Most Memory Efficient" 
                    value={compareResults.summary.mostMemoryEfficient?.replace(' Sort', '') || '-'} 
                    unit="" 
                    icon={Database} 
                    color="bg-purple-500" 
                  />
                  <StatCard 
                    title="Total Runs" 
                    value={compareResults.summary.totalRuns.toString()} 
                    unit="benchmarks" 
                    icon={Activity} 
                    color="bg-blue-500" 
                  />
                  <StatCard 
                    title="Total Time" 
                    value={(compareResults.summary.totalBenchmarkTimeMs / 1000).toFixed(1)} 
                    unit="seconds" 
                    icon={Clock} 
                    color="bg-orange-500" 
                  />
                </div>

                {/* Comparison Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="p-6">
                    <h3 className="font-semibold text-slate-200 mb-2 flex items-center justify-between">
                      <span className="flex items-center">
                        <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
                        Time vs Size (All Algorithms)
                      </span>
                      <span className="text-xs text-slate-500 font-normal">Drag to zoom</span>
                    </h3>
                    <div className="h-[380px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={getComparisonChartData()}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                          <XAxis dataKey="size" tick={{fontSize: 12, fill: '#94a3b8'}} tickFormatter={v => v >= 1000 ? `${v/1000}K` : v} stroke="#475569" />
                          <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} label={{ value: 'Time (ms)', angle: -90, position: 'insideLeft', fill: '#94a3b8' }} stroke="#475569" />
                          <Tooltip 
                            contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#e2e8f0'}}
                            formatter={(value, name) => [`${typeof value === 'number' ? value.toFixed(2) : value} ms`, name]}
                            labelFormatter={(label) => `Size: ${Number(label).toLocaleString()}`}
                          />
                          <Legend />
                          {getChartAlgorithms().map(algo => (
                            <Line 
                              key={algo}
                              type="monotone" 
                              dataKey={algo} 
                              stroke={ALGO_COLORS[algo] || '#888'} 
                              strokeWidth={2}
                              dot={{ r: 4 }}
                            />
                          ))}
                          <Brush 
                            dataKey="size" 
                            height={25} 
                            stroke="#475569"
                            fill="#1e293b"
                            tickFormatter={v => v >= 1000 ? `${v/1000}K` : v}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Card>

                  <div 
                    className="cursor-pointer hover:shadow-xl transition-shadow"
                    onClick={() => setExpandedChart('radar')}
                  >
                    <Card className="p-6 h-full">
                      <h3 className="font-semibold text-slate-200 mb-2 flex items-center justify-between">
                        <span className="flex items-center">
                          <Layers className="w-5 h-5 mr-2 text-purple-400" />
                          Algorithm Performance Radar
                        </span>
                        <Maximize2 className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">Higher values = better performance (0-100 scale)</p>
                      <div className="h-[320px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RadarChart data={getRadarData()} cx="50%" cy="50%" outerRadius="75%">
                            <PolarGrid stroke="#475569" gridType="polygon" />
                            <PolarAngleAxis 
                              dataKey="algorithm" 
                              tick={{fontSize: 13, fontWeight: 600, fill: '#e2e8f0'}}
                            />
                            <PolarRadiusAxis 
                              angle={90} 
                              domain={[0, 100]} 
                              tick={{fontSize: 10, fill: '#64748b'}}
                              tickCount={5}
                              axisLine={false}
                            />
                            <Radar 
                              name="Speed" 
                              dataKey="speed" 
                              stroke="#3b82f6" 
                              fill="#3b82f6" 
                              fillOpacity={0.25}
                              strokeWidth={2}
                              dot={{ r: 4, fill: '#3b82f6' }}
                            />
                            <Radar 
                              name="Memory" 
                              dataKey="memory" 
                              stroke="#a855f7" 
                              fill="#a855f7" 
                              fillOpacity={0.25}
                              strokeWidth={2}
                              dot={{ r: 4, fill: '#a855f7' }}
                            />
                            <Radar 
                              name="Consistency" 
                              dataKey="consistency" 
                              stroke="#22c55e" 
                              fill="#22c55e" 
                              fillOpacity={0.25}
                              strokeWidth={2}
                              dot={{ r: 4, fill: '#22c55e' }}
                            />
                            <Legend wrapperStyle={{fontSize: '12px'}} />
                            <Tooltip 
                              contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#e2e8f0'}}
                              formatter={(value, name) => [`${typeof value === 'number' ? Math.round(value) : value}/100`, name]}
                            />
                          </RadarChart>
                        </ResponsiveContainer>
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-center">Click to expand for detailed analysis</p>
                    </Card>
                  </div>
                </div>

                {/* Algorithm Summary Table */}
                <Card className="overflow-hidden">
                  <div className="p-6 border-b border-slate-700 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-200">Algorithm Summary</h3>
                    <div className="flex space-x-2">
                      <button 
                        onClick={exportToCsv}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export CSV</span>
                      </button>
                      <button 
                        onClick={exportToJson}
                        className="flex items-center space-x-1 px-3 py-1 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-slate-300"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export JSON</span>
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-slate-700/50 text-slate-400 font-medium">
                        <tr>
                          <th className="px-6 py-3">Algorithm</th>
                          <th className="px-6 py-3">Avg Time (ms)</th>
                          <th className="px-6 py-3">Avg Memory (KB)</th>
                          <th className="px-6 py-3">Best (ms)</th>
                          <th className="px-6 py-3">Worst (ms)</th>
                          <th className="px-6 py-3">Tests</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {Object.values(compareResults.summary.algorithmSummaries).map((s, i) => (
                          <tr key={i} className="hover:bg-slate-700/50 transition-colors">
                            <td className="px-6 py-3 font-medium text-slate-200 flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{backgroundColor: ALGO_COLORS[s.algorithm] || '#888'}}
                              />
                              {s.algorithm}
                            </td>
                            <td className="px-6 py-3 text-slate-400">{s.avgTimeMs.toFixed(3)}</td>
                            <td className="px-6 py-3 text-slate-400">{s.avgMemoryKb.toFixed(1)}</td>
                            <td className="px-6 py-3 text-green-400">{s.minTimeMs.toFixed(3)}</td>
                            <td className="px-6 py-3 text-red-400">{s.maxTimeMs.toFixed(3)}</td>
                            <td className="px-6 py-3 text-slate-400">{s.testCount}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Card>
              </>
            )}
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* Theoretical vs Practical Comparison - KEY REQUIREMENT */}
            {compareResults ? (
              <Card className="overflow-hidden">
                <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-primary-900/50 to-purple-900/50">
                  <h3 className="font-semibold text-slate-200 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary-400" />
                    📊 Theoretical vs Practical Analysis
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Comparison of theoretical complexity predictions with actual benchmark results 
                    <span className="ml-2 px-2 py-0.5 bg-slate-800 rounded text-xs font-medium">n = {getMaxTestedSize().toLocaleString()}</span>
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700/50 text-slate-400 font-medium">
                      <tr>
                        <th className="px-6 py-3">Algorithm</th>
                        <th className="px-6 py-3">Theoretical Time (Avg)</th>
                        <th className="px-6 py-3">Est. Operations</th>
                        <th className="px-6 py-3">Practical Time (ms)</th>
                        <th className="px-6 py-3">Theoretical Space</th>
                        <th className="px-6 py-3">Est. Memory</th>
                        <th className="px-6 py-3">Practical Memory (KB)</th>
                        <th className="px-6 py-3">Analysis</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {Object.values(compareResults.summary.algorithmSummaries)
                        .map((s, i) => {
                          const theoretical = complexityInfo[s.algorithm];
                          const n = getMaxTestedSize();
                          const isEfficient = s.avgTimeMs < 100;
                          const isMemoryEfficient = s.avgMemoryKb < 5000;
                          const isFunAlgorithm = CHART_EXCLUDED_ALGORITHMS.includes(s.algorithm);
                          const timeOps = theoretical ? calculateTheoreticalOps(theoretical.averageCase, n) : '-';
                          const spaceOps = theoretical ? calculateTheoreticalOps(theoretical.spaceComplexity, n) : '-';
                          return (
                            <tr key={i} className={`hover:bg-slate-700/50 transition-colors ${isFunAlgorithm ? 'bg-pink-900/20' : ''}`}>
                              <td className="px-6 py-3 font-medium text-slate-200 flex items-center">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{backgroundColor: ALGO_COLORS[s.algorithm] || '#888'}}
                                />
                                {s.algorithm}
                              </td>
                              <td className="px-6 py-3 font-mono text-blue-400">{theoretical?.averageCase || '-'}</td>
                              <td className="px-6 py-3 text-blue-300 text-xs">≈ {timeOps}</td>
                              <td className="px-6 py-3">
                                <span className={isEfficient ? 'text-green-400 font-medium' : 'text-orange-400'}>
                                  {s.avgTimeMs.toFixed(3)}
                                </span>
                              </td>
                              <td className="px-6 py-3 font-mono text-purple-400">{theoretical?.spaceComplexity || '-'}</td>
                              <td className="px-6 py-3 text-purple-300 text-xs">≈ {spaceOps}</td>
                              <td className="px-6 py-3">
                                <span className={isMemoryEfficient ? 'text-green-400 font-medium' : 'text-orange-400'}>
                                  {s.avgMemoryKb.toFixed(1)}
                                </span>
                              </td>
                              <td className="px-6 py-3 text-xs text-slate-400 max-w-xs">
                                {isFunAlgorithm
                                  ? '🎲 Fun algorithm (not for production)'
                                  : theoretical?.isInPlace && s.avgMemoryKb > 1000 
                                  ? '⚠️ Higher memory than expected'
                                  : !theoretical?.isInPlace && s.avgMemoryKb < 500
                                  ? '✅ Efficient despite O(n) space'
                                  : '✅ Matches expectations'}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </Card>
            ) : (
              <Card className="p-8 text-center bg-gradient-to-r from-primary-900/30 to-purple-900/30">
                <div className="flex flex-col items-center space-y-4">
                  <div className="p-4 bg-slate-800 rounded-full shadow-lg">
                    <GitCompare className="w-8 h-8 text-primary-400" />
                  </div>
                  <h3 className="font-semibold text-slate-200 text-lg">📊 Theoretical vs Practical Analysis</h3>
                  <p className="text-slate-400 max-w-md">
                    Run a comparison from the <strong>"Compare All"</strong> tab to see how theoretical complexity predictions match with actual benchmark results.
                  </p>
                  <button
                    onClick={() => setActiveTab('compare')}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Go to Compare All
                  </button>
                </div>
              </Card>
            )}

            {/* Complexity Comparison Table */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-slate-700">
                <h3 className="font-semibold text-slate-200 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-primary-400" />
                  Theoretical Complexity Comparison
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-700/50 text-slate-400 font-medium">
                    <tr>
                      <th className="px-6 py-3">Algorithm</th>
                      <th className="px-6 py-3">Best Case</th>
                      <th className="px-6 py-3">Average Case</th>
                      <th className="px-6 py-3">Worst Case</th>
                      <th className="px-6 py-3">Space</th>
                      <th className="px-6 py-3">Stable</th>
                      <th className="px-6 py-3">In-Place</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {Object.values(complexityInfo)
                      .map((info, i) => (
                      <tr key={i} className={`hover:bg-slate-700/50 transition-colors ${CHART_EXCLUDED_ALGORITHMS.includes(info.algorithmName) ? 'bg-pink-900/20' : ''}`}>
                        <td className="px-6 py-3 font-medium text-slate-200 flex items-center">
                          <div 
                            className="w-3 h-3 rounded-full mr-2" 
                            style={{backgroundColor: ALGO_COLORS[info.algorithmName] || '#888'}}
                          />
                          {info.algorithmName}
                        </td>
                        <td className="px-6 py-3 font-mono text-green-400">{info.bestCase}</td>
                        <td className="px-6 py-3 font-mono text-blue-400">{info.averageCase}</td>
                        <td className="px-6 py-3 font-mono text-red-400">{info.worstCase}</td>
                        <td className="px-6 py-3 font-mono text-purple-400">{info.spaceComplexity}</td>
                        <td className="px-6 py-3">
                          {info.isStable ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </td>
                        <td className="px-6 py-3">
                          {info.isInPlace ? (
                            <CheckCircle className="w-5 h-5 text-green-400" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-400" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Algorithm Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Object.values(complexityInfo)
                .map((info, i) => (
                <Card key={i} className={`p-6 ${CHART_EXCLUDED_ALGORITHMS.includes(info.algorithmName) ? 'border-2 border-pink-500/50' : ''}`}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{backgroundColor: ALGO_COLORS[info.algorithmName] || '#888'}}
                    />
                    <h3 className="font-semibold text-slate-200">{info.algorithmName}</h3>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">{info.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 bg-green-900/30 rounded-lg">
                      <span className="text-green-400 font-medium">Best Case:</span>
                      <p className="text-green-300 text-xs mt-1">{info.bestCaseScenario}</p>
                    </div>
                    <div className="p-2 bg-red-900/30 rounded-lg">
                      <span className="text-red-400 font-medium">Worst Case:</span>
                      <p className="text-red-300 text-xs mt-1">{info.worstCaseScenario}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* Pattern Analysis */}
            {compareResults && (
              <Card className="p-6">
                <h3 className="font-semibold text-slate-200 mb-6 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2 text-primary-400" />
                  Performance by Data Pattern
                </h3>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={(() => {
                        const patterns = ['RANDOM', 'PARTIALLY_SORTED', 'REVERSE_SORTED'];
                        return patterns.map(pattern => {
                          const patternResults = compareResults.results
                            .filter(r => r.pattern === pattern && !CHART_EXCLUDED_ALGORITHMS.includes(r.algorithm));
                          const obj: Record<string, string | number> = { pattern: pattern.replace('_', ' ') };
                          // Average across all sizes for each algorithm
                          getChartAlgorithms().forEach(algo => {
                            const algoResults = patternResults.filter(r => r.algorithm === algo);
                            if (algoResults.length > 0) {
                              const avgTime = algoResults.reduce((sum, r) => sum + r.meanMillis, 0) / algoResults.length;
                              obj[algo] = avgTime;
                            }
                          });
                          return obj;
                        });
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="pattern" tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#475569" />
                      <YAxis tick={{fontSize: 12, fill: '#94a3b8'}} stroke="#475569" />
                      <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#e2e8f0'}}
                        formatter={(value, name) => [`${typeof value === 'number' ? value.toFixed(2) : value} ms`, name]}
                      />
                      <Legend />
                      {getChartAlgorithms().map(algo => (
                        <Bar 
                          key={algo}
                          dataKey={algo} 
                          fill={ALGO_COLORS[algo] || '#888'} 
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            )}

            {/* Memory Usage by Size - Interactive Line Chart */}
            {compareResults && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-200 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-purple-400" />
                    📈 Memory Usage vs Input Size
                  </h3>
                  <div className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
                    JVM Heap Measurement
                  </div>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart 
                      data={(() => {
                        // Group results by size and properly average across patterns
                        const sizeMap = new Map<number, Record<string, { sum: number; count: number }>>();
                        compareResults.results
                          .filter(r => !CHART_EXCLUDED_ALGORITHMS.includes(r.algorithm))
                          .forEach(r => {
                            if (!sizeMap.has(r.size)) {
                              sizeMap.set(r.size, {});
                            }
                            const entry = sizeMap.get(r.size)!;
                            if (!entry[r.algorithm]) {
                              entry[r.algorithm] = { sum: 0, count: 0 };
                            }
                            entry[r.algorithm].sum += r.memoryBytes / 1024;
                            entry[r.algorithm].count += 1;
                          });
                        // Convert to averaged values
                        return Array.from(sizeMap.entries())
                          .map(([size, algos]) => {
                            const result: Record<string, number> = { size };
                            Object.entries(algos).forEach(([algo, data]) => {
                              result[algo] = data.sum / data.count;
                            });
                            return result;
                          })
                          .sort((a, b) => a.size - b.size);
                      })()}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        dataKey="size" 
                        tick={{fontSize: 11, fill: '#94a3b8'}}
                        tickFormatter={(value) => value >= 1000 ? `${value/1000}K` : value}
                        label={{ value: 'Input Size (n)', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#94a3b8' }}
                        stroke="#475569"
                      />
                      <YAxis 
                        tick={{fontSize: 11, fill: '#94a3b8'}}
                        label={{ value: 'Memory (KB)', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#94a3b8' }}
                        stroke="#475569"
                      />
                      <Tooltip 
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#e2e8f0'}}
                        formatter={(value, name) => {
                          const v = typeof value === 'number' ? value : 0;
                          return [`${v.toFixed(2)} KB`, name];
                        }}
                        labelFormatter={(label) => `Size: ${Number(label).toLocaleString()} elements`}
                      />
                      <Legend />
                      {getChartAlgorithms().map(algo => (
                        <Line 
                          key={algo}
                          type="monotone" 
                          dataKey={algo} 
                          stroke={ALGO_COLORS[algo] || '#888'} 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      ))}
                      <Brush 
                        dataKey="size" 
                        height={25} 
                        stroke="#475569"
                        fill="#1e293b"
                        tickFormatter={v => v >= 1000 ? `${v/1000}K` : v}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-500 mt-2">Drag the slider below to zoom into specific data ranges</p>
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 rounded-lg">
                  <p className="text-xs text-slate-400">
                    <strong>📊 Note:</strong> Memory is measured via JVM heap delta which can be noisy due to GC timing.
                    <span className="text-green-400 font-medium"> In-place algorithms</span> (Heap Sort, Shell Sort) should theoretically use O(1) space, while
                    <span className="text-amber-400 font-medium"> Quick Sort</span> uses O(log n) stack space, and
                    <span className="text-red-400 font-medium"> Merge Sort, Radix Sort</span> use O(n) auxiliary space.
                  </p>
                </div>
              </Card>
            )}

            {/* Time vs Memory Scatter Plot */}
            {compareResults && (
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-slate-200 flex items-center">
                    <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                    ⚡ Time vs Memory Trade-off Analysis
                  </h3>
                  <div className="text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
                    Scatter Plot
                  </div>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis 
                        type="number" 
                        dataKey="time" 
                        name="Time" 
                        unit=" ms"
                        tick={{fontSize: 11, fill: '#94a3b8'}}
                        label={{ value: 'Execution Time (ms)', position: 'insideBottom', offset: -5, fontSize: 12, fill: '#94a3b8' }}
                        stroke="#475569"
                      />
                      <YAxis 
                        type="number" 
                        dataKey="memory" 
                        name="Memory" 
                        unit=" KB"
                        tick={{fontSize: 11, fill: '#94a3b8'}}
                        label={{ value: 'Memory (KB)', angle: -90, position: 'insideLeft', fontSize: 12, fill: '#94a3b8' }}
                        stroke="#475569"
                      />
                      <Tooltip 
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.3)', backgroundColor: '#1e293b', color: '#e2e8f0'}}
                        formatter={(value, name) => {
                          const v = typeof value === 'number' ? value : 0;
                          const n = String(name || '');
                          return [n === 'Time' ? `${v.toFixed(3)} ms` : `${v.toFixed(2)} KB`, n];
                        }}
                      />
                      <Legend />
                      {getChartAlgorithms().map(algo => (
                        <Scatter 
                          key={algo}
                          name={algo}
                          data={compareResults.results
                            .filter(r => r.algorithm === algo)
                            .map(r => ({ time: r.meanMillis, memory: r.memoryBytes / 1024, size: r.size }))}
                          fill={ALGO_COLORS[algo] || '#888'}
                        />
                      ))}
                    </ScatterChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-3 bg-green-900/30 rounded-lg text-center">
                    <div className="text-xs text-green-400 font-medium">🎯 Ideal</div>
                    <div className="text-xs text-green-300">Bottom-Left</div>
                  </div>
                  <div className="p-3 bg-blue-900/30 rounded-lg text-center">
                    <div className="text-xs text-blue-400 font-medium">⚡ Fast but Heavy</div>
                    <div className="text-xs text-blue-300">Bottom-Right</div>
                  </div>
                  <div className="p-3 bg-yellow-900/30 rounded-lg text-center">
                    <div className="text-xs text-yellow-400 font-medium">💾 Light but Slow</div>
                    <div className="text-xs text-yellow-300">Top-Left</div>
                  </div>
                  <div className="p-3 bg-red-900/30 rounded-lg text-center">
                    <div className="text-xs text-red-400 font-medium">❌ Avoid</div>
                    <div className="text-xs text-red-300">Top-Right</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Practical Memory Usage Measurements */}
            {compareResults && (
              <Card className="overflow-hidden">
                <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-purple-900/30 to-indigo-900/30">
                  <h3 className="font-semibold text-slate-200 flex items-center">
                    <Layers className="w-5 h-5 mr-2 text-purple-400" />
                    💾 Practical Memory Usage Measurements
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">
                    Actual heap memory consumption measured during benchmark execution
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-700/50 text-slate-400 font-medium">
                      <tr>
                        <th className="px-6 py-3">Algorithm</th>
                        <th className="px-6 py-3">Theoretical Space</th>
                        <th className="px-6 py-3">Avg Memory (KB)</th>
                        <th className="px-6 py-3">Min Memory (KB)</th>
                        <th className="px-6 py-3">Max Memory (KB)</th>
                        <th className="px-6 py-3">Memory/Element (bytes)</th>
                        <th className="px-6 py-3">Classification</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {Object.values(compareResults.summary.algorithmSummaries).map((s, i) => {
                        const theoretical = complexityInfo[s.algorithm];
                        const maxSize = getMaxTestedSize();
                        const bytesPerElement = maxSize > 0 ? (s.avgMemoryKb * 1024 / maxSize) : 0;
                        const algoResults = compareResults.results.filter(r => r.algorithm === s.algorithm);
                        const minMem = Math.min(...algoResults.map(r => r.memoryBytes / 1024));
                        const maxMem = Math.max(...algoResults.map(r => r.memoryBytes / 1024));
                        const isFunAlgorithm = CHART_EXCLUDED_ALGORITHMS.includes(s.algorithm);
                        
                        let classification = '';
                        let classColor = '';
                        if (bytesPerElement < 1) {
                          classification = '🟢 Minimal (In-place)';
                          classColor = 'text-green-600';
                        } else if (bytesPerElement < 4) {
                          classification = '🟡 Low';
                          classColor = 'text-yellow-600';
                        } else if (bytesPerElement < 8) {
                          classification = '🟠 Moderate';
                          classColor = 'text-orange-600';
                        } else {
                          classification = '🔴 High (O(n) space)';
                          classColor = 'text-red-600';
                        }
                        
                        return (
                          <tr key={i} className={`hover:bg-slate-700/50 transition-colors ${isFunAlgorithm ? 'bg-pink-900/20' : ''}`}>
                            <td className="px-6 py-3 font-medium text-slate-200 flex items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{backgroundColor: ALGO_COLORS[s.algorithm] || '#888'}}
                              />
                              {s.algorithm}
                            </td>
                            <td className="px-6 py-3 font-mono text-purple-400">{theoretical?.spaceComplexity || '-'}</td>
                            <td className="px-6 py-3 text-slate-400">{s.avgMemoryKb.toFixed(2)}</td>
                            <td className="px-6 py-3 text-green-400">{minMem.toFixed(2)}</td>
                            <td className="px-6 py-3 text-red-400">{maxMem.toFixed(2)}</td>
                            <td className="px-6 py-3 text-slate-400">{bytesPerElement.toFixed(4)}</td>
                            <td className={`px-6 py-3 font-medium ${classColor}`}>{classification}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <div className="p-4 bg-slate-700/50 border-t border-slate-700">
                  <p className="text-xs text-slate-400">
                    <strong>Note:</strong> Memory measurements reflect heap allocation differences before and after sorting. 
                    In-place algorithms (Quick Sort, Heap Sort, Shell Sort) typically show minimal additional memory usage, 
                    while algorithms requiring auxiliary arrays (Merge Sort, Radix Sort) show O(n) memory consumption.
                  </p>
                </div>
              </Card>
            )}

            {/* Dataset Characteristics */}
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-slate-700 bg-gradient-to-r from-green-900/30 to-teal-900/30">
                <h3 className="font-semibold text-slate-200 flex items-center">
                  <Database className="w-5 h-5 mr-2 text-green-400" />
                  📊 Dataset Characteristics
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  Properties of the test data patterns used in benchmarks
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-slate-700">
                {/* Random Pattern */}
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-blue-900/50 rounded-lg">
                      <Shuffle className="w-5 h-5 text-blue-400" />
                    </div>
                    <h4 className="font-semibold text-slate-200">RANDOM</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Uniformly distributed random integers with no inherent order.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" />Represents average case</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" />Most common real-world scenario</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" />Tests general algorithm efficiency</li>
                    <li className="flex items-center"><Activity className="w-4 h-4 mr-2 text-blue-400" />Entropy: Maximum</li>
                  </ul>
                </div>
                
                {/* Partially Sorted Pattern */}
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-yellow-900/50 rounded-lg">
                      <TrendingUp className="w-5 h-5 text-yellow-400" />
                    </div>
                    <h4 className="font-semibold text-slate-200">PARTIALLY_SORTED</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    ~90% sorted with 10% random disorder introduced.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" />Tests adaptive behavior</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" />Common in real databases</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" />Shows Shell Sort's strength</li>
                    <li className="flex items-center"><Activity className="w-4 h-4 mr-2 text-yellow-400" />Entropy: Low</li>
                  </ul>
                </div>
                
                {/* Reverse Sorted Pattern */}
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="p-2 bg-red-900/50 rounded-lg">
                      <ArrowDownRight className="w-5 h-5 text-red-400" />
                    </div>
                    <h4 className="font-semibold text-slate-200">REVERSE_SORTED</h4>
                  </div>
                  <p className="text-sm text-slate-400 mb-4">
                    Completely sorted in descending order (worst case for many algorithms).
                  </p>
                  <ul className="space-y-2 text-xs text-slate-400">
                    <li className="flex items-center"><XCircle className="w-4 h-4 mr-2 text-red-400" />Worst case for naive Quick Sort</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" />Tests worst-case behavior</li>
                    <li className="flex items-center"><CheckCircle className="w-4 h-4 mr-2 text-green-400" />Reveals algorithm weaknesses</li>
                    <li className="flex items-center"><Activity className="w-4 h-4 mr-2 text-red-400" />Entropy: Zero (ordered)</li>
                  </ul>
                </div>
              </div>
              
              {/* Size configurations */}
              <div className="p-6 border-t border-slate-700 bg-slate-800/50">
                <h4 className="font-medium text-slate-300 mb-3">Test Size Configurations</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="text-2xl font-bold text-primary-400">1K</div>
                    <div className="text-xs text-slate-400">Small dataset</div>
                  </div>
                  <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="text-2xl font-bold text-primary-400">10K</div>
                    <div className="text-xs text-slate-400">Medium dataset</div>
                  </div>
                  <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="text-2xl font-bold text-primary-400">100K</div>
                    <div className="text-xs text-slate-400">Large dataset</div>
                  </div>
                  <div className="p-3 bg-slate-700 rounded-lg border border-slate-600">
                    <div className="text-2xl font-bold text-primary-400">500K</div>
                    <div className="text-xs text-slate-400">Stress test</div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 mt-3">
                  Each configuration tests how algorithms scale with increasing input size, 
                  validating their theoretical time complexity (O(n log n) vs O(n²)).
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Expanded Chart Modal */}
      {expandedChart && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedChart(null)}
        >
          <div 
            className="bg-slate-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-auto border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-slate-200 flex items-center">
                {expandedChart === 'radar' && (
                  <>
                    <Layers className="w-6 h-6 mr-3 text-purple-400" />
                    Algorithm Performance Radar - Detailed View
                  </>
                )}
                {expandedChart === 'time-size' && (
                  <>
                    <BarChart3 className="w-6 h-6 mr-3 text-primary-400" />
                    Time vs Size - Detailed View
                  </>
                )}
                {expandedChart === 'memory-size' && (
                  <>
                    <Activity className="w-6 h-6 mr-3 text-purple-400" />
                    Memory Usage vs Input Size - Detailed View
                  </>
                )}
                {expandedChart === 'scatter' && (
                  <>
                    <Zap className="w-6 h-6 mr-3 text-yellow-400" />
                    Time vs Memory Trade-off - Detailed View
                  </>
                )}
              </h2>
              <button 
                onClick={() => setExpandedChart(null)}
                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              {expandedChart === 'radar' && compareResults && (
                <div className="space-y-6">
                  <div className="h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart data={getRadarData()}>
                        <PolarGrid stroke="#334155" />
                        <PolarAngleAxis dataKey="algorithm" tick={{fontSize: 14, fontWeight: 500, fill: '#94a3b8'}} />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{fontSize: 12, fill: '#64748b'}} />
                        <Radar name="Speed (higher=faster)" dataKey="speed" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.4} strokeWidth={2} />
                        <Radar name="Memory Efficiency (higher=less memory)" dataKey="memory" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.4} strokeWidth={2} />
                        <Radar name="Consistency (higher=more stable)" dataKey="consistency" stroke="#10b981" fill="#10b981" fillOpacity={0.4} strokeWidth={2} />
                        <Legend wrapperStyle={{paddingTop: '20px'}} />
                        <Tooltip />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
                  
                  {/* Detailed Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                    <div className="p-4 bg-blue-900/30 rounded-xl">
                      <h4 className="font-semibold text-blue-300 mb-2 flex items-center">
                        <Zap className="w-4 h-4 mr-2" /> Speed Score
                      </h4>
                      <p className="text-sm text-blue-200">
                        Calculated based on average execution time. Higher score = faster algorithm.
                        The fastest algorithm gets 100 points.
                      </p>
                    </div>
                    <div className="p-4 bg-purple-900/30 rounded-xl">
                      <h4 className="font-semibold text-purple-300 mb-2 flex items-center">
                        <Database className="w-4 h-4 mr-2" /> Memory Score
                      </h4>
                      <p className="text-sm text-purple-200">
                        Calculated based on average memory consumption. Higher score = less memory used.
                        The most memory-efficient algorithm gets 100 points.
                      </p>
                    </div>
                    <div className="p-4 bg-green-900/30 rounded-xl">
                      <h4 className="font-semibold text-green-300 mb-2 flex items-center">
                        <Activity className="w-4 h-4 mr-2" /> Consistency Score
                      </h4>
                      <p className="text-sm text-green-200">
                        Calculated from variance in execution times. Higher score = more predictable performance.
                        Lower variance results in higher consistency.
                      </p>
                    </div>
                  </div>

                  {/* Algorithm Scores Table */}
                  <div className="mt-6 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-700/50">
                        <tr>
                          <th className="px-4 py-3 text-left font-medium text-slate-400">Algorithm</th>
                          <th className="px-4 py-3 text-center font-medium text-blue-400">Speed</th>
                          <th className="px-4 py-3 text-center font-medium text-purple-400">Memory</th>
                          <th className="px-4 py-3 text-center font-medium text-green-400">Consistency</th>
                          <th className="px-4 py-3 text-center font-medium text-slate-400">Overall</th>
                          <th className="px-4 py-3 text-right font-medium text-slate-500">Raw Time</th>
                          <th className="px-4 py-3 text-right font-medium text-slate-500">Raw Memory</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700">
                        {getRadarData().map((item, i) => {
                          const overall = Math.round((item.speed + item.memory + item.consistency) / 3);
                          return (
                            <tr key={i} className="hover:bg-slate-700/50">
                              <td className="px-4 py-3 font-medium text-slate-200 flex items-center">
                                <div className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: ALGO_COLORS[item.algorithm] || '#888'}} />
                                {item.algorithm}
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/50 text-blue-300">
                                  {item.speed}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-900/50 text-purple-300">
                                  {item.memory}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/50 text-green-300">
                                  {item.consistency}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-center">
                                <span className={cn(
                                  "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold",
                                  overall >= 80 ? "bg-green-900/50 text-green-300" :
                                  overall >= 60 ? "bg-yellow-900/50 text-yellow-300" :
                                  "bg-red-900/50 text-red-300"
                                )}>
                                  {overall}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-slate-500 text-xs">
                                {item.rawTime.toFixed(2)} ms
                              </td>
                              <td className="px-4 py-3 text-right text-slate-500 text-xs">
                                {item.rawMemory.toFixed(1)} KB
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
