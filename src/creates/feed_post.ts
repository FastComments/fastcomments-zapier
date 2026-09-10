import { defineCreate, defineInputFields } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { FEED_POST_OUTPUT_FIELDS, FEED_POST_SAMPLE } from '../samples/feed_post.js';
import type { FeedPost, FeedPostResponse, WithId } from '../types/api.js';
import { withId } from '../utils/normalize.js';
import { apiPost } from '../utils/request.js';

const inputFields = defineInputFields([
  { key: 'content_html', label: 'Content (HTML)', type: 'text', required: true },
  { key: 'title', label: 'Title', type: 'string', required: false },
  { key: 'from_user_id', label: 'Author User ID', type: 'string', required: false },
  { key: 'from_user_display_name', label: 'Author Display Name', type: 'string', required: false },
  { key: 'tags', label: 'Tags', type: 'string', required: false, list: true },
  { key: 'link_url', label: 'Link URL', type: 'string', required: false, helpText: 'Attach one link preview to the post.' },
  { key: 'link_title', label: 'Link Title', type: 'string', required: false },
  { key: 'link_description', label: 'Link Description', type: 'string', required: false },
  { key: 'is_live', label: 'Show Live In Feed', type: 'boolean', required: false, default: 'false' },
  { key: 'do_spam_check', label: 'Run Spam Check', type: 'boolean', required: false, default: 'false' },
]);

type InputData = {
  content_html: string;
  title?: string;
  from_user_id?: string;
  from_user_display_name?: string;
  tags?: string[];
  link_url?: string;
  link_title?: string;
  link_description?: string;
  is_live?: boolean;
  do_spam_check?: boolean;
};

export const perform = async (z: ZObject, bundle: Bundle<InputData>): Promise<WithId<FeedPost>> => {
  const input = bundle.inputData;
  const links = input.link_url ? [{ url: input.link_url, title: input.link_title, description: input.link_description }] : undefined;
  const data = await apiPost<FeedPostResponse>(z, bundle, '/api/v1/feed-posts', {
    contentHTML: input.content_html,
    title: input.title,
    fromUserId: input.from_user_id,
    fromUserDisplayName: input.from_user_display_name,
    tags: input.tags,
    links,
  }, {
    isLive: input.is_live ?? false,
    doSpamCheck: input.do_spam_check ?? false,
  });
  return withId(data.feedPost);
};

export default defineCreate({
  key: 'create_feed_post',
  noun: 'Feed Post',
  display: {
    label: 'Create Feed Post',
    description: 'Creates a post in a FastComments feed.',
  },
  operation: {
    inputFields,
    perform,
    sample: FEED_POST_SAMPLE,
    outputFields: FEED_POST_OUTPUT_FIELDS,
  },
});
