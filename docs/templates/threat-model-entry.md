# Threat Model Entry Template

Use for new entries in `docs/security/threat-model.md`. STRIDE per component is the default; for cross-cutting threats, use the alternate form below.

## Per-component STRIDE entry

```markdown
### N.M <Component name>

| Threat | Description | Impact (asset IDs) | Mitigation |
|---|---|---|---|
| **S**poofing | <how an attacker pretends to be someone else here> | A? | <mitigation, or "open"> |
| **T**ampering | <how data is altered in transit or at rest> | A? | <mitigation> |
| **R**epudiation | <how a party denies a prior action> | A? | <mitigation> |
| **I**nformation disclosure | <how confidential data leaks> | A? | <mitigation> |
| **D**oS | <how the component is made unavailable> | A?, UX | <mitigation> |
| **E**oP | <how a low-privilege actor gains higher privileges> | A? | <mitigation> |

Open issues blocking this row: <link to ADV-F-NNN or open question>.
```

## Cross-cutting threat entry

```markdown
### CC-N — <name>

<2–4 sentence description of the threat and the conditions under which it manifests>

**Mitigations**:
- <action 1>
- <action 2>

**Residual risk**: <what remains after mitigations; acceptable or not>
```

Notes:
- Always tie threats to assets by ID (A1, A2, ...). A threat that doesn't touch a listed asset is misframed or the asset list is incomplete.
- "Open" is an acceptable mitigation entry while the design is in flight; it must include a forward reference to the work item that will close it.
- Re-review when any component design lands; threat model is a living document.
