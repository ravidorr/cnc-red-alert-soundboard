# Changelog

All notable changes to the C&C Red Alert Soundboard are documented here. The
format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and
this project uses [Semantic Versioning](https://semver.org/).

## [3.2.30] - 2026-11-28

### Changed

- Updated dev dependencies from the minor-and-patch Dependabot group (#62):
  @storybook/html-vite 10.6.8, lint-staged 17.6.2, markdownlint-cli2 0.24.2,
  storybook 10.6.8, stylelint 18.1.0, stylelint-config-standard 41.1.0 and
  typescript-eslint 8.74.0. This release only records the version bump the
  release gate requires for that merge.

## [3.2.29] - 2026-11-24

### Fixed

- Read the viewport width in `init()` before any DOM rendering instead of
  after it. The late `window.innerWidth` read forced a synchronous reflow that
  failed the CI Lighthouse `forced-reflow-insight` audit (#59).

## [3.2.28] - 2026-11-24

### Changed

- Updated dev dependencies from the minor-and-patch Dependabot group (#57):
  eslint 10.15.0, html-validate 11.21.1, lint-staged 17.6.1, markdownlint-cli2
  0.24.1, typescript-eslint 8.73.0 and vite 8.3.8. This release only records
  the version bump the release gate requires for that merge.

## [3.2.27] - 2026-11-19

### Changed

- Added search tags to every sound in `js/constants.js`. Previously only 35 of
  190 sounds had tags, so descriptive searches such as "nuke", "scream",
  "bark", "money" or "rocket" found nothing. Existing tags are unchanged,
  except that both explosions gain "boom", "blast", "bomb" and "nuke", the
  water explosion gains "boom", "splash" and "depth charge", and Tanya's death
  gains "scream".

## [3.2.26] - 2026-11-19

### Fixed

- Search now matches the category names shown in the navigation, such as
  "Allied", "Casualties" or "Defenses", so searching for a visible category
  label returns that category's sounds instead of the empty state.

## [3.2.25] - 2026-11-19

### Fixed

- When sharing a sound fails and the link can't be copied, the error toast now
  says the link could not be copied and offers a RETRY button. The toast stays
  open until the visitor retries or dismisses it.

## [3.2.24] - 2026-11-19

### Changed

- The "explosion" and "Tanya" suggestions in the search no-results state are
  now buttons. Selecting one runs that search and moves focus to the search
  field, so visitors reach playable sounds in one step.

## [3.2.23] - 2026-11-19

### Added

- The "Target marked" toast shown after starring a sound now has a
  `VIEW IN FAVORITES` button. It expands the Favorites section if it is
  collapsed, scrolls the saved sound into view, highlights it briefly, and
  moves focus to its play button.

## [3.2.22] - 2026-11-19

### Fixed

- A freshly starred sound no longer turns red (the remove hover style) while
  the pointer is still on the star. The star keeps its saved style until the
  pointer leaves, and the red remove style only shows on devices that support
  hover, so a tap on a touch screen no longer leaves it stuck red.

## [3.2.21] - 2026-11-19

### Changed

- The toast shown after starring a sound now names the Favorites section
  (`Target marked: <sound> added to FAVORITES`), so visitors know the save
  worked and where to find the sound.

## [3.2.20] - 2026-11-19

### Fixed

- Choosing a category in the navigation while a search shows no results now
  clears the search, so the category's sounds appear and the page scrolls to
  them. Before, the search term and the empty screen stayed, so nothing visible
  changed.

## [3.2.19] - 2026-11-19

### Fixed

- Search typo forgiveness now ignores punctuation and compares each typed word
  with the words in a sound name, so near-miss phrases such as "yes sri" or
  "lets rock" find "Yes Sir" and "Let's Rock" instead of showing no results.

## [3.2.18] - 2026-11-19

### Fixed

- The Share button now shows a busy state while the sound file downloads and
  the share sheet is open, and it ignores repeat taps until the attempt ends.
  Before, the button gave no feedback during the download and accepted extra
  taps.

## [3.2.17] - 2026-11-19

### Fixed

- Closing the device share sheet no longer ends a share silently. The app now
  shows a `SHARE CANCELLED` status and records a `sound_share_cancelled` event
  with the sound and source section.

## [3.2.16] - 2026-11-19

### Changed

- The empty Favorites and Recently Played placeholders now read as static
  information instead of a control. They show a dashed outline, a default
  cursor, a smaller and more muted icon, and a smaller title, so they no
  longer look like the clickable sound tiles around them.

## [3.2.15] - 2026-11-19

### Fixed

- The first-visit mission briefing no longer closes itself while someone is
  reading it. Its 30-second auto-dismiss is paused while the pointer or focus
  is inside the briefing, and starts over once both leave.

## [3.2.14] - 2026-11-16

### Fixed

- The install prompt no longer opens on top of the mission briefing on
  browsers that offer app install. It now waits until the briefing closes, so
  first-time visitors don't have to handle 2 prompts at once and the briefing
  keeps keyboard focus.

## [3.2.13] - 2026-11-14

### Changed

- Bumped development dependencies: `@storybook/html-vite` and `storybook` to
  10.6.7, `html-validate` to 11.21.0, `typescript-eslint` to 8.72.2 and `vite`
  to 8.3.7.

## [3.2.12] - 2026-11-08

### Changed

- Bumped `stylelint` to 18.0.0 and `stylelint-config-standard` to 41.0.0
  together, since each requires the other as a peer dependency. Removed the
  `declaration-block-single-line-max-declarations` entry from
  `.stylelintrc.json`, as stylelint 18 no longer ships that rule.

## [3.2.11] - 2026-11-01

### Fixed

- The `minimatch` 11 override from 3.2.10 made `glob` 10 (pulled in by
  `test-exclude` 7 through `babel-plugin-istanbul`) silently match no files.
  Added a `test-exclude` override to 8.0.0, which uses `glob` 13 (works with
  minimatch 11), so only one `glob` copy remains. `npm ci`, build, lint,
  typecheck and the full test suite pass with 100% coverage on Node 24.21.0.

## [3.2.10] - 2026-11-01

### Security

- Forced the transitive development dependency `minimatch` to 11.0.3 through an
  npm override to fix a medium severity vulnerability (Dependabot alert 48).
  No current parent allows the 11.x line (`@eslint/config-array`,
  `@typescript-eslint/typescript-estree`, `glob` 10 and 13, `test-exclude`),
  so the override is required. It also adds the transitive development
  dependency `@isaacs/nonrecursive-glob-match` required by minimatch 11.
  `npm ci`, build, lint, typecheck and the full test suite pass with 100%
  coverage on Node 24.21.0, including `test-exclude` coverage instrumentation
  running on `glob` 10 with minimatch 11.

## [3.2.9] - 2026-11-01

### Security

- Pinned the transitive development dependency `re2js` to 2.9.1 through an npm
  override to fix a high severity vulnerability (Dependabot alert 46). The
  `minimatch` alert (48) remains open because its only patched line, 11.x, is
  outside the version ranges required by `eslint`, `jest` and `glob`.

## [3.2.8] - 2026-10-31

### Changed

- Updated development dependencies: `@storybook/html-vite` and `storybook` to
  10.6.5, `typescript-eslint` to 8.72.1 and `vite` to 8.3.5.

## [3.2.7] - 2026-10-28

### Changed

- Updated development dependencies: `markdown-it` to 15.0.3 and
  `markdownlint-cli2` to 0.24.0.

## [3.2.6] - 2026-10-28

### Changed

- Updated development dependencies: `@storybook/html-vite` and `storybook` to
  10.6.3, `eslint` to 10.13.0, `html-validate` to 11.17.0, `ts-jest` to
  29.4.15 and `typescript-eslint` to 8.72.0.

## [3.2.5] - 2026-10-14

### Added

- Visitor metadata `favorites_count` (integer) set in `pendo.initialize` from
  localStorage and updated via `pendo.updateOptions` whenever favorites change.
- Visitor metadata `uses_keyboard_shortcuts` (boolean) initialized to `false`
  and flipped to `true` via `pendo.updateOptions` on the first keyboard
  shortcut use.
- Track event `pwa_standalone_launched` fires once per session when the app
  loads in standalone display mode, capturing Safari/iOS "Add to Home Screen"
  and macOS "Add to Dock" installs that the Chromium-only `pwa_installed`
  event cannot detect.

## [3.2.4] - 2026-10-14

### Fixed

- Suppress the browser-native search-cancel button (`::-webkit-search-cancel-button`)
  on the search input so only the styled custom × button appears.

## [3.2.3] - 2026-10-12

### Changed

- Pinned the development-only `katex` dependency to the patched 0.19.0
  release.

## [3.2.2] - 2026-10-12

### Changed

- Pinned the development-only `smol-toml` dependency to the patched 1.9.1
  release.

## [3.2.1] - 2026-10-12

### Added

- Pendo Track Events for sound playback (including how it was triggered),
  playback failures, plays blocked by mute, volume changes, searches, favorites
  (add, remove, reorder, clear), sharing, shared-link visits, PWA installs and
  app-shortcut launches, reconnecting after offline use, keyboard shortcuts, and
  onboarding dismissal. Events are sent only when the Pendo agent is loaded.

### Fixed

- Space on a focused sound button, category header, or the favorites CLEAR
  button no longer also triggers the global Space replay shortcut. On a
  Favorites sound, that replay stopped the sound it had just started.
- Refreshed the service-worker app-shell cache for the analytics module.

## [3.2.0] - 2026-10-12

### Added

- Novus by Pendo product analytics: `index.html` loads the Pendo agent, and
  the app initializes it once per page load for an anonymous visitor before
  the soundboard renders.

## [3.1.3] - 2026-10-12

### Changed

- Updated the `htmlhint` development dependency from 1.8.0 to 1.9.2.

## [3.1.2] - 2026-10-10

### Changed

- Added the GitHub project baseline: strict linters, automated quality checks,
  a release gate, 100% coverage enforcement, and contributor documentation.

## [2.0.1] - 2026-01-27

### Fixed
- **Contact Modal Escape Key**: Fixed Escape key in contact modal incorrectly stopping all sounds due to event propagation
- **Section Icons Removed**: Removed decorative icons from Favorites, Recently Played, and Popular section headers for cleaner UI

### Improved
- **Test Coverage**: Increased branch coverage from 93% to 95.04% with 22 new edge case tests
- **Focus Trap Tests**: Improved test accuracy by properly mocking `document.activeElement`

## [2.0.0] - 2026-01-27

### Added
- **Themed Confirmation Modal**: Destructive actions (like clearing favorites) now use an accessible, C&C-themed modal instead of browser's `window.confirm()`
- **Replay Onboarding**: "Show Tips" button in keyboard shortcuts modal allows users to replay the onboarding tooltip
- **Viewport-aware Sidebar**: Sidebar accessibility (`aria-hidden`) now properly managed based on viewport size
- **New Tests**: Added 35+ new tests for confirm modal, mobile functions, and updated onboarding

### Changed
- **Category Headers**: Converted from `div[role="button"]` to semantic `<button>` elements with proper `aria-expanded` and `aria-controls` attributes
- **Onboarding Timeout**: Extended auto-dismiss from 10 seconds to 30 seconds for better readability
- **Help Button Size**: Increased from 24x24px to 44x44px to meet WCAG 2.5.5 touch target requirements
- **Volume Slider**: Increased clickable area from 4px to 24px height for better accessibility
- **Category Chips Mobile**: Increased padding and minimum height to 44px on small screens (480px)

### Fixed
- **Sidebar ARIA**: Removed static `aria-hidden="true"` that hid sidebar from screen readers on desktop
- **Footer Animation**: Added proper `prefers-reduced-motion` handling
- **Category Section Animation**: Disabled animation when reduced motion is preferred

### Improved
- **Microcopy Updates**:
  - "AUDIO OFFLINE" changed to "COMMS SILENCED" (more accurate when muted)
  - "TRANSMISSION FAILED" changed to "SIGNAL LOST" (clearer error message)
  - "VISIBLE" stat label changed to "DEPLOYED" (less ambiguous)
- **Color Contrast**: Verified all text meets WCAG AA (11:1+ on primary backgrounds)
- **Documentation**: Updated README with current accessibility features and test counts

## [1.9.0] - 2026-01-26

### Added
- Drag-and-drop reordering for favorites
- Keyboard reordering for favorites (Arrow Up/Down)
- Soviet Forces sound name corrections

### Fixed
- Favorites section rendering order
- Category scroll offset for fixed header
- Audio playback URL encoding for special characters

## [1.8.0] - 2026-01-25

### Added
- Favorites section with add/remove functionality
- Recently played section (last 10 sounds)
- Popular sounds section
- PWA install prompt with themed modal
- First-time user onboarding tooltip

## [1.7.0] - 2026-01-24

### Added
- Mobile responsive design
- Mobile category chips for quick navigation
- Hamburger menu with slide-out sidebar
- Touch-optimized button sizes

## [1.6.0] - 2026-01-23

### Added
- Share functionality with Web Share API
- URL hash support for direct sound links
- Toast notifications system
- Now playing indicator

## [1.5.0] - 2026-01-22

### Added
- Search functionality with fuzzy matching
- Empty state for search results
- Random sound button
- Category collapse/expand with persistence

## [1.4.0] - 2026-01-21

### Added
- Volume control with mute toggle
- Volume persistence in localStorage
- Keyboard shortcuts (Escape, Ctrl+F, ?, Space)
- Shortcuts help modal

## [1.3.0] - 2026-01-20

### Added
- Skip link for accessibility
- ARIA live regions for screen reader announcements
- Focus visible indicators
- High contrast mode support

## [1.2.0] - 2026-01-19

### Added
- Service worker for offline support
- PWA manifest with icons
- Automatic sound caching

## [1.1.0] - 2026-01-18

### Added
- 12 sound categories
- Category navigation sidebar
- Sound count statistics

## [1.0.0] - 2026-01-17

### Added
- Initial release
- 190 C&C Red Alert sound effects
- Red Alert 1 themed UI
- Basic sound playback
