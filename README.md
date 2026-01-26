# C&C Red Alert Soundboard

A Progressive Web App (PWA) soundboard featuring 190 classic Command & Conquer Red Alert sound effects with an authentic Red Alert 1 themed UI.

![C&C Red Alert Soundboard](assets/icons/icon-192.png)

## Live Demo

**[https://ravidorr.github.io/cnc-red-alert-soundboard/](https://ravidorr.github.io/cnc-red-alert-soundboard/)**

## Features

- **190 Sound Effects** - Unit voices, combat sounds, building effects, and more
- **Red Alert 1 Theme** - Green terminal aesthetic with military HUD styling
- **12 Categories** - Allied Forces, Soviet Forces, Tanya, Special Units, Civilians, Combat, Vehicles, Buildings & Defenses, Attack Dogs, Casualties, UI & Map, Miscellaneous
- **Favorites System** - Mark sounds as favorites for quick access
- **Drag & Drop Reordering** - Organize your favorites in any order
- **Search** - Find sounds quickly by name
- **PWA Support** - Install as an app, works offline
- **Install Button** - One-click installation from the header
- **Responsive Design** - Works on desktop and mobile

## Local Development

Open `index.html` in a browser or serve with any HTTP server:

```bash
# Using Python
python3 -m http.server 8080

# Using Node.js
npx serve

# Using PHP
php -S localhost:8080
```

Then visit `http://localhost:8080`

## Installation as PWA

1. Open the soundboard in Chrome, Edge, or Safari
2. Click the install prompt that appears, or:
   - **Chrome/Edge**: Click the install icon in the address bar
   - **Safari**: File > Add to Dock
   - **Mobile**: Add to Home Screen from the share menu

## Project Structure

```
cnc-red-alert-soundboard/
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest
├── service-worker.js   # Offline caching
├── css/
│   └── styles.css      # Red Alert 1 themed styles
├── js/
│   └── app.js          # Application logic
├── tests/
│   ├── app.test.js     # Unit tests (139 tests)
│   └── setup.js        # Jest setup
├── assets/
│   └── icons/          # PWA icons (72-512px)
└── sounds/             # 190 WAV sound files
```

## Development

### Prerequisites

- Node.js 22+ (see `.nvmrc`)

### Setup

```bash
npm install
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm test` | Run tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run all linters |
| `npm run lint:js` | Run ESLint |
| `npm run lint:css` | Run Stylelint |
| `npm run lint:html` | Run HTMLHint |
| `npm run lint:fix` | Auto-fix linting issues |

### Code Quality

- **ESLint** - JavaScript linting
- **Stylelint** - CSS linting
- **HTMLHint** - HTML validation
- **Jest** - Unit testing with jsdom
- **Husky** - Pre-commit hooks

### Pre-commit Hooks

The following checks run automatically before each commit:

1. JavaScript linting (no errors/warnings)
2. CSS linting (no errors/warnings)
3. HTML linting (no errors)
4. Test coverage (90% minimum)

### Test Coverage

Current coverage: **97%+** (139 tests)

## Sound Categories

| Category | Count | Description |
|----------|-------|-------------|
| Allied Forces | 31 | Allied unit voice responses |
| Soviet Forces | 26 | Soviet unit voice responses |
| Tanya | 15 | Tanya's iconic voice lines |
| Special Units | 20 | Engineer, Medic, Spy, Thief, Einstein |
| Civilians | 4 | Civilian voice lines |
| Combat | 18 | Weapons and explosions |
| Vehicles | 7 | Tanks, ships, aircraft |
| Buildings & Defenses | 17 | Construction and turrets |
| Attack Dogs | 6 | Dog sounds |
| Casualties | 10 | Death sounds |
| UI & Map | 16 | Interface and map sounds |
| Miscellaneous | 14 | Tesla, chronosphere, effects |

## Keyboard Shortcuts

- `Ctrl/Cmd + F` - Focus search
- `Escape` - Stop all sounds

## Browser Support

- Chrome/Chromium (recommended)
- Firefox
- Safari
- Edge

## Credits

Sound effects are from Command & Conquer: Red Alert by Westwood Studios (1996).

This is a fan project for personal/educational use only. Command & Conquer and Red Alert are trademarks of Electronic Arts Inc.

## License

MIT License - See [LICENSE](LICENSE) file for details.

The sound files are property of Electronic Arts Inc. and are included for personal/educational use only.
