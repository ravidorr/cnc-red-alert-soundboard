// ============================================
// UI - UI rendering functions
// ============================================

import { SOUNDS, CATEGORIES, POPULAR_SOUNDS } from './constants.js';
import { state, elements } from './state.js';
import { getSortedCategories, getSoundsByCategory, isFavorite } from './utils.js';
import { setupFavoritesDragAndDrop } from './favorites.js';

// Cache DOM elements
export function cacheElements() {
    elements.contentArea = document.getElementById('content-area');
    elements.categoryNav = document.getElementById('category-nav');
    elements.searchInput = document.getElementById('search-input');
    elements.clearSearch = document.getElementById('clear-search');
    elements.nowPlaying = document.getElementById('now-playing');
    elements.nowPlayingTitle = document.getElementById('now-playing-title');
    elements.audioPlayer = document.getElementById('audio-player');
    elements.installPrompt = document.getElementById('install-prompt');
    elements.btnInstall = document.getElementById('btn-install');
    elements.btnDismiss = document.getElementById('btn-dismiss');
    elements.installBtn = document.getElementById('install-btn');
    elements.toastContainer = document.getElementById('toast-container');
    elements.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    elements.mobileMenuOverlay = document.getElementById('mobile-menu-overlay');
    elements.sidebar = document.getElementById('sidebar');
    elements.searchEmptyState = document.getElementById('search-empty-state');
    elements.searchEmptyTerm = document.getElementById('search-empty-term');
    elements.btnClearSearch = document.getElementById('btn-clear-search');
    elements.randomSoundBtn = document.getElementById('random-sound');
}

// Render all category sections
export function renderCategories() {
    const sortedCategories = getSortedCategories(CATEGORIES);

    const html = sortedCategories.map(([categoryId, categoryInfo]) => {
        const sounds = getSoundsByCategory(SOUNDS, categoryId);
        if (sounds.length === 0) {
            return '';
        }

        const buttonsHtml = sounds.map(sound => {
            const isFav = isFavorite(state.favorites, sound.file);
            const favAriaLabel = isFav ? `Remove ${sound.name} from favorites` : `Add ${sound.name} to favorites`;
            return `
            <div class="sound-btn-wrapper">
                <button class="sound-btn" 
                        data-file="${encodeURIComponent(sound.file)}" 
                        data-name="${sound.name}"
                        data-category="${categoryId}"
                        title="Play ${sound.name}">
                    ${sound.name}
                </button>
                <button class="share-btn" 
                        data-file="${encodeURIComponent(sound.file)}"
                        data-name="${sound.name}"
                        aria-label="Share ${sound.name}"
                        title="Share sound">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                    </svg>
                </button>
                <button class="favorite-btn ${isFav ? 'is-favorite' : ''}" 
                        data-file="${encodeURIComponent(sound.file)}"
                        aria-label="${favAriaLabel}"
                        title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"><span aria-hidden="true">${isFav ? '&#9733;' : '&#9734;'}</span></button>
            </div>
        `;
        }).join('');

        return `
            <section class="category-section" id="category-${categoryId}" data-category="${categoryId}">
                <button type="button" class="category-header" aria-expanded="true" aria-controls="category-content-${categoryId}">
                    <span class="category-title">
                        <span class="category-name">${categoryInfo.name}</span>
                        <span class="category-count">(${sounds.length})</span>
                    </span>
                    <span class="category-toggle" aria-hidden="true">&#9660;</span>
                </button>
                <div class="category-content" id="category-content-${categoryId}">
                    ${buttonsHtml}
                </div>
            </section>
        `;
    }).join('');

    elements.contentArea.innerHTML = html;
}

