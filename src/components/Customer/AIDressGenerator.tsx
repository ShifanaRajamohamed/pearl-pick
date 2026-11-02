import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  RotateCcw,
  Bell,
  Calendar,
  Layers,
  ChevronDown,
  Camera,
  PenTool,
  Eye,
  Package,
  Wand2,
  AlertCircle,
  RefreshCw,
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { DressDesign } from '../../types';
import { FabricSwatchGallery, PREDEFINED_FABRICS } from './FabricSwatchGallery';
import {
  buildPhotographicPrompts,
  detectPromptContradictions,
  resolveDressSpecifications
} from '../../services/promptSpecResolver';

interface AIDressGeneratorProps {
  onDesignGenerated: (design: DressDesign) => void;
  onOpenNotifications?: () => void;
  onOpenHistory?: () => void;
  onRequestTailor?: (design: DressDesign) => void;
  onViewDesignDetails?: (design: DressDesign) => void;
  initialPrompt?: string;
  initialDressType?: string;
  latestConcept?: DressDesign;
  gender?: 'women' | 'men';
  onGenderChange?: (gender: 'women' | 'men') => void;
  onOpenFabricLibrary?: () => void;
}

interface GenerationErrorState {
  message: string;
  code?: string;
  retryable: boolean;
  clarificationNeeded?: boolean;
  conflicts?: string[];
}

