# git-postmortem

An incident autopilot that reads your git history and writes blameless post-mortems.

It is 2am. Production is down. Someone already found the bad commit and reverted it.
Now everyone needs to write the post-mortem, and nobody wants to. The timeline is
fuzzy, the root cause analysis is shallow ("the config was wrong"), and the action
items are vague ("be more careful"). Three weeks later, the same class of incident
happens again.

git-postmortem fixes this. It reads the git history that already contains all the
evidence -- every commit, every diff, every revert -- and assembles a complete
post-mortem document in seconds. Forensics, timeline, root cause analysis with
5 Whys driven to the systemic level, and prioritized action items with owners
and success criteria. Blameless by design.

## The problem it solves

Post-mortems are painful because they require reconstructing what happened from
memory while the incident is still fresh and everyone is tired. But git already
recorded exactly what happened: what changed, when, in what order, and what got
reverted. All the forensic evidence is sitting in the commit log. This agent
reads it and does the reconstruction automatically.

The hard part of a post-mortem is not the timeline -- it is driving the root cause
analysis past "the config was wrong" to "we have no process for validating config
changes against production baselines." This agent applies the 5 Whys methodology
systematically, starting from git evidence and driving to systemic causes. Then
it generates action items that are specific, measurable, and assigned to roles.

## How it works

Four skills run in sequence:

1. git-forensics examines the commit history around the incident window, identifies
   the causal commit using heuristics (timing, affected files, reverts), and produces
   a structured findings report.

2. timeline-builder pulls all commits from the window, merges them with user-provided
   events (when the alert fired, when someone started investigating), and outputs
   a chronological timeline table.

3. rca-generator takes the forensics findings and applies 5 Whys -- starting from
   the technical symptom and driving through the causal chain to the systemic root
   cause. It separates root cause from contributing factors.

4. action-items maps each finding to a concrete action with priority (P0/P1/P2),
   owner role, success criteria, and what part of the incident it prevents.

The final output is a complete post-mortem document in markdown, ready to paste
into your incident tracker.

## Prerequisites

Before running this agent you need three things:

Node.js installed on your machine. Download from https://nodejs.org

gitclaw installed globally:

```bash
npm install -g gitclaw
```

A free Google Gemini API key. Get one at https://aistudio.google.com/apikey

Once you have your key, set it in your terminal before running the agent.

On Windows:
```bash
set GEMINI_API_KEY=your_key_here
```

On Mac or Linux:
```bash
export GEMINI_API_KEY=your_key_here
```

## Quick start

```bash
# Clone the repository
git clone https://github.com/befikre/git-postmortem.git
cd git-postmortem

# Validate the agent definition
npx @open-gitagent/gitagent validate

# Set your Gemini API key (Windows)
set GEMINI_API_KEY=your_key_here

# Set your Gemini API key (Mac/Linux)
export GEMINI_API_KEY=your_key_here

# Go into the demo repo and run the agent
cd demo-repo
gitclaw --dir ../ "Production incident. The /users API was returning 500 errors for 45 minutes. It started about 30 minutes after the last deploy. Generate a full post-mortem."
```

## Install as npm package

You can also install git-postmortem as a global CLI tool:

```bash
npm install -g gitpm-agent
```

Then use it inside any git repository:

```bash
cd your-project
set GEMINI_API_KEY=your_key_here
git-pm "Describe your incident here"
```

npm package: https://www.npmjs.com/package/gitpm-agent

## Project structure git-postmortem/
├── agent.yaml                          # Agent manifest (gitagent spec 0.1.0)
├── SOUL.md                             # Agent personality and identity
├── RULES.md                            # Hard constraints and boundaries
├── AGENTS.md                           # Fallback instructions for other tools
├── README.md                           # This file
├── index.js                            # CLI entry point for npm package
├── package.json                        # npm package configuration
├── .gitignore
├── skills/
│   ├── git-forensics/SKILL.md          # Finds the causal commit
│   ├── timeline-builder/SKILL.md       # Builds the incident timeline
│   ├── rca-generator/SKILL.md          # 5 Whys root cause analysis
│   └── action-items/SKILL.md           # Generates prioritized action items
├── workflows/
│   ├── postmortem.yaml                 # Full pipeline definition
│   └── postmortem-template.md          # Blank post-mortem template
├── memory/
│   └── MEMORY.md                       # Cross-incident pattern tracking
├── config/
│   └── default.yaml                    # Default configuration
└── demo-repo/                          # Example repo with fake incident
├── README.md
├── src/
│   ├── server.js
│   ├── db.js
│   ├── cache.js
│   └── middleware.js
└── config/
└── database.yaml

## Skills

| Skill | Description |
|-------|-------------|
| git-forensics | Finds the causal commit by analyzing git log, diff, and blame in the incident window |
| timeline-builder | Reconstructs a chronological timeline from git history and user-provided events |
| rca-generator | Applies 5 Whys root cause analysis from forensics findings to systemic causes |
| action-items | Generates prioritized P0/P1/P2 action items with owners and success criteria |

## Demo scenario

The demo-repo folder contains a realistic production incident baked into the git
history. A performance commit silently reduced the database connection pool timeout
from 30 seconds to 3 seconds and dropped max connections from 20 to 5. It looked
like an optimization. It caused 500 errors for 45 minutes before the team found
and reverted it.

Run the agent against it and watch it find the bad commit, build the timeline,
trace the root cause through 5 Whys, and generate the action items automatically.

## Built with

Built on the gitagent open standard (https://github.com/open-gitagent/gitagent)
and runs with gitclaw. Uses Google Gemini 1.5 Pro as the AI model.