// Render the favorites section
export function renderFavoritesSection() {
    // Remove existing favorites section
    const existingSection = document.getElementById('category-favorites');
    if (existingSection) {
        existingSection.remove();
    }

    // Show empty state if no favorites
    if (state.favorites.length === 0) {
        const emptyHtml = `
            <section class="category-section favorites-section" id="category-favorites" data-category="favorites">
                <button type="button" class="category-header" aria-expanded="true" aria-controls="category-content-favorites">
                    <span class="category-title">
                        <span class="category-name">FAVORITES</span>
                        <span class="category-count">(0)</span>
                    </span>
                    <span class="category-toggle" aria-hidden="true">&#9660;</span>
                </button>
                <div class="category-content" id="category-content-favorites">
                    <div class="favorites-empty">
                        <div class="favorites-empty-icon" aria-hidden="true">&#9734;</div>
                        <div class="favorites-empty-title">AWAITING ORDERS</div>
                        <div class="favorites-empty-text">
                            Mark priority targets with the star icon for rapid deployment.
                        </div>
                    </div>
                </div>
            </section>
        `;
        elements.contentArea.insertAdjacentHTML('afterbegin', emptyHtml);
        return;
    }

    // Get favorite sounds in the order they appear in state.favorites
    const favoriteSounds = state.favorites
        .map(file => SOUNDS.find(s => s.file === file))
        .filter(Boolean);

    const buttonsHtml = favoriteSounds.map((sound, index) => `
        <div class="sound-btn-wrapper" draggable="true" data-file="${encodeURIComponent(sound.file)}" data-index="${index}">
            <span class="drag-indicator">&#9776;</span>
            <button class="sound-btn" 
                    data-file="${encodeURIComponent(sound.file)}" 
                    data-name="${sound.name}"
                    data-category="favorites"
                    title="Play ${sound.name}">
                ${sound.name}
            </button>
            <button class="share-btn" 
                    data-file="${encodeURIComponent(sound.file)}"
                    data-name="${sound.name}"
                    aria-label="Share ${sound.name}"
                    title="Share sound">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
            </button>
            <button class="favorite-btn is-favorite" 
                    data-file="${encodeURIComponent(sound.file)}"
                    aria-label="Remove ${sound.name} from favorites"
                    title="Remove from favorites"><span aria-hidden="true">&#9733;</span></button>
        </div>
    `).join('');

    // Show drag tooltip if first time with 2+ favorites and not seen before
    const showDragTooltip = favoriteSounds.length >= 2 && !localStorage.getItem('dragTooltipSeen');
    const dragTooltipHtml = showDragTooltip ? `
        <div class="drag-tooltip" id="drag-tooltip">
            <span>TIP: DRAG SOUNDS TO REORDER, OR USE ARROW KEYS WHEN FOCUSED</span>
            <button class="drag-tooltip-dismiss" id="drag-tooltip-dismiss" aria-label="Dismiss reordering tip">ACKNOWLEDGED</button>
        </div>
    ` : '';

    const sectionHtml = `
        <section class="category-section favorites-section" id="category-favorites" data-category="favorites">
            <div class="category-header-wrapper">
                <button type="button" class="category-header" aria-expanded="true" aria-controls="category-content-favorites">
                    <span class="category-title">
                        <span class="category-name">FAVORITES</span>
                        <span class="category-count">(${favoriteSounds.length})</span>
                    </span>
                    <span class="category-toggle" aria-hidden="true">&#9660;</span>
                </button>
                <button class="btn-clear-favorites" id="btn-clear-favorites" aria-label="Clear all favorites" title="Clear all favorites">CLEAR</button>
            </div>
            <div class="category-content" id="category-content-favorites">
                ${dragTooltipHtml}
                ${buttonsHtml}
            </div>
        </section>
    `;

    // Insert at the beginning of content area
    elements.contentArea.insertAdjacentHTML('afterbegin', sectionHtml);

    // Setup drag tooltip dismiss
    if (showDragTooltip) {
        const dismissBtn = document.getElementById('drag-tooltip-dismiss');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                localStorage.setItem('dragTooltipSeen', 'true');
                const tooltip = document.getElementById('drag-tooltip');
                if (tooltip) {
                    tooltip.remove();
                }
            });
        }
    }

    // Setup drag and drop handlers
    setupFavoritesDragAndDrop();
}

// Render the popular sounds section
export function renderPopularSection() {
    // Remove existing section
    const existingSection = document.getElementById('category-popular');
    if (existingSection) {
        existingSection.remove();
    }

    // Get popular sounds
    const popularSounds = POPULAR_SOUNDS
        .map(file => SOUNDS.find(s => s.file === file))
        .filter(Boolean);

    if (popularSounds.length === 0) {
        return;
    }

    const buttonsHtml = popularSounds.map(sound => {
        const isFav = isFavorite(state.favorites, sound.file);
        const favAriaLabel = isFav ? `Remove ${sound.name} from favorites` : `Add ${sound.name} to favorites`;
        return `
        <div class="sound-btn-wrapper">
            <button class="sound-btn" 
                    data-file="${encodeURIComponent(sound.file)}" 
                    data-name="${sound.name}"
                    data-category="popular"
                    title="Play ${sound.name}">
                ${sound.name}
            </button>
            <button class="share-btn" 
                    data-file="${encodeURIComponent(sound.file)}"
                    data-name="${sound.name}"
                    aria-label="Share ${sound.name}"
                    title="Share sound">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
                    <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92s2.92-1.31 2.92-2.92-1.31-2.92-2.92-2.92z"/>
                </svg>
            </button>
            <button class="favorite-btn ${isFav ? 'is-favorite' : ''}" 
                    data-file="${encodeURIComponent(sound.file)}"
                    aria-label="${favAriaLabel}"
                    title="${isFav ? 'Remove from favorites' : 'Add to favorites'}"><span aria-hidden="true">${isFav ? '&#9733;' : '&#9734;'}</span></button>
        </div>
    `;
    }).join('');

    const sectionHtml = `
        <section class="category-section popular-section" id="category-popular" data-category="popular">
            <button type="button" class="category-header" aria-expanded="true" aria-controls="category-content-popular">
                <span class="category-title">
                    <span class="category-name">POPULAR SOUNDS</span>
                    <span class="category-count">(${popularSounds.length})</span>
                </span>
                <span class="category-toggle" aria-hidden="true">&#9660;</span>
            </button>
            <div class="category-content" id="category-content-popular">
                ${buttonsHtml}
            </div>
        </section>
    `;

    // Insert after recently played, or after favorites, or at beginning
    const recentSection = document.getElementById('category-recent');
    const favoritesSection = document.getElementById('category-favorites');

    if (recentSection) {
        recentSection.insertAdjacentHTML('afterend', sectionHtml);
    } else if (favoritesSection) {
        favoritesSection.insertAdjacentHTML('afterend', sectionHtml);
    } else {
        elements.contentArea.insertAdjacentHTML('afterbegin', sectionHtml);
    }
}

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - Type: 'info', 'success', or 'error'
 * @param {number} duration - How long to show the toast in ms (default 7s to match CSS)
 */
