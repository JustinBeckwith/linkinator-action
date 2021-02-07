const assert = require('assert');
const core = require('@actions/core');
const { describe, it, afterEach } = require('mocha');
const sinon = require('sinon');
const nock = require('nock');
const action = require('../src/index.js');

nock.disableNetConnect();
nock.enableNetConnect('localhost');

describe('linkinator action', () => {
  afterEach(() => {
    sinon.restore();
    nock.cleanAll();
  });

  it('should return ok for a valid README', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const infoStub = sinon.stub(core, 'info');
    const scope = nock('http://fake.local')
      .head('/').reply(200)
      .head('/fake').reply(200);
    await action();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.called);
    assert.ok(setFailedStub.notCalled);
    assert.ok(infoStub.called);
    scope.done();
  });

  it('should call setFailed on failures', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.returns('');
    sinon.stub(core, 'setOutput');
    const errorStub = sinon.stub(core, 'error');
    const infoStub = sinon.stub(core, 'info');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const scope = nock('http://fake.local')
      .head('/').reply(404)
      .head('/fake').reply(404);
    await action();
    assert.ok(inputStub.called);
    assert.ok(setFailedStub.called);
    assert.ok(infoStub.called);
    assert.ok(errorStub.called);
    scope.done();
  });

  it('should surface exceptions from linkinator with call stack', async () => {
    const inputStub = sinon.stub(core, 'getInput').throws(new Error('😱'));
    const setFailedStub = sinon.stub(core, 'setFailed');
    await action();
    assert.ok(inputStub.called);
    assert.ok(setFailedStub.called);
    assert.ok(setFailedStub.firstCall.firstArg.includes('test.js:'));
  });

  it('should handle linksToSkip', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('linksToSkip').returns('http://fake.local,http://fake.local/fake');
    inputStub.returns('');
    const infoStub = sinon.stub(core, 'info');
    const setOutputStub = sinon.stub(core, 'setOutput');
    sinon.stub(core, 'setFailed').callsFake(output => {
      throw new Error(output);
    });
    await action();
    assert.ok(inputStub.called);
    assert.ok(infoStub.called);
    assert.ok(setOutputStub.called);
  });

  it('should handle skips and spaces', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('skip').returns('http://fake.local http://fake.local/fake');
    inputStub.returns('');
    const infoStub = sinon.stub(core, 'info');
    const setOutputStub = sinon.stub(core, 'setOutput');
    sinon.stub(core, 'setFailed').callsFake(output => {
      throw new Error(output);
    });
    await action();
    assert.ok(inputStub.called);
    assert.ok(infoStub.called);
    assert.ok(setOutputStub.called);
  });

  it('should handle multiple paths', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md, test/fixtures/test2.md');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const infoStub = sinon.stub(core, 'info');
    sinon.stub(core, 'setFailed').callsFake(output => {
      throw new Error(output);
    });
    const scope = nock('http://fake.local')
      .head('/').reply(200)
      .head('/fake').reply(200);
    await action();
    assert.ok(inputStub.called);
    assert.ok(infoStub.called);
    assert.ok(setOutputStub.called);
    scope.done();
  });

  it('should respect verbosity set to ERROR', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('verbosity').returns('ERROR');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const infoStub = sinon.stub(core, 'info');
    const errorStub = sinon.stub(core, 'error');
    const scope = nock('http://fake.local')
      .head('/').reply(200)
      .head('/fake').reply(500);
    await action();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.calledOnce);
    assert.ok(setFailedStub.calledOnce);

    // ensure `Scanning ...` is always shown
    assert.strictEqual(infoStub.getCalls().filter(x => {
      return x.args[0].startsWith('Scanning ');
    }).length, 1);

    // Ensure total count is always shown
    assert.strictEqual(setFailedStub.getCalls().filter(x => {
      return x.args[0] === 'Detected 1 broken links.';
    }).length, 1);

    // Ensure `core.error` is called for each failure
    assert.ok(errorStub.calledOnce);
    const expected = '[500] http://fake.local/fake';
    assert.strictEqual(errorStub.getCalls()[0].args[0], expected);

    scope.done();
  });

  it('should show skipped links when verbosity is INFO', async () => {
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
    await action();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.calledOnce);
    assert.ok(setFailedStub.notCalled);
    assert.ok(errorStub.notCalled);
    assert.strictEqual(infoStub.getCalls().length, 5);
    const expected = '[SKP] http://fake.local/fake';
    assert.ok(infoStub.getCalls().find(x => x.args[0] === expected));
    scope.done();
  });

  it('should show failure details when verbosity is DEBUG', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md');
    inputStub.withArgs('verbosity').returns('DEBUG');
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const infoStub = sinon.stub(core, 'info');
    const errorStub = sinon.stub(core, 'error');
    const scope = nock('http://fake.local')
      .head('/').reply(200)
      .head('/fake').reply(500);
    await action();
    assert.ok(inputStub.called);
    assert.ok(infoStub.called);
    assert.ok(setOutputStub.calledOnce);
    assert.ok(setFailedStub.calledOnce);
    assert.ok(errorStub.calledOnce);
    const expected = /No match for request/;
    assert.ok(infoStub.getCalls().find(x => expected.test(x.args[0])));
    scope.done();
  });
});
