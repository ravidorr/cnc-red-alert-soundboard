/**
 * Shared test helpers for C&C Red Alert Soundboard tests
 */
import { jest } from '@jest/globals';

// Set up full DOM for integration tests
export function setupFullDOM() {
    document.body.innerHTML = `
        <div id="content-area"></div>
        <nav id="category-nav"><div class="nav-header">CATEGORIES</div></nav>
        <input id="search-input" />
        <button id="clear-search"></button>
        <button id="install-btn" class="btn-install-header"></button>
        <span id="total-favorites">0</span>
        <span id="visible-sounds">0</span>
        <div id="now-playing"></div>
        <span id="now-playing-title">-</span>
        <audio id="audio-player"></audio>
        <div id="install-prompt"></div>
        <button id="btn-install"></button>
        <button id="btn-dismiss"></button>
        <div id="toast-container"></div>
        <button id="mobile-menu-toggle" aria-expanded="false"></button>
        <div id="mobile-menu-overlay"></div>
        <div id="sidebar" class="sidebar"></div>
        <div id="search-empty-state" style="display: none;">
            <span id="search-empty-term"></span>
        </div>
        <button id="btn-clear-search"></button>
        <button id="random-sound"></button>
    `;
}

// Create mock storage for localStorage tests
export function createMockStorage() {
    return {
        store: {},
        getItem: jest.fn(function(key) {
            return this.store[key] || null;
        }),
        setItem: jest.fn(function(key, value) {
            this.store[key] = value;
        }),
        clear: jest.fn(function() {
            this.store = {};
        }),
    };
}

// Reset state
export function resetState(state) {
    state.audioPlayer = null;
    state.currentlyPlaying = null;
    state.searchTerm = '';
    state.deferredInstallPrompt = null;
    state.favorites = [];
    state.recentlyPlayed = [];
    state.isMuted = false;
}

// Reset elements
export function resetElements(elements) {
    elements.contentArea = null;
    elements.categoryNav = null;
    elements.searchInput = null;
    elements.clearSearch = null;
    elements.totalFavorites = null;
    elements.visibleSounds = null;
    elements.nowPlaying = null;
    elements.nowPlayingTitle = null;
    elements.audioPlayer = null;
    elements.installPrompt = null;
    elements.btnInstall = null;
    elements.btnDismiss = null;
    elements.installBtn = null;
    elements.toastContainer = null;
    elements.mobileMenuToggle = null;
    elements.mobileMenuOverlay = null;
    elements.sidebar = null;
    elements.searchEmptyState = null;
    elements.searchEmptyTerm = null;
    elements.btnClearSearch = null;
    elements.randomSoundBtn = null;
}
