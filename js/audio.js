// ============================================
// Audio - Audio playback functions
// ============================================

import { SOUNDS, POPULAR_SOUNDS } from './constants.js';
import { state, elements } from './state.js';
import { showToast } from './ui.js';
import { addToRecentlyPlayed } from './recently-played.js';
import { announce } from './utils.js';
import { trackEvent, getDisplayMode, truncateText } from './analytics.js';
import { hasSeenOnboarding } from './onboarding.js';

// Volume state
let previousVolume = 100;
// Last volume level the user committed (slider release or mute toggle)
let committedVolume = 100;

// Latest playback attempt, so the <audio> 'error' listener knows which sound failed
let currentPlayback = null;

// Setup audio player
export function setupAudioPlayer() {
    state.audioPlayer = elements.audioPlayer;
    currentPlayback = null;

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
        const mediaError = state.audioPlayer.error;
        trackPlaybackFailure(currentPlayback, 'MediaError', mediaError ? mediaError.message : '');
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
    committedVolume = parseInt(volumeSlider.value, 10);

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

    // Volume slider release: report the committed level, not every step while dragging
    volumeSlider.addEventListener('change', (e) => {
        trackVolumeChanged(parseInt(e.target.value, 10), 'slider');
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
            trackVolumeChanged(0, 'mute_toggle');
        } else {
            // Unmute
        const restoreVolume = previousVolume;
            volumeSlider.value = restoreVolume;
            state.audioPlayer.volume = restoreVolume / 100;
            localStorage.setItem('soundboardVolume', restoreVolume);
            updateVolumeIcon(restoreVolume);
            updateVolumeAria(volumeSlider, restoreVolume);
            trackVolumeChanged(restoreVolume, 'mute_toggle');
        }
    });
}

// Report a committed volume change; muting matters because it blocks all playback
function trackVolumeChanged(volume, method) {
    if (volume === committedVolume) {
        return;
    }
    trackEvent('volume_changed', {
        volume,
        previous_volume: committedVolume,
        is_muted: volume === 0,
        method,
    });
    committedVolume = volume;
}

