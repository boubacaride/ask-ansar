interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PerformanceStats {
  count: number;
  totalDuration: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
}

class PerformanceMonitor {
  private metrics: Map<string, PerformanceMetric[]> = new Map();
  private activeTimers: Map<string, number> = new Map();
  private readonly MAX_METRICS_PER_TYPE = 1000;
  private enabled: boolean = true;

  enable() {
    this.enabled = true;
  }

  disable() {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  startTimer(label: string, metadata?: Record<string, any>): string {
    if (!this.enabled) return label;

    const timerId = `${label}_${Date.now()}_${Math.random()}`;
    this.activeTimers.set(timerId, Date.now());

    if (metadata) {
      this.activeTimers.set(`${timerId}_metadata`, metadata as any);
    }

    return timerId;
  }

  endTimer(timerId: string) {
    if (!this.enabled) return;

    const startTime = this.activeTimers.get(timerId);
    if (!startTime) {
      console.warn(`Timer not found: ${timerId}`);
      return;
    }

    const duration = Date.now() - startTime;
    const metadata = this.activeTimers.get(`${timerId}_metadata`) as Record<string, any> | undefined;

    const label = timerId.split('_')[0];

    this.recordMetric(label, duration, metadata);

    this.activeTimers.delete(timerId);
    this.activeTimers.delete(`${timerId}_metadata`);
  }

  async measure<T>(
    label: string,
    fn: () => Promise<T>,
    metadata?: Record<string, any>
  ): Promise<T> {
    if (!this.enabled) {
      return fn();
    }

    const timerId = this.startTimer(label, metadata);
    try {
      const result = await fn();
      this.endTimer(timerId);
      return result;
    } catch (error) {
      this.endTimer(timerId);
      throw error;
    }
  }

  recordMetric(name: string, duration: number, metadata?: Record<string, any>) {
    if (!this.enabled) return;

    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }

    const metrics = this.metrics.get(name)!;

    metrics.push({
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    });

    if (metrics.length > this.MAX_METRICS_PER_TYPE) {
      metrics.shift();
    }
  }

  getStats(name: string): PerformanceStats | null {
    const metrics = this.metrics.get(name);
    if (!metrics || metrics.length === 0) {
      return null;
    }

    const durations = metrics.map(m => m.duration).sort((a, b) => a - b);
    const count = durations.length;
    const totalDuration = durations.reduce((sum, d) => sum + d, 0);

    const percentile = (p: number) => {
      const index = Math.ceil((p / 100) * count) - 1;
      return durations[Math.max(0, index)];
    };

    return {
      count,
      totalDuration,
      avgDuration: totalDuration / count,
      minDuration: durations[0],
      maxDuration: durations[count - 1],
      p50: percentile(50),
      p90: percentile(90),
      p95: percentile(95),
      p99: percentile(99),
    };
  }

  getAllStats(): Map<string, PerformanceStats> {
    const allStats = new Map<string, PerformanceStats>();

    for (const [name] of this.metrics) {
      const stats = this.getStats(name);
      if (stats) {
        allStats.set(name, stats);
      }
    }

    return allStats;
  }

  getRecentMetrics(name: string, limit: number = 10): PerformanceMetric[] {
    const metrics = this.metrics.get(name);
    if (!metrics) return [];

    return metrics.slice(-limit);
  }

  clearMetrics(name?: string) {
    if (name) {
      this.metrics.delete(name);
    } else {
      this.metrics.clear();
    }
  }

  logStats(name?: string) {
    if (name) {
      const stats = this.getStats(name);
      if (stats) {
        console.log(`\n=== Performance Stats: ${name} ===`);
        console.log(`Count: ${stats.count}`);
        console.log(`Avg: ${stats.avgDuration.toFixed(2)}ms`);
        console.log(`Min: ${stats.minDuration.toFixed(2)}ms`);
        console.log(`Max: ${stats.maxDuration.toFixed(2)}ms`);
        console.log(`P50: ${stats.p50.toFixed(2)}ms`);
        console.log(`P90: ${stats.p90.toFixed(2)}ms`);
        console.log(`P95: ${stats.p95.toFixed(2)}ms`);
        console.log(`P99: ${stats.p99.toFixed(2)}ms`);
        console.log(`================================\n`);
      }
    } else {
      const allStats = this.getAllStats();
      console.log(`\n=== All Performance Stats ===`);
      for (const [metricName, stats] of allStats) {
        console.log(`\n${metricName}:`);
        console.log(`  Count: ${stats.count}`);
        console.log(`  Avg: ${stats.avgDuration.toFixed(2)}ms`);
        console.log(`  P90: ${stats.p90.toFixed(2)}ms`);
        console.log(`  P99: ${stats.p99.toFixed(2)}ms`);
      }
      console.log(`============================\n`);
    }
  }

  exportMetrics(name?: string): string {
    if (name) {
      const metrics = this.metrics.get(name);
      return JSON.stringify(metrics || [], null, 2);
    }

    const allMetrics: Record<string, PerformanceMetric[]> = {};
    for (const [metricName, metrics] of this.metrics) {
      allMetrics[metricName] = metrics;
    }

    return JSON.stringify(allMetrics, null, 2);
  }

  getSlowestOperations(limit: number = 10): Array<{name: string; duration: number; timestamp: number}> {
    const allMetrics: Array<{name: string; duration: number; timestamp: number}> = [];

    for (const [name, metrics] of this.metrics) {
      metrics.forEach(m => {
        allMetrics.push({ name, duration: m.duration, timestamp: m.timestamp });
      });
    }

    return allMetrics
      .sort((a, b) => b.duration - a.duration)
      .slice(0, limit);
  }

  getMemoryUsage(): {
    metricsCount: number;
    activeTimers: number;
    estimatedSizeKB: number;
  } {
    let totalMetrics = 0;
    for (const metrics of this.metrics.values()) {
      totalMetrics += metrics.length;
    }

    const estimatedSizeKB = (
      (totalMetrics * 100 + this.activeTimers.size * 50) / 1024
    );

    return {
      metricsCount: totalMetrics,
      activeTimers: this.activeTimers.size,
      estimatedSizeKB: Math.round(estimatedSizeKB * 100) / 100,
    };
  }
}

export const performanceMonitor = new PerformanceMonitor();

export default performanceMonitor;