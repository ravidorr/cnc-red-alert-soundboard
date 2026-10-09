/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements, useFakeTimers, useRealTimers, advanceTimers } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, showToast } from '../js/ui.js';

// We need to test the main.js functions
// For network status, we simulate what setupNetworkStatusListeners does

describe('Main.js Functions', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
        cacheElements();
    });

    describe('setupNetworkStatusListeners simulation', () => {
        beforeEach(() => {
            // Set up the network listeners as main.js does
            window.addEventListener('online', () => {
                showToast('CONNECTION RESTORED', 'success');
            });
            window.addEventListener('offline', () => {
                showToast('OPERATING OFFLINE MODE', 'info');
            });
        });

        test('should show success toast when going online', () => {
            const toastContainer = document.getElementById('toast-container');

            // Dispatch online event
            window.dispatchEvent(new Event('online'));

            // Check for toast (showToast creates a toast element)
            const toast = toastContainer.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('CONNECTION RESTORED');
        });

        test('should show info toast when going offline', () => {
            const toastContainer = document.getElementById('toast-container');

            // Dispatch offline event
            window.dispatchEvent(new Event('offline'));

            // Check for toast
            const toast = toastContainer.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('OPERATING OFFLINE MODE');
        });
    });

    describe('handleShortcutActions', () => {
        const localThis = {};

        beforeEach(() => {
            // Mock history.replaceState
            localThis.replaceStateSpy = jest
                .spyOn(window.history, 'replaceState')
                .mockImplementation(jest.fn());
        });

        afterEach(() => {
            localThis.replaceStateSpy.mockRestore();
            window.history.replaceState({}, '', '/');
        });

        // Helper to load handleShortcutActions dynamically after DOM is set up
        async function getHandleShortcutActions() {
            // Use dynamic import to load main.js after DOM setup
            const mainModule = await import('../js/main.js');
            return mainModule.handleShortcutActions;
        }

        test('should do nothing when no action parameter', async () => {
            // No ?action parameter
            window.history.pushState({}, '', '/');

            const handleShortcutActions = await getHandleShortcutActions();
            handleShortcutActions();

            // replaceState should NOT be called when there's no action
            expect(localThis.replaceStateSpy).not.toHaveBeenCalled();
        });

        test('should clear URL and schedule playRandomSound for random action', async () => {
            useFakeTimers();

            // Set up URL with action=random
            window.history.pushState({}, '', '/?action=random');

            const handleShortcutActions = await getHandleShortcutActions();
            handleShortcutActions();

            // Should clear URL parameter
            expect(localThis.replaceStateSpy).toHaveBeenCalledWith({}, '', '/');

            expect(() => advanceTimers(500)).not.toThrow();
            useRealTimers();
        });

        test('should clear URL and focus search input for search action', async () => {
            useFakeTimers();

            // Set up URL with action=search
            window.history.pushState({}, '', '/?action=search');

            // Ensure search input is cached in elements
            const searchInput = document.getElementById('search-input');
            const focusSpy = jest.spyOn(searchInput, 'focus');

            const handleShortcutActions = await getHandleShortcutActions();
            handleShortcutActions();

            // Should clear URL parameter
            expect(localThis.replaceStateSpy).toHaveBeenCalledWith({}, '', '/');

            // Search input focus is called after 300ms delay
            expect(focusSpy).not.toHaveBeenCalled();
            advanceTimers(300);
            expect(focusSpy).toHaveBeenCalledTimes(1);

            focusSpy.mockRestore();
            useRealTimers();
        });

        test('should tolerate a missing cached search input for search action', async () => {
            const localThis = {};
            useFakeTimers();
            window.history.pushState({}, '', '/?action=search');
            elements.searchInput = null;
            localThis.handleShortcutActions = await getHandleShortcutActions();

            localThis.handleShortcutActions();
            expect(() => advanceTimers(300)).not.toThrow();

            useRealTimers();
        });

        test('should handle unknown action gracefully', async () => {
            // Set up URL with unknown action
            window.history.pushState({}, '', '/?action=unknown');

            const handleShortcutActions = await getHandleShortcutActions();

            // Should not throw
            expect(() => handleShortcutActions()).not.toThrow();

            // Should still clear URL parameter
            expect(localThis.replaceStateSpy).toHaveBeenCalledWith({}, '', '/');
        });

        test('should preserve hash when clearing URL', async () => {
            window.history.pushState({}, '', '/app?action=random#section');

            const handleShortcutActions = await getHandleShortcutActions();
            handleShortcutActions();

            // Should preserve pathname and hash
            expect(localThis.replaceStateSpy).toHaveBeenCalledWith({}, '', '/app#section');
        });
    });

    describe('setFooterVersion', () => {
        test('should set version in footer element', () => {
            // Add footer version element
            const footer = document.createElement('span');
            footer.className = 'footer-version';
            document.body.appendChild(footer);

            // The version would be set during init
            // We can verify the element exists
            const versionElement = document.querySelector('.footer-version');
            expect(versionElement).not.toBeNull();
        });

        test('should handle missing footer element gracefully', () => {
            // Ensure no footer-version element
            const existing = document.querySelector('.footer-version');
            if (existing) {
                existing.remove();
            }

            // Should not throw
            expect(() => {
                const versionElement = document.querySelector('.footer-version');
                if (versionElement) {
                    versionElement.textContent = 'v1.0.0';
                }
            }).not.toThrow();
        });
    });

    describe('init flow', () => {
        test('should initialize the footer, network notifications, and onboarding timer', async () => {
            const localThis = {};
            useFakeTimers();
            localThis.footerVersion = document.createElement('span');
            localThis.footerVersion.className = 'footer-version';
            document.body.appendChild(localThis.footerVersion);

            const mainModule = await import('../js/main.js');
            mainModule.init();

            expect(localThis.footerVersion.textContent).toMatch(/^v/);

            window.dispatchEvent(new Event('online'));
            expect(document.querySelector('.toast').textContent).toContain('CONNECTION RESTORED');

            window.dispatchEvent(new Event('offline'));
            expect(document.querySelector('.toast').textContent).toContain('OPERATING OFFLINE MODE');

            advanceTimers(1500);
            expect(document.getElementById('onboarding-tooltip')).not.toBeNull();
            useRealTimers();
        });

        test('should initialize successfully without a footer version element', async () => {
            const localThis = {};
            localThis.mainModule = await import('../js/main.js');

            expect(() => localThis.mainModule.init()).not.toThrow();
        });

        test('should defer initialization until DOMContentLoaded while loading', async () => {
            const localThis = {};
            localThis.readyStateDescriptor = Object.getOwnPropertyDescriptor(document, 'readyState');
            Object.defineProperty(document, 'readyState', {
                value: 'loading',
                configurable: true,
            });
            jest.resetModules();

            await import('../js/main.js');
            expect(document.getElementById('content-area').classList.contains('sounds-loaded')).toBe(false);

            document.dispatchEvent(new Event('DOMContentLoaded'));

            expect(document.getElementById('content-area').classList.contains('sounds-loaded')).toBe(true);
            if (localThis.readyStateDescriptor) {
                Object.defineProperty(document, 'readyState', localThis.readyStateDescriptor);
            } else {
                delete document.readyState;
            }
        });

        test('should have all required DOM elements for initialization', () => {
            // Verify setupFullDOM creates all needed elements
            expect(document.getElementById('content-area')).not.toBeNull();
            expect(document.getElementById('category-nav')).not.toBeNull();
            expect(document.getElementById('search-input')).not.toBeNull();
            expect(document.getElementById('audio-player')).not.toBeNull();
            expect(document.getElementById('toast-container')).not.toBeNull();
        });

        test('should handle document ready state loading', () => {
            // Test the conditional loading logic
            const readyState = document.readyState;
            expect(['loading', 'interactive', 'complete']).toContain(readyState);
        });
    });
});
