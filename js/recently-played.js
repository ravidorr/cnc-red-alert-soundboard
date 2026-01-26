// ============================================
// Recently Played - Recently played management
// ============================================

import { SOUNDS, MAX_RECENTLY_PLAYED } from './constants.js';
import { state, elements } from './state.js';
import {
    loadRecentlyPlayedFromStorage,
    saveRecentlyPlayedToStorage,
    addToRecentlyPlayedArray,
    isFavorite,
} from './utils.js';

// Load recently played from localStorage (wrapper for DOM context)
export function loadRecentlyPlayed() {
    state.recentlyPlayed = loadRecentlyPlayedFromStorage(localStorage);
}

// Save recently played to localStorage (wrapper for DOM context)
export function saveRecentlyPlayed() {
    saveRecentlyPlayedToStorage(localStorage, state.recentlyPlayed);
}

// Add a sound to recently played
export function addToRecentlyPlayed(soundFile) {
    state.recentlyPlayed = addToRecentlyPlayedArray(state.recentlyPlayed, soundFile, MAX_RECENTLY_PLAYED);
    saveRecentlyPlayed();
    renderRecentlyPlayedSection();
}

// Render the recently played section
export function renderRecentlyPlayedSection() {
    // Remove existing section
    const existingSection = document.getElementById('category-recent');
    if (existingSection) {
        existingSection.remove();
    }

    // Don't render if no recently played
    if (state.recentlyPlayed.length === 0) {
        return;
    }

    // Get sounds in the order they appear in recentlyPlayed
    const recentSounds = state.recentlyPlayed
        .map(file => SOUNDS.find(s => s.file === file))
        .filter(Boolean);

    if (recentSounds.length === 0) {
        return;
    }

    const buttonsHtml = recentSounds.map(sound => {
        const isFav = isFavorite(state.favorites, sound.file);
        const favAriaLabel = isFav ? `Remove ${sound.name} from favorites` : `Add ${sound.name} to favorites`;
        return `
        <div class="sound-btn-wrapper">
            <button class="sound-btn" 
                    data-file="${encodeURIComponent(sound.file)}" 
                    data-name="${sound.name}"
                    data-category="recent"
                    title="File: ${sound.file}">
                ${sound.name}
            </button>
            <button class="favorite-btn ${isFav ? 'is-favorite' : ''}" 
                    data-file="${encodeURIComponent(sound.file)}"
                    aria-label="${favAriaLabel}"
                    title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">${isFav ? '&#9733;' : '&#9734;'}</button>
        </div>
    `;
    }).join('');

    const sectionHtml = `
        <section class="category-section recent-section" id="category-recent" data-category="recent">
            <div class="category-header" tabindex="0" role="button" aria-expanded="true">
                <div class="category-title">
                    <h2 class="category-name">RECENTLY PLAYED</h2>
                    <span class="category-count">(${recentSounds.length})</span>
                </div>
                <span class="category-toggle" aria-hidden="true">&#9660;</span>
            </div>
            <div class="category-content" id="category-content-recent">
                ${buttonsHtml}
            </div>
        </section>
    `;

    // Insert after favorites section or at beginning
    const favoritesSection = document.getElementById('category-favorites');
    if (favoritesSection) {
        favoritesSection.insertAdjacentHTML('afterend', sectionHtml);
    } else {
        elements.contentArea.insertAdjacentHTML('afterbegin', sectionHtml);
    }
}
