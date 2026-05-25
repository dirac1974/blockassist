# Compliance Gate Checklist (v2.1)

**Authority**: Legal & Compliance Lead (final sign-off). PM and Adversarial Reviewer ratify acknowledgement.
**Purpose**: Bind protocol milestones to verifiable legal artifacts. No item is satisfied by self-assessment; each requires the listed artifact.
**Status flag**: `[ ]` open · `[~]` in progress · `[X]` complete (with artifact link) · `[N/A]` formally waived (with DECISIONS.md entry).

> **Legal disclaimer**: This checklist is the engineering team's working compliance map. It is *not* legal advice. Every item that names a regulation or statute must be confirmed by counsel before action. Items can be added, removed, or rephrased by Legal Lead; log such changes in `docs/decisions/DECISIONS.md`.

---

## 0. Milestone Gating

Items are tagged with the earliest milestone they block. A milestone is approved by the Legal Lead only when **all** items tagged with it (or earlier) are `[X]` or `[N/A]`.

| Tag | Milestone | Blocks |
|---|---|---|
| `P0` | Phase 0 exit | Move to Phase 1 (contract implementation) |
| `DEVNET` | Devnet deployment | Public testnet operation |
| `PILOT` | First pilot city operational | Real user funds in escrow |
| `MN` | Mainnet program deployment | Anchor programs live on mainnet-beta |
| `TOK` | $ASSIST token launch | Token mint + distribution |
| `CITY-N` | Additional pilot city | Per-city operational compliance |

---

## 1. Securities Law (US)

- [ ] **(TOK)** Written securities opinion from US securities counsel on $ASSIST under Howey + Reves. Reference: SEC March 2026 staff guidance. *Artifact: counsel memo + cover letter.*
- [ ] **(TOK)** If opinion concludes $ASSIST is a security: documented offering structure (Reg D 506(c) / Reg S / etc.) with subscription docs, lockup terms, accredited-verification flow.
- [ ] **(TOK)** Marketing-restriction policy (no profit promises, no investment language) signed by all employees with social-media access.
- [ ] **(TOK)** If $ASSIST staking yield is structured as fee-share: separate analysis of whether yield itself is a security offering under SEC v. LBRY and SEC v. Coinbase staking actions.
- [ ] **(MN)** Token-free protocol launch path validated even if TOK is deferred (no-token alternative readiness — see `docs/alternatives/no-token-spec.md`).

## 2. Money Transmission / Payments

- [ ] **(P0)** US MTL applicability analysis from counsel. Covers: 50 states (incl. NY BitLicense), agent-of-payee/payment-processor exemptions, escrow structure characterization.
- [ ] **(PILOT)** Per-state MTL plan for any US pilot state (or formal exemption letter where applicable).
- [ ] **(PILOT)** FinCEN MSB registration if pilot ops trigger §1010.100(ff).
- [ ] **(PILOT)** EU equivalent: PSD2 / e-money assessment for any EU pilot city.
- [ ] **(PILOT)** UK FCA assessment for any UK pilot city.
- [ ] **(MN)** Stablecoin custody analysis: with USDC freeze authority (ADV-F-001), regulators may view escrow as custodial. Counsel memo required.

## 3. KYC / AML / Sanctions

- [ ] **(PILOT)** KYC vendor contract executed; data-processing agreement; SOC 2 evidence on file.
- [ ] **(PILOT)** Written KYC policy: tiers, thresholds, refresh cadence, enhanced due diligence triggers.
- [ ] **(PILOT)** AML program: SAR filing process, transaction monitoring rules, designated AML officer named.
- [ ] **(PILOT)** OFAC sanctions screening at sign-up and pre-payout; sanction-hit handling runbook.
- [ ] **(PILOT)** Travel Rule (FinCEN/FATF Rec. 16) compliance for transfers ≥ threshold.
- [ ] **(MN)** Privacy policy and ToS pass legal review; published; user consent flow documented.

## 4. Gig Worker Classification (ADV-F-008)

- [ ] **(P0)** Jurisdiction-by-jurisdiction worker-classification matrix for each candidate pilot city. Covers: US ABC test states, EU platform-work directive, UK IR35, similar.
- [ ] **(PILOT)** Standard assistant agreement reviewed by employment counsel.
- [ ] **(PILOT)** Product-control audit: any feature that asserts control (pricing, scheduling, mandatory acceptance) is flagged and Legal-approved.
- [ ] **(CITY-N)** Per-city worker-classification confirmation.

