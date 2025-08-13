# ChatAI Monorepo

A full‑stack AI chatbot built with Express, Vite, React (TypeScript), Tailwind, shadcn/ui, and Google Gemini. The primary app lives in `chatpat-main/`. Two Next.js examples are provided as references.

## Repository structure

- `chatpat-main/` — Main production app
  - `client/` — React + Vite SPA (UI components in `client/src/components` and `client/src/components/ui`)
  - `server/` — Express API server (Gemini integration, Auth, storage)
  - `shared/` — Shared types and DB schema (Drizzle ORM)
  - `sample/` — Next.js reference app aligned with this codebase (Auth0 + TRPC)
- `sample/` — A separate, earlier Next.js sample (kept for reference)

### Why two sample folders?
- `chatpat-main/sample/`: a newer, monorepo‑aligned Next.js sample demonstrating TRPC/Auth0/Supabase with the same domain model.
- `/sample`: an older standalone Next.js sample retained for comparison. You can ignore it if you’re only running the main app.

The app you should run is in `chatpat-main/`.

## Run it like you’re 3 years old (super simple)

- Step 1: Install Node.js 20+ from the official site.
- Step 2: Open your terminal.
- Step 3: Type these commands, one line at a time:

```bash
cd chatpat-main
npm install
cp .env.example .env
# Open .env in any editor and fill:
# - DATABASE_URL (Postgres URL)
# - GEMINI_API_KEY (or GOOGLE_AI_API_KEY)
# For local: set AUTH_MODE=dev
npm run db:push
npm run dev
```

- Step 4: Open your browser to http://localhost:5000
- Step 5: Type a message. That’s it.

If something breaks, read “Troubleshooting” near the end.

## Prerequisites
- Node.js 20+
- A Postgres database (Neon, Supabase, or any managed Postgres)
- A Google Gemini API key

Optional (production auth): Replit OIDC credentials if you’ll use the built‑in Replit auth flow.

## Environment variables
Create `chatpat-main/.env` (see `.env.example` for all keys):

- DATABASE_URL: Postgres connection string
- GEMINI_API_KEY or GOOGLE_AI_API_KEY: Google Gemini API key
- SESSION_SECRET: Any strong random string
- AUTH_MODE: set to `dev` for local development to bypass OIDC and use a built‑in dev user
- Optional for production auth via Replit OIDC:
  - REPLIT_DOMAINS: comma‑separated list of allowed domains (e.g. `myapp.example.com`)
  - REPL_ID: your Replit app/client ID
  - ISSUER_URL: OIDC issuer (defaults to https://replit.com/oidc)
  - COOKIE_SECURE: `true` to force secure cookies even outside production

A starter file is provided at `chatpat-main/.env.example`.

## Running locally (localhost)
1) Install dependencies

```bash
cd chatpat-main
npm install
```

2) Configure environment

```bash
cp .env.example .env
# Fill in DATABASE_URL and GEMINI_API_KEY
# For localhost, set AUTH_MODE=dev
```

3) Create tables with Drizzle

```bash
npm run db:push
```

4) Start the app (API + client)

```bash
npm run dev
```

The app serves both API and UI on http://localhost:5000.

Notes for localhost:
- `AUTH_MODE=dev` enables a built‑in dev user so you can use the app without OIDC.
- If you intend to test the Replit OIDC flow locally, you’ll need HTTPS and real domains. For most local work, use `AUTH_MODE=dev`.

## Build and run (production)
1) Build client and server

```bash
cd chatpat-main
npm run build
```

2) Start with your production environment variables

```bash
npm start
```

The server will listen on `PORT` (default 5000) and serve the built client from `dist/public`.

## Deploy
You can deploy to any Node host. Example (Render/Railway/Fly):

- Build command: `npm run build`
- Start command: `npm start`
- Environment: set `DATABASE_URL`, `GEMINI_API_KEY`, `SESSION_SECRET`, and (if using Replit OIDC) `REPLIT_DOMAINS`, `REPL_ID`, `ISSUER_URL`, `COOKIE_SECURE=true`.

Static files are emitted to `dist/public`. The API is `dist/index.js`.

## UI and theming
- Tailwind config in `chatpat-main/tailwind.config.ts`
- Theme tokens and custom styles in `chatpat-main/client/src/index.css`
- Reusable UI primitives in `chatpat-main/client/src/components/ui` (shadcn/ui)

The UI includes Aceternity‑style accents: gradient header stripe in the sidebar, glowing bot avatar, gradient typing indicator, and message shimmer. Icons use `lucide-react`.

Note: Unused `react-icons` dependency has been removed.

## Next.js samples (optional)

- Newer sample (monorepo‑aligned):

```bash
cd chatpat-main/sample
npm install
cp .env.example .env
# Fill Auth0, Supabase, and Gemini keys as described in this sample’s README
npm run dev
```

- Older sample (legacy):

```bash
cd sample
npm install
# Create .env.local; see sample/docs/LOCAL_SETUP.md for all variables
npm run dev
```

The newer `chatpat-main/sample` is recommended. The legacy `/sample` is kept for comparison and learning.

## Troubleshooting
- Missing DB: ensure `DATABASE_URL` points to a live Postgres and run `npm run db:push`
- 401 Unauthorized on localhost: set `AUTH_MODE=dev` in `chatpat-main/.env`
- Port blocked: set `PORT=5000` (or another free port)
- Missing Gemini key: set `GEMINI_API_KEY` (or `GOOGLE_AI_API_KEY`)
- Styles not showing: restart dev server after changing Tailwind config