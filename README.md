# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Firebase configuration

Set these environment variables for client initialization (e.g., in `.env.local`):

- NEXT_PUBLIC_FIREBASE_API_KEY
- NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
- NEXT_PUBLIC_FIREBASE_PROJECT_ID
- NEXT_PUBLIC_FIREBASE_APP_ID
- NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET (optional)
- NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID (optional)
- NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID (optional)

Without these, Firebase persistence is skipped gracefully.

## Deploying to Firebase Hosting (Next.js SSR via Web Frameworks)

1. Install CLI and enable frameworks:
   - npm i -g firebase-tools
   - firebase experiments:enable webframeworks
2. Initialize (select Hosting, your project, and Next.js):
   - firebase init hosting
3. Deploy:
   - firebase deploy

This uses `frameworksBackend` in `firebase.json` to deploy an SSR function for Next.js routes (e.g., /invest, /wallet). Remove any custom rewrites to a non-existent function.
