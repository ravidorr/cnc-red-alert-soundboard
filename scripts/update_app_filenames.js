#!/usr/bin/env node
/**
 * Updates app.js SOUNDS array with new normalized filenames
 */

const fs = require('fs');
const path = require('path');

const mappingPath = path.join(__dirname, 'filename_mapping.json');
const appPath = path.join(__dirname, '..', 'js', 'app.js');

// Load mapping
const mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf8'));

// Load app.js
let appContent = fs.readFileSync(appPath, 'utf8');

// Replace each old filename with new filename
let replacements = 0;
Object.entries(mapping).forEach(([oldName, newName]) => {
    if (oldName !== newName) {
        // Escape special regex characters in the old name
        const escapedOld = oldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(escapedOld, 'g');
        const matches = appContent.match(regex);
        if (matches) {
            replacements += matches.length;
            appContent = appContent.replace(regex, newName);
        }
    }
});

// Write updated app.js
fs.writeFileSync(appPath, appContent);

console.log(`Updated ${replacements} filename references in app.js`);
