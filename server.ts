import express from 'express';
import http from 'http';
import path from 'path';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';

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

// Helper to generate content with resilient fallback across models when high demand occurs
async function generateContentWithFallback(ai: GoogleGenAI, config: any) {
  const models = ['gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastErr: any = null;

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
      // If overloaded or unavailable (503 / 429), try next model
      if (msg.includes('503') || msg.includes('high demand') || msg.includes('UNAVAILABLE') || msg.includes('429')) {
        continue;
      }
    }
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

// Generate AI Dress Design Variations Endpoint
app.post('/api/gemini/generate-dress', async (req, res) => {
  try {
    const { 
      dressType = 'Bridal Lehenga & Choli', 
      occasion = 'Indian Wedding & Reception', 
      fabric = 'Pure Raw Silk', 
      color = 'Rani Gulabi Pink', 
      sleeve = 'Elbow-Length Embroidered', 
      neckline = 'Regal Paan Neck', 
      pattern = 'Hand Zardozi & Dabka Gold', 
      waistStyle = 'Corseted Basque',
      backDesign = 'Deep U with Latkan Dori',
      length = 'Floor-Sweeping (44")',
      embroidery = 'Authentic 24K Dabka Zardozi',
      accessories = 'Matching Embroidered Dupatta & Potli',
      borderDesign = 'Scalloped Zari Temple Border',
      lining = 'Pure Cotton Mulmul (Breathable)',
      fit = 'Tailored Classical Regular',
      style = 'Royal Heritage Rajputana',
      budget = '₹35,000',
      prompt = '' 
    } = req.body;

    const ai = getGeminiClient();

    // High resolution curated Indian couture visuals
    const curatedIndianImages: Record<string, string[]> = {
      'Bridal Lehenga & Choli': [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80'
      ],
      'Royal Anarkali Suit': [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80'
      ],
      'Kanjeevaram Saree Gown': [
        'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=80'
      ],
      'default': [
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=900&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=80'
      ]
    };

    const imagePool = curatedIndianImages[dressType] || curatedIndianImages['default'];

    // Generate dynamic prompt-specific AI couture image URLs via Pollinations Flux
    const promptKeywords = prompt && prompt.trim().length > 3 ? prompt.trim() : `royal ${color} ${dressType}`;
    const seed1 = Math.floor(Math.random() * 900000) + 100000;
    const seed2 = Math.floor(Math.random() * 900000) + 100000;

    const dynamicAiImage1 = `https://image.pollinations.ai/prompt/${encodeURIComponent(`Full length Indian couture model wearing bespoke ${color} ${dressType} in ${fabric}, intricate ${pattern}, ${neckline} neckline, ${sleeve} sleeves, Vogue India editorial bridal fashion photoshoot, 8k resolution, elegant studio lighting, luxury fashion week runway, ${promptKeywords}`)}?width=768&height=1024&nologo=true&seed=${seed1}`;
    
    const dynamicAiImage2 = `https://image.pollinations.ai/prompt/${encodeURIComponent(`Alternative modern drape bespoke ${color} Indian couture ${dressType}, luxurious ${fabric} texture, fine ${pattern} handwork, haute couture Indian wedding photoshoot, 8k resolution, dramatic cinematic lighting, ${promptKeywords}`)}?width=768&height=1024&nologo=true&seed=${seed2}`;

    let variationsData = null;

    if (ai) {
      try {
        const response = await generateContentWithFallback(ai, {
          contents: `You are a master Indian haute couture design engine for "PEARL PICK!".
Generate 2 bespoke Indian dress design variations based on these specifications:
- Dress Type: ${dressType}
- Occasion: ${occasion}
- Fabric: ${fabric}
- Color: ${color}
- Sleeve Style: ${sleeve}
- Neckline: ${neckline}
- Pattern/Embellishment: ${pattern}
- Additional Prompt: "${prompt}"

Return JSON matching this exact structure:
{
  "title": "Bespoke Royal Indian Design Name",
  "variations": [
    {
      "name": "Variation 1 Title",
      "tagline": "Poetic design summary (1 sentence)",
      "fabricDetails": {
        "primary": "Detailed fabric name with weave and weight (GSM)",
        "lining": "Lining fabric specification (e.g., Pure Cotton Mulmul / Satin)",
        "embellishments": "Hand Zardozi / Dabka / Gota Patti / Resham details",
        "estimatedYards": 7.5,
        "recommendedWeightGsm": 360
      },
      "tailorNotes": [
        "Include 2.5-inch side margin inside choli/bodice for alterations",
        "Technical sewing instruction 2",
        "Technical sewing instruction 3"
      ],
      "stylingTips": [
        "Jewelry recommendation (e.g. Polki, Kundan choker, Chandbalis)",
        "Footwear and dupatta draping advice"
      ],
      "colorPsychology": "Significance of this color in Indian celebrations",
      "estimatedCraftTimeDays": 16,
      "estimatedPriceRange": {
        "min": 28000,
        "max": 48000,
        "currency": "INR"
      }
    },
    {
      "name": "Variation 2 Title (Modern Indo-Western drape)",
      "tagline": "Alternative interpretation tagline",
      "fabricDetails": {
        "primary": "Alternative luxury Indian fabric",
        "lining": "Alternative lining",
        "embellishments": "Alternative embellishment",
        "estimatedYards": 6.0,
        "recommendedWeightGsm": 320
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
      "estimatedPriceRange": {
        "min": 22000,
        "max": 38000,
        "currency": "INR"
      }
    }
  ]
}`,
          config: {
            responseMimeType: 'application/json',
          },
        });

        variationsData = JSON.parse(response.text || '{}');
      } catch (err: any) {
        variationsData = null;
      }
    }

    // Fallback if Gemini is offline or failed
    if (!variationsData || !variationsData.variations || variationsData.variations.length === 0) {
      variationsData = {
        title: `Royal ${color} Bespoke ${dressType}`,
        variations: [
          {
            name: `The Maharani Edition ${dressType}`,
            tagline: `Hand-sculpted ${fabric} with ${neckline} and regal ${pattern}`,
            fabricDetails: {
              primary: `${fabric} (360 GSM)`,
              lining: `Pure Cotton Mulmul Breathable Lining`,
              embellishments: `${pattern} handcrafted with metallic gold accents`,
              estimatedYards: 7.5,
              recommendedWeightGsm: 360
            },
            tailorNotes: [
              `Construct reinforced choli/bodice with 2.5-inch internal alteration allowance.`,
              `Reinforce ${neckline} neckline with bias canvas so it rests perfectly on the decolletage.`,
              `Apply ${sleeve} with flexible underarm gussets for effortless sangeet movement.`
            ],
            stylingTips: [
              `Pair with antique 22K gold Kundan choker and mathapatti.`,
              `Ideal with embroidered juttis and organza dupatta with scalloped borders.`
            ],
            colorPsychology: `${color} conveys auspicious prosperity, celebration, and royal majesty in Indian culture.`,
            estimatedCraftTimeDays: 16,
            estimatedPriceRange: { min: 32000, max: 48000, currency: 'INR' }
          },
          {
            name: `The Contemporary Darbar ${dressType}`,
            tagline: `Sleek architectural drape with ${sleeve} in luminous ${color}`,
            fabricDetails: {
              primary: `Pure Brocade & ${fabric}`,
              lining: `Soft Cupro Habotai`,
              embellishments: `Subtle tonal resham and micro-mirror hand borders`,
              estimatedYards: 5.5,
              recommendedWeightGsm: 300
            },
            tailorNotes: [
              `Precision kalis cut along grain with hidden YKK concealed side zipper.`,
              `Hand-rolled double-fold hem with reinforced horsehair or can-can mesh.`
            ],
            stylingTips: [
              `Statement chaandbalis and layered emerald cocktail ring.`
            ],
            colorPsychology: `${color} creates a breathtaking festive presence under wedding chandeliers.`,
            estimatedCraftTimeDays: 12,
            estimatedPriceRange: { min: 24000, max: 36000, currency: 'INR' }
          }
        ]
      };
    }

    // Map variations with dynamic AI images and fallbacks
    const variationsWithAssets = variationsData.variations.map((v: any, index: number) => {
      const dynamicImg = index === 0 ? dynamicAiImage1 : dynamicAiImage2;
      const backupImg = imagePool[index % imagePool.length];
      return {
        id: `var-${Date.now()}-${index + 1}`,
        name: v.name || `Couture Edition ${index + 1}`,
        tagline: v.tagline || `Bespoke ${dressType} for ${occasion}`,
        frontImageUrl: dynamicImg,
        backImageUrl: backupImg,
        sideImageUrl: backupImg,
        fabricDetails: v.fabricDetails,
        tailorNotes: v.tailorNotes || [],
        stylingTips: v.stylingTips || [],
        colorPsychology: v.colorPsychology || '',
        estimatedCraftTimeDays: v.estimatedCraftTimeDays || 14,
        estimatedPriceRange: v.estimatedPriceRange || { min: 25000, max: 45000, currency: 'INR' },
        specs: {
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
      title: variationsData.title || `Bespoke ${color} ${dressType}`,
      prompt: prompt || `Custom ${dressType} in ${fabric} (${color}) for ${occasion}`,
      createdAt: new Date().toISOString(),
      isFavorite: false,
      selectedVariationIndex: 0,
      tags: [occasion, dressType, fabric, color],
      variations: variationsWithAssets
    };

    res.json(resultDressDesign);
  } catch (error: any) {
    console.error('Error generating dress:', error);
    res.status(500).json({ error: 'Failed to generate dress design: ' + error?.message });
  }
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
    const isHmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: isHmrDisabled ? false : { server: httpServer },
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
