import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { describe, expect, it } from '@jest/globals';

const testDirectory = dirname(fileURLToPath(import.meta.url));
const scriptPath = join(testDirectory, '..', 'scripts', 'check-release.mjs');

function withTempDir(run) {
  const root = mkdtempSync(join(tmpdir(), 'check-release-cli-'));

  try {
    return run(root);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
}

function writeReleaseFixture(root, { version, changelog, releaseNotes }) {
  writeFileSync(
    join(root, 'package.json'),
    `${JSON.stringify({ version }, null, 2)}\n`,
  );
  writeFileSync(join(root, 'CHANGELOG.md'), changelog);
  writeFileSync(join(root, 'release-notes.md'), releaseNotes);
}

function runCheckReleaseCli(root, cliArgs) {
  try {
    execFileSync(process.execPath, [scriptPath, ...cliArgs], {
      cwd: root,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    return { ok: true, stderr: '' };
  } catch (error) {
    const stderr =
      typeof error.stderr === 'string'
        ? error.stderr
        : (error.stderr?.toString() ?? String(error.message));

    return { ok: false, stderr };
  }
}

describe('check-release CLI', () => {
  it('extracts notes for a matching release section', () => {
    const localThis = {
      result: undefined,
      notes: undefined,
    };

    withTempDir((root) => {
      writeReleaseFixture(root, {
        version: '0.1.1',
        changelog:
          '## [0.1.1] - 2026-10-10\n\n- Harden checks.\n\n## [0.1.0] - 2026-10-09\n\n- Initial release.\n',
        releaseNotes: '',
      });

      localThis.result = runCheckReleaseCli(root, [
        '--extract-release-notes',
        '0.1.1',
      ]);
      localThis.notes = readFileSync(join(root, 'release-notes.md'), 'utf8');
    });

    expect(localThis.result.ok).toBe(true);
    expect(localThis.notes).toBe('\n- Harden checks.\n');
  });

  it('rejects a tag that does not match package.json', () => {
    const localThis = {
      result: undefined,
    };

    localThis.result = withTempDir((root) => {
      writeReleaseFixture(root, {
        version: '0.1.1',
        changelog: '## [0.1.1] - 2026-10-10\n\n- Harden checks.\n',
        releaseNotes: '- Harden checks.\n',
      });

      return runCheckReleaseCli(root, ['--tag', 'v0.1.2']);
    });

    expect(localThis.result.ok).toBe(false);
    expect(localThis.result.stderr).toContain(
      'tag 0.1.2 does not match package.json version 0.1.1',
    );
  });
});
