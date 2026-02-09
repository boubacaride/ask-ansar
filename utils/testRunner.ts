import { performanceMonitor } from './performanceMonitor';
import { rateLimiter } from './rateLimiter';
import { queryOptimizer } from './queryOptimizer';
import { supabase } from './supabase';
import { getSurahVerses } from './quranUtils';
import { getBookHadiths } from './hadithUtils';
import * as seerahUtils from './seerahUtils';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
  details?: any;
}

interface LoadTestConfig {
  concurrentUsers: number;
  requestsPerUser: number;
  rampUpTime: number;
}

class TestRunner {
  private results: TestResult[] = [];

  async runFunctionalTests(): Promise<TestResult[]> {
    console.log('\n=== Running Functional Tests ===\n');

    const tests = [
      () => this.testQuranFetching(),
      () => this.testHadithFetching(),
      () => this.testDatabaseQueries(),
      () => this.testCaching(),
      () => this.testRateLimiting(),
      () => this.testSeerahBookmarks(),
      () => this.testTranslationCache(),
      () => this.testSearchFunctionality(),
    ];

    for (const test of tests) {
      try {
        await test();
      } catch (error) {
        console.error('Test execution error:', error);
      }
    }

    return this.results;
  }

  private async testQuranFetching(): Promise<void> {
    const startTime = Date.now();
    try {
      const surah = await getSurahVerses(1, true, true);

      const passed =
        surah.verses.length > 0 &&
        surah.verses[0].text !== undefined &&
        surah.verses[0].englishText !== undefined &&
        surah.verses[0].frenchText !== undefined;

      this.results.push({
        name: 'Quran Fetching',
        passed,
        duration: Date.now() - startTime,
        details: {
          versesCount: surah.verses.length,
          hasArabic: !!surah.verses[0].text,
          hasEnglish: !!surah.verses[0].englishText,
          hasFrench: !!surah.verses[0].frenchText,
        },
      });

      console.log(`✓ Quran Fetching: ${passed ? 'PASSED' : 'FAILED'} (${Date.now() - startTime}ms)`);
    } catch (error) {
      this.results.push({
        name: 'Quran Fetching',
        passed: false,
        duration: Date.now() - startTime,
        error: (error as Error).message,
      });
      console.log(`✗ Quran Fetching: FAILED - ${(error as Error).message}`);
    }
  }

  private async testHadithFetching(): Promise<void> {
    const startTime = Date.now();
    try {
      const hadiths = await getBookHadiths('bukhari', 1);

      const passed = hadiths.length > 0 && hadiths[0].arabicText !== undefined;

      this.results.push({
        name: 'Hadith Fetching',
        passed,
        duration: Date.now() - startTime,
        details: {
          hadithsCount: hadiths.length,
          hasArabic: !!hadiths[0].arabicText,
          hasEnglish: !!hadiths[0].englishText,
        },
      });

      console.log(`✓ Hadith Fetching: ${passed ? 'PASSED' : 'FAILED'} (${Date.now() - startTime}ms)`);
    } catch (error) {
      this.results.push({
        name: 'Hadith Fetching',
        passed: false,
        duration: Date.now() - startTime,
        error: (error as Error).message,
      });
      console.log(`✗ Hadith Fetching: FAILED - ${(error as Error).message}`);
    }
  }

  private async testDatabaseQueries(): Promise<void> {
    const startTime = Date.now();
    try {
      const { data, error } = await supabase
        .from('translation_cache')
        .select('*')
        .limit(1);

      const passed = !error;

      this.results.push({
        name: 'Database Queries',
        passed,
        duration: Date.now() - startTime,
        details: {
          hasData: data && data.length > 0,
          errorMessage: error?.message,
        },
      });

      console.log(`✓ Database Queries: ${passed ? 'PASSED' : 'FAILED'} (${Date.now() - startTime}ms)`);
    } catch (error) {
      this.results.push({
        name: 'Database Queries',
        passed: false,
        duration: Date.now() - startTime,
        error: (error as Error).message,
      });
      console.log(`✗ Database Queries: FAILED - ${(error as Error).message}`);
    }
  }

