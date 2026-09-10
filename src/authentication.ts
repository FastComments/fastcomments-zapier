import type { Authentication, Bundle, ZObject } from 'zapier-platform-core';
import { DEFAULT_HOST, HOST_CHOICES, SCOPE, baseUrlFor } from './constants.js';
import type { MeResponse } from './types/api.js';

type TokenResponse = {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
};

type OAuthErrorBody = {
  error?: string;
  error_description?: string;
};

function isOAuthErrorBody(value: unknown): value is OAuthErrorBody {
  return typeof value === 'object' && value !== null;
}

function isTokenResponse(value: unknown): value is TokenResponse {
  return typeof value === 'object' && value !== null && 'access_token' in value && typeof value.access_token === 'string';
}

function requireString(z: ZObject, value: unknown, name: string): string {
  if (typeof value !== 'string' || !value) {
    throw new z.errors.Error(`Missing ${name} from Zapier.`, 'missing-oauth-parameter', 500);
  }
  return value;
}

// The token endpoint answers with OAuth error JSON, not the {status, code, reason} envelope the API middleware maps.
// During the first exchange the region is an auth input; on refresh it is already stored in authData.
function hostFor(bundle: Bundle): string | undefined {
  return typeof bundle.inputData.host === 'string' ? bundle.inputData.host : bundle.authData.host;
}

async function postToken(z: ZObject, bundle: Bundle, form: Record<string, string>): Promise<TokenResponse> {
  const response = await z.request({
    url: `${baseUrlFor(hostFor(bundle))}/oauth/token`,
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: form,
    skipThrowForStatus: true,
  });
  const body: unknown = response.data;
  if (response.status >= 400) {
    const description = isOAuthErrorBody(body) ? body.error_description ?? body.error : undefined;
    throw new z.errors.Error(description ?? `The FastComments token endpoint returned HTTP ${response.status}.`, 'oauth-token', response.status);
  }
  if (!isTokenResponse(body)) {
    throw new z.errors.Error('The FastComments token endpoint returned no access token.', 'oauth-token', 500);
  }
  return body;
}

export const getAccessToken = async (z: ZObject, bundle: Bundle): Promise<TokenResponse> => {
  const tokens = await postToken(z, bundle, {
    grant_type: 'authorization_code',
    client_id: process.env.CLIENT_ID ?? '',
    client_secret: process.env.CLIENT_SECRET ?? '',
    code: requireString(z, bundle.inputData.code, 'code'),
    code_verifier: requireString(z, bundle.inputData.code_verifier, 'code_verifier'),
    redirect_uri: requireString(z, bundle.inputData.redirect_uri, 'redirect_uri'),
  });
  return tokens;
};

// First-party refresh tokens on FastComments do not rotate, so the same refresh_token comes back every time.
export const refreshAccessToken = async (z: ZObject, bundle: Bundle): Promise<TokenResponse> => {
  return postToken(z, bundle, {
    grant_type: 'refresh_token',
    client_id: process.env.CLIENT_ID ?? '',
    client_secret: process.env.CLIENT_SECRET ?? '',
    refresh_token: requireString(z, bundle.authData.refresh_token, 'refresh_token'),
  });
};

// GET /api/v1/me is the cheapest read call and returns the fields the connection label needs.
export const test = async (z: ZObject, bundle: Bundle): Promise<MeResponse> => {
  const response = await z.request<MeResponse>({ url: `${baseUrlFor(bundle.authData.host)}/api/v1/me` });
  return response.data;
};

// The test response is exposed as bundle.inputData here. Email stays out of the label.
export const connectionLabel = async (z: ZObject, bundle: Bundle): Promise<string> => {
  const tenantName = typeof bundle.inputData.tenantName === 'string' ? bundle.inputData.tenantName : 'FastComments';
  const username = typeof bundle.inputData.username === 'string' ? bundle.inputData.username : '';
  return username ? `${tenantName} (${username})` : tenantName;
};

export const authorizeUrl = {
  url: 'https://{{bundle.inputData.host}}/oauth/authorize',
  params: {
    client_id: '{{process.env.CLIENT_ID}}',
    redirect_uri: '{{bundle.inputData.redirect_uri}}',
    response_type: 'code',
    scope: SCOPE,
    state: '{{bundle.inputData.state}}',
  },
};

export default {
  type: 'oauth2',
  oauth2Config: {
    authorizeUrl,
    getAccessToken,
    refreshAccessToken,
    autoRefresh: true,
    // FastComments requires PKCE (S256) for every client; Zapier generates the verifier and challenge.
    enablePkce: true,
    scope: SCOPE,
  },
  fields: [
    {
      key: 'host',
      label: 'Region',
      required: true,
      default: DEFAULT_HOST,
      choices: HOST_CHOICES,
      helpText: 'Pick the region your FastComments account lives in. Most accounts use the United States region.',
    },
  ],
  test,
  connectionLabel,
} satisfies Authentication;
