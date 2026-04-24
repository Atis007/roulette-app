# Drinking Roulette

A mobile party game built with React Native and Expo. Players take turns spinning a roulette wheel — the selected player draws a question card and must answer or drink.

## Tech Stack

- **Expo** SDK 55
- **React Native** 0.83
- **TypeScript**
- **React Navigation** v7 (native stack)
- **expo-sqlite** — local question database (EN + HU)

## Screens

| Screen | Description |
|---|---|
| Home | App entry, language/theme selection |
| GameType | Choose game mode (Roulette / Never Have I Ever) |
| Players | Enter player names |
| Spinner | Animated roulette wheel, selects the active player |
| NeverHaveIEver | Card-based Never Have I Ever mode |

## Features

- English and Hungarian question sets (SQLite `.db` files)
- Animated spinning wheel with player assignment
- Bouncy press-feedback buttons
- Responsive layout utility for all screen sizes

## Getting Started

```bash
npm install
npx expo start
```

Scan the QR code with the **Expo Go** app on your phone, or press `a` for Android emulator / `i` for iOS simulator.

## Project Structure

```
src/
├── components/     # Reusable UI components
├── context/        # GameContext (global state)
├── data/           # SQLite question databases + translations
├── screens/        # All app screens
├── types/          # Navigation types
└── utils/          # Database helpers, responsive util
```