// Update volume slider ARIA attributes for screen readers
function updateVolumeAria(slider, volume) {
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
// trigger tells analytics how playback was requested: 'click', 'keyboard', 'random_button',
// 'replay_shortcut', 'favorite_hotkey', 'deep_link' or 'pwa_shortcut'
export function playSound(button, trigger = 'click') {
    const file = decodeURIComponent(button.dataset.file);
    const name = button.dataset.name;

    // Don't play if muted
    if (state.isMuted) {
        showToast('COMMS SILENCED. Unmute to proceed.', 'info');
        trackPlayBlockedMuted(trigger, file, name, button.dataset.category);
        return;
    }

    // If same sound is playing, stop it
    if (state.currentlyPlaying === button) {
        stopAllSounds();
        return;
    }

    // Clear previous playing state
    clearPlayingState();

    // Capture analytics context now: state can change before play() settles
    const playback = { file, name, trigger, failureTracked: false };
    const playedProperties = getSoundPlayedProperties(button, file, name, trigger);
    currentPlayback = playback;

    // Play new sound - encode the filename properly for URL
    const encodedFile = encodeURIComponent(file);
    state.audioPlayer.src = `sounds/${encodedFile}`;
    state.audioPlayer.play().then(() => {
        trackSoundPlayed(playedProperties);
    }, err => {
        console.error('Playback failed:', err);
        clearPlayingState();
        showToast('SIGNAL LOST. Check audio settings and retry.', 'error');
        // AbortError only means the user switched or stopped sounds quickly
        if (err.name !== 'AbortError') {
            trackPlaybackFailure(playback, err.name, err.message);
        }
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

// Describe a play for sound_played
function getSoundPlayedProperties(button, file, name, trigger) {
    const sound = SOUNDS.find(s => s.file === file) ?? {};
    const favoriteIndex = state.favorites.indexOf(file);
    return {
        sound_file: file,
        sound_name: name,
        sound_category: sound.category ?? null,
        source_section: button.dataset.category,
        trigger,
        favorite_slot: favoriteIndex === -1 ? null : favoriteIndex + 1,
        is_favorite: favoriteIndex !== -1,
        is_popular: POPULAR_SOUNDS.includes(file),
        active_search_term: truncateText(state.searchTerm),
        volume: Math.round(state.audioPlayer.volume * 100),
        sound_tags: sound.tags ?? [],
    };
}

// Report a sound that actually started playing
function trackSoundPlayed(properties) {
    // Offline plays are summarized by app_connection_restored once back online
    if (!navigator.onLine) {
        state.soundsPlayedWhileOffline += 1;
    }
    trackEvent('sound_played', properties);
}

// Report a failed playback once: the <audio> 'error' event and the play()
// rejection usually describe the same failure
function trackPlaybackFailure(playback, errorName, errorMessage) {
    if (!playback || playback.failureTracked) {
        return;
    }
    playback.failureTracked = true;
    const mediaError = state.audioPlayer.error;
    trackEvent('sound_playback_failed', {
        sound_file: playback.file,
        sound_name: playback.name,
        trigger: playback.trigger,
        error_name: errorName,
        error_message: truncateText(errorMessage),
        media_error_code: mediaError ? mediaError.code : null,
        is_online: navigator.onLine,
        display_mode: getDisplayMode(),
    });
}

// Report a play request that the mute guard turned away
function trackPlayBlockedMuted(trigger, file, name, sourceSection) {
    trackEvent('sound_play_blocked_muted', {
        trigger,
        sound_file: file,
        sound_name: name,
        source_section: sourceSection,
    });
}

// Announce playback status to screen readers
function announcePlayback(message) {
    announce(message, { id: 'playback-announcer' });
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
// trigger is 'random_button' for the RANDOM button or 'pwa_shortcut' for the app shortcut
export function playRandomSound(trigger = 'random_button') {
    // Don't play if muted
    if (state.isMuted) {
        showToast('COMMS SILENCED. Unmute to proceed.', 'info');
        trackPlayBlockedMuted(trigger, null, null, null);
        return;
    }

    const randomIndex = Math.floor(Math.random() * SOUNDS.length);
    const sound = SOUNDS[randomIndex];
    // Find the button for this sound and simulate click
    const btn = document.querySelector(`.sound-btn[data-file="${encodeURIComponent(sound.file)}"]`);
    if (btn) {
        playSound(btn, trigger);
    }
}

// Replay the last played sound
export function replayLastSound() {
    // Don't play if muted
    if (state.isMuted) {
        showToast('COMMS SILENCED. Unmute to proceed.', 'info');
        const lastFile = state.recentlyPlayed?.[0] ?? null;
        const lastSound = SOUNDS.find(s => s.file === lastFile);
        trackPlayBlockedMuted('replay_shortcut', lastFile, lastSound ? lastSound.name : null, null);
        return;
    }

    // Check recently played from state
    if (state.recentlyPlayed && state.recentlyPlayed.length > 0) {
        const lastFile = state.recentlyPlayed[0];
        const btn = document.querySelector(`.sound-btn[data-file="${encodeURIComponent(lastFile)}"]`);
        if (btn) {
            playSound(btn, 'replay_shortcut');
        }
    }
}

// Check URL hash for direct sound link
export function checkUrlHash() {
    const hash = window.location.hash;
    if (hash.startsWith('#sound=')) {
        const soundFile = decodeURIComponent(hash.substring(7));
        const sound = SOUNDS.find(s => s.file === soundFile);
        trackSharedLinkOpened(soundFile, sound);
        if (sound) {
            setTimeout(() => {
                const btn = document.querySelector(`.sound-btn[data-file="${encodeURIComponent(soundFile)}"]`);
                if (btn) {
                    // Scroll to the button
                    btn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // Play the sound (will show toast if muted)
                    playSound(btn, 'deep_link');
                }
            }, 500);
        }
    }
}

// Report a visit from a shared #sound= link; sound_found is false for stale or mistyped links
function trackSharedLinkOpened(soundFile, sound) {
    trackEvent('shared_sound_link_opened', {
        sound_file: truncateText(soundFile),
        sound_found: Boolean(sound),
        sound_name: sound ? sound.name : null,
        sound_category: sound ? sound.category : null,
        is_first_visit: !hasSeenOnboarding(localStorage),
        blocked_by_mute: state.isMuted,
        display_mode: getDisplayMode(),
    });
}
