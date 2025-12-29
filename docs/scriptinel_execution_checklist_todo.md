# Scriptinel – Cursor Execution Checklist

> **Purpose:** A step‑by‑step, Cursor‑friendly implementation plan derived from the approved architecture, rules, and conventions. Treat this file as your **daily execution board**.

---

## Phase 0 — Repo & Tooling Bootstrap (Day 0)

-

> **Cursor rule:** Ask Cursor to validate tsconfig for strictness.

---

## Phase 1 — Project Skeleton (Day 1)

-

```text
src/
 ├─ cli/
 │   └─ index.ts
 ├─ installer/
 │   ├─ detectScripts.ts
 │   ├─ runInstall.ts
 │   └─ runApprovedScripts.ts
 ├─ policy/
 │   ├─ loadPolicy.ts
 │   ├─ validatePolicy.ts
 │   └─ updatePolicy.ts
 ├─ reporters/
 │   ├─ consoleReporter.ts
 │   └─ jsonReporter.ts
 ├─ utils/
 │   ├─ exec.ts
 │   ├─ fs.ts
 │   └─ logger.ts
 └─ index.ts
```

-

---

## Phase 2 — CLI Entry Point (Day 1–2)

-

> **Cursor prompt:** *Generate a minimal, type‑safe CLI argument parser without external dependencies.*

---

## Phase 3 — Safe Install Engine (Core Logic)

### Step 3.1 — Base Install

-

### Step 3.2 — Script Detection (Critical)

-

```ts
interface DetectedScript {
  packageName: string
  script: 'preinstall' | 'install' | 'postinstall'
}
```

> **Cursor rule:** Separate pure parsing logic from filesystem reads.

---

## Phase 4 — Policy System

### Step 4.1 — Load Policy

-

### Step 4.2 — Validate Policy

-

### Step 4.3 — Update Policy

-

---

## Phase 5 — Approved Script Execution

-

> **Security check:** No `shell: true`, no dynamic commands.

---

## Phase 6 — Reporting Layer

-

---

## Phase 7 — CI Enforcement Mode

-

---

## Phase 8 — Testing (Lean but Serious)

### Unit Tests

-

### Integration Tests

-

---

## Phase 9 — GitHub Action Readiness

-

---

## Phase 10 — Release Preparation

-

---

## Phase 11 — Post‑v1 Backlog (Do NOT implement now)

- Hash‑based script fingerprinting
- PR comments via GitHub API
- Org‑level shared policies
- License risk detection

---

## Daily Execution Rule

> If a task cannot be completed in **≤90 minutes**, split it.

Cursor works best with **small, deterministic prompts**.

---

**Status:** Ready for implementation

