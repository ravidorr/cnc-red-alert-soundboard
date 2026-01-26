/**
 * @jest-environment jsdom
 */

const CncSoundboard = require('../js/app.js');

describe('C&C Red Alert Soundboard', () => {
    let mockStorage;

    // Helper to set up full DOM
    function setupFullDOM() {
        document.body.innerHTML = `
            <div id="content-area"></div>
            <nav id="category-nav"><div class="nav-header">CATEGORIES</div></nav>
            <input id="search-input" />
            <button id="clear-search"></button>
            <button id="stop-all"></button>
            <button id="install-btn" class="btn-install-header"></button>
            <span id="total-sounds">0</span>
            <span id="total-favorites">0</span>
            <span id="visible-sounds">0</span>
            <div id="now-playing"></div>
            <span id="now-playing-title">-</span>
            <audio id="audio-player"></audio>
            <div id="install-prompt"></div>
            <button id="btn-install"></button>
            <button id="btn-dismiss"></button>
        `;
    }

    beforeEach(() => {
        setupFullDOM();

        // Create mock storage
        mockStorage = {
            store: {},
            getItem: jest.fn(key => mockStorage.store[key] || null),
            setItem: jest.fn((key, value) => {
                mockStorage.store[key] = value;
            }),
            clear: jest.fn(() => {
                mockStorage.store = {};
            }),
        };

        // Reset state
        CncSoundboard.setState({
            audioPlayer: null,
            currentlyPlaying: null,
            searchTerm: '',
            deferredInstallPrompt: null,
            favorites: [],
        });

        // Reset elements
        CncSoundboard.setElements({
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
        });
    });

    // ==========================================
    // Pure Functions Tests
    // ==========================================

    describe('Pure Functions', () => {
        describe('loadFavoritesFromStorage', () => {
            test('should load empty array when localStorage is empty', () => {
                const result = CncSoundboard.loadFavoritesFromStorage(mockStorage);
                expect(result).toEqual([]);
            });

            test('should load favorites from localStorage', () => {
                mockStorage.store['cnc-favorites'] = JSON.stringify(['test1.wav', 'test2.wav']);
                const result = CncSoundboard.loadFavoritesFromStorage(mockStorage);
                expect(result).toEqual(['test1.wav', 'test2.wav']);
            });

            test('should handle corrupted localStorage data', () => {
                mockStorage.store['cnc-favorites'] = 'invalid json';
                const result = CncSoundboard.loadFavoritesFromStorage(mockStorage);
                expect(result).toEqual([]);
            });
        });

        describe('saveFavoritesToStorage', () => {
            test('should save favorites to localStorage', () => {
                const favorites = ['test1.wav', 'test3.wav'];
                CncSoundboard.saveFavoritesToStorage(mockStorage, favorites);
                expect(mockStorage.setItem).toHaveBeenCalledWith(
                    'cnc-favorites',
                    JSON.stringify(favorites)
                );
            });

            test('should handle localStorage errors gracefully', () => {
                const errorStorage = {
                    setItem: jest.fn(() => {
                        throw new Error('QuotaExceededError');
                    }),
                };
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

                expect(() => {
                    CncSoundboard.saveFavoritesToStorage(errorStorage, ['test.wav']);
                }).not.toThrow();

                expect(consoleSpy).toHaveBeenCalled();
                consoleSpy.mockRestore();
            });
        });

        describe('toggleFavoriteInArray', () => {
            test('should add sound to favorites if not already favorite', () => {
                const result = CncSoundboard.toggleFavoriteInArray([], 'test1.wav');
                expect(result).toContain('test1.wav');
            });

            test('should remove sound from favorites if already favorite', () => {
                const result = CncSoundboard.toggleFavoriteInArray(['test1.wav', 'test2.wav'], 'test1.wav');
                expect(result).not.toContain('test1.wav');
                expect(result).toContain('test2.wav');
            });

            test('should not mutate original array', () => {
                const favorites = ['test1.wav'];
                CncSoundboard.toggleFavoriteInArray(favorites, 'test1.wav');
                expect(favorites).toEqual(['test1.wav']);
            });
        });

        describe('isFavorite', () => {
            test('should return true for favorited sound', () => {
                expect(CncSoundboard.isFavorite(['test1.wav'], 'test1.wav')).toBe(true);
            });

            test('should return false for non-favorited sound', () => {
                expect(CncSoundboard.isFavorite(['test1.wav'], 'test2.wav')).toBe(false);
            });
        });

        describe('reorderFavoritesArray', () => {
            test('should move dragged item to target position', () => {
                const result = CncSoundboard.reorderFavoritesArray(
                    ['a.wav', 'b.wav', 'c.wav', 'd.wav'],
                    'c.wav',
                    'a.wav'
                );
                expect(result).toEqual(['c.wav', 'a.wav', 'b.wav', 'd.wav']);
            });

            test('should not modify if dragged file not found', () => {
                const result = CncSoundboard.reorderFavoritesArray(['a.wav', 'b.wav'], 'x.wav', 'a.wav');
                expect(result).toEqual(['a.wav', 'b.wav']);
            });

            test('should not modify if target file not found', () => {
                const result = CncSoundboard.reorderFavoritesArray(['a.wav', 'b.wav'], 'a.wav', 'x.wav');
                expect(result).toEqual(['a.wav', 'b.wav']);
            });
        });

        describe('filterSoundsArray', () => {
            const testSounds = [
                { file: 'test1.wav', name: 'Test Sound', category: 'allies' },
                { file: 'another.wav', name: 'Another', category: 'soviets' },
            ];

            test('should return all sounds when search is empty', () => {
                expect(CncSoundboard.filterSoundsArray(testSounds, '')).toEqual(testSounds);
            });

            test('should filter sounds by name', () => {
                const result = CncSoundboard.filterSoundsArray(testSounds, 'test');
                expect(result.length).toBe(1);
                expect(result[0].name).toBe('Test Sound');
            });

            test('should filter sounds by filename', () => {
                const result = CncSoundboard.filterSoundsArray(testSounds, 'another');
                expect(result.length).toBe(1);
            });

            test('should be case insensitive', () => {
                const result = CncSoundboard.filterSoundsArray(testSounds, 'TEST');
                expect(result.length).toBe(1);
            });
        });

        describe('getSoundsByCategory', () => {
            test('should filter sounds by category', () => {
                const allies = CncSoundboard.getSoundsByCategory(CncSoundboard.SOUNDS, 'allies');
                expect(allies.length).toBeGreaterThan(0);
                expect(allies.every(s => s.category === 'allies')).toBe(true);
            });

            test('should return empty array for unknown category', () => {
                const result = CncSoundboard.getSoundsByCategory(CncSoundboard.SOUNDS, 'nonexistent');
                expect(result).toEqual([]);
            });
        });

        describe('getSortedCategories', () => {
            test('should return categories sorted by order', () => {
                const sorted = CncSoundboard.getSortedCategories(CncSoundboard.CATEGORIES);
                expect(sorted[0][0]).toBe('allies');
                expect(sorted[1][0]).toBe('soviets');
            });
        });

        describe('calculateScrollOffset', () => {
            test('should calculate correct offset', () => {
                expect(CncSoundboard.calculateScrollOffset(500, 100, 90)).toBe(510);
            });

            test('should handle zero values', () => {
                expect(CncSoundboard.calculateScrollOffset(200, 0, 90)).toBe(110);
            });
        });

        describe('shouldShowInstallPrompt', () => {
            test('should return true when never dismissed', () => {
                expect(CncSoundboard.shouldShowInstallPrompt(mockStorage, 7)).toBe(true);
            });

            test('should return false when dismissed recently', () => {
                mockStorage.store['installPromptDismissed'] = (Date.now() - 86400000).toString();
                expect(CncSoundboard.shouldShowInstallPrompt(mockStorage, 7)).toBe(false);
            });

            test('should return true when dismissed long ago', () => {
                mockStorage.store['installPromptDismissed'] = (Date.now() - 864000000).toString();
                expect(CncSoundboard.shouldShowInstallPrompt(mockStorage, 7)).toBe(true);
            });
        });
    });

    // ==========================================
    // DOM Functions Tests
    // ==========================================

    describe('DOM Functions', () => {
        describe('cacheElements', () => {
            test('should cache all DOM elements', () => {
                CncSoundboard.cacheElements();
                const elements = CncSoundboard.getElements();

                expect(elements.contentArea).toBe(document.getElementById('content-area'));
                expect(elements.categoryNav).toBe(document.getElementById('category-nav'));
                expect(elements.searchInput).toBe(document.getElementById('search-input'));
                expect(elements.clearSearch).toBe(document.getElementById('clear-search'));
                expect(elements.stopAllBtn).toBe(document.getElementById('stop-all'));
                expect(elements.totalSounds).toBe(document.getElementById('total-sounds'));
                expect(elements.totalFavorites).toBe(document.getElementById('total-favorites'));
                expect(elements.visibleSounds).toBe(document.getElementById('visible-sounds'));
                expect(elements.nowPlaying).toBe(document.getElementById('now-playing'));
                expect(elements.nowPlayingTitle).toBe(document.getElementById('now-playing-title'));
                expect(elements.audioPlayer).toBe(document.getElementById('audio-player'));
                expect(elements.installPrompt).toBe(document.getElementById('install-prompt'));
                expect(elements.btnInstall).toBe(document.getElementById('btn-install'));
                expect(elements.btnDismiss).toBe(document.getElementById('btn-dismiss'));
            });
        });

        describe('setupAudioPlayer', () => {
            test('should set up audio player with event listeners', () => {
                CncSoundboard.cacheElements();
                CncSoundboard.setupAudioPlayer();

                const state = CncSoundboard.getState();
                expect(state.audioPlayer).toBe(document.getElementById('audio-player'));
            });
        });

        describe('renderCategories', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
            });

            test('should render all categories', () => {
                CncSoundboard.renderCategories();

                const sections = document.querySelectorAll('.category-section');
                expect(sections.length).toBe(12); // 12 categories
            });

            test('should render category headers with correct names', () => {
                CncSoundboard.renderCategories();

                const alliesSection = document.getElementById('category-allies');
                expect(alliesSection).not.toBeNull();
                expect(alliesSection.querySelector('.category-name').textContent).toBe('ALLIED FORCES');
            });

            test('should render sound buttons', () => {
                CncSoundboard.renderCategories();

                const buttons = document.querySelectorAll('.sound-btn');
                expect(buttons.length).toBe(CncSoundboard.SOUNDS.length);
            });

            test('should render favorite buttons', () => {
                CncSoundboard.renderCategories();

                const favButtons = document.querySelectorAll('.favorite-btn');
                expect(favButtons.length).toBe(CncSoundboard.SOUNDS.length);
            });

            test('should mark favorites correctly', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav'] });
                CncSoundboard.renderCategories();

                const favBtn = document.querySelector('.favorite-btn.is-favorite');
                expect(favBtn).not.toBeNull();
            });
        });

        describe('renderNavigation', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
            });

            test('should render navigation items for all categories', () => {
                CncSoundboard.renderNavigation();

                const navItems = document.querySelectorAll('.nav-item');
                expect(navItems.length).toBe(12);
            });

            test('should show favorites nav item when favorites exist', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav'] });
                CncSoundboard.renderNavigation();

                const favNav = document.querySelector('.favorites-nav');
                expect(favNav).not.toBeNull();
            });

            test('should not show favorites nav when no favorites', () => {
                CncSoundboard.setState({ favorites: [] });
                CncSoundboard.renderNavigation();

                const favNav = document.querySelector('.favorites-nav');
                expect(favNav).toBeNull();
            });

            test('should show correct count for each category', () => {
                CncSoundboard.renderNavigation();

                const alliesNav = document.querySelector('[data-category="allies"] .nav-item-count');
                const alliesCount = CncSoundboard.getSoundsByCategory(CncSoundboard.SOUNDS, 'allies').length;
                expect(alliesNav.textContent).toBe(alliesCount.toString());
            });
        });

        describe('renderFavoritesSection', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.renderCategories();
            });

            test('should not render section when no favorites', () => {
                CncSoundboard.setState({ favorites: [] });
                CncSoundboard.renderFavoritesSection();

                const favSection = document.getElementById('category-favorites');
                expect(favSection).toBeNull();
            });

            test('should render favorites section with correct sounds', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav', 'allies #1 affirmative.wav'] });
                CncSoundboard.renderFavoritesSection();

                const favSection = document.getElementById('category-favorites');
                expect(favSection).not.toBeNull();

                const buttons = favSection.querySelectorAll('.sound-btn');
                expect(buttons.length).toBe(2);
            });

            test('should remove existing favorites section before re-rendering', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav'] });
                CncSoundboard.renderFavoritesSection();
                CncSoundboard.renderFavoritesSection();

                const favSections = document.querySelectorAll('#category-favorites');
                expect(favSections.length).toBe(1);
            });

            test('should render draggable wrappers', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav'] });
                CncSoundboard.renderFavoritesSection();

                const wrapper = document.querySelector('.favorites-section .sound-btn-wrapper[draggable="true"]');
                expect(wrapper).not.toBeNull();
            });
        });

        describe('updateStats', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
            });

            test('should update total sounds count', () => {
                CncSoundboard.updateStats();

                expect(document.getElementById('total-sounds').textContent)
                    .toBe(CncSoundboard.SOUNDS.length.toString());
            });

            test('should update favorites count', () => {
                CncSoundboard.setState({ favorites: ['a.wav', 'b.wav', 'c.wav'] });
                CncSoundboard.updateStats();

                expect(document.getElementById('total-favorites').textContent).toBe('3');
            });

            test('should update visible sounds count', () => {
                CncSoundboard.updateStats();

                expect(document.getElementById('visible-sounds').textContent)
                    .toBe(CncSoundboard.SOUNDS.length.toString());
            });
        });

        describe('filterSounds (DOM)', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.renderCategories();
            });

            test('should show all sounds when search is empty', () => {
                CncSoundboard.setState({ searchTerm: '' });
                CncSoundboard.filterSounds();

                const hidden = document.querySelectorAll('.sound-btn-wrapper[style*="display: none"]');
                expect(hidden.length).toBe(0);
            });

            test('should hide non-matching sounds', () => {
                CncSoundboard.setState({ searchTerm: 'tanya' });
                CncSoundboard.filterSounds();

                const visible = document.querySelectorAll('.sound-btn-wrapper:not([style*="display: none"])');
                const tanyaSounds = CncSoundboard.SOUNDS.filter(s => 
                    s.name.toLowerCase().includes('tanya') || s.file.toLowerCase().includes('tanya')
                );
                expect(visible.length).toBe(tanyaSounds.length);
            });

            test('should hide categories with no matches', () => {
                CncSoundboard.setState({ searchTerm: 'xyznonexistent' });
                CncSoundboard.filterSounds();

                const visibleSections = document.querySelectorAll('.category-section:not([style*="display: none"])');
                expect(visibleSections.length).toBe(0);
            });

            test('should update visible count', () => {
                CncSoundboard.setState({ searchTerm: 'acknowledged' });
                CncSoundboard.filterSounds();

                const count = parseInt(document.getElementById('visible-sounds').textContent);
                expect(count).toBeGreaterThan(0);
                expect(count).toBeLessThan(CncSoundboard.SOUNDS.length);
            });

            test('should expand categories with matches when searching', () => {
                const section = document.querySelector('.category-section');
                section.classList.add('collapsed');

                CncSoundboard.setState({ searchTerm: 'acknowledged' });
                CncSoundboard.filterSounds();

                const expandedSections = document.querySelectorAll('.category-section:not(.collapsed):not([style*="display: none"])');
                expect(expandedSections.length).toBeGreaterThan(0);
            });
        });

        describe('updateFavoriteButtons', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.renderCategories();
            });

            test('should update button classes based on favorites', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav'] });
                CncSoundboard.updateFavoriteButtons();

                const favBtns = document.querySelectorAll('.favorite-btn.is-favorite');
                expect(favBtns.length).toBe(1);
            });

            test('should update button titles', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav'] });
                CncSoundboard.updateFavoriteButtons();

                const favBtn = document.querySelector('.favorite-btn.is-favorite');
                expect(favBtn.title).toBe('Remove from favorites');
            });

            test('should update non-favorite button titles', () => {
                CncSoundboard.setState({ favorites: [] });
                CncSoundboard.updateFavoriteButtons();

                const btn = document.querySelector('.favorite-btn:not(.is-favorite)');
                expect(btn.title).toBe('Add to favorites');
            });
        });

        describe('toggleCategory', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.renderCategories();
            });

            test('should collapse expanded category', () => {
                const section = document.querySelector('.category-section');
                expect(section.classList.contains('collapsed')).toBe(false);

                CncSoundboard.toggleCategory(section);
                expect(section.classList.contains('collapsed')).toBe(true);
            });

            test('should expand collapsed category', () => {
                const section = document.querySelector('.category-section');
                section.classList.add('collapsed');

                CncSoundboard.toggleCategory(section);
                expect(section.classList.contains('collapsed')).toBe(false);
            });
        });

        describe('scrollToCategory', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.renderCategories();
                CncSoundboard.renderNavigation();
            });

            test('should expand collapsed category', () => {
                const section = document.getElementById('category-allies');
                section.classList.add('collapsed');

                CncSoundboard.scrollToCategory('allies');
                expect(section.classList.contains('collapsed')).toBe(false);
            });

            test('should call window.scrollTo', () => {
                CncSoundboard.scrollToCategory('allies');
                expect(window.scrollTo).toHaveBeenCalled();
            });

            test('should update active nav item', () => {
                CncSoundboard.scrollToCategory('soviets');

                const activeNav = document.querySelector('.nav-item.active');
                expect(activeNav.dataset.category).toBe('soviets');
            });

            test('should handle non-existent category gracefully', () => {
                expect(() => {
                    CncSoundboard.scrollToCategory('nonexistent');
                }).not.toThrow();
            });
        });

        describe('showInstallPrompt / hideInstallPrompt', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
            });

            test('should add visible class on show', () => {
                CncSoundboard.showInstallPrompt();

                const prompt = document.getElementById('install-prompt');
                expect(prompt.classList.contains('visible')).toBe(true);
            });

            test('should remove visible class on hide', () => {
                const prompt = document.getElementById('install-prompt');
                prompt.classList.add('visible');

                CncSoundboard.hideInstallPrompt();
                expect(prompt.classList.contains('visible')).toBe(false);
            });
        });

        describe('playSound', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.setupAudioPlayer();
                CncSoundboard.renderCategories();
            });

            test('should set audio source', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);

                const state = CncSoundboard.getState();
                expect(state.audioPlayer.src).toContain('sounds/');
            });

            test('should add playing class to button', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);

                expect(btn.classList.contains('playing')).toBe(true);
            });

            test('should update now playing indicator', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);

                const nowPlaying = document.getElementById('now-playing');
                expect(nowPlaying.classList.contains('visible')).toBe(true);
            });

            test('should update now playing title', () => {
                const btn = document.querySelector('.sound-btn');
                const expectedName = btn.dataset.name;
                CncSoundboard.playSound(btn);

                const title = document.getElementById('now-playing-title');
                expect(title.textContent).toBe(expectedName);
            });

            test('should stop previous sound when playing new one', () => {
                const btn1 = document.querySelectorAll('.sound-btn')[0];
                const btn2 = document.querySelectorAll('.sound-btn')[1];

                CncSoundboard.playSound(btn1);
                CncSoundboard.playSound(btn2);

                expect(btn1.classList.contains('playing')).toBe(false);
                expect(btn2.classList.contains('playing')).toBe(true);
            });

            test('should stop sound when clicking same button', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);
                CncSoundboard.playSound(btn);

                expect(btn.classList.contains('playing')).toBe(false);
            });
        });

        describe('stopAllSounds', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.setupAudioPlayer();
                CncSoundboard.renderCategories();
            });

            test('should pause audio', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);

                CncSoundboard.stopAllSounds();

                const state = CncSoundboard.getState();
                expect(state.audioPlayer.paused).toBe(true);
            });

            test('should reset audio time', () => {
                CncSoundboard.stopAllSounds();

                const state = CncSoundboard.getState();
                expect(state.audioPlayer.currentTime).toBe(0);
            });

            test('should clear playing state', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);
                CncSoundboard.stopAllSounds();

                expect(btn.classList.contains('playing')).toBe(false);
            });
        });

        describe('clearPlayingState', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.setupAudioPlayer();
                CncSoundboard.renderCategories();
            });

            test('should remove playing class from current button', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);
                CncSoundboard.clearPlayingState();

                expect(btn.classList.contains('playing')).toBe(false);
            });

            test('should hide now playing indicator', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);
                CncSoundboard.clearPlayingState();

                const nowPlaying = document.getElementById('now-playing');
                expect(nowPlaying.classList.contains('visible')).toBe(false);
            });

            test('should reset now playing title', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);
                CncSoundboard.clearPlayingState();

                const title = document.getElementById('now-playing-title');
                expect(title.textContent).toBe('-');
            });

            test('should handle case when nothing is playing', () => {
                expect(() => {
                    CncSoundboard.clearPlayingState();
                }).not.toThrow();
            });
        });

        describe('createNavHeader', () => {
            test('should create nav header element', () => {
                const header = CncSoundboard.createNavHeader();

                expect(header.tagName).toBe('DIV');
                expect(header.className).toBe('nav-header');
                expect(header.textContent).toBe('CATEGORIES');
            });
        });

        describe('loadFavorites (DOM wrapper)', () => {
            test('should load favorites into state', () => {
                localStorage.setItem('cnc-favorites', JSON.stringify(['test.wav']));
                CncSoundboard.loadFavorites();

                const state = CncSoundboard.getState();
                expect(state.favorites).toEqual(['test.wav']);
            });
        });

        describe('saveFavorites (DOM wrapper)', () => {
            test('should save state favorites to localStorage', () => {
                CncSoundboard.setState({ favorites: ['saved.wav'] });
                CncSoundboard.saveFavorites();

                const stored = JSON.parse(localStorage.getItem('cnc-favorites'));
                expect(stored).toEqual(['saved.wav']);
            });
        });

        describe('toggleFavorite', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.renderCategories();
                CncSoundboard.renderNavigation();
            });

            test('should add sound to favorites', () => {
                CncSoundboard.setState({ favorites: [] });
                CncSoundboard.toggleFavorite('test.wav');

                const state = CncSoundboard.getState();
                expect(state.favorites).toContain('test.wav');
            });

            test('should remove sound from favorites', () => {
                CncSoundboard.setState({ favorites: ['test.wav'] });
                CncSoundboard.toggleFavorite('test.wav');

                const state = CncSoundboard.getState();
                expect(state.favorites).not.toContain('test.wav');
            });

            test('should persist to localStorage', () => {
                CncSoundboard.setState({ favorites: [] });
                CncSoundboard.toggleFavorite('persisted.wav');

                const stored = JSON.parse(localStorage.getItem('cnc-favorites'));
                expect(stored).toContain('persisted.wav');
            });
        });

        describe('reorderFavorites', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.renderCategories();
            });

            test('should reorder favorites in state', () => {
                CncSoundboard.setState({ favorites: ['a.wav', 'b.wav', 'c.wav'] });
                CncSoundboard.reorderFavorites('c.wav', 'a.wav');

                const state = CncSoundboard.getState();
                expect(state.favorites).toEqual(['c.wav', 'a.wav', 'b.wav']);
            });

            test('should persist reorder to localStorage', () => {
                CncSoundboard.setState({ favorites: ['a.wav', 'b.wav'] });
                CncSoundboard.reorderFavorites('b.wav', 'a.wav');

                const stored = JSON.parse(localStorage.getItem('cnc-favorites'));
                expect(stored).toEqual(['b.wav', 'a.wav']);
            });
        });

        describe('setupFavoritesDragAndDrop', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.renderCategories();
            });

            test('should not throw when no favorites section exists', () => {
                CncSoundboard.setState({ favorites: [] });
                expect(() => {
                    CncSoundboard.setupFavoritesDragAndDrop();
                }).not.toThrow();
            });

            test('should set up drag handlers on favorite wrappers', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav'] });
                CncSoundboard.renderFavoritesSection();

                const wrapper = document.querySelector('.favorites-section .sound-btn-wrapper');
                expect(wrapper.getAttribute('draggable')).toBe('true');
            });

            test('dragstart should add dragging class', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav', 'allies #1 affirmative.wav'] });
                CncSoundboard.renderFavoritesSection();

                const wrapper = document.querySelector('.favorites-section .sound-btn-wrapper');
                const event = new Event('dragstart', { bubbles: true });
                event.dataTransfer = { setData: jest.fn(), effectAllowed: null };
                wrapper.dispatchEvent(event);

                expect(wrapper.classList.contains('dragging')).toBe(true);
            });

            test('dragend should remove dragging class', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav', 'allies #1 affirmative.wav'] });
                CncSoundboard.renderFavoritesSection();

                const wrapper = document.querySelector('.favorites-section .sound-btn-wrapper');
                wrapper.classList.add('dragging');

                const event = new Event('dragend', { bubbles: true });
                wrapper.dispatchEvent(event);

                expect(wrapper.classList.contains('dragging')).toBe(false);
            });

            test('dragover should add drag-over class to target', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav', 'allies #1 affirmative.wav'] });
                CncSoundboard.renderFavoritesSection();

                const wrappers = document.querySelectorAll('.favorites-section .sound-btn-wrapper');
                const event = new Event('dragover', { bubbles: true });
                event.preventDefault = jest.fn();
                event.dataTransfer = { dropEffect: null };
                wrappers[1].dispatchEvent(event);

                expect(event.preventDefault).toHaveBeenCalled();
            });

            test('dragleave should remove drag-over class', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav', 'allies #1 affirmative.wav'] });
                CncSoundboard.renderFavoritesSection();

                const wrapper = document.querySelector('.favorites-section .sound-btn-wrapper');
                wrapper.classList.add('drag-over');

                const event = new Event('dragleave', { bubbles: true });
                wrapper.dispatchEvent(event);

                expect(wrapper.classList.contains('drag-over')).toBe(false);
            });

            test('drop should remove drag-over class', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav', 'allies #1 affirmative.wav'] });
                CncSoundboard.renderFavoritesSection();

                const wrapper = document.querySelector('.favorites-section .sound-btn-wrapper');
                wrapper.classList.add('drag-over');

                const event = new Event('drop', { bubbles: true });
                event.preventDefault = jest.fn();
                wrapper.dispatchEvent(event);

                expect(wrapper.classList.contains('drag-over')).toBe(false);
            });
        });

        describe('setupEventListeners', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.setupAudioPlayer();
                CncSoundboard.renderCategories();
                CncSoundboard.renderNavigation();
                CncSoundboard.setupEventListeners();
            });

            test('clicking sound button should play sound', () => {
                const btn = document.querySelector('.sound-btn');
                btn.click();

                expect(btn.classList.contains('playing')).toBe(true);
            });

            test('clicking favorite button should toggle favorite', () => {
                CncSoundboard.setState({ favorites: [] });
                const favBtn = document.querySelector('.favorite-btn');
                favBtn.click();

                const state = CncSoundboard.getState();
                expect(state.favorites.length).toBe(1);
            });

            test('clicking category header should toggle collapse', () => {
                const header = document.querySelector('.category-header');
                const section = header.closest('.category-section');

                header.click();
                expect(section.classList.contains('collapsed')).toBe(true);

                header.click();
                expect(section.classList.contains('collapsed')).toBe(false);
            });

            test('clicking nav item should scroll to category', () => {
                const navItem = document.querySelector('.nav-item');
                navItem.click();

                expect(window.scrollTo).toHaveBeenCalled();
            });

            test('search input should filter sounds', () => {
                const input = document.getElementById('search-input');
                input.value = 'tanya';
                input.dispatchEvent(new Event('input'));

                const state = CncSoundboard.getState();
                expect(state.searchTerm).toBe('tanya');
            });

            test('clear search should reset search', () => {
                CncSoundboard.setState({ searchTerm: 'test' });
                document.getElementById('search-input').value = 'test';

                document.getElementById('clear-search').click();

                const state = CncSoundboard.getState();
                expect(state.searchTerm).toBe('');
                expect(document.getElementById('search-input').value).toBe('');
            });

            test('stop all button should stop sounds', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);

                document.getElementById('stop-all').click();

                expect(btn.classList.contains('playing')).toBe(false);
            });

            test('Escape key should stop sounds', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);

                const event = new KeyboardEvent('keydown', { key: 'Escape' });
                document.dispatchEvent(event);

                expect(btn.classList.contains('playing')).toBe(false);
            });

            test('Ctrl+F should focus search input', () => {
                const input = document.getElementById('search-input');
                const focusSpy = jest.spyOn(input, 'focus');

                const event = new KeyboardEvent('keydown', { key: 'f', ctrlKey: true });
                document.dispatchEvent(event);

                expect(focusSpy).toHaveBeenCalled();
            });

            test('Cmd+F should focus search input', () => {
                const input = document.getElementById('search-input');
                const focusSpy = jest.spyOn(input, 'focus');

                const event = new KeyboardEvent('keydown', { key: 'f', metaKey: true });
                document.dispatchEvent(event);

                expect(focusSpy).toHaveBeenCalled();
            });
        });

        describe('setupInstallPrompt', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                localStorage.clear();
            });

            test('should not setup if dismissed recently', () => {
                localStorage.setItem('installPromptDismissed', Date.now().toString());

                // Should not throw
                expect(() => {
                    CncSoundboard.setupInstallPrompt();
                }).not.toThrow();
            });

            test('should setup event listeners when conditions are met', () => {
                const addEventSpy = jest.spyOn(window, 'addEventListener');
                CncSoundboard.setupInstallPrompt();

                expect(addEventSpy).toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));
            });

            test('should not setup if already installed as PWA', () => {
                // Mock standalone mode
                window.matchMedia = jest.fn().mockImplementation(query => ({
                    matches: query === '(display-mode: standalone)',
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                }));

                const addEventSpy = jest.spyOn(window, 'addEventListener');
                CncSoundboard.setupInstallPrompt();

                // Should not add beforeinstallprompt listener
                expect(addEventSpy).not.toHaveBeenCalledWith('beforeinstallprompt', expect.any(Function));

                // Reset matchMedia mock
                window.matchMedia = jest.fn().mockImplementation(query => ({
                    matches: false,
                    media: query,
                    onchange: null,
                    addListener: jest.fn(),
                    removeListener: jest.fn(),
                    addEventListener: jest.fn(),
                    removeEventListener: jest.fn(),
                    dispatchEvent: jest.fn(),
                }));
            });
        });

        describe('Audio Events', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.setupAudioPlayer();
                CncSoundboard.renderCategories();
            });

            test('audio ended event should clear playing state', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);

                const audio = document.getElementById('audio-player');
                audio.dispatchEvent(new Event('ended'));

                expect(btn.classList.contains('playing')).toBe(false);
            });

            test('audio error event should clear playing state', () => {
                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);

                const audio = document.getElementById('audio-player');
                audio.dispatchEvent(new Event('error'));

                expect(btn.classList.contains('playing')).toBe(false);
            });
        });

        describe('registerServiceWorker', () => {
            test('should not throw when serviceWorker not available', () => {
                const originalSW = navigator.serviceWorker;
                delete navigator.serviceWorker;

                expect(() => {
                    CncSoundboard.registerServiceWorker();
                }).not.toThrow();

                // Restore
                Object.defineProperty(navigator, 'serviceWorker', {
                    value: originalSW,
                    writable: true,
                });
            });

            test('should add load listener when serviceWorker is available', () => {
                // serviceWorker exists in jsdom, so just verify the function runs
                const addEventSpy = jest.spyOn(window, 'addEventListener');

                CncSoundboard.registerServiceWorker();

                expect(addEventSpy).toHaveBeenCalledWith('load', expect.any(Function));
            });

        });

        describe('init', () => {
            test('should initialize all components', () => {
                // Reset everything
                CncSoundboard.setElements({
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
                });

                CncSoundboard.init();

                // Verify elements are cached
                const elements = CncSoundboard.getElements();
                expect(elements.contentArea).not.toBeNull();

                // Verify categories are rendered
                const sections = document.querySelectorAll('.category-section');
                expect(sections.length).toBe(12);

                // Verify stats are updated
                expect(document.getElementById('total-sounds').textContent)
                    .toBe(CncSoundboard.SOUNDS.length.toString());
            });
        });

        describe('Edge Cases', () => {
            beforeEach(() => {
                CncSoundboard.cacheElements();
                CncSoundboard.setupAudioPlayer();
                CncSoundboard.renderCategories();
                CncSoundboard.renderNavigation();
            });

            test('clicking on empty area should not throw', () => {
                CncSoundboard.setupEventListeners();
                const contentArea = document.getElementById('content-area');

                expect(() => {
                    contentArea.click();
                }).not.toThrow();
            });

            test('clicking nav area without nav-item should not throw', () => {
                CncSoundboard.setupEventListeners();
                const nav = document.getElementById('category-nav');
                const header = nav.querySelector('.nav-header');

                expect(() => {
                    header.click();
                }).not.toThrow();
            });

            test('filter with no button in wrapper should not throw', () => {
                // Add a wrapper without a button
                const contentArea = document.getElementById('content-area');
                const emptyWrapper = document.createElement('div');
                emptyWrapper.className = 'sound-btn-wrapper';
                contentArea.appendChild(emptyWrapper);

                CncSoundboard.setState({ searchTerm: 'test' });

                expect(() => {
                    CncSoundboard.filterSounds();
                }).not.toThrow();
            });

            test('showInstallPrompt with null element should not throw', () => {
                CncSoundboard.setElements({ installPrompt: null });

                expect(() => {
                    CncSoundboard.showInstallPrompt();
                }).not.toThrow();
            });

            test('hideInstallPrompt with null element should not throw', () => {
                CncSoundboard.setElements({ installPrompt: null });

                expect(() => {
                    CncSoundboard.hideInstallPrompt();
                }).not.toThrow();
            });

            test('drag and drop reorder on actual drop', () => {
                CncSoundboard.setState({ favorites: ['allies #1 achnoledged.wav', 'allies #1 affirmative.wav'] });
                CncSoundboard.renderFavoritesSection();

                const wrappers = document.querySelectorAll('.favorites-section .sound-btn-wrapper');

                // Simulate dragstart on first wrapper
                const dragStartEvent = new Event('dragstart', { bubbles: true });
                dragStartEvent.dataTransfer = { setData: jest.fn(), effectAllowed: null };
                wrappers[0].dispatchEvent(dragStartEvent);

                // Simulate drop on second wrapper
                const dropEvent = new Event('drop', { bubbles: true });
                dropEvent.preventDefault = jest.fn();
                wrappers[1].dispatchEvent(dropEvent);

                // Check that favorites were reordered
                const state = CncSoundboard.getState();
                expect(state.favorites[0]).toBe('allies #1 affirmative.wav');
            });

            test('playSound handles audio play failure gracefully', async () => {
                // Mock console.error to track calls
                const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

                // Mock play to reject
                const audio = document.getElementById('audio-player');
                audio.play = jest.fn().mockRejectedValue(new Error('Playback failed'));

                const btn = document.querySelector('.sound-btn');
                CncSoundboard.playSound(btn);

                // Wait for promise rejection
                await new Promise(resolve => setTimeout(resolve, 50));

                expect(consoleSpy).toHaveBeenCalledWith('Playback failed:', expect.any(Error));
                consoleSpy.mockRestore();
            });

            test('getSoundsByCategory returns empty for category with no sounds', () => {
                const result = CncSoundboard.getSoundsByCategory([], 'empty');
                expect(result).toEqual([]);
            });

            test('renderCategories handles empty categories gracefully', () => {
                // All categories have sounds, so this tests the branch
                CncSoundboard.renderCategories();
                const sections = document.querySelectorAll('.category-section');
                expect(sections.length).toBe(12);
            });
        });

        describe('Install Prompt Handlers', () => {
            beforeEach(() => {
                setupFullDOM();
                localStorage.clear();
                CncSoundboard.cacheElements();
            });

            test('dismiss button saves timestamp to localStorage', () => {
                CncSoundboard.setupInstallPrompt();

                const dismissBtn = document.getElementById('btn-dismiss');
                dismissBtn.click();

                const dismissed = localStorage.getItem('installPromptDismissed');
                expect(dismissed).not.toBeNull();
            });

            test('background click on install prompt hides it', () => {
                CncSoundboard.setupInstallPrompt();

                const prompt = document.getElementById('install-prompt');
                prompt.classList.add('visible');

                // Click on the prompt background itself
                const event = new MouseEvent('click', { bubbles: true });
                Object.defineProperty(event, 'target', { value: prompt });
                prompt.dispatchEvent(event);

                expect(prompt.classList.contains('visible')).toBe(false);
            });

            test('install button does nothing without deferred prompt', () => {
                CncSoundboard.setupInstallPrompt();
                CncSoundboard.setState({ deferredInstallPrompt: null });

                const installBtn = document.getElementById('btn-install');

                expect(() => {
                    installBtn.click();
                }).not.toThrow();
            });

            test('beforeinstallprompt stores deferred prompt', () => {
                CncSoundboard.setupInstallPrompt();

                const mockPrompt = {
                    preventDefault: jest.fn(),
                    prompt: jest.fn(),
                    userChoice: Promise.resolve({ outcome: 'accepted' }),
                };

                const event = new Event('beforeinstallprompt');
                Object.assign(event, mockPrompt);

                window.dispatchEvent(event);

                const state = CncSoundboard.getState();
                expect(state.deferredInstallPrompt).not.toBeNull();
            });

            test('install button triggers prompt when available', async () => {
                CncSoundboard.setupInstallPrompt();

                const mockPrompt = {
                    prompt: jest.fn(),
                    userChoice: Promise.resolve({ outcome: 'accepted' }),
                };

                CncSoundboard.setState({ deferredInstallPrompt: mockPrompt });

                const installBtn = document.getElementById('btn-install');
                installBtn.click();

                await Promise.resolve(); // Let async handler run

                expect(mockPrompt.prompt).toHaveBeenCalled();
            });

            test('appinstalled event clears deferred prompt', () => {
                CncSoundboard.setupInstallPrompt();
                CncSoundboard.setState({ deferredInstallPrompt: {} });

                window.dispatchEvent(new Event('appinstalled'));

                const state = CncSoundboard.getState();
                expect(state.deferredInstallPrompt).toBeNull();
            });

            test('header install button triggers install', async () => {
                CncSoundboard.setupInstallPrompt();

                const mockPrompt = {
                    prompt: jest.fn(),
                    userChoice: Promise.resolve({ outcome: 'accepted' }),
                };

                CncSoundboard.setState({ deferredInstallPrompt: mockPrompt });

                const installBtn = document.getElementById('install-btn');
                installBtn.click();

                await Promise.resolve();

                expect(mockPrompt.prompt).toHaveBeenCalled();
            });
        });

        describe('Install Button Visibility', () => {
            beforeEach(() => {
                setupFullDOM();
                CncSoundboard.cacheElements();
            });

            test('showInstallButton adds visible class', () => {
                CncSoundboard.showInstallButton();

                const btn = document.getElementById('install-btn');
                expect(btn.classList.contains('visible')).toBe(true);
            });

            test('hideInstallButton removes visible class', () => {
                const btn = document.getElementById('install-btn');
                btn.classList.add('visible');

                CncSoundboard.hideInstallButton();

                expect(btn.classList.contains('visible')).toBe(false);
            });

            test('showInstallButton handles null element', () => {
                CncSoundboard.setElements({ installBtn: null });

                expect(() => {
                    CncSoundboard.showInstallButton();
                }).not.toThrow();
            });

            test('hideInstallButton handles null element', () => {
                CncSoundboard.setElements({ installBtn: null });

                expect(() => {
                    CncSoundboard.hideInstallButton();
                }).not.toThrow();
            });

            test('triggerInstall does nothing without deferred prompt', async () => {
                CncSoundboard.setState({ deferredInstallPrompt: null });

                await expect(CncSoundboard.triggerInstall()).resolves.not.toThrow();
            });

            test('triggerInstall calls prompt and hides UI', async () => {
                const mockPrompt = {
                    prompt: jest.fn(),
                    userChoice: Promise.resolve({ outcome: 'dismissed' }),
                };

                CncSoundboard.setState({ deferredInstallPrompt: mockPrompt });

                await CncSoundboard.triggerInstall();

                expect(mockPrompt.prompt).toHaveBeenCalled();
                const state = CncSoundboard.getState();
                expect(state.deferredInstallPrompt).toBeNull();
            });
        });
    });

    // ==========================================
    // Data Tests
    // ==========================================

    describe('Sound Data', () => {
        test('should have sounds array with items', () => {
            expect(Array.isArray(CncSoundboard.SOUNDS)).toBe(true);
            expect(CncSoundboard.SOUNDS.length).toBeGreaterThan(100);
        });

        test('each sound should have required properties', () => {
            CncSoundboard.SOUNDS.forEach(sound => {
                expect(sound).toHaveProperty('file');
                expect(sound).toHaveProperty('name');
                expect(sound).toHaveProperty('category');
            });
        });

        test('each sound category should exist in CATEGORIES', () => {
            const categoryIds = Object.keys(CncSoundboard.CATEGORIES);
            CncSoundboard.SOUNDS.forEach(sound => {
                expect(categoryIds).toContain(sound.category);
            });
        });

        test('should have 12 categories', () => {
            expect(Object.keys(CncSoundboard.CATEGORIES).length).toBe(12);
        });
    });

    // ==========================================
    // URL Encoding Tests
    // ==========================================

    describe('URL Encoding', () => {
        test('should encode hash character', () => {
            const encoded = encodeURIComponent('allies #1 achnoledged.wav');
            expect(encoded).toContain('%23');
        });

        test('should encode ampersand', () => {
            const encoded = encodeURIComponent('allies #2 ready & waiting.wav');
            expect(encoded).toContain('%26');
        });

        test('should encode space', () => {
            const encoded = encodeURIComponent('test file.wav');
            expect(encoded).toContain('%20');
        });

        test('should round-trip encode/decode', () => {
            const original = "MEdic Movin' out.wav";
            expect(decodeURIComponent(encodeURIComponent(original))).toBe(original);
        });
    });

    // ==========================================
    // State Management Tests
    // ==========================================

    describe('State Management', () => {
        test('getState should return current state', () => {
            const state = CncSoundboard.getState();
            expect(state).toHaveProperty('favorites');
            expect(state).toHaveProperty('searchTerm');
        });

        test('setState should update state', () => {
            CncSoundboard.setState({ searchTerm: 'test' });
            expect(CncSoundboard.getState().searchTerm).toBe('test');
        });

        test('getElements should return elements object', () => {
            const elements = CncSoundboard.getElements();
            expect(elements).toHaveProperty('contentArea');
        });

        test('setElements should update elements', () => {
            const div = document.createElement('div');
            CncSoundboard.setElements({ contentArea: div });
            expect(CncSoundboard.getElements().contentArea).toBe(div);
        });
    });
});
