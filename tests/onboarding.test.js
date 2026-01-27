/**
 * @jest-environment jsdom
 */
import { jest } from '@jest/globals';
import { createMockStorage } from './helpers.js';
import {
    hasSeenOnboarding,
    markOnboardingSeen,
    showOnboardingTooltip,
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

        test('clicking dismiss button should remove tooltip', (done) => {
            showOnboardingTooltip();

            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            // Wait for animation
            setTimeout(() => {
                const tooltip = document.getElementById('onboarding-tooltip');
                expect(tooltip).toBeNull();
                done();
            }, 350);
        });

        test('clicking dismiss button should mark onboarding as seen', () => {
            showOnboardingTooltip();

            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            expect(localThis.mockStorage.setItem).toHaveBeenCalledWith('cnc-onboarding-seen', 'true');
        });

        test('pressing Escape should dismiss tooltip', (done) => {
            showOnboardingTooltip();

            const tooltip = document.getElementById('onboarding-tooltip');
            const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
            tooltip.dispatchEvent(escEvent);

            // Wait for animation
            setTimeout(() => {
                const tooltipAfter = document.getElementById('onboarding-tooltip');
                expect(tooltipAfter).toBeNull();
                done();
            }, 350);
        });

        test('tooltip should have hiding class when dismissed', () => {
            showOnboardingTooltip();

            const dismissBtn = document.getElementById('onboarding-dismiss');
            dismissBtn.click();

            const tooltip = document.getElementById('onboarding-tooltip');
            expect(tooltip.classList.contains('hiding')).toBe(true);
        });
    });
});
