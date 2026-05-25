# No-Token Alternative Specification (Parallel Track)

**Owner**: Tokenomics Engineer + Legal Lead (joint)
**Status**: Active parallel track. Must remain shippable until token-vs-no-token decision is made (target: end of Phase 0).
**Goal**: Demonstrate that BlockAssist can launch a functional, sustainable, and legally cleaner product *without* the $ASSIST token. This protects against the worst-case outcome of LEGAL-002 (securities opinion) and serves as a continuous reality check on the value proposition of the token track.

> A no-token launch is not the "failure mode" of the token track. It is a legitimate product in its own right, and may turn out to be the better long-term option. The two tracks are evaluated on the criteria in §8, not on which one founders prefer.

---

## 1. What this track replaces

| Token-track component | No-token replacement |
|---|---|
| $ASSIST governance | Foundation-led governance with public discussion & published minutes |
| $ASSIST staking yield (3% of fees) | Eliminated; reallocated to fee reduction and reputation tiers |
| Token-denominated mint authority | N/A — no mint |
| Token launch marketing | Reallocated to assistant onboarding incentives |
| Token-gated juror selection (if any) | Reputation-staked juror selection (collateral, not tokens) |
| TOK-tagged compliance items | Removed; remaining gates are MN-only |

---

## 2. Core architecture (delta from token track)

Everything on-chain remains the same except:
- **No `assist_token` program / mint.** Programs in `contracts/programs/` are unchanged structurally; references to "yield" or "stake $ASSIST" are removed.
- **Collateral remains USDC.** This was already the v2.1 default.
- **Juror selection** is collateral-stake-weighted, not token-stake-weighted. Open in ADV-F-004; the choice doesn't depend on the token decision.
- **Insurance pool** is funded purely from fee allocation (§3), legal vehicle unchanged (still gated on ADV-F-007).

Off-chain changes:
- Marketing materials describe BlockAssist as "a USDC-escrow gig protocol with on-chain reputation". No yield language.
- Privacy/ToS already work; nothing reduces here.

---

## 3. Economics

### 3.1 Fee model

Token-track fee: **6%**, split 1.2% / 1.8% / 3.0% (ops / insurance / staker yield).
No-token fee: **4.5%**, split as follows:

| Bucket | % | Purpose |
|---|---|---|
| Ops Treasury | 1.5% | Engineering, infra, support |
| Insurance Pool | 2.5% | Backstop payouts (gated on ADV-F-007 vehicle) |
| Reputation Bonus Pool | 0.5% | Periodic payouts to top-quartile assistants by reputation |

Rationale:
- Lower headline fee (4.5% vs 6%) is a real user benefit — competitive with TaskRabbit (15%+), Uber (20–30%).
- Higher insurance allocation (2.5% vs 1.8%) compensates for absence of token-backed buffer.
- Reputation Bonus Pool replaces staker yield with **work-based** payout, not capital-based. This is a meaningful regulatory distinction: rewarding *labor* via a platform-managed bonus pool is well-precedented (gig platforms, ride-share quests). Rewarding *capital* via staking yield is securities-shaped.

### 3.2 Assistant incentives without token yield

| Incentive | Mechanism |
|---|---|
| Real income | Order earnings minus fee, paid in USDC immediately on optimistic release. |
| Reputation tier perks | Higher tiers unlock: priority queue placement, fee rebates (capped 0.5%), access to high-value orders, badge in client UI. Tiers earned by completed orders + dispute-loss rate, not capital. |
| Reputation Bonus Pool (§3.1) | Quarterly distribution to top-quartile assistants by tier. Bonus is platform-administered and disclosed as variable compensation; *not* a passive return on investment. |
| Insurance backstop | If a user defaults or charges back wrongfully, insurance pool pays the assistant out (bounded). This is risk transfer, not yield. |

### 3.3 What this gives up

- No "skin-in-the-game" token for community alignment. Honest about this — community is built through product quality and assistant earnings, which is harder but defensible.
- No fundraising via token sale. Treasury must come from: pre-seed/seed equity, grants (Solana Foundation, Helium-style ecosystem funds), or revenue.
- Slower bootstrapping. Token launches are great cold-start engines; we trade that for slower growth in exchange for cleaner regulation.

---

## 4. Governance

- **Foundation model**: BlockAssist Foundation (jurisdiction TBD by Legal Lead — likely Switzerland Verein, Cayman Foundation, or US 501(c)(6) depending on tax + regulatory analysis).
- **Decision authority**: Foundation Board, with operating company executing.
- **Public input**: Quarterly RFCs, public discussion via forum + Discord, foundation publishes minutes.
- **Programs upgrade authority**: Foundation multisig (same as token-track ADV-F-002). Not different here.

