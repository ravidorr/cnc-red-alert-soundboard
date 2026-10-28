// ============================================
// Events - Event listeners setup
// ============================================

import { state, elements } from './state.js';
import { playSound, playRandomSound, stopAllSounds, replayLastSound } from './audio.js';
import { toggleFavorite, moveFavoriteUp, moveFavoriteDown, clearAllFavorites } from './favorites.js';
import { toggleCategory, scrollToCategory } from './navigation.js';
import { filterSounds } from './search.js';
import { toggleMobileMenu, closeMobileMenu } from './mobile.js';
import { shareSound } from './ui.js';
import { debounce, createFocusTrap } from './utils.js';
import { showOnboardingTooltipForced } from './onboarding.js';
import { showContactModal, hideContactModal } from './contact-modal.js';
import { trackEvent } from './analytics.js';

// Debounced search function (200ms delay for performance)
const debouncedFilterSounds = debounce(filterSounds, 200);

// Cleanup registry for event listeners that need to be removed
const cleanupFunctions = [];

/**
 * Register a cleanup function to be called when cleaning up event listeners
 * @param {Function} cleanupFn - Function to call during cleanup
 */
function registerCleanup(cleanupFn) {
    cleanupFunctions.push(cleanupFn);
}

/**
 * Get the section a control sits in, for analytics
 * @param {HTMLElement} element - Control inside a category section
 * @returns {string|null} Category id, 'favorites', 'recent', 'popular', or null
 */
function getSourceSection(element) {
    return element.closest('.category-section')?.dataset.category ?? null;
}

/**
 * Clean up all registered event listeners
 * Useful for testing or when re-initializing the app
 */
export function cleanupEventListeners() {
    cleanupFunctions.forEach(fn => fn());
    cleanupFunctions.length = 0;
}

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
            shareSound(file, name, getSourceSection(shareBtn));
            return;
        }

        // Handle favorite button click
        const favBtn = e.target.closest('.favorite-btn');
        if (favBtn) {
            e.stopPropagation();
            const file = decodeURIComponent(favBtn.dataset.file);
            toggleFavorite(file, getSourceSection(favBtn));
            return;
        }

        // Handle clear all favorites button
        const clearFavBtn = e.target.closest('.btn-clear-favorites');
        if (clearFavBtn) {
            e.stopPropagation();
            clearAllFavorites();
            return;
        }

        // Handle sound button click
        const btn = e.target.closest('.sound-btn');
        if (btn) {
            playSound(btn, 'click');
        }

        // Handle category header click
        const header = e.target.closest('.category-header');
        if (header) {
            toggleCategory(header.closest('.category-section'));
        }
    });

    // Keyboard support for interactive elements in content area
    elements.contentArea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            // Handle share button keyboard activation
            const shareBtn = e.target.closest('.share-btn');
            if (shareBtn) {
                e.preventDefault();
                e.stopPropagation();
                const file = decodeURIComponent(shareBtn.dataset.file);
                const name = shareBtn.dataset.name;
                shareSound(file, name, getSourceSection(shareBtn));
                return;
            }

            // Handle favorite button keyboard activation
            const favBtn = e.target.closest('.favorite-btn');
            if (favBtn) {
                e.preventDefault();
                e.stopPropagation();
                const file = decodeURIComponent(favBtn.dataset.file);
                toggleFavorite(file, getSourceSection(favBtn));
                return;
            }

            // Handle sound button keyboard activation. Like the controls below, stop
            // propagation so Space doesn't also trigger the global replay shortcut.
            const soundBtn = e.target.closest('.sound-btn');
            if (soundBtn) {
                e.preventDefault();
                e.stopPropagation();
                playSound(soundBtn, 'keyboard');
                return;
            }

            // Handle category header keyboard activation
            const header = e.target.closest('.category-header');
            if (header) {
                e.preventDefault();
                e.stopPropagation();
                toggleCategory(header.closest('.category-section'));
                return;
            }

            // Handle clear favorites button keyboard activation
            const clearFavBtn = e.target.closest('.btn-clear-favorites');
            if (clearFavBtn) {
                e.preventDefault();
                e.stopPropagation();
                clearAllFavorites();
                return;
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

    // Search input (debounced for performance)
    elements.searchInput.addEventListener('input', (e) => {
        state.searchTerm = e.target.value.toLowerCase();
        debouncedFilterSounds();
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
        elements.randomSoundBtn.addEventListener('click', () => playRandomSound('random_button'));
    }

    // Back to top button
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        const scrollHandler = () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 500);
        };
        window.addEventListener('scroll', scrollHandler);
        registerCleanup(() => window.removeEventListener('scroll', scrollHandler));

        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        const isInInput = document.activeElement.tagName === 'INPUT' ||
                          document.activeElement.tagName === 'TEXTAREA';

        // Escape to close modals or stop playback
        if (e.key === 'Escape') {
            const shortcutsModal = document.getElementById('shortcuts-modal');
            const contactModal = document.getElementById('contact-modal');
            if (shortcutsModal?.classList.contains('visible')) {
                hideShortcutsModal();
                trackShortcutUsed(e, 'escape', 'close_shortcuts_modal', true);
            } else if (contactModal?.classList.contains('visible')) {
                hideContactModal();
                trackShortcutUsed(e, 'escape', 'close_contact_modal', true);
            } else {
                // Stop any playing sound
                const wasPlaying = state.currentlyPlaying !== null;
                stopAllSounds();
                trackShortcutUsed(e, 'escape', 'stop_playback', wasPlaying);
            }
        }

        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            elements.searchInput.focus();
            elements.searchInput.select();
            trackShortcutUsed(e, 'ctrl_cmd_f', 'focus_search', true);
        }

        // ? to show shortcuts (when not in input)
        if (e.key === '?' && !isInInput) {
            showShortcutsModal();
            trackShortcutUsed(e, 'question_mark', 'open_shortcuts_help', true);
        }

        // Space to replay last sound (when not in input)
        if (e.key === ' ' && !isInInput) {
            e.preventDefault();
            const playingBefore = state.currentlyPlaying;
            replayLastSound();
            trackShortcutUsed(e, 'space', 'replay_last_sound', state.currentlyPlaying !== playingBefore);
        }

        // Number keys 1-9 to play corresponding favorite
        if (e.key >= '1' && e.key <= '9' && !isInInput) {
            const index = parseInt(e.key) - 1;
            const playingBefore = state.currentlyPlaying;
            if (state.favorites[index]) {
                const file = state.favorites[index];
                const btn = document.querySelector(`.sound-btn[data-file="${encodeURIComponent(file)}"]`);
                if (btn) {
                    playSound(btn, 'favorite_hotkey');
                }
            }
            trackShortcutUsed(e, 'number_key', 'play_favorite', state.currentlyPlaying !== playingBefore, index + 1);
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

    // Show tips button in shortcuts modal
    const showTipsBtn = document.getElementById('show-tips-btn');
    if (showTipsBtn) {
        showTipsBtn.addEventListener('click', () => {
            hideShortcutsModal();
            showOnboardingTooltipForced();
        });
    }

    // Contact button
    const contactBtn = document.getElementById('contact-btn');
    if (contactBtn) {
        contactBtn.addEventListener('click', showContactModal);
    }

    // Contact modal close
    const contactClose = document.getElementById('contact-close');
    if (contactClose) {
        contactClose.addEventListener('click', hideContactModal);
    }

    // Close contact modal on backdrop click
    const contactModal = document.getElementById('contact-modal');
    if (contactModal) {
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                hideContactModal();
            }
        });
    }
}

