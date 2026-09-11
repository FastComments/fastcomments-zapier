import { defineCreate, defineInputFields } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { PAGE_OUTPUT_FIELDS, PAGE_SAMPLE } from '../samples/page.js';
import type { ApiPage, PageResponse } from '../types/api.js';
import { apiGetOrNull, apiPatch, apiPostUnlessExists } from '../utils/request.js';

const inputFields = defineInputFields([
  { key: 'url_id', label: 'URL ID', type: 'string', required: true, helpText: 'The urlId the comment widget uses on the page. If a page with this urlId already exists, it is updated instead.' },
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
  const fields = {
    title: input.title,
    url: input.url,
    accessibleByGroupIds: input.accessible_by_group_ids,
  };
  const created = await apiPostUnlessExists<PageResponse>(z, bundle, '/api/v1/pages', { urlId: input.url_id, ...fields }, ['already-exists']);
  if (created) {
    const page = firstPage(z, created.page);
    if (!page) {
      throw new z.errors.Error('FastComments did not return the created page.', 'empty-response', 500);
    }
    return page;
  }
  // The urlId is taken: update that page with the fields given, so a repeated run never fails.
  const existing = await apiGetOrNull<PageResponse>(z, bundle, '/api/v1/pages/by-url-id', { urlId: input.url_id });
  const existingPage = existing ? firstPage(z, existing.page) : null;
  if (!existingPage) {
    throw new z.errors.Error(`A page with URL ID ${input.url_id} exists but could not be loaded.`, 'not-found', 404);
  }
  const updated = await apiPatch<PageResponse>(z, bundle, `/api/v1/pages/${encodeURIComponent(existingPage.id)}`, fields);
  return firstPage(z, updated.page) ?? existingPage;
};

export default defineCreate({
  key: 'create_page',
  noun: 'Page',
  display: {
    label: 'Create or Update Page',
    description: 'Creates a page record, or updates the existing page with the same URL ID.',
  },
  operation: {
    inputFields,
    perform,
    sample: PAGE_SAMPLE,
    outputFields: PAGE_OUTPUT_FIELDS,
  },
});
