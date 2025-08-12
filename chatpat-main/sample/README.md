https://REPLACE_WITH_DEPLOYED_URL

Setup
- Copy `.env.example` to `.env` and fill values for Auth0, Supabase, and Gemini.
- For Supabase storage uploads, create a public bucket named `uploads` and enable public file access.
- Optionally set `SUPABASE_CONNECTION_STRING` and run `npm run db:apply` to apply `supabase.sql`.

Deploy
- Vercel: Import this project, add env vars from `.env`, and deploy. Ensure `NEXT_PUBLIC_*` keys are marked as exposed in Vercel.
- Render: Deploy as a Next.js app. Add env vars. Set build command `npm run build` and start `npm start`.

Live URL
- Replace the placeholder above with your deployed URL.