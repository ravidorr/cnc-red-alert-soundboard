// ============================================
// Search - Search/filter functionality
// ============================================

import { state, elements } from './state.js';
import { showSearchEmptyState, hideSearchEmptyState } from './ui.js';

// Filter sounds based on search (DOM version)
export function filterSounds() {
    const wrappers = document.querySelectorAll('.sound-btn-wrapper');
    let visibleCount = 0;

    wrappers.forEach(wrapper => {
        const btn = wrapper.querySelector('.sound-btn');
        if (!btn) {
            return;
        }

        const name = btn.dataset.name.toLowerCase();
        const file = decodeURIComponent(btn.dataset.file).toLowerCase();
        const matches = name.includes(state.searchTerm) || file.includes(state.searchTerm);

        wrapper.style.display = matches ? '' : 'none';
        if (matches) {
            visibleCount++;
        }
    });

    // Show/hide empty categories
    document.querySelectorAll('.category-section').forEach(section => {
        const visibleWrappers = section.querySelectorAll('.sound-btn-wrapper:not([style*="display: none"])');
        section.style.display = visibleWrappers.length === 0 ? 'none' : '';

        // Auto-expand categories with matches when searching
        if (state.searchTerm && visibleWrappers.length > 0) {
            section.classList.remove('collapsed');
        }
    });

    // Show/hide search empty state
    if (visibleCount === 0 && state.searchTerm) {
        showSearchEmptyState(state.searchTerm);
    } else {
        hideSearchEmptyState();
    }

    // Update visible count
    elements.visibleSounds.textContent = visibleCount;
}
