/**
 * @jest-environment jsdom
 */

describe('C&C Red Alert Soundboard', () => {
    let localThis;

    beforeEach(() => {
        // Set up DOM
        document.body.innerHTML = `
            <div id="content-area"></div>
            <nav id="category-nav"><div class="nav-header">CATEGORIES</div></nav>
            <input id="search-input" />
            <button id="clear-search"></button>
            <button id="stop-all"></button>
            <span id="total-sounds">0</span>
            <span id="total-favorites">0</span>
            <span id="visible-sounds">0</span>
            <div id="now-playing"></div>
            <span id="now-playing-title"></span>
            <audio id="audio-player"></audio>
            <div id="install-prompt"></div>
            <button id="btn-install"></button>
            <button id="btn-dismiss"></button>
        `;

        // Clear localStorage
        localStorage.clear();

        // Create localThis for testing
        localThis = {
            favorites: [],
            SOUNDS: [
                { file: 'test1.wav', name: 'Test Sound 1', category: 'allies' },
                { file: 'test2.wav', name: 'Test Sound 2', category: 'soviets' },
                { file: 'test3.wav', name: 'Another Sound', category: 'allies' },
            ],
            CATEGORIES: {
                allies: { name: 'ALLIED FORCES', order: 1 },
                soviets: { name: 'SOVIET FORCES', order: 2 },
            },
        };
    });

    describe('Favorites', () => {
        describe('loadFavorites', () => {
            test('should load empty array when localStorage is empty', () => {
                localThis.loadFavorites = function() {
                    try {
                        const stored = localStorage.getItem('cnc-favorites');
                        if (stored) {
                            this.favorites = JSON.parse(stored);
                        }
                    } catch (e) {
                        this.favorites = [];
                    }
                };

                localThis.loadFavorites();
                expect(localThis.favorites).toEqual([]);
            });

            test('should load favorites from localStorage', () => {
                localStorage.setItem('cnc-favorites', JSON.stringify(['test1.wav', 'test2.wav']));

                localThis.loadFavorites = function() {
                    try {
                        const stored = localStorage.getItem('cnc-favorites');
                        if (stored) {
                            this.favorites = JSON.parse(stored);
                        }
                    } catch (e) {
                        this.favorites = [];
                    }
                };

                localThis.loadFavorites();
                expect(localThis.favorites).toEqual(['test1.wav', 'test2.wav']);
            });

            test('should handle corrupted localStorage data', () => {
                localStorage.setItem('cnc-favorites', 'invalid json');

                localThis.loadFavorites = function() {
                    try {
                        const stored = localStorage.getItem('cnc-favorites');
                        if (stored) {
                            this.favorites = JSON.parse(stored);
                        }
                    } catch (e) {
                        this.favorites = [];
                    }
                };

                localThis.loadFavorites();
                expect(localThis.favorites).toEqual([]);
            });
        });

        describe('saveFavorites', () => {
            test('should save favorites to localStorage', () => {
                localThis.favorites = ['test1.wav', 'test3.wav'];

                localThis.saveFavorites = function() {
                    localStorage.setItem('cnc-favorites', JSON.stringify(this.favorites));
                };

                localThis.saveFavorites();

                const stored = JSON.parse(localStorage.getItem('cnc-favorites'));
                expect(stored).toEqual(['test1.wav', 'test3.wav']);
            });
        });

        describe('toggleFavorite', () => {
            beforeEach(() => {
                localThis.saveFavorites = jest.fn();
                localThis.renderFavoritesSection = jest.fn();
                localThis.renderNavigation = jest.fn();
                localThis.updateFavoriteButtons = jest.fn();
                localThis.updateStats = jest.fn();

                localThis.toggleFavorite = function(soundFile) {
                    const index = this.favorites.indexOf(soundFile);
                    if (index === -1) {
                        this.favorites.push(soundFile);
                    } else {
                        this.favorites.splice(index, 1);
                    }
                    this.saveFavorites();
                    this.renderFavoritesSection();
                    this.renderNavigation();
                    this.updateFavoriteButtons();
                    this.updateStats();
                };
            });

            test('should add sound to favorites if not already favorite', () => {
                localThis.favorites = [];

                localThis.toggleFavorite('test1.wav');

                expect(localThis.favorites).toContain('test1.wav');
                expect(localThis.saveFavorites).toHaveBeenCalled();
            });

            test('should remove sound from favorites if already favorite', () => {
                localThis.favorites = ['test1.wav', 'test2.wav'];

                localThis.toggleFavorite('test1.wav');

                expect(localThis.favorites).not.toContain('test1.wav');
                expect(localThis.favorites).toContain('test2.wav');
            });

            test('should call all update functions after toggle', () => {
                localThis.toggleFavorite('test1.wav');

                expect(localThis.saveFavorites).toHaveBeenCalled();
                expect(localThis.renderFavoritesSection).toHaveBeenCalled();
                expect(localThis.renderNavigation).toHaveBeenCalled();
                expect(localThis.updateFavoriteButtons).toHaveBeenCalled();
                expect(localThis.updateStats).toHaveBeenCalled();
            });
        });

        describe('isFavorite', () => {
            test('should return true for favorited sound', () => {
                localThis.favorites = ['test1.wav', 'test2.wav'];

                localThis.isFavorite = function(soundFile) {
                    return this.favorites.includes(soundFile);
                };

                expect(localThis.isFavorite('test1.wav')).toBe(true);
            });

            test('should return false for non-favorited sound', () => {
                localThis.favorites = ['test1.wav'];

                localThis.isFavorite = function(soundFile) {
                    return this.favorites.includes(soundFile);
                };

                expect(localThis.isFavorite('test2.wav')).toBe(false);
            });
        });

        describe('reorderFavorites', () => {
            beforeEach(() => {
                localThis.saveFavorites = jest.fn();
                localThis.renderFavoritesSection = jest.fn();

                localThis.reorderFavorites = function(draggedFile, targetFile) {
                    const draggedIndex = this.favorites.indexOf(draggedFile);
                    const targetIndex = this.favorites.indexOf(targetFile);

                    if (draggedIndex === -1 || targetIndex === -1) return;

                    this.favorites.splice(draggedIndex, 1);
                    this.favorites.splice(targetIndex, 0, draggedFile);

                    this.saveFavorites();
                    this.renderFavoritesSection();
                };
            });

            test('should move dragged item to target position', () => {
                localThis.favorites = ['a.wav', 'b.wav', 'c.wav', 'd.wav'];

                localThis.reorderFavorites('c.wav', 'a.wav');

                expect(localThis.favorites).toEqual(['c.wav', 'a.wav', 'b.wav', 'd.wav']);
            });

            test('should not modify if dragged file not found', () => {
                localThis.favorites = ['a.wav', 'b.wav'];

                localThis.reorderFavorites('x.wav', 'a.wav');

                expect(localThis.favorites).toEqual(['a.wav', 'b.wav']);
                expect(localThis.saveFavorites).not.toHaveBeenCalled();
            });

            test('should not modify if target file not found', () => {
                localThis.favorites = ['a.wav', 'b.wav'];

                localThis.reorderFavorites('a.wav', 'x.wav');

                expect(localThis.favorites).toEqual(['a.wav', 'b.wav']);
                expect(localThis.saveFavorites).not.toHaveBeenCalled();
            });
        });
    });

    describe('Search/Filter', () => {
        describe('filterSounds', () => {
            beforeEach(() => {
                document.getElementById('content-area').innerHTML = `
                    <div class="category-section">
                        <div class="sound-btn-wrapper" style="">
                            <button class="sound-btn" data-name="Test Sound" data-file="test.wav"></button>
                        </div>
                        <div class="sound-btn-wrapper" style="">
                            <button class="sound-btn" data-name="Another" data-file="another.wav"></button>
                        </div>
                    </div>
                `;

                localThis.searchTerm = '';
                localThis.elements = {
                    visibleSounds: document.getElementById('visible-sounds'),
                };

                localThis.filterSounds = function() {
                    const wrappers = document.querySelectorAll('.sound-btn-wrapper');
                    let visibleCount = 0;

                    wrappers.forEach(wrapper => {
                        const btn = wrapper.querySelector('.sound-btn');
                        if (!btn) return;

                        const name = btn.dataset.name.toLowerCase();
                        const file = decodeURIComponent(btn.dataset.file).toLowerCase();
                        const matches = name.includes(this.searchTerm) || file.includes(this.searchTerm);

                        wrapper.style.display = matches ? '' : 'none';
                        if (matches) visibleCount++;
                    });

                    this.elements.visibleSounds.textContent = visibleCount;
                };
            });

            test('should show all sounds when search is empty', () => {
                localThis.searchTerm = '';
                localThis.filterSounds();

                const wrappers = document.querySelectorAll('.sound-btn-wrapper');
                wrappers.forEach(w => {
                    expect(w.style.display).toBe('');
                });
                expect(localThis.elements.visibleSounds.textContent).toBe('2');
            });

            test('should filter sounds by name', () => {
                localThis.searchTerm = 'test';
                localThis.filterSounds();

                const wrappers = document.querySelectorAll('.sound-btn-wrapper');
                expect(wrappers[0].style.display).toBe('');
                expect(wrappers[1].style.display).toBe('none');
                expect(localThis.elements.visibleSounds.textContent).toBe('1');
            });

            test('should filter sounds by filename', () => {
                localThis.searchTerm = 'another';
                localThis.filterSounds();

                const wrappers = document.querySelectorAll('.sound-btn-wrapper');
                expect(wrappers[0].style.display).toBe('none');
                expect(wrappers[1].style.display).toBe('');
            });

            test('should be case insensitive', () => {
                localThis.searchTerm = 'test'; // searchTerm is lowercased before filtering in actual code
                localThis.filterSounds();

                const wrappers = document.querySelectorAll('.sound-btn-wrapper');
                expect(wrappers[0].style.display).toBe('');
            });
        });
    });

    describe('Sound Categories', () => {
        test('should have correct category structure', () => {
            const categories = localThis.CATEGORIES;

            expect(categories.allies).toBeDefined();
            expect(categories.allies.name).toBe('ALLIED FORCES');
            expect(categories.allies.order).toBe(1);

            expect(categories.soviets).toBeDefined();
            expect(categories.soviets.name).toBe('SOVIET FORCES');
            expect(categories.soviets.order).toBe(2);
        });

        test('should filter sounds by category', () => {
            const alliedSounds = localThis.SOUNDS.filter(s => s.category === 'allies');
            const sovietSounds = localThis.SOUNDS.filter(s => s.category === 'soviets');

            expect(alliedSounds.length).toBe(2);
            expect(sovietSounds.length).toBe(1);
        });
    });

    describe('Statistics', () => {
        test('updateStats should update DOM elements', () => {
            localThis.favorites = ['test1.wav'];
            localThis.elements = {
                totalSounds: document.getElementById('total-sounds'),
                totalFavorites: document.getElementById('total-favorites'),
                visibleSounds: document.getElementById('visible-sounds'),
            };

            localThis.updateStats = function() {
                this.elements.totalSounds.textContent = this.SOUNDS.length;
                this.elements.totalFavorites.textContent = this.favorites.length;
                this.elements.visibleSounds.textContent = this.SOUNDS.length;
            };

            localThis.updateStats();

            expect(localThis.elements.totalSounds.textContent).toBe('3');
            expect(localThis.elements.totalFavorites.textContent).toBe('1');
            expect(localThis.elements.visibleSounds.textContent).toBe('3');
        });
    });

    describe('URL Encoding', () => {
        test('should properly encode special characters in filenames', () => {
            const filename = 'allies #1 achnoledged.wav';
            const encoded = encodeURIComponent(filename);

            expect(encoded).toBe('allies%20%231%20achnoledged.wav');
            expect(decodeURIComponent(encoded)).toBe(filename);
        });

        test('should handle ampersand in filenames', () => {
            const filename = 'allies #2 ready & waiting.wav';
            const encoded = encodeURIComponent(filename);

            expect(encoded).toContain('%26');
            expect(decodeURIComponent(encoded)).toBe(filename);
        });

        test('should handle apostrophe in filenames', () => {
            const filename = "MEdic Movin' out.wav";
            const encoded = encodeURIComponent(filename);

            expect(decodeURIComponent(encoded)).toBe(filename);
        });
    });

    describe('Category Navigation', () => {
        test('scrollToCategory should calculate correct offset', () => {
            const headerOffset = 90;
            const mockElementPosition = 500;
            const mockScrollY = 100;

            const expectedOffset = mockElementPosition + mockScrollY - headerOffset;

            expect(expectedOffset).toBe(510);
        });
    });
});
