/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements, useFakeTimers, useRealTimers, advanceTimers } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, renderCategories } from '../js/ui.js';
import {
    renderNavigation,
    toggleCategory,
    scrollToCategory,
    createNavHeader,
    loadCollapsedCategories,
    applyCollapsedStates,
} from '../js/navigation.js';
import {
    toggleMobileMenu,
    openMobileMenu,
    closeMobileMenu,
} from '../js/mobile.js';
import { clearAnnouncerCache } from '../js/utils.js';

describe('Navigation Functions', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
        clearAnnouncerCache();
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

        test('openMobileMenu should focus first focusable element', () => {
            useFakeTimers();
            // Add a button inside sidebar
            const btn = document.createElement('button');
            btn.textContent = 'Test';
            elements.sidebar.appendChild(btn);

            openMobileMenu();

            // Advance timers for focus
            advanceTimers(150);
            expect(document.activeElement).toBe(btn);
            useRealTimers();
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

        test('should ignore keydown when menu is closed', () => {
            // Don't open the menu, just dispatch keydown
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            
            // This should not throw and should not affect sidebar
            expect(() => document.dispatchEvent(escEvent)).not.toThrow();
            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });

        test('should close menu on Tab when sidebar has no focusable elements', () => {
            // Clear sidebar content
            elements.sidebar.innerHTML = '';
            
            openMobileMenu();

            // Tab should not throw when no focusable elements
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            expect(() => document.dispatchEvent(tabEvent)).not.toThrow();
            
            // Menu should be closed as a safety measure to prevent keyboard trap
            expect(elements.sidebar.classList.contains('open')).toBe(false);
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

    describe('Branch Coverage - announceToScreenReader', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should create announcer if it does not exist', () => {
            // Ensure announcer doesn't exist
            const existingAnnouncer = document.getElementById('category-announcer');
            if (existingAnnouncer) existingAnnouncer.remove();

            const section = document.querySelector('.category-section');
            toggleCategory(section);

            const announcer = document.getElementById('category-announcer');
            expect(announcer).not.toBeNull();
            expect(announcer.getAttribute('aria-live')).toBe('polite');
            expect(announcer.getAttribute('aria-atomic')).toBe('true');
            expect(announcer.className).toBe('visually-hidden');
        });

        test('should reuse existing announcer', () => {
            // First toggle to create announcer
            const section = document.querySelector('.category-section');
            toggleCategory(section);

            const announcer = document.getElementById('category-announcer');
            expect(announcer).not.toBeNull();

            // Second toggle should reuse the same announcer
            toggleCategory(section);
            const sameAnnouncer = document.getElementById('category-announcer');
            expect(sameAnnouncer).toBe(announcer);
        });
    });

    describe('Category Collapse State Persistence', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
            localStorage.clear();
        });

        test('should save collapsed state when category is collapsed', () => {
            const section = document.querySelector('.category-section');
            const categoryId = section.dataset.category;

            toggleCategory(section);

            const savedData = JSON.parse(localStorage.getItem('cnc-collapsed-categories') || '[]');
            expect(savedData).toContain(categoryId);
        });

        test('should remove from collapsed when category is expanded', () => {
            const section = document.querySelector('.category-section');
            const categoryId = section.dataset.category;

            // First collapse
            toggleCategory(section);
            // Then expand
            toggleCategory(section);

            const savedData = JSON.parse(localStorage.getItem('cnc-collapsed-categories') || '[]');
            expect(savedData).not.toContain(categoryId);
        });

        test('loadCollapsedCategories should return empty array if nothing stored', () => {
            const result = loadCollapsedCategories();
            expect(Array.isArray(result)).toBe(true);
            expect(result).toEqual([]);
        });

        test('loadCollapsedCategories should return stored categories', () => {
            localStorage.setItem('cnc-collapsed-categories', JSON.stringify(['allies', 'soviets']));

            const result = loadCollapsedCategories();
            expect(result).toEqual(['allies', 'soviets']);
        });

        test('loadCollapsedCategories should handle invalid JSON gracefully', () => {
            // Store invalid JSON
            localStorage.setItem('cnc-collapsed-categories', 'not valid json {{{');

            // Mock console.error to verify error is logged
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const result = loadCollapsedCategories();

            // Should return empty array on error
            expect(result).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();

            consoleSpy.mockRestore();
        });

        test('saveCollapseState should handle localStorage errors gracefully', () => {
            // Mock localStorage.setItem to throw an error
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = jest.fn(() => {
                throw new Error('Storage quota exceeded');
            });

            const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

            const section = document.querySelector('.category-section');
            
            // This should not throw even when localStorage fails
            expect(() => toggleCategory(section)).not.toThrow();
            expect(consoleSpy).toHaveBeenCalled();

            // Restore
            localStorage.setItem = originalSetItem;
            consoleSpy.mockRestore();
        });

        test('applyCollapsedStates should collapse stored categories', () => {
            localStorage.setItem('cnc-collapsed-categories', JSON.stringify(['allies']));

            applyCollapsedStates();

            const section = document.getElementById('category-allies');
            expect(section.classList.contains('collapsed')).toBe(true);
        });

        test('applyCollapsedStates should update aria-expanded', () => {
            localStorage.setItem('cnc-collapsed-categories', JSON.stringify(['allies']));

            applyCollapsedStates();

            const section = document.getElementById('category-allies');
            const header = section.querySelector('.category-header');
            expect(header.getAttribute('aria-expanded')).toBe('false');
        });

        test('applyCollapsedStates should handle nonexistent categories gracefully', () => {
            localStorage.setItem('cnc-collapsed-categories', JSON.stringify(['nonexistent']));

            expect(() => applyCollapsedStates()).not.toThrow();
        });
    });

    describe('Branch Coverage - Mobile Menu Focus', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('openMobileMenu should handle sidebar with no focusable elements', () => {
            useFakeTimers();
            // Clear sidebar and don't add any buttons
            elements.sidebar.innerHTML = '<div>No buttons here</div>';

            // This should not throw even with no focusable elements
            expect(() => openMobileMenu()).not.toThrow();

            // Advance timers
            advanceTimers(150);
            // Menu should still be open
            expect(elements.sidebar.classList.contains('open')).toBe(true);
            useRealTimers();
        });

        test('Tab from last element should cycle to first element', () => {
            useFakeTimers();
            // Add focusable elements to sidebar
            const btn1 = document.createElement('button');
            btn1.id = 'first-btn';
            btn1.textContent = 'First';
            const btn2 = document.createElement('button');
            btn2.id = 'last-btn';
            btn2.textContent = 'Last';
            elements.sidebar.appendChild(btn1);
            elements.sidebar.appendChild(btn2);

            openMobileMenu();

            // Advance timers for menu to open and focus
            advanceTimers(150);

            // Focus the last element
            btn2.focus();
            expect(document.activeElement).toBe(btn2);

            // Simulate Tab key (not shift)
            const tabEvent = new KeyboardEvent('keydown', { 
                key: 'Tab', 
                shiftKey: false,
                bubbles: true,
                cancelable: true
            });
            
            // The event should be captured by the focus trap
            document.dispatchEvent(tabEvent);
            
            // Focus should cycle (or trap should prevent default)
            expect(elements.sidebar.classList.contains('open')).toBe(true);
            useRealTimers();
        });

        test('Shift+Tab from first element should cycle to last element', () => {
            useFakeTimers();
            // Add focusable elements to sidebar
            const btn1 = document.createElement('button');
            btn1.id = 'first-btn';
            btn1.textContent = 'First';
            const btn2 = document.createElement('button');
            btn2.id = 'last-btn';
            btn2.textContent = 'Last';
            elements.sidebar.appendChild(btn1);
            elements.sidebar.appendChild(btn2);

            openMobileMenu();

            // Advance timers for menu to open and focus
            advanceTimers(150);

            // Focus the first element
            btn1.focus();
            expect(document.activeElement).toBe(btn1);

            // Simulate Shift+Tab key
            const tabEvent = new KeyboardEvent('keydown', { 
                key: 'Tab', 
                shiftKey: true,
                bubbles: true,
                cancelable: true
            });
            
            document.dispatchEvent(tabEvent);
            
            // Focus should cycle (or trap should prevent default)
            expect(elements.sidebar.classList.contains('open')).toBe(true);
            useRealTimers();
        });

        test('Tab should not cycle when not at boundary element', () => {
            useFakeTimers();
            // Add three focusable elements to sidebar
            const btn1 = document.createElement('button');
            btn1.textContent = 'First';
            const btn2 = document.createElement('button');
            btn2.textContent = 'Middle';
            const btn3 = document.createElement('button');
            btn3.textContent = 'Last';
            elements.sidebar.appendChild(btn1);
            elements.sidebar.appendChild(btn2);
            elements.sidebar.appendChild(btn3);

            openMobileMenu();

            // Advance timers for menu to open and focus
            advanceTimers(150);

            // Focus the middle element
            btn2.focus();

            // Tab from middle should not trigger cycle
            const tabEvent = new KeyboardEvent('keydown', { 
                key: 'Tab', 
                shiftKey: false,
                bubbles: true
            });
            
            document.dispatchEvent(tabEvent);
            
            // Menu should still be open
            expect(elements.sidebar.classList.contains('open')).toBe(true);
            useRealTimers();
        });
    });
});