Trade-off vs. on-chain governance: less "decentralized" in marketing terms, but more credible legally and operationally. Many on-chain governances are de facto controlled by team holdings anyway.

---

## 5. Launch path

| Phase | Token track | No-token track |
|---|---|---|
| Phase 0 | Legal + scaffolding | Same |
| Phase 1 | Core contracts (incl. assist_token) | Core contracts (no assist_token) — **smaller scope** |
| Devnet | Public testnet with placeholder token | Public testnet, fully functional |
| Audit | 2 audits incl. token economics | 2 audits, no token economics (cheaper, faster) |
| Pilot 1 | Mainnet (token TBD, may launch later) | Mainnet, real users |
| Pilot 2 | + Token launch | + (decision: launch token? See §8) |

Crucially, **the no-token track ships earlier** because the longest-pole items are the securities opinion (LEGAL-002), insurance vehicle for token-yield case, and token-economics audit. Removing them shortens Phase 1 by an estimated 2–4 months.

---

## 6. KPIs (track both, identical metrics)

For the decision criteria (§8) to be honest, both tracks must be measured on identical KPIs in parallel.

- Weekly active assistants
- Weekly active customers
- Order completion rate
- Dispute rate (and resolution time)
- Mean order value
- Insurance pool reserve ratio (pool USDC / cumulative covered exposure)
- Gross take-rate effective (fees collected / GMV)
- Assistant retention (week-N retention curve)
- Customer NPS
- Sybil incident count
- Open compliance items count

Internal dashboards mirror both tracks. Any decision that improves one track but not the other is logged.

---

## 7. Compliance posture

Reduced surface vs. token track:

- **§1 Securities** items collapse to: "confirm no token launch posture is sustained; revisit if token added later." Single counsel sign-off.
- **§7 Insurance** items remain — insurance is required regardless of token.
- **§8 Token mechanics** items collapse to: mint authority N/A, distribution N/A.
- **§10 Token pre-launch** entire section omitted.

What does *not* change:
- MTL applicability
- KYC/AML
- Gig worker classification
- Consumer protection
- Data protection
- Per-city ops

So the no-token track shortens the legal critical path but does not bypass the bulk of compliance work. This is honest framing — "no token = no regulation" is wrong.

---

## 8. Decision Criteria (Token-vs-No-Token)

Decision date: **end of Phase 0** (target). Pushable if LEGAL-002 has not delivered.

Decision in favor of **token track** if **all** of:
- LEGAL-002 returns either (a) "$ASSIST is not a security under design X" or (b) "is a security but offering structure Y is feasible and economic."
- Treasury runway > 18 months under token track's longer Phase 1.
- Sybil-resistance primitive exists (ADV-F-009) such that token staking does not collapse to whale capture.
- Insurance vehicle (§7) is solvable under token-funded structure.

Decision in favor of **no-token track** if any of:
- LEGAL-002 is unfavorable and offering structure Y is uneconomic.
- Treasury or runway constrained → ship sooner.
- Sybil-resistance unsolved → token yield becomes whale-capture vector.
- Pilot data shows reputation tiers + Reputation Bonus Pool deliver adequate assistant retention without token.

Decision is logged in `docs/decisions/DECISIONS.md` with full rationale. Decision is **revisable** per `CLAUDE.md`.

---

## 9. Reversibility

If we launch no-token and later want to add $ASSIST:
- Possible, but the marketing/messaging shift is delicate ("we said no token, now there's a token") — anticipate community criticism.
- Smart-contract migration is feasible because the no-token contracts have no token-references to remove.
- Distribution would heavily favor early assistants (retroactive airdrop), reframing community alignment.

If we launch token and later want to remove $ASSIST:
- Much harder. Token holders have economic and possibly legal claims. Plan as if token launch is one-way.

The asymmetry favors starting no-token unless the token case is genuinely strong.

---

## 10. Open Questions

1. Foundation jurisdiction (Switzerland Verein? Cayman? US non-profit?) — Legal Lead.
2. Reputation Bonus Pool payout schedule and tax-withholding treatment per jurisdiction — Legal Lead + Tax counsel.
3. Whether reputation tiers themselves constitute regulated incentives in any jurisdiction — Legal Lead.
4. Whether Solana Foundation grants are available for no-token protocols (vs. token-launching ones).
5. Marketing tone: how to describe a no-token Solana protocol without seeming "less crypto" in a market that rewards token launches. PM + Comms.

---

## 11. Cross-references

- `docs/tokenomics/model.md` — token-track economics; should add a "see also" pointer.
- `docs/legal/COMPLIANCE_GATE.md` — TOK-tagged items are skipped under this track.
- `docs/adversarial/v2.1-review.md` — ADV-F-006 (securities) is the primary driver of this track's importance.
- `docs/decisions/DECISIONS.md` — final decision lives here.
