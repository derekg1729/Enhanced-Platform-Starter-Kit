---
name: Deployment Checklist
about: Use this template before merging PRs to main branch to prevent deployment issues
title: 'Deployment: [Feature Name]'
labels: deployment
assignees: ''
---

## Deployment Checklist

### Build Verification
- [ ] Run `pnpm run build` locally to verify build completes successfully
- [ ] Verify no API routes with server-side features lack `force-dynamic` configuration
- [ ] Run automated tests for API routes configuration: `pnpm run test tests/integration/api/routes.test.ts`

### API Routes
- [ ] Any API routes using `getServerSession()` include `export const dynamic = 'force-dynamic'`
- [ ] Any API routes using `headers()` include `export const dynamic = 'force-dynamic'`
- [ ] Any API routes using `cookies()` include `export const dynamic = 'force-dynamic'`

### Static Generation
- [ ] No API routes attempt to use server-only features during static generation
- [ ] Preview mode or similar features are properly configured
- [ ] No Edge runtime components use Node.js-specific features

### Database
- [ ] Database schema is in sync with app models
- [ ] Migrations have been tested on development environment
- [ ] No missing indexes for common queries

### Authentication
- [ ] Auth redirects function properly
- [ ] Protected routes have appropriate auth checks
- [ ] API routes requiring auth have appropriate auth checks

### Edge Cases
- [ ] Preview deployment URLs work properly
- [ ] Custom domain handling works as expected
- [ ] Deployment-specific environment variables are configured

### Middleware
- [ ] Middleware has been tested with all URL patterns
- [ ] Preview deployment handling in middleware is functional
- [ ] No middleware feature relies on environment-specific functionality

### Testing
- [ ] All automated tests pass: `pnpm run test`
- [ ] Core user flows have been manually verified

## Resolution Steps for Build Failures

If your deployment fails, follow these steps:

1. Check the Vercel deployment logs for specific error messages
2. Look for "Dynamic server usage" errors which indicate API routes using server features without dynamic config
3. For any failing route, add `export const dynamic = 'force-dynamic'` to the route file
4. Verify fix with local build: `pnpm run build`
5. Push fix and redeploy 