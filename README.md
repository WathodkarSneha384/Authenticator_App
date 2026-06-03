# Proctor Auth — CBS Offline Authenticator

Two-factor authentication for Core Banking System using offline TOTP mobile tokens.

## Quick Start

```
Authenticato_App/
├── backend/         Node.js + Express + SQLite
└── mobile/          React Native + NativeWind (Tailwind)
```

See **PRD.md** for full product requirements, architecture, and flow diagrams.

### Backend
```bash
cd backend && cp .env.example .env
npm install && npm run migrate && npm run dev
```
Server starts on http://localhost:4000

### Mobile (Android)
```bash
cd mobile && npm install
npx react-native run-android
```

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new user (pending) |
| POST | /api/auth/login | Step 1 — password auth |
| POST | /api/auth/verify-otp | Step 2 — TOTP verification |
| POST | /api/auth/verify-transaction | Authorise a transaction |
| GET | /api/auth/seed | Download seed to device |
| GET | /api/admin/users/pending | List pending registrations |
| POST | /api/admin/users/:id/approve | Approve user |
| POST | /api/admin/users/:id/reject | Reject user |
