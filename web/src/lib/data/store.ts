/**
 * App data access via Supabase HTTPS (PostgREST).
 * Hostinger’s Connect wizard supports this path (SUPABASE_URL + SUPABASE_API_KEY).
 *
 * - Public reads/inserts: anon (or service) client
 * - Admin mutations/lists: cookie session client (authenticated role + RLS)
 */
import { createDataClient } from '@/lib/supabase/data-client';
import { createClient as createUserClient } from '@/lib/supabase/server';
import {
  mapCoupon,
  mapEvent,
  mapLead,
  newId,
  type CouponRow,
  type EventRow,
  type LeadRow,
} from './types';

const EVENT = 'Event';
const COUPON = 'CouponSetting';
const LEAD = 'Lead';

type Sb = Awaited<ReturnType<typeof createUserClient>>;

async function publicSb() {
  return createDataClient();
}

async function userSb(): Promise<Sb> {
  return createUserClient();
}

/** Admin CRUD: prefer service role (bypasses RLS); else logged-in user JWT. */
async function adminSb(): Promise<Sb | ReturnType<typeof createDataClient>> {
  const { getSupabaseServiceRoleKey } = await import('@/lib/supabase/env');
  if (getSupabaseServiceRoleKey()) return createDataClient();
  return createUserClient();
}

function throwSb(error: { message?: string } | null, label: string): never {
  throw new Error(`[data/${label}] ${error?.message || 'Supabase request failed'}`);
}

export async function probeSupabaseData(): Promise<{
  ok: boolean;
  eventCount: number | null;
  error: string | null;
  tables?: { Event: boolean; CouponSetting: boolean; Lead: boolean };
}> {
  try {
    const client = await publicSb();
    const [events, coupons, leads] = await Promise.all([
      client.from(EVENT).select('id', { count: 'exact', head: true }).eq('published', true),
      client.from(COUPON).select('id', { count: 'exact', head: true }).eq('active', true),
      client.from(LEAD).select('id', { count: 'exact', head: true }).limit(1),
    ]);

    const tables = {
      Event: !events.error,
      CouponSetting: !coupons.error,
      // Anon often cannot SELECT leads (insert-only) — that is OK.
      Lead: !leads.error,
    };
    if (events.error) {
      return { ok: false, eventCount: null, error: events.error.message, tables };
    }
    if (coupons.error) {
      return {
        ok: false,
        eventCount: events.count ?? 0,
        error: `CouponSetting: ${coupons.error.message}`,
        tables,
      };
    }
    return {
      ok: true,
      eventCount: events.count ?? 0,
      error: null,
      tables,
    };
  } catch (err) {
    return {
      ok: false,
      eventCount: null,
      error: err instanceof Error ? err.message : 'supabase_probe_failed',
    };
  }
}

export async function listEvents(opts: {
  publishedOnly?: boolean;
  from?: Date;
  to?: Date;
  asAdmin?: boolean;
}): Promise<EventRow[]> {
  const client = opts.asAdmin ? await adminSb() : await publicSb();
  let q = client.from(EVENT).select('*').order('startsAt', { ascending: true });
  if (opts.publishedOnly) q = q.eq('published', true);
  if (opts.from) q = q.gte('startsAt', opts.from.toISOString());
  if (opts.to) q = q.lte('startsAt', opts.to.toISOString());
  const { data, error } = await q;
  if (error) throwSb(error, 'listEvents');
  return (data || []).map((row) => mapEvent(row as Record<string, unknown>));
}

export async function getEvent(id: string): Promise<EventRow | null> {
  const { data, error } = await (await publicSb())
    .from(EVENT)
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throwSb(error, 'getEvent');
  return data ? mapEvent(data as Record<string, unknown>) : null;
}

export async function createEvent(input: {
  title: string;
  description: string;
  startsAt: Date;
  endsAt?: Date | null;
  imageUrl?: string | null;
  published?: boolean;
}): Promise<EventRow> {
  const now = new Date().toISOString();
  const row = {
    id: newId(),
    title: input.title,
    description: input.description,
    startsAt: input.startsAt.toISOString(),
    endsAt: input.endsAt ? input.endsAt.toISOString() : null,
    imageUrl: input.imageUrl ?? null,
    published: input.published ?? true,
    createdAt: now,
    updatedAt: now,
  };
  const { data, error } = await (await adminSb())
    .from(EVENT)
    .insert(row)
    .select('*')
    .single();
  if (error) throwSb(error, 'createEvent');
  return mapEvent(data as Record<string, unknown>);
}

export async function updateEvent(
  id: string,
  input: Partial<{
    title: string;
    description: string;
    startsAt: Date;
    endsAt: Date | null;
    imageUrl: string | null;
    published: boolean;
  }>
): Promise<EventRow> {
  const patch: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  if (input.title !== undefined) patch.title = input.title;
  if (input.description !== undefined) patch.description = input.description;
  if (input.startsAt !== undefined) patch.startsAt = input.startsAt.toISOString();
  if (input.endsAt !== undefined) {
    patch.endsAt = input.endsAt ? input.endsAt.toISOString() : null;
  }
  if (input.imageUrl !== undefined) patch.imageUrl = input.imageUrl;
  if (input.published !== undefined) patch.published = input.published;

  const { data, error } = await (await adminSb())
    .from(EVENT)
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throwSb(error, 'updateEvent');
  return mapEvent(data as Record<string, unknown>);
}

