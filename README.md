# Scriptinel

> **Install Script Firewall for npm**  
> Default-deny lifecycle scripts with explicit, reviewable allowlists.

[![npm version](https://img.shields.io/npm/v/scriptinel)](https://www.npmjs.com/package/scriptinel)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Scriptinel blocks all npm lifecycle scripts (`preinstall`, `install`, `postinstall`) unless they are explicitly approved via a policy file committed to your repository. This provides a controlled middle ground between running everything blindly (high risk) and disabling scripts entirely (breaks builds).

## Quick Start

```bash
# First run - detects unapproved scripts
npx scriptinel

# Approve a package's scripts
npx scriptinel approve esbuild

# CI usage - fails on violations
npx scriptinel --ci
```

## Why Scriptinel?

npm lifecycle scripts are a major **supply-chain attack vector**. Attackers can inject malicious code that runs automatically during `npm install`. Scriptinel provides:

- **Default-deny security** - Block all scripts by default
- **Explicit approvals** - Review and approve scripts intentionally
- **CI enforcement** - Fail builds on unapproved scripts
- **Zero-config** - Works immediately with `npx scriptinel`
- **Deterministic** - Same input always produces same output

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

Add Scriptinel to your CI pipeline to enforce policy:

```yaml
# .github/workflows/ci.yml
- name: Scriptinel
  run: npx scriptinel --ci
```

In CI mode:
- Unapproved scripts cause the build to fail (exit code 1)
- Policy violations are clearly reported
- Builds pass only when all scripts are approved

### Audit Mode

Report-only mode that doesn't block or execute scripts:

```bash
npx scriptinel --audit
```

Useful for:
- Checking policy compliance without modifying behavior
- Generating reports for security audits
- Understanding script usage across dependencies

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

- Exact package names only (no wildcards)
- Explicit script names only (`preinstall`, `install`, `postinstall`)
- Policy file should be committed to version control
- Policy changes require explicit approval

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

Scriptinel follows security best practices:

- Never uses `shell: true` (prevents shell injection)
- Validates all package names strictly
- No network calls during install phase
- No dynamic code execution
- No environment mutation

## Contributing

Contributions are welcome! Please read our contributing guidelines and code of conduct.

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Related Projects

- [npm-audit](https://docs.npmjs.com/cli/v8/commands/npm-audit) - Dependency vulnerability scanning
- [snyk](https://snyk.io/) - Security scanning and monitoring
- [dependabot](https://dependabot.com/) - Automated dependency updates

## Support

- **Issues**: [GitHub Issues](https://github.com/dxmari/scriptinel/issues)
- **Discussions**: [GitHub Discussions](https://github.com/dxmari/scriptinel/discussions)

---

Made with ❤️ for secure npm installs