/**
 * Report a global keyboard shortcut. Auto-repeat from a held key is skipped
 * so each press counts once; no-ops are reported with had_effect false.
 * @param {KeyboardEvent} e - The keydown event
 * @param {string} shortcut - Shortcut id
 * @param {string} action - What the shortcut does
 * @param {boolean} hadEffect - Whether the shortcut changed anything
 * @param {number|null} [favoriteSlot] - Favorite slot for number keys
 */
function trackShortcutUsed(e, shortcut, action, hadEffect, favoriteSlot = null) {
    if (e.repeat) {
        return;
    }
    window.pendo?.updateOptions?.({ visitor: { uses_keyboard_shortcuts: true } });
    trackEvent('keyboard_shortcut_used', {
        shortcut,
        action,
        favorite_slot: favoriteSlot,
        had_effect: hadEffect,
    });
}

// Shortcuts modal functions
let shortcutsTrigger = null;

function showShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
        shortcutsTrigger = document.activeElement;
        modal.classList.add('visible');

        // Add focus trap event listener
        modal.addEventListener('keydown', handleShortcutsModalKeydown);

        const closeBtn = modal.querySelector('#shortcuts-close');
        if (closeBtn) {
            setTimeout(() => closeBtn.focus(), 50);
        }
    }
}

function hideShortcutsModal() {
    const modal = document.getElementById('shortcuts-modal');
    if (modal) {
        modal.classList.remove('visible');

        // Remove focus trap event listener
        modal.removeEventListener('keydown', handleShortcutsModalKeydown);

        shortcutsTrigger?.focus?.();
        shortcutsTrigger = null;
    }
}

// Create focus trap handler for shortcuts modal
// Using createFocusTrap for consistent focus trap behavior
function handleShortcutsModalKeydown(e) {
    const modal = document.getElementById('shortcuts-modal');
    if (!modal || !modal.classList.contains('visible')) {
        return;
    }

    // Use the centralized focus trap utility
    const focusTrapHandler = createFocusTrap(modal, {
        onEscape: () => hideShortcutsModal(),
    });
    focusTrapHandler(e);
}

// Export for testing
export { showShortcutsModal, hideShortcutsModal, handleShortcutsModalKeydown, showContactModal, hideContactModal };
