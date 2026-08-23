import { z } from 'zod';

export const couponUpdateSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2)
    .max(32)
    .regex(/^[A-Za-z0-9_-]+$/, 'Use letters, numbers, dash, or underscore'),
  discountLabel: z.string().trim().min(1).max(24),
  headline: z.string().trim().min(1).max(80),
  note: z.string().trim().min(1).max(240),
  active: z.boolean(),
});
