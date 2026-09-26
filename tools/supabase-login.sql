-- SESSION VIEWER · sign in with a password (csharpuser, 2026-09-26). Run once
-- in the SQL editor, AFTER supabase-setup.sql. Then, in the dashboard:
--   Authentication → Users → Add user → Create new user: the email
--   me@sd.app (it is a name, not a mailbox — nothing is sent to
--   it) + whatever password you want to type into the sessions page, tick
--   "Auto Confirm User".
--   Authentication → Sign In / Providers → Email: turn OFF "Allow new users
--   to sign up" (so nobody else can make an account).
--
-- The rule: that one account may READ and LIST the recordings. The public
-- key on the site still only adds them.

drop policy if exists "sessions: the owner may read" on storage.objects;
create policy "sessions: the owner may read"
  on storage.objects for select to authenticated
  using (bucket_id = 'sessions' and auth.jwt() ->> 'email' = 'me@sd.app');
