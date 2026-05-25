# Decision Record Template

Use this for a new entry in `docs/decisions/DECISIONS.md`. Append; do not edit history.

```markdown
## YYYY-MM-DD — <short-title>

**Decision**: <one sentence: what was decided>

**Context**: <2–4 sentences: what prompted the decision; what was the prior state>

**Options considered**:
1. <option A> — pros / cons
2. <option B> — pros / cons
3. <option C> — pros / cons

**Choice**: <which option, and why>

**Consequences**:
- <expected positive>
- <expected negative / cost>
- <what we deliberately gave up>

**Cross-references**: <links to findings, threat model entries, compliance items, code paths>

**Reviser path**: <how a future contributor would re-open this decision; what evidence would justify revision>

**Approved by**: <PM>, <Adversarial Reviewer (ack)>, <other roles as needed>
```

Notes:
- One decision per entry. Big decisions decompose into multiple entries.
- Avoid passive voice ("it was decided"); name the deciders.
- The "Reviser path" is required because decisions are revisable (`CLAUDE.md`).