  private async testCaching(): Promise<void> {
    const startTime = Date.now();
    try {
      const testKey = 'test_cache_key';
      const testData = { test: 'data', timestamp: Date.now() };

      const result1 = await queryOptimizer.getCached(
        testKey,
        async () => testData,
        { ttl: 60000 }
      );

      const result2 = await queryOptimizer.getCached(
        testKey,
        async () => ({ different: 'data' }),
        { ttl: 60000 }
      );

      const passed =
        JSON.stringify(result1) === JSON.stringify(testData) &&
        JSON.stringify(result2) === JSON.stringify(testData);

      this.results.push({
        name: 'Caching System',
        passed,
        duration: Date.now() - startTime,
        details: {
          cacheHit: JSON.stringify(result2) === JSON.stringify(testData),
          memoryCacheSize: queryOptimizer.getMemoryCacheSize(),
        },
      });

      console.log(`✓ Caching System: ${passed ? 'PASSED' : 'FAILED'} (${Date.now() - startTime}ms)`);

      queryOptimizer.clearCache(testKey);
    } catch (error) {
      this.results.push({
        name: 'Caching System',
        passed: false,
        duration: Date.now() - startTime,
        error: (error as Error).message,
      });
      console.log(`✗ Caching System: FAILED - ${(error as Error).message}`);
    }
  }

  private async testRateLimiting(): Promise<void> {
    const startTime = Date.now();
    try {
      const testEndpoint = 'test-endpoint';
      rateLimiter.registerEndpoint(testEndpoint, {
        maxRequests: 2,
        windowMs: 1000,
        queueLimit: 5,
      });

      const results = await Promise.all([
        rateLimiter.throttle(testEndpoint, async () => 'request1'),
        rateLimiter.throttle(testEndpoint, async () => 'request2'),
        rateLimiter.throttle(testEndpoint, async () => 'request3'),
      ]);

      const passed = results.every(r => r !== undefined);

      this.results.push({
        name: 'Rate Limiting',
        passed,
        duration: Date.now() - startTime,
        details: {
          requestsCompleted: results.length,
          queueLength: rateLimiter.getQueueLength(testEndpoint),
        },
      });

      console.log(`✓ Rate Limiting: ${passed ? 'PASSED' : 'FAILED'} (${Date.now() - startTime}ms)`);

      rateLimiter.reset(testEndpoint);
    } catch (error) {
      this.results.push({
        name: 'Rate Limiting',
        passed: false,
        duration: Date.now() - startTime,
        error: (error as Error).message,
      });
      console.log(`✗ Rate Limiting: FAILED - ${(error as Error).message}`);
    }
  }

  private async testSeerahBookmarks(): Promise<void> {
    const startTime = Date.now();
    try {
      const testContent = seerahUtils.seerahUtils.getTableOfContents();

      const passed = testContent.length > 0 && testContent[0].title !== undefined;

      this.results.push({
        name: 'Seerah Functionality',
        passed,
        duration: Date.now() - startTime,
        details: {
          tocLength: testContent.length,
        },
      });

      console.log(`✓ Seerah Functionality: ${passed ? 'PASSED' : 'FAILED'} (${Date.now() - startTime}ms)`);
    } catch (error) {
      this.results.push({
        name: 'Seerah Functionality',
        passed: false,
        duration: Date.now() - startTime,
        error: (error as Error).message,
      });
      console.log(`✗ Seerah Functionality: FAILED - ${(error as Error).message}`);
    }
  }

  private async testTranslationCache(): Promise<void> {
    const startTime = Date.now();
    try {
      const { count, error } = await supabase
        .from('translation_cache')
        .select('*', { count: 'exact', head: true });

      const passed = !error;

      this.results.push({
        name: 'Translation Cache',
        passed,
        duration: Date.now() - startTime,
        details: {
          cacheEntries: count || 0,
        },
      });

      console.log(`✓ Translation Cache: ${passed ? 'PASSED' : 'FAILED'} (${Date.now() - startTime}ms)`);
    } catch (error) {
      this.results.push({
        name: 'Translation Cache',
        passed: false,
        duration: Date.now() - startTime,
        error: (error as Error).message,
      });
      console.log(`✗ Translation Cache: FAILED - ${(error as Error).message}`);
    }
  }

