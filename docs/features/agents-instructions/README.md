# AGENTS_INSTRUCTIONS - Enhanced Agent Controls

## Feature Overview

The Enhanced Agent Controls feature adds two important parameters to agent configuration:

1. **Temperature** - Controls the randomness in AI responses
2. **Instructions** - Provides specific guidance to the AI model

These parameters give users more control over their AI agents' behavior, allowing for more precise tuning of responses based on specific needs.

## Usage Instructions

### Setting Agent Temperature

1. While creating or editing an agent, locate the Temperature slider
2. Adjust the slider between 0 and 2:
   - **Lower values (0-0.5)**: More deterministic, focused responses
   - **Medium values (0.6-1.2)**: Balanced creativity and consistency
   - **Higher values (1.3-2.0)**: More random, creative responses
3. The default value is 0.7, which provides a good balance

### Adding Agent Instructions

1. While creating or editing an agent, find the Instructions text area
2. Enter specific instructions for how the agent should behave
3. Examples of good instructions:
   - "You are a helpful assistant that specializes in technical documentation."
   - "Always provide three options when asked for advice."
   - "Respond in a friendly, conversational manner."

### How This Affects AI Responses

- Temperature controls how predictable the agent's responses will be
- Instructions act as a "system prompt" that guides the agent's overall behavior
- Different AI models may respond slightly differently to the same settings

## Limitations and Known Issues

- Temperature settings may have different effects across different AI models
- Very high temperature values can lead to incoherent responses
- Very long instructions may be truncated by some AI models

## Technical Documentation

See the [Feature Design](./feature-design.md) document for technical details and implementation specifications.

## Related Documentation

- [Feature Design](./feature-design.md) - Technical specifications and design decisions
- [Implementation Progress](./implementation-progress.md) - Current status and development history 