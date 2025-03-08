# Test-Driven Platform Starter Kit

A test-driven fork of the [Vercel Platforms Starter Kit](https://vercel.com/guides/nextjs-multi-tenant-application) with a few fixes, features and tests.

## Overview

This project extends the Platforms Starter Kit with:

1. **Comprehensive Test Coverage**
   - Unit tests with Vitest
   - End-to-end tests with Playwright
   - Integration tests for core platform features

2. **Enhanced Features**
   - Clean and efficient Markdown editor
   - Public homepage with modern design
   - Pageview tracking capabilities
   - Fixed GitHub authentication email handling

3. **Original Platform Features**
   - Multi-tenancy with custom domains
   - Performance optimized with Vercel Edge Network
   - Image uploads with Vercel Blob
   - Dynamic OG cards and dark mode

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/derekg1729/agent-platform.git
   cd agent-platform
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Copy `.env.example` to `.env.local` and fill in the required environment variables.

4. Run the development server:
   ```bash
   pnpm run dev
   ```

5. Run tests:
   ```bash
   pnpm test        # Unit tests
   pnpm test:e2e    # E2E tests
   ```

## Fixed Issues

This fork addresses several issues from the original starter kit:

1. **GitHub Authentication Email**: Fixed email requirement issue ([#409](https://github.com/vercel/platforms/issues/409))
2. **Build Process**: Resolved Novel editor dependencies and build configuration
3. **Test Infrastructure**: Added comprehensive test coverage following [ai-platform](https://github.com/derekg1729/ai-platform) patterns

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) with App Router
- **Database**: [Vercel Postgres](https://vercel.com/storage/postgres) with [Drizzle ORM](https://orm.drizzle.team/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/) with GitHub
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Testing**: 
  - [Vitest](https://vitest.dev/) for unit testing
  - [Playwright](https://playwright.dev/) for E2E testing
- **Deployment**: [Vercel](https://vercel.com)

## Development

- Run `pnpm dev` to start the development server
- Run `pnpm build` to create a production build
- Run `pnpm test` to execute the test suite

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License

---

<a aria-label="Vercel logo" href="https://vercel.com">
  <img src="https://badgen.net/badge/icon/Made%20by%20Vercel?icon=zeit&label&color=black&labelColor=black">
</a>
