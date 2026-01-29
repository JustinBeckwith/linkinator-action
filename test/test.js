import assert from 'node:assert';
import { afterEach, beforeEach, describe, it, vi } from 'vitest';
import nock from 'nock';

// Mock @actions/core before importing anything else
vi.mock('@actions/core', () => ({
  getInput: vi.fn(),
  setOutput: vi.fn(),
  setFailed: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  summary: {
    addHeading: vi.fn(),
    addRaw: vi.fn(),
    addList: vi.fn(),
    addTable: vi.fn(),
    write: vi.fn().mockResolvedValue(undefined),
  },
}));

import * as core from '@actions/core';
import { getFullConfig, main, generateJobSummary } from '../src/action.js';

nock.disableNetConnect();
nock.enableNetConnect('localhost');

// Helper to create a mock getInput function that can return different values based on input name
function createGetInputMock(values = {}) {
  return vi.spyOn(core, 'getInput').mockImplementation((name) => {
    return values[name] || '';
  });
}

// Helper to setup core.summary to chain properly
function stubSummary() {
  // Make summary methods chain
  core.summary.addHeading.mockReturnValue(core.summary);
  core.summary.addRaw.mockReturnValue(core.summary);
  core.summary.addList.mockReturnValue(core.summary);
  core.summary.addTable.mockReturnValue(core.summary);
  return core.summary;
}

