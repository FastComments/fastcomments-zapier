import type { PlainOutputField } from 'zapier-platform-core';
import type { ApiSSOUserOutput } from '../types/api.js';

export const SSO_USER_SAMPLE: ApiSSOUserOutput = {
  id: 'user-1042',
  username: 'jane',
  email: 'jane@example.com',
  displayName: 'Jane Reader',
  displayLabel: 'Member',
  avatarSrc: 'https://example.com/avatars/jane.png',
  websiteUrl: 'https://example.com',
  signUpDate: '2026-09-08T12:00:00.000Z',
  loginCount: 1,
  optedInNotifications: true,
  optedInSubscriptionNotifications: true,
  groupIds: [],
};

export const SSO_USER_OUTPUT_FIELDS: PlainOutputField[] = [
  { key: 'id', label: 'User ID', type: 'string' },
  { key: 'username', label: 'Username', type: 'string' },
  { key: 'email', label: 'Email', type: 'string' },
  { key: 'displayName', label: 'Display Name', type: 'string' },
  { key: 'displayLabel', label: 'Display Label', type: 'string' },
  { key: 'avatarSrc', label: 'Avatar URL', type: 'string' },
  { key: 'websiteUrl', label: 'Website URL', type: 'string' },
  { key: 'signUpDate', label: 'Signed Up At', type: 'datetime' },
  { key: 'loginCount', label: 'Login Count', type: 'integer' },
  { key: 'optedInNotifications', label: 'Opted In To Notifications', type: 'boolean' },
  { key: 'optedInSubscriptionNotifications', label: 'Opted In To Subscription Notifications', type: 'boolean' },
  { key: 'groupIds', label: 'Group IDs', type: 'string', list: true },
];
