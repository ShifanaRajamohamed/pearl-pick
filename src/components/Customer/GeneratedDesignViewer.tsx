import React, { useState } from 'react';
import {
  Sparkles,
  Share2,
  Scissors,
  ChevronLeft,
  Bookmark,
  BookmarkCheck,
  Tag,
  Calendar,
  Sliders,
  Download,
  X,
  Wand2,
  RefreshCw,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Ruler,
  Calculator,
  Check,
  ShieldAlert,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DressDesign, DressDesignVariation, MeasurementSheet, TailorProfile } from '../../types';
import {
  detectPromptContradictions,
  resolveDressSpecifications
} from '../../services/promptSpecResolver';

interface GeneratedDesignViewerProps {
  design: DressDesign;
  measurements?: MeasurementSheet;
  tailors?: TailorProfile[];
  onSaveToFavorites: (designId: string) => void;
  onSaveUpdatedDesign?: (design: DressDesign) => void;
  onRequestQuotations: (
    design: DressDesign,
    selectedVariation: DressDesignVariation,
    budget: number,
    neededBy: string,
    instructions: string
  ) => void;
  onBackToStudio: () => void;
  onOpenSpecSheet: (variation: DressDesignVariation) => void;
  onOpenMeasurements?: () => void;
}

interface ViewerErrorState {
  message: string;
  code?: string;
  retryable: boolean;
  clarificationNeeded?: boolean;
  conflicts?: string[];
  lastPromptAttempted?: string;
  lastRegenerateAll?: boolean;
}

function isNonSvgImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('data:image/svg')) return false;
  return (
    trimmed.startsWith('data:image/png') ||
    trimmed.startsWith('data:image/jpeg') ||
    trimmed.startsWith('data:image/jpg') ||
    trimmed.startsWith('data:image/webp') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/')
  );
}

function getRasterExtension(imageUrl: string): string {
  if (imageUrl.startsWith('data:image/jpeg') || imageUrl.startsWith('data:image/jpg')) {
    return 'jpg';
  }
  if (imageUrl.startsWith('data:image/webp')) {
    return 'webp';
  }
  return 'png';
}

