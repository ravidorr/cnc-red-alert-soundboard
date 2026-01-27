// ============================================
// Favorites - Favorites management
// ============================================

import { SOUNDS } from './constants.js';
import { state } from './state.js';
import {
    loadFavoritesFromStorage,
    saveFavoritesToStorage,
    toggleFavoriteInArray,
    isFavorite,
    reorderFavoritesArray,
} from './utils.js';
import { showToast, renderFavoritesSection, updateStats } from './ui.js';
import { renderNavigation } from './navigation.js';

// Load favorites from localStorage (wrapper for DOM context)
export function loadFavorites() {
    state.favorites = loadFavoritesFromStorage(localStorage);
}

// Save favorites to localStorage (wrapper for DOM context)
export function saveFavorites() {
    saveFavoritesToStorage(localStorage, state.favorites);
}

// Clear all favorites
export function clearAllFavorites() {
    if (state.favorites.length === 0) {
        showToast('No favorites to clear', 'info');
        return;
    }
    state.favorites = [];
    saveFavorites();
    renderFavoritesSection();
    renderNavigation();
    updateFavoriteButtons();
    updateStats();
    showToast('All favorites cleared', 'info');
}

// Toggle a sound as favorite
export function toggleFavorite(soundFile) {
    const wasAdded = !state.favorites.includes(soundFile);
    state.favorites = toggleFavoriteInArray(state.favorites, soundFile);
    saveFavorites();
    renderFavoritesSection();
    renderNavigation();
    updateFavoriteButtons();
    updateStats();

    // Show toast feedback
    const sound = SOUNDS.find(s => s.file === soundFile);
    const soundName = sound ? sound.name : 'Sound';
    if (wasAdded) {
        showToast(`Added ${soundName} to favorites`, 'success');
    } else {
        showToast(`Removed ${soundName} from favorites`, 'info');
    }
}

// Update all favorite button states
export function updateFavoriteButtons() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
        const file = decodeURIComponent(btn.dataset.file);
        const isFav = isFavorite(state.favorites, file);
        // Find the sound name for aria-label
        const sound = SOUNDS.find(s => s.file === file);
        const soundName = sound ? sound.name : 'sound';
        btn.classList.toggle('is-favorite', isFav);
        btn.innerHTML = `<span aria-hidden="true">${isFav ? '&#9733;' : '&#9734;'}</span>`;
        btn.title = isFav ? 'Remove from favorites' : 'Add to favorites';
        btn.setAttribute('aria-label', isFav ? `Remove ${soundName} from favorites` : `Add ${soundName} to favorites`);
    });
}

// Reorder favorites by moving draggedFile to targetFile's position
export function reorderFavorites(draggedFile, targetFile) {
    state.favorites = reorderFavoritesArray(state.favorites, draggedFile, targetFile);
    saveFavorites();
    renderFavoritesSection();
}

// Move favorite up in the list (keyboard accessible)
export function moveFavoriteUp(soundFile) {
    const index = state.favorites.indexOf(soundFile);
    if (index <= 0) {
        return; // Already at top or not found
    }
    // Swap with previous item
    const newFavorites = [...state.favorites];
    [newFavorites[index - 1], newFavorites[index]] = [newFavorites[index], newFavorites[index - 1]];
    state.favorites = newFavorites;
    saveFavorites();
    renderFavoritesSection();
    // Announce change to screen readers
    announceReorder(soundFile, 'up');
    // Re-focus the moved item
    focusFavoriteItem(soundFile);
}

// Move favorite down in the list (keyboard accessible)
export function moveFavoriteDown(soundFile) {
    const index = state.favorites.indexOf(soundFile);
    if (index < 0 || index >= state.favorites.length - 1) {
        return; // Already at bottom or not found
    }
    // Swap with next item
    const newFavorites = [...state.favorites];
    [newFavorites[index], newFavorites[index + 1]] = [newFavorites[index + 1], newFavorites[index]];
    state.favorites = newFavorites;
    saveFavorites();
    renderFavoritesSection();
    // Announce change to screen readers
    announceReorder(soundFile, 'down');
    // Re-focus the moved item
    focusFavoriteItem(soundFile);
}

// Announce reorder to screen readers
function announceReorder(soundFile, direction) {
    const sound = SOUNDS.find(s => s.file === soundFile);
    const soundName = sound ? sound.name : 'Sound';
    const index = state.favorites.indexOf(soundFile) + 1;
    const total = state.favorites.length;
    const message = `${soundName} moved ${direction}, now ${index} of ${total}`;

    // Use aria-live region if it exists, otherwise create temporary one
    let liveRegion = document.getElementById('reorder-announcer');
    if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'reorder-announcer';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('aria-atomic', 'true');
        liveRegion.className = 'visually-hidden';
        document.body.appendChild(liveRegion);
    }
    liveRegion.textContent = message;
}

// Focus a favorite item after reorder
function focusFavoriteItem(soundFile) {
    setTimeout(() => {
        const wrapper = document.querySelector(`.favorites-section .sound-btn-wrapper[data-file="${encodeURIComponent(soundFile)}"]`);
        if (wrapper) {
            const soundBtn = wrapper.querySelector('.sound-btn');
            if (soundBtn) {
                soundBtn.focus();
            }
        }
    }, 50);
}

// Setup drag and drop for favorites reordering
export function setupFavoritesDragAndDrop() {
    const favoritesSection = document.getElementById('category-favorites');
    if (!favoritesSection) {
        return;
    }

    const wrappers = favoritesSection.querySelectorAll('.sound-btn-wrapper[draggable="true"]');
    let draggedElement = null;

    wrappers.forEach(wrapper => {
        wrapper.addEventListener('dragstart', (e) => {
            draggedElement = wrapper;
            wrapper.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', wrapper.dataset.file);
        });

        wrapper.addEventListener('dragend', () => {
            wrapper.classList.remove('dragging');
            wrappers.forEach(w => w.classList.remove('drag-over'));
            draggedElement = null;
        });

        wrapper.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            if (wrapper !== draggedElement) {
                wrapper.classList.add('drag-over');
            }
        });

        wrapper.addEventListener('dragleave', () => {
            wrapper.classList.remove('drag-over');
        });

        wrapper.addEventListener('drop', (e) => {
            e.preventDefault();
            wrapper.classList.remove('drag-over');

            if (draggedElement && wrapper !== draggedElement) {
                const draggedFile = decodeURIComponent(draggedElement.dataset.file);
                const targetFile = decodeURIComponent(wrapper.dataset.file);
                reorderFavorites(draggedFile, targetFile);
            }
        });
    });
}
