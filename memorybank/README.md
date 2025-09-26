# Memory Bank System

This directory contains all prompt engineering tasks and their associated metadata and progress.

## Directory Structure

```
memorybank/
├── tasks/                  # Individual task files (JSON)
│   └── task_<timestamp>.json
├── progress/               # Progress logs for each task
│   └── progress_<timestamp>.md
├── parse_errors.log        # Log of any JSON parsing errors
└── README.md               # This file
```

## Task File Format

Each task is stored as a JSON file with the following structure:

```json
{
  "id": "task_<timestamp>",
  "timestamp": "ISO-8601 timestamp",
  "status": "pending|in-progress|completed|failed",
  "title": "Task title",
  "description": "Task description",
  "styles": {
    "primary": "primary style id",
    "modifier": "modifier style id or null"
  },
  "clarifyingQuestions": [
    {
      "question": "Question text",
      "answer": "User's answer"
    }
  ],
  "progress": [
    "Log entry 1",
    "Log entry 2"
  ],
  "error": "Error message if status is failed"
}
```

## Progress Tracking

Each task has an associated progress markdown file that logs all actions:

```markdown
# Progress Log for Task: <task_id>

## [timestamp] Task started

## [timestamp] Added clarifying question: What is the primary goal?

## [timestamp] Style set: Primary=instruction

## [timestamp] Task completed successfully
```

## Usage

1. Create a new task using the `PromptWorkflow` class
2. The system will automatically create and manage the necessary files
3. All progress is logged and versioned
4. Tasks can be reviewed or continued at any time using their task ID

## Error Handling

- Invalid JSON is logged to `parse_errors.log`
- Failed tasks include error details in their metadata
- All file operations are synchronous to prevent race conditions
