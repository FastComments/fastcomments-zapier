import { defineCreate, defineInputFields } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { SSO_USER_OUTPUT_FIELDS, SSO_USER_SAMPLE } from '../samples/sso_user.js';
import type { ApiSSOUserOutput, SSOUserResponse } from '../types/api.js';
import { normalizeSSOUser } from '../utils/normalize.js';
import { apiPost } from '../utils/request.js';

// Admin flags (isAdminAdmin, isCommentModeratorAdmin, isAccountOwner) are left out on purpose: a Zap must not be
// able to escalate privileges.
const inputFields = defineInputFields([
  { key: 'id', label: 'User ID', type: 'string', required: true, helpText: 'Your own id for the user. Creating the same id twice fails.' },
  { key: 'username', label: 'Username', type: 'string', required: true },
  { key: 'email', label: 'Email', type: 'string', required: true },
  { key: 'display_name', label: 'Display Name', type: 'string', required: false },
  { key: 'display_label', label: 'Display Label', type: 'string', required: false, helpText: 'Shown next to the name, for example VIP.' },
  { key: 'avatar_src', label: 'Avatar URL', type: 'string', required: false },
  { key: 'website_url', label: 'Website URL', type: 'string', required: false },
  { key: 'group_ids', label: 'Group IDs', type: 'string', required: false, list: true },
  { key: 'opted_in_notifications', label: 'Opted In To Notifications', type: 'boolean', required: false },
  { key: 'is_profile_activity_private', label: 'Private Profile Activity', type: 'boolean', required: false },
]);

type InputData = {
  id: string;
  username: string;
  email: string;
  display_name?: string;
  display_label?: string;
  avatar_src?: string;
  website_url?: string;
  group_ids?: string[];
  opted_in_notifications?: boolean;
  is_profile_activity_private?: boolean;
};

export const perform = async (z: ZObject, bundle: Bundle<InputData>): Promise<ApiSSOUserOutput> => {
  const input = bundle.inputData;
  const data = await apiPost<SSOUserResponse>(z, bundle, '/api/v1/sso-users', {
    id: input.id,
    username: input.username,
    email: input.email,
    displayName: input.display_name,
    displayLabel: input.display_label,
    avatarSrc: input.avatar_src,
    websiteUrl: input.website_url,
    groupIds: input.group_ids,
    optedInNotifications: input.opted_in_notifications,
    isProfileActivityPrivate: input.is_profile_activity_private,
  });
  if (!data.user) {
    throw new z.errors.Error('FastComments did not return the created user.', 'empty-response', 500);
  }
  return normalizeSSOUser(data.user);
};

export default defineCreate({
  key: 'create_sso_user',
  noun: 'SSO User',
  display: {
    label: 'Create SSO User',
    description: 'Creates a single sign-on user so they can comment under your own identity system.',
  },
  operation: {
    inputFields,
    perform,
    sample: SSO_USER_SAMPLE,
    outputFields: SSO_USER_OUTPUT_FIELDS,
  },
});
