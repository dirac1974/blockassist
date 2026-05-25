# Cross-Platform Mobile App Update (May 25, 2026)

**Confirmed**: BlockAssist mobile app is built as a **true cross-platform application** using **React Native + Expo**.

**Supported Platforms**:
- Android 8.0 (Oreo) and above
- iOS 14 and above

**Implementation**:
- Single codebase in `/mobile`
- Uses Expo for unified development, testing, and deployment
- EAS Build for production Android APK/AAB and iOS IPA
- Platform-specific code isolated using `Platform` module when needed

**Status**: Already part of the core plan. Explicitly reinforced in v2.1.

No changes to architecture required.