describe('linkinator action', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    nock.cleanAll();
  });

  it('should return ok for a valid README', async () => {
    stubSummary();
    const inputStub = createGetInputMock({ paths: 'test/fixtures/test.md' });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});
    const scope = nock('http://fake.local')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(200);
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(setOutputStub.mock.calls.length > 0);
    assert.strictEqual(setFailedStub.mock.calls.length, 0);
    assert.ok(infoStub.mock.calls.length > 0);
    scope.done();
  });

  it('should call setFailed on failures', async () => {
    stubSummary();
    const inputStub = createGetInputMock({ paths: 'test/fixtures/test.md' });
    vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const errorStub = vi.spyOn(core, 'error').mockImplementation(() => {});
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    const scope = nock('http://fake.local')
      .head('/')
      .reply(404)
      .head('/fake')
      .reply(404);
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(setFailedStub.mock.calls.length > 0);
    assert.ok(infoStub.mock.calls.length > 0);
    assert.ok(errorStub.mock.calls.length > 0);
    scope.done();
  });

  it('should surface exceptions from linkinator with call stack', async () => {
    stubSummary();
    const inputStub = vi.spyOn(core, 'getInput').mockImplementation(() => {
      throw new Error('😱');
    });
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(setFailedStub.mock.calls.length > 0);
    assert.ok(setFailedStub.mock.calls[0][0].includes('test.js:'));
  });

  it('should handle linksToSkip', async () => {
    stubSummary();
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      linksToSkip: 'http://fake.local,http://fake.local/fake',
    });
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    vi.spyOn(core, 'setFailed').mockImplementation((output) => {
      throw new Error(output);
    });
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(infoStub.mock.calls.length > 0);
    assert.ok(setOutputStub.mock.calls.length > 0);
  });

  it('should handle skips and spaces', async () => {
    stubSummary();
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      skip: 'http://fake.local http://fake.local/fake',
    });
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    vi.spyOn(core, 'setFailed').mockImplementation((output) => {
      throw new Error(output);
    });
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(infoStub.mock.calls.length > 0);
    assert.ok(setOutputStub.mock.calls.length > 0);
  });

  it('should handle multiple paths', async () => {
    stubSummary();
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md, test/fixtures/test2.md',
    });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'setFailed').mockImplementation((output) => {
      throw new Error(output);
    });
    const scope = nock('http://fake.local')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(200);
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(infoStub.mock.calls.length > 0);
    assert.ok(setOutputStub.mock.calls.length > 0);
    scope.done();
  });

  it('should respect verbosity set to ERROR', async () => {
    stubSummary();
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      verbosity: 'ERROR',
    });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});
    const errorStub = vi.spyOn(core, 'error').mockImplementation(() => {});
    const scope = nock('http://fake.local')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(500);
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.strictEqual(setOutputStub.mock.calls.length, 1);
    assert.strictEqual(setFailedStub.mock.calls.length, 1);

    // ensure `Scanning ...` is always shown
    assert.strictEqual(
      infoStub.mock.calls.filter((call) => {
        return call[0].startsWith('Scanning ');
      }).length,
      1,
    );

    // Ensure total count is always shown
    assert.strictEqual(
      setFailedStub.mock.calls.filter((call) => {
        return (
          call[0] ===
          'Detected 1 broken links.\n test/fixtures/test.md\n   [500] http://fake.local/fake - HTTP 500'
        );
      }).length,
      1,
    );

    // Ensure `core.error` is called for each failure
    assert.strictEqual(errorStub.mock.calls.length, 1);
    const expected = '[500] http://fake.local/fake - HTTP 500';
    assert.strictEqual(errorStub.mock.calls[0][0], expected);

    scope.done();
  });

  it('should show skipped links when verbosity is INFO', async () => {
    stubSummary();
    // Unset GITHUB_EVENT_PATH, so that no replacement is attempted.
    vi.stubEnv('GITHUB_EVENT_PATH', undefined);
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      skip: 'http://fake.local/fake',
      verbosity: 'INFO',
    });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});
    const errorStub = vi.spyOn(core, 'error').mockImplementation(() => {});
    const scope = nock('http://fake.local').head('/').reply(200);
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.strictEqual(setOutputStub.mock.calls.length, 1);
    assert.strictEqual(setFailedStub.mock.calls.length, 0);
    assert.strictEqual(errorStub.mock.calls.length, 0);
    assert.strictEqual(infoStub.mock.calls.length, 5);
    const expected = '[SKP] http://fake.local/fake';
    assert.ok(infoStub.mock.calls.find((call) => call[0] === expected));
    scope.done();
  });

  it('should show failure details when verbosity is DEBUG', async () => {
    stubSummary();
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      verbosity: 'DEBUG',
    });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});
    const errorStub = vi.spyOn(core, 'error').mockImplementation(() => {});
    const scope = nock('http://fake.local')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(500);
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(infoStub.mock.calls.length > 0);
    assert.strictEqual(setOutputStub.mock.calls.length, 1);
    assert.strictEqual(setFailedStub.mock.calls.length, 1);
    assert.strictEqual(errorStub.mock.calls.length, 1);
    // Check that failure details are logged (contains status or headers from HttpResponse)
    const hasFailureDetails = infoStub.mock.calls
      .some((call) => /status|headers/.test(call[0]));
    assert.ok(hasFailureDetails);
    scope.done();
  });

  it('should respect local config with overrides', async () => {
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      config: 'test/fixtures/config.json',
      concurrency: '100',
      recurse: 'true',
      verbosity: 'ERROR',
    });
    const config = await getFullConfig();
    assert.strictEqual(config.retry, true);
    assert.strictEqual(config.verbosity, 'ERROR');
    assert.strictEqual(config.concurrency, 100);
    assert.strictEqual(config.markdown, true);
    assert.strictEqual(config.recurse, true);
    assert.ok(inputStub.mock.calls.length > 0);
  });

  it('should throw for invalid verbosity', async () => {
    stubSummary();
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      verbosity: 'NOT_VALID',
    });
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    await main();
    assert.ok(/must be one of/.test(setFailedStub.mock.calls[0][0]));
  });

  it('should respect url rewrite rules', async () => {
    stubSummary();
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      urlRewriteSearch: 'fake.local',
      urlRewriteReplace: 'real.remote',
    });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});
    vi.spyOn(core, 'setFailed').mockImplementation((output) => {
      throw new Error(output);
    });
    const scope = nock('http://real.remote')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(200);
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(infoStub.mock.calls.length > 0);
    assert.ok(setOutputStub.mock.calls.length > 0);
    scope.done();
  });

  it('should automatically rewrite urls on the incoming branch', async () => {
    stubSummary();
    vi.stubEnv('GITHUB_HEAD_REF', 'incoming');
    vi.stubEnv('GITHUB_BASE_REF', 'main');
    vi.stubEnv('GITHUB_REPOSITORY', 'JustinBeckwith/linkinator-action');
    vi.stubEnv('GITHUB_EVENT_PATH', './test/fixtures/payload.json');
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/github.md',
    });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});
    const scope = nock('https://github.com')
      .get('/Codertocat/Hello-World/blob/incoming/LICENSE')
      .reply(200);
    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(setOutputStub.mock.calls.length > 0);
    assert.strictEqual(setFailedStub.mock.calls.length, 0);
    assert.ok(infoStub.mock.calls.length > 0);
    scope.done();
  });

  it('should handle allowInsecureCerts option', async () => {
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      allowInsecureCerts: 'true',
    });
    const config = await getFullConfig();
    assert.strictEqual(config.allowInsecureCerts, true);
    assert.ok(inputStub.mock.calls.length > 0);
  });

  it('should handle requireHttps option', async () => {
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      requireHttps: 'true',
    });
    const config = await getFullConfig();
    assert.strictEqual(config.requireHttps, true);
    assert.ok(inputStub.mock.calls.length > 0);
  });

  it('should handle cleanUrls option', async () => {
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      cleanUrls: 'true',
    });
    const config = await getFullConfig();
    assert.strictEqual(config.cleanUrls, true);
    assert.ok(inputStub.mock.calls.length > 0);
  });

  it('should handle checkCss option', async () => {
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      checkCss: 'true',
    });
    const config = await getFullConfig();
    assert.strictEqual(config.checkCss, true);
    assert.ok(inputStub.mock.calls.length > 0);
  });

  it('should handle checkFragments option', async () => {
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      checkFragments: 'true',
    });
    const config = await getFullConfig();
    assert.strictEqual(config.checkFragments, true);
    assert.ok(inputStub.mock.calls.length > 0);
  });

  it('should handle statusCodes option', async () => {
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      statusCodes: '{"404":"error","5xx":"warn"}',
    });
    const config = await getFullConfig();
    assert.deepStrictEqual(config.statusCodes, { '404': 'error', '5xx': 'warn' });
    assert.ok(inputStub.mock.calls.length > 0);
  });

  it('should handle redirects option', async () => {
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/test.md',
      redirects: 'warn',
    });
    const config = await getFullConfig();
    assert.strictEqual(config.redirects, 'warn');
    assert.ok(inputStub.mock.calls.length > 0);
  });

  it('should throw for invalid statusCodes JSON', async () => {
    createGetInputMock({
      paths: 'test/fixtures/test.md',
      statusCodes: '{invalid json}',
    });
    await assert.rejects(
      async () => await getFullConfig(),
      /Invalid JSON for statusCodes/
    );
  });

  it('should handle branch names with slashes in URL rewriting', async () => {
    stubSummary();
    vi.stubEnv('GITHUB_HEAD_REF', 'release-please/branches/main');
    vi.stubEnv('GITHUB_BASE_REF', 'main');
    vi.stubEnv('GITHUB_REPOSITORY', 'JustinBeckwith/linkinator-action');
    vi.stubEnv('GITHUB_EVENT_PATH', './test/fixtures/payload-slashes.json');
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/github-slashed-branch.md',
    });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});

    // The action should rewrite URLs from main branch to the slashed branch
    // Original: https://github.com/JustinBeckwith/linkinator-action/blob/main/CONTRIBUTING.md
    // Expected: https://github.com/Codertocat/Hello-World/blob/release-please/branches/main/CONTRIBUTING.md
    const scope = nock('https://github.com')
      .get('/Codertocat/Hello-World/blob/release-please/branches/main/CONTRIBUTING.md')
      .reply(200)
      .get('/Codertocat/Hello-World/blob/release-please/branches/main/CODE_OF_CONDUCT.md')
      .reply(200);

    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(setOutputStub.mock.calls.length > 0);
    assert.strictEqual(setFailedStub.mock.calls.length, 0);
    assert.ok(infoStub.mock.calls.length > 0);
    scope.done();
  });

  it('should handle branch names with multiple slashes', async () => {
    stubSummary();
    vi.stubEnv('GITHUB_HEAD_REF', 'feature/deep/nested/branch');
    vi.stubEnv('GITHUB_BASE_REF', 'main');
    vi.stubEnv('GITHUB_REPOSITORY', 'JustinBeckwith/linkinator-action');
    vi.stubEnv('GITHUB_EVENT_PATH', './test/fixtures/payload-slashes.json');
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/github-slashed-branch.md',
    });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    const infoStub = vi.spyOn(core, 'info').mockImplementation(() => {});

    const scope = nock('https://github.com')
      .get('/Codertocat/Hello-World/blob/feature/deep/nested/branch/CONTRIBUTING.md')
      .reply(200)
      .get('/Codertocat/Hello-World/blob/feature/deep/nested/branch/CODE_OF_CONDUCT.md')
      .reply(200);

    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(setOutputStub.mock.calls.length > 0);
    assert.strictEqual(setFailedStub.mock.calls.length, 0);
    assert.ok(infoStub.mock.calls.length > 0);
    scope.done();
  });

  it('should handle tree URLs as well as blob URLs', async () => {
    stubSummary();
    vi.stubEnv('GITHUB_HEAD_REF', 'feature/test');
    vi.stubEnv('GITHUB_BASE_REF', 'main');
    vi.stubEnv('GITHUB_REPOSITORY', 'JustinBeckwith/linkinator-action');
    vi.stubEnv('GITHUB_EVENT_PATH', './test/fixtures/payload-slashes.json');
    createGetInputMock({
      paths: 'test/fixtures/test.md',
    });
    vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    vi.spyOn(core, 'info').mockImplementation(() => {});

    // Mock both blob and tree URLs
    const scope = nock('http://fake.local')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(200);

    await main();
    scope.done();
  });

  it('should not duplicate branch names when URL already contains head ref substring', async () => {
    stubSummary();
    // Regression test for issue #85
    // When branch is "release-please/branches/main" and base is "main",
    // a URL already containing the full branch name should not get it duplicated

    // Create a fixture that has a URL with the branch name already in it
    const fs = await import('node:fs/promises');
    const testContent = '[Link](https://github.com/JustinBeckwith/linkinator-action/blob/release-please/branches/main/FILE.md)';
    await fs.writeFile('test/fixtures/github-already-on-branch.md', testContent);

    vi.stubEnv('GITHUB_HEAD_REF', 'release-please/branches/main');
    vi.stubEnv('GITHUB_BASE_REF', 'main');
    vi.stubEnv('GITHUB_REPOSITORY', 'JustinBeckwith/linkinator-action');
    vi.stubEnv('GITHUB_EVENT_PATH', './test/fixtures/payload-slashes.json');
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/github-already-on-branch.md',
    });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    vi.spyOn(core, 'info').mockImplementation(() => {});

    // The URL should NOT be rewritten because it's already on the correct branch
    // It should NOT become: /blob/release-please/branches/release-please/branches/main/FILE.md
    // With the old regex, it WOULD match and duplicate. With the new regex, it should NOT match at all
    // because the pattern is specifically /blob/{BASE_REF}/ not /blob/anything/with/main/at/end/
    // Since it doesn't match the base ref, it stays as-is and checks the original repo
    const scope = nock('https://github.com')
      .get('/JustinBeckwith/linkinator-action/blob/release-please/branches/main/FILE.md')
      .reply(200);

    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(setOutputStub.mock.calls.length > 0);
    assert.strictEqual(setFailedStub.mock.calls.length, 0);
    scope.done();

    // Cleanup
    await fs.unlink('test/fixtures/github-already-on-branch.md');
  });

  it('should handle base refs with special regex characters', async () => {
    stubSummary();
    // Test that branch names with regex special chars are properly escaped
    const fs = await import('node:fs/promises');
    const testContent = '[Link](https://github.com/JustinBeckwith/linkinator-action/blob/v1.0.0/FILE.md)';
    await fs.writeFile('test/fixtures/github-special-chars.md', testContent);

    vi.stubEnv('GITHUB_HEAD_REF', 'feature/test');
    vi.stubEnv('GITHUB_BASE_REF', 'v1.0.0');
    vi.stubEnv('GITHUB_REPOSITORY', 'JustinBeckwith/linkinator-action');
    vi.stubEnv('GITHUB_EVENT_PATH', './test/fixtures/payload-slashes.json');
    const inputStub = createGetInputMock({
      paths: 'test/fixtures/github-special-chars.md',
    });
    const setOutputStub = vi.spyOn(core, 'setOutput').mockImplementation(() => {});
    const setFailedStub = vi.spyOn(core, 'setFailed').mockImplementation(() => {});
    vi.spyOn(core, 'info').mockImplementation(() => {});

    const scope = nock('https://github.com')
      .get('/Codertocat/Hello-World/blob/feature/test/FILE.md')
      .reply(200);

    await main();
    assert.ok(inputStub.mock.calls.length > 0);
    assert.ok(setOutputStub.mock.calls.length > 0);
    assert.strictEqual(setFailedStub.mock.calls.length, 0);
    scope.done();

    // Cleanup
    await fs.unlink('test/fixtures/github-special-chars.md');
  });

  describe('Job Summary', () => {
    it('should generate summary for successful scan', async () => {
      const summaryStub = stubSummary();

      const result = {
        passed: true,
        links: [
          { url: 'http://example.com', state: 'OK', status: 200, parent: 'test.md' },
          { url: 'http://example.org', state: 'OK', status: 200, parent: 'test.md' },
          { url: 'http://skipped.com', state: 'SKIPPED', status: 0, parent: 'test.md' },
        ],
      };

      await generateJobSummary(result);

      assert.ok(summaryStub.addHeading.mock.calls.some(c => c[0] === '🔗 Linkinator Results' && c[1] === 2));
      assert.ok(summaryStub.addRaw.mock.calls.some(c => c[0] === '\n**Status:** ✅ All links are valid!\n\n'));
      assert.ok(summaryStub.addHeading.mock.calls.some(c => c[0] === '📊 Summary' && c[1] === 3));
      assert.ok(summaryStub.addList.mock.calls.length > 0);
      assert.ok(summaryStub.write.mock.calls.length > 0);
      // Should not add broken links table
      assert.strictEqual(summaryStub.addTable.mock.calls.length, 0);
    });

    it('should generate summary with broken links table', async () => {
      const summaryStub = stubSummary();

      const result = {
        passed: false,
        links: [
          { url: 'http://broken.com', state: 'BROKEN', status: 404, parent: 'test.md' },
          { url: 'http://error.com', state: 'BROKEN', status: 500, parent: 'other.md' },
          { url: 'http://example.com', state: 'OK', status: 200, parent: 'test.md' },
        ],
      };

      await generateJobSummary(result);

      assert.ok(summaryStub.addHeading.mock.calls.some(c => c[0] === '🔗 Linkinator Results' && c[1] === 2));
      assert.ok(summaryStub.addRaw.mock.calls.some(c => c[0] === '\n**Status:** ❌ Found 2 broken links\n\n'));
      assert.ok(summaryStub.addHeading.mock.calls.some(c => c[0] === '❌ Broken Links' && c[1] === 3));
      assert.ok(summaryStub.addTable.mock.calls.length > 0);
      assert.ok(summaryStub.write.mock.calls.length > 0);

      // Check table structure
      const tableCall = summaryStub.addTable.mock.calls[0];
      const tableRows = tableCall[0];
      assert.strictEqual(tableRows.length, 3); // header + 2 broken links
      assert.deepStrictEqual(tableRows[0], [
        { data: 'Status', header: true },
        { data: 'URL', header: true },
        { data: 'Reason', header: true },
        { data: 'Source', header: true },
      ]);
    });

    it('should handle singular vs plural in broken links message', async () => {
      const summaryStub = stubSummary();

      const result = {
        passed: false,
        links: [
          { url: 'http://broken.com', state: 'BROKEN', status: 404, parent: 'test.md' },
        ],
      };

      await generateJobSummary(result);

      assert.ok(summaryStub.addRaw.mock.calls.some(c => c[0] === '\n**Status:** ❌ Found 1 broken link\n\n'));
    });

    it('should group broken links by parent in table', async () => {
      const summaryStub = stubSummary();

      const result = {
        passed: false,
        links: [
          { url: 'http://broken1.com', state: 'BROKEN', status: 404, parent: 'test.md' },
          { url: 'http://broken2.com', state: 'BROKEN', status: 500, parent: 'test.md' },
          { url: 'http://broken3.com', state: 'BROKEN', status: 403, parent: 'other.md' },
        ],
      };

      await generateJobSummary(result);

      const tableCall = summaryStub.addTable.mock.calls[0];
      const tableRows = tableCall[0];
      assert.strictEqual(tableRows.length, 4); // header + 3 broken links

      // Check links are sorted by parent (Source is now at index 3)
      assert.strictEqual(tableRows[1][3], 'other.md');
      assert.strictEqual(tableRows[2][3], 'test.md');
      assert.strictEqual(tableRows[3][3], 'test.md');
    });

    it('should handle links with no parent', async () => {
      const summaryStub = stubSummary();

      const result = {
        passed: false,
        links: [
          { url: 'http://broken.com', state: 'BROKEN', status: 404, parent: '' },
        ],
      };

      await generateJobSummary(result);

      const tableCall = summaryStub.addTable.mock.calls[0];
      const tableRows = tableCall[0];
      assert.strictEqual(tableRows[1][3], '(unknown)');
    });
  });
});
