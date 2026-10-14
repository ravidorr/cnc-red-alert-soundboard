// ============================================
// Install - PWA install prompt
// ============================================

import { state, elements } from './state.js';
import { shouldShowInstallPrompt, createFocusTrap } from './utils.js';
import { showToast } from './ui.js';
import { VERSION } from './version.js';
import { trackEvent, getDisplayMode } from './analytics.js';

// Track the element that triggered the modal for focus return
let previouslyFocusedElement = null;

// Whether an install came from the in-app prompt rather than the browser's own install UI
let installStartedInApp = false;

// Setup PWA install prompt
export function setupInstallPrompt() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
        trackEvent('pwa_standalone_launched', {
            display_mode: getDisplayMode(),
            app_version: VERSION,
        });
        return;
    }

    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        state.deferredInstallPrompt = e;

        // Show the header install button
        showInstallButton();

        // Show modal prompt after delay (only if not dismissed recently)
        if (shouldShowInstallPrompt(localStorage, 7)) {
            setTimeout(() => {
                showInstallPrompt();
            }, 2000);
        }
    });

    // Handle modal install button click
    elements.btnInstall.addEventListener('click', async () => {
        await triggerInstall('install_modal');
    });

    // Handle header install button click
    if (elements.installBtn) {
        elements.installBtn.addEventListener('click', async () => {
            previouslyFocusedElement = document.activeElement;
            await triggerInstall('header_button');
        });
    }

    // Handle dismiss button click
    elements.btnDismiss.addEventListener('click', () => {
        localStorage.setItem('installPromptDismissed', Date.now().toString());
        hideInstallPrompt();
    });

    // Close on background click
    elements.installPrompt.addEventListener('click', (e) => {
        if (e.target === elements.installPrompt) {
            hideInstallPrompt();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && elements.installPrompt.classList.contains('visible')) {
            hideInstallPrompt();
        }
    });

    // Focus trap within modal using centralized utility
    const installFocusTrapHandler = createFocusTrap(elements.installPrompt, {
        // Escape is handled by the document keydown listener above
    });
    elements.installPrompt.addEventListener('keydown', (e) => {
        if (elements.installPrompt.classList.contains('visible')) {
            installFocusTrapHandler(e);
        }
    });

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
        hideInstallPrompt();
        hideInstallButton();
        state.deferredInstallPrompt = null;
        // Sound caching now happens automatically via service worker activation
        showToast('APP INSTALLED. SOUNDS CACHING IN BACKGROUND...', 'success');
        trackEvent('pwa_installed', {
            install_source: installStartedInApp ? 'in_app_prompt' : 'browser_ui',
            favorites_count: state.favorites.length,
            recently_played_count: state.recentlyPlayed.length,
            app_version: VERSION,
        });
        installStartedInApp = false;
    });
}

// Trigger the install prompt
// promptSource is the button that opened it ('install_modal' or 'header_button'), for analytics
export async function triggerInstall(promptSource = null) {
    if (!state.deferredInstallPrompt) {
        return;
    }

    // Set before prompting: 'appinstalled' can fire before userChoice settles
    installStartedInApp = true;
    state.deferredInstallPrompt.prompt();
    const choice = await state.deferredInstallPrompt.userChoice;
    if (choice.outcome !== 'accepted') {
        installStartedInApp = false;
    }
    trackEvent('pwa_install_prompt_responded', {
        outcome: choice.outcome,
        platform: choice.platform,
        prompt_source: promptSource,
        previously_dismissed: localStorage.getItem('installPromptDismissed') !== null,
        favorites_count: state.favorites.length,
        recently_played_count: state.recentlyPlayed.length,
    });

    state.deferredInstallPrompt = null;
    hideInstallPrompt();
    hideInstallButton();
}

export function showInstallPrompt() {
    if (elements.installPrompt) {
        // Save currently focused element
        previouslyFocusedElement = document.activeElement;
        elements.installPrompt.classList.add('visible');
        // Focus the first focusable element in the modal
        const firstButton = elements.installPrompt.querySelector('button');
        if (firstButton) {
            setTimeout(() => firstButton.focus(), 50);
        }
    }
}

export function hideInstallPrompt() {
    if (elements.installPrompt) {
        elements.installPrompt.classList.remove('visible');
        // Return focus to the previously focused element
        previouslyFocusedElement?.focus?.();
        previouslyFocusedElement = null;
    }
}

export function showInstallButton() {
    if (elements.installBtn) {
        elements.installBtn.classList.add('visible');
    }
}

export function hideInstallButton() {
    if (elements.installBtn) {
        elements.installBtn.classList.remove('visible');
    }
}

// Manually refresh/verify sound cache (sounds are cached automatically on SW activation)
export function cacheAllSoundsForOffline() {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker || !navigator.serviceWorker.controller) {
        showToast('SERVICE WORKER UNAVAILABLE', 'error');
        return;
    }

    showToast('VERIFYING SOUND CACHE...', 'info');

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.success) {
            const { cachedCount, total } = event.data;
            showToast(`ALL ${cachedCount}/${total} SOUNDS CACHED AND READY`, 'success');
        } else if (event.data) {
            const { cachedCount, failedCount, total } = event.data;
            showToast(`CACHE STATUS: ${cachedCount}/${total} READY, ${failedCount} FAILED`, 'error');
        } else {
            showToast('CACHE VERIFICATION FAILED', 'error');
        }
    };

    navigator.serviceWorker.controller.postMessage(
        { type: 'CACHE_ALL_SOUNDS' },
        [messageChannel.port2],
    );
}

// Track service worker registration for update checks
let swRegistration = null;

// Register service worker for PWA
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    swRegistration = registration;

                    // Check for updates periodically (every hour)
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000);

                    // Listen for new service worker installing
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                // New service worker is installed and waiting
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    showUpdateAvailableNotification();
                                }
                            });
                        }
                    });
                })
                .catch(() => undefined);
        });
    }
}

/**
 * Show notification that a new version is available
 */
export function showUpdateAvailableNotification() {
    // Create update notification element if it doesn't exist
    let updateNotification = document.getElementById('update-notification');
    if (!updateNotification) {
        updateNotification = document.createElement('div');
        updateNotification.id = 'update-notification';
        updateNotification.className = 'update-notification';
        updateNotification.setAttribute('role', 'alert');
        updateNotification.innerHTML = `
            <div class="update-notification-content">
                <span class="update-notification-message">NEW VERSION AVAILABLE</span>
                <button id="update-refresh-btn" class="update-refresh-btn">REFRESH NOW</button>
                <button id="update-dismiss-btn" class="update-dismiss-btn" aria-label="Dismiss">X</button>
            </div>
        `;
        document.body.appendChild(updateNotification);

        // Handle refresh button click
        const refreshBtn = updateNotification.querySelector('#update-refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                window.location.reload();
            });
        }

        // Handle dismiss button click
        const dismissBtn = updateNotification.querySelector('#update-dismiss-btn');
        if (dismissBtn) {
            dismissBtn.addEventListener('click', () => {
                hideUpdateNotification();
            });
        }
    }

    // Show the notification
    updateNotification.classList.add('visible');
}

/**
 * Hide the update notification
 */
export function hideUpdateNotification() {
    const updateNotification = document.getElementById('update-notification');
    if (updateNotification) {
        updateNotification.classList.remove('visible');
    }
}

/**
 * Get the current service worker registration (for testing)
 */
export function getSwRegistration() {
    return swRegistration;
}
