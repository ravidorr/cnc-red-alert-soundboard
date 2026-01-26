/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { SOUNDS, CATEGORIES } from '../js/constants.js';
import { state, elements } from '../js/state.js';

describe('Sound Data', () => {
    test('SOUNDS array should be defined', () => {
        expect(SOUNDS).toBeDefined();
        expect(Array.isArray(SOUNDS)).toBe(true);
    });

    test('Each sound should have required properties', () => {
        SOUNDS.forEach(sound => {
            expect(sound).toHaveProperty('file');
            expect(sound).toHaveProperty('name');
            expect(sound).toHaveProperty('category');
        });
    });

    test('CATEGORIES should be defined', () => {
        expect(CATEGORIES).toBeDefined();
        expect(typeof CATEGORIES).toBe('object');
    });

    test('Each category should have name and order', () => {
        Object.values(CATEGORIES).forEach(cat => {
            expect(cat).toHaveProperty('name');
            expect(cat).toHaveProperty('order');
        });
    });
});

describe('URL Encoding', () => {
    test('normalized filenames should not need special encoding', () => {
        // After normalization, filenames should be simple
        const testFiles = [
            'allies_1_achnoledged.wav',
            'tanya_lets_rock.wav',
            'soviet_2_ready_and_waiting.wav',
        ];

        testFiles.forEach(file => {
            const encoded = encodeURIComponent(file);
            // Underscores and periods don't need encoding
            expect(encoded).toBe(file);
        });
    });

    test('decoding should work correctly for all sounds', () => {
        SOUNDS.forEach(sound => {
            const encoded = encodeURIComponent(sound.file);
            const decoded = decodeURIComponent(encoded);
            expect(decoded).toBe(sound.file);
        });
    });
});

describe('State Management', () => {
    test('state should have expected properties', () => {
        expect(state).toHaveProperty('favorites');
        expect(state).toHaveProperty('searchTerm');
        expect(state).toHaveProperty('recentlyPlayed');
    });

    test('elements should have expected properties', () => {
        expect(elements).toHaveProperty('contentArea');
        expect(elements).toHaveProperty('searchInput');
    });
});
