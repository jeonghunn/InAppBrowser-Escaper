# GitHub Actions Configuration

This directory contains the GitHub Actions workflows for the InAppBrowserEscaper project.

## Workflows

### 1. CI Workflow (`ci.yml`)
- **Triggers**: Push/PR to main and develop branches
- **Node versions**: 18.x, 20.x, 22.x
- **Jobs**:
  - **Test**: Runs tests and uploads coverage to Codecov
  - **Build**: Builds the project and uploads artifacts
  - **Type Check**: Validates TypeScript compilation for all configurations

### 2. Release Workflow (`release.yml`)
- **Triggers**: Push of version tags (v*)
- **Jobs**:
  - **Release**: Publishes to npm with provenance
  - **GitHub Release**: Creates GitHub release with changelog

**Required Secrets**:
- `NPM_TOKEN`: npm authentication token for publishing

### 3. Code Quality Workflow (`code-quality.yml`)
- **Triggers**: Push/PR to main and develop branches
- **Jobs**:
  - **Security**: npm audit for vulnerabilities
  - **Dependency Review**: Reviews dependency changes in PRs
  - **CodeQL**: Static analysis for security issues

### 4. Demo Validation Workflow (`demo-validation.yml`)
- **Triggers**: Changes to demo files or examples
- **Jobs**:
  - **Validate Demos**: HTML validation and TypeScript compilation of examples

## Setup Instructions

1. **npm Token**: Add your npm token to repository secrets as `NPM_TOKEN`
2. **Codecov**: The CI workflow will automatically upload coverage reports
3. **Branch Protection**: Consider setting up branch protection rules for the main branch

## Workflow Features

- ✅ Multi-node version testing
- ✅ TypeScript compilation validation
- ✅ Automated npm publishing
- ✅ Security scanning with CodeQL
- ✅ Dependency vulnerability checking
- ✅ Code coverage reporting
- ✅ Build artifact preservation
- ✅ Demo file validation