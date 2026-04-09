---
name: action-items
description: "Generates prioritized, specific, ownable action items from RCA findings — the part of post-mortems that actually prevents the next incident"
allowed-tools: Read Write
metadata:
  author: git-postmortem
  version: "1.0.0"
  category: incident-analysis
  risk_tier: low
---

# Action Items

## Purpose

Post-mortems without action items are just documentation of suffering.
This skill turns every finding into a concrete, prioritized, ownable task
that prevents the next incident.

## Trigger Conditions

- After rca-generator completes
- User says "what do we fix", "action items", "what next"
- Final step in the post-mortem workflow

## Instructions

### Step 1: Map findings to action categories

| Finding Type | Action Category |
|-------------|----------------|
| Config change caused regression | Add config validation to CI/CD |
| Staging didn't reflect production | Fix staging environment parity |
| Alert didn't fire in time | Add/tune monitoring alert |
| No documentation for config values | Document the config |
| Code review missed risky change | Add review checklist item |
| Slow detection time | Improve observability |
| Manual rollback took too long | Automate rollback procedure |
| Single point of failure | Add redundancy |

### Step 2: Generate action items

For each action item, produce:
- **Priority**: P0 (do this week) / P1 (do this sprint) / P2 (backlog)
- **Owner role**: The role responsible (not a person's name)
- **Description**: Specific and measurable — "add X" not "improve Y"
- **Success criteria**: How you know it's done
- **Prevents**: Which part of the incident this prevents

### Step 3: Write to memory

Append action items to `memory/MEMORY.md` so the agent can track recurring themes
across incidents — if the same action item type appears in 3 post-mortems,
flag it as a systemic pattern.

### Step 4: Output format

```markdown
## ✅ Action Items

### 🔴 P0 — Do This Week
- [ ] **[OWNER: DevOps]** Add integration test validating DB connection pool config
  against production latency thresholds before deploy
  *Success: CI fails if connection pool timeout < 10s*
  *Prevents: Config regressions reaching production undetected*

### 🟠 P1 — This Sprint
- [ ] **[OWNER: Platform]** Seed staging database with production-representative
  query patterns and data volumes (anonymized)
  *Success: Staging query p99 within 20% of production p99*
  *Prevents: Staging environment false confidence*

- [ ] **[OWNER: SRE]** Add slow query latency alert (p99 > 5s threshold)
  *Success: Alert fires in staging canary before next deploy*
  *Prevents: 47-minute detection gap*

### 🟡 P2 — Backlog
- [ ] **[OWNER: Engineering]** Document all connection pool config values with
  acceptable ranges, defaults, and production baselines in runbook
  *Success: Runbook has connection pool section with all parameters*
  *Prevents: Future "cleanup" commits breaking undocumented config*

## 📊 Incident Metrics
- **MTTR (Mean Time to Resolve):** 87 minutes
- **MTTD (Mean Time to Detect):** 47 minutes
- **Action items generated:** X
- **Estimated prevention coverage:** P0 action items prevent recurrence of this exact incident
```

## Examples

**RCA finding:** No alert for database connection exhaustion.

**Action item:**
```
🔴 P0 [OWNER: SRE] Add Prometheus alert for DB connection pool utilization > 80%
Success: Alert fires within 2 minutes of pool exhaustion in staging
Prevents: Silent connection pool failures going undetected
```