#!/usr/bin/env node
/**
 * Sound file renaming script
 * Normalizes sound filenames to: lowercase, no spaces, no special characters
 */

const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(process.env.HOME, 'Desktop/sounds/sounds');

// Helper to normalize a filename
function normalizeFilename(filename) {
    if (!filename.endsWith('.wav')) return null;
    
    const baseName = filename.slice(0, -4); // Remove .wav
    
    let normalized = baseName
        .toLowerCase()
        // Replace special patterns first
        .replace(/\s*#\s*/g, '_')           // # with optional spaces -> _
        .replace(/\s*&\s*/g, '_and_')       // & with optional spaces -> _and_
        .replace(/\s*-\s*/g, '_')           // - with optional spaces -> _
        .replace(/\s*,\s*/g, '_')           // , with optional spaces -> _
        .replace(/'/g, '')                   // Remove apostrophes
        .replace(/!/g, '')                   // Remove exclamation marks
        .replace(/\./g, '_')                 // Replace dots with underscore
        .replace(/\s+/g, '_')               // Replace spaces with underscores
        .replace(/_+/g, '_')                 // Collapse multiple underscores
        .replace(/^_|_$/g, '');              // Remove leading/trailing underscores
    
    return normalized + '.wav';
}

// Get all wav files
const files = fs.readdirSync(SOUNDS_DIR).filter(f => f.endsWith('.wav'));

// Create mapping
const mapping = {};
const usedNames = new Set();

files.forEach(oldName => {
    let newName = normalizeFilename(oldName);
    
    // Ensure uniqueness
    if (usedNames.has(newName)) {
        let counter = 2;
        const base = newName.slice(0, -4);
        while (usedNames.has(`${base}_v${counter}.wav`)) {
            counter++;
        }
        newName = `${base}_v${counter}.wav`;
    }
    
    usedNames.add(newName);
    mapping[oldName] = newName;
});

// Output mapping for review
console.log('=== RENAME MAPPING ===\n');
Object.entries(mapping)
    .filter(([old, newN]) => old !== newN)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([old, newN]) => {
        console.log(`"${old}" -> "${newN}"`);
    });

console.log('\n=== SUMMARY ===');
const changedCount = Object.entries(mapping).filter(([o, n]) => o !== n).length;
console.log(`Total files: ${files.length}`);
console.log(`Files to rename: ${changedCount}`);
console.log(`Files already normalized: ${files.length - changedCount}`);

// Check for conflicts
const newNames = Object.values(mapping);
const uniqueNewNames = new Set(newNames);
if (newNames.length !== uniqueNewNames.size) {
    console.error('\nERROR: Duplicate new names detected!');
    process.exit(1);
}

// Output JSON mapping for use in other scripts
const mappingPath = path.join(__dirname, 'filename_mapping.json');
fs.writeFileSync(mappingPath, JSON.stringify(mapping, null, 2));
console.log(`\nMapping saved to: ${mappingPath}`);

// Ask for confirmation before renaming
if (process.argv.includes('--execute')) {
    console.log('\n=== EXECUTING RENAMES ===\n');
    
    Object.entries(mapping)
        .filter(([old, newN]) => old !== newN)
        .forEach(([oldName, newName]) => {
            const oldPath = path.join(SOUNDS_DIR, oldName);
            const newPath = path.join(SOUNDS_DIR, newName);
            
            try {
                fs.renameSync(oldPath, newPath);
                console.log(`Renamed: ${oldName} -> ${newName}`);
            } catch (err) {
                console.error(`Failed to rename ${oldName}: ${err.message}`);
            }
        });
    
    console.log('\nRename complete!');
} else {
    console.log('\nRun with --execute to perform the actual renames.');
}
