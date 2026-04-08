# 🐋 USDT Whale Tracker

Real-time monitoring and notification system for large USDT (Tether) transfers on Ethereum mainnet. Automatically detects transfers of **≥ 100,000 USDT**, stores them in Firebase Firestore, and delivers instant push notifications via Firebase Cloud Messaging (FCM).

---

## 📋 Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
  - [1. Clone the Repository](#1-clone-the-repository)
  - [2. Backend Setup](#2-backend-setup)
  - [3. Frontend Setup](#3-frontend-setup)
  - [4. Running with Docker](#4-running-with-docker)
- [Environment Variables](#environment-variables)
- [API Endpoints](#api-endpoints)
- [How It Works](#how-it-works)

---

## About

USDT Whale Tracker listens to the **USDT (ERC-20) smart contract** on Ethereum mainnet via WebSocket (Alchemy) and captures every `Transfer` event where the amount is **≥ 100,000 USDT**. Each qualifying transfer is:

1. **Saved** to Firebase Firestore for persistent storage and real-time queries.
2. **Broadcast** as a push notification to all subscribed clients via FCM topic messaging.
3. **Displayed** on a responsive web dashboard with real-time updates, filtering, and volume charts.

> **USDT Contract Address:** `0xdAC17F958D2ee523a2206206994597C13D831ec7`
> **USDT Decimals:** `6`

---

## Features

- **Real-time Ethereum Event Listening** — WebSocket-based monitoring of USDT Transfer events using `viem`
- **Whale Transfer Detection** — Filters transfers ≥ 100K USDT with proper decimal handling (6 decimals)
- **Automatic Reconnection** — Exponential backoff strategy for WebSocket disconnections (1s → 30s max)
- **Firebase Firestore Storage** — Persistent storage with server-side timestamps
- **FCM Push Notifications** — Topic-based broadcasting (`whale-alerts`) for real-time alerts
- **Real-time Dashboard** — Live updating transfer list via Firestore `onSnapshot` listeners
- **Search & Filter** — Filter transfers by address, transaction hash, or minimum amount (1M+, 5M+, 10M+)
- **Volume Analytics** — 6-hour volume chart (click to expand 24-hour view with 2-hour slots)
- **Responsive Design** — Mobile-first layout with breakpoints for tablet and desktop
- **Dark/Light Theme** — Toggle between dark and light modes
- **Notification Center** — In-app notification panel with unread badge counter
- **Etherscan Integration** — Direct links to addresses and transaction hashes on Etherscan
- **Pagination Controls** — Configurable page sizes (3, 5, 10, 20, 40, 50, 100)

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Backend** | [NestJS](https://nestjs.com/) | Server framework with modular architecture |
| **Frontend** | [Next.js](https://nextjs.org/) (App Router) | React-based SSR/CSR web application |
| **Web3** | [viem](https://viem.sh/) | TypeScript-first Ethereum client library |
| **Database** | [Firebase Firestore](https://firebase.google.com/docs/firestore) | Real-time NoSQL database |
| **Notifications** | [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging) | Push notification delivery |
| **Ethereum Provider** | [Alchemy](https://www.alchemy.com/) | WebSocket connection to Ethereum mainnet |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Utility-first CSS framework |
| **Containerization** | [Docker Compose](https://docs.docker.com/compose/) | Multi-service orchestration |
| **Language** | TypeScript | End-to-end type safety |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Ethereum Mainnet                         │
│              USDT Contract (ERC-20)                         │
│       0xdAC17F958D2ee523a2206206994597C13D831ec7            │
└──────────────────────┬──────────────────────────────────────┘
                       │ Transfer Events (WebSocket)
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                   Backend (NestJS :3001)                     │
│                                                              │
│  ┌──────────────────┐     ┌───────────────────────────────┐  │
│  │ EthereumService   │────▶│ FirebaseService               │  │
│  │                   │     │                               │  │
│  │ • WebSocket via   │     │ • Save to Firestore           │  │
│  │   Alchemy (viem)  │     │   (whale-transfers collection)│  │
│  │ • Watch Transfer  │     │ • Send FCM notification       │  │
│  │   events          │     │   (whale-alerts topic)        │  │
│  │ • Filter ≥ 100K   │     │ • Subscribe device tokens     │  │
│  │ • Auto-reconnect  │     │                               │  │
│  └──────────────────┘     └───────────────────────────────┘  │
│                                                              │
│  ┌──────────────────┐                                        │
│  │ AppController     │  POST /subscribe — register FCM token │
│  └──────────────────┘                                        │
└──────────────────────────────────────────────────────────────┘
                       │
          ┌────────────┼──────────────┐
          ▼            ▼              ▼
   ┌───────────┐ ┌──────────┐ ┌────────────┐
   │ Firestore │ │   FCM    │ │  Frontend  │
   │ Database  │ │  Topic   │ │ (Next.js)  │
   │           │ │  Push    │ │   :3000    │
   └─────┬─────┘ └────┬─────┘ └──────┬─────┘
         │            │              │
         │   onSnapshot (real-time)  │
         └───────────────────────────┘
```

**Data Flow:**
1. `EthereumService` connects to Alchemy WebSocket and watches USDT contract `Transfer` events
2. Events with `value ≥ 100,000 USDT` (i.e., `≥ 100_000_000_000` raw) pass the threshold filter
3. `FirebaseService` concurrently saves the transfer to Firestore and sends an FCM notification
4. Frontend receives real-time updates via Firestore `onSnapshot` listener
5. FCM delivers push notifications to subscribed browsers (foreground toast + background system notification)

---

## Project Structure

```
/
├── backend/                        # NestJS backend application
│   ├── src/
│   │   ├── ethereum/
│   │   │   ├── ethereum.module.ts
│   │   │   ├── ethereum.service.ts         # WebSocket listener & event processing
│   │   │   └── interfaces/
│   │   │       └── transfer-event.interface.ts
│   │   ├── firebase/
│   │   │   ├── firebase.module.ts          # Global module
│   │   │   └── firebase.service.ts         # Firestore + FCM operations
│   │   ├── app.module.ts
│   │   ├── app.controller.ts               # /subscribe endpoint
│   │   ├── app.service.ts
│   │   └── main.ts                         # Bootstrap (port 3001)
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── frontend/                       # Next.js frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx                  # Root layout with providers
│   │   │   ├── page.tsx                    # Main dashboard page
│   │   │   └── globals.css                 # Global styles & design tokens
│   │   ├── components/
│   │   │   ├── Header.tsx                  # Navigation bar & notification center
│   │   │   ├── TransferCard.tsx            # Individual transfer display
│   │   │   ├── TransferSkeleton.tsx        # Loading skeleton
│   │   │   ├── StatsSection.tsx            # Summary statistics
│   │   │   ├── SearchFilter.tsx            # Search & amount filter
│   │   │   ├── VolumeCard.tsx              # 24h volume chart
│   │   │   ├── AlertToggleCard.tsx         # Connection status info card
│   │   │   ├── NotificationProvider.tsx    # FCM foreground/background handler
│   │   │   ├── ThemeProvider.tsx           # Dark/light mode toggle
│   │   ├── hooks/
│   │   │   ├── useWhaleTransfers.ts        # Real-time Firestore listener
│   │   │   └── useVolumeStats.ts           # 24h volume aggregation
│   │   └── lib/
│   │       └── firebase.ts                 # Firebase client initialization
│   ├── public/
│   │   ├── firebase-messaging-sw.js        # FCM service worker
│   │   └── firebase-config.example.js      # Firebase config template for service worker
│   ├── Dockerfile
│   ├── .env.example
│   └── package.json
│
├── docker-compose.yml              # Multi-service orchestration
├── .gitignore
└── README.md
```

---

## Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Docker & Docker Compose** (optional, for containerized deployment)
- **Firebase Account** with:
  - Firestore Database (production mode)
  - Cloud Messaging (FCM) enabled
  - Service account key (for backend)
  - Web app configuration (for frontend)
  - Web Push certificate (VAPID key)
- **Alchemy Account** with:
  - Ethereum Mainnet app
  - WebSocket URL

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/usdt-whale-tracker.git
cd usdt-whale-tracker
```

### 2. Backend Setup

```bash
cd backend

# Copy environment template and fill in your values
cp .env.example .env

# Install dependencies
npm install

# Start in development mode (with hot-reload)
npm run start:dev
```

The backend will start on **http://localhost:3001**.

### 3. Frontend Setup

```bash
cd frontend

# Copy environment template and fill in your values
cp .env.example .env

# Create the Firebase config for the service worker
# Copy public/firebase-config.example.js to public/firebase-config.js
# and fill in your Firebase web app configuration
cp public/firebase-config.example.js public/firebase-config.js

# Install dependencies
npm install

# Start in development mode
npm run dev
```

The frontend will start on **http://localhost:3000**.

### 4. Running with Docker

To run both services with a single command:

```bash
# From the project root
docker-compose up --build
```

This will start:
- **Backend** on port `3001`
- **Frontend** on port `3000`

To run in detached mode:

```bash
docker-compose up --build -d
```

To stop:

```bash
docker-compose down
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `ALCHEMY_API_KEY` | Alchemy API key | `abc123...` |
| `ALCHEMY_WSS_URL` | Alchemy WebSocket URL | `wss://eth-mainnet.g.alchemy.com/v2/your_key` |
| `FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-12345` |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email | `firebase-adminsdk@...iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key | `-----BEGIN PRIVATE KEY-----\n...` |
| `USDT_CONTRACT_ADDRESS` | USDT contract address | `0xdAC17F958D2ee523a2206206994597C13D831ec7` |
| `USDT_TRANSFER_THRESHOLD` | Minimum USDT amount to track | `100000` |

### Frontend (`frontend/.env`)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Firebase web API key | `AIzaSy...` |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Firebase project ID | `my-project-12345` |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket | `project.appspot.com` |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID | `123456789` |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | Firebase app ID | `1:123:web:abc` |
| `NEXT_PUBLIC_FIREBASE_VAPID_KEY` | Web push VAPID key | `BF3k...` |

---

## API Endpoints

### Backend (`localhost:3001`)

| Method | Endpoint | Description | Body |
|--------|----------|-------------|------|
| `GET` | `/` | Health check | — |
| `POST` | `/subscribe` | Subscribe FCM token to whale-alerts topic | `{ "token": "string" }` |

---

## How It Works

### 1. Event Listening
The backend uses `viem`'s `watchContractEvent` to subscribe to the USDT contract's `Transfer(address indexed from, address indexed to, uint256 value)` event via Alchemy's WebSocket endpoint.

### 2. Threshold Filtering
Since USDT has **6 decimals**, the raw threshold value for 100,000 USDT is:
```
100,000 × 10^6 = 100,000,000,000 (100_000_000_000n in BigInt)
```
Only events with `value >= 100_000_000_000n` are processed.

### 3. Data Storage
Qualifying transfers are saved to the `whale-transfers` Firestore collection with:
- Sender/receiver addresses
- Formatted amount and raw value
- Transaction hash and block number
- Server-side timestamps

### 4. Push Notifications
FCM messages are sent to the `whale-alerts` topic, reaching all subscribed clients with:
- **Notification payload** — title and body for system-level display
- **Data payload** — structured transfer data for in-app handling

### 5. Real-time Frontend
The Next.js frontend uses Firestore's `onSnapshot` for live updates. When a new transfer document is added, the UI updates instantly without polling.

### 6. Reconnection Strategy
If the WebSocket connection drops, the backend implements exponential backoff:
- Retry delays: 1s → 2s → 4s → 8s → ... → 30s (max)
- Maximum 20 reconnection attempts

---


## License

This project is unlicensed and intended for educational/portfolio purposes.
