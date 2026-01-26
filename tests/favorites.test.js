/**
 * @jest-environment jsdom
 */
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, renderCategories } from '../js/ui.js';
import { renderNavigation } from '../js/navigation.js';
import {
    loadFavorites,
    saveFavorites,
    toggleFavorite,
    updateFavoriteButtons,
    setupFavoritesDragAndDrop,
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
    });
});
