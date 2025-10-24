import assert from 'node:assert';
import core from '@actions/core';
import { afterEach, describe, it } from 'mocha';
import nock from 'nock';
import sinon from 'sinon';
import { getFullConfig, main, generateJobSummary } from '../src/action.js';

nock.disableNetConnect();
nock.enableNetConnect('localhost');

// Helper to stub out core.summary for tests
function stubSummary() {
  const summaryStub = {
    addHeading: sinon.stub().returnsThis(),
    addRaw: sinon.stub().returnsThis(),
    addList: sinon.stub().returnsThis(),
    addTable: sinon.stub().returnsThis(),
    write: sinon.stub().resolves(),
  };
  sinon.stub(core, 'summary').value(summaryStub);
  return summaryStub;
}

describe('linkinator action', () => {
  afterEach(() => {
    sinon.restore();
    nock.cleanAll();
  });

  it('should return ok for a valid README', async () => {
    stubSummary();
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const infoStub = sinon.stub(core, 'info');
    const scope = nock('http://fake.local')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(200);
    await main();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.called);
    assert.ok(setFailedStub.notCalled);
    assert.ok(infoStub.called);
    scope.done();
  });

  it('should call setFailed on failures', async () => {
    stubSummary();
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.returns('');
    sinon.stub(core, 'setOutput');
    const errorStub = sinon.stub(core, 'error');
    const infoStub = sinon.stub(core, 'info');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const scope = nock('http://fake.local')
      .head('/')
      .reply(404)
      .head('/fake')
      .reply(404);
    await main();
    assert.ok(inputStub.called);
    assert.ok(setFailedStub.called);
    assert.ok(infoStub.called);
    assert.ok(errorStub.called);
    scope.done();
  });

  it('should surface exceptions from linkinator with call stack', async () => {
    stubSummary();
    const inputStub = sinon.stub(core, 'getInput').throws(new Error('😱'));
    const setFailedStub = sinon.stub(core, 'setFailed');
    await main();
    assert.ok(inputStub.called);
    assert.ok(setFailedStub.called);
    assert.ok(setFailedStub.firstCall.firstArg.includes('test.js:'));
  });

  it('should handle linksToSkip', async () => {
    stubSummary();
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub
      .withArgs('linksToSkip')
      .returns('http://fake.local,http://fake.local/fake');
    inputStub.returns('');
    const infoStub = sinon.stub(core, 'info');
    const setOutputStub = sinon.stub(core, 'setOutput');
    sinon.stub(core, 'setFailed').callsFake((output) => {
      throw new Error(output);
    });
    await main();
    assert.ok(inputStub.called);
    assert.ok(infoStub.called);
    assert.ok(setOutputStub.called);
  });

  it('should handle skips and spaces', async () => {
    stubSummary();
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub
      .withArgs('skip')
      .returns('http://fake.local http://fake.local/fake');
    inputStub.returns('');
    const infoStub = sinon.stub(core, 'info');
    const setOutputStub = sinon.stub(core, 'setOutput');
    sinon.stub(core, 'setFailed').callsFake((output) => {
      throw new Error(output);
    });
    await main();
    assert.ok(inputStub.called);
    assert.ok(infoStub.called);
    assert.ok(setOutputStub.called);
  });

  it('should handle multiple paths', async () => {
    stubSummary();
    const inputStub = sinon.stub(core, 'getInput');
    inputStub
      .withArgs('paths')
      .returns('test/fixtures/test.md, test/fixtures/test2.md');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const infoStub = sinon.stub(core, 'info');
    sinon.stub(core, 'setFailed').callsFake((output) => {
      throw new Error(output);
    });
    const scope = nock('http://fake.local')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(200);
    await main();
    assert.ok(inputStub.called);
    assert.ok(infoStub.called);
    assert.ok(setOutputStub.called);
    scope.done();
  });

  it('should respect verbosity set to ERROR', async () => {
    stubSummary();
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('verbosity').returns('ERROR');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const infoStub = sinon.stub(core, 'info');
    const errorStub = sinon.stub(core, 'error');
    const scope = nock('http://fake.local')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(500);
    await main();
    assert.ok(inputStub.called);
    assert.strictEqual(setOutputStub.callCount, 1);
    assert.strictEqual(setFailedStub.callCount, 1);

    // ensure `Scanning ...` is always shown
    assert.strictEqual(
      infoStub.getCalls().filter((x) => {
        return x.args[0].startsWith('Scanning ');
      }).length,
      1,
    );

    // Ensure total count is always shown
    assert.strictEqual(
      setFailedStub.getCalls().filter((x) => {
        return (
          x.args[0] ===
          'Detected 1 broken links.\n test/fixtures/test.md\n   [500] http://fake.local/fake'
        );
      }).length,
      1,
    );

    // Ensure `core.error` is called for each failure
    assert.strictEqual(errorStub.callCount, 1);
    const expected = '[500] http://fake.local/fake';
    assert.strictEqual(errorStub.getCalls()[0].args[0], expected);

    scope.done();
  });

  it('should show skipped links when verbosity is INFO', async () => {
    stubSummary();
    // Unset GITHUB_EVENT_PATH, so that no replacement is attempted.
    sinon.stub(process, 'env').value({
      GITHUB_EVENT_PATH: undefined,
    });
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('skip').returns('http://fake.local/fake');
    inputStub.withArgs('verbosity').returns('INFO');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const infoStub = sinon.stub(core, 'info');
    const errorStub = sinon.stub(core, 'error');
    const scope = nock('http://fake.local').head('/').reply(200);
    await main();
    assert.ok(inputStub.called);
    assert.strictEqual(setOutputStub.callCount, 1);
    assert.ok(setFailedStub.notCalled);
    assert.ok(errorStub.notCalled);
    assert.strictEqual(infoStub.getCalls().length, 5);
    const expected = '[SKP] http://fake.local/fake';
    assert.ok(infoStub.getCalls().find((x) => x.args[0] === expected));
    scope.done();
  });

  it('should show failure details when verbosity is DEBUG', async () => {
    stubSummary();
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('verbosity').returns('DEBUG');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const infoStub = sinon.stub(core, 'info');
    const errorStub = sinon.stub(core, 'error');
    const scope = nock('http://fake.local')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(500);
    await main();
    assert.ok(inputStub.called);
    assert.ok(infoStub.called);
    assert.strictEqual(setOutputStub.callCount, 1);
    assert.strictEqual(setFailedStub.callCount, 1);
    assert.strictEqual(errorStub.callCount, 1);
    // Check that failure details are logged (contains status or headers from HttpResponse)
    const hasFailureDetails = infoStub
      .getCalls()
      .some((x) => /status|headers/.test(x.args[0]));
    assert.ok(hasFailureDetails);
    scope.done();
  });

  it('should respect local config with overrides', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('config').returns('test/fixtures/config.json');
    inputStub.withArgs('concurrency').returns('100');
    inputStub.withArgs('recurse').returns('true');
    inputStub.withArgs('verbosity').returns('ERROR');
    inputStub.returns('');
    const config = await getFullConfig();
    assert.strictEqual(config.retry, true);
    assert.strictEqual(config.verbosity, 'ERROR');
    assert.strictEqual(config.concurrency, 100);
    assert.strictEqual(config.markdown, true);
    assert.strictEqual(config.recurse, true);
    assert.ok(inputStub.called);
  });

  it('should throw for invalid verbosity', async () => {
    stubSummary();
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('verbosity').returns('NOT_VALID');
    inputStub.returns('');
    const setFailedStub = sinon.stub(core, 'setFailed');
    await main();
    assert.ok(/must be one of/.test(setFailedStub.getCalls()[0].args[0]));
  });

  it('should respect url rewrite rules', async () => {
    stubSummary();
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('urlRewriteSearch').returns('fake.local');
    inputStub.withArgs('urlRewriteReplace').returns('real.remote');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const infoStub = sinon.stub(core, 'info');
    sinon.stub(core, 'setFailed').callsFake((output) => {
      throw new Error(output);
    });
    const scope = nock('http://real.remote')
      .head('/')
      .reply(200)
      .head('/fake')
      .reply(200);
    await main();
    assert.ok(inputStub.called);
    assert.ok(infoStub.called);
    assert.ok(setOutputStub.called);
    scope.done();
  });

  it('should automatically rewrite urls on the incoming branch', async () => {
    stubSummary();
    sinon.stub(process, 'env').value({
      GITHUB_HEAD_REF: 'incoming',
      GITHUB_BASE_REF: 'main',
      GITHUB_REPOSITORY: 'JustinBeckwith/linkinator-action',
      GITHUB_EVENT_PATH: './test/fixtures/payload.json',
    });
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/github.md');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const infoStub = sinon.stub(core, 'info');
    const scope = nock('https://github.com')
      .get('/Codertocat/Hello-World/blob/incoming/LICENSE')
      .reply(200);
    await main();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.called);
    assert.ok(setFailedStub.notCalled);
    assert.ok(infoStub.called);
    scope.done();
  });

  it('should handle allowInsecureCerts option', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('allowInsecureCerts').returns('true');
    inputStub.returns('');
    const config = await getFullConfig();
    assert.strictEqual(config.allowInsecureCerts, true);
    assert.ok(inputStub.called);
  });

  it('should handle requireHttps option', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('requireHttps').returns('true');
    inputStub.returns('');
    const config = await getFullConfig();
    assert.strictEqual(config.requireHttps, true);
    assert.ok(inputStub.called);
  });

  it('should handle cleanUrls option', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('cleanUrls').returns('true');
    inputStub.returns('');
    const config = await getFullConfig();
    assert.strictEqual(config.cleanUrls, true);
    assert.ok(inputStub.called);
  });

  it('should handle checkCss option', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('checkCss').returns('true');
    inputStub.returns('');
    const config = await getFullConfig();
    assert.strictEqual(config.checkCss, true);
    assert.ok(inputStub.called);
  });

  it('should handle checkFragments option', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('checkFragments').returns('true');
    inputStub.returns('');
    const config = await getFullConfig();
    assert.strictEqual(config.checkFragments, true);
    assert.ok(inputStub.called);
  });

  it('should handle branch names with slashes in URL rewriting', async () => {
    stubSummary();
    sinon.stub(process, 'env').value({
      GITHUB_HEAD_REF: 'release-please/branches/main',
      GITHUB_BASE_REF: 'main',
      GITHUB_REPOSITORY: 'JustinBeckwith/linkinator-action',
      GITHUB_EVENT_PATH: './test/fixtures/payload-slashes.json',
    });
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/github-slashed-branch.md');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const infoStub = sinon.stub(core, 'info');

    // The action should rewrite URLs from main branch to the slashed branch
    // Original: https://github.com/JustinBeckwith/linkinator-action/blob/main/CONTRIBUTING.md
    // Expected: https://github.com/Codertocat/Hello-World/blob/release-please/branches/main/CONTRIBUTING.md
    const scope = nock('https://github.com')
      .get('/Codertocat/Hello-World/blob/release-please/branches/main/CONTRIBUTING.md')
      .reply(200)
      .get('/Codertocat/Hello-World/blob/release-please/branches/main/CODE_OF_CONDUCT.md')
      .reply(200);

    await main();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.called);
    assert.ok(setFailedStub.notCalled);
    assert.ok(infoStub.called);
    scope.done();
  });

  it('should handle branch names with multiple slashes', async () => {
    stubSummary();
    sinon.stub(process, 'env').value({
      GITHUB_HEAD_REF: 'feature/deep/nested/branch',
      GITHUB_BASE_REF: 'main',
      GITHUB_REPOSITORY: 'JustinBeckwith/linkinator-action',
      GITHUB_EVENT_PATH: './test/fixtures/payload-slashes.json',
    });
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/github-slashed-branch.md');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const infoStub = sinon.stub(core, 'info');

    const scope = nock('https://github.com')
      .get('/Codertocat/Hello-World/blob/feature/deep/nested/branch/CONTRIBUTING.md')
      .reply(200)
      .get('/Codertocat/Hello-World/blob/feature/deep/nested/branch/CODE_OF_CONDUCT.md')
      .reply(200);

    await main();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.called);
    assert.ok(setFailedStub.notCalled);
    assert.ok(infoStub.called);
    scope.done();
  });

  it('should handle tree URLs as well as blob URLs', async () => {
    stubSummary();
    sinon.stub(process, 'env').value({
      GITHUB_HEAD_REF: 'feature/test',
      GITHUB_BASE_REF: 'main',
      GITHUB_REPOSITORY: 'JustinBeckwith/linkinator-action',
      GITHUB_EVENT_PATH: './test/fixtures/payload-slashes.json',
    });
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.returns('');
    sinon.stub(core, 'setOutput');
    sinon.stub(core, 'setFailed');
    sinon.stub(core, 'info');

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

    sinon.stub(process, 'env').value({
      GITHUB_HEAD_REF: 'release-please/branches/main',
      GITHUB_BASE_REF: 'main', // Note: base is just "main", a substring of the head ref!
      GITHUB_REPOSITORY: 'JustinBeckwith/linkinator-action',
      GITHUB_EVENT_PATH: './test/fixtures/payload-slashes.json',
    });
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/github-already-on-branch.md');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    sinon.stub(core, 'info');

    // The URL should NOT be rewritten because it's already on the correct branch
    // It should NOT become: /blob/release-please/branches/release-please/branches/main/FILE.md
    // With the old regex, it WOULD match and duplicate. With the new regex, it should NOT match at all
    // because the pattern is specifically /blob/{BASE_REF}/ not /blob/anything/with/main/at/end/
    // Since it doesn't match the base ref, it stays as-is and checks the original repo
    const scope = nock('https://github.com')
      .get('/JustinBeckwith/linkinator-action/blob/release-please/branches/main/FILE.md')
      .reply(200);

    await main();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.called);
    assert.ok(setFailedStub.notCalled);
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

    sinon.stub(process, 'env').value({
      GITHUB_HEAD_REF: 'feature/test',
      GITHUB_BASE_REF: 'v1.0.0', // Contains dots which are regex wildcards
      GITHUB_REPOSITORY: 'JustinBeckwith/linkinator-action',
      GITHUB_EVENT_PATH: './test/fixtures/payload-slashes.json',
    });
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/github-special-chars.md');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    sinon.stub(core, 'info');

    const scope = nock('https://github.com')
      .get('/Codertocat/Hello-World/blob/feature/test/FILE.md')
      .reply(200);

    await main();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.called);
    assert.ok(setFailedStub.notCalled);
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

      assert.ok(summaryStub.addHeading.calledWith('🔗 Linkinator Results', 2));
      assert.ok(summaryStub.addRaw.calledWith('\n**Status:** ✅ All links are valid!\n\n'));
      assert.ok(summaryStub.addHeading.calledWith('📊 Summary', 3));
      assert.ok(summaryStub.addList.called);
      assert.ok(summaryStub.write.called);
      // Should not add broken links table
      assert.strictEqual(summaryStub.addTable.called, false);
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

      assert.ok(summaryStub.addHeading.calledWith('🔗 Linkinator Results', 2));
      assert.ok(summaryStub.addRaw.calledWith('\n**Status:** ❌ Found 2 broken links\n\n'));
      assert.ok(summaryStub.addHeading.calledWith('❌ Broken Links', 3));
      assert.ok(summaryStub.addTable.called);
      assert.ok(summaryStub.write.called);

      // Check table structure
      const tableCall = summaryStub.addTable.getCall(0);
      const tableRows = tableCall.args[0];
      assert.strictEqual(tableRows.length, 3); // header + 2 broken links
      assert.deepStrictEqual(tableRows[0], [
        { data: 'Status', header: true },
        { data: 'URL', header: true },
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

      assert.ok(summaryStub.addRaw.calledWith('\n**Status:** ❌ Found 1 broken link\n\n'));
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

      const tableCall = summaryStub.addTable.getCall(0);
      const tableRows = tableCall.args[0];
      assert.strictEqual(tableRows.length, 4); // header + 3 broken links

      // Check links are sorted by parent
      assert.strictEqual(tableRows[1][2], 'other.md');
      assert.strictEqual(tableRows[2][2], 'test.md');
      assert.strictEqual(tableRows[3][2], 'test.md');
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

      const tableCall = summaryStub.addTable.getCall(0);
      const tableRows = tableCall.args[0];
      assert.strictEqual(tableRows[1][2], '(unknown)');
    });
  });
});
