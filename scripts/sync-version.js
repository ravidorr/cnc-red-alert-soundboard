#!/usr/bin/env node
/**
 * Syncs the version from package.json to js/version.js
 * Run this after bumping version in package.json:
 *   node scripts/sync-version.js
 * 
 * Or use: npm version patch/minor/major (which runs this automatically via postversion hook)
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

// Read version from package.json
const packageJson = JSON.parse(readFileSync(join(rootDir, 'package.json'), 'utf8'));
const version = packageJson.version;

// Write to js/version.js
const versionFileContent = `// Auto-generated from package.json - do not edit manually
// Run: node scripts/sync-version.js
export const VERSION = '${version}';
`;

writeFileSync(join(rootDir, 'js', 'version.js'), versionFileContent);

console.log(`Version synced: ${version}`);
