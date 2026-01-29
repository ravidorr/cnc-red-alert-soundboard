// ============================================
// Utils - Utility functions
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
 * Simple fuzzy match function using Levenshtein distance
 * Returns true if the query is "close enough" to the text
 * @param {string} query - Search query
 * @param {string} text - Text to match against
 * @param {number} threshold - Max allowed edit distance (default: 2)
 * @returns {boolean} True if fuzzy match
 */
export function fuzzyMatch(query, text, threshold = 2) {
    if (!query || !text) {
        return false;
    }

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();

    // Exact substring match (fastest check)
    if (textLower.includes(queryLower)) {
        return true;
    }

    // For very short queries, only allow exact matches
    if (queryLower.length <= 2) {
        return false;
    }

    // Check if query is a fuzzy match for any word in the text
    const words = textLower.split(/[\s_-]+/);
    for (const word of words) {
        // Only fuzzy match if query and word are similar in length
        if (Math.abs(word.length - queryLower.length) <= threshold) {
            const distance = levenshteinDistance(queryLower, word);
            if (distance <= threshold) {
                return true;
            }
        }
    }

    return false;
}

/**
 * Calculate Levenshtein distance between two strings
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {number} Edit distance
 */
export function levenshteinDistance(a, b) {
    if (a.length === 0) {
        return b.length;
    }
    if (b.length === 0) {
        return a.length;
    }

    const matrix = [];

    // Initialize matrix
    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }
    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    // Fill in matrix
    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    matrix[i][j - 1] + 1,     // insertion
                    matrix[i - 1][j] + 1,      // deletion
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

/**
 * Filter sounds based on search term with fuzzy matching
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
        // Exact match first
        if (name.includes(term) || file.includes(term)) {
            return true;
        }
        // Tag match (if tags exist)
        if (sound.tags && sound.tags.some(tag => tag.toLowerCase().includes(term))) {
            return true;
        }
        // Fuzzy match on name
        if (fuzzyMatch(term, name)) {
            return true;
        }
        return false;
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

/**
 * Debounce function to limit how often a function can be called
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Default selector for focusable elements
 */
export const FOCUSABLE_SELECTOR = 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Create a focus trap keydown handler for modal-like elements
 * @param {HTMLElement} container - The container element to trap focus within
 * @param {Object} options - Configuration options
 * @param {Function} [options.onEscape] - Callback when Escape is pressed
 * @param {boolean} [options.stopPropagation=false] - Whether to stop Escape propagation
 * @param {Function} [options.onEmptyFocusables] - Callback when no focusables found (for closing)
 * @param {string} [options.focusableSelector] - Custom selector for focusable elements
 * @returns {Function} Keydown event handler
 */
export function createFocusTrap(container, options = {}) {
    const {
        onEscape,
        stopPropagation = false,
        onEmptyFocusables,
        focusableSelector = FOCUSABLE_SELECTOR,
    } = options;

    return function handleKeydown(e) {
        // Handle Escape key
        if (e.key === 'Escape') {
            if (stopPropagation) {
                e.stopPropagation();
            }
            if (onEscape) {
                onEscape(e);
            }
            return;
        }

        // Handle Tab key for focus trapping
        if (e.key === 'Tab') {
            const focusableElements = container.querySelectorAll(focusableSelector);

            if (focusableElements.length === 0) {
                e.preventDefault();
                if (onEmptyFocusables) {
                    onEmptyFocusables(e);
                }
                return;
            }

            const firstFocusable = focusableElements[0];
            const lastFocusable = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift+Tab: if on first element, go to last
                if (document.activeElement === firstFocusable) {
                    e.preventDefault();
                    lastFocusable.focus();
                }
            } else {
                // Tab: if on last element, go to first
                if (document.activeElement === lastFocusable) {
                    e.preventDefault();
                    firstFocusable.focus();
                }
            }
        }
    };
}

/**
 * Set up focus management for a modal-like element
 * @param {HTMLElement} container - The container element
 * @param {Object} options - Configuration options
 * @param {HTMLElement} [options.initialFocusElement] - Element to focus when opened
 * @param {number} [options.focusDelay=50] - Delay before focusing (ms)
 * @param {Function} [options.onEscape] - Callback when Escape is pressed
 * @param {boolean} [options.stopPropagation=false] - Whether to stop Escape propagation
 * @param {Function} [options.onEmptyFocusables] - Callback when no focusables found
 * @param {string} [options.focusableSelector] - Custom selector for focusable elements
 * @returns {Object} Object with cleanup function and handler
 */
export function setupFocusTrap(container, options = {}) {
    const {
        initialFocusElement,
        focusDelay = 50,
        ...trapOptions
    } = options;

    const handler = createFocusTrap(container, trapOptions);
    container.addEventListener('keydown', handler);

    // Focus the initial element if provided
    if (initialFocusElement) {
        setTimeout(() => {
            initialFocusElement.focus();
        }, focusDelay);
    }

    return {
        handler,
        cleanup: () => {
            container.removeEventListener('keydown', handler);
        },
    };
}

// ============================================
// Screen Reader Announcements
// ============================================

// Cache for announcer elements by ID
const announcerCache = new Map();

/**
 * Announce a message to screen readers using an aria-live region
 * Creates the announcer element if it doesn't exist, reuses if it does
 * @param {string} message - Message to announce
 * @param {object} [options] - Configuration options
 * @param {string} [options.id='sr-announcer'] - ID for the announcer element
 * @param {string} [options.priority='polite'] - 'polite' or 'assertive'
 * @param {boolean} [options.atomic=true] - Whether to announce entire region
 * @returns {HTMLElement} The announcer element
 */
export function announce(message, options = {}) {
    const {
        id = 'sr-announcer',
        priority = 'polite',
        atomic = true,
    } = options;

    let announcer = announcerCache.get(id) || document.getElementById(id);

    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = id;
        announcer.setAttribute('aria-live', priority);
        if (atomic) {
            announcer.setAttribute('aria-atomic', 'true');
        }
        announcer.className = 'visually-hidden';
        document.body.appendChild(announcer);
        announcerCache.set(id, announcer);
    }

    announcer.textContent = message;
    return announcer;
}

/**
 * Clear the announcer cache (useful for testing)
 */
export function clearAnnouncerCache() {
    announcerCache.clear();
}
