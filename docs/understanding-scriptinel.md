# Understanding Scriptinel - Complete Guide

## What Problem Does Scriptinel Solve?

### The npm Security Problem

When you run `npm install`, npm automatically executes lifecycle scripts from packages:
- `preinstall` - runs before installation
- `install` - runs during installation  
- `postinstall` - runs after installation

**These scripts can do anything** - including malicious actions like:
- Stealing environment variables
- Exfiltrating data
- Installing backdoors
- Modifying system files

### Current Solutions (And Their Problems)

1. **Run everything** ❌
   - High security risk
   - No control over what executes

2. **Disable all scripts** (`npm install --ignore-scripts`) ❌
   - Breaks legitimate packages (esbuild, sharp, etc.)
   - Builds fail

3. **Manual review** ❌
   - Time-consuming
   - Error-prone
   - Doesn't scale

### Scriptinel's Solution ✅

**Default-deny with explicit approval:**
- Block all scripts by default
- Approve only what you need
- Enforce in CI/CD
- Reviewable policy file

## How Scriptinel Works

### Architecture Flow

```
npm install --ignore-scripts
    ↓
Parse package-lock.json
    ↓
Detect lifecycle scripts in node_modules
    ↓
Compare against policy file
    ↓
Report violations OR execute approved scripts
```

### Key Components

1. **Script Detection**
   - Reads `package-lock.json` to find all dependencies
   - Scans `node_modules/*/package.json` for lifecycle scripts
   - Returns list of detected scripts

2. **Policy System**
   - `install-scripts.policy.json` contains approvals
   - Exact package name matching
   - Explicit script name matching
   - Supports blocked list for explicit denials

3. **Matching Logic**
   - Checks if script is in `allow` list → approved
   - Checks if script is in `blocked` list → blocked
   - Otherwise → violation

4. **Execution**
   - Only approved scripts are executed
   - Uses `child_process.spawn` (no shell injection)
   - Validates package names before execution

## Real-World Scenarios

### Scenario 1: First-Time Setup

**Situation:** New project, no policy file yet

```bash
$ npx scriptinel
```

**What happens:**
1. Policy file doesn't exist → creates default empty policy
2. Detects all lifecycle scripts
3. All scripts are violations (nothing approved)
4. Reports violations with approval commands
5. **No scripts execute** (safe default)

**Output:**
```
Found 3 unapproved script(s):
  • esbuild@0.19.0 - postinstall
  • sharp@0.32.0 - install
  • some-package@1.0.0 - postinstall

To approve these scripts, run:
  npx scriptinel approve esbuild
  npx scriptinel approve sharp
  npx scriptinel approve some-package
```

### Scenario 2: Approving Legitimate Scripts

**Situation:** You know `esbuild` and `sharp` are safe

```bash
$ npx scriptinel approve esbuild
$ npx scriptinel approve sharp
```

**What happens:**
1. Scriptinel detects all scripts for the package
2. Adds them to policy file
3. Policy file is updated and saved

**Policy file now:**
```json
{
  "version": 1,
  "allow": {
    "esbuild": ["postinstall"],
    "sharp": ["install"]
  },
  "metadata": {
    "generatedAt": "2025-01-15",
    "approvedBy": "system"
  }
}
```

### Scenario 3: Running with Approved Policy

```bash
$ npx scriptinel
```

**What happens:**
1. Policy file loaded
2. Scripts detected
3. Matched against policy
4. **Approved scripts execute**
5. Violations reported (if any)

**Output:**
```
Approved 2 script(s) for execution
ℹ Executing 2 approved script(s)...
ℹ Running postinstall for esbuild@0.19.0
ℹ Running install for sharp@0.32.0
ℹ All approved scripts executed successfully
```

### Scenario 4: New Package Added

**Situation:** Developer adds `new-package` with a `postinstall` script

```bash
$ npm install new-package
$ npx scriptinel
```

**What happens:**
1. `new-package` detected with `postinstall` script
2. Not in policy → violation
3. Violation reported
4. **Script does NOT execute** (blocked)

**Output:**
```
Found 1 unapproved script(s):
  • new-package@1.0.0 - postinstall

To approve these scripts, run:
  npx scriptinel approve new-package
```

### Scenario 5: CI Enforcement

**Situation:** CI pipeline runs Scriptinel

```yaml
- run: npx scriptinel --ci
```

**What happens:**
1. Same detection and matching
2. **If violations found**: Exit code 1 (build fails)
3. **If all approved**: Exit code 0 (build passes)

**Failure example:**
```
ERROR: Policy violation: 1 unapproved script(s) detected

Build fails ❌
```

