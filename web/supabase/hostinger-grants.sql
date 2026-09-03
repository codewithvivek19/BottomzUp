-- Run once in Supabase Dashboard → SQL Editor.
-- Required so Hostinger’s SUPABASE_API_KEY (anon) can use PostgREST
-- against Prisma-created tables ("Event", "CouponSetting", "Lead").

-- Expose tables to API roles
grant usage on schema public to anon, authenticated, service_role;
grant select, insert, update, delete on table public."Event" to anon, authenticated, service_role;
grant select, insert, update, delete on table public."CouponSetting" to anon, authenticated, service_role;
grant select, insert, update, delete on table public."Lead" to anon, authenticated, service_role;

-- RLS: enable and allow the policies below
alter table public."Event" enable row level security;
alter table public."CouponSetting" enable row level security;
alter table public."Lead" enable row level security;

-- Public can read published events
drop policy if exists "Public read published events" on public."Event";
create policy "Public read published events"
  on public."Event" for select
  to anon, authenticated
  using (published = true);

-- Authenticated managers can manage all events (tighten later if needed)
drop policy if exists "Auth manage events" on public."Event";
create policy "Auth manage events"
  on public."Event" for all
  to authenticated
  using (true)
  with check (true);

-- Coupons: public read active; auth manage
drop policy if exists "Public read active coupons" on public."CouponSetting";
create policy "Public read active coupons"
  on public."CouponSetting" for select
  to anon, authenticated
  using (active = true);

drop policy if exists "Auth manage coupons" on public."CouponSetting";
create policy "Auth manage coupons"
  on public."CouponSetting" for all
  to authenticated
  using (true)
  with check (true);

-- Leads: anon can insert (contact forms); auth can read/update
drop policy if exists "Anon insert leads" on public."Lead";
create policy "Anon insert leads"
  on public."Lead" for insert
  to anon, authenticated
  with check (true);

drop policy if exists "Auth manage leads" on public."Lead";
create policy "Auth manage leads"
  on public."Lead" for all
  to authenticated
  using (true)
  with check (true);
