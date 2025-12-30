# Scriptinel Quick Reference

## Commands

### Basic Usage

```bash
# Check for unapproved scripts (local development)
npx scriptinel

# Approve a package's scripts
npx scriptinel approve <package-name>

# CI mode (fails on violations)
npx scriptinel --ci

# Audit mode (report only)
npx scriptinel --audit

# JSON output
npx scriptinel --json

# Custom policy file
npx scriptinel --policy custom-policy.json
```

## Common Workflows

### First Time Setup

```bash
# 1. Run Scriptinel
npx scriptinel

# 2. Review violations
# 3. Approve legitimate scripts
npx scriptinel approve <package>

# 4. Commit policy
git add install-scripts.policy.json
git commit -m "Add Scriptinel policy"
```

### Adding New Dependency

```bash
# 1. Install
npm install <package>

# 2. Check
npx scriptinel

# 3. Approve if needed
npx scriptinel approve <package>

# 4. Commit
git add install-scripts.policy.json
git commit -m "Approve <package> scripts"
```

### CI Integration

```yaml
- name: Scriptinel
  run: npx scriptinel --ci
```

## Policy File Structure

```json
{
  "version": 1,
  "allow": {
    "package-name": ["preinstall", "install", "postinstall"]
  },
  "blocked": {
    "malicious-package": ["postinstall"]
  },
  "metadata": {
    "generatedAt": "2025-01-15",
    "approvedBy": "username"
  }
}
```

## Exit Codes

- `0` - Success
- `1` - Policy violation (unapproved scripts)
- `2` - Internal failure

## Lifecycle Scripts

Scriptinel monitors these npm lifecycle scripts:
- `preinstall` - Before installation
- `install` - During installation
- `postinstall` - After installation

## File Locations

- Policy file: `install-scripts.policy.json` (project root)
- Lockfile: `package-lock.json` or `npm-shrinkwrap.json`

