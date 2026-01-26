#!/usr/bin/env node
/**
 * Updates test file with new normalized filenames
 */

const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'filename_mapping.json');
const testPath = path.join(__dirname, '..', 'tests', 'app.test.js');

// Load mapping
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Load test file
let testContent = fs.readFileSync(testPath, 'utf8');

// Replace each old filename with new filename
let replacements = 0;
Object.entries(mapping).forEach(([oldName, newName]) => {
    if (oldName !== newName) {
        // Escape special regex characters in the old name
        const escapedOld = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedOld, 'g');
        const matches = testContent.match(regex);
        if (matches) {
            replacements += matches.length;
            testContent = testContent.replace(regex, newName);
        }
    }
});

// Write updated test file
fs.writeFileSync(testPath, testContent);

console.log(`Updated ${replacements} filename references in app.test.js`);