export async function deleteEvent(id: string): Promise<void> {
  const { error } = await (await adminSb()).from(EVENT).delete().eq('id', id);
  if (error) throwSb(error, 'deleteEvent');
}

export async function countPublishedEvents(): Promise<number> {
  const { count, error } = await (await publicSb())
    .from(EVENT)
    .select('id', { count: 'exact', head: true })
    .eq('published', true);
  if (error) throwSb(error, 'countPublishedEvents');
  return count ?? 0;
}

export async function listUpcomingPublished(take = 5): Promise<EventRow[]> {
  const { data, error } = await (await publicSb())
    .from(EVENT)
    .select('*')
    .eq('published', true)
    .gte('startsAt', new Date().toISOString())
    .order('startsAt', { ascending: true })
    .limit(take);
  if (error) throwSb(error, 'listUpcomingPublished');
  return (data || []).map((row) => mapEvent(row as Record<string, unknown>));
}

export async function getActiveCoupon(): Promise<CouponRow | null> {
  const { data, error } = await (await publicSb())
    .from(COUPON)
    .select('*')
    .eq('active', true)
    .order('updatedAt', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throwSb(error, 'getActiveCoupon');
  return data ? mapCoupon(data as Record<string, unknown>) : null;
}

export async function getLatestCoupon(): Promise<CouponRow | null> {
  const { data, error } = await (await adminSb())
    .from(COUPON)
    .select('*')
    .order('updatedAt', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throwSb(error, 'getLatestCoupon');
  return data ? mapCoupon(data as Record<string, unknown>) : null;
}

export async function createCoupon(input: {
  code: string;
  discountLabel?: string;
  headline?: string;
  note?: string;
  active?: boolean;
}): Promise<CouponRow> {
  const now = new Date().toISOString();
  const row = {
    id: newId(),
    code: input.code,
    discountLabel: input.discountLabel ?? '10%',
    headline: input.headline ?? 'In-house only',
    note:
      input.note ??
      'Valid on food. Not stackable with other offers. Ask your server.',
    active: input.active ?? true,
    createdAt: now,
    updatedAt: now,
  };
  const { data, error } = await (await adminSb())
    .from(COUPON)
    .insert(row)
    .select('*')
    .single();
  if (error) throwSb(error, 'createCoupon');
  return mapCoupon(data as Record<string, unknown>);
}

export async function updateCoupon(
  id: string,
  input: Partial<{
    code: string;
    discountLabel: string;
    headline: string;
    note: string;
    active: boolean;
  }>
): Promise<CouponRow> {
  const patch: Record<string, unknown> = {
    ...input,
    updatedAt: new Date().toISOString(),
  };
  const { data, error } = await (await adminSb())
    .from(COUPON)
    .update(patch)
    .eq('id', id)
    .select('*')
    .single();
  if (error) throwSb(error, 'updateCoupon');
  return mapCoupon(data as Record<string, unknown>);
}

export async function deactivateOtherCoupons(exceptId: string): Promise<void> {
  const { error } = await (await adminSb())
    .from(COUPON)
    .update({ active: false, updatedAt: new Date().toISOString() })
    .neq('id', exceptId);
  if (error) throwSb(error, 'deactivateOtherCoupons');
}

export async function listLeads(take = 200): Promise<LeadRow[]> {
  const { data, error } = await (await adminSb())
    .from(LEAD)
    .select('*')
    .order('createdAt', { ascending: false })
    .limit(take);
  if (error) throwSb(error, 'listLeads');
  return (data || []).map((row) => mapLead(row as Record<string, unknown>));
}

export async function countLeads(where?: {
  status?: string;
  createdAtGte?: Date;
}): Promise<number> {
  let q = (await adminSb()).from(LEAD).select('id', { count: 'exact', head: true });
  if (where?.status) q = q.eq('status', where.status);
  if (where?.createdAtGte) q = q.gte('createdAt', where.createdAtGte.toISOString());
  const { count, error } = await q;
  if (error) throwSb(error, 'countLeads');
  return count ?? 0;
}

export async function createLead(
  input: Omit<LeadRow, 'id' | 'createdAt' | 'updatedAt'> & {
    id?: string;
  }
): Promise<LeadRow> {
  const now = new Date().toISOString();
  const row = {
    id: input.id || newId(),
    type: input.type,
    name: input.name,
    email: input.email,
    phone: input.phone,
    topic: input.topic,
    preferred: input.preferred,
    message: input.message,
    eventDate: input.eventDate,
    guests: input.guests,
    eventType: input.eventType,
    notes: input.notes,
    itemsJson: input.itemsJson,
    bundlesJson: input.bundlesJson,
    status: input.status,
    source: input.source,
    userAgent: input.userAgent,
    createdAt: now,
    updatedAt: now,
  };
  // Public forms use anon insert policy
  const { data, error } = await (await publicSb())
    .from(LEAD)
    .insert(row)
    .select('*')
    .single();
  if (error) throwSb(error, 'createLead');
  return mapLead(data as Record<string, unknown>);
}

export async function updateLeadStatus(id: string, status: string): Promise<LeadRow> {
  const { data, error } = await (await adminSb())
    .from(LEAD)
    .update({ status, updatedAt: new Date().toISOString() })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throwSb(error, 'updateLeadStatus');
  return mapLead(data as Record<string, unknown>);
}
