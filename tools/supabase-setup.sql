-- SESSION RECORDER · Supabase setup (csharpuser, 2026-09-25). Run once in
-- the project's SQL editor (Dashboard → SQL Editor → New query → paste → Run).
--
-- One private bucket, and one rule: the public (anon) key — the one that
-- ships on the site in recorder.js — may ADD a file to it and do nothing
-- else. No listing, no reading, no overwriting, no deleting. Reading the
-- recordings is sessions.html with the private service_role key, which
-- bypasses these rules and never leaves your own browser.

insert into storage.buckets (id, name, public, file_size_limit)
values ('sessions', 'sessions', false, 20971520)   -- 20 MB per chunk, far above what a chunk is
on conflict (id) do nothing;

drop policy if exists "sessions: anyone may add a recording" on storage.objects;
create policy "sessions: anyone may add a recording"
  on storage.objects for insert to anon
  with check (bucket_id = 'sessions');
