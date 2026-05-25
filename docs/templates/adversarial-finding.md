# Adversarial Finding Template

Use for new findings appended to `docs/adversarial/v2.1-review.md` (or subsequent reviews).

```markdown
### ADV-F-NNN — <one-line claim> · **<Severity: C/H/M/L/I>**

**Claim**: <what is wrong, in plain language. Be specific about the file or component.>

**Evidence**: <concrete pointers: file:line, external precedent, observable behavior. Without evidence, this is an opinion, not a finding.>

**Recommendation**:
- <specific action 1>
- <specific action 2>
- <specific action 3>

**Owner**: <role(s) responsible for action>

**Halt?**: <yes / no — if yes, list which workstream is blocked>

**Reviewer uncertainty**: <what would invalidate this finding; what the reviewer is not sure about>
```

Severity scale:
- **C** (Critical) — blocks Phase 1; cannot be deferred.
- **H** (High) — blocks mainnet.
- **M** (Medium) — blocks 2-city pilot.
- **L** (Low) — quality / hygiene issue.
- **I** (Info) — note for future reviewers; no action required.

Notes:
- A finding without evidence and an owner is not a finding — it's a hunch.
- "Reviewer uncertainty" is required. Honest uncertainty > false certainty (`CLAUDE.md`).
- If you raise a Critical or High, also propose the smallest mitigation that downgrades severity.
