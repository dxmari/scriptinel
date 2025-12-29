# Getting Started with Scriptinel

This guide will help you get started with Scriptinel in under 5 minutes.

## Prerequisites

- Node.js 18 or higher
- npm 7 or higher
- A project with a `package.json` and `package-lock.json`

## Step 1: Run Scriptinel

In your project directory, run:

```bash
npx scriptinel
```

This will:
1. Install your dependencies with `--ignore-scripts`
2. Detect all lifecycle scripts
3. Create a policy file if it doesn't exist
4. Report any unapproved scripts

## Step 2: Review Violations

Scriptinel will show you any unapproved scripts:

```
Found 2 unapproved script(s):

  • esbuild@0.19.0 - postinstall
  • sharp@0.32.0 - install

To approve these scripts, run:
  npx scriptinel approve esbuild
  npx scriptinel approve sharp
```

## Step 3: Approve Legitimate Scripts

For each package that needs its scripts to run:

```bash
npx scriptinel approve esbuild
npx scriptinel approve sharp
```

This updates your `install-scripts.policy.json` file.

## Step 4: Commit Policy File

Commit the policy file to version control:

```bash
git add install-scripts.policy.json
git commit -m "Add Scriptinel policy"
```

## Step 5: Add to CI

Add Scriptinel to your CI pipeline:

```yaml
# .github/workflows/ci.yml
- name: Scriptinel
  run: npx scriptinel --ci
```

## Next Steps

- Read the [FAQ](faq.md) for common questions
- Check the [README](../README.md) for detailed documentation
- Review your policy file regularly

## Common Workflows

### Adding a New Dependency

1. `npm install <package>`
2. `npx scriptinel` - Check for scripts
3. If needed: `npx scriptinel approve <package>`
4. Commit policy changes

### Updating Dependencies

1. `npm update`
2. `npx scriptinel --ci` - Verify policy still valid
3. Approve any new scripts if needed

### First-Time Setup

1. Run `npx scriptinel` to create initial policy
2. Review and approve necessary scripts
3. Commit policy file
4. Add to CI pipeline

