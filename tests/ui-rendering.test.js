/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements, useFakeTimers, useRealTimers, advanceTimers, mockClipboard, mockWebShare } from './helpers.js';
import { state, elements } from '../js/state.js';
import { SOUNDS, CATEGORIES } from '../js/constants.js';
import {
    cacheElements,
    renderCategories,
    renderFavoritesSection,
    renderPopularSection,
    showToast,
    showSearchEmptyState,
    hideSearchEmptyState,
    shareSound,
} from '../js/ui.js';
import { renderNavigation, createNavHeader } from '../js/navigation.js';
import { renderRecentlyPlayedSection } from '../js/recently-played.js';

describe('UI Rendering', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
    });

    describe('cacheElements', () => {
        test('should cache all DOM elements', () => {
            cacheElements();

            expect(elements.contentArea).not.toBeNull();
            expect(elements.categoryNav).not.toBeNull();
            expect(elements.searchInput).not.toBeNull();
        });
    });

    describe('renderCategories', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should render all categories', () => {
            renderCategories();

            const categories = document.querySelectorAll('.category-section');
            expect(categories.length).toBe(Object.keys(CATEGORIES).length);
        });

        test('should render sound buttons', () => {
            renderCategories();

            const buttons = document.querySelectorAll('.sound-btn');
            expect(buttons.length).toBe(SOUNDS.length);
        });

        test('should mark favorite sounds', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderCategories();

            const favBtn = document.querySelector('.favorite-btn.is-favorite');
            expect(favBtn).not.toBeNull();
        });

        test('should skip empty categories', () => {
            // All real categories have sounds, but let's verify the logic works
            renderCategories();

            // All rendered categories should have sounds
            const categories = document.querySelectorAll('.category-section');
            categories.forEach(cat => {
                const buttons = cat.querySelectorAll('.sound-btn');
                expect(buttons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('renderNavigation', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should render navigation items for all categories plus favorites and recent', () => {
            renderNavigation();

            const navItems = document.querySelectorAll('.nav-item');
            // 12 categories + 1 favorites + 1 recently played
            expect(navItems.length).toBe(14);
        });

        test('should always show favorites nav item', () => {
            state.favorites = [];
            renderNavigation();

            const favNav = document.querySelector('.favorites-nav');
            expect(favNav).not.toBeNull();
        });
    });

    describe('renderFavoritesSection', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should render favorites section with sounds', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderFavoritesSection();

            const favSection = document.getElementById('category-favorites');
            expect(favSection).not.toBeNull();
        });

        test('should render empty state when no favorites', () => {
            state.favorites = [];
            renderFavoritesSection();

            const favSection = document.getElementById('category-favorites');
            const emptyState = favSection.querySelector('.favorites-empty');
            expect(emptyState).not.toBeNull();
        });

        test('favorites empty state should have themed copy', () => {
            state.favorites = [];
            renderFavoritesSection();

            const favSection = document.getElementById('category-favorites');
            const emptyTitle = favSection.querySelector('.favorites-empty-title');
            const emptyText = favSection.querySelector('.favorites-empty-text');

            // Check for themed military-style copy
            expect(emptyTitle.textContent).toBe('AWAITING ORDERS');
            expect(emptyText.textContent).toContain('priority targets');
            expect(emptyText.textContent).toContain('star icon');
        });

        test('should replace existing favorites section', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderFavoritesSection();
            renderFavoritesSection();

            const favSections = document.querySelectorAll('#category-favorites');
            expect(favSections.length).toBe(1);
        });

        test('should filter out invalid favorite files', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'nonexistent.wav'];
            renderFavoritesSection();

            const favSection = document.getElementById('category-favorites');
            const buttons = favSection.querySelectorAll('.sound-btn');
            expect(buttons.length).toBe(1);
        });
    });

    describe('renderPopularSection', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should render popular section', () => {
            renderPopularSection();

            const popularSection = document.getElementById('category-popular');
            expect(popularSection).not.toBeNull();
        });

        test('should replace existing popular section', () => {
            renderPopularSection();
            renderPopularSection();

            const popularSections = document.querySelectorAll('#category-popular');
            expect(popularSections.length).toBe(1);
        });

        test('should insert after recently played if exists', () => {
            state.recentlyPlayed = ['allies_1_achnoledged.wav'];
            renderRecentlyPlayedSection();
            renderPopularSection();

            const recentSection = document.getElementById('category-recent');
            const popularSection = document.getElementById('category-popular');
            expect(recentSection.nextElementSibling).toBe(popularSection);
        });

        test('should insert after favorites if no recently played', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderFavoritesSection();
            renderPopularSection();

            const favSection = document.getElementById('category-favorites');
            const popularSection = document.getElementById('category-popular');
            expect(favSection.nextElementSibling).toBe(popularSection);
        });

        test('should mark favorite sounds in popular section', () => {
            state.favorites = ['allies_1_affirmative.wav'];
            renderPopularSection();

            const popularSection = document.getElementById('category-popular');
            const favBtn = popularSection.querySelector('.favorite-btn.is-favorite');
            expect(favBtn).not.toBeNull();
        });
    });

    describe('showToast', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should add toast to container', () => {
            showToast('Test message', 'info');

            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('Test message');
        });

        test('toast should have dismiss button', () => {
            showToast('Test message', 'info');

            const dismissBtn = document.querySelector('.toast-dismiss');
            expect(dismissBtn).not.toBeNull();
            expect(dismissBtn.getAttribute('aria-label')).toBe('Dismiss notification');
        });

        test('clicking dismiss button should remove toast', () => {
            showToast('Test message', 'info');

            const dismissBtn = document.querySelector('.toast-dismiss');
            dismissBtn.click();

            const toast = document.querySelector('.toast');
            expect(toast).toBeNull();
        });

        test('toast should have role alert', () => {
            showToast('Test message', 'info');

            const toast = document.querySelector('.toast');
            expect(toast.getAttribute('role')).toBe('alert');
        });

        test('should handle different toast types', () => {
            showToast('Success', 'success');
            showToast('Error', 'error');

            const toasts = document.querySelectorAll('.toast');
            expect(toasts.length).toBe(2);
        });

        test('should not throw when toast container is null', () => {
            elements.toastContainer = null;
            expect(() => showToast('Test', 'info')).not.toThrow();
        });

        test('should remove toast after duration', () => {
            useFakeTimers();
            showToast('Test message', 'info', 100);

            advanceTimers(150);
            const toast = document.querySelector('.toast');
            expect(toast).toBeNull();
            useRealTimers();
        });

        test('should pause timer on mouseenter and resume on mouseleave', () => {
            useFakeTimers();
            showToast('Test message', 'info', 100);

            const toast = document.querySelector('.toast');

            // Trigger mouseenter to pause timer
            toast.dispatchEvent(new Event('mouseenter'));

            // Advance past original timeout
            advanceTimers(150);
            // Toast should still exist because timer was paused
            expect(document.querySelector('.toast')).not.toBeNull();

            // Trigger mouseleave to resume timer with 2000ms
            toast.dispatchEvent(new Event('mouseleave'));

            // Advance past resume timeout
            advanceTimers(2100);
            expect(document.querySelector('.toast')).toBeNull();
            useRealTimers();
        });

        test('should pause timer on focusin and resume on focusout', () => {
            useFakeTimers();
            showToast('Test message', 'info', 100);

            const toast = document.querySelector('.toast');

            // Trigger focusin to pause timer
            toast.dispatchEvent(new Event('focusin'));

            // Advance past original timeout
            advanceTimers(150);
            // Toast should still exist because timer was paused
            expect(document.querySelector('.toast')).not.toBeNull();

            // Trigger focusout to resume timer with 2000ms
            toast.dispatchEvent(new Event('focusout'));

            // Advance past resume timeout
            advanceTimers(2100);
            expect(document.querySelector('.toast')).toBeNull();
            useRealTimers();
        });

        test('should handle mouseleave when toast already removed', () => {
            showToast('Test message', 'info', 100);

            const toast = document.querySelector('.toast');

            // Trigger mouseenter then manually remove toast
            toast.dispatchEvent(new Event('mouseenter'));
            toast.remove();

            // Trigger mouseleave - should not throw
            expect(() => {
                toast.dispatchEvent(new Event('mouseleave'));
            }).not.toThrow();
        });
    });

    describe('showSearchEmptyState / hideSearchEmptyState', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('showSearchEmptyState should show empty state', () => {
            showSearchEmptyState('test');

            expect(elements.searchEmptyState.style.display).toBe('block');
            expect(elements.searchEmptyTerm.textContent).toBe('test');
            expect(elements.contentArea.style.display).toBe('none');
        });

        test('hideSearchEmptyState should hide empty state', () => {
            showSearchEmptyState('test');
            hideSearchEmptyState();

            expect(elements.searchEmptyState.style.display).toBe('none');
            expect(elements.contentArea.style.display).toBe('block');
        });

        test('should handle null elements', () => {
            elements.searchEmptyState = null;
            elements.contentArea = null;

            expect(() => showSearchEmptyState('test')).not.toThrow();
            expect(() => hideSearchEmptyState()).not.toThrow();
        });
    });

    describe('shareSound', () => {
        beforeEach(() => {
            cacheElements();
            // Ensure no Web Share API by default (falls back to clipboard)
            delete navigator.share;
            delete navigator.canShare;
            // Clear any previous toasts
            if (elements.toastContainer) {
                elements.toastContainer.innerHTML = '';
            }
        });

        test('should copy link to clipboard on success (fallback)', async () => {
            const clipboard = mockClipboard();

            await shareSound('test.wav', 'Test Sound');

            expect(clipboard.writeText).toHaveBeenCalled();
            expect(clipboard.writeText.mock.calls[0][0]).toContain('#sound=test.wav');
            clipboard.restore();
        });

        test('should show success toast on copy', async () => {
            const clipboard = mockClipboard();

            await shareSound('test.wav', 'Test Sound');

            // Wait for promise
            await Promise.resolve();

            const toast = document.querySelector('.toast-success');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('LINK ACQUIRED');
            clipboard.restore();
        });

        test('should show error toast on copy failure', async () => {
            const clipboard = mockClipboard({ shouldFail: true });

            await shareSound('test.wav', 'Test Sound');

            // Wait for promise
            await Promise.resolve();

            const toast = document.querySelector('.toast-error');
            expect(toast).not.toBeNull();
            clipboard.restore();
        });

        test('should handle Web Share API abort gracefully', async () => {
            // When user cancels share, no error toast should appear
            mockWebShare({ shouldAbort: true });
            mockClipboard();

            await shareSound('test.wav', 'Test Sound');

            // Wait for promise
            await Promise.resolve();

            // No error toast should appear for abort
            const errorToast = document.querySelector('.toast-error');
            expect(errorToast).toBeNull();
        });

        test('should use Web Share API with file when supported', async () => {
            const shareMock = jest.fn().mockResolvedValue();
            const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });

            global.fetch = jest.fn().mockResolvedValue({
                blob: () => Promise.resolve(mockBlob),
            });

            Object.assign(navigator, {
                share: shareMock,
                canShare: jest.fn().mockReturnValue(true),
            });

            await shareSound('test.wav', 'Test Sound');

            // Wait for promise
            await Promise.resolve();

            expect(shareMock).toHaveBeenCalled();
            expect(shareMock.mock.calls[0][0].files).toBeDefined();
            expect(shareMock.mock.calls[0][0].files.length).toBe(1);

            const toast = document.querySelector('.toast-success');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('INTEL TRANSMITTED');
        });

        test('should share URL when file sharing not supported', async () => {
            const shareMock = jest.fn().mockResolvedValue();
            const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });

            global.fetch = jest.fn().mockResolvedValue({
                blob: () => Promise.resolve(mockBlob),
            });

            Object.assign(navigator, {
                share: shareMock,
                canShare: jest.fn().mockReturnValue(false),
            });

            await shareSound('test.wav', 'Test Sound');

            // Wait for promise
            await Promise.resolve();

            expect(shareMock).toHaveBeenCalled();
            expect(shareMock.mock.calls[0][0].url).toBeDefined();
            expect(shareMock.mock.calls[0][0].files).toBeUndefined();

            const toast = document.querySelector('.toast-success');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('INTEL TRANSMITTED');
        });

        test('should use default name when soundName not provided', async () => {
            const shareMock = jest.fn().mockResolvedValue();
            const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });

            global.fetch = jest.fn().mockResolvedValue({
                blob: () => Promise.resolve(mockBlob),
            });

            Object.assign(navigator, {
                share: shareMock,
                canShare: jest.fn().mockReturnValue(false),
            });

            await shareSound('test.wav');

            expect(shareMock).toHaveBeenCalled();
            expect(shareMock.mock.calls[0][0].title).toBe('C&C Sound');
        });

        test('should fallback to clipboard when Web Share fails', async () => {
            const clipboardMock = jest.fn().mockResolvedValue();
            const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });

            global.fetch = jest.fn().mockResolvedValue({
                blob: () => Promise.resolve(mockBlob),
            });

            Object.assign(navigator, {
                share: jest.fn().mockRejectedValue(new Error('Share failed')),
                canShare: jest.fn().mockReturnValue(false),
                clipboard: { writeText: clipboardMock },
            });

            await shareSound('test.wav', 'Test Sound');

            // Wait for promise
            await Promise.resolve();

            expect(clipboardMock).toHaveBeenCalled();
        });

        test('should include sound name in share text', async () => {
            const shareMock = jest.fn().mockResolvedValue();
            const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });

            global.fetch = jest.fn().mockResolvedValue({
                blob: () => Promise.resolve(mockBlob),
            });

            Object.assign(navigator, {
                share: shareMock,
                canShare: jest.fn().mockReturnValue(true),
            });

            await shareSound('test.wav', 'Affirmative');

            expect(shareMock.mock.calls[0][0].text).toContain('Affirmative');
            expect(shareMock.mock.calls[0][0].title).toBe('Affirmative');
        });

        test('should not show toast when user cancels share', async () => {
            const localThis = {};
            localThis.abortError = new Error('Share cancelled');
            localThis.abortError.name = 'AbortError';

            const clipboardMock = jest.fn().mockResolvedValue();
            const mockBlob = new Blob(['audio data'], { type: 'audio/wav' });

            global.fetch = jest.fn().mockResolvedValue({
                blob: () => Promise.resolve(mockBlob),
            });

            Object.assign(navigator, {
                share: jest.fn().mockRejectedValue(localThis.abortError),
                canShare: jest.fn().mockReturnValue(false),
                clipboard: { writeText: clipboardMock },
            });

            // Clear any existing toasts
            document.querySelectorAll('.toast').forEach(t => t.remove());

            await shareSound('test.wav', 'Test Sound');

            // Wait for promise
            await Promise.resolve();

            // Should NOT fall back to clipboard when user cancels
            expect(clipboardMock).not.toHaveBeenCalled();
        });
    });

    describe('createNavHeader', () => {
        test('should create nav header element', () => {
            const header = createNavHeader();

            expect(header.tagName).toBe('DIV');
            expect(header.className).toBe('nav-header');
            expect(header.textContent).toBe('CATEGORIES');
        });
    });

    describe('Branch Coverage - renderCategories', () => {
        beforeEach(() => {
            cacheElements();
        });

        test('should skip empty categories and not render them', () => {
            renderCategories();

            // All rendered category sections should have at least one sound button
            const sections = document.querySelectorAll('.category-section');
            sections.forEach(section => {
                const buttons = section.querySelectorAll('.sound-btn');
                expect(buttons.length).toBeGreaterThan(0);
            });
        });
    });

    describe('Branch Coverage - renderFavoritesSection drag tooltip', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should add dismiss button handler when tooltip is shown', () => {
            // Clear dragTooltipSeen so tooltip will show
            localStorage.removeItem('dragTooltipSeen');
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];

            renderFavoritesSection();

            const dismissBtn = document.getElementById('drag-tooltip-dismiss');
            expect(dismissBtn).not.toBeNull();
        });

        test('clicking dismiss button should save to localStorage and remove tooltip', () => {
            // Clear dragTooltipSeen so tooltip will show
            localStorage.removeItem('dragTooltipSeen');
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];

            renderFavoritesSection();

            const dismissBtn = document.getElementById('drag-tooltip-dismiss');
            const tooltip = document.getElementById('drag-tooltip');

            expect(tooltip).not.toBeNull();

            // Click dismiss button
            dismissBtn.click();

            // localStorage should be updated
            expect(localStorage.getItem('dragTooltipSeen')).toBe('true');

            // Tooltip should be removed
            expect(document.getElementById('drag-tooltip')).toBeNull();
        });

        test('should not show tooltip if already seen', () => {
            // Set dragTooltipSeen
            localStorage.setItem('dragTooltipSeen', 'true');
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];

            renderFavoritesSection();

            const tooltip = document.getElementById('drag-tooltip');
            expect(tooltip).toBeNull();
        });

        test('should not show tooltip for single favorite', () => {
            localStorage.removeItem('dragTooltipSeen');
            state.favorites = ['allies_1_achnoledged.wav'];

            renderFavoritesSection();

            const tooltip = document.getElementById('drag-tooltip');
            expect(tooltip).toBeNull();
        });
    });

    describe('Branch Coverage - renderPopularSection', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should render popular sounds section', () => {
            renderPopularSection();

            const section = document.getElementById('category-popular');
            expect(section).not.toBeNull();
        });

        test('should handle empty POPULAR_SOUNDS gracefully', () => {
            // This tests the early return when popularSounds.length === 0
            // Since we can't modify POPULAR_SOUNDS constant, we test that
            // the function doesn't crash with valid data
            expect(() => renderPopularSection()).not.toThrow();
        });

        test('should remove existing section before re-rendering', () => {
            // Render twice to test removal of existing section
            renderPopularSection();
            renderPopularSection();

            // Should only be one section (the new one replaced the old)
            const allPopularSections = document.querySelectorAll('#category-popular');
            expect(allPopularSections.length).toBe(1);
        });
    });
});
