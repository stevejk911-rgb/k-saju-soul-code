
export type Mode = 'LOVE' | 'MONEY' | null;

export type Gender = 'M' | 'F' | 'Other' | 'Prefer not';

export interface PersonDetails {
  name: string;
  birthDate: string; // YYYY-MM-DD
  birthTime: string; // HH:MM or 'unknown'
  gender: Gender;
}

export interface FormData {
  mode: Mode;
  user: PersonDetails;
  partner: PersonDetails | null;
  relationshipStatus: string;
  occupation: string;
  finalQuestion: string;
}

export interface WealthScore {
  label: string;
  stars: number;
}

export interface MonthlyPreview {
  month: number;
  tag: string;
  text: string;
}

export interface WealthResultV2 {
  title: string;
  badge: string;
  headline: string;
  summary: string;
  element_hint: string;
  scores: Record<string, WealthScore>;
  monthly_preview: MonthlyPreview[];
  monthly_locked: {
    ctaTitle: string;
    ctaList: string[];
  };
  good_bad_2026: {
    title: string;
    good: string[];
    bad: string[];
    note: string;
  };
  disclaimer: string;
}

export interface LoveResult {
  total_score: number;
  badge: string;
  summary: string;
  partner_instinctive_attraction: {
    title: string;
    quote: string;
    why: string;
  };
  score_breakdown: {
    label: string;
    score: number;
    tier: string;
  }[];
  locked_sections: {
    id: string;
    title: string;
    preview_quote: string;
    content?: string;
  }[];
}

export interface SajuResponse {
  mode: 'love' | 'money';
  free: {
    headline: string;
    one_liner: string;
  };
  wealth_v2?: WealthResultV2;
  love_result?: LoveResult;
  paywall: {
    price_anchor: string;
    discount_price: string;
    cta: string;
    bullets: string[];
    disclaimer: string;
    urgency: string;
  };
  share_card: {
    title: string;
    subtitle: string;
    tagline: string;
    cta: string;
  };
}
