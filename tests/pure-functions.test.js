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
    fuzzyMatch,
    levenshteinDistance,
    createFocusTrap,
    setupFocusTrap,
    FOCUSABLE_SELECTOR,
    announce,
    clearAnnouncerCache,
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

        test('should return true when dismissed more than X days ago', () => {
            // Set dismissed timestamp to 10 days ago
            const tenDaysAgo = Date.now() - (10 * 24 * 60 * 60 * 1000);
            mockStorage.store.installPromptDismissed = tenDaysAgo.toString();
            const result = shouldShowInstallPrompt(mockStorage, 7);
            expect(result).toBe(true);
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

    describe('Fuzzy Match Functions', () => {
        describe('fuzzyMatch', () => {
            test('should return true for exact match', () => {
                expect(fuzzyMatch('tanya', 'tanya')).toBe(true);
            });

            test('should return true for substring match', () => {
                expect(fuzzyMatch('tan', 'tanya')).toBe(true);
            });

            test('should handle single character typos', () => {
                expect(fuzzyMatch('tania', 'tanya')).toBe(true);
            });

            test('should handle transposed characters', () => {
                expect(fuzzyMatch('tayna', 'tanya')).toBe(true);
            });

            test('should return false for completely different strings', () => {
                expect(fuzzyMatch('xyz', 'abc')).toBe(false);
            });

            test('should be case insensitive', () => {
                expect(fuzzyMatch('TANYA', 'tanya')).toBe(true);
                expect(fuzzyMatch('tanya', 'TANYA')).toBe(true);
            });

            test('should return false for null/empty inputs', () => {
                expect(fuzzyMatch('', 'test')).toBe(false);
                expect(fuzzyMatch('test', '')).toBe(false);
                expect(fuzzyMatch(null, 'test')).toBe(false);
            });
        });

        describe('levenshteinDistance', () => {
            test('should return 0 for identical strings', () => {
                expect(levenshteinDistance('test', 'test')).toBe(0);
            });

            test('should return string length for empty comparison', () => {
                expect(levenshteinDistance('', 'test')).toBe(4);
                expect(levenshteinDistance('test', '')).toBe(4);
            });

            test('should calculate correct distance for substitution', () => {
                expect(levenshteinDistance('cat', 'bat')).toBe(1);
            });

            test('should calculate correct distance for insertion', () => {
                expect(levenshteinDistance('cat', 'cart')).toBe(1);
            });

            test('should calculate correct distance for deletion', () => {
                expect(levenshteinDistance('cart', 'cat')).toBe(1);
            });
        });

        describe('filterSoundsArray with tags', () => {
            const localThis = {};

            beforeEach(() => {
                localThis.soundsWithTags = [
                    { name: 'Laugh', file: 'laugh.wav', category: 'test', tags: ['iconic', 'voice'] },
                    { name: 'Cry', file: 'cry.wav', category: 'test' },
                ];
            });

            test('should match by tag', () => {
                const result = filterSoundsArray(localThis.soundsWithTags, 'iconic');
                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Laugh');
            });

            test('should prioritize name matches over tag matches', () => {
                const result = filterSoundsArray(localThis.soundsWithTags, 'laugh');
                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Laugh');
            });

            test('should handle sounds without tags array', () => {
                const result = filterSoundsArray(localThis.soundsWithTags, 'cry');
                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Cry');
            });

            test('should find sounds via fuzzy matching (typo correction)', () => {
                // 'lauhg' is a typo of 'laugh' - not a substring, but close enough for fuzzy matching
                const result = filterSoundsArray(localThis.soundsWithTags, 'lauhg');
                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Laugh');
            });

            test('should find sounds via fuzzy matching with character transposition', () => {
                // 'laugH' (casing) is handled differently - let's use a real typo
                const soundsWithLongerName = [
                    { name: 'Acknowledged', file: 'ack.wav', category: 'test' },
                ];
                // 'acknolwedged' is a typo (transposed 'w' and 'l')
                const result = filterSoundsArray(soundsWithLongerName, 'acknolwedged');
                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Acknowledged');
            });
        });
    });

    describe('createFocusTrap', () => {
        const localThis = {};

        beforeEach(() => {
            // Create a container with focusable elements
            localThis.container = document.createElement('div');
            localThis.btn1 = document.createElement('button');
            localThis.btn1.textContent = 'First';
            localThis.btn2 = document.createElement('button');
            localThis.btn2.textContent = 'Last';
            localThis.container.appendChild(localThis.btn1);
            localThis.container.appendChild(localThis.btn2);
            document.body.appendChild(localThis.container);
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        test('should export FOCUSABLE_SELECTOR constant', () => {
            expect(FOCUSABLE_SELECTOR).toBe('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        });

        test('should return a function', () => {
            const handler = createFocusTrap(localThis.container);
            expect(typeof handler).toBe('function');
        });

        test('should call onEscape when Escape key is pressed', () => {
            const onEscape = jest.fn();
            const handler = createFocusTrap(localThis.container, { onEscape });
            
            const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            handler(event);
            
            expect(onEscape).toHaveBeenCalled();
        });

        test('should stop propagation when stopPropagation option is true', () => {
            const onEscape = jest.fn();
            const handler = createFocusTrap(localThis.container, { 
                onEscape, 
                stopPropagation: true,
            });
            
            const event = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
            const stopPropSpy = jest.spyOn(event, 'stopPropagation');
            handler(event);
            
            expect(stopPropSpy).toHaveBeenCalled();
        });

        test('should cycle focus from last to first on Tab', () => {
            const handler = createFocusTrap(localThis.container);
            localThis.btn2.focus();
            
            const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true });
            handler(event);
            
            expect(document.activeElement).toBe(localThis.btn1);
        });

        test('should cycle focus from first to last on Shift+Tab', () => {
            const handler = createFocusTrap(localThis.container);
            localThis.btn1.focus();
            
            const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
            handler(event);
            
            expect(document.activeElement).toBe(localThis.btn2);
        });

        test('should not cycle focus when not on first or last element', () => {
            const btn3 = document.createElement('button');
            btn3.textContent = 'Middle';
            localThis.container.insertBefore(btn3, localThis.btn2);
            
            const handler = createFocusTrap(localThis.container);
            btn3.focus();
            
            const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true });
            handler(event);
            
            // Focus should not have changed (native tab would move it)
            expect(document.activeElement).toBe(btn3);
        });

        test('should call onEmptyFocusables when container has no focusable elements', () => {
            const emptyContainer = document.createElement('div');
            emptyContainer.innerHTML = '<p>No buttons</p>';
            document.body.appendChild(emptyContainer);
            
            const onEmptyFocusables = jest.fn();
            const handler = createFocusTrap(emptyContainer, { onEmptyFocusables });
            
            const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            handler(event);
            
            expect(onEmptyFocusables).toHaveBeenCalled();
        });

        test('should prevent default when Tab pressed with no focusables', () => {
            const emptyContainer = document.createElement('div');
            emptyContainer.innerHTML = '<p>No buttons</p>';
            document.body.appendChild(emptyContainer);
            
            const handler = createFocusTrap(emptyContainer);
            
            const event = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
            handler(event);
            
            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        test('should use custom focusableSelector when provided', () => {
            // Add a link that would be found by default selector
            const link = document.createElement('a');
            link.href = '#';
            link.textContent = 'Link';
            localThis.container.appendChild(link);
            
            // Custom selector that only finds buttons
            const handler = createFocusTrap(localThis.container, { 
                focusableSelector: 'button',
            });
            
            // Focus last button
            localThis.btn2.focus();
            
            const event = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true });
            handler(event);
            
            // Should cycle to first button, not the link
            expect(document.activeElement).toBe(localThis.btn1);
        });

        test('should not do anything for non-Tab/Escape keys', () => {
            const onEscape = jest.fn();
            const handler = createFocusTrap(localThis.container, { onEscape });
            localThis.btn1.focus();
            
            const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            handler(event);
            
            expect(onEscape).not.toHaveBeenCalled();
            expect(document.activeElement).toBe(localThis.btn1);
        });
    });

    describe('setupFocusTrap', () => {
        const localThis = {};

        beforeEach(() => {
            localThis.container = document.createElement('div');
            localThis.btn = document.createElement('button');
            localThis.btn.textContent = 'Focus me';
            localThis.container.appendChild(localThis.btn);
            document.body.appendChild(localThis.container);
        });

        afterEach(() => {
            document.body.innerHTML = '';
        });

        test('should return object with handler and cleanup function', () => {
            const result = setupFocusTrap(localThis.container);
            expect(typeof result.handler).toBe('function');
            expect(typeof result.cleanup).toBe('function');
        });

        test('should attach keydown listener to container', () => {
            const addEventListenerSpy = jest.spyOn(localThis.container, 'addEventListener');
            setupFocusTrap(localThis.container);
            expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });

        test('should focus initialFocusElement after delay', async () => {
            jest.useFakeTimers();
            setupFocusTrap(localThis.container, { 
                initialFocusElement: localThis.btn,
                focusDelay: 50,
            });
            
            jest.advanceTimersByTime(50);
            expect(document.activeElement).toBe(localThis.btn);
            jest.useRealTimers();
        });

        test('cleanup should remove keydown listener', () => {
            const removeEventListenerSpy = jest.spyOn(localThis.container, 'removeEventListener');
            const { cleanup } = setupFocusTrap(localThis.container);

            cleanup();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        });
    });

    describe('announce', () => {
        beforeEach(() => {
            clearAnnouncerCache();
            // Remove any existing announcers
            document.querySelectorAll('[aria-live]').forEach(el => el.remove());
        });

        test('should create announcer element if it does not exist', () => {
            announce('Test message');

            const announcer = document.getElementById('sr-announcer');
            expect(announcer).not.toBeNull();
            expect(announcer.getAttribute('aria-live')).toBe('polite');
            expect(announcer.getAttribute('aria-atomic')).toBe('true');
            expect(announcer.className).toBe('visually-hidden');
        });

        test('should set the message text', () => {
            announce('Hello screen reader');

            const announcer = document.getElementById('sr-announcer');
            expect(announcer.textContent).toBe('Hello screen reader');
        });

        test('should reuse existing announcer element', () => {
            announce('First message');
            const firstAnnouncer = document.getElementById('sr-announcer');

            announce('Second message');
            const secondAnnouncer = document.getElementById('sr-announcer');

            expect(secondAnnouncer).toBe(firstAnnouncer);
            expect(secondAnnouncer.textContent).toBe('Second message');
        });

        test('should use custom id when provided', () => {
            announce('Custom message', { id: 'custom-announcer' });

            const announcer = document.getElementById('custom-announcer');
            expect(announcer).not.toBeNull();
            expect(announcer.textContent).toBe('Custom message');
        });

        test('should use assertive priority when specified', () => {
            announce('Urgent message', { priority: 'assertive' });

            const announcer = document.getElementById('sr-announcer');
            expect(announcer.getAttribute('aria-live')).toBe('assertive');
        });

        test('should not set aria-atomic when atomic is false', () => {
            announce('Message', { atomic: false });

            const announcer = document.getElementById('sr-announcer');
            expect(announcer.hasAttribute('aria-atomic')).toBe(false);
        });

        test('should return the announcer element', () => {
            const result = announce('Test');

            expect(result).toBe(document.getElementById('sr-announcer'));
        });
    });

    describe('clearAnnouncerCache', () => {
        test('should clear the cache forcing new element creation', () => {
            // Create an announcer with custom id
            announce('First', { id: 'test-announcer' });
            const firstAnnouncer = document.getElementById('test-announcer');

            // Remove it from DOM
            firstAnnouncer.remove();

            // Without clearing cache, it would try to use the removed element
            clearAnnouncerCache();

            // Now it should create a new one
            announce('Second', { id: 'test-announcer' });
            const secondAnnouncer = document.getElementById('test-announcer');

            expect(secondAnnouncer).not.toBeNull();
            expect(secondAnnouncer).not.toBe(firstAnnouncer);
        });
    });
});
