# Local setup and deployment (detailed)

Follow these steps to run locally and deploy on Vercel. The main `README.md` must contain only the live link per interview instructions.

## 1) Requirements
- Node.js 18+
- npm 9+
- GitHub account
- Vercel account (free)
- Supabase project (free)
- Auth0 tenant/app (free)
- Google AI Studio API key (Gemini; free tier)

## 2) Clone and install
```bash
git clone https://github.com/your-username/sample.git
cd sample
npm install
```

## 3) Supabase setup
1. Create a new project at `https://supabase.com/`.
2. In Project Settings → API, copy:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
3. In SQL Editor, run the schema to create the messages table:
```sql
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  role text not null check (role in ('user','assistant')),
  type text not null check (type in ('text','image')),
  content text,
  image_url text,
  created_at timestamptz not null default now()
);

create index if not exists messages_user_id_created_at_idx on public.messages(user_id, created_at);
```
4. Leave RLS disabled for this demo or add policies as desired. We use the service role key on the server.

## 4) Auth0 setup
1. Create a Regular Web Application in Auth0 Dashboard.
2. Allowed Callback URLs (local): `http://localhost:3000/api/auth/callback`
3. Allowed Logout URLs (local): `http://localhost:3000/`
4. Allowed Web Origins (local): `http://localhost:3000`
5. Copy values:
   - `AUTH0_ISSUER_BASE_URL` (e.g. `https://your-tenant.auth0.com`)
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`
   - Generate `AUTH0_SECRET` (random 32+ char string)

## 5) Google Gemini / Images API
1. Go to `https://ai.google.dev/` → Get API key.
2. The same key is used for text (Gemini) and images (Imagen 3) APIs.

## 6) Environment variables
Create `.env.local` in the project root:
```
# Supabase (server-only)
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Auth0
AUTH0_SECRET=your_auth0_secret
AUTH0_ISSUER_BASE_URL=https://your-tenant.auth0.com
AUTH0_CLIENT_ID=your_auth0_client_id
AUTH0_CLIENT_SECRET=your_auth0_client_secret

# Google AI
GEMINI_API_KEY=your_gemini_api_key
```
Note: Do NOT expose service role or Gemini key to the frontend. All calls are server-side through tRPC.

## 7) Run locally
```bash
npm run dev
```
Open `http://localhost:3000` on a mobile viewport (desktop screens are intentionally blocked).

Login via the header button, then chat or generate images. History is saved to Supabase per user.

## 8) Deploy to Vercel
1. Create a GitHub repo named `sample` and push.
2. In Vercel, import the `sample` repo.
3. Add the same environment variables under Project Settings → Environment Variables (Production and Preview):
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `AUTH0_SECRET`
   - `AUTH0_ISSUER_BASE_URL`
   - `AUTH0_CLIENT_ID`
   - `AUTH0_CLIENT_SECRET`
   - `GEMINI_API_KEY`
4. Deploy. Copy the live URL and paste it into `README.md` (the README must contain only the link).
5. Update Auth0 application settings with your production URLs:
   - Allowed Callback URLs: `https://YOUR_VERCEL_DOMAIN/api/auth/callback`
   - Allowed Logout URLs: `https://YOUR_VERCEL_DOMAIN/`
   - Allowed Web Origins: `https://YOUR_VERCEL_DOMAIN`

## 9) Tests (optional bonus)
- Run tests: `npm test`
- Add more tests in `__tests__/`.

## 10) Notes
- This app is mobile-only by design. On desktop widths, the app view is hidden.
- Two Google AI models are used: `gemini-1.5-flash` (text) and `imagen-3.0-fast` (image).
- All AI calls are made from the server via tRPC to keep keys private.