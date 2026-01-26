/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/src/state.js';
import { SOUNDS } from '../js/src/constants.js';
import { cacheElements, renderCategories, showSearchEmptyState, hideSearchEmptyState } from '../js/src/ui.js';
import { filterSounds } from '../js/src/search.js';

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
