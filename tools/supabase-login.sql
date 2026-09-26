-- SESSION VIEWER · sign in with email + password (csharpuser, 2026-09-26).
-- Run once in the SQL editor, AFTER supabase-setup.sql. Then, in the dashboard:
--   Authentication → Sign In / Providers → Email: turn OFF "Allow new users
--   to sign up" (so only accounts you make by hand exist).
--   Authentication → Users → Add user → Create new user, once per viewer:
--   their email + the password they will type into the sessions page, tick
--   "Auto Confirm User". Nothing is emailed to them. To take someone's
--   access away, delete their user on that same page.
--
-- The rule: any signed-in account may READ and LIST the recordings — and
-- since sign-ups are off, the only accounts are the ones you made. The
-- public key on the site still only adds them.

drop policy if exists "sessions: the owner may read" on storage.objects;
drop policy if exists "sessions: signed-in viewers may read" on storage.objects;
create policy "sessions: signed-in viewers may read"
  on storage.objects for select to authenticated
  using (bucket_id = 'sessions');

-- DELETING (2026-09-26, Eric: "i have so many sessions from me testing"):
-- a signed-in viewer may also delete recordings — the × on a session in
-- sessions.html, and "delete by name". Same reasoning as reading: the only
-- signed-in accounts are the ones you made. The public key still only adds.
drop policy if exists "sessions: signed-in viewers may delete" on storage.objects;
create policy "sessions: signed-in viewers may delete"
  on storage.objects for delete to authenticated
  using (bucket_id = 'sessions');
