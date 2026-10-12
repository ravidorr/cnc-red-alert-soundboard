// ============================================
// Main - Application entry point
// ============================================

import { VERSION } from './version.js';
import { cacheElements, renderCategories, renderFavoritesSection, renderPopularSection, showToast } from './ui.js';
import { renderNavigation, applyCollapsedStates } from './navigation.js';
import { renderRecentlyPlayedSection, loadRecentlyPlayed } from './recently-played.js';
import { loadFavorites } from './favorites.js';
import { setupAudioPlayer, checkUrlHash, playRandomSound } from './audio.js';
import { elements, state } from './state.js';
import { setupInstallPrompt, registerServiceWorker } from './install.js';
import { setupEventListeners } from './events.js';
import { showOnboardingTooltip } from './onboarding.js';
import { initSidebarAccessibility, setupViewportListener } from './mobile.js';
import { trackEvent, getDisplayMode, truncateText } from './analytics.js';

// Set the app version in the footer
function setFooterVersion() {
    const versionElement = document.querySelector('.footer-version');
    if (versionElement) {
        versionElement.textContent = `v${VERSION}`;
    }
}

// Set up offline/online status notifications
function setupNetworkStatusListeners() {
    // A PWA launched without a connection never receives an 'offline' event
    if (!navigator.onLine) {
        state.offlineSince = Date.now();
    }

    window.addEventListener('online', () => {
        showToast('CONNECTION RESTORED', 'success');
        trackConnectionRestored();
    });

    window.addEventListener('offline', () => {
        state.offlineSince = Date.now();
        showToast('OPERATING OFFLINE MODE', 'info');
    });
}

// Summarize the offline period that just ended; events can't be sent while offline
function trackConnectionRestored() {
    if (state.offlineSince === null) {
        return; // No offline period recorded (repeated 'online' event)
    }
    trackEvent('app_connection_restored', {
        offline_duration_seconds: Math.round((Date.now() - state.offlineSince) / 1000),
        sounds_played_while_offline: state.soundsPlayedWhileOffline,
        display_mode: getDisplayMode(),
        app_version: VERSION,
    });
    state.offlineSince = null;
    state.soundsPlayedWhileOffline = 0;
}

// Report an app launch from one of the installed PWA's app-icon shortcuts
function trackShortcutLaunched(action) {
    trackEvent('pwa_shortcut_launched', {
        action: truncateText(action),
        display_mode: getDisplayMode(),
    });
}

// Handle PWA shortcut actions from URL parameters
function handleShortcutActions() {
    const params = new URLSearchParams(window.location.search);
    const action = params.get('action');

    if (!action) {
        // The Favorites shortcut opens ./#category-favorites without an action parameter
        if (window.location.hash === '#category-favorites') {
            trackShortcutLaunched('favorites');
        }
        return;
    }

    // Record every launch, including unknown actions the switch below ignores
    trackShortcutLaunched(action);

    // Clear the URL parameter without reloading
    const cleanUrl = window.location.pathname + window.location.hash;
    window.history.replaceState({}, '', cleanUrl);

    switch (action) {
    case 'random':
        // Delay to ensure audio is set up
        setTimeout(() => playRandomSound('pwa_shortcut'), 500);
        break;
    case 'search':
        // Focus the search input
        setTimeout(() => {
            if (elements.searchInput) {
                elements.searchInput.focus();
            }
        }, 300);
        break;
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
    // Hide SEO intro once sounds are loaded (keeps it visible for search engines)
    document.getElementById('content-area')?.classList.add('sounds-loaded');
    renderFavoritesSection();
    renderRecentlyPlayedSection();
    renderPopularSection();
    renderNavigation();
    applyCollapsedStates(); // Apply saved collapse states
    setupEventListeners();
    registerServiceWorker();
    setupNetworkStatusListeners();
    checkUrlHash();
    handleShortcutActions();

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
export * from './analytics.js';

export { init, handleShortcutActions };
