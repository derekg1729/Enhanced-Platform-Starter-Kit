# Bug Tracker

## Open Bugs

<!-- List of open bugs with Critical or High severity -->

## Fixed Bugs

### [BUG-004] ESLint Warnings in Test Files Causing Build Integration Test Failure
- **Severity**: Medium
- **Status**: Fixed
- **Description**: The build integration test is failing due to ESLint warnings about using `<img>` elements in test mocks for Next.js Image components.
- **Error Message**: "ESLint checks failed: Using `<img>` could result in slower LCP and higher bandwidth. Consider using `<Image />` from `next/image`..."
- **Root Cause**: The test files for agent-list and agent-creation integration tests use `<img>` elements in their mocks for the Next.js Image component, which triggers ESLint warnings. The build integration test treats these warnings as errors.
- **Fix**: Created a centralized mock for the Next.js Image component in tests/__helpers__/nextjs-mocks.tsx and updated the setup file to use this mock. Removed local mocks from test files.
- **Prevention**: Added proper mocking approach for Next.js components in tests to avoid ESLint warnings.
- **Fixed Date**: June 20, 2024

### [BUG-003] API Connection Creation Error
- **Severity**: High
- **Status**: Fixed
- **Description**: Creating an API connection fails with "Unexpected end of JSON input" error.
- **Root Cause**: Improper error handling in both client and server components when dealing with JSON parsing and validation errors.
- **Fix**: 
  1. Added proper JSON parsing error handling in the API route
  2. Improved client-side error handling in the form submission
  3. Added Zod schema validation for request body
  4. Added comprehensive error logging
  5. Added integration tests for error scenarios
- **Prevention**: Added tests to verify error handling for malformed JSON, database errors, and validation failures.
- **Fixed Date**: June 16, 2024

### [BUG-002] Inconsistent Dynamic Route Parameter Naming
- **Severity**: High
- **Status**: Fixed
- **Description**: Build error due to inconsistent dynamic route parameter naming in the API routes.
- **Error Message**: "You cannot use different slug names for the same dynamic path ('agentId' !== 'id')."
- **Root Cause**: Some API routes used 'agentId' as the parameter name while others used 'id' for the same conceptual entity.
- **Fix**: Standardized on using 'agentId' throughout the codebase for consistency. Updated the agent route directory from [id] to [agentId] and updated all references.
- **Prevention**: Added integration tests to verify consistent parameter naming across routes.
- **Fixed Date**: June 16, 2024

### [BUG-001] Server/Client Component Boundary Error in Agent Chat Interface
- **Severity**: High
- **Status**: Fixed
- **Description**: Event handlers were being passed directly from server components to client components, causing a runtime error in the Agent Chat Interface.
- **Root Cause**: The `AgentDetailsPage` server component was directly passing the `handleSendMessage` function to the `AgentChatInterface` client component, which violates Next.js server/client component boundaries.
- **Fix**: Created a client component wrapper (`AgentChatWrapper`) that handles the event locally and only passes serializable data between server and client components.
- **Prevention**: Added a new "Server/Client Component Boundary Testing" rule to the cursor rules to ensure proper testing of server/client component boundaries in the future.
- **Fixed Date**: June 12, 2024

## Active Bugs

No active bugs at this time.

## Resolved Bugs

No resolved bugs at this time. 