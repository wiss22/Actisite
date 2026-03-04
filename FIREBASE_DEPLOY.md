# Deploy Website (Firebase) + Studio (Dedicated Domain)

## 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

## 2. Login

```bash
firebase login
```

## 3. Set your Firebase project id

Edit `/Users/wissemchouk/Downloads/Actisite/.firebaserc` and replace:

`replace-with-your-firebase-project-id`

with your real Firebase project id.

## 4. Deploy the public website

From `/Users/wissemchouk/Downloads/Actisite`:

```bash
firebase deploy --only hosting
```

## 5. Deploy Sanity Studio on `/studio` (same domain)

Run from `/Users/wissemchouk/Downloads/Actisite/Publications`:

```bash
npm install
npx sanity deploy
```

Then open:

- `https://aktis-consulting.com/studio`

## Notes

- Public website hosting serves from repo root (`public: "."`).
- Studio is exposed under `/studio` on the same host.
- Keep CORS allowlist updated in Sanity for the frontend domains only.
