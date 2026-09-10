// Live lane: calls a real FastComments server. Skipped unless FC_ZAPIER_LIVE_BASE_URL and
// FC_ZAPIER_LIVE_REFRESH_TOKEN (plus CLIENT_ID / CLIENT_SECRET) are set. First-party refresh tokens on
// FastComments do not rotate, so the stored token keeps working across runs.
import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import zapier from 'zapier-platform-core';
import App from '../../index.js';
import { refreshAccessToken, test as testAuth } from '../../authentication.js';
import { perform as createPage } from '../../creates/page.js';
import { perform as createComment } from '../../creates/comment.js';
import { perform as flagComment } from '../../creates/flag_comment.js';
import { perform as findPage } from '../../searches/page.js';
import { perform as findComment } from '../../searches/comment.js';
import { performList, performSubscribe, performUnsubscribe } from '../../triggers/new_comment.js';

const baseUrl = process.env.FC_ZAPIER_LIVE_BASE_URL;
const refreshToken = process.env.FC_ZAPIER_LIVE_REFRESH_TOKEN;
const enabled = !!baseUrl && !!refreshToken && !!process.env.CLIENT_ID && !!process.env.CLIENT_SECRET;

const appTester = zapier.createAppTester(App);
const host = baseUrl ? new URL(baseUrl).host : 'fastcomments.com';
const suffix = Date.now().toString(36);
const urlId = `zapier-live-${suffix}`;

let authData: Record<string, string> = {};

describe('live FastComments server', { skip: enabled ? false : 'set FC_ZAPIER_LIVE_BASE_URL and FC_ZAPIER_LIVE_REFRESH_TOKEN to run' }, () => {
  before(async () => {
    const tokens = await appTester(refreshAccessToken, { authData: { refresh_token: refreshToken ?? '', host } });
    authData = { access_token: tokens.access_token, refresh_token: refreshToken ?? '', host };
  });

  it('identifies the connection', async () => {
    const me = await appTester(testAuth, { authData });
    assert.equal(me.status, 'success');
    assert.equal(me.authType, 'oauth');
    assert.ok(me.tenantName.length > 0);
  });

  it('creates a page, finds it, comments on it, finds and flags the comment', async () => {
    const missing = await appTester(findPage, { authData, inputData: { url_id: urlId } });
    assert.deepEqual(missing, []);

    const page = await appTester(createPage, {
      authData,
      inputData: { url_id: urlId, title: 'Zapier live test', url: `https://example.com/${urlId}` },
    });
    assert.equal(page.urlId, urlId);
    assert.ok(!Number.isNaN(Date.parse(page.createdAt)));

    const found = await appTester(findPage, { authData, inputData: { url_id: urlId } });
    assert.equal(found.length, 1);
    assert.equal(found[0]?.id, page.id);

    const comment = await appTester(createComment, {
      authData,
      inputData: {
        url_id: urlId,
        url: `https://example.com/${urlId}`,
        comment: 'Posted from the Zapier live test.',
        commenter_name: `Zapier Tester ${suffix}`,
        commenter_email: `zapier-live-${suffix}@fctest.com`,
      },
    });
    assert.ok(typeof comment.id === 'string');
    assert.ok(typeof comment.date === 'string' && !Number.isNaN(Date.parse(comment.date)));

    const foundComment = await appTester(findComment, { authData, inputData: { comment_id: comment.id } });
    assert.equal(foundComment.length, 1);
    assert.equal(foundComment[0]?.id, comment.id);

    const flagged = await appTester(flagComment, { authData, inputData: { comment_id: comment.id } });
    assert.equal(flagged.id, comment.id);
  });

  it('subscribes, lists samples in the live shape, and unsubscribes', async () => {
    const targetUrl = `https://example.invalid/zapier-live/${suffix}`;
    const webhook = await appTester(performSubscribe, { authData, targetUrl, inputData: {} });
    assert.equal(webhook.url, targetUrl);
    assert.equal(webhook.source, 'api');

    const samples = await appTester(performList, { authData, inputData: { include_unapproved: true } });
    assert.ok(samples.length > 0);
    assert.ok(typeof samples[0]?.id === 'string');
    assert.ok(typeof samples[0]?.date === 'string');

    const removed = await appTester(performUnsubscribe, { authData, subscribeData: { id: webhook.id }, inputData: {} });
    assert.equal(removed.status, 'success');
  });
});
