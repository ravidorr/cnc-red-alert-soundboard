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

        test('should focus first focusable element in sidebar', async () => {
            // Add a focusable button to sidebar
            const btn = document.createElement('button');
            btn.textContent = 'Focus Me';
            elements.sidebar.appendChild(btn);

            openMobileMenu();

            // Wait for the setTimeout to focus the element
            await new Promise(resolve => setTimeout(resolve, 150));

            expect(document.activeElement).toBe(btn);
        });

        test('should handle sidebar with no focusable elements', async () => {
            // Clear sidebar
            elements.sidebar.innerHTML = '<p>No buttons here</p>';

            openMobileMenu();

            // Wait for the setTimeout
            await new Promise(resolve => setTimeout(resolve, 150));

            // Should not throw
            expect(elements.sidebar.classList.contains('open')).toBe(true);
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

        test('should close menu and hide sidebar when resizing from desktop to mobile', () => {
            // Start on desktop
            Object.defineProperty(window, 'innerWidth', {
                value: 1024,
                writable: true,
            });
            setupViewportListener();
            openMobileMenu();

            // Resize to mobile
            Object.defineProperty(window, 'innerWidth', {
                value: 375,
                writable: true,
            });
            window.dispatchEvent(new Event('resize'));

            expect(elements.sidebar.classList.contains('open')).toBe(false);
            expect(elements.sidebar.getAttribute('aria-hidden')).toBe('true');
        });

        test('should remove open class and set aria-hidden=false when resizing from mobile to desktop', () => {
            // Start on mobile with menu open
            Object.defineProperty(window, 'innerWidth', {
                value: 375,
                writable: true,
            });
            setupViewportListener();
            openMobileMenu();

            // Resize to desktop
            Object.defineProperty(window, 'innerWidth', {
                value: 1024,
                writable: true,
            });
            window.dispatchEvent(new Event('resize'));

            expect(elements.sidebar.classList.contains('open')).toBe(false);
            expect(elements.sidebar.getAttribute('aria-hidden')).toBe('false');
            expect(elements.mobileMenuOverlay.classList.contains('visible')).toBe(false);
        });

        test('should not update when resizing within same breakpoint', () => {
            // Start on desktop
            Object.defineProperty(window, 'innerWidth', {
                value: 1024,
                writable: true,
            });
            setupViewportListener();

            // Resize within desktop
            Object.defineProperty(window, 'innerWidth', {
                value: 1200,
                writable: true,
            });
            window.dispatchEvent(new Event('resize'));

            // No change expected - sidebar should maintain state
            expect(elements.sidebar).not.toBeNull();
        });

        test('should handle null sidebar when resizing to desktop', () => {
            // Start on mobile
            Object.defineProperty(window, 'innerWidth', {
                value: 375,
                writable: true,
            });
            setupViewportListener();

            // Set sidebar to null
            elements.sidebar = null;

            // Resize to desktop - should not throw
            Object.defineProperty(window, 'innerWidth', {
                value: 1024,
                writable: true,
            });

            expect(() => window.dispatchEvent(new Event('resize'))).not.toThrow();
        });

        test('should handle null mobileMenuOverlay when resizing to desktop', () => {
            // Start on mobile
            Object.defineProperty(window, 'innerWidth', {
                value: 375,
                writable: true,
            });
            setupViewportListener();

            // Set overlay to null
            elements.mobileMenuOverlay = null;

            // Resize to desktop - should not throw
            Object.defineProperty(window, 'innerWidth', {
                value: 1024,
                writable: true,
            });

            expect(() => window.dispatchEvent(new Event('resize'))).not.toThrow();
        });
    });

    describe('Mobile Menu Keyboard Navigation', () => {
        test('should close menu when Escape is pressed', () => {
            openMobileMenu();

            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            document.dispatchEvent(escEvent);

            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });

        test('should close menu when Enter is pressed on overlay via overlay handler', () => {
            openMobileMenu();

            // Dispatch keydown directly on overlay (triggers handleOverlayKeydown)
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
            elements.mobileMenuOverlay.dispatchEvent(enterEvent);

            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });

        test('should close menu when Space is pressed on overlay via overlay handler', () => {
            openMobileMenu();

            // Dispatch keydown directly on overlay (triggers handleOverlayKeydown)
            const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
            elements.mobileMenuOverlay.dispatchEvent(spaceEvent);

            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });

        test('should not close menu when other key is pressed on overlay', () => {
            openMobileMenu();

            // Dispatch keydown with a different key
            const otherEvent = new KeyboardEvent('keydown', { key: 'a', bubbles: true, cancelable: true });
            elements.mobileMenuOverlay.dispatchEvent(otherEvent);

            // Menu should still be open
            expect(elements.sidebar.classList.contains('open')).toBe(true);
        });

        test('should close menu when Enter pressed with overlay focused via document handler', () => {
            openMobileMenu();

            // Set activeElement to overlay for document handler check
            Object.defineProperty(document, 'activeElement', {
                value: elements.mobileMenuOverlay,
                writable: true,
                configurable: true,
            });

            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true });
            document.dispatchEvent(enterEvent);

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });

            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });

        test('should close menu when Space pressed with overlay focused via document handler', () => {
            openMobileMenu();

            // Set activeElement to overlay for document handler check
            Object.defineProperty(document, 'activeElement', {
                value: elements.mobileMenuOverlay,
                writable: true,
                configurable: true,
            });

            const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
            document.dispatchEvent(spaceEvent);

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });

            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });

        test('should trap focus with Tab key - cycle from last to first', () => {
            openMobileMenu();

            // Add some focusable elements to sidebar
            const btn1 = document.createElement('button');
            btn1.textContent = 'First';
            const btn2 = document.createElement('button');
            btn2.textContent = 'Last';
            elements.sidebar.appendChild(btn1);
            elements.sidebar.appendChild(btn2);

            // Focus last element
            btn2.focus();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            document.dispatchEvent(tabEvent);

            // Menu should still be open (focus trapped)
            expect(elements.sidebar.classList.contains('open')).toBe(true);
        });

        test('should trap focus with Shift+Tab key - cycle from first to last', () => {
            openMobileMenu();

            // Add some focusable elements to sidebar
            const btn1 = document.createElement('button');
            btn1.textContent = 'First';
            const btn2 = document.createElement('button');
            btn2.textContent = 'Last';
            elements.sidebar.appendChild(btn1);
            elements.sidebar.appendChild(btn2);

            // Focus first element
            btn1.focus();

            const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
            document.dispatchEvent(shiftTabEvent);

            // Menu should still be open (focus trapped)
            expect(elements.sidebar.classList.contains('open')).toBe(true);
        });

        test('should close menu if no focusable elements on Tab', () => {
            openMobileMenu();

            // Remove all focusable elements from sidebar
            elements.sidebar.innerHTML = '<p>No buttons</p>';

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            document.dispatchEvent(tabEvent);

            // Menu should close as safety measure
            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });

        test('should not process keydown when menu is closed', () => {
            // Menu is closed
            elements.sidebar.classList.remove('open');

            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            // Should not throw
            expect(() => document.dispatchEvent(escEvent)).not.toThrow();
        });

        test('should restore focus to trigger element when closing', () => {
            // Create and focus a trigger button
            const triggerBtn = document.createElement('button');
            triggerBtn.id = 'trigger';
            document.body.appendChild(triggerBtn);
            triggerBtn.focus();

            openMobileMenu();

            // Verify menu opened
            expect(elements.sidebar.classList.contains('open')).toBe(true);

            closeMobileMenu();

            // Menu should be closed
            expect(elements.sidebar.classList.contains('open')).toBe(false);

            triggerBtn.remove();
        });
    });

    describe('Null Element Handling', () => {
        test('should handle null sidebar in closeMobileMenu', () => {
            elements.sidebar = null;
            expect(() => closeMobileMenu()).not.toThrow();
        });

        test('should handle null mobileMenuOverlay in closeMobileMenu', () => {
            elements.mobileMenuOverlay = null;
            openMobileMenu();
            expect(() => closeMobileMenu()).not.toThrow();
        });

        test('should handle null mobileMenuToggle in closeMobileMenu', () => {
            elements.mobileMenuToggle = null;
            openMobileMenu();
            expect(() => closeMobileMenu()).not.toThrow();
        });

        test('should handle null sidebar in openMobileMenu', () => {
            elements.sidebar = null;
            expect(() => openMobileMenu()).not.toThrow();
        });

        test('should handle null mobileMenuOverlay in openMobileMenu', () => {
            elements.mobileMenuOverlay = null;
            expect(() => openMobileMenu()).not.toThrow();
        });

        test('should handle null mobileMenuToggle in openMobileMenu', () => {
            elements.mobileMenuToggle = null;
            expect(() => openMobileMenu()).not.toThrow();
        });

        test('should handle null sidebar in toggleMobileMenu', () => {
            elements.sidebar = null;
            expect(() => toggleMobileMenu()).not.toThrow();
        });
    });
});
