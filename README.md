# ஆத்திச்சூடி (Aathichudi) — Mobile Application

A production-quality, cross-platform mobile application for exploring, learning, and sharing classical Tamil ethical literature. Built with **React Native**, **Expo SDK 58**, **Expo Router**, and **TypeScript (Strict Mode)**.

Designed for readers, students, families, and lovers of Tamil literature around the world.

---

## 🌟 Key Features

- **100% Offline**: All literary works and features run locally on your device without an internet connection.
- **Zero Ads & Zero Tracking**: Completely free of advertisements, tracking analytics, and mandatory accounts.
- **Two Classical Collections**:
  - **ஔவையார் ஆத்திச்சூடி (Avvaiyar Aathichudi)**: 109 verses + Introductory Prayer (கடவுள் வாழ்த்து).
  - **மகாகவி பாரதியார் புதிய ஆத்திச்சூடி (Bharathiyar Puthiya Aathichudi)**: 110 verses + Introductory Prayer.
- **Deep Literary Content**: Includes original Tamil poem, word-by-word meaning, expanded paraphrase, Latin transliteration, and English translation.
- **WhatsApp Status & Social Card Creator**: Generates 9:16 portrait literary cards locally for sharing on WhatsApp Status, Instagram, and messaging apps.
- **Personal Collections**: Create custom study groups (e.g., Morning Wisdom, School Practice), reorder verses, and export as designed PDFs or text.
- **Full Offline Search**: Fast in-memory search across Tamil poem text, meanings, explanations, transliterations, English translations, and verse numbers.
- **Favorites & Reading Progress**: Bookmark verses, track read progress with percentage bars, and continue reading from where you left off.
- **Daily Local Notifications**: Configurable scheduled offline notifications at your preferred morning time (default: 07:00 AM) with automatic pool rotation.
- **PDF & Text Export**: Generate publication-ready PDF documents with Tamil typography and native sharing.
- **Rich Aesthetic Design**: Warm palm-leaf parchment palette with deep maroon borders, heritage gold accents, light/dark themes, and adjustable font sizes.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React Native 0.88 with Expo SDK 58 |
| **Navigation** | Expo Router (File-based routing) |
| **Language** | TypeScript in strict mode |
| **Local Persistence** | `expo-sqlite` (Native iOS/Android) + `localStorage` fallback (Web) |
| **Notifications** | `expo-notifications` (Local scheduling) |
| **Document Export** | `expo-print` (HTML to PDF) & `expo-sharing` |
| **Image Generation**| `react-native-view-shot` (Local high-resolution 9:16 PNG capture) |
| **Icons & Haptics** | `@expo/vector-icons` & `expo-haptics` |
| **Testing** | Jest 29 & Jest-Expo |
| **Build Pipeline** | EAS Build, Gradle 9.4, CocoaPods |

---

## 📁 Project Architecture

```
aathichudi/
├── app/                        # Expo Router screen routes
│   ├── _layout.tsx             # Root layout with providers & stack
│   ├── (tabs)/                 # Main bottom tab navigation
│   │   ├── _layout.tsx         # Tab layout (5 core tabs)
│   │   ├── index.tsx           # Home screen (Daily verse, shortcuts, continue reading)
│   │   ├── poets.tsx           # Poet selection screen
│   │   ├── search.tsx          # Fast offline search with filters
│   │   ├── favorites.tsx       # Favorites list & filters
│   │   └── settings.tsx        # Settings (Theme, fonts, notifications)
│   ├── poet/[poetId].tsx       # Poet detail (Introductory prayer & verse list)
│   ├── verse/[poetId]/[number].tsx # Verse reading screen with full literary details
│   ├── daily-verse.tsx         # Daily reflection & inspiration screen
│   ├── collections/            # User collections management
│   │   ├── index.tsx           # Collections list
│   │   ├── create.tsx          # Create new collection
│   │   └── [id].tsx            # Collection detail with PDF/text export
│   ├── about.tsx               # About application & mission
│   └── privacy.tsx             # In-app Privacy Policy
│
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Header.tsx          # Accessible navigation header
│   │   ├── VerseListItem.tsx   # Verse card item with status badges
│   │   ├── DailyVerseCard.tsx  # Featured daily card for Home screen
│   │   ├── PoetCard.tsx        # Poet overview card with progress indicator
│   │   ├── VerseCardImageModal.tsx # WhatsApp Status 9:16 card generator
│   │   ├── AddToCollectionModal.tsx # Add verse to personal collection modal
│   │   └── DecorativeDivider.tsx # Traditional Tamil floral motif divider
│   ├── data/                   # Bundled literary content layer
│   │   ├── loader.ts           # Cached data loader, queries & daily verse rotation
│   │   ├── normalize.ts        # Normalization logic for source JSON data
│   │   ├── schemas.ts          # Raw JSON schemas & interfaces
│   │   └── validate.ts         # In-app validation utilities
│   ├── database/               # Local persistence
│   │   ├── schema.ts           # Versioned SQLite schema & migrations
│   │   ├── repository.ts       # Native SQLite database operations
│   │   └── repository.web.ts   # Web localStorage fallback implementation
│   ├── notifications/          # Notification scheduling & permissions
│   │   ├── scheduler.ts        # Local notification scheduler with pool rotation
│   │   └── permissions.ts      # Permission handlers
│   ├── sharing/                # Export & sharing services
│   │   ├── shareText.ts        # Formatted text & clipboard copy
│   │   ├── sharePdf.ts         # Offline PDF generation with Tamil typography
│   │   └── shareImage.ts       # 9:16 card image capture and sharing
│   ├── context/
│   │   └── AppContext.tsx      # App-wide state, theme & persistence synchronization
│   ├── theme/                  # Color tokens, typography & spacing
│   ├── types/                  # TypeScript interface definitions
│   └── utils/
│       └── haptics.ts          # Safe haptics wrapper
│
├── assets/                     # Bundled source files & graphics
│   ├── avvaiyar-aathichudi.json    # Original Avvaiyar dataset (109 verses)
│   ├── bharathiyar_aathichudi.json # Original Bharathiyar dataset (110 verses)
│   ├── icons/                  # High-resolution app icons & adaptive icons
│   └── splash/                 # Splash screen brand assets
│
├── tests/                      # Automated test suites
│   ├── data.test.ts            # Data normalization, prayer & count tests
│   ├── search.test.ts          # Search filtering & Unicode tests
│   ├── repository.test.ts      # Persistent database tests
│   ├── sharing.test.ts         # Text & PDF format tests
│   └── notifications.test.ts   # Notification pool rotation tests
│
├── scripts/
│   ├── validate-data.js        # Standalone data integrity validation script
│   └── generate_branding_assets.py # Programmatic asset generator
├── docs/                       # Store release & legal documentation
│   ├── STORE_LISTING.md        # App Store & Google Play metadata
│   ├── PRIVACY_POLICY.md       # Standalone Privacy Policy
│   └── RELEASE_CHECKLIST.md    # Pre-submission release verification
│
├── app.json                    # Expo configuration
├── eas.json                    # EAS Build configuration
├── metro.config.js             # Metro bundler configuration
└── package.json                # Project dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20 or v22 (Recommended: `v22.14.0`)
- **npm**: `10.9.x`
- Optional for native builds:
  - **Android**: Android SDK (API 34+), Android NDK 27.x, OpenJDK 20+
  - **iOS**: macOS with Xcode 16+ and CocoaPods

### Installation

```bash
# Clone the repository
git clone https://github.com/nltsravi/aathichudi.git
cd aathichudi

