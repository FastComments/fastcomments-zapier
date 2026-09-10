import type { ApiEnvelope } from './api.js';

// Mirrors WebhookComment in the FastComments server (util/sync-utils.ts): the exact object a webhook delivers.
export type CommentUserMention = {
  id: string;
  tag: string;
  rawTag?: string;
  type?: string;
  sent?: boolean;
};

export type WebhookComment = {
  id: string;
  urlId: string;
  url: string | null;
  userId?: string | null;
  commenterEmail?: string | null;
  commenterName: string;
  comment: string;
  commentHTML: string;
  externalId?: string;
  parentId?: string | null;
  date: string;
  votes: number;
  votesUp: number;
  votesDown: number;
  verified: boolean;
  verifiedDate?: string;
  reviewed?: boolean;
  avatarSrc?: string | null;
  isSpam?: boolean;
  aiDeterminedSpam?: boolean;
  hasImages?: boolean;
  pageNumber?: number | null;
  pageNumberOF?: number | null;
  pageNumberNF?: number | null;
  approved: boolean;
  locale: string | null;
  mentions?: CommentUserMention[];
  domain?: string | null;
  moderationGroupIds?: string[] | null;
};

export type SamplePayloadsResponse = ApiEnvelope & { payloads: WebhookComment[] };

export function isWebhookComment(value: unknown): value is WebhookComment {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return 'id' in value && typeof value.id === 'string'
    && 'urlId' in value && typeof value.urlId === 'string'
    && 'commenterName' in value && typeof value.commenterName === 'string'
    && 'comment' in value && typeof value.comment === 'string'
    && 'date' in value && typeof value.date === 'string'
    && 'approved' in value && typeof value.approved === 'boolean';
}
