# AI Service Integration Technical Implementation Plan

## Overview
This document outlines the technical implementation plan for replacing the mock AI responses with real AI model integrations. The implementation will follow a service-based architecture to abstract different AI providers (OpenAI and Anthropic) behind a common interface, allowing for easy substitution and future expansion.

## Files to Update/Create

### 1. Core Service Implementation

#### lib/ai-service.ts (NEW)
- Define the `AIService` interface for all AI providers
- Implement provider-specific classes (`OpenAIService`, `AnthropicService`) 
- Create a factory function to instantiate the appropriate service based on model ID
- Handle API key decryption and error cases

#### lib/actions.ts (UPDATE)
- Modify the `sendMessage` function to use the AI service
- Replace the mock response with actual AI model integration
- Add error handling for API failures
- Ensure proper decryption of API keys

### 2. API Service Implementation Files

#### lib/openai-service.ts (NEW)
- Implement OpenAI-specific API interactions
- Handle OpenAI model formats and parameters
- Process responses into a consistent format
- Implement error handling for OpenAI-specific errors

#### lib/anthropic-service.ts (NEW)
- Implement Anthropic-specific API interactions
- Handle Anthropic model formats and parameters
- Process responses into a consistent format
- Implement error handling for Anthropic-specific errors

### 3. Update Dependencies

#### package.json (UPDATE)
- Add OpenAI SDK dependency (`openai`)
- Add Anthropic SDK dependency (`@anthropic-ai/sdk`)

## Work Summary for Each File

### lib/ai-service.ts
This file will serve as the core abstraction for AI services. It will:
- Define the `AIService` interface with a `generateChatResponse` method
- Create a factory function that returns the appropriate service based on the model ID
- Implement provider mapping logic (model ID → provider)
- Handle common error cases and response formatting

### lib/actions.ts
The existing `sendMessage` function will be updated to:
- Get the appropriate API connection based on the agent's model
- Decrypt the API key
- Create an instance of the appropriate AI service
- Call the service to generate a response
- Format and return the response
- Handle errors gracefully

### lib/openai-service.ts
This file will implement the OpenAI-specific service:
- Initialize the OpenAI client with the decrypted API key
- Format messages according to OpenAI's API requirements
- Call the OpenAI API to generate responses
- Handle OpenAI-specific errors and rate limits
- Convert OpenAI responses to the common format

### lib/anthropic-service.ts
This file will implement the Anthropic-specific service:
- Initialize the Anthropic client with the decrypted API key
- Format messages according to Anthropic's API requirements
- Call the Anthropic API to generate responses
- Handle Anthropic-specific errors and rate limits
- Convert Anthropic responses to the common format

### package.json
Update the dependencies to include:
- `openai` for the OpenAI API
- `@anthropic-ai/sdk` for the Anthropic API

## Required Tests

### 1. AI Service Interface Tests
- **File**: `tests/unit/ai-service.unit.test.ts`
- **Coverage**:
  - Test the factory function creates the correct service for different model IDs
  - Verify error handling for unsupported models
  - Test service interface conformance

### 2. OpenAI Service Tests
- **File**: `tests/unit/openai-service.unit.test.ts`
- **Coverage**:
  - Test initialization with API key
  - Test message formatting
  - Test response handling
  - Test error handling and retries
  - Mock API responses to avoid actual API calls

### 3. Anthropic Service Tests
- **File**: `tests/unit/anthropic-service.unit.test.ts`
- **Coverage**:
  - Test initialization with API key
  - Test message formatting
  - Test response handling
  - Test error handling and retries
  - Mock API responses to avoid actual API calls

### 4. SendMessage Action Tests
- **File**: `tests/unit/actions.unit.test.ts` (update)
- **Coverage**:
  - Test getting the appropriate API connection
  - Test handling missing API keys
  - Test service creation and response handling
  - Test error handling for various failure scenarios
  - Mock API services to avoid actual API calls

### 5. Integration Tests
- **File**: `tests/integration/ai-integration.integration.test.ts`
- **Coverage**:
  - Test end-to-end flow from user input to AI response
  - Verify correct model selection based on agent configuration
  - Test handling of API key retrieval and decryption
  - Mock API responses to avoid actual API calls

## Components at Risk of Regression

### 1. ChatInterface Component
- **Risk**: High
- **Reason**: The chat interface relies on the `sendMessage` function, which will be significantly modified.
- **Mitigation**: Ensure comprehensive tests for the chat interface with mocked AI services.
- **Test File**: `tests/unit/components/chat-interface.unit.test.tsx`

### 2. useChat Hook
- **Risk**: High
- **Reason**: The hook directly calls the `sendMessage` function and handles its responses.
- **Mitigation**: Update tests to verify correct handling of real API responses and errors.
- **Test File**: `tests/unit/hooks/use-chat.unit.test.tsx`

### 3. API Key Management
- **Risk**: Medium
- **Reason**: The implementation will need to retrieve and decrypt API keys.
- **Mitigation**: Verify API key retrieval and decryption works correctly.
- **Test File**: `tests/unit/api-connections.unit.test.ts`

### 4. Agent Configuration Forms
- **Risk**: Low
- **Reason**: The agent configuration forms might need updates to support additional model parameters.
- **Mitigation**: Verify forms handle all required model parameters correctly.
- **Test File**: `tests/unit/components/agent-form.unit.test.tsx`

## Implementation Strategy

The implementation will follow these steps:

1. Create the core AI service interface and factory function
2. Implement the OpenAI service
3. Implement the Anthropic service
4. Update the `sendMessage` function to use the AI service
5. Add comprehensive error handling
6. Update tests to verify correct functionality

Each step will follow the Test-Driven Development (TDD) approach:
1. Write failing tests for the functionality
2. Implement the minimal code to make the tests pass
3. Refactor as needed while keeping tests passing

## Security Considerations

1. API keys are sensitive and must be properly encrypted/decrypted
2. Avoid logging API keys in error messages or logs
3. Implement timeouts for API calls to prevent hanging requests
4. Validate user permissions before making API calls
5. Sanitize user inputs before sending to AI models

## Future Improvements

1. Add streaming support for real-time responses
2. Support more AI providers (Cohere, Mistral, etc.)
3. Add caching to reduce API costs
4. Implement retries for transient errors
5. Add monitoring for API usage and costs 