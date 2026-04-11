@echo off
REM Performance Testing Quick Start for Component 4 (Feedback & Progress)
REM This script sets up and runs all performance tests

echo.
echo ================================
echo Component 4 Performance Testing
echo ================================
echo.

REM Check if Artillery is installed
npm list artillery >nul 2>&1
if errorlevel 1 (
    echo Installing Artillery.io...
    call npm install -D artillery
)

echo.
echo Make sure your API server is running on http://localhost:5000
echo Run in another terminal: npm run dev
echo.
echo.
echo Available Performance Tests:
echo ============================
echo.
echo 1. Load Test (Baseline Performance)
echo    npm run perf:load
echo    - Simulates 10-20 requests/sec with realistic traffic distribution
echo.
echo 2. Ramp-up Test (Gradual Load Increase)
echo    npm run perf:rampup
echo    - Gradually increases load from 5 to 50 requests/sec
echo.
echo 3. Spike Test (Sudden Traffic Burst)
echo    npm run perf:spike
echo    - Simulates sudden jump from 10 to 100 requests/sec
echo.
echo 4. Stress Test (Find Breaking Point)
echo    npm run perf:stress
echo    - Increases load up to 250 requests/sec to find breaking point
echo.
echo 5. Run All Tests with Reports
echo    npm run perf:all
echo    - Runs all 4 tests and generates HTML reports
echo.
echo Or run with HTML reports:
echo ============================
echo npm run perf:load:report
echo npm run perf:rampup:report
echo npm run perf:spike:report
echo npm run perf:stress:report
echo.
echo Starting Load Test (baseline)...
echo This will run for approximately 4 minutes
echo.

call npm run perf:load
pause
