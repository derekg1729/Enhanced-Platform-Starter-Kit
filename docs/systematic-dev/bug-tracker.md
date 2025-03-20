# Bug Tracker

## Active Bugs

### [BUG-004]
- **Title**: API Key Refresh Issue
- **Description**: After adding a new API key, users need to manually refresh the page before the key appears in the list.
- **Root Cause**: Likely a client-side state refresh issue where the UI isn't updated after successful API key creation.
- **Steps to Reproduce**: 
  1. Navigate to the API Keys page
  2. Add a new API key
  3. Observe that the new key does not appear until page refresh
- **Priority**: Medium
- **Status**: Open

### [BUG-005]
- **Title**: API Key Form Missing Styling
- **Description**: The form for adding API keys lacks proper styling, making it inconsistent with the rest of the application UI.
- **Root Cause**: Missing styling classes or components for the API key form elements.
- **Steps to Reproduce**: 
  1. Navigate to the API Keys page
  2. View the "Add API Key" form
  3. Observe the unstyled or improperly styled form elements
- **Priority**: Low
- **Status**: Open

### [BUG-006]
- **Title**: 500 Error When Creating New Site Post
- **Description**: Users encounter a 500 server error when attempting to create a new post for a site.
- **Root Cause**: Unknown - needs investigation. Possibly related to database schema, server-side validation, or API errors.
- **Steps to Reproduce**: 
  1. Navigate to a site
  2. Attempt to create a new post
  3. Observe 500 error response
- **Priority**: High
- **Status**: Open

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

### [BUG-007]
- **Title**: Mobile Navigation Menu Not Visible on All Pages
- **Description**: The hamburger menu button for mobile navigation was not consistently visible across all pages, particularly on the "All Agents" page, making it difficult for mobile users to access navigation.
- **Root Cause**: Insufficient z-index value (z-20) for the menu button, causing it to be hidden behind other page elements, especially on pages with complex layouts like the Agents page.
- **TDD Approach**: 
  1. Created failing tests in `tests/unit/components/nav.unit.test.tsx` to verify the menu button visibility and z-index on all pages
  2. Confirmed the issue by showing that the menu button wasn't properly visible on certain pages
  3. Modified the `components/nav.tsx` component to increase the z-index from z-20 to z-50
  4. Updated tests to reflect the new z-index value
  5. Verified the fix by running the tests and confirming all tests pass
- **Resolution**: Increased the z-index of the menu button to ensure it's always visible above other page elements and improved its fixed positioning.
- **Fixed By**: Updating the z-index of the menu button from z-20 to z-50 in the `components/nav.tsx` component.
- **Date Resolved**: 2024-07-17