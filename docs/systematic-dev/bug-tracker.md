# Bug Tracker

## Active Bugs

No active bugs at this time.

## Resolved Bugs

### [BUG-003]
- **Title**: Anthropic API Temperature and Instructions Parameters Not Working
- **Description**: When using Anthropic models, the temperature and instructions parameters set in the agent configuration weren't being properly applied.
- **Root Cause**: The `AnthropicService` class lacked a default temperature value when none was provided, and wasn't correctly handling the temperature and instructions parameters.
- **TDD Approach**: 
  1. Created unit tests in `tests/unit/lib/anthropic-integration.unit.test.ts` to verify temperature and instructions handling
  2. Confirmed the issue by showing that parameters weren't being correctly passed to the Anthropic API
  3. Modified the `AnthropicService` class to correctly handle these parameters
  4. Verified the fix by running the tests and confirming all tests pass
- **Resolution**: Updated the `AnthropicService` class to properly handle temperature and instructions parameters.
- **Fixed By**: Adding a default temperature value and ensuring parameters are correctly passed to the Anthropic API.
- **Date Resolved**: 2024-07-12

### [BUG-001]
- **Title**: Database Schema Mismatch After Code Revert
- **Description**: After reverting to a previous commit, the database schema had extra columns (`instructions` and `temperature`) that were no longer in the code definition, causing blank pages and errors.
- **Root Cause**: The database schema had been modified with columns that were then removed from the code definition after a revert, creating a mismatch between the code and database schema.
- **TDD Approach**: 
  1. Created a failing test in `tests/integration/db/schema-mismatch.integration.test.ts` to detect schema mismatches
  2. Confirmed the mismatch by showing extra columns in the database not present in the code
  3. Created a migration script to drop the extra columns
  4. Verified the fix by running the test again and confirming no mismatches
- **Resolution**: Created and ran a SQL migration to drop the extra columns from the database, bringing it back in sync with the code definition. Established a test to detect similar issues in the future.
- **Fixed By**: Creating a direct SQL migration script `drizzle/migrations/fix-agents-schema.sql` to manually fix the schema.
- **Date Resolved**: 2023-11-07 

### [BUG-002]
- **Title**: Empty Agents Page After Code Revert
- **Description**: After reverting to a previous commit, the agents page was showing "No Agents Yet" despite the schema matching correctly between the code and database.
- **Root Cause**: The database didn't have any agents (count = 0) after the revert, leading to the "No Agents Yet" message being displayed correctly.
- **TDD Approach**: 
  1. Verified the schema matches correctly using a schema verification test
  2. Confirmed no data existed with a direct database query showing 0 agents in the table
  3. Created test data by adding sample agents to the database
  4. Verified the fix by checking that the agents page now displays the newly created agents
- **Resolution**: Added sample agents to the database to demonstrate that the system actually works correctly. The "No Agents Yet" message was technically accurate since there were no agents in the database.
- **Fixed By**: Inserting sample data into the agents table to validate the functionality.
- **Date Resolved**: 2023-11-07 