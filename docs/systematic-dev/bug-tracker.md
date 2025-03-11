# Bug Tracker

## Open Bugs

<!-- List of open bugs with Critical or High severity -->

## Fixed Bugs

### [BUG-008] Server/Client Component Boundary Error in Agent Details Page
- **Severity**: High
- **Status**: Fixed
- **Description**: The Agent Details page was failing to compile due to a server/client component boundary error with the ModelSelector component.
- **Error Message**: "You're importing a component that needs useTransition. It only works in a Client Component but none of its parents are marked with 'use client', so they're Server Components by default."
- **Root Cause**: The `AgentDetailsPage` server component was defining an inline client component (`ModelSelectorWrapper`) that used React hooks like `useTransition`, which violates Next.js server/client component boundaries.
- **Fix**: 
  1. Moved the `ModelSelectorWrapper` client component to its own file with the 'use client' directive
  2. Updated the `AgentDetailsPage` to import and use the separate client component
  3. Updated tests to properly mock the new component structure
  4. Added a new test to verify proper server/client component separation
- **Prevention**: Enhanced the server/client component boundary test to check for React hooks in server components and verify that client components are properly separated into their own files.
- **Fixed Date**: June 24, 2024

### [BUG-007] Hardcoded Agent Details in Agent Details Page
- **Severity**: Medium
- **Status**: Fixed
- **Description**: The Agent Details page was displaying hardcoded "Demo Agent" details instead of fetching and displaying the actual agent details from the database.
- **Error Patterns**: 
  1. Agent name, description, and other details were hardcoded as "Demo Agent" values
  2. Tests were failing because they expected actual agent details from the database
- **Root Cause**: The `AgentDetailsPage` component was not fetching agent details from the database using `getAgentById` like the edit page does.
- **Fix**: 
  1. Updated the `AgentDetailsPage` to be a server component that fetches agent details
  2. Added `getServerSession` to get the current user
  3. Used `getAgentById` to fetch the actual agent details
  4. Updated the component to display the actual agent details from the database
- **Prevention**: Added comprehensive tests to verify that the component displays actual agent details from the database.
- **Fixed Date**: June 23, 2024

### [BUG-006] Agent Form and API Integration Test Failures
- **Severity**: High
- **Status**: Fixed
- **Description**: Multiple test failures in agent forms and API integration tests.
- **Error Patterns**: 
  1. "TypeError: default.transaction is not a function" in agent-db unit tests
  2. "expected 400 to be 200" in agent-by-id integration test
  3. Redirect path mismatch in AgentCreationForm integration test
- **Root Cause**: 
  1. Missing transaction method in database mock for unit tests
  2. Missing required apiConnectionId field in PUT request test
  3. Incorrect redirect path in AgentCreationForm component
- **Fix**: 
  1. Updated database mock to include a transaction method
  2. Added apiConnectionId to the PUT request in agent-by-id integration test
  3. Fixed the redirect path in AgentCreationForm from '/agents' to '/app/agents'
- **Prevention**: Ensured all tests pass with comprehensive validation of API requirements and component behavior.
- **Fixed Date**: June 21, 2024

### [BUG-005] Excessive Database Query Logging
- **Severity**: Medium
- **Status**: Fixed
- **Description**: The application was generating excessive and repetitive database query logs, particularly for agent queries, which cluttered the logs and made debugging difficult.
- **Error Pattern**: Multiple identical queries like `select "id", "name", "description", "system_prompt", "model", "temperature", "max_tokens", "created_at", "updated_at", "user_id" from "agents" where "agents"."user_id" = $1 order by "agents"."updated_at" desc` were being logged repeatedly in quick succession.
- **Root Cause**: The Drizzle ORM was configured with `logger: true` in `lib/db.ts`, which caused all SQL queries to be logged without any filtering or throttling.
- **Fix**: 
  1. Modified the database configuration to only enable logging in development mode
  2. Implemented a query cache and debounce mechanism to prevent logging identical queries repeatedly
  3. Added a 2-second timeout to clear the cache and allow the same query to be logged again after a reasonable interval
- **Prevention**: Added conditional logging based on environment and implemented a mechanism to prevent duplicate log entries.
- **Fixed Date**: June 20, 2024

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