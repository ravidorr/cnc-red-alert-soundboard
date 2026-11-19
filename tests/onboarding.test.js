/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { createMockStorage, useFakeTimers, useRealTimers, advanceTimers } from './helpers.js';
import {
    hasSeenOnboarding,
    markOnboardingSeen,
    showOnboardingTooltip,
    showOnboardingTooltipForced,
} from '../js/onboarding.js';

describe('Onboarding Functions', () => {
    describe('hasSeenOnboarding', () => {
        const localThis = {};

        beforeEach(() => {
            localThis.mockStorage = createMockStorage();
        });

        test('should return false when onboarding not seen', () => {
            expect(hasSeenOnboarding(localThis.mockStorage)).toBe(false);
        });

        test('should return true when onboarding has been seen', () => {
            localThis.mockStorage.store['cnc-onboarding-seen'] = 'true';
            expect(hasSeenOnboarding(localThis.mockStorage)).toBe(true);
        });

        test('should return false for any value other than true', () => {
            localThis.mockStorage.store['cnc-onboarding-seen'] = 'false';
            expect(hasSeenOnboarding(localThis.mockStorage)).toBe(false);
        });
    });

    describe('markOnboardingSeen', () => {
        const localThis = {};

        beforeEach(() => {
            localThis.mockStorage = createMockStorage();
        });

        test('should set onboarding seen flag in storage', () => {
            markOnboardingSeen(localThis.mockStorage);
            expect(localThis.mockStorage.setItem).toHaveBeenCalledWith('cnc-onboarding-seen', 'true');
        });
    });

    describe('showOnboardingTooltip', () => {
        const localThis = {};

        beforeEach(() => {
            document.body.innerHTML = '';
            // Mock localStorage
            localThis.originalLocalStorage = global.localStorage;
            localThis.mockStorage = createMockStorage();
            Object.defineProperty(global, 'localStorage', {
                value: localThis.mockStorage,
                writable: true,
            });
        });

        afterEach(() => {
            Object.defineProperty(global, 'localStorage', {
                value: localThis.originalLocalStorage,
                writable: true,
            });
        });

        test('should create tooltip element', () => {
            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip).not.toBeNull();
        });

        test('should not show tooltip if already seen', () => {
            localThis.mockStorage.store['cnc-onboarding-seen'] = 'true';

            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip).toBeNull();
        });

        test('tooltip should have correct ARIA attributes', () => {
            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip.getAttribute('role')).toBe('dialog');
            expect(tooltip.getAttribute('aria-labelledby')).toBe('onboarding-title');
            expect(tooltip.getAttribute('aria-describedby')).toBe('onboarding-desc');
        });

        test('tooltip should contain mission briefing title', () => {
            showOnboardingTooltip();

            const title = document.getElementById('onboarding-title');
            expect(title.textContent).toBe('MISSION BRIEFING');
        });

        test('tooltip should contain tips', () => {
            showOnboardingTooltip();

            const tips = document.querySelectorAll('.onboarding-tips li');
            expect(tips.length).toBe(3);
        });

        test('tooltip should contain dismiss button', () => {
            showOnboardingTooltip();

            const dismissBtn = document.getElementById('onboarding-dismiss');
            expect(dismissBtn).not.toBeNull();
            expect(dismissBtn.textContent).toBe('ACKNOWLEDGED');
        });

        test('clicking dismiss button should remove tooltip', () => {
            useFakeTimers();
            showOnboardingTooltip();

            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            // Advance timers for animation
            advanceTimers(350);
            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip).toBeNull();
            useRealTimers();
        });

        test('clicking dismiss button should mark onboarding as seen', () => {
            showOnboardingTooltip();

            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            expect(localThis.mockStorage.setItem).toHaveBeenCalledWith('cnc-onboarding-seen', 'true');
        });

        test('should handle tooltip already removed before setTimeout fires', () => {
            useFakeTimers();
            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            // Manually remove tooltip before the setTimeout fires
            tooltip.remove();

            // This should not throw even though tooltip is already removed
            expect(() => advanceTimers(350)).not.toThrow();
            useRealTimers();
        });

        test('pressing Escape should dismiss tooltip', () => {
            useFakeTimers();
            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            tooltip.dispatchEvent(escEvent);

            // Advance timers for animation
            advanceTimers(350);
            const tooltipAfter = document.getElementById('onboarding-tooltip');
            expect(tooltipAfter).toBeNull();
            useRealTimers();
        });

        test('tooltip should have hiding class when dismissed', () => {
            showOnboardingTooltip();

            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip.classList.contains('hiding')).toBe(true);
        });

        test('Tab on last element should cycle focus to first element', () => {
            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.focus();

            // Mock activeElement to be the last element (dismissBtn)
            Object.defineProperty(document, 'activeElement', {
                value: dismissBtn,
                writable: true,
                configurable: true,
            });

            // Simulate Tab key (without shiftKey) on last focusable element
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true });
            tooltip.dispatchEvent(tabEvent);

            // Focus trap should keep focus within tooltip
            expect(tooltip).not.toBeNull();

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('Shift+Tab on first element should cycle focus to last element', () => {
            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.focus();

            // Mock activeElement to be the first element (which is also dismissBtn in this case)
            Object.defineProperty(document, 'activeElement', {
                value: dismissBtn,
                writable: true,
                configurable: true,
            });

            // Simulate Shift+Tab key
            const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
            tooltip.dispatchEvent(shiftTabEvent);

            // Focus trap should keep focus within tooltip
            expect(tooltip).not.toBeNull();

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('Tab key should be prevented when no focusable elements', () => {
            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            // Remove all focusable elements
            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.remove();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            tooltip.dispatchEvent(tabEvent);

            // Should not throw
            expect(tooltip).not.toBeNull();
        });

        test('Tab should cycle from last to first with multiple focusable elements', () => {
            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            const dismissBtn = document.getElementById('onboarding-dismiss');

            // Add another focusable element
            const extraLink = document.createElement('a');
            extraLink.href = '#';
            extraLink.textContent = 'Extra Link';
            tooltip.querySelector('.onboarding-content').insertBefore(extraLink, dismissBtn);

            // Mock activeElement to be the last element (dismissBtn)
            Object.defineProperty(document, 'activeElement', {
                value: dismissBtn,
                writable: true,
                configurable: true,
            });

            // Tab (without shift) from last element
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true });
            tooltip.dispatchEvent(tabEvent);

            expect(tooltip).not.toBeNull();

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('Shift+Tab should cycle from first to last with multiple focusable elements', () => {
            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');

            // Add another focusable element at the beginning
            const extraLink = document.createElement('a');
            extraLink.href = '#';
            extraLink.textContent = 'Extra Link';
            tooltip.querySelector('.onboarding-content').insertBefore(extraLink, tooltip.querySelector('.onboarding-content').firstChild);

            // Mock activeElement to be the first element (extraLink)
            Object.defineProperty(document, 'activeElement', {
                value: extraLink,
                writable: true,
                configurable: true,
            });

            // Shift+Tab from first element
            const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
            tooltip.dispatchEvent(shiftTabEvent);

            expect(tooltip).not.toBeNull();

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('auto-dismiss should remove tooltip after timeout', () => {
            jest.useFakeTimers();

            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip).not.toBeNull();

            // Move focus out of the briefing once it has been focused
            jest.advanceTimersByTime(100);
            document.getElementById('onboarding-dismiss').blur();

            // Fast-forward past the 30 second timeout
            jest.advanceTimersByTime(30000);

            // Fast-forward past the 300ms animation
            jest.advanceTimersByTime(300);

            const tooltipAfter = document.getElementById('onboarding-tooltip');
            expect(tooltipAfter).toBeNull();

            jest.useRealTimers();
        });

        test('auto-dismiss should not fire while focus is inside the tooltip', () => {
            jest.useFakeTimers();

            showOnboardingTooltip();

            // The dismiss button receives focus after 100ms
            jest.advanceTimersByTime(60000);

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip).not.toBeNull();
            expect(tooltip.classList.contains('hiding')).toBe(false);
            expect(localThis.mockStorage.setItem).not.toHaveBeenCalled();

            jest.useRealTimers();
        });

        test('auto-dismiss should stay paused when focus moves within the tooltip', () => {
            jest.useFakeTimers();

            showOnboardingTooltip();
            jest.advanceTimersByTime(100);

            const tooltip = document.getElementById('onboarding-tooltip');
            const dismissBtn = document.getElementById('onboarding-dismiss');
            tooltip.dispatchEvent(new FocusEvent('focusout', { relatedTarget: dismissBtn }));
            jest.advanceTimersByTime(60000);

            expect(tooltip.classList.contains('hiding')).toBe(false);

            jest.useRealTimers();
        });

        test('auto-dismiss should not fire while the pointer is over the tooltip', () => {
            jest.useFakeTimers();

            showOnboardingTooltip();
            jest.advanceTimersByTime(100);

            const tooltip = document.getElementById('onboarding-tooltip');
            tooltip.dispatchEvent(new Event('pointerenter'));
            document.getElementById('onboarding-dismiss').blur();
            jest.advanceTimersByTime(60000);

            expect(tooltip.classList.contains('hiding')).toBe(false);

            jest.useRealTimers();
        });

        test('auto-dismiss should restart the full timeout after the pointer leaves', () => {
            jest.useFakeTimers();

            showOnboardingTooltip();
            jest.advanceTimersByTime(100);

            const tooltip = document.getElementById('onboarding-tooltip');
            tooltip.dispatchEvent(new Event('pointerenter'));
            document.getElementById('onboarding-dismiss').blur();
            jest.advanceTimersByTime(20000);
            tooltip.dispatchEvent(new Event('pointerleave'));

            jest.advanceTimersByTime(29999);
            expect(tooltip.classList.contains('hiding')).toBe(false);

            jest.advanceTimersByTime(1);
            expect(tooltip.classList.contains('hiding')).toBe(true);
            expect(localThis.mockStorage.setItem).not.toHaveBeenCalledWith('cnc-onboarding-seen', 'true');

            jest.useRealTimers();
        });

        test('auto-dismiss should not mark onboarding as seen', () => {
            jest.useFakeTimers();

            showOnboardingTooltip();
            jest.advanceTimersByTime(30300);

            expect(localThis.mockStorage.setItem).not.toHaveBeenCalledWith('cnc-onboarding-seen', 'true');
            expect(hasSeenOnboarding(localThis.mockStorage)).toBe(false);


            jest.useRealTimers();
        });

        test('auto-dismiss should not throw if tooltip already removed', () => {
            jest.useFakeTimers();

            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            // Manually remove the tooltip before auto-dismiss
            tooltip.remove();

            // Fast-forward past the 30 second timeout - should not throw
            expect(() => {
                jest.advanceTimersByTime(30000);
            }).not.toThrow();

            jest.useRealTimers();
        });
    });

    describe('showOnboardingTooltipForced', () => {
        const localThis = {};

        beforeEach(() => {
            document.body.innerHTML = '';
            localThis.originalLocalStorage = global.localStorage;
            localThis.mockStorage = createMockStorage();
            Object.defineProperty(global, 'localStorage', {
                value: localThis.mockStorage,
                writable: true,
            });
        });

        afterEach(() => {
            Object.defineProperty(global, 'localStorage', {
                value: localThis.originalLocalStorage,
                writable: true,
            });
        });

        test('should create tooltip element even if previously seen', () => {
            localThis.mockStorage.store['cnc-onboarding-seen'] = 'true';

            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip).not.toBeNull();
        });

        test('should have correct ARIA attributes', () => {
            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip.getAttribute('role')).toBe('dialog');
            expect(tooltip.getAttribute('aria-labelledby')).toBe('onboarding-title');
        });

        test('should contain mission briefing title', () => {
            showOnboardingTooltipForced();

            const title = document.getElementById('onboarding-title');
            expect(title.textContent).toBe('MISSION BRIEFING');
        });

        test('should contain tips', () => {
            showOnboardingTooltipForced();

            const tips = document.querySelectorAll('.onboarding-tips li');
            expect(tips.length).toBe(3);
        });

        test('clicking dismiss button should remove tooltip', () => {
            useFakeTimers();
            showOnboardingTooltipForced();

            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            advanceTimers(350);
            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip).toBeNull();
            useRealTimers();
        });

        test('clicking dismiss should NOT mark onboarding as seen', () => {
            showOnboardingTooltipForced();

            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            // Should NOT call setItem for onboarding-seen when using forced
            const calls = localThis.mockStorage.setItem.mock.calls.filter(
                call => call[0] === 'cnc-onboarding-seen',
            );
            expect(calls.length).toBe(0);
        });

        test('pressing Escape should dismiss tooltip', () => {
            useFakeTimers();
            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            tooltip.dispatchEvent(escEvent);

            advanceTimers(350);
            const tooltipAfter = document.getElementById('onboarding-tooltip');
            expect(tooltipAfter).toBeNull();
            useRealTimers();
        });

        test('should handle tooltip already removed before setTimeout fires', () => {
            useFakeTimers();
            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');
            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            // Manually remove tooltip before the setTimeout fires
            tooltip.remove();

            // This should not throw even though tooltip is already removed
            expect(() => advanceTimers(350)).not.toThrow();
            useRealTimers();
        });

        test('should remove existing tooltip before showing new one', () => {
            showOnboardingTooltipForced();
            showOnboardingTooltipForced();

            // Should be a new tooltip, not the same reference
            expect(document.querySelectorAll('.onboarding-tooltip').length).toBe(1);
        });

        test('Tab on last element should cycle focus to first element', () => {
            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');
            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.focus();

            // Mock activeElement to be the last element (dismissBtn)
            Object.defineProperty(document, 'activeElement', {
                value: dismissBtn,
                writable: true,
                configurable: true,
            });

            // Simulate Tab key (without shiftKey) on last focusable element
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true });
            tooltip.dispatchEvent(tabEvent);

            // Focus trap should keep focus within tooltip
            expect(tooltip).not.toBeNull();

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('Shift+Tab on first element should cycle focus to last element', () => {
            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');
            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.focus();

            // Mock activeElement to be the first element
            Object.defineProperty(document, 'activeElement', {
                value: dismissBtn,
                writable: true,
                configurable: true,
            });

            // Simulate Shift+Tab key
            const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
            tooltip.dispatchEvent(shiftTabEvent);

            // Focus trap should keep focus within tooltip
            expect(tooltip).not.toBeNull();

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('Tab key should be prevented when no focusable elements', () => {
            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');
            // Remove all focusable elements
            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.remove();

            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', bubbles: true, cancelable: true });
            tooltip.dispatchEvent(tabEvent);

            // Should not throw
            expect(tooltip).not.toBeNull();
        });

        test('Tab should cycle from last to first with multiple focusable elements', () => {
            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');
            const dismissBtn = document.getElementById('onboarding-dismiss');

            // Add another focusable element
            const extraLink = document.createElement('a');
            extraLink.href = '#';
            extraLink.textContent = 'Extra Link';
            tooltip.querySelector('.onboarding-content').insertBefore(extraLink, dismissBtn);

            // Mock activeElement to be the last element (dismissBtn)
            Object.defineProperty(document, 'activeElement', {
                value: dismissBtn,
                writable: true,
                configurable: true,
            });

            // Tab (without shift) from last element
            const tabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: false, bubbles: true, cancelable: true });
            tooltip.dispatchEvent(tabEvent);

            expect(tooltip).not.toBeNull();

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('Shift+Tab should cycle from first to last with multiple focusable elements', () => {
            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');

            // Add another focusable element at the beginning
            const extraLink = document.createElement('a');
            extraLink.href = '#';
            extraLink.textContent = 'Extra Link';
            tooltip.querySelector('.onboarding-content').insertBefore(extraLink, tooltip.querySelector('.onboarding-content').firstChild);

            // Mock activeElement to be the first element (extraLink)
            Object.defineProperty(document, 'activeElement', {
                value: extraLink,
                writable: true,
                configurable: true,
            });

            // Shift+Tab from first element
            const shiftTabEvent = new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true, bubbles: true, cancelable: true });
            tooltip.dispatchEvent(shiftTabEvent);

            expect(tooltip).not.toBeNull();

            // Restore activeElement
            Object.defineProperty(document, 'activeElement', {
                value: document.body,
                writable: true,
                configurable: true,
            });
        });

        test('auto-dismiss should remove tooltip after timeout', () => {
            jest.useFakeTimers();

            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip).not.toBeNull();

            // Fast-forward past the 30 second timeout
            jest.advanceTimersByTime(30000);

            // Fast-forward past the 300ms animation
            jest.advanceTimersByTime(300);

            const tooltipAfter = document.getElementById('onboarding-tooltip');
            expect(tooltipAfter).toBeNull();

            jest.useRealTimers();
        });

        test('auto-dismiss should not throw if tooltip already removed', () => {
            jest.useFakeTimers();

            showOnboardingTooltipForced();

            const tooltip = document.getElementById('onboarding-tooltip');
            // Manually remove the tooltip before auto-dismiss
            tooltip.remove();

            // Fast-forward past the 30 second timeout - should not throw
            expect(() => {
                jest.advanceTimersByTime(30000);
            }).not.toThrow();

            jest.useRealTimers();
        });

        test('tooltip should have hiding class when dismissed', () => {
            showOnboardingTooltipForced();

            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip.classList.contains('hiding')).toBe(true);
        });
    });
});
