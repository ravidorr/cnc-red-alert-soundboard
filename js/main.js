// ============================================
// Main - Application entry point
// ============================================

import { VERSION } from './version.js';
import { cacheElements, renderCategories, renderFavoritesSection, renderPopularSection } from './ui.js';
import { renderNavigation, applyCollapsedStates } from './navigation.js';
import { renderRecentlyPlayedSection, loadRecentlyPlayed } from './recently-played.js';
import { loadFavorites } from './favorites.js';
import { setupAudioPlayer, checkUrlHash } from './audio.js';
import { setupInstallPrompt, registerServiceWorker } from './install.js';
import { setupEventListeners } from './events.js';
import { showOnboardingTooltip } from './onboarding.js';
import { initSidebarAccessibility, setupViewportListener } from './mobile.js';

// Set the app version in the footer
function setFooterVersion() {
    const versionElement = document.querySelector('.footer-version');
    if (versionElement) {
        versionElement.textContent = `v${VERSION}`;
    }
}

// Initialize the application
function init() {
    cacheElements();
    setFooterVersion();
    loadFavorites();
    loadRecentlyPlayed();
    setupAudioPlayer();
    setupInstallPrompt();
    renderCategories();
    renderFavoritesSection();
    renderRecentlyPlayedSection();
    renderPopularSection();
    renderNavigation();
    applyCollapsedStates(); // Apply saved collapse states
    setupEventListeners();
    registerServiceWorker();
    checkUrlHash();

    // Initialize sidebar accessibility based on viewport
    initSidebarAccessibility();
    setupViewportListener();

    // Show onboarding tooltip for first-time users (after a short delay)
    setTimeout(() => {
        showOnboardingTooltip();
    }, 1500);
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
export * from './onboarding.js';
export * from './confirm-modal.js';
export * from './contact-modal.js';

export { init };
