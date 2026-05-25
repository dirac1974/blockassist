# BlockAssist v2.1 - Decentralized Dispute Resolution System

**Version**: 2.1 (May 25, 2026)
**Status**: Fully Specified

## Overview
This document defines a fair, decentralized, anti-plutocratic dispute resolution system for BlockAssist.

### Core Goals
- No central authority
- Prevent token whale dominance
- Fair to both users and assistants
- Strong anti-scam protection
- Scalable and incentivized

## System Architecture

### 1. Optimistic Resolution (Default)
- 48-hour window after delivery
- Auto-release if no dispute raised

### 2. Dispute Flow
1. User raises dispute + posts bond ($10-25 USDC)
2. Assistant's collateral is locked
3. 24-48 hour evidence period
4. Jury selection (Reputation-weighted + Quadratic Voting)
5. Voting & Resolution
6. Penalties + Possible Ban

### 3. Jury System
- **Reputation Threshold**: 85th percentile (recommended)
- **Jury Size**: 5-9 members (random selection)
- **Voting**: Quadratic Voting
- **Incentives**: Small reward from dispute fees + reputation boost
- **Fallback**: If < 60% acceptance rate, expand pool to 80th percentile + increase reward by 50%

### 4. Appeals
- High-value disputes (> $150) can appeal to larger jury (15-21 members)
- Appeal bond required from loser of first round

### 5. Funding
- 15% of lost bonds go to Dispute Treasury
- 10% of lost bonds go to Jury Rewards
- Remaining goes to winner + platform insurance

## Smart Contract Integration
- New `Dispute.sol` program
- Integrates with:
  - Escrow (locks funds)
  - Reputation (updates scores)
  - Collateral (slashing)
  - Governance (bans)

## Anti-Abuse Measures
- Minimum reputation + stake to raise dispute
- Quadratic voting
- Reputation decay for bad actors
- On-chain ban list (soulbound)

## Simulations
See separate section below for detailed scenarios.