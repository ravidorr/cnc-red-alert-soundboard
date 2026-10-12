import { jest } from '@jest/globals';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runInNewContext } from 'node:vm';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const rootDirectory = join(testDirectory, '..');
const serviceWorkerSource = readFileSync(
    join(rootDirectory, 'service-worker.js'),
    'utf8',
);

describe('service worker cache activation', () => {
    test('replaces the previous app-shell cache during activation', async () => {
        const localThis = {
            cacheName: 'cnc-soundboard-v11',
            eventHandlers: new Map(),
        };
        localThis.cache = {
            match: jest.fn().mockResolvedValue(null),
        };
        localThis.caches = {
            delete: jest.fn().mockResolvedValue(true),
            keys: jest.fn().mockResolvedValue([
                'cnc-soundboard-v10',
                localThis.cacheName,
            ]),
            open: jest.fn().mockResolvedValue(localThis.cache),
        };
        localThis.clients = {
            claim: jest.fn().mockResolvedValue(undefined),
        };
        localThis.self = {
            addEventListener: jest.fn((eventName, handler) => {
                localThis.eventHandlers.set(eventName, handler);
            }),
            clients: localThis.clients,
            skipWaiting: jest.fn().mockResolvedValue(undefined),
        };
        localThis.activationEvent = {
            waitUntil: jest.fn((promise) => {
                localThis.activationPromise = promise;
            }),
        };
        localThis.context = {
            URL,
            caches: localThis.caches,
            clients: localThis.clients,
            fetch: jest.fn().mockResolvedValue({ ok: false }),
            location: { origin: 'https://soundboard.example' },
            self: localThis.self,
        };

        runInNewContext(serviceWorkerSource, localThis.context);
        localThis.eventHandlers.get('activate')(localThis.activationEvent);
        await localThis.activationPromise;

        expect(serviceWorkerSource).toContain(
            `const CACHE_NAME = '${localThis.cacheName}';`,
        );
        expect(localThis.caches.delete).toHaveBeenCalledWith('cnc-soundboard-v10');
        expect(localThis.caches.delete).not.toHaveBeenCalledWith(localThis.cacheName);
        expect(localThis.clients.claim).toHaveBeenCalledTimes(1);
    });
});
