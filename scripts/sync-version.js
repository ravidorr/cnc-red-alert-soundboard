#!/usr/bin/env node
/**
 * Syncs the version from package.json to multiple files:
 * - js/version.js (VERSION constant)
 * - sitemap.xml (lastmod date)
 * - index.html (WebApplication schema: dateModified, softwareVersion)
 *
 * Run this after bumping version in package.json:
 *   node scripts/sync-version.js
 *
 * Or use: npm version patch/minor/major (which runs this automatically via version hook)
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

// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().split('T')[0];

// 1. Write to js/version.js
const versionFileContent = `// Auto-generated from package.json - do not edit manually
// Run: node scripts/sync-version.js
export const VERSION = '${version}';
`;
writeFileSync(join(rootDir, 'js', 'version.js'), versionFileContent);
console.log(`Version synced: ${version}`);

// 2. Update sitemap.xml lastmod
const sitemapPath = join(rootDir, 'sitemap.xml');
let sitemap = readFileSync(sitemapPath, 'utf8');
sitemap = sitemap.replace(
    /<lastmod>\d{4}-\d{2}-\d{2}<\/lastmod>/,
    `<lastmod>${today}</lastmod>`,
);
writeFileSync(sitemapPath, sitemap);
console.log(`Sitemap lastmod updated: ${today}`);

// 3. Update index.html WebApplication schema (dateModified + softwareVersion)
const indexPath = join(rootDir, 'index.html');
let indexHtml = readFileSync(indexPath, 'utf8');

// Update dateModified
indexHtml = indexHtml.replace(
    /"dateModified":\s*"\d{4}-\d{2}-\d{2}"/,
    `"dateModified": "${today}"`,
);

// Update softwareVersion
indexHtml = indexHtml.replace(
    /"softwareVersion":\s*"[\d.]+"/,
    `"softwareVersion": "${version}"`,
);

writeFileSync(indexPath, indexHtml);
console.log(`WebApplication schema updated: v${version}, ${today}`);
