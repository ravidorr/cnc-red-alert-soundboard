// ============================================
// Audio - Audio playback functions
// ============================================

import { SOUNDS } from './constants.js';
import { state, elements } from './state.js';
import { showToast } from './ui.js';
import { addToRecentlyPlayed } from './recently-played.js';

// Setup audio player
export function setupAudioPlayer() {
    state.audioPlayer = elements.audioPlayer;

    state.audioPlayer.addEventListener('ended', () => {
        clearPlayingState();
    });

    state.audioPlayer.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        clearPlayingState();
        showToast('Could not play sound. Try again.', 'error');
    });
}

// Play a sound
export function playSound(button) {
    const file = decodeURIComponent(button.dataset.file);
    const name = button.dataset.name;

    // If same sound is playing, stop it
    if (state.currentlyPlaying === button) {
        stopAllSounds();
        return;
    }

    // Clear previous playing state
    clearPlayingState();

    // Play new sound - encode the filename properly for URL
    const encodedFile = encodeURIComponent(file);
    state.audioPlayer.src = `sounds/${encodedFile}`;
    state.audioPlayer.play().catch(err => {
        console.error('Playback failed:', err);
    });

    // Update state
    state.currentlyPlaying = button;
    button.classList.add('playing');

    // Update now playing indicator
    elements.nowPlayingTitle.textContent = name;
    elements.nowPlaying.classList.add('visible');

    // Add to recently played
    addToRecentlyPlayed(file);
}

// Stop all sounds
export function stopAllSounds() {
    state.audioPlayer.pause();
    state.audioPlayer.currentTime = 0;
    clearPlayingState();
}

// Clear playing state
export function clearPlayingState() {
    if (state.currentlyPlaying) {
        state.currentlyPlaying.classList.remove('playing');
        state.currentlyPlaying = null;
    }
    elements.nowPlaying.classList.remove('visible');
    elements.nowPlayingTitle.textContent = '-';
}

// Play a random sound
export function playRandomSound() {
    const randomIndex = Math.floor(Math.random() * SOUNDS.length);
    const sound = SOUNDS[randomIndex];
    // Find the button for this sound and simulate click
    const btn = document.querySelector(`.sound-btn[data-file="${encodeURIComponent(sound.file)}"]`);
    if (btn) {
        playSound(btn);
    }
}

// Check URL hash for direct sound link
export function checkUrlHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#sound=')) {
        const soundFile = decodeURIComponent(hash.substring(7));
        const sound = SOUNDS.find(s => s.file === soundFile);
        if (sound) {
            setTimeout(() => {
                const btn = document.querySelector(`.sound-btn[data-file="${encodeURIComponent(soundFile)}"]`);
                if (btn) {
                    // Scroll to the button
                    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Play the sound
                    playSound(btn);
                }
            }, 500);
        }
    }
}
