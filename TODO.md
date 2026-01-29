# C&C Red Alert Soundboard - Improvement Backlog

Potential improvements identified from codebase review (January 2026).

## Status: ALL COMPLETED (v3.0.0)

All 17 improvement items have been implemented across 5 phases:

| Phase | Items | Status |
|-------|-------|--------|
| Phase 1 | CSS variables, manifest updates, offline indicators | COMPLETED |
| Phase 2 | Focus trap, PWA updates, event cleanup, CSS transitions | COMPLETED |
| Phase 3 | Search optimization, button HTML extraction, rgba variables, manifest icons | COMPLETED |
| Phase 4 | Screen reader announcer, button base class, transition variables, modern JS | COMPLETED |
| Phase 5 | Test improvements (fake timers, isolation, mocking, async/await) | COMPLETED |

**Final metrics:**
- 599 tests passing
- 98.85% code coverage
- All linting passing

---

## High Priority - COMPLETED

### 1. JavaScript: Extract Duplicated Focus Trap Logic - COMPLETED

**Files:** `events.js`, `confirm-modal.js`, `contact-modal.js`, `onboarding.js`, `install.js`, `mobile.js`

**Issue:** Focus trap logic is duplicated across 6+ files with slight variations.

**Solution:** Create a reusable utility function in `utils.js`:

```javascript
export function createFocusTrap(container, options = {}) {
    const { onEscape, firstFocusable, lastFocusable } = options;
    
    return function handleKeydown(e) {
        if (e.key === 'Escape' && onEscape) {
            onEscape(e);
            return;
        }
        
        if (e.key === 'Tab') {
            const focusable = container.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
            );
            if (focusable.length === 0) return;
            
            const first = firstFocusable || focusable[0];
            const last = lastFocusable || focusable[focusable.length - 1];
            
            if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    };
}
```

---

### 2. PWA: Add Update Detection & User Notification - COMPLETED

**File:** `js/install.js`, `service-worker.js`

**Issue:** No mechanism to detect or notify users when a new version is available. Users may run stale versions indefinitely.

**Solution:** Enhance `registerServiceWorker()`:

```javascript
export function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('service-worker.js')
                .then(registration => {
                    // Check for updates periodically
                    setInterval(() => {
                        registration.update();
                    }, 60 * 60 * 1000); // Every hour
                    
                    // Listen for update found
                    registration.addEventListener('updatefound', () => {
                        const newWorker = registration.installing;
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                // New version available - show notification
                                showUpdateAvailableNotification();
                            }
                        });
                    });
                });
        });
    }
}
```

---

### 3. JavaScript: Add Event Listener Cleanup - COMPLETED

**Files:** `events.js`, `mobile.js`

**Issue:** Scroll listener on `back-to-top` button (line 190 in `events.js`) and resize listener in `mobile.js` (line 46) are never removed, causing potential memory leaks.

**Solution:** Store cleanup functions and call them when needed:

```javascript
const cleanupFunctions = [];

export function setupEventListeners() {
    const backToTopBtn = document.getElementById('back-to-top');
    if (backToTopBtn) {
        const scrollHandler = () => {
            backToTopBtn.classList.toggle('visible', window.scrollY > 500);
        };
        window.addEventListener('scroll', scrollHandler);
        cleanupFunctions.push(() => window.removeEventListener('scroll', scrollHandler));
    }
}

export function cleanupEventListeners() {
    cleanupFunctions.forEach(fn => fn());
    cleanupFunctions.length = 0;
}
```

---

### 4. CSS: Replace `max-height` Transition - COMPLETED

**File:** `css/components.css:322`

**Issue:** `max-height` transitions trigger layout recalculations, hurting performance.

```css
.category-content {
    transition: max-height 0.3s ease, padding 0.3s ease;
}
```

**Solution:** Use `transform: scaleY()` or `grid-template-rows` with `fr` units, or animate `opacity` + `transform: translateY()` instead.

---

## Medium Priority - COMPLETED

### 5. JavaScript: Optimize Search Filtering - COMPLETED

**File:** `js/search.js`

**Issue:** `filterSounds()` queries all wrappers on every keystroke and performs redundant DOM operations.

**Solution:** Cache wrapper references and batch DOM updates:

```javascript
let cachedWrappers = null;

export function filterSounds() {
    if (!cachedWrappers) {
        cachedWrappers = Array.from(document.querySelectorAll('.sound-btn-wrapper'));
    }
    
    requestAnimationFrame(() => {
        cachedWrappers.forEach(wrapper => {
            // Apply display changes
        });
    });
}
```

