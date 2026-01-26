/**
 * @jest-environment jsdom
 */

const CncSoundboard = require('../js/app.js');

describe('C&C Red Alert Soundboard', () => {
    let localThis;
    let mockStorage;

    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <div id="content-area"></div>
            <nav id="category-nav"><div class="nav-header">CATEGORIES</div></nav>
            <input id="search-input" />
            <button id="clear-search"></button>
            <button id="stop-all"></button>
            <span id="total-sounds">0</span>
            <span id="total-favorites">0</span>
            <span id="visible-sounds">0</span>
            <div id="now-playing"></div>
            <span id="now-playing-title"></span>
            <audio id="audio-player"></audio>
            <div id="install-prompt"></div>
            <button id="btn-install"></button>
            <button id="btn-dismiss"></button>
        `;

        // Create mock storage
        mockStorage = {
            store: {},
            getItem: jest.fn(key => mockStorage.store[key] || null),
            setItem: jest.fn((key, value) => {
                mockStorage.store[key] = value;
            }),
            clear: jest.fn(() => {
                mockStorage.store = {};
            }),
        };

        // Create localThis for testing with actual module functions
        localThis = {
            favorites: [],
            SOUNDS: CncSoundboard.SOUNDS,
            CATEGORIES: CncSoundboard.CATEGORIES,
        };
    });

    describe('Favorites', () => {
        describe('loadFavoritesFromStorage', () => {
            test('should load empty array when localStorage is empty', () => {
                const result = CncSoundboard.loadFavoritesFromStorage(mockStorage);
                expect(result).toEqual([]);
            });

            test('should load favorites from localStorage', () => {
                mockStorage.store['cnc-favorites'] = JSON.stringify(['test1.wav', 'test2.wav']);

                const result = CncSoundboard.loadFavoritesFromStorage(mockStorage);
                expect(result).toEqual(['test1.wav', 'test2.wav']);
            });

            test('should handle corrupted localStorage data', () => {
                mockStorage.store['cnc-favorites'] = 'invalid json';

                const result = CncSoundboard.loadFavoritesFromStorage(mockStorage);
                expect(result).toEqual([]);
            });
        });

        describe('saveFavoritesToStorage', () => {
            test('should save favorites to localStorage', () => {
                const favorites = ['test1.wav', 'test3.wav'];

                CncSoundboard.saveFavoritesToStorage(mockStorage, favorites);

                expect(mockStorage.setItem).toHaveBeenCalledWith(
                    'cnc-favorites',
                    JSON.stringify(favorites)
                );
            });
        });

        describe('toggleFavoriteInArray', () => {
            test('should add sound to favorites if not already favorite', () => {
                const favorites = [];

                const result = CncSoundboard.toggleFavoriteInArray(favorites, 'test1.wav');

                expect(result).toContain('test1.wav');
                expect(favorites).toEqual([]); // Original not mutated
            });

            test('should remove sound from favorites if already favorite', () => {
                const favorites = ['test1.wav', 'test2.wav'];

                const result = CncSoundboard.toggleFavoriteInArray(favorites, 'test1.wav');

                expect(result).not.toContain('test1.wav');
                expect(result).toContain('test2.wav');
            });

            test('should not mutate original array', () => {
                const favorites = ['test1.wav'];

                CncSoundboard.toggleFavoriteInArray(favorites, 'test1.wav');

                expect(favorites).toEqual(['test1.wav']);
            });
        });

        describe('isFavorite', () => {
            test('should return true for favorited sound', () => {
                const favorites = ['test1.wav', 'test2.wav'];

                expect(CncSoundboard.isFavorite(favorites, 'test1.wav')).toBe(true);
            });

            test('should return false for non-favorited sound', () => {
                const favorites = ['test1.wav'];

                expect(CncSoundboard.isFavorite(favorites, 'test2.wav')).toBe(false);
            });
        });

        describe('reorderFavoritesArray', () => {
            test('should move dragged item to target position', () => {
                const favorites = ['a.wav', 'b.wav', 'c.wav', 'd.wav'];

                const result = CncSoundboard.reorderFavoritesArray(favorites, 'c.wav', 'a.wav');

                expect(result).toEqual(['c.wav', 'a.wav', 'b.wav', 'd.wav']);
            });

            test('should not modify if dragged file not found', () => {
                const favorites = ['a.wav', 'b.wav'];

                const result = CncSoundboard.reorderFavoritesArray(favorites, 'x.wav', 'a.wav');

                expect(result).toEqual(['a.wav', 'b.wav']);
            });

            test('should not modify if target file not found', () => {
                const favorites = ['a.wav', 'b.wav'];

                const result = CncSoundboard.reorderFavoritesArray(favorites, 'a.wav', 'x.wav');

                expect(result).toEqual(['a.wav', 'b.wav']);
            });

            test('should not mutate original array', () => {
                const favorites = ['a.wav', 'b.wav', 'c.wav'];

                CncSoundboard.reorderFavoritesArray(favorites, 'c.wav', 'a.wav');

                expect(favorites).toEqual(['a.wav', 'b.wav', 'c.wav']);
            });
        });
    });

    describe('Search/Filter', () => {
        describe('filterSoundsArray', () => {
            const testSounds = [
                { file: 'test1.wav', name: 'Test Sound', category: 'allies' },
                { file: 'another.wav', name: 'Another', category: 'soviets' },
                { file: 'special.wav', name: 'Special Effect', category: 'misc' },
            ];

            test('should return all sounds when search is empty', () => {
                const result = CncSoundboard.filterSoundsArray(testSounds, '');

                expect(result).toEqual(testSounds);
            });

            test('should filter sounds by name', () => {
                const result = CncSoundboard.filterSoundsArray(testSounds, 'test');

                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Test Sound');
            });

            test('should filter sounds by filename', () => {
                const result = CncSoundboard.filterSoundsArray(testSounds, 'another');

                expect(result.length).toBe(1);
                expect(result[0].file).toBe('another.wav');
            });

            test('should be case insensitive', () => {
                const result = CncSoundboard.filterSoundsArray(testSounds, 'TEST');

                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Test Sound');
            });

            test('should match partial strings', () => {
                const result = CncSoundboard.filterSoundsArray(testSounds, 'spec');

                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Special Effect');
            });
        });
    });

    describe('Sound Categories', () => {
        test('should have correct category structure', () => {
            const categories = CncSoundboard.CATEGORIES;

            expect(categories.allies).toBeDefined();
            expect(categories.allies.name).toBe('ALLIED FORCES');
            expect(categories.allies.order).toBe(1);

            expect(categories.soviets).toBeDefined();
            expect(categories.soviets.name).toBe('SOVIET FORCES');
            expect(categories.soviets.order).toBe(2);
        });

        test('should have 12 categories', () => {
            const categoryCount = Object.keys(CncSoundboard.CATEGORIES).length;
            expect(categoryCount).toBe(12);
        });

        describe('getSoundsByCategory', () => {
            test('should filter sounds by category', () => {
                const alliedSounds = CncSoundboard.getSoundsByCategory(CncSoundboard.SOUNDS, 'allies');
                const sovietSounds = CncSoundboard.getSoundsByCategory(CncSoundboard.SOUNDS, 'soviets');

                expect(alliedSounds.length).toBeGreaterThan(0);
                expect(sovietSounds.length).toBeGreaterThan(0);
                expect(alliedSounds.every(s => s.category === 'allies')).toBe(true);
                expect(sovietSounds.every(s => s.category === 'soviets')).toBe(true);
            });

            test('should return empty array for unknown category', () => {
                const result = CncSoundboard.getSoundsByCategory(CncSoundboard.SOUNDS, 'nonexistent');

                expect(result).toEqual([]);
            });
        });

        describe('getSortedCategories', () => {
            test('should return categories sorted by order', () => {
                const sorted = CncSoundboard.getSortedCategories(CncSoundboard.CATEGORIES);

                expect(sorted[0][0]).toBe('allies');
                expect(sorted[0][1].order).toBe(1);
                expect(sorted[1][0]).toBe('soviets');
                expect(sorted[1][1].order).toBe(2);
            });

            test('should return array of [id, info] pairs', () => {
                const sorted = CncSoundboard.getSortedCategories(CncSoundboard.CATEGORIES);

                sorted.forEach(([id, info]) => {
                    expect(typeof id).toBe('string');
                    expect(info).toHaveProperty('name');
                    expect(info).toHaveProperty('order');
                });
            });
        });
    });

    describe('Sound Data', () => {
        test('should have sounds array', () => {
            expect(Array.isArray(CncSoundboard.SOUNDS)).toBe(true);
            expect(CncSoundboard.SOUNDS.length).toBeGreaterThan(0);
        });

        test('each sound should have required properties', () => {
            CncSoundboard.SOUNDS.forEach(sound => {
                expect(sound).toHaveProperty('file');
                expect(sound).toHaveProperty('name');
                expect(sound).toHaveProperty('category');
                expect(typeof sound.file).toBe('string');
                expect(typeof sound.name).toBe('string');
                expect(typeof sound.category).toBe('string');
            });
        });

        test('each sound category should exist in CATEGORIES', () => {
            const categoryIds = Object.keys(CncSoundboard.CATEGORIES);

            CncSoundboard.SOUNDS.forEach(sound => {
                expect(categoryIds).toContain(sound.category);
            });
        });
    });

    describe('URL Encoding', () => {
        test('should properly encode special characters in filenames', () => {
            const filename = 'allies #1 achnoledged.wav';
            const encoded = encodeURIComponent(filename);

            expect(encoded).toBe('allies%20%231%20achnoledged.wav');
            expect(decodeURIComponent(encoded)).toBe(filename);
        });

        test('should handle ampersand in filenames', () => {
            const filename = 'allies #2 ready & waiting.wav';
            const encoded = encodeURIComponent(filename);

            expect(encoded).toContain('%26');
            expect(decodeURIComponent(encoded)).toBe(filename);
        });

        test('should handle apostrophe in filenames', () => {
            const filename = "MEdic Movin' out.wav";
            const encoded = encodeURIComponent(filename);

            expect(decodeURIComponent(encoded)).toBe(filename);
        });
    });

    describe('Category Navigation', () => {
        describe('calculateScrollOffset', () => {
            test('should calculate correct offset', () => {
                const elementTop = 500;
                const scrollY = 100;
                const headerOffset = 90;

                const result = CncSoundboard.calculateScrollOffset(elementTop, scrollY, headerOffset);

                expect(result).toBe(510);
            });

            test('should handle zero scroll position', () => {
                const elementTop = 200;
                const scrollY = 0;
                const headerOffset = 90;

                const result = CncSoundboard.calculateScrollOffset(elementTop, scrollY, headerOffset);

                expect(result).toBe(110);
            });

            test('should handle element at top of page', () => {
                const elementTop = 0;
                const scrollY = 500;
                const headerOffset = 90;

                const result = CncSoundboard.calculateScrollOffset(elementTop, scrollY, headerOffset);

                expect(result).toBe(410);
            });
        });
    });

    describe('Install Prompt', () => {
        describe('shouldShowInstallPrompt', () => {
            test('should return true when never dismissed', () => {
                const result = CncSoundboard.shouldShowInstallPrompt(mockStorage, 7);

                expect(result).toBe(true);
            });

            test('should return false when dismissed recently', () => {
                // Dismissed 1 day ago
                const oneDayAgo = Date.now() - (1 * 24 * 60 * 60 * 1000);
                mockStorage.store['installPromptDismissed'] = oneDayAgo.toString();

                const result = CncSoundboard.shouldShowInstallPrompt(mockStorage, 7);

                expect(result).toBe(false);
            });

            test('should return true when dismissed more than 7 days ago', () => {
                // Dismissed 10 days ago
                const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000);
                mockStorage.store['installPromptDismissed'] = tenDaysAgo.toString();

                const result = CncSoundboard.shouldShowInstallPrompt(mockStorage, 7);

                expect(result).toBe(true);
            });

            test('should respect custom dismiss days', () => {
                // Dismissed 3 days ago
                const threeDaysAgo = Date.now() - (3 * 24 * 60 * 60 * 1000);
                mockStorage.store['installPromptDismissed'] = threeDaysAgo.toString();

                // Should not show with 7 day window
                expect(CncSoundboard.shouldShowInstallPrompt(mockStorage, 7)).toBe(false);

                // Should show with 2 day window
                expect(CncSoundboard.shouldShowInstallPrompt(mockStorage, 2)).toBe(true);
            });
        });
    });

    describe('State Management', () => {
        test('getState should return current state', () => {
            const state = CncSoundboard.getState();

            expect(state).toHaveProperty('favorites');
            expect(state).toHaveProperty('searchTerm');
            expect(Array.isArray(state.favorites)).toBe(true);
        });

        test('setState should update state', () => {
            const originalState = { ...CncSoundboard.getState() };

            CncSoundboard.setState({ searchTerm: 'test search' });

            expect(CncSoundboard.getState().searchTerm).toBe('test search');

            // Reset for other tests
            CncSoundboard.setState(originalState);
        });
    });
});
