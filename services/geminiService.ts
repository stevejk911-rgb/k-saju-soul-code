import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FormData, SajuResponse } from "../types";

const sajuSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    mode: { type: Type.STRING, enum: ["love", "money"] },
    free: {
      type: Type.OBJECT,
      properties: {
        headline: { type: Type.STRING },
        one_liner: { type: Type.STRING },
      },
      required: ["headline", "one_liner"],
    },
    love_result: {
      type: Type.OBJECT,
      properties: {
        total_score: { type: Type.INTEGER },
        badge: { type: Type.STRING },
        summary: { type: Type.STRING },
        partner_instinctive_attraction: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            quote: { type: Type.STRING },
            why: { type: Type.STRING },
          },
          required: ["title", "quote", "why"],
        },
        score_breakdown: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              score: { type: Type.INTEGER },
              tier: { type: Type.STRING, enum: ["Low", "Okay", "High"] },
            },
            required: ["label", "score", "tier"],
          },
        },
        locked_sections: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              title: { type: Type.STRING },
              preview_quote: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["id", "title", "preview_quote"],
          },
        },
      },
    },
    money_result: {
      type: Type.OBJECT,
      properties: {
        risk_map_title: { type: Type.STRING },
        free_timeline: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              window: { type: Type.STRING },
              theme: { type: Type.STRING },
              best_action: { type: Type.STRING },
              avoid: { type: Type.STRING },
            },
            required: ["window", "theme", "best_action", "avoid"],
          },
        },
        free_insight: { type: Type.STRING },
        locked: {
          type: Type.OBJECT,
          properties: {
            next_move_checklist: { type: Type.ARRAY, items: { type: Type.STRING } },
            danger_zones: { type: Type.ARRAY, items: { type: Type.STRING } },
            highest_roi_habit: { type: Type.STRING },
          },
          required: ["next_move_checklist", "danger_zones", "highest_roi_habit"],
        },
      },
    },
    paywall: {
      type: Type.OBJECT,
      properties: {
        price_anchor: { type: Type.STRING },
        discount_price: { type: Type.STRING },
        cta: { type: Type.STRING },
        bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
        disclaimer: { type: Type.STRING },
        urgency: { type: Type.STRING },
      },
      required: ["price_anchor", "discount_price", "cta", "bullets", "disclaimer", "urgency"],
    },
    share_card: {
      type: Type.OBJECT,
      properties: {
        title: { type: Type.STRING },
        subtitle: { type: Type.STRING },
        tagline: { type: Type.STRING },
        cta: { type: Type.STRING },
      },
      required: ["title", "subtitle", "tagline", "cta"],
    },
  },
  required: ["mode", "free", "paywall", "share_card"],
};

