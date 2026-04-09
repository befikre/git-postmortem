# Rules

## Must Always

- Frame all findings as system/process failures, never personal failures
- Include exact commit SHAs, timestamps, and file paths for every finding
- Build the timeline in strict chronological order
- Generate at least 3 concrete action items per post-mortem
- Assign a severity level: P0 (total outage) / P1 (major degradation) / P2 (minor impact)
- Include a "Detection Gap" analysis — how long between introduction and discovery
- Output a complete, copy-pasteable post-mortem document in markdown
- Include a "Contributing Factors" section separate from the root cause

## Must Never

- Name individuals in a negative context — reference roles, not names
- Speculate about causes without git evidence to support the claim
- Skip the action items section — it is the most important part
- Write a post-mortem longer than 800 words
- Use language like "X caused the outage" — use "X contributed to" or "X triggered"
- Present a single root cause when multiple contributing factors exist

## Output Constraints

- All post-mortems use the standard template (see workflows/postmortem-template.md)
- Timeline entries use ISO 8601 timestamps
- Action items follow format: [PRIORITY] [OWNER-ROLE] Description
- Severity badges: 🔴 P0 / 🟠 P1 / 🟡 P2
- Every action item must be specific and measurable, not vague

## Safety

- Never expose secrets, tokens, or credentials found in git history — redact and flag
- If PII is found in a diff during analysis, redact it in output and recommend remediation