---

### 6. JavaScript: Extract Sound Button HTML Generation - COMPLETED

**File:** `js/ui.js`

**Issue:** Sound button HTML is duplicated in `renderCategories()`, `renderFavoritesSection()`, `renderPopularSection()`, and `renderRecentlyPlayedSection()`.

**Solution:** Create a reusable function:

```javascript
export function createSoundButtonHTML(sound, options = {}) {
    const { showDragHandle = false, index = null } = options;
    const isFav = isFavorite(state.favorites, sound.file);
    const favAriaLabel = isFav 
        ? `Remove ${sound.name} from favorites` 
        : `Add ${sound.name} to favorites`;
    
    return `
        <div class="sound-btn-wrapper" ${showDragHandle ? 'draggable="true"' : ''} 
             ${index !== null ? `data-index="${index}"` : ''} 
             data-file="${encodeURIComponent(sound.file)}">
            ${showDragHandle ? '<span class="drag-indicator">&#9776;</span>' : ''}
            <button class="sound-btn" 
                    data-file="${encodeURIComponent(sound.file)}" 
                    data-name="${sound.name}"
                    data-category="${sound.category}"
                    title="Play ${sound.name}">
                ${sound.name}
            </button>
            <!-- Share and favorite buttons -->
        </div>
    `;
}
```

---

### 7. CSS: Extract Hardcoded RGBA Values - COMPLETED

**Files:** `layout.css`, `navigation.css`, `components.css`, `favorites.css`, `effects.css`

**Issue:** Hardcoded `rgba(0, 255, 0, ...)` values scattered across files instead of using CSS variables.

**Examples:**
- `layout.css:220-221` - Grid background: `rgba(0, 255, 0, 0.03)`
- `layout.css:404` - Box shadow: `rgba(0, 255, 0, 0.15)`
- `navigation.css:63` - Background: `rgba(0, 255, 0, 0.05)`
- `components.css:355` - Gradient: `rgba(0, 255, 0, 0.1)`
- `favorites.css:135, 171` - Background: `rgba(0, 255, 0, 0.1)`

**Solution:** Add to `variables.css`:

```css
--green-alpha-03: rgba(0, 255, 0, 0.03);
--green-alpha-05: rgba(0, 255, 0, 0.05);
--green-alpha-10: rgba(0, 255, 0, 0.1);
--green-alpha-15: rgba(0, 255, 0, 0.15);
```

---

### 8. PWA: Fix Manifest Icon Configuration - COMPLETED

**File:** `manifest.json`

**Issue:** 
- Icons have `"purpose": "any maskable"` (should be separate entries)
- Missing `scope`, `id`, `shortcuts`, and `screenshots`

**Solution:**

```json
{
    "scope": "./",
    "id": "/",
    "icons": [
        {
            "src": "assets/icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "any"
        },
        {
            "src": "assets/icons/icon-192.png",
            "sizes": "192x192",
            "type": "image/png",
            "purpose": "maskable"
        }
    ],
    "shortcuts": [
        {
            "name": "Random Sound",
            "short_name": "Random",
            "description": "Play a random sound",
            "url": "/?action=random",
            "icons": [{ "src": "assets/icons/icon-192.png", "sizes": "192x192" }]
        }
    ]
}
```

---

### 9. PWA: Add Offline Indicator - COMPLETED

**File:** `js/main.js` or new `js/offline.js`

**Issue:** No visual feedback when offline. Network errors are silent.

**Solution:**

```javascript
window.addEventListener('online', () => {
    showToast('CONNECTION RESTORED', 'success');
});

window.addEventListener('offline', () => {
    showToast('OPERATING OFFLINE MODE', 'info');
});
```

---

## Lower Priority - COMPLETED

### 10. JavaScript: Consolidate Screen Reader Announcer - COMPLETED

**Files:** `audio.js`, `favorites.js`, `navigation.js`, `search.js`

**Issue:** Multiple functions create similar aria-live announcer elements with duplicated logic.

**Solution:** Create a centralized announcer utility in `utils.js`:

```javascript
const announcers = new Map();

export function announceToScreenReader(message, id = 'default-announcer', live = 'polite') {
    let announcer = announcers.get(id);
    if (!announcer) {
        announcer = document.createElement('div');
        announcer.id = id;
        announcer.setAttribute('aria-live', live);
        announcer.setAttribute('aria-atomic', 'true');
        announcer.className = 'visually-hidden';
        document.body.appendChild(announcer);
        announcers.set(id, announcer);
    }
    announcer.textContent = message;
}
```

---

