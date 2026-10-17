#!/usr/bin/env node

/**
 * Android Build Script for Aathichudi Expo App
 *
 * Supports building:
 *  - Standalone Release APK:  npm run build:android:apk
 *  - Google Play AAB Bundle:  npm run build:android:bundle
 *  - Debug APK:               npm run build:android:debug
 *  - Clean & Rebuild:         node scripts/build-android.js --clean
 */

const { spawnSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const ANDROID_DIR = path.join(PROJECT_ROOT, 'android');
const GRADLEW = path.join(ANDROID_DIR, os.platform() === 'win32' ? 'gradlew.bat' : 'gradlew');

// Parse CLI flags
const args = process.argv.slice(2);
const isHelp = args.includes('--help') || args.includes('-h');
const isBundle = args.includes('--bundle') || args.includes('--aab');
const isDebug = args.includes('--debug');
const isClean = args.includes('--clean');

if (isHelp) {
  console.log(`
\x1b[1m\x1b[36mAathichudi Android Build Helper\x1b[0m

Usage:
  node scripts/build-android.js [options]

Options:
  --apk       (default) Build release APK for direct installation
  --bundle    Build production Android App Bundle (.aab) for Google Play
  --aab       Alias for --bundle
  --debug     Build debug APK
  --clean     Clean Gradle project before building
  --help, -h  Show this help message

NPM Shortcuts:
  npm run build:android          Build Release APK (default)
  npm run build:android:apk      Build Release APK
  npm run build:android:bundle   Build Release AAB Bundle for Play Store
  npm run build:android:debug    Build Debug APK
  npm run build:android:clean    Clean previous build artifacts
  npm run build:android:eas      Build production bundle via EAS Cloud
  npm run build:android:eas:apk  Build preview APK via EAS Cloud
`);
  process.exit(0);
}

// 1. Verify Android project directory exists
if (!fs.existsSync(ANDROID_DIR)) {
  console.log('\x1b[33m[!] Native android/ folder not found. Running expo prebuild...\x1b[0m');
  const prebuild = spawnSync('npx', ['expo', 'prebuild', '--platform', 'android'], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
  if (prebuild.status !== 0) {
    console.error('\x1b[31m[x] Failed to prebuild Android project.\x1b[0m');
    process.exit(1);
  }
}

// 2. Verify Android SDK configuration
const localPropsPath = path.join(ANDROID_DIR, 'local.properties');
const defaultMacSdk = path.join(os.homedir(), 'Library', 'Android', 'sdk');
const defaultLinuxSdk = path.join(os.homedir(), 'Android', 'Sdk');
const envSdk = process.env.ANDROID_HOME || process.env.ANDROID_SDK_ROOT;

if (!fs.existsSync(localPropsPath)) {
  const detectedSdk = envSdk || (fs.existsSync(defaultMacSdk) ? defaultMacSdk : (fs.existsSync(defaultLinuxSdk) ? defaultLinuxSdk : null));
  if (detectedSdk) {
    fs.writeFileSync(localPropsPath, `sdk.dir=${detectedSdk}\n`, 'utf8');
    console.log(`\x1b[32m[✓] Generated android/local.properties with sdk.dir=${detectedSdk}\x1b[0m`);
  } else {
    console.warn('\x1b[33m[!] Could not auto-detect Android SDK. Ensure ANDROID_HOME is set.\x1b[0m');
  }
}

// 3. Ensure gradlew is executable on Unix
if (os.platform() !== 'win32' && fs.existsSync(GRADLEW)) {
  try {
    fs.chmodSync(GRADLEW, '755');
  } catch (e) {
    // Ignore permission set error if not owned
  }
}

// 4. Determine Gradle tasks to run
const tasks = [];
if (isClean) {
  tasks.push('clean');
}

let targetDesc = '';
let expectedOutputPath = '';

if (isBundle) {
  tasks.push('bundleRelease');
  targetDesc = 'Production Release Android App Bundle (AAB)';
  expectedOutputPath = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab');
} else if (isDebug) {
  tasks.push('assembleDebug');
  targetDesc = 'Debug APK';
  expectedOutputPath = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'debug', 'app-debug.apk');
} else {
  tasks.push('assembleRelease');
  targetDesc = 'Production Release Standalone APK';
  expectedOutputPath = path.join(ANDROID_DIR, 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk');
}

console.log('\n\x1b[1m\x1b[34m====================================================\x1b[0m');
console.log(`\x1b[1m\x1b[36m Building Aathichudi Android:\x1b[0m ${targetDesc}`);
console.log(`\x1b[1m\x1b[34m Tasks:\x1b[0m ${tasks.join(', ')}`);
console.log('\x1b[1m\x1b[34m====================================================\x1b[0m\n');

const startTime = Date.now();

const gradleProcess = spawn(GRADLEW, tasks, {
  cwd: ANDROID_DIR,
  stdio: 'inherit',
  env: process.env,
});

gradleProcess.on('error', (err) => {
  console.error('\x1b[31m[x] Failed to execute gradlew:\x1b[0m', err.message);
  process.exit(1);
});

gradleProcess.on('close', (code) => {
  const durationSec = Math.round((Date.now() - startTime) / 1000);
  if (code !== 0) {
    console.error(`\n\x1b[31m[x] Android build failed with exit code ${code} after ${durationSec}s.\x1b[0m`);
    process.exit(code || 1);
  }

  console.log('\n\x1b[1m\x1b[32m====================================================\x1b[0m');
  console.log(`\x1b[1m\x1b[32m BUILD SUCCESSFUL in ${durationSec}s\x1b[0m`);
  console.log('\x1b[1m\x1b[32m====================================================\x1b[0m');

  if (fs.existsSync(expectedOutputPath)) {
    const stats = fs.statSync(expectedOutputPath);
    const sizeMb = (stats.size / (1024 * 1024)).toFixed(2);
    const relPath = path.relative(PROJECT_ROOT, expectedOutputPath);

    console.log(`\x1b[1m\x1b[33mArtifact:\x1b[0m  ${relPath}`);
    console.log(`\x1b[1m\x1b[33mSize:\x1b[0m      ${sizeMb} MB`);
    console.log(`\x1b[1m\x1b[33mPath:\x1b[0m      ${expectedOutputPath}\n`);

    if (expectedOutputPath.endsWith('.apk')) {
      console.log('\x1b[1mTo install on a connected Android phone or emulator:\x1b[0m');
      console.log(`  \x1b[36madb install -r "${relPath}"\x1b[0m\n`);
    } else if (expectedOutputPath.endsWith('.aab')) {
      console.log('\x1b[1mReady for Google Play Store upload:\x1b[0m');
      console.log('  Upload this .aab file to Google Play Console under App Releases.\n');
    }
  } else {
    console.log('\x1b[33m[!] Build finished, but expected artifact was not found at:\x1b[0m', expectedOutputPath);
  }
});
