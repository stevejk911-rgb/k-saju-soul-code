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
  'Your Glitch',
  'The Target',
  'The Mess',
  'The Truth',
  'Decoding',
  'Reality Check'
];

export const STEPS_MONEY = [
  'Mode',
  'Your Glitch',
  'The Grind',
  'The Truth',
  'Decoding',
  'Reality Check'
];

export const COPY = {
  header: "K-SAJU // SOUL CODE",
  back: "GO BACK",
  mode: {
    title: "SPOILER ALERT.",
    subtitle: "Anxious about your crush? Scared about money? Stop guessing. Read the ending.",
    btn_love: "CRUSH\nFLIRTING\nLOVE",
    btn_money: "CAREER\nMONEY\nWEALTH"
  },
  user_details: {
    title: "WHO ARE YOU?",
    subtitle: "Your birth chart reveals your glitches. Let's expose them.",
    name_ph: "Your Name",
    cta: "NEXT >"
  },
  partner_details: {
    title: "THEIR DETAILS",
    subtitle: "Enter the details of the person you're interested in to calculate odds.",
    name_ph: "Their Name",
    cta: "CHECK COMPATIBILITY"
  },
  context: {
    love_title: "WHAT'S THE SITUATION? (Optional)",
    love_subtitle: "Dating? Crushing? Complicated? What specifically do you want to know?",
    love_ph: "e.g., Just started dating, he's pulling away, is this long term?",
    money_title: "REALITY CHECK (Optional)",
    money_subtitle: "Burnout? Broke? Where does it hurt? Or skip to the answer.",
    money_ph: "e.g., Hate my boss, stuck in junior role...",
    cta: "DIG DEEPER"
  },
  final_key: {
    title: "THE ELEPHANT IN THE ROOM (Optional)",
    subtitle: "Ask the thing that keeps you up at night.",
    love_ph: "Is he seeing someone else? Will he commit?",
    money_ph: "Should I quit tomorrow? Will I fail?",
    cta: "DECODE DESTINY"
  },
  paywall: {
    urgency: "Leaving now guarantees 3 more months of anxiety.",
    bullets: [
      "The ONE move that will make or break your relationship in 2026.",
      "Is marriage on the table for real? Your definitive timeline.",
      "The *exact* date you need to make your power move, or lose out."
    ],
    disclaimer: "Reality check. You decide the outcome."
  }
};