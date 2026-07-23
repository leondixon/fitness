# fitness

## Local setup

1. Install dependencies with `bun install`.
2. Copy `.env.example` to `.env`, then set the DeepSeek and Supabase values.
3. Apply `supabase/migrations/20260709000000_create_workout_plans.sql` to the linked Supabase project (via the Supabase CLI or SQL editor).
4. In Supabase Authentication, enable Google and configure its Google Cloud credentials.
5. Add `http://localhost:3000/auth/callback` to Supabase Authentication URL Configuration's redirect allow list. Add the production callback URL when a production origin exists.
6. Run `bun dev`.

The app uses the Supabase publishable/anon key only; never put a service-role key in browser runtime configuration. This personal application intentionally has no RLS policies. Server API handlers still authenticate each request and filter every plan lookup and mutation by the authenticated user ID.

Google sign-in returns through `/auth/callback`, which restores the session and continues to `/workouts`; users without a plan are redirected to the homepage creation flow.
