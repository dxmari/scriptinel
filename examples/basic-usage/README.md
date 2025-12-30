# Basic Usage Example

This example demonstrates the most common Scriptinel workflow.

## Scenario

You have a project that uses `esbuild` and `sharp`, both of which have lifecycle scripts that need to run.

## Step-by-Step Walkthrough

### 1. Initial State

Your project has these dependencies:
```json
{
  "dependencies": {
    "esbuild": "^0.19.0",
    "sharp": "^0.32.0"
  }
}
```

Both packages have `postinstall` scripts that need to run.

### 2. First Run - Detection

Run Scriptinel for the first time:

```bash
npx scriptinel
```

**Output:**
```
ℹ Loading policy...
ℹ Running npm install with --ignore-scripts...
ℹ Parsing lockfile...
ℹ Detecting lifecycle scripts...
ℹ Matching scripts against policy...

Found 2 unapproved script(s):

  • esbuild@0.19.0 - postinstall
  • sharp@0.32.0 - postinstall

To approve these scripts, run:
  npx scriptinel approve esbuild
  npx scriptinel approve sharp

Summary: 2 detected, 0 approved, 2 violations, 0 blocked
```

### 3. Approve Scripts

Approve the legitimate scripts:

```bash
npx scriptinel approve esbuild
npx scriptinel approve sharp
```

**Output:**
```
ℹ Loading policy from install-scripts.policy.json...
ℹ Detecting scripts for package...
ℹ Approving scripts for esbuild: postinstall
ℹ Policy updated successfully. Approved 1 script(s) for esbuild
```

### 4. Policy File Created

A new file `install-scripts.policy.json` is created:

```json
{
  "version": 1,
  "allow": {
    "esbuild": ["postinstall"],
    "sharp": ["postinstall"]
  },
  "metadata": {
    "generatedAt": "2025-01-15",
    "approvedBy": "system"
  }
}
```

### 5. Second Run - Success

Run Scriptinel again:

```bash
npx scriptinel
```

**Output:**
```
ℹ Loading policy...
ℹ Running npm install with --ignore-scripts...
ℹ Parsing lockfile...
ℹ Detecting lifecycle scripts...
ℹ Matching scripts against policy...

Approved 2 script(s) for execution

ℹ Executing 2 approved script(s)...
ℹ Running postinstall for esbuild@0.19.0
ℹ Running postinstall for sharp@0.32.0
ℹ All approved scripts executed successfully

Summary: 2 detected, 2 approved, 0 violations, 0 blocked
```

### 6. Commit Policy

Commit the policy file to version control:

```bash
git add install-scripts.policy.json
git commit -m "Add Scriptinel policy for esbuild and sharp"
```

## What Happened?

1. **Detection**: Scriptinel found 2 lifecycle scripts
2. **Policy Check**: None were approved (empty policy)
3. **Reporting**: Violations were reported with actionable commands
4. **Approval**: Scripts were added to the policy
5. **Execution**: Approved scripts were executed safely
6. **Version Control**: Policy was committed for team consistency

## Key Points

- **Default-deny**: All scripts are blocked by default
- **Explicit approval**: You must intentionally approve each script
- **Reviewable**: Policy file is human-readable and diff-friendly
- **Safe execution**: Only approved scripts run
- **Team consistency**: Policy file ensures everyone uses the same approvals

