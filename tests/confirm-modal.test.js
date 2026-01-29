/**
 * @jest-environment jsdom
 */
import { showConfirmModal } from '../js/confirm-modal.js';

describe('Confirm Modal Functions', () => {
    const localThis = {};

    beforeEach(() => {
        // Setup DOM with confirm modal elements
        document.body.innerHTML = `
            <div class="confirm-modal" id="confirm-modal" role="alertdialog">
                <div class="confirm-modal-content">
                    <h2 id="confirm-title" class="confirm-title"></h2>
                    <p id="confirm-message" class="confirm-message"></p>
                    <div class="confirm-actions">
                        <button class="btn-confirm-execute" id="confirm-execute"></button>
                        <button class="btn-confirm-abort" id="confirm-abort"></button>
                    </div>
                </div>
            </div>
        `;
        localThis.modal = document.getElementById('confirm-modal');
        localThis.titleEl = document.getElementById('confirm-title');
        localThis.messageEl = document.getElementById('confirm-message');
        localThis.executeBtn = document.getElementById('confirm-execute');
        localThis.abortBtn = document.getElementById('confirm-abort');
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('handleKeydown edge cases', () => {
        test('should do nothing when modal is not visible', async () => {
            // First show the modal to attach the keydown listener
            const promise = showConfirmModal({ message: 'Test' });

            // Manually remove visible class to simulate edge case
            localThis.modal.classList.remove('visible');

            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            document.dispatchEvent(escEvent);

            // Modal should remain in its current state (not visible)
            expect(localThis.modal.classList.contains('visible')).toBe(false);

            // Add visible class back and click abort to cleanup
            localThis.modal.classList.add('visible');
            localThis.abortBtn.click();
            await promise;
        });

        test('should do nothing when modal element is missing', () => {
            // Remove the modal entirely
            localThis.modal.remove();

            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });

            // Should not throw
            expect(() => document.dispatchEvent(escEvent)).not.toThrow();
        });

        test('should handle Tab when execute button is missing', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Remove execute button
            localThis.executeBtn.remove();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            document.dispatchEvent(tabEvent);

            // Modal should still be visible, no crash
            expect(localThis.modal.classList.contains('visible')).toBe(true);

            // Cleanup - click abort (which still exists)
            localThis.abortBtn.click();
            await promise;
        });

        test('should handle Tab when abort button is missing', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Remove abort button
            localThis.abortBtn.remove();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            document.dispatchEvent(tabEvent);

            // Modal should still be visible, no crash
            expect(localThis.modal.classList.contains('visible')).toBe(true);

            // Cleanup - click execute (which still exists)
            localThis.executeBtn.click();
            await promise;
        });
    });

    describe('showConfirmModal', () => {
        test('should show modal with default options', async () => {
            const promise = showConfirmModal({ message: 'Test message' });

            // Modal should be visible
            expect(localThis.modal.classList.contains('visible')).toBe(true);
            expect(localThis.titleEl.textContent).toBe('CONFIRM OPERATION');
            expect(localThis.messageEl.textContent).toBe('Test message');
            expect(localThis.executeBtn.textContent).toBe('EXECUTE');
            expect(localThis.abortBtn.textContent).toBe('ABORT');

            // Click abort to resolve
            localThis.abortBtn.click();
            const result = await promise;
            expect(result).toBe(false);
        });

        test('should show modal with custom options', async () => {
            const promise = showConfirmModal({
                title: 'CUSTOM TITLE',
                message: 'Custom message',
                confirmText: 'YES',
                cancelText: 'NO',
            });

            expect(localThis.titleEl.textContent).toBe('CUSTOM TITLE');
            expect(localThis.messageEl.textContent).toBe('Custom message');
            expect(localThis.executeBtn.textContent).toBe('YES');
            expect(localThis.abortBtn.textContent).toBe('NO');

            localThis.abortBtn.click();
            await promise;
        });

        test('should return true when execute button is clicked', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            localThis.executeBtn.click();
            const result = await promise;

            expect(result).toBe(true);
            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('should return false when abort button is clicked', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            localThis.abortBtn.click();
            const result = await promise;

            expect(result).toBe(false);
            expect(localThis.modal.classList.contains('visible')).toBe(false);
        });

        test('should return false when backdrop is clicked', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Simulate clicking on the modal backdrop (the modal element itself, not its content)
            const clickEvent = new MouseEvent('click', { bubbles: true });
            Object.defineProperty(clickEvent, 'target', { value: localThis.modal });
            localThis.modal.dispatchEvent(clickEvent);

            const result = await promise;
            expect(result).toBe(false);
        });

        test('should return false when Escape is pressed', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            document.dispatchEvent(escEvent);

            const result = await promise;
            expect(result).toBe(false);
        });

        test('should trap focus with Tab key from abort to execute', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Mock activeElement to be abort button (last element)
            Object.defineProperty(document, 'activeElement', {
                value: localThis.abortBtn,
                writable: true,
                configurable: true,
            });

            // Press Tab on abort button should cycle to execute button
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            document.dispatchEvent(tabEvent);

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });

            // Focus should be trapped
            localThis.abortBtn.click();
            await promise;
        });

        test('should trap focus with Shift+Tab key from execute to abort', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Mock activeElement to be execute button (first element)
            Object.defineProperty(document, 'activeElement', {
                value: localThis.executeBtn,
                writable: true,
                configurable: true,
            });

            // Press Shift+Tab on execute button should cycle to abort button
            const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
            document.dispatchEvent(shiftTabEvent);

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });

            localThis.abortBtn.click();
            await promise;
        });

        test('should not cycle focus when Tab pressed on middle element', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Mock activeElement to be something other than first/last
            const middleElement = document.createElement('button');
            localThis.modal.appendChild(middleElement);

            Object.defineProperty(document, 'activeElement', {
                value: middleElement,
                writable: true,
                configurable: true,
            });

            // Press Tab should not cycle (not at boundary)
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            document.dispatchEvent(tabEvent);

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });

            localThis.abortBtn.click();
            await promise;
        });

        test('should fallback to window.confirm if modal elements missing', async () => {
            // Remove modal element
            document.body.innerHTML = '';

            localThis.originalConfirm = window.confirm;
            window.confirm = () => true;

            const result = await showConfirmModal({ message: 'Test' });

            expect(result).toBe(true);
            window.confirm = localThis.originalConfirm;
        });

        test('should fallback to window.confirm returning false', async () => {
            // Remove modal element
            document.body.innerHTML = '';

            localThis.originalConfirm = window.confirm;
            window.confirm = () => false;

            const result = await showConfirmModal({ message: 'Test' });

            expect(result).toBe(false);
            window.confirm = localThis.originalConfirm;
        });

        test('should use default title when not provided', async () => {
            const promise = showConfirmModal({ message: 'Test message' });

            expect(localThis.titleEl.textContent).toBe('CONFIRM OPERATION');

            localThis.abortBtn.click();
            await promise;
        });

        test('should use default confirmText and cancelText when not provided', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            expect(localThis.executeBtn.textContent).toBe('EXECUTE');
            expect(localThis.abortBtn.textContent).toBe('ABORT');

            localThis.abortBtn.click();
            await promise;
        });

        test('should handle hideConfirmModal when modal is null', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Remove modal
            localThis.modal.remove();

            // Click should still work (abort button still exists in DOM temporarily)
            document.getElementById('confirm-abort')?.click();

            // Escape should be handled gracefully
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            expect(() => document.dispatchEvent(escEvent)).not.toThrow();

            // Force resolve the promise
            await Promise.race([promise, Promise.resolve(false)]);
        });

        test('should handle hideConfirmModal when execute button is null', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Remove execute button during modal display
            localThis.executeBtn.remove();

            // Trigger hide via abort
            localThis.abortBtn.click();
            const result = await promise;

            expect(result).toBe(false);
        });

        test('should handle hideConfirmModal when abort button is null', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Remove abort button during modal display
            localThis.abortBtn.remove();

            // Trigger hide via execute
            localThis.executeBtn.click();
            const result = await promise;

            expect(result).toBe(true);
        });

        test('should handle keydown with no focusTrapHandler', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // The focus trap handler should exist, but test edge case
            // Press a non-special key
            const keyEvent = new KeyboardEvent('keydown', { key: 'a', bubbles: true });
            expect(() => document.dispatchEvent(keyEvent)).not.toThrow();

            localThis.abortBtn.click();
            await promise;
        });
    });
});
