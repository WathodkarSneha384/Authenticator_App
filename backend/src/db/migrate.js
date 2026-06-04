const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const dbPath = process.env.DB_PATH || './data/auth.db';
const dir = path.dirname(dbPath);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

// Remove old DB so we start fresh with new schema
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA journal_mode = WAL`);
db.exec(`PRAGMA foreign_keys = ON`);

db.exec(`
  CREATE TABLE users (
    id                 TEXT PRIMARY KEY,
    user_id            TEXT UNIQUE NOT NULL,
    mobile             TEXT,
    status             TEXT NOT NULL DEFAULT 'otp_pending',
    otp                TEXT,
    otp_expires_at     INTEGER,
    otp_attempts       INTEGER NOT NULL DEFAULT 0,
    stage1_status      TEXT NOT NULL DEFAULT 'pending',
    stage1_by          TEXT,
    stage1_at          INTEGER,
    stage2_status      TEXT NOT NULL DEFAULT 'pending',
    stage2_by          TEXT,
    stage2_at          INTEGER,
    rejection_reason   TEXT,
    registration_key   TEXT,
    reg_key_expires_at INTEGER,
    seed               TEXT,
    created_at         INTEGER NOT NULL DEFAULT (unixepoch()),
    registered_at      INTEGER
  );

  CREATE TABLE audit_log (
    id       INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id  TEXT NOT NULL,
    action   TEXT NOT NULL,
    detail   TEXT,
    ip       TEXT,
    ts       INTEGER NOT NULL DEFAULT (unixepoch())
  );
`);

console.log('Database migrated successfully at', path.resolve(dbPath));
db.close();
