// ============================================
// Mobile - Mobile menu functions
// ============================================

import { elements } from './state.js';
import { createFocusTrap } from './utils.js';

// Store reference to element that opened the menu
let menuTriggerElement = null;

// Mobile breakpoint (matches CSS)
const MOBILE_BREAKPOINT = 768;

/**
 * Check if current viewport is mobile
 * @returns {boolean}
 */
export function isMobileViewport() {
    return window.innerWidth <= MOBILE_BREAKPOINT;
}

/**
 * Initialize sidebar accessibility based on viewport
 * On desktop: sidebar is always visible, aria-hidden="false"
 * On mobile: sidebar is hidden by default, aria-hidden="true"
 */
export function initSidebarAccessibility() {
    if (!elements.sidebar) {
        return;
    }

    if (isMobileViewport()) {
        // Mobile: sidebar hidden by default
        elements.sidebar.setAttribute('aria-hidden', 'true');
    } else {
        // Desktop: sidebar always visible
        elements.sidebar.setAttribute('aria-hidden', 'false');
    }
}

/**
 * Handle viewport resize to update sidebar accessibility
 */
export function setupViewportListener() {
    let wasMovile = isMobileViewport();

    window.addEventListener('resize', () => {
        const isMobile = isMobileViewport();

        // Only update if crossing the breakpoint
        if (isMobile !== wasMovile) {
            wasMovile = isMobile;

            if (isMobile) {
                // Switched to mobile: close menu if open, set hidden
                closeMobileMenu();
            } else {
                // Switched to desktop: ensure visible
                if (elements.sidebar) {
                    elements.sidebar.classList.remove('open');
                    elements.sidebar.setAttribute('aria-hidden', 'false');
                }
                if (elements.mobileMenuOverlay) {
                    elements.mobileMenuOverlay.classList.remove('visible');
                }
            }
        }
    });
}

// Toggle mobile menu
export function toggleMobileMenu() {
    const isOpen = elements.sidebar && elements.sidebar.classList.contains('open');
    if (isOpen) {
        closeMobileMenu();
    } else {
        openMobileMenu();
    }
}

export function openMobileMenu() {
    // Save the element that triggered the menu
    menuTriggerElement = document.activeElement;

    if (elements.sidebar) {
        elements.sidebar.classList.add('open');
        elements.sidebar.setAttribute('aria-hidden', 'false');
    }
    if (elements.mobileMenuOverlay) {
        elements.mobileMenuOverlay.classList.add('visible');
        // Make overlay keyboard-accessible
        elements.mobileMenuOverlay.setAttribute('tabindex', '0');
        elements.mobileMenuOverlay.setAttribute('role', 'button');
        elements.mobileMenuOverlay.setAttribute('aria-label', 'Close categories menu');
    }
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.setAttribute('aria-expanded', 'true');
        elements.mobileMenuToggle.setAttribute('aria-label', 'Close categories menu');
    }

    // Add focus trap event listener
    document.addEventListener('keydown', handleMobileMenuKeydown);

    // Add direct keyboard handler to overlay for Enter/Space
    if (elements.mobileMenuOverlay) {
        elements.mobileMenuOverlay.addEventListener('keydown', handleOverlayKeydown);
    }

    // Focus first focusable element in sidebar
    setTimeout(() => {
        const firstFocusable = elements.sidebar.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }, 100);
}

// Handle overlay keydown for Enter/Space
function handleOverlayKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        closeMobileMenu();
    }
}

export function closeMobileMenu() {
    if (elements.sidebar) {
        elements.sidebar.classList.remove('open');
        elements.sidebar.setAttribute('aria-hidden', 'true');
    }
    if (elements.mobileMenuOverlay) {
        elements.mobileMenuOverlay.classList.remove('visible');
        // Remove keyboard accessibility attributes
        elements.mobileMenuOverlay.removeAttribute('tabindex');
        elements.mobileMenuOverlay.removeAttribute('role');
        elements.mobileMenuOverlay.removeAttribute('aria-label');
        // Remove overlay keydown handler
        elements.mobileMenuOverlay.removeEventListener('keydown', handleOverlayKeydown);
    }
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
        elements.mobileMenuToggle.setAttribute('aria-label', 'Open categories menu');
    }

    // Remove focus trap event listener
    document.removeEventListener('keydown', handleMobileMenuKeydown);

    // Return focus to the element that triggered the menu
    if (menuTriggerElement && menuTriggerElement.focus) {
        menuTriggerElement.focus();
    }
    menuTriggerElement = null;
}

// Handle keyboard events for mobile menu focus trap
function handleMobileMenuKeydown(e) {
    if (!elements.sidebar || !elements.sidebar.classList.contains('open')) {
        return;
    }

    // Close on Enter/Space when focused on overlay (keyboard backup for overlay click)
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === elements.mobileMenuOverlay) {
        e.preventDefault();
        closeMobileMenu();
        return;
    }

    // Use centralized focus trap utility for Escape and Tab handling
    const focusTrapHandler = createFocusTrap(elements.sidebar, {
        onEscape: () => closeMobileMenu(),
        onEmptyFocusables: () => closeMobileMenu(),
    });
    focusTrapHandler(e);
}
