import { defineCreate, defineInputFields } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { LOCALES } from '../constants.js';
import { API_COMMENT_OUTPUT_FIELDS, API_COMMENT_SAMPLE } from '../samples/comment.js';
import type { ApiCommentOutput, CommentResponse } from '../types/api.js';
import { normalizeComment, toEpochMillis } from '../utils/normalize.js';
import { apiPost } from '../utils/request.js';

const inputFields = defineInputFields([
  { key: 'url_id', label: 'Page URL ID', type: 'string', required: true, helpText: 'The urlId the comment widget uses on the page. Comments are grouped by it.' },
  { key: 'url', label: 'Page URL', type: 'string', required: true, helpText: 'The full URL of the page, used in notification emails.' },
  { key: 'comment', label: 'Comment', type: 'text', required: true, helpText: 'The comment body in FastComments markdown.' },
  { key: 'commenter_name', label: 'Commenter Name', type: 'string', required: true, helpText: 'Reusing a name with a different email than before fails, since names are unique per email.' },
  { key: 'commenter_email', label: 'Commenter Email', type: 'string', required: false, helpText: 'A user is created for this email when it does not exist yet.' },
  { key: 'user_id', label: 'User ID', type: 'string', required: false, helpText: 'An existing SSO user id. Takes precedence over the name and email.' },
  { key: 'parent_id', label: 'Parent Comment ID', type: 'string', required: false, helpText: 'Set to post a reply.' },
  { key: 'approved', label: 'Approved', type: 'boolean', required: false, default: 'true', helpText: 'Unapproved comments stay hidden until a moderator approves them.' },
  { key: 'verified', label: 'Verified', type: 'boolean', required: false, default: 'true' },
  { key: 'date', label: 'Posted At', type: 'datetime', required: false, helpText: 'Defaults to now.' },
  { key: 'avatar_src', label: 'Avatar URL', type: 'string', required: false },
  { key: 'page_title', label: 'Page Title', type: 'string', required: false },
  { key: 'locale', label: 'Locale', type: 'string', required: false, default: 'en_us', choices: [...LOCALES] },
  { key: 'is_live', label: 'Show Live In Widget', type: 'boolean', required: false, default: 'false', helpText: 'Pushes the comment to viewers in real time. Costs 2 API credits instead of 1.' },
  { key: 'do_spam_check', label: 'Run Spam Check', type: 'boolean', required: false, default: 'false' },
  { key: 'send_emails', label: 'Send Emails', type: 'boolean', required: false, default: 'false', helpText: 'Sends the welcome and verification emails a widget comment would send.' },
]);

type InputData = {
  url_id: string;
  url: string;
  comment: string;
  commenter_name: string;
  commenter_email?: string;
  user_id?: string;
  parent_id?: string;
  approved?: boolean;
  verified?: boolean;
  date?: string;
  avatar_src?: string;
  page_title?: string;
  locale?: string;
  is_live?: boolean;
  do_spam_check?: boolean;
  send_emails?: boolean;
};

export const perform = async (z: ZObject, bundle: Bundle<InputData>): Promise<ApiCommentOutput> => {
  const input = bundle.inputData;
  const data = await apiPost<CommentResponse>(z, bundle, '/api/v1/comments', {
    urlId: input.url_id,
    url: input.url,
    comment: input.comment,
    commenterName: input.commenter_name,
    commenterEmail: input.commenter_email,
    userId: input.user_id,
    parentId: input.parent_id,
    approved: input.approved ?? true,
    verified: input.verified ?? true,
    date: toEpochMillis(input.date),
    avatarSrc: input.avatar_src,
    pageTitle: input.page_title,
    locale: input.locale || 'en_us',
  }, {
    isLive: input.is_live ?? false,
    doSpamCheck: input.do_spam_check ?? false,
    sendEmails: input.send_emails ?? false,
  });
  return normalizeComment(data.comment);
};

export default defineCreate({
  key: 'create_comment',
  noun: 'Comment',
  display: {
    label: 'Create Comment',
    description: 'Creates a new comment on a page.',
  },
  operation: {
    inputFields,
    perform,
    sample: API_COMMENT_SAMPLE,
    outputFields: API_COMMENT_OUTPUT_FIELDS,
  },
});
