
import { GoogleGenAI, Type } from "@google/genai";
import { FormData, SajuResponse } from "../types";

export const generateSajuReading = async (formData: FormData): Promise<SajuResponse> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const isLove = formData.mode === 'LOVE';

  const systemInstruction = `
    You are 'THE SOUL CODE', a premium, high-fidelity destiny analyst.
    TONE: Sophisticated, insightful, direct, and slightly cinematic. No fluff.
    LANGUAGE: STRICTLY ENGLISH. All text, descriptions, and labels must be in English.
    STYLE: Use modern terminology (e.g., 'trajectory', 'glitch', 'synchronicity', 'peak window').
    ${isLove ? 'Focus on deep psychological compatibility and timeline odds.' : 'Focus on wealth windows, career pivots, and strategic risk management.'}
  `;

  const prompt = `
    Analyze this user profile: ${JSON.stringify(formData)}
    Question: ${formData.finalQuestion}

    Task: Generate a detailed Saju-based reading in JSON format.
    CRITICAL: Everything must be in English. 
    Translate any traditional Saju concepts into high-fidelity English analytical terms.
  `;

  // Define a fixed set of score properties to avoid "empty OBJECT properties" schema error
  const scoreSchema = {
    type: Type.OBJECT,
    properties: {
      label: { type: Type.STRING, description: "Display label for this dimension" },
      stars: { type: Type.NUMBER, description: "Score from 1 to 5" }
    },
    required: ["label", "stars"]
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mode: { type: Type.STRING },
            free: {
              type: Type.OBJECT,
              properties: {
                headline: { type: Type.STRING },
                one_liner: { type: Type.STRING },
              },
              required: ["headline", "one_liner"]
            },
            love_result: {
              type: Type.OBJECT,
              properties: {
                total_score: { type: Type.NUMBER },
                badge: { type: Type.STRING },
                summary: { type: Type.STRING },
                partner_instinctive_attraction: {
                  type: Type.OBJECT,
                  properties: { 
                    title: { type: Type.STRING }, 
                    quote: { type: Type.STRING }, 
                    why: { type: Type.STRING } 
                  },
                  required: ["title", "quote", "why"]
                },
                score_breakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { 
                      label: { type: Type.STRING }, 
                      score: { type: Type.NUMBER }, 
                      tier: { type: Type.STRING } 
                    },
                    required: ["label", "score", "tier"]
                  }
                },
                locked_sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { 
                      id: { type: Type.STRING }, 
                      title: { type: Type.STRING }, 
                      preview_quote: { type: Type.STRING }, 
                      content: { type: Type.STRING } 
                    },
                    required: ["id", "title", "preview_quote"]
                  }
                }
              }
            },
            wealth_v2: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                badge: { type: Type.STRING },
                headline: { type: Type.STRING },
                summary: { type: Type.STRING },
                element_hint: { type: Type.STRING },
                scores: { 
                  type: Type.OBJECT, 
                  properties: {
                    wealth: scoreSchema,
                    love: scoreSchema,
                    career: scoreSchema,
                    study: scoreSchema,
                    health: scoreSchema
                  },
                  required: ["wealth", "love", "career", "study", "health"]
                },
                monthly_preview: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { 
                      month: { type: Type.NUMBER }, 
                      tag: { type: Type.STRING }, 
                      text: { type: Type.STRING } 
                    },
                    required: ["month", "tag", "text"]
                  }
                },
                monthly_locked: {
                  type: Type.OBJECT,
                  properties: { 
                    ctaTitle: { type: Type.STRING }, 
                    ctaList: { type: Type.ARRAY, items: { type: Type.STRING } } 
                  },
                  required: ["ctaTitle", "ctaList"]
                },
                good_bad_2026: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    good: { type: Type.ARRAY, items: { type: Type.STRING } },
                    bad: { type: Type.ARRAY, items: { type: Type.STRING } },
                    note: { type: Type.STRING }
                  },
                  required: ["title", "good", "bad", "note"]
                }
              },
              required: ["title", "headline", "summary", "scores", "monthly_preview", "good_bad_2026"]
            },
            paywall: {
              type: Type.OBJECT,
              properties: {
                price_anchor: { type: Type.STRING },
                discount_price: { type: Type.STRING },
                cta: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                urgency: { type: Type.STRING },
                disclaimer: { type: Type.STRING }
              },
              required: ["discount_price", "bullets"]
            },
            share_card: {
              type: Type.OBJECT,
              properties: { 
                title: { type: Type.STRING }, 
                subtitle: { type: Type.STRING },
                tagline: { type: Type.STRING },
                cta: { type: Type.STRING }
              },
              required: ["title", "subtitle", "tagline", "cta"]
            }
          },
          required: ["mode", "free", "paywall", "share_card"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text from Gemini");
    return JSON.parse(text) as SajuResponse;
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
};
