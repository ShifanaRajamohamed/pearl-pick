/**
 * Adapted in part from google-gemini/gemini-image-editing-nextjs-quickstart
 * (https://github.com/google-gemini/gemini-image-editing-nextjs-quickstart)
 * Copyright 2025 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 */
import { GoogleGenAI } from '@google/genai';
import {
  buildPhotographicPrompts,
  detectPromptContradictions,
  DressFormDefaults,
  resolveDressSpecifications,
  ResolvedDressSpec
} from '../services/promptSpecResolver';

export type DressGenerationErrorCode =
  | 'PROMPT_CONTRADICTION'
  | 'MISSING_API_KEY'
  | 'INVALID_API_KEY'
  | 'QUOTA_OR_BILLING_ERROR'
  | 'MODEL_UNAVAILABLE'
  | 'REQUEST_BLOCKED'
  | 'NO_IMAGE_GENERATED'
  | 'GENERATION_FAILED';

export class DressGenerationError extends Error {
  public readonly status: number;
  public readonly code: DressGenerationErrorCode;
  public readonly retryable: boolean;
  public readonly conflicts?: string[];

  constructor(options: {
    message: string;
    status: number;
    code: DressGenerationErrorCode;
    retryable: boolean;
    conflicts?: string[];
  }) {
    super(options.message);
    this.name = 'DressGenerationError';
    this.status = options.status;
    this.code = options.code;
    this.retryable = options.retryable;
    this.conflicts = options.conflicts;
  }
}

export interface ParsedRasterInlineData {
  mimeType: string;
  base64Data: string;
  dataUrl: string;
}

export interface MultiViewGenerationResult {
  frontImageUrl: string;
  backImageUrl: string;
  sideImageUrl: string;
  detailImageUrl: string;
  modelUsed: string;
  resolvedSpec: ResolvedDressSpec;
  promptsUsed: {
    frontPrompt: string;
    backPrompt: string;
    sidePrompt: string;
    detailPrompt: string;
  };
}

export interface SingleViewGenerationResult {
  imageUrl: string;
  angles?: {
    front: string;
    back: string;
    side: string;
    detail: string;
  };
  modelUsed: string;
  resolvedSpec: ResolvedDressSpec;
  promptUsed: string;
}

// Supported Gemini image-generation models in priority order per official @google/genai documentation
// and reference quickstart (https://github.com/google-gemini/gemini-image-editing-nextjs-quickstart)
export const SUPPORTED_IMAGE_MODELS = [
  'gemini-2.0-flash-exp-image-generation',
  'gemini-2.5-flash-image',
  'gemini-2.0-flash-exp'
] as const;

let cachedGenAIClient: GoogleGenAI | null = null;
let cachedApiKey: string | null = null;
let testClientOverride: { models: { generateContent: (params: any) => Promise<any> } } | null = null;

/**
 * Allows automated integration tests to inject a mock @google/genai client
 * without modifying production routes. Pass null to restore live SDK behavior.
 */
export function setGeminiClientOverrideForTesting(
  client: { models: { generateContent: (params: any) => Promise<any> } } | null
): void {
  testClientOverride = client;
}

export function getServerGeminiClient(): { models: { generateContent: (params: any) => Promise<any> } } {
  if (testClientOverride) {
    return testClientOverride;
  }

  const rawKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!rawKey || rawKey === 'MY_GEMINI_API_KEY' || rawKey === 'YOUR_API_KEY') {
    throw new DressGenerationError({
      message:
        'GEMINI_API_KEY is not configured on the backend. Please configure a valid GEMINI_API_KEY in the environment (or Settings > Secrets) and retry.',
      status: 503,
      code: 'MISSING_API_KEY',
      retryable: true
    });
  }

  if (!cachedGenAIClient || cachedApiKey !== rawKey) {
    cachedGenAIClient = new GoogleGenAI({
      apiKey: rawKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
    cachedApiKey = rawKey;
  }

  return cachedGenAIClient;
}

/**
 * Validates and extracts a raster image data URL (PNG, JPEG, WebP).
 * Explicitly rejects SVG data URIs so SVG illustrations can never be used as references or outputs.
 */
export function parseRasterDataUrl(dataUrl?: string | null): ParsedRasterInlineData | null {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const trimmed = dataUrl.trim();
  if (trimmed.startsWith('data:image/svg')) {
    return null;
  }
  const match = trimmed.match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([A-Za-z0-9+/=\s]+)$/i);
  if (!match) return null;

  const mimeType = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase();
  const base64Data = match[2].replace(/\s+/g, '');
  if (base64Data.length < 16) return null;

  return {
    mimeType,
    base64Data,
    dataUrl: `data:${mimeType};base64,${base64Data}`
  };
}