### 11. CSS: Create Reusable Button Base Class - COMPLETED

**Files:** `layout.css`, `components.css`, `favorites.css`, `install.css`, `toast.css`

**Issue:** Repeated button patterns with `min-width: 44px; min-height: 44px; display: flex; align-items: center; justify-content: center;` appear in 10+ places.

**Solution:** Create a base utility class in `components.css`:

```css
.btn-base {
    min-width: 44px;
    min-height: 44px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-family: var(--font-primary);
    cursor: pointer;
    transition: all 0.2s ease;
}
```

---

### 12. CSS: Standardize Transition Durations - COMPLETED

**Files:** Multiple CSS files

**Issue:** Mixed transition durations (`0.2s`, `0.3s`, `0.15s`) without clear pattern.

**Examples:**
- `components.css:340` - `transition: all 0.15s ease`
- `components.css:322` - `transition: max-height 0.3s ease`
- Most buttons use `0.2s ease`

**Solution:** Add timing variables to `variables.css`:

```css
--transition-fast: 0.15s ease;
--transition-base: 0.2s ease;
--transition-slow: 0.3s ease;
```

---

### 13. JavaScript: Use Modern JS Patterns - COMPLETED

**Files:** `ui.js`, `search.js`, `favorites.js`, `recently-played.js`, `navigation.js`

**Issue:** Missing optional chaining, nullish coalescing, and some verbose conditionals.

**Solution:**

```javascript
// Use optional chaining
const versionElement = document.querySelector('.footer-version');
versionElement?.setAttribute('textContent', `v${VERSION}`);

// Use nullish coalescing
const tags = soundData?.tags ?? [];

// Simplify array operations
const newFavorites = index === -1 
    ? [...state.favorites, soundFile]
    : state.favorites.filter(f => f !== soundFile);
```

---

## Test Improvements - COMPLETED

### 14. Tests: Eliminate Arbitrary setTimeout Delays - COMPLETED

**Files:** `audio.test.js`, `events.test.js`, `favorites.test.js`, `install.test.js`, `navigation.test.js`

**Issue:** Many tests use arbitrary delays that can cause flakiness:

```javascript
await new Promise(resolve => setTimeout(resolve, 50));
setTimeout(() => { /* assertions */ }, 100);
```

**Solution:** Use Jest's fake timers (`jest.useFakeTimers()`) or wait for actual conditions instead of fixed delays.

---

### 15. Tests: Improve Test Isolation - COMPLETED

**Files:** Various test files

**Issue:** Some tests leak state between runs:
- `resetElements()` sets elements to `null` but doesn't clear DOM
- Global mocks modified without cleanup
- Event listeners may persist between tests

**Solution:** Add consistent `afterEach` cleanup:

```javascript
afterEach(() => {
    document.body.innerHTML = '';
    jest.restoreAllMocks();
});
```

---

### 16. Tests: Standardize Mocking Patterns - COMPLETED

**Files:** Various test files

**Issue:** Inconsistent mocking approaches - some tests create local mocks, others rely on global setup.

**Solution:** Create helper functions for common mocking patterns:

```javascript
// helpers.js
export function createMockNavigator() { /* ... */ }
export function createMockServiceWorker() { /* ... */ }
export function cleanupMocks() { /* ... */ }
```

---

### 17. Tests: Replace done() Callbacks with async/await - COMPLETED

**Files:** `audio.test.js`, `favorites.test.js`, `navigation.test.js`

**Issue:** Mix of `done()` callbacks and async/await.

**Solution:**

```javascript
// Instead of:
test('should handle sound hash', (done) => {
    setTimeout(() => {
        expect(...).toBe(...);
        done();
    }, 600);
});

// Use:
test('should handle sound hash', async () => {
    jest.useFakeTimers();
    // ... test code
    jest.runAllTimers();
    expect(...).toBe(...);
});
```

---

## Quick Wins - ALL COMPLETED

| Item | File | Status |
|------|------|--------|
| Add CSS transition timing variables | `variables.css` | DONE |
| Add CSS green-alpha variables | `variables.css` | DONE |
| Add offline/online event listeners | `main.js` | DONE |
| Add `scope` and `id` to manifest | `manifest.json` | DONE |
| Use optional chaining where applicable | Various | DONE |

---

## Future Considerations

- **Virtual Scrolling:** Consider for large sound lists if the list grows significantly
- **State Management:** Consider a simple store with subscriptions if state updates become more complex
- **Cache Size Management:** Monitor cache size; 73+ sound files could be large
- **Proactive Sound Caching:** Consider caching all sounds during install instead of lazy-loading
