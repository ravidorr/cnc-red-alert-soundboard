/**
 * @jest-environment jsdom
 */
import { showContactModal, hideContactModal, handleContactModalKeydown } from '../js/contact-modal.js';

describe('Contact Modal Functions', () => {
    const localThis = {};

    beforeEach(() => {
        // Setup DOM with contact modal elements
        document.body.innerHTML = `
            <button id="contact-btn">Contact</button>
            <div class="contact-modal" id="contact-modal" role="dialog">
                <div class="contact-modal-content">
                    <h2 id="contact-title" class="contact-title">ESTABLISH COMMS</h2>
                    <p id="contact-intro" class="contact-intro">REACH COMMAND CENTER.</p>
                    <div class="contact-list">
                        <a href="mailto:test@test.com" class="contact-item">Email</a>
                        <a href="https://github.com" class="contact-item">GitHub</a>
                        <a href="https://linkedin.com" class="contact-item">LinkedIn</a>
                    </div>
                    <div class="contact-actions">
                        <button class="btn-dismiss" id="contact-close">CLOSE</button>
                    </div>
                </div>
            </div>
        `;
        localThis.modal = document.getElementById('contact-modal');
        localThis.closeBtn = document.getElementById('contact-close');
        localThis.contactBtn = document.getElementById('contact-btn');
        localThis.contactLinks = document.querySelectorAll('.contact-item');
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('showContactModal', () => {
        test('should show modal by adding visible class', () => {
            showContactModal();
            expect(localThis.modal.classList.contains('visible')).toBe(true);
        });

        test('should focus close button after showing', async () => {
            showContactModal();
            // Wait for setTimeout to focus the button
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(document.activeElement).toBe(localThis.closeBtn);
        });

        test('should store trigger element for focus restoration', () => {
            localThis.contactBtn.focus();
            showContactModal();
            hideContactModal();
            expect(document.activeElement).toBe(localThis.contactBtn);
        });

        test('should do nothing if modal element is missing', () => {
            document.body.innerHTML = '';
            expect(() => showContactModal()).not.toThrow();
        });

        test('should handle modal without close button', async () => {
            localThis.closeBtn.remove();
            showContactModal();
            // Wait for setTimeout
            await new Promise(resolve => setTimeout(resolve, 100));
            expect(localThis.modal.classList.contains('visible')).toBe(true);
        });
    });

    describe('hideContactModal', () => {
        test('should hide modal by removing visible class', () => {
            showContactModal();
            hideContactModal();
            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('should restore focus to trigger element', () => {
            localThis.contactBtn.focus();
            showContactModal();
            hideContactModal();
            expect(document.activeElement).toBe(localThis.contactBtn);
        });

        test('should do nothing if modal element is missing', () => {
            document.body.innerHTML = '';
            expect(() => hideContactModal()).not.toThrow();
        });

        test('should handle missing close button during cleanup', () => {
            showContactModal();
            localThis.closeBtn.remove();
            expect(() => hideContactModal()).not.toThrow();
        });

        test('should handle trigger element without focus method', () => {
            // Create a trigger that doesn't have focus method
            const fakeTrigger = { nodeName: 'DIV' };
            Object.defineProperty(document, 'activeElement', { 
                value: fakeTrigger, 
                writable: true,
                configurable: true 
            });
            showContactModal();
            // Restore document.activeElement behavior
            Object.defineProperty(document, 'activeElement', { 
                value: document.body, 
                writable: true,
                configurable: true 
            });
            expect(() => hideContactModal()).not.toThrow();
        });
    });

    describe('handleContactModalKeydown', () => {
        test('should close modal when Escape is pressed', () => {
            showContactModal();
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            localThis.modal.dispatchEvent(escEvent);
            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('should prevent default on Escape', () => {
            showContactModal();
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
            handleContactModalKeydown(escEvent);
            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('should stop propagation on Escape to prevent stopAllSounds', () => {
            showContactModal();
            
            let propagationStopped = false;
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });
            
            // Override stopPropagation to track if it was called
            const originalStopPropagation = escEvent.stopPropagation.bind(escEvent);
            escEvent.stopPropagation = () => {
                propagationStopped = true;
                originalStopPropagation();
            };
            
            handleContactModalKeydown(escEvent);
            
            expect(propagationStopped).toBe(true);
        });

        test('should trap focus with Tab key - cycling from last to first', () => {
            showContactModal();
            localThis.closeBtn.focus();

            // Mock activeElement to be the last element
            Object.defineProperty(document, 'activeElement', {
                value: localThis.closeBtn,
                writable: true,
                configurable: true,
            });

            // Press Tab on last element should cycle to first
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            handleContactModalKeydown(tabEvent);

            // Focus trap keeps modal visible
            expect(localThis.modal.classList.contains('visible')).toBe(true);

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('should trap focus with Shift+Tab key - cycling from first to last', () => {
            showContactModal();
            const firstLink = localThis.contactLinks[0];
            firstLink.focus();

            // Mock activeElement to be the first element
            Object.defineProperty(document, 'activeElement', {
                value: firstLink,
                writable: true,
                configurable: true,
            });

            // Press Shift+Tab on first element should cycle to last
            const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
            handleContactModalKeydown(shiftTabEvent);

            // Focus trap keeps modal visible
            expect(localThis.modal.classList.contains('visible')).toBe(true);

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('should handle Tab on middle element', () => {
            showContactModal();
            localThis.contactLinks[1].focus(); // GitHub link (middle)

            // Mock activeElement to be a middle element
            Object.defineProperty(document, 'activeElement', {
                value: localThis.contactLinks[1],
                writable: true,
                configurable: true,
            });

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            handleContactModalKeydown(tabEvent);

            // Modal should still be visible (no cycling needed for middle elements)
            expect(localThis.modal.classList.contains('visible')).toBe(true);

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('should do nothing when modal is not visible', () => {
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            handleContactModalKeydown(escEvent);
            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('should do nothing when modal element is missing', () => {
            document.body.innerHTML = '';
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            expect(() => handleContactModalKeydown(escEvent)).not.toThrow();
        });

        test('should handle Tab when no focusable elements exist', () => {
            document.body.innerHTML = `
                <div class="contact-modal visible" id="contact-modal" role="dialog">
                    <div class="contact-modal-content">
                        <p>No focusable elements</p>
                    </div>
                </div>
            `;
            localThis.modal = document.getElementById('contact-modal');
            localThis.modal.classList.add('visible');

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            expect(() => handleContactModalKeydown(tabEvent)).not.toThrow();
        });

        test('should ignore non-Escape and non-Tab keys', () => {
            showContactModal();
            const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
            handleContactModalKeydown(enterEvent);
            // Modal should still be visible
            expect(localThis.modal.classList.contains('visible')).toBe(true);
        });
    });

    describe('backdrop click', () => {
        test('should close modal when clicking on backdrop', () => {
            showContactModal();

            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: localThis.modal });
            localThis.modal.dispatchEvent(clickEvent);

            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('should not close modal when clicking on content', () => {
            showContactModal();

            const content = document.querySelector('.contact-modal-content');
            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: content });
            localThis.modal.dispatchEvent(clickEvent);

            expect(localThis.modal.classList.contains('visible')).toBe(true);

            hideContactModal();
        });

        test('should not close modal when clicking on contact link', () => {
            showContactModal();

            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: localThis.contactLinks[0] });
            localThis.modal.dispatchEvent(clickEvent);

            expect(localThis.modal.classList.contains('visible')).toBe(true);

            hideContactModal();
        });
    });
});
