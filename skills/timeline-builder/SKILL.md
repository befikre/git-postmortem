---
name: timeline-builder
description: "Reconstructs a precise chronological incident timeline from git commits, deploy events, and user-provided context"
allowed-tools: Bash Read
metadata:
  author: git-postmortem
  version: "1.0.0"
  category: incident-analysis
  risk_tier: low
---

# Timeline Builder

## Purpose

Every post-mortem needs a timeline. This skill builds it automatically from
git history — no manual reconstruction, no "I think it was around 2pm" guessing.

## Trigger Conditions

- After git-forensics identifies the causal commit
- User says "build the timeline", "what happened when"
- Step 2 in the post-mortem workflow

## Instructions

### Step 1: Collect all timeline events

Pull events from git history:

```bash
# All commits in ±24h window around incident
git log --format="%h|%ai|%an|%s" --since="25 hours ago" --until="1 hour ago"

# Tag and release events
git tag -l --sort=-creatordate | head -10
git log --tags --simplify-by-decoration --format="%h|%ai|%D|%s" | head -20

# Any CI/CD markers in commit messages
git log --grep="deploy\|release\|hotfix\|rollback\|revert" --since="48 hours ago" --format="%h|%ai|%s" -i
```

### Step 2: Merge with user-provided events

Ask the user for any events NOT in git:
- "When did you first notice symptoms?"
- "When was an alert fired (if any)?"
- "When did the on-call engineer start investigating?"
- "When was the incident resolved?"

### Step 3: Sort and annotate

Sort all events chronologically. Annotate each with event type:

| Type | Icon | Description |
|------|------|-------------|
| Code change | 📝 | Commit to main/production branch |
| Deploy | 🚀 | Deployment commit or tag |
| Config change | ⚙️ | Env/config file modified |
| Incident start | 🔴 | Symptoms first observed |
| Alert fired | 🚨 | Monitoring alert triggered |
| Investigation | 🔍 | On-call begins investigating |
| Mitigation | 🛠️ | Rollback, hotfix, or workaround applied |
| Resolution | ✅ | Service restored to normal |
| Contributing | ⚠️ | Related change that compounded the issue |

### Step 4: Output the timeline

```markdown
## ⏱️ Incident Timeline

| Time (UTC) | Event | Details |
|------------|-------|---------| 
| 2026-04-09 13:47 | 📝 Code change | `abc1234` — "refactor: update DB connection pool" (db/pool.js) |
| 2026-04-09 13:52 | 🚀 Deploy | Deployed to production via CI/CD |
| 2026-04-09 14:34 | 🔴 Incident start | Users report 500 errors on /users endpoint |
| 2026-04-09 14:41 | 🚨 Alert fired | Error rate alert triggered (threshold: 5%) |
| 2026-04-09 14:43 | 🔍 Investigation | On-call engineer begins investigation |
| 2026-04-09 15:12 | 🛠️ Mitigation | Reverted commit abc1234, deployed fix |
| 2026-04-09 15:19 | ✅ Resolution | Error rate returned to baseline |

**Total incident duration:** 45 minutes
**Time to detection:** 47 minutes after causal deploy
**Time to resolution:** 87 minutes after causal deploy
```

## Examples

**Input:** git-forensics output + "We noticed it around 2:34pm, alert fired at 2:41pm, fixed at 3:19pm"

**Output:** Full timeline table with all git events plus user-provided events merged in chronological order, duration calculations included automatically.