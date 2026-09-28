# JanSetu AI

Multilingual civic infrastructure dashboard built with React, TypeScript, and Vite.

## Run locally

```sh
npm install
cp .env.example .env
npm run dev
```

The app is usable without credentials. Requests and project changes are persisted in the current browser's local storage. Choose Mock, Hybrid, or Real under Settings. Hybrid/Real attempt the configured `VITE_DATA_API_URL` (`GET /jansetu/data`) and fall back to the local Indian demo dataset if it is missing or unavailable.

## Server-side Gemini (optional)

The Vite development server starts the small API middleware in `server/api.mjs`. Set `GEMINI_API_KEY` in the server environment (never a `VITE_` variable) to enable request/photo analysis and report generation. The key is not sent to or stored by the browser. Without it, request analysis uses transparent local rules and is labelled **AI Demo Mode**. Browser speech transcription depends on the browser's Web Speech API; if unsupported, users can enter or paste the transcript.

For a production-style local run, build and start the bundled static/API server:

```sh
npm run build
npm start
```

The standalone server provides the Gemini API and static app hosting. It does not include authentication, a database, or government dataset credentials. A real dataset integration must be supplied through a compatible, authorized `VITE_DATA_API_URL`; otherwise the app keeps using its demo dataset. Do not enter real citizen personal data into an untrusted or unconfigured deployment.

## Checks

`npm run build` runs the strict TypeScript compiler followed by the Vite production build.
