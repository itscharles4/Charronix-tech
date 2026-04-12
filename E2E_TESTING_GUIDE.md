# 🎭 Playwright E2E Testing — Complete Step-by-Step Guide
## Charronix School Management System

---

## 📋 Table of Contents
1. [What is E2E Testing?](#1-what-is-e2e-testing)
2. [Prerequisites (One-Time Setup)](#2-prerequisites-one-time-setup)
3. [How to Run Tests](#3-how-to-run-tests)
4. [How to Know All Tests Passed](#4-how-to-know-all-tests-passed)
5. [Understanding the HTML Report](#5-understanding-the-html-report)
6. [Running Individual Tests](#6-running-individual-tests)
7. [File Structure Explained](#7-file-structure-explained)
8. [Common Errors & Fixes](#8-common-errors--fixes)

---

## 1. What is E2E Testing?

E2E (End-to-End) testing means **testing the full application exactly like a real user would**.

Playwright opens an **actual Chrome browser**, goes to `http://localhost:3000`, clicks buttons, types text, and checks if the correct things appear on screen — all **automatically**.

**Example:** Instead of you manually:
1. Opening browser → Going to localhost:3000 → Clicking "Student" → Typing ID → Typing password → Clicking "Sign In"

Playwright does all of this in **5 seconds** — and for **all 4 roles** — and reports pass/fail.

---

## 2. Prerequisites (One-Time Setup)

### Step 2.1: Install Playwright Browsers (only once)

Open a terminal in the project root folder and run:

```bash
npx playwright install chromium
```

This downloads a headless Chrome browser (~150MB). You only need to do this **once**.

### Step 2.2: Make sure dependencies are installed

```bash
npm install
```

This ensures `@playwright/test` is installed from `package.json`.

---

## 3. How to Run Tests

### ⚠️ IMPORTANT: Both servers must be running FIRST!

Before running any tests, you need **two terminals** running:

**Terminal 1 — Start Backend (port 5000):**
```bash
cd "C:\Users\CHARLESJK\OneDrive\Documents\Rani_charonix\charronix-school-management (3)\backend"
npm run dev
```
Wait until you see: `🚀 Charronix Backend running on port 5000`

**Terminal 2 — Start Frontend (port 3000):**
```bash
cd "C:\Users\CHARLESJK\OneDrive\Documents\Rani_charonix\charronix-school-management (3)"
npm run dev
```
Wait until you see: `VITE ready in XXX ms → http://localhost:3000/`

> ⚠️ **Important:** The folder name has spaces and `(3)`, so you MUST wrap the path in `"quotes"`.

### Now run the tests in Terminal 3:

#### Option A: Run ALL tests (headless — invisible browser)
```bash
npm run test:e2e
```
or equivalently:
```bash
npx playwright test
```

#### Option B: Run ALL tests with VISIBLE browser (you can watch it!)
```bash
npm run test:e2e:headed
```
or equivalently:
```bash
npx playwright test --headed
```
☝️ **This is the best for demos** — you'll see Chrome opening and Playwright clicking through your app automatically!

#### Option C: Run tests with Playwright UI Mode (interactive dashboard)
```bash
npm run test:e2e:ui
```
or equivalently:
```bash
npx playwright test --ui
```
☝️ This opens a **beautiful interactive GUI** where you can click to run individual tests, see screenshots at each step, and debug failures visually.

---

## 4. How to Know ALL Tests Passed

### ✅ All Passed — You'll see this:
```
Running 37 tests using 1 worker

  ✓  1  TC-01: Portal selection page loads with all 4 roles (6.7s)
  ✓  2  TC-02: Clicking Student role shows its login form (4.2s)
  ✓  3  TC-03: Invalid Student ID format shows validation error (5.3s)
  ...
  ✓  37 TC-A09: Sign Out returns to portal selection (5.1s)

  37 passed (4.5m)
```

**Key indicator:** The last line will say **`X passed`** with **NO failures**.
The exit code will be `0` (success).

### ❌ Some Failed — You'll see this:
```
  ✓  1  TC-01: Portal selection page loads (6.7s)
  ✘  2  TC-02: Clicking Student role shows its login form (30.0s)
  ✓  3  TC-03: Invalid Student ID format shows validation error (5.3s)

  1 failed
  36 passed
```

**Key indicator:** `✘` marks = failed tests. The last line shows the count.

### 🔄 Flaky (passed on retry) — You'll see this:
```
  ✓  6  TC-06: Parent login succeeds (retry #1) (25.1s)
```

This means the test failed on the first try but **passed on retry** — this is normal for slow network/backend operations.

---

## 5. Understanding the HTML Report

After every test run, Playwright generates a **beautiful HTML report**.

### To view the report:
```bash
npm run test:e2e:report
```
or equivalently:
```bash
npx playwright show-report playwright-report
```

This opens a page in your browser showing:
- ✅ **Green** = passed tests
- ❌ **Red** = failed tests
- 🔄 **Yellow** = flaky tests (passed on retry)
- 📸 **Screenshots** of failures
- 🎥 **Video recordings** of retried tests
- 📊 **Timing** for each test

The report is saved at: `playwright-report/index.html`

---

## 6. Running Individual Tests

### Run only ONE test file:
```bash
# Only auth/login tests
npx playwright test tests/auth/login.spec.ts

# Only student tests
npx playwright test tests/student/student.spec.ts

# Only teacher tests
npx playwright test tests/teacher/teacher.spec.ts

# Only parent tests
npx playwright test tests/parent/parent.spec.ts

# Only principal tests
npx playwright test tests/principal/principal.spec.ts
```

### Run a specific test by name:
```bash
# Run only the test whose name contains "TC-S01"
npx playwright test -g "TC-S01"

# Run only Parent login test
npx playwright test -g "TC-06"
```

### Run with visible browser + specific file:
```bash
npx playwright test tests/auth/login.spec.ts --headed
```

---

## 7. File Structure Explained

```
charronix-school-management/
├── playwright.config.ts          ← Configuration (which browser, timeouts, reporters)
├── tests/
│   ├── helpers/
│   │   └── auth.helper.ts        ← Shared login/logout functions used by all tests
│   ├── auth/
│   │   └── login.spec.ts         ← 9 tests: Portal selection, login forms, validation
│   ├── student/
│   │   └── student.spec.ts       ← 7 tests: Dashboard, attendance, reports, timetable
│   ├── teacher/
│   │   └── teacher.spec.ts       ← 6 tests: Dashboard, marks upload, assignments
│   ├── parent/
│   │   └── parent.spec.ts        ← 6 tests: Overview, child info, complaints, reports
│   └── principal/
│       └── principal.spec.ts     ← 9 tests: Dashboard, students, teachers, transport
├── playwright-report/            ← Generated HTML report (after test run)
│   ├── index.html                ← Open this in browser to see the report
│   └── results.json              ← Machine-readable results
└── test-results/                 ← Screenshots, videos, traces of failed tests
```

### What each file does:

| File | Purpose |
|------|---------|
| `playwright.config.ts` | Tells Playwright: which browser to use (Chromium), base URL (`localhost:3000`), timeouts, report format |
| `auth.helper.ts` | Contains `loginAs()` and `logout()` functions — all tests reuse these for login |
| `login.spec.ts` | Tests the login page: can you see all 4 roles, does login work, does wrong password show error |
| `student.spec.ts` | Logs in as Student, tests if sidebar navigation works (attendance, reports, timetable) |
| `teacher.spec.ts` | Logs in as Teacher, tests if sidebar navigation works (attendance marker, marks uploader) |
| `parent.spec.ts` | Logs in as Parent, tests if sidebar navigation works (overview, complaints, reports) |
| `principal.spec.ts` | Logs in as Principal, tests if sidebar navigation works (students, teachers, transport) |

---

## 8. Common Errors & Fixes

### Error: "No tests found"
**Fix:** Make sure the config file is `playwright.config.ts` (NOT `.js`)

### Error: "browserType.launch: Executable doesn't exist"
**Fix:** Run `npx playwright install chromium` to download the browser

### Error: "page.goto: net::ERR_CONNECTION_REFUSED"
**Fix:** Your frontend is not running. Start it with `npm run dev` first

### Error: "Timeout exceeded while waiting for selector"
**Fix:** Your backend is not running. Start it with `cd backend && npm run dev`

### Error: Tests pass individually but fail together
**Fix:** This is usually a timing issue. The tests run sequentially (one at a time) to avoid this. If it persists, increase `timeout` in `playwright.config.ts`

---

## 🚀 Quick Reference — Copy-Paste Commands

```bash
# ═══ ONE-TIME SETUP ═══
npm install                        # Install dependencies
npx playwright install chromium    # Download Chrome browser

# ═══ START SERVERS (2 terminals) ═══
cd backend && npm run dev          # Terminal 1: Backend
npm run dev                        # Terminal 2: Frontend

# ═══ RUN TESTS (Terminal 3) ═══
npm run test:e2e                   # Run all tests (headless)
npm run test:e2e:headed            # Run all tests (visible browser)  ← BEST FOR DEMO
npm run test:e2e:ui                # Run with interactive UI
npm run test:e2e:report            # View the HTML report

# ═══ RUN SPECIFIC TESTS ═══
npx playwright test tests/auth/login.spec.ts          # Only login tests
npx playwright test tests/student/student.spec.ts     # Only student tests
npx playwright test -g "TC-S01"                       # Only one specific test
npx playwright test --headed                          # Watch the browser
```

---

## ✅ Checklist: "How do I know everything passed?"

1. Run `npm run test:e2e`
2. Look at the **last line** of output
3. If it says **`X passed`** with **no failures** → ✅ ALL PASSED
4. Run `npm run test:e2e:report` to see the visual HTML report
5. All tests should show **green checkmarks** ✅

That's it! You're doing automated testing! 🎉
