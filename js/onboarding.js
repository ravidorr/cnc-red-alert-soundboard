// ============================================
// Onboarding - First-time user onboarding tooltip
// ============================================

import { createFocusTrap } from './utils.js';
import { trackEvent } from './analytics.js';

const ONBOARDING_KEY = 'cnc-onboarding-seen';

/**
 * Check if onboarding has been shown
 * @param {Storage} storage - localStorage or mock
 * @returns {boolean}
 */
export function hasSeenOnboarding(storage) {
    return storage.getItem(ONBOARDING_KEY) === 'true';
}

/**
 * Mark onboarding as seen
 * @param {Storage} storage - localStorage or mock
 */
export function markOnboardingSeen(storage) {
    storage.setItem(ONBOARDING_KEY, 'true');
}

/**
 * Show onboarding tooltip for first-time users
 */
export function showOnboardingTooltip() {
    if (hasSeenOnboarding(localStorage)) {
        return;
    }

    // Create onboarding tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'onboarding-tooltip';
    tooltip.className = 'onboarding-tooltip';
    tooltip.setAttribute('role', 'dialog');
    tooltip.setAttribute('aria-labelledby', 'onboarding-title');
    tooltip.setAttribute('aria-describedby', 'onboarding-desc');

    tooltip.innerHTML = `
        <div class="onboarding-content">
            <div class="onboarding-title" id="onboarding-title">MISSION BRIEFING</div>
            <div class="onboarding-desc" id="onboarding-desc">
                <ul class="onboarding-tips">
                    <li><span class="onboarding-key">Search</span> to find sounds by name</li>
                    <li><span class="onboarding-key">Star</span> sounds to add them to favorites</li>
                    <li><span class="onboarding-key">?</span> shows keyboard shortcuts</li>
                </ul>
            </div>
            <button class="onboarding-dismiss" id="onboarding-dismiss">ACKNOWLEDGED</button>
        </div>
    `;

    document.body.appendChild(tooltip);
    const shownAt = Date.now();

    // Focus the dismiss button
    const dismissBtn = tooltip.querySelector('#onboarding-dismiss');
    setTimeout(() => {
        dismissBtn.focus();
    }, 100);

    // Handle dismiss
    dismissBtn.addEventListener('click', () => {
        dismissOnboarding(tooltip, 'button', shownAt);
    });

    // Handle keyboard events (escape and focus trap)
    const focusTrapHandler = createFocusTrap(tooltip, {
        onEscape: () => dismissOnboarding(tooltip, 'escape', shownAt),
        onEmptyFocusables: (e) => e.preventDefault(),
    });
    tooltip.addEventListener('keydown', focusTrapHandler);

    // Auto-dismiss after 30 seconds (extended for accessibility)
    setTimeout(() => {
        if (document.body.contains(tooltip)) {
            dismissOnboarding(tooltip, 'auto_timeout', shownAt);
        }
    }, 30000);
}

/**
 * Force show onboarding tooltip (for replay from help modal)
 */
export function showOnboardingTooltipForced() {
    // Remove existing tooltip if present
    const existingTooltip = document.getElementById('onboarding-tooltip');
    if (existingTooltip) {
        existingTooltip.remove();
    }

    // Create onboarding tooltip
    const tooltip = document.createElement('div');
    tooltip.id = 'onboarding-tooltip';
    tooltip.className = 'onboarding-tooltip';
    tooltip.setAttribute('role', 'dialog');
    tooltip.setAttribute('aria-labelledby', 'onboarding-title');
    tooltip.setAttribute('aria-describedby', 'onboarding-desc');

    tooltip.innerHTML = `
        <div class="onboarding-content">
            <div class="onboarding-title" id="onboarding-title">MISSION BRIEFING</div>
            <div class="onboarding-desc" id="onboarding-desc">
                <ul class="onboarding-tips">
                    <li><span class="onboarding-key">Search</span> to find sounds by name</li>
                    <li><span class="onboarding-key">Star</span> sounds to add them to favorites</li>
                    <li><span class="onboarding-key">?</span> shows keyboard shortcuts</li>
                </ul>
            </div>
            <button class="onboarding-dismiss" id="onboarding-dismiss">ACKNOWLEDGED</button>
        </div>
    `;

    document.body.appendChild(tooltip);
    const shownAt = Date.now();

    // Focus the dismiss button
    const dismissBtn = tooltip.querySelector('#onboarding-dismiss');
    setTimeout(() => {
        dismissBtn.focus();
    }, 100);

    // Handle dismiss
    dismissBtn.addEventListener('click', () => {
        dismissOnboardingForced(tooltip, 'button', shownAt);
    });

    // Handle keyboard events (escape and focus trap)
    const focusTrapHandler = createFocusTrap(tooltip, {
        onEscape: () => dismissOnboardingForced(tooltip, 'escape', shownAt),
        onEmptyFocusables: (e) => e.preventDefault(),
    });
    tooltip.addEventListener('keydown', focusTrapHandler);

    // Auto-dismiss after 30 seconds
    setTimeout(() => {
        if (document.body.contains(tooltip)) {
            dismissOnboardingForced(tooltip, 'auto_timeout', shownAt);
        }
    }, 30000);
}

/**
 * Report how the briefing was dismissed. A tooltip that is already hiding
 * was reported by its first dismissal, so it isn't counted twice.
 * @param {HTMLElement} tooltip - The tooltip element
 * @param {string} dismissMethod - 'button', 'escape' or 'auto_timeout'
 * @param {boolean} isReplay - Whether it was replayed from the shortcuts modal
 * @param {number} shownAt - Timestamp when the tooltip was shown
 */
function trackOnboardingDismissed(tooltip, dismissMethod, isReplay, shownAt) {
    if (tooltip.classList.contains('hiding')) {
        return;
    }
    trackEvent('onboarding_dismissed', {
        dismiss_method: dismissMethod,
        is_replay: isReplay,
        visible_duration_ms: Date.now() - shownAt,
    });
}

/**
 * Dismiss the forced onboarding tooltip (doesn't mark as seen)
 * @param {HTMLElement} tooltip - The tooltip element
 * @param {string} dismissMethod - 'button', 'escape' or 'auto_timeout'
 * @param {number} shownAt - Timestamp when the tooltip was shown
 */
function dismissOnboardingForced(tooltip, dismissMethod, shownAt) {
    trackOnboardingDismissed(tooltip, dismissMethod, true, shownAt);
    tooltip.classList.add('hiding');
    setTimeout(() => {
        if (document.body.contains(tooltip)) {
            tooltip.remove();
        }
    }, 300);
}

/**
 * Dismiss the onboarding tooltip
 * @param {HTMLElement} tooltip - The tooltip element
 * @param {string} dismissMethod - 'button', 'escape' or 'auto_timeout'
 * @param {number} shownAt - Timestamp when the tooltip was shown
 */
function dismissOnboarding(tooltip, dismissMethod, shownAt) {
    trackOnboardingDismissed(tooltip, dismissMethod, false, shownAt);
    markOnboardingSeen(localStorage);
    tooltip.classList.add('hiding');
    setTimeout(() => {
        if (document.body.contains(tooltip)) {
            tooltip.remove();
        }
    }, 300);
}
