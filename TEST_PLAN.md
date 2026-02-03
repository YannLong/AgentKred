# AgentKred Comprehensive Test Plan

## 1. Overview
This document outlines the testing strategy for the AgentKred Identity and Reputation Protocol. It covers backend logic, API security, frontend interactions, and end-to-end user flows.

## 2. Testing Layers

### 2.1 Unit & Integration Tests (Backend)
**Tools:** `pytest`, `httpx`, `pytest-asyncio`
**Goal:** Verify business logic and API endpoints in isolation using an in-memory SQLite database.

*   **Authentication & Security**:
    *   [ ] **Valid Signature**: Request with valid Ed25519 signature succeeds.
    *   [ ] **Invalid Signature**: Request with tampered signature returns 401.
    *   [ ] **Replay Attack**: Request with expired timestamp (>60s) returns 403.
    *   [ ] **Body Tampering**: Modifying body after signing returns 401.
    *   [ ] **Impersonation**: Signing with a key that doesn't match the `X-Agent-ID` returns 401.

*   **Registration (`POST /register`)**:
    *   [ ] Register new agent (Success).
    *   [ ] Register existing agent (Failure/Idempotency).
    *   [ ] Register with malformed public key (400).

*   **Profile Management (`POST /agent/update`)**:
    *   [ ] Update name/bio/tags.
    *   [ ] Update forbidden fields (trust_score should not be updateable via this endpoint).

*   **Scoring Logic**:
    *   [ ] **Calculation**: Verify `trust_score = 10 + verif + review + (karma*0.5) + min(stake, 1000)`.
    *   [ ] **Staking Cap**: Stake > 1000 yields max 1000 points.

*   **Verification (`POST /verify`)**:
    *   [ ] **GitHub**: Mock successful Gist fetch.
    *   [ ] **Twitter**: Mock successful OEmbed response.
    *   [ ] **Failure**: Mock 404/invalid content.

*   **Reviews (`POST /review`)**:
    *   [ ] **Standard Review**: High score reviewer gives review.
    *   [ ] **Low Score Reviewer**: Reviewer with <50 trust score (blocked).
    *   [ ] **Sybil Resistance**: Reciprocal review (Alice reviews Bob, Bob reviews Alice) halves the impact.

### 2.2 End-to-End (E2E) Flows
**Tools:** `agent_client_secure.py` (Scripted), Playwright (Frontend)
**Goal:** Verify the system works as a whole with real/containerized dependencies (Postgres).

*   **Agent Lifecycle**:
    1.  Boot fresh agent (Generate Key).
    2.  Register.
    3.  Verify GitHub (Mocked/Real).
    4.  Stake funds.
    5.  Check Leaderboard placement.

### 2.3 Frontend / UI Tests
**Tools:** Playwright / Cypress
**Goal:** Ensure UX consistency.

*   **Landing Page**: Load, Localization toggle, Tab switching.
*   **Leaderboard**: Sorting by Trust/Stake, Data rendering.
*   **Profile**: Display of badges, score breakdown.
*   **Error Handling**: 404 pages, API timeout handling.

### 2.4 Performance & Load
**Tools:** `locust` or `k6`
**Goal:** Ensure high throughput for checking signatures.

*   **Signature Verification Benchmarks**: RPS for Ed25519 checks.
*   **Database**: Concurrent read/write on Leaderboard.

## 3. Configuration & CI
*   **CI Pipeline**: Run Unit Tests on PR.
*   **Env Vars**:
    *   `TEST_MODE=true` (Use SQLite).
    *   `DATABASE_URL` (Override for test).

## 4. Execution Plan
1.  **Refactor DB**: Allow switching to SQLite for tests.
2.  **Write `tests/conftest.py`**: Setup async test client and DB.
3.  **Write `tests/test_api_security.py`**: Auth checks.
4.  **Write `tests/test_flows.py`**: Business logic.
