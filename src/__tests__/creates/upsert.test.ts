import { afterEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import nock from 'nock';
import App from '../../index.js';
import { perform as createSSOUser } from '../../creates/sso_user.js';
import { perform as createPage } from '../../creates/page.js';
import { perform as createHashTag } from '../../creates/hash_tag.js';
import { appTester, authData, failure, isRecord, nockApi } from '../helpers.js';

describe('create-or-update semantics', () => {
  afterEach(() => {
    nock.cleanAll();
  });

  it('updates an SSO user whose id already exists', async () => {
    let patched: unknown;
    nockApi().post('/api/v1/sso-users').reply(422, failure('user-exists', 'A user already exists for id=[user-1]'));
    nockApi()
      .patch('/api/v1/sso-users/user-1', (sent) => {
        patched = sent;
        return true;
      })
      .reply(200, { status: 'success', user: { id: 'user-1', username: 'jane', email: 'jane@example.com', signUpDate: 1757332800000 } });

    const result = await appTester(createSSOUser, { authData, inputData: { id: 'user-1', username: 'jane', email: 'jane@example.com', display_name: 'Jane' } });
    assert.ok(isRecord(patched));
    assert.equal(patched.username, 'jane');
    assert.equal(patched.displayName, 'Jane');
    assert.equal('id' in patched, false, 'the id is in the path, not the body');
    assert.equal(result.id, 'user-1');
    assert.equal(result.signUpDate, '2025-09-08T12:00:00.000Z');
  });

  it('still surfaces other SSO user failures', async () => {
    nockApi().post('/api/v1/sso-users').reply(422, failure('invalid-email', 'Email is not valid.'));
    await assert.rejects(
      appTester(createSSOUser, { authData, inputData: { id: 'user-1', username: 'jane', email: 'nope' } }),
      (error: unknown) => error instanceof Error && error.message.includes('Email is not valid.'),
    );
  });

  it('updates a page whose urlId already exists', async () => {
    let patched: unknown;
    nockApi().post('/api/v1/pages').reply(409, failure('already-exists', 'A page with urlId [post-1] already exists.'));
    nockApi().get('/api/v1/pages/by-url-id').query({ urlId: 'post-1' }).reply(200, {
      status: 'success',
      page: { id: 'page-1', urlId: 'post-1', title: 'Old', url: 'https://example.com/old', createdAt: '2026-09-08T12:00:00.000Z', commentCount: 3, rootCommentCount: 2 },
    });
    nockApi()
      .patch('/api/v1/pages/page-1', (sent) => {
        patched = sent;
        return true;
      })
      .reply(200, {
        status: 'success',
        page: { id: 'page-1', urlId: 'post-1', title: 'New', url: 'https://example.com/new', createdAt: '2026-09-08T12:00:00.000Z', commentCount: 3, rootCommentCount: 2 },
      });

    const result = await appTester(createPage, { authData, inputData: { url_id: 'post-1', title: 'New', url: 'https://example.com/new' } });
    assert.ok(isRecord(patched));
    assert.equal(patched.title, 'New');
    assert.equal(patched.url, 'https://example.com/new');
    assert.equal(result.id, 'page-1');
    assert.equal(result.title, 'New');
  });

  it('updates a hash tag that already exists, sending the tag so the body is never empty', async () => {
    let patched: unknown;
    nockApi().post('/api/v1/hash-tags').reply(422, failure('already-exists', 'The hash tag #zap already exists.'));
    nockApi()
      .patch('/api/v1/hash-tags/%23zap', (sent) => {
        patched = sent;
        return true;
      })
      .reply(200, { status: 'success', hashTag: { _id: 'tag-1', tenantId: 't1', tag: '#zap', createdAt: '2026-09-08T12:00:00.000Z' } });

    const result = await appTester(createHashTag, { authData, inputData: { tag: '#zap' } });
    assert.deepEqual(patched, { tag: '#zap' });
    assert.equal(result.id, 'tag-1');
    assert.equal(result.tag, '#zap');
  });

  it('declares find-or-create pairings for SSO users and pages', () => {
    const pairings = App.searchOrCreates ?? {};
    assert.equal(pairings.find_sso_user?.create, 'create_sso_user');
    assert.equal(pairings.find_page?.create, 'create_page');
  });
});
