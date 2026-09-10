import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nock from 'nock';
import { outputFields, perform, performList, performSubscribe, performUnsubscribe } from '../../triggers/new_comment.js';
import { WEBHOOK_COMMENT_SAMPLE } from '../../samples/comment.js';
import { WEBHOOK_COMMENT_FIXTURE, appTester, authData, isRecord, nockApi } from '../helpers.js';

const TARGET_URL = 'https://hooks.zapier.com/hooks/standard/1/abc/';

describe('new_comment trigger', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('subscribes the Zapier target URL to comment-created with POST', async () => {
    let body: unknown;
    nockApi()
      .post('/api/v1/webhooks', (sent) => {
        body = sent;
        return true;
      })
      .reply(200, { status: 'success', webhook: { id: 'wh_1', url: TARGET_URL, event: 'comment-created', domain: '*', method: 'POST', source: 'api', enabled: true, createdAt: '2026-09-08T12:00:00.000Z' } });

    const result = await appTester(performSubscribe, { authData, targetUrl: TARGET_URL, inputData: {} });
    assert.deepEqual(body, { url: TARGET_URL, event: 'comment-created', domain: '*', method: 'POST' });
    assert.equal(result.id, 'wh_1');
  });

  it('passes a chosen domain through to the subscription', async () => {
    let body: unknown;
    nockApi()
      .post('/api/v1/webhooks', (sent) => {
        body = sent;
        return true;
      })
      .reply(200, { status: 'success', webhook: { id: 'wh_2', url: TARGET_URL, event: 'comment-created', domain: 'example.com', method: 'POST', source: 'api', enabled: true, createdAt: '2026-09-08T12:00:00.000Z' } });
    await appTester(performSubscribe, { authData, targetUrl: TARGET_URL, inputData: { domain: 'example.com' } });
    assert.ok(isRecord(body));
    assert.equal(body.domain, 'example.com');
  });

  it('unsubscribes with the stored subscription id', async () => {
    const scope = nockApi().delete('/api/v1/webhooks/wh_1').reply(200, { status: 'success' });
    await appTester(performUnsubscribe, { authData, subscribeData: { id: 'wh_1' }, inputData: {} });
    assert.ok(scope.isDone());
  });

  it('turns a delivery into a one-item array', async () => {
    const result = await appTester(perform, { authData, inputData: {}, cleanedRequest: WEBHOOK_COMMENT_FIXTURE });
    assert.deepEqual(result, [WEBHOOK_COMMENT_FIXTURE]);
  });

  it('drops unapproved and spam comments unless asked to include them', async () => {
    const unapproved = { ...WEBHOOK_COMMENT_FIXTURE, approved: false };
    const spam = { ...WEBHOOK_COMMENT_FIXTURE, isSpam: true };
    assert.deepEqual(await appTester(perform, { authData, inputData: {}, cleanedRequest: unapproved }), []);
    assert.deepEqual(await appTester(perform, { authData, inputData: {}, cleanedRequest: spam }), []);
    assert.deepEqual(await appTester(perform, { authData, inputData: { include_unapproved: true }, cleanedRequest: unapproved }), [unapproved]);
  });

  it('ignores a delivery that is not a comment', async () => {
    assert.deepEqual(await appTester(perform, { authData, inputData: {}, cleanedRequest: { hello: 'world' } }), []);
  });

  it('loads samples from the server in the live payload shape and filters by domain', async () => {
    const other = { ...WEBHOOK_COMMENT_FIXTURE, id: 'cmt_live_2', domain: 'other.example.com' };
    nockApi()
      .get('/api/v1/webhooks/sample-payloads')
      .query({ event: 'comment-created', limit: '10' })
      .times(2)
      .reply(200, { status: 'success', payloads: [WEBHOOK_COMMENT_FIXTURE, other] });

    const all = await appTester(performList, { authData, inputData: {} });
    assert.deepEqual(all, [WEBHOOK_COMMENT_FIXTURE, other]);
    const filtered = await appTester(performList, { authData, inputData: { domain: 'other.example.com' } });
    assert.deepEqual(filtered, [other]);
  });

  it('keeps the static sample and output field keys a subset of the live payload keys', () => {
    const liveKeys = new Set(Object.keys(WEBHOOK_COMMENT_FIXTURE));
    for (const key of Object.keys(WEBHOOK_COMMENT_SAMPLE)) {
      assert.ok(liveKeys.has(key), `sample key ${key} is not in the live payload`);
    }
    for (const field of outputFields) {
      const key = field.key.replace(/\[\].*$/, '');
      assert.ok(liveKeys.has(key), `output field ${key} is not in the live payload`);
    }
  });
});
