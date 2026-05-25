# BlockAssist v2.1 — Initial Threat Model

**Owner**: Security Lead (drafted by Claude acting as Security Lead, per `AGENTS.md`)
**Date**: 2026-05-25
**Status**: Initial draft. Updates required as components are designed and implemented.
**Scope**: All components described in v2.1 architecture, including off-chain mobile/web clients, on-chain Anchor programs, dispute oracles, and operational infrastructure.
**Method**: STRIDE per component, cross-cutting threats, and an asset-driven supplement (because some threats — e.g., custody loss — are easier to reason about asset-first).

> This document is **not** a substitute for professional audits. It is the engineering team's working risk model, used to prioritize mitigations and scope audit firms. Per `docs/testing/verification-criteria.md`, two independent audits are required before mainnet.

---

## 1. Assets (what we protect)

| ID | Asset | Owner | Loss impact | Notes |
|---|---|---|---|---|
| A1 | USDC in escrow PDA | Order parties | High | One incident can drain protocol; user-visible. |
| A2 | USDC in collateral PDA | Assistant | High | Wrongful slash = consumer-protection event. |
| A3 | USDC in insurance pool | Protocol | High | Drained pool means uncovered losses. |
| A4 | Program upgrade authority key | Multisig signers | Critical | Compromise = total protocol takeover. |
| A5 | User passkey / Privy session | User | High | Loss = locked funds; theft = drained funds. |
| A6 | Assistant identity (KYC PII) | Protocol + user | High | Breach is GDPR/CCPA event. |
| A7 | Reputation state (on-chain) | Assistant | Medium | Integrity affects yield + jury selection. |
| A8 | Dispute oracle output | Protocol | High | Manipulated outcome = unjust resolution. |
| A9 | Off-chain order metadata (IPFS) | Order parties | Medium | Tampering or unavailability blocks completion. |
| A10 | Marketplace listing data | Assistant + protocol | Medium | Front-running or spam degrades UX. |
| A11 | Fee/treasury accounts | Protocol | Medium | Theft of accumulated fees. |
| A12 | $ASSIST mint authority (if token launches) | Multisig signers | Critical | Unbounded inflation. |

---

## 2. Trust Boundaries

```
[User device]                  [Privy infra]            [Solana cluster]
   passkey   ──TLS──►   auth/session   ──tx sign──►   programs + PDAs
       ▲                                                    │
       │                                                    ▼
   [Mobile app]                                       [IPFS network]
   [Web dashboard] ────── RPC/relayer ─────────►   [RPC providers]
                                                  [Indexers / The Graph]
                                                  [Off-chain dispute oracle?]
```

Trust boundaries crossed:
- B1 User device ↔ Privy (TLS, third-party SaaS)
- B2 User device ↔ RPC provider (TLS, third-party)
- B3 Client ↔ Solana cluster (signed transactions; consensus-trusted)
- B4 Programs ↔ IPFS network (content-addressed; pinning provider trust)
- B5 Programs ↔ Dispute oracle (off-chain → on-chain attestation; trust depends on jury design)
- B6 Programs ↔ Circle (USDC freeze authority is implicit cross-boundary)

---

## 3. STRIDE per Component

### 3.1 Registry program

| Threat | Description | Impact | Mitigation |
|---|---|---|---|
| **S**poofing | Attacker registers another user's wallet address | A6, A7 | Require signed attestation linking off-chain identity to wallet via Privy session token; rate-limit registrations per IP |
| **T**ampering | Reputation history modified | A7 | All writes signed by program; no admin write path; replay protection via slot/nonce |
| **R**epudiation | Assistant denies prior bad behavior | A7 | Immutable on-chain history; signed attestation on each order |
| **I**nformation disclosure | KYC PII leaks via on-chain registry | A6 | Store only hash of PII on chain; PII in encrypted off-chain store with access logs |
| **D**oS | Spam registrations exhaust account allocation | A10 | Registration fee in lamports; rate-limit |
| **E**oP | Anyone updates anyone else's record | A7 | Signer check; PDA seeded by owner |

### 3.2 Escrow program

| Threat | Description | Impact | Mitigation |
|---|---|---|---|
| **S**poofing | Attacker initiates escrow as another user | A1 | Require user signature; PDA seeded by user pubkey |
| **T**ampering | Release condition forged | A1 | All state transitions in program code, deterministic; no off-chain "release authority" |
| **R**epudiation | Party claims they never agreed to terms | A1 | Order hash committed on chain at escrow creation; signed by both parties |
| **I**nformation disclosure | Order details visible on-chain to unrelated parties | A9 | Store order hash on chain; details in encrypted IPFS payload |
| **D**oS | Griefing by initiating escrows that never complete | A1 (lock) | Timeout + auto-cancel + cancellation fee; refund to original payer |
| **E**oP | Caller without signer rights triggers release | A1 | Strict signer + PDA constraints; Anchor `#[account]` checks |

