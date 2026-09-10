import { defineInputFields, defineTrigger } from 'zapier-platform-core';
import { COMMENT_OUTPUT_FIELDS, WEBHOOK_COMMENT_SAMPLE } from '../samples/comment.js';
import { domainInputField, includeUnapprovedInputField, listSamples, performHook, subscribeHook, unsubscribeHook } from '../utils/hooks.js';

const EVENT = 'comment-created';

export const performSubscribe = subscribeHook(EVENT);
export const performUnsubscribe = unsubscribeHook();
export const perform = performHook(true);
export const performList = listSamples(EVENT, true);
export const outputFields = COMMENT_OUTPUT_FIELDS;

export default defineTrigger({
  key: 'new_comment',
  noun: 'Comment',
  display: {
    label: 'New Comment',
    description: 'Triggers when a new comment is posted.',
  },
  operation: {
    type: 'hook',
    inputFields: defineInputFields([domainInputField, includeUnapprovedInputField]),
    performSubscribe,
    performUnsubscribe,
    perform,
    performList,
    sample: WEBHOOK_COMMENT_SAMPLE,
    outputFields,
  },
});
