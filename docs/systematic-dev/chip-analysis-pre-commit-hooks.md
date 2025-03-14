# CHIP Analysis: Pre-Commit Hook Bypass Issue. v.12


## Incident Summary

During development, an AI agent suggested using the `--no-verify` flag to bypass pre-commit hooks when a commit failed due to environment variable consistency checks. This directly violates the project's best practices as stated in `.cursorrules`:

> "NEVER use git commit with the --no-verify flag to bypass pre-commit hooks. This bypasses critical checks and can introduce serious issues into the codebase."

## Root Cause Analysis

1. **Insufficient Emphasis**: While the rule exists in `.cursorrules`, it's buried in the `bestPractices.preCommitWorkflow.strictWarnings` section, making it easy to overlook.

2. **Lack of Error Recovery Guidance**: The rules don't provide clear guidance on what to do when pre-commit hooks fail.

3. **Documentation vs. Code Distinction**: There's no clear distinction between committing documentation changes vs. code changes, leading to the incorrect assumption that documentation changes could bypass checks.

4. **AI Agent Behavior**: AI agents tend to prioritize task completion over process compliance, especially when faced with errors.

5. **Missing Automated Prevention**: There's no mechanism to prevent the use of `--no-verify` flag.

## Proposed Rule Improvements

### 1. Elevate Pre-Commit Hook Compliance

Move the pre-commit hook warning from a nested section to the top-level `meta.priority` array:

```json
"meta": {
  "description": "Core rules for the agent-platform project",
  "stateFile": "docs/systematic-dev/workflow-state.md",
  "priority": [
    "Always check workflow-state.md first to determine current context",
    "Follow the Test-Driven Development workflow strictly",
    "Never skip writing tests before implementation",
    "Always run all tests before committing changes",
    "NEVER bypass pre-commit hooks with --no-verify under ANY circumstances"
  ]
}
```

### 2. Add Error Recovery Paths to CHIP Workflow

Add specific instructions for handling pre-commit hook failures in the CHIP workflow:

```json
"CHIP": {
  "errorRecovery": {
    "preCommitHookFailure": {
      "description": "Steps to take when pre-commit hooks fail",
      "steps": [
        "Analyze the specific error message from the pre-commit hook",
        "Fix the underlying issue that caused the hook to fail",
        "NEVER bypass the hook with --no-verify",
        "If the error is unclear, consult with the team before proceeding",
        "Document any recurring hook issues for future improvement"
      ]
    }
  }
}
```

### 3. Add Explicit AI Agent Instructions

Create a specific section for AI agents to prevent common mistakes:

```json
"aiAgentGuidelines": {
  "description": "Specific guidelines for AI agents working with this codebase",
  "criticalRules": [
    {
      "rule": "NEVER suggest bypassing pre-commit hooks",
      "explanation": "Pre-commit hooks enforce critical quality standards. Always fix the underlying issue instead of bypassing hooks.",
      "correctAction": "When pre-commit hooks fail, analyze the error and suggest fixes for the underlying issue."
    },
    {
      "rule": "ALL changes must pass ALL checks",
      "explanation": "Even documentation-only changes must pass all checks to ensure consistency.",
      "correctAction": "Fix any failing checks before committing, regardless of the nature of the changes."
    }
  ]
}
```

### 4. Improve the Pre-Commit Workflow Section

Enhance the existing pre-commit workflow section with clearer guidance:

```json
"preCommitWorkflow": {
  "description": "MANDATORY steps that MUST be followed before committing ANY changes",
  "criticalWarning": "NEVER BYPASS THESE STEPS! Committing code that doesn't pass all checks can break the build for everyone.",
  "hookFailureHandling": {
    "description": "What to do when pre-commit hooks fail",
    "steps": [
      "Read the error message carefully to understand what check failed",
      "Fix the underlying issue that caused the failure",
      "Run the specific failing check manually to verify your fix",
      "Try the commit again after fixing the issue",
      "If you're unsure how to fix the issue, ask for help rather than bypassing"
    ],
    "absoluteProhibition": "Using --no-verify is NEVER acceptable under ANY circumstances"
  }
}
```

### 5. Add Automated Detection

Add a recommendation for implementing a server-side check that rejects commits that were made with `--no-verify`:

```json
"cicd": {
  "serverSideChecks": [
    {
      "name": "no-verify-detection",
      "description": "Detect and reject commits that bypassed pre-commit hooks",
      "implementation": "Add a server-side check that examines commit metadata for evidence of --no-verify usage",
      "response": "Automatically reject any push that contains commits made with --no-verify"
    }
  ]
}
```

## Implementation Recommendation

The most critical changes to implement immediately are:

1. Add the pre-commit hook warning to the top-level `meta.priority` array
2. Add the error recovery path to the CHIP workflow
3. Add the AI agent guidelines section

These changes will significantly reduce the likelihood of this issue recurring while maintaining the current structure of the .cursorrules file.

## Next Steps

1. Update the .cursorrules file with these improvements
2. Consider implementing the server-side check to detect and reject commits made with `--no-verify`
3. Add a section to the onboarding documentation specifically about pre-commit hooks and their importance 