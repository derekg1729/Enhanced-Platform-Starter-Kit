# Bug Tracker

## Open Bugs

<!-- List of open bugs with Critical or High severity -->

## Fixed Bugs

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