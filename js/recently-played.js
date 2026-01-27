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
import { renderNavigation } from './navigation.js';

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
    renderNavigation(); // Update nav item count
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
            <button class="share-btn" 
                    data-file="${encodeURIComponent(sound.file)}"
                    data-name="${sound.name}"
                    aria-label="Share ${sound.name}"
                    title="Share sound">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
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
                    <h2 class="category-name"><span class="section-icon" aria-hidden="true">&#128337;</span> RECENTLY PLAYED</h2>
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
