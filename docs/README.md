# BlockAssist Documentation Index

This is the in-repo documentation root. Every doc lives under `docs/<topic>/`. The repo root holds only top-level project files (`README.md`, `CLAUDE.md`, `AGENTS.md`, `CONTRIBUTING.md`, `BRANCH_PROTECTION.md`, `ISSUES.md`, `grok_feedback.md`).

## Reading order for new contributors

1. `CLAUDE.md` (repo root) — core rules & philosophy.
2. `docs/status/PROJECT_STATUS.md` — current honest status.
3. `AGENTS.md` (repo root) — team roles.
4. `docs/decisions/DECISIONS.md` — what has been decided and why.
5. `docs/adversarial/v2.1-review.md` — open risks and halt items.
6. The topic doc that matches your task.

## Topic index

| Path | Purpose | Owner |
|---|---|---|
| `docs/status/PROJECT_STATUS.md` | Living status, milestone, KPI snapshot. | PM |
| `docs/decisions/DECISIONS.md` | Append-only decision log. | PM (writer), all agents (proposers) |
| `docs/adversarial/v2.1-review.md` | Adversarial review with halt items. | Adversarial Reviewer |
| `docs/security/threat-model.md` | STRIDE threat model. | Security Lead |
| `docs/legal/COMPLIANCE_GATE.md` | Milestone-gated legal checklist. | Legal & Compliance Lead |
| `docs/alternatives/no-token-spec.md` | No-Token Alternative parallel track. | Tokenomics + Legal |
| `docs/tokenomics/model.md` | Token-track economics (gated on securities opinion). | Tokenomics Engineer |
| `docs/architecture/v2-architecture.md` | High-level architecture (to be expanded). | Lead Smart Contract Engineer |
| `docs/testing/verification-criteria.md` | Audit, coverage, formal-verification bars. | QA Lead + Security Lead |
| `docs/templates/` | Templates for the above. | Project Manager |

## Templates

When you write a new entry, start from the matching template:

- `docs/templates/decision-record.md` — DECISIONS.md entries
- `docs/templates/adversarial-finding.md` — adversarial findings
- `docs/templates/threat-model-entry.md` — threat-model entries (STRIDE and cross-cutting)
- `docs/templates/grok-feedback-entry.md` — `grok_feedback.md` entries (required after every commit)

## Conventions

- Markdown only. No HTML except in tables.
- Cross-reference with `file:line` for code (`background_bot.py:142` style; for this repo: `contracts/programs/escrow/src/lib.rs:42`).
- Cross-reference docs by path: `` `docs/security/threat-model.md` ``.
- Headings are sentence case.
- Dates are ISO-8601 (YYYY-MM-DD).
- Every doc has an Owner.

## Maintenance

Out-of-date doc = silent risk. If you touch a topic whose doc is stale, file a follow-up in `ISSUES.md` or update inline.
