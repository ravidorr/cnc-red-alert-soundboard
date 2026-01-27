// ============================================
// Install - PWA install prompt
// ============================================

import { state, elements } from './state.js';
import { shouldShowInstallPrompt } from './utils.js';
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

    // Focus trap within modal
    elements.installPrompt.addEventListener('keydown', (e) => {
        if (e.key === 'Tab' && elements.installPrompt.classList.contains('visible')) {
            trapFocus(e);
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

// Trap focus within install modal
function trapFocus(e) {
    const focusableElements = elements.installPrompt.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
    } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
    }
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

    showToast('Downloading sounds for offline use...', 'info');

    const messageChannel = new MessageChannel();
    messageChannel.port1.onmessage = (event) => {
        if (event.data && event.data.success) {
            showToast('All sounds ready for offline use!', 'success');
        } else {
            showToast('Some sounds could not be cached', 'error');
        }
    };

    navigator.serviceWorker.controller.postMessage(
        { type: 'CACHE_ALL_SOUNDS' },
        [messageChannel.port2],
    );
}

// Register service worker for PWA
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    console.log('SW registered:', registration.scope);
                })
                .catch(error => {
                    console.log('SW registration failed:', error);
                });
        });
    }
}
