/**
 * Shared test helpers for C&C Red Alert Soundboard tests
 */
import { jest } from '@jest/globals';

// Set up full DOM for integration tests
export function setupFullDOM() {
    document.body.innerHTML = `
        <h1 class="visually-hidden">C&C Red Alert Soundboard</h1>
        <div id="content-area"></div>
        <nav id="category-nav"><div class="nav-header">CATEGORIES</div></nav>
        <input id="search-input" />
        <button id="clear-search"></button>
        <button id="install-btn" class="btn-install-header"></button>
        <div id="now-playing"></div>
        <span id="now-playing-title">-</span>
        <audio id="audio-player"></audio>
        <div id="install-prompt"></div>
        <button id="btn-install"></button>
        <button id="btn-dismiss"></button>
        <div id="toast-container"></div>
        <button id="mobile-menu-toggle" aria-expanded="false"></button>
        <div id="mobile-menu-overlay"></div>
        <div id="sidebar" class="sidebar" role="dialog" aria-label="Categories menu" aria-hidden="true"></div>
        <div id="search-empty-state" style="display: none;">
            <span id="search-empty-term"></span>
        </div>
        <button id="btn-clear-search"></button>
        <button id="random-sound"></button>
        <button id="back-to-top" class="btn-back-to-top" style="display: none;"></button>
        <div id="search-announcer" class="visually-hidden" aria-live="polite" aria-atomic="true"></div>
        <div id="category-announcer" class="visually-hidden" aria-live="polite"></div>
    `;
}

// Create mock storage for localStorage tests
export function createMockStorage() {
    return {
        store: {},
        getItem: jest.fn(function(key) {
            return this.store[key] || null;
        }),
        setItem: jest.fn(function(key, value) {
            this.store[key] = value;
        }),
        clear: jest.fn(function() {
            this.store = {};
        }),
    };
}

// Reset state
export function resetState(state) {
    state.audioPlayer = null;
    state.currentlyPlaying = null;
    state.searchTerm = '';
    state.deferredInstallPrompt = null;
    state.favorites = [];
    state.recentlyPlayed = [];
    state.isMuted = false;
}

// Reset elements
export function resetElements(elements) {
    elements.contentArea = null;
    elements.categoryNav = null;
    elements.searchInput = null;
    elements.clearSearch = null;
    elements.nowPlaying = null;
    elements.nowPlayingTitle = null;
    elements.audioPlayer = null;
    elements.installPrompt = null;
    elements.btnInstall = null;
    elements.btnDismiss = null;
    elements.installBtn = null;
    elements.toastContainer = null;
    elements.mobileMenuToggle = null;
    elements.mobileMenuOverlay = null;
    elements.sidebar = null;
    elements.searchEmptyState = null;
    elements.searchEmptyTerm = null;
    elements.btnClearSearch = null;
    elements.randomSoundBtn = null;
}

/**
 * Mock requestAnimationFrame to execute callbacks synchronously
 * Useful for testing code that batches DOM updates with rAF
 */
export function mockRequestAnimationFrame() {
    const originalRAF = window.requestAnimationFrame;
    window.requestAnimationFrame = (callback) => {
        callback(performance.now());
        return 0;
    };
    return () => {
        window.requestAnimationFrame = originalRAF;
    };
}

/**
 * Enable Jest fake timers for testing setTimeout/setInterval
 * Call in beforeEach or at the start of a test
 */
export function useFakeTimers() {
    jest.useFakeTimers();
}

/**
 * Restore real timers after using fake timers
 * Call in afterEach or at the end of a test
 */
export function useRealTimers() {
    jest.useRealTimers();
}

/**
 * Advance fake timers by specified milliseconds
 * @param {number} ms - Milliseconds to advance
 */
export function advanceTimers(ms) {
    jest.advanceTimersByTime(ms);
}

/**
 * Run all pending timers (setTimeout, setInterval)
 */
export function runAllTimers() {
    jest.runAllTimers();
}

/**
 * Run only pending timers (not newly created ones)
 */
export function runOnlyPendingTimers() {
    jest.runOnlyPendingTimers();
}

/**
 * Flush all promises and timers - useful for async code with timers
 */
export async function flushPromisesAndTimers() {
    jest.runAllTimers();
    await Promise.resolve();
}

/**
 * Mock clipboard API for testing copy/paste functionality
 * @param {Object} options - Mock options
 * @param {boolean} [options.shouldFail=false] - Whether writeText should reject
 * @returns {Object} - Object with mock function and cleanup
 */
export function mockClipboard(options = {}) {
    const { shouldFail = false } = options;
    const originalClipboard = navigator.clipboard;

    const writeTextMock = shouldFail
        ? jest.fn().mockRejectedValue(new Error('Clipboard write failed'))
        : jest.fn().mockResolvedValue();

    Object.assign(navigator, {
        clipboard: { writeText: writeTextMock },
    });

    return {
        writeText: writeTextMock,
        restore: () => {
            Object.assign(navigator, { clipboard: originalClipboard });
        },
    };
}

/**
 * Mock fetch API for testing network requests
 * @param {Object} options - Mock options
 * @param {*} [options.response] - Response data
 * @param {boolean} [options.shouldFail=false] - Whether fetch should reject
 * @param {Blob} [options.blob] - Blob to return from response.blob()
 * @returns {Object} - Object with mock function and cleanup
 */
export function mockFetch(options = {}) {
    const { response, shouldFail = false, blob } = options;
    const originalFetch = global.fetch;

    let fetchMock;
    if (shouldFail) {
        fetchMock = jest.fn().mockRejectedValue(new Error('Fetch failed'));
    } else if (blob) {
        fetchMock = jest.fn().mockResolvedValue({
            blob: () => Promise.resolve(blob),
        });
    } else {
        fetchMock = jest.fn().mockResolvedValue(response);
    }

    global.fetch = fetchMock;

    return {
        fetch: fetchMock,
        restore: () => {
            global.fetch = originalFetch;
        },
    };
}

/**
 * Mock Web Share API for testing share functionality
 * @param {Object} options - Mock options
 * @param {boolean} [options.canShare=true] - Whether canShare returns true
 * @param {boolean} [options.shouldFail=false] - Whether share should reject
 * @param {boolean} [options.shouldAbort=false] - Whether share should reject with AbortError
 * @returns {Object} - Object with mock functions and cleanup
 */
export function mockWebShare(options = {}) {
    const { canShare = true, shouldFail = false, shouldAbort = false } = options;
    const originalShare = navigator.share;
    const originalCanShare = navigator.canShare;

    let shareMock;
    if (shouldAbort) {
        const abortError = new Error('Share cancelled');
        abortError.name = 'AbortError';
        shareMock = jest.fn().mockRejectedValue(abortError);
    } else if (shouldFail) {
        shareMock = jest.fn().mockRejectedValue(new Error('Share failed'));
    } else {
        shareMock = jest.fn().mockResolvedValue();
    }

    const canShareMock = jest.fn().mockReturnValue(canShare);

    Object.assign(navigator, {
        share: shareMock,
        canShare: canShareMock,
    });

    return {
        share: shareMock,
        canShare: canShareMock,
        restore: () => {
            Object.assign(navigator, {
                share: originalShare,
                canShare: originalCanShare,
            });
        },
    };
}

/**
 * Create a mock blob for testing file operations
 * @param {string} [content='audio data'] - Content of the blob
 * @param {string} [type='audio/wav'] - MIME type
 * @returns {Blob}
 */
export function createMockBlob(content = 'audio data', type = 'audio/wav') {
    return new Blob([content], { type });
}
