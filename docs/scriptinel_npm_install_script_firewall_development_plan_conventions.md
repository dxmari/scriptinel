# Scriptinel

> **Install Script Firewall for npm**  
> Default‑deny lifecycle scripts with explicit, reviewable allowlists.

---

## 1. Product Overview

**Name:** Scriptinel  
**Category:** npm CLI + CI Security Tool  
**Core Value Proposition:**
> Make `npm install` safe by default without breaking builds.

Scriptinel blocks all lifecycle scripts (`preinstall`, `install`, `postinstall`) unless they are explicitly approved via a policy file committed to the repository.

This tool is designed to be:
- CI‑first
- Deterministic
- Zero‑config for first‑time adoption

---

## 2. Problem Statement

- npm lifecycle scripts are a major **supply‑chain attack vector**.
- Teams either:
  - run everything blindly (high risk), or
  - disable scripts entirely (`--ignore-scripts`) and suffer breakages.

**Scriptinel introduces a controlled middle ground**:
- Block by default
- Allow intentionally
- Enforce consistently in CI

---

## 3. Operating Modes

| Mode | Description |
|-----|------------|
| `default` | Local developer safety mode |
| `--ci` | Enforced policy, fail on violations |
| `--audit` | Report‑only, no blocking |

---

## 4. CLI Design (Frozen)

```bash
# First run (local)
npx scriptinel

# CI usage
npx scriptinel --ci

# Audit only
npx scriptinel --audit

# Approve a package script
npx scriptinel approve esbuild
```

### Supported Flags

| Flag | Purpose |
|----|----|
| `--ci` | Strict enforcement mode |
| `--audit` | Report only |
| `--json` | Machine‑readable output |
| `--policy <path>` | Custom policy file |

> **Rule:** No additional flags without a strong justification.

---

## 5. Policy File Specification

**File Name:** `install-scripts.policy.json`

```json
{
  "version": 1,
  "allow": {
    "esbuild": ["postinstall"],
    "sharp": ["install"]
  },
  "blocked": {
    "left-pad": ["postinstall"]
  },
  "metadata": {
    "generatedAt": "2025-01-15",
    "approvedBy": "dxmari"
  }
}
```

### Policy Rules
- Exact package names only
- Explicit script names only
- No wildcards (v1 constraint)
- Policy must be deterministic and diff‑friendly

---

## 6. High‑Level Architecture

```text
npm install --ignore-scripts
        ↓
Parse lockfile
        ↓
Detect lifecycle scripts
        ↓
Compare against policy
        ↓
Run approved scripts only
```

---

## 7. Project Structure

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

> **Rule:** One file = one responsibility.

---

## 8. Coding Rules & Conventions (Mandatory)

### Language & Runtime
- TypeScript (strict mode)
- Node.js ≥ 18
- No unnecessary runtime dependencies

### Code Style
- Functions ≤ 25 lines
- Cyclomatic complexity ≤ 5
- No magic strings (use constants/enums)
- No `any` types

### Error Handling
- No raw `console.log` for errors
- Use structured error objects
- Exit codes:
  - `0` → Success
  - `1` → Policy violation
  - `2` → Internal failure

### Determinism Rules
- Same input → same output
- Sort all dependency lists
- Stable JSON serialization

---

## 9. Security Rules (Dogfood Principle)

- Never use `shell: true`
- Validate all package names strictly
- No network calls during install
- No dynamic code execution
- No environment mutation

---

## 10. CI / GitHub Action Integration

```yaml
- name: Scriptinel
  run: npx scriptinel --ci
```

### CI Behavior
- New unapproved script → ❌ fail
- Policy updated → ✅ pass
- Audit mode → ⚠️ warning

---

## 11. Testing Strategy

### Unit Tests
- Script detection logic
- Policy matching
- Edge cases (nested dependencies)

### Integration Tests
- Sample repos with known scripts
- CI mode enforcement

---

## 12. Cursor Usage Guidelines

### How to Use Cursor Effectively
- Keep prompts small and focused
- Ask for refactors, not rewrites
- Separate pure logic from side effects

**Example Cursor Prompt:**
> Refactor this function to be deterministic and side‑effect free.

---

## 13. Release Strategy

- Single‑command README
- CI badge: “Install scripts protected”
- GitHub Action Marketplace listing
- Blog post explaining npm install risks

---

## 14. Non‑Goals (v1)

- Transitive policy inheritance
- Wildcard approvals
- GUI dashboards
- Network‑based policy fetching

---

## 15. Design Philosophy (Final Word)

> Security tools fail when they surprise developers.

Scriptinel prioritizes:
- Predictability over cleverness
- Explicitness over convenience
- Adoption over perfection

---

**Status:** Ready for Cursor‑based implementation

