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

    describe('renderNavigation', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should render navigation without nav-header', () => {
            // Remove the nav-header
            const navHeader = elements.categoryNav.querySelector('.nav-header');
            if (navHeader) navHeader.remove();

            renderNavigation();

            const newHeader = elements.categoryNav.querySelector('.nav-header');
            expect(newHeader).not.toBeNull();
        });

        test('should not render empty categories', () => {
            renderNavigation();

            // All nav items should have counts > 0
            const navItems = document.querySelectorAll('.nav-item');
            navItems.forEach(item => {
                const count = item.querySelector('.nav-item-count');
                expect(parseInt(count.textContent)).toBeGreaterThan(0);
            });
        });
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

        test('should update aria-expanded attribute', () => {
            const section = document.querySelector('.category-section');
            const header = section.querySelector('.category-header');

            toggleCategory(section);
            expect(header.getAttribute('aria-expanded')).toBe('false');

            toggleCategory(section);
            expect(header.getAttribute('aria-expanded')).toBe('true');
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

        test('should expand collapsed section when scrolling', () => {
            const section = document.getElementById('category-allies');
            section.classList.add('collapsed');

            scrollToCategory('allies');

            expect(section.classList.contains('collapsed')).toBe(false);
        });

        test('should update active nav item', () => {
            scrollToCategory('allies');

            const activeItem = document.querySelector('.nav-item.active');
            expect(activeItem.dataset.category).toBe('allies');
        });

        test('should not throw for nonexistent category', () => {
            expect(() => scrollToCategory('nonexistent')).not.toThrow();
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

        test('openMobileMenu should update aria-expanded', () => {
            openMobileMenu();

            expect(elements.mobileMenuToggle.getAttribute('aria-expanded')).toBe('true');
        });

        test('openMobileMenu should show overlay', () => {
            openMobileMenu();

            expect(elements.mobileMenuOverlay.classList.contains('visible')).toBe(true);
        });

        test('closeMobileMenu should remove classes', () => {
            openMobileMenu();
            closeMobileMenu();

            const sidebar = document.getElementById('sidebar');
            expect(sidebar.classList.contains('open')).toBe(false);
        });

        test('closeMobileMenu should update aria-expanded', () => {
            openMobileMenu();
            closeMobileMenu();

            expect(elements.mobileMenuToggle.getAttribute('aria-expanded')).toBe('false');
        });

        test('closeMobileMenu should hide overlay', () => {
            openMobileMenu();
            closeMobileMenu();

            expect(elements.mobileMenuOverlay.classList.contains('visible')).toBe(false);
        });

        test('toggleMobileMenu should toggle state', () => {
            const sidebar = document.getElementById('sidebar');
            sidebar.classList.remove('open');

            toggleMobileMenu();
            expect(sidebar.classList.contains('open')).toBe(true);

            toggleMobileMenu();
            expect(sidebar.classList.contains('open')).toBe(false);
        });

        test('should handle null sidebar', () => {
            elements.sidebar = null;
            expect(() => openMobileMenu()).not.toThrow();
            expect(() => closeMobileMenu()).not.toThrow();
            expect(() => toggleMobileMenu()).not.toThrow();
        });

        test('should handle null overlay', () => {
            elements.mobileMenuOverlay = null;
            expect(() => openMobileMenu()).not.toThrow();
            expect(() => closeMobileMenu()).not.toThrow();
        });

        test('should handle null toggle button', () => {
            elements.mobileMenuToggle = null;
            expect(() => openMobileMenu()).not.toThrow();
            expect(() => closeMobileMenu()).not.toThrow();
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
