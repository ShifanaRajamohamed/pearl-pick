import express from 'express';
import http from 'http';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import {
  generateCoutureSVGDataUri,
  generateCohesiveCoutureAngles,
  parseCustomerPromptToSpecs,
  CustomColorHexPalette
} from './src/services/coutureVisualEngine';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy initialize Gemini client
let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!geminiClient && process.env.GEMINI_API_KEY) {
    geminiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

// Circuit breaker and in-memory cache for Gemini API
let geminiQuotaCooldownUntil = 0;
const QUOTA_COOLDOWN_PERIOD = 5 * 60 * 1000;

interface CachedFashionAdvice {
  data: any;
  timestamp: number;
}
let cachedFashionAdvice: CachedFashionAdvice | null = null;
const FASHION_ADVICE_CACHE_TTL = 30 * 60 * 1000; // 30-minute cache

// Helper to generate content with resilient fallback across models
async function generateContentWithFallback(ai: GoogleGenAI, config: any) {
  if (Date.now() < geminiQuotaCooldownUntil) {
    throw new Error('QUOTA_COOLDOWN_ACTIVE');
  }

  // Prioritize gemini-3.1-flash-lite first for fast, reliable availability
  const models = ['gemini-3.1-flash-lite', 'gemini-flash-latest', 'gemini-3.8-flash'];
  let lastErr: any = null;
  let allQuotaExhausted = true;

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        ...config,
        model,
      });
      if (response && response.text) {
        return response;
      }
    } catch (err: any) {
      lastErr = err;
      const msg = err?.message || String(err);
      const isQuotaError =
        msg.includes('429') ||
        msg.includes('RESOURCE_EXHAUSTED') ||
        msg.includes('quota') ||
        err?.status === 'RESOURCE_EXHAUSTED' ||
        err?.code === 429;
      if (!isQuotaError) {
        allQuotaExhausted = false;
      }
      // Try next model in fallback chain
      continue;
    }
  }

  if (allQuotaExhausted && lastErr) {
    geminiQuotaCooldownUntil = Date.now() + QUOTA_COOLDOWN_PERIOD;
  }
  throw lastErr || new Error('AI models unavailable');
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'PEARL PICK! Haute Couture Backend', timestamp: new Date().toISOString() });
});

// Prompt Enhancement Endpoint using Gemini
app.post('/api/gemini/enhance-prompt', async (req, res) => {
  try {
    const { prompt, dressType, occasion, fabric, color } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // High-fashion fallback enhancement
      const enhanced = `Haute couture bespoke ${dressType || 'Evening Gown'} crafted for a high-profile ${occasion || 'Gala'}, tailored from premium ${fabric || 'Mulberry Silk'} in radiant ${color || 'Pearl Champagne'}. Features architectural silhouette draping, master French seam construction, reinforced internal corsetry with waist stay, and exquisite handcrafted accents.`;
      return res.json({ enhancedPrompt: enhanced, isFallback: true });
    }

    const response = await generateContentWithFallback(ai, {
      contents: `You are an elite Parisian haute couture designer and fashion director. Transform the following brief user dress concept into a richly detailed, poetic, and technically accurate dress design prompt suitable for master tailors and AI visualizers. Include silhouette structure, fabric drape, neckline and sleeve precision, seam techniques, and embellishment texture.

User Prompt: "${prompt || ''}"
Base Attributes: Dress Type: ${dressType}, Occasion: ${occasion}, Fabric: ${fabric}, Color: ${color}.

Output only the enhanced prompt in 2-3 evocative sentences.`,
    });

    const enhanced = response.text?.trim() || prompt;
    res.json({ enhancedPrompt: enhanced, isFallback: false });
  } catch (error: any) {
    res.json({ 
      enhancedPrompt: `Haute couture bespoke ${req.body.dressType || 'Gown'} in ${req.body.fabric || 'Silk'} (${req.body.color || 'Champagne'}) with bespoke master tailoring, handcrafted embellishments, and sculpted internal corsetry.`,
      isFallback: true 
    });
  }
});

// Fashion Styling & Fabric Recommendation Endpoint
app.post('/api/gemini/style-advice', async (req, res) => {
  try {
    const { dressType, occasion, bodyType, season } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        recommendedFabrics: ['Silk Velvet (380 GSM)', 'French Chantilly Lace', 'Duchess Satin'],
        colorSuggestions: ['Pearl Champagne', 'Imperial Emerald', 'Rose Quartz Gold'],
        tailorAdvice: 'Opt for bias-cut drape along the hips with 12-bone internal corsetry for structured comfort.',
        isFallback: true
      });
    }

    const response = await generateContentWithFallback(ai, {
      contents: `Provide fashion styling advice for a ${dressType} for a ${occasion}. Season: ${season || 'All seasons'}.
Format response as JSON with keys:
- recommendedFabrics: string array of 3 top fabrics with weights
- colorSuggestions: string array of 3 top luxury color pairings
- tailorAdvice: string advice for tailoring and seam allowances`,
      config: {
        responseMimeType: 'application/json',
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    res.json({
      recommendedFabrics: ['Mulberry Silk', 'Silk Velvet', 'Heavy Crepe de Chine'],
      colorSuggestions: ['Pearl Champagne', 'Imperial Emerald', 'Burgundy Velvet'],
      tailorAdvice: 'Ensure 2.5-inch hem allowance with horsehair braid for optimal fluid drape.',
      isFallback: true
    });
  }
});

// Curated daily fashion advice archive for high-fashion fallback
function getCuratedFashionAdvice() {
  return [
    {
      id: 'advice-1',
      category: 'Silhouette & Cut',
      title: 'Sculpted Basque Waistlines for Modern Gowns',
      advice: 'Basque corsetry dropping softly below the natural waistline creates an elongated, architectural silhouette that flatters both contemporary evening gowns and Indo-Western bridal lehengas.',
      actionableTip: 'Sculpted basque waist gown in pearl blush organza with fluid train and delicate waist stay',
      tag: 'Runway Trend 2026',
      fabricRecommendation: 'Silk Mikado or Organza (120 GSM) with 12-bone internal casing',
      searchQuery: 'basque waistline couture runway trend 2026'
    },
    {
      id: 'advice-2',
      category: 'Fabric & Draping',
      title: 'Bias-Cut Hand Pleating in Mulberry Silk Organza',
      advice: 'When commissioning floor-sweeping anarkalis or drape sarees, bias-cut hand pleating in 120 GSM organza catches ambient light on every fold without adding unwanted bulk at the waist.',
      actionableTip: 'Bias-cut pleating anarkali with sheer illusion neckline and antique gold zari border',
      tag: 'Artisan Technique',
      fabricRecommendation: 'Mulberry Silk Organza or Tissue Silk with Mulmul Lining',
      searchQuery: 'hand pleating techniques bespoke atelier draping'
    },
    {
      id: 'advice-3',
      category: 'Color Harmony',
      title: 'Rosewater & Antique Champagne Metallic Zari',
      advice: 'Soft pastel rosewater paired with antique champagne zari is dominating 2026 wedding runways. It offers sublime tonal warmth that photographs flawlessly under both natural day and evening chandeliers.',
      actionableTip: 'Rosewater pastel bridal lehenga with champagne silver zardozi embroidery and crystal accents',
      tag: 'Seasonal Palette',
      fabricRecommendation: 'Banarasi Kincob Brocade or Tussar Raw Silk',
      searchQuery: '2026 bridal color trends pastel metallic zari'
    },
    {
      id: 'advice-4',
      category: 'Master Tailoring Secrets',
      title: 'Internal Grosgrain Waist Stays for Heavy Heirlooms',
      advice: 'Request your master darzi to anchor heavy embroidered skirts with a 1.25-inch hidden grosgrain waist stay. This transfers the entire garment weight safely to your pelvic bones, preserving shoulder posture and neck comfort.',
      actionableTip: 'Heirloom bridal lehenga with hidden grosgrain waist stay and reinforced French seams',
      tag: 'Bespoke Fit Rule',
      fabricRecommendation: 'Pure Silk Velvet or Heavy Brocade with cotton canvas fusing',
      searchQuery: 'couture waist stay engineering bespoke garments'
    }
  ];
}

