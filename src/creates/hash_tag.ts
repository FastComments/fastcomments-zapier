import { defineCreate, defineInputFields } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { HASH_TAG_OUTPUT_FIELDS, HASH_TAG_SAMPLE } from '../samples/hash_tag.js';
import type { HashTagResponse, TenantHashTag, WithId } from '../types/api.js';
import { withId } from '../utils/normalize.js';
import { apiPatch, apiPostUnlessExists } from '../utils/request.js';

const inputFields = defineInputFields([
  { key: 'tag', label: 'Tag', type: 'string', required: true, helpText: 'Include the # prefix, for example #release. If the tag already exists, it is updated instead.' },
  { key: 'url', label: 'URL', type: 'string', required: false, helpText: 'Where the tag links to when clicked in a comment.' },
]);

type InputData = {
  tag: string;
  url?: string;
};

export const perform = async (z: ZObject, bundle: Bundle<InputData>): Promise<WithId<TenantHashTag>> => {
  const { tag, url } = bundle.inputData;
  const created = await apiPostUnlessExists<HashTagResponse>(z, bundle, '/api/v1/hash-tags', { tag, url }, ['already-exists']);
  if (created) {
    return withId(created.hashTag);
  }
  // Tags are unique per account; a repeated run updates the existing one. Sending the tag itself keeps the
  // request non-empty when no URL was given.
  const updated = await apiPatch<HashTagResponse>(z, bundle, `/api/v1/hash-tags/${encodeURIComponent(tag)}`, { tag, url });
  return withId(updated.hashTag);
};

export default defineCreate({
  key: 'create_hash_tag',
  noun: 'Hash Tag',
  display: {
    label: 'Create or Update Hash Tag',
    description: 'Creates a hash tag that commenters can use, or updates the existing tag.',
  },
  operation: {
    inputFields,
    perform,
    sample: HASH_TAG_SAMPLE,
    outputFields: HASH_TAG_OUTPUT_FIELDS,
  },
});
