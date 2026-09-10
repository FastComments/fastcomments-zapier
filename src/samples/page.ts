import type { PlainOutputField } from 'zapier-platform-core';
import type { ApiPage } from '../types/api.js';

export const PAGE_SAMPLE: ApiPage = {
  id: '66f1c4c1e7a2b3d4f5a6b7c9',
  urlId: 'https://example.com/blog/hello-world',
  title: 'Hello World',
  url: 'https://example.com/blog/hello-world',
  createdAt: '2026-09-08T12:00:00.000Z',
  commentCount: 0,
  rootCommentCount: 0,
  isClosed: false,
  accessibleByGroupIds: [],
};

export const PAGE_OUTPUT_FIELDS: PlainOutputField[] = [
  { key: 'id', label: 'Page ID', type: 'string' },
  { key: 'urlId', label: 'URL ID', type: 'string' },
  { key: 'title', label: 'Title', type: 'string' },
  { key: 'url', label: 'URL', type: 'string' },
  { key: 'createdAt', label: 'Created At', type: 'datetime' },
  { key: 'commentCount', label: 'Comment Count', type: 'integer' },
  { key: 'rootCommentCount', label: 'Root Comment Count', type: 'integer' },
  { key: 'isClosed', label: 'Comments Closed', type: 'boolean' },
  { key: 'accessibleByGroupIds', label: 'Accessible By Group IDs', type: 'string', list: true },
];
