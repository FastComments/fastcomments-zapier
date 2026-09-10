// Shapes of the FastComments REST API responses this integration reads. Only the fields the integration
// touches are typed; everything else passes through untouched.

export type ApiStatus = 'success' | 'failed';

export type ApiEnvelope = {
  status: ApiStatus;
  code?: string;
  reason?: string;
};

export type MeResponse = ApiEnvelope & {
  tenantId: string;
  tenantName: string;
  authType: 'api-key' | 'oauth';
  scopes: string[];
  userId?: string;
  username?: string;
  email?: string;
};

export type ApiComment = {
  id: string;
  date: number | string | null;
  verifiedDate?: number | string | null;
  [key: string]: unknown;
};

export type ApiCommentOutput = ApiComment & {
  date: string | null;
  verifiedDate?: string | null;
};

export type ApiPage = {
  id: string;
  urlId: string;
  title: string;
  url?: string;
  createdAt: string;
  commentCount: number;
  rootCommentCount: number;
  isClosed?: boolean;
  accessibleByGroupIds?: string[];
};

export type ApiSSOUser = {
  id: string;
  username: string;
  email: string;
  signUpDate: number | string | null;
  [key: string]: unknown;
};

export type ApiSSOUserOutput = ApiSSOUser & {
  signUpDate: string | null;
};

export type FeedPost = {
  _id: string;
  tenantId: string;
  createdAt: string;
  [key: string]: unknown;
};

export type TenantHashTag = {
  _id: string;
  tenantId: string;
  tag: string;
  url?: string;
  createdAt: string;
};

export type PublicWebhook = {
  id: string;
  url: string;
  event: string;
  domain: string;
  method: string;
  source: string;
  enabled: boolean;
  createdAt: string;
};

export type DomainConfiguration = {
  id: string;
  domain: string;
  createdAt: string;
};

export type WithId<T extends { _id: string }> = Omit<T, '_id'> & { id: string };

export type CommentResponse = ApiEnvelope & { comment: ApiComment };
export type PageResponse = ApiEnvelope & { page?: ApiPage | ApiPage[] | null };
export type SSOUserResponse = ApiEnvelope & { user?: ApiSSOUser };
export type FeedPostResponse = ApiEnvelope & { feedPost: FeedPost };
export type HashTagResponse = ApiEnvelope & { hashTag: TenantHashTag };
export type FlagCommentResponse = ApiEnvelope & { wasUnapproved?: boolean };
export type DomainConfigsResponse = ApiEnvelope & { configurations: DomainConfiguration[] };
export type WebhookResponse = ApiEnvelope & { webhook: PublicWebhook };
