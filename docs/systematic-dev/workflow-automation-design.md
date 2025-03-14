# Workflow State Automation Design

## Current System Evaluation

### Strengths
- Clear 1:1 mapping between workflow-state.md and .cursorrules
- Well-structured workflow stages with explicit transitions
- Detailed instructions for each stage

### Critical Concerns

1. **AI Agent Consistency Problem**
   - No enforcement mechanism to ensure AI agents update workflow-state.md
   - AI agents have not been consistently updating it during sessions
   - The system relies on voluntary compliance rather than built-in constraints

2. **Operational Friction**
   - The workflow requires manual updates to workflow-state.md at each stage transition
   - This creates points of failure where the state could become out of sync with reality
   - No verification mechanism exists to confirm state accuracy

3. **Cognitive Overhead**
   - The large .cursorrules file creates significant cognitive load
   - AI agents must process the entire file to understand the current context
   - This reduces efficiency and increases the chance of errors

4. **Missing Automation**
   - No automated checks or hooks to enforce workflow-state.md updates
   - No tooling to validate that the workflow state matches the actual project state

## Why AI Agents May Fail to Update workflow-state.md

1. **Context Window Limitations**
   - AI agents have limited context windows and may prioritize task completion over process compliance
   - As the conversation progresses, earlier instructions about updating workflow-state.md may fall out of context

2. **Instruction Prioritization**
   - AI agents tend to prioritize explicit user requests over implicit process requirements
   - Without direct user prompting, workflow state updates may be overlooked

3. **Lack of Consequences**
   - There are no immediate consequences for failing to update workflow-state.md
   - Without feedback loops, AI agents won't learn to prioritize this action

4. **No Verification Mechanism**
   - Nothing checks if workflow-state.md is accurate or up-to-date
   - Without verification, drift between stated and actual state is inevitable

## Automation Approaches

### 1. Cursor Extensions or Plugins

**Approach**: Create a Cursor extension that monitors and updates workflow-state.md

**Implementation Options**:
- Check if Cursor has an extension API (similar to VS Code)
- If available, create an extension that:
  - Monitors file changes
  - Detects workflow stage transitions
  - Updates workflow-state.md automatically

**Feasibility**: This depends on whether Cursor supports extensions. As Cursor is built on Electron (like VS Code), it might have extension capabilities, but this would require research.

### 2. Git Hooks (Simplest Approach)

**Approach**: Use Git hooks to enforce workflow state validation

**Implementation**:
```bash
#!/bin/bash

# Check if workflow-state.md is being modified in this commit
if git diff --cached --name-only | grep -q "docs/systematic-dev/workflow-state.md"; then
  echo "✅ workflow-state.md is being updated in this commit"
else
  # Check if we're modifying code files but not workflow-state.md
  if git diff --cached --name-only | grep -q "\.tsx\|\.ts\|\.js\|\.jsx"; then
    echo "⚠️ Warning: You're changing code files but not updating workflow-state.md"
    echo "Please update docs/systematic-dev/workflow-state.md to reflect the current workflow stage"
    exit 1
  fi
fi
```

### 3. Cursor-Integrated CLI Tool

**Approach**: Create a simple CLI tool that can be run from Cursor's terminal

**Implementation**: A Node.js script that can:
- Show current workflow state
- Update specific workflow state keys
- Automatically advance to the next stage based on .cursorrules
- Validate workflow state consistency

### 4. AI Agent Prompt Template

**Approach**: Create a standardized prompt template that reminds AI agents to update workflow-state.md

**Implementation**:
```markdown
# AI Agent Instructions

Before responding to this request, please:

1. Check docs/systematic-dev/workflow-state.md to identify the current workflow state
2. Determine if your response will advance the workflow to a new stage
3. If yes, update workflow-state.md according to the rules in .cursorrules

Current workflow state:
- WORKFLOW_KEY: [Check workflow-state.md]
- STAGE_KEY: [Check workflow-state.md]
- FEATURE_KEY: [Check workflow-state.md]

After completing your task, confirm whether you've updated workflow-state.md or explain why no update was needed.

Now, please proceed with the following request:

[YOUR REQUEST HERE]
```

## Recommended Combined Solution

For the most effective automation while staying within Cursor:

1. **Create the CLI Tool** for easy workflow state updates
2. **Implement Git Hooks** to enforce workflow state updates
3. **Use the AI Prompt Template** to remind AI agents

This combination provides:
- Easy manual updates via CLI
- Enforcement via Git hooks
- Clear instructions for AI agents

## Implementation Plan

### Phase 1: Basic Automation
- Implement Git hooks for basic enforcement
- Create AI prompt template
- Document the process

### Phase 2: CLI Tool Development
- Develop the workflow state management CLI tool
- Add validation capabilities
- Integrate with Git hooks

### Phase 3: Advanced Features
- Research Cursor extension possibilities
- Consider integrating with project management tools
- Add reporting and analytics on workflow compliance

## Next Steps

1. Implement the Git hooks solution as a quick win
2. Create and document the AI prompt template
3. Begin development of the CLI tool
4. Update .cursorrules to reference the automation tools

## Future Considerations

- Consider splitting .cursorrules into smaller, more focused files
- Add error recovery paths to the workflow
- Implement feature-specific context in workflow state updates
- Create a dashboard for visualizing workflow state and compliance 