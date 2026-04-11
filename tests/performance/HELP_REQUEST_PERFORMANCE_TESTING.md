# Help Request (Messages) API — Performance Testing Guide

## Overview

This guide covers comprehensive performance testing for the Help Request component using **Artillery.io**, a modern load testing and performance testing framework for Express.js applications.

## What Gets Tested

The performance test suite validates:

- **API Response Times**: Measures p95 and p99 response times under load
- **Throughput**: How many requests/second the API can handle
- **Error Rates**: Percentage of failed requests under load
- **Memory & CPU Usage**: System resource utilization during testing
- **Scalability**: Performance with 80+ concurrent users
- **API Endpoints**:
  - `POST /api/messages` — Create help request
  - `GET /api/messages` — Retrieve all help requests
  - `PATCH /api/messages/:id` — Update help request
  - `DELETE /api/messages/:id` — Delete help request

## Quick Start

### Step 1: Generate Performance Testing Tokens

Generate JWT tokens for authenticated API calls:

```bash
# Generate tokens for help request tests
npm run test:perf:helprequest:token
```

Output example:
```
═══════════════════════════════════════════════════════
  Artillery Performance Token Generator — Help Request API
═══════════════════════════════════════════════════════

🔑 User JWT (for CREATE/UPDATE/DELETE tests):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

🔑 Tutor JWT (for VIEW tests with elevated access):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

🔑 Admin JWT (for viewing all requests):
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

📋 Copy these tokens into:
   tests/performance/help-request-load-test.yml
   Under: config.variables.userToken / tutorToken / adminToken
```

### Step 2: Update Configuration

Edit `tests/performance/help-request-load-test.yml`:

```yaml
config:
  variables:
    userToken: "PASTE_USER_TOKEN_HERE"
    tutorToken: "PASTE_TUTOR_TOKEN_HERE"
    adminToken: "PASTE_ADMIN_TOKEN_HERE"
```

### Step 3: Start the Backend Server

```bash
# Terminal 1: Start backend
npm run dev
```

Wait for the server to show:
```
✅ Server running on http://localhost:5000
```

### Step 4: Run Performance Test

```bash
# Run test and display results in terminal
npm run test:perf:helprequest
```

Or with report generation:

```bash
# Run test and save report data
npm run test:perf:helprequest:run

# Generate HTML report from saved data
npm run test:perf:helprequest:report
```

## Load Test Phases

The test runs through 4 phases with increasing complexity:

### Phase 1: Warm-up (20 seconds)
- **Users**: 5 → 15 (ramping up)
- **Purpose**: Let system stabilize
- **Expected**: Some variability in response times

### Phase 2: Sustained Normal Load (60 seconds)
- **Users**: 40 concurrent
- **Purpose**: Simulate realistic traffic
- **Expected**: Stable response times

### Phase 3: Peak Spike (30 seconds)
- **Users**: 40 → 80 (ramping up)
- **Purpose**: Test under peak load
- **Expected**: Slight increase in latency, no errors

### Phase 4: Cool-down (20 seconds)
- **Users**: 80 → 10 (ramping down)
- **Purpose**: Observe recovery
- **Expected**: Response times return to normal

## Test Scenarios

### Scenario 1: Create Help Request (30% of traffic)
- User creates a new help request with title, message, category, language
- Validates successful creation with 201 status

### Scenario 2: Retrieve All Requests (35% of traffic)
- User fetches their help requests
- Most common operation, represents dashboard loading

### Scenario 3: Tutor View All (10% of traffic)
- Tutor views all system help requests
- Tests elevated permission handling

### Scenario 4: Admin View All (5% of traffic)
- Admin views all requests in system
- Tests admin access level

### Scenario 5: Full Lifecycle (15% of traffic)
- Create → Update → Delete workflow
- Tests stateful operations
- Captures created message ID and chains operations

### Scenario 6: Stress Test (5% of traffic)
- Rapid sequential creation (3 requests per user)
- Tests burst traffic handling

### Scenario 7: Health Check (5% of traffic)
- Lightweight health check
- Validates API responsiveness

## Performance Report Interpretation

### Metrics Displayed

```
Summary Report:
├── Scenarios launched: 1000
├── Scenarios completed: 950
├── Requests completed: 5200
│
├── Response times:
│   ├── Min: 42ms
│   ├── Avg: 245ms
│   ├── p95: 680ms  ← 95% of requests under this time
│   ├── p99: 1240ms ← 99% of requests under this time
│   └── Max: 3500ms
│
├── Throughput:
│   ├── Requests/sec: 86.7
│   └── Transactions/sec: 43.3
│
└── Errors:
    ├── 2xx: 4940 (95%)
    ├── 4xx: 200 (3.8%)
    └── 5xx: 60 (1.2%)
```

### Performance Tiers

#### ✅ Excellent Performance
- **p95**: < 500ms
- **p99**: < 1000ms
- **Error Rate**: < 1%
- **Throughput**: > 100 req/sec

**What it means**: Your API handles load very well with minimal latency.

#### ⚠️ Acceptable Performance
- **p95**: 500-1000ms
- **p99**: 1000-2000ms
- **Error Rate**: 1-5%
- **Throughput**: 50-100 req/sec

**What it means**: API is functional under load but may benefit from optimization.

