# Platform Starter Kit

A test-driven fork of the [Vercel Platforms Starter Kit](https://vercel.com/guides/nextjs-multi-tenant-application).

## Changes from Original

1. **Added Test Coverage**
   ```
   tests/
   ├── unit/              # Component and utility tests
   ├── integration/       # API and database tests
   └── __helpers__/      # Test utilities
   ```

2. **Fixed Issues**
   - GitHub OAuth email requirement ([#409](https://github.com/vercel/platforms/issues/409))
   - Added test infrastructure
   - Enhanced public homepage
   - Improved preview deployment URLs

3. **Added Google Analytics**
   - Event tracking for user interactions
   - Page view tracking
   - Comprehensive test coverage

## Getting Started

1. Clone and install:
   ```bash
   git clone https://github.com/derekg1729/agent-platform.git
   cd agent-platform
   pnpm install
   ```

2. Configure environment:
   ```bash
   cp .env.example .env.local
   ```
   Required variables:
   - `AUTH_GITHUB_ID` and `AUTH_GITHUB_SECRET` for GitHub OAuth
   - `POSTGRES_URL` for database
   - `NEXT_PUBLIC_ROOT_DOMAIN` for domain config

3. Development:
   ```bash
   pnpm dev     # Start development server
   pnpm test    # Run tests
   ```

For full documentation of the original starter kit features, see the [Vercel Platform Starter Kit Guide](https://vercel.com/guides/nextjs-multi-tenant-application).

## Development Workflow

### Pre-Commit Validation (MANDATORY)

⚠️ **CRITICAL: NEVER BYPASS THESE STEPS!** Committing code that doesn't pass all checks can break the build.

Run the complete pre-commit workflow:
```bash
npm run pre-commit
```

This runs:
1. Environment consistency check
2. Linting
3. Type checking
4. Tests
5. Build verification

#### Enforcement

Set up Git hooks to enforce this workflow:
```bash
npm run setup-hooks
```

#### Troubleshooting

- **Test Failures**: Fix issues before committing. Don't modify tests to make them pass unless the test itself is incorrect.
- **Build Failures**: Fix code issues before committing. Common problems include syntax errors, missing dependencies, or configuration issues.
- **Environment Issues**: Run `npm run check-env` to verify environment variables are consistent.

### Deployment Workflow

#### Preview Deployments
1. **ONLY AFTER all pre-commit checks pass**: Commit changes to a feature branch
2. Push to GitHub to trigger a preview build
3. Verify functionality in the preview environment

#### Production Deployment
1. Create a pull request from your feature branch
2. Verify all CI checks pass on the PR
3. Merge PR to the main branch
4. Vercel automatically deploys the main branch to production

## Tech Stack

Same as original starter kit, plus:
- Testing: Vitest + React Testing Library
- Database: Drizzle ORM migrations
- Analytics: Google Analytics via @next/third-parties

## License

MIT License

---

<a aria-label="Vercel logo" href="https://vercel.com">
  <img src="https://badgen.net/badge/icon/Made%20by%20Vercel?icon=zeit&label&color=black&labelColor=black">
</a>
