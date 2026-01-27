/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, renderCategories, renderFavoritesSection } from '../js/ui.js';
import { renderNavigation } from '../js/navigation.js';
import { setupAudioPlayer, playSound } from '../js/audio.js';
import { setupEventListeners, handleShortcutsModalKeydown, showShortcutsModal, hideShortcutsModal, showContactModal, hideContactModal } from '../js/events.js';

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

        test('pressing Enter on favorite button should toggle favorite', () => {
            setupEventListeners();

            const favBtn = document.querySelector('.favorite-btn');
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            favBtn.dispatchEvent(event);

            expect(state.favorites.length).toBe(1);
        });

        test('pressing Space on favorite button should toggle favorite', () => {
            setupEventListeners();

            const favBtn = document.querySelector('.favorite-btn');
            const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
            favBtn.dispatchEvent(event);

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

        test('pressing Enter on share button should call shareSound', async () => {
            setupEventListeners();

            // Mock clipboard API
            const writeTextMock = jest.fn().mockResolvedValue();
            Object.assign(navigator, {
                clipboard: { writeText: writeTextMock },
            });

            const shareBtn = document.querySelector('.share-btn');
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            shareBtn.dispatchEvent(event);

            // Wait for async operation
            await new Promise(resolve => setTimeout(resolve, 50));

            expect(writeTextMock).toHaveBeenCalled();
        });

        test('pressing Space on share button should call shareSound', async () => {
            setupEventListeners();

            // Mock clipboard API
            const writeTextMock = jest.fn().mockResolvedValue();
            Object.assign(navigator, {
                clipboard: { writeText: writeTextMock },
            });

            const shareBtn = document.querySelector('.share-btn');
            const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
            shareBtn.dispatchEvent(event);

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

        test('Escape key should stop all sounds when no modal open', () => {
            setupEventListeners();

            // Play a sound first
            const btn = document.querySelector('.sound-btn');
            if (btn) {
                playSound(btn);
                expect(state.currentlyPlaying).not.toBeNull();

                // Press Escape
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

                // Sound should be stopped
                expect(state.audioPlayer.paused).toBe(true);
            }
        });

        test('Number keys 1-9 should play corresponding favorite when not in input', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderFavoritesSection();
            setupEventListeners();

            // Press '1' key
            document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));

            // Sound should be playing
            expect(state.audioPlayer.src).toContain('sounds/');
        });

        test('Number keys should not trigger when in input field', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderFavoritesSection();
            setupEventListeners();

            elements.searchInput.focus();
            const initialSrc = state.audioPlayer.src;

            // Press '1' key while in input
            document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));

            // Sound should NOT have changed
            expect(state.audioPlayer.src).toBe(initialSrc);
        });

        test('Number keys should not play if favorite index out of bounds', () => {
            state.favorites = ['allies_1_achnoledged.wav']; // Only one favorite
            renderFavoritesSection();
            setupEventListeners();

            const initialSrc = state.audioPlayer.src;

            // Press '5' key (no favorite at index 4)
            document.dispatchEvent(new KeyboardEvent('keydown', { key: '5' }));

            // Sound should NOT have changed
            expect(state.audioPlayer.src).toBe(initialSrc);
        });

        test('Number keys should not play if button not found for favorite', () => {
            state.favorites = ['nonexistent.wav'];
            renderFavoritesSection();
            setupEventListeners();

            // Remove all buttons
            document.querySelectorAll('.sound-btn').forEach(btn => btn.remove());

            // Press '1' key - should not throw
            expect(() => {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: '1' }));
            }).not.toThrow();
        });

        test('clear all favorites button should clear favorites', async () => {
            // Setup confirm modal in DOM for testing
            const confirmModal = document.createElement('div');
            confirmModal.id = 'confirm-modal';
            confirmModal.className = 'confirm-modal';
            confirmModal.innerHTML = `
                <h2 id="confirm-title"></h2>
                <p id="confirm-message"></p>
                <button id="confirm-execute">EXECUTE</button>
                <button id="confirm-abort">ABORT</button>
            `;
            document.body.appendChild(confirmModal);

            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();
            setupEventListeners();

            const clearBtn = document.getElementById('btn-clear-favorites');
            if (clearBtn) {
                clearBtn.click();

                // Wait for modal to appear, then click execute
                await new Promise(resolve => setTimeout(resolve, 50));
                const executeBtn = document.getElementById('confirm-execute');
                executeBtn.click();

                // Wait for async operation to complete
                await new Promise(resolve => setTimeout(resolve, 50));
                expect(state.favorites.length).toBe(0);
            }

            // Cleanup
            confirmModal.remove();
        });

        test('pressing Enter on clear favorites button should trigger clear', async () => {
            // Setup confirm modal in DOM for testing
            const confirmModal = document.createElement('div');
            confirmModal.id = 'confirm-modal';
            confirmModal.className = 'confirm-modal';
            confirmModal.innerHTML = `
                <h2 id="confirm-title"></h2>
                <p id="confirm-message"></p>
                <button id="confirm-execute">EXECUTE</button>
                <button id="confirm-abort">ABORT</button>
            `;
            document.body.appendChild(confirmModal);

            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();
            setupEventListeners();

            const clearBtn = document.getElementById('btn-clear-favorites');
            if (clearBtn) {
                const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
                clearBtn.dispatchEvent(event);

                // Wait for modal to appear, then click execute
                await new Promise(resolve => setTimeout(resolve, 50));
                const executeBtn = document.getElementById('confirm-execute');
                executeBtn.click();

                // Wait for async operation to complete
                await new Promise(resolve => setTimeout(resolve, 50));
                expect(state.favorites.length).toBe(0);
            }

            // Cleanup
            confirmModal.remove();
        });

        test('show tips button should close shortcuts modal and show onboarding', () => {
            // Add shortcuts modal with show tips button
            const modal = document.createElement('div');
            modal.id = 'shortcuts-modal';
            modal.className = 'shortcuts-modal visible';
            const closeBtn = document.createElement('button');
            closeBtn.id = 'shortcuts-close';
            const showTipsBtn = document.createElement('button');
            showTipsBtn.id = 'show-tips-btn';
            modal.appendChild(closeBtn);
            modal.appendChild(showTipsBtn);
            document.body.appendChild(modal);

            setupEventListeners();

            // Click show tips button
            showTipsBtn.click();

            // Shortcuts modal should be closed
            expect(modal.classList.contains('visible')).toBe(false);

            // Onboarding tooltip should be created
            const onboardingTooltip = document.getElementById('onboarding-tooltip');
            expect(onboardingTooltip).not.toBeNull();

            // Cleanup
            modal.remove();
            if (onboardingTooltip) onboardingTooltip.remove();
        });
    });

    describe('Back to Top Button', () => {
        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
            renderNavigation();
        });

        test('back to top button should exist', () => {
            setupEventListeners();
            const backToTop = document.getElementById('back-to-top');
            expect(backToTop).not.toBeNull();
        });

        test('clicking back to top should scroll to top', () => {
            setupEventListeners();
            window.scrollTo = jest.fn();

            const backToTop = document.getElementById('back-to-top');
            backToTop.click();

            expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
        });

        test('scroll event should show back to top when scrollY > 500', () => {
            setupEventListeners();
            const backToTop = document.getElementById('back-to-top');

            // Simulate scroll position > 500
            Object.defineProperty(window, 'scrollY', { value: 600, writable: true });
            window.dispatchEvent(new Event('scroll'));

            expect(backToTop.classList.contains('visible')).toBe(true);
        });

        test('scroll event should hide back to top when scrollY <= 500', () => {
            setupEventListeners();
            const backToTop = document.getElementById('back-to-top');

            // First show it
            Object.defineProperty(window, 'scrollY', { value: 600, writable: true });
            window.dispatchEvent(new Event('scroll'));
            expect(backToTop.classList.contains('visible')).toBe(true);

            // Then scroll back up
            Object.defineProperty(window, 'scrollY', { value: 100, writable: true });
            window.dispatchEvent(new Event('scroll'));

            expect(backToTop.classList.contains('visible')).toBe(false);
        });
    });

    describe('Branch Coverage - Shortcuts Modal Focus Trap', () => {
        const localThis = {};

        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
            renderNavigation();
            
            // Add shortcuts modal
            localThis.modal = document.createElement('div');
            localThis.modal.id = 'shortcuts-modal';
            localThis.modal.className = 'shortcuts-modal';
            document.body.appendChild(localThis.modal);
        });

        test('handleShortcutsModalKeydown should return early when modal not visible', () => {
            // Modal exists but is not visible
            expect(localThis.modal.classList.contains('visible')).toBe(false);

            // Call directly - should not throw
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            expect(() => handleShortcutsModalKeydown(tabEvent)).not.toThrow();
        });

        test('handleShortcutsModalKeydown should return early when modal does not exist', () => {
            // Remove the modal
            localThis.modal.remove();

            // Call directly - should not throw
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            expect(() => handleShortcutsModalKeydown(tabEvent)).not.toThrow();
        });

        test('focus trap should handle modal with no focusable elements', () => {
            // Make modal visible but empty (no focusable elements)
            localThis.modal.classList.add('visible');
            localThis.modal.innerHTML = '<p>No buttons here</p>';

            // Call directly with Tab key - should not throw and should return early
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            expect(() => handleShortcutsModalKeydown(tabEvent)).not.toThrow();

            // Modal should still be visible
            expect(localThis.modal.classList.contains('visible')).toBe(true);
        });

        test('Escape in modal should close it via handleShortcutsModalKeydown', () => {
            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.id = 'shortcuts-close';
            localThis.modal.appendChild(closeBtn);
            
            // Make modal visible
            localThis.modal.classList.add('visible');

            // Call directly with Escape key
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
            handleShortcutsModalKeydown(escEvent);

            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('Tab at last element should cycle to first', () => {
            // Add focusable elements
            const btn1 = document.createElement('button');
            btn1.textContent = 'First';
            const btn2 = document.createElement('button');
            btn2.textContent = 'Last';
            localThis.modal.appendChild(btn1);
            localThis.modal.appendChild(btn2);
            
            // Make modal visible
            localThis.modal.classList.add('visible');
            
            // Focus last element
            btn2.focus();

            // Call directly with Tab (no shift)
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true });
            handleShortcutsModalKeydown(tabEvent);

            // First element should be focused
            expect(document.activeElement).toBe(btn1);
        });

        test('Shift+Tab at first element should cycle to last', () => {
            // Add focusable elements
            const btn1 = document.createElement('button');
            btn1.textContent = 'First';
            const btn2 = document.createElement('button');
            btn2.textContent = 'Last';
            localThis.modal.appendChild(btn1);
            localThis.modal.appendChild(btn2);
            
            // Make modal visible
            localThis.modal.classList.add('visible');
            
            // Focus first element
            btn1.focus();

            // Call directly with Shift+Tab
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
            handleShortcutsModalKeydown(tabEvent);

            // Last element should be focused
            expect(document.activeElement).toBe(btn2);
        });

        test('Tab in middle element should not cycle', () => {
            // Add three focusable elements
            const btn1 = document.createElement('button');
            btn1.textContent = 'First';
            const btn2 = document.createElement('button');
            btn2.textContent = 'Middle';
            const btn3 = document.createElement('button');
            btn3.textContent = 'Last';
            localThis.modal.appendChild(btn1);
            localThis.modal.appendChild(btn2);
            localThis.modal.appendChild(btn3);
            
            // Make modal visible
            localThis.modal.classList.add('visible');
            
            // Focus middle element
            btn2.focus();

            // Call directly with Tab - should NOT cycle
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true });
            handleShortcutsModalKeydown(tabEvent);

            // Middle element should still be focused (no cycle occurred)
            expect(document.activeElement).toBe(btn2);
        });

        test('non-Tab/Escape key should not affect focus', () => {
            // Add focusable elements
            const btn1 = document.createElement('button');
            btn1.textContent = 'First';
            localThis.modal.appendChild(btn1);
            
            // Make modal visible
            localThis.modal.classList.add('visible');
            btn1.focus();

            // Call with a different key
            const otherEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            handleShortcutsModalKeydown(otherEvent);

            // Should still be focused
            expect(document.activeElement).toBe(btn1);
        });
    });

    describe('Branch Coverage - showShortcutsModal and hideShortcutsModal', () => {
        const localThis = {};

        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
            renderNavigation();
            
            // Add shortcuts modal
            localThis.modal = document.createElement('div');
            localThis.modal.id = 'shortcuts-modal';
            localThis.modal.className = 'shortcuts-modal';
            document.body.appendChild(localThis.modal);
        });

        test('showShortcutsModal should do nothing if modal does not exist', () => {
            localThis.modal.remove();

            expect(() => showShortcutsModal()).not.toThrow();
        });

        test('showShortcutsModal should focus close button if it exists', (done) => {
            const closeBtn = document.createElement('button');
            closeBtn.id = 'shortcuts-close';
            localThis.modal.appendChild(closeBtn);

            showShortcutsModal();

            // Wait for setTimeout
            setTimeout(() => {
                expect(document.activeElement).toBe(closeBtn);
                done();
            }, 100);
        });

        test('showShortcutsModal should handle missing close button', (done) => {
            // Modal exists but no close button
            showShortcutsModal();

            // Wait for setTimeout
            setTimeout(() => {
                expect(localThis.modal.classList.contains('visible')).toBe(true);
                done();
            }, 100);
        });

        test('hideShortcutsModal should do nothing if modal does not exist', () => {
            localThis.modal.remove();

            expect(() => hideShortcutsModal()).not.toThrow();
        });

        test('hideShortcutsModal should return focus to trigger element', () => {
            const triggerBtn = document.createElement('button');
            triggerBtn.id = 'trigger';
            document.body.appendChild(triggerBtn);
            triggerBtn.focus();

            const closeBtn = document.createElement('button');
            closeBtn.id = 'shortcuts-close';
            localThis.modal.appendChild(closeBtn);

            showShortcutsModal();
            hideShortcutsModal();

            expect(document.activeElement).toBe(triggerBtn);
        });

        test('hideShortcutsModal should handle null trigger', () => {
            // Show and immediately hide without a proper trigger
            showShortcutsModal();
            
            // Manually clear the trigger
            hideShortcutsModal();

            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });
    });

    describe('Contact Modal Integration', () => {
        const localThis = {};

        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
            renderNavigation();

            // Add contact modal
            localThis.modal = document.createElement('div');
            localThis.modal.id = 'contact-modal';
            localThis.modal.className = 'contact-modal';
            localThis.modal.innerHTML = `
                <div class="contact-modal-content">
                    <a href="mailto:test@test.com" class="contact-item">Email</a>
                    <button id="contact-close" class="btn-dismiss">CLOSE</button>
                </div>
            `;
            document.body.appendChild(localThis.modal);

            // Add contact button
            localThis.contactBtn = document.createElement('button');
            localThis.contactBtn.id = 'contact-btn';
            document.body.appendChild(localThis.contactBtn);
        });

        test('contact button should show contact modal', () => {
            setupEventListeners();

            localThis.contactBtn.click();

            expect(localThis.modal.classList.contains('visible')).toBe(true);
        });

        test('contact close button should hide modal', () => {
            setupEventListeners();
            localThis.modal.classList.add('visible');

            const closeBtn = document.getElementById('contact-close');
            closeBtn.click();

            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('clicking contact modal backdrop should close it', () => {
            setupEventListeners();
            localThis.modal.classList.add('visible');

            // Click on the modal backdrop (not content)
            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: localThis.modal });
            localThis.modal.dispatchEvent(clickEvent);

            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('Escape should close contact modal if open', () => {
            setupEventListeners();
            showContactModal();

            expect(localThis.modal.classList.contains('visible')).toBe(true);

            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('Escape should close contact modal before shortcuts modal', () => {
            // Add shortcuts modal too
            const shortcutsModal = document.createElement('div');
            shortcutsModal.id = 'shortcuts-modal';
            shortcutsModal.className = 'shortcuts-modal';
            document.body.appendChild(shortcutsModal);

            setupEventListeners();

            // Open contact modal
            showContactModal();
            expect(localThis.modal.classList.contains('visible')).toBe(true);

            // Press Escape should close contact modal, not shortcuts
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));

            expect(localThis.modal.classList.contains('visible')).toBe(false);
            expect(shortcutsModal.classList.contains('visible')).toBe(false);
        });

        test('should handle missing contact button gracefully', () => {
            localThis.contactBtn.remove();

            expect(() => setupEventListeners()).not.toThrow();
        });

        test('should handle missing contact close button gracefully', () => {
            document.getElementById('contact-close').remove();

            expect(() => setupEventListeners()).not.toThrow();
        });

        test('should handle missing contact modal gracefully', () => {
            localThis.modal.remove();

            expect(() => setupEventListeners()).not.toThrow();
        });
    });
});
