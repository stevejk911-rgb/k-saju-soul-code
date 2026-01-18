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

export interface ScoreBreakdown {
  label: string;
  score: number;
  tier: 'Low' | 'Okay' | 'High';
}

export interface TimelineEvent {
  window: string;
  theme: string;
  best_action: string;
  avoid: string;
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
  score_breakdown: ScoreBreakdown[];
  locked_sections: {
    id: string;
    title: string;
    preview_quote: string;
    content?: string;
  }[];
}

export interface MoneyResult {
  risk_map_title: string;
  free_timeline: TimelineEvent[];
  free_insight: string;
  locked: {
    next_move_checklist: string[];
    danger_zones: string[];
    highest_roi_habit: string;
  };
}

export interface SajuResponse {
  mode: 'love' | 'money';
  free: {
    headline: string;
    one_liner: string;
  };
  love_result?: LoveResult;
  money_result?: MoneyResult;
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