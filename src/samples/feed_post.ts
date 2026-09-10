import type { PlainOutputField } from 'zapier-platform-core';
import type { FeedPost, WithId } from '../types/api.js';

export const FEED_POST_SAMPLE: WithId<FeedPost> = {
  id: '66f1c4c1e7a2b3d4f5a6b7d0',
  tenantId: 'abc123',
  title: 'Product update',
  contentHTML: '<p>We shipped a new release today.</p>',
  fromUserId: 'user-1042',
  fromUserDisplayName: 'Jane Reader',
  tags: ['release'],
  links: [],
  media: [],
  createdAt: '2026-09-08T12:00:00.000Z',
  commentCount: 0,
};

export const FEED_POST_OUTPUT_FIELDS: PlainOutputField[] = [
  { key: 'id', label: 'Post ID', type: 'string' },
  { key: 'tenantId', label: 'Tenant ID', type: 'string' },
  { key: 'title', label: 'Title', type: 'string' },
  { key: 'contentHTML', label: 'Content (HTML)', type: 'string' },
  { key: 'fromUserId', label: 'Author User ID', type: 'string' },
  { key: 'fromUserDisplayName', label: 'Author Display Name', type: 'string' },
  { key: 'tags', label: 'Tags', type: 'string', list: true },
  { key: 'createdAt', label: 'Created At', type: 'datetime' },
  { key: 'commentCount', label: 'Comment Count', type: 'integer' },
];
