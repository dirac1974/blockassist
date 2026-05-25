# Public Dispute Viewer UI Specification

**Feature**: Open Courtroom View

**Screens**:
1. **Dispute List** (Public)
   - Filter by status (Open, Resolved, Appealed)
   - Search by order ID or assistant name
   - Show outcome quality score (average from public votes)

2. **Dispute Detail View** (Public)
   - All evidence (IPFS links)
   - Jury composition (anonymized)
   - Final verdict + penalties
   - Public outcome quality voting (1-5 stars)
   - Comment section (optional, reputation-gated)

**Access Control**:
- Anyone can view
- Only verified users (3+ orders) can vote on outcome quality
- No reward for voting (prevents farming)

**Impact on System**:
- Outcome quality score influences future jury selection (max 10% weight)
- Creates transparency and public accountability
- Helps surface biased juries over time