const MAX_TOASTS = 3;

export function showToast(message, type = 'info', duration = 7000) {
    if (!elements.toastContainer) {
        return;
    }

    // Limit toast stack to MAX_TOASTS - remove oldest if at limit
    const existingToasts = elements.toastContainer.querySelectorAll('.toast');
    if (existingToasts.length >= MAX_TOASTS) {
        existingToasts[0].remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'polite');

    // Create message span
    const messageSpan = document.createElement('span');
    messageSpan.className = 'toast-message';
    messageSpan.textContent = message;
    toast.appendChild(messageSpan);

    // Create dismiss button for keyboard accessibility
    const dismissBtn = document.createElement('button');
    dismissBtn.className = 'toast-dismiss';
    dismissBtn.setAttribute('aria-label', 'Dismiss notification');
    dismissBtn.innerHTML = '&times;';
    dismissBtn.addEventListener('click', () => {
        if (toast.parentNode) {
            toast.remove();
        }
    });
    toast.appendChild(dismissBtn);

    elements.toastContainer.appendChild(toast);

    // Store timeout ID so we can cancel on hover
    let timeoutId = setTimeout(() => {
        if (toast.parentNode) {
            toast.remove();
        }
    }, duration);

    // Pause timer on hover/focus for accessibility
    toast.addEventListener('mouseenter', () => {
        clearTimeout(timeoutId);
    });
    toast.addEventListener('mouseleave', () => {
        timeoutId = setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 2000); // Give extra time after hover
    });
    toast.addEventListener('focusin', () => {
        clearTimeout(timeoutId);
    });
    toast.addEventListener('focusout', () => {
        timeoutId = setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 2000);
    });
}

// Show search empty state
export function showSearchEmptyState(searchTerm) {
    if (elements.searchEmptyState) {
        elements.searchEmptyState.style.display = 'block';
        if (elements.searchEmptyTerm) {
            elements.searchEmptyTerm.textContent = searchTerm;
        }
    }
    if (elements.contentArea) {
        elements.contentArea.style.display = 'none';
    }
}

// Hide search empty state
export function hideSearchEmptyState() {
    if (elements.searchEmptyState) {
        elements.searchEmptyState.style.display = 'none';
    }
    if (elements.contentArea) {
        elements.contentArea.style.display = 'block';
    }
}

// Share a sound using Web Share API (with file) or fallback to clipboard
export async function shareSound(soundFile, soundName) {
    const soundUrl = `sounds/${soundFile}`;
    const pageUrl = `${window.location.origin}${window.location.pathname}#sound=${encodeURIComponent(soundFile)}`;

    // Try Web Share API with file (works on mobile)
    if (navigator.share) {
        try {
            // Fetch the audio file
            const response = await fetch(soundUrl);
            const blob = await response.blob();
            const file = new File([blob], soundFile, { type: 'audio/wav' });

            // Check if file sharing is supported
            const displayName = soundName || 'C&C Sound';
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                await navigator.share({
                    title: displayName,
                    text: `Check out this C&C Red Alert sound: ${displayName}`,
                    files: [file],
                });
                showToast('INTEL TRANSMITTED', 'success');
                return;
            }

            // Fallback: share URL only (no file support)
            await navigator.share({
                title: displayName,
                text: `Check out this C&C Red Alert sound: ${displayName}`,
                url: pageUrl,
            });
            showToast('INTEL TRANSMITTED', 'success');
            return;
        } catch (err) {
            // User cancelled or share failed - try clipboard fallback
            if (err.name === 'AbortError') {
                return; // User cancelled, no message needed
            }
        }
    }

    // Fallback: copy link to clipboard
    try {
        await navigator.clipboard.writeText(pageUrl);
        showToast('LINK ACQUIRED', 'success');
    } catch {
        showToast('SHARE FAILED. Try again.', 'error');
    }
}
