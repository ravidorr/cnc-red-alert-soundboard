// ============================================
// Mobile - Mobile menu functions
// ============================================

import { elements } from './state.js';

// Store reference to element that opened the menu
let menuTriggerElement = null;

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
    }
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    }

    // Add focus trap event listener
    document.addEventListener('keydown', handleMobileMenuKeydown);

    // Focus first focusable element in sidebar
    setTimeout(() => {
        const firstFocusable = elements.sidebar.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }
    }, 100);
}

export function closeMobileMenu() {
    if (elements.sidebar) {
        elements.sidebar.classList.remove('open');
        elements.sidebar.setAttribute('aria-hidden', 'true');
    }
    if (elements.mobileMenuOverlay) {
        elements.mobileMenuOverlay.classList.remove('visible');
    }
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
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

    // Close on Escape
    if (e.key === 'Escape') {
        e.preventDefault();
        closeMobileMenu();
        return;
    }

    // Close on Enter/Space when focused on overlay (keyboard backup for overlay click)
    if ((e.key === 'Enter' || e.key === ' ') && document.activeElement === elements.mobileMenuOverlay) {
        e.preventDefault();
        closeMobileMenu();
        return;
    }

    // Trap focus on Tab
    if (e.key === 'Tab') {
        const focusableElements = elements.sidebar.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );

        if (focusableElements.length === 0) {
            // Safety: if no focusable elements, close menu to prevent trap
            closeMobileMenu();
            return;
        }

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
}
