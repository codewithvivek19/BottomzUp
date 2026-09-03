export type EventRow = {
  id: string;
  title: string;
  description: string;
  startsAt: Date;
  endsAt: Date | null;
  imageUrl: string | null;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CouponRow = {
  id: string;
  code: string;
  discountLabel: string;
  headline: string;
  note: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type LeadRow = {
  id: string;
  type: string;
  name: string;
  email: string;
  phone: string;
  topic: string | null;
  preferred: string | null;
  message: string | null;
  eventDate: string | null;
  guests: string | null;
  eventType: string | null;
  notes: string | null;
  itemsJson: string;
  bundlesJson: string;
  status: string;
  source: string | null;
  userAgent: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export function asDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === 'string' || typeof value === 'number') return new Date(value);
  return new Date(0);
}

export function mapEvent(row: Record<string, unknown>): EventRow {
  return {
    id: String(row.id),
    title: String(row.title ?? ''),
    description: String(row.description ?? ''),
    startsAt: asDate(row.startsAt),
    endsAt: row.endsAt == null ? null : asDate(row.endsAt),
    imageUrl: row.imageUrl == null ? null : String(row.imageUrl),
    published: Boolean(row.published),
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };
}

export function mapCoupon(row: Record<string, unknown>): CouponRow {
  return {
    id: String(row.id),
    code: String(row.code ?? ''),
    discountLabel: String(row.discountLabel ?? '10%'),
    headline: String(row.headline ?? 'In-house only'),
    note: String(row.note ?? ''),
    active: Boolean(row.active),
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };
}

export function mapLead(row: Record<string, unknown>): LeadRow {
  return {
    id: String(row.id),
    type: String(row.type ?? ''),
    name: String(row.name ?? ''),
    email: String(row.email ?? ''),
    phone: String(row.phone ?? ''),
    topic: row.topic == null ? null : String(row.topic),
    preferred: row.preferred == null ? null : String(row.preferred),
    message: row.message == null ? null : String(row.message),
    eventDate: row.eventDate == null ? null : String(row.eventDate),
    guests: row.guests == null ? null : String(row.guests),
    eventType: row.eventType == null ? null : String(row.eventType),
    notes: row.notes == null ? null : String(row.notes),
    itemsJson: String(row.itemsJson ?? '[]'),
    bundlesJson: String(row.bundlesJson ?? '[]'),
    status: String(row.status ?? 'new'),
    source: row.source == null ? null : String(row.source),
    userAgent: row.userAgent == null ? null : String(row.userAgent),
    createdAt: asDate(row.createdAt),
    updatedAt: asDate(row.updatedAt),
  };
}

export function newId(): string {
  return crypto.randomUUID();
}