#### ❌ Poor Performance
- **p95**: > 1000ms
- **p99**: > 2000ms
- **Error Rate**: > 5%
- **Throughput**: < 50 req/sec

**What it means**: Significant performance issues requiring optimization.

## SLA Thresholds

The test validates these SLA targets:

| Metric | Threshold | Status |
|--------|-----------|--------|
| p95 Response Time | < 1000ms | ✅ Pass if met |
| p99 Response Time | < 2000ms | ✅ Pass if met |
| Success Rate (2xx) | ≥ 85% | ✅ Pass if met |
| 4xx Errors | < 10% | ✅ Pass if met |
| 5xx Errors | < 5% | ✅ Pass if met |

**Test result**: PASS or FAIL printed after each run.

## Performance Issue Diagnosis

### High p95/p99 Times (Slow Responses)

**Causes**:
- Slow database queries
- Missing indexes on MongoDB collections
- Heavy computations in message creation (translation)
- Large payloads

**Solutions**:
```javascript
// ✅ Add database indexes
db.messages.createIndex({ createdBy: 1, createdAt: -1 });
db.messages.createIndex({ category: 1, language: 1 });

// ✅ Cache frequently accessed data
const messageCache = new Map();

// ✅ Optimize translation service
// Consider async translation with background jobs
```

### High Error Rate

**Causes**:
- Authentication failures
- Payload validation errors
- Database connection issues
- Rate limiting

**Solutions**:
```bash
# Check error details in Artillery output
# Look for specific HTTP status codes (401, 400, 429, 500)

# Monitor backend logs
tail -f logs/error.log

# Check database connection
npm run test:db:connection
```

### Memory Leaks Under Load

**Causes**:
- Unbounded cache growth
- Large file uploads not cleaned up
- Event listeners not removed

**Solutions**:
```javascript
// ✅ Implement memory-bounded caches
const LRU = require('lru-cache');
const cache = new LRU({ max: 1000 });

// ✅ Clean up resources
process.on('exit', () => {
  cache.reset();
  // Close connections, cleanup files
});
```

### Throughput Too Low

**Causes**:
- API not optimized
- Database queries too slow
- Network latency

**Solutions**:
- Run test on same machine as backend (reduce network latency)
- Check database query performance with `.explain()`
- Consider adding caching layer (Redis)
- Scale horizontally with load balancer

## Advanced Testing

### Custom Load Profile

Edit `help-request-load-test.yml` to adjust:

```yaml
phases:
  - name: "Custom Phase"
    duration: 120          # seconds
    arrivalRate: 100       # users per second
    rampTo: 200            # ramp to this rate
```

### Testing Specific Scenarios Only

```bash
# Run only "Create Help Request" scenario (35% of traffic by default)
artillery run help-request-load-test.yml --scenario "Create Help Request — Standard Flow"
```

### Different User Roles

The test includes:
- **User Role** (regular users): Can CRUD only their own requests
- **Tutor Role**: Can view all requests
- **Admin Role**: Full access to all requests

## Continuous Performance Testing

### Add to CI/CD Pipeline

Create `.github/workflows/performance-test.yml`:

```yaml
name: Performance Tests
on: [push, pull_request]

jobs:
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Start server
        run: npm run dev &
      - name: Generate tokens
        run: npm run test:perf:helprequest:token
      - name: Run performance test
        run: npm run test:perf:helprequest
      - name: Generate report
        run: npm run test:perf:helprequest:report
      - name: Upload report
        uses: actions/upload-artifact@v2
```

## Troubleshooting

### Error: "REPLACE_WITH_USER_JWT_TOKEN"

**Issue**: Token not updated in YAML file

**Fix**:
```bash
# Regenerate tokens
npm run test:perf:helprequest:token

# Copy tokens to help-request-load-test.yml
nano tests/performance/help-request-load-test.yml
```

### Error: "Connection refused"

**Issue**: Backend server not running

**Fix**:
```bash
# Terminal 1: Start backend
npm run dev

# Terminal 2: Run test
npm run test:perf:helprequest
```

### Error: "401 Unauthorized"

**Issue**: Expired or invalid token

**Fix**:
```bash
# Regenerate tokens (valid for 2 hours)
npm run test:perf:helprequest:token

# Update YAML file with new tokens
```

### Artillery Not Found

**Issue**: Artillery not installed

**Fix**:
```bash
npm install -g artillery
# OR
npm install --save-dev artillery
```

## File Locations

```
tests/performance/
├── help-request-load-test.yml          ← Main test configuration
├── generate-helprequest-perf-token.js  ← Token generator script
├── helprequest-report.json             ← Test results (generated)
└── helprequest-report.html             ← HTML report (generated)
```

## References

- **Artillery Docs**: https://artillery.io/docs
- **Performance Testing Best Practices**: https://artillery.io/docs/guides/best-practices
- **Express.js Performance**: https://expressjs.com/en/advanced/best-practice-performance.html
- **MongoDB Performance**: https://docs.mongodb.com/manual/core/query-optimization/

## Support

For performance test issues:

1. Check the Artillery output for specific error codes
2. Review backend logs for API errors
3. Monitor database query performance
4. Check available system resources (CPU, memory, disk)
5. Run test with `--log-level verbose` for detailed output

```bash
artillery run help-request-load-test.yml --log-level verbose
```
