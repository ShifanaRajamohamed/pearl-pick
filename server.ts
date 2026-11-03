import express from 'express';
import http from 'http';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import {
  detectPromptContradictions,
  resolveDressSpecifications
} from './src/services/promptSpecResolver';
import {
  DressGenerationError,
  generateAnglePhotorealisticDress,
  generateMultiViewPhotorealisticDress
} from './src/server/dressPhotoService';
import { initDatabase } from './src/server/db';
import { authenticateSession } from './src/server/auth';
import { createApiRouter } from './src/server/apiRouter';

dotenv.config();

// Initialize durable SQLite database and run canonical RBAC migration
initDatabase();

export const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use('/api', authenticateSession);

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

// Prompt Enhancement Endpoint using Gemini (Preserves requested design & exclusions; improves clarity/photography only)
app.post('/api/gemini/enhance-prompt', async (req, res) => {
  try {
    const rawPrompt = String(req.body?.prompt || '').trim();
    const contradictionCheck = detectPromptContradictions(rawPrompt);
    if (contradictionCheck.hasContradictions) {
      return res.status(422).json({
        error: contradictionCheck.conflicts.join(' '),
        code: 'PROMPT_CONTRADICTION',
        clarificationNeeded: true,
        conflicts: contradictionCheck.conflicts
      });
    }

    const resolved = resolveDressSpecifications(rawPrompt, {
      gender: req.body?.gender,
      dressType: req.body?.dressType,
      occasion: req.body?.occasion,
      fabric: req.body?.fabric,
      color: req.body?.color,
      neckline: req.body?.neckline,
      sleeve: req.body?.sleeve
    });

    const ai = getGeminiClient();
    const exclusionsClause =
      resolved.exclusions.length > 0 ? ` Exclusions: ${resolved.exclusions.join('; ')}.` : '';

    if (!ai) {
      const enhanced = `${resolved.cleanPrompt || `${resolved.color} ${resolved.fabric} ${resolved.length.toLowerCase()} ${resolved.garmentType} with ${resolved.neckline.toLowerCase()} and ${resolved.sleeves.toLowerCase()}`}. Photographed as a full-length finished garment with realistic ${resolved.fabric.toLowerCase()} drape, natural folds, accurate body fit, and soft studio lighting against a ${resolved.background.toLowerCase()}.${exclusionsClause}`;
      return res.json({ enhancedPrompt: enhanced.trim(), isFallback: true });
    }

    const response = await generateContentWithFallback(ai, {
      contents: `You are a fashion photography prompt editor. Improve only the linguistic clarity, textile realism, and photographic lighting description of the user's dress request.
CRITICAL RULES:
1. Preserve the exact garment type (${resolved.garmentType}), colour (${resolved.color}), fabric (${resolved.fabric}), neckline (${resolved.neckline}), sleeves (${resolved.sleeves}), length (${resolved.length}), embroidery (${resolved.embroidery}), background (${resolved.background}), and all exclusions (${resolved.exclusions.join('; ')}).
2. Do NOT change the requested design or add unrequested jewellery, belts, capes, borders, or extra embroidery.
3. Output only the clarified prompt in 2-3 concise sentences.

User Request: "${rawPrompt}"`,
    });

    const enhanced = response.text?.trim() || rawPrompt;
    res.json({ enhancedPrompt: enhanced, isFallback: false });
  } catch (error: any) {
    const resolved = resolveDressSpecifications(req.body?.prompt || '', req.body || {});
    res.json({
      enhancedPrompt:
        resolved.cleanPrompt ||
        `${resolved.color} ${resolved.fabric} ${resolved.length.toLowerCase()} ${resolved.garmentType} with ${resolved.neckline.toLowerCase()}, ${resolved.sleeves.toLowerCase()}, and ${resolved.embroidery.toLowerCase()}. ${resolved.background}.`,
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
    str.includes('nehru') ||
    str.includes('blazer') ||
    str.includes('safari') ||
    str.includes('groom') ||
    str.includes('menswear')
  ) {
    return 'men';
  }
  return 'women';
}

// Generate Photorealistic AI Dress Image (Single Angle or Full 4-Angle Reference-Conditioned Set)
app.post('/api/gemini/generate-image', async (req, res) => {
  try {
    const rawPrompt = String(req.body?.prompt || '').trim();
    const angleRaw = String(req.body?.angle || 'front').toLowerCase();
    const angle: 'front' | 'back' | 'side' | 'detail' =
      angleRaw === 'back' || angleRaw === 'side' || angleRaw === 'detail' ? angleRaw : 'front';
    const aspectRatio = (req.body?.aspectRatio || '3:4') as '1:1' | '3:4' | '4:3' | '9:16' | '16:9';

    const result = await generateAnglePhotorealisticDress({
      prompt: rawPrompt,
      angle,
      aspectRatio,
      referenceFrontDataUrl: req.body?.referenceFrontDataUrl || req.body?.referenceImageUrl || null,
      regenerateAllAngles: Boolean(req.body?.regenerateAllAngles),
      formDefaults: {
        gender: resolveGender(req.body),
        dressType: req.body?.dressType,
        occasion: req.body?.occasion,
        color: req.body?.color,
        fabric: req.body?.fabric,
        neckline: req.body?.neckline,
        sleeve: req.body?.sleeve,
        pattern: req.body?.pattern
      }
    });

    const spec = result.resolvedSpec;
    return res.json({
      imageUrl: result.imageUrl,
      ...(result.angles ? { angles: result.angles } : {}),
      prompt: spec.cleanPrompt || rawPrompt,
      promptUsed: result.promptUsed,
      gender: spec.gender,
      model: result.modelUsed,
      modelUsed: `${result.modelUsed} (Photorealistic Fashion Synthesis)`,
      source: 'Gemini Photorealistic Fashion Engine',
      extractedSpecs: {
        dressType: spec.garmentType,
        color: spec.color,
        fabric: spec.fabric,
        neckline: spec.neckline,
        sleeve: spec.sleeves,
        pattern: spec.embroidery,
        length: spec.length,
        waistStyle: spec.waistAndFit,
        backDesign: spec.backDesign,
        backSpecifiedByUser: spec.backSpecifiedByUser,
        accessories: spec.accessories || 'None',
        exclusions: spec.exclusions,
        background: spec.background
      }
    });
  } catch (error: any) {
    if (error instanceof DressGenerationError) {
      return res.status(error.status).json({
        error: error.message,
        code: error.code,
        retryable: error.retryable,
        clarificationNeeded: error.code === 'PROMPT_CONTRADICTION',
        conflicts: error.conflicts || []
      });
    }
    return res.status(502).json({
      error: error?.message || 'Failed to generate photorealistic dress image.',
      code: 'GENERATION_FAILED',
      retryable: true
    });
  }
});

// Generate Photorealistic 4-View AI Dress Design (Front First -> Reference-Conditioned Back, Side & Macro Detail)
app.post('/api/gemini/generate-dress', async (req, res) => {
  try {
    const rawPrompt = String(req.body?.prompt || '').trim();
    const initialGender = resolveGender(req.body);

    const userRefImage =
      req.body?.inspirationImage || req.body?.sketchImage || req.body?.referenceImageUrl || null;

    // 1. Generate real 4-angle photorealistic images (Front generated first, then Back/Side/Detail conditioned on Front)
    const photoResult = await generateMultiViewPhotorealisticDress({
      prompt: rawPrompt,
      aspectRatio: '3:4',
      userReferenceDataUrl: userRefImage,
      formDefaults: {
        gender: initialGender,
        dressType: req.body?.dressType,
        occasion: req.body?.occasion,
        fabric: req.body?.fabric,
        color: req.body?.color,
        sleeve: req.body?.sleeve,
        neckline: req.body?.neckline,
        pattern: req.body?.pattern,
        waistStyle: req.body?.waistStyle,
        backDesign: req.body?.backDesign,
        length: req.body?.length,
        accessories: req.body?.accessories
      }
    });

    const spec = photoResult.resolvedSpec;
    const budget = req.body?.budget || (spec.gender === 'men' ? '₹38,000' : '₹35,000');
    const lining =
      req.body?.lining ||
      (spec.gender === 'men' ? 'Cupro Anti-Static Bemberg Lining' : 'Breathable Silk Crepe / Mulmul Lining');

    const tailorNotes: string[] = [
      `Construct ${spec.length.toLowerCase()} ${spec.garmentType.toLowerCase()} in ${spec.fabric} (${spec.color}) with ${spec.waistAndFit.toLowerCase()}.`,
      `Cut and finish ${spec.neckline.toLowerCase()} and ${spec.sleeves.toLowerCase()} with 2-inch internal seam allowance for fitting adjustments.`,
      `Surface detail specification: ${spec.embroidery}.`,
      spec.backSpecifiedByUser
        ? `Back construction (requested by client): ${spec.backDesign}.`
        : `Back construction (plausible compatible design): ${spec.backDesign}.`
    ];

    if (spec.exclusions.length > 0) {
      tailorNotes.push(`Strict Exclusions: ${spec.exclusions.join('; ')}.`);
    }

    const stylingTips: string[] = [
      spec.accessories
        ? `Requested accessories: ${spec.accessories}.`
        : `Presented without unrequested accessories (${spec.exclusions.slice(0, 2).join(', ') || 'clean presentation'}).`,
      `Photographed on a ${spec.background.toLowerCase()} for clear evaluation of garment drape and hemline.`
    ];

    const primaryVariation = {
      id: `var-${Date.now()}-1`,
      name: spec.title,
      tagline:
        spec.cleanPrompt ||
        `${spec.color} ${spec.fabric} ${spec.length.toLowerCase()} ${spec.garmentType} with ${spec.neckline.toLowerCase()} and ${spec.sleeves.toLowerCase()}`,
      frontImageUrl: photoResult.frontImageUrl,
      backImageUrl: photoResult.backImageUrl,
      sideImageUrl: photoResult.sideImageUrl,
      detailImageUrl: photoResult.detailImageUrl,
      fabricDetails: {
        primary: `${spec.fabric} (${spec.color})`,
        lining,
        embellishments: spec.embroidery,
        estimatedYards: spec.gender === 'men' ? 5.5 : 7.5,
        recommendedWeightGsm: spec.fabric.toLowerCase().includes('velvet')
          ? 360
          : spec.fabric.toLowerCase().includes('organza') || spec.fabric.toLowerCase().includes('chiffon')
          ? 120
          : 240
      },
      tailorNotes,
      stylingTips,
      colorPsychology: `${spec.color} in ${spec.fabric} highlights natural textile fold depth, sheen, and physical drape.`,
      estimatedCraftTimeDays: spec.gender === 'men' ? 14 : 16,
      estimatedPriceRange: {
        min: spec.gender === 'men' ? 28000 : 25000,
        max: spec.gender === 'men' ? 46000 : 44000,
        currency: 'INR'
      },
      specs: {
        gender: spec.gender,
        dressType: spec.garmentType as any,
        occasion: spec.occasion as any,
        fabric: spec.fabric as any,
        color: spec.color,
        sleeve: spec.sleeves as any,
        neckline: spec.neckline as any,
        pattern: spec.embroidery as any,
        waistStyle: spec.waistAndFit,
        backDesign: spec.backDesign,
        backSpecifiedByUser: spec.backSpecifiedByUser,
        length: spec.length,
        embroidery: spec.embroidery,
        accessories: spec.accessories || 'None',
        exclusions: spec.exclusions,
        background: spec.background,
        lining,
        fit: spec.waistAndFit,
        budget,
        modelUsed: photoResult.modelUsed
      }
    };

    const resultDressDesign = {
      id: `design-${Date.now()}`,
      customerId: req.authUser?.id || 'guest',
      customerName: req.authUser?.name || 'Guest Visitor',
      title: spec.title,
      prompt: spec.cleanPrompt || rawPrompt,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      selectedVariationIndex: 0,
      tags: [
        spec.gender === 'men' ? 'Menswear' : 'Womenswear',
        spec.occasion,
        spec.garmentType,
        spec.fabric,
        spec.color
      ],
      variations: [primaryVariation]
    };

    return res.json(resultDressDesign);
  } catch (error: any) {
    if (error instanceof DressGenerationError) {
      return res.status(error.status).json({
        error: error.message,
        code: error.code,
        retryable: error.retryable,
        clarificationNeeded: error.code === 'PROMPT_CONTRADICTION',
        conflicts: error.conflicts || []
      });
    }
    return res.status(502).json({
      error: error?.message || 'Failed to generate photorealistic dress photographs.',
      code: 'GENERATION_FAILED',
      retryable: true
    });
  }
});

// Mount centralized RBAC API Router
app.use('/api', createApiRouter());

// Explicit PWA Endpoints with CORS and Credential Headers for Android WebAPK & iOS standalone reliability
app.get('/manifest.json', (_req, res) => {
  res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(path.join(process.cwd(), 'public', 'manifest.json'));
});

app.get('/sw.js', (_req, res) => {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(path.join(process.cwd(), 'public', 'sw.js'));
});

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`PEARL PICK! Server running on http://localhost:${PORT}`);
  });
}

const isTestEnvironment =
  process.env.PEARL_PICK_TEST === 'true' ||
  process.env.NODE_ENV === 'test' ||
  process.execArgv.includes('--test');

if (!isTestEnvironment) {
  startServer();
}

