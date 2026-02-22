# Deploy to Firebase Hosting

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

## 4. Deploy

From `/Users/wissemchouk/Downloads/Actisite`:

```bash
firebase deploy --only hosting
```

## Sanity (Publications via API)

The site is prepared to load publications from Sanity on:
- home (`index.html`, publications block)
- articles page (`blog.html`)
- innovation page (`innovation.html`)

Update `/Users/wissemchouk/Downloads/Actisite/sanity.config.js`:

- `projectId`: your Sanity project id
- `dataset`: usually `production`
- `apiVersion`: keep as-is unless needed
- `useCdn`: `true` for public fast reads
- `maxItems`: optional cap

No build step is required for this integration on Firebase Hosting.
If Sanity is not configured, static fallback cards remain visible.

## Notes

- Hosting serves from repo root (`public: "."`).
- `index.html` is the default entry page.
- Large local content and dev folders are excluded in `firebase.json` via `ignore`.
