/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { SOUNDS, CATEGORIES } from '../js/constants.js';
import { getSoundsByCategory } from '../js/utils.js';
import {
    cacheElements,
    renderCategories,
    renderFavoritesSection,
    renderPopularSection,
    updateStats,
    showToast,
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
