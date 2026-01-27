// ============================================
// Navigation - Navigation and scrolling
// ============================================

import { SOUNDS, CATEGORIES } from './constants.js';
import { state, elements } from './state.js';
import { getSortedCategories, getSoundsByCategory, calculateScrollOffset } from './utils.js';

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

    // Also render mobile category chips
    renderMobileCategoryChips();
}

// Render mobile category chips for quick navigation
export function renderMobileCategoryChips() {
    const mobileChips = document.getElementById('mobile-category-chips');
    if (!mobileChips) {
        return;
    }

    const sortedCategories = getSortedCategories(CATEGORIES);

    // Always show favorites and recently played chips at the start
    let chipsHtml = '<button class="category-chip" data-category="favorites" type="button" aria-label="Jump to Favorites section">FAVORITES</button>';
    chipsHtml += '<button class="category-chip" data-category="recent" type="button" aria-label="Jump to Recently Played section">RECENT</button>';

    chipsHtml += sortedCategories.map(([categoryId, categoryInfo]) => {
        const count = getSoundsByCategory(SOUNDS, categoryId).length;
        if (count === 0) {
            return '';
        }
        // Use shorter names for mobile chips
        const shortName = categoryInfo.name.replace('BUILDINGS & DEFENSES', 'BUILDINGS').replace('MISCELLANEOUS', 'MISC');
        return `<button class="category-chip" data-category="${categoryId}" type="button" aria-label="Jump to ${categoryInfo.name} section, ${count} sounds">${shortName}</button>`;
    }).join('');

    mobileChips.innerHTML = chipsHtml;

    // Add click handlers
    mobileChips.querySelectorAll('.category-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            scrollToCategory(chip.dataset.category);
            // Update active state
            mobileChips.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
        });
    });
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
    if (header) {
        header.setAttribute('aria-expanded', isExpanded.toString());
    }

    // Announce state change to screen readers
    const categoryName = section.querySelector('.category-name');
    if (categoryName) {
        const name = categoryName.textContent;
        const state = isExpanded ? 'expanded' : 'collapsed';
        announceToScreenReader(`${name} ${state}`);
    }
}

// Announce message to screen readers
function announceToScreenReader(message) {
    let announcer = document.getElementById('category-announcer');
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'category-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'visually-hidden';
        document.body.appendChild(announcer);
    }
    announcer.textContent = message;
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
