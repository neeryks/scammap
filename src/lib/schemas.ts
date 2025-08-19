import { z } from 'zod';

export const LocationSchema = z.object({
  lat: z.number().min(-90).max(90),
  lon: z.number().min(-180).max(180),
  precision_level: z.enum(['exact', 'block'])
});

const Categories = [
  'dating-romance',
  'online-shopping',
  'investment-crypto',
  'employment',
  'tech-support',
  'phishing',
  'loan-advance-fee',
  'lottery-prize',
  'rental-real-estate',
  'overcharging',
  'fake-products',
  'payment-fraud',
  'tourist-trap',
  'currency-exchange',
  'accommodation',
  'transportation',
  'harassment-extortion',
  'catfishing',
  'social-media',
  'business-email',
  'other'
] as const

const PaymentMethods = [
  'upi', 'card', 'cash', 'crypto', 'UPI', 'Net Banking', 'Bank Transfer', 'Wire Transfer', 'Credit Card', 'Cryptocurrency', 'other'
] as const

export const ReportSchema = z.object({
  category: z.enum(Categories),
  location: z.union([LocationSchema, z.string()]).optional(),
  city: z.string().optional(),
  venue_name: z.string().optional(),
  address: z.string().optional(),
  description: z.string().min(10),
  // Impact/Loss
  loss_type: z.enum(['financial', 'emotional', 'time', 'personal-data', 'harassment', 'reputation', 'privacy', 'multiple', 'other-impact']).optional(),
  loss_amount_inr: z.number().int().nonnegative().optional(),
  emotional_impact: z.enum(['mild-stress','moderate-distress','severe-distress','anxiety-depression','trust-issues','relationship-impact','other-emotional']).optional(),
  time_wasted: z.enum(['few-hours','few-days','few-weeks','few-months','over-year','ongoing']).optional(),
  personal_data_compromised: z.enum(['contact-info','financial-info','identity-documents','photos-videos','passwords','social-media','work-info','family-info','other-data']).optional(),
  payment_method: z.enum(PaymentMethods).optional(),
  impact_types: z.array(z.enum(['financial', 'harassment', 'coercion', 'privacy', 'threats', 'cybercrime', 'other'])).optional().default([]),
  impact_summary: z.string().max(500).optional(),
  tactic_tags: z.array(z.string()).default([]),
  date_time_of_incident: z.string().optional(),
  evidence_ids: z.array(z.string()).default([]),
  indicators: z.array(z.string()).default([]),
  outcome: z.enum(['refund', 'unresolved', 'police_reported', 'money_lost']).optional(),
  reporter_visibility: z.enum(['anonymous', 'alias', 'verified']).default('anonymous'),
  reporter_user_id: z.string().optional()
});

export type ReportInput = z.infer<typeof ReportSchema>;
