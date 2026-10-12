/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import {
    setupFullDOM,
    resetState,
    resetElements,
    useFakeTimers,
    advanceTimers,
    mockRequestAnimationFrame,
    mockClipboard,
    mockFetch,
    mockWebShare,
    createMockBlob,
} from './helpers.js';
import { state, elements } from '../js/state.js';
import { SOUNDS } from '../js/constants.js';
import { VERSION } from '../js/version.js';
import { trackEvent, getDisplayMode, truncateText } from '../js/analytics.js';
import { cacheElements, renderCategories, renderFavoritesSection, renderPopularSection, shareSound } from '../js/ui.js';
import { renderNavigation } from '../js/navigation.js';
import { renderRecentlyPlayedSection } from '../js/recently-played.js';
import { setupAudioPlayer, playSound, playRandomSound, replayLastSound, checkUrlHash } from '../js/audio.js';
import { setupEventListeners } from '../js/events.js';
import { toggleFavorite, reorderFavorites, moveFavoriteUp, moveFavoriteDown, clearAllFavorites } from '../js/favorites.js';
import { filterSounds, resetSearchTracking } from '../js/search.js';
import { setupInstallPrompt, triggerInstall } from '../js/install.js';
import { showOnboardingTooltip, showOnboardingTooltipForced } from '../js/onboarding.js';

// Catalog sounds used as fixtures
const ACKNOWLEDGED = 'allies_1_achnoledged.wav'; // allies, popular, tagged
const AFFIRMATIVE = 'allies_1_affirmative.wav'; // allies, popular, tagged
const ACKNOWLEDGED_2 = 'allies_2_achnoledged.wav'; // allies, untagged
const REPORTING = 'soviet_1_reporting.wav'; // soviets, tagged

// Rendered button for a sound inside a section ('allies', 'popular', 'favorites', ...)
function soundButton(file, section) {
    return document.querySelector(`#category-${section} .sound-btn[data-file="${encodeURIComponent(file)}"]`);
}

// Render category sections containing the given catalog sounds
function renderSoundSections(sections) {
    elements.contentArea.innerHTML = Object.entries(sections).map(([category, files]) => `
        <section class="category-section" id="category-${category}" data-category="${category}">
            ${files.map(file => {
                const sound = SOUNDS.find(s => s.file === file);
                return `<div class="sound-btn-wrapper">
                    <button class="sound-btn" data-file="${encodeURIComponent(file)}" data-name="${sound.name}" data-category="${category}">${sound.name}</button>
                </div>`;
            }).join('')}
        </section>
    `).join('');
}

// Let pending promise callbacks run (play(), share and install flows)
async function flushPromises() {
    for (let i = 0; i < 10; i++) {
        await Promise.resolve();
    }
}

