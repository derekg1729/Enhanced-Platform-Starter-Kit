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

## Tech Stack

Same as original starter kit, plus:
- Testing: Vitest + React Testing Library
- Database: Drizzle ORM migrations

## License

MIT License

---

<a aria-label="Vercel logo" href="https://vercel.com">
  <img src="https://badgen.net/badge/icon/Made%20by%20Vercel?icon=zeit&label&color=black&labelColor=black">
</a>
