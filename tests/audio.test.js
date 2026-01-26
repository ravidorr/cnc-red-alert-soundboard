/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/src/state.js';
import { SOUNDS } from '../js/src/constants.js';
import { cacheElements } from '../js/src/ui.js';
import { renderCategories } from '../js/src/ui.js';
import {
    setupAudioPlayer,
    playSound,
    stopAllSounds,
    clearPlayingState,
    playRandomSound,
    checkUrlHash,
} from '../js/src/audio.js';

describe('Audio Functions', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
        Element.prototype.scrollIntoView = jest.fn();
    });

    describe('setupAudioPlayer', () => {
        test('should initialize audio player from elements', () => {
            cacheElements();
            setupAudioPlayer();
            
            expect(state.audioPlayer).not.toBeNull();
        });
    });

    describe('playSound', () => {
        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
        });

        test('should set audio source when playing', () => {
            const btn = document.querySelector('.sound-btn');
            playSound(btn);
            
            expect(state.audioPlayer.src).toContain('sounds/');
        });

        test('should add playing class to button', () => {
            const btn = document.querySelector('.sound-btn');
            playSound(btn);
            
            expect(btn.classList.contains('playing')).toBe(true);
        });
    });

    describe('stopAllSounds', () => {
        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
        });

        test('should pause audio player', () => {
            const btn = document.querySelector('.sound-btn');
            playSound(btn);
            stopAllSounds();
            
            expect(state.audioPlayer.paused).toBe(true);
        });
    });

    describe('clearPlayingState', () => {
        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
        });

        test('should remove playing class from current button', () => {
            const btn = document.querySelector('.sound-btn');
            playSound(btn);
            clearPlayingState();
            
            expect(btn.classList.contains('playing')).toBe(false);
        });
    });

    describe('playRandomSound', () => {
        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
        });

        test('should play a sound', () => {
            playRandomSound();
            
            expect(state.audioPlayer.src).toContain('sounds/');
        });
    });
});
