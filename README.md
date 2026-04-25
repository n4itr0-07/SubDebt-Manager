<div align="center">
  <img src="assets/icon.png" width="120" height="120" alt="SubDebt Logo" />
  <h1>SubDebt Manager</h1>
  <p><strong>The ultimate, privacy-first Subscription & Debt Tracking application.</strong></p>

  [![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
  [![Expo](https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![Build Status](https://img.shields.io/github/actions/workflow/status/n4itr0-07/SubDebt-Manager/build.yml?branch=main&style=for-the-badge)](https://github.com/n4itr0-07/SubDebt-Manager/actions)

</div>

---

## 🚀 Overview

**SubDebt** is a beautifully crafted, highly performant financial management application engineered to help you meticulously track recurring subscriptions and outstanding debts. Built with an uncompromising focus on **privacy** and **speed**, SubDebt operates 100% offline using a blazing-fast C++ database architecture.

## ✨ Core Features

### 🔄 Advanced Subscription Tracking
- **Smart Auto-Branding:** Automatically detects popular services (Netflix, Spotify, Amazon, etc.) and seamlessly integrates their official brand icons into your dashboard.
- **Dynamic Timelines:** Visual progress bars track the exact time remaining until your next billing cycle.
- **Automated Tagging:** Subscriptions dynamically tag themselves as `Active`, `Expiring Soon`, or `Expired` based on real-time chronological calculations.

### 💸 Intelligent Debt Management
- **One-Tap Resolution:** Satisfying haptic-enabled "Mark Paid" functionality instantly resolves outstanding balances.
- **Overdue Analytics:** Delinquent debts are automatically flagged in crimson, calculating the exact number of days overdue.
- **Live Aggregation:** A real-time running ledger calculates the total pending capital owed to you at any given moment.

### ⚡ Unrivaled Performance & Privacy
- **Zero Latency:** Powered by `react-native-mmkv`, data is stored in C++ memory-mapped files, achieving synchronous 0.001ms read/write speeds.
- **Offline First:** No telemetry, no cloud servers, no hidden tracking. Your financial data is securely sandboxed on your local device.
- **Universal Portability:** A robust JSON-based backup and restore engine allows you to safely export your encrypted ledger to Google Drive, or seamlessly migrate to a new device.

## 📱 User Interface Architecture
SubDebt utilizes a completely bespoke **Glassmorphism Design System**. Every card, input field, and modal features custom semi-transparent blurring, sophisticated ambient lighting, strict dark-mode compliance, and spring-physics-based fluid animations.

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator or Android Studio (for native C++ module compilation)

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/n4itr0-07/SubDebt-Manager.git
   cd SubDebt-Manager
   ```

2. **Install dependencies:**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Compile and Run:**
   *Because SubDebt uses high-performance native C++ modules (`react-native-mmkv`), it cannot run in the standard Expo Go app. You must build a development client.*
   ```bash
   # For Android
   npx expo run:android

   # For iOS
   npx expo run:ios
   ```

---

## 📦 Automated Release Pipeline

This repository features a fully automated CI/CD pipeline integrated directly via **GitHub Actions**.

Whenever a new release tag (e.g., `v1.0.0`) is pushed to the repository, the GitHub Action will automatically:
1. Initialize the Android SDK and Java environment.
2. Execute an optimized native prebuild.
3. Compile an exclusive, highly-compressed `arm64-v8a` split APK.
4. Draft a pristine GitHub Release and attach the compiled APK for immediate public download.

To download the latest compiled version of the app, simply navigate to the **[Releases](https://github.com/n4itr0-07/SubDebt-Manager/releases)** tab of this repository.

---
<div align="center">
  <i>Engineered for elegance. Built for performance.</i>
</div>
