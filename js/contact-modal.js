// ============================================
// Contact Modal - Contact information dialog
// ============================================

import { createFocusTrap } from './utils.js';

// Store trigger element for focus restoration
let contactTrigger = null;

/**
 * Show the contact modal
 */
export function showContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        contactTrigger = document.activeElement;
        modal.classList.add('visible');

        // Add event listeners
        modal.addEventListener('keydown', handleContactModalKeydown);
        modal.addEventListener('click', handleContactBackdropClick);

        const closeBtn = modal.querySelector('#contact-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', hideContactModal);
            setTimeout(() => closeBtn.focus(), 50);
        }
    }
}

/**
 * Hide the contact modal
 */
export function hideContactModal() {
    const modal = document.getElementById('contact-modal');
    if (modal) {
        modal.classList.remove('visible');

        // Remove event listeners
        modal.removeEventListener('keydown', handleContactModalKeydown);
        modal.removeEventListener('click', handleContactBackdropClick);

        const closeBtn = modal.querySelector('#contact-close');
        if (closeBtn) {
            closeBtn.removeEventListener('click', hideContactModal);
        }

        // Restore focus to trigger element
        if (contactTrigger && contactTrigger.focus) {
            contactTrigger.focus();
        }
        contactTrigger = null;
    }
}

/**
 * Handle backdrop click (outside modal content)
 * @param {Event} e - Click event
 */
function handleContactBackdropClick(e) {
    if (e.target.id === 'contact-modal') {
        hideContactModal();
    }
}

/**
 * Handle keyboard events for focus trap and escape
 * @param {KeyboardEvent} e - Keyboard event
 */
export function handleContactModalKeydown(e) {
    const modal = document.getElementById('contact-modal');
    if (!modal || !modal.classList.contains('visible')) {
        return;
    }

    // Use centralized focus trap utility
    const focusTrapHandler = createFocusTrap(modal, {
        onEscape: () => hideContactModal(),
        stopPropagation: true,
    });
    focusTrapHandler(e);
}
