// ============================================
// Analytics - Pendo Track Events
// ============================================

// Free text (search terms, error messages, URL values) is trimmed so event
// properties stay under Pendo's 512-byte limit, even with multi-byte characters
const MAX_TEXT_LENGTH = 50;

/**
 * Send a Pendo Track Event when the Pendo agent is available.
 * Analytics must never break the soundboard: without the agent this does
 * nothing, and agent errors are only logged.
 * @param {string} eventName - Registered Pendo event name, sent verbatim
 * @param {object} properties - Event metadata
 */
export function trackEvent(eventName, properties) {
    const pendo = window.pendo;
    if (typeof pendo?.track !== 'function') {
        return;
    }

    try {
        pendo.track(eventName, properties);
    } catch (err) {
        console.warn('Pendo track failed:', err);
    }
}

/**
 * Get how the app was opened, for segmenting installed-PWA usage
 * @returns {string} 'standalone' for the installed PWA, otherwise 'browser'
 */
export function getDisplayMode() {
    return window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser';
}

/**
 * Trim free text before sending it as an event property
 * @param {string} text - Text to trim
 * @returns {string} At most MAX_TEXT_LENGTH characters
 */
export function truncateText(text) {
    return String(text).slice(0, MAX_TEXT_LENGTH);
}
