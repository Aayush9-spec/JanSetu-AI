import { CategoryType, PriorityScoreDetails, SeverityLevel, UrgencyLevel } from '../types';

export interface GeminiExtractionResult {
  translatedText: string;
  category: CategoryType;
  subcategory: string;
  severity: SeverityLevel;
  urgency: UrgencyLevel;
  affectedGroup: string;
  estimatedAffected: number;
  location: { state: string; district: string; block: string; village: string };
  sentimentScore: number;
  similarRequestsCount: number;
  confidenceScore: number;
  extractedEntities: string[];
  suggestedAction: string;
  provider: 'gemini' | 'demo';
  imageAssessment?: string;
}

const includesAny = (text: string, terms: string[]) => terms.some(term => text.includes(term));

export class GeminiService {
  static async analyzeCitizenInput(rawText: string, rawLanguage = 'hi', image?: File): Promise<GeminiExtractionResult> {
    const text = rawText.trim();
    if (text.length < 5) throw new Error('Please describe the issue in at least five characters.');
    let imagePayload: { mimeType: string; data: string } | undefined;
    if (image) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type) || image.size > 2_500_000) {
        throw new Error('Use a JPG, PNG, or WebP photo smaller than 2.5 MB.');
      }
      imagePayload = { mimeType: image.type, data: await fileToBase64(image) };
    }
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: rawLanguage, image: imagePayload }),
        signal: AbortSignal.timeout(28000),
      });
      if (response.ok) {
        const result = await response.json() as Omit<GeminiExtractionResult, 'provider'>;
        if (typeof result.translatedText === 'string' && typeof result.category === 'string') {
          return { ...result, provider: 'gemini' };
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message.startsWith('Please')) throw error;
      console.info('JanSetu server-side AI is unavailable; the local demo analyzer will be used.');
    }
    return analyzeLocally(text, rawLanguage, Boolean(image));
  }

  static calculatePriorityScore(
    demandCount: number,
    affectedPop: number,
    coverageGapPercent: number,
    urgencyWeight = 85,
    equityWeight = 90,
    feasibilityWeight = 88,
  ): PriorityScoreDetails {
    const normalized = {
      demand: Math.min(100, Math.max(0, (demandCount / 20000) * 100)),
      population: Math.min(100, Math.max(0, (affectedPop / 200000) * 100)),
      gap: Math.min(100, Math.max(0, coverageGapPercent)),
    };
    const weights = { citizenDemand: 25, populationImpact: 20, infraGap: 20, urgency: 15, equity: 10, feasibility: 10 };
    const scores = {
      citizenDemand: Math.round(normalized.demand),
      populationImpact: Math.round(normalized.population),
      infraGap: Math.round(normalized.gap),
      urgency: Math.min(100, Math.max(0, urgencyWeight)),
      equity: Math.min(100, Math.max(0, equityWeight)),
      feasibility: Math.min(100, Math.max(0, feasibilityWeight)),
    };
    const breakdown = Object.fromEntries(Object.entries(scores).map(([key, score]) => {
      const weight = weights[key as keyof typeof weights];
      return [key, { score, weight, weighted: Number((score * weight / 100).toFixed(2)) }];
    })) as PriorityScoreDetails['breakdown'];
    const totalScore = Math.round(Object.values(breakdown).reduce((total, item) => total + item.weighted, 0));
    return { totalScore, breakdown };
  }
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read the selected photo.'));
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.readAsDataURL(file);
  });
}

function analyzeLocally(text: string, language: string, hasImage: boolean): GeminiExtractionResult {
  const lower = text.toLowerCase();
  const match = [
    { category: 'water' as const, words: ['पानी', 'जल', 'नल', 'water', 'tap'], severity: 'critical' as const, district: 'Gaya', state: 'Bihar', block: 'Bodhgaya', village: 'Mastipur', translatedText: 'A local drinking-water service is reported as unavailable or unsafe.' },
    { category: 'health' as const, words: ['डॉक्टर', 'अस्पताल', 'स्वास्थ्य', 'hospital', 'health', 'doctor'], severity: 'critical' as const, district: 'Nashik', state: 'Maharashtra', block: 'Trimbakeshwar', village: 'Velunje', translatedText: 'Residents report a gap in access to local health services.' },
    { category: 'electricity' as const, words: ['बिजली', 'ट्रांसफॉर्मर', 'electricity', 'power', 'light'], severity: 'high' as const, district: 'Jodhpur', state: 'Rajasthan', block: 'Balesar', village: 'Duhar', translatedText: 'Residents report an electricity supply or infrastructure issue.' },
    { category: 'education' as const, words: ['स्कूल', 'पढ़ाई', 'school', 'education', 'classroom'], severity: 'high' as const, district: 'Muzaffarpur', state: 'Bihar', block: 'Kanti', village: 'Kati Dehat', translatedText: 'Residents report a school access or building issue affecting children.' },
  ].find(item => includesAny(lower, item.words));
  const roadWords = ['सड़क', 'रास्ता', 'road', 'bridge', 'पुल'];
  const category: CategoryType = match?.category || (includesAny(lower, roadWords) ? 'road' : 'road');
  const location = match
    ? { state: match.state, district: match.district, block: match.block, village: match.village }
    : { state: 'Uttar Pradesh', district: 'Lucknow', block: 'Mohanlalganj', village: 'Kakori Dehat' };
  const severity = match?.severity || (includesAny(lower, ['ambulance', 'बंद', 'broken', 'खराब', 'बारिश', 'rain']) ? 'high' : 'medium');
  const estimatedAffected = includesAny(lower, ['गांव', 'गाँव', 'village', 'panchayat', 'पंचायत']) ? 8400 : 1200;
  return {
    translatedText: match?.translatedText || (language === 'en' ? text : 'Local infrastructure access concern reported by a resident; translation requires a configured Gemini integration.'),
    category,
    subcategory: `${category[0].toUpperCase()}${category.slice(1)} infrastructure concern`,
    severity,
    urgency: severity === 'critical' ? 'immediate' : severity === 'high' ? 'high' : 'moderate',
    affectedGroup: category === 'education' ? 'Students and families' : 'Residents and local service users',
    estimatedAffected,
    location,
    sentimentScore: -0.5,
    similarRequestsCount: 0,
    confidenceScore: 0.45,
    extractedEntities: [category, location.district, location.state, severity],
    suggestedAction: `Verify the reported ${category} issue with the local administration before allocating funds.`,
    provider: 'demo',
    ...(hasImage ? { imageAssessment: 'Photo attached. Live image interpretation requires GEMINI_API_KEY on the application server.' } : {}),
  };
}
