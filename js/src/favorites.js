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
        showToast(`Added "${soundName}" to favorites`, 'success');
    } else {
        showToast(`Removed "${soundName}" from favorites`, 'info');
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
        btn.innerHTML = isFav ? '&#9733;' : '&#9734;';
        btn.title = isFav ? 'Remove from favorites' : 'Add to favorites';
        btn.setAttribute('aria-label', isFav ? `Remove ${soundName} from favorites` : `Add ${soundName} from favorites`);
    });
}

// Reorder favorites by moving draggedFile to targetFile's position
export function reorderFavorites(draggedFile, targetFile) {
    state.favorites = reorderFavoritesArray(state.favorites, draggedFile, targetFile);
    saveFavorites();
    renderFavoritesSection();
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
