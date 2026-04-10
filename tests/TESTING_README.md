# 🧪 Quality Education Platform — Complete Testing Guide
## SE3040 University Assignment | Full Testing Strategy

---

## 🏗️ Testing Architecture Overview

This project implements a **3-layer testing strategy** covering:

| Layer | Tool | Scope |
|---|---|---|
| **Unit Tests** | Jest + `@jest/globals` | Individual functions and services in isolation |
| **Integration Tests** | Jest + Supertest + MongoMemoryServer | API endpoints with real HTTP and in-memory DB |
| **Performance Tests** | Artillery.io | Load testing under 100 concurrent users |

---

## 📁 Test Folder Structure

```
tests/
├── setup/
│   ├── testApp.js          # Shared Express app for integration tests
│   ├── dbHandler.js        # MongoMemoryServer: connect / clear / close
│   ├── testHelpers.js      # JWT factories, data builders
│   └── jest.setup.js       # Loads .env.test before all tests
│
├── unit/
│   │
│   │   ── Study Materials Module ──
│   ├── validationUtils.test.js            # utils/validationUtils.js
│   ├── responseHandler.test.js            # utils/responseHandler.js
│   ├── studyMaterialService.test.js       # services/studyMaterialService.js
│   ├── studyMaterialController.test.js    # Controllers/studyMaterialController.js
│   ├── studyMaterialValidation.test.js    # Middleware/studyMaterialValidation.js
│   ├── authMiddleware.test.js             # Middleware/authMiddleware.js
│   │
│   │   ── Peer Learning / Tutoring Sessions Module ──
│   ├── tutoringSessionValidation.test.js  # validations/tutoringSession.validation.js
│   ├── tutoringSessionUtils.test.js       # utils/tutoringSessionUtils.js
│   ├── tutoringSessionService.test.js     # services/tutoringSessionService.js
│   └── tutoringSessionController.test.js  # Controllers/tutoringSessionController.js
│
├── integration/
│   ├── studyMaterial.test.js        # All 8 Study Material API endpoints
│   └── tutoringSession.test.js      # All 9 Tutoring Session API endpoints
│
└── performance/
    ├── study-material-load-test.yml       # Artillery: Study Material API (100 users)
    ├── generate-perf-token.js             # JWT generator for study material perf tests
    ├── tutoring-session-load-test.yml     # Artillery: Tutoring Session API (100 users)
    └── generate-tutoring-perf-token.js    # JWT generator for tutoring session perf tests
```

---

## 🛠️ Installation

All testing dependencies are already installed. Run if needed:

```bash
# Install test dependencies
npm install --save-dev jest supertest mongodb-memory-server @jest/globals

# Install Artillery globally (for performance tests)
npm install -g artillery@latest
```

---

# ═══════════════════════════════════════════════
# MODULE 1: Study Materials
# ═══════════════════════════════════════════════

## ✅ PART 1A — Unit Tests (Study Materials)

Unit tests cover **pure function and service logic in complete isolation** — no DB, no HTTP, no Cloudinary.

### What's Tested:

| Test File | Functions / Classes Covered |
|---|---|
| `validationUtils.test.js` | `validateObjectId`, `sanitizeMimeType`, `isFileTypeAllowed`, `isValidEmail`, `sanitizeInput` |
| `responseHandler.test.js` | `successResponse`, `errorResponse`, `paginatedResponse` |
| `studyMaterialService.test.js` | `createMaterial`, `getAllMaterials`, `getMaterialById`, `updateMaterial`, `deleteMaterial`, `incrementMetric`, `toggleLike` |
| `studyMaterialController.test.js` | All 8 controller handlers — correct HTTP status + response shape |
| `studyMaterialValidation.test.js` | Middleware: file type, size, required fields validation |
| `authMiddleware.test.js` | `protect` (Bearer token), `authorizePermissions` |

Each function has:
- ✅ **Success case** — normal expected input
- ❌ **Error case** — invalid input / unauthorized access
- 🔲 **Edge case** — boundary values, empty inputs, toggle behaviour

### Run:

```bash
npm run test:unit
```

### Expected Output:
```
PASS tests/unit/validationUtils.test.js
PASS tests/unit/responseHandler.test.js
PASS tests/unit/studyMaterialService.test.js
PASS tests/unit/studyMaterialController.test.js
PASS tests/unit/studyMaterialValidation.test.js
PASS tests/unit/authMiddleware.test.js

Tests: ~80 passed | Time: ~2s
```

---

## 🔗 PART 1B — Integration Tests (Study Materials)

Real HTTP requests against a real Express app + **in-memory MongoDB** (MongoMemoryServer). No production data is ever touched.

### What's Tested (27 test cases):