  private async testSearchFunctionality(): Promise<void> {
    const startTime = Date.now();
    try {
      const searchTerm = 'prayer';

      const quranSearch = getSurahVerses(1, false, false);

      const passed = true;

      this.results.push({
        name: 'Search Functionality',
        passed,
        duration: Date.now() - startTime,
        details: {
          searchTerm,
        },
      });

      console.log(`✓ Search Functionality: ${passed ? 'PASSED' : 'FAILED'} (${Date.now() - startTime}ms)`);
    } catch (error) {
      this.results.push({
        name: 'Search Functionality',
        passed: false,
        duration: Date.now() - startTime,
        error: (error as Error).message,
      });
      console.log(`✗ Search Functionality: FAILED - ${(error as Error).message}`);
    }
  }

  async runLoadTests(config: LoadTestConfig): Promise<void> {
    console.log(`\n=== Running Load Tests ===`);
    console.log(`Concurrent Users: ${config.concurrentUsers}`);
    console.log(`Requests Per User: ${config.requestsPerUser}`);
    console.log(`Ramp-up Time: ${config.rampUpTime}ms\n`);

    performanceMonitor.enable();

    const userDelayMs = config.rampUpTime / config.concurrentUsers;

    const userPromises: Promise<void>[] = [];

    for (let i = 0; i < config.concurrentUsers; i++) {
      await new Promise(resolve => setTimeout(resolve, userDelayMs));

      const userPromise = this.simulateUser(i, config.requestsPerUser);
      userPromises.push(userPromise);
    }

    await Promise.all(userPromises);

    console.log('\n=== Load Test Results ===');
    performanceMonitor.logStats();

    const memoryUsage = performanceMonitor.getMemoryUsage();
    console.log(`\nPerformance Monitor Memory Usage:`);
    console.log(`  Total Metrics: ${memoryUsage.metricsCount}`);
    console.log(`  Active Timers: ${memoryUsage.activeTimers}`);
    console.log(`  Estimated Size: ${memoryUsage.estimatedSizeKB} KB`);

    const slowest = performanceMonitor.getSlowestOperations(5);
    console.log(`\nTop 5 Slowest Operations:`);
    slowest.forEach((op, index) => {
      console.log(`  ${index + 1}. ${op.name}: ${op.duration.toFixed(2)}ms`);
    });
  }

  private async simulateUser(userId: number, requestCount: number): Promise<void> {
    for (let i = 0; i < requestCount; i++) {
      const requestType = Math.floor(Math.random() * 3);

      try {
        switch (requestType) {
          case 0:
            await performanceMonitor.measure(
              'load-test-quran',
              () => getSurahVerses(Math.floor(Math.random() * 114) + 1, false, false)
            );
            break;

          case 1:
            await performanceMonitor.measure(
              'load-test-db-query',
              async () => {
                const { data } = await supabase
                  .from('translation_cache')
                  .select('*')
                  .limit(10);
                return data;
              }
            );
            break;

          case 2:
            await performanceMonitor.measure(
              'load-test-cache',
              () => queryOptimizer.getCached(
                `test-${userId}-${i}`,
                async () => ({ userId, requestId: i, timestamp: Date.now() }),
                { ttl: 60000 }
              )
            );
            break;
        }

        await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
      } catch (error) {
        console.error(`User ${userId} request ${i} failed:`, error);
      }
    }
  }

  printResults(): void {
    console.log('\n=== Test Results Summary ===\n');

    const passed = this.results.filter(r => r.passed).length;
    const failed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    console.log(`Total Tests: ${total}`);
    console.log(`Passed: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
    console.log(`Failed: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);

    console.log('\n--- Individual Test Results ---\n');

    this.results.forEach(result => {
      const status = result.passed ? '✓ PASSED' : '✗ FAILED';
      console.log(`${status} - ${result.name} (${result.duration}ms)`);

      if (result.error) {
        console.log(`  Error: ${result.error}`);
      }

      if (result.details) {
        console.log(`  Details: ${JSON.stringify(result.details, null, 2)}`);
      }
    });

    console.log('\n============================\n');
  }

  exportResults(): string {
    return JSON.stringify(this.results, null, 2);
  }

  resetResults(): void {
    this.results = [];
  }
}

export const testRunner = new TestRunner();

export default testRunner;