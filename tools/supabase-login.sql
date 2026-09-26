-- SESSION VIEWER · sign in with a password (csharpuser, 2026-09-26). Run once
-- in the SQL editor, AFTER supabase-setup.sql. Then, in the dashboard:
--   Authentication → Users → Add user → Create new user: your email + a
--   password, tick "Auto Confirm User".
--   Authentication → Sign In / Providers → Email: turn OFF "Allow new users
--   to sign up" (so nobody else can make an account).
--
-- The rule: a signed-in user whose email is the one below may READ and LIST
-- the recordings. The public key on the site still only adds them.

drop policy if exists "sessions: the owner may read" on storage.objects;
create policy "sessions: the owner may read"
  on storage.objects for select to authenticated
  using (bucket_id = 'sessions' and auth.jwt() ->> 'email' = 'YOUR@EMAIL.HERE');   -- ← put the email you created the user with
