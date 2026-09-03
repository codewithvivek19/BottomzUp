-- Run once in Supabase → SQL Editor
-- Public bucket for event posters uploaded from /admin/events

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-posters',
  'event-posters',
  true,
  4194304,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set public = true;

-- Authenticated managers (and service role) can upload
drop policy if exists "Auth upload event posters" on storage.objects;
create policy "Auth upload event posters"
  on storage.objects for insert
  to authenticated, service_role
  with check (bucket_id = 'event-posters');

drop policy if exists "Auth update event posters" on storage.objects;
create policy "Auth update event posters"
  on storage.objects for update
  to authenticated, service_role
  using (bucket_id = 'event-posters');

drop policy if exists "Public read event posters" on storage.objects;
create policy "Public read event posters"
  on storage.objects for select
  to public
  using (bucket_id = 'event-posters');
