
import { GoogleGenAI, Type } from "@google/genai";
import { SecurityReport, ThreatLevel } from "./types";

export class SecurityAIService {
  private getAI() {
    return new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  private readonly AEGIS_IDENTITY = `You are AegisAI, an intelligent, privacy-first security assistant for Wally Nthani, founder of CipherX Inc. 
  You interact exclusively with metadata from an on-device encrypted database. 
  NEVER request or store raw passwords or sensitive personal images.
  Your responses should be formatted for direct interpretation by a security professional or for insertion into a local audit log.`;

  /**
   * Deep Security Analysis using gemini-3-pro-preview
   */
  async analyzeDeeply(prompt: string): Promise<string> {
    const ai = this.getAI();
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          systemInstruction: `${this.AEGIS_IDENTITY} 
          Analyze security requests with deep logical rigor. 
          Focus on local threat mitigation and CipherX zero-trust protocols.`,
          thinkingConfig: { thinkingBudget: 8000 }
        },
      });
      return response.text || "Neural link stable. No anomalies detected in current buffer.";
    } catch (error) {
      console.error("Deep analysis failed:", error);
      throw error;
    }
  }

  /**
   * Fast Threat Classification using gemini-3-flash-preview
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
              threatLevel: { type: Type.STRING, description: "LOW, MEDIUM, or HIGH" },
              confidenceScore: { type: Type.NUMBER, description: "0-100" },
              recommendedAction: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["threatLevel", "confidenceScore", "recommendedAction", "explanation"]
          },
          systemInstruction: `${this.AEGIS_IDENTITY} You are a fast-response triage module. Classify threats based on metadata ONLY.`
        },
      });

      const text = response.text || "{}";
      const parsed = JSON.parse(text);
      return {
        threatLevel: (parsed.threatLevel || ThreatLevel.LOW) as ThreatLevel,
        confidenceScore: parsed.confidenceScore || 0,
        recommendedAction: parsed.recommendedAction || "Manual investigation required",
        explanation: parsed.explanation || "No detailed explanation provided."
      };
    } catch (error) {
      console.error("Threat classification failed:", error);
      return {
        threatLevel: ThreatLevel.LOW,
        confidenceScore: 0,
        recommendedAction: "Local Review",
        explanation: "Rapid classification engine encountered a neural fault."
      };
    }
  }

  /**
   * Password Intelligence using gemini-3-flash-preview
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
          },
          systemInstruction: `${this.AEGIS_IDENTITY} Expert password metadata auditor. Analyze entropy and patterns without raw strings.`
        }
      });
      
      const text = response.text || "{}";
      return JSON.parse(text);
    } catch (error) {
      console.error("Password audit failed:", error);
      return {
        threatLevel: ThreatLevel.LOW,
        confidenceScore: 0,
        recommendedAction: "Local Audit Required",
        explanation: "Audit pipeline disrupted."
      };
    }
  }
}

export const securityService = new SecurityAIService();
