# Performance Testing Guide - Component 4 (Feedback & Progress)

This directory contains performance tests using **Artillery.io** to evaluate the API's performance under various load conditions.

## Prerequisites

1. **Install Artillery.io**
   ```bash
   npm install -D artillery
   ```

2. **Start the server**
   ```bash
   npm run dev
   ```
   The API should be running on `http://localhost:5000`

3. **Set up test data** (optional)
   ```bash
   node seed-users.js
   ```

## Performance Test Scenarios

### 1. **Load Test** (`artillery-config.yml`)
**Purpose:** Evaluate API performance under normal, sustained load

- **Ramp-up:** 10 → 20 → 10 requests/second over 240 seconds
- **Endpoints tested:**
  - Submit feedback (POST /api/feedbacks) - 40% of traffic
  - Get my feedbacks (GET /api/feedbacks/my) - 25% of traffic
  - Get tutor feedbacks (GET /api/tutors/:id/feedbacks) - 20% of traffic
  - Get rating stats (GET /api/tutors/:id/rating-stats) - 10% of traffic
  - Get progress (GET /api/progress) - 5% of traffic

- **Success Criteria:**
  - p95 response time < 200ms
  - p99 response time < 500ms
  - Error rate < 1%
  - Throughput > 15 requests/sec

### 2. **Ramp-up Test** (`artillery-rampup.yml`)
**Purpose:** Observe how the API handles gradually increasing load

- **Phase 1:** Warm-up at 5 req/sec for 30 seconds
- **Phase 2:** Gradual increase from 20 → 50 req/sec over 120 seconds
- **Phase 3:** Sustained at 50 req/sec for 60 seconds
- **Phase 4:** Cool-down to 20 req/sec for 30 seconds

- **Metrics to observe:**
  - Response time degradation pattern
  - Memory/CPU usage trend
  - Point where performance becomes unacceptable

### 3. **Spike Test** (`artillery-spike.yml`)
**Purpose:** Test API resilience to sudden, unexpected traffic spikes

- **Baseline:** 10 req/sec for 60 seconds
- **Spike:** Sudden jump to 100 req/sec for 10 seconds
- **Recovery:** Back to 10 req/sec for 60 seconds

- **Success Criteria:**
  - No crashes or force shutdowns
  - Error rate during spike < 5%
  - System recovers to normal performance within 30 seconds

### 4. **Stress Test** (`artillery-stress.yml`)
**Purpose:** Find the breaking point of the API

- **Phase 1:** 10 → 50 req/sec over 60 seconds
- **Phase 2:** 50 → 100 req/sec over 120 seconds
- **Phase 3:** 100 → 250 req/sec over 120 seconds
- **Phase 4:** Sustained at 250 req/sec for 60 seconds

- **Objectives:**
  - Identify maximum sustainable throughput
  - Find breaking point (where errors spike)
  - Observe timeout behavior
  - Check resource exhaustion (connections, memory)

## Running Tests

### Run Individual Tests

```bash
# Load test (recommended to start here)
npx artillery run tests/performance/artillery-config.yml

# Ramp-up test
npx artillery run tests/performance/artillery-rampup.yml

# Spike test
npx artillery run tests/performance/artillery-spike.yml

# Stress test (run on isolated environment)
npx artillery run tests/performance/artillery-stress.yml
```

### Run with HTML Report

```bash
npx artillery run tests/performance/artillery-config.yml --output report.json && npx artillery report report.json
```

This generates an HTML report that opens automatically in your browser.

### Run Test Suite via NPM Scripts

```bash
npm run perf:load        # Load test
npm run perf:rampup      # Ramp-up test
npm run perf:spike       # Spike test
npm run perf:stress      # Stress test
npm run perf:all         # Run all performance tests with reports
```

## Interpreting Results

### Key Metrics

1. **Response Time (ms)**
   - p50 (median): Typical user experience
   - p95: Worst 5% of users
   - p99: Worst 1% of users
   - max: Absolute worst case

2. **Throughput (rps - requests per second)**
   - How many requests per second the API can handle
   - Higher is better

3. **Error Rate (%)**
   - 4xx errors: Invalid requests (should be < 0.5%)
   - 5xx errors: Server errors (should be < 0.1%)
   - Timeout: Requests that took too long (should be 0%)

4. **Latency Distribution**
   - Should be relatively consistent
   - Large spikes indicate bottlenecks

### Acceptable Benchmarks

For Component 4 (Feedback & Progress):

| Metric | Target | Warning | Critical |
|--------|--------|---------|----------|
| p50 latency | < 50ms | 50-100ms | > 100ms |
| p95 latency | < 200ms | 200-500ms | > 500ms |
| p99 latency | < 500ms | 500-1000ms | > 1000ms |
| Throughput | > 50 RPS | 30-50 RPS | < 30 RPS |
| Error rate | < 0.5% | 0.5-2% | > 2% |

## Troubleshooting

### "Connection refused" error
- Make sure your API server is running on port 5000
- Check `config.target` in the YAML file

### High error rates (429, 503)
- API might not have rate limiting enabled
- Or rate limiting is too strict
- Consider adding caching to frequently accessed endpoints

### Memory/CPU spikes
- Check for memory leaks
- Monitor database connection pooling
- Review slow queries in database logs

### Timeout errors
- Increase `timeout` in Artillery config if needed
- Investigate slow endpoints (database queries, external API calls)
- Consider adding timeouts for external dependencies

## Performance Optimization Tips

Based on test results, consider:

1. **Database Optimization**
   - Add indexes to frequently queried fields (tutorId, studentId)
   - Implement pagination for large result sets
   - Use aggregation pipelines for rating stats

2. **Caching**
   - Cache rating stats (less frequent updates)
   - Cache tutor feedbacks (read-heavy endpoint)
   - Use Redis for session/temporary data

3. **API Optimization**
   - Implement request batching
   - Use compression (gzip)
   - Add rate limiting to prevent abuse

4. **Infrastructure**
   - Implement load balancing (multiple API instances)
   - Use connection pooling
   - Configure appropriate Node.js worker threads

## Example Report Analysis

After running a test, you'll see output like:

```
All virtual users finished
Summary report @ 16:45:23 +0000
  Scenarios launched:  500
  Scenarios completed: 500
  Requests completed:  2500
  RPS sent: 20.5
  DataPoints sent: 2500
  Concurrency: 45
  Response time:
    min: 12
    max: 2850
    median: 45
    p95: 250
    p99: 1200
  Codes:
    200: 2480
    400: 15
    500: 5
  Errors:
    ETIMEDOUT: 0
    ECONNREFUSED: 0
```

This means:
- 96% success rate (2480/2500 = 99.2% 200 responses)
- Median response time is 45ms (good)
- p95 is 250ms (acceptable but could be better)
- Some 400/500 errors (investigate these)

## Running Continuous Performance Monitoring

For CI/CD integration, add to your pipeline:

```bash
npm run perf:load -- --quiet --target http://your-api.com
```

Set thresholds to fail the build if:
- p95 latency > 500ms
- Error rate > 1%
- Throughput < 20 RPS

## Next Steps

1. Run **Load Test** first to get baseline metrics
2. Identify bottlenecks from the results
3. Run **Ramp-up Test** to observe degradation patterns
4. Run **Spike Test** to verify resilience
5. Run **Stress Test** to find breaking point
6. Use results to guide optimization efforts

For comprehensive performance analysis, integrate with monitoring tools:
- **Application Insights** for detailed traces
- **Prometheus/Grafana** for infrastructure metrics
- **DataDog** for full-stack observability