**Success example:**
```
Summary: 2 detected, 2 approved, 0 violations, 0 blocked

Build passes ✅
```

## Policy File Deep Dive

### Structure

```json
{
  "version": 1,                    // Policy format version
  "allow": {                       // Approved scripts
    "package-name": ["script1", "script2"]
  },
  "blocked": {                     // Explicitly blocked (optional)
    "malicious-package": ["postinstall"]
  },
  "metadata": {                    // Tracking info
    "generatedAt": "2025-01-15",
    "approvedBy": "username"
  }
}
```

### Matching Rules

1. **Package name must match exactly** (case-sensitive)
   - ✅ `"esbuild"` matches `esbuild`
   - ❌ `"esbuild"` does NOT match `Esbuild` or `@esbuild/core`

2. **Script name must be exact**
   - ✅ `"postinstall"` matches `postinstall`
   - ❌ `"postinstall"` does NOT match `postInstall` or `post-install`

3. **Blocked list takes precedence**
   - If script is in both `allow` and `blocked`, it's blocked

### Policy Updates

When you run `npx scriptinel approve <package>`:

1. Detects all lifecycle scripts for that package
2. Adds them to the `allow` section
3. Updates `generatedAt` timestamp
4. Saves policy file

**Example:**
```bash
$ npx scriptinel approve esbuild
```

**Before:**
```json
{
  "allow": {}
}
```

**After:**
```json
{
  "allow": {
    "esbuild": ["postinstall"]
  }
}
```

## Operating Modes

### Default Mode (Local Development)

```bash
npx scriptinel
```

- Warns on violations
- Does NOT fail (exit code 0)
- Executes approved scripts
- Good for local development

### CI Mode (Strict Enforcement)

```bash
npx scriptinel --ci
```

- Fails on violations (exit code 1)
- Executes approved scripts
- Use in CI/CD pipelines

### Audit Mode (Report Only)

```bash
npx scriptinel --audit
```

- Reports violations
- Does NOT execute scripts
- Does NOT fail
- Good for security audits

## Common Workflows

### Workflow 1: Adding a New Dependency

```bash
# 1. Install dependency
npm install new-package

# 2. Check for scripts
npx scriptinel

# 3. If violations found, review and approve
npx scriptinel approve new-package

# 4. Commit policy
git add install-scripts.policy.json
git commit -m "Approve new-package scripts"
```

### Workflow 2: Updating Dependencies

```bash
# 1. Update dependencies
npm update

# 2. Check if policy still valid
npx scriptinel --ci

# 3. If new scripts detected, approve them
npx scriptinel approve <package>
```

### Workflow 3: Security Audit

```bash
# Run audit without changing behavior
npx scriptinel --audit --json > audit-report.json

# Review report
cat audit-report.json | jq '.violations'
```

## Security Considerations

### What Scriptinel Protects Against

✅ **Supply chain attacks** - Malicious scripts in dependencies
✅ **Accidental execution** - Scripts you didn't intend to run
✅ **Policy drift** - Unapproved scripts in production

### What Scriptinel Does NOT Protect Against

❌ **Vulnerable dependencies** - Use `npm audit` for this
❌ **Malicious code in approved scripts** - You must review what you approve
❌ **Network attacks** - Scriptinel doesn't monitor network traffic

### Best Practices

1. **Review before approving** - Understand what the script does
2. **Commit policy file** - Version control ensures consistency
3. **Use CI enforcement** - Never skip `--ci` in pipelines
4. **Regular audits** - Run `--audit` periodically
5. **Minimize approvals** - Only approve what's necessary

## Troubleshooting

### "No lockfile found"

**Problem:** `package-lock.json` doesn't exist

**Solution:**
```bash
npm install  # Creates package-lock.json
npx scriptinel
```

### "Scripts not executing"

**Problem:** Scripts are approved but not running

**Check:**
1. Script name matches exactly (case-sensitive)
2. Package name matches exactly
3. Policy file is valid JSON
4. Scripts are in the `allow` section (not `blocked`)

### "Policy violation in CI"

**Problem:** CI fails with violations

**Solution:**
1. Run locally: `npx scriptinel`
2. Review violations
3. Approve legitimate scripts: `npx scriptinel approve <package>`
4. Commit updated policy file
5. Push and CI should pass

## Summary

Scriptinel provides **controlled script execution**:

1. **Detects** all lifecycle scripts
2. **Matches** against policy
3. **Reports** violations
4. **Executes** only approved scripts
5. **Enforces** in CI/CD

This gives you **security without breaking builds**.