Open: optimistic-release challenge window must be defined (ADV-F-003). Until it is, all D and R threats are unmitigated.

### 3.3 Dispute program

| Threat | Description | Impact | Mitigation |
|---|---|---|---|
| **S**poofing | Attacker submits dispute on behalf of another | A8 | Signer check + escrow-party check |
| **T**ampering | Evidence hash replaced after submission | A8, A9 | Hash committed at submission; IPFS content-addressed; reveal must match hash |
| **R**epudiation | Juror claims they didn't vote | A8 | All votes signed; on-chain ledger |
| **I**nformation disclosure | Juror identity revealed pre-vote enables bribery | A8 | Commit-reveal voting; jurors selected via VRF |
| **D**oS | Mass-spam disputes drain juror time | A8 | Dispute fee (refundable on win); cap concurrent disputes per party |
| **E**oP | Single juror finalizes outcome | A8 | Quorum threshold; appeal mechanism |

Open: jury implementation has no existence proof on Solana (ADV-F-004). Until cited or built, this section is aspirational.

### 3.4 Collateral program

| Threat | Description | Impact | Mitigation |
|---|---|---|---|
| **S**poofing | Slash triggered by non-authorized caller | A2 | Only Dispute program can call slash via CPI; verify caller program ID |
| **T**ampering | Slash amount altered | A2 | Amount derived from on-chain rule, not parameter |
| **R**epudiation | Assistant claims they didn't stake | A2 | Signed deposit tx + program-emitted event |
| **I**nformation disclosure | Per-assistant collateral amount reveals income | A2, A6 | Acceptable trade-off given transparency benefits; document in privacy policy |
| **D**oS | Bug locks collateral indefinitely | A2 | Time-bounded withdraw queue; emergency unstake via governance |
| **E**oP | Direct slash without due process | A2 | **HALT (ADV-F-005)** — design before implementation |

### 3.5 Marketplace program

| Threat | Description | Impact | Mitigation |
|---|---|---|---|
| **S**poofing | Listing falsely attributed to another assistant | A10 | Listings signed by lister; reputation tied to listing wallet |
| **T**ampering | Listing terms changed after acceptance | A10 | On acceptance, terms hash committed to escrow |
| **R**epudiation | Lister claims order never accepted | A10 | Acceptance is on-chain tx with signature |
| **I**nformation disclosure | Listing reveals user location/pattern | A6, A10 | Coarse location buckets; off-chain geofence |
| **D**oS | Spam listings | A10 | Listing fee; collateral lockup until expiration |
| **E**oP | Listing taker bypasses fee | A11 | Fee deducted at escrow creation, not at listing |

### 3.6 Off-chain: Mobile app

| Threat | Description | Impact | Mitigation |
|---|---|---|---|
| **S**poofing | Malicious app impersonates BlockAssist | A5 | App-store signing, certificate pinning, deep-link verification |
| **T**ampering | App tampering injects fake tx data | A1, A5 | Show full tx details before sign; Privy enclave for signing |
| **R**epudiation | User denies signing | A1 | Privy session logs; passkey biometric tied to device |
| **I**nformation disclosure | Local state contains plaintext PII | A6 | Encrypted at rest with OS keychain |
| **D**oS | Push-notification abuse | UX | Standard rate-limit at backend |
| **E**oP | Compromised library escalates to signing | A1, A5 | SBOM; dependency pinning; Snyk/Renovate CI |

### 3.7 Off-chain: Web dashboard

| Threat | Description | Impact | Mitigation |
|---|---|---|---|
| **S**poofing | DNS hijack | A1, A5 | HSTS, DNSSEC, CAA records |
| **T**ampering | Supply-chain attack on JS bundle | A1, A5 | SRI on script tags; pinned deps; review-required Renovate |
| **R**epudiation | User says "I didn't click that" | A1 | Wallet sign confirmation; transaction details visible |
| **I**nformation disclosure | XSS leaks session | A5 | CSP strict; framework-default escaping; no inline scripts |
| **D**oS | API abuse | UX | Cloudflare; rate-limit |
| **E**oP | Logged-out user reaches admin route | UX, A11 | Server-side auth check on every API call |

### 3.8 Off-chain: Dispute oracle / juror UI

Out of scope until ADV-F-004 lands an implementation choice. Add when chosen.

### 3.9 Operational: Upgrade-authority multisig

