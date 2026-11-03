import test, { describe, before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pearl-pick-dress-studio-test-'));
const testDbPath = path.join(tmpDir, 'test_pearl_pick_dress.sqlite');
process.env.PEARL_PICK_DB_PATH = testDbPath;
process.env.PEARL_PICK_TEST = 'true';

import { initDatabase } from '../src/server/db';
import { app } from '../server';
import {
  resolveDressSpecifications,
  buildPhotographicPrompts,
  detectPromptContradictions,
  stripLegacyBracketMetadata
} from '../src/services/promptSpecResolver';
import { setGeminiClientOverrideForTesting } from '../src/server/dressPhotoService';

let server: http.Server;
let baseUrl = '';

// Valid 1x1 PNG base64 fixtures for distinct angles to verify exact reference propagation
const FRONT_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
const BACK_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
const SIDE_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
const DETAIL_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

async function apiJson(endpoint: string, method: string, body?: any) {
  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

describe('Pearl Pick AI Dress Studio - Photorealistic Generation & Prompt Priority Suite', () => {
  before(async () => {
    initDatabase();
    await new Promise<void>((resolve) => {
      server = app.listen(0, () => {
        const addr = server.address();
        if (addr && typeof addr === 'object') {
          baseUrl = `http://127.0.0.1:${addr.port}`;
        }
        resolve();
      });
    });
  });

  afterEach(() => {
    setGeminiClientOverrideForTesting(null);
  });

  after(async () => {
    setGeminiClientOverrideForTesting(null);
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  test('1. Prompt Priority Over Conflicting Form Defaults (Blush-Pink & Emerald-Green Acceptance Prompts)', () => {
    const blushPrompt =
      'A blush-pink organza floor-length gown with a sweetheart neckline, full sleeves, fitted waist, and small pearl embellishments. No necklace or belt. Neutral studio background.';

    // Deliberately pass conflicting form defaults (Rani Pink, Banarasi Silk, Lehenga, Boat neck, Sleeveless, Heavy Zardozi)
    const spec1 = resolveDressSpecifications(blushPrompt, {
      gender: 'women',
      dressType: 'Bridal Lehenga',
      fabric: 'Banarasi Silk',
      color: 'Rani Pink',
      neckline: 'Boat Neck',
      sleeve: 'Sleeveless',
      length: 'Knee Length',
      pattern: 'Heavy Zardozi'
    });

    assert.match(spec1.color, /blush[\s-]pink/i);
    assert.match(spec1.fabric, /organza/i);
    assert.match(spec1.garmentType, /gown/i);
    assert.match(spec1.neckline, /sweetheart/i);
    assert.match(spec1.sleeves, /full(?:-length)?\s+sleeves/i);
    assert.match(spec1.length, /floor[\s-]length/i);
    assert.match(spec1.waistAndFit, /fitted waist/i);
    assert.match(spec1.embroidery, /pearl/i);
    assert.equal(spec1.backSpecifiedByUser, false);
    assert.ok(
      spec1.exclusions.some((e) => /necklace/i.test(e)),
      'Should preserve No necklace exclusion'
    );
    assert.ok(
      spec1.exclusions.some((e) => /belt/i.test(e)),
      'Should preserve No belt exclusion'
    );

    const prompts1 = buildPhotographicPrompts(spec1);
    for (const viewPrompt of [
      prompts1.frontPrompt,
      prompts1.backPrompt,
      prompts1.sidePrompt,
      prompts1.detailPrompt
    ]) {
      assert.equal(
        /\[[A-Z0-9_ -]+\]/.test(viewPrompt),
        false,
        'Prompt must not contain unresolved [PLACEHOLDERS]'
      );
      assert.match(viewPrompt, /blush[\s-]pink/i);
      assert.match(viewPrompt, /organza/i);
    }
    assert.match(prompts1.frontPrompt, /NEVER a fashion sketch, SVG drawing/i);

    // Second acceptance prompt: emerald-green velvet mermaid gown with gold floral embroidery ONLY along the hem
    const emeraldPrompt =
      'An emerald-green velvet floor-length mermaid gown with a sweetheart neckline, full-length sheer sleeves, and gold floral embroidery only along the hem. No necklace, no belt, plain white studio background.';

    const spec2 = resolveDressSpecifications(emeraldPrompt, {
      gender: 'women',
      dressType: 'Anarkali Suit',
      fabric: 'Cotton',
      color: 'Yellow',
      neckline: 'High Neck',
      sleeve: 'Cap Sleeves',
      length: 'Midi'
    });

    assert.match(spec2.color, /emerald[\s-]green/i);
    assert.match(spec2.fabric, /velvet/i);
    assert.match(spec2.silhouette, /mermaid/i);
    assert.match(spec2.neckline, /sweetheart/i);
    assert.match(spec2.sleeves, /full[\s-]length sheer sleeves/i);
    assert.match(spec2.embroidery, /gold floral embroidery/i);
    assert.match(spec2.embroideryPlacement || '', /only along the hem/i);
    assert.match(spec2.background, /plain white studio background/i);
  });

  test('2. Legacy Polluted Bracket Metadata Is Stripped Before Resolution', () => {
    const pollutedPrompt =
      'A navy blue silk saree with a boat neckline. [Silhouette: Bridal Lehenga | Neckline: Deep V-Neck | Sleeves: Sleeveless | Style Keywords: 24K zardozi border, royal heritage silhouette]';
    const cleaned = stripLegacyBracketMetadata(pollutedPrompt);
    assert.equal(cleaned, 'A navy blue silk saree with a boat neckline.');
  });

  test('3. Contradiction Detection Rejects Conflicting User Instructions with HTTP 422 Before Model Call', async () => {
    let modelCalled = false;
    setGeminiClientOverrideForTesting({
      models: {
        generateContent: async () => {
          modelCalled = true;
          throw new Error('Model should not be called when prompt has contradictions');
        }
      }
    });

    const unitContradictions = detectPromptContradictions(
      'A sleeveless emerald velvet gown with full-length sheer sleeves and a floor-length mini skirt.'
    );
    assert.equal(unitContradictions.hasContradictions, true);
    assert.ok(unitContradictions.conflicts.length >= 2, 'Should detect sleeve and length contradictions');

    const res = await apiJson('/api/gemini/generate-dress', 'POST', {
      prompt:
        'A sleeveless blush-pink organza gown with full sleeves and no embroidery with heavy all-over embroidery.',
      fabric: 'Organza',
      color: 'Blush Pink'
    });

    assert.equal(res.status, 422);
    assert.equal(res.data.code, 'PROMPT_CONTRADICTION');
    assert.equal(res.data.clarificationNeeded, true);
    assert.ok(Array.isArray(res.data.conflicts) && res.data.conflicts.length >= 2);
    assert.equal(modelCalled, false, 'Must not invoke Gemini API when prompt contains contradictions');
  });

  test('4. Unmocked Missing API Key Check Returns Explicit HTTP 503 Error (Never SVG or Stock Fallback)', async () => {
    const originalGeminiKey = process.env.GEMINI_API_KEY;
    const originalApiKey = process.env.API_KEY;
    delete process.env.GEMINI_API_KEY;
    delete process.env.API_KEY;

    try {
      const res = await apiJson('/api/gemini/generate-dress', 'POST', {
        prompt: 'An emerald-green velvet floor-length mermaid gown with a sweetheart neckline.',
        fabric: 'Velvet',
        color: 'Emerald Green'
      });

      assert.equal(res.status, 503);
      assert.equal(res.data.code, 'MISSING_API_KEY');
      assert.equal(res.data.variations, undefined, 'Must not return fallback SVG variations on error');
      assert.equal(
        JSON.stringify(res.data).includes('data:image/svg+xml'),
        false,
        'Response must never contain SVG data URIs'
      );
    } finally {
      if (originalGeminiKey !== undefined) process.env.GEMINI_API_KEY = originalGeminiKey;
      if (originalApiKey !== undefined) process.env.API_KEY = originalApiKey;
    }
  });

  test('5. Multi-View Generation (Mocked Gemini SDK): Generates Front View First, Then Passes Front Raster Image as Reference for Back, Side, and Detail Views', async () => {
    const recordedCalls: Array<{
      model: string;
      parts: any[];
      config: any;
    }> = [];

    setGeminiClientOverrideForTesting({
      models: {
        generateContent: async (req: any) => {
          const parts = req.contents?.parts || [];
          recordedCalls.push({
            model: req.model,
            parts,
            config: req.config
          });

          const textPart = parts.find((p: any) => typeof p.text === 'string')?.text || '';
          let b64 = FRONT_PNG_B64;
          if (/FULL-LENGTH BACK VIEW/i.test(textPart)) {
            b64 = BACK_PNG_B64;
          } else if (/FULL-LENGTH SIDE PROFILE VIEW/i.test(textPart)) {
            b64 = SIDE_PNG_B64;
          } else if (/CLOSE-UP MACRO/i.test(textPart)) {
            b64 = DETAIL_PNG_B64;
          }

          return {
            candidates: [
              {
                finishReason: 'STOP',
                content: {
                  parts: [
                    {
                      inlineData: {
                        mimeType: 'image/png',
                        data: b64
                      }
                    }
                  ]
                }
              }
            ]
          };
        }
      }
    });

    const acceptancePrompt =
      'An emerald-green velvet floor-length mermaid gown with a sweetheart neckline, full-length sheer sleeves, and gold floral embroidery only along the hem. No necklace, no belt, plain white studio background.';

    const res = await apiJson('/api/gemini/generate-dress', 'POST', {
      prompt: acceptancePrompt,
      category: 'Womenswear',
      dressType: 'Bridal Lehenga', // Conflicting form value overridden by prompt's "mermaid gown"
      fabric: 'Cotton', // Conflicting form value overridden by prompt's "velvet"
      color: 'Yellow', // Conflicting form value overridden by prompt's "emerald-green"
      neckline: 'Boat Neck', // Conflicting form value overridden by prompt's "sweetheart neckline"
      sleeve: 'Sleeveless' // Conflicting form value overridden by prompt's "full-length sheer sleeves"
    });

    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.data.variations) && res.data.variations.length === 1);

    const variation = res.data.variations[0];
    assert.equal(variation.frontImageUrl, `data:image/png;base64,${FRONT_PNG_B64}`);
    assert.equal(variation.backImageUrl, `data:image/png;base64,${BACK_PNG_B64}`);
    assert.equal(variation.sideImageUrl, `data:image/png;base64,${SIDE_PNG_B64}`);
    assert.equal(variation.detailImageUrl, `data:image/png;base64,${DETAIL_PNG_B64}`);
    assert.equal(variation.specs.backSpecifiedByUser, false);
    assert.ok(
      variation.tailorNotes.some((note: string) => /compatible design/i.test(note)),
      'Should label unspecified back construction as a plausible compatible design'
    );

    // Verify 4 calls were made: Call #1 is Front (text-only), Calls #2, #3, #4 include Front inlineData as reference
    assert.equal(
      recordedCalls.length,
      4,
      'Should make 4 Gemini image generation calls (front, then back, side, detail)'
    );
    assert.equal(recordedCalls[0].model, 'gemini-2.0-flash-exp-image-generation');

    const frontCallParts = recordedCalls[0].parts;
    assert.equal(
      frontCallParts.some((p: any) => p.inlineData),
      false,
      'Front view call must be generated first without a prior angle reference'
    );
    const frontPromptText = frontCallParts.find((p: any) => p.text)?.text || '';
    assert.match(frontPromptText, /emerald[\s-]green/i);
    assert.match(frontPromptText, /velvet/i);
    assert.match(frontPromptText, /mermaid/i);
    assert.match(frontPromptText, /sweetheart/i);
    assert.match(frontPromptText, /full[\s-]length sheer sleeves/i);
    assert.match(frontPromptText, /only along the hem/i);
    assert.match(frontPromptText, /No necklace/i);
    assert.match(frontPromptText, /No belt/i);

    // Calls 1, 2, 3 (Back, Side, Detail) must each contain the Front PNG inlineData as reference
    for (let i = 1; i < 4; i++) {
      const refImagePart = recordedCalls[i].parts.find((p: any) => p.inlineData);
      assert.ok(
        refImagePart,
        `Secondary view call #${i + 1} must include the front photograph inlineData reference`
      );
      assert.equal(refImagePart.inlineData.mimeType, 'image/png');
      assert.equal(refImagePart.inlineData.data, FRONT_PNG_B64);
    }
  });

  test('6. Provider Error Handling (Mocked Gemini SDK): Safety Block, Quota Exhaustion, and SVG/Missing Image Rejection', async () => {
    // 6a. Safety Blocked -> HTTP 422 REQUEST_BLOCKED
    setGeminiClientOverrideForTesting({
      models: {
        generateContent: async () => ({
          candidates: [{ finishReason: 'IMAGE_SAFETY', content: { parts: [] } }]
        })
      }
    });

    const safetyRes = await apiJson('/api/gemini/generate-dress', 'POST', {
      prompt: 'A crimson silk evening gown.'
    });
    assert.equal(safetyRes.status, 422);
    assert.equal(safetyRes.data.code, 'REQUEST_BLOCKED');

    // 6b. Quota / Billing Error -> HTTP 429 QUOTA_OR_BILLING_ERROR
    setGeminiClientOverrideForTesting({
      models: {
        generateContent: async () => {
          throw new Error('429 RESOURCE_EXHAUSTED: Quota exceeded for image generation');
        }
      }
    });

    const quotaRes = await apiJson('/api/gemini/generate-dress', 'POST', {
      prompt: 'A crimson silk evening gown.'
    });
    assert.equal(quotaRes.status, 429);
    assert.equal(quotaRes.data.code, 'QUOTA_OR_BILLING_ERROR');

    // 6c. Text-only response (no inlineData image) -> HTTP 502 NO_IMAGE_GENERATED
    setGeminiClientOverrideForTesting({
      models: {
        generateContent: async () => ({
          candidates: [
            {
              finishReason: 'STOP',
              content: { parts: [{ text: 'I cannot generate an image right now.' }] }
            }
          ]
        })
      }
    });

    const noImgRes = await apiJson('/api/gemini/generate-dress', 'POST', {
      prompt: 'A crimson silk evening gown.'
    });
    assert.equal(noImgRes.status, 502);
    assert.equal(noImgRes.data.code, 'NO_IMAGE_GENERATED');
  });
});
