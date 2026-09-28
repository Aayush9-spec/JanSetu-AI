# Contributing

## Development

Use Node.js 20+ and npm. Run `npm ci`, copy `.env.example` to `.env` if local configuration is needed, then start `npm run dev`.

## Before submitting

Run the checks affected by your change:

```sh
npm run lint
npm run typecheck
npm test
npm run build
```

For UI changes, verify direct route refreshes, browser back/forward, narrow mobile layout, light/dark appearance, and the relevant empty/error states. Do not add credentials, real citizen data, generated local browser artifacts, or claims of external data synchronization to the repository. Update the README when the app's actual integrations or setup requirements change.

## Data and integrations

Keep sample-data assumptions visible in the UI. New external data sources require an authorized endpoint and a documented response contract. Server credentials must remain server-side (never use a `VITE_` prefix for secrets). Provide a usable and honestly labelled fallback for optional services.