export const generateSajuReading = async (formData: FormData, isUnlocked: boolean): Promise<SajuResponse> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing");
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    You are K-Saju, a modern, edgy, MZ-style reading assistant.
    Tone: Provocative, Direct, "Risk-Avoidant", Casual, Young. English Language Only.
    Avoid: Mystical fluff, old-fashioned fortune-teller speech.
    
    Goal: Make the user feel like they need this info to avoid a disaster or a wasted year.
    Use phrasing like: "You're ignoring the signs," "This is your last warning," "Stop wasting time."

    USER INPUT HANDLING:
    - You will receive "USER_URGENT_QUESTION". 
    - IF it is not empty, you MUST address this specific question in the 'free.one_liner' or 'summary' section. The user is anxious about this.
    - If empty, proceed with standard reading.

    CRITICAL DATE LOGIC:
    - Today is assumed to be 2025.
    - All predictions and timelines MUST start from 2026 onwards. Do not mention 2024 or 2025 in the future prediction slots.

    PRICING LOGIC:
    - Anchor Price: $10.99
    - Discount Price: $5.00

    --- MODE SPECIFIC INSTRUCTIONS ---

    IF MODE = "LOVE":
    1. The 'locked_sections' MUST contain exactly these 4 items (in this order):
       - Title: "The ONE move" (Content: The critical action they must take in 2026 to save/start the relationship)
       - Title: "Marriage Timeline" (Content: Is marriage real? When? Give a definitive timeline.)
       - Title: "Their Secret Desire" (Content: What the partner wants but isn't saying.)
       - Title: "Power Move Date" (Content: The EXACT date in 2026 to make a move. Pick a specific date based on Saju logic.)
    
    2. The 'paywall.bullets' MUST match the locked sections exactly:
       - "The ONE move that will make or break your relationship in 2026."
       - "Is marriage on the table for real? Your definitive timeline."
       - "Their secret desire you're completely missing."
       - "The *exact* date you need to make your power move, or lose out."

    IF MODE = "MONEY":
    - LENGTH REQUIREMENT: All outputs for money mode must be 2X LONGER than usual. Be extremely detailed.
    - 'free_insight': Must be a substantial paragraph (approx 4-5 sentences) diving deep into the specific friction points in their career and wealth accumulation. Explain *why* they are stuck.
    - 'free_timeline': 
        - 'theme': 2-3 words.
        - 'best_action': A full sentence describing specifically what to do (e.g., "Liquidate low-yield assets and pivot to...").
        - 'avoid': A full sentence describing the specific trap.
    - 'locked':
        - 'highest_roi_habit': Don't just name a habit. Explain exactly how to implement it to double their efficiency.
        - 'danger_zones': specific, detailed warnings.
        - 'next_move_checklist': specific, actionable steps.
    
    IMPORTANT: Provide the "locked" content in the response (filled out) even if the user hasn't paid yet.
  `;

  // Emphasize the question in the prompt
  const finalQuestionContext = formData.finalQuestion 
    ? `USER_URGENT_QUESTION: "${formData.finalQuestion}" (Use this to tailor the reading!)`
    : `USER_URGENT_QUESTION: (None provided, general reading)`;

  const prompt = JSON.stringify({
    ...formData,
    finalQuestionContext: finalQuestionContext, 
    is_unlocked: isUnlocked 
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: sajuSchema,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    return JSON.parse(text) as SajuResponse;
  } catch (error) {
    console.error("Gemini API Error", error);
    
    // Fallback logic
    const isLove = formData.mode === 'LOVE';
    
    return {
      mode: isLove ? 'love' : 'money',
      free: {
        headline: "WAKE UP.",
        one_liner: "You're sleepwalking into a mess."
      },
      love_result: isLove ? {
        total_score: 65,
        badge: "WARNING",
        summary: "The stars show a volatile mix. You are pushing when you should be pulling.",
        partner_instinctive_attraction: {
            title: "Instinct",
            quote: "They are confused.",
            why: "Your energy is clashing with their current cycle."
        },
        score_breakdown: [
            { label: "Chemistry", score: 80, tier: "High" },
            { label: "Timing", score: 40, tier: "Low" }
        ],
        locked_sections: [
            { id: "1", title: "The ONE move", preview_quote: "It's risky but...", content: "Pull back immediately." },
            { id: "2", title: "Marriage Timeline", preview_quote: "The window is closing...", content: "2027 is your year." },
            { id: "3", title: "Their Secret Desire", preview_quote: "They haven't told you...", content: "They want stability, not excitement." },
            { id: "4", title: "Power Move Date", preview_quote: "Mark your calendar...", content: "October 14th, 2026." }
        ]
      } : undefined,
      money_result: !isLove ? {
        risk_map_title: "FINANCIAL STAGNATION & MISSED PEAKS",
        free_insight: "You are currently operating at 40% of your earning potential because you are playing it too safe in a market that rewards calculated aggression. Your chart indicates a tendency to hoard cash when you should be leveraging assets, leading to a slow bleed of opportunity cost. The friction you feel at work isn't just burnout; it's misalignment with your wealth destiny.",
        free_timeline: [
          {
            window: "Q3 2026",
            theme: "The Illusion of Stability",
            best_action: "Aggressively pay down high-interest debt and liquidate underperforming legacy assets to prepare for a pivot.",
            avoid: "Signing long-term contracts or leases that bind you to your current geographic location."
          },
          {
            window: "Q1 2027",
            theme: "The Golden Pivot",
            best_action: "Launch the side project you've been sitting on; the energy favors new ventures.",
            avoid: "Listening to conservative advice from family members who don't understand the new market."
          }
        ],
        locked: {
          next_move_checklist: [
             "Audit all recurring subscription leaks immediately.", 
             "Renegotiate your primary income source base salary.", 
             "Update your liquidity strategy for the coming recession."
          ],
          danger_zones: [
             "Cryptocurrency speculation in late 2026 due to market volatility.", 
             "Lending money to family members without a contract."
          ],
          highest_roi_habit: "Deep Work Scheduling: Your attention span is fragmented. You must block 4 hours daily for single-task execution to break through your current income ceiling."
        }
      } : undefined,
      paywall: {
        price_anchor: "$10.99",
        discount_price: "$5.00",
        cta: "UNLOCK TRUTH",
        bullets: isLove ? [
             "The ONE move that will make or break your relationship in 2026.",
             "Is marriage on the table for real? Your definitive timeline.",
             "Their secret desire you're completely missing.",
             "The *exact* date you need to make your power move, or lose out."
        ] : [
             "Exact dates for your wealth peak", 
             "The one career pivot that doubles income", 
             "Who to avoid doing business with"
        ],
        disclaimer: "It's your life. Don't mess it up.",
        urgency: "Leaving now guarantees 3 more months of anxiety.",
      },
      share_card: {
        title: "K-SAJU // REALITY CHECK",
        subtitle: "I just got roasted by the stars.",
        tagline: "Decode your glitch",
        cta: "Get Yours"
      }
    };
  }
};