# DYNAMIC-AGENT-SELECTION Feature Design

## Overview
The Dynamic Agent Selection feature will replace the current hardcoded model list with a dynamic system that fetches available AI models from each provider. This eliminates issues with outdated model IDs and provides users with up-to-date model options.

## Current Problems
1. Hardcoded model lists become outdated when providers update their models
2. The current implementation has issues with Claude models (using opus as a fallback for sonnet)
3. No way to display model capabilities or filter by them
4. Adding new providers requires updating code in multiple places

## Solution Design

### Architecture

We'll implement a provider-based architecture:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Model Registry │────►│  Model Provider │────►│   API Services  │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    UI Widgets   │     │  Model Cache    │     │ API Connections │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Key Components

1. **Model Provider Interface**: Common interface for all model providers
2. **Provider Implementations**: Implementation for each AI provider (OpenAI, Anthropic)
3. **Model Registry**: Central registry for all providers and models
4. **Model Cache**: Cache fetched models to reduce API calls
5. **UI Components**: Updated UI to display and select from available models

### Database Schema Changes

No database schema changes required, as we'll continue to store the selected model ID as a string.

### API Design

We'll create server actions to fetch available models:

```typescript
// Server action to get available models for a provider
async function getAvailableModels(providerId: string): Promise<AIModel[]>

// Server action to get all available models across providers
async function getAllAvailableModels(): Promise<{[providerId: string]: AIModel[]}>
```

## Implementation Plan

### Phase 1: Core Infrastructure

1. Create model provider interfaces and types
2. Implement provider registry
3. Create initial provider implementations with fallback models
4. Add caching layer for models

### Phase 2: API Integration

1. Integrate with provider APIs to fetch up-to-date model lists
2. Implement error handling and fallbacks
3. Create server actions to expose models to the frontend

### Phase 3: UI Updates

1. Update agent creation/edit forms to use dynamic model selection
2. Add model capability indicators in the UI
3. Handle provider-specific form requirements

## Testing Strategy

### Unit Tests

1. **Provider implementations**:
   - Test model fetching functions
   - Test response parsing
   - Test caching mechanisms
   - Test fallback behavior

2. **Model registry**:
   - Test registration of providers
   - Test retrieval of models
   - Test error handling

### Integration Tests

1. **API integration**:
   - Test actual API calls to providers
   - Test with mock API responses
   - Test error scenarios and rate limiting

2. **UI integration**:
   - Test form behavior with dynamic models
   - Test UI rendering of model lists
   - Test model selection persistence

## Files to Create/Modify

### New Files

1. `lib/model-providers/types.ts` - Type definitions
2. `lib/model-providers/registry.ts` - Provider registry
3. `lib/model-providers/openai-provider.ts` - OpenAI implementation
4. `lib/model-providers/anthropic-provider.ts` - Anthropic implementation
5. `lib/actions/model-actions.ts` - Server actions for model fetching
6. `tests/unit/model-providers/*.unit.test.ts` - Unit tests

### Files to Modify

1. `lib/ai-service.ts` - Update to use provider registry
2. `components/edit-agent-form.tsx` - Update UI for dynamic models
3. `components/create-agent-form.tsx` - Update UI for dynamic models

## Fallback Strategy

If API calls to fetch models fail, we'll use a set of default models for each provider:

1. Default models will be defined in each provider implementation
2. If an API call fails, log the error and return default models
3. Add a cache TTL to retry fetching after a certain period

## Benefits

1. Always up-to-date model lists
2. Easier to add new providers
3. Better user experience with model capabilities display
4. More resilient to API changes

## Limitations

1. Requires API keys to fetch available models
2. May have rate limiting issues with frequent model fetching
3. Need to handle caching carefully to avoid performance issues

## Future Enhancements

1. Client-side caching for improved performance
2. Model filtering by capability
3. Provider-specific configuration options
4. Usage statistics integration 