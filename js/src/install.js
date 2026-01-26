// ============================================
// Install - PWA install prompt
// ============================================

import { state, elements } from './state.js';
import { shouldShowInstallPrompt } from './utils.js';

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

    // Listen for successful install
    window.addEventListener('appinstalled', () => {
        console.log('PWA was installed');
        hideInstallPrompt();
        hideInstallButton();
        state.deferredInstallPrompt = null;
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
        elements.installPrompt.classList.add('visible');
    }
}

export function hideInstallPrompt() {
    if (elements.installPrompt) {
        elements.installPrompt.classList.remove('visible');
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
