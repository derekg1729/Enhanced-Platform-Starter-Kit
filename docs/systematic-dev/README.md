# Systematic Development Framework

This directory contains the documentation and configuration for our systematic development approach, which enables automated AI-driven development with minimal human intervention.

## Overview

The systematic development framework uses Cursor rules and structured documentation to create a self-sustaining development workflow. The AI reads the project description, follows development rules, works through tasks in the backlog, and updates documentation as it progresses.

## Cursor Rules Visualization

The `.cursorrules` file defines our systematic development workflow. Here's a visual representation of its structure:

```
.cursorrules
├── Project Metadata
│   ├── version: "1.0"
│   ├── project: { name, type, description }
│   └── structure: { frontend, middleware, backend }
│
├── Development Guidelines
│   ├── versionControl: { branchPrefixes, commitStyle }
│   ├── testing: { framework, coverageThreshold, directories }
│   └── codeQuality: { typescript, linting, formatting }
│
├── Dependencies & Configuration
│   ├── node, packageManager, nextjs
│   ├── commonCliTools: { git, vercel, pnpm, drizzle }
│   └── security: { envFiles, apiKeys, auth }
│
├── CI/CD Configuration
│   ├── checks: { tests, coverage, lint, types, build }
│   └── deployment: { platform, environments, domains }
│
├── Best Practices
│   ├── preCommitWorkflow: { steps, enforcement }
│   ├── testDrivenDevelopment: { workflow, warnings }
│   ├── middleware: { principles }
│   ├── multiTenant: { dataIsolation, routing }
│   └── analytics: { googleAnalytics }
│
└── Workflow Rules
    ├── Workflow Transition Decision
    │   └── Assess Current State
    │
    ├── Systematic Development Workflow
    │   ├── Initialize
    │   ├── Select Task
    │   ├── Start Task
    │   ├── Design Solution
    │   ├── Design Validation
    │   ├── Implement Solution
    │   ├── Verify Implementation
    │   ├── Quality Gate
    │   ├── Complete Task
    │   ├── Progress Report
    │   └── Repeat Process
    │
    ├── Bug Resolution Workflow
    │   ├── Select Bug
    │   ├── Start Bug Resolution
    │   ├── Analyze Bug
    │   ├── Design Fix
    │   ├── Implement Fix
    │   ├── Verify Fix
    │   ├── Quality Gate
    │   ├── Complete Bug Resolution
    │   ├── Progress Report
    │   └── Return to Development
    │
    ├── Documentation Update Workflow
    │   ├── Identify Documentation Needs
    │   ├── Update Documentation
    │   ├── Verify Documentation
    │   ├── Quality Gate
    │   ├── Record Documentation Update
    │   ├── Progress Report
    │   └── Return to Development
    │
    └── Error Recovery Workflow
        ├── Identify Error
        ├── Analyze Error
        ├── Determine Recovery Path
        ├── Implement Recovery
        ├── Document Lessons Learned
        └── Return to Previous Workflow
```

### Workflow Diagram

The following diagram illustrates how the different workflows interact:

