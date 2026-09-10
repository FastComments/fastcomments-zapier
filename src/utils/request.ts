import type { Bundle, HttpResponse, ZObject } from 'zapier-platform-core';
import { baseUrlFor } from '../constants.js';
import type { ApiEnvelope } from '../types/api.js';

type QueryParams = Record<string, string | number | boolean | undefined>;

const NOT_FOUND_CODES = ['not-found', 'user-does-not-exist', 'page-not-found'];

function isApiFailure(value: unknown): value is { code?: string; reason?: string } {
  return typeof value === 'object' && value !== null;
}

// Turns a failed FastComments response into the error Zapier shows the user. 401 and 429 never reach this: core
// raises RefreshAuthError and ThrottledError for them first.
export function toAppError(z: ZObject, response: HttpResponse): Error {
  const body: unknown = response.data;
  const code = isApiFailure(body) && typeof body.code === 'string' ? body.code : undefined;
  const reason = isApiFailure(body) && typeof body.reason === 'string' ? body.reason : `FastComments returned HTTP ${response.status}.`;
  if (response.status === 403 && code === 'insufficient-scope') {
    return new z.errors.Error('This FastComments connection does not have write access. Reconnect your FastComments account to grant it.', code, 403);
  }
  return new z.errors.Error(reason, code ?? `http-${response.status}`, response.status);
}

export function isNotFound(response: HttpResponse): boolean {
  if (response.status === 404) {
    return true;
  }
  const body: unknown = response.data;
  return isApiFailure(body) && typeof body.code === 'string' && NOT_FOUND_CODES.includes(body.code);
}

async function call<T extends ApiEnvelope>(z: ZObject, bundle: Bundle, method: 'GET' | 'POST' | 'DELETE', path: string, params?: QueryParams, body?: Record<string, unknown>, allowNotFound = false): Promise<T | null> {
  const response = await z.request<T>({
    url: baseUrlFor(bundle.authData.host) + path,
    method,
    params,
    body,
    headers: {
      Accept: 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    removeMissingValuesFrom: { params: true, body: true },
    // A miss must come back as a response, not an exception, so the caller can turn it into an empty result.
    skipThrowForStatus: allowNotFound,
  });
  if (allowNotFound && isNotFound(response)) {
    return null;
  }
  if (response.status >= 400) {
    throw toAppError(z, response);
  }
  if (response.data.status !== 'success') {
    throw new z.errors.Error(response.data.reason ?? 'FastComments reported a failure.', response.data.code ?? 'failed', response.status);
  }
  return response.data;
}

async function require<T extends ApiEnvelope>(z: ZObject, bundle: Bundle, method: 'GET' | 'POST' | 'DELETE', path: string, params?: QueryParams, body?: Record<string, unknown>): Promise<T> {
  const data = await call<T>(z, bundle, method, path, params, body);
  if (!data) {
    throw new z.errors.Error('FastComments returned an empty response.', 'empty-response', 500);
  }
  return data;
}

export function apiGet<T extends ApiEnvelope>(z: ZObject, bundle: Bundle, path: string, params?: QueryParams): Promise<T> {
  return require<T>(z, bundle, 'GET', path, params);
}

export function apiGetOrNull<T extends ApiEnvelope>(z: ZObject, bundle: Bundle, path: string, params?: QueryParams): Promise<T | null> {
  return call<T>(z, bundle, 'GET', path, params, undefined, true);
}

export function apiPost<T extends ApiEnvelope>(z: ZObject, bundle: Bundle, path: string, body: Record<string, unknown>, params?: QueryParams): Promise<T> {
  return require<T>(z, bundle, 'POST', path, params, body);
}

export function apiDelete<T extends ApiEnvelope>(z: ZObject, bundle: Bundle, path: string): Promise<T> {
  return require<T>(z, bundle, 'DELETE', path);
}
