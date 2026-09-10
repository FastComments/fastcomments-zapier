import { defineInputFields, defineTrigger } from 'zapier-platform-core';
import { COMMENT_OUTPUT_FIELDS, WEBHOOK_COMMENT_SAMPLE } from '../samples/comment.js';
import { domainInputField, listSamples, performHook, subscribeHook, unsubscribeHook } from '../utils/hooks.js';

const EVENT = 'comment-deleted';

export const performSubscribe = subscribeHook(EVENT);
export const performUnsubscribe = unsubscribeHook();
export const perform = performHook(false);
export const performList = listSamples(EVENT, false);

export default defineTrigger({
  key: 'deleted_comment',
  noun: 'Comment',
  display: {
    label: 'Deleted Comment',
    description: 'Triggers when a comment is deleted.',
  },
  operation: {
    type: 'hook',
    inputFields: defineInputFields([domainInputField]),
    performSubscribe,
    performUnsubscribe,
    perform,
    performList,
    sample: WEBHOOK_COMMENT_SAMPLE,
    outputFields: COMMENT_OUTPUT_FIELDS,
  },
});
