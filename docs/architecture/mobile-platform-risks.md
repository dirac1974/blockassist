# Mobile Platform Risks & Runbooks

**Owner**: Mobile Lead
**Status**: Initial; refined per release.
**Closes**: `ADV-D-011` (see `docs/adversarial/v2.1-review-deep-dive.md` §D).

Living document. Update when SDK versions change, store policy changes, or a real-world incident teaches us something.

---

## 1. Passkey support

| Platform | Backing | AutoFill | Required server config | Minimum OS |
|---|---|---|---|---|
| iOS  | iCloud Keychain | System sheet | `apple-app-site-association` on app domain | iOS 16+ |
| Android | Google Password Manager *or* user-chosen credential manager (Samsung Pass, 1Password, …) | Varies | `assetlinks.json` on app domain | Android 14+ for reliable passkeys; older Android has spotty support |
| Web  | Browser-native WebAuthn | Browser sheet | Same `.well-known/` files | Modern browsers only |

**Risks**:
- Working iOS does not imply working Android. Test on real Android 12/13/14 devices and Pixel + Samsung at minimum.
- Custom OEM Android skins (Samsung One UI, Xiaomi MIUI) may break credential manager flows.
- A passkey-not-supported fallback is mandatory (recovery email + magic link).

**Runbook**:
- Before any release, run the passkey flow on: latest iOS, iOS 16 (minimum), latest Android, Android 14, Android 12 (or document exclusion).
- Capture screenshots of the system sheet on each platform for support.

---

## 2. Privy Expo integration

`@privy-io/expo` requires native modules. Implications:

- **Expo Go is not usable** for development. Need a custom dev client (`expo run:ios` / `expo run:android` or EAS Build).
- **Version pinning matters.** The current `mobile/package.json` has a placeholder `^0.XX.X` for `@privy-io/expo` — replace with a real version before any `npm install` succeeds.
- **Hermes vs JSC**: confirm Privy SDK supports the JS engine you ship. Default Hermes is preferred but not always supported by every SDK.

**Runbook**:
1. Pick a Privy SDK version. Pin exactly (no `^`).
2. Build a dev client locally first; verify passkey works.
3. Add EAS Build profile for CI. Configure secrets via EAS, never commit.

---

## 3. Expo Router / deep linking

- Deep links work differently on iOS Universal Links and Android App Links.
- iOS: requires `applinks:<host>` in entitlements + `apple-app-site-association` JSON.
- Android: requires `intent-filter` in manifest + `assetlinks.json`.
- Web preview (`expo start --web`) does NOT exercise deep-link semantics; do not rely on it for testing.

**Runbook**:
- Maintain `mobile/app.config.ts` with `ios.associatedDomains` and `android.intentFilters`.
- Verify deep links monthly using Apple's tool + Google's `adb` verify command.

---

## 4. App Store / Play Store policy traps

### Apple App Store

- Crypto wallets allowed, reviewed by specialized team.
- First submission may take 7–14 days. Plan for it.
- Reject triggers we know about:
  - In-app token sales or staking interfaces.
  - "Speculative" or "investment" language in App Store screenshots.
  - Unclear KYC flow.
- Submit a token-staking-free build first. Add token features (if any) via web only.

### Google Play

- Crypto allowed; DeFi staking faces scrutiny.
- Requires "Personal & Sensitive Data" declaration covering wallet/finance.
- App may be removed mid-pilot if policy is updated; have a PWA fallback URL.

**Runbook**:
- Maintain a "review-safe build" branch that omits any features that have triggered review issues before.
- Keep App Store and Play Store reviewer notes in `docs/operations/store-review-notes.md` (create when needed).
- For removed-mid-pilot scenario: web app at the canonical domain mirrors core flows (post listing, accept, message, dispute) so the protocol continues.

---

## 5. Push notifications & order timing

- APNs (iOS) and FCM (Android) are reliable in aggregate but not guaranteed for any single message.
- Optimistic-release windows that depend on a user noticing a push are brittle.

**Design rules**:
- Don't bind release decisions to push delivery.
- Use multiple channels: in-app banner, push, email, SMS for high-value orders.
- Challenge windows ≥ 72h tolerate intermittent push delivery.
- Send a `T-24h` reminder via *email* in addition to push, since email retries.

---

## 6. Cross-platform UI checks (visual regression)

What looks fine on iPhone often breaks on Android (text overflow, status bar, safe areas).

**Runbook before any release**:
- Snapshot tests on at least: iPhone 15 (large screen), iPhone SE (small screen), Pixel 7 (Android stock), Samsung S22 (One UI).
- Verify safe areas with `SafeAreaView` everywhere a status bar / notch overlap could occur.
- Verify keyboard avoidance on forms (create-listing especially).

---

## 7. Local secure storage

- iOS: Keychain.
- Android: EncryptedSharedPreferences (Tink-backed) or Keystore-backed.
- Expo: `expo-secure-store` wraps the above.

**Rules**:
- No PII in `AsyncStorage` (not encrypted).
- No private keys in plaintext anywhere.
- Privy SDK stores its session in secure storage by default; verify per release.

---

## 8. Incident runbook (mobile-specific)

- **Auth broken in store version**: open a Play Store / App Store rollback or post a forced-update banner.
- **Privy SDK incident**: switch to backup auth path (email magic link to a one-time signer wallet) per fallback design (open ADV-D-013 if not yet specified).
- **App store removal**: redirect users to the web PWA. Communicate via email + on-chain message (broadcast event the SDK can listen for).
