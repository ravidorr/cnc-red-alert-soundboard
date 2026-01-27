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

        test('should trap focus with Tab key', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Focus on abort button, press Tab should go to execute button
            localThis.abortBtn.focus();
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true });
            document.dispatchEvent(tabEvent);

            // Focus should be trapped
            localThis.abortBtn.click();
            await promise;
        });

        test('should trap focus with Shift+Tab key', async () => {
            const promise = showConfirmModal({ message: 'Test' });

            // Focus on execute button, press Shift+Tab should go to abort button
            localThis.executeBtn.focus();
            const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true });
            document.dispatchEvent(shiftTabEvent);

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
    });
});
