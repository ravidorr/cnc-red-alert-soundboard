import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  validateSecurityPolicyFiles,
  validateSecurityPolicyVersion,
} from "./validate-security-policy-version.mjs";

const supportedStatus = String.fromCodePoint(0x2713);
const policyFor = (version) => `## Supported Versions

| Version | Supported |
| ------- | --------- |
| ${version} | ${supportedStatus} |
| Earlier releases | ✘ |
`;
const validatorScriptPath = fileURLToPath(
  new URL("./validate-security-policy-version.mjs", import.meta.url),
);

function withTemporaryPolicyFiles(callback) {
  const directory = mkdtempSync(join(tmpdir(), "security-policy-"));
  const packageJsonPath = join(directory, "package.json");
  const policyPath = join(directory, "SECURITY.md");

  try {
    callback({ packageJsonPath, policyPath });
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}

function runValidatorCli(packageJsonPath, policyPath) {
  return spawnSync(process.execPath, [validatorScriptPath, packageJsonPath, policyPath], {
    encoding: "utf8",
  });
}

test("accepts the exact package version", () => {
  assert.deepEqual(
    validateSecurityPolicyVersion('{"version":"1.2.3"}', policyFor("1.2.3")),
    { valid: true, version: "1.2.3" },
  );
});

test("accepts SemVer build metadata when the policy matches exactly", () => {
  const version = "1.2.3+build.4";
  assert.deepEqual(
    validateSecurityPolicyVersion(`{"version":"${version}"}`, policyFor(version)),
    { valid: true, version },
  );
});

test("rejects prerelease package versions", () => {
  assert.equal(
    validateSecurityPolicyVersion('{"version":"1.2.3-beta.1"}', policyFor("1.2.3")).valid,
    false,
  );
});

test("rejects malformed, missing, non-string, and unstable package versions", () => {
  for (const packageJson of [
    "not JSON",
    "{}",
    '{"version":123}',
    '{"version":"1.2"}',
    '{"version":"01.2.3"}',
    '{"version":"1.2.3-beta.1"}',
  ]) {
    assert.deepEqual(
      validateSecurityPolicyVersion(packageJson, policyFor("1.2.3")),
      { valid: false, error: "package.json must contain an exact stable SemVer version." },
    );
  }
});

test("uses only the table in the Supported Versions section", () => {
  const policy = `## Example

| Version | Supported |
| ------- | --------- |
| 1.2.2 | ${supportedStatus} |

${policyFor("1.2.3")}`;
  assert.deepEqual(
    validateSecurityPolicyVersion('{"version":"1.2.3"}', policy),
    { valid: true, version: "1.2.3" },
  );
});

test("rejects the package version when the policy marks it unsupported", () => {
  const policy = `## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.2.3 | ✘ |
`;
  assert.deepEqual(
    validateSecurityPolicyVersion('{"version":"1.2.3"}', policy),
    {
      valid: false,
      error: "SECURITY.md declares 1.2.3 as unsupported. Mark the package version as supported.",
    },
  );
});

test("rejects a policy that supports a different version", () => {
  assert.deepEqual(
    validateSecurityPolicyVersion('{"version":"1.2.3"}', policyFor("2.0.0")),
    {
      valid: false,
      error: "SECURITY.md supports 2.0.0, but package.json declares 1.2.3. Update SECURITY.md.",
    },
  );
});

test("rejects a policy with no supported version", () => {
  const policy = `## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.2.3 | ✘ |
`;
  assert.deepEqual(
    validateSecurityPolicyVersion('{"version":"2.0.0"}', policy),
    { valid: false, error: "SECURITY.md has no enabled supported-version row." },
  );
});

test("rejects a policy that supports multiple releases", () => {
  const policy = `## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.2.3 | ${supportedStatus} |
| 1.2.2 | ${supportedStatus} |
`;
  assert.deepEqual(
    validateSecurityPolicyVersion('{"version":"1.2.3"}', policy),
    {
      valid: false,
      error: "SECURITY.md must declare exactly one supported version, matching 1.2.3.",
    },
  );
});

test("rejects duplicate rows for the package version", () => {
  const policy = `## Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.2.3 | ${supportedStatus} |
| 1.2.3 | ✘ |
`;
  assert.deepEqual(
    validateSecurityPolicyVersion('{"version":"1.2.3"}', policy),
    {
      valid: false,
      error: "SECURITY.md must declare exactly one supported version, matching 1.2.3.",
    },
  );
});

test("rejects a malformed supported-versions table", () => {
  const policy = `## Supported Versions

| Version | Supported |
This is not a table delimiter.
| 1.2.3 | ${supportedStatus} |`;
  assert.equal(
    validateSecurityPolicyVersion('{"version":"1.2.3"}', policy).error,
    "SECURITY.md is missing a supported-versions table.",
  );
});

test("reads package and policy files", () => {
  withTemporaryPolicyFiles(({ packageJsonPath, policyPath }) => {
    writeFileSync(packageJsonPath, '{"version":"1.2.3"}');
    writeFileSync(policyPath, policyFor("1.2.3"));

    assert.deepEqual(
      validateSecurityPolicyFiles(packageJsonPath, policyPath),
      { valid: true, version: "1.2.3" },
    );
  });
});

test("returns a safe failure when a policy file cannot be read", () => {
  withTemporaryPolicyFiles(({ packageJsonPath, policyPath }) => {
    writeFileSync(packageJsonPath, '{"version":"1.2.3"}');

    const result = validateSecurityPolicyFiles(packageJsonPath, policyPath);

    assert.equal(result.valid, false);
    assert.match(result.error, /^Unable to read security policy files:/);
  });
});

test("CLI reports success for matching policy files", () => {
  withTemporaryPolicyFiles(({ packageJsonPath, policyPath }) => {
    writeFileSync(packageJsonPath, '{"version":"1.2.3"}');
    writeFileSync(policyPath, policyFor("1.2.3"));

    const result = runValidatorCli(packageJsonPath, policyPath);

    assert.equal(result.status, 0);
    assert.equal(result.stdout, "SECURITY.md supports package version 1.2.3.\n");
    assert.equal(result.stderr, "");
  });
});

test("CLI reports a failing validation with a nonzero exit status", () => {
  withTemporaryPolicyFiles(({ packageJsonPath, policyPath }) => {
    writeFileSync(packageJsonPath, '{"version":"1.2.3"}');
    writeFileSync(policyPath, policyFor("2.0.0"));

    const result = runValidatorCli(packageJsonPath, policyPath);

    assert.equal(result.status, 1);
    assert.equal(result.stdout, "");
    assert.equal(
      result.stderr,
      "SECURITY.md supports 2.0.0, but package.json declares 1.2.3. Update SECURITY.md.\n",
    );
  });
});
