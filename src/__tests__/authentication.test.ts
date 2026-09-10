import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nock from 'nock';
import authentication, { authorizeUrl, connectionLabel, getAccessToken, refreshAccessToken, test } from '../authentication.js';
import { ACCESS_TOKEN, REFRESH_TOKEN, appTester, authData, nockApi, nockOAuth } from './helpers.js';

describe('authentication', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('builds a PKCE-ready authorize URL on the chosen region host', async () => {
    const rendered = await appTester(authorizeUrl, {
      inputData: { state: 'state-1', redirect_uri: 'https://zapier.com/dashboard/auth/oauth/return/App1CLIAPI/', host: 'eu.fastcomments.com' },
    });
    assert.ok(typeof rendered === 'string', 'authorize url should render to a string');
    const url = new URL(rendered);
    assert.equal(url.origin + url.pathname, 'https://eu.fastcomments.com/oauth/authorize');
    assert.equal(url.searchParams.get('client_id'), process.env.CLIENT_ID);
    assert.equal(url.searchParams.get('response_type'), 'code');
    assert.equal(url.searchParams.get('scope'), 'read write');
    assert.equal(url.searchParams.get('state'), 'state-1');
    assert.equal(url.searchParams.get('redirect_uri'), 'https://zapier.com/dashboard/auth/oauth/return/App1CLIAPI/');
    assert.equal(authentication.oauth2Config.enablePkce, true);
    assert.equal(authentication.oauth2Config.autoRefresh, true);
  });

  it('exchanges the code with the client secret and the PKCE verifier', async () => {
    let form = '';
    nockOAuth()
      .post('/oauth/token', (body) => {
        form = typeof body === 'string' ? body : new URLSearchParams(body).toString();
        return true;
      })
      .matchHeader('content-type', 'application/x-www-form-urlencoded')
      .reply(200, { access_token: ACCESS_TOKEN, token_type: 'bearer', expires_in: 3600, refresh_token: REFRESH_TOKEN, scope: 'read write' });

    const result = await appTester(getAccessToken, {
      inputData: { code: 'fcac_code', code_verifier: 'verifier-123', redirect_uri: 'https://zapier.com/return/', host: 'fastcomments.com' },
    });
    const params = new URLSearchParams(form);
    assert.equal(params.get('grant_type'), 'authorization_code');
    assert.equal(params.get('client_id'), process.env.CLIENT_ID);
    assert.equal(params.get('client_secret'), process.env.CLIENT_SECRET);
    assert.equal(params.get('code'), 'fcac_code');
    assert.equal(params.get('code_verifier'), 'verifier-123');
    assert.equal(params.get('redirect_uri'), 'https://zapier.com/return/');
    assert.equal(result.access_token, ACCESS_TOKEN);
    assert.equal(result.refresh_token, REFRESH_TOKEN);
  });

  it('surfaces the OAuth error description when the exchange fails', async () => {
    nockOAuth().post('/oauth/token').reply(400, { error: 'invalid_grant', error_description: 'Authorization code already used' });
    await assert.rejects(
      appTester(getAccessToken, {
        inputData: { code: 'fcac_code', code_verifier: 'v', redirect_uri: 'https://zapier.com/return/', host: 'fastcomments.com' },
      }),
      (error: unknown) => error instanceof Error && error.message.includes('Authorization code already used'),
    );
  });

  it('refreshes with the stored refresh token against the stored host', async () => {
    let form = '';
    nock('https://eu.fastcomments.com')
      .post('/oauth/token', (body) => {
        form = typeof body === 'string' ? body : new URLSearchParams(body).toString();
        return true;
      })
      .reply(200, { access_token: 'fcat_' + 'c'.repeat(64), token_type: 'bearer', expires_in: 3600, refresh_token: REFRESH_TOKEN, scope: 'read write' });

    const result = await appTester(refreshAccessToken, {
      authData: { ...authData, host: 'eu.fastcomments.com' },
    });
    const params = new URLSearchParams(form);
    assert.equal(params.get('grant_type'), 'refresh_token');
    assert.equal(params.get('refresh_token'), REFRESH_TOKEN);
    assert.equal(params.get('client_secret'), process.env.CLIENT_SECRET);
    assert.equal(result.refresh_token, REFRESH_TOKEN);
    assert.ok(result.access_token.startsWith('fcat_'));
  });

  it('tests the connection with /api/v1/me using the bearer token', async () => {
    nockApi().get('/api/v1/me').reply(200, { status: 'success', tenantId: 't1', tenantName: 'Acme Blog', authType: 'oauth', scopes: ['read', 'write'], userId: 'u1', username: 'devon' });
    const me = await appTester(test, { authData });
    assert.equal(me.tenantName, 'Acme Blog');
    assert.equal(me.authType, 'oauth');
  });

  it('labels the connection with the site name and the user', async () => {
    assert.equal(await appTester(connectionLabel, { inputData: { tenantName: 'Acme Blog', username: 'devon' } }), 'Acme Blog (devon)');
    assert.equal(await appTester(connectionLabel, { inputData: { tenantName: 'Acme Blog' } }), 'Acme Blog');
  });
});
