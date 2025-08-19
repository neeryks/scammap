import { z } from 'zod';

export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  precision_level: z.enum(['exact', 'block'])
});

export const ReportSchema = z.object({
  category: z.enum(['dating', 'restaurant_overcharge', 'venue_scam', 'online_money', 'other']),
  location: LocationSchema,
  city: z.string().optional(),
  venue_name: z.string().optional(),
  address: z.string().optional(),
  description: z.string().min(10),
  loss_amount_inr: z.number().int().nonnegative().optional(),
  payment_method: z.enum(['upi', 'card', 'cash', 'crypto', 'other']).optional(),
  impact_types: z.array(z.enum(['financial', 'harassment', 'coercion', 'privacy', 'threats', 'cybercrime', 'other'])).optional().default([]),
  impact_summary: z.string().max(500).optional(),
  tactic_tags: z.array(z.string()).default([]),
  date_time_of_incident: z.string().optional(),
  evidence_ids: z.array(z.string()).default([]),
  indicators: z.array(z.string()).default([]),
  outcome: z.enum(['refund', 'unresolved', 'police_reported']).optional(),
  reporter_visibility: z.enum(['anonymous', 'alias', 'verified']).default('anonymous')
});

export type ReportInput = z.infer<typeof ReportSchema>;
