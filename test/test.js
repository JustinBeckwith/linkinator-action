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
    inputStub.withArgs('paths').returns('test/fixtures/test.md')
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const scope = nock('http://fake.local')
      .head('/').reply(200)
      .head('/fake').reply(200);
    await action();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.called);
    assert.ok(setFailedStub.notCalled);
    scope.done();
  });

  it('should call setFailed on failures', async () => {
    const inputStub = sinon.stub(core, 'getInput');
    inputStub.withArgs('paths').returns('test/fixtures/test.md')
    inputStub.returns('');
    const setOutputStub = sinon.stub(core, 'setOutput');
    const setFailedStub = sinon.stub(core, 'setFailed');
    const scope = nock('http://fake.local')
      .head('/').reply(404)
      .head('/fake').reply(404);
    await action();
    assert.ok(inputStub.called);
    assert.ok(setOutputStub.notCalled);
    assert.ok(setFailedStub.called);
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
});
