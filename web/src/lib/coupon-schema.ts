import { z } from 'zod';

/** Normalize "100", "100%", "100 off" → "100%" for consistent UI. */
export function normalizeDiscountLabel(raw: string): string {
  const cleaned = String(raw || '')
    .trim()
    .replace(/\s*off\s*/gi, '')
    .replace(/%/g, '')
    .trim();
  if (!cleaned) return '10%';
  // Keep free-form labels like "BOGO" without forcing %
  if (/^[0-9]+(\.[0-9]+)?$/.test(cleaned)) return `${cleaned}%`;
  if (/%/i.test(raw)) return `${cleaned}%`;
  return String(raw).trim();
}

export function formatDiscountLabel(raw?: string | null): string {
  return normalizeDiscountLabel(raw || '10%');
}

export const couponUpdateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/, 'Use letters, numbers, dash, or underscore'),
  discountLabel: z
    .string()
    .trim()
    .min(1)
    .max(24)
    .transform((v) => normalizeDiscountLabel(v)),
  headline: z.string().trim().min(1).max(80),
  note: z.string().trim().min(1).max(240),
  active: z.boolean(),
});
