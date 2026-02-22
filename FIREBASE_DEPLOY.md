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
./scripts/build-studio-for-firebase.sh
```

This builds Sanity Studio from `/Users/wissemchouk/Downloads/Actisite/Publications` and publishes static files to `/Users/wissemchouk/Downloads/Actisite/studio`.

Then deploy:

```bash
firebase deploy --only hosting
```

## Notes

- Hosting serves from repo root (`public: "."`).
- `index.html` is the default entry page.
- Sanity Studio is exposed at `/studio` on the same site.
- Example: `https://landing-site-9ce39.web.app/studio`
- Large local content and dev folders are excluded in `firebase.json` via `ignore`.
