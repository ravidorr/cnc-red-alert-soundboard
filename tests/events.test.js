/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, renderCategories, renderFavoritesSection } from '../js/ui.js';
import { renderNavigation } from '../js/navigation.js';
import { setupAudioPlayer, playSound } from '../js/audio.js';
import { setupEventListeners } from '../js/events.js';

describe('Event Handlers', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
        localStorage.clear();
    });

    describe('setupEventListeners', () => {
        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
            renderNavigation();
        });

        test('should not throw when setting up', () => {
            expect(() => {
                setupEventListeners();
            }).not.toThrow();
        });

        test('clicking sound button should play sound', () => {
            setupEventListeners();

            const btn = document.querySelector('.sound-btn');
            btn.click();

            expect(state.audioPlayer.src).toContain('sounds/');
        });

        test('Escape key should stop all sounds', () => {
            setupEventListeners();

            const btn = document.querySelector('.sound-btn');
            playSound(btn);

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

            expect(state.audioPlayer.paused).toBe(true);
        });

        test('clicking favorite button should toggle favorite', () => {
            setupEventListeners();

            const favBtn = document.querySelector('.favorite-btn');
            favBtn.click();

            expect(state.favorites.length).toBe(1);
        });

        test('clicking category header should toggle collapse', () => {
            setupEventListeners();

            const header = document.querySelector('.category-header');
            const section = header.closest('.category-section');
            expect(section.classList.contains('collapsed')).toBe(false);

            header.click();

            expect(section.classList.contains('collapsed')).toBe(true);
        });

        test('pressing Enter on category header should toggle collapse', () => {
            setupEventListeners();

            const header = document.querySelector('.category-header');
            const section = header.closest('.category-section');

            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            header.dispatchEvent(event);

            expect(section.classList.contains('collapsed')).toBe(true);
        });

        test('pressing Space on category header should toggle collapse', () => {
            setupEventListeners();

            const header = document.querySelector('.category-header');
            const section = header.closest('.category-section');

            const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
            header.dispatchEvent(event);

            expect(section.classList.contains('collapsed')).toBe(true);
        });

        test('clicking nav item should scroll to category', () => {
            setupEventListeners();
            window.scrollTo = jest.fn();

            const navItem = document.querySelector('.nav-item');
            navItem.click();

            expect(window.scrollTo).toHaveBeenCalled();
        });

        test('search input should filter sounds', () => {
            setupEventListeners();

            const searchInput = document.getElementById('search-input');
            searchInput.value = 'tanya';
            searchInput.dispatchEvent(new Event('input'));

            expect(state.searchTerm).toBe('tanya');
        });

        test('clear search button should clear search', () => {
            setupEventListeners();

            state.searchTerm = 'test';
            elements.searchInput.value = 'test';

            elements.clearSearch.click();

            expect(state.searchTerm).toBe('');
            expect(elements.searchInput.value).toBe('');
        });

        test('stop all button should stop sounds', () => {
            setupEventListeners();

            const btn = document.querySelector('.sound-btn');
            playSound(btn);

            elements.stopAllBtn.click();

            expect(state.audioPlayer.paused).toBe(true);
        });

        test('mobile menu toggle should toggle menu', () => {
            setupEventListeners();

            elements.mobileMenuToggle.click();

            expect(elements.sidebar.classList.contains('open')).toBe(true);
        });

        test('mobile overlay click should close menu', () => {
            setupEventListeners();
            elements.sidebar.classList.add('open');

            elements.mobileMenuOverlay.click();

            expect(elements.sidebar.classList.contains('open')).toBe(false);
        });

        test('clear search button in empty state should clear search', () => {
            setupEventListeners();

            state.searchTerm = 'test';
            elements.searchInput.value = 'test';

            elements.btnClearSearch.click();

            expect(state.searchTerm).toBe('');
            expect(elements.searchInput.value).toBe('');
        });

        test('random sound button should play a sound', () => {
            setupEventListeners();

            elements.randomSoundBtn.click();

            expect(state.audioPlayer.src).toContain('sounds/');
        });

        test('Ctrl+F should focus search input', () => {
            setupEventListeners();
            const focusSpy = jest.spyOn(elements.searchInput, 'focus');
            const selectSpy = jest.spyOn(elements.searchInput, 'select');

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', ctrlKey: true }));

            expect(focusSpy).toHaveBeenCalled();
            expect(selectSpy).toHaveBeenCalled();
        });

        test('Cmd+F should focus search input on Mac', () => {
            setupEventListeners();
            const focusSpy = jest.spyOn(elements.searchInput, 'focus');

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'f', metaKey: true }));

            expect(focusSpy).toHaveBeenCalled();
        });

        test('should handle null mobileMenuToggle', () => {
            elements.mobileMenuToggle = null;
            expect(() => setupEventListeners()).not.toThrow();
        });

        test('should handle null mobileMenuOverlay', () => {
            elements.mobileMenuOverlay = null;
            expect(() => setupEventListeners()).not.toThrow();
        });

        test('should handle null btnClearSearch', () => {
            elements.btnClearSearch = null;
            expect(() => setupEventListeners()).not.toThrow();
        });

        test('should handle null randomSoundBtn', () => {
            elements.randomSoundBtn = null;
            expect(() => setupEventListeners()).not.toThrow();
        });

        test('keyboard handler should not toggle when not on header', () => {
            setupEventListeners();

            const section = document.querySelector('.category-section');
            const wasCollapsed = section.classList.contains('collapsed');

            // Dispatch keydown on non-header element
            const soundBtn = document.querySelector('.sound-btn');
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            soundBtn.dispatchEvent(event);

            // Should not have changed
            expect(section.classList.contains('collapsed')).toBe(wasCollapsed);
        });

        test('keyboard handler should ignore non-Enter/Space keys on header', () => {
            setupEventListeners();

            const header = document.querySelector('.category-header');
            const section = header.closest('.category-section');
            const wasCollapsed = section.classList.contains('collapsed');

            // Dispatch keydown with a different key
            const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            header.dispatchEvent(event);

            // Should not have changed
            expect(section.classList.contains('collapsed')).toBe(wasCollapsed);
        });

        test('nav click should not scroll for non-nav-item', () => {
            setupEventListeners();
            window.scrollTo = jest.fn();

            // Click on nav area but not on a nav-item
            const navHeader = elements.categoryNav.querySelector('.nav-header');
            navHeader.click();

            expect(window.scrollTo).not.toHaveBeenCalled();
        });

        test('content area click should not play sound for non-button', () => {
            setupEventListeners();

            const initialSrc = state.audioPlayer.src;

            // Click on content area but not on a button
            const section = document.querySelector('.category-section');
            section.click();

            expect(state.audioPlayer.src).toBe(initialSrc);
        });
    });
});
