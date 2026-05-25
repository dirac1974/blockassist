# BlockAssist v2.1 Architecture

**Owner**: Lead Smart Contract Engineer (with cross-functional inputs).
**Status**: Living document. Originally a one-pager; expanded 2026-05-25 to incorporate dispute-system phased plan and post-ADV-001 corrections.

## 1. High-level shape

- **L1**: Solana mainnet-beta (target). Devnet for everything until audited.
- **Programs**: Anchor 0.30.1 for all on-chain logic. Pinocchio considered only if profiling justifies it post-MVP.
- **Custody asset**: USDC on Solana. Single-stable for MVP; dual-stable (PYUSD or DAI on Solana) evaluated for collateral once primary stack is stable.
- **Off-chain storage**: IPFS for order metadata and dispute evidence (content-addressed). ZK Compression considered for high-volume reputation history.
- **Mobile**: React Native + Expo + Privy passkeys. Web mirror (Next.js) for desktop / fallback.
- **Identity**: Privy session → wallet. Sybil-resistance primitive choice **open** (ADV-F-009).

## 2. Programs

| Program | Status | Notes |
|---|---|---|
| `escrow` | First-pass implemented (CONTRACT-002) | 8-state machine, USDC SPL CPI, optimistic release + affirmative-accept threshold. |
| `marketplace` | First-pass implemented (CONTRACT-003) | Listing fee anti-spam; create/accept/cancel/expire. |
| `collateral` | Deposit/withdraw only (CONTRACT-003) | Slashing halted (ADV-F-005). |
| `dispute` | **Not implemented**. Phased plan in §4. | Dispute program drives slashing CPI once both land. |
| `registry` | Stub only | Reputation/identity primitive choice pending. |

## 3. Custody flow (escrow happy path)

1. Customer calls `init_escrow(order_id, order_hash, terms_hash, amount)`. Per-order PDA + vault ATA allocated.
2. Customer calls `fund_escrow`. USDC moves from customer ATA → vault ATA.
3. Assistant calls `accept_listing`. State → InProgress.
4. Assistant calls `mark_delivered`. State → AwaitingAcceptance. Challenge window starts.
5. Customer calls `accept_delivery`. USDC moves from vault → assistant ATA. State → Completed.
   - OR if amount < $50 and window elapses, any `cranker` calls `finalize_optimistic` for the same effect.
   - OR either party calls `dispute_delivery` during the window → state → Disputed.

Full state machine: `docs/architecture/escrow-state-machine.md`.

## 4. Dispute system — phased plan

Per `docs/adversarial/v2.1-review-deep-dive.md` §B. No production-grade on-chain jury primitive exists on Solana; we build *minimally* and stage growth.

### Phase 1 (MVP, single pilot city)
- **Level-0 mediator**. Named role inside the team. Public acceptance/rejection rate. SLA.
- Legally and operationally cheap. Appropriate for low order volume.
- Trade-off: not "decentralized" in the marketing sense; honest framing required.

### Phase 2 (second pilot city, higher volume)
- Add level-1 jury for escalations:
  - Switchboard VRF for juror selection from a staked-collateral pool.
  - Commit-reveal voting (closes A.3 bribery via hidden identity).
  - Jury slashing for vote against revealed-evidence consensus.
- Optimistic dispute resolution: assume initial decision; allow escalation that costs more than the gain to manipulate.

### Phase 3 (post-MVP)
- Appellate layer (larger jury or DAO vote) for high-value or repeat-appealed disputes.

Cross-chain Kleros is **not** on the roadmap (bridge risk).

## 5. Collateral & slashing

- USDC collateral, per-assistant PDA.
- Deposit/withdraw implemented (CONTRACT-003).
- Slashing **halted** until spec finalized + Legal-reviewed (ADV-F-005). Interface stub returns `SlashHalted`.
- Spec: `docs/architecture/slashing-spec.md`.
- Slashed funds priority: harmed customer first, insurance pool second. **Never** to ops / burn / juror bounty.

## 6. Insurance pool

**Halted** (ADV-F-007). Legal vehicle + funding model + payout policy must be specified. Funded from 1.8% of fees (token track) or 2.5% (no-token track per `docs/alternatives/no-token-spec.md`).

## 7. Tokenomics

- Token track: 6% fee, 1.2/1.8/3.0 ops/insurance/staker-yield. **Halted** by ADV-F-006 pending securities opinion.
- No-token track: 4.5% fee, 1.5/2.5/0.5 ops/insurance/reputation-bonus. Parallel-track shippable.
- Decision date: end of Phase 0 (currently rolling with LEGAL-001 deferral).

## 8. Identity & Sybil resistance

Open. Candidates:
- World ID (proof-of-personhood).
- Privy KYC tier (centralized but legally simpler).
- Reputation+economic-cost (no PoP; collateral scaling per ADV-D-001).

Decision before reputation-weighted yield or jury selection goes live.

## 9. Upgrade authority

Open (ADV-F-002). Default proposal: 3-of-5 multisig with 48h timelock for the first 6 months post-mainnet. Members named before any deploy.

## 10. Operational

- **RPC strategy**: ≥2 providers; client cross-checks for high-value tx reads (CC-2).
- **VRF**: Switchboard (CC-9).
- **IPFS pinning**: provider TBD (B4).
- **Monitoring**: dashboard with insurance reserve ratio, dispute rate, claim rate, sybil-incident counter.

## 11. What is intentionally NOT in this architecture

- Cross-chain bridges. Solana-native only.
- Multi-asset escrow. USDC only for MVP.
- DAO governance. Foundation governance for MVP; DAO is post-MVP.
- $ASSIST token. Halted (ADV-F-006) until securities opinion. No-token track is shippable in parallel.

## 12. Cross-references

- `docs/adversarial/v2.1-review.md`
- `docs/adversarial/v2.1-review-deep-dive.md`
- `docs/security/threat-model.md`
- `docs/architecture/escrow-state-machine.md`
- `docs/architecture/slashing-spec.md`
- `docs/architecture/mobile-platform-risks.md`
- `docs/alternatives/no-token-spec.md`
- `docs/tokenomics/model.md`
- `docs/legal/COMPLIANCE_GATE.md`
