# Drinking Roulette

A mobile party drinking game built with **React Native** and **Expo**. Players enter their names, spin a roulette wheel, and the selected player must answer a question — or drink. Supports two game modes, three content ratings, two languages, and runs on both Android and iOS via Expo Go.

---

## Game Modes

### 🎡 Truth or Dare (Roulette)
Players spin an animated wheel that lands on one of the registered players. That player chooses **Truth** or **Dare** and gets a question from the deck. Fully shuffled question pool — no repeats until every question has been seen.

### 🃏 Never Have I Ever
Classic mode. A statement is revealed each round — anyone who has done it drinks. No player list needed, jump straight in from the game type screen.

---

## Features

- **Three content ratings** — PG / PG-13 / R selected on the home screen; all question pools filtered accordingly
- **Two languages** — English and Hungarian question sets, stored in separate bundled SQLite databases
- **Fair spinner** — weighted random selection with recency decay; the same player cannot be picked three times in a row
- **No question repeats** — questions are shuffled on load and served via a pointer; the deck reshuffles only after every question has appeared
- **Animated spinner wheel** — smooth SVG wheel with player name segments and a spring pointer
- **Bouncy buttons** — press-feedback animation on all interactive elements
- **Responsive layout** — adapts to all screen sizes
- **Offline** — fully offline, all data is bundled with the app

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
│   ├── context/            # GameContext — players, questions, deck pointer, language
│   ├── data/               # questions.db (EN), questions_hu.db (HU), translations.ts
│   ├── screens/
│   │   ├── HomeScreen          # Rating selection (PG / PG-13 / R)
│   │   ├── GameTypeScreen      # Mode selection (Truth or Dare / Never Have I Ever)
│   │   ├── PlayerInputScreen   # Add / edit / remove players
│   │   ├── SpinnerScreen       # Animated roulette wheel + question modal
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

## Question Data

Questions are stored in two SQLite databases bundled with the app:

- `src/data/questions.db` — English
- `src/data/questions_hu.db` — Hungarian

---

## Requirements

- Android 6.0+ or iOS 13+
- Expo Go app for development builds
