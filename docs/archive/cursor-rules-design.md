# Cursor Rules for Systematic Automated Development

This document outlines the proposed additions to `.cursorrules` to support systematic automated development. These rules will define the structure, patterns, and conventions for AI-driven development within our project.

## Overview

The cursor rules will be organized into the following sections:

1. **Systematic Development Workflow**: Defines the overall workflow and phases
2. **Artifact Templates**: Provides templates for various development artifacts
3. **Naming Conventions**: Establishes consistent naming patterns
4. **Quality Standards**: Defines quality criteria for each artifact type
5. **Automation Patterns**: Specifies patterns for automated development

## Proposed Rules Structure

```json
{
  "systematicDevelopment": {
    "workflow": {
      "phases": [
        "design",
        "planning",
        "implementation",
        "verification",
        "iteration"
      ],
      "transitions": {
        "design_to_planning": {
          "criteria": [
            "Design document is complete",
            "Architecture is defined",
            "Interfaces are specified",
            "Data model is designed",
            "Validation criteria are established"
          ],
          "artifacts": [
            "design-document.md",
            "architecture-diagram.md",
            "interface-specifications.md",
            "data-model-schema.md"
          ]
        },
        "planning_to_implementation": {
          "criteria": [
            "Tasks are broken down",
            "Tests are planned",
            "Implementation sequence is defined",
            "Dependencies are identified"
          ],
          "artifacts": [
            "task-list.md",
            "test-plan.md",
            "implementation-sequence.md",
            "dependency-graph.md"
          ]
        },
        "implementation_to_verification": {
          "criteria": [
            "Code is implemented",
            "Tests are written",
            "Documentation is updated",
            "Code is refactored"
          ],
          "artifacts": [
            "source-code",
            "tests",
            "documentation",
            "commit-history"
          ]
        },
        "verification_to_iteration": {
          "criteria": [
            "Tests are passing",
            "Code review is complete",
            "Metrics are collected",
            "Feedback is gathered"
          ],
          "artifacts": [
            "test-results.md",
            "review-comments.md",
            "metrics-report.md",
            "feedback-summary.md"
          ]
        },
        "iteration_to_design": {
          "criteria": [
            "Feedback is analyzed",
            "Design improvements are identified",
            "Implementation updates are planned",
            "Process improvements are documented"
          ],
          "artifacts": [
            "updated-design.md",
            "updated-implementation-plan.md",
            "process-improvement-notes.md"
          ]
        }
      }
    },
    "artifactTemplates": {
      "designDocument": {
        "sections": [
          "Overview",
          "Requirements",
          "Architecture",
          "Interfaces",
          "Data Model",
          "Validation Criteria"
        ],
        "format": "markdown",
        "naming": "design-{feature-name}.md",
        "location": "docs/design/"
      },
      "taskList": {
        "format": "markdown",
        "structure": [
          "Task ID",
          "Description",
          "Dependencies",
          "Estimated Effort",
          "Status"
        ],
        "naming": "tasks-{feature-name}.md",
        "location": "docs/tasks/"
      },
      "testPlan": {
        "format": "markdown",
        "structure": [
          "Test ID",
          "Description",
          "Test Type",
          "Test Data",
          "Expected Result"
        ],
        "naming": "test-plan-{feature-name}.md",
        "location": "docs/test-plans/"
      }
    },
    "namingConventions": {
      "features": {
        "pattern": "{category}-{descriptive-name}",
        "examples": [
          "auth-github-integration",
          "ui-agent-dashboard",
          "api-webhook-handler"
        ]
      },
      "tasks": {
        "pattern": "{feature-name}-{task-number}-{descriptive-name}",
        "examples": [
          "auth-github-integration-01-setup-oauth",
          "ui-agent-dashboard-03-implement-metrics-panel"
        ]
      },
      "commits": {
        "pattern": "{type}({scope}): {description}",
        "types": [
          "feat",
          "fix",
          "docs",
          "style",
          "refactor",
          "test",
          "chore"
        ],
        "examples": [
          "feat(auth): implement GitHub OAuth flow",
          "fix(ui): correct alignment in agent dashboard",
          "test(api): add tests for webhook handler"
        ]
      }
    },
    "qualityStandards": {
      "code": {
        "linting": "eslint",
        "formatting": "prettier",
        "testCoverage": "80%",
        "complexity": {
          "maxCyclomaticComplexity": 10,
          "maxCognitiveComplexity": 15
        }
      },
      "documentation": {
        "completeness": [
          "All sections are filled",
          "All requirements are addressed",
          "All interfaces are documented",
          "All data models are described"
        ],
        "clarity": [
          "Language is clear and concise",
          "Technical terms are explained",
          "Examples are provided where appropriate",
          "Diagrams are included for complex concepts"
        ]
      },
      "tests": {
        "coverage": {
          "statements": "80%",
          "branches": "80%",
          "functions": "80%",
          "lines": "80%"
        },
        "types": [
          "Unit tests",
          "Integration tests",
          "End-to-end tests",
          "Performance tests"
        ]
      }
    },
    "automationPatterns": {
      "designGeneration": {
        "inputs": [
          "Feature description",
          "User stories",
          "Constraints",
          "Existing architecture"
        ],
        "outputs": [
          "Design document",
          "Architecture diagram",
          "Interface specifications",
          "Data model schema"
        ],
        "tools": [
          "Cursor AI",
          "OpenHands"
        ]
      },
      "taskBreakdown": {
        "inputs": [
          "Design document",
          "Architecture diagram",
          "Interface specifications",
          "Data model schema"
        ],
        "outputs": [
          "Task list",
          "Test plan",
          "Implementation sequence",
          "Dependency graph"
        ],
        "tools": [
          "Cursor AI",
          "OpenHands"
        ]
      },
      "codeGeneration": {
        "inputs": [
          "Task list",
          "Test plan",
          "Implementation sequence",
          "Dependency graph"
        ],
        "outputs": [
          "Source code",
          "Tests",
          "Documentation"
        ],
        "tools": [
          "Cursor AI",
          "OpenHands"
        ]
      },
      "verification": {
        "inputs": [
          "Source code",
          "Tests",
          "Documentation"
        ],
        "outputs": [
          "Test results",
          "Review comments",
          "Metrics report",
          "Feedback summary"
        ],
        "tools": [
          "Cursor AI",
          "OpenHands",
          "CI/CD pipeline"
        ]
      }
    }
  }
}
```

