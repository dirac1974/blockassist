# Escrow State Machine

**Owner**: Lead Smart Contract Engineer
**Closes**: `ADV-F-003` (see `docs/adversarial/v2.1-review.md`).
**Cross-refs**: `ADV-D-002` (affirmative-acceptance threshold), `ADV-D-005` (`escrow_frozen` for USDC freeze handling), §A.2 of `docs/adversarial/v2.1-review-deep-dive.md` (silent-accept griefing).

## 1. Goals & non-goals

**Goals**
- Custody USDC for a single order between exactly two parties (customer + assistant).
- Make release safe under common failure modes: assistant disappears, customer disappears, dispute, USDC freeze.
- Be cheap (one PDA per order; minimal account allocations).
- Be reviewable: each transition has a single instruction handler.

**Non-goals**
- Multi-party escrow (3+ parties) — out of scope for MVP.
- Cross-program funding flows (fundraising, vault splits) — out of scope.
- Multi-asset escrow — USDC only.

## 2. Actors

- **Customer**: pays for the order. Holds signer authority over the escrow PDA's release decision (within rules below).
- **Assistant**: performs the work. Signer authority for delivery marking and (optionally) collateral movements.
- **Disputer**: either party can call dispute. Resolution comes from the Dispute program (separate, future PR).
- **Cranker**: anyone — calls the finalize-on-timeout instruction once the optimistic window has elapsed. No signer privileges beyond the call itself.

## 3. States

```
Initialized ──► Funded ──► InProgress ──► AwaitingAcceptance ──► Completed
     │            │             │                  │                  ▲
     │            │             │                  ├─► Disputed ──────┤ (resolve_release)
     │            │             │                  │       │
     │            │             │                  │       └► Refunded (resolve_refund)
     │            │             │                  │
     │            │             └────────► Cancelled (mutual + assistant_signed)
     │            │
     │            └─► Cancelled (pre-fund: customer-only)
     │
     └─► Cancelled (no funds yet; customer-only)

Any state ── (USDC freeze observed) ──► Frozen (terminal-until-unfrozen)
```

## 4. Transitions

| From | Via | To | Signer(s) | Effect |
|---|---|---|---|---|
| (none) | `init_escrow` | Initialized | Customer | Allocates PDA, stores order hash, parties, terms hash, expected amount. |
| Initialized | `cancel_pre_fund` | Cancelled | Customer | Closes PDA, refunds rent. |
| Initialized | `fund_escrow` | Funded | Customer | Transfers USDC from customer ATA → escrow PDA's vault. |
| Funded | `accept_listing` | InProgress | Assistant | Sets `assistant`, starts work clock. |
| Funded | `cancel_pre_progress` | Cancelled | Customer | Refunds USDC. (Cheaper to cancel before assistant starts.) |
| InProgress | `mark_delivered` | AwaitingAcceptance | Assistant | Sets `delivered_at`, starts challenge window. |
| InProgress | `cancel_in_progress` | Cancelled | Customer + Assistant (mutual) | Refunds USDC. Requires both signatures. |
| AwaitingAcceptance | `accept_delivery` | Completed | Customer | Releases USDC to assistant ATA. |
| AwaitingAcceptance | `dispute_delivery` | Disputed | Customer or Assistant | Freezes funds. Dispute program later resolves. |
| AwaitingAcceptance | `finalize_optimistic` | Completed | Cranker | Only valid after `delivered_at + challenge_window`. Releases USDC to assistant. |
| Disputed | `resolve_release` | Completed | Dispute program (CPI) | Releases USDC to assistant. |
| Disputed | `resolve_refund` | Refunded | Dispute program (CPI) | Returns USDC to customer. |
| Disputed | `resolve_split{a,b}` | Refunded | Dispute program (CPI) | Partial split (advanced; MVP defers). |
| any non-terminal | `mark_frozen` | Frozen | Any party (when USDC ATA frozen externally) | Records frozen state; refuses further transitions; admin path to unfreeze when external freeze lifts. |

Terminal states: **Completed**, **Refunded**, **Cancelled**.
Quasi-terminal state: **Frozen** (can return to prior state if external freeze lifts).

## 5. Time parameters

