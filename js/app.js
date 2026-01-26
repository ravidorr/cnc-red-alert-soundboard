// C&C Red Alert Soundboard - Main Application

(function(root, factory) {
    'use strict';
    // UMD pattern for browser and Node.js compatibility
    if (typeof module === 'object' && module.exports) {
        // Node.js/CommonJS
        module.exports = factory();
    } else {
        // Browser global
        root.CncSoundboard = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    // Sound database with categorization
    const SOUNDS = [
        // Allies Units
        { file: 'allies #1 achnoledged.wav', name: 'Acknowledged', category: 'allies' },
        { file: 'allies #1 affirmative.wav', name: 'Affirmative', category: 'allies' },
        { file: 'allies #1 reporting.wav', name: 'Reporting', category: 'allies' },
        { file: 'allies #1 veicle reporting.wav', name: 'Vehicle Reporting', category: 'allies' },
        { file: 'allies #1 waiting orders.wav', name: 'Waiting Orders', category: 'allies' },
        { file: 'allies #1 yes sir.wav', name: 'Yes Sir', category: 'allies' },
        { file: 'allies #2 achnoledged.wav', name: 'Acknowledged #2', category: 'allies' },
        { file: 'allies #2 affirmative.wav', name: 'Affirmative #2', category: 'allies' },
        { file: 'allies #2 agreed.wav', name: 'Agreed', category: 'allies' },
        { file: 'allies #2 as you wish.wav', name: 'As You Wish', category: 'allies' },
        { file: 'allies #2 at once.wav', name: 'At Once', category: 'allies' },
        { file: 'allies #2 of course.wav', name: 'Of Course', category: 'allies' },
        { file: 'allies #2 ready & waiting.wav', name: 'Ready & Waiting', category: 'allies' },
        { file: 'allies #2 reporting.wav', name: 'Reporting #2', category: 'allies' },
        { file: 'allies #2 verry well.wav', name: 'Very Well', category: 'allies' },
        { file: 'allies #2 waiting orders.wav', name: 'Waiting Orders #2', category: 'allies' },
        { file: 'allies #2 yes sir!.wav', name: 'Yes Sir! #2', category: 'allies' },
        { file: 'allies #3 achnoledged.wav', name: 'Acknowledged #3', category: 'allies' },
        { file: 'allies #3 affirmative.wav', name: 'Affirmative #3', category: 'allies' },
        { file: 'allies #3 reporting.wav', name: 'Reporting #3', category: 'allies' },
        { file: 'allies #3 veicle reporting.wav', name: 'Vehicle Reporting #3', category: 'allies' },
        { file: 'allies #3 waiting orders.wav', name: 'Waiting Orders #3', category: 'allies' },
        { file: 'allies #3 yes sir!.wav', name: 'Yes Sir! #3', category: 'allies' },
        { file: 'allies #4 achnoledged.wav', name: 'Acknowledged #4', category: 'allies' },
        { file: 'allies #4 affirmative.wav', name: 'Affirmative #4', category: 'allies' },
        { file: 'allies #4 agreed.wav', name: 'Agreed #4', category: 'allies' },
        { file: 'allies #4 as you wish.wav', name: 'As You Wish #4', category: 'allies' },
        { file: 'allies #4 at once.wav', name: 'At Once #4', category: 'allies' },
        { file: 'allies #4 of course.wav', name: 'Of Course #4', category: 'allies' },
        { file: 'allies #4 ready & waiting.wav', name: 'Ready & Waiting #4', category: 'allies' },
        { file: 'allies #4 reporting.wav', name: 'Reporting #4', category: 'allies' },
        { file: 'allies #4 very well.wav', name: 'Very Well #4', category: 'allies' },
        { file: 'allies #4 waiting orders.wav', name: 'Waiting Orders #4', category: 'allies' },
        { file: 'allies #4 yes sir!.wav', name: 'Yes Sir! #4', category: 'allies' },

        // Soviet Units
        { file: 'soviet #1 achnoledged.wav', name: 'Acknowledged', category: 'soviets' },
        { file: 'soviet #1 affirmative.wav', name: 'Affirmative', category: 'soviets' },
        { file: 'soviet #1 reporting.wav', name: 'Reporting', category: 'soviets' },
        { file: 'soviet #1 veicle reporting.wav', name: 'Vehicle Reporting', category: 'soviets' },
        { file: 'soviet #1 waiting orders.wav', name: 'Waiting Orders', category: 'soviets' },
        { file: 'soviet #1 yes sir.wav', name: 'Yes Sir', category: 'soviets' },
        { file: 'soviet #2 achnoledged.wav', name: 'Acknowledged #2', category: 'soviets' },
        { file: 'soviet #2 affirmative.wav', name: 'Affirmative #2', category: 'soviets' },
        { file: 'soviet #2 agreed.wav', name: 'Agreed', category: 'soviets' },
        { file: 'soviet #2 as you wish.wav', name: 'As You Wish', category: 'soviets' },
        { file: 'soviet #2 at once.wav', name: 'At Once', category: 'soviets' },
        { file: 'soviet #2 of course.wav', name: 'Of Course', category: 'soviets' },
        { file: 'soviet #2 ready & waiting.wav', name: 'Ready & Waiting', category: 'soviets' },
        { file: 'soviet #2 reporting.wav', name: 'Reporting #2', category: 'soviets' },
        { file: 'soviet #2 very well.wav', name: 'Very Well', category: 'soviets' },
        { file: 'soviet #2 waiting orders.wav', name: 'Waiting Orders #2', category: 'soviets' },
        { file: 'soviet #2 yes sir.wav', name: 'Yes Sir #2', category: 'soviets' },
        { file: 'soviet #3 achnoledged.wav', name: 'Acknowledged #3', category: 'soviets' },
        { file: 'soviet #3 affirmative.wav', name: 'Affirmative #3', category: 'soviets' },
        { file: 'soviet #3 comrad.wav', name: 'Reporting #3', category: 'soviets' },
        { file: 'soviet #3 reporting.wav', name: 'Comrade', category: 'soviets' },
        { file: 'soviet #3 waiting orders.wav', name: 'Waiting Orders #3', category: 'soviets' },
        { file: 'soviet #3 yes sir.wav', name: 'Yes Sir #3', category: 'soviets' },
        { file: 'soviet #4 affirmative.wav', name: 'Affirmative #4', category: 'soviets' },
        { file: 'soviet #4 at once.wav', name: 'At Once #4', category: 'soviets' },
        { file: 'soviet #4 ready & waiting.wav', name: 'Ready & Waiting #4', category: 'soviets' },

        // Tanya
        { file: 'Tanya , Yeah.wav', name: 'Yeah', category: 'tanya' },
        { file: 'Tanya - Yes Sir.wav', name: 'Yes Sir', category: 'tanya' },
        { file: 'Tanya Chew on this.wav', name: 'Chew On This', category: 'tanya' },
        { file: 'Tanya Give it to me.wav', name: 'Give It To Me', category: 'tanya' },
        { file: "Tanya I'm There.wav", name: "I'm There", category: 'tanya' },
        { file: 'Tanya Kiss it Bye bye.wav', name: 'Kiss It Bye Bye', category: 'tanya' },
        { file: 'Tanya Laugh.wav', name: 'Laugh', category: 'tanya' },
        { file: 'Tanya Lets Rock.wav', name: "Let's Rock", category: 'tanya' },
        { file: 'Tanya Shake it baby.wav', name: 'Shake It Baby', category: 'tanya' },
        { file: 'Tanya Thats all you got.wav', name: "That's All You Got", category: 'tanya' },
        { file: 'Tanya Whats up.wav', name: "What's Up", category: 'tanya' },
        { file: 'Tanya chaching.wav', name: 'Cha-Ching', category: 'tanya' },
        { file: 'tanya dart.wav', name: 'Dart Shot', category: 'tanya' },
        { file: 'tanya death.wav', name: 'Death', category: 'tanya' },
        { file: 'tanya silenced shoot.wav', name: 'Silenced Shot', category: 'tanya' },

        // Engineer
        { file: 'Engineer Affermative.wav', name: 'Affirmative', category: 'special' },
        { file: 'Engineer Engineering.wav', name: 'Engineering', category: 'special' },
        { file: 'Engineer Movin out.wav', name: "Movin' Out", category: 'special' },
        { file: 'Engineer Yes sir.wav', name: 'Yes Sir', category: 'special' },

        // Medic
        { file: 'Medic - Affermative.wav', name: 'Medic Affirmative', category: 'special' },
        { file: "MEdic Movin' out.wav", name: "Medic Movin' Out", category: 'special' },
        { file: 'Medic Reporting.wav', name: 'Medic Reporting', category: 'special' },
        { file: 'Medic Yes Sir.wav', name: 'Medic Yes Sir', category: 'special' },
        { file: 'medic heal sound.wav', name: 'Medic Heal', category: 'special' },

        // Spy
        { file: 'Spy Commander.wav', name: 'Spy Commander', category: 'special' },
        { file: 'Spy For King and Country.wav', name: 'For King & Country', category: 'special' },
        { file: 'Spy Indeed.wav', name: 'Spy Indeed', category: 'special' },
        { file: 'Spy On my way.wav', name: 'Spy On My Way', category: 'special' },
        { file: 'Spy Yes sir.wav', name: 'Spy Yes Sir', category: 'special' },

        // Thief
        { file: 'Thief - What.wav', name: 'Thief What', category: 'special' },
        { file: 'Thief Affermative.wav', name: 'Thief Affirmative', category: 'special' },
        { file: 'Thief Movin out.wav', name: "Thief Movin' Out", category: 'special' },
        { file: 'Thief Yeah.wav', name: 'Thief Yeah', category: 'special' },
        { file: 'Thief ok.wav', name: 'Thief OK', category: 'special' },

        // Einstein
        { file: 'Einstein - Ah.wav', name: 'Einstein Ah', category: 'special' },
        { file: 'Einstein - yes.wav', name: 'Einstein Yes', category: 'special' },
        { file: 'Einstein Incredible.wav', name: 'Einstein Incredible', category: 'special' },

        // Civilians
        { file: 'Civilian ok.wav', name: 'Civilian OK', category: 'civilians' },
        { file: 'Civilian yeah.wav', name: 'Civilian Yeah', category: 'civilians' },
        { file: 'Girl ok.wav', name: 'Girl OK', category: 'civilians' },
        { file: 'Girl yeah.wav', name: 'Girl Yeah', category: 'civilians' },

        // Dogs
        { file: 'dog angry.wav', name: 'Dog Angry', category: 'dogs' },
        { file: 'dog angry #2.wav', name: 'Dog Angry #2', category: 'dogs' },
        { file: 'dog die.wav', name: 'Dog Die', category: 'dogs' },
        { file: 'dog suffering.wav', name: 'Dog Suffering', category: 'dogs' },
        { file: 'dog wouf.wav', name: 'Dog Woof', category: 'dogs' },
        { file: 'dog wouf #2.wav', name: 'Dog Woof #2', category: 'dogs' },

        // Combat - Infantry Weapons
        { file: 'minigunner shot.wav', name: 'Minigunner', category: 'combat' },
        { file: 'pistol 1.wav', name: 'Pistol 1', category: 'combat' },
        { file: 'pistol 2.wav', name: 'Pistol 2', category: 'combat' },
        { file: 'rapid shoot.wav', name: 'Rapid Fire', category: 'combat' },
        { file: 'ranger firing sound.wav', name: 'Ranger Fire', category: 'combat' },
        { file: 'flame sound #1.wav', name: 'Flame #1', category: 'combat' },
        { file: 'flame sound #2.wav', name: 'Flame #2', category: 'combat' },

        // Combat - Explosives
        { file: 'explosion.wav', name: 'Explosion', category: 'combat' },
        { file: 'explosion2.wav', name: 'Explosion #2', category: 'combat' },
        { file: 'water explosion.wav', name: 'Water Explosion', category: 'combat' },
        { file: 'antiman mine.wav', name: 'Anti-Personnel Mine', category: 'combat' },
        { file: 'antitank mine.wav', name: 'Anti-Tank Mine', category: 'combat' },
        { file: 'mine placed.wav', name: 'Mine Placed', category: 'combat' },

        // Combat - Missiles
        { file: 'air to air missile.wav', name: 'Air-to-Air Missile', category: 'combat' },
        { file: 'ground to air missile shot.wav', name: 'Ground-to-Air Missile', category: 'combat' },
        { file: 'missile in water.wav', name: 'Missile in Water', category: 'combat' },
        { file: 'cruiser missile.wav', name: 'Cruiser Missile', category: 'combat' },
        { file: 'torpedoes.wav', name: 'Torpedoes', category: 'combat' },

        // Vehicles
        { file: 'light tank gun.wav', name: 'Light Tank', category: 'vehicles' },
        { file: 'mammoth tank gun.wav', name: 'Mammoth Tank', category: 'vehicles' },
        { file: 'artillery.wav', name: 'Artillery', category: 'vehicles' },
        { file: 'cruiser 8 inch cannon.wav', name: 'Cruiser Cannon', category: 'vehicles' },
        { file: 'destroyer shot.wav', name: 'Destroyer', category: 'vehicles' },
        { file: 'sub uncloaking.wav', name: 'Sub Uncloaking', category: 'vehicles' },
        { file: 'paratroops.wav', name: 'Paratroops', category: 'vehicles' },

        // Buildings & Structures
        { file: 'building being placed.wav', name: 'Building Placed', category: 'buildings' },
        { file: 'building placement sound.wav', name: 'Placement Sound', category: 'buildings' },
        { file: 'building destroyed.wav', name: 'Building Destroyed', category: 'buildings' },
        { file: 'building half destroyed.wav', name: 'Building Damaged', category: 'buildings' },
        { file: 'power up.wav', name: 'Power Up', category: 'buildings' },
        { file: 'power down.wav', name: 'Power Down', category: 'buildings' },
        { file: 'selling.wav', name: 'Selling', category: 'buildings' },

        // Turrets & Defenses
        { file: 'solid turret.wav', name: 'Turret', category: 'buildings' },
        { file: 'pillbox shot.wav', name: 'Pillbox', category: 'buildings' },
        { file: 'flame turret up.wav', name: 'Flame Turret Up', category: 'buildings' },
        { file: 'flame turret down.wav', name: 'Flame Turret Down', category: 'buildings' },
        { file: 'tesla charge.wav', name: 'Tesla Charge', category: 'buildings' },
        { file: 'tesla shot.wav', name: 'Tesla Shot', category: 'buildings' },

        // Walls & Barriers
        { file: 'wall hit.wav', name: 'Wall Hit', category: 'buildings' },
        { file: 'wall down.wav', name: 'Wall Down', category: 'buildings' },
        { file: 'wall crumbling.wav', name: 'Wall Crumbling', category: 'buildings' },
        { file: 'fence over.wav', name: 'Fence Over', category: 'buildings' },
        { file: 'barrier over.wav', name: 'Barrier Over', category: 'buildings' },

        // Deaths
        { file: 'man die #1.wav', name: 'Death #1', category: 'deaths' },
        { file: 'man die #2.wav', name: 'Death #2', category: 'deaths' },
        { file: 'man die #3.wav', name: 'Death #3', category: 'deaths' },
        { file: 'man die #4.wav', name: 'Death #4', category: 'deaths' },
        { file: 'man die #5.wav', name: 'Death #5', category: 'deaths' },
        { file: 'man die #6.wav', name: 'Death #6', category: 'deaths' },
        { file: 'man die #7.wav', name: 'Death #7', category: 'deaths' },
        { file: 'man die #8.wav', name: 'Death #8', category: 'deaths' },
        { file: 'man die #9.wav', name: 'Death #9', category: 'deaths' },
        { file: 'man being squashed.wav', name: 'Squashed', category: 'deaths' },

        // UI & Map Sounds
        { file: 'alarm.wav', name: 'Alarm', category: 'ui' },
        { file: 'radar map alert.wav', name: 'Radar Alert', category: 'ui' },
        { file: 'radar map power on.wav', name: 'Radar Power On', category: 'ui' },
        { file: 'sonar pulse.wav', name: 'Sonar Pulse', category: 'ui' },
        { file: 'credit in.wav', name: 'Credit In', category: 'ui' },
        { file: 'credit out.wav', name: 'Credit Out', category: 'ui' },
        { file: 'map sound #2.wav', name: 'Map Sound #2', category: 'ui' },
        { file: 'map sound #4.wav', name: 'Map Sound #4', category: 'ui' },
        { file: 'map sound #5.wav', name: 'Map Sound #5', category: 'ui' },
        { file: 'map sound #7.wav', name: 'Map Sound #7', category: 'ui' },
        { file: 'map sound #8.wav', name: 'Map Sound #8', category: 'ui' },
        { file: 'map sound #9.wav', name: 'Map Sound #9', category: 'ui' },
        { file: 'Map Wipe 2.wav', name: 'Map Wipe 2', category: 'ui' },
        { file: 'Map Wipe 5.wav', name: 'Map Wipe 5', category: 'ui' },
        { file: 'Briefing.wav', name: 'Briefing', category: 'ui' },
        { file: 'Keystroke.wav', name: 'Keystroke', category: 'ui' },

        // Misc / Special Effects
        { file: 'chronosphere sound.wav', name: 'Chronosphere', category: 'misc' },
        { file: 'iron curtain sound.wav', name: 'Iron Curtain', category: 'misc' },
        { file: 'Appear 1.wav', name: 'Appear', category: 'misc' },
        { file: 'Clock 1.wav', name: 'Clock', category: 'misc' },
        { file: 'Country 1.wav', name: 'Country 1', category: 'misc' },
        { file: 'Country 4.wav', name: 'Country 4', category: 'misc' },
        { file: 'Scold1.wav', name: 'Scold', category: 'misc' },
        { file: 'Sfx 4.wav', name: 'SFX 4', category: 'misc' },
        { file: 'Beepy6.wav', name: 'Beep', category: 'misc' },
        { file: 'Bleep11.wav', name: 'Bleep 11', category: 'misc' },
        { file: 'Bleep17.wav', name: 'Bleep 17', category: 'misc' },
        { file: 'Toney4.wav', name: 'Tone 4', category: 'misc' },
        { file: 'Toney7.wav', name: 'Tone 7', category: 'misc' },
        { file: 'Toney10.wav', name: 'Tone 10', category: 'misc' },
    ];

    // Category configuration
    const CATEGORIES = {
        allies: { name: 'ALLIED FORCES', order: 1 },
        soviets: { name: 'SOVIET FORCES', order: 2 },
        tanya: { name: 'TANYA', order: 3 },
        special: { name: 'SPECIAL UNITS', order: 4 },
        civilians: { name: 'CIVILIANS', order: 5 },
        combat: { name: 'COMBAT', order: 6 },
        vehicles: { name: 'VEHICLES', order: 7 },
        buildings: { name: 'BUILDINGS & DEFENSES', order: 8 },
        dogs: { name: 'ATTACK DOGS', order: 9 },
        deaths: { name: 'CASUALTIES', order: 10 },
        ui: { name: 'UI & MAP', order: 11 },
        misc: { name: 'MISCELLANEOUS', order: 12 },
    };

    // Application state
    const state = {
        audioPlayer: null,
        currentlyPlaying: null,
        searchTerm: '',
        deferredInstallPrompt: null,
        favorites: [],
    };

    // DOM Elements
    const elements = {
        contentArea: null,
        categoryNav: null,
        searchInput: null,
        clearSearch: null,
        stopAllBtn: null,
        totalSounds: null,
        totalFavorites: null,
        visibleSounds: null,
        nowPlaying: null,
        nowPlayingTitle: null,
        audioPlayer: null,
        installPrompt: null,
        btnInstall: null,
        btnDismiss: null,
        installBtn: null,
    };

    // ============================================
    // Pure/Testable Functions (no DOM dependencies)
    // ============================================

    /**
     * Load favorites from localStorage
     * @param {Storage} storage - localStorage or mock
     * @returns {string[]} Array of favorite file names
     */
    function loadFavoritesFromStorage(storage) {
        try {
            const stored = storage.getItem('cnc-favorites');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (e) {
            console.error('Error loading favorites:', e);
        }
        return [];
    }

    /**
     * Save favorites to localStorage
     * @param {Storage} storage - localStorage or mock
     * @param {string[]} favorites - Array of favorite file names
     */
    function saveFavoritesToStorage(storage, favorites) {
        try {
            storage.setItem('cnc-favorites', JSON.stringify(favorites));
        } catch (e) {
            console.error('Error saving favorites:', e);
        }
    }

    /**
     * Toggle a sound in the favorites array
     * @param {string[]} favorites - Current favorites array
     * @param {string} soundFile - File to toggle
     * @returns {string[]} New favorites array
     */
    function toggleFavoriteInArray(favorites, soundFile) {
        const newFavorites = [...favorites];
        const index = newFavorites.indexOf(soundFile);
        if (index === -1) {
            newFavorites.push(soundFile);
        } else {
            newFavorites.splice(index, 1);
        }
        return newFavorites;
    }

    /**
     * Check if a sound is a favorite
     * @param {string[]} favorites - Favorites array
     * @param {string} soundFile - File to check
     * @returns {boolean}
     */
    function isFavorite(favorites, soundFile) {
        return favorites.includes(soundFile);
    }

    /**
     * Reorder favorites by moving draggedFile to targetFile's position
     * @param {string[]} favorites - Current favorites array
     * @param {string} draggedFile - File being dragged
     * @param {string} targetFile - Drop target file
     * @returns {string[]} New favorites array
     */
    function reorderFavoritesArray(favorites, draggedFile, targetFile) {
        const draggedIndex = favorites.indexOf(draggedFile);
        const targetIndex = favorites.indexOf(targetFile);

        if (draggedIndex === -1 || targetIndex === -1) {
            return favorites;
        }

        const newFavorites = [...favorites];
        newFavorites.splice(draggedIndex, 1);
        newFavorites.splice(targetIndex, 0, draggedFile);

        return newFavorites;
    }

    /**
     * Filter sounds based on search term
     * @param {Object[]} sounds - Array of sound objects
     * @param {string} searchTerm - Search term (will be lowercased)
     * @returns {Object[]} Filtered sounds
     */
    function filterSoundsArray(sounds, searchTerm) {
        if (!searchTerm) {
            return sounds;
        }
        const term = searchTerm.toLowerCase();
        return sounds.filter(sound => {
            const name = sound.name.toLowerCase();
            const file = sound.file.toLowerCase();
            return name.includes(term) || file.includes(term);
        });
    }

    /**
     * Get sounds by category
     * @param {Object[]} sounds - Array of sound objects
     * @param {string} category - Category to filter by
     * @returns {Object[]} Filtered sounds
     */
    function getSoundsByCategory(sounds, category) {
        return sounds.filter(s => s.category === category);
    }

    /**
     * Get sorted categories
     * @param {Object} categories - Categories object
     * @returns {Array} Sorted array of [categoryId, categoryInfo]
     */
    function getSortedCategories(categories) {
        return Object.entries(categories).sort((a, b) => a[1].order - b[1].order);
    }

    /**
     * Calculate scroll offset for category navigation
     * @param {number} elementTop - Element's top position from getBoundingClientRect
     * @param {number} scrollY - Current scroll position
     * @param {number} headerOffset - Fixed header height + padding
     * @returns {number} Calculated scroll position
     */
    function calculateScrollOffset(elementTop, scrollY, headerOffset) {
        return elementTop + scrollY - headerOffset;
    }

    /**
     * Check if install prompt should be shown
     * @param {Storage} storage - localStorage or mock
     * @param {number} dismissDays - Number of days to hide after dismiss
     * @returns {boolean}
     */
    function shouldShowInstallPrompt(storage, dismissDays) {
        const dismissedAt = storage.getItem('installPromptDismissed');
        if (dismissedAt) {
            const daysSinceDismissed = (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
            if (daysSinceDismissed < dismissDays) {
                return false;
            }
        }
        return true;
    }

    // ============================================
    // DOM-dependent Functions (browser only)
    // ============================================

    // Initialize the application
    function init() {
        cacheElements();
        loadFavorites();
        setupAudioPlayer();
        setupInstallPrompt();
        renderCategories();
        renderFavoritesSection();
        renderNavigation();
        setupEventListeners();
        updateStats();
        registerServiceWorker();
    }

    // Cache DOM elements
    function cacheElements() {
        elements.contentArea = document.getElementById('content-area');
        elements.categoryNav = document.getElementById('category-nav');
        elements.searchInput = document.getElementById('search-input');
        elements.clearSearch = document.getElementById('clear-search');
        elements.stopAllBtn = document.getElementById('stop-all');
        elements.totalSounds = document.getElementById('total-sounds');
        elements.totalFavorites = document.getElementById('total-favorites');
        elements.visibleSounds = document.getElementById('visible-sounds');
        elements.nowPlaying = document.getElementById('now-playing');
        elements.nowPlayingTitle = document.getElementById('now-playing-title');
        elements.audioPlayer = document.getElementById('audio-player');
        elements.installPrompt = document.getElementById('install-prompt');
        elements.btnInstall = document.getElementById('btn-install');
        elements.btnDismiss = document.getElementById('btn-dismiss');
        elements.installBtn = document.getElementById('install-btn');
    }

    // Setup audio player
    function setupAudioPlayer() {
        state.audioPlayer = elements.audioPlayer;

        state.audioPlayer.addEventListener('ended', () => {
            clearPlayingState();
        });

        state.audioPlayer.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            clearPlayingState();
        });
    }

    // Setup PWA install prompt
    function setupInstallPrompt() {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return;
        }

        // Listen for the beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            state.deferredInstallPrompt = e;

            // Show the header install button
            showInstallButton();

            // Show modal prompt after delay (only if not dismissed recently)
            if (shouldShowInstallPrompt(localStorage, 7)) {
                setTimeout(() => {
                    showInstallPrompt();
                }, 2000);
            }
        });

        // Handle modal install button click
        elements.btnInstall.addEventListener('click', async () => {
            await triggerInstall();
        });

        // Handle header install button click
        if (elements.installBtn) {
            elements.installBtn.addEventListener('click', async () => {
                await triggerInstall();
            });
        }

        // Handle dismiss button click
        elements.btnDismiss.addEventListener('click', () => {
            localStorage.setItem('installPromptDismissed', Date.now().toString());
            hideInstallPrompt();
        });

        // Close on background click
        elements.installPrompt.addEventListener('click', (e) => {
            if (e.target === elements.installPrompt) {
                hideInstallPrompt();
            }
        });

        // Listen for successful install
        window.addEventListener('appinstalled', () => {
            console.log('PWA was installed');
            hideInstallPrompt();
            hideInstallButton();
            state.deferredInstallPrompt = null;
        });
    }

    // Trigger the install prompt
    async function triggerInstall() {
        if (!state.deferredInstallPrompt) {
            return;
        }

        state.deferredInstallPrompt.prompt();
        const { outcome } = await state.deferredInstallPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('PWA installed');
        }

        state.deferredInstallPrompt = null;
        hideInstallPrompt();
        hideInstallButton();
    }

    function showInstallPrompt() {
        if (elements.installPrompt) {
            elements.installPrompt.classList.add('visible');
        }
    }

    function hideInstallPrompt() {
        if (elements.installPrompt) {
            elements.installPrompt.classList.remove('visible');
        }
    }

    function showInstallButton() {
        if (elements.installBtn) {
            elements.installBtn.classList.add('visible');
        }
    }

    function hideInstallButton() {
        if (elements.installBtn) {
            elements.installBtn.classList.remove('visible');
        }
    }

    // Load favorites from localStorage (wrapper for DOM context)
    function loadFavorites() {
        state.favorites = loadFavoritesFromStorage(localStorage);
    }

    // Save favorites to localStorage (wrapper for DOM context)
    function saveFavorites() {
        saveFavoritesToStorage(localStorage, state.favorites);
    }

    // Toggle a sound as favorite
    function toggleFavorite(soundFile) {
        state.favorites = toggleFavoriteInArray(state.favorites, soundFile);
        saveFavorites();
        renderFavoritesSection();
        renderNavigation();
        updateFavoriteButtons();
        updateStats();
    }

    // Update all favorite button states
    function updateFavoriteButtons() {
        document.querySelectorAll('.favorite-btn').forEach(btn => {
            const file = decodeURIComponent(btn.dataset.file);
            const isFav = isFavorite(state.favorites, file);
            btn.classList.toggle('is-favorite', isFav);
            btn.innerHTML = isFav ? '&#9733;' : '&#9734;';
            btn.title = isFav ? 'Remove from favorites' : 'Add to favorites';
        });
    }

    // Render the favorites section
    function renderFavoritesSection() {
        // Remove existing favorites section
        const existingSection = document.getElementById('category-favorites');
        if (existingSection) {
            existingSection.remove();
        }

        // Don't render if no favorites
        if (state.favorites.length === 0) {
            return;
        }

        // Get favorite sounds in the order they appear in state.favorites
        const favoriteSounds = state.favorites
            .map(file => SOUNDS.find(s => s.file === file))
            .filter(Boolean);

        const buttonsHtml = favoriteSounds.map((sound, index) => `
            <div class="sound-btn-wrapper" draggable="true" data-file="${encodeURIComponent(sound.file)}" data-index="${index}">
                <span class="drag-indicator">&#9776;</span>
                <button class="sound-btn" 
                        data-file="${encodeURIComponent(sound.file)}" 
                        data-name="${sound.name}"
                        data-category="favorites">
                    ${sound.name}
                </button>
                <button class="favorite-btn is-favorite" 
                        data-file="${encodeURIComponent(sound.file)}"
                        title="Remove from favorites">&#9733;</button>
            </div>
        `).join('');

        const sectionHtml = `
            <section class="category-section favorites-section" id="category-favorites" data-category="favorites">
                <div class="category-header">
                    <div class="category-title">
                        <span class="category-name">FAVORITES</span>
                        <span class="category-count">(${favoriteSounds.length})</span>
                    </div>
                    <span class="category-toggle">&#9660;</span>
                </div>
                <div class="category-content">
                    ${buttonsHtml}
                </div>
            </section>
        `;

        // Insert at the beginning of content area
        elements.contentArea.insertAdjacentHTML('afterbegin', sectionHtml);

        // Setup drag and drop handlers
        setupFavoritesDragAndDrop();
    }

    // Setup drag and drop for favorites reordering
    function setupFavoritesDragAndDrop() {
        const favoritesSection = document.getElementById('category-favorites');
        if (!favoritesSection) {
            return;
        }

        const wrappers = favoritesSection.querySelectorAll('.sound-btn-wrapper[draggable="true"]');
        let draggedElement = null;

        wrappers.forEach(wrapper => {
            wrapper.addEventListener('dragstart', (e) => {
                draggedElement = wrapper;
                wrapper.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', wrapper.dataset.file);
            });

            wrapper.addEventListener('dragend', () => {
                wrapper.classList.remove('dragging');
                wrappers.forEach(w => w.classList.remove('drag-over'));
                draggedElement = null;
            });

            wrapper.addEventListener('dragover', (e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                if (wrapper !== draggedElement) {
                    wrapper.classList.add('drag-over');
                }
            });

            wrapper.addEventListener('dragleave', () => {
                wrapper.classList.remove('drag-over');
            });

            wrapper.addEventListener('drop', (e) => {
                e.preventDefault();
                wrapper.classList.remove('drag-over');

                if (draggedElement && wrapper !== draggedElement) {
                    const draggedFile = decodeURIComponent(draggedElement.dataset.file);
                    const targetFile = decodeURIComponent(wrapper.dataset.file);
                    reorderFavorites(draggedFile, targetFile);
                }
            });
        });
    }

    // Reorder favorites by moving draggedFile to targetFile's position
    function reorderFavorites(draggedFile, targetFile) {
        state.favorites = reorderFavoritesArray(state.favorites, draggedFile, targetFile);
        saveFavorites();
        renderFavoritesSection();
    }

    // Render all category sections
    function renderCategories() {
        const sortedCategories = getSortedCategories(CATEGORIES);

        const html = sortedCategories.map(([categoryId, categoryInfo]) => {
            const sounds = getSoundsByCategory(SOUNDS, categoryId);
            if (sounds.length === 0) {
                return '';
            }

            const buttonsHtml = sounds.map(sound => {
                const isFav = isFavorite(state.favorites, sound.file);
                return `
                <div class="sound-btn-wrapper">
                    <button class="sound-btn" 
                            data-file="${encodeURIComponent(sound.file)}" 
                            data-name="${sound.name}"
                            data-category="${categoryId}">
                        ${sound.name}
                    </button>
                    <button class="favorite-btn ${isFav ? 'is-favorite' : ''}" 
                            data-file="${encodeURIComponent(sound.file)}"
                            title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">${isFav ? '&#9733;' : '&#9734;'}</button>
                </div>
            `;
            }).join('');

            return `
                <section class="category-section" id="category-${categoryId}" data-category="${categoryId}">
                    <div class="category-header">
                        <div class="category-title">
                            <span class="category-name">${categoryInfo.name}</span>
                            <span class="category-count">(${sounds.length})</span>
                        </div>
                        <span class="category-toggle">&#9660;</span>
                    </div>
                    <div class="category-content">
                        ${buttonsHtml}
                    </div>
                </section>
            `;
        }).join('');

        elements.contentArea.innerHTML = html;
    }

    // Render navigation sidebar
    function renderNavigation() {
        const sortedCategories = getSortedCategories(CATEGORIES);

        // Add favorites nav item if there are favorites
        let favoritesNavHtml = '';
        if (state.favorites.length > 0) {
            favoritesNavHtml = `
                <div class="nav-item favorites-nav" data-category="favorites">
                    <span>FAVORITES</span>
                    <span class="nav-item-count">${state.favorites.length}</span>
                </div>
            `;
        }

        const navHtml = sortedCategories.map(([categoryId, categoryInfo]) => {
            const count = getSoundsByCategory(SOUNDS, categoryId).length;
            if (count === 0) {
                return '';
            }

            return `
                <div class="nav-item" data-category="${categoryId}">
                    <span>${categoryInfo.name}</span>
                    <span class="nav-item-count">${count}</span>
                </div>
            `;
        }).join('');

        const navHeader = elements.categoryNav.querySelector('.nav-header');
        elements.categoryNav.innerHTML = '';
        elements.categoryNav.appendChild(navHeader || createNavHeader());
        elements.categoryNav.insertAdjacentHTML('beforeend', favoritesNavHtml + navHtml);
    }

    function createNavHeader() {
        const header = document.createElement('div');
        header.className = 'nav-header';
        header.textContent = 'CATEGORIES';
        return header;
    }

    // Setup event listeners
    function setupEventListeners() {
        // Sound button and favorite button clicks
        elements.contentArea.addEventListener('click', (e) => {
            // Handle favorite button click
            const favBtn = e.target.closest('.favorite-btn');
            if (favBtn) {
                e.stopPropagation();
                const file = decodeURIComponent(favBtn.dataset.file);
                toggleFavorite(file);
                return;
            }

            // Handle sound button click
            const btn = e.target.closest('.sound-btn');
            if (btn) {
                playSound(btn);
            }

            // Handle category header click
            const header = e.target.closest('.category-header');
            if (header) {
                toggleCategory(header.closest('.category-section'));
            }
        });

        // Navigation clicks
        elements.categoryNav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                scrollToCategory(navItem.dataset.category);
            }
        });

        // Search input
        elements.searchInput.addEventListener('input', (e) => {
            state.searchTerm = e.target.value.toLowerCase();
            filterSounds();
        });

        // Clear search
        elements.clearSearch.addEventListener('click', () => {
            elements.searchInput.value = '';
            state.searchTerm = '';
            filterSounds();
            elements.searchInput.focus();
        });

        // Stop all button
        elements.stopAllBtn.addEventListener('click', stopAllSounds);

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            // Escape to stop sounds
            if (e.key === 'Escape') {
                stopAllSounds();
            }
            // Ctrl/Cmd + F to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                e.preventDefault();
                elements.searchInput.focus();
                elements.searchInput.select();
            }
        });
    }

    // Play a sound
    function playSound(button) {
        const file = decodeURIComponent(button.dataset.file);
        const name = button.dataset.name;

        // If same sound is playing, stop it
        if (state.currentlyPlaying === button) {
            stopAllSounds();
            return;
        }

        // Clear previous playing state
        clearPlayingState();

        // Play new sound - encode the filename properly for URL
        const encodedFile = encodeURIComponent(file);
        state.audioPlayer.src = `sounds/${encodedFile}`;
        state.audioPlayer.play().catch(err => {
            console.error('Playback failed:', err);
        });

        // Update state
        state.currentlyPlaying = button;
        button.classList.add('playing');

        // Update now playing indicator
        elements.nowPlayingTitle.textContent = name;
        elements.nowPlaying.classList.add('visible');
    }

    // Stop all sounds
    function stopAllSounds() {
        state.audioPlayer.pause();
        state.audioPlayer.currentTime = 0;
        clearPlayingState();
    }

    // Clear playing state
    function clearPlayingState() {
        if (state.currentlyPlaying) {
            state.currentlyPlaying.classList.remove('playing');
            state.currentlyPlaying = null;
        }
        elements.nowPlaying.classList.remove('visible');
        elements.nowPlayingTitle.textContent = '-';
    }

    // Toggle category collapse
    function toggleCategory(section) {
        section.classList.toggle('collapsed');
    }

    // Scroll to category
    function scrollToCategory(categoryId) {
        const section = document.getElementById(`category-${categoryId}`);
        if (section) {
            // Expand if collapsed
            section.classList.remove('collapsed');

            // Scroll with offset for fixed header (80px + 10px padding)
            const headerOffset = 90;
            const elementPosition = section.getBoundingClientRect().top;
            const offsetPosition = calculateScrollOffset(elementPosition, window.scrollY, headerOffset);

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth',
            });

            // Update active nav item
            document.querySelectorAll('.nav-item').forEach(item => {
                item.classList.toggle('active', item.dataset.category === categoryId);
            });
        }
    }

    // Filter sounds based on search (DOM version)
    function filterSounds() {
        const wrappers = document.querySelectorAll('.sound-btn-wrapper');
        let visibleCount = 0;

        wrappers.forEach(wrapper => {
            const btn = wrapper.querySelector('.sound-btn');
            if (!btn) {
                return;
            }

            const name = btn.dataset.name.toLowerCase();
            const file = decodeURIComponent(btn.dataset.file).toLowerCase();
            const matches = name.includes(state.searchTerm) || file.includes(state.searchTerm);

            wrapper.style.display = matches ? '' : 'none';
            if (matches) {
                visibleCount++;
            }
        });

        // Show/hide empty categories
        document.querySelectorAll('.category-section').forEach(section => {
            const visibleWrappers = section.querySelectorAll('.sound-btn-wrapper:not([style*="display: none"])');
            section.style.display = visibleWrappers.length === 0 ? 'none' : '';

            // Auto-expand categories with matches when searching
            if (state.searchTerm && visibleWrappers.length > 0) {
                section.classList.remove('collapsed');
            }
        });

        // Update visible count
        elements.visibleSounds.textContent = visibleCount;
    }

    // Update statistics
    function updateStats() {
        elements.totalSounds.textContent = SOUNDS.length;
        elements.totalFavorites.textContent = state.favorites.length;
        elements.visibleSounds.textContent = SOUNDS.length;
    }

    // Register service worker for PWA
    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('service-worker.js')
                    .then(registration => {
                        console.log('SW registered:', registration.scope);
                    })
                    .catch(error => {
                        console.log('SW registration failed:', error);
                    });
            });
        }
    }

    // Initialize when DOM is ready (browser only, not in test environment)
    if (typeof document !== 'undefined' && typeof jest === 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    }

    // Return public API for testing
    return {
        // Constants
        SOUNDS,
        CATEGORIES,

        // Pure functions (testable)
        loadFavoritesFromStorage,
        saveFavoritesToStorage,
        toggleFavoriteInArray,
        isFavorite,
        reorderFavoritesArray,
        filterSoundsArray,
        getSoundsByCategory,
        getSortedCategories,
        calculateScrollOffset,
        shouldShowInstallPrompt,

        // DOM functions (for integration testing)
        cacheElements,
        renderCategories,
        renderFavoritesSection,
        renderNavigation,
        filterSounds,
        updateStats,
        updateFavoriteButtons,
        toggleCategory,
        scrollToCategory,
        playSound,
        stopAllSounds,
        clearPlayingState,
        showInstallPrompt,
        hideInstallPrompt,
        showInstallButton,
        hideInstallButton,
        triggerInstall,
        setupAudioPlayer,
        setupInstallPrompt,
        setupEventListeners,
        loadFavorites,
        saveFavorites,
        toggleFavorite,
        reorderFavorites,
        createNavHeader,
        setupFavoritesDragAndDrop,
        registerServiceWorker,

        // State and elements (for testing)
        getState: () => state,
        setState: (newState) => Object.assign(state, newState),
        getElements: () => elements,
        setElements: (newElements) => Object.assign(elements, newElements),

        // Init function (for manual initialization in tests if needed)
        init,
    };
}));
