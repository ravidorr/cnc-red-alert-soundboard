/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { SOUNDS, CATEGORIES } from '../js/constants.js';
import {
    cacheElements,
    renderCategories,
    renderFavoritesSection,
    renderPopularSection,
    updateStats,
    showToast,
    showSearchEmptyState,
    hideSearchEmptyState,
    shareSound,
} from '../js/ui.js';
import { renderNavigation, createNavHeader } from '../js/navigation.js';
import { renderRecentlyPlayedSection } from '../js/recently-played.js';

describe('UI Rendering', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
    });

    describe('cacheElements', () => {
        test('should cache all DOM elements', () => {
            cacheElements();

            expect(elements.contentArea).not.toBeNull();
            expect(elements.categoryNav).not.toBeNull();
            expect(elements.searchInput).not.toBeNull();
        });
    });

    describe('renderCategories', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should render all categories', () => {
            renderCategories();

            const categories = document.querySelectorAll('.category-section');
            expect(categories.length).toBe(Object.keys(CATEGORIES).length);
        });

        test('should render sound buttons', () => {
            renderCategories();

            const buttons = document.querySelectorAll('.sound-btn');
            expect(buttons.length).toBe(SOUNDS.length);
        });

        test('should mark favorite sounds', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderCategories();

            const favBtn = document.querySelector('.favorite-btn.is-favorite');
            expect(favBtn).not.toBeNull();
        });

        test('should skip empty categories', () => {
            // All real categories have sounds, but let's verify the logic works
            renderCategories();

            // All rendered categories should have sounds
            const categories = document.querySelectorAll('.category-section');
            categories.forEach(cat => {
                const buttons = cat.querySelectorAll('.sound-btn');
                expect(buttons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('renderNavigation', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should render navigation items for all categories', () => {
            renderNavigation();

            const navItems = document.querySelectorAll('.nav-item');
            expect(navItems.length).toBe(12);
        });

        test('should show favorites nav item when favorites exist', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderNavigation();

            const favNav = document.querySelector('.favorites-nav');
            expect(favNav).not.toBeNull();
        });
    });

    describe('renderFavoritesSection', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should render favorites section with sounds', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderFavoritesSection();

            const favSection = document.getElementById('category-favorites');
            expect(favSection).not.toBeNull();
        });

        test('should render empty state when no favorites', () => {
            state.favorites = [];
            renderFavoritesSection();

            const favSection = document.getElementById('category-favorites');
            const emptyState = favSection.querySelector('.favorites-empty');
            expect(emptyState).not.toBeNull();
        });

        test('should replace existing favorites section', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderFavoritesSection();
            renderFavoritesSection();

            const favSections = document.querySelectorAll('#category-favorites');
            expect(favSections.length).toBe(1);
        });

        test('should filter out invalid favorite files', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'nonexistent.wav'];
            renderFavoritesSection();

            const favSection = document.getElementById('category-favorites');
            const buttons = favSection.querySelectorAll('.sound-btn');
            expect(buttons.length).toBe(1);
        });
    });

    describe('renderPopularSection', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should render popular section', () => {
            renderPopularSection();

            const popularSection = document.getElementById('category-popular');
            expect(popularSection).not.toBeNull();
        });

        test('should replace existing popular section', () => {
            renderPopularSection();
            renderPopularSection();

            const popularSections = document.querySelectorAll('#category-popular');
            expect(popularSections.length).toBe(1);
        });

        test('should insert after recently played if exists', () => {
            state.recentlyPlayed = ['allies_1_achnoledged.wav'];
            renderRecentlyPlayedSection();
            renderPopularSection();

            const recentSection = document.getElementById('category-recent');
            const popularSection = document.getElementById('category-popular');
            expect(recentSection.nextElementSibling).toBe(popularSection);
        });

        test('should insert after favorites if no recently played', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderFavoritesSection();
            renderPopularSection();

            const favSection = document.getElementById('category-favorites');
            const popularSection = document.getElementById('category-popular');
            expect(favSection.nextElementSibling).toBe(popularSection);
        });

        test('should mark favorite sounds in popular section', () => {
            state.favorites = ['allies_1_affirmative.wav'];
            renderPopularSection();

            const popularSection = document.getElementById('category-popular');
            const favBtn = popularSection.querySelector('.favorite-btn.is-favorite');
            expect(favBtn).not.toBeNull();
        });
    });

    describe('updateStats', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should update total sounds count', () => {
            updateStats();

            expect(document.getElementById('total-sounds').textContent)
                .toBe(SOUNDS.length.toString());
        });

        test('should update favorites count', () => {
            state.favorites = ['a.wav', 'b.wav'];
            updateStats();

            expect(document.getElementById('total-favorites').textContent).toBe('2');
        });

        test('should update visible sounds count', () => {
            updateStats();

            expect(document.getElementById('visible-sounds').textContent)
                .toBe(SOUNDS.length.toString());
        });
    });

    describe('showToast', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should add toast to container', () => {
            showToast('Test message', 'info');

            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toBe('Test message');
        });

        test('should handle different toast types', () => {
            showToast('Success', 'success');
            showToast('Error', 'error');

            const toasts = document.querySelectorAll('.toast');
            expect(toasts.length).toBe(2);
        });

        test('should not throw when toast container is null', () => {
            elements.toastContainer = null;
            expect(() => showToast('Test', 'info')).not.toThrow();
        });

        test('should remove toast after duration', (done) => {
            showToast('Test message', 'info', 100);

            setTimeout(() => {
                const toast = document.querySelector('.toast');
                expect(toast).toBeNull();
                done();
            }, 150);
        });
    });

    describe('showSearchEmptyState / hideSearchEmptyState', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('showSearchEmptyState should show empty state', () => {
            showSearchEmptyState('test');

            expect(elements.searchEmptyState.style.display).toBe('block');
            expect(elements.searchEmptyTerm.textContent).toBe('test');
            expect(elements.contentArea.style.display).toBe('none');
        });

        test('hideSearchEmptyState should hide empty state', () => {
            showSearchEmptyState('test');
            hideSearchEmptyState();

            expect(elements.searchEmptyState.style.display).toBe('none');
            expect(elements.contentArea.style.display).toBe('block');
        });

        test('should handle null elements', () => {
            elements.searchEmptyState = null;
            elements.contentArea = null;

            expect(() => showSearchEmptyState('test')).not.toThrow();
            expect(() => hideSearchEmptyState()).not.toThrow();
        });
    });

    describe('shareSound', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should copy link to clipboard on success', async () => {
            const writeTextMock = jest.fn().mockResolvedValue();
            Object.assign(navigator, {
                clipboard: { writeText: writeTextMock },
            });

            await shareSound('test.wav');

            expect(writeTextMock).toHaveBeenCalled();
            expect(writeTextMock.mock.calls[0][0]).toContain('#sound=test.wav');
        });

        test('should show success toast on copy', async () => {
            Object.assign(navigator, {
                clipboard: { writeText: jest.fn().mockResolvedValue() },
            });

            await shareSound('test.wav');

            // Wait for promise
            await new Promise(resolve => setTimeout(resolve, 10));

            const toast = document.querySelector('.toast-success');
            expect(toast).not.toBeNull();
        });

        test('should show error toast on copy failure', async () => {
            Object.assign(navigator, {
                clipboard: { writeText: jest.fn().mockRejectedValue(new Error()) },
            });

            await shareSound('test.wav');

            // Wait for promise
            await new Promise(resolve => setTimeout(resolve, 10));

            const toast = document.querySelector('.toast-error');
            expect(toast).not.toBeNull();
        });
    });

    describe('createNavHeader', () => {
        test('should create nav header element', () => {
            const header = createNavHeader();

            expect(header.tagName).toBe('DIV');
            expect(header.className).toBe('nav-header');
            expect(header.textContent).toBe('CATEGORIES');
        });
    });
});
