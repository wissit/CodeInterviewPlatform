# Testing Guide

## 1. Automated Unit Tests (No Database Required)
These tests use "mocks" so they work even without a database connection.

### Backend Tests (Auth & Middleware)
```bash
cd backend
npm test
```
*   **What it tests:** Login logic, registration logic, token verification.
*   **Expected Result:** 9 Tests Passed.

### Frontend Tests (Components & Context)
```bash
cd frontend
npm test
```
*   **What it tests:** Auth state management, redirects, authentication flow.
*   **Expected Result:** 6 Tests Passed.

---

## 2. Manual Testing (Full App Experience)
To click around the app yourself, follow these steps.

### Step 1: Start Database
```bash
docker compose up -d postgres
```
*   This starts PostgreSQL in the background.
*   ✅ **Already completed** - Database is running!

### Step 2: Start Backend Server
```bash
cd backend
npm run dev
```
*   Runs on: `http://localhost:3000`
*   Health check: `http://localhost:3000/health`

### Step 3: Start Frontend Server
Open a **new terminal**:
```bash
cd frontend
npm run dev
```
*   Runs on: `http://localhost:5173`

### Step 4: Verify in Browser
1.  Open `http://localhost:5173`
2.  Try to **Register** a new account.
3.  You should be redirected to the **Dashboard**.
4.  Refresh the page (verifies session persistence).
5.  Click **Logout**.
