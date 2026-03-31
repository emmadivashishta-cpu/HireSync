export interface Candidate {
  id: string;
  name: string;
  fileName: string;
  text: string;
}

export interface JD {
  title: string;
  description: string;
}

export interface ScreeningResult {
  candidateId: string;
  name: string;
  score: number; // 0-100
  matchPercentage: number;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  verdict: 'Shortlist' | 'Maybe' | 'Reject';
}
