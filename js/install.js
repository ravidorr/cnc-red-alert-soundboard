// ============================================
// Install - PWA install prompt
// ============================================

import { state, elements } from './state.js';
import { shouldShowInstallPrompt, createFocusTrap } from './utils.js';
import { showToast } from './ui.js';

// Track the element that triggered the modal for focus return
let previouslyFocusedElement = null;

// Setup PWA install prompt
export function setupInstallPrompt() {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
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
        await triggerInstall();
    });

    // Handle header install button click
    if (elements.installBtn) {
        elements.installBtn.addEventListener('click', async () => {
            previouslyFocusedElement = document.activeElement;
            await triggerInstall();
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
        console.log('PWA was installed');
        hideInstallPrompt();
        hideInstallButton();
        state.deferredInstallPrompt = null;

        // Cache all sounds for offline use after installation
        cacheAllSoundsForOffline();
    });
}

// Trigger the install prompt
export async function triggerInstall() {
    if (!state.deferredInstallPrompt) {
        return;
    }

    state.deferredInstallPrompt.prompt();
    const { outcome } = await state.deferredInstallPrompt.userChoice;

    if (outcome === 'accepted') {
        console.log('PWA installed');
    }

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
        if (previouslyFocusedElement && previouslyFocusedElement.focus) {
            previouslyFocusedElement.focus();
        }
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

// Cache all sounds for offline use
export function cacheAllSoundsForOffline() {
    if (!('serviceWorker' in navigator) || !navigator.serviceWorker || !navigator.serviceWorker.controller) {
        console.log('Service worker not available for caching');
        return;
    }

    showToast('CACHING SOUNDS FOR OFFLINE OPERATIONS...', 'info');

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.success) {
            showToast('ALL SOUNDS CACHED AND READY', 'success');
        } else {
            showToast('CACHE INCOMPLETE. SOME SOUNDS UNAVAILABLE OFFLINE.', 'error');
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
                    console.log('SW registered:', registration.scope);
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
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
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
