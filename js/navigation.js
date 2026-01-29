// ============================================
// Navigation - Navigation and scrolling
// ============================================

import { SOUNDS, CATEGORIES } from './constants.js';
import { state, elements } from './state.js';
import { getSortedCategories, getSoundsByCategory, calculateScrollOffset, announce } from './utils.js';

const COLLAPSED_CATEGORIES_KEY = 'cnc-collapsed-categories';

// Render navigation sidebar
export function renderNavigation() {
    const sortedCategories = getSortedCategories(CATEGORIES);

    // Always show favorites and recently played nav items at the top
    const favoritesCount = state.favorites.length;
    const favoritesNavHtml = `
        <button class="nav-item favorites-nav" data-category="favorites" type="button" aria-label="Favorites section, ${favoritesCount} ${favoritesCount === 1 ? 'sound' : 'sounds'}">
            <span>FAVORITES</span>
            <span class="nav-item-count">${favoritesCount}</span>
        </button>
    `;

    const recentCount = state.recentlyPlayed.length;
    const recentNavHtml = `
        <button class="nav-item recent-nav" data-category="recent" type="button" aria-label="Recently played section, ${recentCount} ${recentCount === 1 ? 'sound' : 'sounds'}">
            <span>RECENTLY PLAYED</span>
            <span class="nav-item-count">${recentCount}</span>
        </button>
    `;

    const navHtml = sortedCategories.map(([categoryId, categoryInfo]) => {
        const count = getSoundsByCategory(SOUNDS, categoryId).length;
        if (count === 0) {
            return '';
        }

        return `
            <button class="nav-item" data-category="${categoryId}" type="button" aria-label="${categoryInfo.name} section, ${count} sounds">
                <span>${categoryInfo.name}</span>
                <span class="nav-item-count">${count}</span>
            </button>
        `;
    }).join('');

    const navHeader = elements.categoryNav.querySelector('.nav-header');
    elements.categoryNav.innerHTML = '';
    elements.categoryNav.appendChild(navHeader || createNavHeader());
    elements.categoryNav.insertAdjacentHTML('beforeend', favoritesNavHtml + recentNavHtml + navHtml);
}

export function createNavHeader() {
    const header = document.createElement('div');
    header.className = 'nav-header';
    header.textContent = 'CATEGORIES';
    return header;
}

// Toggle category collapse
export function toggleCategory(section) {
    section.classList.toggle('collapsed');
    const header = section.querySelector('.category-header');
    const isExpanded = !section.classList.contains('collapsed');
    const categoryName = section.querySelector('.category-name');
    const categoryId = section.dataset.category;

    if (header) {
        header.setAttribute('aria-expanded', isExpanded.toString());

        // Announce state change to screen readers
        if (categoryName) {
            const name = categoryName.textContent.trim();
            const stateText = isExpanded ? 'expanded' : 'collapsed';
            announceToScreenReader(`${name} ${stateText}`);
        }
    }

    // Persist collapse state
    if (categoryId) {
        saveCollapseState(categoryId, !isExpanded);
    }
}

/**
 * Load collapsed categories from localStorage
 * @returns {string[]} Array of collapsed category IDs
 */
export function loadCollapsedCategories() {
    try {
        const stored = localStorage.getItem(COLLAPSED_CATEGORIES_KEY);
        if (stored) {
            return JSON.parse(stored);
        }
    } catch (e) {
        console.error('Error loading collapsed categories:', e);
    }
    return [];
}

/**
 * Save collapse state for a category
 * @param {string} categoryId - Category ID
 * @param {boolean} isCollapsed - Whether the category is collapsed
 */
function saveCollapseState(categoryId, isCollapsed) {
    try {
        const collapsed = loadCollapsedCategories();
        const index = collapsed.indexOf(categoryId);

        if (isCollapsed && index === -1) {
            collapsed.push(categoryId);
        } else if (!isCollapsed && index !== -1) {
            collapsed.splice(index, 1);
        }

        localStorage.setItem(COLLAPSED_CATEGORIES_KEY, JSON.stringify(collapsed));
    } catch (e) {
        console.error('Error saving collapse state:', e);
    }
}

/**
 * Apply saved collapse states to all categories
 */
export function applyCollapsedStates() {
    const collapsed = loadCollapsedCategories();

    collapsed.forEach(categoryId => {
        const section = document.getElementById(`category-${categoryId}`);
        if (section && !section.classList.contains('collapsed')) {
            section.classList.add('collapsed');
            const header = section.querySelector('.category-header');
            if (header) {
                header.setAttribute('aria-expanded', 'false');
            }
        }
    });
}

// Announce message to screen readers
function announceToScreenReader(message) {
    announce(message, { id: 'category-announcer' });
}

// Scroll to category
export function scrollToCategory(categoryId) {
    const section = document.getElementById(`category-${categoryId}`);
    if (section) {
        // Expand if collapsed
        section.classList.remove('collapsed');

        // Scroll with offset for fixed header (80px + 10px padding)
        const headerOffset = 90;
        const elementPosition = section.getBoundingClientRect().top;
        const offsetPosition = calculateScrollOffset(elementPosition, window.scrollY, headerOffset);

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth',
        });

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            const isActive = item.dataset.category === categoryId;
            item.classList.toggle('active', isActive);
            if (isActive) {
                item.setAttribute('aria-current', 'true');
            } else {
                item.removeAttribute('aria-current');
            }
        });
    }
}