export const AIDressGenerator: React.FC<AIDressGeneratorProps> = ({
  onDesignGenerated,
  onOpenNotifications,
  onOpenHistory,
  onViewDesignDetails,
  initialPrompt,
  initialDressType,
  latestConcept,
  gender = 'women',
  onGenderChange,
  onOpenFabricLibrary
}) => {
  // Form Selections (used ONLY for details not explicitly specified in the user's prompt)
  const [dressType, setDressType] = useState<string>(
    initialDressType || (gender === 'men' ? 'Royal Jodhpuri Bandhgala' : 'Gown')
  );
  const [occasion, setOccasion] = useState<string>(
    gender === 'men' ? 'Groom & Royal Baraat' : 'Bridal & Evening Reception'
  );
  const [fabric, setFabric] = useState<string>(
    gender === 'men' ? 'Pure Banarasi Raw Silk' : 'Silk Organza'
  );
  const [color, setColor] = useState<string>(
    gender === 'men' ? 'Midnight Obsidian' : 'Blush Pink'
  );
  const [sleeves, setSleeves] = useState<string>(
    gender === 'men' ? 'Full-Length Tailored Sleeves' : 'Full Sleeves'
  );
  const [neckStyle, setNeckStyle] = useState<string>(
    gender === 'men' ? 'Mandarin Collar' : 'Sweetheart Neckline'
  );

  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [showPromptInspector, setShowPromptInspector] = useState<boolean>(false);
  const [previewAngle, setPreviewAngle] = useState<'front' | 'back' | 'side' | 'detail'>('front');

  // Optional User Reference Uploads (Raster only)
  const [sketchFile, setSketchFile] = useState<string | null>(null);
  const [inspirationFile, setInspirationFile] = useState<string | null>(null);
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const inspirationInputRef = useRef<HTMLInputElement>(null);

  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const defaultPrompt =
    gender === 'men'
      ? 'A midnight-black raw silk Jodhpuri Bandhgala suit with a mandarin collar, full-length tailored sleeves, and subtle antique gold embroidery only on the collar. No brooch, no pocket square, neutral studio background.'
      : 'A blush-pink organza floor-length gown with a sweetheart neckline, full sleeves, fitted waist, and small pearl embellishments. No necklace or belt. Neutral studio background.';

  const [prompt, setPrompt] = useState<string>(initialPrompt || defaultPrompt);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState<boolean>(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<number>(0);
  const [generationError, setGenerationError] = useState<GenerationErrorState | null>(null);
  const [lastGeneratedDesign, setLastGeneratedDesign] = useState<DressDesign | null>(null);

  // Check if latestConcept has non-SVG raster images from a previous real generation
  const activePhotographicDesign = React.useMemo(() => {
    if (lastGeneratedDesign) return lastGeneratedDesign;
    const candidate = latestConcept;
    const frontUrl = candidate?.variations?.[0]?.frontImageUrl || '';
    if (frontUrl && frontUrl.startsWith('data:image/') && !frontUrl.startsWith('data:image/svg')) {
      return candidate || null;
    }
    return null;
  }, [lastGeneratedDesign, latestConcept]);

  // Real-time contradiction detection on user's explicit prompt
  const contradictionCheck = React.useMemo(() => {
    return detectPromptContradictions(prompt);
  }, [prompt]);

  // Resolve specifications with strict user prompt priority over form defaults
  const resolvedSpec = React.useMemo(() => {
    return resolveDressSpecifications(prompt, {
      gender,
      dressType,
      occasion,
      fabric,
      color,
      sleeve: sleeves,
      neckline: neckStyle
    });
  }, [prompt, gender, dressType, occasion, fabric, color, sleeves, neckStyle]);

  const builtPhotographicPrompts = React.useMemo(() => {
    return buildPhotographicPrompts(resolvedSpec);
  }, [resolvedSpec]);

  const handlePromptChange = (newPromptText: string) => {
    setPrompt(newPromptText);
    if (generationError) {
      setGenerationError(null);
    }
  };

  // Update defaults when gender switches (if no custom initialPrompt was passed)
  useEffect(() => {
    if (!initialPrompt) {
      if (gender === 'men') {
        setDressType('Royal Jodhpuri Bandhgala');
        setOccasion('Groom & Royal Baraat');
        setFabric('Pure Banarasi Raw Silk');
        setColor('Midnight Obsidian');
        setSleeves('Full-Length Tailored Sleeves');
        setNeckStyle('Mandarin Collar');
        setPrompt(
          'A midnight-black raw silk Jodhpuri Bandhgala suit with a mandarin collar, full-length tailored sleeves, and subtle antique gold embroidery only on the collar. No brooch, no pocket square, neutral studio background.'
        );
      } else {
        setDressType('Gown');
        setOccasion('Bridal & Evening Reception');
        setFabric('Silk Organza');
        setColor('Blush Pink');
        setSleeves('Full Sleeves');
        setNeckStyle('Sweetheart Neckline');
        setPrompt(
          'A blush-pink organza floor-length gown with a sweetheart neckline, full sleeves, fitted waist, and small pearl embellishments. No necklace or belt. Neutral studio background.'
        );
      }
      setGenerationError(null);
    }
  }, [gender, initialPrompt]);

  const optionsMap: Record<string, string[]> = {
    dressType:
      gender === 'men'
        ? [
            'Royal Jodhpuri Bandhgala',
            'Savile Row 3-Piece Tuxedo',
            'Imperial Awadh Sherwani',
            'Bespoke Nehru Jacket & Kurta',
            'Italian Double-Breasted Blazer',
            'Luxury Linen Safari Suit'
          ]
        : [
            'Gown',
            'Mermaid Gown',
            'Lehenga Choli',
            'Anarkali Gown',
            'Saree Gown',
            'Saree with Fitted Blouse',
            'Ball Gown',
            'Corset Gown',
            'Cocktail Dress'
          ],
    occasion:
      gender === 'men'
        ? [
            'Groom & Royal Baraat',
            'Black Tie Gala & Red Carpet',
            'Sangeet & Cocktail Night',
            'Festive Celebration',
            'Formal Reception'
          ]
        : ['Bridal & Evening Reception', 'Evening Gala', 'Cocktail', 'Festive', 'Red Carpet'],
    fabric:
      gender === 'men'
        ? [
            'Pure Banarasi Raw Silk',
            'Italian Super 150s Merino Wool',
            'Silk Velvet',
            'Irish Herringbone Linen',
            'Egyptian Giza Cotton',
            'Mulberry Silk'
          ]
        : PREDEFINED_FABRICS.map((f) => f.name),
    color:
      gender === 'men'
        ? [
            'Midnight Obsidian',
            'Bordeaux Wine',
            'Emerald Green',
            'Ivory White',
            'Charcoal Slate',
            'Royal Blue'
          ]
        : [
            'Blush Pink',
            'Emerald Green',
            'Ivory White',
            'Midnight Navy',
            'Rani Pink',
            'Sage Green',
            'Champagne Gold',
            'Crimson Red'
          ],
    sleeves:
      gender === 'men'
        ? [
            'Full-Length Tailored Sleeves',
            'French Tailored Cuffs',
            'Churidar Gathered Sleeves'
          ]
        : [
            'Full Sleeves',
            'Full-Length Sheer Sleeves',
            'Cap Sleeves',
            'Three-Quarter Sleeves',
            'Sleeveless',
            'Bell Sleeves'
          ],
    neckStyle:
      gender === 'men'
        ? [
            'Mandarin Collar',
            'Satin Peak Lapels',
            'Classic Notch Lapels',
            'Silk Shawl Collar',
            'Nehru Stand Collar'
          ]
        : [
            'Sweetheart Neckline',
            'Deep V-Neck',
            'Square Neckline',
            'Boat Neckline',
            'Halter Neckline',
            'Off-Shoulder Neckline',
            'High Neckline'
          ]
  };

  const promptSuggestions =
    gender === 'men'
      ? [
          {
            label: 'Obsidian Bandhgala',
            dressType: 'Royal Jodhpuri Bandhgala',
            color: 'Midnight Obsidian',
            fabric: 'Pure Banarasi Raw Silk',
            text: 'A midnight-black raw silk Jodhpuri Bandhgala suit with a mandarin collar, full-length tailored sleeves, and subtle antique gold embroidery only on the collar. No brooch, no pocket square, neutral studio background.'
          },
          {
            label: 'Bordeaux Velvet Tuxedo',
            dressType: 'Savile Row 3-Piece Tuxedo',
            color: 'Bordeaux Wine',
            fabric: 'Silk Velvet',
            text: 'A deep bordeaux-wine velvet 3-piece tuxedo with satin peak lapels, full-length tailored sleeves, and fitted waist. No brooch, plain white studio background.'
          },
          {
            label: 'Ivory Chikankari Sherwani',
            dressType: 'Imperial Awadh Sherwani',
            color: 'Ivory White',
            fabric: 'Mulberry Silk',
            text: 'An ivory-white mulberry silk floor-length sherwani with a mandarin collar, full sleeves, and fine tonal chikankari embroidery. No necklace, no stole, neutral studio background.'
          }
        ]
      : [
          {
            label: 'Blush Pink Organza Gown',
            dressType: 'Gown',
            color: 'Blush Pink',
            fabric: 'Silk Organza',
            text: 'A blush-pink organza floor-length gown with a sweetheart neckline, full sleeves, fitted waist, and small pearl embellishments. No necklace or belt. Neutral studio background.'
          },
          {
            label: 'Emerald Velvet Mermaid Gown',
            dressType: 'Mermaid Gown',
            color: 'Emerald Green',
            fabric: 'Silk Velvet',
            text: 'An emerald-green velvet floor-length mermaid gown with a sweetheart neckline, full-length sheer sleeves, and gold floral embroidery only along the hem. No necklace, no belt, plain white studio background.'
          },
          {
            label: 'Rani Pink Bridal Lehenga',
            dressType: 'Lehenga Choli',
            color: 'Rani Pink',
            fabric: 'Pure Banarasi Silk',
            text: 'A rani-pink Banarasi silk floor-length lehenga choli with a square neckline, three-quarter sleeves, fitted waist, and gold zardozi floral embroidery. No necklace, no belt, neutral studio background.'
          }
        ];

  const handleEnhancePromptClarity = async () => {
    if (isEnhancingPrompt || isGenerating) return;
    if (contradictionCheck.hasContradictions) {
      setGenerationError({
        message: contradictionCheck.conflicts.join(' '),
        code: 'PROMPT_CONTRADICTION',
        retryable: false,
        clarificationNeeded: true,
        conflicts: contradictionCheck.conflicts
      });
      return;
    }

    setIsEnhancingPrompt(true);
    setGenerationError(null);
    try {
      const res = await fetch('/api/gemini/enhance-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          gender,
          dressType,
          occasion,
          fabric,
          color,
          neckline: neckStyle,
          sleeve: sleeves
        })
      });
      const data = await res.json();
      if (!res.ok) {
        setGenerationError({
          message: data?.error || 'Could not enhance prompt.',
          code: data?.code,
          retryable: Boolean(data?.retryable),
          clarificationNeeded: Boolean(data?.clarificationNeeded),
          conflicts: data?.conflicts
        });
      } else if (data?.enhancedPrompt) {
        setPrompt(data.enhancedPrompt);
      }
    } catch (err: any) {
      setGenerationError({
        message: err?.message || 'Unable to connect to prompt enhancement service.',
        code: 'NETWORK_ERROR',
        retryable: true
      });
    } finally {
      setIsEnhancingPrompt(false);
    }
  };

  const handleGenerate = async () => {
    // Prevent duplicate submissions
    if (isGenerating) return;

    // 1. Validate prompt is non-empty
    if (!prompt.trim()) {
      setGenerationError({
        message: 'Please enter a dress description in the prompt box before generating.',
        code: 'EMPTY_PROMPT',
        retryable: false
      });
      return;
    }

    // 2. Check for contradictory user requirements and ask for clarification before generating
    if (contradictionCheck.hasContradictions) {
      setGenerationError({
        message:
          'Your prompt contains contradictory design requirements. Please clarify the conflicting details below before generating.',
        code: 'PROMPT_CONTRADICTION',
        retryable: false,
        clarificationNeeded: true,
        conflicts: contradictionCheck.conflicts
      });
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);
    setGenerationStage(1);
    setGenerationNotice(
      `Step 1/3: Resolving "${resolvedSpec.color} ${resolvedSpec.fabric} ${resolvedSpec.garmentType}" & exclusions...`
    );

    const stageTimer1 = setTimeout(() => {
      setGenerationStage(2);
      setGenerationNotice(
        `Step 2/3: Photographing full-length front view of ${resolvedSpec.color} ${resolvedSpec.garmentType}...`
      );
    }, 1800);

    const stageTimer2 = setTimeout(() => {
      setGenerationStage(3);
      setGenerationNotice(
        'Step 3/3: Generating reference-conditioned back, side & macro fabric detail views...'
      );
    }, 4500);

    try {
      const res = await fetch('/api/gemini/generate-dress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gender: resolvedSpec.gender,
          dressType,
          occasion,
          fabric,
          color,
          sleeve: sleeves,
          neckline: neckStyle,
          prompt: prompt.trim(),
          sketchImage: sketchFile,
          inspirationImage: inspirationFile,
          budget: resolvedSpec.gender === 'men' ? '₹38,000' : '₹35,000'
        })
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setGenerationError({
          message:
            data?.error ||
            `Image generation failed (HTTP ${res.status}). Please verify GEMINI_API_KEY and retry.`,
          code: data?.code || `HTTP_${res.status}`,
          retryable: data?.retryable !== false,
          clarificationNeeded: Boolean(data?.clarificationNeeded),
          conflicts: Array.isArray(data?.conflicts) ? data.conflicts : []
        });
        setIsGenerating(false);
        setGenerationStage(0);
        setGenerationNotice(null);
        return;
      }

      const firstVar = data?.variations?.[0];
      const hasValidRasterFront =
        firstVar?.frontImageUrl &&
        typeof firstVar.frontImageUrl === 'string' &&
        !firstVar.frontImageUrl.startsWith('data:image/svg');

      if (!data || !firstVar || !hasValidRasterFront) {
        setGenerationError({
          message:
            'The image generation API response did not contain a valid raster photograph. Please retry generation.',
          code: 'NO_IMAGE_GENERATED',
          retryable: true
        });
        setIsGenerating(false);
        setGenerationStage(0);
        setGenerationNotice(null);
        return;
      }

      setLastGeneratedDesign(data);
      setIsGenerating(false);
      setGenerationStage(0);
      setGenerationNotice(null);
      onDesignGenerated(data);
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsGenerating(false);
      setGenerationStage(0);
      setGenerationNotice(null);
      setGenerationError({
        message:
          err?.message ||
          'Network error while communicating with the photorealistic image generation server. Please retry.',
        code: 'NETWORK_ERROR',
        retryable: true
      });
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setTarget: React.Dispatch<React.SetStateAction<string | null>>
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setTarget(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div
      id="ai-dress-studio-screen"
      className="w-full max-w-md mx-auto space-y-5 sm:space-y-6 pb-24 text-[#2D2825] px-4 sm:px-5"
    >
      {/* 1. SCREEN HEADER & GENDER TOGGLE */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#7D726A] font-semibold block">
            {gender === 'men' ? "Men's Bespoke Atelier" : "Women's Couture Atelier"}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2825]">
            AI Dress Photo Studio
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenHistory}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF7F2] active:scale-95 transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE] shadow-2xs"
            title="Saved Wardrobe"
          >
            <RotateCcw className="w-4 h-4 text-[#2D2825]" />
          </button>
          <button
            onClick={onOpenNotifications}
            className="relative w-9 h-9 rounded-full bg-white hover:bg-[#FAF7F2] active:scale-95 transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE] shadow-2xs"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#2D2825]" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#8D2434] ring-2 ring-white" />
          </button>
        </div>
      </div>

      {/* In-Studio Gender Switcher */}
      <div className="flex items-center p-1 rounded-2xl bg-[#EFE9E2] border border-[#E0D6CC] text-xs">
        <button
          onClick={() => (onGenderChange ? onGenderChange('women') : null)}
          disabled={isGenerating}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
            gender === 'women'
              ? 'bg-white text-[#8D2434] shadow-xs'
              : 'text-[#7D726A] hover:text-[#2D2825]'
          }`}
        >
          Women's Couture
        </button>
        <button
          onClick={() => (onGenderChange ? onGenderChange('men') : null)}
          disabled={isGenerating}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
            gender === 'men'
              ? 'bg-[#2D2825] text-white shadow-xs'
              : 'text-[#7D726A] hover:text-[#2D2825]'
          }`}
        >
          Men's Bespoke Suiting
        </button>
      </div>

      {/* 2. PROMPT INPUT (PRIMARY DESIGN SPECIFICATION) */}
      <div className="bg-white rounded-[20px] border border-[#ECE6DE] p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <label className="block text-xs font-bold text-[#2D2825]">
              {gender === 'men'
                ? 'Primary Design Prompt (Overrides Form Defaults)'
                : 'Primary Dress Prompt (Overrides Form Defaults)'}
            </label>
            <span className="text-[10px] text-[#7D726A]">
              Include garment type, colour, fabric, neckline, sleeves, embroidery placement & exclusions
            </span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#FBECEF] text-[#8D2434] text-[10px] font-bold shrink-0">
            Prompt Priority
          </span>
        </div>

        <textarea
          rows={4}
          maxLength={1000}
          value={prompt}
          disabled={isGenerating}
          onChange={(e) => handlePromptChange(e.target.value)}
          placeholder={
            gender === 'men'
              ? 'e.g. A midnight-black raw silk Jodhpuri Bandhgala suit with a mandarin collar, full sleeves, and gold collar embroidery. No brooch, neutral studio background.'
              : 'e.g. A blush-pink organza floor-length gown with a sweetheart neckline, full sleeves, fitted waist, and small pearl embellishments. No necklace or belt. Neutral studio background.'
          }
          className="w-full text-xs text-[#2D2825] placeholder-[#7D726A] bg-[#FAF7F2]/60 rounded-xl p-3 border border-[#ECE6DE] focus:border-[#8D2434] resize-none focus:outline-none leading-relaxed"
        />

        <div className="flex items-center justify-between text-[10px] text-[#7D726A] pt-1">
          <button
            type="button"
            onClick={handleEnhancePromptClarity}
            disabled={isEnhancingPrompt || isGenerating || !prompt.trim()}
            className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#FBECEF] text-[#8D2434] border border-[#8D2434]/25 font-semibold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
          >
            <Wand2 className="w-3 h-3" />
            <span>{isEnhancingPrompt ? 'Clarifying...' : 'Enhance Clarity & Lighting Only'}</span>
          </button>
          <span>{prompt.length}/1000</span>
        </div>

        {/* Contradiction Warning / Clarification Prompt */}
        {contradictionCheck.hasContradictions && (
          <div
            data-testid="prompt-contradiction-alert"
            className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1.5"
          >
            <div className="flex items-center gap-1.5 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>Clarification Needed Before Generating</span>
            </div>
            <ul className="list-disc pl-4 space-y-1 text-[11px] text-amber-900">
              {contradictionCheck.conflicts.map((conflict, idx) => (
                <li key={idx}>{conflict}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Quick Acceptance & Example Prompt Chips */}
        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-semibold text-[#7D726A] block">
            Example Photographic Prompts:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {promptSuggestions.map((item) => (
              <button
                key={item.label}
                type="button"
                disabled={isGenerating}
                onClick={() => {
                  setPrompt(item.text);
                  setDressType(item.dressType);
                  setColor(item.color);
                  setFabric(item.fabric);
                  setGenerationError(null);
                }}
                className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] text-[10px] font-medium text-[#7D726A] hover:text-[#2D2825] hover:border-[#8D2434] transition-all whitespace-nowrap cursor-pointer shrink-0"
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Resolved Design Specification Summary (Shows how Prompt Overrides Form Defaults) */}
        <div className="rounded-2xl bg-[#FAF7F2] border border-[#ECE6DE] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#2D2825]">
              Resolved Garment Specification
            </span>
            <button
              type="button"
              onClick={() => setShowPromptInspector(!showPromptInspector)}
              className="text-[10px] font-semibold text-[#8D2434] cursor-pointer hover:underline"
            >
              {showPromptInspector ? 'Hide Camera Prompt' : 'Inspect Camera Prompt'}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <div className="bg-white rounded-lg p-2 border border-[#ECE6DE]">
              <span className="text-[9px] uppercase text-[#7D726A] block">Garment & Length</span>
              <span className="font-semibold text-[#2D2825]">
                {resolvedSpec.length} {resolvedSpec.garmentType}
              </span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-[#ECE6DE]">
              <span className="text-[9px] uppercase text-[#7D726A] block">Colour & Fabric</span>
              <span className="font-semibold text-[#2D2825]">
                {resolvedSpec.color} • {resolvedSpec.fabric}
              </span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-[#ECE6DE]">
              <span className="text-[9px] uppercase text-[#7D726A] block">Neckline & Sleeves</span>
              <span className="font-semibold text-[#2D2825]">
                {resolvedSpec.neckline} • {resolvedSpec.sleeves}
              </span>
            </div>
            <div className="bg-white rounded-lg p-2 border border-[#ECE6DE]">
              <span className="text-[9px] uppercase text-[#7D726A] block">Embroidery / Finish</span>
              <span className="font-semibold text-[#2D2825] line-clamp-2">
                {resolvedSpec.embroidery}
              </span>
            </div>
          </div>

          <div className="text-[10px] text-[#5C534B] bg-white rounded-lg p-2 border border-[#ECE6DE] space-y-1">
            <div>
              <strong className="text-[#2D2825]">Background:</strong> {resolvedSpec.background}
            </div>
            <div>
              <strong className="text-[#8D2434]">Enforced Exclusions:</strong>{' '}
              {resolvedSpec.exclusions.slice(0, 3).join(' • ')}
            </div>
          </div>

          {showPromptInspector && (
            <div className="p-2.5 rounded-xl bg-white border border-[#ECE6DE] text-[10px] text-[#5C534B] font-mono leading-relaxed break-words">
              <span className="text-[9px] uppercase font-sans font-bold text-[#8D2434] block mb-1">
                Resolved Photographic Model Instruction (Front View):
              </span>
              {builtPhotographicPrompts.frontPrompt}
            </div>
          )}
        </div>
      </div>

      {/* 3. GENERATION ERROR & RETRY CARD (NO SILENT SVG/PLACEHOLDER FALLBACKS) */}
      {generationError && (
        <div
          data-testid="ai-generation-error"
          className="rounded-2xl bg-[#FFF5F5] border border-[#E53E3E]/40 p-4 space-y-3 shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#C53030] shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-bold text-[#742A2A]">
                  {generationError.clarificationNeeded
                    ? 'Prompt Clarification Required'
                    : 'Photorealistic Image Generation Failed'}
                </h3>
                {generationError.code && (
                  <span className="px-2 py-0.5 rounded bg-[#FED7D7] text-[#742A2A] text-[9px] font-mono font-bold">
                    {generationError.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#742A2A]/90 leading-relaxed">{generationError.message}</p>
              {generationError.conflicts && generationError.conflicts.length > 0 && (
                <ul className="list-disc pl-4 text-[11px] text-[#742A2A] space-y-0.5 pt-1">
                  {generationError.conflicts.map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {generationError.retryable && !generationError.clarificationNeeded && (
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full py-2.5 px-4 rounded-xl bg-[#8D2434] hover:bg-[#741D2B] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Photorealistic Generation</span>
            </button>
          )}
        </div>
      )}

      {/* 4. LOADING PROGRESS OR GENERATED PHOTOGRAPH PREVIEW */}
      {(isGenerating || activePhotographicDesign) && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5">
              <span
                className={`w-2 h-2 rounded-full ${
                  isGenerating ? 'bg-[#8D2434] animate-ping' : 'bg-emerald-600'
                }`}
              />
              <span className="font-semibold text-[#2D2825]">
                {isGenerating
                  ? 'Generating 4-View Fashion Photographs...'
                  : 'Generated Photographic Views'}
              </span>
            </div>
            <span className="text-[#8D2434] font-semibold truncate max-w-[200px]">
              {activePhotographicDesign?.title || resolvedSpec.title}
            </span>
          </div>

          <div className="relative aspect-[3/4] rounded-[22px] overflow-hidden bg-[#F5EFEA] border border-[#ECE6DE] shadow-sm">
            {activePhotographicDesign && !isGenerating && (
              <>
                <img
                  src={
                    previewAngle === 'back'
                      ? activePhotographicDesign.variations[0].backImageUrl ||
                        activePhotographicDesign.variations[0].frontImageUrl
                      : previewAngle === 'side'
                      ? activePhotographicDesign.variations[0].sideImageUrl ||
                        activePhotographicDesign.variations[0].frontImageUrl
                      : previewAngle === 'detail'
                      ? activePhotographicDesign.variations[0].detailImageUrl ||
                        activePhotographicDesign.variations[0].frontImageUrl
                      : activePhotographicDesign.variations[0].frontImageUrl
                  }
                  alt={activePhotographicDesign.title}
                  referrerPolicy="no-referrer"
                  onClick={() =>
                    onViewDesignDetails && onViewDesignDetails(activePhotographicDesign)
                  }
                  className="w-full h-full object-contain bg-[#F5EFEA] cursor-pointer"
                />
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
                  <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md p-1 rounded-full border border-white/15">
                    {(['front', 'back', 'side', 'detail'] as const).map((ang) => (
                      <button
                        key={ang}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewAngle(ang);
                        }}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                          previewAngle === ang
                            ? 'bg-white text-[#2D2825] shadow-2xs'
                            : 'text-white/85 hover:text-white'
                        }`}
                      >
                        {ang === 'detail'
                          ? 'Detail'
                          : ang.charAt(0).toUpperCase() + ang.slice(1)}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onViewDesignDetails && onViewDesignDetails(activePhotographicDesign)
                    }
                    className="px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[10px] font-bold text-[#2D2825] flex items-center gap-1 shadow-sm cursor-pointer"
                  >
                    <Eye className="w-3 h-3 text-[#8D2434]" />
                    <span>Open 3-View Board</span>
                  </button>
                </div>
              </>
            )}

            {isGenerating && (
              <div
                data-testid="ai-generator-skeleton"
                className="absolute inset-0 z-20 bg-[#FAF7F2] p-5 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between text-xs font-bold text-[#8D2434]">
                  <span>Photorealistic Fashion Studio</span>
                  <span>Stage {generationStage || 1} of 3</span>
                </div>

                <div className="my-auto space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#8D2434]/10 border border-[#8D2434]/30 flex items-center justify-center mx-auto">
                    <Sparkles className="w-7 h-7 text-[#8D2434] animate-spin" />
                  </div>
                  <div className="space-y-2 max-w-xs mx-auto">
                    <p className="text-xs font-bold text-[#2D2825]">
                      {generationNotice || 'Generating photorealistic dress photographs...'}
                    </p>
                    <p className="text-[11px] text-[#7D726A]">
                      Generating the front full-length photograph first, then using it as a visual
                      reference for the back, side, and close-up fabric detail views.
                    </p>
                  </div>
                  <div className="w-full max-w-[260px] mx-auto h-2 rounded-full bg-[#ECE6DE] overflow-hidden">
                    <div
                      className={`h-full bg-[#8D2434] rounded-full transition-all duration-500 ${
                        generationStage === 1
                          ? 'w-1/3'
                          : generationStage === 2
                          ? 'w-2/3'
                          : 'w-11/12'
                      }`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-2 text-center">
                  {['1. Front Ref', '2. Back View', '3. Side View', '4. Detail'].map((label, i) => (
                    <div
                      key={label}
                      className={`p-2 rounded-xl border text-[10px] font-semibold ${
                        (generationStage >= 2 && i === 0) || generationStage >= 3
                          ? 'bg-[#FBECEF] border-[#8D2434]/40 text-[#8D2434]'
                          : 'bg-white border-[#ECE6DE] text-[#7D726A]'
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. FABRIC SWATCH GALLERY */}
      <FabricSwatchGallery
        selectedFabricName={resolvedSpec.fabric}
        onSelectFabric={(swatch) => {
          setFabric(swatch.name);
        }}
        currentPrompt={prompt}
        onUpdatePromptWithFabric={(newPrompt) => {
          handlePromptChange(newPrompt);
        }}
      />

      {/* 6. OPTIONAL RASTER SKETCH / INSPIRATION IMAGE UPLOADS */}
      <div className="grid grid-cols-2 gap-2.5">
        <input
          type="file"
          ref={sketchInputRef}
          onChange={(e) => handleFileUpload(e, setSketchFile)}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
        />
        <div
          onClick={() => !isGenerating && sketchInputRef.current?.click()}
          className={`p-3 rounded-[16px] border text-left cursor-pointer transition-all flex items-center gap-2 ${
            sketchFile
              ? 'bg-[#FBECEF] border-[#8D2434] text-[#8D2434]'
              : 'bg-white border-[#ECE6DE] hover:border-[#8D2434] text-[#2D2825]'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] flex items-center justify-center shrink-0">
            <PenTool className="w-3.5 h-3.5 text-[#8D2434]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] text-[#7D726A] block">Optional Sketch</span>
            <span className="text-xs font-semibold truncate block">
              {sketchFile ? 'Added ✓' : 'Upload Sketch'}
            </span>
          </div>
        </div>

        <input
          type="file"
          ref={inspirationInputRef}
          onChange={(e) => handleFileUpload(e, setInspirationFile)}
          accept="image/png,image/jpeg,image/webp"
          className="hidden"
        />
        <div
          onClick={() => !isGenerating && inspirationInputRef.current?.click()}
          className={`p-3 rounded-[16px] border text-left cursor-pointer transition-all flex items-center gap-2 ${
            inspirationFile
              ? 'bg-[#FBECEF] border-[#8D2434] text-[#8D2434]'
              : 'bg-white border-[#ECE6DE] hover:border-[#8D2434] text-[#2D2825]'
          }`}
        >
          <div className="w-7 h-7 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] flex items-center justify-center shrink-0">
            <Camera className="w-3.5 h-3.5 text-[#8D2434]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[9px] text-[#7D726A] block">Optional Reference</span>
            <span className="text-xs font-semibold truncate block">
              {inspirationFile ? 'Added ✓' : 'Inspiration'}
            </span>
          </div>
        </div>
      </div>

      {/* 7. FALLBACK FORM ATTRIBUTES (Used only when unspecified in prompt) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#7D726A]">
          <span className="font-semibold text-[#2D2825]">
            Fallback Form Defaults (Used Only If Unspecified in Prompt)
          </span>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          {/* Garment Type */}
          <div className="relative">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() =>
                setActiveDropdown(activeDropdown === 'dressType' ? null : 'dressType')
              }
              className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Package className="w-4 h-4 text-[#8D2434] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] text-[#7D726A] leading-none">Garment Type</div>
                  <div className="text-xs font-semibold text-[#2D2825] mt-1 truncate">
                    {resolvedSpec.garmentType}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7D726A] shrink-0 ml-1" />
            </button>
            {activeDropdown === 'dressType' && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1.5 max-h-48 overflow-y-auto">
                {optionsMap.dressType.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setDressType(opt);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      dressType === opt
                        ? 'bg-[#FBECEF] text-[#8D2434]'
                        : 'hover:bg-black/5 text-[#2D2825]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Occasion */}
          <div className="relative">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setActiveDropdown(activeDropdown === 'occasion' ? null : 'occasion')}
              className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Calendar className="w-4 h-4 text-[#8D2434] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] text-[#7D726A] leading-none">Occasion</div>
                  <div className="text-xs font-semibold text-[#2D2825] mt-1 truncate">
                    {occasion}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7D726A] shrink-0 ml-1" />
            </button>
            {activeDropdown === 'occasion' && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1.5 max-h-48 overflow-y-auto">
                {optionsMap.occasion.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setOccasion(opt);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      occasion === opt
                        ? 'bg-[#FBECEF] text-[#8D2434]'
                        : 'hover:bg-black/5 text-[#2D2825]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Fabric */}
          <div className="relative">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setActiveDropdown(activeDropdown === 'fabric' ? null : 'fabric')}
              className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Layers className="w-4 h-4 text-[#8D2434] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] text-[#7D726A] leading-none">Fabric</div>
                  <div className="text-xs font-semibold text-[#2D2825] mt-1 truncate">
                    {resolvedSpec.fabric}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7D726A] shrink-0 ml-1" />
            </button>
            {activeDropdown === 'fabric' && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1.5 max-h-48 overflow-y-auto">
                {optionsMap.fabric.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setFabric(opt);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      fabric === opt
                        ? 'bg-[#FBECEF] text-[#8D2434]'
                        : 'hover:bg-black/5 text-[#2D2825]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Colour */}
          <div className="relative">
            <button
              type="button"
              disabled={isGenerating}
              onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
              className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-4 h-4 rounded-full border border-[#ECE6DE] bg-[#8D2434] shrink-0" />
                <div className="min-w-0">
                  <div className="text-[9px] text-[#7D726A] leading-none">Colour</div>
                  <div className="text-xs font-semibold text-[#2D2825] mt-1 truncate">
                    {resolvedSpec.color}
                  </div>
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-[#7D726A] shrink-0 ml-1" />
            </button>
            {activeDropdown === 'color' && (
              <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1.5 max-h-48 overflow-y-auto">
                {optionsMap.color.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      setColor(opt);
                      setActiveDropdown(null);
                    }}
                    className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                      color === opt
                        ? 'bg-[#FBECEF] text-[#8D2434]'
                        : 'hover:bg-black/5 text-[#2D2825]'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 8. SECONDARY FALLBACK ATTRIBUTES: Neckline & Sleeves */}
      <div className="bg-[#FAF7F2] rounded-[18px] border border-[#ECE6DE] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2D2825]">
            {gender === 'men' ? 'Default Collar & Sleeve Cut' : 'Default Neckline & Sleeve Cut'}
          </span>
          <button
            type="button"
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="text-[11px] font-semibold text-[#8D2434] cursor-pointer"
          >
            {showMoreOptions ? 'Hide' : 'Customize Defaults'}
          </button>
        </div>

        {showMoreOptions && (
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <div>
              <label className="text-[9px] uppercase font-bold text-[#7D726A] block mb-1">
                {gender === 'men' ? 'Collar / Lapel' : 'Neckline Style'}
              </label>
              <select
                value={neckStyle}
                disabled={isGenerating}
                onChange={(e) => setNeckStyle(e.target.value)}
                className="w-full bg-white border border-[#ECE6DE] rounded-xl p-2 text-xs text-[#2D2825] font-semibold focus:outline-none"
              >
                {optionsMap.neckStyle.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[9px] uppercase font-bold text-[#7D726A] block mb-1">
                {gender === 'men' ? 'Cuff / Sleeve Style' : 'Sleeve Style'}
              </label>
              <select
                value={sleeves}
                disabled={isGenerating}
                onChange={(e) => setSleeves(e.target.value)}
                className="w-full bg-white border border-[#ECE6DE] rounded-xl p-2 text-xs text-[#2D2825] font-semibold focus:outline-none"
              >
                {optionsMap.sleeves.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {onOpenFabricLibrary && (
          <div className="pt-2 border-t border-[#ECE6DE] flex items-center justify-between">
            <span className="text-[11px] text-[#7D726A]">
              Inspect textile GSM weights & feeler swatches
            </span>
            <button
              type="button"
              onClick={onOpenFabricLibrary}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-[#2D2825] text-[#8D2434] hover:text-white border border-[#ECE6DE] text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Open Fabric Library</span>
            </button>
          </div>
        )}
      </div>

      {/* 9. GENERATE PHOTOREALISTIC DRESS BUTTON */}
      <div className="space-y-2.5 pt-1">
        {generationNotice && (
          <p className="text-xs text-center text-[#8D2434] font-medium animate-pulse">
            {generationNotice}
          </p>
        )}

        <button
          type="button"
          data-testid="generate-dress-submit-btn"
          onClick={handleGenerate}
          disabled={isGenerating || contradictionCheck.hasContradictions}
          className="w-full py-4 rounded-full bg-[#2D2825] hover:bg-[#1A1816] active:scale-[0.98] transition-all text-white font-semibold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <Sparkles className="w-4 h-4 text-[#E8C5CC]" />
          <span>
            {isGenerating
              ? 'Generating Photorealistic Views...'
              : gender === 'men'
              ? 'Generate Photorealistic Menswear'
              : 'Generate Photorealistic Dress'}
          </span>
        </button>

        <p className="text-[10px] text-[#7D726A] text-center leading-relaxed px-2">
          Generates a photorealistic AI fashion visualization (Front view first, followed by
          reference-conditioned Back, Side, and Macro Detail views). AI visualizations represent
          proposed garment concepts rather than manufactured inventory or guaranteed tailoring quotes.
        </p>
      </div>
    </div>
  );
};