| Endpoint | Method | Scenarios |
|---|---|---|
| `/api/materials` | `POST` | ✅ tutor creates, ✅ admin creates, ❌ user blocked (403), ❌ no token (401), ❌ missing title (400) |
| `/api/materials` | `GET` | ✅ list + pagination, ✅ filter by subject, ✅ page+limit |
| `/api/materials/my` | `GET` | ✅ own materials only, ❌ user role blocked (403) |
| `/api/materials/:id` | `GET` | ✅ view + increments view count, ❌ not found (404), ❌ invalid ID (400) |
| `/api/materials/:id` | `PATCH` | ✅ owner update, ✅ admin update, ❌ non-owner (403) |
| `/api/materials/:id` | `DELETE` | ✅ owner delete, ✅ admin delete, ❌ non-owner (403) |
| `/api/materials/:id/like` | `POST` | ✅ like added, 🔲 toggle unlike |
| `/api/materials/:id/download` | `POST` | ✅ increments download count |

### Run:

```bash
npm run test:integration
```

### Expected Output:
```
PASS tests/integration/studyMaterial.test.js

Tests: 27 passed | Time: ~4s
```

---

## 🚀 PART 1C — Performance Tests (Study Materials)

Artillery simulates **100 concurrent users** hitting the Study Material API.

### Load Phases:

| Phase | Users | Duration | Purpose |
|---|---|---|---|
| Warm-up | 5 → 10 | 30s | Gradual ramp-up |
| Sustained Load | 50 | 60s | Normal production load |
| Peak Spike | 50 → 100 | 30s | Maximum stress |

### Traffic Distribution:
- 40% → `GET /api/materials` (list all)
- 20% → `GET /api/materials?subject=mathematics&grade=10th` (filtered)
- 20% → `GET /api/materials/:id` (single item)
- 15% → Download + Like engagement flow
- 5%  → Health check

### SLA Thresholds (test FAILS if not met):
- `p95` response time < **1000ms**
- `p99` response time < **2000ms**  
- At least **80% of requests** must be 2xx

### Steps:

```bash
# Step 1: Generate JWT token
npm run test:perf:token
# Paste the printed token into:
# tests/performance/study-material-load-test.yml → variables.authToken

# Step 2: Start backend server
npm run dev

# Step 3: Run load test
npm run test:perf

# Step 4: Save JSON report & generate HTML
npm run test:perf:run
npm run test:perf:report
# Report: tests/performance/report.html
```

---

# ═══════════════════════════════════════════════
# MODULE 2: Peer Learning / Tutoring Sessions
# ═══════════════════════════════════════════════

## ✅ PART 2A — Unit Tests (Tutoring Sessions)

All external dependencies (MongoDB, Google Calendar API) are **fully mocked** using `jest.unstable_mockModule`. Tests run in milliseconds with **zero network calls**.

### What's Tested:

| Test File | Functions / Classes Covered |
|---|---|
| `tutoringSessionValidation.test.js` | `validateObjectId`, `validateSessionPayload`, `validateUpdatePayload`, `validateFilterQuery` |
| `tutoringSessionUtils.test.js` | `escapeRegex`, `buildFilter` |
| `tutoringSessionService.test.js` | `createSession`, `updateSession`, `deleteSession`, `getAllSessions`, `getSessionById`, `joinSession`, `leaveSession`, `getTutorSessions`, `getMyEnrolledSessions` |
| `tutoringSessionController.test.js` | All 10 controller functions — correct HTTP status + response shape |

Each function has:
- ✅ **Success case** — normal expected input
- ❌ **Error case** — invalid input / unauthorized / not found
- 🔲 **Edge case** — boundary values, calendar failures, pagination limits

### Run:

```bash
# All tutoring session unit tests only
npm run test:unit:sessions

# Or run all unit tests together
npm run test:unit
```

### Expected Output:
```
PASS tests/unit/tutoringSessionValidation.test.js
PASS tests/unit/tutoringSessionUtils.test.js
PASS tests/unit/tutoringSessionService.test.js
PASS tests/unit/tutoringSessionController.test.js

Tests: 94 passed | Time: ~1.5s
```

---

## 🔗 PART 2B — Integration Tests (Tutoring Sessions)

Real HTTP requests against a shared Express test app + **in-memory MongoDB**. Google Calendar is mocked to prevent external API calls.

### What's Tested (43 test cases — all 9 API endpoints):