## Integration with OpenHands

To integrate with OpenHands, we would need to establish the following:

1. **Workflow Definition**: Define the workflow in OpenHands using its workflow definition language
2. **Agent Configuration**: Configure agents in OpenHands to handle each phase of the workflow
3. **Repository Integration**: Connect OpenHands to our repository for code access and manipulation
4. **State Management**: Establish state management in OpenHands to track progress through the workflow
5. **Trigger Configuration**: Configure triggers for initiating and advancing the workflow

Example OpenHands workflow definition (conceptual):

```yaml
name: Systematic Development Workflow
description: Automated workflow for systematic development of features
agents:
  - name: design-agent
    role: Generate and refine design documents
    model: gpt-4
    tools:
      - repository-access
      - document-generation
  - name: planning-agent
    role: Break down designs into tasks and plan implementation
    model: gpt-4
    tools:
      - repository-access
      - task-management
  - name: implementation-agent
    role: Generate code based on design and tasks
    model: gpt-4
    tools:
      - repository-access
      - code-generation
  - name: verification-agent
    role: Verify implementation against requirements and design
    model: gpt-4
    tools:
      - repository-access
      - test-execution
      - code-review
workflow:
  - phase: design
    agent: design-agent
    inputs:
      - feature-description
      - constraints
    outputs:
      - design-document
      - architecture-diagram
    transition:
      to: planning
      when: design-complete
  - phase: planning
    agent: planning-agent
    inputs:
      - design-document
      - architecture-diagram
    outputs:
      - task-list
      - test-plan
    transition:
      to: implementation
      when: planning-complete
  - phase: implementation
    agent: implementation-agent
    inputs:
      - task-list
      - test-plan
    outputs:
      - source-code
      - tests
    transition:
      to: verification
      when: implementation-complete
  - phase: verification
    agent: verification-agent
    inputs:
      - source-code
      - tests
      - design-document
    outputs:
      - test-results
      - review-comments
    transition:
      to: iteration
      when: verification-complete
  - phase: iteration
    agent: design-agent
    inputs:
      - test-results
      - review-comments
    outputs:
      - updated-design-document
    transition:
      to: planning
      when: iteration-complete
```

## Implementation Strategy

The implementation of these cursor rules would follow this strategy:

1. **Start with Templates**: Implement the artifact templates first to establish the structure
2. **Define Naming Conventions**: Implement naming conventions to ensure consistency
3. **Establish Quality Standards**: Implement quality standards to ensure high-quality artifacts
4. **Define Workflow**: Implement the workflow definition to establish the process
5. **Implement Automation Patterns**: Implement automation patterns to enable AI-driven development

## Next Steps

1. **Review and Refine**: Review this design and refine based on feedback
2. **Prototype**: Create a prototype implementation of key aspects
3. **Test with Simple Feature**: Test the approach with a simple feature
4. **Iterate**: Refine based on lessons learned
5. **Full Implementation**: Implement the complete set of cursor rules 