| Name | Default | Notes |
|---|---|---|
| `WORK_TIMEOUT` | 7 days | InProgress → assistant inactivity. Customer may dispute if assistant hasn't marked delivered. |
| `CHALLENGE_WINDOW` | 72 hours | AwaitingAcceptance → Completed via `finalize_optimistic`. |
| `DISPUTE_RESPONSE_WINDOW` | 14 days | Once disputed, dispute program has this window before defaulting to refund. |
| `AFFIRMATIVE_ACCEPT_THRESHOLD` | $50 USDC (placeholder) | Above this, finalize_optimistic is disabled; customer must explicitly accept (closes A.2 attack). Confirm with Tokenomics — ADV-D-002. |

All times are measured against `Clock` slot timestamps. Sub-minute precision is not used (validator clock skew tolerated — CC-8 in threat model).

## 6. Account layout

Per-order PDA:

```
seeds = [b"escrow", order_id.as_ref(), customer.key().as_ref()]
```

Fields:
- `customer: Pubkey`
- `assistant: Pubkey` (zero until accept_listing)
- `order_hash: [u8; 32]` — keccak of off-chain order JSON
- `terms_hash: [u8; 32]` — keccak of accepted terms (immutable post-accept)
- `usdc_mint: Pubkey`
- `amount: u64` (in USDC base units; 6 decimals so 1 USDC = 1_000_000)
- `state: EscrowState` (1 byte enum)
- `created_at: i64`
- `funded_at: i64`
- `accepted_at: i64`
- `delivered_at: i64`
- `resolved_at: i64`
- `frozen: bool` (CC-3 / ADV-F-001)
- `bump: u8`

Vault ATA (token account):
- Owned by the escrow PDA.
- Holds USDC during Funded/InProgress/AwaitingAcceptance/Disputed states.

## 7. Events

Emit on every transition:
```
EscrowEvent { order_id, from: EscrowState, to: EscrowState, actor: Pubkey, slot: u64 }
```

Plus instruction-specific events:
- `EscrowFunded { amount }`
- `EscrowDelivered { delivered_at, finalize_eligible_at }`
- `EscrowFinalized { amount, mode: "manual"|"optimistic" }`
- `EscrowDisputed { disputer }`
- `EscrowResolved { mode: "release"|"refund"|"split", payout_assistant, payout_customer }`
- `EscrowFrozen { reason }`

## 8. Errors

- `InvalidStateTransition`
- `Unauthorized`
- `AmountMismatch`
- `WindowNotElapsed` (finalize_optimistic before challenge window)
- `WindowNotEnded` (dispute attempt after dispute_response_window)
- `EscrowAlreadyFunded`
- `EscrowFrozen` (any tx on frozen escrow except `unfreeze`)
- `MissingMutualSignature` (cancel_in_progress without both signers)
- `OverThreshold` (finalize_optimistic on order ≥ affirmative_accept_threshold)
- `BadOrderHash`
- `MathOverflow`

## 9. Adversarial scenarios closed

- **A.2 silent-accept griefing**: `AFFIRMATIVE_ACCEPT_THRESHOLD` forces explicit accept on high-value orders. Customer can also dispute during entire challenge window.
- **A.5 USDC freeze DoS**: Per-order PDA isolates blast radius. `Frozen` state allows graceful degradation.
- **A.9 reorg race**: All state transitions read prior state from PDA, not from off-chain assumption. UI must wait for `confirmed` before showing state to user.

## 10. Open questions

1. Are partial refunds (`resolve_split`) MVP-scope or v1.1? (Default: defer.)
2. Should `cancel_in_progress` be mutual-only (current) or allow either party with cooldown? (Default: mutual-only; safer.)
3. Should `mark_frozen` be permissioned (only specific actor can call) or permissionless (anyone can flag a frozen ATA)? (Default: permissionless, since the freeze status is on-chain-observable.)
4. Should fee deduction (1.5–3% per `tokenomics/model.md`) happen at fund time or release time? (Default: release time, simpler.)

## 11. Verification plan

- Unit tests for every transition (happy + sad).
- Property test: from any non-terminal state, only valid transitions are accepted.
- Property test: total USDC conserved (in == out + fees) across any sequence of transitions.
- Integration test: full happy path on devnet with real USDC mint.
- Formal verification of `accept_delivery` and `finalize_optimistic` (Kani or similar; per `docs/testing/verification-criteria.md`).
