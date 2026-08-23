import { z } from 'zod';

export const leadCreateSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('contact'),
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(7).max(40),
    topic: z.string().trim().max(80).optional(),
    preferred: z.string().trim().max(40).optional(),
    message: z.string().trim().min(1).max(5000),
    eventDate: z.string().trim().max(40).optional(),
    guests: z.string().trim().max(20).optional(),
    eventType: z.string().trim().max(80).optional(),
    source: z.string().trim().max(40).optional(),
    website: z.string().optional(),
  }),
  z.object({
    type: z.literal('catering'),
    name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(200),
    phone: z.string().trim().min(7).max(40),
    eventDate: z.string().trim().max(40).optional(),
    guests: z.string().trim().max(20).optional(),
    eventType: z.string().trim().max(80).optional(),
    notes: z.string().trim().max(5000).optional(),
    items: z.array(z.string().max(200)).max(80).optional(),
    bundles: z.array(z.string().max(200)).max(40).optional(),
    website: z.string().optional(),
  }),
]);

export const leadStatusSchema = z.object({
  status: z.enum(['new', 'contacted', 'closed']),
});

export function parseJsonArray(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}
