// ============================================
// Navigation - Navigation and scrolling
// ============================================

import { SOUNDS, CATEGORIES } from './constants.js';
import { state, elements } from './state.js';
import { getSortedCategories, getSoundsByCategory, calculateScrollOffset } from './utils.js';

// Render navigation sidebar
export function renderNavigation() {
    const sortedCategories = getSortedCategories(CATEGORIES);

    // Add favorites nav item if there are favorites
    let favoritesNavHtml = '';
    if (state.favorites.length > 0) {
        favoritesNavHtml = `
            <button class="nav-item favorites-nav" data-category="favorites" type="button">
                <span>FAVORITES</span>
                <span class="nav-item-count">${state.favorites.length}</span>
            </button>
        `;
    }

    const navHtml = sortedCategories.map(([categoryId, categoryInfo]) => {
        const count = getSoundsByCategory(SOUNDS, categoryId).length;
        if (count === 0) {
            return '';
        }

        return `
            <button class="nav-item" data-category="${categoryId}" type="button">
                <span>${categoryInfo.name}</span>
                <span class="nav-item-count">${count}</span>
            </button>
        `;
    }).join('');

    const navHeader = elements.categoryNav.querySelector('.nav-header');
    elements.categoryNav.innerHTML = '';
    elements.categoryNav.appendChild(navHeader || createNavHeader());
    elements.categoryNav.insertAdjacentHTML('beforeend', favoritesNavHtml + navHtml);
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
            item.classList.toggle('active', item.dataset.category === categoryId);
        });
    }
}
