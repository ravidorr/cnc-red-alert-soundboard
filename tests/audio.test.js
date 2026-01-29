/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { setupFullDOM, resetState, resetElements, useFakeTimers, useRealTimers, advanceTimers } from './helpers.js';
import { state, elements } from '../js/state.js';
import { cacheElements, renderCategories } from '../js/ui.js';
import {
    setupAudioPlayer,
    playSound,
    stopAllSounds,
    clearPlayingState,
    playRandomSound,
    checkUrlHash,
    replayLastSound,
} from '../js/audio.js';

describe('Audio Functions', () => {
    beforeEach(() => {
        setupFullDOM();
        resetState(state);
        resetElements(elements);
        Element.prototype.scrollIntoView = jest.fn();
        localStorage.clear();
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

        test('should hide now playing after delay when audio ends', () => {
            useFakeTimers();
            cacheElements();
            setupAudioPlayer();
            renderCategories();

            // Make now playing visible
            elements.nowPlaying.classList.add('visible');
            elements.nowPlayingTitle.textContent = 'Test Sound';

            // Trigger ended event
            state.audioPlayer.dispatchEvent(new Event('ended'));

            // Before delay, still visible
            expect(elements.nowPlaying.classList.contains('visible')).toBe(true);

            // After 1500ms delay, should be hidden
            advanceTimers(1500);
            expect(elements.nowPlaying.classList.contains('visible')).toBe(false);
            expect(elements.nowPlayingTitle.textContent).toBe('-');

            useRealTimers();
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

        test('should setup volume control from localStorage', () => {
            localStorage.setItem('soundboardVolume', '50');

            // Add volume control elements
            const volumeSlider = document.createElement('input');
            volumeSlider.type = 'range';
            volumeSlider.id = 'volume-slider';
            volumeSlider.value = '100';
            document.body.appendChild(volumeSlider);

            const volumeToggle = document.createElement('button');
            volumeToggle.id = 'volume-toggle';
            document.body.appendChild(volumeToggle);

            const volumeIcon = document.createElement('svg');
            volumeIcon.id = 'volume-icon';
            volumeToggle.appendChild(volumeIcon);

            cacheElements();
            setupAudioPlayer();

            expect(volumeSlider.value).toBe('50');
            expect(state.audioPlayer.volume).toBe(0.5);
        });

        test('should handle volume slider changes', () => {
            // Add volume control elements
            const volumeSlider = document.createElement('input');
            volumeSlider.type = 'range';
            volumeSlider.id = 'volume-slider';
            volumeSlider.value = '100';
            document.body.appendChild(volumeSlider);

            const volumeToggle = document.createElement('button');
            volumeToggle.id = 'volume-toggle';
            document.body.appendChild(volumeToggle);

            const volumeIcon = document.createElement('svg');
            volumeIcon.id = 'volume-icon';
            volumeToggle.appendChild(volumeIcon);

            cacheElements();
            setupAudioPlayer();

            // Change volume
            volumeSlider.value = '75';
            volumeSlider.dispatchEvent(new Event('input'));

            expect(state.audioPlayer.volume).toBe(0.75);
            expect(localStorage.getItem('soundboardVolume')).toBe('75');
        });

        test('should handle volume mute toggle', () => {
            // Add volume control elements
            const volumeSlider = document.createElement('input');
            volumeSlider.type = 'range';
            volumeSlider.id = 'volume-slider';
            volumeSlider.value = '80';
            document.body.appendChild(volumeSlider);

            const volumeToggle = document.createElement('button');
            volumeToggle.id = 'volume-toggle';
            document.body.appendChild(volumeToggle);

            const volumeIcon = document.createElement('svg');
            volumeIcon.id = 'volume-icon';
            volumeToggle.appendChild(volumeIcon);

            cacheElements();
            setupAudioPlayer();

            // Click to mute
            volumeToggle.click();

            expect(volumeSlider.value).toBe('0');
            expect(state.audioPlayer.volume).toBe(0);

            // Click to unmute
            volumeToggle.click();

            expect(parseInt(volumeSlider.value)).toBeGreaterThan(0);
        });

        test('should disable random button when muted', () => {
            // Add volume control elements
            const volumeSlider = document.createElement('input');
            volumeSlider.type = 'range';
            volumeSlider.id = 'volume-slider';
            volumeSlider.value = '80';
            document.body.appendChild(volumeSlider);

            const volumeToggle = document.createElement('button');
            volumeToggle.id = 'volume-toggle';
            document.body.appendChild(volumeToggle);

            const volumeIcon = document.createElement('svg');
            volumeIcon.id = 'volume-icon';
            volumeToggle.appendChild(volumeIcon);

            // Use the existing random button from setupFullDOM
            const randomBtn = document.getElementById('random-sound');

            cacheElements();
            setupAudioPlayer();

            // Click to mute
            volumeToggle.click();

            expect(state.isMuted).toBe(true);
            expect(randomBtn.disabled).toBe(true);
            expect(randomBtn.classList.contains('disabled')).toBe(true);
            expect(randomBtn.getAttribute('aria-disabled')).toBe('true');

            // Click to unmute
            volumeToggle.click();

            expect(state.isMuted).toBe(false);
            expect(randomBtn.disabled).toBe(false);
            expect(randomBtn.classList.contains('disabled')).toBe(false);
        });

        test('should handle missing volume controls gracefully', () => {
            cacheElements();

            expect(() => setupAudioPlayer()).not.toThrow();
        });

        test('should handle missing volume icon element', () => {
            const localThis = {};
            localThis.volumeSlider = document.createElement('input');
            localThis.volumeSlider.type = 'range';
            localThis.volumeSlider.id = 'volume-slider';
            localThis.volumeSlider.value = '50';
            document.body.appendChild(localThis.volumeSlider);

            localThis.volumeToggle = document.createElement('button');
            localThis.volumeToggle.id = 'volume-toggle';
            document.body.appendChild(localThis.volumeToggle);
            // Note: NOT adding volume-icon element

            cacheElements();
            setupAudioPlayer();

            // Change volume - should not throw even without icon
            localThis.volumeSlider.value = '30';
            expect(() => {
                localThis.volumeSlider.dispatchEvent(new Event('input'));
            }).not.toThrow();
        });

        test('should show medium volume icon when volume is below 50', () => {
            const localThis = {};
            // Add volume control elements
            localThis.volumeSlider = document.createElement('input');
            localThis.volumeSlider.type = 'range';
            localThis.volumeSlider.id = 'volume-slider';
            localThis.volumeSlider.value = '30';
            document.body.appendChild(localThis.volumeSlider);

            localThis.volumeToggle = document.createElement('button');
            localThis.volumeToggle.id = 'volume-toggle';
            document.body.appendChild(localThis.volumeToggle);

            localThis.volumeIcon = document.createElement('svg');
            localThis.volumeIcon.id = 'volume-icon';
            localThis.volumeToggle.appendChild(localThis.volumeIcon);

            cacheElements();
            setupAudioPlayer();

            // Set volume to 30 (below 50)
            localThis.volumeSlider.value = '30';
            localThis.volumeSlider.dispatchEvent(new Event('input'));

            expect(state.audioPlayer.volume).toBe(0.3);
            // Should not have muted class
            expect(localThis.volumeToggle.classList.contains('muted')).toBe(false);
        });

        test('should handle volume set to zero via slider', () => {
            const localThis = {};
            // Add volume control elements
            localThis.volumeSlider = document.createElement('input');
            localThis.volumeSlider.type = 'range';
            localThis.volumeSlider.id = 'volume-slider';
            localThis.volumeSlider.value = '50';
            document.body.appendChild(localThis.volumeSlider);

            localThis.volumeToggle = document.createElement('button');
            localThis.volumeToggle.id = 'volume-toggle';
            document.body.appendChild(localThis.volumeToggle);

            localThis.volumeIcon = document.createElement('svg');
            localThis.volumeIcon.id = 'volume-icon';
            localThis.volumeToggle.appendChild(localThis.volumeIcon);

            cacheElements();
            setupAudioPlayer();

            // Set volume to 0 via slider (this should NOT update previousVolume)
            localThis.volumeSlider.value = '0';
            localThis.volumeSlider.dispatchEvent(new Event('input'));

            expect(state.audioPlayer.volume).toBe(0);
            expect(state.isMuted).toBe(true);
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
            await Promise.resolve();
            await Promise.resolve();

            expect(consoleSpy).toHaveBeenCalledWith('Playback failed:', expect.any(Error));
            consoleSpy.mockRestore();
        });

        test('should not play when muted', () => {
            state.isMuted = true;

            const btn = document.querySelector('.sound-btn');
            playSound(btn);

            // Should not play
            expect(state.currentlyPlaying).toBeNull();
            expect(btn.classList.contains('playing')).toBe(false);

            // Should show toast
            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('Unmute');

            state.isMuted = false;
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

        test('should not play when muted', () => {
            state.isMuted = true;

            playRandomSound();

            // Should not play
            expect(state.currentlyPlaying).toBeNull();

            // Should show toast
            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('Unmute');

            state.isMuted = false;
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

        test('should handle sound hash with valid sound', () => {
            useFakeTimers();
            window.location.hash = '#sound=allies_1_achnoledged.wav';
            checkUrlHash();

            // Advance timers
            advanceTimers(600);
            expect(state.audioPlayer.src).toContain('sounds/');
            useRealTimers();
        });

        test('should handle sound hash with invalid sound', () => {
            window.location.hash = '#sound=nonexistent.wav';
            checkUrlHash();

            expect(state.currentlyPlaying).toBeNull();
        });

        test('should handle when button not found for valid sound', () => {
            useFakeTimers();
            // Remove all buttons first
            document.querySelectorAll('.sound-btn').forEach(btn => btn.remove());

            window.location.hash = '#sound=allies_1_achnoledged.wav';
            checkUrlHash();

            // Advance timers
            advanceTimers(600);
            // Should not throw, just not play
            expect(state.currentlyPlaying).toBeNull();
            useRealTimers();
        });
    });

    describe('replayLastSound', () => {
        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
        });

        test('should play most recently played sound', () => {
            // Add a sound to recently played
            state.recentlyPlayed = ['allies_1_achnoledged.wav'];

            replayLastSound();

            expect(state.audioPlayer.src).toContain('sounds/');
        });

        test('should not throw when no recently played sounds', () => {
            state.recentlyPlayed = [];

            expect(() => replayLastSound()).not.toThrow();
        });

        test('should not play when muted', () => {
            state.recentlyPlayed = ['allies_1_achnoledged.wav'];
            state.isMuted = true;

            replayLastSound();

            // Should not play, should show toast
            const toast = document.querySelector('.toast');
            expect(toast).not.toBeNull();
            expect(toast.textContent).toContain('Unmute');

            state.isMuted = false;
        });

        test('should handle when button not found', () => {
            state.recentlyPlayed = ['nonexistent.wav'];

            expect(() => replayLastSound()).not.toThrow();
        });
    });

    describe('Branch Coverage - updateVolumeAria', () => {
        beforeEach(() => {
            cacheElements();
            setupAudioPlayer();
            renderCategories();
        });

        test('should handle missing volume slider gracefully', () => {
            // Remove the volume slider
            const volumeSlider = document.getElementById('volume-slider');
            if (volumeSlider) {
                volumeSlider.remove();
            }

            // Triggering volume change should not throw even without slider
            const volumeToggle = document.getElementById('volume-toggle');
            if (volumeToggle) {
                expect(() => volumeToggle.click()).not.toThrow();
            }
        });

        test('volume slider should update aria attributes on input change', () => {
            // Add volume toggle and slider if they don't exist
            if (!document.getElementById('volume-toggle')) {
                const toggle = document.createElement('button');
                toggle.id = 'volume-toggle';
                document.body.appendChild(toggle);
            }

            if (!document.getElementById('volume-slider')) {
                const slider = document.createElement('input');
                slider.type = 'range';
                slider.id = 'volume-slider';
                slider.min = '0';
                slider.max = '100';
                slider.value = '100';
                document.body.appendChild(slider);
            }

            // Re-setup audio player to attach event listeners
            setupAudioPlayer();

            const slider = document.getElementById('volume-slider');
            slider.value = '50';
            slider.dispatchEvent(new Event('input'));

            // ARIA attributes should be updated
            expect(slider.getAttribute('aria-valuenow')).toBe('50');
            expect(slider.getAttribute('aria-valuetext')).toBe('50 percent');
        });
    });
});
