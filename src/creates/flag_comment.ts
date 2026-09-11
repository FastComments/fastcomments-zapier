import { defineCreate, defineInputFields } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import type { FlagCommentResponse } from '../types/api.js';
import { apiPost } from '../utils/request.js';

// Anonymous flagging is off for most accounts, so the flagging user is enforced in perform rather than falling back
// to an anonymous id the API would reject. It stays optional in the schema because Zapier forbids turning a field
// required for existing Zaps (C006).
const inputFields = defineInputFields([
  { key: 'comment_id', label: 'Comment ID', type: 'string', required: true },
  { key: 'user_id', label: 'Flagging User ID', type: 'string', required: false, helpText: 'Required. The FastComments or SSO user doing the flagging, for example the author id returned by Create Comment.' },
]);

type InputData = {
  comment_id: string;
  user_id?: string;
};

type FlagResult = {
  id: string;
  wasUnapproved: boolean;
};

export const perform = async (z: ZObject, bundle: Bundle<InputData>): Promise<FlagResult> => {
  const input = bundle.inputData;
  if (!input.user_id) {
    throw new z.errors.Error('Flagging User ID is required: anonymous flagging is off for this account.', 'missing-user-id', 422);
  }
  const data = await apiPost<FlagCommentResponse>(z, bundle, `/api/v1/comments/${encodeURIComponent(input.comment_id)}/flag`, {}, {
    userId: input.user_id,
  });
  return { id: input.comment_id, wasUnapproved: data.wasUnapproved === true };
};

export default defineCreate({
  key: 'flag_comment',
  noun: 'Comment',
  display: {
    label: 'Flag Comment',
    description: 'Flags a comment for moderator review.',
  },
  operation: {
    inputFields,
    perform,
    sample: { id: '66f1c4c1e7a2b3d4f5a6b7c8', wasUnapproved: false },
    outputFields: [
      { key: 'id', label: 'Comment ID', type: 'string' },
      { key: 'wasUnapproved', label: 'Was Unapproved By The Flag', type: 'boolean' },
    ],
  },
});
