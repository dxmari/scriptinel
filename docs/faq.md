# Frequently Asked Questions

## General Questions

### What is Scriptinel?

Scriptinel is a security tool that blocks npm lifecycle scripts by default and only allows explicitly approved scripts to run. This prevents supply-chain attacks while maintaining build functionality.

### Why should I use Scriptinel?

npm lifecycle scripts run automatically during `npm install` and are a common attack vector. Scriptinel provides a middle ground between:
- Running everything (high risk)
- Disabling all scripts (breaks builds)

### Is Scriptinel production-ready?

Yes! Scriptinel is designed for production use with:
- Zero runtime dependencies
- Comprehensive error handling
- CI/CD integration
- Deterministic behavior

## Usage Questions

### Do I need to install Scriptinel?

No! You can use it directly with `npx scriptinel`. For CI/CD, you may want to install it as a dev dependency.

### How do I approve a package?

```bash
npx scriptinel approve <package-name>
```

This automatically detects all lifecycle scripts for the package and adds them to your policy.

### Can I approve specific scripts only?

Currently, Scriptinel approves all lifecycle scripts for a package. You can manually edit the policy file to remove specific scripts if needed.

### What happens if I don't approve a script?

In local mode, Scriptinel will warn you but not fail. In CI mode (`--ci`), it will fail the build.

### Can I use Scriptinel with yarn or pnpm?

Scriptinel currently supports npm only. Support for other package managers may be added in future versions.

## Policy Questions

### Where is the policy file stored?

The policy file `install-scripts.policy.json` is stored in your project root and should be committed to version control.

### Can I use a custom policy file location?

Yes, use the `--policy` flag:

```bash
npx scriptinel --policy custom/policy.json
```

### How do I block a package's scripts?

Add the package to the `blocked` section in your policy file:

```json
{
  "blocked": {
    "malicious-package": ["postinstall"]
  }
}
```

### Can I use wildcards in the policy?

Not in v1. Package names and script names must be exact matches.

## CI/CD Questions

### How do I add Scriptinel to GitHub Actions?

```yaml
- name: Scriptinel
  run: npx scriptinel --ci
```

### What exit code does Scriptinel use?

- `0` - Success
- `1` - Policy violation (unapproved scripts)
- `2` - Internal failure

### Can I use Scriptinel in pre-commit hooks?

Yes! Add it to your pre-commit configuration:

```json
{
  "pre-commit": ["scriptinel --ci"]
}
```

## Troubleshooting

### "No lockfile found" error

Ensure you have a `package-lock.json` file. Run `npm install` first.

### Scripts not executing after approval

Check that:
1. The package name in the policy matches exactly (case-sensitive)
2. The script name is correct
3. The policy file is valid JSON

### Policy file not found

Scriptinel will create a default policy file on first run. If you're using a custom location, ensure the path is correct.

### Build fails in CI with policy violations

1. Run `npx scriptinel` locally
2. Review the violations
3. Approve legitimate scripts
4. Commit the updated policy file

## Security Questions

### Is Scriptinel itself secure?

Yes! Scriptinel follows security best practices:
- No shell execution
- Strict input validation
- No network calls during install
- No dynamic code execution

### Can Scriptinel be bypassed?

Scriptinel runs before scripts execute. If someone modifies your policy file maliciously, that would be caught by code review and CI checks.

### Does Scriptinel scan for vulnerabilities?

No, Scriptinel only controls script execution. Use `npm audit` or tools like Snyk for vulnerability scanning.

## Technical Questions

### What Node.js version is required?

Node.js 18 or higher.

### Does Scriptinel work with npm workspaces?

Yes, Scriptinel works with npm workspaces. It processes the root lockfile and detects scripts across all workspace packages.

### How does Scriptinel detect scripts?

Scriptinel:
1. Parses your `package-lock.json`
2. Reads `package.json` files from `node_modules`
3. Extracts lifecycle script definitions
4. Matches them against your policy

### Can I use Scriptinel programmatically?

Yes! Scriptinel exports its core functions. See the [API documentation](../README.md#api) for details.

## Contributing

### How can I contribute?

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

### Where can I report bugs?

Use the [GitHub Issues](https://github.com/dxmari/scriptinel/issues) page.

### Can I request features?

Yes! Open a feature request on GitHub Issues or Discussions.

