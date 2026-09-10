# FastComments for Zapier

FastComments is a hosted comments and community platform for websites and apps. This repository is the
source of the official FastComments integration on Zapier, built with the Zapier Platform CLI.

## What it does

| Kind | Key | Name | Notes |
|------|-----|------|-------|
| Trigger | `new_comment` | New Comment | REST hook. Only approved, non-spam comments by default. |
| Trigger | `updated_comment` | Updated Comment | REST hook. Edits, approvals, votes, moderation changes. |
| Trigger | `deleted_comment` | Deleted Comment | REST hook. |
| Create | `create_comment` | Create Comment | `POST /api/v1/comments` |
| Create | `create_page` | Create Page | `POST /api/v1/pages` |
| Create | `create_sso_user` | Create SSO User | `POST /api/v1/sso-users`, admin flags intentionally excluded |
| Create | `create_feed_post` | Create Feed Post | `POST /api/v1/feed-posts` |
| Create | `create_hash_tag` | Create Hash Tag | `POST /api/v1/hash-tags` |
| Create | `flag_comment` | Flag Comment | `POST /api/v1/comments/{id}/flag` |
| Search | `find_comment` | Find Comment | by id |
| Search | `find_sso_user` | Find SSO User | by email |
| Search | `find_page` | Find Page | by URL ID |

Every trigger takes an optional domain filter fed by the account's configured domains.

## How it connects

Users sign in with OAuth 2.1 (authorization code + PKCE). The connecting user must be an API admin on the
FastComments account; anyone else sees a blocked consent page. Tokens are scoped `read write`. Access
tokens live one hour and Zapier refreshes them automatically; the refresh token for this client does not
rotate, so concurrent Zaps on one connection never invalidate each other.

The region picker at connect time selects `fastcomments.com` or `eu.fastcomments.com`. The app only ever
calls those two hosts.

## Webhooks

Turning a Zap on subscribes its target URL through `POST /api/v1/webhooks`; turning it off deletes the
subscription. Deliveries are a single bare comment object (documented as `WebhookComment` in the
FastComments webhooks guide), which the trigger wraps in a one-item array. FastComments signs deliveries
with an HMAC of the account's API secret; an OAuth app has no API secret, so the signature is not verified
here. A `410 Gone` from Zapier deletes the subscription server-side. Failing deliveries retry with backoff
and a webhook that fails for six days is disabled.

There is no polling trigger on purpose: every poll costs the customer an API credit.

## Development

Requires Node 22 (`nvm use`).

```
npm ci
cp .env.example .env   # fill in CLIENT_ID and CLIENT_SECRET
npm run lint
npm test               # unit lane, no network
npm run validate       # Zapier schema + integration checks
```

### Live lane

`npm run test:live` runs the app against a real FastComments server: `test` auth, page and comment
creates, searches, a webhook subscribe/list/unsubscribe cycle. Set `FC_ZAPIER_LIVE_BASE_URL`
(for example `http://localhost:3001`) and `FC_ZAPIER_LIVE_REFRESH_TOKEN` (a refresh token issued to the
client in `CLIENT_ID`) in `.env`. The lane is skipped when either is missing. CI runs it on pushes only, so
fork pull requests never see the secrets.

To mint a refresh token for the lane, complete the OAuth flow once against the target server with the
first-party client (see `RELEASING.md`), or copy one from a connection made in the Zapier editor.

## Releasing

See [RELEASING.md](RELEASING.md).

## Roadmap

- Triggers for feed posts, tickets, and flagged comments (need server-side webhook events first).
- Block user from comment and ticket creates.
- Zap templates for the App Directory listing.

## Support

Docs: https://docs.fastcomments.com/guide-installation-zapier.html

Email: support@fastcomments.com
