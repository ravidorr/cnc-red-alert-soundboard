// ============================================
// Utils - Pure utility functions (no DOM dependencies)
// ============================================

/**
 * Load favorites from localStorage
 * @param {Storage} storage - localStorage or mock
 * @returns {string[]} Array of favorite file names
 */
export function loadFavoritesFromStorage(storage) {
    try {
        const stored = storage.getItem('cnc-favorites');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading favorites:', e);
    }
    return [];
}

/**
 * Save favorites to localStorage
 * @param {Storage} storage - localStorage or mock
 * @param {string[]} favorites - Array of favorite file names
 */
export function saveFavoritesToStorage(storage, favorites) {
    try {
        storage.setItem('cnc-favorites', JSON.stringify(favorites));
    } catch (e) {
        console.error('Error saving favorites:', e);
    }
}

/**
 * Toggle a sound in the favorites array
 * @param {string[]} favorites - Current favorites array
 * @param {string} soundFile - File to toggle
 * @returns {string[]} New favorites array
 */
export function toggleFavoriteInArray(favorites, soundFile) {
    const newFavorites = [...favorites];
    const index = newFavorites.indexOf(soundFile);
    if (index === -1) {
        newFavorites.push(soundFile);
    } else {
        newFavorites.splice(index, 1);
    }
    return newFavorites;
}

/**
 * Check if a sound is a favorite
 * @param {string[]} favorites - Favorites array
 * @param {string} soundFile - File to check
 * @returns {boolean}
 */
export function isFavorite(favorites, soundFile) {
    return favorites.includes(soundFile);
}

/**
 * Reorder favorites by moving draggedFile to targetFile's position
 * @param {string[]} favorites - Current favorites array
 * @param {string} draggedFile - File being dragged
 * @param {string} targetFile - Drop target file
 * @returns {string[]} New favorites array
 */
export function reorderFavoritesArray(favorites, draggedFile, targetFile) {
    const draggedIndex = favorites.indexOf(draggedFile);
    const targetIndex = favorites.indexOf(targetFile);

    if (draggedIndex === -1 || targetIndex === -1) {
        return favorites;
    }

    const newFavorites = [...favorites];
    newFavorites.splice(draggedIndex, 1);
    newFavorites.splice(targetIndex, 0, draggedFile);

    return newFavorites;
}

/**
 * Load recently played from localStorage
 * @param {Storage} storage - localStorage or mock
 * @returns {string[]} Array of recently played file names
 */
export function loadRecentlyPlayedFromStorage(storage) {
    try {
        const stored = storage.getItem('cnc-recently-played');
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading recently played:', e);
    }
    return [];
}

/**
 * Save recently played to localStorage
 * @param {Storage} storage - localStorage or mock
 * @param {string[]} recentlyPlayed - Array of recently played file names
 */
export function saveRecentlyPlayedToStorage(storage, recentlyPlayed) {
    try {
        storage.setItem('cnc-recently-played', JSON.stringify(recentlyPlayed));
    } catch (e) {
        console.error('Error saving recently played:', e);
    }
}

/**
 * Add a sound to recently played array
 * @param {string[]} recentlyPlayed - Current recently played array
 * @param {string} soundFile - File to add
 * @param {number} maxItems - Maximum items to keep
 * @returns {string[]} New recently played array
 */
export function addToRecentlyPlayedArray(recentlyPlayed, soundFile, maxItems) {
    // Remove if already exists
    const filtered = recentlyPlayed.filter(f => f !== soundFile);
    // Add to front
    const newList = [soundFile, ...filtered];
    // Limit to maxItems
    return newList.slice(0, maxItems);
}

/**
 * Filter sounds based on search term
 * @param {Object[]} sounds - Array of sound objects
 * @param {string} searchTerm - Search term (will be lowercased)
 * @returns {Object[]} Filtered sounds
 */
export function filterSoundsArray(sounds, searchTerm) {
    if (!searchTerm) {
        return sounds;
    }
    const term = searchTerm.toLowerCase();
    return sounds.filter(sound => {
        const name = sound.name.toLowerCase();
        const file = sound.file.toLowerCase();
        return name.includes(term) || file.includes(term);
    });
}

/**
 * Get sounds by category
 * @param {Object[]} sounds - Array of sound objects
 * @param {string} category - Category to filter by
 * @returns {Object[]} Filtered sounds
 */
export function getSoundsByCategory(sounds, category) {
    return sounds.filter(s => s.category === category);
}

/**
 * Get sorted categories
 * @param {Object} categories - Categories object
 * @returns {Array} Sorted array of [categoryId, categoryInfo]
 */
export function getSortedCategories(categories) {
    return Object.entries(categories).sort((a, b) => a[1].order - b[1].order);
}

/**
 * Calculate scroll offset for category navigation
 * @param {number} elementTop - Element's top position from getBoundingClientRect
 * @param {number} scrollY - Current scroll position
 * @param {number} headerOffset - Fixed header height + padding
 * @returns {number} Calculated scroll position
 */
export function calculateScrollOffset(elementTop, scrollY, headerOffset) {
    return elementTop + scrollY - headerOffset;
}

/**
 * Check if install prompt should be shown
 * @param {Storage} storage - localStorage or mock
 * @param {number} dismissDays - Number of days to hide after dismiss
 * @returns {boolean}
 */
export function shouldShowInstallPrompt(storage, dismissDays) {
    const dismissedAt = storage.getItem('installPromptDismissed');
    if (dismissedAt) {
        const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
        if (daysSinceDismissed < dismissDays) {
            return false;
        }
    }
    return true;
}
