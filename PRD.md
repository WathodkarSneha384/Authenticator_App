# Product Requirements Document — Proctor Auth CBS Authenticator

## 1. Overview

A two-factor authentication (2FA) system for Core Banking System (CBS) using a mobile app that generates Time-based One-Time Passwords (TOTP) — similar to Google Authenticator — but tightly integrated with CBS registration, approval, and transaction verification flows.

---

## 2. Goals

| Goal | Description |
|------|-------------|
| Offline token generation | App must generate tokens without internet using TOTP (RFC 6238) |
| CBS integration | Token algorithm in app and CBS backend must be identical |
| Secure registration | New devices go through admin approval before a seed is issued |
| Transaction security | Sensitive DB operations (INSERT/UPDATE/DELETE) require token re-verification |

---

## 3. Actors

- **User** — CBS employee or customer installing the mobile app
- **Admin** — CBS admin who approves/rejects registrations
- **CBS Backend** — Node.js API that validates tokens and manages seeds
- **Mobile App** — React Native Android app that generates tokens offline

---

## 4. Functional Requirements

### 4.1 Registration (First-time setup)

- FR-01: User opens app → sees Registration screen
- FR-02: User enters: User ID, Full Name, Mobile Number, Password
- FR-03: App calls `POST /api/auth/register` → status = `pending`
- FR-04: Admin reviews pending users via admin API / dashboard
- FR-05: On approval, backend generates a unique TOTP seed and stores it
- FR-06: On first login after approval, seed is downloaded to device via `GET /api/auth/seed` and stored in AsyncStorage
- FR-07: Admin can reject with reason

### 4.2 Login Flow (Two-step)

- FR-08: User enters User ID + Password → `POST /api/auth/login`
- FR-09: On success, server returns a short-lived `preAuthToken` (5 min TTL)
- FR-10: App prompts user to open Token screen and enter the displayed 6-digit TOTP
- FR-11: User submits token → `POST /api/auth/verify-otp` with `preAuthToken` as Bearer
- FR-12: On success, server returns a full `sessionToken` (7-day TTL)
- FR-13: App navigates to Home screen

### 4.3 Token Generation (Offline)

- FR-14: Token screen generates TOTP locally using stored seed (otplib)
- FR-15: Token refreshes every 30 seconds with a countdown bar
- FR-16: Works without internet connection
- FR-17: Same algorithm (TOTP, SHA-1, 6-digit, 30s window) on both app and backend

### 4.4 Transaction Verification

- FR-18: Before INSERT/UPDATE/DELETE/authorisation, CBS calls `POST /api/auth/verify-transaction`
- FR-19: User prompted to open app, generate token, and submit it
- FR-20: Each transaction carries a `transactionRef` for audit trail

---

## 5. Non-Functional Requirements

| NFR | Requirement |
|-----|-------------|
| Security | Passwords hashed with bcrypt (12 rounds); seeds stored encrypted on device |
| Availability | Token generation must work 100% offline |
| Rate limiting | Login endpoints limited to 100 req/15 min |
| Audit | All auth events logged to `audit_log` table |
| Token window | ±1 step (±30s) tolerance for clock skew |

---

## 6. Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)             │
│  RegisterScreen → LoginScreen → OtpVerifyScreen         │
│  TokenScreen (offline TOTP via otplib)                  │
│  HomeScreen → TransactionVerify                         │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTPS (REST)
┌───────────────────────▼─────────────────────────────────┐
│                Node.js Express Backend                   │
│  POST /api/auth/register                                 │
│  POST /api/auth/login          → preAuthToken (5m JWT)  │
│  POST /api/auth/verify-otp     → sessionToken (7d JWT)  │
│  POST /api/auth/verify-transaction                       │
│  GET  /api/auth/seed                                     │
│  GET  /api/admin/users/pending                           │
│  POST /api/admin/users/:id/approve                       │
│  POST /api/admin/users/:id/reject                        │
└───────────────────────┬─────────────────────────────────┘
                        │
               ┌────────▼────────┐
               │   SQLite DB     │
               │  users table    │
               │  audit_log      │
               │  sessions       │
               └─────────────────┘
```

---

## 7. Database Schema

### `users`
| Column | Type | Notes |
|--------|------|-------|
| id | TEXT PK | UUID |
| user_id | TEXT UNIQUE | Employee / customer ID |
| mobile | TEXT | Mobile number |
| full_name | TEXT | |
| password_hash | TEXT | bcrypt |
| status | TEXT | pending / approved / rejected |
| seed | TEXT | TOTP secret (set on approval) |
| created_at | INTEGER | Unix timestamp |
| approved_at | INTEGER | Unix timestamp |

### `audit_log`
| Column | Type | Notes |
|--------|------|-------|
| id | INTEGER PK | Auto increment |
| user_id | TEXT | |
| action | TEXT | register/approve/reject/login/token_verify/tx_verify |
| detail | TEXT | |
| ip | TEXT | |
| ts | INTEGER | Unix timestamp |

---

## 8. Tech Stack

| Layer | Technology |
|-------|-----------|
| Mobile | React Native 0.73 + NativeWind 4 (Tailwind CSS) |
| Mobile State | Zustand + AsyncStorage |
| Mobile TOTP | otplib |
| Backend | Node.js + Express 4 |
| Backend DB | SQLite via better-sqlite3 |
| Backend TOTP | otplib (same library) |
| Auth | JWT (jsonwebtoken) |
| Password hashing | bcryptjs |
| Logging | Winston |

---

## 9. Screens

| Screen | Route | Description |
|--------|-------|-------------|
| RegisterScreen | First launch | User registration form |
| LoginScreen | After registration | User ID + Password |
| OtpVerifyScreen | After step 1 login | Enter TOTP token |
| TokenScreen | Any time | Show live TOTP with countdown |
| HomeScreen | After full login | Dashboard with quick actions |

---

## 10. Getting Started

### Backend
```bash
cd backend
cp .env.example .env   # fill in JWT_SECRET and ADMIN_KEY
npm install
npm run migrate
npm run dev
```

### Mobile
```bash
cd mobile
npm install
npx react-native run-android
```
