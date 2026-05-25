# BlockAssist v2.1 - Complete Detailed Specification (Updated)

**Version**: 2.1 | **Date**: May 25, 2026

## Executive Summary

BlockAssist is a decentralized gig platform focused on delivery and tasks. Key update: Assistants earn the **delivery fee + tip** (not the full order value). Restaurants receive payment separately.

---

## 1. Assistant Earnings Model (Updated)

### How Assistants Get Paid

**Assistants do NOT receive the full order price.**

**Correct Model**:
- User pays the **restaurant directly** for the food/items
- User pays the **assistant separately** for the delivery service (delivery fee + tip)

**Assistant Earnings**:
- Base delivery fee (set by platform or negotiated)
- Tip from user
- Possible staking yield from $ASSIST
- Possible referral/advertising bonuses from Growth Treasury

**Example** ($50 food order):
- User pays restaurant $50 directly
- User pays assistant $8 delivery fee + $5 tip = **$13 total**
- Assistant keeps ~94% of the $13 after platform fee

---

## 2. Restaurant Payment Mechanism (Critical Component)

### Recommended Solution: Hybrid Model (Clean & Decentralized-Friendly)

**Phase 1 (Launch - Recommended)**: **User Pays Restaurant Directly**

**How it works**:
1. User browses restaurant menu (via platform or restaurant's own app/website)
2. User places order and **pays restaurant directly** (card, cash, Apple Pay, etc.)
3. Platform matches user with assistant for delivery
4. User pays assistant **delivery fee + tip** through the platform (USDC escrow)
5. Assistant picks up food and delivers it

**Advantages**:
- No complex restaurant integration needed at launch
- Reduces platform liability
- Cleaner for decentralized model
- Faster time-to-market
- Similar to how many independent delivery services work

**Phase 2 (Future)**: Optional Platform-Mediated Restaurant Payments
- Platform can hold funds in escrow and release to restaurant upon pickup confirmation
- Requires restaurant onboarding and API integration
- Higher complexity but better user experience

### Why This Matters

Unlike Uber Eats (where Uber handles everything), BlockAssist is assistant-focused. The cleanest solution is to separate:
- **Food payment** (user → restaurant)
- **Delivery service payment** (user → assistant via platform)

This avoids the need for the platform to act as a payment processor for thousands of restaurants at launch.

---

## 3. Updated Assistant Pay Comparison

| Platform       | Assistant Take-Home          | Notes |
|----------------|------------------------------|-------|
| **BlockAssist**   | **~94% of delivery fee + tip** | Plus staking yield + referral bonuses |
| Uber Eats      | ~70-75% of full order        | High platform commission |
| DoorDash       | ~75-80% of full order        | Varies by market |
| Postmates      | ~70-80% of full order        | Acquired by Uber |

**Key Insight**: On BlockAssist, assistants earn a **higher percentage** of the delivery service value and have ownership upside through staking.

---

## 4. Full Tokenomics (Reconciled)

**Fee Split (6% of delivery fee only)**:
- Ops: 1.2%
- Insurance: 1.8%
- Growth Treasury: 1.2%
- veASSIST Stakers: 1.2%
- Usage Airdrop: 0.6%

**Yield**: Variable based on actual platform revenue from delivery fees.

---

## 5. Dispute System Integration

Disputes can cover:
- Late delivery
- Wrong items (assistant fault)
- Stolen/missing items
- User false claims

The system remains unchanged and robust.

---

**This model allows BlockAssist to launch faster while maintaining a clean, decentralized-friendly structure.**