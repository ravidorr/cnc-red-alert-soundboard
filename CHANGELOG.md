# Changelog

All notable changes to the C&C Red Alert Soundboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
