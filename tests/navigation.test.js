/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, renderCategories } from '../js/ui.js';
import {
    renderNavigation,
    toggleCategory,
    scrollToCategory,
    createNavHeader,
} from '../js/navigation.js';
import {
    toggleMobileMenu,
    openMobileMenu,
    closeMobileMenu,
} from '../js/mobile.js';

describe('Navigation Functions', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
    });

    describe('toggleCategory', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should collapse expanded category', () => {
            const section = document.querySelector('.category-section');
            expect(section.classList.contains('collapsed')).toBe(false);
            
            toggleCategory(section);
            expect(section.classList.contains('collapsed')).toBe(true);
        });

        test('should expand collapsed category', () => {
            const section = document.querySelector('.category-section');
            section.classList.add('collapsed');
            
            toggleCategory(section);
            expect(section.classList.contains('collapsed')).toBe(false);
        });
    });

    describe('scrollToCategory', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
            renderNavigation();
            window.scrollTo = jest.fn();
        });

        test('should scroll to category section', () => {
            scrollToCategory('allies');
            
            expect(window.scrollTo).toHaveBeenCalled();
        });
    });

    describe('Mobile Menu', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('openMobileMenu should add classes', () => {
            openMobileMenu();
            
            const sidebar = document.getElementById('sidebar');
            expect(sidebar.classList.contains('open')).toBe(true);
        });

        test('closeMobileMenu should remove classes', () => {
            openMobileMenu();
            closeMobileMenu();
            
            const sidebar = document.getElementById('sidebar');
            expect(sidebar.classList.contains('open')).toBe(false);
        });

        test('toggleMobileMenu should toggle state', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('open');
            
            toggleMobileMenu();
            expect(sidebar.classList.contains('open')).toBe(true);
            
            toggleMobileMenu();
            expect(sidebar.classList.contains('open')).toBe(false);
        });
    });
});
