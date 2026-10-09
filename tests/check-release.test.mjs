import { describe, expect, it } from '@jest/globals';

import {
  assertTagMatchesPackageVersion,
  extractChangelogNotes,
  requiresRelease,
  runReleaseGate,
  validateRelease,
  validateTaggedRelease,
} from '../scripts/check-release.mjs';

describe('validateRelease', () => {
  it('accepts a bumped semantic version with a changelog section', () => {
    const localThis = {
      changelog: '## [0.1.1] - 2026-10-10\n\n- Harden checks.\n',
    };

    expect(() =>
      validateRelease('0.1.0', '0.1.1', localThis.changelog),
    ).not.toThrow();
  });

  it('rejects an unchanged version', () => {
    const localThis = {
      changelog: '## [0.1.0] - 2026-10-10\n\n- Initial release.\n',
    };

    expect(() =>
      validateRelease('0.1.0', '0.1.0', localThis.changelog),
    ).toThrow('package version must change');
  });

  it('rejects a decreased version', () => {
    const localThis = {
      changelog: '## [0.1.0] - 2026-10-10\n\n- Rollback attempt.\n',
    };

    expect(() =>
      validateRelease('0.2.0', '0.1.0', localThis.changelog),
    ).toThrow('package version must increase');
  });

  it('rejects a missing changelog section', () => {
    const localThis = {
      changelog: '## [0.1.0] - 2026-10-10\n\n- Initial release.\n',
    };

    expect(() =>
      validateRelease('0.1.0', '0.1.1', localThis.changelog),
    ).toThrow('CHANGELOG.md must contain a section for 0.1.1');
  });
});

describe('extractChangelogNotes', () => {
  it('returns notes from the requested section only', () => {
    const localThis = {
      changelog:
        '## [0.1.2] - 2026-10-10\n\n- Current release.\n\n## [0.1.1] - 2026-10-09\n\n- Previous release.\n',
      notes: undefined,
    };

    localThis.notes = extractChangelogNotes(localThis.changelog, '0.1.2');

    expect(localThis.notes).toBe('\n- Current release.\n');
  });
});

describe('requiresRelease', () => {
  it.each([
    ['documentation only', ['README.md'], false],
    ['test only', ['tests/main.test.js'], false],
    ['package metadata', ['package.json'], true],
    ['application JavaScript', ['js/audio.js'], true],
    ['application CSS', ['css/components.css'], true],
    ['application entry HTML', ['index.html'], true],
    ['service worker', ['service-worker.js'], true],
  ])('returns %s for %s', (label, changedFiles, expected) => {
    const localThis = {
      changedFiles,
      result: undefined,
    };

    localThis.result = requiresRelease(localThis.changedFiles);

    expect(localThis.result).toBe(expected);
  });
});

describe('tagged releases', () => {
  it('accepts matching tags and non-empty notes', () => {
    const localThis = {
      input: {
        tagName: 'v0.1.1',
        packageVersion: '0.1.1',
        changelog: '## [0.1.1] - 2026-10-10\n\n- Harden checks.\n',
        releaseNotes: '- Harden checks.\n',
      },
    };

    expect(() => validateTaggedRelease(localThis.input)).not.toThrow();
  });

  it('rejects a mismatched tag', () => {
    expect(() =>
      assertTagMatchesPackageVersion('v0.1.2', '0.1.1'),
    ).toThrow('tag 0.1.2 does not match package.json version 0.1.1');
  });
});

describe('runReleaseGate', () => {
  it('requires a base reference', () => {
    expect(() => runReleaseGate({ baseRef: '' })).toThrow(
      'BASE_REF is required',
    );
  });

  it('skips the first push of a branch', () => {
    const localThis = {
      diffCalls: 0,
    };

    expect(() =>
      runReleaseGate({
        baseRef: '0000000000000000000000000000000000000000',
        readDiffFiles: () => {
          localThis.diffCalls += 1;
          return ['package.json'];
        },
      }),
    ).not.toThrow();
    expect(localThis.diffCalls).toBe(0);
  });

  it('checks release metadata when application code changes', () => {
    const localThis = {
      currentPackage: { version: '0.1.1' },
      changelog: '## [0.1.1] - 2026-10-10\n\n- Harden checks.\n',
    };

    expect(() =>
      runReleaseGate({
        baseRef: 'origin/main',
        readDiffFiles: () => ['js/audio.js'],
        readBasePackageVersion: () => '0.1.0',
        readCurrentPackageJson: () => localThis.currentPackage,
        readChangelog: () => localThis.changelog,
      }),
    ).not.toThrow();
  });
});
