# Drinking Roulette

A mobile party drinking game built with **React Native** and **Expo**. Players enter their names, spin a roulette wheel, and the selected player must honestly answer a question — or drink. Supports two game modes, two languages, and runs on both Android and iOS via Expo Go.

---

## Game Modes

### 🎡 Roulette
Players spin an animated wheel that randomly lands on one of the registered players. That player draws a question from the deck and must either answer truthfully or take a drink.

### 🃏 Never Have I Ever
Classic card-based mode. A statement is revealed each round — anyone who has done it drinks.

---

## Features

- **Two languages** — English and Hungarian question sets, stored in local SQLite databases
- **Animated spinner** — smooth wheel animation with player name segments
- **Bouncy buttons** — press-feedback animation on all interactive elements
- **Responsive layout** — adapts to all screen sizes and orientations
- **No internet required** — fully offline, all data is bundled with the app

---

## Tech Stack

| Layer | Library / Tool |
|---|---|
| Framework | Expo SDK 55 |
| Runtime | React Native 0.83 |
| Language | TypeScript |
| Navigation | React Navigation v7 (native stack) |
| Database | expo-sqlite (bundled `.db` files) |
| State | React Context API |

---

## Project Structure

```
roulette-app/
├── src/
│   ├── components/         # BouncyButton, ScreenWrapper
│   ├── context/            # GameContext — global game state
│   ├── data/               # questions.db (EN), questions_hu.db (HU), translations.ts
│   ├── screens/
│   │   ├── HomeScreen          # Entry screen
│   │   ├── GameTypeScreen      # Mode selection
│   │   ├── PlayerInputScreen   # Add/remove players
│   │   ├── SpinnerScreen       # Animated roulette wheel
│   │   └── NeverHaveIEverScreen
│   ├── types/              # Navigation type definitions
│   └── utils/              # database.ts, responsive.ts
├── App.tsx                 # Root navigator setup
├── app.json                # Expo config
└── package.json
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Expo Go](https://expo.dev/go) app on your phone

### Install & Run

```bash
cd roulette-app
npm install
npx expo start
```

Scan the QR code with **Expo Go** (Android) or the Camera app (iOS). Alternatively:

```bash
npx expo start --android   # Android emulator
npx expo start --ios       # iOS simulator (macOS only)
```

---

## Requirements

- Android 6.0+ or iOS 13+
- Expo Go app for development builds
