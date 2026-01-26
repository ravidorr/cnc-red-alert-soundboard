// ============================================
// Main - Application entry point
// ============================================

import { cacheElements, renderCategories, renderFavoritesSection, renderPopularSection, updateStats } from './ui.js';
import { renderNavigation } from './navigation.js';
import { renderRecentlyPlayedSection, loadRecentlyPlayed } from './recently-played.js';
import { loadFavorites } from './favorites.js';
import { setupAudioPlayer, checkUrlHash } from './audio.js';
import { setupInstallPrompt, registerServiceWorker } from './install.js';
import { setupEventListeners } from './events.js';

// Initialize the application
function init() {
    cacheElements();
    loadFavorites();
    loadRecentlyPlayed();
    setupAudioPlayer();
    setupInstallPrompt();
    renderCategories();
    renderFavoritesSection();
    renderRecentlyPlayedSection();
    renderPopularSection();
    renderNavigation();
    setupEventListeners();
    updateStats();
    registerServiceWorker();
    checkUrlHash();
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Re-export everything for testing compatibility
export * from './constants.js';
export * from './state.js';
export * from './utils.js';
export * from './audio.js';
export * from './favorites.js';
export * from './recently-played.js';
export * from './ui.js';
export * from './navigation.js';
export * from './search.js';
export * from './mobile.js';
export * from './install.js';
export * from './events.js';

export { init };
