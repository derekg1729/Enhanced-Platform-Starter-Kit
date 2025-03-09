# Instructions for Using the Systematic Development Framework

This document provides instructions for using the systematic development framework to implement the Agent Platform.

## Quick Start

To begin using the systematic development framework:

1. Start a conversation with Cursor and use the following prompt:

```
Please begin the systematic development workflow for this project. Start by reading the project description and development rules, then work through the tasks in the backlog one by one. Follow the steps defined in the Cursor rules, and keep me updated on your progress.
```

2. Cursor will follow the workflow defined in the `.cursorrules` file, which includes:
   - Reading the project description and development rules
   - Selecting tasks from the backlog
   - Designing and implementing solutions
   - Verifying implementations against acceptance criteria
   - Updating documentation as it progresses

3. Monitor Cursor's progress and provide feedback as needed.

## When to Intervene

While the workflow is designed to be autonomous, you may need to intervene in the following situations:

1. **Clarification Needed**: If Cursor asks for clarification about requirements or implementation details.
2. **Decision Points**: If Cursor presents multiple options and needs guidance on which to choose.
3. **Review Requested**: If Cursor asks for review of a design or implementation.
4. **Blockers**: If Cursor encounters an issue it cannot resolve on its own.
5. **Prioritization**: If you want to change the priority of tasks in the backlog.

## How to Provide Feedback

When providing feedback to Cursor:

1. **Be Specific**: Clearly identify what aspects you're providing feedback on.
2. **Provide Context**: Explain the reasoning behind your feedback.
3. **Suggest Alternatives**: If rejecting a proposal, suggest alternatives if possible.
4. **Set Clear Expectations**: Clearly state what changes you expect to see.

## Common Commands

Here are some common commands you can use to guide Cursor:

- **Continue with the workflow**: "Please continue with the systematic development workflow."
- **Focus on a specific task**: "Please focus on implementing [TASK-XXX]."
- **Review a design**: "Please review the design for [TASK-XXX] and make any necessary improvements."
- **Prioritize a task**: "Please prioritize [TASK-XXX] as it's critical for the next milestone."
- **Fix a bug**: "Please address the bug [BUG-XXX] before continuing with new tasks."
- **Update documentation**: "Please update the documentation to reflect the recent changes."

## Troubleshooting

If you encounter issues with the workflow:

1. **Check Documentation**: Ensure all required documentation files are in place and properly formatted.
2. **Verify Cursor Rules**: Check that the `.cursorrules` file is correctly configured.
3. **Restart Conversation**: If Cursor seems confused, start a new conversation and provide clear instructions.
4. **Simplify Tasks**: Break down complex tasks into smaller, more manageable ones.
5. **Provide Examples**: If Cursor is struggling with a particular task, provide examples or references.

## Next Steps

After the initial setup and workflow implementation:

1. **Review Progress**: Regularly review the progress made by Cursor.
2. **Update Backlog**: Add new tasks to the backlog as needed.
3. **Refine Process**: Adjust the workflow based on what works well and what doesn't.
4. **Expand Scope**: Once basic functionality is implemented, expand to more complex features. 