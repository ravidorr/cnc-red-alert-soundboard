# Privacy

Last updated: 2026-10-12

## Data the application stores

The soundboard does not require an account, advertising, or a server-side
application database. It stores favorites, recently played sounds, interface
preferences, and onboarding state in the browser's local storage on the device
where the application is used.

At page load, the application creates an in-memory Novus by Pendo command
queue and queues an anonymous analytics initialization request. The Pendo
network agent loads only after a pointer, keyboard, or touch interaction, and
does not load when the browser's Do Not Track preference is set to `1`.

After the agent loads, Pendo assigns an anonymous visitor identifier and
collects application usage, such as page and feature interactions, together
with technical browser and device information for product analytics. The
soundboard sends no custom account data to Pendo.

## Third parties and hosting

The public site is hosted through GitHub Pages. GitHub may process technical
information such as an IP address and request metadata under its own privacy
policy. Novus by Pendo processes the analytics data described above under its
own privacy policy. Display fonts are served from this site's own assets.

## Your choices

Clearing this site's browser storage removes the locally stored preferences and
history. After the PWA is installed, its cached assets can be removed through
the browser or operating system's site-storage controls. Enable your browser's
Do Not Track preference before using the soundboard to prevent the Pendo agent
from loading.

## Contact

Questions and feature requests can be opened as GitHub issues. For security
matters, see [SECURITY.md](./SECURITY.md).
