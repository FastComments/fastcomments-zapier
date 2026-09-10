import { defineCreate, defineInputFields } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { HASH_TAG_OUTPUT_FIELDS, HASH_TAG_SAMPLE } from '../samples/hash_tag.js';
import type { HashTagResponse, TenantHashTag, WithId } from '../types/api.js';
import { withId } from '../utils/normalize.js';
import { apiPost } from '../utils/request.js';

const inputFields = defineInputFields([
  { key: 'tag', label: 'Tag', type: 'string', required: true, helpText: 'Include the # prefix, for example #release.' },
  { key: 'url', label: 'URL', type: 'string', required: false, helpText: 'Where the tag links to when clicked in a comment.' },
]);

type InputData = {
  tag: string;
  url?: string;
};

export const perform = async (z: ZObject, bundle: Bundle<InputData>): Promise<WithId<TenantHashTag>> => {
  const data = await apiPost<HashTagResponse>(z, bundle, '/api/v1/hash-tags', {
    tag: bundle.inputData.tag,
    url: bundle.inputData.url,
  });
  return withId(data.hashTag);
};

export default defineCreate({
  key: 'create_hash_tag',
  noun: 'Hash Tag',
  display: {
    label: 'Create Hash Tag',
    description: 'Creates a hash tag that commenters can use.',
  },
  operation: {
    inputFields,
    perform,
    sample: HASH_TAG_SAMPLE,
    outputFields: HASH_TAG_OUTPUT_FIELDS,
  },
});
