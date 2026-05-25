# BlockAssist v2.1 - Complete Detailed Specification

**Version**: 2.1 | **Date**: May 25, 2026

## Executive Summary

BlockAssist is a decentralized, cross-platform (Android + iOS) gig economy platform built on Solana. It enables users to request deliveries, tasks, and custom jobs while connecting them with assistants through USDC escrow, assistant collateral, and a fair decentralized dispute resolution system.

**Key Differentiators**:
- Platform fee of only ~6% (vs 25-30% on Uber, DoorDash, etc.)
- Users and assistants can become real "platform owners" through staking and participation
- Fully decentralized dispute system with public transparency
- Strong focus on long-term token stability and sustainable growth

---

## 1. Tokenomics (Extremely Detailed)

### 1.1 Overall Model
**Primary Model**: Hybrid veASSIST + Usage Airdrop + Revenue Share

### 1.2 Fee Split (Total Platform Fee: 6%)

| Component                        | % of Total Fees | Annual Revenue Example ($1M fees) | Purpose |
|----------------------------------|------------------|-----------------------------------|--------|
| Operations                       | 1.2%            | $120,000                         | Platform ops, team salaries |
| Insurance Pool                   | 1.8%            | $180,000                         | Extreme loss coverage, insurance |
| Growth & Advertising Treasury    | 1.2%            | $120,000                         | Marketing, investor returns, expansion |
| veASSIST Stakers (Yield)         | 1.2%            | $120,000                         | Long-term holders + governance |
| Weekly Usage Airdrop             | 0.6%            | $60,000                          | Active users + late joiners |

### 1.3 Yield Model (Revenue-Based, Not Fixed)

**Formula**:
```
Monthly Yield for veASSIST Stakers = (Platform Revenue × 40%) / Total veASSIST Supply
```

**Example**:
- Monthly platform fees = $100,000
- Amount to stakers = $40,000
- Total veASSIST staked = 10,000,000
- Yield = **4.8% that month** (variable)

**Important**: Yield is **not guaranteed**. It scales directly with actual platform success. This protects the project from unsustainable promises.

### 1.4 Inflation / Deflation Management

**Deflationary Mechanisms**:
- **15% of all lost dispute bonds** → Buyback & Burn $ASSIST
- **20% of platform fees** → Treasury Stability Reserve (used for price support buybacks)
- Creates constant buy pressure, especially during high dispute periods

**Controlled Inflation**:
- Weekly Usage Airdrop distributes tokens to active users and stakers
- Prevents early whales from capturing all value
- Late joiners can still earn meaningfully through usage

**Stability Strategy**:
- Treasury maintains a **Stability Reserve**
- During high sell pressure, treasury can buy back $ASSIST to support price
- Goal: Keep $ASSIST relatively stable vs USDC for easier exits

### 1.5 20% Growth & Advertising Treasury

- Funded by 1.2% of total platform fees
- Vested linearly over **24 months**
- Used for:
  - Aggressive marketing (especially Las Vegas pilot)
  - Investor attraction
  - Strategic partnerships
  - Bonus rewards for top community promoters

### 1.6 Users as "Platform Owners"

**How Users Benefit**:

1. **Direct Revenue Share** (veASSIST holders)
2. **Governance Rights** (vote on fees, features, treasury spending)
3. **Advertising Rewards** (earn from Growth Treasury for referrals and promotion)
4. **Long-term Token Appreciation** (through buybacks and platform growth)

---

## 2. Dispute Resolution System (Extremely Detailed)

### 2.1 Core Principles
- No central authority
- No plutocracy (quadratic voting + reputation weighting)
- Fair to both users and assistants
- Strong protections against scammers on both sides

### 2.2 Full Dispute Flow

1. **Optimistic Window** (48 hours)
   - Auto-release to assistant if no dispute

2. **Dispute Raised**
   - User posts $10–25 USDC bond
   - Assistant's collateral is locked

3. **Evidence Period** (24–48 hours)
   - Both parties submit IPFS evidence with cryptographic timestamps

4. **Jury Selection**
   - Random selection from 85th percentile reputation pool
   - 5–9 jurors