function classifyProviderError(err: any): DressGenerationError {
  if (err instanceof DressGenerationError) {
    return err;
  }

  const rawMsg = err?.message || String(err || 'Unknown image generation error');
  const upperMsg = rawMsg.toUpperCase();
  const status = Number(err?.status || err?.code || 0);

  if (
    status === 401 ||
    status === 403 ||
    upperMsg.includes('API_KEY_INVALID') ||
    upperMsg.includes('PERMISSION_DENIED') ||
    upperMsg.includes('INVALID API KEY')
  ) {
    return new DressGenerationError({
      message:
        'Gemini API rejected the API key or lacked permission for image generation. Please check GEMINI_API_KEY in Settings > Secrets and retry.',
      status: 403,
      code: 'INVALID_API_KEY',
      retryable: true
    });
  }

  if (
    status === 429 ||
    upperMsg.includes('RESOURCE_EXHAUSTED') ||
    upperMsg.includes('QUOTA') ||
    upperMsg.includes('BILLING') ||
    upperMsg.includes('RATE LIMIT')
  ) {
    return new DressGenerationError({
      message:
        'Gemini image generation quota or billing limit was reached. Please wait a moment or attach a billing-enabled GEMINI_API_KEY in Settings > Secrets and retry.',
      status: 429,
      code: 'QUOTA_OR_BILLING_ERROR',
      retryable: true
    });
  }

  if (
    upperMsg.includes('SAFETY') ||
    upperMsg.includes('BLOCKED') ||
    upperMsg.includes('PROHIBITED_CONTENT') ||
    upperMsg.includes('BLOCKLIST') ||
    upperMsg.includes('RECITATION')
  ) {
    return new DressGenerationError({
      message:
        'The image generation request was blocked by safety filters. Please rephrase your dress description and retry.',
      status: 422,
      code: 'REQUEST_BLOCKED',
      retryable: true
    });
  }

  if (status === 404 || upperMsg.includes('NOT_FOUND') || upperMsg.includes('NOT SUPPORTED')) {
    return new DressGenerationError({
      message:
        'The requested Gemini image-generation model is currently unavailable for this project/key. Please verify model access and retry.',
      status: 503,
      code: 'MODEL_UNAVAILABLE',
      retryable: true
    });
  }

  return new DressGenerationError({
    message: `Photorealistic dress image generation failed: ${rawMsg}`,
    status: 502,
    code: 'GENERATION_FAILED',
    retryable: true
  });
}

/**
 * Calls the Gemini image generation model to produce a single raster photograph.
 * Optionally accepts a reference raster image (such as the generated Front View photograph)
 * to preserve garment and model consistency across Back, Side, and Macro Detail views.
 */
