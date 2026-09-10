# Releasing the FastComments Zapier integration

All commands use `npx zapier-platform` (the `zapier` binary was removed in CLI v19).

## One-time setup

1. Sign in at developer.zapier.com with an `@fastcomments.com` address (Zapier requires the developer to be
   an employee of the company that owns the API).
2. `npx zapier-platform login`.
3. Register the app, which writes `.zapierapprc` (commit it; it only holds the app id):

   ```
   npx zapier-platform register "FastComments" \
     --desc "FastComments is a hosted comments and community platform for websites and apps." \
     --url https://fastcomments.com --audience global --role employee
   ```

4. Read the App ID from `.zapierapprc`. The OAuth redirect URI is
   `https://zapier.com/dashboard/auth/oauth/return/App<ID>CLIAPI/`. Confirm it in the developer dashboard
   under Authentication after the first push.
5. Generate a client secret and its hash:

   ```
   node -e "const c=require('node:crypto');const s=c.randomBytes(32).toString('hex');console.log('secret',s);console.log('sha256',c.createHash('sha256').update(s).digest('hex'))"
   ```

6. Register the client on the FastComments servers (both regions) through the `OAUTH_FIRST_PARTY_CLIENTS`
   environment variable and deploy:

   ```
   OAUTH_FIRST_PARTY_CLIENTS=[{"clientId":"zapier","clientSecretHash":"<sha256>","redirectUris":["https://zapier.com/dashboard/auth/oauth/return/App<ID>CLIAPI/"],"clientName":"Zapier","clientUri":"https://zapier.com","logoUri":"/images/3rd-party-products/zapier.svg"}]
   ```

7. Give Zapier the plaintext secret: `npx zapier-platform env:set 1.0.0 CLIENT_ID=zapier CLIENT_SECRET=<secret>`.
   Environment values are per version; set them again for every new version before promoting it.

## Every release

1. Bump `version` in `package.json`.
2. `npm run lint && npm test && npm run validate`.
3. `npx zapier-platform push` (runs `_zapier-build`, uploads `dist/`).
4. In the Zapier editor connect an account, confirm the connection label, and run one live Zap per visible
   trigger, create and search (check S002).
5. `npx zapier-platform promote <version>`, then `npx zapier-platform migrate <old> <new>` to move users.

## First public submission

- Branding: square RGBA PNG logo of at least 256x256 (`assets/logo-1080.png`, transparent background), description starting
  "FastComments is a ..." (40 to 140 characters), homepage `https://fastcomments.com/zapier`, help URL
  `https://docs.fastcomments.com/guide-installation-zapier.html`.
- Test account for `integration-testing@zapier.com`: a dedicated tenant whose owner is an API admin, with a
  non-expiring password.
- At least 3 users with live Zaps (S001) and one live Zap per visible action (S002). Invite testers with
  `npx zapier-platform users:add <email> <version>`.
- `npx zapier-platform validate` must report zero errors and zero publishing tasks.
- Submit from the developer dashboard. The app carries a Beta tag for 90 days; publishing 10 Zap templates
  and embedding Zapier on the marketing page shortens that.
