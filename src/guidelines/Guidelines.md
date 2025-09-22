## Supabase Integration Guide (Andnd)

This project already ships with a Supabase client and auth helpers in `src/lib/supabase.ts`.

### 1) Create and store credentials safely

- Create a project in Supabase and copy:
  - Project URL: `https://gknokhovhtsttxtjwqzw.supabase.co`
  - Anon public API key: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrbm9raG92aHRzdHR4dGp3cXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjYxMDAsImV4cCI6MjA3NDAwMjEwMH0.fNdNVyatvTH2CI6bzGxmx931alksfFtMaqgaarJnYho`
- Prefer .env files (do NOT hardcode in source):

Create a `.env.local` file in the project root:

```
VITE_SUPABASE_URL=https://gknokhovhtsttxtjwqzw.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdrbm9raG92aHRzdHR4dGp3cXp3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0MjYxMDAsImV4cCI6MjA3NDAwMjEwMH0.fNdNVyatvTH2CI6bzGxmx931alksfFtMaqgaarJnYho
```

Note: Variables must be prefixed with `VITE_` to be exposed to the browser in Vite.

### 2) Initialize the client

The project’s `src/lib/supabase.ts` already creates a client and exports `supabase`, `authHelpers`, and utilities.

If you move credentials to env vars, reference them via `import.meta.env`:

```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
```

### 3) Install dependencies (if needed)

```
npm install @supabase/supabase-js
```

### 4) Basic usage in React components

- Import the pre-configured client:

```ts
import { supabase, authHelpers } from "@/lib/supabase";
```

- Sign up / Sign in:

```ts
// Email
await authHelpers.signUp("user@email.com", "password123", {
  first_name: "Yebin",
});
await authHelpers.signInWithEmail("user@email.com", "password123");

// Phone (requires phone auth enabled in Supabase Auth > Providers)
await authHelpers.signUpWithPhone("+15551234567", "password123");
await authHelpers.signInWithPhone("+15551234567", "password123");
```

- Session / User:

```ts
const { session } = await authHelpers.getSession();
const { user } = await authHelpers.getUser();
```

- Sign out:

```ts
await authHelpers.signOut();
```

### 5) Query your database

Create a table in Supabase (e.g., `profiles`) with RLS enabled and policies (see section 8).

```ts
// Read
const { data, error } = await supabase
  .from("profiles")
  .select("*")
  .eq("id", "user-uuid");

// Insert
const { error: insertError } = await supabase
  .from("profiles")
  .insert({ id: "user-uuid", full_name: "Yebin" });

// Update
const { error: updateError } = await supabase
  .from("profiles")
  .update({ full_name: "New Name" })
  .eq("id", "user-uuid");
```

### 6) Realtime subscriptions

```ts
const channel = supabase
  .channel("public:profiles")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "profiles" },
    (payload) => {
      console.log("Change received", payload);
    }
  )
  .subscribe();

// later
supabase.removeChannel(channel);
```

### 7) Storage (upload/download)

Create a bucket in Supabase Storage (e.g., `avatars`) and set appropriate policies.

```ts
// Upload
const file = new File([blob], "avatar.png", { type: "image/png" });
const { data, error } = await supabase.storage
  .from("avatars")
  .upload(`public/${Date.now()}.png`, file);

// Get public URL (if bucket is public)
const { data: urlData } = supabase.storage
  .from("avatars")
  .getPublicUrl("public/xyz.png");
```

### 8) Security and RLS policies

Always enable Row Level Security (RLS) and write explicit policies. Example for a `profiles` table owned by the user:

```sql
-- Enable
alter table public.profiles enable row level security;

-- Read own row
create policy "Read own profile" on public.profiles
for select using (auth.uid() = id);

-- Insert own row
create policy "Insert own profile" on public.profiles
for insert with check (auth.uid() = id);

-- Update own row
create policy "Update own profile" on public.profiles
for update using (auth.uid() = id);
```

Never expose the service role key in frontend code. Use the anon key for client-side and call secure logic via Edge Functions or your own backend when needed.

### 9) Environment setups

- Local dev: keep `.env.local` only on your machine; do not commit it.
- Preview/Prod: set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting provider’s environment variables.

### 10) Common troubleshooting

- 401/permission errors: confirm RLS policies allow the action for `auth.uid()`.
- Email/phone auth: enable providers in Supabase Auth settings and configure OTP templates.
- CORS: Supabase allows all origins by default; if restricted, add your dev and prod URLs.
- Realtime not firing: ensure the replication is enabled for the table (Database > Replication > WALRUS) and you subscribed to the correct schema/table.

### 11) Where things live in this project

- Client and helpers: `src/lib/supabase.ts`
- Example UI/auth flows: see components under `src/components/` and context `src/contexts/AuthContext.tsx`

### 12) Quick start

1. Add `.env.local` with your URL and anon key.
2. Restart dev server: `npm run dev`.
3. Use `authHelpers` in your pages to sign up/in.
4. Create tables and write RLS policies in Supabase.
5. Query with `supabase.from('table')...` in your components.
