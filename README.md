# Proctor Auth — CBS Offline Authenticator

Two-factor authentication for Core Banking System using offline TOTP mobile tokens.

```
Authenticator_App/
├── backend/         Node.js + Express + SQLite
└── mobile/          React Native 0.73 + NativeWind (Tailwind CSS)
```

See **PRD.md** for full product requirements, architecture, and flow diagrams.

---

## ⚠️ Before You Clone — Important

> **Clone to a path with NO spaces.**
> Gradle (Android build tool) crashes if any folder in the path has a space.

```bash
# ✅ Good
C:\Projects\AuthApp
D:\AuthApp

# ❌ Bad — Gradle will fail
C:\My Projects\AuthApp
D:\Work Per\AuthApp
```

---

## Prerequisites — Install These First

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18 or 20 (LTS) | https://nodejs.org |
| JDK | 17 | https://www.oracle.com/java/technologies/downloads/#java17 |
| Android Studio | Latest | https://developer.android.com/studio |

### Android Studio Setup (one-time)
1. Open Android Studio → **Tools → SDK Manager**
2. **SDK Platforms tab** → check **Android 14 (API 34)**
3. **SDK Tools tab** → check:
   - Android SDK Build-Tools **34**
   - NDK **26.1.10909125**
   - Android Emulator
   - Android SDK Platform-Tools
4. Click **Apply**
5. **Tools → Device Manager** → Create Device → Pixel 6 → API 34 → Finish

---

## Setup After Clone

### 1. Backend

```bash
cd backend

# Copy environment config
cp .env.example .env
```

Open `.env` and set these values:
```env
JWT_SECRET=any_long_random_string_you_make_up
ADMIN_KEY=choose_a_strong_admin_password
```

```bash
# Install dependencies
npm install

# Create the database
npm run migrate

# Start the server
npm run dev
```
Server runs at **http://localhost:4000**

---

### 2. Mobile

```bash
cd mobile

# Install dependencies
npm install
```

Create `android/local.properties` with your Android SDK path:

**Windows:**
```properties
sdk.dir=C\:\\Users\\YOUR_USERNAME\\AppData\\Local\\Android\\Sdk
```
> Replace `YOUR_USERNAME` with your Windows username.

**Mac/Linux:**
```properties
sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
```

Start an Android emulator in Android Studio, then run:

```bash
# Terminal 1 — Metro bundler
npx react-native start

# Terminal 2 — Build and install on emulator
npx react-native run-android
```

---

## Running the Backend API

| Method | Path | Description |
|--------|------|-------------|
| GET | /health | Health check |
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Step 1 — password |
| POST | /api/auth/verify-otp | Step 2 — TOTP token |
| POST | /api/auth/verify-transaction | Authorise a transaction |
| GET | /api/auth/seed | Get TOTP seed for device |
| GET | /api/admin/users/pending | List pending users |
| POST | /api/admin/users/:id/approve | Approve user |
| POST | /api/admin/users/:id/reject | Reject user |

Admin endpoints require header: `x-admin-key: <your ADMIN_KEY from .env>`

---

## Test the Full Flow (curl / Postman)

```bash
# 1. Register
POST http://localhost:4000/api/auth/register
{ "userId":"EMP001", "mobile":"+919999999999", "fullName":"John Doe", "password":"Pass@1234" }

# 2. Approve (admin)
POST http://localhost:4000/api/admin/users/EMP001/approve
Header: x-admin-key: your_admin_key

# 3. Login step 1
POST http://localhost:4000/api/auth/login
{ "userId":"EMP001", "password":"Pass@1234" }
→ returns preAuthToken

# 4. Login step 2 (enter token from mobile app)
POST http://localhost:4000/api/auth/verify-otp
Header: Authorization: Bearer <preAuthToken>
{ "token":"123456" }
→ returns sessionToken
```

---

## Common Errors

| Error | Fix |
|-------|-----|
| `SDK location not found` | Create `mobile/android/local.properties` with your SDK path |
| `Gradle build failed` — spaces | Clone to a path with no spaces e.g. `D:\AuthApp` |
| `No emulators found` | Start an emulator in Android Studio first |
| `JAVA_HOME not set` | Install JDK 17 and restart terminal |
| `Cannot find module` | Run `npm install` in `backend/` and `mobile/` |
| `User not approved` | Call the admin approve API first |