export async function generateSingleRasterPhotograph(options: {
  prompt: string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  referenceImage?: ParsedRasterInlineData | null;
  preferredModel?: string;
}): Promise<{ image: ParsedRasterInlineData; modelUsed: string }> {
  const ai = getServerGeminiClient();
  const aspectRatio = options.aspectRatio || '3:4';

  const configuredModel = (process.env.GEMINI_IMAGE_MODEL || '').trim();
  const candidateModels = Array.from(
    new Set(
      [options.preferredModel, configuredModel, ...SUPPORTED_IMAGE_MODELS].filter(
        (m): m is string => Boolean(m && m.length > 0)
      )
    )
  );

  const parts: any[] = [];
  if (options.referenceImage) {
    parts.push({
      inlineData: {
        data: options.referenceImage.base64Data,
        mimeType: options.referenceImage.mimeType
      }
    });
  }
  parts.push({ text: options.prompt });

  let lastError: any = null;

  for (const model of candidateModels) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: {
          parts
        },
        config: {
          temperature: 1,
          topP: 0.95,
          topK: 40,
          responseModalities: ['IMAGE', 'TEXT'],
          imageConfig: {
            aspectRatio
          }
        }
      });

      const promptBlockReason = response?.promptFeedback?.blockReason;
      if (promptBlockReason) {
        throw new DressGenerationError({
          message: `The prompt was blocked by content safety filters (${promptBlockReason}). Please adjust your dress description and retry.`,
          status: 422,
          code: 'REQUEST_BLOCKED',
          retryable: true
        });
      }

      const candidate = response?.candidates?.[0];
      const finishReason = String(candidate?.finishReason || '').toUpperCase();
      if (
        finishReason === 'SAFETY' ||
        finishReason === 'IMAGE_SAFETY' ||
        finishReason === 'PROHIBITED_CONTENT' ||
        finishReason === 'BLOCKLIST'
      ) {
        throw new DressGenerationError({
          message: `Image generation was halted by safety filters (${finishReason}). Please adjust the prompt and retry.`,
          status: 422,
          code: 'REQUEST_BLOCKED',
          retryable: true
        });
      }

      const responseParts = candidate?.content?.parts ?? [];
      for (const part of responseParts) {
        if (part?.inlineData?.data) {
          const rawMime = (part.inlineData.mimeType || 'image/png').toLowerCase();
          if (rawMime.includes('svg')) {
            continue;
          }
          const mimeType = rawMime === 'image/jpg' ? 'image/jpeg' : rawMime;
          const base64Data = String(part.inlineData.data).replace(/\s+/g, '');
          if (base64Data.length > 16) {
            return {
              image: {
                mimeType,
                base64Data,
                dataUrl: `data:${mimeType};base64,${base64Data}`
              },
              modelUsed: model
            };
          }
        }
      }

      // Response succeeded at HTTP level but contained no inlineData image part
      throw new DressGenerationError({
        message:
          'The AI model returned a text response without a generated photograph. Please retry generation.',
        status: 502,
        code: 'NO_IMAGE_GENERATED',
        retryable: true
      });
    } catch (err: any) {
      lastError = err;
      const msg = String(err?.message || err || '').toUpperCase();
      const status = Number(err?.status || err?.code || 0);
      const isModelNotFound = status === 404 || msg.includes('NOT_FOUND') || msg.includes('NOT SUPPORTED');
      if (isModelNotFound) {
        // Try next supported image model in fallback list
        continue;
      }
      // For auth, safety, or quota errors, fail fast with structured error
      throw classifyProviderError(err);
    }
  }

  throw classifyProviderError(lastError);
}

/**
 * Generates a coordinated 4-view photorealistic fashion presentation:
 * 1. Validates the user's prompt for internal contradictions.
 * 2. Resolves specifications with strict user-prompt priority over form selections.
 * 3. Generates the Front View photograph first.
 * 4. Uses the generated Front View photograph as an image reference to generate
 *    the Back View, Side View, and Macro Detail View so model, colour, fabric,
 *    construction, lighting, and background remain consistent.
 */
export async function generateMultiViewPhotorealisticDress(options: {
  prompt: string;
  formDefaults: DressFormDefaults;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  userReferenceDataUrl?: string | null;
}): Promise<MultiViewGenerationResult> {
  // 1. Check for contradictory user instructions before calling the image model
  const contradictionCheck = detectPromptContradictions(options.prompt);
  if (contradictionCheck.hasContradictions) {
    throw new DressGenerationError({
      message: contradictionCheck.conflicts.join(' '),
      status: 422,
      code: 'PROMPT_CONTRADICTION',
      retryable: false,
      conflicts: contradictionCheck.conflicts
    });
  }

  // 2. Resolve garment specification with prompt priority over form defaults
  const resolvedSpec = resolveDressSpecifications(options.prompt, options.formDefaults);
  const promptsUsed = buildPhotographicPrompts(resolvedSpec);
  const aspectRatio = options.aspectRatio || '3:4';

  // Optional user-uploaded raster sketch or inspiration image (never SVG)
  const optionalUserRef = parseRasterDataUrl(options.userReferenceDataUrl);

  // 3. Generate Front View photograph FIRST
  const frontResult = await generateSingleRasterPhotograph({
    prompt: promptsUsed.frontPrompt,
    aspectRatio,
    referenceImage: optionalUserRef
  });

  const frontReferenceImage = frontResult.image;
  const activeModel = frontResult.modelUsed;

  // 4. Generate Back, Side, and Close-Up Detail views conditioned on the generated Front photograph
  let backImage: ParsedRasterInlineData;
  let sideImage: ParsedRasterInlineData;
  let detailImage: ParsedRasterInlineData;

  try {
    const [backRes, sideRes, detailRes] = await Promise.all([
      generateSingleRasterPhotograph({
        prompt: promptsUsed.backPrompt,
        aspectRatio,
        referenceImage: frontReferenceImage,
        preferredModel: activeModel
      }),
      generateSingleRasterPhotograph({
        prompt: promptsUsed.sidePrompt,
        aspectRatio,
        referenceImage: frontReferenceImage,
        preferredModel: activeModel
      }),
      generateSingleRasterPhotograph({
        prompt: promptsUsed.detailPrompt,
        aspectRatio,
        referenceImage: frontReferenceImage,
        preferredModel: activeModel
      })
    ]);
    backImage = backRes.image;
    sideImage = sideRes.image;
    detailImage = detailRes.image;
  } catch (parallelErr: any) {
    // If parallel execution encountered a transient rate limit, retry sequentially using the same front reference
    const classified = classifyProviderError(parallelErr);
    if (classified.code === 'REQUEST_BLOCKED' || classified.code === 'INVALID_API_KEY') {
      throw classified;
    }

    const backRes = await generateSingleRasterPhotograph({
      prompt: promptsUsed.backPrompt,
      aspectRatio,
      referenceImage: frontReferenceImage,
      preferredModel: activeModel
    });
    const sideRes = await generateSingleRasterPhotograph({
      prompt: promptsUsed.sidePrompt,
      aspectRatio,
      referenceImage: frontReferenceImage,
      preferredModel: activeModel
    });
    const detailRes = await generateSingleRasterPhotograph({
      prompt: promptsUsed.detailPrompt,
      aspectRatio,
      referenceImage: frontReferenceImage,
      preferredModel: activeModel
    });
    backImage = backRes.image;
    sideImage = sideRes.image;
    detailImage = detailRes.image;
  }

  return {
    frontImageUrl: frontReferenceImage.dataUrl,
    backImageUrl: backImage.dataUrl,
    sideImageUrl: sideImage.dataUrl,
    detailImageUrl: detailImage.dataUrl,
    modelUsed: activeModel,
    resolvedSpec,
    promptsUsed
  };
}

