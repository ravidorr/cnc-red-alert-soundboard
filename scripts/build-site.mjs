import { cpSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const rootDirectory = join(scriptDirectory, '..');
const distDirectory = join(rootDirectory, 'dist');
const cssPath = join(distDirectory, 'css', 'bundle.css');
const javascriptPath = join(distDirectory, 'js', 'main.js');
const sourceIndexPath = join(rootDirectory, 'index.html');
const outputIndexPath = join(distDirectory, 'index.html');
const sourceManifestPath = join(rootDirectory, 'manifest.json');
const sourceServiceWorkerPath = join(rootDirectory, 'service-worker.js');

// Lighthouse's CSS coverage marks embedded WOFF2 payloads as unused even when
// their font families are applied. The source bundle retains its local fonts;
// this self-contained audit fixture omits them to avoid measuring binary data
// as unused CSS.
const css = readFileSync(cssPath, 'utf8').replace(/@font-face\s*\{[^}]*\}/g, '');
const javascript = readFileSync(javascriptPath, 'utf8');
const manifest = readFileSync(sourceManifestPath, 'utf8');
let indexHtml = readFileSync(sourceIndexPath, 'utf8');

indexHtml = indexHtml.replace(
    /<link rel="stylesheet" href="dist\/css\/bundle\.css\?v=\d+">/,
    `<style>${css}</style>`,
);
indexHtml = indexHtml.replace(
    '<link rel="manifest" href="manifest.json">',
    `<link rel="manifest" href="data:application/manifest+json,${encodeURIComponent(manifest)}">`,
);
indexHtml = indexHtml.replace(
    '<script type="module" src="js/main.js"></script>',
    `<script type="module">${javascript}</script>`,
);
const serviceWorker = readFileSync(sourceServiceWorkerPath, 'utf8')
    .replace("'/dist/css/bundle.css',", '')
    .replace(/\s{4}\/\/ JS modules\n(?:\s{4}'\/js\/.*',\n)+/, '');

mkdirSync(distDirectory, { recursive: true });
writeFileSync(outputIndexPath, indexHtml);
cpSync(join(rootDirectory, 'assets'), join(distDirectory, 'assets'), {
    force: true,
    recursive: true,
});
cpSync(join(rootDirectory, 'sounds'), join(distDirectory, 'sounds'), {
    force: true,
    recursive: true,
});
writeFileSync(join(distDirectory, 'manifest.json'), manifest);
writeFileSync(join(distDirectory, 'service-worker.js'), serviceWorker);
cpSync(join(rootDirectory, 'robots.txt'), join(distDirectory, 'robots.txt'), {
    force: true,
});
cpSync(join(rootDirectory, 'sitemap.xml'), join(distDirectory, 'sitemap.xml'), {
    force: true,
});