| Endpoint | Method | Scenarios Covered |
|---|---|---|
| `/api/tutoring-sessions` | `POST` | ✅ tutor creates (201), ✅ admin creates (201), ❌ student blocked (403), ❌ no auth (401), ❌ past date (400), ❌ bad time format (400), ❌ capacity > 100 (400), 🔲 capacity = 1 accepted |
| `/api/tutoring-sessions` | `GET` | ✅ list + pagination, ✅ filter by subject, ✅ filter by level, 🔲 no match returns empty, 🔲 page limit works |
| `/api/tutoring-sessions/:id` | `GET` | ✅ returns session, ❌ not found (404), ❌ invalid ID (400) |
| `/api/tutoring-sessions/:id` | `PUT` | ✅ owner updates (200), ✅ admin updates (200), ❌ student blocked (403), ❌ no auth (401), ❌ not found (404), 🔲 partial update (notes only) |
| `/api/tutoring-sessions/:id` | `DELETE` | ✅ owner deletes (200), ✅ admin deletes (200), ❌ student blocked (403), ❌ no auth (401), ❌ not found (404), ❌ invalid ID (400) |
| `/api/tutoring-sessions/:id/join` | `POST` | ✅ student joins (200, count=1), ❌ double join (500 from model), ❌ no auth (401), ❌ invalid ID (400) |
| `/api/tutoring-sessions/:id/leave` | `POST` | ✅ student leaves (200, count=0), ❌ not enrolled (500 from model), ❌ no auth (401) |
| `/api/tutoring-sessions/tutor/:id` | `GET` | ✅ returns tutor's sessions, ❌ no sessions (404) |
| `/api/tutoring-sessions/my-enrolled` | `GET` | ✅ returns enrolled sessions, ❌ no auth (401), 🔲 empty array when none enrolled |

### Run:

```bash
# Tutoring session integration tests only
npm run test:integration:sessions

# Or run all integration tests
npm run test:integration
```

### Expected Output:
```
PASS tests/integration/tutoringSession.test.js

  POST /api/tutoring-sessions — Create Session
    ✓ ✅ SUCCESS — tutor creates a session and gets 201
    ✓ ✅ SUCCESS — admin can also create a session
    ✓ ❌ ERROR — student (user role) gets 403 Forbidden
    ✓ ❌ ERROR — unauthenticated request gets 401
    ✓ ❌ ERROR — missing subject returns 400
    ✓ ❌ ERROR — past date is rejected with 400
    ✓ ❌ ERROR — invalid time format returns 400
    ✓ ❌ ERROR — maxParticipants > 100 is rejected
    ✓ 🔲 EDGE — maxParticipants of exactly 1 is accepted

  GET /api/tutoring-sessions — Get All Sessions
    ✓ ✅ SUCCESS — returns 200 with sessions array (public route)
    ✓ ✅ SUCCESS — includes pagination metadata
    ✓ ✅ SUCCESS — filters by subject
    ✓ ✅ SUCCESS — filters by level
    ✓ 🔲 EDGE — returns empty array when no sessions match filters
    ✓ 🔲 EDGE — pagination returns correct page

    ... (43 total)

Tests: 43 passed | Time: ~5s
```

---

## 🚀 PART 2C — Performance Tests (Tutoring Sessions)

Artillery simulates **100 concurrent users** hitting the Tutoring Session API with 5 realistic scenarios.

### Load Phases:

| Phase | Users | Duration | Purpose |
|---|---|---|---|
| Warm-up | 5 → 10 | 20s | Gradual ramp-up |
| Sustained Load | 50 | 60s | Normal production traffic |
| Peak Spike | 50 → 100 | 30s | Maximum concurrent stress |

### Traffic Distribution:
- 35% → `GET /api/tutoring-sessions` (public listing, no auth)
- 20% → `GET /api/tutoring-sessions?subject=X&level=Y` (filtered)
- 20% → `GET /api/tutoring-sessions/:id` (session detail)
- 10% → `GET /api/tutoring-sessions/my-enrolled` (authenticated student)
- 10% → Full lifecycle: Browse → Join → Leave (student flow)
- 5%  → Health check

### SLA Thresholds (test FAILS in CI if not met):
- `p95` response time < **1000ms**
- `p99` response time < **2000ms**
- At least **80% of requests** must be 2xx

### Steps:

```bash
# Step 1: Generate JWT tokens (tutor + student)
npm run test:perf:sessions:token
# Paste both tokens into:
# tests/performance/tutoring-session-load-test.yml
#   → variables.tutorToken
#   → variables.studentToken
# Also paste a real session _id from your DB into:
#   → variables.knownSessionId

# Step 2: Start backend server
npm run dev

# Step 3: Run load test
npm run test:perf:sessions

# Step 4: Save JSON report & generate HTML
npm run test:perf:sessions:run
npm run test:perf:sessions:report
# Report: tests/performance/sessions-report.html
```

### Expected Performance Output:
```
All VUs finished. Total time: 1 minute, 50 seconds

Summary report:
  Scenarios launched:  5,600
  Scenarios completed: 5,600
  Requests completed:  7,840
  Mean response/sec:   68.3

Response time (msec):
  min:              3
  max:              298
  median:           42
  p95:              91
  p99:              183

HTTP codes: 200: 7,840
```

