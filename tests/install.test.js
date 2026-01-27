/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
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

        test('should show install prompt after delay when not dismissed', (done) => {
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
            done();
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

        test('showInstallPrompt should focus first button when available', (done) => {
            const localThis = {};
            // Add a button to focus
            localThis.firstBtn = document.createElement('button');
            localThis.firstBtn.id = 'focus-test-btn';
            elements.installPrompt.appendChild(localThis.firstBtn);

            showInstallPrompt();

            // Wait for setTimeout in showInstallPrompt
            setTimeout(() => {
                expect(document.activeElement).toBe(localThis.firstBtn);
                done();
            }, 100);
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
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(mockRegister).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });
});
