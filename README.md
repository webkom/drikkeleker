# drikkeleker

> A collection of drinking games from the Abakus student association.

## Getting Started

First, install the dependencies using yarn:

```bash
yarn
```

Then, run the development server:

```bash
yarn dev
```

## To run locally:

Multiplayer rooms now use Firebase instead of the old Socket.IO backend. Create a Firebase project, enable Anonymous Auth, create a Firestore database, and add these values to the frontend `.env.local`:

```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
ADMIN_PASSWORD=...
```

Deploy the Firestore rules from `firestore.rules` before opening multiplayer rooms in production. To automatically delete old room documents, enable a Firestore TTL policy on the `expiresAt` field in the `rooms` collection group.

Then run:

```bash
yarn
yarn dev
```

The site should now be running at [http://localhost:3000](http://localhost:3000).

## Contributing

We would love your contributions. To find out how to, read our [CONTRIBUTING.md](./CONTRIBUTING.md)
