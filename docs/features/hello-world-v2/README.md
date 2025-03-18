# HELLO_WORLD_V2 - Model Chats

## Feature Overview

The Hello World V2 feature enables users to securely store API keys, create and manage agents, and interact with them through a chat interface. The implementation emphasizes maximum reuse of existing components from the sites implementation while providing a robust, secure, and user-friendly experience.

## Usage Instructions

### Setting Up API Connections

1. Navigate to the API Keys page through the sidebar
2. Click "Add API Key" button
3. Select a service provider (e.g., OpenAI, Anthropic)
4. Enter your API key and provide a meaningful name
5. Click "Save" to securely store your API key

### Creating an Agent

1. Navigate to the Agents page through the sidebar
2. Click the "Create Agent" button
3. Fill in the following fields:
   - **Name**: A descriptive name for your agent
   - **Description**: The purpose or capabilities of your agent
   - **Model**: Select an AI model for your agent (e.g., GPT-4, Claude)
4. Click "Create" to save your agent

### Chatting with an Agent

1. Navigate to the Agents page
2. Click on the agent card to open the chat interface
3. Type your message in the input field at the bottom
4. Press Enter or click the send button to submit your message
5. The agent will respond based on the AI model and your message

## Limitations and Known Issues

- API keys are stored securely but require proper environment variables for encryption
- Only text-based chat is currently supported; file uploads planned for future release
- Long conversations may experience slight latency with larger models

## Configuration

See the technical documentation for advanced configuration options and developer instructions.

## Related Documentation

- [Feature Design](./feature-design.md)
- [Implementation Progress](./implementation-progress.md) 