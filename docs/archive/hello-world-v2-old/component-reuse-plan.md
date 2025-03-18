# Component Reuse Plan: Sites → Agents

## Overview
This document outlines the plan to reuse the existing "sites" page components for the "agents" functionality to ensure UI consistency and follow established patterns.

## Components to Reuse

### 1. Page Structure
- Duplicate `app/app/(dashboard)/sites/page.tsx` → `app/app/(dashboard)/agents/page.tsx`
- Maintain the same layout, heading styles, and container structure
- Replace site-specific text with agent-specific text

### 2. Card Component
- Reuse the `SiteCard` component structure for `AgentCard`
- Maintain the same styling, hover effects, and layout
- Adapt the content to display agent-specific information

### 3. Create Button
- Reuse the `CreateSiteButton` component for creating agents
- Maintain the same styling and positioning
- Update the text and navigation path

### 4. Form Component
- Reuse the form structure from site creation for agent creation
- Maintain the same styling, input fields layout, and validation patterns
- Remove the API key input field and use account-level API keys instead

### 5. Empty State
- Reuse the empty state component from sites
- Maintain the same styling and layout
- Update the text to be agent-specific

## Implementation Steps

1. **Duplicate and Adapt Pages**
   - Copy the sites page structure to agents
   - Update text and references

2. **Fix URL Paths**
   - Remove duplicate "/app" prefix in navigation paths
   - Ensure consistent URL structure

3. **Adapt Form Component**
   - Remove API key input field
   - Add note about using account-level API keys
   - Maintain the same styling and validation

4. **Update Navigation**
   - Ensure proper highlighting of active links
   - Maintain consistent navigation structure

## Components to Delete
- Current `AgentCard` component (replace with adapted `SiteCard`)
- Current `AgentsList` component (replace with adapted `SitesList`)
- Current agent form implementation (replace with adapted site form)

## Testing Strategy
1. Create tests that verify UI consistency between sites and agents pages
2. Ensure all functionality tests still pass with the new implementation
3. Verify that URL paths are correct
4. Confirm that the form no longer includes API key input

## Expected Outcome
- Consistent UI between sites and agents pages
- Proper reuse of existing components and patterns
- Fixed URL paths without duplicate "/app" prefix
- Removal of API key input from agent form
- All tests passing 