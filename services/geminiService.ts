
import { FormData, SajuResponse } from "../types";

/**
 * [보안 업데이트]
 * 더 이상 클라이언트 사이드에서 GoogleGenAI SDK를 직접 사용하지 않습니다.
 * 모든 요청은 Vercel Serverless Function(/api/gemini)을 거쳐 안전하게 처리됩니다.
 */
export const generateSajuReading = async (formData: FormData): Promise<SajuResponse> => {
  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as SajuResponse;
  } catch (error: any) {
    console.error("Frontend Service Error:", error);
    throw new Error(error.message || "Decoding interrupted by cosmic interference. Please try again.");
  }
};
