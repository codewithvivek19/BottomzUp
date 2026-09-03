import { NextRequest, NextResponse } from 'next/server';
import { updateLeadStatus } from '@/lib/data/store';
import { requireAdmin } from '@/lib/require-admin';
import { leadStatusSchema, parseJsonArray } from '@/lib/lead-schema';

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { error } = await requireAdmin();
  if (error) return error;

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = leadStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const lead = await updateLeadStatus(id, parsed.data.status);
    return NextResponse.json({
      lead: {
        ...lead,
        items: parseJsonArray(lead.itemsJson),
        bundles: parseJsonArray(lead.bundlesJson),
        itemsJson: undefined,
        bundlesJson: undefined,
        createdAt: lead.createdAt.toISOString(),
        updatedAt: lead.updatedAt.toISOString(),
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Update failed';
    if (/0 rows|not found|PGRST116/i.test(message)) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    console.error('[api/leads/id] PATCH failed', err);
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
