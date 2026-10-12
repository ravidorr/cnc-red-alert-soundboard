// ============================================
// Search - Search/filter functionality
// ============================================

import { SOUNDS } from './constants.js';
import { state, elements } from './state.js';
import { showSearchEmptyState, hideSearchEmptyState } from './ui.js';
import { fuzzyMatch, announce } from './utils.js';
import { trackEvent, truncateText } from './analytics.js';

// Cache: Map sound file to sound data for O(1) lookup
let soundDataCache = null;

// Searches are reported once the term settles; filtering runs for every typed prefix
const SEARCH_TRACK_DELAY_MS = 1000;
let searchTrackTimer = null;
let lastTrackedSearchTerm = '';

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
    // Unique matched sounds and how each matched (a sound can appear in several sections)
    const matchedSounds = new Map();
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
        // matchType ends up as the check that matched, since later checks only run without a match
        let matches = name.includes(state.searchTerm) || fileLower.includes(state.searchTerm);
        let matchType = 'text';

        // If no exact/substring match, try fuzzy match
        if (!matches && state.searchTerm.length >= 3) {
            matches = fuzzyMatch(state.searchTerm, btn.dataset.name);
            matchType = 'fuzzy';
        }

        // Check tags if sound has them (O(1) lookup from cache)
        if (!matches) {
            const soundData = cache.get(file);
            if (soundData?.tags) {
                matches = soundData.tags.some(tag => tag.toLowerCase().includes(state.searchTerm));
                matchType = 'tag';
            }
        }

        if (matches) {
            matchedSounds.set(file, matchType);
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

        scheduleSearchTracking(matchedSounds);

        // Clear aria-busy
        if (elements.contentArea) {
            elements.contentArea.setAttribute('aria-busy', 'false');
        }

        // Announce results to screen readers
        announceSearchResults(visibleCount);
    });
}

// Report the search once the term has settled, unless it was just reported
function scheduleSearchTracking(matchedSounds) {
    clearTimeout(searchTrackTimer);
    const term = state.searchTerm;
    if (!term) {
        // Search cleared: searching the same term again counts as a new search
        lastTrackedSearchTerm = '';
        return;
    }

    const properties = getSearchProperties(term, matchedSounds);
    searchTrackTimer = setTimeout(() => {
        // Skip if the user kept typing (filter not run yet) or this term was just reported
        if (term !== state.searchTerm || term === lastTrackedSearchTerm) {
            return;
        }
        lastTrackedSearchTerm = term;
        trackEvent('sound_search_performed', properties);
    }, SEARCH_TRACK_DELAY_MS);
}

// Describe a search for sound_search_performed; results_count = 0 is the empty state
function getSearchProperties(term, matchedSounds) {
    const cache = getSoundDataCache();
    const matchTypes = [...matchedSounds.values()];
    const categories = new Set([...matchedSounds.keys()].map(file => cache.get(file)?.category));
    return {
        search_term: truncateText(term),
        search_term_length: term.length,
        results_count: matchedSounds.size,
        has_results: matchedSounds.size > 0,
        matched_category_count: categories.size,
        fuzzy_match_count: matchTypes.filter(type => type === 'fuzzy').length,
        tag_match_count: matchTypes.filter(type => type === 'tag').length,
        total_sounds: SOUNDS.length,
    };
}

/**
 * Cancel a pending search report and forget the last reported term
 * Useful for testing
 */
export function resetSearchTracking() {
    clearTimeout(searchTrackTimer);
    searchTrackTimer = null;
    lastTrackedSearchTerm = '';
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
