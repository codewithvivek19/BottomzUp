import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { requireAdmin } from '@/lib/require-admin';
import { createDataClient } from '@/lib/supabase/data-client';
import { createClient as createUserClient } from '@/lib/supabase/server';
import { getSupabaseServiceRoleKey } from '@/lib/supabase/env';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

const BUCKET = 'event-posters';

/**
 * Production: upload to Supabase Storage (survives Hostinger redeploys).
 * Local fallback: public/uploads/events on disk.
 */
export async function POST(req: NextRequest) {
  const { error } = await requireAdmin();
  if (error) return error;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'No file' }, { status: 400 });
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Use JPG, PNG, WebP, or GIF' }, { status: 400 });
  }

  if (file.size > 4 * 1024 * 1024) {
    return NextResponse.json({ error: 'Max 4MB' }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const ext = EXT[file.type] || 'jpg';
  const name = `event-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

  // Prefer Supabase Storage for production persistence
  try {
    const supabase = getSupabaseServiceRoleKey()
      ? createDataClient()
      : await createUserClient();

    if (getSupabaseServiceRoleKey()) {
      await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => null);
    }

    const { error: upErr } = await supabase.storage.from(BUCKET).upload(name, bytes, {
      contentType: file.type,
      upsert: false,
    });

    if (!upErr) {
      const { data } = supabase.storage.from(BUCKET).getPublicUrl(name);
      if (data?.publicUrl) {
        return NextResponse.json({ url: data.publicUrl, storage: 'supabase' });
      }
    } else {
      console.error('[api/upload] supabase storage', upErr.message);
    }
  } catch (err) {
    console.error('[api/upload] supabase storage failed', err);
  }

  // Local / Hostinger disk fallback
  try {
    const dir = path.join(process.cwd(), 'public', 'uploads', 'events');
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, name), bytes);
    return NextResponse.json({ url: `/uploads/events/${name}`, storage: 'disk' });
  } catch {
    return NextResponse.json(
      {
        error:
          'Upload failed. Create a public Supabase Storage bucket named "event-posters" (see web/supabase/storage-event-posters.sql), or paste an https image URL.',
      },
      { status: 500 }
    );
  }
}
