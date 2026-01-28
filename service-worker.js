// C&C Red Alert Soundboard - Service Worker
const CACHE_NAME = 'cnc-soundboard-v8';

// Core assets to cache immediately
const CORE_ASSETS = [
    '/',
    '/index.html',
    '/manifest.json',
    '/assets/icons/icon-192.png',
    '/assets/icons/icon-512.png',
    // CSS bundle (replaces individual CSS files for better performance)
    '/dist/css/bundle.css',
    // JS modules
    '/js/main.js',
    '/js/version.js',
    '/js/constants.js',
    '/js/state.js',
    '/js/utils.js',
    '/js/audio.js',
    '/js/favorites.js',
    '/js/recently-played.js',
    '/js/ui.js',
    '/js/navigation.js',
    '/js/search.js',
    '/js/mobile.js',
    '/js/install.js',
    '/js/events.js',
];

// Sound files to cache (generated list)
const SOUND_FILES = [
    '/sounds/Appear 1.wav',
    '/sounds/Beepy6.wav',
    '/sounds/Bleep11.wav',
    '/sounds/Bleep17.wav',
    '/sounds/Briefing.wav',
    '/sounds/Civilian ok.wav',
    '/sounds/Civilian yeah.wav',
    '/sounds/Clock 1.wav',
    '/sounds/Country 1.wav',
    '/sounds/Country 4.wav',
    '/sounds/Einstein - Ah.wav',
    '/sounds/Einstein - yes.wav',
    '/sounds/Einstein Incredible.wav',
    '/sounds/Engineer Affermative.wav',
    '/sounds/Engineer Engineering.wav',
    '/sounds/Engineer Movin out.wav',
    '/sounds/Engineer Yes sir.wav',
    '/sounds/Girl ok.wav',
    '/sounds/Girl yeah.wav',
    '/sounds/Keystroke.wav',
    "/sounds/MEdic Movin' out.wav",
    '/sounds/Map Wipe 2.wav',
    '/sounds/Map Wipe 5.wav',
    '/sounds/Medic - Affermative.wav',
    '/sounds/Medic Reporting.wav',
    '/sounds/Medic Yes Sir.wav',
    '/sounds/Scold1.wav',
    '/sounds/Sfx 4.wav',
    '/sounds/Spy Commander.wav',
    '/sounds/Spy For King and Country.wav',
    '/sounds/Spy Indeed.wav',
    '/sounds/Spy On my way.wav',
    '/sounds/Spy Yes sir.wav',
    '/sounds/Tanya , Yeah.wav',
    '/sounds/Tanya - Yes Sir.wav',
    '/sounds/Tanya Chew on this.wav',
    '/sounds/Tanya Give it to me.wav',
    "/sounds/Tanya I'm There.wav",
    '/sounds/Tanya Kiss it Bye bye.wav',
    '/sounds/Tanya Laugh.wav',
    '/sounds/Tanya Lets Rock.wav',
    '/sounds/Tanya Shake it baby.wav',
    '/sounds/Tanya Thats all you got.wav',
    '/sounds/Tanya Whats up.wav',
    '/sounds/Tanya chaching.wav',
    '/sounds/Thief - What.wav',
    '/sounds/Thief Affermative.wav',
    '/sounds/Thief Movin out.wav',
    '/sounds/Thief Yeah.wav',
    '/sounds/Thief ok.wav',
    '/sounds/Toney10.wav',
    '/sounds/Toney4.wav',
    '/sounds/Toney7.wav',
    '/sounds/air to air missile.wav',
    '/sounds/alarm.wav',
    '/sounds/allies #1 achnoledged.wav',
    '/sounds/allies #1 affirmative.wav',
    '/sounds/allies #1 reporting.wav',
    '/sounds/allies #1 veicle reporting.wav',
    '/sounds/allies #1 waiting orders.wav',
    '/sounds/allies #1 yes sir.wav',
    '/sounds/allies #2 achnoledged.wav',
    '/sounds/allies #2 affirmative.wav',
    '/sounds/allies #2 agreed.wav',
    '/sounds/allies #2 as you wish.wav',
    '/sounds/allies #2 at once.wav',
    '/sounds/allies #2 of course.wav',
    '/sounds/allies #2 ready & waiting.wav',
    '/sounds/allies #2 reporting.wav',
    '/sounds/allies #2 verry well.wav',
    '/sounds/allies #2 waiting orders.wav',
    '/sounds/allies #2 yes sir!.wav',
    '/sounds/allies #3 achnoledged.wav',
    '/sounds/allies #3 affirmative.wav',
    '/sounds/allies #3 reporting.wav',
    '/sounds/allies #3 veicle reporting.wav',
    '/sounds/allies #3 waiting orders.wav',
    '/sounds/allies #3 yes sir!.wav',
    '/sounds/allies #4 achnoledged.wav',
    '/sounds/allies #4 affirmative.wav',
    '/sounds/allies #4 agreed.wav',
    '/sounds/allies #4 as you wish.wav',
    '/sounds/allies #4 at once.wav',
    '/sounds/allies #4 of course.wav',
    '/sounds/allies #4 ready & waiting.wav',
    '/sounds/allies #4 reporting.wav',
    '/sounds/allies #4 very well.wav',
    '/sounds/allies #4 waiting orders.wav',
    '/sounds/allies #4 yes sir!.wav',
    '/sounds/antiman mine.wav',
    '/sounds/antitank mine.wav',
    '/sounds/artillery.wav',
    '/sounds/barrier over.wav',
    '/sounds/building being placed.wav',
    '/sounds/building destroyed.wav',
    '/sounds/building half destroyed.wav',
    '/sounds/building placement sound.wav',
    '/sounds/chronosphere sound.wav',
    '/sounds/credit in.wav',
    '/sounds/credit out.wav',
    '/sounds/cruiser 8 inch cannon.wav',
    '/sounds/cruiser missile.wav',
    '/sounds/destroyer shot.wav',
    '/sounds/dog angry #2.wav',
    '/sounds/dog angry.wav',
    '/sounds/dog die.wav',
    '/sounds/dog suffering.wav',
    '/sounds/dog wouf #2.wav',
    '/sounds/dog wouf.wav',
    '/sounds/explosion.wav',
    '/sounds/explosion2.wav',
    '/sounds/fence over.wav',
    '/sounds/flame sound #1.wav',
    '/sounds/flame sound #2.wav',
    '/sounds/flame turret down.wav',
    '/sounds/flame turret up.wav',
    '/sounds/ground to air missile shot.wav',
    '/sounds/iron curtain sound.wav',
    '/sounds/light tank gun.wav',
    '/sounds/mammoth tank gun.wav',
    '/sounds/man being squashed.wav',
    '/sounds/man die #1.wav',
    '/sounds/man die #2.wav',
    '/sounds/man die #3.wav',
    '/sounds/man die #4.wav',
    '/sounds/man die #5.wav',
    '/sounds/man die #6.wav',
    '/sounds/man die #7.wav',
    '/sounds/man die #8.wav',
    '/sounds/man die #9.wav',
    '/sounds/map sound #2.wav',
    '/sounds/map sound #4.wav',
    '/sounds/map sound #5.wav',
    '/sounds/map sound #7.wav',
    '/sounds/map sound #8.wav',
    '/sounds/map sound #9.wav',
    '/sounds/medic heal sound.wav',
    '/sounds/mine placed.wav',
    '/sounds/minigunner shot.wav',
    '/sounds/missile in water.wav',
    '/sounds/paratroops.wav',
    '/sounds/pillbox shot.wav',
    '/sounds/pistol 1.wav',
    '/sounds/pistol 2.wav',
    '/sounds/power down.wav',
    '/sounds/power up.wav',
    '/sounds/radar map alert.wav',
    '/sounds/radar map power on.wav',
    '/sounds/ranger firing sound.wav',
    '/sounds/rapid shoot.wav',
    '/sounds/selling.wav',
    '/sounds/solid turret.wav',
    '/sounds/sonar pulse.wav',
    '/sounds/soviet #1 achnoledged.wav',
    '/sounds/soviet #1 affirmative.wav',
    '/sounds/soviet #1 reporting.wav',
    '/sounds/soviet #1 veicle reporting.wav',
    '/sounds/soviet #1 waiting orders.wav',
    '/sounds/soviet #1 yes sir.wav',
    '/sounds/soviet #2 achnoledged.wav',
    '/sounds/soviet #2 affirmative.wav',
    '/sounds/soviet #2 agreed.wav',
    '/sounds/soviet #2 as you wish.wav',
    '/sounds/soviet #2 at once.wav',
    '/sounds/soviet #2 of course.wav',
    '/sounds/soviet #2 ready & waiting.wav',
    '/sounds/soviet #2 reporting.wav',
    '/sounds/soviet #2 very well.wav',
    '/sounds/soviet #2 waiting orders.wav',
    '/sounds/soviet #2 yes sir.wav',
    '/sounds/soviet #3 achnoledged.wav',
    '/sounds/soviet #3 affirmative.wav',
    '/sounds/soviet #3 comrad.wav',
    '/sounds/soviet #3 reporting.wav',
    '/sounds/soviet #3 waiting orders.wav',
    '/sounds/soviet #3 yes sir.wav',
    '/sounds/soviet #4 affirmative.wav',
    '/sounds/soviet #4 at once.wav',
    '/sounds/soviet #4 ready & waiting.wav',
    '/sounds/sub uncloaking.wav',
    '/sounds/tanya dart.wav',
    '/sounds/tanya death.wav',
    '/sounds/tanya silenced shoot.wav',
    '/sounds/tesla charge.wav',
    '/sounds/tesla shot.wav',
    '/sounds/torpedoes.wav',
    '/sounds/wall crumbling.wav',
    '/sounds/wall down.wav',
    '/sounds/wall hit.wav',
    '/sounds/water explosion.wav',
];

