# Demo Repository — Fake Production Incident

This is a demo repository with a simulated production incident baked into the
git history. It exists so judges can see git-postmortem in action without
needing a real production outage.

## The Scenario

A small Express.js API serves user data from a PostgreSQL database. The git
history contains 5 commits that tell the story of a production incident:

1. **Initial commit** — sets up the Express server with a database connection
   pool. Connection timeout is 30000ms, max connections is 20. Everything works.

2. **Cache feature** — adds an in-memory cache for user queries. Unrelated to
   the incident but shows normal development activity.

3. **The bad commit** — someone "tightens" the DB connection pool settings to
   "improve resource utilization." Connection timeout drops from 30000ms to
   3000ms. Max connections drops from 20 to 5. In staging this works fine
   because the dataset is small. In production, queries that take 8 seconds
   start timing out. Users get 500 errors.

4. **Red herring** — an unrelated middleware commit adds response time headers.
   This is noise that the agent should correctly ignore.

5. **The revert** — someone notices the 500s, traces it back to the config
   change, and reverts commit 3. Production recovers.

## Running the Demo

From this directory, run:

```bash
npx @anthropic-ai/gitclaw "Production users are getting 500 errors on the /users API endpoint. It started about 30 minutes after the last deploy."
```

The agent will:
- Read the git log and find the bad commit (commit 3)
- Notice it was already reverted (commit 5)
- Build a timeline of all 5 commits
- Run 5 Whys analysis
- Generate action items to prevent recurrence

## Expected Output

A complete post-mortem identifying the connection pool config change as the
causal commit, with a root cause analysis that drives past "the timeout was
too low" to "no process exists for validating config changes against
production performance baselines."
