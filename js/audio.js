// ============================================
// Audio - Audio playback functions
// ============================================

import { SOUNDS } from './constants.js';
import { state, elements } from './state.js';
import { showToast } from './ui.js';
import { addToRecentlyPlayed } from './recently-played.js';

// Volume state
let previousVolume = 100;

// Setup audio player
export function setupAudioPlayer() {
    state.audioPlayer = elements.audioPlayer;

    state.audioPlayer.addEventListener('ended', () => {
        // Keep now playing visible for 1.5s after sound ends for better UX
        if (state.currentlyPlaying) {
            state.currentlyPlaying.classList.remove('playing');
            state.currentlyPlaying = null;
        }
        setTimeout(() => {
            elements.nowPlaying.classList.remove('visible');
            elements.nowPlayingTitle.textContent = '-';
        }, 1500);
    });

    state.audioPlayer.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        clearPlayingState();
        showToast('SIGNAL LOST. Check connection and retry.', 'error');
    });

    // Setup volume control
    setupVolumeControl();
}

// Setup volume control
function setupVolumeControl() {
    const volumeSlider = document.getElementById('volume-slider');
    const volumeToggle = document.getElementById('volume-toggle');

    if (!volumeSlider || !volumeToggle) {
        return;
    }

    // Load saved volume from localStorage
    const savedVolume = localStorage.getItem('soundboardVolume');
    if (savedVolume !== null) {
        volumeSlider.value = savedVolume;
        state.audioPlayer.volume = savedVolume / 100;
        updateVolumeIcon(parseInt(savedVolume, 10));
        updateVolumeAria(volumeSlider, parseInt(savedVolume, 10));
    }

    // Volume slider change
    volumeSlider.addEventListener('input', (e) => {
        const volume = parseInt(e.target.value, 10);
        state.audioPlayer.volume = volume / 100;
        localStorage.setItem('soundboardVolume', volume);
        updateVolumeIcon(volume);
        updateVolumeAria(volumeSlider, volume);
        if (volume > 0) {
            previousVolume = volume;
        }
    });

    // Volume toggle (mute/unmute)
    volumeToggle.addEventListener('click', () => {
        const currentVolume = parseInt(volumeSlider.value, 10);
        if (currentVolume > 0) {
            // Mute
            previousVolume = currentVolume;
            volumeSlider.value = 0;
            state.audioPlayer.volume = 0;
            localStorage.setItem('soundboardVolume', 0);
            updateVolumeIcon(0);
            updateVolumeAria(volumeSlider, 0);
        } else {
            // Unmute
            const restoreVolume = previousVolume > 0 ? previousVolume : 100;
            volumeSlider.value = restoreVolume;
            state.audioPlayer.volume = restoreVolume / 100;
            localStorage.setItem('soundboardVolume', restoreVolume);
            updateVolumeIcon(restoreVolume);
            updateVolumeAria(volumeSlider, restoreVolume);
        }
    });
}

// Update volume slider ARIA attributes for screen readers
function updateVolumeAria(slider, volume) {
    if (!slider) {
        return;
    }
    slider.setAttribute('aria-valuenow', volume);
    slider.setAttribute('aria-valuetext', `${volume} percent`);
}

// Update volume icon based on level
function updateVolumeIcon(volume) {
    const volumeIcon = document.getElementById('volume-icon');
    const volumeToggle = document.getElementById('volume-toggle');
    const randomBtn = document.getElementById('random-sound');
    if (!volumeIcon || !volumeToggle) {
        return;
    }

    const isMuted = volume === 0;
    state.isMuted = isMuted;
    volumeToggle.classList.toggle('muted', isMuted);

    // Update random button disabled state
    if (randomBtn) {
        randomBtn.disabled = isMuted;
        randomBtn.classList.toggle('disabled', isMuted);
        randomBtn.setAttribute('aria-disabled', isMuted);
        randomBtn.title = isMuted ? 'Unmute to play sounds' : 'Play random sound';
    }

    if (isMuted) {
        volumeIcon.innerHTML = '<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>';
        volumeToggle.setAttribute('aria-label', 'Unmute');
        volumeToggle.title = 'Unmute';
    } else if (volume < 50) {
        volumeIcon.innerHTML = '<path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/>';
        volumeToggle.setAttribute('aria-label', 'Mute');
        volumeToggle.title = 'Mute';
    } else {
        volumeIcon.innerHTML = '<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>';
        volumeToggle.setAttribute('aria-label', 'Mute');
        volumeToggle.title = 'Mute';
    }
}

// Play a sound
export function playSound(button) {
    // Don't play if muted
    if (state.isMuted) {
        showToast('COMMS SILENCED. Unmute to proceed.', 'info');
        return;
    }

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
        clearPlayingState();
        showToast('SIGNAL LOST. Check audio settings and retry.', 'error');
    });

    // Update state
    state.currentlyPlaying = button;
    button.classList.add('playing');

    // Update now playing indicator
    elements.nowPlayingTitle.textContent = name;
    elements.nowPlaying.classList.add('visible');

    // Announce playback to screen readers
    announcePlayback(`Playing ${name}`);

    // Add to recently played
    addToRecentlyPlayed(file);
}

// Announce playback status to screen readers
function announcePlayback(message) {
    let announcer = document.getElementById('playback-announcer');
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = 'playback-announcer';
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'visually-hidden';
        document.body.appendChild(announcer);
    }
    announcer.textContent = message;
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
    // Don't play if muted
    if (state.isMuted) {
        showToast('COMMS SILENCED. Unmute to proceed.', 'info');
        return;
    }

    const randomIndex = Math.floor(Math.random() * SOUNDS.length);
    const sound = SOUNDS[randomIndex];
    // Find the button for this sound and simulate click
    const btn = document.querySelector(`.sound-btn[data-file="${encodeURIComponent(sound.file)}"]`);
    if (btn) {
        playSound(btn);
    }
}

// Replay the last played sound
export function replayLastSound() {
    // Don't play if muted
    if (state.isMuted) {
        showToast('COMMS SILENCED. Unmute to proceed.', 'info');
        return;
    }

    // Check recently played from state
    if (state.recentlyPlayed && state.recentlyPlayed.length > 0) {
        const lastFile = state.recentlyPlayed[0];
        const btn = document.querySelector(`.sound-btn[data-file="${encodeURIComponent(lastFile)}"]`);
        if (btn) {
            playSound(btn);
        }
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
                    // Play the sound (will show toast if muted)
                    playSound(btn);
                }
            }, 500);
        }
    }
}
