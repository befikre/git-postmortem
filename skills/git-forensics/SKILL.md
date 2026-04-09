---
name: git-forensics
description: "Excavates git history around an incident window to identify the causal commit, deploy, or config change that triggered the event"
allowed-tools: Bash Read
metadata:
  author: git-postmortem
  version: "1.0.0"
  category: incident-analysis
  risk_tier: low
---

# Git Forensics

## Purpose

Find the commit (or commits) that caused the incident. Not what changed recently —
what changed *causally*. There is a difference, and this skill finds it.

## Trigger Conditions

- User describes an incident with a rough time window
- User says "what broke?", "find the bad commit", "what changed before the outage"
- First step in every post-mortem workflow

## Instructions

### Step 1: Establish the incident window

Extract from user input:
- **Incident start time** (when symptoms first appeared)
- **Incident end time** (when resolved, or "ongoing")
- **Affected component** (service name, file path, API endpoint, feature)

If time window is missing, ask: "Roughly when did the incident start? (e.g., '2 hours ago' or '2026-04-09 14:00 UTC')"

### Step 2: Run git forensics commands

Execute these in sequence:

```bash
# 1. Find all commits in the incident window (adjust --since/--until to match)
git log --oneline --since="2 hours ago" --format="%h %ai %an %s"

# 2. Find commits touching the affected component
git log --oneline --follow -- <affected-file-or-dir> | head -20

# 3. Show what changed in suspicious commits
git show <commit-sha> --stat
git diff <commit-sha>~1 <commit-sha>

# 4. Check for recently merged PRs or rebases
git log --oneline --merges --since="24 hours ago"

# 5. Find any config or dependency changes
git log --oneline --since="48 hours ago" -- "*.json" "*.yaml" "*.env*" "requirements.txt" "package.json"

# 6. Check for recently reverted commits (they signal the team already found it)
git log --oneline --grep="revert" --since="24 hours ago" -i
```

### Step 3: Identify the causal commit

Apply these heuristics to narrow down:

| Signal | Weight |
|--------|--------|
| Commit timestamp just before incident start | High |
| Touches the affected component directly | High |
| Dependency version bump | High |
| Config or environment variable change | High |
| Large diff (100+ lines changed) | Medium |
| Multiple files changed in one commit | Medium |
| Commit message says "quick fix" or "hotfix" | Medium |
| Already reverted | Confirmed causal |

### Step 4: Output structured findings

```
## 🔍 Forensics Results

**Incident Window:** [start] → [end]
**Commits analyzed:** X commits in window

### Causal Commit(s)
| SHA | Time | Author Role | Message | Files Changed |
|-----|------|-------------|---------|---------------|
| abc1234 | 2026-04-09 13:47 UTC | Backend Engineer | "refactor: update DB connection pool" | db/pool.js, config/db.yaml |

### Diff Summary
[Key lines from the causal diff — the specific change that triggered the incident]

### Contributing Commits
[Other changes in the window that may have compounded the issue]

### Detection Gap
Time between causal commit and incident detection: **47 minutes**
```

## Examples

**Input:** "API started returning 500s around 2pm today, affects /users endpoint"

**Output:** Agent runs git log for commits between 12pm-2pm touching routes/users* or middleware, finds a commit that changed database query timeout from 30s to 3s, flags it as causal, notes the config change in db.yaml as contributing factor.