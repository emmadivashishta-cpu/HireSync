import { GoogleGenAI, Type } from "@google/genai";
import { JD, Candidate, ScreeningResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function screenResume(jd: JD, candidate: Candidate): Promise<ScreeningResult> {
  const prompt = `
    You are an expert HR Recruiter. Analyze the following Resume against the Job Description.
    
    Job Description:
    Title: ${jd.title}
    Description: ${jd.description}
    
    Candidate Resume (${candidate.fileName}):
    ${candidate.text}
    
    Evaluate the candidate based on:
    1. Technical Skills match
    2. Experience relevance
    3. Education
    4. Soft skills and cultural fit indicators
    
    Provide a score from 0 to 100, a brief summary, key strengths, weaknesses, and a final verdict (Shortlist, Maybe, or Reject).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          matchPercentage: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          verdict: { type: Type.STRING, enum: ["Shortlist", "Maybe", "Reject"] },
          name: { type: Type.STRING, description: "Extracted name of the candidate from the resume" }
        },
        required: ["score", "matchPercentage", "summary", "strengths", "weaknesses", "verdict", "name"]
      }
    }
  });

  const result = JSON.parse(response.text);
  return {
    ...result,
    candidateId: candidate.id,
    name: result.name || candidate.fileName.replace('.pdf', '')
  };
}
