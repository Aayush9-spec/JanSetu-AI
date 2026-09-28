import React, { useEffect, useRef, useState } from 'react';
import { X, Mic, Sparkles, LoaderCircle, Send, ImagePlus, Square, RotateCcw } from 'lucide-react';
import { LanguageCode } from '../../types';
import { CategoryType } from '../../types';
import { GeminiExtractionResult, GeminiService } from '../../services/geminiService';

type RecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: { resultIndex: number; results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};
type WindowWithSpeech = Window & { SpeechRecognition?: new () => RecognitionLike; webkitSpeechRecognition?: new () => RecognitionLike };

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: LanguageCode;
  onSubmitRequest: (result: GeminiExtractionResult, rawText: string, inputMode: 'text' | 'voice') => void;
}

const SAMPLE = 'हमारे गांव मोहनलालगंज में बारिश के दौरान सड़क पूरी तरह खराब हो जाती है और बच्चों को स्कूल पहुंचने में परेशानी होती है।';
const STATES = ['Uttar Pradesh', 'Bihar', 'Maharashtra', 'Rajasthan', 'Madhya Pradesh', 'Gujarat', 'Karnataka', 'Tamil Nadu', 'West Bengal'];

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({ isOpen, onClose, currentLanguage, onSubmitRequest }) => {
  const [text, setText] = useState('');
  const [category, setCategory] = useState<CategoryType | 'auto'>('auto');
  const [state, setState] = useState('');
  const [district, setDistrict] = useState('');
  const [photo, setPhoto] = useState<File | undefined>();
  const [inputMode, setInputMode] = useState<'text' | 'voice'>('text');
  const [recording, setRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<GeminiExtractionResult | null>(null);
  const [error, setError] = useState('');
  const [micUnavailable, setMicUnavailable] = useState(false);
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const textRef = useRef(text);
  textRef.current = text;

  const stopRecording = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    streamRef.current?.getTracks().forEach(track => track.stop());
    streamRef.current = null;
    setRecording(false);
  };
  useEffect(() => {
    if (!isOpen) {
      stopRecording();
      setText(''); setCategory('auto'); setState(''); setDistrict(''); setPhoto(undefined);
      setResult(null); setError(''); setProcessing(false); setMicUnavailable(false); setSeconds(0); setInputMode('text');
    }
    return () => stopRecording();
  }, [isOpen]);
  useEffect(() => {
    if (!recording) return;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [recording]);

  const startRecording = async () => {
    setError('');
    setInputMode('voice');
    setMicUnavailable(false);
    try {
      streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
      const speechWindow = window as WindowWithSpeech;
      const Recognition = speechWindow.SpeechRecognition || speechWindow.webkitSpeechRecognition;
      if (Recognition) {
        const recognition = new Recognition();
        recognition.lang = currentLanguage === 'en' ? 'en-IN' : `${currentLanguage}-IN`;
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.onresult = event => {
          const phrases: string[] = [];
          for (let index = event.resultIndex; index < event.results.length; index += 1) phrases.push(event.results[index][0].transcript);
          const transcript = phrases.join(' ').trim();
          if (transcript) {
            const accumulated = `${textRef.current} ${transcript}`.trim();
            textRef.current = accumulated;
            setText(accumulated);
          }
        };
        recognition.onerror = event => {
          setError(event.error === 'not-allowed' ? 'Microphone permission was denied. You can still type the request below.' : 'Browser transcription stopped. Type or edit your transcript below.');
          setMicUnavailable(true);
        };
        recognition.onend = () => setRecording(false);
        recognitionRef.current = recognition;
        recognition.start();
      } else {
        setMicUnavailable(true);
      }
      setRecording(true);
      setSeconds(0);
    } catch {
      setMicUnavailable(true);
      setError('Microphone permission or device is unavailable. You can still enter the request as text.');
    }
  };

  const analyze = async () => {
    if (text.trim().length < 5) {
      setError('Describe the issue in at least five characters before analysis.');
      return;
    }
    setProcessing(true);
    setError('');
    try {
      const analysis = await GeminiService.analyzeCitizenInput(text, currentLanguage, photo);
      setResult({
        ...analysis,
        category: category === 'auto' ? analysis.category : category,
        location: { ...analysis.location, state: state || analysis.location.state, district: district || analysis.location.district },
      });
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : 'Request analysis failed. Please retry.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="intake-title" className="w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-[#0d1117] border border-[#242c36] rounded-lg shadow-2xl">
        <div className="sticky top-0 px-5 py-3.5 border-b border-[#242c36] bg-[#0c1015] flex items-center justify-between z-10">
          <div className="flex items-center gap-2"><Mic className="w-4 h-4 text-sky-400" /><h2 id="intake-title" className="text-sm font-bold text-[#e6edf3]">Submit a citizen infrastructure request</h2></div>
          <button onClick={() => { stopRecording(); onClose(); }} aria-label="Close request form" className="p-1 rounded hover:bg-[#181f28] text-[#8b949e]"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 space-y-4">
          {!result && <>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setInputMode('text')} className={`px-3 py-1.5 rounded border text-xs ${inputMode === 'text' ? 'border-sky-500 text-sky-300 bg-sky-900/20' : 'border-[#242c36] text-[#8b949e]'}`}>Text request</button>
              <button onClick={startRecording} disabled={recording} className="px-3 py-1.5 rounded border border-[#242c36] text-[#e6edf3] text-xs flex items-center gap-1 disabled:opacity-50"><Mic className="w-3.5 h-3.5" />{recording ? 'Listening' : 'Speak your issue'}</button>
              {recording && <button onClick={stopRecording} className="px-3 py-1.5 rounded border border-rose-500/40 text-rose-300 text-xs flex items-center gap-1"><Square className="w-3 h-3" />Stop · {String(Math.floor(seconds / 60)).padStart(2, '0')}:{String(seconds % 60).padStart(2, '0')}</button>}
            </div>
            {recording && <p aria-live="polite" className="text-xs text-rose-300">● Listening in your browser. Speech transcription is provided by browser support, not a simulated recording.</p>}
            {micUnavailable && <p className="text-xs text-amber-300">Live speech transcription is unavailable; type or paste your transcript below.</p>}
            <label className="block text-xs text-[#8b949e]">Describe your issue <span className="text-rose-400">*</span>
              <textarea required minLength={5} maxLength={4000} value={text} onChange={event => setText(event.target.value)} rows={4} placeholder="Describe the infrastructure problem, who is affected, and when it occurs..." className="mt-1 w-full resize-y bg-[#0b0e12] border border-[#242c36] rounded p-3 text-sm text-[#e6edf3] focus:border-sky-500 outline-none" />
            </label>
            <div className="flex flex-wrap gap-3">
              <label className="flex-1 min-w-40 text-xs text-[#8b949e]">State
                <select value={state} onChange={event => setState(event.target.value)} className="mt-1 w-full bg-[#0b0e12] border border-[#242c36] rounded px-3 py-2 text-xs text-[#e6edf3]"><option value="">Select or infer</option>{STATES.map(item => <option key={item}>{item}</option>)}</select>
              </label>
              <label className="flex-1 min-w-40 text-xs text-[#8b949e]">District
                <input value={district} onChange={event => setDistrict(event.target.value)} maxLength={100} placeholder="e.g. Lucknow" className="mt-1 w-full bg-[#0b0e12] border border-[#242c36] rounded px-3 py-2 text-xs text-[#e6edf3]" />
              </label>
              <label className="flex-1 min-w-40 text-xs text-[#8b949e]">Category
                <select value={category} onChange={event => setCategory(event.target.value as CategoryType | 'auto')} className="mt-1 w-full bg-[#0b0e12] border border-[#242c36] rounded px-3 py-2 text-xs text-[#e6edf3]"><option value="auto">Analyze automatically</option>{['road','water','electricity','health','education','sanitation','telecom','agriculture'].map(item => <option key={item} value={item}>{item}</option>)}</select>
              </label>
            </div>
            <label className="flex items-center gap-2 text-xs text-[#8b949e]"><ImagePlus className="w-4 h-4 text-sky-400" />Optional infrastructure photo
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setPhoto(event.target.files?.[0])} className="max-w-52 text-[10px]" />
            </label>
            {photo && <p className="text-[11px] text-[#8b949e]">{photo.name} · {(photo.size / 1024).toFixed(0)} KB · Image is analyzed but not retained in demo storage.</p>}
            <div className="flex flex-wrap items-center gap-2">
              <button onClick={() => { setText(SAMPLE); setInputMode('text'); setError(''); }} className="px-3 py-2 rounded border border-[#242c36] text-[#8b949e] text-xs flex items-center gap-1"><RotateCcw className="w-3 h-3" />Load Hindi sample</button>
              <button onClick={analyze} disabled={processing} className="ml-auto px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 disabled:opacity-60 text-white text-xs font-semibold flex items-center gap-2">{processing ? <><LoaderCircle className="w-4 h-4 animate-spin" />Analyzing request…</> : <><Sparkles className="w-4 h-4" />Analyze request</>}</button>
            </div>
          </>}
          {error && <div role="alert" className="p-3 rounded border border-rose-500/30 bg-rose-500/10 text-rose-300 text-xs">{error}</div>}
          {result && <div className="space-y-4">
            <div className={`p-3 rounded border text-xs ${result.provider === 'gemini' ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/30 bg-amber-500/10 text-amber-300'}`}>
              {result.provider === 'gemini' ? 'Gemini analysis completed on the server.' : 'AI Demo Mode — local rules were used; no Gemini credentials were available.'}
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded bg-[#11161d] border border-[#242c36]"><span className="text-[#8b949e]">Category / severity</span><p className="mt-1 text-[#e6edf3] font-semibold">{result.category} · {result.severity} · {result.urgency}</p></div>
              <div className="p-3 rounded bg-[#11161d] border border-[#242c36]"><span className="text-[#8b949e]">Location</span><p className="mt-1 text-[#e6edf3]">{result.location.district}, {result.location.state}</p></div>
              <div className="p-3 rounded bg-[#11161d] border border-[#242c36]"><span className="text-[#8b949e]">Estimated affected</span><p className="mt-1 text-[#e6edf3]">{result.estimatedAffected.toLocaleString()} · estimate</p></div>
              <div className="p-3 rounded bg-[#11161d] border border-[#242c36]"><span className="text-[#8b949e]">Suggested next step</span><p className="mt-1 text-[#e6edf3]">{result.suggestedAction}</p></div>
            </div>
            <div className="p-3 rounded bg-[#11161d] border border-[#242c36] text-xs text-[#e6edf3]">{result.translatedText}</div>
            {result.imageAssessment && <p className="text-xs text-[#8b949e]">{result.imageAssessment}</p>}
            <div className="flex justify-end gap-2"><button onClick={() => setResult(null)} className="px-3 py-2 rounded border border-[#242c36] text-[#8b949e] text-xs">Edit request</button><button onClick={() => onSubmitRequest(result, text, inputMode)} className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-2"><Send className="w-3.5 h-3.5" />Submit Request</button></div>
          </div>}
        </div>
      </div>
    </div>
  );
};
