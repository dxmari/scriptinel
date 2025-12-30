# Scriptinel Testing Guide

This guide explains how to test and understand Scriptinel's functionality.

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test tests/unit/policy.test.ts
```

## Test Structure

### Unit Tests

Located in `tests/unit/`:
- `parse-args.test.ts` - CLI argument parsing
- `policy.test.ts` - Policy matching logic
- `parse-lockfile.test.ts` - Lockfile parsing
- `detect-scripts.test.ts` - Script detection

### Integration Tests

Located in `tests/integration/`:
- `basic-workflow.test.ts` - Complete workflow demonstration
- `policy-workflow.test.ts` - Policy system scenarios
- `cli-workflow.test.ts` - CLI usage patterns

## Understanding the Tests

### Test 1: Basic Workflow

**File:** `tests/integration/basic-workflow.test.ts`

**What it demonstrates:**
1. Creating a mock npm project
2. Detecting lifecycle scripts
3. Matching against policy
4. Approving scripts
5. Executing approved scripts

**Key concepts:**
- Script detection from `node_modules`
- Policy matching logic
- Policy updates

### Test 2: Policy Workflow

**File:** `tests/integration/policy-workflow.test.ts`

**What it demonstrates:**
- Empty policy → all scripts are violations
- Partial approval → some approved, some not
- Blocked scripts → explicit denials
- Policy updates → adding new approvals

**Scenarios covered:**
- Empty policy behavior
- Approval workflow
- Blocked list functionality
- Partial script approval

### Test 3: CLI Workflow

**File:** `tests/integration/cli-workflow.test.ts`

**What it demonstrates:**
- Different CLI modes
- Flag combinations
- Command parsing

**Modes tested:**
- Default mode (local development)
- CI mode (strict enforcement)
- Audit mode (report only)
- JSON output mode

## Running Examples

### Example 1: Basic Usage

See `examples/basic-usage/README.md` for a step-by-step walkthrough.

### Example 2: CI Integration

See `examples/ci-integration/README.md` for CI/CD examples.

## Understanding Test Output

### Successful Test Run

```
✓ tests/unit/policy.test.ts (3)
  ✓ should approve scripts that are in policy
  ✓ should flag unapproved scripts as violations
  ✓ should block scripts in blocked list

✓ tests/integration/basic-workflow.test.ts (1)
  ✓ should demonstrate complete workflow
```

### Test Failures

If a test fails, check:
1. Node.js version (must be 18+)
2. Dependencies installed correctly
3. Test environment setup

## Writing Your Own Tests

### Example: Testing Script Detection

```typescript
import { detectScripts } from '../../src/installer/detect-scripts.js'

it('should detect postinstall script', () => {
  // Setup: Create mock package.json with script
  // Execute: Call detectScripts
  // Assert: Verify script detected
})
```

### Example: Testing Policy Matching

```typescript
import { matchScriptsAgainstPolicy } from '../../src/policy/match-scripts.js'

it('should match approved scripts', () => {
  // Setup: Create policy and scripts
  // Execute: Call matchScriptsAgainstPolicy
  // Assert: Verify matching results
})
```

## Debugging Tests

### Enable Verbose Output

```bash
npm test -- --reporter=verbose
```

### Run Single Test

```bash
npm test -- tests/unit/policy.test.ts -t "should approve scripts"
```

### Debug with Node Inspector

```bash
node --inspect-brk node_modules/.bin/vitest
```

## Common Test Scenarios

### Scenario 1: First Run

**Test:** Empty policy, scripts detected
**Expected:** All scripts are violations

### Scenario 2: After Approval

**Test:** Policy with approvals, scripts detected
**Expected:** Approved scripts match, violations for unapproved

### Scenario 3: New Package

**Test:** New package added, policy unchanged
**Expected:** New package scripts are violations

### Scenario 4: CI Mode

**Test:** Violations found in CI mode
**Expected:** Exit code 1, build fails

## Next Steps

1. Read [Understanding Scriptinel](docs/understanding-scriptinel.md)
2. Review [Examples](examples/)
3. Run the tests: `npm test`
4. Try the examples in `examples/` directory