| Threat | Description | Impact | Mitigation |
|---|---|---|---|
| **S**poofing | Phished signer | A4 | Hardware-wallet-only policy for signers; out-of-band confirmation for any tx |
| **T**ampering | Tx payload swapped pre-sign | A4 | Squads-style on-screen verification; documented "what to check" runbook |
| **R**epudiation | Signer denies signing | A4 | All signers identified; on-chain log; insurance |
| **I**nformation disclosure | Signer list public → targets phishers | A4 | Acceptable; transparency outweighs phishing surface |
| **D**oS | One signer goes dark | A4 | Threshold ≤ N−1; warm reserves; on-call rotation |
| **E**oP | Single signer holds majority quorum | A4 | Threshold ≥ 3-of-5; signers from independent orgs where possible |

---

## 4. Cross-Cutting Threats

### CC-1 — Solana cluster halt

If the cluster halts during an active escrow or dispute window, timeouts misfire. Programs should anchor timeouts to slot or recent-blockhash arithmetic and document expected behavior during halts.

### CC-2 — RPC provider compromise

A malicious or compromised RPC can lie to clients (front-running, censorship). Mitigations: multiple RPC providers, client cross-checks on critical reads, sanity-check tx receipts.

### CC-3 — USDC freeze (ADV-F-001)

Circle can freeze any USDC account. The protocol must continue to function (read, dispute, etc.) when escrow USDC is frozen. Add an `escrow_frozen` terminal state.

### CC-4 — Wormhole/bridge dependency

If any wrapped asset crosses a bridge, bridge compromise = asset loss. Avoid in v2.1 (current architecture is Solana-native).

### CC-5 — Front-running / MEV on order matching

Solana has limited MEV but order-flow auctions exist (Jito). High-value orders may be sniped at match time. Consider commit-reveal or auction-based matching for high-value listings.

### CC-6 — Privacy: deanonymization via on-chain pattern

Repeated escrows between the same wallets reveal relationships. Disclose this in privacy policy; do not market the system as anonymous.

### CC-7 — Sybil-driven economic attack (ADV-F-009)

Without identity primitive: assistant operates N sock-puppet users, completes self-orders, farms reputation, then takes on high-value real orders and absconds with collateral if collateral < expected gain.

### CC-8 — Time / clock skew

Anchor uses `Clock` sysvar. Validators can drift seconds. Don't use sub-minute precision for adversarial timeouts.

### CC-9 — Insufficient randomness for jury selection

`solana_program::clock::Clock` is not random. Need VRF (Switchboard) for jury selection. Document the chosen primitive.

### CC-10 — Account-rent reclamation

Anchor accounts that get closed prematurely return rent to the wrong party. Verify `close = ...` constraints in every program.

---

## 5. Prioritized Mitigations (top-15 backlog)

Order is rough priority for the Security Lead's queue.

1. **Define optimistic-release state machine** (ADV-F-003) — every Escrow STRIDE row depends on this.
2. **Define slashing spec** (ADV-F-005) — Collateral E unmitigated otherwise; HALT item.
3. **Decide upgrade-authority model** (ADV-F-002) — gate to any deployment.
4. **Select dispute oracle / jury implementation** (ADV-F-004) — entire 3.3 + 3.8 depend on this.
5. **Select Sybil-resistance primitive** (ADV-F-009) — gates reputation-weighted yield + jury.
6. **Set up secrets scanning + dependency audit in CI** (CONTRACT-001 / ADV-F-015) — covers 3.6, 3.7.
7. **CODEOWNERS on `docs/decisions/**` and `CLAUDE.md`** (ADV-F-012) — process integrity.
8. **Wallet/device runbook for multisig signers** — covers 3.9.
9. **Threat-model live update process** — re-review on each new component design.
10. **Audit-firm shortlist + slot reservation** — per `verification-criteria.md`; firms have 6–9mo lead times.
11. **Bug-bounty platform selection** (Immunefi vs. self-hosted) — pre-mainnet only.
12. **VRF integration plan for jury selection** (CC-9) — Switchboard or equivalent.
13. **Multi-RPC client strategy** (CC-2).
14. **Privacy policy draft incl. on-chain pattern disclosure** (CC-6) — coordinate with Legal Lead.
15. **`escrow_frozen` state design** (CC-3 / ADV-F-001).

---

## 6. Open Questions for the Team

1. Upgrade-authority composition and threshold? (ADV-F-002)
2. Hardware wallet vendor choice for multisig signers?
3. Audit firms shortlist and budget?
4. Bug-bounty platform and payout pool size?
5. KYC vendor (impact on A6 storage and breach scope)?
6. Identity primitive (CC-7 / ADV-F-009)?
7. VRF provider (CC-9)?
8. RPC provider strategy (CC-2)?
9. IPFS pinning service (B4)?
10. Insurance backstop legal vehicle (ADV-F-007)?

---

## 7. Maintenance

This document is reviewed and updated:
- Every time a new component is designed.
- Every time a halt item is resolved.
- Before each audit kickoff (audit firm receives the latest revision).
- At minimum, monthly during Phase 0 / 1.

Each revision is logged in `docs/decisions/DECISIONS.md` with the diff scope.
