# Aathichudi Release & Store Submission Checklist

## Pre-Release Verification

- [x] **Data Integrity**: Source JSON files (`avvaiyar-aathichudi.json` and `bharathiyar_aathichudi.json`) preserved unchanged.
- [x] **Total Verse Counts**:
  - Avvaiyar Aathichudi: **109** verses + Introductory Prayer (2 lines).
  - Bharathiyar Puthiya Aathichudi: **110** verses + Introductory Prayer (10 lines).
- [x] **Data Validation Script**: `npm run validate-data` passed with 0 errors.
- [x] **Automated Tests**: 29 unit tests in Jest passed (100% pass rate).
- [x] **TypeScript Strict Check**: `npm run typecheck` passed with 0 errors.
- [x] **Web Bundle Export**: `npx expo export --platform web` completed with 19 routes generated in `dist`.
- [x] **Native Prebuild**: `npx expo prebuild` completed for `./ios` and `./android`.
- [x] **Gradle Build Check**: Gradle 9.4.1 initialized with Android NDK 27.1.12297006 (`BUILD SUCCESSFUL`).
- [x] **iOS CocoaPods Check**: `pod-install` completed with 118 dependencies and `Aathichudi.xcworkspace`.
- [x] **Branding Assets**: 1024x1024 App icon, adaptive icon, splash screen, notification icon created.
- [x] **Privacy Check**: Zero advertising SDKs, zero analytics trackers, zero external network dependencies.

---

## App Store (iOS) Submission Steps

1. **Apple Developer Account**: Ensure active Apple Developer Program membership.
2. **Bundle Identifier**: Register `org.tamil.aathichudi` in Apple Developer Portal.
3. **App Store Connect Record**:
   - Create new app record for `org.tamil.aathichudi`.
   - Copy metadata from [STORE_LISTING.md](file:///Users/ravij/AntiGravityProjects/aathichudi/docs/STORE_LISTING.md).
   - Set Category: Education / Books.
   - Set Content Rights: Public domain classical literature.
4. **App Privacy Declaration**:
   - Select "Data Not Collected" (app collects 0 personal data).
5. **Build Generation**:
   - Using EAS Build: `eas build --platform ios --profile production`
   - Or locally using Xcode: Open `ios/Aathichudi.xcworkspace`, select "Any iOS Device (arm64)", Product -> Archive, and Distribute App.

---

## Google Play Store (Android) Submission Steps

1. **Google Play Console Account**: Ensure registered Google Play developer account.
2. **Application ID**: Verify `org.tamil.aathichudi` in `app.json` and `android/app/build.gradle`.
3. **Create App in Play Console**:
   - App Name: ஆத்திச்சூடி (Aathichudi)
   - Free app, no in-app purchases.
4. **Data Safety Questionnaire**:
   - Data collection: No (does not collect or share any user data).
5. **Target Audience and Content**:
   - Target age: All ages (including children 13 and under / family-friendly).
6. **Build Generation**:
   - Using EAS Build: `eas build --platform android --profile production`
   - Or locally using Gradle:
     `./android/gradlew -p android bundleRelease` (generates release AAB in `android/app/build/outputs/bundle/release/app-release.aab`).