export const GeneratedDesignViewer: React.FC<GeneratedDesignViewerProps> = ({
  design,
  measurements,
  tailors = [],
  onSaveToFavorites,
  onSaveUpdatedDesign,
  onRequestQuotations,
  onBackToStudio,
  onOpenSpecSheet,
  onOpenMeasurements
}) => {
  const [selectedVarIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(Boolean(design.isFavorite));
  const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [activeAngle, setActiveAngle] = useState<'front' | 'back' | 'side' | 'detail'>('front');

  // Dynamic Gemini Photorealistic Regeneration State
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [showGeminiStudio, setShowGeminiStudio] = useState<boolean>(false);
  const [geminiPrompt, setGeminiPrompt] = useState<string>(design.prompt || '');
  const [isGeneratingGeminiImage, setIsGeneratingGeminiImage] = useState<boolean>(false);
  const [viewerSynthesisStage, setViewerSynthesisStage] = useState<number>(0);
  const [imageGenerationStatus, setImageGenerationStatus] = useState<string | null>(null);
  const [imageModelUsed, setImageModelUsed] = useState<string | null>(
    (design.variations?.[0]?.specs as any)?.modelUsed || null
  );
  const [viewerError, setViewerError] = useState<ViewerErrorState | null>(null);

  const currentVar = design.variations[selectedVarIndex] || design.variations[0];

  const [targetBudget, setTargetBudget] = useState<number>(
    currentVar?.estimatedPriceRange?.min || 28000
  );
  const [neededByDate, setNeededByDate] = useState<string>('2026-12-15');
  const [selectedDesignerForQuote, setSelectedDesignerForQuote] = useState<string>(
    tailors[0]?.name
      ? `${tailors[0].name} (${tailors[0].location})`
      : 'Ustad Rafiq Ahmed (Royal Heritage Atelier)'
  );
  const [sizingMode, setSizingMode] = useState<'measurements' | 'standard'>('measurements');
  const [selectedStandardSize, setSelectedStandardSize] = useState<string>('M');
  const [isExportingPoster, setIsExportingPoster] = useState<boolean>(false);
  const [specificInstructions, setSpecificInstructions] = useState<string>(
    design.prompt ||
      `${currentVar?.specs?.color || ''} ${currentVar?.specs?.fabric || ''} ${
        currentVar?.specs?.dressType || ''
      } with ${currentVar?.specs?.neckline || ''} and ${currentVar?.specs?.sleeve || ''}.`.trim()
  );

  // Fabric Yardage Calculator States
  const isMenDesign =
    (currentVar?.specs as any)?.gender === 'men' ||
    design.tags?.some((t) => t.toLowerCase().includes('men')) ||
    design.id.includes('men');
  const [boltWidthInches, setBoltWidthInches] = useState<44 | 58>(44);
  const [flareProfile, setFlareProfile] = useState<'standard' | 'royal_kali' | 'cathedral_train'>(
    'royal_kali'
  );
  const [showCustomMeasureCalibrator, setShowCustomMeasureCalibrator] = useState<boolean>(false);

  const [calcHeightIn, setCalcHeightIn] = useState<number>(
    measurements?.height || (isMenDesign ? 70 : 65)
  );
  const [calcBustChestIn, setCalcBustChestIn] = useState<number>(
    isMenDesign ? measurements?.chest || measurements?.bust || 40 : measurements?.bust || 35
  );
  const [calcWaistIn, setCalcWaistIn] = useState<number>(
    isMenDesign ? measurements?.trouserWaist || measurements?.waist || 34 : measurements?.waist || 28
  );
  const [calcGarmentLengthIn, setCalcGarmentLengthIn] = useState<number>(
    isMenDesign
      ? measurements?.jacketLength || 31
      : measurements?.lehengaLength || measurements?.waistToHem || 42
  );

  React.useEffect(() => {
    if (!measurements) return;
    setCalcHeightIn(measurements.height || (isMenDesign ? 70 : 65));
    setCalcBustChestIn(
      isMenDesign ? measurements.chest || measurements.bust || 40 : measurements.bust || 35
    );
    setCalcWaistIn(
      isMenDesign ? measurements.trouserWaist || measurements.waist || 34 : measurements.waist || 28
    );
    setCalcGarmentLengthIn(
      isMenDesign
        ? measurements.jacketLength || 31
        : measurements.lehengaLength || measurements.waistToHem || 42
    );
  }, [measurements, isMenDesign]);

  const yardageCalculation = React.useMemo(() => {
    const dressTypeStr = (currentVar?.specs?.dressType || design.title || 'Couture Gown').toLowerCase();
    const widthMultiplier = boltWidthInches === 44 ? 1.0 : 0.82;
    const sizeScaleFactor =
      1 +
      Math.max(-0.12, Math.min(0.35, (calcBustChestIn - (isMenDesign ? 40 : 35)) * 0.015)) +
      Math.max(-0.1, Math.min(0.25, (calcHeightIn - (isMenDesign ? 70 : 65)) * 0.012)) +
      Math.max(-0.1, Math.min(0.25, (calcGarmentLengthIn - (isMenDesign ? 31 : 42)) * 0.014));

    const flareBonusYards =
      flareProfile === 'standard' ? 0 : flareProfile === 'royal_kali' ? 1.4 : 2.3;

    let categoryLabel = String(currentVar?.specs?.dressType || design.title);
    let items: { label: string; yards: number; note: string }[] = [];
    let liningYards = 3.5;

    if (dressTypeStr.includes('lehenga')) {
      categoryLabel = 'Lehenga, Choli & Optional Dupatta';
      const skirtYards = (4.8 + flareBonusYards) * sizeScaleFactor * widthMultiplier;
      const choliYards = 1.35 * sizeScaleFactor * widthMultiplier;
      const marginYards = (skirtYards + choliYards) * 0.12;
      items = [
        {
          label: 'Flared Skirt Panels',
          yards: Number(skirtYards.toFixed(1)),
          note: `Calibrated for ${calcWaistIn}" waist & ${calcGarmentLengthIn}" length`
        },
        {
          label: 'Tailored Choli & Sleeves',
          yards: Number(choliYards.toFixed(1)),
          note: `Calibrated for ${calcBustChestIn}" bust + 2" seam allowance`
        },
        {
          label: 'Pattern Match & Seam Buffer (+12%)',
          yards: Number(marginYards.toFixed(1)),
          note: 'Motif alignment & shrinkage reserve'
        }
      ];
      liningYards = Number(((skirtYards + choliYards) * 0.85).toFixed(1));
    } else if (dressTypeStr.includes('anarkali') || dressTypeStr.includes('sharara')) {
      categoryLabel = 'Kalidar Anarkali / Sharara Ensemble';
      const kaliYards = (4.4 + flareBonusYards * 0.85) * sizeScaleFactor * widthMultiplier;
      const lowerYards = 2.2 * sizeScaleFactor * widthMultiplier;
      const marginYards = (kaliYards + lowerYards) * 0.1;
      items = [
        {
          label: 'Kalidar Bodice & Flare',
          yards: Number(kaliYards.toFixed(1)),
          note: `Calibrated for ${calcHeightIn}" height & ${calcBustChestIn}" bust`
        },
        {
          label: 'Trousers / Sharara Bottoms',
          yards: Number(lowerYards.toFixed(1)),
          note: `Calibrated for ${calcWaistIn}" waist`
        },
        {
          label: 'Bias Cut & Seam Allowance (+10%)',
          yards: Number(marginYards.toFixed(1)),
          note: 'Interlocked kali seam tolerance'
        }
      ];
      liningYards = Number((kaliYards * 0.8).toFixed(1));
    } else if (dressTypeStr.includes('saree')) {
      categoryLabel = 'Draped Saree & Tailored Blouse';
      const drapeYards = (5.5 + flareBonusYards * 0.6) * sizeScaleFactor * widthMultiplier;
      const blouseYards = 1.25 * sizeScaleFactor * widthMultiplier;
      const marginYards = 0.65;
      items = [
        {
          label: 'Pallu & Pleated Saree Drape',
          yards: Number(drapeYards.toFixed(1)),
          note: `Calibrated for ${calcHeightIn}" stature & ${calcWaistIn}" waist`
        },
        {
          label: 'Tailored Blouse',
          yards: Number(blouseYards.toFixed(1)),
          note: `Calibrated for ${calcBustChestIn}" bust`
        },
        {
          label: 'Border Alignment Buffer',
          yards: Number(marginYards.toFixed(1)),
          note: 'Motif matching reserve'
        }
      ];
      liningYards = Number((drapeYards * 0.5 + blouseYards).toFixed(1));
    } else if (
      isMenDesign ||
      dressTypeStr.includes('bandhgala') ||
      dressTypeStr.includes('sherwani') ||
      dressTypeStr.includes('tuxedo') ||
      dressTypeStr.includes('blazer') ||
      dressTypeStr.includes('suit')
    ) {
      categoryLabel = String(currentVar?.specs?.dressType || "Men's Bespoke Ensemble");
      const isLongCoat = dressTypeStr.includes('sherwani') || dressTypeStr.includes('achkan');
      const jacketYards = (isLongCoat ? 2.85 : 2.25) * sizeScaleFactor * widthMultiplier;
      const trouserYards = 1.75 * sizeScaleFactor * widthMultiplier;
      const marginYards = (jacketYards + trouserYards) * 0.1;
      items = [
        {
          label: isLongCoat ? 'Sherwani / Achkan Coat Body' : 'Structured Jacket & Lapels',
          yards: Number(jacketYards.toFixed(1)),
          note: `Calibrated for ${calcBustChestIn}" chest & ${calcGarmentLengthIn}" length`
        },
        {
          label: 'Tailored Trousers / Breeches',
          yards: Number(trouserYards.toFixed(1)),
          note: `Calibrated for ${calcWaistIn}" waist & ${calcHeightIn}" height`
        },
        {
          label: 'Inlay & Seam Allowance (+10%)',
          yards: Number(marginYards.toFixed(1)),
          note: '2-inch chest & waist let-out reserve'
        }
      ];
      liningYards = Number(((jacketYards + 0.8) * 0.9).toFixed(1));
    } else {
      categoryLabel = String(currentVar?.specs?.dressType || 'Floor-Length Gown');
      const skirtTrainYards = (3.9 + flareBonusYards) * sizeScaleFactor * widthMultiplier;
      const bodiceYards = 1.4 * sizeScaleFactor * widthMultiplier;
      const marginYards = (skirtTrainYards + bodiceYards) * 0.12;
      items = [
        {
          label: 'Skirt & Full-Length Hem Panels',
          yards: Number(skirtTrainYards.toFixed(1)),
          note: `Calibrated for ${calcGarmentLengthIn}" waist-to-hem & ${calcHeightIn}" height`
        },
        {
          label: 'Fitted Bodice & Sleeves',
          yards: Number(bodiceYards.toFixed(1)),
          note: `Calibrated for ${calcBustChestIn}" bust & ${calcWaistIn}" waist`
        },
        {
          label: 'Drape & Seam Allowance (+12%)',
          yards: Number(marginYards.toFixed(1)),
          note: 'French seams & 2" alteration allowance'
        }
      ];
      liningYards = Number(((skirtTrainYards + bodiceYards) * 0.8).toFixed(1));
    }

    const totalYards = Number(items.reduce((sum, item) => sum + item.yards, 0).toFixed(1));
    const totalMeters = Number((totalYards * 0.9144).toFixed(1));

    return {
      categoryLabel,
      items,
      totalYards,
      totalMeters,
      liningYards
    };
  }, [
    currentVar,
    design.title,
    isMenDesign,
    boltWidthInches,
    flareProfile,
    calcHeightIn,
    calcBustChestIn,
    calcWaistIn,
    calcGarmentLengthIn
  ]);

  // Resolve photographic URLs strictly from raster/photographic sources (never SVG)
  const resolvedFrontUrl =
    customImages[`${selectedVarIndex}-front`] ||
    (isNonSvgImageUrl(currentVar?.frontImageUrl) ? currentVar.frontImageUrl : '');
  const resolvedBackUrl =
    customImages[`${selectedVarIndex}-back`] ||
    (isNonSvgImageUrl(currentVar?.backImageUrl) ? currentVar.backImageUrl! : resolvedFrontUrl);
  const resolvedSideUrl =
    customImages[`${selectedVarIndex}-side`] ||
    (isNonSvgImageUrl(currentVar?.sideImageUrl) ? currentVar.sideImageUrl! : resolvedFrontUrl);
  const resolvedDetailUrl =
    customImages[`${selectedVarIndex}-detail`] ||
    (isNonSvgImageUrl(currentVar?.detailImageUrl) ? currentVar.detailImageUrl! : resolvedFrontUrl);

  const currentImage =
    activeAngle === 'back'
      ? resolvedBackUrl
      : activeAngle === 'side'
      ? resolvedSideUrl
      : activeAngle === 'detail'
      ? resolvedDetailUrl
      : resolvedFrontUrl;

  const handleGenerateGeminiImage = async (
    customPromptToUse?: string,
    regenerateAllAngles: boolean = true
  ) => {
    if (isGeneratingGeminiImage) return;

    const promptText = (customPromptToUse ?? geminiPrompt ?? design.prompt ?? '').trim();
    if (!promptText) {
      setViewerError({
        message: 'Please enter a dress description before generating.',
        code: 'EMPTY_PROMPT',
        retryable: false
      });
      return;
    }

    const contradictionCheck = detectPromptContradictions(promptText);
    if (contradictionCheck.hasContradictions) {
      setViewerError({
        message: contradictionCheck.conflicts.join(' '),
        code: 'PROMPT_CONTRADICTION',
        retryable: false,
        clarificationNeeded: true,
        conflicts: contradictionCheck.conflicts
      });
      return;
    }

    setIsGeneratingGeminiImage(true);
    setViewerError(null);
    setViewerSynthesisStage(1);
    setImageGenerationStatus('Step 1/3: Validating prompt & resolving garment details...');

    const stageTimer1 = setTimeout(() => {
      setViewerSynthesisStage(2);
      setImageGenerationStatus(
        regenerateAllAngles
          ? 'Step 2/3: Photographing full-length front reference view...'
          : `Step 2/3: Conditioning ${activeAngle} view on front reference photograph...`
      );
    }, 1500);

    const stageTimer2 = setTimeout(() => {
      setViewerSynthesisStage(3);
      setImageGenerationStatus(
        'Step 3/3: Rendering reference-consistent multi-angle photographs...'
      );
    }, 4000);

    const resolvedSpec = resolveDressSpecifications(promptText, {
      gender: isMenDesign ? 'men' : 'women',
      dressType: currentVar?.specs?.dressType || design.title,
      color: currentVar?.specs?.color,
      fabric: currentVar?.specs?.fabric,
      neckline: currentVar?.specs?.neckline,
      sleeve: currentVar?.specs?.sleeve,
      pattern: currentVar?.specs?.pattern
    });

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          gender: resolvedSpec.gender,
          angle: activeAngle,
          regenerateAllAngles,
          referenceFrontDataUrl: resolvedFrontUrl || null,
          dressType: resolvedSpec.garmentType,
          color: resolvedSpec.color,
          fabric: resolvedSpec.fabric,
          neckline: resolvedSpec.neckline,
          sleeve: resolvedSpec.sleeves,
          aspectRatio: '3:4'
        })
      });

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setViewerError({
          message:
            data?.error ||
            `Image generation failed (HTTP ${res.status}). Please check GEMINI_API_KEY and retry.`,
          code: data?.code || `HTTP_${res.status}`,
          retryable: data?.retryable !== false,
          clarificationNeeded: Boolean(data?.clarificationNeeded),
          conflicts: Array.isArray(data?.conflicts) ? data.conflicts : [],
          lastPromptAttempted: promptText,
          lastRegenerateAll: regenerateAllAngles
        });
        setIsGeneratingGeminiImage(false);
        setViewerSynthesisStage(0);
        setImageGenerationStatus(null);
        return;
      }

      if (!data || !isNonSvgImageUrl(data.imageUrl)) {
        setViewerError({
          message:
            'The AI model response did not contain a valid raster photograph. Please retry generation.',
          code: 'NO_IMAGE_GENERATED',
          retryable: true,
          lastPromptAttempted: promptText,
          lastRegenerateAll: regenerateAllAngles
        });
        setIsGeneratingGeminiImage(false);
        setViewerSynthesisStage(0);
        setImageGenerationStatus(null);
        return;
      }

      const nextCustomImages: Record<string, string> = {
        ...customImages,
        ...(data.angles
          ? {
              [`${selectedVarIndex}-front`]: data.angles.front,
              [`${selectedVarIndex}-back`]: data.angles.back,
              [`${selectedVarIndex}-side`]: data.angles.side,
              [`${selectedVarIndex}-detail`]: data.angles.detail
            }
          : {
              [`${selectedVarIndex}-${activeAngle}`]: data.imageUrl
            })
      };

      setCustomImages(nextCustomImages);
      setImageModelUsed(data.modelUsed || data.model || 'gemini-2.0-flash-exp-image-generation');
      setImageGenerationStatus(
        `Generated photorealistic ${resolvedSpec.color} ${resolvedSpec.fabric} ${resolvedSpec.garmentType} views.`
      );
      setIsGeneratingGeminiImage(false);
      setViewerSynthesisStage(0);

      // Persist updated raster photographs to parent design state if callback provided
      if (onSaveUpdatedDesign && currentVar) {
        const updatedVar: DressDesignVariation = {
          ...currentVar,
          name: `${resolvedSpec.color} ${resolvedSpec.fabric} ${resolvedSpec.garmentType}`,
          frontImageUrl: nextCustomImages[`${selectedVarIndex}-front`] || resolvedFrontUrl,
          backImageUrl: nextCustomImages[`${selectedVarIndex}-back`] || resolvedBackUrl,
          sideImageUrl: nextCustomImages[`${selectedVarIndex}-side`] || resolvedSideUrl,
          detailImageUrl: nextCustomImages[`${selectedVarIndex}-detail`] || resolvedDetailUrl,
          specs: {
            ...currentVar.specs,
            dressType: resolvedSpec.garmentType as any,
            color: resolvedSpec.color,
            fabric: resolvedSpec.fabric as any,
            neckline: resolvedSpec.neckline as any,
            sleeve: resolvedSpec.sleeves as any,
            pattern: resolvedSpec.embroidery as any,
            backDesign: resolvedSpec.backDesign,
            backSpecifiedByUser: resolvedSpec.backSpecifiedByUser
          } as any
        };
        onSaveUpdatedDesign({
          ...design,
          title: updatedVar.name,
          prompt: promptText,
          variations: design.variations.map((v, idx) =>
            idx === selectedVarIndex ? updatedVar : v
          )
        });
      }
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      setIsGeneratingGeminiImage(false);
      setViewerSynthesisStage(0);
      setImageGenerationStatus(null);
      setViewerError({
        message:
          err?.message ||
          'Network error while communicating with the image generation server. Please retry.',
        code: 'NETWORK_ERROR',
        retryable: true,
        lastPromptAttempted: promptText,
        lastRegenerateAll: regenerateAllAngles
      });
    }
  };

  const handleBroadcastQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const enrichedInstructions = `[Preferred Atelier: ${selectedDesignerForQuote} | Fit: ${
      sizingMode === 'measurements'
        ? '14-Point Custom Body Measurements'
        : `Standard Size ${selectedStandardSize}`
    }] ${specificInstructions}`;
    onRequestQuotations(design, currentVar, targetBudget, neededByDate, enrichedInstructions);
    setShowQuoteModal(false);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#8D2434', '#FAF7F2', '#4A3728']
    });
  };

  const handleDownloadSingleImage = (viewLabel: string, imageUrl: string) => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    const cleanTitle = (currentVar?.name || design.title || 'bespoke-dress')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-');
    const ext = getRasterExtension(imageUrl);
    link.download = `${cleanTitle}-${viewLabel.toLowerCase()}.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCombinedPoster = async () => {
    if (isExportingPoster || !resolvedFrontUrl) return;
    setIsExportingPoster(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 1150;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Studio neutral background
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner
      ctx.fillStyle = '#2D2825';
      ctx.fillRect(0, 0, canvas.width, 110);

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(
        'PEARL PICK • AI PHOTOREALISTIC THREE-VIEW SPECIFICATION BOARD',
        50,
        44
      );

      ctx.fillStyle = '#FAF7F2';
      ctx.font = 'bold 32px Georgia, serif';
      ctx.fillText(currentVar?.name || design.title, 50, 84);

      const loadImg = (src: string): Promise<HTMLImageElement> =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });

      const panels = [
        { label: '1. FRONT VIEW', url: resolvedFrontUrl, x: 50 },
        { label: '2. BACK VIEW', url: resolvedBackUrl, x: 625 },
        { label: '3. SIDE VIEW', url: resolvedSideUrl, x: 1200 }
      ];

      for (const panel of panels) {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(panel.x, 140, 550, 740);
        ctx.strokeStyle = '#E4D9D1';
        ctx.lineWidth = 2;
        ctx.strokeRect(panel.x, 140, 550, 740);

        const boxX = panel.x + 15;
        const boxY = 155;
        const boxW = 520;
        const boxH = 665;

        ctx.fillStyle = '#F5EFEA';
        ctx.fillRect(boxX, boxY, boxW, boxH);

        if (panel.url) {
          try {
            const img = await loadImg(panel.url);
            // Draw with aspect-preserving contain fit so full garment and hem are visible
            const scale = Math.min(boxW / img.width, boxH / img.height);
            const drawW = img.width * scale;
            const drawH = img.height * scale;
            const drawX = boxX + (boxW - drawW) / 2;
            const drawY = boxY + (boxH - drawH) / 2;
            ctx.drawImage(img, drawX, drawY, drawW, drawH);
          } catch {
            // Keep clean background if external image blocked CORS
          }
        }

        // Label bar outside the photograph
        ctx.fillStyle = '#2D2825';
        ctx.font = 'bold 18px sans-serif';
        ctx.fillText(panel.label, panel.x + 25, 855);
      }

      // Footer Specification Strip
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(50, 910, 1700, 190);
      ctx.strokeStyle = '#E4D9D1';
      ctx.strokeRect(50, 910, 1700, 190);

      ctx.fillStyle = '#8D2434';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('RESOLVED GARMENT SPECIFICATIONS & TAILORING DOSSIER', 80, 948);

      ctx.fillStyle = '#2D2825';
      ctx.font = '18px sans-serif';
      ctx.fillText(
        `Garment: ${currentVar?.specs?.dressType || design.title}   |   Fabric: ${
          currentVar?.specs?.fabric || 'Silk'
        }   |   Colour: ${currentVar?.specs?.color || 'Blush'}   |   Neckline: ${
          currentVar?.specs?.neckline || 'Sweetheart'
        }   |   Sleeves: ${currentVar?.specs?.sleeve || 'Full Sleeves'}`,
        80,
        988
      );
      ctx.fillStyle = '#7D726A';
      ctx.font = '16px sans-serif';
      ctx.fillText(
        `Estimated Fabric Yardage: ${yardageCalculation.totalYards} yds (${yardageCalculation.totalMeters}m) + ${yardageCalculation.liningYards} yds Lining   •   Prompt: ${(
          design.prompt || ''
        ).slice(0, 95)}`,
        80,
        1028
      );
      ctx.fillStyle = '#2D2825';
      ctx.font = 'bold 15px sans-serif';
      ctx.fillText(
        `AI Visualization Notice: Proposed garment concept visualization • Estimated Craft Time: ~${
          currentVar?.estimatedCraftTimeDays || 14
        } Days • Est. Range: ₹${(currentVar?.estimatedPriceRange?.min || 25000).toLocaleString(
          'en-IN'
        )} – ₹${(currentVar?.estimatedPriceRange?.max || 44000).toLocaleString('en-IN')}`,
        80,
        1068
      );

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const cleanName = (currentVar?.name || design.title || 'couture-poster')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-');
      link.download = `${cleanName}-3view-fashion-poster.png`;
      link.href = pngUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } finally {
      setIsExportingPoster(false);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: design.title,
          text: `Look at this AI bespoke dress concept: ${design.title}`,
          url: window.location.href
        })
        .catch(() => {});
    } else {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  const backSpecifiedByUser = Boolean((currentVar?.specs as any)?.backSpecifiedByUser);
  const backDesignDescription =
    (currentVar?.specs as any)?.backDesign ||
    'Clean tailored back panel with concealed closure compatible with the front neckline';

  return (
    <div
      id="pearl-blush-reverie-screen"
      className="max-w-5xl mx-auto space-y-6 pb-24 text-[#2D2825] px-3 sm:px-4"
    >
      {/* 1. TOP BAR: Back button, Title, and Action icons */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBackToStudio}
          className="px-3.5 py-2 rounded-full bg-white hover:bg-[#FAF7F2] active:scale-95 transition-all cursor-pointer text-[#2D2825] flex items-center gap-1.5 border border-[#ECE6DE] text-xs font-bold"
          title="Back to AI Dress Studio"
        >
          <ChevronLeft className="w-4 h-4 text-[#2D2825]" />
          <span>Back to Studio</span>
        </button>

        <h2 className="font-serif text-lg sm:text-xl font-bold tracking-tight text-[#2D2825]">
          Photorealistic Multi-View Presentation
        </h2>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleGenerateGeminiImage(design.prompt, true)}
            disabled={isGeneratingGeminiImage}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FBECEF] transition-all cursor-pointer text-[#8D2434] flex items-center justify-center border border-[#ECE6DE] disabled:opacity-50"
            title="Regenerate All 4 Photorealistic Views"
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingGeminiImage ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF7F2] transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE]"
            title="Share design"
          >
            <Share2 className="w-4 h-4 text-[#2D2825]" />
          </button>
          <button
            onClick={() => {
              setIsSaved(!isSaved);
              onSaveToFavorites(design.id);
            }}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF7F2] transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE]"
            title={isSaved ? 'Saved in Wardrobe' : 'Save design to Wardrobe'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-[#8D2434]" />
            ) : (
              <Bookmark className="w-4 h-4 text-[#2D2825]" />
            )}
          </button>
        </div>
      </div>

      {/* ERROR BANNER WITH RETRY OPTION (NO SILENT SVG OR PLACEHOLDER FALLBACKS) */}
      {viewerError && (
        <div
          data-testid="viewer-generation-error"
          className="rounded-2xl bg-[#FFF5F5] border border-[#E53E3E]/40 p-4 space-y-3 shadow-xs"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-5 h-5 text-[#C53030] shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-[#742A2A]">
                  {viewerError.clarificationNeeded
                    ? 'Prompt Clarification Required'
                    : 'Photorealistic Image Generation Failed'}
                </h4>
                {viewerError.code && (
                  <span className="px-2 py-0.5 rounded bg-[#FED7D7] text-[#742A2A] text-[9px] font-mono font-bold">
                    {viewerError.code}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#742A2A]/90 leading-relaxed">{viewerError.message}</p>
              {viewerError.conflicts && viewerError.conflicts.length > 0 && (
                <ul className="list-disc pl-4 text-[11px] text-[#742A2A] space-y-0.5 pt-1">
                  {viewerError.conflicts.map((c, idx) => (
                    <li key={idx}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {viewerError.retryable && !viewerError.clarificationNeeded && (
            <button
              type="button"
              onClick={() =>
                handleGenerateGeminiImage(
                  viewerError.lastPromptAttempted || geminiPrompt || design.prompt,
                  viewerError.lastRegenerateAll ?? true
                )
              }
              disabled={isGeneratingGeminiImage}
              className="px-4 py-2 rounded-xl bg-[#8D2434] hover:bg-[#6E1B28] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Photorealistic Generation</span>
            </button>
          )}
        </div>
      )}

      {/* 1B. THREE-PANEL COORDINATED FASHION PRESENTATION (LABELS OUTSIDE PHOTOGRAPHS) */}
      <div className="bg-white rounded-3xl border border-[#E4D9D1] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4EFEA] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D2434] block">
              REFERENCE-CONDITIONED MULTI-ANGLE PHOTOGRAPHS
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D2825]">
              {currentVar?.name || design.title} — Front, Back & Side Views
            </h3>
            <p className="text-xs text-[#7D726A]">
              {currentVar?.specs?.color || 'Custom Colour'} • {currentVar?.specs?.fabric || 'Silk'} •{' '}
              {currentVar?.specs?.neckline || 'Tailored Neckline'} •{' '}
              {currentVar?.specs?.sleeve || 'Tailored Sleeves'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCombinedPoster}
              disabled={isExportingPoster || !resolvedFrontUrl}
              className="px-4 py-2.5 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>
                {isExportingPoster ? 'Composing Poster...' : 'Download 3-View Fashion Poster'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setShowQuoteModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#8D2434] hover:bg-[#6E1B28] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Request Quotation / Order</span>
            </button>
          </div>
        </div>

        {/* 3 Coordinated Panels Grid — Labels are strictly outside the photograph frame */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              key: 'front' as const,
              label: '1. Front View',
              subtitle: 'Primary Full-Length Reference Photograph',
              url: resolvedFrontUrl
            },
            {
              key: 'back' as const,
              label: '2. Back View',
              subtitle: backSpecifiedByUser
                ? 'Back View (User-Specified Construction)'
                : 'Back View (Compatible Plausible Construction)',
              url: resolvedBackUrl
            },
            {
              key: 'side' as const,
              label: '3. Side View',
              subtitle: 'Side Profile Drape & Hemline',
              url: resolvedSideUrl
            }
          ].map((panel) => (
            <div
              key={panel.key}
              onClick={() => setActiveAngle(panel.key)}
              className={`group rounded-2xl border overflow-hidden bg-white transition-all cursor-pointer flex flex-col justify-between ${
                activeAngle === panel.key
                  ? 'border-[#8D2434] ring-2 ring-[#8D2434]/20 shadow-sm'
                  : 'border-[#ECE6DE] hover:border-[#2D2825]'
              }`}
            >
              {/* Header Bar Outside Photograph */}
              <div className="px-3 py-2 bg-[#FAF7F2] border-b border-[#ECE6DE] flex items-center justify-between">
                <span className="text-[11px] font-bold text-[#2D2825] uppercase tracking-wider">
                  {panel.label}
                </span>
                {activeAngle === panel.key && (
                  <span className="text-[10px] font-bold text-[#8D2434]">Selected</span>
                )}
              </div>

              {/* Unobstructed Full-Length Photograph */}
              <div className="relative aspect-[3/4] bg-[#F5EFEA] overflow-hidden flex items-center justify-center">
                {panel.url ? (
                  <img
                    src={panel.url}
                    alt={`${design.title} - ${panel.label}`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain bg-[#F5EFEA] transition-transform duration-300"
                  />
                ) : (
                  <div className="p-4 text-center space-y-2">
                    <AlertCircle className="w-6 h-6 text-[#8D2434] mx-auto" />
                    <p className="text-xs font-semibold text-[#2D2825]">
                      No Photograph Available
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Bar Outside Photograph */}
              <div className="p-3 bg-white border-t border-[#ECE6DE] flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-[10px] text-[#7D726A] truncate">{panel.subtitle}</div>
                </div>
                <button
                  type="button"
                  disabled={!panel.url}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSingleImage(panel.key, panel.url);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#2D2825] text-[#2D2825] hover:text-white border border-[#E4D9D1] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
                  title={`Download ${panel.label}`}
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. ACTIVE VIEW INSPECTION CARD (ALL LABELS & CONTROLS KEPT OUTSIDE THE PHOTOGRAPH) */}
      <div className="bg-white rounded-3xl border border-[#ECE6DE] overflow-hidden shadow-xs">
        {/* Top Metadata & Angle Selector Header Outside the Photograph */}
        <div className="p-4 bg-[#FAF7F2] border-b border-[#ECE6DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2825]">
                {design.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-[#FBECEF] text-[#8D2434] text-[10px] font-bold">
                {activeAngle === 'front' && 'Front View'}
                {activeAngle === 'back' && 'Back View'}
                {activeAngle === 'side' && 'Side Profile'}
                {activeAngle === 'detail' && 'Close-Up Fabric & Embroidery Detail'}
              </span>
            </div>
            {imageModelUsed && (
              <span className="text-[10px] text-[#7D726A] block mt-0.5">
                Model: {imageModelUsed} • Front-referenced multi-angle synthesis
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {(['front', 'back', 'side', 'detail'] as const).map((angle) => (
              <button
                key={angle}
                type="button"
                onClick={() => setActiveAngle(angle)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  activeAngle === angle
                    ? 'bg-[#2D2825] text-white shadow-2xs'
                    : 'bg-white text-[#2D2825] border border-[#ECE6DE] hover:border-[#8D2434]'
                }`}
              >
                {angle === 'detail'
                  ? 'Macro Detail'
                  : angle.charAt(0).toUpperCase() + angle.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Clean Unobstructed Photograph Container */}
        <div className="relative aspect-[3/4] max-h-[760px] w-full bg-[#F5EFEA] flex items-center justify-center overflow-hidden">
          {currentImage ? (
            <img
              src={currentImage}
              alt={`${design.title} (${activeAngle})`}
              referrerPolicy="no-referrer"
              className={`w-full h-full object-contain bg-[#F5EFEA] transition-opacity duration-300 ${
                isGeneratingGeminiImage ? 'opacity-25' : 'opacity-100'
              }`}
            />
          ) : (
            <div className="p-8 text-center max-w-sm space-y-3">
              <AlertCircle className="w-8 h-8 text-[#8D2434] mx-auto" />
              <p className="text-sm font-bold text-[#2D2825]">
                No generated photograph available for this view
              </p>
              <button
                type="button"
                onClick={() => handleGenerateGeminiImage(design.prompt, true)}
                disabled={isGeneratingGeminiImage}
                className="px-4 py-2 rounded-xl bg-[#8D2434] text-white text-xs font-bold cursor-pointer"
              >
                Generate Photorealistic Views
              </button>
            </div>
          )}

          {isGeneratingGeminiImage && (
            <div
              data-testid="design-viewer-skeleton"
              className="absolute inset-0 bg-[#FAF7F2]/95 z-20 p-6 flex flex-col items-center justify-center space-y-4"
            >
              <Loader2 className="w-8 h-8 text-[#8D2434] animate-spin" />
              <div className="w-full max-w-xs bg-white rounded-2xl border border-[#ECE6DE] p-4 shadow-sm space-y-2.5 text-center">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#8D2434] uppercase tracking-wider">
                  <span>Photorealistic Synthesis</span>
                  <span>Stage {viewerSynthesisStage || 1}/3</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#ECE6DE] overflow-hidden">
                  <div
                    className={`h-full bg-[#8D2434] rounded-full transition-all duration-300 ${
                      viewerSynthesisStage === 1
                        ? 'w-1/3'
                        : viewerSynthesisStage === 2
                        ? 'w-2/3'
                        : 'w-full'
                    }`}
                  />
                </div>
                <p className="text-xs font-medium text-[#2D2825]">
                  {imageGenerationStatus || 'Generating photorealistic dress photograph...'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Bar Outside the Photograph */}
        <div className="p-3.5 bg-[#FAF7F2] border-t border-[#ECE6DE] flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => setShowGeminiStudio(!showGeminiStudio)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-white hover:bg-[#FBECEF] text-[#8D2434] border border-[#ECE6DE] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span>
              {showGeminiStudio ? 'Close Prompt Refiner' : 'Refine Prompt / Regenerate Views'}
            </span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!currentImage || isGeneratingGeminiImage}
              onClick={() => handleDownloadSingleImage(activeAngle, currentImage)}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#2D2825] text-[#2D2825] hover:text-white border border-[#ECE6DE] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download {activeAngle.toUpperCase()} PNG</span>
            </button>
          </div>
        </div>
      </div>

      {/* PHOTOREALISTIC PROMPT REFINER DRAWER */}
      {showGeminiStudio && (
        <div className="bg-[#FAF7F2] rounded-2xl border border-[#8D2434]/30 p-4 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#8D2434] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-[#2D2825] uppercase tracking-wider">
                  Photorealistic Prompt Refiner & Multi-View Regenerator
                </h4>
                <p className="text-[11px] text-[#7D726A]">
                  Generates the front photograph first and uses it as a reference for back, side, and
                  macro detail views
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowGeminiStudio(false)}
              className="p-1 rounded-full text-[#7D726A] hover:text-[#2D2825] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#2D2825] block">
              Garment Prompt (Explicit details override defaults):
            </label>
            <textarea
              value={geminiPrompt}
              onChange={(e) => {
                setGeminiPrompt(e.target.value);
                if (viewerError) setViewerError(null);
              }}
              placeholder="e.g. An emerald-green velvet floor-length mermaid gown with a sweetheart neckline, full-length sheer sleeves, and gold floral embroidery only along the hem. No necklace, no belt, plain white studio background."
              rows={3}
              className="w-full text-xs bg-white rounded-xl border border-[#ECE6DE] focus:border-[#8D2434] focus:outline-none p-3 text-[#2D2825] placeholder:text-[#A89F91]"
            />
          </div>

          {detectPromptContradictions(geminiPrompt).hasContradictions && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <ShieldAlert className="w-4 h-4 text-amber-700" />
                <span>Contradictory Prompt Details Detected:</span>
              </div>
              <ul className="list-disc pl-4 text-[11px]">
                {detectPromptContradictions(geminiPrompt).conflicts.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleGenerateGeminiImage(geminiPrompt, true)}
              disabled={
                isGeneratingGeminiImage ||
                detectPromptContradictions(geminiPrompt).hasContradictions
              }
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#8D2434] hover:bg-[#781E2C] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isGeneratingGeminiImage ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Generating 4 Coordinated Photographs...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Regenerate All 4 Views (Front-Referenced)</span>
                </>
              )}
            </button>

            {activeAngle !== 'front' && resolvedFrontUrl && (
              <button
                type="button"
                onClick={() => handleGenerateGeminiImage(geminiPrompt, false)}
                disabled={
                  isGeneratingGeminiImage ||
                  detectPromptContradictions(geminiPrompt).hasContradictions
                }
                className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#2D2825] border border-[#ECE6DE] text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
              >
                Regenerate {activeAngle.toUpperCase()} View Only
              </button>
            )}
          </div>

          {imageGenerationStatus && !viewerError && (
            <div className="p-2.5 rounded-lg bg-white border border-[#ECE6DE] text-[11px] text-[#2D2825] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#416035] shrink-0" />
              <span>{imageGenerationStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. GARMENT SPECIFICATIONS & CONCEPT CARD */}
      <div className="bg-white rounded-2xl border border-[#ECE6DE] p-5 shadow-2xs space-y-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-lg text-[#2D2825] leading-snug">
              {currentVar?.name || design.title}
            </h3>
            <p className="text-xs text-[#7D726A] mt-1">
              {currentVar?.specs?.pattern || 'Clean Tailored Finish'} •{' '}
              {currentVar?.specs?.sleeve || 'Tailored Sleeves'} •{' '}
              {currentVar?.specs?.neckline || 'Tailored Neckline'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onOpenSpecSheet(currentVar)}
            className="px-3 py-1.5 rounded-xl bg-[#FAF7F2] hover:bg-[#ECE6DE] border border-[#ECE6DE] text-[11px] font-semibold text-[#2D2825] flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
            title="Export Master Tailor Pattern Spec Sheet"
          >
            <Download className="w-3.5 h-3.5 text-[#8D2434]" />
            <span>Spec Sheet</span>
          </button>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3F6F1] border border-[#DCE6D7] text-xs font-semibold text-[#416035]">
          <Tag className="w-3.5 h-3.5 text-[#416035]" />
          <span>
            Unverified Preliminary Estimate: ₹
            {(currentVar?.estimatedPriceRange?.min || 25000).toLocaleString('en-IN')} – ₹
            {(currentVar?.estimatedPriceRange?.max || 44000).toLocaleString('en-IN')}
          </span>
        </div>

        <div className="pt-3 border-t border-[#ECE6DE] space-y-2">
          <div className="text-xs font-semibold text-[#2D2825] uppercase tracking-wider">
            User Prompt & Resolved Concept
          </div>
          <p className="text-xs text-[#7D726A] leading-relaxed font-light">
            {design.prompt || currentVar?.tagline}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#7D726A] pt-1">
            <Calendar className="w-3.5 h-3.5 text-[#8D2434]" />
            <span>
              Occasion: {currentVar?.specs?.occasion || 'Bespoke Couture'} • Est. ~
              {currentVar?.estimatedCraftTimeDays || 14} days craft time
            </span>
          </div>
        </div>

        {/* Bespoke Specifications Outside the Photographs */}
        <div className="pt-3 border-t border-[#ECE6DE]">
          <div className="text-xs font-semibold text-[#2D2825] uppercase tracking-wider mb-2.5">
            Resolved Garment Specifications
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">Primary Textile</span>
              <span className="font-medium text-[#2D2825]">
                {currentVar?.specs?.fabric || currentVar?.fabricDetails?.primary || 'Silk'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">Colour & Surface Detail</span>
              <span className="font-medium text-[#2D2825]">
                {currentVar?.specs?.color || 'Custom Shade'} •{' '}
                {currentVar?.specs?.pattern || 'Clean Finish'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">
                {isMenDesign ? 'Collar / Lapel' : 'Neckline'} & Sleeves
              </span>
              <span className="font-medium text-[#2D2825]">
                {currentVar?.specs?.neckline || 'Sweetheart'} •{' '}
                {currentVar?.specs?.sleeve || 'Full Sleeves'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">
                Back View Construction ({backSpecifiedByUser ? 'User Specified' : 'Plausible Compatible Design'})
              </span>
              <span className="font-medium text-[#2D2825]">{backDesignDescription}</span>
            </div>
          </div>
        </div>

        {/* AI Visualization Disclosure */}
        <div
          data-testid="ai-visualization-disclosure"
          className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E4D9D1] flex items-start gap-2.5 text-[11px] text-[#5C534B] leading-relaxed"
        >
          <Info className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
          <div>
            <strong className="text-[#2D2825]">AI Visualization Disclosure:</strong> These images are
            AI-generated photographic visualizations of a proposed garment based on your prompt.
            While back, side, and close-up views are conditioned on the front reference photograph,
            minor cross-angle variations may occur. These visualizations are not photographs of a
            physically manufactured product, nor do they guarantee exact tailoring feasibility or a
            verified final price until confirmed by a verified designer quotation.
          </div>
        </div>
      </div>

      {/* 3B. ESTIMATED FABRIC YARDAGE & CONSUMPTION CALCULATOR */}
      <div
        id="fabric-yardage-calculator-card"
        className="bg-white rounded-2xl border border-[#ECE6DE] p-5 shadow-2xs space-y-4"
      >
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#F4EFEA]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FBECEF] border border-[#F2D1D7] flex items-center justify-center text-[#8D2434] shrink-0">
              <Ruler className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-serif text-base font-bold text-[#2D2825]">
                  Estimated Fabric Yardage
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] text-[10px] font-mono font-semibold text-[#8D2434]">
                  Auto-Calibrated
                </span>
              </div>
              <p className="text-[11px] text-[#7D726A] font-light">
                Calculated for{' '}
                <strong className="font-medium text-[#2D2825]">
                  {yardageCalculation.categoryLabel}
                </strong>{' '}
                & your measurements
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCustomMeasureCalibrator(!showCustomMeasureCalibrator)}
            className="px-2.5 py-1 rounded-full bg-[#FAF7F2] hover:bg-[#ECE6DE] text-[#2D2825] border border-[#ECE6DE] text-[10px] font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
          >
            <Sliders className="w-3 h-3 text-[#8D2434]" />
            <span>{showCustomMeasureCalibrator ? 'Hide Fit Inputs' : 'Adjust Fit'}</span>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5 bg-gradient-to-r from-[#2D2825] via-[#3A332F] to-[#2D2825] text-white p-3.5 rounded-2xl shadow-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-white/70 block">
              Primary Fabric
            </span>
            <div className="font-serif text-xl font-bold text-[#FAF7F2] mt-0.5">
              {yardageCalculation.totalYards}{' '}
              <span className="text-xs font-normal text-[#E8C5CC]">yds</span>
            </div>
            <span className="text-[10px] text-white/70 font-mono">
              ≈ {yardageCalculation.totalMeters} meters
            </span>
          </div>

          <div className="border-x border-white/15 px-2.5">
            <span className="text-[9px] uppercase tracking-wider text-white/70 block">
              Lining / Canvas
            </span>
            <div className="font-serif text-xl font-bold text-[#FAF7F2] mt-0.5">
              {yardageCalculation.liningYards}{' '}
              <span className="text-xs font-normal text-[#E8C5CC]">yds</span>
            </div>
            <span className="text-[10px] text-white/70">
              {isMenDesign ? 'Bemberg & Horsehair' : 'Pure Cotton Mulmul'}
            </span>
          </div>

          <div className="pl-1">
            <span className="text-[9px] uppercase tracking-wider text-white/70 block">
              Bolt Width
            </span>
            <div className="font-serif text-xl font-bold text-[#FAF7F2] mt-0.5">
              {boltWidthInches}" <span className="text-xs font-normal text-[#E8C5CC]">in</span>
            </div>
            <span className="text-[10px] text-white/70">
              {boltWidthInches === 44 ? 'Handloom Loom' : 'Wide Mill Bolt'}
            </span>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-[#2D2825]">Loom Bolt Width:</span>
            <div className="inline-flex rounded-full bg-[#FAF7F2] p-0.5 border border-[#ECE6DE]">
              <button
                type="button"
                onClick={() => setBoltWidthInches(44)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  boltWidthInches === 44
                    ? 'bg-[#2D2825] text-white shadow-2xs'
                    : 'text-[#7D726A] hover:text-[#2D2825]'
                }`}
              >
                44" Handloom Silk
              </button>
              <button
                type="button"
                onClick={() => setBoltWidthInches(58)}
                className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                  boltWidthInches === 58
                    ? 'bg-[#2D2825] text-white shadow-2xs'
                    : 'text-[#7D726A] hover:text-[#2D2825]'
                }`}
              >
                58" Wide Couture
              </button>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#2D2825] block">
              {isMenDesign ? 'Ensemble Completeness:' : 'Silhouette Flare & Train Volume:'}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {(
                [
                  { id: 'standard', label: isMenDesign ? '2-Piece Suit' : 'Standard Cut' },
                  { id: 'royal_kali', label: isMenDesign ? '+ Waistcoat' : 'Full Flare' },
                  { id: 'cathedral_train', label: isMenDesign ? '+ Stole' : 'Sweep Train' }
                ] as const
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setFlareProfile(opt.id)}
                  className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold border transition-all cursor-pointer ${
                    flareProfile === opt.id
                      ? 'bg-[#FBECEF] text-[#8D2434] border-[#8D2434]'
                      : 'bg-[#FAF7F2] text-[#7D726A] border-[#ECE6DE] hover:border-[#2D2825]'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {showCustomMeasureCalibrator && (
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#ECE6DE] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-bold text-[#8D2434]">
                Customer Measurement Calibration (Inches)
              </span>
              {onOpenMeasurements && (
                <button
                  type="button"
                  onClick={onOpenMeasurements}
                  className="text-[10px] font-semibold text-[#2D2825] underline hover:text-[#8D2434] cursor-pointer"
                >
                  Open Full 14-Point Sheet
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#7D726A]">{isMenDesign ? 'Chest' : 'Bust'}:</span>
                  <span className="font-bold text-[#2D2825]">{calcBustChestIn}"</span>
                </div>
                <input
                  type="range"
                  min={28}
                  max={54}
                  value={calcBustChestIn}
                  onChange={(e) => setCalcBustChestIn(Number(e.target.value))}
                  className="w-full accent-[#8D2434] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#7D726A]">Waist:</span>
                  <span className="font-bold text-[#2D2825]">{calcWaistIn}"</span>
                </div>
                <input
                  type="range"
                  min={22}
                  max={48}
                  value={calcWaistIn}
                  onChange={(e) => setCalcWaistIn(Number(e.target.value))}
                  className="w-full accent-[#8D2434] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#7D726A]">Height:</span>
                  <span className="font-bold text-[#2D2825]">
                    {calcHeightIn}" ({Math.floor(calcHeightIn / 12)}'{calcHeightIn % 12}")
                  </span>
                </div>
                <input
                  type="range"
                  min={58}
                  max={78}
                  value={calcHeightIn}
                  onChange={(e) => setCalcHeightIn(Number(e.target.value))}
                  className="w-full accent-[#8D2434] cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-[#7D726A]">
                    {isMenDesign ? 'Coat Length' : 'Skirt/Hem Length'}:
                  </span>
                  <span className="font-bold text-[#2D2825]">{calcGarmentLengthIn}"</span>
                </div>
                <input
                  type="range"
                  min={isMenDesign ? 26 : 34}
                  max={isMenDesign ? 46 : 52}
                  value={calcGarmentLengthIn}
                  onChange={(e) => setCalcGarmentLengthIn(Number(e.target.value))}
                  className="w-full accent-[#8D2434] cursor-pointer"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2 pt-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-[#7D726A]">
            Pattern Cutting Breakdown
          </div>
          <div className="space-y-2">
            {yardageCalculation.items.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] flex items-center justify-between gap-2 text-xs"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[#2D2825] truncate">{item.label}</div>
                  <div className="text-[10px] text-[#7D726A] font-light">{item.note}</div>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-[#8D2434] text-xs block">
                    {item.yards} yds
                  </span>
                  <span className="text-[9px] text-[#7D726A] font-mono">
                    {(item.yards * 0.9144).toFixed(1)} m
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          id="attach-yardage-to-quote-btn"
          type="button"
          onClick={() => {
            const breakdownSummary = `Estimated Fabric Yardage: ${yardageCalculation.totalYards} yds (${yardageCalculation.totalMeters}m) on ${boltWidthInches}" bolt + ${yardageCalculation.liningYards} yds lining [Calibrated for ${
              isMenDesign ? 'Chest' : 'Bust'
            } ${calcBustChestIn}", Waist ${calcWaistIn}", Height ${calcHeightIn}", Length ${calcGarmentLengthIn}"].`;
            setSpecificInstructions((prev) =>
              prev.includes('Estimated Fabric Yardage:')
                ? prev
                : `${prev.trim()} ${breakdownSummary}`
            );
            setShowQuoteModal(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#FBECEF] border border-[#ECE6DE] hover:border-[#8D2434] text-xs font-semibold text-[#8D2434] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>
            Include {yardageCalculation.totalYards} Yds Breakdown in Tailor Quote Request
          </span>
        </button>
      </div>

      {/* 4. PRIMARY CTA + SECONDARY ACTION */}
      <div className="space-y-2.5">
        <button
          onClick={() => setShowQuoteModal(true)}
          className="w-full h-12 rounded-xl bg-[#8D2434] hover:bg-[#781E2C] active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Scissors className="w-4 h-4 text-white" />
          <span>Request Atelier Quotations</span>
        </button>

        <button
          onClick={handleShare}
          className="w-full h-11 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#ECE6DE] text-[#2D2825] text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
        >
          <Share2 className="w-3.5 h-3.5 text-[#7D726A]" />
          <span>Share Concept with Stylist</span>
        </button>
      </div>

      {showShareToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#2D2825] text-white px-4 py-2 rounded-full text-xs shadow-xl flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {/* QUOTATION & CUSTOM DRESS ORDER MODAL */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[28px] p-6 space-y-4 shadow-2xl border border-[#ECE6DE] my-auto">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D2434] block">
                  CUSTOM DRESS ORDERING
                </span>
                <h3 className="font-serif text-lg font-bold text-[#2D2825]">
                  Submit 3-View Design & Request Quote
                </h3>
              </div>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5 cursor-pointer"
              >
                <X className="w-4 h-4 text-[#7D726A]" />
              </button>
            </div>

            <form onSubmit={handleBroadcastQuote} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[11px] font-bold text-[#2D2825] mb-1">
                  1. Select Verified Designer / Master Tailor
                </label>
                <select
                  value={selectedDesignerForQuote}
                  onChange={(e) => setSelectedDesignerForQuote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ECE6DE] bg-[#FAF7F2] text-xs font-semibold text-[#2D2825]"
                >
                  {tailors.length > 0 ? (
                    tailors.map((t) => (
                      <option key={t.id} value={`${t.name} (${t.location})`}>
                        {t.name} ({t.location} • {t.rating}★)
                      </option>
                    ))
                  ) : (
                    <>
                      <option value="Ustad Rafiq Ahmed (Royal Heritage Atelier)">
                        Ustad Rafiq Ahmed — Royal Heritage Atelier (Old Delhi • 4.9★)
                      </option>
                      <option value="Anamika Khanna & Zari Studio (Mumbai)">
                        Anamika Khanna & Zari Studio (Mumbai • 4.9★)
                      </option>
                    </>
                  )}
                  <option value="Broadcast to All Verified Designers">
                    Broadcast to All Approved Platform Designers (Compare Bids)
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2D2825] mb-1">
                  2. Fit & Sizing Method
                </label>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <button
                    type="button"
                    onClick={() => setSizingMode('measurements')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                      sizingMode === 'measurements'
                        ? 'bg-[#2D2825] text-white border-[#2D2825]'
                        : 'bg-[#FAF7F2] text-[#7D726A] border-[#ECE6DE]'
                    }`}
                  >
                    14-Point Measurements
                  </button>
                  <button
                    type="button"
                    onClick={() => setSizingMode('standard')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold cursor-pointer ${
                      sizingMode === 'standard'
                        ? 'bg-[#2D2825] text-white border-[#2D2825]'
                        : 'bg-[#FAF7F2] text-[#7D726A] border-[#ECE6DE]'
                    }`}
                  >
                    Standard Size (XS–XXL)
                  </button>
                </div>

                {sizingMode === 'standard' ? (
                  <div className="flex items-center gap-1.5">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setSelectedStandardSize(sz)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
                          selectedStandardSize === sz
                            ? 'bg-[#8D2434] text-white border-[#8D2434]'
                            : 'bg-white text-[#2D2825] border-[#ECE6DE]'
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] flex items-center justify-between text-[11px]">
                    <span className="text-[#5A4638]">
                      Bust/Chest: <strong>{calcBustChestIn}"</strong> • Waist:{' '}
                      <strong>{calcWaistIn}"</strong> • Height: <strong>{calcHeightIn}"</strong>
                    </span>
                    {onOpenMeasurements && (
                      <button
                        type="button"
                        onClick={onOpenMeasurements}
                        className="text-[#8D2434] font-bold underline cursor-pointer"
                      >
                        Edit Sheet
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2D2825] mb-1">
                    3. Preferred Budget (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D726A] font-bold">
                      ₹
                    </span>
                    <input
                      type="number"
                      value={targetBudget}
                      onChange={(e) => setTargetBudget(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#ECE6DE] text-xs font-bold tabular-nums"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#2D2825] mb-1">
                    Required By Date
                  </label>
                  <input
                    type="date"
                    value={neededByDate}
                    onChange={(e) => setNeededByDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[#ECE6DE] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#2D2825] mb-1">
                  4. Customization & Embroidery Instructions
                </label>
                <textarea
                  rows={3}
                  value={specificInstructions}
                  onChange={(e) => setSpecificInstructions(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#ECE6DE] text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#8D2434] text-white font-bold text-xs uppercase tracking-wider shadow-md hover:bg-[#781E2C] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4 text-white" />
                <span>Send Customization Request & Start Negotiation</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