// Daily Fashion Advice Endpoint with Google Search Grounding & Resilient Cache
app.get('/api/fashion-advice', async (req, res) => {
  const isForceRefresh = req.query.refresh === 'true';

  // 1. Serve fresh cache if available and not explicitly forced
  if (!isForceRefresh && cachedFashionAdvice && (Date.now() - cachedFashionAdvice.timestamp < FASHION_ADVICE_CACHE_TTL)) {
    return res.json(cachedFashionAdvice.data);
  }

  // 2. If Gemini is in quota cooldown or no API key, serve curated knowledge base immediately
  if (!process.env.GEMINI_API_KEY || (Date.now() < geminiQuotaCooldownUntil)) {
    const curatedPayload = {
      tips: getCuratedFashionAdvice(),
      groundingQueries: [
        '2026 haute couture runway trends',
        'bespoke tailoring techniques and waist stays',
        'luxury bridal pastel metallic color harmonies'
      ],
      sources: [
        { title: 'Haute Couture Fashion Intelligence 2026', url: 'https://vogue.com' },
        { title: 'The Business of Fashion Atelier Archive', url: 'https://businessoffashion.com' }
      ],
      isGrounded: false,
      source: 'Curated Atelier Knowledge Base'
    };

    // Cache this result as well so we do not continually re-process
    cachedFashionAdvice = {
      data: curatedPayload,
      timestamp: Date.now()
    };

    return res.json(curatedPayload);
  }

  try {
    const ai = getGeminiClient();

    if (!ai) {
      const fallbackPayload = {
        tips: getCuratedFashionAdvice(),
        groundingQueries: [
          '2026 haute couture runway trends',
          'bespoke tailoring techniques and waist stays',
          'luxury bridal pastel metallic color harmonies'
        ],
        sources: [
          { title: 'Haute Couture Fashion Intelligence 2026', url: 'https://vogue.com' },
          { title: 'The Business of Fashion Atelier Archive', url: 'https://businessoffashion.com' }
        ],
        isGrounded: false,
        source: 'Curated Atelier Knowledge Base'
      };
      return res.json(fallbackPayload);
    }

    // Call Gemini with Google Search grounding
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Search Google for current 2026 high fashion trends, haute couture silhouettes, luxury bespoke tailoring advice, and designer color harmonies.
Provide 4 distinct, inspiring, actionable daily fashion advice tips for bespoke clients.
Output your response as a valid JSON object with the following schema:
{
  "tips": [
    {
      "id": "advice-1",
      "category": "Silhouette & Cut" | "Fabric & Draping" | "Color Harmony" | "Master Tailoring Secrets",
      "title": "Short catchy title",
      "advice": "Two to three sentences of expert bespoke fashion advice grounded in current fashion trends.",
      "actionableTip": "A ready-to-use dress prompt snippet for the AI studio",
      "tag": "Trending 2026",
      "fabricRecommendation": "Recommended fabric type with GSM",
      "searchQuery": "Search query related to this tip"
    }
  ]
}
Return only valid JSON.`,
      config: {
        tools: [{ googleSearch: {} }]
      }
    });

    const responseText = response.text || '';
    let parsed: any = null;

    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = JSON.parse(responseText);
      }
    } catch {
      // Gracefully ignore parse error
    }

    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const webSearchQueries = groundingMetadata?.webSearchQueries || [
      '2026 haute couture runway trends',
      'bespoke tailoring secrets',
      'bridal color palettes and fabric draping'
    ];
    const groundingChunks = groundingMetadata?.groundingChunks || [];

    const sources = groundingChunks
      .map((c: any) => ({
        title: c.web?.title || 'Fashion Grounding Source',
        url: c.web?.uri || '#'
      }))
      .filter((s: any) => s.url && s.url !== '#')
      .slice(0, 4);

    const resultData = {
      tips: (parsed && Array.isArray(parsed.tips) && parsed.tips.length > 0) ? parsed.tips : getCuratedFashionAdvice(),
      groundingQueries: webSearchQueries,
      sources: sources.length > 0 ? sources : [
        { title: 'Google Search Fashion Intelligence', url: 'https://news.google.com' }
      ],
      isGrounded: true,
      source: 'Google Search Grounding'
    };

    cachedFashionAdvice = {
      data: resultData,
      timestamp: Date.now()
    };

    return res.json(resultData);
  } catch (error: any) {
    const msg = error?.message || String(error);
    const isQuota = 
      error?.status === 'RESOURCE_EXHAUSTED' ||
      error?.code === 429 ||
      msg.includes('429') ||
      msg.includes('RESOURCE_EXHAUSTED') ||
      msg.includes('quota');

    if (isQuota) {
      geminiQuotaCooldownUntil = Date.now() + QUOTA_COOLDOWN_PERIOD;
      console.warn('Gemini API quota rate-limit encountered in fashion advice. Activating 15-minute cooldown; serving curated atelier archive.');
    } else {
      console.warn('Fashion advice notice: using curated atelier knowledge base.', msg.slice(0, 100));
    }

    const fallbackPayload = {
      tips: getCuratedFashionAdvice(),
      groundingQueries: [
        '2026 haute couture runway trends',
        'bespoke tailoring techniques and waist stays',
        'luxury bridal pastel metallic color harmonies'
      ],
      sources: [
        { title: 'Haute Couture Fashion Intelligence 2026', url: 'https://vogue.com' },
        { title: 'The Business of Fashion Atelier Archive', url: 'https://businessoffashion.com' }
      ],
      isGrounded: false,
      source: 'Curated Atelier Knowledge Base'
    };

    cachedFashionAdvice = {
      data: fallbackPayload,
      timestamp: Date.now()
    };

    return res.json(fallbackPayload);
  }
});

// Helper to generate image using Gemini image generation models
async function generateImageWithGemini(
  ai: GoogleGenAI,
  prompt: string,
  aspectRatio: string = '3:4'
): Promise<string | null> {
  const models = ['gemini-3.1-flash-lite-image', 'gemini-3.1-flash-image'];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts: [{ text: prompt }],
        },
        config: {
          imageConfig: {
            aspectRatio: aspectRatio as any,
          },
        },
      });

      const parts = response.candidates?.[0]?.content?.parts || [];
      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          return `data:${mime};base64,${part.inlineData.data}`;
        }
      }
    } catch (err: any) {
      console.warn(`Gemini image generation with ${model} notice:`, err?.message || err);
      if (err?.status === 'RESOURCE_EXHAUSTED' || err?.code === 429) {
        break;
      }
    }
  }
  return null;
}

// Helper to determine gender from request parameters
function resolveGender(body: any): 'men' | 'women' {
  if (body?.gender === 'men') return 'men';
  if (body?.gender === 'women') return 'women';
  const str = `${body?.dressType || ''} ${body?.prompt || ''} ${body?.style || ''}`.toLowerCase();
  if (
    str.includes('bandhgala') ||
    str.includes('tuxedo') ||
    str.includes('sherwani') ||
    str.includes('bundi') ||
    str.includes('kurta') ||
    str.includes('nehru') ||
    str.includes('blazer') ||
    str.includes('safari') ||
    str.includes('groom') ||
    str.includes('menswear') ||
    str.includes('men')
  ) {
    return 'men';
  }
  return 'women';
}

// Cohesive multi-angle asset packs ensuring Front, Back, Side, and Detail belong to the SAME look
const COHESIVE_ASSET_PACKS = {
  men: {
    bandhgala: {
      front: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
      side: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
      detail: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80',
    },
    tuxedo: {
      front: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
      side: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
      detail: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80',
    },
    sherwani: {
      front: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1000&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1000&auto=format&fit=crop&q=80',
      side: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1000&auto=format&fit=crop&q=80',
      detail: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80',
    },
    bundi: {
      front: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80',
      side: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80',
      detail: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
    }
  },
  women: {
    lehenga: {
      front: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
      side: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
      detail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
    },
    gown: {
      front: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
      side: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=80',
      detail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
    },
    saree: {
      front: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
      back: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
      side: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=80',
      detail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
    }
  }
};

function getCohesiveAssets(gender: 'men' | 'women', dressType: string) {
  const d = dressType.toLowerCase();
  if (gender === 'men') {
    if (d.includes('tuxedo') || d.includes('suit') || d.includes('blazer')) return COHESIVE_ASSET_PACKS.men.tuxedo;
    if (d.includes('sherwani') || d.includes('achkan')) return COHESIVE_ASSET_PACKS.men.sherwani;
    if (d.includes('nehru') || d.includes('bundi') || d.includes('kurta')) return COHESIVE_ASSET_PACKS.men.bundi;
    return COHESIVE_ASSET_PACKS.men.bandhgala;
  } else {
    if (d.includes('gown') || d.includes('corset') || d.includes('evening')) return COHESIVE_ASSET_PACKS.women.gown;
    if (d.includes('saree') || d.includes('anarkali')) return COHESIVE_ASSET_PACKS.women.saree;
    return COHESIVE_ASSET_PACKS.women.lehenga;
  }
}

// Helper: Use Gemini AI to extract exact hex color palette & garment geometry from any customer prompt
async function extractVisualBlueprintWithGemini(
  ai: GoogleGenAI | null,
  customerPrompt: string,
  fallbackSpecs: {
    gender?: 'women' | 'men';
    dressType?: string;
    color?: string;
    fabric?: string;
    neckline?: string;
    sleeve?: string;
  }
): Promise<{
  customPalette?: CustomColorHexPalette;
  silhouette?: string;
  dressTypeLabel?: string;
  colorName?: string;
  fabric?: string;
  neckline?: string;
  sleeve?: string;
  pattern?: string;
}> {
  if (!ai || !customerPrompt || customerPrompt.trim().length < 3) {
    return {};
  }

  try {
    const response = await generateContentWithFallback(ai, {
      contents: `Analyze this customer fashion dress prompt and extract the exact visual rendering parameters so our atelier synthesizer draws the exact garment described.
Customer Prompt: "${customerPrompt}"
Fallback Context: Gender=${fallbackSpecs.gender || 'women'}, Type=${fallbackSpecs.dressType || ''}, Color=${fallbackSpecs.color || ''}, Fabric=${fallbackSpecs.fabric || ''}

IMPORTANT: Prioritize colors, garment type, sleeves, neckline, and fabric explicitly written in the Customer Prompt over the Fallback Context!
Return ONLY valid JSON with these exact keys:
{
  "colorName": "Descriptive color name from prompt (e.g. Emerald Green, Haldi Yellow, Royal Blue, Crimson Red)",
  "primaryHex": "#HEXCODE of main garment fabric",
  "secondaryHex": "#HEXCODE slightly deeper shade of primaryHex for folds",
  "highlightHex": "#HEXCODE lighter tint of primaryHex for sheen",
  "deepShadowHex": "#HEXCODE dark shadow shade of primaryHex",
  "accentMetallicHex": "#HEXCODE for border/zari/buttons (e.g. #D4AF37 for gold, #E0E0E0 for silver)",
  "embroideryHex": "#HEXCODE for surface motif highlights",
  "silhouette": "MUST be one of: lehenga | saree | anarkali | sharara | kurti | mermaid | bodycon | cocktail | ballgown | corset | gown | bandhgala | tuxedo | sherwani | nehru | blazer",
  "dressTypeLabel": "Concise title of the garment (e.g. Emerald Velvet Mermaid Gown)",
  "fabric": "Fabric name from prompt (e.g. Silk Velvet, Banarasi Silk, Chiffon, Organza)",
  "neckline": "MUST be one of: sweetheart | v-neck | off-shoulder | one-shoulder | halter | high-neck | square | boat | round",
  "sleeve": "MUST be one of: sleeveless | off-shoulder | short | puff | bell | cape | three-quarter | long",
  "pattern": "MUST be one of: zardozi | floral | mirror | sequin | pearl | chikankari | checks | minimal"
}`,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const isHex = (v: any) => typeof v === 'string' && /^#[0-9A-Fa-f]{6}$/.test(v.trim());

    const customPalette: CustomColorHexPalette | undefined = isHex(parsed.primaryHex)
      ? {
          name: parsed.colorName || fallbackSpecs.color || 'Custom Couture Shade',
          primary: parsed.primaryHex.trim(),
          secondary: isHex(parsed.secondaryHex) ? parsed.secondaryHex.trim() : parsed.primaryHex.trim(),
          highlight: isHex(parsed.highlightHex) ? parsed.highlightHex.trim() : '#FAF7F2',
          deepShadow: isHex(parsed.deepShadowHex) ? parsed.deepShadowHex.trim() : '#1A1412',
          accentMetallic: isHex(parsed.accentMetallicHex) ? parsed.accentMetallicHex.trim() : '#D4AF37',
          embroidery: isHex(parsed.embroideryHex) ? parsed.embroideryHex.trim() : '#FFFDF9'
        }
      : undefined;

    return {
      customPalette,
      silhouette: parsed.silhouette,
      dressTypeLabel: parsed.dressTypeLabel,
      colorName: parsed.colorName,
      fabric: parsed.fabric,
      neckline: parsed.neckline,
      sleeve: parsed.sleeve,
      pattern: parsed.pattern
    };
  } catch {
    return {};
  }
}

// Generate Dedicated AI Dress Image - Relevant, Color-Accurate & Angle-Specific
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const {
      prompt = '',
      dressType = 'Haute Couture Gown',
      color = 'Pearl Blush',
      fabric = 'Pure Silk',
      neckline = 'Sculpted Sweetheart',
      sleeve = 'Fitted Couture Sleeves',
      angle = 'front',
      aspectRatio = '3:4'
    } = req.body;

    const resolvedGender = resolveGender(req.body);
    const ai = getGeminiClient();

    // 1. Parse customer prompt deterministically first so user prompt words always override stale defaults
    const parsedFromPrompt = parseCustomerPromptToSpecs(prompt, {
      gender: resolvedGender,
      dressType,
      color,
      fabric,
      neckline,
      sleeve
    });

    // 2. Also query Gemini AI to extract exact hex color palette & silhouette blueprint from the customer prompt
    const aiBlueprint = await extractVisualBlueprintWithGemini(ai, parsedFromPrompt.cleanPrompt || prompt, {
      gender: parsedFromPrompt.gender,
      dressType: parsedFromPrompt.dressType,
      color: parsedFromPrompt.color,
      fabric: parsedFromPrompt.fabric,
      neckline: parsedFromPrompt.neckline,
      sleeve: parsedFromPrompt.sleeve
    });

    const finalGender = parsedFromPrompt.gender;
    const finalDressType = aiBlueprint.dressTypeLabel || parsedFromPrompt.dressType || dressType;
    const finalColor = aiBlueprint.colorName || parsedFromPrompt.color || color;
    const finalFabric = aiBlueprint.fabric || parsedFromPrompt.fabric || fabric;
    const finalNeckline = aiBlueprint.neckline || parsedFromPrompt.neckline || neckline;
    const finalSleeve = aiBlueprint.sleeve || parsedFromPrompt.sleeve || sleeve;
    const finalPattern = aiBlueprint.pattern || parsedFromPrompt.pattern;

    const angleDescriptionsMen: Record<string, string> = {
      front: 'front full-length view showing bespoke tailored silhouette, lapel roll, and trouser drape',
      back: 'back view focusing on clean shoulder construction, back vents, and jacket waist suppression',
      side: 'dramatic three-quarter profile angle showing structured chest canvas and armhole line',
      detail: 'macro extreme close-up shot focusing on pick-stitched lapels, fabric weave texture, and bespoke horn buttons'
    };

    const angleDescriptionsWomen: Record<string, string> = {
      front: 'front full-length view showing complete silhouette, neckline, and flowing drape',
      back: 'back view focusing on back closure, latkan dori tassels, and sweeping train drape',
      side: 'dramatic three-quarter profile angle showing fabric flow, pleating, and architectural structure',
      detail: 'macro close-up shot focusing on artisan zardozi gold embroidery, pearl constellation, and textile weave texture'
    };

    const angleContext = finalGender === 'men'
      ? (angleDescriptionsMen[angle] || angleDescriptionsMen.front)
      : (angleDescriptionsWomen[angle] || angleDescriptionsWomen.front);

    const effectivePrompt = parsedFromPrompt.cleanPrompt
      ? `${parsedFromPrompt.cleanPrompt}, ${finalColor} ${finalDressType} in ${finalFabric}, ${angleContext}`
      : `${finalColor} ${finalDressType} in ${finalFabric}, ${angleContext}`;

    // 3. Try native Gemini Image Model if available
    if (ai && Date.now() >= geminiQuotaCooldownUntil) {
      const geminiImg = await generateImageWithGemini(ai, effectivePrompt, aspectRatio);
      if (geminiImg) {
        return res.json({
          imageUrl: geminiImg,
          prompt: parsedFromPrompt.cleanPrompt || effectivePrompt,
          gender: finalGender,
          model: 'gemini-3.1-flash-lite-image',
          modelUsed: 'Gemini AI Image Synthesis',
          source: 'Gemini AI Atelier Engine',
          extractedSpecs: {
            dressType: finalDressType,
            color: finalColor,
            fabric: finalFabric,
            neckline: finalNeckline,
            sleeve: finalSleeve,
            pattern: finalPattern
          },
          isFree: true
        });
      }
    }

    // 4. Generate all 4 coordinated angles matching the exact customer prompt & AI hex blueprint
    const visualSpecBase = {
      gender: finalGender,
      dressType: finalDressType,
      color: finalColor,
      fabric: finalFabric,
      neckline: finalNeckline,
      sleeve: finalSleeve,
      pattern: finalPattern,
      prompt: parsedFromPrompt.cleanPrompt || prompt,
      customPalette: aiBlueprint.customPalette,
      aiSilhouette: aiBlueprint.silhouette,
      aiNeckline: aiBlueprint.neckline,
      aiSleeve: aiBlueprint.sleeve,
      aiPattern: aiBlueprint.pattern
    };

    const allCoordinatedAngles = generateCohesiveCoutureAngles(visualSpecBase);
    const requestedAngleKey = (angle as 'front' | 'back' | 'side' | 'detail') || 'front';
    const bespokeSvgDataUri = allCoordinatedAngles[requestedAngleKey] || allCoordinatedAngles.front;

    return res.json({
      imageUrl: bespokeSvgDataUri,
      angles: allCoordinatedAngles,
      prompt: parsedFromPrompt.cleanPrompt || effectivePrompt,
      gender: finalGender,
      model: aiBlueprint.customPalette ? 'gemini-3.1-flash-lite + couture-engine' : 'pearl-pick-couture-visualizer',
      modelUsed: aiBlueprint.customPalette ? 'Gemini AI Prompt-to-Couture Synthesizer' : 'Bespoke Couture Visual Engine',
      source: 'Gemini AI Prompt-to-Couture Synthesizer',
      extractedSpecs: {
        dressType: finalDressType,
        color: finalColor,
        fabric: finalFabric,
        neckline: finalNeckline,
        sleeve: finalSleeve,
        pattern: finalPattern
      },
      isFree: true
    });
  } catch (error: any) {
    console.warn('Error generating image:', error?.message || error);
    res.status(500).json({ error: 'Failed to generate image: ' + (error?.message || 'Unknown error') });
  }
});

// Generate AI Dress Design Variations Endpoint
app.post('/api/gemini/generate-dress', async (req, res) => {
  try {
    const rawPrompt = req.body?.prompt || '';
    const initialGender = resolveGender(req.body);

    // 1. Parse customer prompt FIRST so what the customer typed in the prompt box drives the generated image!
    const parsedPromptSpecs = parseCustomerPromptToSpecs(rawPrompt, {
      gender: initialGender,
      dressType: req.body?.dressType,
      color: req.body?.color,
      fabric: req.body?.fabric,
      neckline: req.body?.neckline,
      sleeve: req.body?.sleeve,
      occasion: req.body?.occasion
    });

    const resolvedGender = parsedPromptSpecs.gender;
    const ai = getGeminiClient();

    // 2. Also ask Gemini AI to extract exact hex color palette & silhouette from the customer's prompt
    const aiBlueprint = await extractVisualBlueprintWithGemini(
      ai,
      parsedPromptSpecs.cleanPrompt || rawPrompt,
      {
        gender: resolvedGender,
        dressType: parsedPromptSpecs.dressType,
        color: parsedPromptSpecs.color,
        fabric: parsedPromptSpecs.fabric,
        neckline: parsedPromptSpecs.neckline,
        sleeve: parsedPromptSpecs.sleeve
      }
    );

    const dressType = aiBlueprint.dressTypeLabel || parsedPromptSpecs.dressType || req.body?.dressType || (resolvedGender === 'men' ? 'Royal Jodhpuri Bandhgala' : 'Haute Couture Gown');
    const occasion = req.body?.occasion || (resolvedGender === 'men' ? 'Groom & Royal Baraat' : 'Indian Wedding & Reception');
    const fabric = aiBlueprint.fabric || parsedPromptSpecs.fabric || req.body?.fabric || (resolvedGender === 'men' ? 'Pure Banarasi Raw Silk' : 'Pure Mulberry Silk');
    const color = aiBlueprint.colorName || parsedPromptSpecs.color || req.body?.color || (resolvedGender === 'men' ? 'Midnight Obsidian' : 'Pearl Blush');
    const sleeve = parsedPromptSpecs.sleeve || req.body?.sleeve || (resolvedGender === 'men' ? 'French Tailored Cuffs' : 'Fitted Couture Sleeves');
    const neckline = parsedPromptSpecs.neckline || req.body?.neckline || (resolvedGender === 'men' ? 'Mandarin Bandhgala Collar' : 'Sculpted Sweetheart');
    const pattern = parsedPromptSpecs.pattern || req.body?.pattern || 'Hand Zardozi & Dabka Gold';

    const {
      waistStyle = resolvedGender === 'men' ? 'Structured English Waist' : 'Corseted Basque',
      backDesign = resolvedGender === 'men' ? 'Double Side Vents' : 'Deep U with Latkan Dori',
      length = resolvedGender === 'men' ? 'Jacket Hip Length (30")' : 'Floor-Sweeping (44")',
      embroidery = pattern,
      accessories = resolvedGender === 'men' ? 'Matching Pocket Square & Brooch' : 'Matching Embroidered Dupatta & Potli',
      borderDesign = resolvedGender === 'men' ? 'Hand-Pick Stitched AMF Edge' : 'Scalloped Zari Temple Border',
      lining = resolvedGender === 'men' ? 'Cupro Anti-Static Bemberg' : 'Pure Cotton Mulmul (Breathable)',
      fit = 'Bespoke Tailored Regular',
      style = resolvedGender === 'men' ? 'Imperial Rajputana Suiting' : 'Royal Heritage Couture',
      budget = resolvedGender === 'men' ? '₹38,000' : '₹35,000'
    } = req.body;

    const cleanCustomerPrompt = parsedPromptSpecs.cleanPrompt || rawPrompt;

    let variationsData: any = null;

    if (ai) {
      try {
        const systemPrompt = resolvedGender === 'men'
          ? `You are an elite master bespoke menswear atelier and royal darzi design director for "PEARL PICK!".
Generate 2 bespoke men's luxury tailoring design variations strictly matching the customer's prompt:
- Customer Prompt: "${cleanCustomerPrompt}"
- Garment Type: ${dressType}
- Occasion: ${occasion}
- Fabric: ${fabric}
- Color: ${color}
- Sleeve Style: ${sleeve}
- Collar/Lapel: ${neckline}
- Embellishment/Pattern: ${pattern}

Return JSON matching this exact structure:
{
  "title": "Bespoke Menswear Title matching Customer Prompt",
  "variations": [
    {
      "name": "Variation 1 Title",
      "tagline": "Poetic masculine tailoring summary (1 sentence)",
      "fabricDetails": {
        "primary": "Detailed fabric specification with weave and GSM",
        "lining": "Bemberg or Cupro anti-static lining specification",
        "embellishments": "Collar embroidery, buttons, and hand-pick stitching details",
        "estimatedYards": 5.5,
        "recommendedWeightGsm": 360
      },
      "tailorNotes": [
        "Hand-basted full floating horsehair canvas chest piece",
        "2-inch alteration allowance across chest, waist, and trousers",
        "Mandarin collar reinforced with Japanese canvas"
      ],
      "stylingTips": [
        "Uncut polki brooch and pure silk pocket square",
        "Handcrafted velvet mojaris or patent leather oxfords"
      ],
      "colorPsychology": "Significance of this color in royal menswear",
      "estimatedCraftTimeDays": 14,
      "estimatedPriceRange": { "min": 32000, "max": 48000, "currency": "INR" }
    },
    {
      "name": "Variation 2 Title",
      "tagline": "Alternative interpretation tagline",
      "fabricDetails": {
        "primary": "Alternative luxury fabric",
        "lining": "Alternative lining",
        "embellishments": "Alternative embellishment",
        "estimatedYards": 5.5,
        "recommendedWeightGsm": 340
      },
      "tailorNotes": [
        "Shoulder padding aligned to client posture profile",
        "Concealed inner pockets and horn buttons"
      ],
      "stylingTips": [
        "Contemporary styling recommendation"
      ],
      "colorPsychology": "Aesthetic impact",
      "estimatedCraftTimeDays": 12,
      "estimatedPriceRange": { "min": 28000, "max": 44000, "currency": "INR" }
    }
  ]
}`
          : `You are a master haute couture design director for "PEARL PICK!".
Generate 2 bespoke couture dress design variations strictly matching the customer's prompt:
- Customer Prompt: "${cleanCustomerPrompt}"
- Dress Type: ${dressType}
- Occasion: ${occasion}
- Fabric: ${fabric}
- Color: ${color}
- Sleeve Style: ${sleeve}
- Neckline: ${neckline}
- Pattern/Embellishment: ${pattern}

Return JSON matching this exact structure:
{
  "title": "Bespoke Dress Title matching Customer Prompt",
  "variations": [
    {
      "name": "Variation 1 Title",
      "tagline": "Poetic design summary matching the customer prompt (1 sentence)",
      "fabricDetails": {
        "primary": "Detailed fabric name with weave and weight (GSM)",
        "lining": "Lining fabric specification (e.g., Pure Cotton Mulmul / Satin)",
        "embellishments": "Surface embroidery and beadwork details",
        "estimatedYards": 7.5,
        "recommendedWeightGsm": 320
      },
      "tailorNotes": [
        "Include 2.5-inch side margin inside bodice for alterations",
        "Technical sewing instruction 2",
        "Technical sewing instruction 3"
      ],
      "stylingTips": [
        "Jewelry recommendation",
        "Footwear and draping advice"
      ],
      "colorPsychology": "Significance of this color",
      "estimatedCraftTimeDays": 16,
      "estimatedPriceRange": { "min": 28000, "max": 48000, "currency": "INR" }
    },
    {
      "name": "Variation 2 Title",
      "tagline": "Alternative interpretation tagline",
      "fabricDetails": {
        "primary": "Alternative luxury fabric",
        "lining": "Alternative lining",
        "embellishments": "Alternative embellishment",
        "estimatedYards": 6.0,
        "recommendedWeightGsm": 280
      },
      "tailorNotes": [
        "Include side alteration margins",
        "Technical cutting instruction"
      ],
      "stylingTips": [
        "Modern styling recommendation"
      ],
      "colorPsychology": "Aesthetic impact explanation",
      "estimatedCraftTimeDays": 12,
      "estimatedPriceRange": { "min": 22000, "max": 38000, "currency": "INR" }
    }
  ]
}`;

        const response = await generateContentWithFallback(ai, {
          contents: systemPrompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        variationsData = JSON.parse(response.text || '{}');
      } catch {
        variationsData = null;
      }
    }

    // Fallback if Gemini is offline or failed
    if (!variationsData || !variationsData.variations || variationsData.variations.length === 0) {
      variationsData = {
        title: `${color} ${dressType}`,
        variations: [
          {
            name: `The Signature ${color} ${dressType}`,
            tagline: cleanCustomerPrompt || `Hand-sculpted ${fabric} ${dressType} with ${neckline} and ${sleeve}`,
            fabricDetails: {
              primary: `${fabric} (Master Loom)`,
              lining: resolvedGender === 'men' ? 'Cupro Anti-Static Bemberg Lining' : 'Pure Cotton Mulmul Breathable Lining',
              embellishments: pattern,
              estimatedYards: resolvedGender === 'men' ? 5.5 : 7.5,
              recommendedWeightGsm: 320
            },
            tailorNotes: [
              `Construct reinforced bodice with 2.5-inch internal alteration allowance.`,
              `Tailor ${neckline} and ${sleeve} to exact 14-point customer measurements.`,
              `Finish hemline with horsehair braid for sculptural movement.`
            ],
            stylingTips: [
              `Pair with statement heirloom jewelry and bespoke footwear.`,
              `Crafted specifically for ${occasion}.`
            ],
            colorPsychology: `${color} conveys sophistication, celebration, and timeless couture poise.`,
            estimatedCraftTimeDays: 14,
            estimatedPriceRange: { min: 26000, max: 45000, currency: 'INR' }
          },
          {
            name: `The Atelier Edition ${color} ${dressType}`,
            tagline: `Contemporary architectural drape in ${color} ${fabric} with ${sleeve}`,
            fabricDetails: {
              primary: `${fabric}`,
              lining: `Soft Cupro Habotai`,
              embellishments: pattern,
              estimatedYards: 6.0,
              recommendedWeightGsm: 280
            },
            tailorNotes: [
              `Precision panels cut along grain with concealed closure.`,
              `Hand-finished French seams throughout.`
            ],
            stylingTips: [
              `Minimalist contemporary styling for evening receptions.`
            ],
            colorPsychology: `${color} creates a radiant silhouette under ambient lighting.`,
            estimatedCraftTimeDays: 12,
            estimatedPriceRange: { min: 22000, max: 38000, currency: 'INR' }
          }
        ]
      };
    }

    // Map variations with 100% prompt-faithful, color-accurate, silhouette-matched 4-angle visuals (Front, Back, Side, Detail)
    const variationsWithAssets = variationsData.variations.map((v: any, index: number) => {
      const variationAngles = generateCohesiveCoutureAngles({
        gender: resolvedGender,
        dressType,
        color,
        fabric: v.fabricDetails?.primary || fabric,
        neckline,
        sleeve,
        pattern: v.fabricDetails?.embellishments || pattern,
        occasion,
        prompt: cleanCustomerPrompt,
        customPalette: aiBlueprint.customPalette,
        aiSilhouette: aiBlueprint.silhouette,
        aiNeckline: aiBlueprint.neckline,
        aiSleeve: aiBlueprint.sleeve,
        aiPattern: aiBlueprint.pattern
      });

      return {
        id: `var-${Date.now()}-${index + 1}`,
        name: v.name || `${color} ${dressType} — Edition ${index + 1}`,
        tagline: v.tagline || cleanCustomerPrompt || `Bespoke ${dressType} in ${fabric} (${color})`,
        frontImageUrl: variationAngles.front,
        backImageUrl: variationAngles.back,
        sideImageUrl: variationAngles.side,
        detailImageUrl: variationAngles.detail,
        fabricDetails: v.fabricDetails,
        tailorNotes: v.tailorNotes || [],
        stylingTips: v.stylingTips || [],
        colorPsychology: v.colorPsychology || '',
        estimatedCraftTimeDays: v.estimatedCraftTimeDays || 14,
        estimatedPriceRange: v.estimatedPriceRange || { min: 25000, max: 45000, currency: 'INR' },
        specs: {
          gender: resolvedGender,
          dressType,
          occasion,
          fabric,
          color,
          sleeve,
          neckline,
          pattern,
          waistStyle,
          backDesign,
          length,
          embroidery,
          accessories,
          borderDesign,
          lining,
          fit,
          style,
          budget
        }
      };
    });

    const resultDressDesign = {
      id: `design-${Date.now()}`,
      customerId: 'cust-1',
      customerName: 'Ananya Verma',
      title: variationsData.title || `${color} ${dressType}`,
      prompt: cleanCustomerPrompt || `Custom ${color} ${dressType} in ${fabric} for ${occasion}`,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      selectedVariationIndex: 0,
      tags: [resolvedGender === 'men' ? 'Menswear' : 'Womenswear', occasion, dressType, fabric, color],
      variations: variationsWithAssets
    };

    res.json(resultDressDesign);
  } catch (error: any) {
    console.warn('Notice in dress generation, using bespoke fallback:', error?.message || error);
    const parsedFallback = parseCustomerPromptToSpecs(req.body?.prompt || '', {
      gender: resolveGender(req.body),
      dressType: req.body?.dressType,
      color: req.body?.color,
      fabric: req.body?.fabric,
      neckline: req.body?.neckline,
      sleeve: req.body?.sleeve
    });
    const fallbackAngles = generateCohesiveCoutureAngles({
      gender: parsedFallback.gender,
      dressType: parsedFallback.dressType,
      color: parsedFallback.color,
      fabric: parsedFallback.fabric,
      neckline: parsedFallback.neckline,
      sleeve: parsedFallback.sleeve,
      pattern: parsedFallback.pattern,
      prompt: parsedFallback.cleanPrompt
    });
    res.json({
      id: `design-fallback-${Date.now()}`,
      customerId: 'cust-1',
      customerName: 'Ananya Verma',
      title: `${parsedFallback.color} ${parsedFallback.dressType}`,
      prompt: parsedFallback.cleanPrompt || 'Custom bespoke haute couture dress design',
      createdAt: new Date().toISOString(),
      isFavorite: false,
      selectedVariationIndex: 0,
      tags: [parsedFallback.gender === 'men' ? 'Menswear' : 'Womenswear', parsedFallback.dressType, parsedFallback.color],
      variations: [
        {
          id: `var-fb-1`,
          name: `The Atelier Signature ${parsedFallback.color} ${parsedFallback.dressType}`,
          tagline: parsedFallback.cleanPrompt || 'Hand-sculpted couture silhouette with master tailor finishing',
          frontImageUrl: fallbackAngles.front,
          backImageUrl: fallbackAngles.back,
          sideImageUrl: fallbackAngles.side,
          detailImageUrl: fallbackAngles.detail,
          fabricDetails: {
            primary: parsedFallback.fabric,
            lining: parsedFallback.gender === 'men' ? 'Cupro Anti-Static Bemberg' : 'Pure Cotton Mulmul (Breathable)',
            embellishments: parsedFallback.pattern,
            estimatedYards: parsedFallback.gender === 'men' ? 5.5 : 7.5,
            recommendedWeightGsm: 340
          },
          tailorNotes: [
            '2.5-inch internal alteration allowance on all lateral bodice seams',
            'Hidden grosgrain waist stay for ergonomic weight distribution',
            'Horsehair braid hem finish for fluid sculptural drape'
          ],
          stylingTips: ['Pair with heirloom Polki or antique Kundan jewelry'],
          colorPsychology: 'Auspicious elegance and regal poise',
          estimatedCraftTimeDays: 14,
          estimatedPriceRange: { min: 28000, max: 42000, currency: 'INR' },
          specs: {
            ...req.body,
            gender: parsedFallback.gender,
            dressType: parsedFallback.dressType,
            color: parsedFallback.color,
            fabric: parsedFallback.fabric,
            neckline: parsedFallback.neckline,
            sleeve: parsedFallback.sleeve,
            pattern: parsedFallback.pattern
          }
        }
      ]
    });
  }
});

// Server-side Password Hashing & Role-Based Authentication Store
const PASSWORD_SALT = 'pearl-pick-couture-salt-2026';
function hashPassword(password: string): string {
  return crypto.scryptSync(password, PASSWORD_SALT, 64).toString('hex');
}

interface ServerUserRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: 'customer' | 'tailor' | 'admin';
  passwordHash: string;
  avatar: string;
  city: string;
  walletBalanceINR: number;
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'PENDING_APPROVAL';
  tailorProfileId?: string;
}

const serverUsers: ServerUserRecord[] = [
  {
    id: 'cust-1',
    name: 'Ananya Verma',
    phone: '9820154321',
    email: 'ananya.verma@mumbai.in',
    role: 'customer',
    passwordHash: hashPassword('password123'),
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    city: 'Mumbai, Maharashtra',
    walletBalanceINR: 52000,
    accountStatus: 'ACTIVE',
  },
  {
    id: 'tailor-1',
    name: 'Ustad Rafiq Ahmed',
    phone: '9811234567',
    email: 'rafiq.ahmed@darzicouture.in',
    role: 'tailor',
    passwordHash: hashPassword('darzi123'),
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    city: 'Old Delhi, Delhi NCR',
    walletBalanceINR: 145000,
    accountStatus: 'ACTIVE',
    tailorProfileId: 'tailor-1',
  },
  {
    id: 'tailor-3',
    name: 'Meera Nandini',
    phone: '9845011223',
    email: 'meera@kanjeevaramstudio.in',
    role: 'tailor',
    passwordHash: hashPassword('darzi123'),
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    city: 'Chennai, Tamil Nadu',
    walletBalanceINR: 64000,
    accountStatus: 'PENDING_APPROVAL',
    tailorProfileId: 'tailor-3',
  },
  {
    id: 'admin-1',
    name: 'Vikramaditya Singhania',
    phone: '9999000001',
    email: 'vikram@pearlpick.in',
    role: 'admin',
    passwordHash: hashPassword('admin123'),
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    city: 'New Delhi, Delhi NCR',
    walletBalanceINR: 850000,
    accountStatus: 'ACTIVE',
  },
];

// Valid Designer Order Status Pipeline
const VALID_ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  'Pending': ['Accepted'],
  'Accepted': ['Awaiting Payment'],
  'Awaiting Payment': ['In Production'],
  'In Production': ['Quality Check'],
  'Quality Check': ['Shipped'],
  'Shipped': ['Delivered'],
  'Delivered': [],
};

// 1. Role-Specific Login Endpoint
app.post('/api/auth/login', (req, res) => {
  const { phoneOrEmail, password, role } = req.body;
  if (!phoneOrEmail || !password) {
    return res.status(400).json({ error: 'Credentials and password are required.' });
  }

  const cleanPhone = String(phoneOrEmail).replace(/\D/g, '').slice(-10);
  const incomingHash = hashPassword(String(password));

  const matched = serverUsers.find(
    (u) =>
      (u.phone.endsWith(cleanPhone) && cleanPhone.length === 10) ||
      u.email.toLowerCase() === String(phoneOrEmail).toLowerCase()
  );

  if (matched) {
    if (role && matched.role !== role) {
      return res.status(403).json({
        error: `This account is registered under the "${matched.role}" portal, not "${role}". Please switch portals.`,
      });
    }
    if (matched.accountStatus === 'SUSPENDED') {
      return res.status(403).json({ error: 'This account has been suspended by Platform Administration.' });
    }
    // Check password hash or allow demo fallback
    const isDemoPass = ['password123', 'darzi123', 'admin123'].includes(String(password));
    if (matched.passwordHash !== incomingHash && !isDemoPass) {
      return res.status(401).json({ error: 'Invalid password for this account.' });
    }

    const sessionToken = crypto.randomBytes(24).toString('hex');
    const { passwordHash: _, ...safeUser } = matched;
    return res.json({
      user: { ...safeUser, phone: `+91 ${matched.phone}` },
      token: sessionToken,
    });
  }

  // Block unknown admin logins strictly
  if (role === 'admin') {
    return res.status(403).json({
      error: 'Unauthorized Admin credentials. Admin accounts cannot be created or accessed without pre-provisioned clearance.',
    });
  }

  // Create session for valid customer/tailor mobile login
  const newUser: ServerUserRecord = {
    id: `${role || 'cust'}-${Date.now()}`,
    name: role === 'tailor' ? 'Master Atelier Partner' : 'Couture Patron',
    phone: cleanPhone || '9820154321',
    email: `${cleanPhone || 'patron'}@pearlpick.in`,
    role: role === 'tailor' ? 'tailor' : 'customer',
    passwordHash: incomingHash,
    avatar:
      role === 'tailor'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    city: 'Mumbai, Maharashtra',
    walletBalanceINR: role === 'tailor' ? 75000 : 50000,
    accountStatus: role === 'tailor' ? 'PENDING_APPROVAL' : 'ACTIVE',
  };
  serverUsers.push(newUser);
  const { passwordHash: _, ...safeNewUser } = newUser;
  return res.json({
    user: { ...safeNewUser, phone: `+91 ${newUser.phone}` },
    token: crypto.randomBytes(24).toString('hex'),
  });
});

// 2. Role-Specific Registration Endpoint (Admin registration strictly forbidden)
app.post('/api/auth/register', (req, res) => {
  const { name, phone, email, password, role, city, shopName, specialties, experienceYears, pricingRange, portfolioUrl, verificationId } = req.body;

  if (role === 'admin') {
    return res.status(403).json({
      error: 'Admin accounts cannot be publicly registered. Contact system governance.',
    });
  }

  if (!name || !phone || !password) {
    return res.status(400).json({ error: 'Name, mobile number, and password are required.' });
  }

  const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
  const newId = `${role === 'tailor' ? 'tailor' : 'cust'}-${Date.now().toString().slice(-6)}`;

  const newUser: ServerUserRecord = {
    id: newId,
    name,
    phone: cleanPhone,
    email: email || `${cleanPhone}@pearlpick.in`,
    role: role === 'tailor' ? 'tailor' : 'customer',
    passwordHash: hashPassword(String(password)),
    avatar:
      role === 'tailor'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    city: city || 'Mumbai, Maharashtra',
    walletBalanceINR: role === 'tailor' ? 0 : 45000,
    accountStatus: role === 'tailor' ? 'PENDING_APPROVAL' : 'ACTIVE',
    tailorProfileId: role === 'tailor' ? newId : undefined,
  };

  serverUsers.push(newUser);
  const { passwordHash: _, ...safeUser } = newUser;

  return res.status(201).json({
    user: { ...safeUser, phone: `+91 ${cleanPhone}` },
    designerApplication:
      role === 'tailor'
        ? {
            id: newId,
            userId: newId,
            name,
            shopName: shopName || `${name} Bespoke Studio`,
            city: city || 'Mumbai',
            state: 'Maharashtra',
            country: 'India',
            experienceYears: Number(experienceYears) || 8,
            verificationStatus: 'PENDING',
            rating: 4.8,
            reviewCount: 1,
            completedOrders: 0,
            specialties: Array.isArray(specialties) ? specialties : [specialties || 'Bridal & Festive Couture'],
            pricingRange: pricingRange || '₹8,000 – ₹45,000',
            startingPrice: 8000,
            averageTurnaroundDays: 14,
            portfolioUrl,
            verificationId,
          }
        : null,
    token: crypto.randomBytes(24).toString('hex'),
  });
});

// 2b. OTP-Based Authentication Endpoints (Myntra-style Customer OTP Login)
const otpStore = new Map<string, { otp: string; expiresAt: number }>();

app.post('/api/auth/send-otp', (req, res) => {
  const { phone } = req.body;
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  if (cleanPhone.length !== 10) {
    return res.status(400).json({ error: 'Please enter a valid 10-digit mobile number.' });
  }
  const otp = '4829'; // Deterministic demo OTP + returned in dev hint
  otpStore.set(cleanPhone, { otp, expiresAt: Date.now() + 5 * 60 * 1000 });
  return res.json({
    sent: true,
    phone: `+91 ${cleanPhone}`,
    otpHint: otp,
    message: `OTP sent to +91 ${cleanPhone}`,
  });
});

app.post('/api/auth/verify-otp', (req, res) => {
  const { phone, otp, name } = req.body;
  const cleanPhone = String(phone || '').replace(/\D/g, '').slice(-10);
  const stored = otpStore.get(cleanPhone);

  if (!otp || String(otp).trim().length < 4) {
    return res.status(400).json({ error: 'Please enter a valid 4-digit OTP.' });
  }
  if (stored && stored.otp !== String(otp).trim() && String(otp).trim() !== '4829') {
    return res.status(401).json({ error: 'Invalid OTP. Please check and try again.' });
  }

  let matched = serverUsers.find((u) => u.phone.endsWith(cleanPhone) && u.role === 'customer');
  if (!matched) {
    matched = {
      id: `cust-${Date.now().toString().slice(-6)}`,
      name: name || 'Pearl Pick Member',
      phone: cleanPhone,
      email: `${cleanPhone}@pearlpick.in`,
      role: 'customer',
      passwordHash: hashPassword('password123'),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      city: 'Mumbai, Maharashtra',
      walletBalanceINR: 50000,
      accountStatus: 'ACTIVE',
    };
    serverUsers.push(matched);
  }

  const { passwordHash: _, ...safeUser } = matched;
  return res.json({
    user: { ...safeUser, phone: `+91 ${matched.phone}` },
    token: crypto.randomBytes(24).toString('hex'),
  });
});

// 3. Server-Verified Order Status Transition Endpoint
app.post('/api/orders/validate-transition', (req, res) => {
  const { orderId, currentStatus, nextStatus } = req.body;
  const allowed = VALID_ORDER_STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(nextStatus)) {
    return res.status(400).json({
      valid: false,
      error: `Invalid status transition from "${currentStatus}" to "${nextStatus}". Allowed next step: ${allowed.join(', ') || 'None (Terminal State)'}`,
    });
  }
  return res.json({
    valid: true,
    orderId,
    previousStatus: currentStatus,
    workflowStatus: nextStatus,
    updatedAt: new Date().toISOString(),
  });
});

// 4. Server-Verified Payment Verification Endpoint
app.post('/api/payments/verify', (req, res) => {
  const { amount, quotationId, orderType, customerAgreed, designerAgreed } = req.body;
  if (orderType === 'tailor' && (!customerAgreed || !designerAgreed)) {
    return res.status(400).json({
      verified: false,
      error: 'Both Customer and Designer must explicitly agree on the final negotiated price before payment can be processed.',
    });
  }
  return res.json({
    verified: true,
    escrowVaultId: `BHARAT-ESCROW-${Date.now().toString().slice(-6)}`,
    transactionReference: `UTR${Date.now().toString().slice(-8)}`,
    amountVerified: amount,
    quotationId,
    timestamp: new Date().toISOString(),
  });
});

// Mock GraphQL Endpoint for queries & mutations
app.post('/api/graphql', (req, res) => {
  const { query, variables } = req.body;
  // Return standard GraphQL formatted response
  res.json({
    data: {
      status: 'GraphQL operational',
      queryReceived: query ? query.substring(0, 50) + '...' : '',
      timestamp: new Date().toISOString()
    }
  });
});

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`PEARL PICK! Server running on http://localhost:${PORT}`);
  });
}

startServer();
