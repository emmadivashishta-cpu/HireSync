import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  XCircle, 
  Loader2, 
  Search, 
  ChevronRight, 
  BarChart3,
  User,
  Briefcase
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Candidate, JD, ScreeningResult } from './types';
import { extractTextFromPDF } from './lib/pdf-utils';
import { screenResume } from './services/gemini';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [jd, setJd] = useState<JD>({ title: '', description: '' });
  const [resumes, setResumes] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ScreeningResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<ScreeningResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setResumes(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const removeResume = (index: number) => {
    setResumes(prev => prev.filter((_, i) => i !== index));
  };

  const startScreening = async () => {
    if (!jd.title || !jd.description || resumes.length === 0) {
      setError("Please provide a Job Description and at least one resume.");
      return;
    }

    setIsProcessing(true);
    setError(null);
    setStatus("Initializing...");
    setResults([]);

    try {
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("Gemini API Key is missing. Please check your .env file and restart the server.");
      }

      for (const file of resumes) {
        try {
          setStatus(`Reading PDF: ${file.name}...`);
          const text = await extractTextFromPDF(file);
          
          setStatus(`Analyzing with AI: ${file.name}...`);
          const candidate: Candidate = {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name.replace('.pdf', ''),
            fileName: file.name,
            text
          };
          
          const result = await screenResume(jd, candidate);
          setResults(prev => [...prev, result].sort((a, b) => b.score - a.score));
        } catch (err: any) {
          console.error(`Error processing ${file.name}:`, err);
          setError(`Failed to analyze ${file.name}: ${err.message || "Unknown error"}`);
        }
      }
      setStatus("Complete!");
    } catch (err: any) {
      setError(err.message || "An error occurred during screening.");
      setStatus("Failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Shortlist': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'Maybe': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Reject': return 'text-rose-500 bg-rose-500/10 border-rose-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  const getVerdictIcon = (verdict: string) => {
    switch (verdict) {
      case 'Shortlist': return <CheckCircle2 className="w-4 h-4" />;
      case 'Maybe': return <AlertCircle className="w-4 h-4" />;
      case 'Reject': return <XCircle className="w-4 h-4" />;
      default: return null;
    }
  };


  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      <header className="border-b border-[#141414] px-6 py-4 flex justify-between items-center bg-[#E4E3E0] sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#141414] flex items-center justify-center rounded-sm">
            <BarChart3 className="text-[#E4E3E0] w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold tracking-tighter uppercase italic font-serif">HireSync AI</h1>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono opacity-60 uppercase tracking-widest">
          <span>v1.0.4</span>
          <span className="w-1 h-1 bg-[#141414] rounded-full"></span>
          <span>System Active</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#141414] pb-2">
              <Briefcase className="w-4 h-4" />
              <h2 className="text-xs uppercase font-mono font-bold tracking-widest">Job Specification</h2>
            </div>
            <div className="space-y-3">
              <input 
                type="text" 
                placeholder="Job Title"
                className="w-full bg-transparent border border-[#141414]/20 p-3 text-sm focus:border-[#141414] outline-none transition-colors placeholder:text-[#141414]/40"
                value={jd.title}
                onChange={(e) => setJd(prev => ({ ...prev, title: e.target.value }))}
              />
              <textarea 
                placeholder="Paste Job Description here..."
                className="w-full bg-transparent border border-[#141414]/20 p-3 text-sm h-48 focus:border-[#141414] outline-none transition-colors resize-none placeholder:text-[#141414]/40"
                value={jd.description}
                onChange={(e) => setJd(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-[#141414] pb-2">
              <Upload className="w-4 h-4" />
              <h2 className="text-xs uppercase font-mono font-bold tracking-widest">Resume Batch</h2>
            </div>
            
            <label className="group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#141414]/20 hover:border-[#141414] transition-all cursor-pointer bg-white/50">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-6 h-6 mb-2 opacity-40 group-hover:opacity-100 transition-opacity" />
                <p className="text-xs font-mono uppercase tracking-tighter">Upload PDF Resumes</p>
              </div>
              <input type="file" className="hidden" multiple accept=".pdf" onChange={handleResumeUpload} />
            </label>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              <AnimatePresence>
                {resumes.map((file, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    key={idx} 
                    className="flex items-center justify-between p-2 border border-[#141414]/10 bg-white/30 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeResume(idx)} className="hover:text-rose-500 transition-colors p-1">
                      <XCircle className="w-3 h-3" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <button 
              onClick={startScreening}
              disabled={isProcessing || resumes.length === 0}
              className={cn(
                "w-full py-4 text-sm font-bold uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                isProcessing || resumes.length === 0 
                  ? "bg-[#141414]/10 text-[#141414]/40 cursor-not-allowed" 
                  : "bg-[#141414] text-[#E4E3E0] hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Execute Screening"}
            </button>
            {status && <p className="text-[10px] font-mono uppercase text-center text-[#141414]/60 animate-pulse">{status}</p>}
            {error && <p className="text-rose-500 text-[10px] font-mono uppercase text-center">{error}</p>}
          </section>
        </div>

        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[#141414] pb-2">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              <h2 className="text-xs uppercase font-mono font-bold tracking-widest">Analysis Results</h2>
            </div>
          </div>

          {results.length === 0 && !isProcessing ? (
            <div className="h-[600px] border border-[#141414]/10 flex flex-col items-center justify-center opacity-20 grayscale">
              <BarChart3 className="w-16 h-16 mb-4" />
              <p className="font-mono uppercase tracking-widest text-sm">Waiting for input...</p>
            </div>
          ) : (
            <div className="space-y-2">
              {results.map((result, idx) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={result.candidateId}
                  onClick={() => setSelectedResult(result)}
                  className="grid grid-cols-12 gap-4 px-4 py-4 bg-white/50 border border-[#141414]/10 hover:border-[#141414] hover:bg-white transition-all cursor-pointer group items-center"
                >
                  <div className="col-span-1 font-mono text-xs opacity-40">#{idx + 1}</div>
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#141414]/5 flex items-center justify-center group-hover:bg-[#141414] transition-colors">
                      <User className="w-4 h-4 opacity-40 group-hover:text-[#E4E3E0] group-hover:opacity-100" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold tracking-tight">{result.name}</span>
                    </div>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="text-lg font-serif italic font-bold">{result.score}</span>
                    <span className="text-[10px] font-mono opacity-40">/100</span>
                  </div>
                  <div className="col-span-3 flex justify-center">
                    <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border", getVerdictColor(result.verdict))}>
                      {getVerdictIcon(result.verdict)}
                      {result.verdict}
                    </div>
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-40 transition-opacity" />
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedResult(null)} className="absolute inset-0 bg-[#141414]/80 backdrop-blur-sm" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-2xl bg-[#E4E3E0] border border-[#141414] shadow-2xl overflow-hidden">
              <div className="p-8 space-y-8">
                <div className="flex justify-between items-start border-b border-[#141414] pb-6">
                  <div className="space-y-1">
                    <h3 className="text-3xl font-serif italic font-bold tracking-tighter">{selectedResult.name}</h3>
                    <div className="flex items-center gap-3">
                      <div className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border", getVerdictColor(selectedResult.verdict))}>
                        {getVerdictIcon(selectedResult.verdict)}
                        {selectedResult.verdict}
                      </div>
                      <span className="text-xs font-mono opacity-40 uppercase tracking-widest">Match Score: {selectedResult.score}%</span>
                    </div>
                  </div>
                  <button onClick={() => setSelectedResult(null)} className="p-2 hover:bg-[#141414]/5 transition-colors">
                    <XCircle className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <section className="space-y-2">
                      <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest opacity-40">Executive Summary</h4>
                      <p className="text-sm leading-relaxed">{selectedResult.summary}</p>
                    </section>
                    <section className="space-y-2">
                      <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest opacity-40">Key Strengths</h4>
                      <ul className="space-y-1">
                        {selectedResult.strengths.map((s, i) => (
                          <li key={i} className="text-xs flex items-start gap-2"><span className="text-emerald-500 mt-0.5">+</span>{s}</li>
                        ))}
                      </ul>
                    </section>
                  </div>
                  <div className="space-y-6">
                    <section className="space-y-2">
                      <h4 className="text-[10px] uppercase font-mono font-bold tracking-widest opacity-40">Areas of Concern</h4>
                      <ul className="space-y-1">
                        {selectedResult.weaknesses.map((w, i) => (
                          <li key={i} className="text-xs flex items-start gap-2"><span className="text-rose-500 mt-0.5">-</span>{w}</li>
                        ))}
                      </ul>
                    </section>
                  </div>
                </div>
              </div>
              <div className="bg-[#141414] px-8 py-4 flex justify-between items-center">
                <span className="text-[10px] font-mono text-[#E4E3E0]/40 uppercase tracking-widest">HireSync AI Analysis Engine</span>
                <button onClick={() => setSelectedResult(null)} className="text-[10px] font-bold uppercase tracking-widest text-[#E4E3E0] hover:underline">Close Report</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #14141420; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #14141440; }
      `}</style>
    </div>
  );
}