## 5. Consumer Protection

- [ ] **(PILOT)** Dispute resolution disclosure (clear in ToS; arbitration clause if used; class-action waiver enforceability per jurisdiction).
- [ ] **(PILOT)** Refund / cancellation policy + automated enforcement against escrow program.
- [ ] **(PILOT)** Honest-marketing review of all advertised KPIs and guarantees.

## 6. Data Protection

- [ ] **(PILOT)** GDPR DPIA for EU pilots.
- [ ] **(PILOT)** CCPA/CPRA mapping for any California user data (even if pilot is non-CA).
- [ ] **(PILOT)** Cross-border data transfer mechanism (SCCs / DPF / BCRs).
- [ ] **(MN)** PII storage architecture confirmed not to put PII on chain (only hashes); see threat model A6.
- [ ] **(MN)** Right-to-erasure flow that respects immutable on-chain reputation history (procedure for "delete linkable off-chain record while leaving on-chain hash").

## 7. Insurance Backstop (ADV-F-007 / HALT)

- [ ] **(MN)** Legal entity for insurance pool selected and incorporated (captive insurer / Bermuda DCC / Cayman SPC / protocol-cover smart contract).
- [ ] **(MN)** Insurance policy terms drafted: covered events, per-incident cap, aggregate cap, payout SLA.
- [ ] **(MN)** Reinsurance or excess-of-loss strategy when pool < uncovered liability.
- [ ] **(MN)** Disclosure to users: what is and isn't covered, in plain language.

## 8. Smart Contract / Token Mechanics

- [ ] **(MN)** Upgrade authority documented (ADV-F-002): multisig members named, threshold, timelock, public communication procedure.
- [ ] **(MN)** Slashing spec Legal-reviewed (ADV-F-005 / HALT). Slashing without due process is a consumer-protection event.
- [ ] **(MN)** Two independent audits complete (per `docs/testing/verification-criteria.md`).
- [ ] **(MN)** Bug bounty program live with minimum payout pool documented.
- [ ] **(TOK)** Token distribution plan: allocations, vesting schedule, lockups, public sale legal vehicle.

## 9. Operational Per-City Compliance

For each pilot city, a one-page **City Op Brief** is required, signed by Legal Lead:

- [ ] **(PILOT / CITY-N)** Local business registration / licensing complete.
- [ ] **(PILOT / CITY-N)** Local tax registration (sales/VAT/GST/etc.).
- [ ] **(PILOT / CITY-N)** Worker-classification confirmation (§4).
- [ ] **(PILOT / CITY-N)** Consumer-protection mapping (§5).
- [ ] **(PILOT / CITY-N)** Payments-licensing mapping (§2).
- [ ] **(PILOT / CITY-N)** Insurance coverage extends to city.
- [ ] **(PILOT / CITY-N)** Local dispute-enforceability check (can a Solana on-chain jury verdict be enforced in local court if appealed?).

## 10. Token Pre-Launch Pre-Conditions (TOK)

Token launch additionally requires **all** of:

- [ ] Securities opinion (§1) cleared or offering structure approved.
- [ ] No-Token Alternative (`docs/alternatives/no-token-spec.md`) marked as deferred (not eliminated), with documented re-entry criteria.
- [ ] Mint authority decision logged (ADV-F-002 analog for tokens): multisig, threshold, timelock.
- [ ] Insurance backstop §7 fully closed.
- [ ] At least 30 days of mainnet operation without halt items reopening.

---

## 11. Sign-off

Every milestone transition (P0 → DEVNET → PILOT → MN → TOK / CITY-N) requires a sign-off block in `docs/decisions/DECISIONS.md`:

```
## YYYY-MM-DD — [MILESTONE] Compliance Gate Approval

Legal Lead: <name>, <date>
PM: <name>, <date>
Adversarial Reviewer (acknowledgement): <name>, <date>

Open items at sign-off: <list>
Waivers (with rationale): <list>
```

A milestone may proceed with explicitly waived items, but each waiver becomes a tracked decision and may be re-opened.

---

## 12. Maintenance

- Reviewed by Legal Lead at the start of each sprint.
- Updated when counsel issues new opinions; the opinion file lives in `docs/legal/opinions/` (gitignored if confidential).
- Removed items require a DECISIONS.md entry explaining why.