// Install event - cache core assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('[SW] Caching core assets');
                return cache.addAll(CORE_ASSETS);
            })
            .then(() => {
                console.log('[SW] Core assets cached');
                return self.skipWaiting();
            }),
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating...');
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log('[SW] Deleting old cache:', name);
                            return caches.delete(name);
                        }),
                );
            })
            .then(() => {
                console.log('[SW] Claiming clients');
                return self.clients.claim();
            }),
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Only handle same-origin requests
    if (url.origin !== location.origin) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                if (cachedResponse) {
                    return cachedResponse;
                }

                return fetch(event.request)
                    .then((networkResponse) => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200) {
                            return networkResponse;
                        }

                        // Cache sound files and other assets
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch(() => {
                        // Return offline fallback for HTML pages
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
            }),
    );
});

// Background sync for caching all sounds
self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'CACHE_ALL_SOUNDS') {
        console.log('[SW] Caching all sound files...');
        caches.open(CACHE_NAME)
            .then((cache) => {
                return Promise.all(
                    SOUND_FILES.map((url) => {
                        return fetch(url)
                            .then((response) => {
                                if (response.ok) {
                                    return cache.put(url, response);
                                }
                            })
                            .catch((err) => {
                                console.log('[SW] Failed to cache:', url, err);
                            });
                    }),
                );
            })
            .then(() => {
                console.log('[SW] All sounds cached');
                event.ports[0].postMessage({ success: true });
            });
    }
});
