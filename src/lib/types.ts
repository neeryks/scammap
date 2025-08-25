export type Category =
  | 'dating-romance'
  | 'online-shopping'
  | 'investment-crypto'
  | 'employment'
  | 'tech-support'
  | 'phishing'
  | 'loan-advance-fee'
  | 'lottery-prize'
  | 'rental-real-estate'
  | 'overcharging'
  | 'fake-products'
  | 'payment-fraud'
  | 'tourist-trap'
  | 'currency-exchange'
  | 'accommodation'
  | 'transportation'
  | 'harassment-extortion'
  | 'catfishing'
  | 'social-media'
  | 'business-email'
  | 'other';

export type PaymentMethod = 'upi' | 'card' | 'cash' | 'crypto' | 'UPI' | 'Net Banking' | 'Bank Transfer' | 'Wire Transfer' | 'Credit Card' | 'Cryptocurrency' | 'other';

export type ReporterVisibility = 'anonymous' | 'alias';

export interface Report {
  id: string;
  created_at: string;
  category: Category;
  location?: { lat: number; lon: number; precision_level: 'exact' | 'block' } | string;
  city?: string;
  venue_name?: string;
  address?: string;
  description: string;
  // Reporter linkage (Appwrite user id when available)
  reporter_user_id?: string;
  
  // Impact/Loss Information
  loss_type?: 'financial' | 'emotional' | 'time' | 'personal-data' | 'harassment' | 'reputation' | 'privacy' | 'multiple' | 'other-impact';
  loss_amount_inr?: number;
  emotional_impact?: 'mild-stress' | 'moderate-distress' | 'severe-distress' | 'anxiety-depression' | 'trust-issues' | 'relationship-impact' | 'other-emotional';
  time_wasted?: 'few-hours' | 'few-days' | 'few-weeks' | 'few-months' | 'over-year' | 'ongoing';
  personal_data_compromised?: 'contact-info' | 'financial-info' | 'identity-documents' | 'photos-videos' | 'passwords' | 'social-media' | 'work-info' | 'family-info' | 'other-data';
  
  payment_method?: PaymentMethod;
  // Legacy: capture non-monetary impacts as well
  impact_types?: Array<'financial' | 'harassment' | 'coercion' | 'privacy' | 'threats' | 'cybercrime' | 'other'>;
  impact_summary?: string;
  tactic_tags: string[];
  date_time_of_incident?: string;
  evidence_ids: string[];
  indicators: string[];
  outcome?: 'refund' | 'unresolved' | 'police_reported' | 'money_lost';
  scam_meter_score: number;
  reporter_visibility: ReporterVisibility;
}

export interface Evidence {
  id: string;
  type: 'image' | 'doc' | 'chat';
  storage_url: string;
  hash: string;
  exif_removed: boolean;
  redactions_applied: boolean;
  pii_flags: string[];
  ocr_text?: string;
}

export interface Venue {
  id: string;
  name: string;
  address?: string;
  lat: number;
  lon: number;
  city?: string;
  alias_names?: string[];
  phone_numbers?: string[];
  upi_ids?: string[];
  gstin?: string;
  aggregate_stats?: {
    incident_count: number;
    avg_loss?: number;
    top_tactics: string[];
  };
  scam_meter_score?: number;
}

export interface Indicator {
  id: string;
  type: 'phone' | 'upi' | 'social' | 'qr_hash';
  value_hash: string;
  linked_report_ids: string[];
}

export interface User {
  id: string;
  alias?: string;
  role: 'member' | 'mod' | 'partner';
  reputation_score: number;
  strikes_count: number;
}
