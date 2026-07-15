/**
 * Sync version.json → package.json, Android build.gradle, app constants.
 * Usage: node scripts/sync-version.mjs
 */
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { version, versionName, versionCode } = JSON.parse(
  readFileSync(join(root, 'version.json'), 'utf8'),
);

// package.json
const pkgPath = join(root, 'package.json');
const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
pkg.version = version;
writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);

// Android build.gradle
const gradlePath = join(root, 'android', 'app', 'build.gradle');
let gradle = readFileSync(gradlePath, 'utf8');
gradle = gradle.replace(/versionCode\s+\d+/, `versionCode ${versionCode}`);
gradle = gradle.replace(/versionName\s+"[^"]*"/, `versionName "${versionName}"`);
writeFileSync(gradlePath, gradle);

// App UI constant
const appTs = `/** Auto-synced from version.json — run: node scripts/sync-version.mjs */
export const APP_VERSION = '${versionName}';
export const APP_VERSION_FULL = '${version}';
export const APP_VERSION_CODE = ${versionCode};
`;
writeFileSync(join(root, 'src', 'constants', 'app.ts'), appTs);

console.log(`Synced version ${version} (${versionName}, code ${versionCode})`);
