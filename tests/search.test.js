/**
 * @jest-environment jsdom
 */
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { SOUNDS } from '../js/constants.js';
import { cacheElements, renderCategories, showSearchEmptyState, hideSearchEmptyState } from '../js/ui.js';
import { filterSounds } from '../js/search.js';
import { fuzzyMatch, levenshteinDistance, filterSoundsArray } from '../js/utils.js';

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
            // With fuzzy search and tag matching, there may be more matches
            expect(visible.length).toBeGreaterThanOrEqual(tanyaSounds.length);
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

        test('should handle null contentArea gracefully', () => {
            elements.contentArea = null;
            state.searchTerm = 'test';

            expect(() => filterSounds()).not.toThrow();
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

    describe('Search Announcements', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
            // Add announcer element
            const announcer = document.createElement('div');
            announcer.id = 'search-announcer';
            document.body.appendChild(announcer);
        });

        test('should announce search results to screen readers', () => {
            state.searchTerm = 'tanya';
            filterSounds();

            const announcer = document.getElementById('search-announcer');
            expect(announcer.textContent).toContain('Showing');
            expect(announcer.textContent).toContain('sounds');
        });

        test('should announce no results found', () => {
            state.searchTerm = 'xyznonexistent';
            filterSounds();

            const announcer = document.getElementById('search-announcer');
            expect(announcer.textContent).toContain('No sounds found');
        });

        test('should clear announcement when search is cleared', () => {
            state.searchTerm = 'tanya';
            filterSounds();

            state.searchTerm = '';
            filterSounds();

            const announcer = document.getElementById('search-announcer');
            expect(announcer.textContent).toBe('');
        });

        test('should set aria-busy during filtering', () => {
            state.searchTerm = 'tanya';
            filterSounds();

            // After filtering completes, aria-busy should be false
            expect(elements.contentArea.getAttribute('aria-busy')).toBe('false');
        });
    });

    describe('Search Result Indicator', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
            // Add announcer element (required for updateSearchResultIndicator to be called)
            const announcer = document.createElement('div');
            announcer.id = 'search-announcer';
            document.body.appendChild(announcer);
            // Add result indicator elements to content-area
            const contentArea = document.getElementById('content-area');
            const indicator = document.createElement('div');
            indicator.id = 'search-result-indicator';
            indicator.className = 'search-result-indicator';
            indicator.style.display = 'none';
            const resultText = document.createElement('span');
            resultText.id = 'search-result-text';
            indicator.appendChild(resultText);
            contentArea.insertBefore(indicator, contentArea.firstChild);
        });

        test('should hide indicator when search is empty', () => {
            state.searchTerm = '';
            filterSounds();

            const indicator = document.getElementById('search-result-indicator');
            expect(indicator.style.display).toBe('none');
        });

        test('should hide indicator when no results found', () => {
            state.searchTerm = 'xyznonexistent';
            filterSounds();

            const indicator = document.getElementById('search-result-indicator');
            expect(indicator.style.display).toBe('none');
        });

        test('should handle missing indicator gracefully', () => {
            document.getElementById('search-result-indicator').remove();

            state.searchTerm = 'tanya';
            expect(() => filterSounds()).not.toThrow();
        });

        test('indicator element should exist after setup', () => {
            const indicator = document.getElementById('search-result-indicator');
            const resultText = document.getElementById('search-result-text');

            expect(indicator).not.toBeNull();
            expect(resultText).not.toBeNull();
        });

        test('should handle missing resultText element gracefully', () => {
            document.getElementById('search-result-text').remove();

            state.searchTerm = 'tanya';
            expect(() => filterSounds()).not.toThrow();
        });

        test('should show indicator when search has results', () => {
            state.searchTerm = 'tanya';
            filterSounds();

            const indicator = document.getElementById('search-result-indicator');
            expect(indicator.style.display).toBe('flex');
        });

        test('should display result count in indicator', () => {
            state.searchTerm = 'tanya';
            filterSounds();

            const resultText = document.getElementById('search-result-text');
            expect(resultText.textContent).toContain('Showing');
            expect(resultText.textContent).toContain('sounds');
        });
    });

    describe('Fuzzy Search', () => {
        test('should return true for exact match', () => {
            expect(fuzzyMatch('tanya', 'tanya')).toBe(true);
        });

        test('should return true for substring match', () => {
            expect(fuzzyMatch('tan', 'tanya')).toBe(true);
        });

        test('should handle single character typos', () => {
            expect(fuzzyMatch('tania', 'tanya')).toBe(true);
        });

        test('should be case insensitive', () => {
            expect(fuzzyMatch('TANYA', 'tanya')).toBe(true);
        });

        test('should return false for completely different strings', () => {
            expect(fuzzyMatch('xyz', 'tanya')).toBe(false);
        });

        test('should return false for empty query', () => {
            expect(fuzzyMatch('', 'tanya')).toBe(false);
        });

        test('should return false for short queries (2 chars or less) without exact match', () => {
            expect(fuzzyMatch('ab', 'tanya')).toBe(false);
        });
    });

    describe('Levenshtein Distance', () => {
        test('should return 0 for identical strings', () => {
            expect(levenshteinDistance('test', 'test')).toBe(0);
        });

        test('should return length for empty string', () => {
            expect(levenshteinDistance('', 'test')).toBe(4);
            expect(levenshteinDistance('test', '')).toBe(4);
        });

        test('should calculate correct distance for single edit', () => {
            expect(levenshteinDistance('cat', 'bat')).toBe(1);
        });
    });

    describe('Tag Search', () => {
        const localThis = {};

        beforeEach(() => {
            localThis.soundsWithTags = [
                { name: 'Laugh', file: 'tanya_laugh.wav', category: 'tanya', tags: ['iconic', 'voice', 'funny'] },
                { name: 'Affirmative', file: 'affirmative.wav', category: 'allies' },
            ];
        });

        test('should match sounds by tag', () => {
            const result = filterSoundsArray(localThis.soundsWithTags, 'iconic');
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Laugh');
        });

        test('should match partial tag strings', () => {
            const result = filterSoundsArray(localThis.soundsWithTags, 'voice');
            expect(result.length).toBe(1);
        });

        test('should handle sounds without tags', () => {
            const result = filterSoundsArray(localThis.soundsWithTags, 'affirmative');
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Affirmative');
        });
    });
});
