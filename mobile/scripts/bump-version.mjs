/**
 * Bump version in version.json, then sync everywhere.
 * Usage: node scripts/bump-version.mjs [patch|minor|major|code]
 *
 * patch  → 1.0.0 → 1.0.1, versionCode +1
 * minor  → 1.0.0 → 1.1.0, versionCode +1
 * major  → 1.0.0 → 2.0.0, versionCode +1
 * code   → only versionCode +1 (no semver change)
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

const bump = (process.argv[2] || 'patch').toLowerCase();
const versionPath = join(dirname(fileURLToPath(import.meta.url)), '..', 'version.json');
const data = JSON.parse(readFileSync(versionPath, 'utf8'));

const [major, minor, patch] = data.version.split('.').map(Number);

if (bump === 'code') {
  data.versionCode += 1;
} else if (bump === 'major') {
  data.version = `${major + 1}.0.0`;
  data.versionName = `${major + 1}.0`;
  data.versionCode += 1;
} else if (bump === 'minor') {
  data.version = `${major}.${minor + 1}.0`;
  data.versionName = `${major}.${minor + 1}`;
  data.versionCode += 1;
} else if (bump === 'patch') {
  data.version = `${major}.${minor}.${patch + 1}`;
  data.versionName = `${major}.${minor}.${patch + 1}`;
  data.versionCode += 1;
} else {
  console.error('Usage: node scripts/bump-version.mjs [patch|minor|major|code]');
  process.exit(1);
}

writeFileSync(versionPath, `${JSON.stringify(data, null, 2)}\n`);
console.log(`Bumped to ${data.version} (name ${data.versionName}, code ${data.versionCode})`);

const sync = join(dirname(fileURLToPath(import.meta.url)), 'sync-version.mjs');
spawnSync(process.execPath, [sync], { stdio: 'inherit' });
