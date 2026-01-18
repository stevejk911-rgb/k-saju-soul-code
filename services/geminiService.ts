
import { GoogleGenAI, Type } from "@google/genai";
import { FormData, SajuResponse } from "../types";

export const generateSajuReading = async (formData: FormData): Promise<SajuResponse> => {
  // 가이드라인에 따라 process.env.API_KEY를 직접 사용합니다.

  const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY, });
  const isLove = formData.mode === 'LOVE';

  const systemInstruction = `
    You are 'THE SOUL CODE', a high-speed premium destiny analyst.
    Tone: Sophisticated, insightful, direct. 
    Constraint: STRICTLY ENGLISH. No other languages allowed.
    Task: Decipher Saju charts and provide strategic life trajectory data.
    ${isLove ? 'Focus: Relationship synchronicity and potential glitches.' : 'Focus: Wealth peaks, career pivots, and risk management.'}
    
    CRITICAL: Always return a valid JSON object matching the provided schema exactly.
  `;

  const prompt = `
    Analyze User: ${JSON.stringify(formData.user)}
    ${formData.partner ? `Analyze Partner: ${JSON.stringify(formData.partner)}` : ''}
    Context: ${isLove ? formData.relationshipStatus : formData.occupation}
    Inquiry: ${formData.finalQuestion}

    Generate a high-fidelity destiny analysis. Output in English only.
  `;

  const scoreSchema = {
    type: Type.OBJECT,
    properties: {
      label: { type: Type.STRING },
      stars: { type: Type.NUMBER }
    },
    required: ["label", "stars"]
  };

  try {
    // 텍스트 작업에 최적화된 gemini-3-flash-preview 모델 사용
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            mode: { type: Type.STRING, enum: ["LOVE", "MONEY"] },
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
                  properties: { title: { type: Type.STRING }, quote: { type: Type.STRING }, why: { type: Type.STRING } },
                  required: ["title", "quote", "why"]
                },
                score_breakdown: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { label: { type: Type.STRING }, score: { type: Type.NUMBER }, tier: { type: Type.STRING } },
                    required: ["label", "score", "tier"]
                  }
                },
                locked_sections: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { id: { type: Type.STRING }, title: { type: Type.STRING }, preview_quote: { type: Type.STRING }, content: { type: Type.STRING } },
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
                    properties: { month: { type: Type.NUMBER }, tag: { type: Type.STRING }, text: { type: Type.STRING } },
                    required: ["month", "tag", "text"]
                  }
                },
                monthly_locked: {
                  type: Type.OBJECT,
                  properties: { ctaTitle: { type: Type.STRING }, ctaList: { type: Type.ARRAY, items: { type: Type.STRING } } },
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
              }
            },
            paywall: {
              type: Type.OBJECT,
              properties: {
                price_anchor: { type: Type.STRING },
                discount_price: { type: Type.STRING },
                cta: { type: Type.STRING },
                bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                urgency: { type: Type.STRING }
              },
              required: ["discount_price", "bullets"]
            },
            share_card: {
              type: Type.OBJECT,
              properties: { title: { type: Type.STRING }, subtitle: { type: Type.STRING }, tagline: { type: Type.STRING }, cta: { type: Type.STRING } },
              required: ["title", "cta"]
            }
          },
          required: ["mode", "free", "paywall", "share_card"]
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("Empty response from Soul Code engine.");
    
    // JSON 파싱 전 클리닝
    const cleanJson = resultText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson) as SajuResponse;
  } catch (error: any) {
    console.error("Gemini Critical Failure:", error);
    throw new Error(error.message || "Decoding interrupted by cosmic interference.");
  }
};
