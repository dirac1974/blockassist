# BlockAssist v2.1 - Full Technical & Economic Specification

**Version**: 2.1 | **Date**: May 25, 2026

## 1. Program Overview & Design Purpose

BlockAssist is a decentralized, cross-platform (Android + iOS) gig economy platform built on Solana. It connects users with assistants for delivery, tasks, and custom jobs using USDC escrow, collateral, and a fair dispute system.

**Core Goals**:
- Reduce platform fees from 25-30% (Uber model) to ~6%
- Give users and assistants real ownership via tokenomics
- Ensure fair, decentralized dispute resolution
- Maintain long-term token stability and sustainable growth

## 2. Architecture Components

### 2.1 Smart Contracts (Anchor Programs)
- **Registry**: User/assistant profiles + reputation
- **Escrow**: USDC payment locking and release
- **Collateral**: USDC staking for assistants
- **Marketplace**: Fast orders + custom job bidding
- **Dispute**: Full decentralized resolution system (detailed below)
- **Reputation**: Soulbound scoring + outcome voting
- **Governance**: veASSIST voting + parameter changes

### 2.2 Mobile App (React Native + Expo)
- Cross-platform (Android 8.0+ / iOS 14+)
- Privy wallet integration
- Las Vegas-specific features (Event Matching, Hot Zones, Tourist Mode, Night Mode)

### 2.3 Tokenomics ($ASSIST)
- **Primary Model**: Hybrid veASSIST + Usage Airdrop + Revenue Share
- **Yield**: Variable (tied to actual platform revenue)
- **20% Growth Treasury**: Vested over 24 months for marketing/investors
- **Deflation**: Buyback & burn from dispute bonds + fees
- **Stability**: Treasury reserve + controlled distribution

## 3. Dispute Resolution System (Full Details)

**Core Principles**:
- No central authority
- No plutocracy (quadratic voting + reputation weighting)
- Fair to both users and assistants
- Strong anti-scam protections

**Flow**:
1. Optimistic 48-hour window (auto-release)
2. Dispute raised + dual bonding
3. Evidence submission (IPFS + timestamps)
4. Jury selection (85th percentile reputation, random)
5. Quadratic voting + resolution
6. Penalties + possible bans
7. Public outcome voting (1-5 stars, low weight)

**Jury Incentives**:
- 10% of lost bonds as rewards
- Reputation boost
- Fallback pool with 50% reward increase if low acceptance

**Appeals**: Available for disputes > $150 with 2x bond

**Public Viewer**: Anyone can view disputes (Open Courtroom) with outcome quality voting

## 4. Tokenomics Deep Dive

**Fee Split (6% Total)**:
- Ops: 1.2%
- Insurance: 1.8%
- Growth Treasury (20%): 1.2%
- veASSIST Stakers: 1.2%
- Usage Airdrop: 0.6%

**Yield Calculation**:
Yield = (Platform Revenue × 40%) / Total veASSIST Supply

**Inflation/Deflation**:
- Deflation: 15% of lost bonds + 20% of fees → Buyback & Burn
- Inflation: Controlled usage airdrops
- Stability: Treasury reserve for price support

**Issuing More Tokens**:
- Only through governance vote
- Max annual inflation cap: 8%
- Requires 2/3 veASSIST majority + 30-day timelock

## 5. Governance Rules

- veASSIST holders vote on:
  - Fee changes
  - New feature priorities
  - Treasury spending
  - Token inflation proposals
  - Dispute system parameter changes
- Quadratic voting applied
- 30-day timelock on major changes

## 6. Growth Potential & Projections

**Conservative Path** (Year 1-2):
- 5,000 monthly active users in Las Vegas
- $80k monthly fees
- Token price stable with gradual growth

**Optimistic Path** (Year 3-5):
- Expansion to 5+ cities
- 50,000+ MAU
- $1M+ monthly fees
- Strong deflation + demand = significant token appreciation

**Risk Scenarios**:
- High dispute volume: More buybacks but potential user churn
- Low adoption: Treasury used for aggressive marketing
- Regulatory issues: Legal deferral allows time to adapt

## 7. Behavior Mitigation

- **Scammers**: Heavy collateral slashing + bans
- **Whales**: Quadratic voting + reputation weighting
- **Customer Bias**: Low weight (10%) on outcome voting
- **Jury Collusion**: Random selection + reputation decay

This system is designed for sustainable, fair, long-term growth with strong protections against abuse.