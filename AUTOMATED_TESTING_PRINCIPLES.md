# 🧪 Working Principle of Automated Testing in Charronix

This document outlines the architecture, principles, and execution strategy behind the End-to-End (E2E) automated testing implemented for the Charronix School Management System.

---

## 1. Technology Stack
**Framework:** [Playwright](https://playwright.dev/)
**Language:** TypeScript
**Target Environment:** Chromium (Desktop)

### Why Playwright?
Charronix is a complex, role-based React application. Playwright is exceptionally suited for this because:
- **Auto-Waiting:** It automatically waits for elements to be actionable prior to interacting with them (e.g., waiting for a loading spinner to disappear before clicking a button).
- **Multi-Context Support:** It can spin up multiple isolated browser contexts. This allows us to test multi-user workflows interactively (e.g., test if a notification sent from the Teacher portal immediately appears in the Student portal).
- **Network Interception:** It can monitor and assert against actual backend API requests.

---

## 2. Environmental Prerequisites
The automated testing suite does not mock the backend. It runs real E2E tests against a live local environment. 

For the tests to execute successfully, the following must be active:
1. **Frontend Server:** Running on `http://localhost:3000` (`npm run dev` in the root).
2. **Backend Server:** Running on `http://localhost:5000` (`npm run dev` in the backend folder).
3. **Database:** The PostgreSQL database must be seeded with the exact test credentials expected by the test suite (defined in `ALL_CREDENTIALS.md`).

---

## 3. Testing Architecture & Principles

### A. Modular, Role-Based Test Suites
Tests are isolated into specific directories based on the portal and user role they target. This mimics the actual RBAC (Role-Based Access Control) architecture of the application:
- `tests/auth/login.spec.ts`: Tests ID format validation, error messages, and successful login routes for all tiers.
- `tests/principal/principal.spec.ts`: Validates Admin privileges (managing teachers/students).
- `tests/teacher/teacher.spec.ts`: Validates Teacher operations (marking attendance, uploading marks).
- `tests/student/student.spec.ts`: Validates Student data consumption (viewing reports, timetables).
- `tests/parent/parent.spec.ts`: Validates Parent access (viewing linked children data).

### B. The Object-Helper Pattern
To abide by the DRY (Don't Repeat Yourself) principle, complex, repetitive interactions are abstracted.
- **`auth.helper.ts`**: Contains the `loginAs(page, role)` function. Instead of writing the login UI steps (navigating to landing, clicking a portal card, filling ID/Password, submitting) 38 times for 38 tests, it is encapsulated in a single helper. 
- **Centralized Credentials**: Passwords and IDs are stored in one single configuration object, ensuring that if database seeds change, the tests can be updated in exactly one place.

### C. Strict Portal/Role Verification
During the implementation of these E2E tests, testing revealed a critical edge case regarding portal routing. Because both *Teacher* and *Parent* IDs share identical formatting (6-digit numbers), a parent successfully verified by the database could bypass the intended UI and load the Teacher portal.

The tests now enforce and validate **Strict Portal Isolation**. 
**Working Principle:**
1. Frontend validates ID regex format.
2. Backend authenticates the ID + Password.
3. Frontend intercepts the API response, reads the encoded `user.role`, and actively rejects the login if the DB role does not strictly match the selected UI portal.

---

## 4. Execution & Reporting

### Scripts Commands
- `npm run test:e2e`: Runs all 38 tests headlessly (in the background) across multiple workers for maximum speed.
- `npm run test:e2e:ui`: Opens the Playwright UI mode. This allows developers to visually walk through each step, observe the DOM, and see network requests chronologically (Time-travel debugging).
- `npm run test:e2e:headed`: Runs tests visually opening an actual browser window for live observation.

### Artifacts and Tracing
When a test fails, Playwright automatically generates a **Trace file** (`trace.zip`). This trace acts as a "DVR recording" of the test, capturing the DOM snapshot, console logs, network requests, and visual UI state at the exact millisecond the test failed. This drastically reduces debugging time without needing to endlessly reproduce the error manually.
