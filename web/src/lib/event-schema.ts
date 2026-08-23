import { z } from 'zod';

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .nullable()
  .optional()
  .refine(
    (v) => {
      if (v == null || v === '') return true;
      return (
        v.startsWith('/uploads/') ||
        v.startsWith('/assets/') ||
        v.startsWith('/legacy/assets/') ||
        /^https?:\/\//i.test(v)
      );
    },
    { message: 'Image must be an uploaded path or http(s) URL' }
  );

export const eventCreateSchema = z
  .object({
    title: z.string().trim().min(2).max(120),
    description: z.string().trim().min(2).max(5000),
    startsAt: z.string().min(8),
    endsAt: z.string().trim().nullable().optional(),
    imageUrl: optionalUrl,
    published: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    const start = new Date(data.startsAt);
    if (Number.isNaN(start.getTime())) {
      ctx.addIssue({ code: 'custom', path: ['startsAt'], message: 'Invalid start time' });
      return;
    }
    if (data.endsAt) {
      const end = new Date(data.endsAt);
      if (Number.isNaN(end.getTime())) {
        ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'Invalid end time' });
      } else if (end.getTime() <= start.getTime()) {
        ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'End must be after start' });
      }
    }
  });

export const eventUpdateSchema = z
  .object({
    title: z.string().trim().min(2).max(120).optional(),
    description: z.string().trim().min(2).max(5000).optional(),
    startsAt: z.string().min(8).optional(),
    endsAt: z.string().trim().nullable().optional(),
    imageUrl: optionalUrl,
    published: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.startsAt) {
      const start = new Date(data.startsAt);
      if (Number.isNaN(start.getTime())) {
        ctx.addIssue({ code: 'custom', path: ['startsAt'], message: 'Invalid start time' });
        return;
      }
      if (data.endsAt) {
        const end = new Date(data.endsAt);
        if (Number.isNaN(end.getTime())) {
          ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'Invalid end time' });
        } else if (end.getTime() <= start.getTime()) {
          ctx.addIssue({ code: 'custom', path: ['endsAt'], message: 'End must be after start' });
        }
      }
    }
  });

export function normalizeImageUrl(url: string | null | undefined) {
  if (!url) return null;
  const trimmed = url.trim();
  return trimmed.length ? trimmed : null;
}
