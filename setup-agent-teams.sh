#!/bin/bash

# Enable the experimental Claude Code Agent Teams feature
export CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS=1

# Or add to your settings.json under "env":
# { "env": { "CLAUDE_CODE_EXPERIMENTAL_AGENT_TEAMS": "1" } }

# Then in Claude Code, just ask naturally:
# "Create a team to review this PR — one for security, one for performance, one for test coverage."

echo "Claude Code Agent Teams feature enabled!"
echo "You can now use agent teams in Claude Code."
