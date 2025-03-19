# AGENTS_INSTRUCTIONS - Feature Design

## Overview

This feature adds two new parameters to agents:
- **Temperature**: A float value (0-2) to control randomness in AI responses
- **Instructions**: Text that provides guidance to the AI model

These parameters will be used when making API calls to AI models (OpenAI, Anthropic), following each library's implementation specifications.

## Technical Design

### Database Schema Changes

```typescript
// Add to agents table
temperature: real('temperature').notNull().default(0.7),
instructions: text('instructions'),
```

### Components to Modify

| Component | Description | Changes Needed |
|-----------|-------------|---------------|
| Agent Form | Create/edit agent form | Add temperature slider and instructions textarea |
| Agent Display | Agent details page | Display temperature and instructions |
| AI Service | API call implementation | Include temperature and instructions in API calls |

### Implementation Strategy

#### Minimal Code Changes Approach

1. Update database schema
2. Extend form UI components 
3. Update AI service to include new parameters in API calls

### Files to Modify

| File Path | Changes Needed | Impact |
|-----------|---------------|--------|
| `lib/schema.ts` | Add temperature and instructions to agent schema | Schema changes require migration |
| `components/agent-form.tsx` | Add UI controls for temperature and instructions | Affects create/edit agent experience |
| `lib/actions.ts` | Pass temperature and instructions to AI service | Affects how API calls are made |
| `lib/ai-service.ts` | Include temperature and instructions in API calls | Affects AI model responses |
| `app/app/(dashboard)/agents/[id]/edit/page.tsx` | Update edit page to support new fields | Affects agent editing |
| `app/app/(dashboard)/agents/[id]/page.tsx` | Display temperature and instructions | Affects agent details view |

### Migration Strategy

We'll need a migration to add the new columns to the agents table. The migration will add:
- A `temperature` column with a default value of 0.7
- An `instructions` column that allows NULL values

### API Integration

#### OpenAI Integration
```typescript
// Example implementation
const response = await openai.chat.completions.create({
  model: agent.model,
  messages: messages,
  temperature: agent.temperature,
  instructions: agent.instructions, // Will be mapped to system message
});
```

#### Anthropic Integration
```typescript
// Example implementation
const response = await anthropic.messages.create({
  model: agent.model,
  messages: messages,
  temperature: agent.temperature,
  system: agent.instructions, // Anthropic uses "system" parameter
});
```

## Test Strategy

### Unit Tests
- Test form validation for temperature (range 0-2)
- Test that temperature and instructions are saved correctly
- Test API service integration to ensure parameters are passed correctly

### Integration Tests
- Verify schema changes with database
- Test end-to-end flow of setting values and seeing them in API calls

## UI/UX Design

### Agent Form Updates
- Add temperature slider with range 0-2, step 0.1, default 0.7
- Add instructions textarea with placeholder text
- Add tooltips explaining each parameter

### Agent View Updates
- Add temperature and instructions to agent details page
- Show temperature as both numeric value and visual indicator

## Risk Assessment

- **Low Risk**: Changes are contained to agent functionality
- **Medium Risk**: Existing agents will need default values for new fields 