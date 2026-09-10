import type { PlainOutputField } from 'zapier-platform-core';
import type { TenantHashTag, WithId } from '../types/api.js';

export const HASH_TAG_SAMPLE: WithId<TenantHashTag> = {
  id: '66f1c4c1e7a2b3d4f5a6b7d1',
  tenantId: 'abc123',
  tag: '#release',
  url: 'https://example.com/tags/release',
  createdAt: '2026-09-08T12:00:00.000Z',
};

export const HASH_TAG_OUTPUT_FIELDS: PlainOutputField[] = [
  { key: 'id', label: 'Hash Tag ID', type: 'string' },
  { key: 'tenantId', label: 'Tenant ID', type: 'string' },
  { key: 'tag', label: 'Tag', type: 'string' },
  { key: 'url', label: 'URL', type: 'string' },
  { key: 'createdAt', label: 'Created At', type: 'datetime' },
];