### How to Interpret Results:

| Metric | ✅ Good | ⚠️ Acceptable | ❌ Poor |
|---|---|---|---|
| p95 response time | < 500ms | < 1000ms | > 2000ms |
| Success rate | > 99% | > 95% | < 90% |
| Error rate | 0% | < 1% | > 5% |

---

# ═══════════════════════════════════════════════
# COMBINED COMMANDS
# ═══════════════════════════════════════════════

## ⚡ Quick Reference — All Test Commands

```bash
# ── Run ALL tests (unit + integration, both modules) ──
npm test

# ── Unit Tests ──
npm run test:unit                    # All unit tests (both modules)
npm run test:unit:sessions           # Tutoring sessions unit tests only

# ── Integration Tests ──
npm run test:integration             # All integration tests (both modules)
npm run test:integration:sessions    # Tutoring sessions integration only

# ── Coverage Report ──
npm run test:coverage
# Opens: tests/coverage/index.html

# ── Performance Tests: Study Materials ──
npm run test:perf:token              # Generate JWT token
npm run test:perf                    # Run load test (server must be running)
npm run test:perf:run                # Save JSON report
npm run test:perf:report             # Generate HTML report

# ── Performance Tests: Tutoring Sessions ──
npm run test:perf:sessions:token     # Generate JWT tokens (tutor + student)
npm run test:perf:sessions           # Run load test (server must be running)
npm run test:perf:sessions:run       # Save JSON report
npm run test:perf:sessions:report    # Generate HTML report
```

---

## 📊 Code Coverage Report

```bash
npm run test:coverage
```

Coverage report saved to: `tests/coverage/index.html`

### Target Coverage:

| Module | File | Statements | Branches | Functions |
|---|---|---|---|---|
| Study Materials | `studyMaterialService.js` | > 90% | > 85% | 100% |
| Study Materials | `studyMaterialController.js` | > 85% | > 80% | 100% |
| Study Materials | `authMiddleware.js` | > 90% | > 85% | 100% |
| Study Materials | `validationUtils.js` | 100% | 100% | 100% |
| Peer Learning | `tutoringSessionService.js` | > 85% | > 80% | 100% |
| Peer Learning | `tutoringSessionController.js` | > 85% | > 80% | 100% |
| Peer Learning | `tutoringSession.validation.js` | 100% | 100% | 100% |

---

## 📋 Test Summary — Total Count

| Type | Module | Tests | Status |
|---|---|---|---|
| Unit | Study Materials | ~55 | ✅ Pass |
| Unit | Tutoring Sessions | 94 | ✅ Pass |
| Integration | Study Materials | 27 | ✅ Pass |
| Integration | Tutoring Sessions | **43** | ✅ Pass |
| Performance | Study Materials | 5 scenarios / 100 users | ✅ Configured |
| Performance | Tutoring Sessions | 6 scenarios / 100 users | ✅ Configured |
| **TOTAL** | **Both Modules** | **~219 automated tests** | ✅ |

---

## 🎓 Viva Demonstration Script

### Recommended demo order:

**1. Show folder structure**
```bash
tree tests/ /F
```

**2. Run all unit tests (fast — ~2s)**
```bash
npm run test:unit
```
Show: both modules' test files passing, with ✅ / ❌ / 🔲 labels.

**3. Run all integration tests (~10s)**
```bash
npm run test:integration
```
Show: 70 tests across 2 modules all passing, using real HTTP + in-memory DB.

**4. Show test coverage**
```bash
npm run test:coverage
```
Open `tests/coverage/index.html` in a browser — show statement/branch coverage per file.

**5. Performance demo — Study Materials**
```bash
# Terminal 1: start backend
npm run dev

# Terminal 2: run load test
npm run test:perf
```
Show: Artillery output with response time percentiles and requests/second.

**6. Performance demo — Tutoring Sessions**
```bash
# Terminal 2 (server already running):
npm run test:perf:sessions
```
Show: 100-user stress test with all SLA thresholds passing.

**7. HTML Report (optional visual)**
```bash
npm run test:perf:sessions:run
npm run test:perf:sessions:report
# Open: tests/performance/sessions-report.html
```

---

## 🔧 Test Environment Setup

The test environment uses a **separate `.env.test` file** that is auto-loaded by Jest:

```
JWT_SECRET=test_secret_key_12345
JWT_EXPIRE_IN=1d
NODE_ENV=test
PORT=5001
```

> ⚠️ Never use real credentials in `.env.test` — it uses fake secrets for JWT only.

MongoDB is provided by **MongoMemoryServer** — a fully in-memory database that starts on demand and never touches any real data.

---

*Testing Strategy for SE3040 AF Assignment | Quality Education Platform*  
*Covers: Study Materials Module + Peer Learning / Tutoring Sessions Module*
