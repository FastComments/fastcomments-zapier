import { defineInputFields, defineSearch } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { SSO_USER_OUTPUT_FIELDS, SSO_USER_SAMPLE } from '../samples/sso_user.js';
import type { ApiSSOUserOutput, SSOUserResponse } from '../types/api.js';
import { normalizeSSOUser } from '../utils/normalize.js';
import { apiGetOrNull } from '../utils/request.js';

const inputFields = defineInputFields([
  { key: 'email', label: 'Email', type: 'string', required: true },
]);

type InputData = {
  email: string;
};

export const perform = async (z: ZObject, bundle: Bundle<InputData>): Promise<ApiSSOUserOutput[]> => {
  const data = await apiGetOrNull<SSOUserResponse>(z, bundle, `/api/v1/sso-users/by-email/${encodeURIComponent(bundle.inputData.email)}`);
  return data && data.user ? [normalizeSSOUser(data.user)] : [];
};

export default defineSearch({
  key: 'find_sso_user',
  noun: 'SSO User',
  display: {
    label: 'Find SSO User',
    description: 'Finds a single sign-on user by email.',
  },
  operation: {
    inputFields,
    perform,
    sample: SSO_USER_SAMPLE,
    outputFields: SSO_USER_OUTPUT_FIELDS,
  },
});
