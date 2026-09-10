import { defineInputFields, defineSearch } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { API_COMMENT_OUTPUT_FIELDS, API_COMMENT_SAMPLE } from '../samples/comment.js';
import type { ApiCommentOutput, CommentResponse } from '../types/api.js';
import { normalizeComment } from '../utils/normalize.js';
import { apiGetOrNull } from '../utils/request.js';

const inputFields = defineInputFields([
  { key: 'comment_id', label: 'Comment ID', type: 'string', required: true },
]);

type InputData = {
  comment_id: string;
};

export const perform = async (z: ZObject, bundle: Bundle<InputData>): Promise<ApiCommentOutput[]> => {
  const data = await apiGetOrNull<CommentResponse>(z, bundle, `/api/v1/comments/${encodeURIComponent(bundle.inputData.comment_id)}`);
  return data ? [normalizeComment(data.comment)] : [];
};

export default defineSearch({
  key: 'find_comment',
  noun: 'Comment',
  display: {
    label: 'Find Comment',
    description: 'Finds a comment by its id.',
  },
  operation: {
    inputFields,
    perform,
    sample: API_COMMENT_SAMPLE,
    outputFields: API_COMMENT_OUTPUT_FIELDS,
  },
});
