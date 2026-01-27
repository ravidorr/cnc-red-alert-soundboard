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

        test('clicking favorite button should toggle favorite', () => {
            setupEventListeners();

            const favBtn = document.querySelector('.favorite-btn');
            favBtn.click();

            expect(state.favorites.length).toBe(1);
        });

        test('clicking share button should call shareSound', async () => {
            setupEventListeners();

            // Mock clipboard API
            const writeTextMock = jest.fn().mockResolvedValue();
            Object.assign(navigator, {
                clipboard: { writeText: writeTextMock },
            });

            const shareBtn = document.querySelector('.share-btn');
            shareBtn.click();

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(writeTextMock).toHaveBeenCalled();
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

        test('pressing ArrowUp in favorites should move item up', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();
            setupEventListeners();

            const wrappers = document.querySelectorAll('.favorites-section .sound-btn-wrapper');
            const secondWrapper = wrappers[1];
            const soundBtn = secondWrapper.querySelector('.sound-btn');

            const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true });
            soundBtn.dispatchEvent(event);

            // Second item should now be first
            expect(state.favorites[0]).toBe('allies_1_affirmative.wav');
        });

        test('pressing ArrowDown in favorites should move item down', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();
            setupEventListeners();

            const wrappers = document.querySelectorAll('.favorites-section .sound-btn-wrapper');
            const firstWrapper = wrappers[0];
            const soundBtn = firstWrapper.querySelector('.sound-btn');

            const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
            soundBtn.dispatchEvent(event);

            // First item should now be second
            expect(state.favorites[1]).toBe('allies_1_achnoledged.wav');
        });

        test('clicking nav item should scroll to category', () => {
            setupEventListeners();
            window.scrollTo = jest.fn();

            // Click on a category nav item (not favorites or recent) that has a corresponding section
            const navItem = document.querySelector('.nav-item:not(.favorites-nav):not(.recent-nav)');
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

        test('arrow keys should reorder favorites in favorites section', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();
            setupEventListeners();

            const wrapper = document.querySelector('.favorites-section .sound-btn-wrapper');
            const soundBtn = wrapper.querySelector('.sound-btn');

            // Simulate ArrowDown on the button
            const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
            soundBtn.dispatchEvent(event);

            // First favorite should have moved down
            expect(state.favorites[0]).toBe('allies_1_affirmative.wav');
        });

        test('arrow keys should not affect non-favorites', () => {
            setupEventListeners();

            const originalBtn = document.querySelector('.sound-btn');
            const initialFavorites = [...state.favorites];

            const event = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true });
            originalBtn.dispatchEvent(event);

            expect(state.favorites).toEqual(initialFavorites);
        });

        test('? key should show shortcuts modal', () => {
            // Add shortcuts modal
            const modal = document.createElement('div');
            modal.id = 'shortcuts-modal';
            modal.className = 'shortcuts-modal';
            const closeBtn = document.createElement('button');
            closeBtn.id = 'shortcuts-close';
            modal.appendChild(closeBtn);
            document.body.appendChild(modal);

            // Add help button
            const helpBtn = document.createElement('button');
            helpBtn.id = 'help-btn';
            document.body.appendChild(helpBtn);

            setupEventListeners();

            document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));

            expect(modal.classList.contains('visible')).toBe(true);
        });

        test('? key should not show modal when in input', () => {
            // Add shortcuts modal
            const modal = document.createElement('div');
            modal.id = 'shortcuts-modal';
            modal.className = 'shortcuts-modal';
            document.body.appendChild(modal);

            setupEventListeners();

            elements.searchInput.focus();
            document.dispatchEvent(new KeyboardEvent('keydown', { key: '?' }));

            expect(modal.classList.contains('visible')).toBe(false);
        });

        test('Escape should close shortcuts modal if open', () => {
            // Add shortcuts modal
            const modal = document.createElement('div');
            modal.id = 'shortcuts-modal';
            modal.className = 'shortcuts-modal visible';
            document.body.appendChild(modal);

            setupEventListeners();

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

            expect(modal.classList.contains('visible')).toBe(false);
        });

        test('help button should show shortcuts modal', () => {
            // Add shortcuts modal
            const modal = document.createElement('div');
            modal.id = 'shortcuts-modal';
            modal.className = 'shortcuts-modal';
            const closeBtn = document.createElement('button');
            closeBtn.id = 'shortcuts-close';
            modal.appendChild(closeBtn);
            document.body.appendChild(modal);

            // Add help button
            const helpBtn = document.createElement('button');
            helpBtn.id = 'help-btn';
            document.body.appendChild(helpBtn);

            setupEventListeners();

            helpBtn.click();

            expect(modal.classList.contains('visible')).toBe(true);
        });

        test('shortcuts close button should hide modal', () => {
            // Add shortcuts modal
            const modal = document.createElement('div');
            modal.id = 'shortcuts-modal';
            modal.className = 'shortcuts-modal visible';
            const closeBtn = document.createElement('button');
            closeBtn.id = 'shortcuts-close';
            modal.appendChild(closeBtn);
            document.body.appendChild(modal);

            setupEventListeners();

            closeBtn.click();

            expect(modal.classList.contains('visible')).toBe(false);
        });

        test('clicking shortcuts modal backdrop should close it', () => {
            // Add shortcuts modal
            const modal = document.createElement('div');
            modal.id = 'shortcuts-modal';
            modal.className = 'shortcuts-modal visible';
            document.body.appendChild(modal);

            setupEventListeners();

            modal.click();

            expect(modal.classList.contains('visible')).toBe(false);
        });

        test('clear filter button should clear search', () => {
            // Add clear filter button
            const clearFilterBtn = document.createElement('button');
            clearFilterBtn.id = 'btn-clear-filter';
            document.body.appendChild(clearFilterBtn);

            state.searchTerm = 'test';
            elements.searchInput.value = 'test';

            setupEventListeners();

            clearFilterBtn.click();

            expect(state.searchTerm).toBe('');
            expect(elements.searchInput.value).toBe('');
        });
    });
});
