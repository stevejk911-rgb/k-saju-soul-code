
import { FormData } from './types';

export const INITIAL_FORM_STATE: FormData = {
  mode: null,
  user: {
    name: '',
    birthDate: '',
    birthTime: 'unknown',
    gender: 'M',
  },
  partner: null,
  relationshipStatus: '',
  occupation: '',
  finalQuestion: '',
};

export const STEPS_LOVE = [
  'Mode',
  'Your Profile',
  'The Target',
  'The Situation',
  'The Inquiry',
  'Decoding',
  'Result'
];

export const STEPS_MONEY = [
  'Mode',
  'Your Profile',
  'The Context',
  'The Inquiry',
  'Decoding',
  'Result'
];

export const COPY = {
  header: "K-SAJU // SOUL CODE",
  back: "GO BACK",
  mode: {
    title: "SPOILER ALERT.",
    subtitle: "Stop guessing your future. Access the decoded trajectory of your love and wealth.",
    btn_love: "CRUSH\nROMANCE\nLOVE",
    btn_money: "CAREER\nSUCCESS\nWEALTH"
  },
  user_details: {
    title: "YOUR IDENTITY",
    subtitle: "Your birth chart is the source code of your destiny. Let's analyze it.",
    name_ph: "Your Name",
    cta: "NEXT >"
  },
  partner_details: {
    title: "TARGET IDENTITY",
    subtitle: "Enter their details to calculate synchronicity and potential glitches.",
    name_ph: "Partner's Name",
    cta: "SYNC DATA >"
  },
  context: {
    love_title: "CURRENT STATUS",
    love_subtitle: "What is the nature of your connection? Be specific for a deeper decode.",
    love_ph: "e.g., Just started dating, mixed signals, looking for long-term potential...",
    money_title: "PROFESSIONAL RADIUS",
    money_subtitle: "What is your current field and the biggest friction point in your career?",
    money_ph: "e.g., Marketing lead, feeling stagnant, considering a pivot...",
    cta: "PROCEED"
  },
  final_key: {
    title: "THE FINAL QUERY",
    subtitle: "Ask the one question that determines your peace of mind.",
    love_ph: "Will we commit by the end of 2026? Is there a third party?",
    money_ph: "Is my new venture going to scale? When is the peak wealth window?",
    cta: "DECODE DESTINY"
  },
  paywall: {
    urgency: "Leaving now results in missing your peak window of opportunity.",
    bullets: [
      "The ONE critical event that will shift your trajectory in 2026.",
      "Exact dates for high-probability success or relationship breakthroughs.",
      "Strategic risk-avoidance guide tailored to your unique chart glitches."
    ],
    disclaimer: "Destiny is the blueprint; your choices are the execution."
  }
};
