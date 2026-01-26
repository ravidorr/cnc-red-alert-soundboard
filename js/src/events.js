// ============================================
// Events - Event listeners setup
// ============================================

import { state, elements } from './state.js';
import { playSound, stopAllSounds, playRandomSound } from './audio.js';
import { toggleFavorite } from './favorites.js';
import { toggleCategory, scrollToCategory } from './navigation.js';
import { filterSounds } from './search.js';
import { toggleMobileMenu, closeMobileMenu } from './mobile.js';

// Setup event listeners
export function setupEventListeners() {
    // Sound button and favorite button clicks
    elements.contentArea.addEventListener('click', (e) => {
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

    // Stop all button
    elements.stopAllBtn.addEventListener('click', stopAllSounds);

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

    // Random sound button
    if (elements.randomSoundBtn) {
        elements.randomSoundBtn.addEventListener('click', playRandomSound);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Escape to stop sounds
        if (e.key === 'Escape') {
            stopAllSounds();
        }
        // Ctrl/Cmd + F to focus search
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
            e.preventDefault();
            elements.searchInput.focus();
            elements.searchInput.select();
        }
    });
}
