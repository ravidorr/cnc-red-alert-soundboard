import { existsSync, readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from '@jest/globals';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const rootDirectory = join(testDirectory, '..');
const distDirectory = join(rootDirectory, 'dist');

describe('build-site script', () => {
  it('creates a self-contained Lighthouse entry page', () => {
    const localThis = {
      indexPath: join(distDirectory, 'index.html'),
    };

    execFileSync('npm', ['run', 'build'], {
      cwd: rootDirectory,
      stdio: 'pipe',
    });

    const generatedIndex = readFileSync(localThis.indexPath, 'utf8');

    expect(generatedIndex).toContain('<style>');
    expect(generatedIndex).toContain('<script type="module">');
    expect(generatedIndex).toContain('data:application/manifest+json,');
    expect(generatedIndex).not.toContain('href="dist/css/bundle.css');
    expect(generatedIndex).not.toContain('src="dist/js/main.js"');
    expect(existsSync(join(distDirectory, 'assets', 'icons', 'icon.svg'))).toBe(
      true,
    );
    expect(existsSync(join(distDirectory, 'sounds', 'alarm.wav'))).toBe(true);
    expect(existsSync(join(distDirectory, 'manifest.json'))).toBe(true);
    expect(existsSync(join(distDirectory, 'service-worker.js'))).toBe(true);
  });
});
