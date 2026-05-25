# Dispute Resolution Simulations (v2.1)

## Scenario 1: Fake Delivery by Assistant
**Case**: User claims delivery never arrived. Assistant uploaded fake photo.
**Evidence**: User provides timestamped GPS + chat logs showing no delivery. Assistant photo has metadata mismatch.
**Jury Decision**: Assistant loses. Loses bond + 30% collateral.
**Outcome**: Funds returned to user + assistant banned after 2nd offense.

## Scenario 2: False Claim by User
**Case**: User claims items missing. Assistant has photo + timestamp of correct delivery.
**Evidence**: Clear proof from assistant. User has no supporting evidence.
**Jury Decision**: User loses. Loses bond. Reputation score drops significantly.
**Outcome**: User flagged. Repeated false claims = ban.

## Scenario 3: Late Delivery Dispute
**Case**: Delivery was 45 minutes late. User wants full refund.
**Evidence**: Both sides have valid timestamps. No clear fraud.
**Jury Decision**: Partial win for user (50% refund). No penalties to either party.
**Outcome**: Fair compromise. Both parties keep reputation intact.

## Key Learnings from Simulations
- System handles clear fraud well
- Ambiguous cases result in compromises
- Reputation system prevents repeat offenders
- Quadratic voting prevents whale dominance