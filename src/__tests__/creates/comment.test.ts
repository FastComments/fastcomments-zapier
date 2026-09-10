import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nock from 'nock';
import { perform } from '../../creates/comment.js';
import { appTester, authData, isRecord, nockApi } from '../helpers.js';

describe('create_comment', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('maps the inputs to the API body and query flags and normalizes the dates', async () => {
    let body: unknown;
    nockApi()
      .post('/api/v1/comments', (sent) => {
        body = sent;
        return true;
      })
      .query({ isLive: 'true', doSpamCheck: 'false', sendEmails: 'false' })
      .reply(200, {
        status: 'success',
        comment: { id: 'cmt_1', urlId: 'post-1', url: 'https://example.com/post-1', commenterName: 'Jane', comment: 'Hi', commentHTML: '<p>Hi</p>', date: 1757332800000, verifiedDate: 1757332800000, votes: 0, verified: true, approved: true, locale: 'en_us' },
        user: null,
      });

    const result = await appTester(perform, {
      authData,
      inputData: {
        url_id: 'post-1',
        url: 'https://example.com/post-1',
        comment: 'Hi',
        commenter_name: 'Jane',
        commenter_email: 'jane@example.com',
        date: '2025-09-08T12:00:00.000Z',
        is_live: true,
      },
    });

    assert.ok(isRecord(body));
    assert.equal(body.urlId, 'post-1');
    assert.equal(body.commenterName, 'Jane');
    assert.equal(body.commenterEmail, 'jane@example.com');
    assert.equal(body.approved, true);
    assert.equal(body.verified, true);
    assert.equal(body.locale, 'en_us');
    assert.equal(body.date, Date.parse('2025-09-08T12:00:00.000Z'));
    assert.equal('userId' in body, false, 'empty optional inputs are not sent');

    assert.equal(result.id, 'cmt_1');
    assert.equal(result.date, '2025-09-08T12:00:00.000Z');
    assert.equal(result.verifiedDate, '2025-09-08T12:00:00.000Z');
  });
});
