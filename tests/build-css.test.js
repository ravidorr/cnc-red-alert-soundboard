/**
 * Tests for scripts/build-css.js
 * Tests that the CSS build script correctly:
 * - Creates the dist/css directory
 * - Concatenates all CSS source files
 * - Outputs to dist/css/bundle.css
 * - Preserves content from all source files
 */

import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { readFileSync, writeFileSync, existsSync, rmSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');
const distDir = join(rootDir, 'dist');
const distCssDir = join(distDir, 'css');
const bundlePath = join(distCssDir, 'bundle.css');

// CSS files that should be included (matching build-css.js)
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

describe('build-css script', () => {
    /** @type {{ originalBundle: string | null }} */
    let localThis;
    
    beforeEach(() => {
        localThis = {};
        // Store original bundle if it exists
        if (existsSync(bundlePath)) {
            localThis.originalBundle = readFileSync(bundlePath, 'utf8');
        } else {
            localThis.originalBundle = null;
        }
    });
    
    afterEach(() => {
        // Restore original bundle or remove if it didn't exist
        if (localThis.originalBundle !== null) {
            writeFileSync(bundlePath, localThis.originalBundle);
        }
    });
    
    it('should create dist/css directory if it does not exist', () => {
        // Remove dist/css directory if it exists
        if (existsSync(distCssDir)) {
            rmSync(distCssDir, { recursive: true });
        }
        
        // Run the script
        execSync('node scripts/build-css.js', { cwd: rootDir });
        
        // Check that dist/css directory was created
        expect(existsSync(distCssDir)).toBe(true);
    });
    
    it('should create dist/css/bundle.css', () => {
        // Run the script
        execSync('node scripts/build-css.js', { cwd: rootDir });
        
        // Check that bundle.css was created
        expect(existsSync(bundlePath)).toBe(true);
    });
    
    it('should include content from all CSS source files', () => {
        // Run the script
        execSync('node scripts/build-css.js', { cwd: rootDir });
        
        // Read the bundle
        const bundle = readFileSync(bundlePath, 'utf8');
        
        // Check that content from each source file is included
        for (const file of CSS_FILES) {
            const sourceContent = readFileSync(join(rootDir, 'css', file), 'utf8');
            // Check that the source content (minus leading/trailing whitespace) appears in bundle
            const trimmedContent = sourceContent.trim();
            expect(bundle).toContain(trimmedContent);
        }
    });
    
    it('should preserve CSS variables from variables.css', () => {
        // Run the script
        execSync('node scripts/build-css.js', { cwd: rootDir });
        
        // Read the bundle
        const bundle = readFileSync(bundlePath, 'utf8');
        
        // Check for specific CSS variables
        expect(bundle).toContain('--bg-primary:');
        expect(bundle).toContain('--green-primary:');
        expect(bundle).toContain('--font-primary:');
    });
    
    it('should preserve media queries from responsive.css', () => {
        // Run the script
        execSync('node scripts/build-css.js', { cwd: rootDir });
        
        // Read the bundle
        const bundle = readFileSync(bundlePath, 'utf8');
        
        // Check for responsive media queries
        expect(bundle).toContain('@media (max-width: 768px)');
        expect(bundle).toContain('@media (max-width: 480px)');
    });
    
    it('should preserve accessibility styles', () => {
        // Run the script
        execSync('node scripts/build-css.js', { cwd: rootDir });
        
        // Read the bundle
        const bundle = readFileSync(bundlePath, 'utf8');
        
        // Check for accessibility-related styles
        expect(bundle).toContain('.skip-link');
        expect(bundle).toContain('.visually-hidden');
        expect(bundle).toContain('@media (prefers-reduced-motion: reduce)');
    });
    
    it('should include header comment', () => {
        // Run the script
        execSync('node scripts/build-css.js', { cwd: rootDir });
        
        // Read the bundle
        const bundle = readFileSync(bundlePath, 'utf8');
        
        // Check for header comment
        expect(bundle).toContain('C&C Red Alert 1 Theme');
        expect(bundle).toContain('Auto-generated bundle');
    });
    
    it('should output success message', () => {
        // Run the script and capture output
        const output = execSync('node scripts/build-css.js', { 
            cwd: rootDir,
            encoding: 'utf8',
        });
        
        // Check output message
        expect(output).toContain('CSS bundle created: dist/css/bundle.css');
        expect(output).toContain(`${CSS_FILES.length} files merged`);
    });
    
    it('should produce valid CSS (no syntax errors in key selectors)', () => {
        // Run the script
        execSync('node scripts/build-css.js', { cwd: rootDir });
        
        // Read the bundle
        const bundle = readFileSync(bundlePath, 'utf8');
        
        // Check for properly closed braces (basic syntax check)
        const openBraces = (bundle.match(/{/g) || []).length;
        const closeBraces = (bundle.match(/}/g) || []).length;
        expect(openBraces).toBe(closeBraces);
    });
});
