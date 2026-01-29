/**
 * Tests for scripts/sync-version.js
 * Tests that the version sync script correctly updates:
 * - js/version.js
 * - sitemap.xml lastmod
 * - index.html WebApplication schema (dateModified, softwareVersion)
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

describe('sync-version script', () => {
    /** @type {{ versionJs: string, sitemap: string, indexHtml: string, packageJson: string }} */
    let localThis;

    beforeEach(() => {
        localThis = {};
        // Store original file contents before tests
        localThis.versionJs = readFileSync(join(rootDir, 'js', 'version.js'), 'utf8');
        localThis.sitemap = readFileSync(join(rootDir, 'sitemap.xml'), 'utf8');
        localThis.indexHtml = readFileSync(join(rootDir, 'index.html'), 'utf8');
        localThis.packageJson = readFileSync(join(rootDir, 'package.json'), 'utf8');
    });

    afterEach(() => {
        // Restore original file contents after tests
        writeFileSync(join(rootDir, 'js', 'version.js'), localThis.versionJs);
        writeFileSync(join(rootDir, 'sitemap.xml'), localThis.sitemap);
        writeFileSync(join(rootDir, 'index.html'), localThis.indexHtml);
    });

    it('should update js/version.js with correct version', () => {
        // Run the script
        execSync('node scripts/sync-version.js', { cwd: rootDir });

        // Read the updated version.js
        const versionJs = readFileSync(join(rootDir, 'js', 'version.js'), 'utf8');
        const packageJson = JSON.parse(localThis.packageJson);

        // Check that VERSION matches package.json version
        expect(versionJs).toContain(`export const VERSION = '${packageJson.version}';`);
    });

    it('should update sitemap.xml lastmod to today', () => {
        // Run the script
        execSync('node scripts/sync-version.js', { cwd: rootDir });

        // Read the updated sitemap
        const sitemap = readFileSync(join(rootDir, 'sitemap.xml'), 'utf8');

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Check that lastmod is today's date
        expect(sitemap).toContain(`<lastmod>${today}</lastmod>`);
    });

    it('should update index.html dateModified to today', () => {
        // Run the script
        execSync('node scripts/sync-version.js', { cwd: rootDir });

        // Read the updated index.html
        const indexHtml = readFileSync(join(rootDir, 'index.html'), 'utf8');

        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split('T')[0];

        // Check that dateModified is today's date
        expect(indexHtml).toMatch(new RegExp(`"dateModified":\\s*"${today}"`));
    });

    it('should update index.html softwareVersion to package version', () => {
        // Run the script
        execSync('node scripts/sync-version.js', { cwd: rootDir });

        // Read the updated index.html
        const indexHtml = readFileSync(join(rootDir, 'index.html'), 'utf8');
        const packageJson = JSON.parse(localThis.packageJson);

        // Check that softwareVersion matches package.json version
        expect(indexHtml).toMatch(new RegExp(`"softwareVersion":\\s*"${packageJson.version}"`));
    });

    it('should preserve other content in sitemap.xml', () => {
        // Run the script
        execSync('node scripts/sync-version.js', { cwd: rootDir });

        // Read the updated sitemap
        const sitemap = readFileSync(join(rootDir, 'sitemap.xml'), 'utf8');

        // Check that other sitemap content is preserved
        expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
        expect(sitemap).toContain('<loc>https://ravidorr.github.io/cnc-red-alert-soundboard/</loc>');
        expect(sitemap).toContain('<priority>1.0</priority>');
    });

    it('should preserve other structured data in index.html', () => {
        // Run the script
        execSync('node scripts/sync-version.js', { cwd: rootDir });

        // Read the updated index.html
        const indexHtml = readFileSync(join(rootDir, 'index.html'), 'utf8');

        // Check that other schema content is preserved
        expect(indexHtml).toContain('"@type": "WebApplication"');
        expect(indexHtml).toContain('"name": "C&C Red Alert Soundboard"');
        expect(indexHtml).toContain('"datePublished": "2026-01-17"');
        expect(indexHtml).toContain('"@type": "FAQPage"');
        expect(indexHtml).toContain('"@type": "BreadcrumbList"');
    });

    it('should output success messages', () => {
        // Run the script and capture output
        const output = execSync('node scripts/sync-version.js', {
            cwd: rootDir,
            encoding: 'utf8',
        });

        const packageJson = JSON.parse(localThis.packageJson);
        const today = new Date().toISOString().split('T')[0];

        // Check output messages
        expect(output).toContain(`Version synced: ${packageJson.version}`);
        expect(output).toContain(`Sitemap lastmod updated: ${today}`);
        expect(output).toContain(`WebApplication schema updated: v${packageJson.version}, ${today}`);
    });
});
