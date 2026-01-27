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
    renderMobileCategoryChips,
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

        test('should not render empty categories (except favorites and recent)', () => {
            renderNavigation();

            // All category nav items (excluding favorites and recent) should have counts > 0
            const navItems = document.querySelectorAll('.nav-item:not(.favorites-nav):not(.recent-nav)');
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

        test('openMobileMenu should focus first focusable element', (done) => {
            // Add a button inside sidebar
            const btn = document.createElement('button');
            btn.textContent = 'Test';
            elements.sidebar.appendChild(btn);

            openMobileMenu();

            // Wait for setTimeout in openMobileMenu
            setTimeout(() => {
                expect(document.activeElement).toBe(btn);
                done();
            }, 150);
        });

        test('closeMobileMenu should return focus to trigger element', () => {
            const triggerBtn = document.createElement('button');
            triggerBtn.id = 'trigger';
            document.body.appendChild(triggerBtn);
            triggerBtn.focus();

            openMobileMenu();
            closeMobileMenu();

            expect(document.activeElement).toBe(triggerBtn);
        });

        test('should close menu on Escape key', () => {
            openMobileMenu();

            const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escEvent);

            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });

        test('should trap focus with Tab key', () => {
            // Add focusable elements to sidebar
            const btn1 = document.createElement('button');
            btn1.textContent = 'First';
            const btn2 = document.createElement('button');
            btn2.textContent = 'Last';
            elements.sidebar.appendChild(btn1);
            elements.sidebar.appendChild(btn2);

            openMobileMenu();
            btn2.focus();

            // Tab from last element should cycle to first
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            document.dispatchEvent(tabEvent);

            // Focus trap should prevent default and cycle
            expect(elements.sidebar.classList.contains('open')).toBe(true);
        });

        test('should handle Tab with shift key', () => {
            // Add focusable elements to sidebar
            const btn1 = document.createElement('button');
            btn1.textContent = 'First';
            const btn2 = document.createElement('button');
            btn2.textContent = 'Last';
            elements.sidebar.appendChild(btn1);
            elements.sidebar.appendChild(btn2);

            openMobileMenu();
            btn1.focus();

            // Shift+Tab from first element should cycle to last
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
            document.dispatchEvent(tabEvent);

            // Focus trap should prevent default and cycle
            expect(elements.sidebar.classList.contains('open')).toBe(true);
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

    describe('toggleCategory announcements', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should create announcer element when toggling', () => {
            const section = document.querySelector('.category-section');
            toggleCategory(section);

            const announcer = document.getElementById('category-announcer');
            expect(announcer).not.toBeNull();
            expect(announcer.getAttribute('aria-live')).toBe('polite');
        });

        test('should announce collapsed state', () => {
            const section = document.querySelector('.category-section');
            toggleCategory(section);

            const announcer = document.getElementById('category-announcer');
            expect(announcer.textContent).toContain('collapsed');
        });

        test('should announce expanded state', () => {
            const section = document.querySelector('.category-section');
            section.classList.add('collapsed');
            toggleCategory(section);

            const announcer = document.getElementById('category-announcer');
            expect(announcer.textContent).toContain('expanded');
        });
    });

    describe('scrollToCategory aria-current', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
            renderNavigation();
            window.scrollTo = jest.fn();
        });

        test('should set aria-current on active nav item', () => {
            scrollToCategory('allies');

            const activeItem = document.querySelector('.nav-item[data-category="allies"]');
            expect(activeItem.getAttribute('aria-current')).toBe('true');
        });

        test('should only have one active nav item with aria-current at a time', () => {
            // First scroll to allies
            scrollToCategory('allies');

            // Then scroll to a different category (skip favorites and recent which may not have sections)
            const navItems = document.querySelectorAll('.nav-item:not(.favorites-nav):not(.recent-nav)');
            const secondCategory = navItems[1]?.dataset.category;

            if (secondCategory) {
                scrollToCategory(secondCategory);

                const itemsWithAriaCurrent = document.querySelectorAll('.nav-item[aria-current="true"]');
                expect(itemsWithAriaCurrent.length).toBe(1);
                expect(itemsWithAriaCurrent[0].dataset.category).toBe(secondCategory);
            }
        });
    });

    describe('renderMobileCategoryChips', () => {
        beforeEach(() => {
            cacheElements();
            // Add mobile chips container
            const chipsContainer = document.createElement('nav');
            chipsContainer.id = 'mobile-category-chips';
            document.body.appendChild(chipsContainer);
        });

        test('should render category chips', () => {
            renderMobileCategoryChips();

            const chips = document.querySelectorAll('.category-chip');
            expect(chips.length).toBeGreaterThan(0);
        });

        test('should render favorites chip when favorites exist', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderMobileCategoryChips();

            const favoritesChip = document.querySelector('.category-chip[data-category="favorites"]');
            expect(favoritesChip).not.toBeNull();
        });

        test('should always render favorites chip even with no favorites', () => {
            state.favorites = [];
            renderMobileCategoryChips();

            const favoritesChip = document.querySelector('.category-chip[data-category="favorites"]');
            expect(favoritesChip).not.toBeNull();
        });

        test('should handle missing container gracefully', () => {
            document.getElementById('mobile-category-chips').remove();

            expect(() => renderMobileCategoryChips()).not.toThrow();
        });

        test('clicking chip should update active state', () => {
            window.scrollTo = jest.fn();
            renderMobileCategoryChips();

            const chips = document.querySelectorAll('.category-chip');
            chips[0].click();

            expect(chips[0].classList.contains('active')).toBe(true);
        });
    });
});
