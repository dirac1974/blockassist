# Critical Gamification & Bias Analysis (v2.1)

**Date**: May 25, 2026

## Identified Risks & Mitigations

### 1. Customer Bias in Outcome Voting
**Risk**: Most voters are customers → inherent bias against assistants.
**Mitigation**:
- Outcome voting has **very low weight** (max 10% influence on jury fairness score)
- Only verified users (completed 3+ orders) can vote
- Quadratic weighting on outcome votes too

### 2. Jury Collusion
**Risk**: Groups of assistants coordinate to protect each other.
**Mitigation**:
- Random selection from large qualified pool
- Reputation decay for jurors who consistently vote against clear evidence
- On-chain audit trail of all votes

### 3. Reputation Farming
**Risk**: People create multiple accounts to boost reputation.
**Mitigation**:
- Minimum 3 completed orders + KYC-light verification for jury eligibility
- Soulbound reputation (non-transferable)

### 4. False Evidence Uploads
**Risk**: Users/assistants upload fake photos or edited timestamps.
**Mitigation**:
- All evidence must include cryptographic timestamp + device metadata
- AI-assisted fraud detection (future)
- Heavy penalties for proven fake evidence

### 5. Appeal Abuse
**Risk**: Losers appeal every time to delay resolution.
**Mitigation**:
- Appeal bond = 2x original bond
- Only allowed for disputes > $150
- Loser of appeal pays all costs

### 6. Low-Effort Outcome Voting
**Risk**: People vote randomly or maliciously on outcome quality.
**Mitigation**:
- Only verified users can vote
- Minimum 30 seconds spent viewing evidence before vote is recorded
- Outcome voting has limited impact (max 10% weight)

**Overall Assessment**: System is robust against most attacks. Main remaining risk is customer bias in outcome voting, which is heavily mitigated by low weighting.