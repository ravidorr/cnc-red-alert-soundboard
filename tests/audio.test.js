/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, renderCategories } from '../js/ui.js';
import {
    setupAudioPlayer,
    playSound,
    stopAllSounds,
    clearPlayingState,
    playRandomSound,
    checkUrlHash,
} from '../js/audio.js';

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

        test('should clear playing state on audio ended', () => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();

            const btn = document.querySelector('.sound-btn');
            playSound(btn);
            expect(btn.classList.contains('playing')).toBe(true);

            // Trigger ended event
            state.audioPlayer.dispatchEvent(new Event('ended'));

            expect(btn.classList.contains('playing')).toBe(false);
        });

        test('should handle audio error', () => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();

            const btn = document.querySelector('.sound-btn');
            playSound(btn);

            // Trigger error event
            state.audioPlayer.dispatchEvent(new Event('error'));

            expect(btn.classList.contains('playing')).toBe(false);
            // Toast should be shown
            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
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

        test('should stop when clicking same sound again', () => {
            const btn = document.querySelector('.sound-btn');
            playSound(btn);
            expect(btn.classList.contains('playing')).toBe(true);

            // Click same button again
            playSound(btn);
            expect(btn.classList.contains('playing')).toBe(false);
            expect(state.audioPlayer.paused).toBe(true);
        });

        test('should switch sounds when clicking different button', () => {
            const buttons = document.querySelectorAll('.sound-btn');
            const btn1 = buttons[0];
            const btn2 = buttons[1];

            playSound(btn1);
            expect(btn1.classList.contains('playing')).toBe(true);

            playSound(btn2);
            expect(btn1.classList.contains('playing')).toBe(false);
            expect(btn2.classList.contains('playing')).toBe(true);
        });

        test('should update now playing indicator', () => {
            const btn = document.querySelector('.sound-btn');
            const soundName = btn.dataset.name;

            playSound(btn);

            expect(elements.nowPlayingTitle.textContent).toBe(soundName);
            expect(elements.nowPlaying.classList.contains('visible')).toBe(true);
        });

        test('should handle play() rejection', async () => {
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            state.audioPlayer.play = jest.fn().mockRejectedValue(new Error('Playback failed'));

            const btn = document.querySelector('.sound-btn');
            playSound(btn);

            // Wait for the promise rejection to be handled
            await new Promise(resolve => setTimeout(resolve, 10));

            expect(consoleSpy).toHaveBeenCalledWith('Playback failed:', expect.any(Error));
            consoleSpy.mockRestore();
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

        test('should reset currentTime', () => {
            const btn = document.querySelector('.sound-btn');
            playSound(btn);
            stopAllSounds();

            expect(state.audioPlayer.currentTime).toBe(0);
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

        test('should hide now playing indicator', () => {
            const btn = document.querySelector('.sound-btn');
            playSound(btn);
            clearPlayingState();

            expect(elements.nowPlaying.classList.contains('visible')).toBe(false);
            expect(elements.nowPlayingTitle.textContent).toBe('-');
        });

        test('should handle when no sound is playing', () => {
            expect(() => clearPlayingState()).not.toThrow();
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

        test('should set currently playing state', () => {
            playRandomSound();

            expect(state.currentlyPlaying).not.toBeNull();
        });

        test('should handle when button is not found', () => {
            // Remove all buttons
            document.querySelectorAll('.sound-btn').forEach(btn => btn.remove());

            expect(() => playRandomSound()).not.toThrow();
        });
    });

    describe('checkUrlHash', () => {
        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
        });

        test('should not do anything without sound hash', () => {
            window.location.hash = '';
            checkUrlHash();

            expect(state.currentlyPlaying).toBeNull();
        });

        test('should not do anything with unrelated hash', () => {
            window.location.hash = '#other';
            checkUrlHash();

            expect(state.currentlyPlaying).toBeNull();
        });

        test('should handle sound hash with valid sound', (done) => {
            window.location.hash = '#sound=allies_1_achnoledged.wav';
            checkUrlHash();

            // Wait for setTimeout
            setTimeout(() => {
                expect(state.audioPlayer.src).toContain('sounds/');
                done();
            }, 600);
        });

        test('should handle sound hash with invalid sound', () => {
            window.location.hash = '#sound=nonexistent.wav';
            checkUrlHash();

            expect(state.currentlyPlaying).toBeNull();
        });

        test('should handle when button not found for valid sound', (done) => {
            // Remove all buttons first
            document.querySelectorAll('.sound-btn').forEach(btn => btn.remove());

            window.location.hash = '#sound=allies_1_achnoledged.wav';
            checkUrlHash();

            // Wait for setTimeout
            setTimeout(() => {
                // Should not throw, just not play
                expect(state.currentlyPlaying).toBeNull();
                done();
            }, 600);
        });
    });
});
