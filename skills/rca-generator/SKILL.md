---
name: rca-generator
description: "Generates a structured Root Cause Analysis using the 5 Whys methodology, based on git forensics findings"
allowed-tools: Read
metadata:
  author: git-postmortem
  version: "1.0.0"
  category: incident-analysis
  risk_tier: low
---

# RCA Generator

## Purpose

Root cause analysis is where post-mortems usually go wrong — teams stop at
the first "why" and call it done. This skill drives the full 5 Whys chain
from the causal commit all the way to the systemic root cause.

## Trigger Conditions

- After git-forensics and timeline-builder have run
- User says "what was the root cause", "why did this happen", "do the RCA"
- Step 3 in the post-mortem workflow

## Instructions

### Step 1: Start from the symptom

State the observable symptom clearly:
"Users received 500 errors on the /users API endpoint"

### Step 2: Apply 5 Whys

Drive down the causal chain. Each "why" should be answerable from git evidence:

```
Why 1: Why did users get 500 errors?
→ The database query timed out

Why 2: Why did the database query time out?
→ The connection pool timeout was changed from 30s to 3s in commit abc1234

Why 3: Why was the timeout changed to 3s?
→ A refactor intended to "improve performance" changed the config without
  understanding the production query latency profile

Why 4: Why wasn't this caught before deploy?
→ The staging environment uses a smaller dataset; queries that take 8s in
  production complete in <1s in staging

Why 5: Why does staging not reflect production query latency?
→ No process exists to validate config changes against production baselines
  before deploying to production
```

**Root Cause:** Missing process for validating config changes against production performance baselines before deploy.

### Step 3: Identify contributing factors

Factors that made the incident worse but weren't the root cause:

- **Monitoring gap**: No alert for slow query latency (only error rate)
- **Documentation gap**: Connection pool config values were undocumented
- **Review gap**: Config change was in a large refactor PR, easy to miss

### Step 4: Output the RCA section

```markdown
## 🔎 Root Cause Analysis

### Symptom
[Observable impact on users]

### Causal Chain (5 Whys)
1. **Why did [symptom] occur?**
   → [Answer with git evidence: commit SHA, file, line]

2. **Why did [answer 1] happen?**
   → [Answer with git evidence]

3. **Why did [answer 2] happen?**
   → [Answer — may leave git evidence territory here]

4. **Why wasn't this caught earlier?**
   → [Process/tooling gap]

5. **Why does that gap exist?**
   → [Systemic root cause]

### Root Cause
> [One clear sentence stating the systemic root cause]

### Contributing Factors
- **[Factor type]**: [Description]
- **[Factor type]**: [Description]
```

## Examples

**Causal commit:** Changed nginx worker_processes from `auto` to `1` in a "cleanup" commit.

**RCA output:** 5 Whys chain from "requests queued" → "single worker" → "config cleanup misunderstood auto" → "no config change review checklist" → "ops runbook not updated since team grew". Root cause: Ops runbook and config documentation not maintained as team scaled.