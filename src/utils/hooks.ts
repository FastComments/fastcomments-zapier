import type { Bundle, ZObject } from 'zapier-platform-core';
import { ALL_DOMAINS } from '../constants.js';
import type { WebhookEvent } from '../constants.js';
import type { ApiEnvelope, PublicWebhook, WebhookResponse } from '../types/api.js';
import { isWebhookComment } from '../types/webhook.js';
import type { SamplePayloadsResponse, WebhookComment } from '../types/webhook.js';
import { apiDelete, apiGet, apiPost } from './request.js';

export type HookInputData = {
  domain?: string;
  include_unapproved?: boolean;
};

export const domainInputField = {
  key: 'domain',
  label: 'Domain',
  required: false,
  dynamic: 'domain_config_list.id.domain',
  helpText: 'Only trigger for one of the domains configured on your account. Leave blank for every domain.',
} as const;

export const includeUnapprovedInputField = {
  key: 'include_unapproved',
  label: 'Include Unapproved and Spam Comments',
  type: 'boolean',
  required: false,
  default: 'false',
  helpText: 'By default only approved, non-spam comments trigger. A comment approved later fires Updated Comment.',
} as const;

function domainOf(bundle: Bundle<HookInputData>): string {
  return bundle.inputData.domain || ALL_DOMAINS;
}

export function subscribeHook(event: WebhookEvent) {
  return async (z: ZObject, bundle: Bundle<HookInputData>): Promise<PublicWebhook> => {
    if (!bundle.targetUrl) {
      throw new z.errors.Error('Zapier did not provide a webhook target URL.', 'missing-target-url', 500);
    }
    // Zapier hook endpoints take POST; the server default for API subscriptions is POST as well, stated here so
    // a dashboard default change can never break deliveries.
    const data = await apiPost<WebhookResponse>(z, bundle, '/api/v1/webhooks', {
      url: bundle.targetUrl,
      event,
      domain: domainOf(bundle),
      method: 'POST',
    });
    return data.webhook;
  };
}

export function unsubscribeHook() {
  return async (z: ZObject, bundle: Bundle<HookInputData>): Promise<ApiEnvelope> => {
    const id = bundle.subscribeData?.id;
    if (!id) {
      throw new z.errors.Error('No subscription id was stored for this Zap.', 'missing-subscription', 500);
    }
    return apiDelete<ApiEnvelope>(z, bundle, `/api/v1/webhooks/${encodeURIComponent(id)}`);
  };
}

export function isVisibleComment(comment: WebhookComment, includeUnapproved: boolean | undefined): boolean {
  if (includeUnapproved) {
    return true;
  }
  return comment.approved && comment.isSpam !== true;
}

// A delivery is one bare comment object; Zapier expects an array.
export function performHook(filterUnapproved: boolean) {
  return async (z: ZObject, bundle: Bundle<HookInputData>): Promise<WebhookComment[]> => {
    const payload: unknown = bundle.cleanedRequest;
    if (!isWebhookComment(payload)) {
      z.console.log('Ignoring a delivery that is not a comment payload');
      return [];
    }
    if (filterUnapproved && !isVisibleComment(payload, bundle.inputData.include_unapproved)) {
      return [];
    }
    return [payload];
  };
}

export function listSamples(event: WebhookEvent, filterUnapproved: boolean) {
  return async (z: ZObject, bundle: Bundle<HookInputData>): Promise<WebhookComment[]> => {
    const data = await apiGet<SamplePayloadsResponse>(z, bundle, '/api/v1/webhooks/sample-payloads', { event, limit: 10 });
    const domain = domainOf(bundle);
    return data.payloads
      .filter((payload) => domain === ALL_DOMAINS || payload.domain === domain)
      .filter((payload) => !filterUnapproved || isVisibleComment(payload, bundle.inputData.include_unapproved))
      .slice(0, 3);
  };
}
