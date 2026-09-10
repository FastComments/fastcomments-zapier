import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nock from 'nock';
import { perform as findSSOUser } from '../searches/sso_user.js';
import { appTester, authData, errorMessage, errorName, failure, nockApi } from './helpers.js';

function findUser() {
  return appTester(findSSOUser, { authData, inputData: { email: 'jane@example.com' } });
}

describe('middleware', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('raises RefreshAuthError on 401 so Zapier refreshes and retries', async () => {
    nockApi().get('/api/v1/sso-users/by-email/jane%40example.com').reply(401, failure('invalid-token', 'The access token is invalid.'));
    await assert.rejects(findUser(), (error: unknown) => errorName(error) === 'RefreshAuthError');
  });

  it('explains a missing write scope', async () => {
    nockApi().get('/api/v1/sso-users/by-email/jane%40example.com').reply(403, failure('insufficient-scope', 'Missing scope'));
    await assert.rejects(findUser(), (error: unknown) => errorMessage(error).includes('does not have write access'));
  });

  it('passes the API reason through for validation errors', async () => {
    nockApi().get('/api/v1/sso-users/by-email/jane%40example.com').reply(422, failure('invalid-input', 'Email is not valid.'));
    await assert.rejects(findUser(), (error: unknown) => errorMessage(error).includes('Email is not valid.') && errorMessage(error).includes('invalid-input'));
  });

  it('raises ThrottledError with the retry delay on 429', async () => {
    nockApi().get('/api/v1/sso-users/by-email/jane%40example.com').reply(429, failure('rate-limited', 'Slow down'), { 'retry-after': '30' });
    await assert.rejects(findUser(), (error: unknown) => errorName(error) === 'ThrottledError');
  });

  it('treats a 200 with status failed as an error', async () => {
    nockApi().get('/api/v1/sso-users/by-email/jane%40example.com').reply(200, failure('something', 'Nope'));
    await assert.rejects(findUser(), (error: unknown) => errorMessage(error).includes('Nope'));
  });
});
