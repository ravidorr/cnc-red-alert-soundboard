// ============================================
// Events - Event listeners setup
// ============================================

import { state, elements } from './state.js';
import { playSound, playRandomSound } from './audio.js';
import { toggleFavorite, moveFavoriteUp, moveFavoriteDown } from './favorites.js';
import { toggleCategory, scrollToCategory } from './navigation.js';
import { filterSounds } from './search.js';
import { toggleMobileMenu, closeMobileMenu } from './mobile.js';
import { shareSound } from './ui.js';

// Setup event listeners
export function setupEventListeners() {
    // Sound button, share button, and favorite button clicks
    elements.contentArea.addEventListener('click', (e) => {
        // Handle share button click
        const shareBtn = e.target.closest('.share-btn');
        if (shareBtn) {
            e.stopPropagation();
            const file = decodeURIComponent(shareBtn.dataset.file);
            const name = shareBtn.dataset.name;
            shareSound(file, name);
            return;
        }

        // Handle favorite button click
        const favBtn = e.target.closest('.favorite-btn');
        if (favBtn) {
            e.stopPropagation();
            const file = decodeURIComponent(favBtn.dataset.file);
            toggleFavorite(file);
            return;
        }

        // Handle sound button click
        const btn = e.target.closest('.sound-btn');
        if (btn) {
            playSound(btn);
        }

        // Handle category header click
        const header = e.target.closest('.category-header');
        if (header) {
            toggleCategory(header.closest('.category-section'));
        }
    });

    // Keyboard support for category headers
    elements.contentArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            const header = e.target.closest('.category-header');
            if (header) {
                e.preventDefault();
                toggleCategory(header.closest('.category-section'));
            }
        }

        // Arrow key support for favorites reordering
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            const wrapper = e.target.closest('.favorites-section .sound-btn-wrapper');
            if (wrapper && wrapper.dataset.file) {
                e.preventDefault();
                const file = decodeURIComponent(wrapper.dataset.file);
                if (e.key === 'ArrowUp') {
                    moveFavoriteUp(file);
                } else {
                    moveFavoriteDown(file);
                }
            }
        }
    });

    // Navigation clicks
    elements.categoryNav.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item');
        if (navItem) {
            scrollToCategory(navItem.dataset.category);
            // Close mobile menu if open
            closeMobileMenu();
        }
    });

    // Search input
    elements.searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.toLowerCase();
        filterSounds();
    });

    // Clear search
    elements.clearSearch.addEventListener('click', () => {
        elements.searchInput.value = '';
        state.searchTerm = '';
        filterSounds();
        elements.searchInput.focus();
    });

    // Mobile menu toggle
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.addEventListener('click', toggleMobileMenu);
    }

    // Close mobile menu on overlay click
    if (elements.mobileMenuOverlay) {
        elements.mobileMenuOverlay.addEventListener('click', closeMobileMenu);
    }

    // Clear search button in empty state
    if (elements.btnClearSearch) {
        elements.btnClearSearch.addEventListener('click', () => {
            elements.searchInput.value = '';
            state.searchTerm = '';
            filterSounds();
            elements.searchInput.focus();
        });
    }

    // Clear filter button in search result indicator
    const btnClearFilter = document.getElementById('btn-clear-filter');
    if (btnClearFilter) {
        btnClearFilter.addEventListener('click', () => {
            elements.searchInput.value = '';
            state.searchTerm = '';
            filterSounds();
            elements.searchInput.focus();
        });
    }

    // Random sound button
    if (elements.randomSoundBtn) {
        elements.randomSoundBtn.addEventListener('click', playRandomSound);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to close modals
        if (e.key === 'Escape') {
            const shortcutsModal = document.getElementById('shortcuts-modal');
            if (shortcutsModal && shortcutsModal.classList.contains('visible')) {
                hideShortcutsModal();
            }
        }
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            elements.searchInput.focus();
            elements.searchInput.select();
        }
        // ? to show shortcuts (when not in input)
        if (e.key === '?' && document.activeElement.tagName !== 'INPUT') {
            showShortcutsModal();
        }
    });

    // Help button
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
        helpBtn.addEventListener('click', showShortcutsModal);
    }

    // Shortcuts modal close
    const shortcutsClose = document.getElementById('shortcuts-close');
    if (shortcutsClose) {
        shortcutsClose.addEventListener('click', hideShortcutsModal);
    }

    // Close shortcuts on backdrop click
    const shortcutsModal = document.getElementById('shortcuts-modal');
    if (shortcutsModal) {
        shortcutsModal.addEventListener('click', (e) => {
            if (e.target === shortcutsModal) {
                hideShortcutsModal();
            }
        });
    }
}

// Shortcuts modal functions
let shortcutsTrigger = null;

function showShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
        shortcutsTrigger = document.activeElement;
        modal.classList.add('visible');
        const closeBtn = modal.querySelector('#shortcuts-close');
        if (closeBtn) {
            closeBtn.focus();
        }
    }
}

function hideShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
        modal.classList.remove('visible');
        if (shortcutsTrigger && shortcutsTrigger.focus) {
            shortcutsTrigger.focus();
        }
        shortcutsTrigger = null;
    }
}