5. **Voting**
   - Quadratic voting (prevents whale dominance)
   - Reputation-weighted influence

6. **Resolution**
   - Winner takes both bonds + possible compensation
   - Loser loses bond + portion of collateral

7. **Public Outcome Voting**
   - Anyone can rate outcome quality (1-5 stars)
   - Max 10% influence on future jury fairness score
   - Creates public accountability

8. **Appeals** (High-value only)
   - Available for disputes > $150
   - 2x appeal bond required
   - Larger jury (15–21 members)

### 2.3 Jury System Details

**Eligibility**:
- Minimum 85th percentile reputation
- Minimum stake requirement
- Must have completed 3+ orders

**Incentives**:
- 10% of lost bonds as $ASSIST rewards
- Reputation boost
- Priority for future high-value disputes

**Fallback Mechanism**:
- If < 60% acceptance → Expand to 80th percentile + 50% higher reward

### 2.4 Anti-Gamification & Bias Mitigation

- Quadratic voting (both jury and outcome voting)
- Reputation decay for bad actors
- Minimum view time for outcome voting
- Soulbound reputation (non-transferable)
- On-chain ban list

---

## 3. Assistant Earnings & Comparison

### 3.1 How Much Assistants Actually Earn

**BlockAssist Model**:
- Assistant keeps **~94%** of order value (after 6% platform fee)
- Plus potential yield from staking $ASSIST
- Plus tips
- Plus possible advertising/referral bonuses from Growth Treasury

**Example** ($50 delivery order):
- BlockAssist: Assistant keeps **$47** + possible yield + tips
- Uber Eats: Driver typically keeps ~$35–38 (after fees + commission)

### 3.2 Comparison Table

| Platform       | Platform Take | Driver/Assistant Take | Notes |
|----------------|---------------|------------------------|-------|
| **BlockAssist**   | **~6%**      | **~94%**              | + staking yield + tips + referral bonuses |
| Uber Eats      | 25–30%       | ~70–75%               | High commission + hidden fees |
| DoorDash       | 20–25%       | ~75–80%               | Varies by market |
| Postmates      | 20–30%       | ~70–80%               | Acquired by Uber |
| Instacart      | 15–20%       | ~80–85%               | Shopper model |

**Key Advantage**: Assistants on BlockAssist keep significantly more money while also having ownership upside through staking and governance.

---

## 4. Governance Rules

- veASSIST holders can vote on:
  - Platform fee changes
  - New feature priorities
  - Treasury spending from Growth fund
  - Token inflation proposals (max 8% annual cap)
  - Dispute system parameter changes
- Quadratic voting applied to all major votes
- 30-day timelock on significant changes
- Proposal threshold: Minimum veASSIST stake required

---

## 5. Procedure for Issuing More Tokens

- Only possible through **governance vote**
- Maximum **8% annual inflation** cap
- Requires 2/3 majority of veASSIST holders
- 30-day timelock before implementation
- Must include clear justification and economic impact analysis

---

## 6. Growth Potential & Projections

**Conservative Path (Year 1–2)**:
- 5,000 MAU in Las Vegas
- $80k monthly platform fees
- Token price: Stable to +30%
- Yield: 3–6% variable

**Base Case (Year 3–4)**:
- 25,000 MAU (Las Vegas + 2 cities)
- $400k monthly fees
- Token price: +150–300%
- Strong deflation from buybacks

**Optimistic Path (Year 5+)**:
- 100,000+ MAU across 5+ cities
- $2M+ monthly fees
- Significant token appreciation
- Platform becomes category leader in decentralized gig economy

---

## 7. Risk Scenarios & Mitigations

| Risk                    | Likelihood | Impact | Mitigation |
|-------------------------|------------|--------|----------|
| High dispute volume     | Medium     | Medium | More buybacks + better UX |
| Low user adoption       | Medium     | High   | 20% Growth Treasury for marketing |
| Regulatory pressure     | Low        | High   | Legal deferral + modular architecture |
| Token price volatility  | High       | Medium | Treasury stability reserve + buyback strategy |

---

**This specification is designed to be the single source of truth for BlockAssist's architecture, economics, and governance.**