```
┌─────────────────────────┐
│                         │
│  Workflow Transition    │◄───────────────────────────────────┐
│      Decision           │                                    │
│                         │                                    │
└───────────┬─────────────┘                                    │
            │                                                  │
            ▼                                                  │
┌───────────────────────────┐     ┌───────────────────────┐    │
│                           │     │                       │    │
│  Systematic Development   │     │  Bug Resolution       │    │
│       Workflow            │     │     Workflow          │    │
│                           │     │                       │    │
│ ┌─────────────────────┐   │     │ ┌─────────────────┐   │    │
│ │ Initialize          │   │     │ │ Select Bug      │   │    │
│ └──────────┬──────────┘   │     │ └────────┬────────┘   │    │
│            ▼              │     │          ▼            │    │
│ ┌─────────────────────┐   │     │ ┌─────────────────┐   │    │
│ │ Select Task         │   │     │ │ Start Resolution│   │    │
│ └──────────┬──────────┘   │     │ └────────┬────────┘   │    │
│            ▼              │     │          ▼            │    │
│ ┌─────────────────────┐   │     │ ┌─────────────────┐   │    │
│ │ Start Task          │   │     │ │ Analyze Bug     │   │    │
│ └──────────┬──────────┘   │     │ └────────┬────────┘   │    │
│            ▼              │     │          ▼            │    │
│ ┌─────────────────────┐   │     │ ┌─────────────────┐   │    │
│ │ Design Solution     │   │     │ │ Design Fix      │   │    │
│ └──────────┬──────────┘   │     │ └────────┬────────┘   │    │
│            ▼              │     │          ▼            │    │
│ ┌─────────────────────┐   │     │ ┌─────────────────┐   │    │
│ │ Design Validation   │   │     │ │ Implement Fix   │   │    │
│ └──────────┬──────────┘   │     │ └────────┬────────┘   │    │
│            ▼              │     │          ▼            │    │
│ ┌─────────────────────┐   │     │ ┌─────────────────┐   │    │
│ │ Implement Solution  │   │     │ │ Verify Fix      │   │    │
│ └──────────┬──────────┘   │     │ └────────┬────────┘   │    │
│            ▼              │     │          ▼            │    │
│ ┌─────────────────────┐   │     │ ┌─────────────────┐   │    │
│ │ Verify Implementation│  │     │ │ Quality Gate    │   │    │
│ └──────────┬──────────┘   │     │ └────────┬────────┘   │    │
│            ▼              │     │          ▼            │    │
│ ┌─────────────────────┐   │     │ ┌─────────────────┐   │    │
│ │ Quality Gate        │   │     │ │ Complete Fix    │   │    │
│ └──────────┬──────────┘   │     │ └────────┬────────┘   │    │
│            ▼              │     │          ▼            │    │
│ ┌─────────────────────┐   │     │ ┌─────────────────┐   │    │
│ │ Complete Task       │   │     │ │ Progress Report │   │    │
│ └──────────┬──────────┘   │     │ └────────┬────────┘   │    │
│            ▼              │     │          ▼            │    │
│ ┌─────────────────────┐   │     │ ┌─────────────────┐   │    │
│ │ Progress Report     │   │     │ │ Return to Dev   ├───┼────┘
│ └──────────┬──────────┘   │     │ └─────────────────┘   │
│            ▼              │     │                       │
│ ┌─────────────────────┐   │     └───────────────────────┘
│ │ Repeat Process      ├───┼─────────────┐
│ └─────────────────────┘   │             │
│                           │             │
└───────────────────────────┘             │
                                          │
┌───────────────────────────┐             │
│                           │             │
│  Documentation Update     │             │
│       Workflow            │◄────────────┘
│                           │
│ ┌─────────────────────┐   │
│ │ Identify Needs      │   │
│ └──────────┬──────────┘   │
│            ▼              │
│ ┌─────────────────────┐   │
│ │ Update Documentation│   │
│ └──────────┬──────────┘   │
│            ▼              │
│ ┌─────────────────────┐   │
│ │ Verify Documentation│   │
│ └──────────┬──────────┘   │
│            ▼              │
│ ┌─────────────────────┐   │
│ │ Quality Gate        │   │
│ └──────────┬──────────┘   │
│            ▼              │
│ ┌─────────────────────┐   │
│ │ Record Update       │   │
│ └──────────┬──────────┘   │
│            ▼              │
│ ┌─────────────────────┐   │
│ │ Progress Report     │   │
│ └──────────┬──────────┘   │
│            ▼              │
│ ┌─────────────────────┐   │
│ │ Return to Dev       ├───┼─────────────┐
│ └─────────────────────┘   │             │
│                           │             │
└───────────────────────────┘             │
                                          ▼
┌───────────────────────────┐     ┌───────────────────┐
│                           │     │                   │
│  Error Recovery           │◄────┤  Any Workflow     │
│     Workflow              │     │   (on error)      │
│                           │     │                   │
└───────────────────────────┘     └───────────────────┘
```

### Key Improvements

The Cursor rules have been enhanced with several key improvements:

1. **Workflow Transition Logic**: Added a dedicated "Workflow Transition Decision" step that intelligently determines which workflow to follow based on the current state of the project.

2. **Quality Gates**: Implemented quality gates in each workflow to ensure that work meets quality standards before proceeding.

3. **Progress Reporting**: Added progress reporting steps to summarize accomplishments, lessons learned, and next steps.

4. **Design Validation**: Added a dedicated step for validating designs against requirements and best practices.

5. **Error Recovery**: Implemented a comprehensive error recovery workflow to handle unexpected issues.

6. **Improved Documentation**: Updated documentation references to reflect the consolidated documentation structure.

7. **Explicit Transitions**: Made workflow transitions explicit and conditional based on project state.

## Key Components

### Core Configuration

- [`.cursorrules`](../../.cursorrules) - Defines the automated workflow steps and instructions for the AI

### Essential Documentation

- [Project Description](./project-description.md) - Overview of the project, its goals, architecture, and components
- [Development Rules](./development-rules.md) - Coding standards, quality requirements, and guidelines
- [Backlog](./backlog.md) - Prioritized list of tasks to be completed
- [Solution Design](./solution-design.md) - Current solution architecture and implementation details
- [Bug Tracker](./bug-tracker.md) - List of identified bugs and their status
- [Change Log](./change-log.md) - Record of changes made to the codebase

### Workflow Documentation

- [Workflow](./workflow.md) - Explanation of the systematic development approach and how to use it

## How It Works

1. **Initialization**: The AI reads the project description and development rules to understand the context and constraints.

2. **Task Selection**: The AI selects the highest priority task from the backlog.

3. **Solution Design**: The AI designs a solution for the task and updates the solution design document.

4. **Implementation**: The AI implements the solution according to the design.

5. **Verification**: The AI verifies the implementation against the acceptance criteria and checks for bugs.

6. **Completion**: The AI updates the task status and change log, then moves to the next task.

## Getting Started

To start using the systematic development framework:

1. Ensure the `.cursorrules` file is in the root of your project
2. Make sure all the essential documentation files are in place
3. Start a conversation with Cursor and use the following prompt:

```
Please begin the systematic development workflow for this project. Start by reading the project description and development rules, then work through the tasks in the backlog one by one. Follow the steps defined in the Cursor rules, and keep me updated on your progress.
```

## Customizing the Framework

The framework can be customized by:

- Modifying the steps in the `.cursorrules` file
- Updating the templates and guidelines in the documentation files
- Adding new workflows for specific aspects of your development process

## GitHub Integration

This framework integrates with GitHub through:

- Issue tracking that mirrors the backlog
- Pull requests for completed tasks
- GitHub Actions for automated checks
- Version control for all documentation files 