/**
 * Generates either a full 4-angle reference-locked set or a single angle conditioned on an existing Front photograph.
 */
export async function generateAnglePhotorealisticDress(options: {
  prompt: string;
  angle: 'front' | 'back' | 'side' | 'detail';
  formDefaults: DressFormDefaults;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  referenceFrontDataUrl?: string | null;
  regenerateAllAngles?: boolean;
}): Promise<SingleViewGenerationResult> {
  const contradictionCheck = detectPromptContradictions(options.prompt);
  if (contradictionCheck.hasContradictions) {
    throw new DressGenerationError({
      message: contradictionCheck.conflicts.join(' '),
      status: 422,
      code: 'PROMPT_CONTRADICTION',
      retryable: false,
      conflicts: contradictionCheck.conflicts
    });
  }

  // If regenerating the front view or all angles, or if a non-front angle was requested without a valid raster front reference,
  // generate the full reference-locked multi-view set so back/side/detail are always anchored to the front photograph.
  const existingFrontRef = parseRasterDataUrl(options.referenceFrontDataUrl);
  if (options.regenerateAllAngles || options.angle === 'front' || !existingFrontRef) {
    const multi = await generateMultiViewPhotorealisticDress({
      prompt: options.prompt,
      formDefaults: options.formDefaults,
      aspectRatio: options.aspectRatio
    });

    const selectedUrl =
      options.angle === 'back'
        ? multi.backImageUrl
        : options.angle === 'side'
        ? multi.sideImageUrl
        : options.angle === 'detail'
        ? multi.detailImageUrl
        : multi.frontImageUrl;

    return {
      imageUrl: selectedUrl,
      angles: {
        front: multi.frontImageUrl,
        back: multi.backImageUrl,
        side: multi.sideImageUrl,
        detail: multi.detailImageUrl
      },
      modelUsed: multi.modelUsed,
      resolvedSpec: multi.resolvedSpec,
      promptUsed:
        options.angle === 'back'
          ? multi.promptsUsed.backPrompt
          : options.angle === 'side'
          ? multi.promptsUsed.sidePrompt
          : options.angle === 'detail'
          ? multi.promptsUsed.detailPrompt
          : multi.promptsUsed.frontPrompt
    };
  }

  // Generate the specific non-front view conditioned on the supplied front photograph
  const resolvedSpec = resolveDressSpecifications(options.prompt, options.formDefaults);
  const prompts = buildPhotographicPrompts(resolvedSpec);
  const targetPrompt =
    options.angle === 'back'
      ? prompts.backPrompt
      : options.angle === 'side'
      ? prompts.sidePrompt
      : prompts.detailPrompt;

  const single = await generateSingleRasterPhotograph({
    prompt: targetPrompt,
    aspectRatio: options.aspectRatio || '3:4',
    referenceImage: existingFrontRef
  });

  return {
    imageUrl: single.image.dataUrl,
    modelUsed: single.modelUsed,
    resolvedSpec,
    promptUsed: targetPrompt
  };
}
