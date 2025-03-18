# Features Documentation

This directory contains documentation for all features of the Agent Platform, organized by feature key.

## Active Features

- [HELLO_WORLD_V2](./hello-world-v2/README.md) - Model Chats: Implementation of agent creation and chat functionality

## Documentation Structure

Each feature directory follows a standard structure:

- `README.md` - Feature overview and usage instructions
- `feature-design.md` - Detailed design specifications
- `implementation-progress.md` - Implementation status and notes

## Feature Templates

The [feature-template](./feature-template/) directory contains standardized templates for creating new feature documentation:

- [README.md template](./feature-template/README.md) - Template for feature overview and usage instructions
- [feature-design.md template](./feature-template/feature-design.md) - Template for technical specifications
- [implementation-progress.md template](./feature-template/implementation-progress.md) - Template for tracking implementation status

## Adding New Features

When adding a new feature:

1. Create a new directory with the feature key: `docs/features/[feature-key]/`
2. Copy the template files from `docs/features/feature-template/` into the new directory
3. Update the feature documentation following the TDD workflow
4. Add the feature to this README file when it is ready for use

## Feature Lifecycle

Features go through the following stages:
1. **DESIGN** - Planning and specifications
2. **PRE_TESTING** - Writing tests
3. **IMPLEMENTATION** - Building the feature
4. **VALIDATION** - Testing and verification
5. **COMPLETION** - Documentation and release
