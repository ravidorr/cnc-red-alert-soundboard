/**
 * @jest-environment jsdom
 */
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { SOUNDS } from '../js/constants.js';
import { cacheElements, renderCategories, showSearchEmptyState, hideSearchEmptyState } from '../js/ui.js';
import { filterSounds } from '../js/search.js';

describe('Search Functions', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
    });

    describe('filterSounds', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should show all sounds when search is empty', () => {
            state.searchTerm = '';
            filterSounds();

            const hidden = document.querySelectorAll('.sound-btn-wrapper[style*="display: none"]');
            expect(hidden.length).toBe(0);
        });

        test('should hide non-matching sounds', () => {
            state.searchTerm = 'tanya';
            filterSounds();

            const visible = document.querySelectorAll('.sound-btn-wrapper:not([style*="display: none"])');
            const tanyaSounds = SOUNDS.filter(s =>
                s.name.toLowerCase().includes('tanya') || s.file.toLowerCase().includes('tanya'),
            );
            expect(visible.length).toBe(tanyaSounds.length);
        });

        test('should show empty state when no matches', () => {
            state.searchTerm = 'xyznonexistent';
            filterSounds();

            const emptyState = document.getElementById('search-empty-state');
            expect(emptyState.style.display).toBe('block');
        });

        test('should hide categories with no visible sounds', () => {
            state.searchTerm = 'tanya';
            filterSounds();

            // Some categories should be hidden
            const hiddenCategories = document.querySelectorAll('.category-section[style*="display: none"]');
            expect(hiddenCategories.length).toBeGreaterThan(0);
        });

        test('should auto-expand categories with matches when searching', () => {
            // First collapse a category
            const section = document.querySelector('.category-section');
            section.classList.add('collapsed');

            // Search for something in that category
            state.searchTerm = 'allies';
            filterSounds();

            // Categories with matches should be expanded
            const visibleSections = document.querySelectorAll('.category-section:not([style*="display: none"])');
            visibleSections.forEach(section => {
                expect(section.classList.contains('collapsed')).toBe(false);
            });
        });

        test('should update visible sounds count', () => {
            state.searchTerm = 'tanya';
            filterSounds();

            const visibleCount = parseInt(elements.visibleSounds.textContent);
            expect(visibleCount).toBeGreaterThan(0);
            expect(visibleCount).toBeLessThan(SOUNDS.length);
        });

        test('should handle wrapper without button', () => {
            // Add a wrapper without a button
            const contentArea = document.getElementById('content-area');
            const emptyWrapper = document.createElement('div');
            emptyWrapper.className = 'sound-btn-wrapper';
            contentArea.appendChild(emptyWrapper);

            state.searchTerm = '';
            expect(() => filterSounds()).not.toThrow();
        });

        test('should match by file name', () => {
            state.searchTerm = 'achnoledged';
            filterSounds();

            const visible = document.querySelectorAll('.sound-btn-wrapper:not([style*="display: none"])');
            expect(visible.length).toBeGreaterThan(0);
        });
    });

    describe('Search Empty State', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('showSearchEmptyState should show empty state', () => {
            showSearchEmptyState('test');

            const emptyState = document.getElementById('search-empty-state');
            expect(emptyState.style.display).toBe('block');
        });

        test('hideSearchEmptyState should hide empty state', () => {
            showSearchEmptyState('test');
            hideSearchEmptyState();

            const emptyState = document.getElementById('search-empty-state');
            expect(emptyState.style.display).toBe('none');
        });
    });
});
