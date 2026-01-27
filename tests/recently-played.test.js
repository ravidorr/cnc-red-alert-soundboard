/**
 * @jest-environment jsdom
 */
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, renderCategories, renderFavoritesSection } from '../js/ui.js';
import {
    loadRecentlyPlayed,
    saveRecentlyPlayed,
    addToRecentlyPlayed,
    renderRecentlyPlayedSection,
} from '../js/recently-played.js';

describe('Recently Played Functions', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
        localStorage.clear();
    });

    describe('loadRecentlyPlayed', () => {
        test('should load recently played from localStorage', () => {
            localStorage.setItem('cnc-recently-played', '["test.wav"]');
            loadRecentlyPlayed();

            expect(state.recentlyPlayed).toContain('test.wav');
        });

        test('should handle empty localStorage', () => {
            loadRecentlyPlayed();
            expect(state.recentlyPlayed).toEqual([]);
        });
    });

    describe('saveRecentlyPlayed', () => {
        test('should save recently played to localStorage', () => {
            state.recentlyPlayed = ['saved.wav'];
            saveRecentlyPlayed();

            const stored = JSON.parse(localStorage.getItem('cnc-recently-played'));
            expect(stored).toEqual(['saved.wav']);
        });
    });

    describe('addToRecentlyPlayed', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should add sound to recently played', () => {
            state.recentlyPlayed = [];
            addToRecentlyPlayed('test.wav');

            expect(state.recentlyPlayed).toContain('test.wav');
        });

        test('should move existing sound to front', () => {
            state.recentlyPlayed = ['old.wav', 'test.wav'];
            addToRecentlyPlayed('test.wav');

            expect(state.recentlyPlayed[0]).toBe('test.wav');
        });

        test('should save to localStorage', () => {
            state.recentlyPlayed = [];
            addToRecentlyPlayed('test.wav');

            const stored = JSON.parse(localStorage.getItem('cnc-recently-played'));
            expect(stored).toContain('test.wav');
        });

        test('should update navigation count', () => {
            state.recentlyPlayed = [];
            addToRecentlyPlayed('allies_1_achnoledged.wav');

            const navItem = document.querySelector('.nav-item[data-category="recent"] .nav-item-count');
            expect(navItem.textContent).toBe('1');
        });
    });

    describe('renderRecentlyPlayedSection', () => {
        beforeEach(() => {
            cacheElements();
            renderCategories();
        });

        test('should render empty state when no recently played', () => {
            state.recentlyPlayed = [];
            renderRecentlyPlayedSection();

            const section = document.getElementById('category-recent');
            expect(section).not.toBeNull();
            // Should show empty state message
            const emptyState = section.querySelector('.favorites-empty');
            expect(emptyState).not.toBeNull();
            expect(emptyState.textContent).toContain('NO RECENT ACTIVITY');
        });

        test('should render recently played section', () => {
            state.recentlyPlayed = ['allies_1_achnoledged.wav'];
            renderRecentlyPlayedSection();

            const section = document.getElementById('category-recent');
            expect(section).not.toBeNull();
        });

        test('should replace existing section', () => {
            state.recentlyPlayed = ['allies_1_achnoledged.wav'];
            renderRecentlyPlayedSection();
            renderRecentlyPlayedSection();

            const sections = document.querySelectorAll('#category-recent');
            expect(sections.length).toBe(1);
        });

        test('should filter out invalid sound files', () => {
            state.recentlyPlayed = ['allies_1_achnoledged.wav', 'nonexistent.wav'];
            renderRecentlyPlayedSection();

            const section = document.getElementById('category-recent');
            const buttons = section.querySelectorAll('.sound-btn');
            expect(buttons.length).toBe(1);
        });

        test('should render empty state if all sounds are invalid', () => {
            state.recentlyPlayed = ['nonexistent1.wav', 'nonexistent2.wav'];
            renderRecentlyPlayedSection();

            const section = document.getElementById('category-recent');
            expect(section).not.toBeNull();
            // Should show empty state since no valid sounds
            const emptyState = section.querySelector('.favorites-empty');
            expect(emptyState).not.toBeNull();
        });

        test('should insert after favorites section if exists', () => {
            state.favorites = ['allies_1_affirmative.wav'];
            renderFavoritesSection();

            state.recentlyPlayed = ['allies_1_achnoledged.wav'];
            renderRecentlyPlayedSection();

            const favSection = document.getElementById('category-favorites');
            const recentSection = document.getElementById('category-recent');
            expect(favSection.nextElementSibling).toBe(recentSection);
        });

        test('should insert at beginning if no favorites section', () => {
            state.favorites = [];
            state.recentlyPlayed = ['allies_1_achnoledged.wav'];
            renderRecentlyPlayedSection();

            const contentArea = document.getElementById('content-area');
            const recentSection = document.getElementById('category-recent');
            expect(contentArea.firstElementChild).toBe(recentSection);
        });

        test('should mark favorite sounds', () => {
            state.favorites = ['allies_1_achnoledged.wav'];
            state.recentlyPlayed = ['allies_1_achnoledged.wav'];
            renderRecentlyPlayedSection();

            const section = document.getElementById('category-recent');
            const favBtn = section.querySelector('.favorite-btn.is-favorite');
            expect(favBtn).not.toBeNull();
        });
    });
});
