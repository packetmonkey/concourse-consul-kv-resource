'use strict';

const assert = require('assert');
const inAction = require('../assets/lib/in');
const nock = require('nock');
const fs = require('fs-extra');

function mockGet(host) {
  return nock('https://my-consul.com:8500')
    .get('/v1/kv/my/key?token=my-token')
    .reply(200, [{
      Value: 'bXktdmFsdWU='
    }]);
}

describe('inAction', () => {
  let stdin;

  beforeEach(() => {
    stdin = require('mock-stdin').stdin();
  });

  it('gets the Consul key configured in the source and resolves the promise with the proper metadata', () => {
    mockGet();

    process.nextTick(() => {
      stdin.send(JSON.stringify({
        source: {
          host: 'my-consul.com',
          tls_cert: 'my-cert',
          tls_key: 'my-cert-key',
          token: 'my-token',
          key: 'my/key'
        }
      }));
    });

    return inAction('test-dir')
      .then(result => {
        assert.equal(result.version.value, 'my-value');
      });
  });

  afterEach((done) => {
    fs.remove('test-dir', (err) => {
      if (!err) done();
    });
  });
});
