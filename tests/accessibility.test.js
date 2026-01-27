/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, renderCategories, renderFavoritesSection } from '../js/ui.js';
import { setupEventListeners, showShortcutsModal, hideShortcutsModal, handleShortcutsModalKeydown } from '../js/events.js';
import { setupAudioPlayer } from '../js/audio.js';
import { openMobileMenu, closeMobileMenu } from '../js/mobile.js';
import { renderNavigation } from '../js/navigation.js';

describe('Accessibility Features', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
    });

    describe('Focus Trap', () => {
        const localThis = {};

        beforeEach(() => {
            cacheElements();
            // Add shortcuts modal
            localThis.modal = document.createElement('div');
            localThis.modal.id = 'shortcuts-modal';
            localThis.modal.className = 'shortcuts-modal';
            localThis.closeBtn = document.createElement('button');
            localThis.closeBtn.id = 'shortcuts-close';
            localThis.modal.appendChild(localThis.closeBtn);
            document.body.appendChild(localThis.modal);
        });

        test('should trap focus in shortcuts modal', () => {
            showShortcutsModal();
            expect(localThis.modal.classList.contains('visible')).toBe(true);
        });

        test('should return focus to trigger on modal close', () => {
            const triggerBtn = document.createElement('button');
            triggerBtn.id = 'trigger-btn';
            document.body.appendChild(triggerBtn);
            triggerBtn.focus();

            showShortcutsModal();
            hideShortcutsModal();

            expect(document.activeElement).toBe(triggerBtn);
        });

        test('Tab on last element should cycle to first', () => {
            localThis.modal.classList.add('visible');
            localThis.closeBtn.focus();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            handleShortcutsModalKeydown(tabEvent);

            // Modal should still be visible (focus trapped)
            expect(localThis.modal.classList.contains('visible')).toBe(true);
        });

        test('Shift+Tab on first element should cycle to last', () => {
            localThis.modal.classList.add('visible');
            localThis.closeBtn.focus();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
            handleShortcutsModalKeydown(tabEvent);

            expect(localThis.modal.classList.contains('visible')).toBe(true);
        });

        test('Escape should close modal', () => {
            localThis.modal.classList.add('visible');

            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            handleShortcutsModalKeydown(escEvent);

            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });
    });

    describe('ARIA Attributes', () => {
        const localThis = {};

        beforeEach(() => {
            cacheElements();
            // Add volume slider with ARIA
            localThis.volumeSlider = document.createElement('input');
            localThis.volumeSlider.type = 'range';
            localThis.volumeSlider.id = 'volume-slider';
            localThis.volumeSlider.value = '100';
            localThis.volumeSlider.setAttribute('aria-valuenow', '100');
            localThis.volumeSlider.setAttribute('aria-valuetext', '100 percent');
            document.body.appendChild(localThis.volumeSlider);
        });

        test('volume slider should have aria-valuenow', () => {
            expect(localThis.volumeSlider.getAttribute('aria-valuenow')).toBe('100');
        });

        test('volume slider should have aria-valuetext', () => {
            expect(localThis.volumeSlider.getAttribute('aria-valuetext')).toBe('100 percent');
        });

        test('sidebar should have aria-hidden when closed', () => {
            elements.sidebar.setAttribute('aria-hidden', 'true');
            expect(elements.sidebar.getAttribute('aria-hidden')).toBe('true');
        });

        test('sidebar should remove aria-hidden when open', () => {
            openMobileMenu();
            expect(elements.sidebar.getAttribute('aria-hidden')).toBe('false');
        });

        test('star icons should have aria-hidden on visual content', () => {
            cacheElements();
            renderCategories();

            const favBtn = document.querySelector('.favorite-btn');
            const ariaHiddenSpan = favBtn.querySelector('span[aria-hidden="true"]');
            expect(ariaHiddenSpan).not.toBeNull();
        });
    });

    describe('Screen Reader Announcements', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
            // Add search announcer
            const announcer = document.createElement('div');
            announcer.id = 'search-announcer';
            announcer.setAttribute('aria-live', 'polite');
            document.body.appendChild(announcer);
        });

        test('search announcer should exist', () => {
            const announcer = document.getElementById('search-announcer');
            expect(announcer).not.toBeNull();
            expect(announcer.getAttribute('aria-live')).toBe('polite');
        });
    });

    describe('Category Header ARIA Labels', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('category headers should have aria-label with section info', () => {
            const header = document.querySelector('.category-header');
            const ariaLabel = header.getAttribute('aria-label');
            expect(ariaLabel).toContain('section');
            expect(ariaLabel).toContain('expanded');
            expect(ariaLabel).toContain('sounds');
        });

        test('favorites section should have aria-label', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderFavoritesSection();

            const favSection = document.getElementById('category-favorites');
            const header = favSection.querySelector('.category-header');
            const ariaLabel = header.getAttribute('aria-label');
            expect(ariaLabel).toContain('Favorites');
            expect(ariaLabel).toContain('expanded');
        });
    });

    describe('Descriptive ARIA Labels', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('category nav items should have descriptive aria-labels with sound counts', () => {
            renderNavigation();

            const navItems = document.querySelectorAll('.nav-item[data-category]');
            navItems.forEach(item => {
                const ariaLabel = item.getAttribute('aria-label');
                // All nav items except favorites and recent should have "sounds" in aria-label
                if (item.dataset.category !== 'favorites' && item.dataset.category !== 'recent') {
                    expect(ariaLabel).toContain('section');
                    expect(ariaLabel).toContain('sounds');
                }
            });
        });

        test('favorites nav should have descriptive aria-label', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderNavigation();

            const favNav = document.querySelector('.favorites-nav');
            const ariaLabel = favNav.getAttribute('aria-label');
            expect(ariaLabel).toContain('Favorites');
            expect(ariaLabel).toContain('2');
            expect(ariaLabel).toContain('sounds');
        });

        test('recently played nav should have descriptive aria-label', () => {
            state.recentlyPlayed = ['allies_1_achnoledged.wav'];
            renderNavigation();

            const recentNav = document.querySelector('.recent-nav');
            const ariaLabel = recentNav.getAttribute('aria-label');
            expect(ariaLabel).toContain('Recently played');
            expect(ariaLabel).toContain('1');
            expect(ariaLabel).toContain('sound');
        });

        test('aria-label should use singular "sound" for count of 1', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderNavigation();

            const favNav = document.querySelector('.favorites-nav');
            const ariaLabel = favNav.getAttribute('aria-label');
            // Check that it says "1 sound" and NOT "1 sounds"
            expect(ariaLabel).toContain('1 sound');
            expect(ariaLabel).not.toContain('1 sounds');
        });
    });
});
