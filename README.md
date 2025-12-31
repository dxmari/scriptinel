# Scriptinel

> **Install Script Firewall for npm**  
> Default-deny lifecycle scripts with explicit, reviewable allowlists.

[![npm version](https://img.shields.io/npm/v/scriptinel)](https://www.npmjs.com/package/scriptinel)
[![npm downloads](https://img.shields.io/npm/dw/scriptinel)](https://www.npmjs.com/package/scriptinel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Scriptinel blocks all npm lifecycle scripts (`preinstall`, `install`, `postinstall`) unless they are explicitly approved via a policy file committed to your repository. This provides a controlled middle ground between running everything blindly (high risk) and disabling scripts entirely (breaks builds).

## Table of Contents

- [Quick Start](#quick-start)
- [Why Scriptinel?](#why-scriptinel)
- [Requirements](#requirements)
- [Installation](#installation)
- [Usage](#usage)
- [Policy File](#policy-file)
- [CLI Reference](#cli-reference)
- [Operating Modes](#operating-modes)
- [Examples](#examples)
- [Comparison with Alternatives](#comparison-with-alternatives)
- [Security Considerations](#security-considerations)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [Documentation](#documentation)

## Quick Start

```bash
# First run - detects unapproved scripts
npx scriptinel

# Approve a package's scripts
npx scriptinel approve esbuild

# CI usage - fails on violations
npx scriptinel --ci
```

> **New to Scriptinel?** Check out the [Understanding Scriptinel Guide](docs/understanding-scriptinel.md) for a complete walkthrough with examples and test scenarios.

## Why Scriptinel?

npm lifecycle scripts are a major **supply-chain attack vector**. Attackers can inject malicious code that runs automatically during `npm install`. Scriptinel provides:

- **Default-deny security** - Block all scripts by default
- **Explicit approvals** - Review and approve scripts intentionally
- **CI enforcement** - Fail builds on unapproved scripts
- **Zero-config** - Works immediately with `npx scriptinel`
- **Deterministic** - Same input always produces same output

## Requirements

- **Node.js 18+** (required for development and testing)
- npm 7+ or compatible package manager

> **Note:** If you're using `nvm`, run `nvm use` to automatically switch to Node.js 18+.

### Quick Setup

If you encounter dependency issues, run the setup script:

```bash
npm run setup
```

This will:
1. Switch to Node.js 18+ (if using nvm)
2. Clean and reinstall all dependencies
3. Verify the installation

## Installation

No installation required! Use directly with `npx`:

```bash
npx scriptinel
```

Or install globally:

```bash
npm install -g scriptinel
```

## Usage

### Local Development

Run Scriptinel to detect and report unapproved scripts:

```bash
npx scriptinel
```

This will:
1. Run `npm install --ignore-scripts` to install packages safely
2. Detect all lifecycle scripts in your dependencies
3. Compare against your policy file
4. Report violations (warnings only in local mode)
5. Execute approved scripts

### Approve Package Scripts

When you encounter a legitimate script that needs to run:

```bash
npx scriptinel approve <package-name>
```

This automatically:
- Detects all lifecycle scripts for the package
- Adds them to your `install-scripts.policy.json`
- Commits the policy file to your repository

### CI Integration

Add Scriptinel to your CI pipeline to enforce policy. This is where Scriptinel provides the most value—preventing unapproved scripts from running in production builds.

```yaml
# .github/workflows/ci.yml
- name: Install dependencies safely
  run: npm ci --ignore-scripts
  
- name: Run Scriptinel
  run: npx scriptinel --ci
```

**CI mode behavior:**
- ✅ Unapproved scripts cause the build to fail (exit code 1)
- ✅ Policy violations are clearly reported with actionable messages
- ✅ Builds pass only when all scripts are explicitly approved
- ✅ Policy file must be committed to version control

This ensures that **no unapproved scripts can run in your CI/CD pipeline**, providing a critical security layer.

### Audit Mode

Report-only mode that doesn't block or execute scripts:

```bash
npx scriptinel --audit
```

Useful for:
- Checking policy compliance without modifying behavior
- Generating reports for security audits
- Understanding script usage across dependencies

## Operating Modes

Scriptinel operates in three distinct modes, each with specific behavior:

| Mode | Command | Behavior | Exit Code on Violations | Scripts Execute? |
|------|---------|----------|------------------------|------------------|
| **Default** | `npx scriptinel` | Warns on violations, continues | `0` (warns only) | Yes (approved only) |
| **CI** | `npx scriptinel --ci` | Fails on violations | `1` (fails build) | Yes (approved only) |
| **Audit** | `npx scriptinel --audit` | Reports only, no blocking | `0` (always succeeds) | No |

### When to Use Each Mode

- **Default mode**: Local development, first-time setup, exploring dependencies
- **CI mode**: Continuous integration pipelines, automated testing, production builds
- **Audit mode**: Security reviews, compliance checks, understanding script usage

## Policy File

Scriptinel uses `install-scripts.policy.json` in your project root:

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

### Policy Structure

- **`allow`** - Packages and scripts explicitly approved to run
- **`blocked`** - Packages and scripts explicitly denied (optional)
- **`metadata`** - Tracking information (auto-generated)

### Policy Rules

The policy file is the **core contract** between you and Scriptinel. It must be:

- **Exact package names only** - No wildcards, no patterns, case-sensitive matching
- **Explicit script names only** - Must specify `preinstall`, `install`, or `postinstall` exactly
- **Version-controlled** - Policy file should be committed to git for team consistency
- **Reviewable** - Policy changes appear in git diffs, enabling code review
- **Deterministic** - Same policy file always produces same behavior

> **Why no wildcards?** Security tools require predictability. Wildcards introduce ambiguity and make it harder to audit what's actually approved.

## CLI Reference

### Commands

```bash
# Default run (warn on violations)
npx scriptinel

# Approve package scripts
npx scriptinel approve <package-name>

# CI mode (fail on violations)
npx scriptinel --ci

# Audit mode (report only)
npx scriptinel --audit

# JSON output
npx scriptinel --json

# Custom policy file
npx scriptinel --policy custom-policy.json
```

### Flags

| Flag | Description |
|------|-------------|
| `--ci` | Strict enforcement mode (fail on violations) |
| `--audit` | Report-only mode (no blocking or execution) |
| `--json` | Machine-readable JSON output |
| `--policy <path>` | Custom policy file location |

## Exit Codes

| Code | Meaning |
|------|---------|
| `0` | Success |
| `1` | Policy violation (unapproved scripts detected) |
| `2` | Internal failure |

## Examples

### GitHub Actions

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
      
      - name: Scriptinel
        run: npx scriptinel --ci
      
      - name: Run tests
        run: npm test
```

### GitLab CI

```yaml
test:
  image: node:20
  script:
    - npm ci --ignore-scripts
    - npx scriptinel --ci
    - npm test
```

### CircleCI

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

## Troubleshooting

### "No lockfile found"

Ensure you have a `package-lock.json` file. Run `npm install` first to generate it.

### "Policy violation" in CI

This means unapproved scripts were detected. To fix:

1. Run locally: `npx scriptinel`
2. Review the violations
3. Approve legitimate scripts: `npx scriptinel approve <package>`
4. Commit the updated policy file

### Scripts not executing

Check that:
1. Scripts are in the `allow` section of your policy
2. Package name matches exactly (case-sensitive)
3. Script name is correct (`preinstall`, `install`, or `postinstall`)

## Security Considerations

Scriptinel is designed with security-first principles. Here's what we **guarantee**:

### Security Guarantees

✅ **No shell injection risk** - Never uses `shell: true`, always uses explicit command execution  
✅ **Strict input validation** - All package names and script names are validated  
✅ **No network calls** - Zero network activity during install phase  
✅ **No dynamic execution** - No `eval()`, `Function()`, or dynamic `require()`  
✅ **No environment mutation** - Does not modify system environment variables  
✅ **Deterministic behavior** - Same input always produces same output  
✅ **Zero runtime dependencies** - Uses only Node.js built-ins (reduces attack surface)

### What Scriptinel Does NOT Do

❌ Scan for known vulnerabilities (use `npm audit` or Snyk)  
❌ Monitor runtime behavior (use runtime security tools)  
❌ Analyze package contents (use static analysis tools)  
❌ Replace dependency management (works with npm/yarn/pnpm)

Scriptinel's scope is **install-time script execution control**—nothing more, nothing less.

## Contributing

Contributions are welcome and help make Scriptinel better for everyone.

### How to Contribute

1. **Fork the repository** and clone your fork
2. **Create a feature branch**: `git checkout -b feature/your-feature-name`
3. **Make your changes** following our [coding rules](.cursor/rules/scriptinel_npm_plugin_coding_rules.md)
4. **Add tests** for new functionality
5. **Run the test suite**: `npm test`
6. **Submit a pull request** with a clear description

### Development Setup

```bash
# Clone and setup
git clone https://github.com/dxmari/scriptinel.git
cd scriptinel
npm install

# Run tests
npm test

# Build
npm run build
```

### Code Standards

- Follow TypeScript strict mode
- Functions ≤ 25 lines, files ≤ 200 lines
- No `any` types
- Pure functions by default
- See [coding rules](.cursor/rules/scriptinel_npm_plugin_coding_rules.md) for details

### Reporting Issues

Found a bug or have a suggestion? Please [open an issue](https://github.com/dxmari/scriptinel/issues) with:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (Node.js version, OS, etc.)

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Comparison with Alternatives

Scriptinel focuses specifically on **install-time script execution control**, which complements but differs from other security tools:

| Tool | Primary Focus | Scriptinel Advantage |
|------|--------------|---------------------|
| **npm audit** | Vulnerability scanning (known CVEs) | Controls script execution, not just vulnerabilities |
| **Snyk** | Software Composition Analysis (SCA) | Install-time enforcement, policy-driven blocking |
| **Dependabot** | Automated dependency updates | Prevents malicious scripts from running during updates |
| **Scriptinel** | Script firewall | Default-deny with explicit approvals, CI-enforced |

### Why Use Scriptinel?

- **Complements existing tools**: Works alongside npm audit and Snyk
- **Install-time protection**: Blocks malicious scripts before they execute
- **Policy-driven**: Reviewable, version-controlled approvals
- **CI-enforced**: Fails builds on unapproved scripts
- **Zero-config**: Works immediately with `npx scriptinel`

Scriptinel is not a replacement for vulnerability scanning—use it **together** with npm audit or Snyk for comprehensive security.

## Documentation

- **[Understanding Scriptinel](docs/understanding-scriptinel.md)** - Complete guide with examples and scenarios
- **[Testing Guide](TESTING_GUIDE.md)** - How to test and understand Scriptinel
- **[Getting Started](docs/getting-started.md)** - Quick start guide
- **[FAQ](docs/faq.md)** - Common questions
- **[Quick Reference](docs/quick-reference.md)** - Command cheat sheet
- **[Examples](examples/)** - Real-world usage examples

## Support

- **Issues**: [GitHub Issues](https://github.com/dxmari/scriptinel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dxmari/scriptinel/discussions)

---

**Scriptinel** - Making npm install safe by default.
