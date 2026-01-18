
import { GoogleGenAI, Type } from "@google/genai";
import { FormData, SajuResponse } from "../types";

export const generateSajuReading = async (formData: FormData): Promise<SajuResponse> => {
  /**
   * [보안 가이드]
   * 가이드라인에 따라 API 키는 반드시 process.env.API_KEY로부터 가져옵니다.
   * 이렇게 하면 소스 코드에는 키가 노출되지 않으며, Vercel 같은 호스팅 환경의 
   * 'Environment Variables' 설정에서 안전하게 관리할 수 있습니다.
   */
  const apiKey = process.env.API_KEY;
  
  if (!apiKey) {
    // 사용자가 설정을 잊었을 경우를 대비한 친절한 에러 메시지
    throw new Error("API_KEY_NOT_FOUND: Please set the 'API_KEY' environment variable in your deployment settings and redeploy.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const isLove = formData.mode === 'LOVE';

  const systemInstruction = `
    You are 'THE SOUL CODE', a premium destiny analyst.
    Tone: Sophisticated, insightful, direct. 
    Constraint: STRICTLY ENGLISH. No other languages allowed.
    Task: Decipher birth charts (Saju) and provide strategic life trajectory data.
    ${isLove ? 'Focus: Deep relationship synchronicity and potential glitches.' : 'Focus: Wealth windows, career pivots, and risk avoidance.'}
    
    CRITICAL: Always return a complete, valid JSON object matching the provided schema exactly.
  `;

  const prompt = `
    Analyze User: ${JSON.stringify(formData.user)}
    ${formData.partner ? `Analyze Partner: ${JSON.stringify(formData.partner)}` : ''}
    Context: ${formData.mode === 'LOVE' ? formData.relationshipStatus : formData.occupation}
    Inquiry: ${formData.finalQuestion}

    Generate a high-fidelity destiny analysis in English.
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
    
    // JSON 파싱 전 클리닝 로직
    const cleanJson = resultText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanJson) as SajuResponse;
  } catch (error: any) {
    console.error("Gemini Critical Failure:", error);
    throw new Error(error.message || "Decoding interrupted by cosmic interference.");
  }
};
