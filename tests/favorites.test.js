/**
 * @jest-environment jsdom
 */
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, renderCategories, renderFavoritesSection } from '../js/ui.js';
import { renderNavigation } from '../js/navigation.js';
import {
    loadFavorites,
    saveFavorites,
    toggleFavorite,
    updateFavoriteButtons,
    reorderFavorites,
    setupFavoritesDragAndDrop,
    moveFavoriteUp,
    moveFavoriteDown,
    clearAllFavorites,
} from '../js/favorites.js';

describe('Favorites Functions', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
        localStorage.clear();
    });

    describe('loadFavorites', () => {
        test('should load favorites from localStorage to state', () => {
            localStorage.setItem('cnc-favorites', '["test.wav"]');
            loadFavorites();

            expect(state.favorites).toContain('test.wav');
        });

        test('should handle empty localStorage', () => {
            loadFavorites();
            expect(state.favorites).toEqual([]);
        });
    });

    describe('saveFavorites', () => {
        test('should save favorites from state to localStorage', () => {
            state.favorites = ['saved.wav'];
            saveFavorites();

            const stored = JSON.parse(localStorage.getItem('cnc-favorites'));
            expect(stored).toEqual(['saved.wav']);
        });
    });

    describe('toggleFavorite', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
            renderNavigation();
        });

        test('should add sound to favorites', () => {
            state.favorites = [];
            toggleFavorite('test.wav');

            expect(state.favorites).toContain('test.wav');
        });

        test('should remove sound from favorites', () => {
            state.favorites = ['test.wav'];
            toggleFavorite('test.wav');

            expect(state.favorites).not.toContain('test.wav');
        });

        test('should show toast when adding valid sound', () => {
            state.favorites = [];
            toggleFavorite('allies_1_achnoledged.wav');

            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('Target marked');
        });

        test('should show toast when removing valid sound', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            toggleFavorite('allies_1_achnoledged.wav');

            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('Target unmarked');
        });

        test('should update navigation count', () => {
            state.favorites = [];
            toggleFavorite('allies_1_achnoledged.wav');

            const navItem = document.querySelector('.nav-item[data-category="favorites"] .nav-item-count');
            expect(navItem.textContent).toBe('1');
        });
    });

    describe('updateFavoriteButtons', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should update button classes', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            updateFavoriteButtons();

            const favBtn = document.querySelector('.favorite-btn.is-favorite');
            expect(favBtn).not.toBeNull();
        });

        test('should remove is-favorite class from non-favorites', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            updateFavoriteButtons();

            state.favorites = [];
            updateFavoriteButtons();

            const favBtns = document.querySelectorAll('.favorite-btn.is-favorite');
            expect(favBtns.length).toBe(0);
        });

        test('should update button title and aria-label', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            updateFavoriteButtons();

            const favBtn = document.querySelector('.favorite-btn.is-favorite');
            expect(favBtn.title).toBe('Remove from favorites');
            expect(favBtn.getAttribute('aria-label')).toContain('Remove');
        });

        test('should handle unknown sound file gracefully', () => {
            // Add a button with an unknown file
            const wrapper = document.createElement('div');
            wrapper.className = 'sound-btn-wrapper';
            wrapper.innerHTML = `
                <button class="favorite-btn" data-file="${encodeURIComponent('unknown_file.wav')}"></button>
            `;
            document.getElementById('content-area').appendChild(wrapper);

            state.favorites = ['unknown_file.wav'];

            expect(() => updateFavoriteButtons()).not.toThrow();

            const favBtn = wrapper.querySelector('.favorite-btn');
            expect(favBtn.getAttribute('aria-label')).toContain('sound');
        });
    });

    describe('reorderFavorites', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should reorder favorites array', () => {
            state.favorites = ['a.wav', 'b.wav', 'c.wav'];
            renderFavoritesSection();

            reorderFavorites('c.wav', 'a.wav');

            expect(state.favorites[0]).toBe('c.wav');
        });

        test('should save reordered favorites to localStorage', () => {
            state.favorites = ['a.wav', 'b.wav', 'c.wav'];
            renderFavoritesSection();

            reorderFavorites('c.wav', 'a.wav');

            const stored = JSON.parse(localStorage.getItem('cnc-favorites'));
            expect(stored[0]).toBe('c.wav');
        });
    });

    describe('setupFavoritesDragAndDrop', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should not throw when no favorites section', () => {
            state.favorites = [];

            expect(() => {
                setupFavoritesDragAndDrop();
            }).not.toThrow();
        });

        test('should setup drag handlers on favorite wrappers', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            const wrappers = document.querySelectorAll('#category-favorites .sound-btn-wrapper');
            expect(wrappers.length).toBe(2);
        });

        test('should handle dragstart event', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            const wrapper = document.querySelector('#category-favorites .sound-btn-wrapper');
            const dragEvent = new Event('dragstart', { bubbles: true });
            dragEvent.dataTransfer = {
                effectAllowed: '',
                setData: () => {},
            };

            wrapper.dispatchEvent(dragEvent);
            expect(wrapper.classList.contains('dragging')).toBe(true);
        });

        test('should handle dragend event', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            const wrapper = document.querySelector('#category-favorites .sound-btn-wrapper');
            wrapper.classList.add('dragging');

            wrapper.dispatchEvent(new Event('dragend', { bubbles: true }));
            expect(wrapper.classList.contains('dragging')).toBe(false);
        });

        test('should handle dragover event', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            const wrapper = document.querySelector('#category-favorites .sound-btn-wrapper');
            const dragEvent = new Event('dragover', { bubbles: true, cancelable: true });
            dragEvent.dataTransfer = { dropEffect: '' };

            wrapper.dispatchEvent(dragEvent);
            expect(wrapper.classList.contains('drag-over')).toBe(true);
        });

        test('should handle dragleave event', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            const wrapper = document.querySelector('#category-favorites .sound-btn-wrapper');
            wrapper.classList.add('drag-over');

            wrapper.dispatchEvent(new Event('dragleave', { bubbles: true }));
            expect(wrapper.classList.contains('drag-over')).toBe(false);
        });

        test('should handle drop event', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            const wrappers = document.querySelectorAll('#category-favorites .sound-btn-wrapper');
            const wrapper1 = wrappers[0];
            const wrapper2 = wrappers[1];

            // Simulate dragstart on wrapper1
            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = { effectAllowed: '', setData: () => {} };
            wrapper1.dispatchEvent(dragStartEvent);

            // Simulate drop on wrapper2
            const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
            dropEvent.dataTransfer = { dropEffect: '' };
            wrapper2.dispatchEvent(dropEvent);

            // Favorites should be reordered
            expect(state.favorites[0]).toBe('allies_1_affirmative.wav');
        });

        test('should not add drag-over class when dragging over self', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            const wrapper = document.querySelector('#category-favorites .sound-btn-wrapper');

            // Simulate dragstart on the wrapper
            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = { effectAllowed: '', setData: () => {} };
            wrapper.dispatchEvent(dragStartEvent);

            // Simulate dragover on the same wrapper
            const dragOverEvent = new Event('dragover', { bubbles: true, cancelable: true });
            dragOverEvent.dataTransfer = { dropEffect: '' };
            wrapper.dispatchEvent(dragOverEvent);

            // Should NOT have drag-over class when dragging over self
            expect(wrapper.classList.contains('drag-over')).toBe(false);
        });

        test('should not reorder when dropping on self', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            const wrapper = document.querySelector('#category-favorites .sound-btn-wrapper');
            const originalOrder = [...state.favorites];

            // Simulate dragstart on the wrapper
            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = { effectAllowed: '', setData: () => {} };
            wrapper.dispatchEvent(dragStartEvent);

            // Simulate drop on the same wrapper
            const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
            dropEvent.dataTransfer = { dropEffect: '' };
            wrapper.dispatchEvent(dropEvent);

            // Order should not change
            expect(state.favorites).toEqual(originalOrder);
        });

        test('should not reorder when draggedElement is null on drop', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            const wrapper = document.querySelector('#category-favorites .sound-btn-wrapper');
            const originalOrder = [...state.favorites];

            // Simulate drop without dragstart (draggedElement is null)
            const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
            dropEvent.dataTransfer = { dropEffect: '' };
            wrapper.dispatchEvent(dropEvent);

            // Order should not change
            expect(state.favorites).toEqual(originalOrder);
        });
    });

    describe('Keyboard Reordering', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        describe('moveFavoriteUp', () => {
            test('should move favorite up in list', () => {
                state.favorites = ['a.wav', 'b.wav', 'c.wav'];
                renderFavoritesSection();

                moveFavoriteUp('b.wav');

                expect(state.favorites).toEqual(['b.wav', 'a.wav', 'c.wav']);
            });

            test('should not move first item up', () => {
                state.favorites = ['a.wav', 'b.wav', 'c.wav'];
                renderFavoritesSection();

                moveFavoriteUp('a.wav');

                expect(state.favorites).toEqual(['a.wav', 'b.wav', 'c.wav']);
            });

            test('should save to localStorage after move', () => {
                state.favorites = ['a.wav', 'b.wav'];
                renderFavoritesSection();

                moveFavoriteUp('b.wav');

                const stored = JSON.parse(localStorage.getItem('cnc-favorites'));
                expect(stored).toEqual(['b.wav', 'a.wav']);
            });

            test('should not move item not in favorites', () => {
                state.favorites = ['a.wav', 'b.wav'];
                renderFavoritesSection();

                moveFavoriteUp('nonexistent.wav');

                expect(state.favorites).toEqual(['a.wav', 'b.wav']);
            });
        });

        describe('moveFavoriteDown', () => {
            test('should move favorite down in list', () => {
                state.favorites = ['a.wav', 'b.wav', 'c.wav'];
                renderFavoritesSection();

                moveFavoriteDown('b.wav');

                expect(state.favorites).toEqual(['a.wav', 'c.wav', 'b.wav']);
            });

            test('should not move last item down', () => {
                state.favorites = ['a.wav', 'b.wav', 'c.wav'];
                renderFavoritesSection();

                moveFavoriteDown('c.wav');

                expect(state.favorites).toEqual(['a.wav', 'b.wav', 'c.wav']);
            });

            test('should save to localStorage after move', () => {
                state.favorites = ['a.wav', 'b.wav'];
                renderFavoritesSection();

                moveFavoriteDown('a.wav');

                const stored = JSON.parse(localStorage.getItem('cnc-favorites'));
                expect(stored).toEqual(['b.wav', 'a.wav']);
            });

            test('should not move item not in favorites', () => {
                state.favorites = ['a.wav', 'b.wav'];
                renderFavoritesSection();

                moveFavoriteDown('nonexistent.wav');

                expect(state.favorites).toEqual(['a.wav', 'b.wav']);
            });
        });
    });

    describe('clearAllFavorites', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
            renderNavigation();
        });

        test('should empty favorites array', () => {
            state.favorites = ['a.wav', 'b.wav', 'c.wav'];
            renderFavoritesSection();

            clearAllFavorites();

            expect(state.favorites).toEqual([]);
        });

        test('should save to localStorage', () => {
            state.favorites = ['a.wav', 'b.wav'];
            renderFavoritesSection();

            clearAllFavorites();

            const stored = JSON.parse(localStorage.getItem('cnc-favorites'));
            expect(stored).toEqual([]);
        });

        test('should re-render favorites section', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            renderFavoritesSection();

            clearAllFavorites();

            const favSection = document.getElementById('category-favorites');
            const emptyState = favSection.querySelector('.favorites-empty');
            expect(emptyState).not.toBeNull();
        });

        test('should show toast notification', () => {
            state.favorites = ['a.wav'];
            renderFavoritesSection();

            clearAllFavorites();

            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
        });

        test('should handle empty favorites gracefully', () => {
            state.favorites = [];
            renderFavoritesSection();

            expect(() => clearAllFavorites()).not.toThrow();
        });
    });

    describe('Branch Coverage - focusFavoriteItem', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
            renderNavigation();
        });

        test('moveFavoriteUp should handle when wrapper is not found', (done) => {
            state.favorites = ['nonexistent.wav', 'allies_1_achnoledged.wav'];
            renderFavoritesSection();

            // Try to move up a file that doesn't have a DOM element
            // This should not throw even if wrapper is not found
            expect(() => moveFavoriteUp('nonexistent.wav')).not.toThrow();

            // Wait for setTimeout in focusFavoriteItem
            setTimeout(() => {
                // No crash should occur
                done();
            }, 100);
        });

        test('moveFavoriteDown should handle when wrapper is not found', (done) => {
            state.favorites = ['allies_1_achnoledged.wav', 'nonexistent.wav'];
            renderFavoritesSection();

            // Try to move down a file that doesn't have a DOM element
            expect(() => moveFavoriteDown('allies_1_achnoledged.wav')).not.toThrow();

            setTimeout(() => {
                done();
            }, 100);
        });

        test('moveFavoriteUp should focus sound button after move', (done) => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            // Move the second item up
            moveFavoriteUp('allies_1_affirmative.wav');

            // Wait for focusFavoriteItem setTimeout
            setTimeout(() => {
                // The moved item should be focused
                const wrapper = document.querySelector(`.favorites-section .sound-btn-wrapper[data-file="${encodeURIComponent('allies_1_affirmative.wav')}"]`);
                if (wrapper) {
                    const soundBtn = wrapper.querySelector('.sound-btn');
                    expect(document.activeElement).toBe(soundBtn);
                }
                done();
            }, 100);
        });

        test('moveFavoriteDown should focus sound button after move', (done) => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            // Move the first item down
            moveFavoriteDown('allies_1_achnoledged.wav');

            // Wait for focusFavoriteItem setTimeout
            setTimeout(() => {
                // The moved item should be focused
                const wrapper = document.querySelector(`.favorites-section .sound-btn-wrapper[data-file="${encodeURIComponent('allies_1_achnoledged.wav')}"]`);
                if (wrapper) {
                    const soundBtn = wrapper.querySelector('.sound-btn');
                    expect(document.activeElement).toBe(soundBtn);
                }
                done();
            }, 100);
        });

        test('moveFavoriteUp should create reorder-announcer if it does not exist', () => {
            // Ensure announcer doesn't exist
            const existingAnnouncer = document.getElementById('reorder-announcer');
            if (existingAnnouncer) existingAnnouncer.remove();

            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            // Move up should create announcer
            moveFavoriteUp('allies_1_affirmative.wav');

            const announcer = document.getElementById('reorder-announcer');
            expect(announcer).not.toBeNull();
            expect(announcer.getAttribute('aria-live')).toBe('polite');
        });

        test('moveFavoriteUp should reuse existing reorder-announcer', () => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav', 'allies_1_reporting.wav'];
            renderFavoritesSection();

            // First move creates announcer
            moveFavoriteUp('allies_1_affirmative.wav');
            const announcer = document.getElementById('reorder-announcer');

            // Second move should reuse same announcer
            moveFavoriteUp('allies_1_reporting.wav');
            const sameAnnouncer = document.getElementById('reorder-announcer');

            expect(sameAnnouncer).toBe(announcer);
        });

        test('should handle wrapper found but soundBtn missing', (done) => {
            state.favorites = ['allies_1_achnoledged.wav', 'allies_1_affirmative.wav'];
            renderFavoritesSection();

            // Remove the sound button from one wrapper
            const wrapper = document.querySelector(`.favorites-section .sound-btn-wrapper[data-file="${encodeURIComponent('allies_1_affirmative.wav')}"]`);
            if (wrapper) {
                const soundBtn = wrapper.querySelector('.sound-btn');
                if (soundBtn) soundBtn.remove();
            }

            // Move should not throw even without sound button
            expect(() => moveFavoriteUp('allies_1_affirmative.wav')).not.toThrow();

            setTimeout(done, 100);
        });
    });
});
