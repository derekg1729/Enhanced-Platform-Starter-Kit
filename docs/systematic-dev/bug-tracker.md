# Bug Tracker

## Open Bugs

<!-- List of open bugs with Critical or High severity -->

### [BUG-003] API Connection Creation Error
- **Severity**: High
- **Status**: Open
- **Description**: Creating an API connection fails with "Unexpected end of JSON input" error.
- **Impact**: Users cannot add API keys, blocking the core functionality of using the hello world agent.
- **Reproduction Steps**: 
  1. Navigate to API connections page
  2. Fill out the form to add a new API key
  3. Click "Create Connection"
- **Discovered**: June 16, 2024

## Fixed Bugs

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