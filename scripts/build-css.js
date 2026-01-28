#!/usr/bin/env node
/**
 * Concatenates all CSS files into a single bundle.css file in dist/css/
 * This eliminates the render-blocking @import waterfall for better Core Web Vitals.
 *
 * Run: node scripts/build-css.js
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const cssDir = join(rootDir, 'css');
const distCssDir = join(rootDir, 'dist', 'css');

// CSS files in the correct order (matching the @import order in styles.css)
const CSS_FILES = [
    'variables.css',
    'base.css',
    'accessibility.css',
    'layout.css',
    'components.css',
    'navigation.css',
    'favorites.css',
    'toast.css',
    'install.css',
    'effects.css',
    'responsive.css',
];

// Build the concatenated CSS
let bundledCSS = `/* C&C Red Alert 1 Theme - Green Terminal / Military HUD */
/* Auto-generated bundle - do not edit directly */
/* Run: node scripts/build-css.js to regenerate */
`;

for (const file of CSS_FILES) {
    const filePath = join(cssDir, file);
    const content = readFileSync(filePath, 'utf8');
    // Add content directly without extra comment headers (source files already have section comments)
    bundledCSS += `\n${content}\n`;
}

// Ensure dist/css directory exists
if (!existsSync(distCssDir)) {
    mkdirSync(distCssDir, { recursive: true });
}

// Write the bundled CSS to dist/css/
const bundlePath = join(distCssDir, 'bundle.css');
writeFileSync(bundlePath, bundledCSS);

console.log(`CSS bundle created: dist/css/bundle.css (${CSS_FILES.length} files merged)`);