describe('Pendo Track Events', () => {
    const localThis = {};

    beforeEach(() => {
        localThis.track = jest.fn();
        window.pendo = { track: localThis.track };
        localThis.restoreMocks = [];
    });

    afterEach(() => {
        localThis.restoreMocks.forEach(restore => restore());
        delete window.pendo;
    });

    // Properties of each call the Pendo agent received for one event
    function trackedCalls(eventName) {
        return localThis.track.mock.calls
            .filter(([name]) => name === eventName)
            .map(([, properties]) => properties);
    }

    // Install a browser API mock from helpers.js and undo it after the test
    function withMock(mock) {
        localThis.restoreMocks.push(mock.restore);
        return mock;
    }

    // Report the installed PWA display mode for this test. window.matchMedia is
    // already a mock from setup.js, so it is swapped rather than spied on.
    function simulateStandalone() {
        const originalMatchMedia = window.matchMedia;
        window.matchMedia = jest.fn(() => ({ matches: true }));
        localThis.restoreMocks.push(() => {
            window.matchMedia = originalMatchMedia;
        });
    }

    describe('analytics helpers', () => {
        test('trackEvent passes the event name and properties to the Pendo agent', () => {
            trackEvent('sound_played', { sound_file: ACKNOWLEDGED });

            expect(localThis.track).toHaveBeenCalledWith('sound_played', { sound_file: ACKNOWLEDGED });
        });

        test('trackEvent does nothing when the Pendo agent is not loaded', () => {
            delete window.pendo;

            expect(() => trackEvent('sound_played', {})).not.toThrow();
        });

        test('trackEvent does nothing when the Pendo agent has no track function', () => {
            window.pendo = {};

            expect(() => trackEvent('sound_played', {})).not.toThrow();
        });

        test('trackEvent logs agent errors instead of throwing', () => {
            const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
            localThis.track.mockImplementation(() => {
                throw new Error('Agent failure');
            });

            expect(() => trackEvent('sound_played', {})).not.toThrow();
            expect(warnSpy).toHaveBeenCalledWith('Pendo track failed:', expect.any(Error));
        });

        test('getDisplayMode reports a browser tab by default', () => {
            expect(getDisplayMode()).toBe('browser');
        });

        test('getDisplayMode reports the installed PWA', () => {
            simulateStandalone();

            expect(getDisplayMode()).toBe('standalone');
            expect(window.matchMedia).toHaveBeenCalledWith('(display-mode: standalone)');
        });

        test('truncateText keeps short text and trims long text to 50 characters', () => {
            expect(truncateText('tanya')).toBe('tanya');
            expect(truncateText('x'.repeat(80))).toBe('x'.repeat(50));
        });
    });

    describe('playback events', () => {
        beforeEach(() => {
            setupFullDOM();
            resetState(state);
            resetElements(elements);
            cacheElements();
            setupAudioPlayer();
            renderCategories();
        });

        describe('sound_played', () => {
            test('fires once playback starts, with the sound details', async () => {
                playSound(soundButton(ACKNOWLEDGED, 'allies'));
                expect(trackedCalls('sound_played')).toEqual([]);

                await flushPromises();

                expect(trackedCalls('sound_played')).toEqual([{
                    sound_file: ACKNOWLEDGED,
                    sound_name: 'Acknowledged',
                    sound_category: 'allies',
                    source_section: 'allies',
                    trigger: 'click',
                    favorite_slot: null,
                    is_favorite: false,
                    is_popular: true,
                    active_search_term: '',
                    volume: 100,
                    sound_tags: ['iconic', 'voice', 'confirmation'],
                }]);
                expect(state.soundsPlayedWhileOffline).toBe(0);
            });

            test('reports the favorite slot, active search term and volume', async () => {
                state.favorites = [REPORTING, ACKNOWLEDGED_2];
                state.searchTerm = 'ack';
                state.audioPlayer.volume = 0.42;

                playSound(soundButton(ACKNOWLEDGED_2, 'allies'), 'favorite_hotkey');
                await flushPromises();

                expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                    sound_file: ACKNOWLEDGED_2,
                    trigger: 'favorite_hotkey',
                    favorite_slot: 2,
                    is_favorite: true,
                    is_popular: false,
                    active_search_term: 'ack',
                    volume: 42,
                    sound_tags: [],
                })]);
            });

            test('handles a button for a sound missing from the catalog', async () => {
                elements.contentArea.insertAdjacentHTML('beforeend', '<button class="sound-btn" data-file="custom.wav" data-name="Custom">Custom</button>');

                playSound(elements.contentArea.lastElementChild, 'keyboard');
                await flushPromises();

                expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                    sound_file: 'custom.wav',
                    sound_name: 'Custom',
                    sound_category: null,
                    trigger: 'keyboard',
                    sound_tags: [],
                })]);
            });

            test('does not fire when clicking the playing sound stops it', async () => {
                const btn = soundButton(ACKNOWLEDGED, 'allies');
                playSound(btn);
                await flushPromises();
                localThis.track.mockClear();

                playSound(btn);
                await flushPromises();

                expect(trackedCalls('sound_played')).toEqual([]);
            });

            test('counts sounds played while offline', async () => {
                jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

                playSound(soundButton(ACKNOWLEDGED, 'allies'));
                await flushPromises();

                expect(state.soundsPlayedWhileOffline).toBe(1);
                expect(trackedCalls('sound_played')).toHaveLength(1);
            });

            test('random plays report the random_button trigger by default', async () => {
                jest.spyOn(Math, 'random').mockReturnValue(0);

                playRandomSound();
                await flushPromises();

                expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                    sound_file: SOUNDS[0].file,
                    trigger: 'random_button',
                })]);
            });

            test('replays report the replay_shortcut trigger', async () => {
                state.recentlyPlayed = [REPORTING];

                replayLastSound();
                await flushPromises();

                expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                    sound_file: REPORTING,
                    trigger: 'replay_shortcut',
                })]);
            });
        });

        describe('sound_playback_failed', () => {
            beforeEach(() => {
                jest.spyOn(console, 'error').mockImplementation();
            });

            test('fires when play() is rejected, e.g. by the autoplay policy', async () => {
                const message = "play() failed because the user didn't interact with the document first.";
                state.audioPlayer.play = jest.fn().mockRejectedValue(new DOMException(message, 'NotAllowedError'));

                playSound(soundButton(ACKNOWLEDGED, 'allies'), 'deep_link');
                await flushPromises();

                expect(trackedCalls('sound_playback_failed')).toEqual([{
                    sound_file: ACKNOWLEDGED,
                    sound_name: 'Acknowledged',
                    trigger: 'deep_link',
                    error_name: 'NotAllowedError',
                    error_message: message.slice(0, 50),
                    media_error_code: null,
                    is_online: true,
                    display_mode: 'browser',
                }]);
                expect(trackedCalls('sound_played')).toEqual([]);
            });

            test('ignores AbortError from quickly switching or stopping sounds', async () => {
                state.audioPlayer.play = jest.fn().mockRejectedValue(
                    new DOMException('The play() request was interrupted by a new load request.', 'AbortError'),
                );

                playSound(soundButton(ACKNOWLEDGED, 'allies'));
                await flushPromises();

                expect(trackedCalls('sound_playback_failed')).toEqual([]);
            });

            test('fires on an <audio> error with the media error code', async () => {
                playSound(soundButton(ACKNOWLEDGED, 'allies'), 'replay_shortcut');
                await flushPromises();
                Object.defineProperty(state.audioPlayer, 'error', {
                    value: { code: 2, message: 'MEDIA_ELEMENT_ERROR: Network error' },
                    configurable: true,
                });
                jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);

                state.audioPlayer.dispatchEvent(new Event('error'));

                expect(trackedCalls('sound_playback_failed')).toEqual([{
                    sound_file: ACKNOWLEDGED,
                    sound_name: 'Acknowledged',
                    trigger: 'replay_shortcut',
                    error_name: 'MediaError',
                    error_message: 'MEDIA_ELEMENT_ERROR: Network error',
                    media_error_code: 2,
                    is_online: false,
                    display_mode: 'browser',
                }]);
            });

            test('reports an <audio> error that has no media error details', () => {
                playSound(soundButton(ACKNOWLEDGED, 'allies'));

                state.audioPlayer.dispatchEvent(new Event('error'));

                expect(trackedCalls('sound_playback_failed')).toEqual([expect.objectContaining({
                    error_name: 'MediaError',
                    error_message: '',
                    media_error_code: null,
                })]);
            });

            test('reports a failure once when the error event and the play() rejection both fire', async () => {
                const localPlay = {};
                state.audioPlayer.play = jest.fn(() => new Promise((resolve, reject) => {
                    localPlay.reject = reject;
                }));

                playSound(soundButton(ACKNOWLEDGED, 'allies'));
                state.audioPlayer.dispatchEvent(new Event('error'));
                localPlay.reject(new DOMException('Failed to load because no supported source was found.', 'NotSupportedError'));
                await flushPromises();

                expect(trackedCalls('sound_playback_failed')).toEqual([expect.objectContaining({ error_name: 'MediaError' })]);
            });

            test('ignores an <audio> error before any playback attempt', () => {
                state.audioPlayer.dispatchEvent(new Event('error'));

                expect(trackedCalls('sound_playback_failed')).toEqual([]);
            });
        });

        describe('sound_play_blocked_muted', () => {
            beforeEach(() => {
                state.isMuted = true;
            });

            test('fires instead of playing a sound button', () => {
                playSound(soundButton(ACKNOWLEDGED, 'allies'), 'favorite_hotkey');

                expect(trackedCalls('sound_play_blocked_muted')).toEqual([{
                    trigger: 'favorite_hotkey',
                    sound_file: ACKNOWLEDGED,
                    sound_name: 'Acknowledged',
                    source_section: 'allies',
                }]);
                expect(state.currentlyPlaying).toBeNull();
            });

            test('fires once per random sound request', () => {
                playRandomSound();
                playRandomSound('pwa_shortcut');

                expect(trackedCalls('sound_play_blocked_muted')).toEqual([
                    { trigger: 'random_button', sound_file: null, sound_name: null, source_section: null },
                    { trigger: 'pwa_shortcut', sound_file: null, sound_name: null, source_section: null },
                ]);
            });

            test('fires for a replay with the last played sound', () => {
                state.recentlyPlayed = [ACKNOWLEDGED];

                replayLastSound();

                expect(trackedCalls('sound_play_blocked_muted')).toEqual([{
                    trigger: 'replay_shortcut',
                    sound_file: ACKNOWLEDGED,
                    sound_name: 'Acknowledged',
                    source_section: null,
                }]);
            });

            test('fires for a replay without play history', () => {
                replayLastSound();

                expect(trackedCalls('sound_play_blocked_muted')).toEqual([{
                    trigger: 'replay_shortcut',
                    sound_file: null,
                    sound_name: null,
                    source_section: null,
                }]);
            });
        });
    });

    describe('volume_changed', () => {
        beforeEach(() => {
            setupFullDOM();
            resetState(state);
            resetElements(elements);
            localThis.volumeSlider = document.createElement('input');
            localThis.volumeSlider.type = 'range';
            localThis.volumeSlider.id = 'volume-slider';
            localThis.volumeSlider.value = '100';
            localThis.volumeToggle = document.createElement('button');
            localThis.volumeToggle.id = 'volume-toggle';
            localThis.volumeIcon = document.createElement('svg');
            localThis.volumeIcon.id = 'volume-icon';
            localThis.volumeToggle.appendChild(localThis.volumeIcon);
            document.body.append(localThis.volumeSlider, localThis.volumeToggle);
        });

        test('fires when the slider is released, not while dragging', () => {
            cacheElements();
            setupAudioPlayer();

            localThis.volumeSlider.value = '70';
            localThis.volumeSlider.dispatchEvent(new Event('input'));
            localThis.volumeSlider.value = '40';
            localThis.volumeSlider.dispatchEvent(new Event('input'));
            expect(trackedCalls('volume_changed')).toEqual([]);

            localThis.volumeSlider.dispatchEvent(new Event('change'));

            expect(trackedCalls('volume_changed')).toEqual([{
                volume: 40,
                previous_volume: 100,
                is_muted: false,
                method: 'slider',
            }]);
        });

        test('reports muting by dragging the slider to zero', () => {
            localStorage.setItem('soundboardVolume', '30');
            cacheElements();
            setupAudioPlayer();

            localThis.volumeSlider.value = '0';
            localThis.volumeSlider.dispatchEvent(new Event('input'));
            localThis.volumeSlider.dispatchEvent(new Event('change'));

            expect(trackedCalls('volume_changed')).toEqual([{
                volume: 0,
                previous_volume: 30,
                is_muted: true,
                method: 'slider',
            }]);
        });

        test('ignores a slider release that keeps the same level', () => {
            cacheElements();
            setupAudioPlayer();

            localThis.volumeSlider.dispatchEvent(new Event('change'));

            expect(trackedCalls('volume_changed')).toEqual([]);
        });

        test('tells mute from unmute on the toggle', () => {
            localThis.volumeSlider.value = '80';
            cacheElements();
            setupAudioPlayer();

            localThis.volumeToggle.click();
            localThis.volumeToggle.click();

            expect(trackedCalls('volume_changed')).toEqual([
                { volume: 0, previous_volume: 80, is_muted: true, method: 'mute_toggle' },
                { volume: 80, previous_volume: 0, is_muted: false, method: 'mute_toggle' },
            ]);
        });
    });

    describe('shared_sound_link_opened', () => {
        beforeEach(() => {
            setupFullDOM();
            resetState(state);
            resetElements(elements);
            Element.prototype.scrollIntoView = jest.fn();
            cacheElements();
            setupAudioPlayer();
            renderCategories();
            useFakeTimers();
        });

        afterEach(() => {
            window.location.hash = '';
        });

        test('fires on load and autoplays with the deep_link trigger', async () => {
            window.location.hash = `#sound=${encodeURIComponent(ACKNOWLEDGED)}`;

            checkUrlHash();

            expect(trackedCalls('shared_sound_link_opened')).toEqual([{
                sound_file: ACKNOWLEDGED,
                sound_found: true,
                sound_name: 'Acknowledged',
                sound_category: 'allies',
                is_first_visit: true,
                blocked_by_mute: false,
                display_mode: 'browser',
            }]);

            advanceTimers(500);
            await flushPromises();

            expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                sound_file: ACKNOWLEDGED,
                trigger: 'deep_link',
            })]);
        });

        test('reports a stale link that matches no sound', () => {
            window.location.hash = '#sound=missing.wav';

            checkUrlHash();

            expect(trackedCalls('shared_sound_link_opened')).toEqual([expect.objectContaining({
                sound_file: 'missing.wav',
                sound_found: false,
                sound_name: null,
                sound_category: null,
            })]);
        });

        test('reports returning visitors and links opened while muted', () => {
            localStorage.setItem('cnc-onboarding-seen', 'true');
            state.isMuted = true;
            window.location.hash = `#sound=${encodeURIComponent(ACKNOWLEDGED)}`;

            checkUrlHash();
            advanceTimers(500);

            expect(trackedCalls('shared_sound_link_opened')).toEqual([expect.objectContaining({
                is_first_visit: false,
                blocked_by_mute: true,
            })]);
            expect(trackedCalls('sound_play_blocked_muted')).toEqual([expect.objectContaining({ trigger: 'deep_link' })]);
        });

        test('trims an oversized link value', () => {
            window.location.hash = `#sound=${'x'.repeat(80)}`;

            checkUrlHash();

            expect(trackedCalls('shared_sound_link_opened')[0].sound_file).toBe('x'.repeat(50));
        });

        test('does not fire without a #sound= link', () => {
            window.location.hash = '#category-tanya';

            checkUrlHash();

            expect(trackedCalls('shared_sound_link_opened')).toEqual([]);
        });
    });

    describe('sound_search_performed', () => {
        beforeEach(() => {
            setupFullDOM();
            resetState(state);
            resetElements(elements);
            cacheElements();
            resetSearchTracking();
            useFakeTimers();
            localThis.restoreRAF = mockRequestAnimationFrame();
            // Acknowledged appears in two sections but is one result
            renderSoundSections({
                popular: [ACKNOWLEDGED],
                allies: [ACKNOWLEDGED, AFFIRMATIVE, ACKNOWLEDGED_2],
                soviets: [REPORTING],
            });
        });

        afterEach(() => {
            localThis.restoreRAF();
        });

        function search(term) {
            state.searchTerm = term;
            filterSounds();
        }

        test('fires once the term settles, counting each sound once', () => {
            search('acknow');
            advanceTimers(999);
            expect(trackedCalls('sound_search_performed')).toEqual([]);

            advanceTimers(1);

            expect(trackedCalls('sound_search_performed')).toEqual([{
                search_term: 'acknow',
                search_term_length: 6,
                results_count: 2,
                has_results: true,
                matched_category_count: 1,
                fuzzy_match_count: 0,
                tag_match_count: 0,
                total_sounds: SOUNDS.length,
            }]);
        });

        test('counts fuzzy and tag matches', () => {
            search('afirmative');
            advanceTimers(1000);
            search('voice');
            advanceTimers(1000);

            expect(trackedCalls('sound_search_performed')).toEqual([
                expect.objectContaining({
                    search_term: 'afirmative',
                    results_count: 1,
                    fuzzy_match_count: 1,
                    tag_match_count: 0,
                }),
                expect.objectContaining({
                    search_term: 'voice',
                    results_count: 3,
                    matched_category_count: 2,
                    fuzzy_match_count: 0,
                    tag_match_count: 3,
                }),
            ]);
        });

        test('reports searches with no results', () => {
            search('zzzzzz');
            advanceTimers(1000);

            expect(trackedCalls('sound_search_performed')).toEqual([expect.objectContaining({
                results_count: 0,
                has_results: false,
                matched_category_count: 0,
            })]);
        });

        test('does not report every prefix while typing', () => {
            search('af');
            advanceTimers(400);
            search('afi');
            advanceTimers(400);
            search('afirmative');
            advanceTimers(1000);

            expect(trackedCalls('sound_search_performed').map(properties => properties.search_term)).toEqual(['afirmative']);
        });

        test('skips a pending report when the user kept typing', () => {
            search('acknow');
            advanceTimers(900);
            // The input handler already updated the term; its debounced filter hasn't run yet
            state.searchTerm = 'acknowl';
            advanceTimers(100);

            expect(trackedCalls('sound_search_performed')).toEqual([]);
        });

        test('does not report the same term twice in a row', () => {
            search('acknow');
            advanceTimers(1000);
            filterSounds();
            advanceTimers(1000);

            expect(trackedCalls('sound_search_performed')).toHaveLength(1);
        });

        test('clearing the search cancels a pending report and allows the term again', () => {
            search('acknow');
            advanceTimers(500);
            search('');
            advanceTimers(1000);
            expect(trackedCalls('sound_search_performed')).toEqual([]);

            search('acknow');
            advanceTimers(1000);
            search('');
            search('acknow');
            advanceTimers(1000);

            expect(trackedCalls('sound_search_performed')).toHaveLength(2);
        });

        test('trims long search terms but keeps their length', () => {
            search('z'.repeat(80));
            advanceTimers(1000);

            expect(trackedCalls('sound_search_performed')).toEqual([expect.objectContaining({
                search_term: 'z'.repeat(50),
                search_term_length: 80,
            })]);
        });
    });

    describe('favorites events', () => {
        beforeEach(() => {
            setupFullDOM();
            resetState(state);
            resetElements(elements);
            cacheElements();
            renderCategories();
            renderNavigation();
        });

        test('sound_favorited reports the new slot and the section', () => {
            state.favorites = [REPORTING];

            toggleFavorite(ACKNOWLEDGED, 'popular');

            expect(trackedCalls('sound_favorited')).toEqual([{
                sound_file: ACKNOWLEDGED,
                sound_name: 'Acknowledged',
                sound_category: 'allies',
                favorites_count: 2,
                source_section: 'popular',
                favorite_slot: 2,
            }]);
            expect(trackedCalls('sound_unfavorited')).toEqual([]);
        });

        test('sound_unfavorited reports the slot the sound held', () => {
            state.favorites = [REPORTING, ACKNOWLEDGED, AFFIRMATIVE];

            toggleFavorite(ACKNOWLEDGED, 'favorites');

            expect(trackedCalls('sound_unfavorited')).toEqual([{
                sound_file: ACKNOWLEDGED,
                sound_name: 'Acknowledged',
                sound_category: 'allies',
                favorites_count: 2,
                source_section: 'favorites',
                previous_slot: 2,
            }]);
            expect(trackedCalls('sound_favorited')).toEqual([]);
        });

        test('favorite events tolerate an unknown sound and no section', () => {
            toggleFavorite('custom.wav');

            expect(trackedCalls('sound_favorited')).toEqual([{
                sound_file: 'custom.wav',
                sound_name: null,
                sound_category: null,
                favorites_count: 1,
                source_section: null,
                favorite_slot: 1,
            }]);
        });

        test('favorites_reordered reports keyboard moves', () => {
            state.favorites = [ACKNOWLEDGED, AFFIRMATIVE, REPORTING];
            renderFavoritesSection();

            moveFavoriteUp(REPORTING);
            moveFavoriteDown(ACKNOWLEDGED);

            expect(trackedCalls('favorites_reordered')).toEqual([
                {
                    method: 'keyboard',
                    sound_file: REPORTING,
                    sound_name: 'Reporting',
                    from_position: 3,
                    to_position: 2,
                    favorites_count: 3,
                },
                {
                    method: 'keyboard',
                    sound_file: ACKNOWLEDGED,
                    sound_name: 'Acknowledged',
                    from_position: 1,
                    to_position: 2,
                    favorites_count: 3,
                },
            ]);
        });

        test('favorites_reordered ignores keyboard moves past either end', () => {
            state.favorites = [ACKNOWLEDGED, AFFIRMATIVE];

            moveFavoriteUp(ACKNOWLEDGED);
            moveFavoriteDown(AFFIRMATIVE);

            expect(trackedCalls('favorites_reordered')).toEqual([]);
        });

        test('favorites_reordered reports drag and drop', () => {
            state.favorites = [ACKNOWLEDGED, AFFIRMATIVE, REPORTING];
            renderFavoritesSection();
            const wrappers = document.querySelectorAll('#category-favorites .sound-btn-wrapper');

            const dragStartEvent = new Event('dragstart', { bubbles: true });
            dragStartEvent.dataTransfer = { effectAllowed: '', setData: () => undefined };
            wrappers[2].dispatchEvent(dragStartEvent);
            const dropEvent = new Event('drop', { bubbles: true, cancelable: true });
            dropEvent.dataTransfer = { dropEffect: '' };
            wrappers[0].dispatchEvent(dropEvent);

            expect(state.favorites).toEqual([REPORTING, ACKNOWLEDGED, AFFIRMATIVE]);
            expect(trackedCalls('favorites_reordered')).toEqual([{
                method: 'drag_and_drop',
                sound_file: REPORTING,
                sound_name: 'Reporting',
                from_position: 3,
                to_position: 1,
                favorites_count: 3,
            }]);
        });

        test('favorites_reordered ignores a reorder that changes nothing', () => {
            state.favorites = [ACKNOWLEDGED, AFFIRMATIVE];

            reorderFavorites('custom.wav', ACKNOWLEDGED);

            expect(trackedCalls('favorites_reordered')).toEqual([]);
        });

        test('favorites_reordered tolerates an unknown sound', () => {
            state.favorites = ['custom.wav', ACKNOWLEDGED];

            reorderFavorites('custom.wav', ACKNOWLEDGED);

            expect(trackedCalls('favorites_reordered')).toEqual([expect.objectContaining({
                sound_file: 'custom.wav',
                sound_name: null,
                from_position: 1,
                to_position: 2,
            })]);
        });

        describe('favorites_cleared', () => {
            beforeEach(() => {
                document.body.insertAdjacentHTML('beforeend', `
                    <div id="confirm-modal">
                        <h2 id="confirm-title"></h2>
                        <p id="confirm-message"></p>
                        <button id="confirm-execute">EXECUTE</button>
                        <button id="confirm-abort">ABORT</button>
                    </div>
                `);
            });

            test('fires with the cleared count when the user confirms', async () => {
                state.favorites = [ACKNOWLEDGED, AFFIRMATIVE];

                const clearing = clearAllFavorites();
                document.getElementById('confirm-execute').click();
                await clearing;

                expect(trackedCalls('favorites_cleared')).toEqual([{ cleared_count: 2 }]);
            });

            test('does not fire when the user aborts', async () => {
                state.favorites = [ACKNOWLEDGED];

                const clearing = clearAllFavorites();
                document.getElementById('confirm-abort').click();
                await clearing;

                expect(trackedCalls('favorites_cleared')).toEqual([]);
                expect(state.favorites).toEqual([ACKNOWLEDGED]);
            });

            test('does not fire when there is nothing to clear', async () => {
                await clearAllFavorites();

                expect(trackedCalls('favorites_cleared')).toEqual([]);
            });
        });
    });

    describe('share events', () => {
        beforeEach(() => {
            setupFullDOM();
            resetState(state);
            resetElements(elements);
            cacheElements();
        });

        test('sound_shared reports a Web Share with the audio file', async () => {
            withMock(mockFetch({ blob: createMockBlob() }));
            withMock(mockWebShare({ canShare: true }));

            await shareSound(ACKNOWLEDGED, 'Acknowledged', 'allies');

            expect(trackedCalls('sound_shared')).toEqual([{
                sound_file: ACKNOWLEDGED,
                sound_name: 'Acknowledged',
                sound_category: 'allies',
                source_section: 'allies',
                share_method: 'web_share_file',
                web_share_fallback_used: false,
            }]);
        });

        test('sound_shared reports a Web Share of the link only', async () => {
            withMock(mockFetch({ blob: createMockBlob() }));
            withMock(mockWebShare({ canShare: false }));

            await shareSound(ACKNOWLEDGED, 'Acknowledged', 'popular');

            expect(trackedCalls('sound_shared')).toEqual([expect.objectContaining({
                source_section: 'popular',
                share_method: 'web_share_link',
                web_share_fallback_used: false,
            })]);
        });

        test('sound_shared reports a copied link when Web Share is unavailable', async () => {
            withMock(mockClipboard());

            await shareSound('custom.wav', 'Custom');

            expect(trackedCalls('sound_shared')).toEqual([{
                sound_file: 'custom.wav',
                sound_name: null,
                sound_category: null,
                source_section: null,
                share_method: 'clipboard_link',
                web_share_fallback_used: false,
            }]);
        });

        test('sound_shared flags the clipboard fallback after a Web Share failure', async () => {
            withMock(mockFetch({ blob: createMockBlob() }));
            withMock(mockWebShare({ shouldFail: true }));
            withMock(mockClipboard());

            await shareSound(ACKNOWLEDGED, 'Acknowledged', 'recent');

            expect(trackedCalls('sound_shared')).toEqual([expect.objectContaining({
                share_method: 'clipboard_link',
                web_share_fallback_used: true,
            })]);
        });

        test('neither event fires when the user cancels the share sheet', async () => {
            withMock(mockFetch({ blob: createMockBlob() }));
            withMock(mockWebShare({ shouldAbort: true }));

            await shareSound(ACKNOWLEDGED, 'Acknowledged', 'allies');

            expect(trackedCalls('sound_shared')).toEqual([]);
            expect(trackedCalls('sound_share_failed')).toEqual([]);
        });

        test('sound_share_failed records the Web Share error that led to the fallback', async () => {
            withMock(mockFetch({ shouldFail: true })).fetch.mockRejectedValue(new TypeError('Failed to fetch'));
            withMock(mockWebShare());
            withMock(mockClipboard({ shouldFail: true })).writeText.mockRejectedValue(
                new DOMException('Write permission denied.', 'NotAllowedError'),
            );

            await shareSound(ACKNOWLEDGED, 'Acknowledged', 'recent');

            expect(trackedCalls('sound_share_failed')).toEqual([{
                sound_file: ACKNOWLEDGED,
                sound_name: 'Acknowledged',
                error_name: 'NotAllowedError',
                web_share_supported: true,
                web_share_error_name: 'TypeError',
                source_section: 'recent',
            }]);
            expect(trackedCalls('sound_shared')).toEqual([]);
        });

        test('sound_share_failed without Web Share support', async () => {
            withMock(mockClipboard({ shouldFail: true }));

            await shareSound(ACKNOWLEDGED, 'Acknowledged', 'allies');

            expect(trackedCalls('sound_share_failed')).toEqual([expect.objectContaining({
                error_name: 'Error',
                web_share_supported: false,
                web_share_error_name: null,
            })]);
        });
    });

    describe('event listener tracking', () => {
        // Each setupEventListeners() call adds another document keydown listener,
        // so listeners are attached once to report every shortcut exactly once
        beforeAll(() => {
            setupFullDOM();
            resetState(state);
            resetElements(elements);
            cacheElements();
            setupAudioPlayer();
            renderCategories();
            renderPopularSection();
            setupEventListeners();
        });

        beforeEach(() => {
            resetState(state);
            state.audioPlayer = elements.audioPlayer;
            renderFavoritesSection();
            renderRecentlyPlayedSection();
            elements.searchInput.blur();
        });

        test('clicking a sound reports the click trigger and its section', async () => {
            soundButton(ACKNOWLEDGED, 'popular').click();
            await flushPromises();

            expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                sound_file: ACKNOWLEDGED,
                trigger: 'click',
                source_section: 'popular',
            })]);
        });

        test('Enter on a sound reports the keyboard trigger', async () => {
            soundButton(REPORTING, 'soviets').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await flushPromises();

            expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                sound_file: REPORTING,
                trigger: 'keyboard',
                source_section: 'soviets',
            })]);
        });

        test('Space on a focused sound plays it once, without the replay shortcut', async () => {
            const btn = soundButton(REPORTING, 'soviets');

            btn.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
            await flushPromises();

            expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
            expect(state.currentlyPlaying).toBe(btn);
            expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                sound_file: REPORTING,
                trigger: 'keyboard',
            })]);
            expect(trackedCalls('keyboard_shortcut_used')).toEqual([]);
        });

        test('Space on a category header or CLEAR does not trigger the replay shortcut', () => {
            jest.spyOn(window, 'confirm').mockReturnValue(false);
            state.favorites = [ACKNOWLEDGED];
            renderFavoritesSection();
            const header = document.querySelector('#category-allies .category-header');

            // Collapse and expand again so later tests see the section unchanged
            header.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
            header.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
            document.getElementById('btn-clear-favorites').dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));

            expect(trackedCalls('keyboard_shortcut_used')).toEqual([]);
        });

        test('the RANDOM button reports the random_button trigger', async () => {
            jest.spyOn(Math, 'random').mockReturnValue(0);

            elements.randomSoundBtn.click();
            await flushPromises();

            expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                sound_file: SOUNDS[0].file,
                trigger: 'random_button',
            })]);
        });

        test('share clicks report the section they came from', async () => {
            withMock(mockClipboard());

            document.querySelector('#category-allies .share-btn').click();
            await flushPromises();

            expect(trackedCalls('sound_shared')).toEqual([expect.objectContaining({
                sound_file: ACKNOWLEDGED,
                source_section: 'allies',
                share_method: 'clipboard_link',
            })]);
        });

        test('Enter on a share button reports its section', async () => {
            withMock(mockClipboard());

            document.querySelector('#category-soviets .share-btn').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
            await flushPromises();

            expect(trackedCalls('sound_shared')).toEqual([expect.objectContaining({ source_section: 'soviets' })]);
        });

        test('star clicks report the section they came from', () => {
            state.recentlyPlayed = [AFFIRMATIVE];
            renderRecentlyPlayedSection();

            document.querySelector('#category-recent .favorite-btn').click();

            expect(trackedCalls('sound_favorited')).toEqual([expect.objectContaining({
                sound_file: AFFIRMATIVE,
                source_section: 'recent',
            })]);
        });

        test('Enter on a star in Favorites reports the favorites section', () => {
            state.favorites = [AFFIRMATIVE];
            renderFavoritesSection();

            document.querySelector('#category-favorites .favorite-btn').dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

            expect(trackedCalls('sound_unfavorited')).toEqual([expect.objectContaining({
                sound_file: AFFIRMATIVE,
                source_section: 'favorites',
            })]);
        });

        test('a star outside any section reports no section', () => {
            elements.contentArea.insertAdjacentHTML('beforeend', `<button class="favorite-btn" data-file="${REPORTING}">Star</button>`);
            const star = elements.contentArea.lastElementChild;

            star.click();
            star.remove();

            expect(trackedCalls('sound_favorited')).toEqual([expect.objectContaining({
                sound_file: REPORTING,
                source_section: null,
            })]);
        });

        describe('keyboard_shortcut_used', () => {
            function pressKey(key, options = {}) {
                document.dispatchEvent(new KeyboardEvent('keydown', { key, ...options }));
            }

            test('Escape reports stopping playback', () => {
                playSound(soundButton(ACKNOWLEDGED, 'allies'));

                pressKey('Escape');

                expect(state.currentlyPlaying).toBeNull();
                expect(trackedCalls('keyboard_shortcut_used')).toEqual([{
                    shortcut: 'escape',
                    action: 'stop_playback',
                    favorite_slot: null,
                    had_effect: true,
                }]);
            });

            test('Escape with nothing playing is reported without effect', () => {
                pressKey('Escape');

                expect(trackedCalls('keyboard_shortcut_used')).toEqual([expect.objectContaining({
                    action: 'stop_playback',
                    had_effect: false,
                })]);
            });

            test('Escape reports closing the shortcuts and contact modals', () => {
                document.body.insertAdjacentHTML('beforeend', `
                    <div id="shortcuts-modal" class="visible"></div>
                    <div id="contact-modal" class="visible"></div>
                `);

                pressKey('Escape');
                pressKey('Escape');
                document.getElementById('shortcuts-modal').remove();
                document.getElementById('contact-modal').remove();

                expect(trackedCalls('keyboard_shortcut_used')).toEqual([
                    { shortcut: 'escape', action: 'close_shortcuts_modal', favorite_slot: null, had_effect: true },
                    { shortcut: 'escape', action: 'close_contact_modal', favorite_slot: null, had_effect: true },
                ]);
            });

            test('Ctrl/Cmd+F and ? report their actions', () => {
                document.body.insertAdjacentHTML('beforeend', '<div id="shortcuts-modal"></div>');

                pressKey('f', { ctrlKey: true });
                elements.searchInput.blur();
                pressKey('?');
                document.getElementById('shortcuts-modal').remove();

                expect(trackedCalls('keyboard_shortcut_used')).toEqual([
                    { shortcut: 'ctrl_cmd_f', action: 'focus_search', favorite_slot: null, had_effect: true },
                    { shortcut: 'question_mark', action: 'open_shortcuts_help', favorite_slot: null, had_effect: true },
                ]);
            });

            test('Space reports replaying the last sound', async () => {
                state.recentlyPlayed = [REPORTING];

                pressKey(' ');
                await flushPromises();

                expect(trackedCalls('keyboard_shortcut_used')).toEqual([{
                    shortcut: 'space',
                    action: 'replay_last_sound',
                    favorite_slot: null,
                    had_effect: true,
                }]);
                expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                    sound_file: REPORTING,
                    trigger: 'replay_shortcut',
                })]);
            });

            test('Space without play history or while muted has no effect', () => {
                pressKey(' ');
                state.recentlyPlayed = [REPORTING];
                state.isMuted = true;
                pressKey(' ');

                expect(trackedCalls('keyboard_shortcut_used')).toEqual([
                    expect.objectContaining({ shortcut: 'space', had_effect: false }),
                    expect.objectContaining({ shortcut: 'space', had_effect: false }),
                ]);
                expect(trackedCalls('sound_play_blocked_muted')).toEqual([expect.objectContaining({ trigger: 'replay_shortcut' })]);
            });

            test('number keys report the favorite slot they play', async () => {
                state.favorites = [AFFIRMATIVE];
                renderFavoritesSection();

                pressKey('1');
                pressKey('5');
                await flushPromises();

                expect(trackedCalls('keyboard_shortcut_used')).toEqual([
                    { shortcut: 'number_key', action: 'play_favorite', favorite_slot: 1, had_effect: true },
                    { shortcut: 'number_key', action: 'play_favorite', favorite_slot: 5, had_effect: false },
                ]);
                expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({
                    sound_file: AFFIRMATIVE,
                    trigger: 'favorite_hotkey',
                    source_section: 'favorites',
                    favorite_slot: 1,
                })]);
            });

            test('a held key is reported once, not on every auto-repeat', () => {
                pressKey('Escape', { repeat: true });

                expect(trackedCalls('keyboard_shortcut_used')).toEqual([]);
            });
        });
    });

    describe('PWA install events', () => {
        // Each setupInstallPrompt() call adds another 'appinstalled' listener, so it runs once
        beforeAll(() => {
            setupFullDOM();
            resetElements(elements);
            cacheElements();
            setupInstallPrompt();
        });

        beforeEach(() => {
            resetState(state);
        });

        function deferredPrompt(choice) {
            return { prompt: jest.fn(), userChoice: Promise.resolve(choice) };
        }

        test('reports an accepted prompt from the install modal, then the install', async () => {
            localStorage.setItem('installPromptDismissed', '1700000000000');
            state.favorites = [ACKNOWLEDGED, AFFIRMATIVE];
            state.recentlyPlayed = [ACKNOWLEDGED];
            state.deferredInstallPrompt = deferredPrompt({ outcome: 'accepted', platform: 'web' });

            elements.btnInstall.click();
            await flushPromises();
            window.dispatchEvent(new Event('appinstalled'));

            expect(trackedCalls('pwa_install_prompt_responded')).toEqual([{
                outcome: 'accepted',
                platform: 'web',
                prompt_source: 'install_modal',
                previously_dismissed: true,
                favorites_count: 2,
                recently_played_count: 1,
            }]);
            expect(trackedCalls('pwa_installed')).toEqual([{
                install_source: 'in_app_prompt',
                favorites_count: 2,
                recently_played_count: 1,
                app_version: VERSION,
            }]);
        });

        test('reports a dismissed prompt from the header button', async () => {
            state.deferredInstallPrompt = deferredPrompt({ outcome: 'dismissed', platform: 'web' });

            elements.installBtn.click();
            await flushPromises();
            // A later install from the browser's own UI is not credited to the prompt
            window.dispatchEvent(new Event('appinstalled'));

            expect(trackedCalls('pwa_install_prompt_responded')).toEqual([{
                outcome: 'dismissed',
                platform: 'web',
                prompt_source: 'header_button',
                previously_dismissed: false,
                favorites_count: 0,
                recently_played_count: 0,
            }]);
            expect(trackedCalls('pwa_installed')).toEqual([expect.objectContaining({ install_source: 'browser_ui' })]);
        });

        test('credits the prompt when appinstalled fires before userChoice settles', async () => {
            const localChoice = {};
            state.deferredInstallPrompt = {
                prompt: jest.fn(),
                userChoice: new Promise(resolve => {
                    localChoice.resolve = resolve;
                }),
            };

            const installing = triggerInstall();
            window.dispatchEvent(new Event('appinstalled'));
            localChoice.resolve({ outcome: 'accepted', platform: 'web' });
            await installing;

            expect(trackedCalls('pwa_installed')).toEqual([expect.objectContaining({ install_source: 'in_app_prompt' })]);
            expect(trackedCalls('pwa_install_prompt_responded')).toEqual([expect.objectContaining({
                outcome: 'accepted',
                prompt_source: null,
            })]);
        });

        test('reports installs started from the browser UI', () => {
            window.dispatchEvent(new Event('appinstalled'));

            expect(trackedCalls('pwa_installed')).toEqual([expect.objectContaining({ install_source: 'browser_ui' })]);
        });

        test('does not fire without a deferred install prompt', async () => {
            await triggerInstall('install_modal');

            expect(trackedCalls('pwa_install_prompt_responded')).toEqual([]);
        });
    });

    describe('onboarding_dismissed', () => {
        beforeEach(() => {
            // Escape also bubbles to the app's global shortcut handler, which uses the player
            setupFullDOM();
            resetState(state);
            resetElements(elements);
            cacheElements();
            state.audioPlayer = elements.audioPlayer;
            useFakeTimers();
        });

        test('reports the ACKNOWLEDGED button and how long the briefing was visible', () => {
            showOnboardingTooltip();
            advanceTimers(4000);

            document.getElementById('onboarding-dismiss').click();

            expect(trackedCalls('onboarding_dismissed')).toEqual([{
                dismiss_method: 'button',
                is_replay: false,
                visible_duration_ms: 4000,
            }]);
        });

        test('reports Escape', () => {
            showOnboardingTooltip();
            advanceTimers(2500);

            document.getElementById('onboarding-tooltip').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

            expect(trackedCalls('onboarding_dismissed')).toEqual([{
                dismiss_method: 'escape',
                is_replay: false,
                visible_duration_ms: 2500,
            }]);
        });

        test('reports the 30-second auto-dismiss', () => {
            showOnboardingTooltip();
            advanceTimers(30000);

            expect(trackedCalls('onboarding_dismissed')).toEqual([{
                dismiss_method: 'auto_timeout',
                is_replay: false,
                visible_duration_ms: 30000,
            }]);
        });

        test('reports dismissals of the briefing replayed from the shortcuts modal', () => {
            showOnboardingTooltipForced();
            advanceTimers(1000);
            document.getElementById('onboarding-dismiss').click();
            advanceTimers(300);

            showOnboardingTooltipForced();
            document.getElementById('onboarding-tooltip').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
            advanceTimers(300);

            showOnboardingTooltipForced();
            advanceTimers(30000);

            expect(trackedCalls('onboarding_dismissed')).toEqual([
                { dismiss_method: 'button', is_replay: true, visible_duration_ms: 1000 },
                { dismiss_method: 'escape', is_replay: true, visible_duration_ms: 0 },
                { dismiss_method: 'auto_timeout', is_replay: true, visible_duration_ms: 30000 },
            ]);
        });

        test('counts a briefing once when it is dismissed again while hiding', () => {
            showOnboardingTooltip();

            document.getElementById('onboarding-dismiss').click();
            document.getElementById('onboarding-tooltip').dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

            expect(trackedCalls('onboarding_dismissed')).toEqual([expect.objectContaining({ dismiss_method: 'button' })]);
        });
    });

    // Kept last: importing main.js runs init(), which attaches app-wide listeners
    describe('main.js events', () => {
        beforeEach(async () => {
            setupFullDOM();
            resetState(state);
            resetElements(elements);
            cacheElements();
            localThis.mainModule = await import('../js/main.js');
        });

        afterEach(() => {
            window.history.replaceState({}, '', '/');
        });

        test('initializes safely when Pendo only exposes tracking', () => {
            expect(() => localThis.mainModule.init()).not.toThrow();
        });

        test('app_connection_restored summarizes the offline period', () => {
            useFakeTimers();
            window.dispatchEvent(new Event('offline'));
            state.soundsPlayedWhileOffline = 2;
            advanceTimers(90400);

            window.dispatchEvent(new Event('online'));

            expect(trackedCalls('app_connection_restored')).toEqual([{
                offline_duration_seconds: 90,
                sounds_played_while_offline: 2,
                display_mode: 'browser',
                app_version: VERSION,
            }]);
            expect(state.offlineSince).toBeNull();
            expect(state.soundsPlayedWhileOffline).toBe(0);
        });

        test('app_connection_restored fires once per offline period', () => {
            window.dispatchEvent(new Event('offline'));
            window.dispatchEvent(new Event('online'));
            window.dispatchEvent(new Event('online'));

            expect(trackedCalls('app_connection_restored')).toHaveLength(1);
        });

        test('app_connection_restored covers an app launched without a connection', () => {
            useFakeTimers();
            const onLineSpy = jest.spyOn(navigator, 'onLine', 'get').mockReturnValue(false);
            localThis.mainModule.init();
            onLineSpy.mockReturnValue(true);
            advanceTimers(5000);

            window.dispatchEvent(new Event('online'));

            expect(trackedCalls('app_connection_restored')).toEqual([expect.objectContaining({
                offline_duration_seconds: 5,
                sounds_played_while_offline: 0,
            })]);
        });

        test('pwa_shortcut_launched reports the random action, which plays with the pwa_shortcut trigger', async () => {
            useFakeTimers();
            jest.spyOn(Math, 'random').mockReturnValue(0);
            setupAudioPlayer();
            renderCategories();
            window.history.pushState({}, '', '/?action=random');

            localThis.mainModule.handleShortcutActions();
            advanceTimers(500);
            await flushPromises();

            expect(trackedCalls('pwa_shortcut_launched')).toEqual([{ action: 'random', display_mode: 'browser' }]);
            expect(trackedCalls('sound_played')).toEqual([expect.objectContaining({ trigger: 'pwa_shortcut' })]);
        });

        test('pwa_shortcut_launched reports search, unknown and Favorites launches', () => {
            simulateStandalone();

            window.history.pushState({}, '', '/?action=search');
            localThis.mainModule.handleShortcutActions();
            window.history.pushState({}, '', '/?action=unknown');
            localThis.mainModule.handleShortcutActions();
            window.history.pushState({}, '', '/#category-favorites');
            localThis.mainModule.handleShortcutActions();

            expect(trackedCalls('pwa_shortcut_launched')).toEqual([
                { action: 'search', display_mode: 'standalone' },
                { action: 'unknown', display_mode: 'standalone' },
                { action: 'favorites', display_mode: 'standalone' },
            ]);
        });

        test('pwa_shortcut_launched does not fire for a normal launch', () => {
            window.history.pushState({}, '', '/#category-tanya');

            localThis.mainModule.handleShortcutActions();

            expect(trackedCalls('pwa_shortcut_launched')).toEqual([]);
        });
    });
});
