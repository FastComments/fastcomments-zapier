import { defineTrigger } from 'zapier-platform-core';
import type { Bundle, ZObject } from 'zapier-platform-core';
import { ALL_DOMAINS } from '../constants.js';
import type { DomainConfigsResponse } from '../types/api.js';
import { apiGet } from '../utils/request.js';

type DomainChoice = {
  id: string;
  domain: string;
};

// Feeds the Domain dropdown on the triggers. Hidden: it is not a trigger anyone builds a Zap on.
const perform = async (z: ZObject, bundle: Bundle): Promise<DomainChoice[]> => {
  const data = await apiGet<DomainConfigsResponse>(z, bundle, '/api/v1/domain-configs');
  return [
    { id: ALL_DOMAINS, domain: 'All domains' },
    ...data.configurations.map((config) => ({ id: config.domain, domain: config.domain })),
  ];
};

export default defineTrigger({
  key: 'domain_config_list',
  noun: 'Domain',
  display: {
    label: 'Domain',
    description: 'Lists the domains configured on the account.',
    hidden: true,
  },
  operation: {
    type: 'polling',
    perform,
    sample: { id: 'example.com', domain: 'example.com' },
  },
});
