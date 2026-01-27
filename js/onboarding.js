// ============================================
// Onboarding - First-time user onboarding tooltip
// ============================================

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

    // Focus the dismiss button
    const dismissBtn = tooltip.querySelector('#onboarding-dismiss');
    setTimeout(() => {
        dismissBtn.focus();
    }, 100);

    // Handle dismiss
    dismissBtn.addEventListener('click', () => {
        dismissOnboarding(tooltip);
    });

    // Handle escape key
    tooltip.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            dismissOnboarding(tooltip);
        }
    });

    // Auto-dismiss after 10 seconds
    setTimeout(() => {
        if (document.body.contains(tooltip)) {
            dismissOnboarding(tooltip);
        }
    }, 10000);
}

/**
 * Dismiss the onboarding tooltip
 * @param {HTMLElement} tooltip - The tooltip element
 */
function dismissOnboarding(tooltip) {
    markOnboardingSeen(localStorage);
    tooltip.classList.add('hiding');
    setTimeout(() => {
        if (document.body.contains(tooltip)) {
            tooltip.remove();
        }
    }, 300);
}
