# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Frontend (root):**

```bash
yarn dev          # Start Next.js dev server on localhost:3000
yarn build        # Production build
yarn lint         # ESLint
yarn prettier     # Format all files
yarn prettier:check  # Check formatting without writing
```

**Backend (`Backend/` folder):**

```bash
cd Backend && yarn dev   # Start Express/Socket.io server on port 3001 (uses nodemon)
```

For local multiplayer development, both frontend and backend must run simultaneously. Toggle fetch URLs in `src/app/game-room/lobby/` files between production and `localhost:3001` as noted in the README.

## Architecture

This is a party/drinking games web app for the Abakus student association. It's a **Next.js 15 App Router** project with a **separate Node.js/Express backend** for real-time multiplayer.

### Frontend (`src/`)

All pages use `"use client"` and are wrapped in `BeerContainer` (themed beer-styled container). Game pages consistently include `BackButton` (links to `/#games`), `Footer`, and use the `lilita` font for titles.

**Context & hooks:**

- `src/context/SocketContext.tsx` — Global Socket.io provider wrapping the entire app in `layout.tsx`
- `src/hooks/useGameSocket.ts` — Custom hook for all multiplayer room logic (joining, hosting, game phases, scoring)

**Single-player games** manage state locally with `useState`/`useEffect` and persist progress via `localStorage`. Many use Swiper for card-based navigation.

**Multiplayer game rooms** (`/game-room/`) use `useGameSocket(roomCode)` which handles host/player roles, real-time phase transitions, and Socket.io events.

### Backend (`Backend/`)

Express + Socket.io server with MongoDB (Mongoose). Structure:

- `server.js` — Entry point, wires up Express and Socket.io
- `handlers/` — Socket event handlers per game mode: `roomHandlers.js`, `guessingHandlers.js`, `challengeHandlers.js`, `aliasHandlers.js`
- `models/` — Mongoose schemas (`Room.js`, `Word.js`); rooms use TTL for auto-cleanup

Requires a `.env` file with `MONGO_URI` and `PORT=3001`.

### Key Libraries

- **Tailwind CSS** + **Radix UI** — Styling and accessible primitives
- **Three.js** + **@react-three/fiber** — 3D dice rendering in `/dice`
- **Framer Motion** — Animations
- **Swiper** — Card-based game UIs (questions, six-minutes)
- **Socket.io-client** — Real-time multiplayer communication
- **Firebase** — Integrated for some backend services
