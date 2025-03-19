# API Routes Best Practices

## Dynamic Rendering Configuration

### Server-Only Features in API Routes

When creating API routes in Next.js, be aware that routes using server-only features (like `headers()`, `cookies()`, or `getServerSession()`) must be explicitly marked as dynamic to prevent errors during static build time.

#### Problem

During the build process, Next.js attempts to statically generate as much as possible, including API routes. However, server-only features are not available during static build time, resulting in errors like:

```
Error: Dynamic server usage: Page couldn't be rendered statically because it used `headers`.
See more info here: https://nextjs.org/docs/messages/dynamic-server-error
```

#### Solution

For any API route that uses server-only features, add the following export to the route file:

```typescript
export const dynamic = 'force-dynamic';
```

This tells Next.js to always render this route at request time instead of trying to generate it statically during build.

#### Example

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // This uses server-only features
  const session = await getServerSession();
  
  // Rest of handler code...
}
```

### Server-Only Features List

The following features require dynamic rendering:

1. `getServerSession()` - Accesses session data from headers/cookies
2. `headers()` - Accesses request headers
3. `cookies()` - Accesses request cookies
4. Any database access that requires auth from headers/cookies

### Automated Testing

We have automated tests in place to verify that API routes using server-only features are properly configured:

```
pnpm run test tests/integration/api/routes.test.ts
```

These tests scan API route files for server-only methods and verify they export the dynamic configuration.

## Other API Route Best Practices

### Error Handling

Always use proper error handling in API routes:

```typescript
try {
  // Route logic here
} catch (error) {
  console.error('Error description:', error);
  return NextResponse.json(
    { error: 'User-friendly error message' },
    { status: appropriate_status_code }
  );
}
```

### Response Formatting

Maintain consistent response formatting:

```typescript
// Success response
return NextResponse.json({ data: result });

// Error response
return NextResponse.json({ error: 'Error message' }, { status: 400 });
```

### Authentication and Authorization

For protected routes, always check for authentication before processing:

```typescript
const session = await getServerSession(authOptions);
if (!session) {
  return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
}
``` 