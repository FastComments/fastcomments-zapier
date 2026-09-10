import type { AfterResponseMiddleware, BeforeRequestMiddleware } from 'zapier-platform-core';
import { toAppError } from './utils/request.js';

function isOAuthEndpoint(url: string | undefined): boolean {
  return !!url && /\/oauth\//.test(url);
}

// Token endpoints authenticate with the client credentials, never with a user token.
const includeBearerToken: BeforeRequestMiddleware = (request, z, bundle) => {
  const accessToken = bundle.authData.access_token;
  if (accessToken && !isOAuthEndpoint(request.url)) {
    request.headers = { ...request.headers, Authorization: `Bearer ${accessToken}` };
  }
  return request;
};

// Core has already raised RefreshAuthError (401) and ThrottledError (429) by the time this runs.
const throwForApiFailure: AfterResponseMiddleware = (response, z) => {
  if (response.skipThrowForStatus || response.status < 400 || isOAuthEndpoint(response.request.url)) {
    return response;
  }
  throw toAppError(z, response);
};

export const befores = [includeBearerToken];
export const afters = [throwForApiFailure];
