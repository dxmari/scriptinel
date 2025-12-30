# CI Integration Example

This example shows how to use Scriptinel in CI/CD pipelines.

## GitHub Actions

### Basic Setup

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm ci --ignore-scripts
      
      - name: Run Scriptinel
        run: npx scriptinel --ci
      
      - name: Run tests
        run: npm test
```

### What Happens

1. **Dependencies installed** with `--ignore-scripts` (safe)
2. **Scriptinel runs** in CI mode (`--ci` flag)
3. **If violations found**: Build fails with exit code 1
4. **If all approved**: Build continues to tests

### Example Failure

If a new package with unapproved scripts is added:

```yaml
# PR adds new dependency
npm install malicious-package
```

CI run:
```
> npx scriptinel --ci

ERROR: Policy violation: 1 unapproved script(s) detected in package(s): malicious-package

Found 1 unapproved script(s):

  • malicious-package@1.0.0 - postinstall

To approve these scripts, run:
  npx scriptinel approve malicious-package

Summary: 1 detected, 0 approved, 1 violations, 0 blocked
```

**Build fails** - PR cannot be merged until policy is updated.

### Example Success

When policy is properly maintained:

```
> npx scriptinel --ci

ℹ Loading policy...
ℹ Parsing lockfile...
ℹ Detecting lifecycle scripts...
ℹ Matching scripts against policy...

Summary: 2 detected, 2 approved, 0 violations, 0 blocked
```

**Build passes** - All scripts are approved.

## GitLab CI

```yaml
test:
  image: node:20
  script:
    - npm ci --ignore-scripts
    - npx scriptinel --ci
    - npm test
```

## CircleCI

```yaml
jobs:
  test:
    docker:
      - image: node:20
    steps:
      - checkout
      - run: npm ci --ignore-scripts
      - run: npx scriptinel --ci
      - run: npm test
```

## JSON Output for Automation

For advanced CI workflows, use JSON output:

```yaml
- name: Check Scriptinel
  run: npx scriptinel --ci --json > scriptinel-report.json
  
- name: Parse Results
  run: |
    VIOLATIONS=$(jq '.summary.totalViolations' scriptinel-report.json)
    if [ "$VIOLATIONS" -gt 0 ]; then
      echo "Found $VIOLATIONS violations"
      exit 1
    fi
```

## Best Practices

1. **Always use `--ci` flag** in CI pipelines
2. **Install with `--ignore-scripts`** before Scriptinel
3. **Fail on violations** - don't allow unapproved scripts
4. **Commit policy file** - ensure it's in version control
5. **Review policy changes** - treat them like code changes

## Workflow

```
Developer adds dependency
    ↓
CI detects unapproved script
    ↓
Build fails
    ↓
Developer runs: npx scriptinel approve <package>
    ↓
Policy updated and committed
    ↓
CI passes
```

This ensures **no unapproved scripts run in production**.

