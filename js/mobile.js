// ============================================
// Mobile - Mobile menu functions
// ============================================

import { elements } from './state.js';

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
    if (elements.sidebar) {
        elements.sidebar.classList.add('open');
    }
    if (elements.mobileMenuOverlay) {
        elements.mobileMenuOverlay.classList.add('visible');
    }
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.setAttribute('aria-expanded', 'true');
    }
}

export function closeMobileMenu() {
    if (elements.sidebar) {
        elements.sidebar.classList.remove('open');
    }
    if (elements.mobileMenuOverlay) {
        elements.mobileMenuOverlay.classList.remove('visible');
    }
    if (elements.mobileMenuToggle) {
        elements.mobileMenuToggle.setAttribute('aria-expanded', 'false');
    }
}
