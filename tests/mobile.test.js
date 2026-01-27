/**
 * @jest-environment jsdom
 */
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements } from '../js/ui.js';
import {
    isMobileViewport,
    initSidebarAccessibility,
    setupViewportListener,
    toggleMobileMenu,
    openMobileMenu,
    closeMobileMenu,
} from '../js/mobile.js';

describe('Mobile Functions', () => {
    const localThis = {};

    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
        cacheElements();

        // Store original innerWidth
        localThis.originalInnerWidth = window.innerWidth;
    });

    afterEach(() => {
        // Restore original innerWidth
        Object.defineProperty(window, 'innerWidth', {
            value: localThis.originalInnerWidth,
            writable: true,
        });
    });

    describe('isMobileViewport', () => {
        test('should return true for mobile viewport (<=768px)', () => {
            Object.defineProperty(window, 'innerWidth', {
                value: 768,
                writable: true,
            });
            expect(isMobileViewport()).toBe(true);
        });

        test('should return true for small mobile viewport', () => {
            Object.defineProperty(window, 'innerWidth', {
                value: 375,
                writable: true,
            });
            expect(isMobileViewport()).toBe(true);
        });

        test('should return false for desktop viewport (>768px)', () => {
            Object.defineProperty(window, 'innerWidth', {
                value: 1024,
                writable: true,
            });
            expect(isMobileViewport()).toBe(false);
        });
    });

    describe('initSidebarAccessibility', () => {
        test('should set aria-hidden="true" on mobile viewport', () => {
            Object.defineProperty(window, 'innerWidth', {
                value: 375,
                writable: true,
            });
            initSidebarAccessibility();

            expect(elements.sidebar.getAttribute('aria-hidden')).toBe('true');
        });

        test('should set aria-hidden="false" on desktop viewport', () => {
            Object.defineProperty(window, 'innerWidth', {
                value: 1024,
                writable: true,
            });
            initSidebarAccessibility();

            expect(elements.sidebar.getAttribute('aria-hidden')).toBe('false');
        });

        test('should not throw if sidebar is null', () => {
            elements.sidebar = null;
            expect(() => initSidebarAccessibility()).not.toThrow();
        });
    });

    describe('toggleMobileMenu', () => {
        test('should open menu when closed', () => {
            elements.sidebar.classList.remove('open');
            toggleMobileMenu();

            expect(elements.sidebar.classList.contains('open')).toBe(true);
        });

        test('should close menu when open', () => {
            elements.sidebar.classList.add('open');
            toggleMobileMenu();

            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });
    });

    describe('openMobileMenu', () => {
        test('should add open class to sidebar', () => {
            openMobileMenu();
            expect(elements.sidebar.classList.contains('open')).toBe(true);
        });

        test('should set aria-hidden to false', () => {
            openMobileMenu();
            expect(elements.sidebar.getAttribute('aria-hidden')).toBe('false');
        });

        test('should show mobile menu overlay', () => {
            openMobileMenu();
            expect(elements.mobileMenuOverlay.classList.contains('visible')).toBe(true);
        });

        test('should update toggle button aria-expanded', () => {
            openMobileMenu();
            expect(elements.mobileMenuToggle.getAttribute('aria-expanded')).toBe('true');
        });
    });

    describe('closeMobileMenu', () => {
        beforeEach(() => {
            openMobileMenu();
        });

        test('should remove open class from sidebar', () => {
            closeMobileMenu();
            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });

        test('should set aria-hidden to true', () => {
            closeMobileMenu();
            expect(elements.sidebar.getAttribute('aria-hidden')).toBe('true');
        });

        test('should hide mobile menu overlay', () => {
            closeMobileMenu();
            expect(elements.mobileMenuOverlay.classList.contains('visible')).toBe(false);
        });

        test('should update toggle button aria-expanded', () => {
            closeMobileMenu();
            expect(elements.mobileMenuToggle.getAttribute('aria-expanded')).toBe('false');
        });
    });

    describe('setupViewportListener', () => {
        test('should setup resize listener without error', () => {
            expect(() => setupViewportListener()).not.toThrow();
        });
    });
});
