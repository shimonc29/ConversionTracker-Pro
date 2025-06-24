import { z } from 'zod';

export const EventSchema = z.object({
  eventId: z.string(),
  siteId: z.string(),
  type: z.enum(['page_view', 'custom', 'conversion']),
  data: z.record(z.any()),
  clientTimestamp: z.string(),
});

export function validateEvent(event: unknown) {
  return EventSchema.safeParse(event);
}

export function validateBatch(events: unknown[]): any[] {
  if (!Array.isArray(events)) return [];
  return events.map(validateEvent).filter(r => r.success).map(r => r.data);
} 