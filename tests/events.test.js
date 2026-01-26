/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/src/state.js';
import { cacheElements, renderCategories } from '../js/src/ui.js';
import { renderNavigation } from '../js/src/navigation.js';
import { setupAudioPlayer, playSound, stopAllSounds } from '../js/src/audio.js';
import { setupEventListeners } from '../js/src/events.js';

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

        test('Escape key should stop all sounds', () => {
            setupEventListeners();
            
            const btn = document.querySelector('.sound-btn');
            playSound(btn);
            
            document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
            
            expect(state.audioPlayer.paused).toBe(true);
        });
    });
});
