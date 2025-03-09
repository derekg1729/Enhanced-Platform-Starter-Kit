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

4. **Automated Pre-commit Guardrails**
   - Husky Git hooks and CursorRules integration
   - Environment consistency validation
   - Comprehensive code quality checks

## Getting Started

1. Clone and install:
   ```bash
   git clone https://github.com/derekg1729/agent-platform.git
   cd agent-platform
   pnpm install
   ```

2. Set up environment variables:

   ```bash
   cp .env.example .env.local
   ```

   ### Required Services Setup

   #### GitHub OAuth (Authentication)
   1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
   2. Click "New OAuth App"
   3. Set Homepage URL to `http://localhost:3000` (for development) or your production domain
   4. Set Authorization callback URLs:
      - Development: `http://app.localhost:3000/api/auth/callback/github`
      - Production: `https://app.yourdomain.com/api/auth/callback/github` (replace with your actual domain)
   5. Copy Client ID to `AUTH_GITHUB_ID` and Client Secret to `AUTH_GITHUB_SECRET`
   6. For production, you may need to create a separate OAuth app with the production URLs

   #### Vercel (Deployment & Project Config)
   1. Create a project on [Vercel](https://vercel.com/new)
   2. Go to Project Settings → General → Project ID and copy to `PROJECT_ID_VERCEL`
   3. Go to Team Settings → General → Team ID and copy to `TEAM_ID_VERCEL`
   4. Create a token at [Vercel Tokens](https://vercel.com/account/tokens) and copy to `AUTH_BEARER_TOKEN`

   #### Neon (PostgreSQL Database)
   1. Via Vercel, Create a [Neon](https://neon.tech/) database
   2. [If Needed] Copy the connection string to `DATABASE_URL` and `POSTGRES_URL`
   3. [If Needed] Copy the unpooled connection string to `DATABASE_URL_UNPOOLED` and `POSTGRES_URL_NON_POOLING`

   #### Google Analytics (Optional)
   1. Create a property in [Google Analytics](https://analytics.google.com/)
   2. Copy the Measurement ID (G-XXXXXXXX) to `NEXT_PUBLIC_GA_ID`

3. Set up Git hooks:
   ```bash
   npm run setup-hooks
   ```

4. Development:
   ```bash
   pnpm dev     # Start development server
   pnpm test    # Run tests
   ```

For full documentation of the original starter kit features, see the [Vercel Platform Starter Kit Guide](https://vercel.com/guides/nextjs-multi-tenant-application).

## Development Workflow

### Pre-Commit Validation

The project uses Husky and CursorRules to enforce code quality. Pre-commit checks run automatically when you commit changes, or you can run them manually:

```bash
npm run pre-commit
```

### Deployment Workflow

#### Preview Deployments
1. Commit changes to a feature branch
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
- Quality: Husky Git hooks and CursorRules

## License

MIT License

---

<a aria-label="Vercel logo" href="https://vercel.com">
  <img src="https://badgen.net/badge/icon/Made%20by%20Vercel?icon=zeit&label&color=black&labelColor=black">
</a>
