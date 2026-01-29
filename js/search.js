// ============================================
// Search - Search/filter functionality
// ============================================

import { SOUNDS } from './constants.js';
import { state, elements } from './state.js';
import { showSearchEmptyState, hideSearchEmptyState } from './ui.js';
import { fuzzyMatch, announce } from './utils.js';

// Cache: Map sound file to sound data for O(1) lookup
let soundDataCache = null;

/**
 * Get or create the sound data lookup cache
 * @returns {Map<string, object>} Map of file path to sound data
 */
function getSoundDataCache() {
    if (!soundDataCache) {
        soundDataCache = new Map(SOUNDS.map(sound => [sound.file, sound]));
    }
    return soundDataCache;
}

// Filter sounds based on search (DOM version) with fuzzy matching
export function filterSounds() {
    const wrappers = document.querySelectorAll('.sound-btn-wrapper');
    const cache = getSoundDataCache();

    // Set aria-busy while filtering
    if (elements.contentArea) {
        elements.contentArea.setAttribute('aria-busy', 'true');
    }

    // Phase 1: Calculate matches (pure computation, no DOM writes)
    const matchResults = [];
    wrappers.forEach(wrapper => {
        const btn = wrapper.querySelector('.sound-btn');
        if (!btn) {
            matchResults.push({ wrapper, matches: false });
            return;
        }

        const name = btn.dataset.name.toLowerCase();
        const file = decodeURIComponent(btn.dataset.file);
        const fileLower = file.toLowerCase();

        // Check for matches: exact, substring, or fuzzy
        let matches = name.includes(state.searchTerm) || fileLower.includes(state.searchTerm);

        // If no exact/substring match, try fuzzy match
        if (!matches && state.searchTerm.length >= 3) {
            matches = fuzzyMatch(state.searchTerm, btn.dataset.name);
        }

        // Check tags if sound has them (O(1) lookup from cache)
        if (!matches) {
            const soundData = cache.get(file);
            if (soundData?.tags) {
                matches = soundData.tags.some(tag => tag.toLowerCase().includes(state.searchTerm));
            }
        }

        matchResults.push({ wrapper, matches });
    });

    // Phase 2: Batch DOM updates in requestAnimationFrame
    requestAnimationFrame(() => {
        let visibleCount = 0;

        // Apply visibility changes
        matchResults.forEach(({ wrapper, matches }) => {
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

        // Clear aria-busy
        if (elements.contentArea) {
            elements.contentArea.setAttribute('aria-busy', 'false');
        }

        // Announce results to screen readers
        announceSearchResults(visibleCount);
    });
}

// Announce search results to screen readers
function announceSearchResults(count) {
    // Only announce if there's a search term
    if (state.searchTerm) {
        const total = SOUNDS.length;
        const message = count === 0
            ? `No sounds found for "${state.searchTerm}"`
            : `Showing ${count} of ${total} sounds`;
        announce(message, { id: 'search-announcer' });
    } else {
        // Clear the announcer when search is cleared
        announce('', { id: 'search-announcer' });
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
