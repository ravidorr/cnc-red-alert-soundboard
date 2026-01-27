// Jest setup file
import { jest } from '@jest/globals';

// Mock localStorage
const localStorageMock = (function() {
    let store = {};
    return {
        getItem: jest.fn((key) => store[key] || null),
        setItem: jest.fn((key, value) => {
            store[key] = value.toString();
        }),
        removeItem: jest.fn((key) => {
            delete store[key];
        }),
        clear: jest.fn(() => {
            store = {};
        }),
        get length() {
            return Object.keys(store).length;
        },
        key: jest.fn((i) => Object.keys(store)[i] || null),
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
});

// Mock Audio
window.HTMLMediaElement.prototype.play = jest.fn(() => Promise.resolve());
window.HTMLMediaElement.prototype.pause = jest.fn();
window.HTMLMediaElement.prototype.load = jest.fn();

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock scrollTo
window.scrollTo = jest.fn();

// Mock serviceWorker
Object.defineProperty(navigator, 'serviceWorker', {
    value: {
        register: jest.fn().mockResolvedValue({ scope: '/' }),
    },
    writable: true,
    configurable: true,
});

// Mock MessageChannel (not available in JSDOM)
global.MessageChannel = class MockMessageChannel {
    constructor() {
        this.port1 = { onmessage: null };
        this.port2 = {
            onmessage: null,
            // Store reference to port1 so we can trigger its onmessage
            _port1: this.port1,
        };
    }
};

// Reset mocks before each test
beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
});
