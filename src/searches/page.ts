import { defineInputFields, defineSearch } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { firstPage } from '../creates/page.js';
import { PAGE_OUTPUT_FIELDS, PAGE_SAMPLE } from '../samples/page.js';
import type { ApiPage, PageResponse } from '../types/api.js';
import { apiGetOrNull } from '../utils/request.js';

const inputFields = defineInputFields([
  { key: 'url_id', label: 'URL ID', type: 'string', required: true, helpText: 'The urlId the comment widget uses on the page.' },
]);

type InputData = {
  url_id: string;
};

export const perform = async (z: ZObject, bundle: Bundle<InputData>): Promise<ApiPage[]> => {
  const data = await apiGetOrNull<PageResponse>(z, bundle, '/api/v1/pages/by-url-id', { urlId: bundle.inputData.url_id });
  const page = data ? firstPage(z, data.page) : null;
  return page ? [page] : [];
};

export default defineSearch({
  key: 'find_page',
  noun: 'Page',
  display: {
    label: 'Find Page',
    description: 'Finds a page by its URL ID.',
  },
  operation: {
    inputFields,
    perform,
    sample: PAGE_SAMPLE,
    outputFields: PAGE_OUTPUT_FIELDS,
  },
});
