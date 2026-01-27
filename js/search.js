// ============================================
// Search - Search/filter functionality
// ============================================

import { SOUNDS } from './constants.js';
import { state, elements } from './state.js';
import { showSearchEmptyState, hideSearchEmptyState } from './ui.js';
import { fuzzyMatch } from './utils.js';

// Filter sounds based on search (DOM version) with fuzzy matching
export function filterSounds() {
    const wrappers = document.querySelectorAll('.sound-btn-wrapper');
    let visibleCount = 0;

    // Set aria-busy while filtering
    if (elements.contentArea) {
        elements.contentArea.setAttribute('aria-busy', 'true');
    }

    wrappers.forEach(wrapper => {
        const btn = wrapper.querySelector('.sound-btn');
        if (!btn) {
            return;
        }

        const name = btn.dataset.name.toLowerCase();
        const file = decodeURIComponent(btn.dataset.file).toLowerCase();

        // Check for matches: exact, substring, or fuzzy
        let matches = name.includes(state.searchTerm) || file.includes(state.searchTerm);

        // If no exact/substring match, try fuzzy match
        if (!matches && state.searchTerm.length >= 3) {
            matches = fuzzyMatch(state.searchTerm, btn.dataset.name);
        }

        // Check tags if sound has them (from SOUNDS data)
        if (!matches) {
            const soundData = SOUNDS.find(s => s.file === decodeURIComponent(btn.dataset.file));
            if (soundData && soundData.tags) {
                matches = soundData.tags.some(tag => tag.toLowerCase().includes(state.searchTerm));
            }
        }

        wrapper.style.display = matches ? '' : 'none';
        if (matches) {
            visibleCount++;
        }
    });

    // Show/hide empty categories
    document.querySelectorAll('.category-section').forEach(section => {
        const visibleWrappers = section.querySelectorAll('.sound-btn-wrapper:not([style*="display: none"])');
        section.style.display = visibleWrappers.length === 0 ? 'none' : '';

        // Auto-expand categories with matches when searching
        if (state.searchTerm && visibleWrappers.length > 0) {
            section.classList.remove('collapsed');
        }
    });

    // Show/hide search empty state
    if (visibleCount === 0 && state.searchTerm) {
        showSearchEmptyState(state.searchTerm);
    } else {
        hideSearchEmptyState();
    }

    // Update visible count
    elements.visibleSounds.textContent = visibleCount;

    // Clear aria-busy
    if (elements.contentArea) {
        elements.contentArea.setAttribute('aria-busy', 'false');
    }

    // Announce results to screen readers
    announceSearchResults(visibleCount);
}

// Announce search results to screen readers
function announceSearchResults(count) {
    const announcer = document.getElementById('search-announcer');
    if (!announcer) {
        return;
    }

    // Only announce if there's a search term
    if (state.searchTerm) {
        const total = SOUNDS.length;
        if (count === 0) {
            announcer.textContent = `No sounds found for "${state.searchTerm}"`;
        } else {
            announcer.textContent = `Showing ${count} of ${total} sounds`;
        }
    } else {
        announcer.textContent = '';
    }

    // Also update visible indicator
    updateSearchResultIndicator(count);
}

// Update visible search result indicator
function updateSearchResultIndicator(count) {
    const indicator = document.getElementById('search-result-indicator');
    const resultText = document.getElementById('search-result-text');

    if (!indicator || !resultText) {
        return;
    }

    if (state.searchTerm && count > 0) {
        const total = SOUNDS.length;
        resultText.textContent = `Showing ${count} of ${total} sounds for "${state.searchTerm}"`;
        indicator.style.display = 'flex';
    } else {
        indicator.style.display = 'none';
    }
}
