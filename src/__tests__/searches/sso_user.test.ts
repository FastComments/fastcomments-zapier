import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nock from 'nock';
import { perform } from '../../searches/sso_user.js';
import { appTester, authData, failure, nockApi } from '../helpers.js';

describe('find_sso_user', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('returns an empty result when the user does not exist', async () => {
    nockApi().get('/api/v1/sso-users/by-email/missing%40example.com').reply(404, failure('not-found', 'That object was not found.'));
    const result = await appTester(perform, { authData, inputData: { email: 'missing@example.com' } });
    assert.deepEqual(result, []);
  });

  it('returns the user with an ISO sign-up date', async () => {
    nockApi().get('/api/v1/sso-users/by-email/jane%40example.com').reply(200, {
      status: 'success',
      user: { id: 'user-1', username: 'jane', email: 'jane@example.com', signUpDate: 1757332800000, loginCount: 2 },
    });
    const result = await appTester(perform, { authData, inputData: { email: 'jane@example.com' } });
    assert.equal(result.length, 1);
    assert.equal(result[0]?.id, 'user-1');
    assert.equal(result[0]?.signUpDate, '2025-09-08T12:00:00.000Z');
  });
});
