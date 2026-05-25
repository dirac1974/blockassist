# BlockAssist v2.1 - Full Technical & Economic Specification

**Version**: 2.1 | **Date**: May 25, 2026

## Chain Selection Rationale

### Why Solana?

We chose **Solana** as the primary blockchain for BlockAssist after careful evaluation of multiple chains (including Polygon, Base, Arbitrum, and Sui).

**Key Reasons**:

1. **Performance & Throughput**
   - Solana offers significantly higher real-world TPS (2,000–5,000+) compared to Polygon (~100–300).
   - Sub-second finality (400ms blocks, improving to ~150ms with Alpenglow).
   - Critical for a high-volume consumer app with frequent small transactions (orders, bids, ratings, disputes).

2. **Extremely Low Fees**
   - Transaction costs are typically under $0.001 (often ~$0.00025).
   - This is essential for achieving our target of ~6% platform fees (vs Uber's 25–30%).
   - Polygon fees would have made the low-fee model much harder to sustain at scale.

3. **Consumer App Ecosystem (2026)**
   - By mid-2026, Solana has become the leading chain for high-volume consumer applications (DePIN, social, gaming, payments).
   - Excellent tooling (Anchor, Helius, Solana Mobile Stack).
   - Strong mobile and real-world adoption.

4. **Cost Efficiency for Gig Economy**
   - A delivery/gig platform generates many micro-transactions.
   - Solana's low cost allows us to keep fees low while maintaining profitability.

### Why Not Polygon?

While Polygon is a strong chain with excellent EVM compatibility and a mature ecosystem, it did not meet our specific requirements:

- Lower throughput and higher fees compared to Solana
- Less optimal for high-frequency consumer use cases
- Better suited for DeFi or enterprise applications where EVM compatibility is more critical

### Future-Proofing

Although Solana is our primary chain, the mobile app architecture (React Native + Expo) is largely chain-agnostic. We have designed the system to allow future expansion to other chains (via Wormhole or similar bridges) if needed.

**Final Decision**: Solana provides the best combination of speed, cost, and consumer ecosystem fit for BlockAssist's goals.