import { defineCreate, defineInputFields } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { PAGE_OUTPUT_FIELDS, PAGE_SAMPLE } from '../samples/page.js';
import type { ApiPage, PageResponse } from '../types/api.js';
import { apiPost } from '../utils/request.js';

const inputFields = defineInputFields([
  { key: 'url_id', label: 'URL ID', type: 'string', required: true, helpText: 'The urlId the comment widget uses on the page.' },
  { key: 'title', label: 'Title', type: 'string', required: true },
  { key: 'url', label: 'URL', type: 'string', required: true },
  { key: 'accessible_by_group_ids', label: 'Accessible By Group IDs', type: 'string', required: false, list: true, helpText: 'Restrict the page to SSO users in these groups.' },
]);

type InputData = {
  url_id: string;
  title: string;
  url: string;
  accessible_by_group_ids?: string[];
};

export function firstPage(z: ZObject, page: ApiPage | ApiPage[] | null | undefined): ApiPage | null {
  if (Array.isArray(page)) {
    return page[0] ?? null;
  }
  return page ?? null;
}

export const perform = async (z: ZObject, bundle: Bundle<InputData>): Promise<ApiPage> => {
  const input = bundle.inputData;
  const data = await apiPost<PageResponse>(z, bundle, '/api/v1/pages', {
    urlId: input.url_id,
    title: input.title,
    url: input.url,
    accessibleByGroupIds: input.accessible_by_group_ids,
  });
  const page = firstPage(z, data.page);
  if (!page) {
    throw new z.errors.Error('FastComments did not return the created page.', 'empty-response', 500);
  }
  return page;
};

export default defineCreate({
  key: 'create_page',
  noun: 'Page',
  display: {
    label: 'Create Page',
    description: 'Creates a page record so it can be listed and restricted before any comment is posted.',
  },
  operation: {
    inputFields,
    perform,
    sample: PAGE_SAMPLE,
    outputFields: PAGE_OUTPUT_FIELDS,
  },
});
