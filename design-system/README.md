# Design System

Single source of truth for UI consistency. Code is canonical; Claude Design is
an optional mirror.

## Structure

- `tokens.css` - color, spacing, type, radius, and shadow tokens for light and
  dark themes
- `components/` - reusable component stories
- `index.html` - static showcase of tokens and components

## Rules

- No hard-coded colors, spacing, or font sizes outside token definitions.
- New component: add it under `components/` with a Storybook story and use
  tokens only.
- Components must meet WCAG 2.1 AA contrast in light and dark themes.
- Changing a token is a visible change: update `CHANGELOG.md`.

## Storybook

```bash
npm run storybook
npm run build-storybook
```
