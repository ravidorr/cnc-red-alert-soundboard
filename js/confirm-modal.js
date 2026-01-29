// ============================================
// Confirm Modal - Themed confirmation dialog
// ============================================

import { createFocusTrap } from './utils.js';

// Store callback functions and trigger element
let resolveCallback = null;
let confirmTrigger = null;
let focusTrapHandler = null;

/**
 * Show a themed confirmation modal
 * @param {Object} options - Modal options
 * @param {string} options.title - Modal title (default: "CONFIRM OPERATION")
 * @param {string} options.message - Message to display
 * @param {string} options.confirmText - Confirm button text (default: "EXECUTE")
 * @param {string} options.cancelText - Cancel button text (default: "ABORT")
 * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
 */
export function showConfirmModal({
    title = 'CONFIRM OPERATION',
    message,
    confirmText = 'EXECUTE',
    cancelText = 'ABORT',
} = {}) {
    return new Promise((resolve) => {
        const modal = document.getElementById('confirm-modal');
        const titleEl = document.getElementById('confirm-title');
        const messageEl = document.getElementById('confirm-message');
        const executeBtn = document.getElementById('confirm-execute');
        const abortBtn = document.getElementById('confirm-abort');

        if (!modal || !titleEl || !messageEl || !executeBtn || !abortBtn) {
            // Fallback to native confirm if modal elements missing
            resolve(window.confirm(message));
            return;
        }

        // Store the trigger element for focus restoration
        confirmTrigger = document.activeElement;

        // Set content
        titleEl.textContent = title;
        messageEl.textContent = message;
        executeBtn.textContent = confirmText;
        abortBtn.textContent = cancelText;

        // Store resolve callback
        resolveCallback = resolve;

        // Show modal
        modal.classList.add('visible');

        // Add event listeners
        executeBtn.addEventListener('click', handleConfirm);
        abortBtn.addEventListener('click', handleCancel);
        modal.addEventListener('click', handleBackdropClick);

        // Create focus trap handler
        focusTrapHandler = createFocusTrap(modal, {
            onEscape: () => hideConfirmModal(false),
        });
        document.addEventListener('keydown', handleKeydown);

        // Focus the abort button (safer default for destructive actions)
        setTimeout(() => abortBtn.focus(), 50);
    });
}

/**
 * Hide the confirmation modal and cleanup
 * @param {boolean} result - The result to resolve with
 */
function hideConfirmModal(result) {
    const modal = document.getElementById('confirm-modal');
    const executeBtn = document.getElementById('confirm-execute');
    const abortBtn = document.getElementById('confirm-abort');

    if (modal) {
        modal.classList.remove('visible');
    }

    // Remove event listeners
    if (executeBtn) {
        executeBtn.removeEventListener('click', handleConfirm);
    }
    if (abortBtn) {
        abortBtn.removeEventListener('click', handleCancel);
    }
    if (modal) {
        modal.removeEventListener('click', handleBackdropClick);
    }
    document.removeEventListener('keydown', handleKeydown);
    focusTrapHandler = null;

    // Resolve the promise
    if (resolveCallback) {
        resolveCallback(result);
        resolveCallback = null;
    }

    // Restore focus to trigger element
    if (confirmTrigger && confirmTrigger.focus) {
        confirmTrigger.focus();
    }
    confirmTrigger = null;
}

/**
 * Handle confirm button click
 */
function handleConfirm() {
    hideConfirmModal(true);
}

/**
 * Handle cancel/abort button click
 */
function handleCancel() {
    hideConfirmModal(false);
}

/**
 * Handle backdrop click (outside modal content)
 * @param {Event} e - Click event
 */
function handleBackdropClick(e) {
    if (e.target.id === 'confirm-modal') {
        hideConfirmModal(false);
    }
}

/**
 * Handle keyboard events for focus trap and escape
 * @param {KeyboardEvent} e - Keyboard event
 */
function handleKeydown(e) {
    const modal = document.getElementById('confirm-modal');
    if (!modal || !modal.classList.contains('visible')) {
        return;
    }

    // Delegate to focus trap handler
    if (focusTrapHandler) {
        focusTrapHandler(e);
    }
}
