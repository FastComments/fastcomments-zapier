import type { ApiComment, ApiCommentOutput, ApiSSOUser, ApiSSOUserOutput, WithId } from '../types/api.js';

// Zapier wants ISO-8601 dates; the REST API returns epoch milliseconds for comments and users.
export function toIsoDate(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value.toISOString();
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? new Date(value).toISOString() : null;
  }
  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isNaN(parsed) ? null : new Date(parsed).toISOString();
  }
  return null;
}

// Input datetimes arrive as ISO strings; the comment API takes epoch milliseconds.
export function toEpochMillis(value: string | undefined): number | undefined {
  if (!value) {
    return undefined;
  }
  const parsed = Date.parse(value);
  return Number.isNaN(parsed) ? undefined : parsed;
}

export function normalizeComment(comment: ApiComment): ApiCommentOutput {
  return {
    ...comment,
    date: toIsoDate(comment.date),
    verifiedDate: toIsoDate(comment.verifiedDate),
  };
}

export function normalizeSSOUser(user: ApiSSOUser): ApiSSOUserOutput {
  return {
    ...user,
    signUpDate: toIsoDate(user.signUpDate),
  };
}

export function withId<T extends { _id: string }>(doc: T): WithId<T> {
  const { _id, ...rest } = doc;
  return { ...rest, id: _id };
}
