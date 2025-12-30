# Node.js Version Setup

Scriptinel requires **Node.js 18 or higher**. This guide will help you set up the correct version.

## Quick Fix

### Using nvm (Recommended)

If you have `nvm` installed:

```bash
# Install Node.js 18 (if not already installed)
nvm install 18

# Use Node.js 18 for this project
nvm use

# Verify version
node --version  # Should show v18.x.x or higher
```

The `.nvmrc` file in the project root will automatically switch to Node.js 18 when you run `nvm use`.

### Without nvm

1. **Download Node.js 18+** from [nodejs.org](https://nodejs.org/)
2. Install it (this will replace your current Node.js installation)
3. Verify: `node --version` should show v18.x.x or higher

### Using Homebrew (macOS)

```bash
brew install node@18
# Or for latest LTS:
brew install node@20
```

## Verify Installation

After upgrading, verify your Node.js version:

```bash
node --version  # Should be v18.0.0 or higher
npm --version   # Should be 7.0.0 or higher
```

## Troubleshooting

### Still seeing old version?

1. **Restart your terminal** - Environment variables may need to be reloaded
2. **Check PATH** - Ensure the new Node.js is in your PATH before the old one
3. **Clear npm cache** - Run `npm cache clean --force`

### Using nvm but version not switching?

```bash
# Make sure nvm is loaded in your shell
source ~/.nvm/nvm.sh

# Then use the version
nvm use
```

### Multiple Node.js installations?

If you have multiple Node.js installations, ensure the correct one is first in your PATH:

```bash
which node  # Check which node is being used
```

