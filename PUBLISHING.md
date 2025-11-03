# Publishing Guide

This guide explains how to publish the InAppBrowserEscaper package to npm.

## Prerequisites

1. **npm account**: Make sure you have an npm account at https://www.npmjs.com/
2. **npm CLI**: Ensure you have npm installed and are logged in:
   ```bash
   npm login
   ```

## Pre-publish Checklist

Before publishing, make sure:

- [ ] All tests pass: `npm test`
- [ ] Code builds successfully: `npm run build`
- [ ] Version is updated in `package.json`
- [ ] `CHANGELOG.md` is updated with new changes
- [ ] `README.md` is up to date
- [ ] No sensitive information is included

## Publishing Process

### 1. Version Bump

Update the version in `package.json` using semantic versioning:

```bash
# For patch releases (bug fixes)
npm version patch

# For minor releases (new features)
npm version minor

# For major releases (breaking changes)
npm version major
```

### 2. Build and Test

```bash
# Clean build
npm run build

# Run all tests
npm test

# Run tests with coverage
npm run test:coverage
```

### 3. Publish

```bash
# Dry run to see what will be published
npm publish --dry-run

# Publish to npm
npm publish
```

### 4. Verify Publication

Check that the package was published correctly:

```bash
npm view @jhrunning/inappbrowserescaper
```

## Post-publish Tasks

1. **Tag the release** in your git repository:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **Create a GitHub release** with the changelog information

3. **Update documentation** if needed

## Beta/Pre-release Publishing

For beta versions:

```bash
# Update version to beta
npm version prerelease --preid=beta

# Publish with beta tag
npm publish --tag beta
```

Users can install beta versions with:
```bash
npm install @jhrunning/inappbrowserescaper@beta
```

## Unpublishing (Emergency Only)

⚠️ **Warning**: Only unpublish in emergencies. It can break dependent packages.

```bash
# Unpublish a specific version
npm unpublish @jhrunning/inappbrowserescaper@1.0.0

# Unpublish entire package (within 72 hours)
npm unpublish @jhrunning/inappbrowserescaper --force
```

## Package Information

- **Package name**: `@jhrunning/inappbrowserescaper`
- **Registry**: https://www.npmjs.com/
- **License**: MIT
- **Author**: [Update in package.json]

## Files Included in Package

The published package includes:
- `dist/` - Compiled JavaScript and TypeScript definitions
- `src/react.tsx` - React integration source
- `src/angular.ts` - Angular integration source  
- `src/examples/` - Example code
- `README.md` - Documentation
- `LICENSE` - MIT license
- `package.json` - Package metadata

Files excluded via `.npmignore` or not listed in `files` field are not published.
