import nock from 'nock';
import zapier from 'zapier-platform-core';
import App from '../index.js';
import type { WebhookComment } from '../types/webhook.js';

process.env.CLIENT_ID = process.env.CLIENT_ID || 'zapier-test-client';
process.env.CLIENT_SECRET = process.env.CLIENT_SECRET || 'zapier-test-secret';

export const appTester = zapier.createAppTester(App);
export { App };

export const BASE_URL = 'https://fastcomments.com';
export const ACCESS_TOKEN = 'fcat_' + 'a'.repeat(64);
export const REFRESH_TOKEN = 'fcrt_' + 'b'.repeat(64);

export const authData = {
  access_token: ACCESS_TOKEN,
  refresh_token: REFRESH_TOKEN,
  host: 'fastcomments.com',
};

export function nockApi(): nock.Scope {
  return nock(BASE_URL).matchHeader('authorization', `Bearer ${ACCESS_TOKEN}`);
}

export function nockOAuth(): nock.Scope {
  return nock(BASE_URL);
}

export function failure(code: string, reason: string): { status: 'failed'; code: string; reason: string } {
  return { status: 'failed', code, reason };
}

export const WEBHOOK_COMMENT_FIXTURE: WebhookComment = {
  id: 'cmt_live_1',
  urlId: 'https://example.com/blog/hello-world',
  url: 'https://example.com/blog/hello-world',
  userId: 'usr_1',
  commenterEmail: 'reader@example.com',
  commenterName: 'Jane Reader',
  comment: 'Great article, thanks for sharing!',
  commentHTML: '<p>Great article, thanks for sharing!</p>',
  externalId: 'wp-1',
  parentId: null,
  date: '2026-09-08T12:00:00.000Z',
  votes: 1,
  votesUp: 1,
  votesDown: 0,
  verified: true,
  verifiedDate: '2026-09-08T12:00:00.000Z',
  reviewed: false,
  avatarSrc: null,
  isSpam: false,
  aiDeterminedSpam: false,
  hasImages: false,
  pageNumber: 0,
  pageNumberOF: 0,
  pageNumberNF: 0,
  approved: true,
  locale: 'en_us',
  mentions: [],
  domain: 'example.com',
  moderationGroupIds: [],
};

export function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function errorName(error: unknown): string {
  return error instanceof Error ? error.name : '';
}
