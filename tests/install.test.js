/**
 * @jest-environment jsdom
 */
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements } from '../js/ui.js';
import {
    showInstallPrompt,
    hideInstallPrompt,
    showInstallButton,
    hideInstallButton,
    triggerInstall,
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
    });

    describe('triggerInstall', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should not throw when no deferred prompt', async () => {
            state.deferredInstallPrompt = null;

            await expect(triggerInstall()).resolves.not.toThrow();
        });
    });

    describe('registerServiceWorker', () => {
        test('should not throw', () => {
            expect(() => {
                registerServiceWorker();
            }).not.toThrow();
        });
    });
});
