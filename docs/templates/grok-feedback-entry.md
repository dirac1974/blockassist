# grok_feedback.md Entry Template

Required after **every commit**, per `CLAUDE.md`. Append at the top of `grok_feedback.md` (above the Template section). Use the literal headings below.

```markdown
## YYYY-MM-DD — <TASK-ID>

**Commit SHA**: <full SHA>
**Date**: YYYY-MM-DD
**Agent**: <role from AGENTS.md, e.g. "Claude (Security Lead)">
**Task ID**: <e.g. SEC-001>
**Changes Made**: <plain-language summary; name files and notable additions>
**Test Results**: <pass/fail/N-A; if N/A say why (e.g., "doc-only commit")>
**Deployment Status Update**: <branch name; "None" if not deployed; or environment + URL>
**Issues / Blockers**: <anything that blocks this or another work item>
**Grok Feedback / Questions**: <numbered questions for PM; one per line>
```

Notes:
- One entry per commit, not per PR. If a PR has multiple commits, each gets an entry.
- The "log entry commit" itself (the commit that adds this entry) does not require a recursive entry. Do not loop.
- Conflict resolution at PR merge: keep all entries (chronological); resolve order by `Commit SHA` date.
- Questions are for the PM (Grok). Each one becomes a tracked item.
