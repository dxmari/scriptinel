# Publishing Scriptinel to npm

This guide explains how to publish Scriptinel to the npm registry.

## Prerequisites

### 1. npm Account

- Create an account at [npmjs.com](https://www.npmjs.com/signup) if you don't have one
- Verify your email address

### 2. Two-Factor Authentication (2FA)

npm requires 2FA for publishing packages. Enable it:

1. Go to [npm account settings](https://www.npmjs.com/settings/YOUR_USERNAME/two-factor)
2. Enable 2FA (recommended: authenticator app)
3. Save backup codes in a secure location

### 3. Login to npm

```bash
npm login
```

Enter your:
- Username
- Password
- Email
- One-time password (from 2FA app)

## Publishing Steps

### Step 1: Verify Package Name Availability

Check if the package name is available:

```bash
npm view scriptinel
```

If it returns 404, the name is available. If it exists, you'll need to:
- Use a different name (update `package.json`)
- Or use a scoped package: `@your-username/scriptinel`

### Step 2: Build the Package

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### Step 3: Verify Package Contents

Check what will be published:

```bash
npm pack --dry-run
```

This shows what files will be included. Verify:
- ✅ `dist/` directory (compiled code)
- ✅ `bin/` directory (CLI entry point)
- ✅ `README.md`
- ✅ `LICENSE`
- ❌ `src/` (source files - excluded by `.npmignore`)
- ❌ `tests/` (test files - excluded)
- ❌ `node_modules/` (dependencies - excluded)

### Step 4: Test Locally (Optional)

Test the package locally before publishing:

```bash
npm pack
npm install -g ./scriptinel-0.1.0.tgz
scriptinel --help
```

### Step 5: Publish

**For first-time publishing:**

```bash
npm publish
```

**For updates (after version bump):**

```bash
# Update version in package.json first
npm version patch  # or minor, major
npm publish
```

## Using Access Tokens (Alternative to 2FA)

If you prefer using access tokens instead of 2FA:

### Create a Granular Access Token

1. Go to [npm Access Tokens](https://www.npmjs.com/settings/YOUR_USERNAME/tokens)
2. Click "Generate New Token"
3. Select "Granular Access Token"
4. Configure:
   - **Token name**: `scriptinel-publish`
   - **Expiration**: Choose appropriate (or never expire for CI)
   - **Type**: Automation
   - **Packages**: Select `scriptinel` or "All packages"
   - **Permissions**: 
     - ✅ Read and write
     - ✅ Bypass 2FA (required for publishing)
5. Generate token
6. **Copy the token immediately** (you won't see it again)

### Use Token for Publishing

**Option 1: Environment Variable**

```bash
export NPM_TOKEN=your_token_here
npm publish
```

**Option 2: .npmrc file**

Create/edit `~/.npmrc`:

```
//registry.npmjs.org/:_authToken=${NPM_TOKEN}
```

Then set the environment variable before publishing.

**Option 3: Direct in .npmrc (less secure)**

```
//registry.npmjs.org/:_authToken=your_token_here
```

⚠️ **Warning**: Don't commit `.npmrc` with tokens to git!

## Troubleshooting

### Error: 403 Forbidden

**Cause**: Missing 2FA or incorrect token permissions

**Solution**:
1. Enable 2FA on your npm account, OR
2. Create a granular access token with "Bypass 2FA" enabled

### Error: Package name already taken

**Cause**: Someone else owns the package name

**Solution**:
1. Use a scoped package: `@your-username/scriptinel`
2. Update `package.json`:
   ```json
   {
     "name": "@your-username/scriptinel"
   }
   ```
3. Publish with: `npm publish --access public`

### Error: You cannot publish over the previously published versions

**Cause**: Trying to publish the same version twice

**Solution**:
```bash
# Bump version
npm version patch  # 0.1.0 -> 0.1.1
npm publish
```

### Error: Invalid package name

**Cause**: Package name doesn't meet npm requirements

**Solution**:
- Must be lowercase
- Can contain hyphens and underscores
- Cannot start with dot or underscore
- Max 214 characters
- Cannot be a reserved word

## CI/CD Publishing

For automated publishing via GitHub Actions, see `.github/workflows/publish.yml`.

**Required secrets**:
- `NPM_TOKEN` - npm access token with publish permissions

## Version Management

Follow [Semantic Versioning](https://semver.org/):

- **Patch** (0.1.0 → 0.1.1): Bug fixes
- **Minor** (0.1.0 → 0.2.0): New features, backward compatible
- **Major** (0.1.0 → 1.0.0): Breaking changes

```bash
npm version patch   # Increments patch version
npm version minor   # Increments minor version
npm version major   # Increments major version
```

## Post-Publishing

After successful publish:

1. **Verify on npm**: https://www.npmjs.com/package/scriptinel
2. **Test installation**:
   ```bash
   npm install -g scriptinel
   scriptinel --help
   ```
3. **Update documentation** with npm package link
4. **Create GitHub release** (if using releases)

## Best Practices

1. ✅ Always test locally before publishing
2. ✅ Use semantic versioning
3. ✅ Write clear release notes
4. ✅ Keep `CHANGELOG.md` updated
5. ✅ Tag releases in git: `git tag v0.1.0`
6. ✅ Don't publish with `--force` unless absolutely necessary
7. ✅ Use access tokens for CI/CD, not personal passwords

## Unpublishing (Emergency Only)

⚠️ **Warning**: Unpublishing can break other projects. Only do this within 72 hours of publishing.

```bash
npm unpublish scriptinel@0.1.0
```

For packages older than 72 hours, contact npm support.

