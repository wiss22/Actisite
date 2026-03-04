# Studio Migration Plan (`studio.aktis-consulting.com`)

## Objective
Move Sanity Studio off the public website hosting and publish it on a dedicated admin subdomain:

- Public site: `https://landing-site-9ce39.web.app`
- Studio admin: `https://studio.aktis-consulting.com`

## What is already enforced in this repo

1. Public Firebase hosting no longer rewrites `/studio`.
2. Studio build artifacts are excluded from public deploy (`studio/**`, `vendor/**`, `static/sanity-*.js`).
3. Sanity Studio base path is set to `/` for dedicated-domain hosting.

## Deploy steps

### 1. Deploy the website
From `/Users/wissemchouk/Downloads/Actisite`:

```bash
firebase deploy --only hosting
```

### 2. Deploy Sanity Studio
From `/Users/wissemchouk/Downloads/Actisite/Publications`:

```bash
npm install
npx sanity deploy
```

### 3. Bind `studio.aktis-consulting.com`
In Sanity Manage:

1. `Hosted Studios` -> your studio.
2. Add hostname `studio.aktis-consulting.com`.
3. Apply provided DNS record (CNAME).
4. Wait for certificate provisioning.

## Security checklist

- Keep Sanity project private to invited members only.
- Remove old domains from CORS when migration is complete.
- Keep only required origins in CORS (prod site + studio domain).
- Avoid exposing write/manage tokens in frontend JS.
- Optional: add identity access layer (Cloudflare Access / Google IAP) in front of studio domain.

## Rollback
If needed, you can temporarily use the Sanity default hosted studio URL while DNS propagates.
