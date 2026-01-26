/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { createMockStorage } from './helpers.js';
import {
    loadFavoritesFromStorage,
    saveFavoritesToStorage,
    toggleFavoriteInArray,
    isFavorite,
    reorderFavoritesArray,
    filterSoundsArray,
    getSoundsByCategory,
    getSortedCategories,
    calculateScrollOffset,
    shouldShowInstallPrompt,
    loadRecentlyPlayedFromStorage,
    saveRecentlyPlayedToStorage,
    addToRecentlyPlayedArray,
} from '../js/utils.js';
import { SOUNDS, CATEGORIES } from '../js/constants.js';

describe('Pure Functions', () => {
    let mockStorage;

    beforeEach(() => {
        mockStorage = createMockStorage();
    });

    describe('loadFavoritesFromStorage', () => {
        test('should load empty array when localStorage is empty', () => {
            const result = loadFavoritesFromStorage(mockStorage);
            expect(result).toEqual([]);
        });

        test('should load favorites from localStorage', () => {
            mockStorage.store['cnc-favorites'] = '["sound1.wav","sound2.wav"]';
            const result = loadFavoritesFromStorage(mockStorage);
            expect(result).toEqual(['sound1.wav', 'sound2.wav']);
        });

        test('should handle corrupted localStorage data', () => {
            mockStorage.store['cnc-favorites'] = 'invalid json';
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            const result = loadFavoritesFromStorage(mockStorage);
            expect(result).toEqual([]);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('saveFavoritesToStorage', () => {
        test('should save favorites to localStorage', () => {
            const favorites = ['sound1.wav', 'sound2.wav'];
            saveFavoritesToStorage(mockStorage, favorites);
            expect(mockStorage.setItem).toHaveBeenCalledWith(
                'cnc-favorites',
                JSON.stringify(favorites),
            );
        });

        test('should handle localStorage errors gracefully', () => {
            const errorStorage = {
                setItem: jest.fn(() => {
                    throw new Error('Storage full');
                }),
            };
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            saveFavoritesToStorage(errorStorage, ['test.wav']);
            expect(consoleSpy).toHaveBeenCalled();
            consoleSpy.mockRestore();
        });
    });

    describe('toggleFavoriteInArray', () => {
        test('should add sound to favorites if not already favorite', () => {
            const result = toggleFavoriteInArray([], 'new.wav');
            expect(result).toContain('new.wav');
        });

        test('should remove sound from favorites if already favorite', () => {
            const result = toggleFavoriteInArray(['existing.wav'], 'existing.wav');
            expect(result).not.toContain('existing.wav');
        });

        test('should not mutate original array', () => {
            const original = ['sound.wav'];
            toggleFavoriteInArray(original, 'new.wav');
            expect(original).toEqual(['sound.wav']);
        });
    });

    describe('isFavorite', () => {
        test('should return true for favorited sound', () => {
            expect(isFavorite(['test.wav'], 'test.wav')).toBe(true);
        });

        test('should return false for non-favorited sound', () => {
            expect(isFavorite(['other.wav'], 'test.wav')).toBe(false);
        });
    });

    describe('reorderFavoritesArray', () => {
        test('should reorder favorites correctly', () => {
            const result = reorderFavoritesArray(
                ['a.wav', 'b.wav', 'c.wav'],
                'c.wav',
                'a.wav',
            );
            expect(result).toEqual(['c.wav', 'a.wav', 'b.wav']);
        });

        test('should return original array if dragged item not found', () => {
            const original = ['a.wav', 'b.wav'];
            const result = reorderFavoritesArray(original, 'x.wav', 'a.wav');
            expect(result).toEqual(original);
        });

        test('should return original array if target item not found', () => {
            const original = ['a.wav', 'b.wav'];
            const result = reorderFavoritesArray(original, 'a.wav', 'x.wav');
            expect(result).toEqual(original);
        });
    });

    describe('filterSoundsArray', () => {
        const testSounds = [
            { name: 'Acknowledged', file: 'ack.wav', category: 'allies' },
            { name: 'Affirmative', file: 'aff.wav', category: 'allies' },
            { name: 'Yes Sir', file: 'yes.wav', category: 'soviets' },
        ];

        test('should return all sounds when search is empty', () => {
            const result = filterSoundsArray(testSounds, '');
            expect(result).toEqual(testSounds);
        });

        test('should filter sounds by name', () => {
            const result = filterSoundsArray(testSounds, 'ack');
            expect(result.length).toBe(1);
            expect(result[0].name).toBe('Acknowledged');
        });

        test('should filter sounds by filename', () => {
            const result = filterSoundsArray(testSounds, 'yes');
            expect(result.length).toBe(1);
            expect(result[0].file).toBe('yes.wav');
        });

        test('should be case insensitive', () => {
            const result = filterSoundsArray(testSounds, 'ACK');
            expect(result.length).toBe(1);
        });
    });

    describe('getSoundsByCategory', () => {
        test('should return sounds filtered by category', () => {
            const result = getSoundsByCategory(SOUNDS, 'allies');
            expect(result.every(s => s.category === 'allies')).toBe(true);
        });

        test('should return empty array for non-existent category', () => {
            const result = getSoundsByCategory(SOUNDS, 'nonexistent');
            expect(result).toEqual([]);
        });
    });

    describe('getSortedCategories', () => {
        test('should return categories sorted by order', () => {
            const sorted = getSortedCategories(CATEGORIES);
            expect(sorted[0][0]).toBe('allies');
            expect(sorted[1][0]).toBe('soviets');
        });
    });

    describe('calculateScrollOffset', () => {
        test('should calculate correct scroll offset', () => {
            const result = calculateScrollOffset(100, 500, 80);
            expect(result).toBe(520);
        });

        test('should handle zero values', () => {
            const result = calculateScrollOffset(0, 0, 0);
            expect(result).toBe(0);
        });
    });

    describe('shouldShowInstallPrompt', () => {
        test('should return true when not dismissed', () => {
            const result = shouldShowInstallPrompt(mockStorage, 7);
            expect(result).toBe(true);
        });

        test('should return false when recently dismissed', () => {
            mockStorage.store.installPromptDismissed = Date.now().toString();
            const result = shouldShowInstallPrompt(mockStorage, 7);
            expect(result).toBe(false);
        });
    });

    describe('Recently Played Functions', () => {
        describe('loadRecentlyPlayedFromStorage', () => {
            test('should load empty array when localStorage is empty', () => {
                const result = loadRecentlyPlayedFromStorage(mockStorage);
                expect(result).toEqual([]);
            });

            test('should load recently played from localStorage', () => {
                mockStorage.store['cnc-recently-played'] = '["sound1.wav","sound2.wav"]';
                const result = loadRecentlyPlayedFromStorage(mockStorage);
                expect(result).toEqual(['sound1.wav', 'sound2.wav']);
            });

            test('should handle corrupted localStorage data', () => {
                mockStorage.store['cnc-recently-played'] = 'invalid json';
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
                const result = loadRecentlyPlayedFromStorage(mockStorage);
                expect(result).toEqual([]);
                expect(consoleSpy).toHaveBeenCalled();
                consoleSpy.mockRestore();
            });
        });

        describe('saveRecentlyPlayedToStorage', () => {
            test('should save recently played to localStorage', () => {
                const recentlyPlayed = ['sound1.wav', 'sound2.wav'];
                saveRecentlyPlayedToStorage(mockStorage, recentlyPlayed);
                expect(mockStorage.setItem).toHaveBeenCalledWith(
                    'cnc-recently-played',
                    JSON.stringify(recentlyPlayed),
                );
            });

            test('should handle localStorage errors gracefully', () => {
                const errorStorage = {
                    setItem: jest.fn(() => {
                        throw new Error('Storage full');
                    }),
                };
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
                saveRecentlyPlayedToStorage(errorStorage, ['test.wav']);
                expect(consoleSpy).toHaveBeenCalled();
                consoleSpy.mockRestore();
            });
        });

        describe('addToRecentlyPlayedArray', () => {
            test('should add sound to beginning of array', () => {
                const result = addToRecentlyPlayedArray(
                    ['old.wav'],
                    'new.wav',
                    10,
                );
                expect(result[0]).toBe('new.wav');
            });

            test('should remove duplicate if sound already exists', () => {
                const result = addToRecentlyPlayedArray(
                    ['a.wav', 'b.wav', 'c.wav'],
                    'b.wav',
                    10,
                );
                expect(result).toEqual(['b.wav', 'a.wav', 'c.wav']);
            });

            test('should limit array to maxItems', () => {
                const result = addToRecentlyPlayedArray(
                    ['a.wav', 'b.wav', 'c.wav'],
                    'new.wav',
                    3,
                );
                expect(result.length).toBe(3);
                expect(result).toEqual(['new.wav', 'a.wav', 'b.wav']);
            });
        });
    });
});