# Install dependencies
npm install
```

---

## 💻 Running the Application

### 1. Web Preview (Immediate instant launch)
```bash
npm run web
```
Opens in your browser at `http://localhost:8081` with full navigation, search, favorites, collections, and custom themes.

### 2. Development Server
```bash
npm start
```
Starts the Metro bundler.

> **Note on Expo Go vs Development Builds**:
> This app uses **Expo SDK 58** (React Native 0.88) with native modules for SQLite, notifications, and image capture. If your mobile device has an older version of the generic Expo Go app, run a development build (`npx expo run:android` or `npx expo run:ios`) or test using the Web preview.

### 3. Native Android Run
```bash
npx expo run:android
```

### 4. Native iOS Run (macOS required)
```bash
npx expo run:ios
```

---

## 🧪 Testing & Validation

### Run Automated Unit Tests (Jest)
```bash
npm test
```
Executes all 29 automated tests across data normalization, search, SQLite persistence, sharing formatters, and notifications.

### Run TypeScript Strict Typecheck
```bash
npm run typecheck
```

### Run Data Validation Script
```bash
npm run validate-data
```
Validates the bundled `assets/avvaiyar-aathichudi.json` and `assets/bharathiyar_aathichudi.json` files, verifying verse counts, field integrity, and reporting any missing optional fields.

---

## 📦 Android & iOS Release Builds

### 📱 Android Local Builds (Fast & Free)

Build directly on your local machine using our cross-platform build helper:

```bash
# 1. Build Standalone Release APK (Direct device installation / testing)
npm run build:android
# or: npm run build:android:apk
```
- **Output**: `android/app/build/outputs/apk/release/app-release.apk`
- **Install on device via ADB**:
  ```bash
  adb install -r android/app/build/outputs/apk/release/app-release.apk
  ```

```bash
# 2. Build Release Android App Bundle (.aab) for Google Play Store upload
npm run build:android:bundle
# (alias: npm run build:android:aab)
```
- **Output**: `android/app/build/outputs/bundle/release/app-release.aab`
- **Upload**: Directly upload this `.aab` file to Google Play Console.

```bash
# 3. Clean Gradle cache & rebuild
npm run build:android:clean
```

---

### ☁️ Cloud Builds via Expo Application Services (EAS)

No local Android SDK or Mac required when building in the cloud:

```bash
# Preview APK (downloadable directly to tester phones):
npm run build:android:eas:apk

# Production AAB (for Google Play Console release):
npm run build:android:eas

# Production iOS Archive (for Apple App Store / TestFlight):
npm run build:ios:eas

# Run any EAS command without global installation:
npm run eas -- [command]
```

---

### 🍎 iOS Local Archive (macOS required)

Open `ios/Aathichudi.xcworkspace` in Xcode, select **Any iOS Device (arm64)**, and choose **Product** > **Archive**.

---

## 📜 Literary Data Integrity

- The original JSON source files remain authoritative and untouched in `assets/`.
- **Avvaiyar Aathichudi**: 109 verses. Verse #43 (*கெளவை அகற்று*) has missing optional meaning and explanation in source; the app safely renders only valid content without breaking layouts or creating empty headers.
- **Bharathiyar Puthiya Aathichudi**: 110 verses.
- Both introductory prayers (*கடவுள் வாழ்த்து*) support variant spelling properties (`paraphase` and `paraphrase`) seamlessly.

---

## 🔒 Privacy & License

- **Privacy Policy**: Detailed in [docs/PRIVACY_POLICY.md](file:///Users/ravij/AntiGravityProjects/aathichudi/docs/PRIVACY_POLICY.md) and inside the app under Settings > Privacy Policy.
- **License**: The application codebase is open for educational and literary learning. The classical poems of Avvaiyar and Mahakavi Bharati are in the public domain.
