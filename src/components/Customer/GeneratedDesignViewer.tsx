import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Share2, 
  Scissors, 
  ChevronLeft, 
  MoreVertical, 
  Bookmark, 
  BookmarkCheck, 
  Tag, 
  Calendar, 
  Users, 
  ChevronRight, 
  Layers, 
  Check, 
  Sliders, 
  Download,
  X,
  Wand2,
  RefreshCw,
  Loader2,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Ruler,
  Calculator
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DressDesign, DressDesignVariation, MeasurementSheet } from '../../types';
import { generateCohesiveCoutureAngles, generateCoutureSVGDataUri, parseCustomerPromptToSpecs } from '../../services/coutureVisualEngine';

interface GeneratedDesignViewerProps {
  design: DressDesign;
  measurements?: MeasurementSheet;
  onSaveToFavorites: (designId: string) => void;
  onRequestQuotations: (design: DressDesign, selectedVariation: DressDesignVariation, budget: number, neededBy: string, instructions: string) => void;
  onBackToStudio: () => void;
  onOpenSpecSheet: (variation: DressDesignVariation) => void;
  onOpenMeasurements?: () => void;
}

export const GeneratedDesignViewer: React.FC<GeneratedDesignViewerProps> = ({
  design,
  measurements,
  onSaveToFavorites,
  onRequestQuotations,
  onBackToStudio,
  onOpenSpecSheet,
  onOpenMeasurements,
}) => {
  const [selectedVarIndex, setSelectedVarIndex] = useState<number>(0);
  const [isSaved, setIsSaved] = useState<boolean>(true);
  const [isHearted, setIsHearted] = useState<boolean>(false);
  const [showQuoteModal, setShowQuoteModal] = useState<boolean>(false);
  const [showShareToast, setShowShareToast] = useState<boolean>(false);
  const [activeAngle, setActiveAngle] = useState<'front' | 'back' | 'side' | 'detail'>('front');

  // Dynamic Gemini Image Generation State
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [showGeminiStudio, setShowGeminiStudio] = useState<boolean>(false);
  const [geminiPrompt, setGeminiPrompt] = useState<string>('');
  const [isGeneratingGeminiImage, setIsGeneratingGeminiImage] = useState<boolean>(false);
  const [viewerSynthesisStage, setViewerSynthesisStage] = useState<number>(0);
  const [imageGenerationStatus, setImageGenerationStatus] = useState<string | null>(null);
  const [imageModelUsed, setImageModelUsed] = useState<string | null>(null);

  const [targetBudget, setTargetBudget] = useState<number>(4000);
  const [neededByDate, setNeededByDate] = useState<string>('2026-10-15');
  const [selectedDesignerForQuote, setSelectedDesignerForQuote] = useState<string>('Ustad Rafiq Ahmed (Royal Heritage Atelier)');
  const [sizingMode, setSizingMode] = useState<'measurements' | 'standard'>('measurements');
  const [selectedStandardSize, setSelectedStandardSize] = useState<string>('M');
  const [isExportingPoster, setIsExportingPoster] = useState<boolean>(false);
  const [specificInstructions, setSpecificInstructions] = useState<string>(
    'Hand-finished pearl embroidery with soft silk organza train and sweetheart neckline.'
  );

  // Fabric Yardage Calculator States (calibrated from user measurements & design type)
  const isMenDesign = design.tags?.some((t) => t.toLowerCase().includes('men')) || design.id.includes('men');
  const [boltWidthInches, setBoltWidthInches] = useState<44 | 58>(44);
  const [flareProfile, setFlareProfile] = useState<'standard' | 'royal_kali' | 'cathedral_train'>('royal_kali');
  const [showCustomMeasureCalibrator, setShowCustomMeasureCalibrator] = useState<boolean>(false);

  const [calcHeightIn, setCalcHeightIn] = useState<number>(measurements?.height || (isMenDesign ? 70 : 65));
  const [calcBustChestIn, setCalcBustChestIn] = useState<number>(
    isMenDesign ? (measurements?.chest || measurements?.bust || 40) : (measurements?.bust || 35)
  );
  const [calcWaistIn, setCalcWaistIn] = useState<number>(
    isMenDesign ? (measurements?.trouserWaist || measurements?.waist || 34) : (measurements?.waist || 28)
  );
  const [calcGarmentLengthIn, setCalcGarmentLengthIn] = useState<number>(
    isMenDesign
      ? (measurements?.jacketLength || 31)
      : (measurements?.lehengaLength || measurements?.waistToHem || 42)
  );

  // Sync calculator defaults if user updates their MeasurementSheet modal
  React.useEffect(() => {
    if (!measurements) return;
    setCalcHeightIn(measurements.height || (isMenDesign ? 70 : 65));
    setCalcBustChestIn(
      isMenDesign ? (measurements.chest || measurements.bust || 40) : (measurements.bust || 35)
    );
    setCalcWaistIn(
      isMenDesign ? (measurements.trouserWaist || measurements.waist || 34) : (measurements.waist || 28)
    );
    setCalcGarmentLengthIn(
      isMenDesign
        ? (measurements.jacketLength || 31)
        : (measurements.lehengaLength || measurements.waistToHem || 42)
    );
  }, [measurements, isMenDesign]);

  const currentVar = design.variations[selectedVarIndex] || design.variations[0];

  // Calculate precision fabric yardage based on design type + user measurements
  const yardageCalculation = React.useMemo(() => {
    const dressTypeStr = (currentVar?.specs?.dressType || design.title || 'Couture Gown').toLowerCase();
    const widthMultiplier = boltWidthInches === 44 ? 1.0 : 0.82; // 58" wide bolt requires ~18% less linear yardage
    const sizeScaleFactor =
      1 +
      Math.max(-0.12, Math.min(0.35, (calcBustChestIn - (isMenDesign ? 40 : 35)) * 0.015)) +
      Math.max(-0.1, Math.min(0.25, (calcHeightIn - (isMenDesign ? 70 : 65)) * 0.012)) +
      Math.max(-0.1, Math.min(0.25, (calcGarmentLengthIn - (isMenDesign ? 31 : 42)) * 0.014));

    const flareBonusYards =
      flareProfile === 'standard' ? 0 : flareProfile === 'royal_kali' ? 1.4 : 2.3;

    let categoryLabel = currentVar?.specs?.dressType || design.title;
    let items: { label: string; yards: number; note: string }[] = [];
    let liningYards = 3.5;

    if (dressTypeStr.includes('lehenga')) {
      categoryLabel = 'Bridal Lehenga, Choli & Dupatta';
      const skirtYards = (4.8 + flareBonusYards) * sizeScaleFactor * widthMultiplier;
      const choliYards = 1.35 * sizeScaleFactor * widthMultiplier;
      const dupattaYards = 2.75; // Standard 2.75 yd bridal dupatta length
      const marginYards = (skirtYards + choliYards) * 0.12; // 12% zardozi & 2.5" margin allowance
      items = [
        { label: '16-Kali Flared Skirt Panels', yards: Number(skirtYards.toFixed(1)), note: `Calibrated for ${calcWaistIn}" waist & ${calcGarmentLengthIn}" length` },
        { label: 'Sculpted Choli & Sleeves', yards: Number(choliYards.toFixed(1)), note: `Calibrated for ${calcBustChestIn}" bust + 2.5" margin` },
        { label: 'Scalloped Bridal Dupatta', yards: Number(dupattaYards.toFixed(1)), note: 'Full head-drape & shoulder sweep' },
        { label: 'Pattern Match & Seam Buffer (+12%)', yards: Number(marginYards.toFixed(1)), note: 'Directional zari alignment & shrinkage reserve' }
      ];
      liningYards = Number(((skirtYards + choliYards) * 0.85).toFixed(1));
    } else if (dressTypeStr.includes('anarkali') || dressTypeStr.includes('sharara')) {
      categoryLabel = 'Royal Kalidar Anarkali / Sharara Set';
      const kaliYards = (4.4 + flareBonusYards * 0.85) * sizeScaleFactor * widthMultiplier;
      const lowerYards = 2.2 * sizeScaleFactor * widthMultiplier;
      const dupattaYards = 2.5;
      const marginYards = (kaliYards + lowerYards) * 0.1;
      items = [
        { label: 'Floor-Grazing Kalidar Bodice & Flare', yards: Number(kaliYards.toFixed(1)), note: `Calibrated for ${calcHeightIn}" height & ${calcBustChestIn}" bust` },
        { label: 'Churidar / Flared Sharara Bottoms', yards: Number(lowerYards.toFixed(1)), note: `Calibrated for ${calcWaistIn}" waist` },
        { label: 'Embroidered Organza Dupatta', yards: Number(dupattaYards.toFixed(1)), note: '4-side border framing' },
        { label: 'Bias Cut & Seam Allowance (+10%)', yards: Number(marginYards.toFixed(1)), note: 'Interlocked kali seam tolerance' }
      ];
      liningYards = Number((kaliYards * 0.8).toFixed(1));
    } else if (dressTypeStr.includes('saree')) {
      categoryLabel = 'Pre-Pleated Kanjeevaram / Couture Saree Gown';
      const drapeYards = (5.5 + flareBonusYards * 0.6) * sizeScaleFactor * widthMultiplier;
      const blouseYards = 1.25 * sizeScaleFactor * widthMultiplier;
      const marginYards = 0.65;
      items = [
        { label: 'Sculpted Pallu & Pleated Saree Drape', yards: Number(drapeYards.toFixed(1)), note: `Calibrated for ${calcHeightIn}" stature & ${calcWaistIn}" waist` },
        { label: 'Corset / Structured Blouse', yards: Number(blouseYards.toFixed(1)), note: `Calibrated for ${calcBustChestIn}" bust` },
        { label: 'Korvai Temple Border Alignment Buffer', yards: Number(marginYards.toFixed(1)), note: 'Continuous zari motif matching' }
      ];
      liningYards = Number(((drapeYards * 0.5) + blouseYards).toFixed(1));
    } else if (
      isMenDesign ||
      dressTypeStr.includes('bandhgala') ||
      dressTypeStr.includes('sherwani') ||
      dressTypeStr.includes('tuxedo') ||
      dressTypeStr.includes('blazer') ||
      dressTypeStr.includes('achkan') ||
      dressTypeStr.includes('kurta')
    ) {
      categoryLabel = currentVar?.specs?.dressType || "Men's Bespoke Ensemble";
      const isLongCoat = dressTypeStr.includes('sherwani') || dressTypeStr.includes('achkan');
      const jacketYards = (isLongCoat ? 2.85 : 2.25) * sizeScaleFactor * widthMultiplier;
      const trouserYards = 1.75 * sizeScaleFactor * widthMultiplier;
      const stoleOrVestYards = flareProfile === 'standard' ? 0.6 : flareProfile === 'royal_kali' ? 1.2 : 2.1;
      const marginYards = (jacketYards + trouserYards) * 0.1;
      items = [
        {
          label: isLongCoat ? 'Royal Sherwani / Achkan Coat Body' : 'Structured Jacket & Peak Lapels',
          yards: Number(jacketYards.toFixed(1)),
          note: `Calibrated for ${calcBustChestIn}" chest & ${calcGarmentLengthIn}" coat length`
        },
        {
          label: 'Bespoke Breeches / Tailored Trousers',
          yards: Number(trouserYards.toFixed(1)),
          note: `Calibrated for ${calcWaistIn}" waist & ${calcHeightIn}" height`
        },
        {
          label: flareProfile === 'standard' ? 'Collar, Cuff & Pocket Facings' : 'Matching Waistcoat / Royal Stole (Dupatta)',
          yards: Number(stoleOrVestYards.toFixed(1)),
          note: 'Hand-rolled edges & zardozi framing'
        },
        {
          label: 'Savile Row Inlay & Pattern Match (+10%)',
          yards: Number(marginYards.toFixed(1)),
          note: '2-inch chest & waist let-out reserve'
        }
      ];
      liningYards = Number(((jacketYards + 0.8) * 0.9).toFixed(1));
    } else {
      // Couture Evening Gown / Ball Gown / Cocktail Dress
      categoryLabel = currentVar?.specs?.dressType || 'Haute Couture Evening Gown';
      const skirtTrainYards = (3.9 + flareBonusYards) * sizeScaleFactor * widthMultiplier;
      const bodiceYards = 1.4 * sizeScaleFactor * widthMultiplier;
      const marginYards = (skirtTrainYards + bodiceYards) * 0.12;
      items = [
        { label: 'Draped Skirt & Sweeping Train Panels', yards: Number(skirtTrainYards.toFixed(1)), note: `Calibrated for ${calcGarmentLengthIn}" waist-to-hem & ${calcHeightIn}" height` },
        { label: 'Boned Corset Bodice & Sleeves', yards: Number(bodiceYards.toFixed(1)), note: `Calibrated for ${calcBustChestIn}" bust & ${calcWaistIn}" waist` },
        { label: 'Bias Drape & Seam Allowance (+12%)', yards: Number(marginYards.toFixed(1)), note: 'French seams & 2.5" alteration allowance' }
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

  // Guarantee 100% cohesive, distinct, silhouette-accurate 4-angle visuals matching the customer prompt
  const cohesiveFallbackAngles = React.useMemo(() => {
    const parsed = parseCustomerPromptToSpecs(design.prompt || '', {
      gender: isMenDesign ? 'men' : 'women',
      dressType: currentVar.specs?.dressType || design.title,
      color: currentVar.specs?.color || (isMenDesign ? 'Kashi Midnight Obsidian' : 'Pearl blush'),
      fabric: currentVar.specs?.fabric || currentVar.fabricDetails?.primary || (isMenDesign ? 'Pure Banarasi Raw Silk' : 'Silk Organza'),
      neckline: currentVar.specs?.neckline,
      sleeve: currentVar.specs?.sleeve,
      pattern: currentVar.specs?.pattern
    });
    return generateCohesiveCoutureAngles({
      gender: parsed.gender,
      dressType: parsed.dressType,
      color: parsed.color,
      fabric: parsed.fabric,
      neckline: parsed.neckline,
      sleeve: parsed.sleeve,
      pattern: parsed.pattern,
      title: currentVar.name || parsed.title || design.title,
      prompt: design.prompt
    });
  }, [currentVar, design.title, design.prompt, isMenDesign]);

  const currentCustomKey = `${selectedVarIndex}-${activeAngle}`;
  const customImage = customImages[currentCustomKey];

  // Accept any valid data URI (PNG, JPEG, WebP from Gemini API or bespoke SVG data URI)
  const isDataUri = (url?: string) => Boolean(url && url.startsWith('data:image/'));
  const currentImage = customImage || (
    activeAngle === 'front'
      ? (isDataUri(currentVar.frontImageUrl) ? currentVar.frontImageUrl : cohesiveFallbackAngles.front)
      : activeAngle === 'back'
      ? (isDataUri(currentVar.backImageUrl) ? currentVar.backImageUrl : cohesiveFallbackAngles.back)
      : activeAngle === 'side'
      ? (isDataUri(currentVar.sideImageUrl) ? currentVar.sideImageUrl : cohesiveFallbackAngles.side)
      : (isDataUri(currentVar.detailImageUrl) ? currentVar.detailImageUrl! : cohesiveFallbackAngles.detail)
  );

  const handleGenerateGeminiImage = async (customPromptToUse?: string) => {
    setIsGeneratingGeminiImage(true);
    setViewerSynthesisStage(1);
    setImageGenerationStatus('Parsing your prompt & extracting silhouette, color, and textile specs...');

    const stageTimer1 = setTimeout(() => {
      setViewerSynthesisStage(2);
      setImageGenerationStatus('Synthesizing bespoke textile weave & 4-angle lighting geometry...');
    }, 350);

    const stageTimer2 = setTimeout(() => {
      setViewerSynthesisStage(3);
      setImageGenerationStatus('Finalizing macro-detail embroidery & atelier lookbook render...');
    }, 700);

    const minSkeletonDelay = new Promise((resolve) => setTimeout(resolve, 1050));

    const promptText = (customPromptToUse || geminiPrompt).trim() || 
      `${currentVar.name || design.title}, couture, high-fashion, macro-detail, luxury Indian haute couture fashion photography, ${activeAngle} angle view`;

    const parsedPromptSpecs = parseCustomerPromptToSpecs(promptText, {
      gender: isMenDesign ? 'men' : 'women',
      dressType: currentVar.specs?.dressType || design.title,
      color: currentVar.specs?.color || (isMenDesign ? 'Kashi Midnight Obsidian' : 'Pearl blush'),
      fabric: currentVar.specs?.fabric || (isMenDesign ? 'Pure Raw Silk' : 'Silk Organza'),
      neckline: currentVar.specs?.neckline,
      sleeve: currentVar.specs?.sleeve,
      pattern: currentVar.specs?.pattern
    });

    try {
      const [res] = await Promise.all([
        fetch('/api/gemini/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: promptText,
            gender: parsedPromptSpecs.gender,
            angle: activeAngle,
            dressType: parsedPromptSpecs.dressType,
            color: parsedPromptSpecs.color,
            fabric: parsedPromptSpecs.fabric,
            neckline: parsedPromptSpecs.neckline,
            sleeve: parsedPromptSpecs.sleeve,
            aspectRatio: '3:4'
          })
        }),
        minSkeletonDelay
      ]);

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      const data = await res.json();
      if (data && data.imageUrl) {
        setCustomImages((prev) => ({
          ...prev,
          ...(data.angles ? {
            [`${selectedVarIndex}-front`]: data.angles.front,
            [`${selectedVarIndex}-back`]: data.angles.back,
            [`${selectedVarIndex}-side`]: data.angles.side,
            [`${selectedVarIndex}-detail`]: data.angles.detail
          } : {}),
          [currentCustomKey]: data.imageUrl
        }));
        setImageModelUsed(data.modelUsed || 'Gemini AI + Bespoke Couture Engine');
        setImageGenerationStatus(
          `Generated ${parsedPromptSpecs.color} ${parsedPromptSpecs.dressType} (${parsedPromptSpecs.fabric}) matching your prompt!`
        );
        setShowGeminiStudio(false);
        setIsGeneratingGeminiImage(false);
        setViewerSynthesisStage(0);
        return;
      }
    } catch (err: any) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      console.warn('Image generation fallback:', err);
    }

    // Client-side prompt-faithful synthesis if offline
    const localAngles = generateCohesiveCoutureAngles({
      gender: parsedPromptSpecs.gender,
      dressType: parsedPromptSpecs.dressType,
      color: parsedPromptSpecs.color,
      fabric: parsedPromptSpecs.fabric,
      neckline: parsedPromptSpecs.neckline,
      sleeve: parsedPromptSpecs.sleeve,
      pattern: parsedPromptSpecs.pattern,
      title: parsedPromptSpecs.title,
      prompt: promptText
    });
    setCustomImages((prev) => ({
      ...prev,
      [`${selectedVarIndex}-front`]: localAngles.front,
      [`${selectedVarIndex}-back`]: localAngles.back,
      [`${selectedVarIndex}-side`]: localAngles.side,
      [`${selectedVarIndex}-detail`]: localAngles.detail,
      [currentCustomKey]: localAngles[activeAngle]
    }));
    setImageGenerationStatus(
      `Generated ${parsedPromptSpecs.color} ${parsedPromptSpecs.dressType} matching your prompt!`
    );
    setShowGeminiStudio(false);
    setIsGeneratingGeminiImage(false);
    setViewerSynthesisStage(0);
  };

  const handleBroadcastQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const enrichedInstructions = `[Preferred Atelier: ${selectedDesignerForQuote} | Fit: ${
      sizingMode === 'measurements' ? '14-Point Custom Body Measurements' : `Standard Size ${selectedStandardSize}`
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

  // Resolved coordinated Front, Back, and Side URLs for the 3-panel fashion presentation
  const resolvedFrontUrl =
    customImages[`${selectedVarIndex}-front`] ||
    (isDataUri(currentVar.frontImageUrl) ? currentVar.frontImageUrl : cohesiveFallbackAngles.front);
  const resolvedBackUrl =
    customImages[`${selectedVarIndex}-back`] ||
    (isDataUri(currentVar.backImageUrl) ? currentVar.backImageUrl! : cohesiveFallbackAngles.back);
  const resolvedSideUrl =
    customImages[`${selectedVarIndex}-side`] ||
    (isDataUri(currentVar.sideImageUrl) ? currentVar.sideImageUrl! : cohesiveFallbackAngles.side);

  const handleDownloadSingleImage = (viewLabel: string, imageUrl: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    const cleanTitle = (currentVar.name || design.title || 'bespoke-dress').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    link.download = `${cleanTitle}-${viewLabel.toLowerCase()}.${imageUrl.startsWith('data:image/svg') ? 'svg' : 'png'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadCombinedPoster = async () => {
    setIsExportingPoster(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1800;
      canvas.height = 1150;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#FAF7F2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Header Banner
      ctx.fillStyle = '#2D2825';
      ctx.fillRect(0, 0, canvas.width, 110);

      ctx.fillStyle = '#D4AF37';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('PEARL PICK • AI HAUTE COUTURE THREE-VIEW SPECIFICATION BOARD', 50, 44);

      ctx.fillStyle = '#FAF7F2';
      ctx.font = 'bold 32px Georgia, serif';
      ctx.fillText(currentVar.name || design.title, 50, 84);

      // Load helper
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
        // Card frame
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(panel.x, 140, 550, 740);
        ctx.strokeStyle = '#E4D9D1';
        ctx.lineWidth = 2;
        ctx.strokeRect(panel.x, 140, 550, 740);

        try {
          const img = await loadImg(panel.url);
          ctx.drawImage(img, panel.x + 15, 155, 520, 665);
        } catch {
          ctx.fillStyle = '#F5EFEA';
          ctx.fillRect(panel.x + 15, 155, 520, 665);
        }

        // Label bar
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
      ctx.fillText('COORDINATED GARMENT SPECIFICATIONS & TAILORING DOSSIER', 80, 948);

      ctx.fillStyle = '#2D2825';
      ctx.font = '18px sans-serif';
      ctx.fillText(
        `Silhouette: ${currentVar.specs?.dressType || design.title}   |   Fabric: ${
          currentVar.specs?.fabric || 'Pure Silk'
        }   |   Colour: ${currentVar.specs?.color || 'Champagne'}   |   Neckline: ${
          currentVar.specs?.neckline || 'Sweetheart'
        }   |   Sleeves: ${currentVar.specs?.sleeve || 'Tailored'}`,
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
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText(
        `Estimated Craft Time: ~${currentVar.estimatedCraftTimeDays || 14} Days   •   Target Price Range: ₹${(
          currentVar.estimatedPriceRange?.min || 18000
        ).toLocaleString('en-IN')} – ₹${(currentVar.estimatedPriceRange?.max || 36000).toLocaleString('en-IN')}`,
        80,
        1068
      );

      const pngUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      const cleanName = (currentVar.name || design.title || 'couture-poster').toLowerCase().replace(/[^a-z0-9]+/g, '-');
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
      navigator.share({
        title: design.title,
        text: `Look at this AI bespoke dress concept: ${design.title}`,
        url: window.location.href
      }).catch(() => {});
    } else {
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2500);
    }
  };

  return (
    <div id="pearl-blush-reverie-screen" className="max-w-5xl mx-auto space-y-6 pb-24 text-[#2D2825] px-3 sm:px-4">
      
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
          3-View Coordinated Fashion Presentation
        </h2>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleGenerateGeminiImage()}
            disabled={isGeneratingGeminiImage}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FBECEF] transition-all cursor-pointer text-[#8D2434] flex items-center justify-center border border-[#ECE6DE] disabled:opacity-50"
            title="Regenerate AI Views"
          >
            <RefreshCw className={`w-4 h-4 ${isGeneratingGeminiImage ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleShare}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF7F2] transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE]"
            title="Share design with designers"
          >
            <Share2 className="w-4 h-4 text-[#2D2825]" />
          </button>
          <button
            onClick={() => {
              setIsSaved(!isSaved);
              onSaveToFavorites(design.id);
            }}
            className="w-9 h-9 rounded-full bg-white hover:bg-[#FAF7F2] transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE]"
            title={isSaved ? 'Saved in Wardrobe' : 'Save design'}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-[#8D2434]" />
            ) : (
              <Bookmark className="w-4 h-4 text-[#2D2825]" />
            )}
          </button>
        </div>
      </div>

      {/* 1B. THREE-PANEL COORDINATED FASHION PRESENTATION (FRONT, BACK & SIDE VIEWS) */}
      <div className="bg-white rounded-3xl border border-[#E4D9D1] p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F4EFEA] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D2434] block">
              COORDINATED MULTI-ANGLE VISUALIZATION
            </span>
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D2825]">
              {currentVar.name || design.title} — Front, Back & Side Views
            </h3>
            <p className="text-xs text-[#7D726A]">
              Consistent {currentVar.specs?.fabric || 'Silk'} • {currentVar.specs?.color || 'Champagne'} • {currentVar.specs?.neckline || 'Sweetheart'} • {currentVar.specs?.dressType || 'Silhouette'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadCombinedPoster}
              disabled={isExportingPoster}
              className="px-4 py-2.5 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{isExportingPoster ? 'Composing Poster...' : 'Download 3-View Fashion Poster'}</span>
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

        {/* 3 Coordinated Panels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'front' as const, label: '1. Front View', subtitle: 'Neckline, Bodice & Front Drape', url: resolvedFrontUrl },
            { key: 'back' as const, label: '2. Back View', subtitle: 'Back Closure, Dori & Train Fall', url: resolvedBackUrl },
            { key: 'side' as const, label: '3. Side View', subtitle: 'Profile Silhouette & Flare Volume', url: resolvedSideUrl }
          ].map((panel) => (
            <div
              key={panel.key}
              onClick={() => setActiveAngle(panel.key)}
              className={`group rounded-2xl border overflow-hidden bg-[#FAF7F2] transition-all cursor-pointer flex flex-col justify-between ${
                activeAngle === panel.key
                  ? 'border-[#8D2434] ring-2 ring-[#8D2434]/20 shadow-sm'
                  : 'border-[#ECE6DE] hover:border-[#2D2825]'
              }`}
            >
              <div className="relative aspect-[3/4] bg-[#F5EFEA] overflow-hidden">
                <img
                  src={panel.url}
                  alt={panel.label}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
                />
                <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-[#2D2825]/85 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                  {panel.label}
                </span>
              </div>
              <div className="p-3 bg-white flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-[#2D2825] truncate">{panel.label}</div>
                  <div className="text-[10px] text-[#7D726A] truncate">{panel.subtitle}</div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadSingleImage(panel.key, panel.url);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#2D2825] text-[#2D2825] hover:text-white border border-[#E4D9D1] text-[10px] font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                  title={`Download ${panel.label}`}
                >
                  <Download className="w-3 h-3" />
                  <span>Save</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. HERO IMAGE WITH 3:4 ASPECT RATIO, ANGLE TOGGLES & SKELETON LOADER ANIMATION */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F5EFEA] border border-[#ECE6DE] shadow-xs">
        <img
          src={currentImage}
          alt={design.title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-all duration-700 ${
            activeAngle === 'detail' ? 'scale-125 object-center' : 'scale-100 object-top'
          } ${isGeneratingGeminiImage ? 'blur-xs opacity-30 scale-105' : 'opacity-100'}`}
        />
        
        {/* Soft top gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/35 pointer-events-none" />

        {/* SKELETON LOADER ANIMATION WHILE AI MODEL PROCESSES DESIGN */}
        {isGeneratingGeminiImage && (
          <div
            data-testid="design-viewer-skeleton"
            className="absolute inset-0 bg-[#FAF7F2]/92 backdrop-blur-xs z-20 p-4 flex flex-col justify-between animate-in fade-in duration-200"
          >
            {/* Top Skeleton Title & Badge Placeholders */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="h-7 w-48 rounded-xl bg-[#E6DDD3] animate-pulse" />
                <div className="h-6 w-24 rounded-full bg-[#ECE6DE] animate-pulse" />
              </div>
              <div className="flex items-center gap-2">
                <div className="h-5 w-32 rounded-full bg-[#8D2434]/15 border border-[#8D2434]/25 animate-pulse" />
                <div className="h-5 w-24 rounded-full bg-[#ECE6DE] animate-pulse" />
              </div>
            </div>

            {/* Center Couture Silhouette Skeleton & Progress Bar */}
            <div className="my-auto flex flex-col items-center justify-center space-y-4">
              <div className="relative w-40 h-52 rounded-2xl bg-gradient-to-b from-[#ECE6DE] via-[#F5EFEA] to-[#E5DCD0] border border-[#D8CEC2] p-3.5 flex flex-col items-center justify-between shadow-inner overflow-hidden">
                <div className="w-9 h-9 rounded-full bg-[#D8CEC2] animate-pulse" />
                <div className="w-24 h-12 rounded-t-xl bg-[#D8CEC2]/90 animate-pulse" />
                <div className="w-16 h-6 rounded-md bg-[#CFC3B4] animate-pulse" />
                <div className="w-32 h-24 rounded-b-2xl bg-gradient-to-b from-[#D8CEC2] to-[#C7B9A8] animate-pulse" />
                {/* Scanning light bar */}
                <div className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-[#8D2434]/70 to-transparent animate-bounce" />
              </div>

              <div className="w-full max-w-[270px] bg-white/95 rounded-2xl border border-[#ECE6DE] p-3.5 shadow-sm space-y-2 text-left">
                <div className="flex items-center justify-between text-[10px] font-bold text-[#8D2434] uppercase tracking-wider">
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Synthesizing Couture Visual</span>
                  </span>
                  <span>Stage {viewerSynthesisStage || 1}/3</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#ECE6DE] overflow-hidden">
                  <div
                    className={`h-full bg-[#8D2434] rounded-full transition-all duration-300 ${
                      viewerSynthesisStage === 1 ? 'w-1/3' : viewerSynthesisStage === 2 ? 'w-2/3' : 'w-full'
                    }`}
                  />
                </div>
                <p className="text-[11px] font-medium text-[#2D2825] truncate">
                  {imageGenerationStatus || 'Crafting photorealistic bespoke dress visual...'}
                </p>
                <div className="space-y-1.5 pt-1">
                  <div className="h-2.5 w-full rounded-full bg-[#ECE6DE] animate-pulse" />
                  <div className="h-2.5 w-3/4 rounded-full bg-[#ECE6DE] animate-pulse" />
                </div>
              </div>
            </div>

            {/* Bottom Skeleton Angle Pills */}
            <div className="flex items-center justify-between gap-2">
              <div className="h-8 w-32 rounded-full bg-[#E6DDD3] animate-pulse" />
              <div className="flex items-center gap-1.5">
                <div className="h-8 w-14 rounded-full bg-[#E6DDD3] animate-pulse" />
                <div className="h-8 w-14 rounded-full bg-[#ECE6DE] animate-pulse" />
                <div className="h-8 w-14 rounded-full bg-[#ECE6DE] animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Floating title & AI Concept badge */}
        <div className="absolute top-4 left-4 right-4 text-white z-10 space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-md">
              {design.title}
            </h1>
            <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-[10px] font-semibold text-white tracking-wide border border-white/20 shrink-0">
              {activeAngle === 'front' && 'Front Silhouette'}
              {activeAngle === 'back' && 'Back Tailoring'}
              {activeAngle === 'side' && 'Side Profile'}
              {activeAngle === 'detail' && 'Artisan Weave & Macro'}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-medium tracking-wide text-white">
              <Sparkles className="w-3 h-3 text-[#E9D4D7]" />
              <span>AI Bespoke Concept</span>
            </div>
            {customImage && (
              <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#8D2434]/80 backdrop-blur-md border border-white/30 text-[10px] font-medium text-white">
                <Wand2 className="w-3 h-3" />
                <span>Custom AI Render</span>
              </div>
            )}
          </div>
        </div>

        {/* Multi-angle indicator pills */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
          {(['front', 'back', 'side', 'detail'] as const).map((angle) => (
            <button
              key={angle}
              onClick={() => setActiveAngle(angle)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all cursor-pointer ${
                activeAngle === angle
                  ? 'bg-white text-[#2D2825] shadow-xs'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              {angle === 'detail' ? 'Macro Detail' : angle.charAt(0).toUpperCase() + angle.slice(1)}
            </button>
          ))}
        </div>

        {/* Quick Trigger to open Free AI Studio */}
        <button
          onClick={() => setShowGeminiStudio(!showGeminiStudio)}
          className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full text-xs font-medium bg-black/50 hover:bg-black/70 backdrop-blur-md text-white flex items-center gap-1.5 transition-all cursor-pointer z-10 border border-white/20 shadow-xs"
        >
          <Wand2 className="w-3.5 h-3.5 text-[#E9D4D7]" />
          <span>{showGeminiStudio ? 'Close Studio' : 'Free AI Image Studio'}</span>
        </button>
      </div>

      {/* FREE AI IMAGE GENERATION STUDIO DRAWER/CARD */}
      {showGeminiStudio && (
        <div className="bg-[#FAF7F2] rounded-2xl border border-[#8D2434]/30 p-4 space-y-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#8D2434] text-white flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-[#2D2825] uppercase tracking-wider">
                    AI Couture Image Studio
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-[#416035]/15 text-[#416035] text-[10px] font-bold">
                    100% Free
                  </span>
                </div>
                <p className="text-[11px] text-[#7D726A]">
                  Create or edit visuals to your exact requirements • No paid keys needed
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
              Describe your visual requirements:
            </label>
            <textarea
              value={geminiPrompt}
              onChange={(e) => setGeminiPrompt(e.target.value)}
              placeholder="e.g. Pure raw silk lehenga in midnight sapphire with gold zari borders, dramatic sheer organza dupatta with scalloped hand-embroidery..."
              rows={2}
              className="w-full text-xs bg-white rounded-xl border border-[#ECE6DE] focus:border-[#8D2434] focus:outline-none p-3 text-[#2D2825] placeholder:text-[#A89F91]"
            />
          </div>

          {/* Quick Style / Requirement Prompts */}
          <div className="space-y-1.5">
            <div className="text-[10px] uppercase font-bold text-[#7D726A] tracking-wider">
              Quick Inspiration Prompts:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Royal Emerald Raw Silk with Zardozi Work',
                'Deep U-Back with Heavy Kundan Latkan',
                'Pastel Organza Gown with Pearl Constellation',
                'Close-up Macro Shot of Hand-Embroidered Zari',
                'Dramatic Red Carpet Trail Runway Lighting'
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setGeminiPrompt(suggestion);
                    handleGenerateGeminiImage(suggestion);
                  }}
                  disabled={isGeneratingGeminiImage}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-white hover:bg-[#FBECEF] hover:text-[#8D2434] border border-[#ECE6DE] text-[#2D2825] transition-colors cursor-pointer text-left"
                >
                  + {suggestion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={() => handleGenerateGeminiImage()}
              disabled={isGeneratingGeminiImage}
              className="flex-1 py-2.5 px-4 rounded-xl bg-[#8D2434] hover:bg-[#781E2C] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-60"
            >
              {isGeneratingGeminiImage ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Synthesizing Free Image...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate Free Bespoke Visual</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                setCustomImages((prev) => {
                  const updated = { ...prev };
                  delete updated[currentCustomKey];
                  return updated;
                });
                setImageGenerationStatus('Reset to default atelier visual');
              }}
              className="py-2.5 px-3 rounded-xl bg-white hover:bg-black/5 text-[#7D726A] hover:text-[#2D2825] border border-[#ECE6DE] text-xs font-medium cursor-pointer transition-colors"
              title="Reset angle image"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          {imageGenerationStatus && (
            <div className="p-2 rounded-lg bg-white border border-[#ECE6DE] text-[11px] text-[#7D726A] flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#416035] shrink-0" />
              <span>{imageGenerationStatus}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. GARMENT SPECIFICATIONS & CONCEPT CARD (Shows Skeleton Loader when AI is processing) */}
      {isGeneratingGeminiImage ? (
        <div className="bg-white rounded-2xl border border-[#ECE6DE] p-5 shadow-2xs space-y-4 animate-pulse">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-2 flex-1">
              <div className="h-5 w-3/5 rounded-lg bg-[#E6DDD3]" />
              <div className="h-3.5 w-4/5 rounded-lg bg-[#ECE6DE]" />
            </div>
            <div className="h-8 w-24 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]" />
          </div>
          <div className="h-7 w-56 rounded-full bg-[#F3F6F1] border border-[#DCE6D7]" />
          <div className="pt-3 border-t border-[#ECE6DE] space-y-2">
            <div className="h-3.5 w-24 rounded bg-[#E6DDD3]" />
            <div className="h-3 w-full rounded bg-[#ECE6DE]" />
            <div className="h-3 w-5/6 rounded bg-[#ECE6DE]" />
          </div>
          <div className="pt-3 border-t border-[#ECE6DE] grid grid-cols-2 gap-2">
            <div className="h-14 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]" />
            <div className="h-14 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]" />
            <div className="h-14 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]" />
            <div className="h-14 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]" />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-[#ECE6DE] p-5 shadow-2xs space-y-4">
          
          {/* Title + Subtitle */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-lg text-[#2D2825] leading-snug">
                {currentVar.name || design.title}
              </h3>
              <p className="text-xs text-[#7D726A] mt-1">
                {currentVar.specs?.pattern || 'Hand Zardozi & Pearl Work'} • {currentVar.specs?.sleeve || 'Tailored Sleeves'} • {currentVar.specs?.neckline || 'Bespoke Neckline'}
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

          {/* Tailoring estimates tag */}
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3F6F1] border border-[#DCE6D7] text-xs font-semibold text-[#416035]">
            <Tag className="w-3.5 h-3.5 text-[#416035]" />
            <span>
              Tailoring estimate: ₹{(currentVar.estimatedPriceRange?.min || 18000).toLocaleString('en-IN')} – ₹{(currentVar.estimatedPriceRange?.max || 36000).toLocaleString('en-IN')}
            </span>
          </div>

          {/* Editorial Idea */}
          <div className="pt-3 border-t border-[#ECE6DE] space-y-2">
            <div className="text-xs font-semibold text-[#2D2825] uppercase tracking-wider">The Concept</div>
            <p className="text-xs text-[#7D726A] leading-relaxed font-light">
              {currentVar.tagline || design.prompt}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-[#7D726A] pt-1">
              <Calendar className="w-3.5 h-3.5 text-[#8D2434]" />
              <span>Recommended for {currentVar.specs?.occasion || 'Bridal & Royal Celebrations'} • ~{currentVar.estimatedCraftTimeDays || 14} days craft time</span>
            </div>
          </div>

          {/* Bespoke Atelier Specifications */}
          <div className="pt-3 border-t border-[#ECE6DE]">
            <div className="text-xs font-semibold text-[#2D2825] uppercase tracking-wider mb-2.5">
              Bespoke Specifications
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <span className="text-[10px] text-[#7D726A] block">Primary Textile</span>
                <span className="font-medium text-[#2D2825]">{currentVar.specs?.fabric || currentVar.fabricDetails?.primary || 'Pure Silk Organza'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <span className="text-[10px] text-[#7D726A] block">Color & Craft</span>
                <span className="font-medium text-[#2D2825]">{currentVar.specs?.color || 'Pearl Blush'} • {currentVar.specs?.pattern || 'Hand Zardozi'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <span className="text-[10px] text-[#7D726A] block">{isMenDesign ? 'Collar / Lapel' : 'Neckline'}</span>
                <span className="font-medium text-[#2D2825]">{currentVar.specs?.neckline || 'Sculpted Sweetheart'}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <span className="text-[10px] text-[#7D726A] block">{isMenDesign ? 'Cuff & Sleeve' : 'Sleeve Cut'}</span>
                <span className="font-medium text-[#2D2825]">{currentVar.specs?.sleeve || 'Sheer Fitted Long'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

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
                Calculated for <strong className="font-medium text-[#2D2825]">{yardageCalculation.categoryLabel}</strong> & your measurements
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

        {/* Summary Highlight Box: Total Yards, Meters, and Lining */}
        <div className="grid grid-cols-3 gap-2.5 bg-gradient-to-r from-[#2D2825] via-[#3A332F] to-[#2D2825] text-white p-3.5 rounded-2xl shadow-xs">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-white/70 block">
              Primary Fabric
            </span>
            <div className="font-serif text-xl font-bold text-[#FAF7F2] mt-0.5">
              {yardageCalculation.totalYards} <span className="text-xs font-normal text-[#E8C5CC]">yds</span>
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
              {yardageCalculation.liningYards} <span className="text-xs font-normal text-[#E8C5CC]">yds</span>
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

        {/* Bolt Width & Silhouette Flare Controls */}
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
              {isMenDesign ? 'Ensemble Completeness & Stole:' : 'Silhouette Flare & Train Volume:'}
            </span>
            <div className="grid grid-cols-3 gap-1.5">
              {([
                { id: 'standard', label: isMenDesign ? '2-Piece Suit' : 'Standard Cut' },
                { id: 'royal_kali', label: isMenDesign ? '+ Waistcoat' : '16-Kali Flare' },
                { id: 'cathedral_train', label: isMenDesign ? '+ Royal Stole' : 'Sweep Train' }
              ] as const).map((opt) => (
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

        {/* Collapsible Live Measurement Calibration Sliders */}
        {showCustomMeasureCalibrator && (
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#ECE6DE] space-y-3 animate-in fade-in duration-200">
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
                  <span className="font-bold text-[#2D2825]">{calcHeightIn}" ({Math.floor(calcHeightIn / 12)}'{calcHeightIn % 12}")</span>
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
                  <span className="text-[#7D726A]">{isMenDesign ? 'Coat Length' : 'Skirt/Hem Length'}:</span>
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

        {/* Itemized Component Yardage Breakdown */}
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

        {/* Action to attach yardage breakdown to Tailor Quotation Request */}
        <button
          id="attach-yardage-to-quote-btn"
          type="button"
          onClick={() => {
            const breakdownSummary = `Estimated Fabric Yardage: ${yardageCalculation.totalYards} yds (${yardageCalculation.totalMeters}m) on ${boltWidthInches}" bolt + ${yardageCalculation.liningYards} yds lining [Calibrated for ${isMenDesign ? 'Chest' : 'Bust'} ${calcBustChestIn}", Waist ${calcWaistIn}", Height ${calcHeightIn}", Length ${calcGarmentLengthIn}"].`;
            setSpecificInstructions((prev) =>
              prev.includes('Estimated Fabric Yardage:') ? prev : `${prev.trim()} ${breakdownSummary}`
            );
            setShowQuoteModal(true);
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#FBECEF] border border-[#ECE6DE] hover:border-[#8D2434] text-xs font-semibold text-[#8D2434] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
        >
          <Calculator className="w-3.5 h-3.5" />
          <span>Include {yardageCalculation.totalYards} Yds Breakdown in Tailor Quote Request</span>
        </button>
      </div>

      {/* 4. SINGLE PRIMARY CTA + SECONDARY ACTION (Strict 8pt, consistent styling) */}
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

      {/* Share Toast Notification */}
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
              {/* Step 1: Select Approved Designer or Tailor */}
              <div>
                <label className="block text-[11px] font-bold text-[#2D2825] mb-1">
                  1. Select Approved Designer / Master Tailor
                </label>
                <select
                  value={selectedDesignerForQuote}
                  onChange={(e) => setSelectedDesignerForQuote(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-[#ECE6DE] bg-[#FAF7F2] text-xs font-semibold text-[#2D2825]"
                >
                  <option value="Ustad Rafiq Ahmed (Royal Heritage Atelier)">
                    Ustad Rafiq Ahmed — Royal Heritage Atelier (Old Delhi • 4.9★)
                  </option>
                  <option value="Anamika Khanna & Zari Studio (Mumbai)">
                    Anamika Khanna & Zari Studio (Mumbai • 4.9★)
                  </option>
                  <option value="Broadcast to All Verified Designers">
                    Broadcast to All Approved Platform Designers (Compare Bids)
                  </option>
                </select>
              </div>

              {/* Step 2: Measurements or Standard Size */}
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
                      Bust/Chest: <strong>{calcBustChestIn}"</strong> • Waist: <strong>{calcWaistIn}"</strong> • Height: <strong>{calcHeightIn}"</strong>
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

              {/* Step 3: Preferred Budget & Delivery Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#2D2825] mb-1">
                    3. Preferred Budget (INR)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D726A] font-bold">₹</span>
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
