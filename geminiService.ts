
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SecurityReport, ThreatLevel } from "./types.ts";

export class SecurityAIService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private readonly AEGIS_IDENTITY = `You are AegisAI, an intelligent, privacy-first security assistant for Wally Nthani, founder of CipherX Inc. 
  You interact exclusively with metadata from an on-device encrypted database or real-time camera feeds. 
  NEVER request or store raw passwords or sensitive personal images outside the temporary analysis buffer.
  Your responses should be formatted for direct interpretation by a security professional.`;

  /**
   * Deep Security Analysis
   */
  async analyzeDeeply(prompt: string): Promise<string> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: `${this.AEGIS_IDENTITY} Analyze security requests with deep logical rigor.`,
          thinkingConfig: { thinkingBudget: 8000 }
        },
      });
      return response.text || "Neural link stable.";
    } catch (error) {
      console.error("Deep analysis failed:", error);
      throw error;
    }
  }

  /**
   * Fast Threat Classification
   */
  async classifyThreat(data: string): Promise<SecurityReport> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Triage following metadata: ${data}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              threatLevel: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              recommendedAction: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["threatLevel", "confidenceScore", "recommendedAction", "explanation"]
          },
          systemInstruction: `${this.AEGIS_IDENTITY} Rapid triage module.`
        },
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      return { threatLevel: ThreatLevel.LOW, confidenceScore: 0, recommendedAction: "Check Logs", explanation: "Error" };
    }
  }

  /**
   * Vision Analysis
   */
  async analyzeVision(base64Image: string): Promise<SecurityReport> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [{ inlineData: { mimeType: 'image/jpeg', data: base64Image } }, { text: "Intruder check. Return JSON." }]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              threatLevel: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              recommendedAction: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["threatLevel", "confidenceScore", "recommendedAction", "explanation"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      throw error;
    }
  }

  /**
   * Identity Badge Synthesis (Image Generation)
   */
  async generateIdentityBadge(): Promise<string | null> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [{ text: "Create a highly detailed, futuristic holographic security clearance ID card for 'Wally Nthani'. It should feature CipherX Inc branding, neon cyan accents, a fingerprint motif, and the title 'FOUNDER & ARCHITECT'. The background should be a dark, cyber-grid texture. 4K resolution." }]
        },
        config: {
          imageConfig: { aspectRatio: "3:4" }
        }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : null;
    } catch (error) {
      console.error("Badge synthesis failed:", error);
      return null;
    }
  }

  /**
   * Real-time Voice Session (Live API)
   */
  connectVoice(callbacks: any) {
    const ai = this.getAI();
    return ai.live.connect({
      model: 'gemini-2.5-flash-native-audio-preview-12-2025',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } }
        },
        systemInstruction: `${this.AEGIS_IDENTITY} You are now in COMM mode. Provide brief, spoken security updates. Be professional and vigilant.`
      }
    });
  }

  /**
   * Password Intelligence
   */
  async auditPasswordMeta(meta: string): Promise<SecurityReport> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Audit credential entropy: ${meta}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              threatLevel: { type: Type.STRING },
              confidenceScore: { type: Type.NUMBER },
              recommendedAction: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["threatLevel", "confidenceScore", "recommendedAction", "explanation"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      throw error;
    }
  }

  /**
   * Geospatial Risk Assessment (Maps Grounding)
   */
  async getLocalRiskAssessment(lat: number, lng: number): Promise<string> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `As AegisAI, assess the physical security profile of the area around these coordinates: ${lat}, ${lng}. Are there any critical infrastructure points, data centers, or known high-security zones nearby? Provide a concise summary for a founder.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: { latLng: { latitude: lat, longitude: lng } }
          }
        }
      });
      return response.text || "Regional scans complete. No immediate geospatial anomalies.";
    } catch (error) {
      console.error("Maps grounding failed:", error);
      return "Unable to resolve local threat surface via geospatial tools.";
    }
  }
}

export const securityService = new SecurityAIService();
