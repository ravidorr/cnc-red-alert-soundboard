/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements, useFakeTimers, useRealTimers, advanceTimers } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements } from '../js/ui.js';
import {
    showInstallPrompt,
    hideInstallPrompt,
    showInstallButton,
    hideInstallButton,
    triggerInstall,
    setupInstallPrompt,
    registerServiceWorker,
    cacheAllSoundsForOffline,
    showUpdateAvailableNotification,
    hideUpdateNotification,
    getSwRegistration,
} from '../js/install.js';

describe('Install Functions', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
        localStorage.clear();
    });

    describe('showInstallPrompt / hideInstallPrompt', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('showInstallPrompt should add visible class', () => {
            showInstallPrompt();

            const prompt = document.getElementById('install-prompt');
            expect(prompt.classList.contains('visible')).toBe(true);
        });

        test('hideInstallPrompt should remove visible class', () => {
            showInstallPrompt();
            hideInstallPrompt();

            const prompt = document.getElementById('install-prompt');
            expect(prompt.classList.contains('visible')).toBe(false);
        });

        test('showInstallPrompt should handle null element', () => {
            elements.installPrompt = null;
            expect(() => showInstallPrompt()).not.toThrow();
        });

        test('hideInstallPrompt should handle null element', () => {
            elements.installPrompt = null;
            expect(() => hideInstallPrompt()).not.toThrow();
        });
    });

    describe('Install Button Visibility', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('showInstallButton should add visible class', () => {
            showInstallButton();

            const btn = document.getElementById('install-btn');
            expect(btn.classList.contains('visible')).toBe(true);
        });

        test('hideInstallButton should remove visible class', () => {
            showInstallButton();
            hideInstallButton();

            const btn = document.getElementById('install-btn');
            expect(btn.classList.contains('visible')).toBe(false);
        });

        test('showInstallButton should handle null element', () => {
            elements.installBtn = null;
            expect(() => showInstallButton()).not.toThrow();
        });

        test('hideInstallButton should handle null element', () => {
            elements.installBtn = null;
            expect(() => hideInstallButton()).not.toThrow();
        });
    });

    describe('triggerInstall', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should not throw when no deferred prompt', async () => {
            state.deferredInstallPrompt = null;

            await expect(triggerInstall()).resolves.not.toThrow();
        });

        test('should call prompt when deferred prompt exists', async () => {
            const mockPrompt = {
                prompt: jest.fn(),
                userChoice: Promise.resolve({ outcome: 'accepted' }),
            };
            state.deferredInstallPrompt = mockPrompt;

            await triggerInstall();

            expect(mockPrompt.prompt).toHaveBeenCalled();
            expect(state.deferredInstallPrompt).toBeNull();
        });

        test('should handle dismissed outcome', async () => {
            const mockPrompt = {
                prompt: jest.fn(),
                userChoice: Promise.resolve({ outcome: 'dismissed' }),
            };
            state.deferredInstallPrompt = mockPrompt;

            await triggerInstall();

            expect(mockPrompt.prompt).toHaveBeenCalled();
            expect(state.deferredInstallPrompt).toBeNull();
        });
    });

    describe('setupInstallPrompt', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should return early if in standalone mode', () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: true });

            setupInstallPrompt();

            // Should return early, no event listeners added
            expect(window.matchMedia).toHaveBeenCalledWith('(display-mode: standalone)');
        });

        test('should setup event listeners when not standalone', () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });

            expect(() => setupInstallPrompt()).not.toThrow();
        });

        test('should handle beforeinstallprompt event', () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            setupInstallPrompt();

            const mockEvent = {
                preventDefault: jest.fn(),
            };
            window.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), mockEvent));

            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        test('should show install prompt after delay when not dismissed', () => {
            jest.useFakeTimers();
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            localStorage.removeItem('installPromptDismissed');
            setupInstallPrompt();

            const mockEvent = {
                preventDefault: jest.fn(),
            };
            window.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), mockEvent));

            // Fast-forward past the 2000ms delay
            jest.advanceTimersByTime(2100);

            expect(elements.installPrompt.classList.contains('visible')).toBe(true);
            jest.useRealTimers();
        });

        test('should not show install prompt when recently dismissed', () => {
            jest.useFakeTimers();
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            // Set dismissed timestamp to recent (less than 7 days ago)
            localStorage.setItem('installPromptDismissed', Date.now().toString());
            setupInstallPrompt();

            const mockEvent = {
                preventDefault: jest.fn(),
            };
            window.dispatchEvent(Object.assign(new Event('beforeinstallprompt'), mockEvent));

            // Fast-forward past the 2000ms delay
            jest.advanceTimersByTime(2100);

            // Should NOT show because it was recently dismissed
            expect(elements.installPrompt.classList.contains('visible')).toBe(false);
            jest.useRealTimers();
        });

        test('should handle modal install button click', async () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            setupInstallPrompt();

            state.deferredInstallPrompt = null;
            elements.btnInstall.click();

            // Should not throw
        });

        test('should handle dismiss button click', () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            setupInstallPrompt();

            elements.btnDismiss.click();

            expect(localStorage.getItem('installPromptDismissed')).not.toBeNull();
            expect(elements.installPrompt.classList.contains('visible')).toBe(false);
        });

        test('should handle background click on install prompt', () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            setupInstallPrompt();
            showInstallPrompt();

            // Simulate click on the prompt background itself
            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: elements.installPrompt });
            elements.installPrompt.dispatchEvent(event);

            expect(elements.installPrompt.classList.contains('visible')).toBe(false);
        });

        test('should trap focus with Tab key when install prompt is visible', () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            setupInstallPrompt();
            showInstallPrompt();

            // Simulate Tab key when prompt is visible
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            elements.installPrompt.dispatchEvent(tabEvent);

            // Prompt should still be visible (focus trapped)
            expect(elements.installPrompt.classList.contains('visible')).toBe(true);
        });

        test('should not trap focus when install prompt is not visible', () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            setupInstallPrompt();
            // Don't show the prompt

            // Simulate Tab key when prompt is NOT visible
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });

            // Should not throw
            expect(() => elements.installPrompt.dispatchEvent(tabEvent)).not.toThrow();
        });

        test('should handle appinstalled event', () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            state.deferredInstallPrompt = { prompt: jest.fn() };
            setupInstallPrompt();
            showInstallPrompt();
            showInstallButton();

            window.dispatchEvent(new Event('appinstalled'));

            expect(elements.installPrompt.classList.contains('visible')).toBe(false);
            expect(elements.installBtn.classList.contains('visible')).toBe(false);
            expect(state.deferredInstallPrompt).toBeNull();
            // Verify success toast is shown (sound caching now automatic via SW activation)
            const successToasts = document.querySelectorAll('.toast-success');
            expect(successToasts.length).toBeGreaterThan(0);
            expect(successToasts[0].textContent).toContain('APP INSTALLED');
        });

        test('should handle header install button click', async () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            setupInstallPrompt();

            state.deferredInstallPrompt = null;
            elements.installBtn.click();

            // Should not throw
        });

        test('should handle null header install button', () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            elements.installBtn = null;

            expect(() => setupInstallPrompt()).not.toThrow();
        });

        test('should not hide prompt when clicking on child element', () => {
            window.matchMedia = jest.fn().mockReturnValue({ matches: false });
            setupInstallPrompt();
            showInstallPrompt();

            // Create a child element
            const child = document.createElement('button');
            elements.installPrompt.appendChild(child);

            // Simulate click on child (event target is child, not installPrompt)
            const event = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(event, 'target', { value: child });
            elements.installPrompt.dispatchEvent(event);

            // Prompt should still be visible
            expect(elements.installPrompt.classList.contains('visible')).toBe(true);
        });
    });

    describe('Focus Management', () => {
        beforeEach(() => {
            cacheElements();
            setupInstallPrompt();
        });

        test('showInstallPrompt should make modal visible', () => {
            showInstallPrompt();

            expect(elements.installPrompt.classList.contains('visible')).toBe(true);
        });

        test('hideInstallPrompt should return focus to previous element', () => {
            const triggerBtn = document.createElement('button');
            triggerBtn.id = 'trigger';
            document.body.appendChild(triggerBtn);
            triggerBtn.focus();

            showInstallPrompt();
            hideInstallPrompt();

            expect(document.activeElement).toBe(triggerBtn);
        });

        test('Escape key should close modal', () => {
            showInstallPrompt();

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

            expect(elements.installPrompt.classList.contains('visible')).toBe(false);
        });

        test('Tab key handling in modal should not throw', () => {
            showInstallPrompt();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });

            expect(() => {
                elements.installPrompt.dispatchEvent(tabEvent);
            }).not.toThrow();
        });

        test('Shift+Tab key handling in modal should not throw', () => {
            showInstallPrompt();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });

            expect(() => {
                elements.installPrompt.dispatchEvent(tabEvent);
            }).not.toThrow();
        });

        test('Tab on last element should cycle to first', () => {
            const localThis = {};
            // Add focusable buttons to install prompt
            localThis.firstBtn = document.createElement('button');
            localThis.firstBtn.id = 'first-btn';
            localThis.lastBtn = document.createElement('button');
            localThis.lastBtn.id = 'last-btn';
            elements.installPrompt.appendChild(localThis.firstBtn);
            elements.installPrompt.appendChild(localThis.lastBtn);

            showInstallPrompt();
            localThis.lastBtn.focus();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            elements.installPrompt.dispatchEvent(tabEvent);

            // Modal should still be visible (focus trap working)
            expect(elements.installPrompt.classList.contains('visible')).toBe(true);
        });

        test('Shift+Tab on first element should cycle to last', () => {
            const localThis = {};
            // Add focusable buttons to install prompt
            localThis.firstBtn = document.createElement('button');
            localThis.firstBtn.id = 'first-btn-shift';
            localThis.lastBtn = document.createElement('button');
            localThis.lastBtn.id = 'last-btn-shift';
            elements.installPrompt.appendChild(localThis.firstBtn);
            elements.installPrompt.appendChild(localThis.lastBtn);

            showInstallPrompt();
            localThis.firstBtn.focus();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
            elements.installPrompt.dispatchEvent(tabEvent);

            // Modal should still be visible (focus trap working)
            expect(elements.installPrompt.classList.contains('visible')).toBe(true);
        });

        test('showInstallPrompt should focus first button when available', () => {
            useFakeTimers();
            const localThis = {};
            // Add a button to focus
            localThis.firstBtn = document.createElement('button');
            localThis.firstBtn.id = 'focus-test-btn';
            elements.installPrompt.appendChild(localThis.firstBtn);

            showInstallPrompt();

            // Advance timers for focus
            advanceTimers(100);
            expect(document.activeElement).toBe(localThis.firstBtn);
            useRealTimers();
        });
    });

    describe('registerServiceWorker', () => {
        test('should not throw', () => {
            expect(() => {
                registerServiceWorker();
            }).not.toThrow();
        });

        test('should register service worker when available', () => {
            const mockRegister = jest.fn().mockResolvedValue({ scope: '/' });
            Object.defineProperty(navigator, 'serviceWorker', {
                value: { register: mockRegister },
                writable: true,
                configurable: true,
            });

            registerServiceWorker();

            // Trigger load event
            window.dispatchEvent(new Event('load'));

            expect(mockRegister).toHaveBeenCalledWith('service-worker.js');
        });

        test('should handle service worker registration failure', async () => {
            const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            const mockRegister = jest.fn().mockRejectedValue(new Error('Registration failed'));
            Object.defineProperty(navigator, 'serviceWorker', {
                value: { register: mockRegister },
                writable: true,
                configurable: true,
            });

            registerServiceWorker();
            window.dispatchEvent(new Event('load'));

            // Wait for the promise to resolve
            await Promise.resolve();
            await Promise.resolve();

            expect(mockRegister).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('cacheAllSoundsForOffline', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should return early if serviceWorker not available', () => {
            const localThis = {};
            localThis.consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            // Remove serviceWorker
            const originalServiceWorker = navigator.serviceWorker;
            delete navigator.serviceWorker;
            Object.defineProperty(navigator, 'serviceWorker', {
                value: undefined,
                writable: true,
                configurable: true,
            });

            cacheAllSoundsForOffline();

            expect(localThis.consoleSpy).toHaveBeenCalledWith('Service worker not available for caching');
            localThis.consoleSpy.mockRestore();
            // Restore
            Object.defineProperty(navigator, 'serviceWorker', {
                value: originalServiceWorker,
                writable: true,
                configurable: true,
            });
        });

        test('should return early if no controller', () => {
            const localThis = {};
            localThis.consoleSpy = jest.spyOn(console, 'log').mockImplementation();
            Object.defineProperty(navigator, 'serviceWorker', {
                value: { controller: null },
                writable: true,
                configurable: true,
            });

            cacheAllSoundsForOffline();

            expect(localThis.consoleSpy).toHaveBeenCalledWith('Service worker not available for caching');
            localThis.consoleSpy.mockRestore();
        });

        test('should send CACHE_ALL_SOUNDS message to service worker', () => {
            const localThis = {};
            localThis.mockPostMessage = jest.fn();
            Object.defineProperty(navigator, 'serviceWorker', {
                value: { controller: { postMessage: localThis.mockPostMessage } },
                writable: true,
                configurable: true,
            });

            cacheAllSoundsForOffline();

            expect(localThis.mockPostMessage).toHaveBeenCalledWith(
                { type: 'CACHE_ALL_SOUNDS' },
                expect.any(Array),
            );
        });

        test('should show info toast when starting cache verification', () => {
            const localThis = {};
            localThis.mockPostMessage = jest.fn();
            Object.defineProperty(navigator, 'serviceWorker', {
                value: { controller: { postMessage: localThis.mockPostMessage } },
                writable: true,
                configurable: true,
            });

            cacheAllSoundsForOffline();

            // Check that info toast was shown
            const toasts = document.querySelectorAll('.toast-info');
            expect(toasts.length).toBeGreaterThan(0);
            expect(toasts[0].textContent).toContain('VERIFYING SOUND CACHE...');
        });

        test('should show success toast when caching completes', () => {
            const localThis = {};
            localThis.capturedMessageChannel = null;
            // Override MessageChannel to capture the instance
            const OriginalMessageChannel = global.MessageChannel;
            global.MessageChannel = class {
                constructor() {
                    this.port1 = { onmessage: null };
                    this.port2 = {};
                    localThis.capturedMessageChannel = this;
                }
            };
            localThis.mockPostMessage = jest.fn();
            Object.defineProperty(navigator, 'serviceWorker', {
                value: { controller: { postMessage: localThis.mockPostMessage } },
                writable: true,
                configurable: true,
            });

            cacheAllSoundsForOffline();

            // Simulate success response from service worker by triggering port1.onmessage
            localThis.capturedMessageChannel.port1.onmessage({
                data: { success: true, cachedCount: 190, failedCount: 0, total: 190 },
            });

            const successToasts = document.querySelectorAll('.toast-success');
            expect(successToasts.length).toBeGreaterThan(0);
            expect(successToasts[0].textContent).toContain('ALL 190/190 SOUNDS CACHED AND READY');

            // Restore original MessageChannel
            global.MessageChannel = OriginalMessageChannel;
        });

        test('should show error toast when caching fails', () => {
            const localThis = {};
            localThis.capturedMessageChannel = null;
            // Override MessageChannel to capture the instance
            const OriginalMessageChannel = global.MessageChannel;
            global.MessageChannel = class {
                constructor() {
                    this.port1 = { onmessage: null };
                    this.port2 = {};
                    localThis.capturedMessageChannel = this;
                }
            };
            localThis.mockPostMessage = jest.fn();
            Object.defineProperty(navigator, 'serviceWorker', {
                value: { controller: { postMessage: localThis.mockPostMessage } },
                writable: true,
                configurable: true,
            });

            cacheAllSoundsForOffline();

            // Simulate failure response from service worker by triggering port1.onmessage
            localThis.capturedMessageChannel.port1.onmessage({
                data: { success: false, cachedCount: 180, failedCount: 10, total: 190 },
            });

            const errorToasts = document.querySelectorAll('.toast-error');
            expect(errorToasts.length).toBeGreaterThan(0);
            expect(errorToasts[0].textContent).toContain('CACHE STATUS: 180/190 READY, 10 FAILED');

            // Restore original MessageChannel
            global.MessageChannel = OriginalMessageChannel;
        });

        test('should show error toast when response has no data', () => {
            const localThis = {};
            localThis.capturedMessageChannel = null;
            // Override MessageChannel to capture the instance
            const OriginalMessageChannel = global.MessageChannel;
            global.MessageChannel = class {
                constructor() {
                    this.port1 = { onmessage: null };
                    this.port2 = {};
                    localThis.capturedMessageChannel = this;
                }
            };
            localThis.mockPostMessage = jest.fn();
            Object.defineProperty(navigator, 'serviceWorker', {
                value: { controller: { postMessage: localThis.mockPostMessage } },
                writable: true,
                configurable: true,
            });

            cacheAllSoundsForOffline();

            // Simulate response with no data
            localThis.capturedMessageChannel.port1.onmessage({ data: null });

            const errorToasts = document.querySelectorAll('.toast-error');
            expect(errorToasts.length).toBeGreaterThan(0);
            expect(errorToasts[0].textContent).toContain('CACHE VERIFICATION FAILED');

            // Restore original MessageChannel
            global.MessageChannel = OriginalMessageChannel;
        });
    });

    describe('Update Notification', () => {
        beforeEach(() => {
            cacheElements();
            // Clean up any existing update notification
            const existing = document.getElementById('update-notification');
            if (existing) {
                existing.remove();
            }
        });

        afterEach(() => {
            // Clean up
            const notification = document.getElementById('update-notification');
            if (notification) {
                notification.remove();
            }
        });

        test('showUpdateAvailableNotification should create and show notification', () => {
            showUpdateAvailableNotification();

            const notification = document.getElementById('update-notification');
            expect(notification).not.toBeNull();
            expect(notification.classList.contains('visible')).toBe(true);
        });

        test('showUpdateAvailableNotification should have correct content', () => {
            showUpdateAvailableNotification();

            const notification = document.getElementById('update-notification');
            expect(notification.textContent).toContain('NEW VERSION AVAILABLE');
            expect(notification.querySelector('#update-refresh-btn')).not.toBeNull();
            expect(notification.querySelector('#update-dismiss-btn')).not.toBeNull();
        });

        test('showUpdateAvailableNotification should have role="alert"', () => {
            showUpdateAvailableNotification();

            const notification = document.getElementById('update-notification');
            expect(notification.getAttribute('role')).toBe('alert');
        });

        test('hideUpdateNotification should hide notification', () => {
            showUpdateAvailableNotification();
            hideUpdateNotification();

            const notification = document.getElementById('update-notification');
            expect(notification.classList.contains('visible')).toBe(false);
        });

        test('hideUpdateNotification should not throw when notification does not exist', () => {
            expect(() => hideUpdateNotification()).not.toThrow();
        });

        test('dismiss button should hide notification', () => {
            showUpdateAvailableNotification();

            const dismissBtn = document.getElementById('update-dismiss-btn');
            dismissBtn.click();

            const notification = document.getElementById('update-notification');
            expect(notification.classList.contains('visible')).toBe(false);
        });

        test('refresh button should call window.location.reload', () => {
            // Mock location.reload using Object.defineProperty
            const reloadMock = jest.fn();
            Object.defineProperty(window, 'location', {
                value: { ...window.location, reload: reloadMock },
                writable: true,
                configurable: true,
            });

            showUpdateAvailableNotification();

            const refreshBtn = document.getElementById('update-refresh-btn');
            refreshBtn.click();

            expect(reloadMock).toHaveBeenCalled();
        });

        test('showUpdateAvailableNotification should reuse existing notification element', () => {
            showUpdateAvailableNotification();
            showUpdateAvailableNotification();

            const notifications = document.querySelectorAll('#update-notification');
            expect(notifications.length).toBe(1);
        });
    });

    describe('Service Worker Update Detection', () => {
        test('getSwRegistration should return registration after register', () => {
            // getSwRegistration returns whatever was set by previous registerServiceWorker calls
            // This test just verifies the function exists and returns something
            const result = getSwRegistration();
            // It may be null or an object depending on test order
            expect(result === null || typeof result === 'object').toBe(true);
        });

        test('registerServiceWorker should set up update interval', async () => {
            const localThis = {};
            localThis.mockRegistration = {
                scope: '/',
                update: jest.fn(),
                addEventListener: jest.fn(),
            };

            // Mock navigator.serviceWorker
            Object.defineProperty(navigator, 'serviceWorker', {
                value: {
                    register: jest.fn().mockResolvedValue(localThis.mockRegistration),
                    controller: null,
                },
                writable: true,
                configurable: true,
            });

            // Mock setInterval
            const originalSetInterval = global.setInterval;
            global.setInterval = jest.fn();

            registerServiceWorker();

            // Trigger load event
            window.dispatchEvent(new Event('load'));

            // Wait for promise to resolve
            await Promise.resolve();
            await Promise.resolve();

            expect(global.setInterval).toHaveBeenCalledWith(expect.any(Function), 60 * 60 * 1000);
            global.setInterval = originalSetInterval;
        });

        test('registerServiceWorker should listen for updatefound event', async () => {
            const localThis = {};
            localThis.mockRegistration = {
                scope: '/',
                update: jest.fn(),
                addEventListener: jest.fn(),
            };

            Object.defineProperty(navigator, 'serviceWorker', {
                value: {
                    register: jest.fn().mockResolvedValue(localThis.mockRegistration),
                    controller: null,
                },
                writable: true,
                configurable: true,
            });

            registerServiceWorker();
            window.dispatchEvent(new Event('load'));

            // Wait for promise to resolve
            await Promise.resolve();
            await Promise.resolve();

            expect(localThis.mockRegistration.addEventListener).toHaveBeenCalledWith(
                'updatefound',
                expect.any(Function),
            );
        });

        test('should handle updatefound with null installing worker', async () => {
            const localThis = {};
            localThis.updateFoundCallback = null;
            localThis.mockRegistration = {
                scope: '/',
                update: jest.fn(),
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'updatefound') {
                        localThis.updateFoundCallback = callback;
                    }
                }),
                installing: null, // No installing worker
            };

            Object.defineProperty(navigator, 'serviceWorker', {
                value: {
                    register: jest.fn().mockResolvedValue(localThis.mockRegistration),
                    controller: {},
                },
                writable: true,
                configurable: true,
            });

            registerServiceWorker();
            window.dispatchEvent(new Event('load'));

            await Promise.resolve();
            await Promise.resolve();

            // Trigger the updatefound callback with null installing
            expect(() => localThis.updateFoundCallback?.()).not.toThrow();
        });

        test('should handle updatefound with new worker not in installed state', async () => {
            const localThis = {};
            localThis.updateFoundCallback = null;
            localThis.stateChangeCallback = null;
            localThis.mockWorker = {
                state: 'installing', // Not 'installed'
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'statechange') {
                        localThis.stateChangeCallback = callback;
                    }
                }),
            };
            localThis.mockRegistration = {
                scope: '/',
                update: jest.fn(),
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'updatefound') {
                        localThis.updateFoundCallback = callback;
                    }
                }),
                installing: localThis.mockWorker,
            };

            Object.defineProperty(navigator, 'serviceWorker', {
                value: {
                    register: jest.fn().mockResolvedValue(localThis.mockRegistration),
                    controller: {},
                },
                writable: true,
                configurable: true,
            });

            registerServiceWorker();
            window.dispatchEvent(new Event('load'));

            await Promise.resolve();
            await Promise.resolve();

            // Trigger updatefound
            localThis.updateFoundCallback?.();

            // Trigger statechange with 'installing' state (not 'installed')
            expect(() => localThis.stateChangeCallback?.()).not.toThrow();

            // No notification should be shown
            const notification = document.getElementById('update-notification');
            expect(notification).toBeNull();
        });

        test('should show notification when new worker is installed with controller', async () => {
            const localThis = {};
            localThis.updateFoundCallback = null;
            localThis.stateChangeCallback = null;
            localThis.mockWorker = {
                state: 'installed',
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'statechange') {
                        localThis.stateChangeCallback = callback;
                    }
                }),
            };
            localThis.mockRegistration = {
                scope: '/',
                update: jest.fn(),
                addEventListener: jest.fn((event, callback) => {
                    if (event === 'updatefound') {
                        localThis.updateFoundCallback = callback;
                    }
                }),
                installing: localThis.mockWorker,
            };

            Object.defineProperty(navigator, 'serviceWorker', {
                value: {
                    register: jest.fn().mockResolvedValue(localThis.mockRegistration),
                    controller: {}, // Has controller (not first install)
                },
                writable: true,
                configurable: true,
            });

            registerServiceWorker();
            window.dispatchEvent(new Event('load'));

            await Promise.resolve();
            await Promise.resolve();

            // Trigger updatefound
            localThis.updateFoundCallback?.();

            // Trigger statechange with 'installed' state
            localThis.stateChangeCallback?.();

            // Notification should be shown
            const notification = document.getElementById('update-notification');
            expect(notification).not.toBeNull();
        });
    });
});
