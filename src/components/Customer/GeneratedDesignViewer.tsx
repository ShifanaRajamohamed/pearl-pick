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
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { DressDesign, DressDesignVariation } from '../../types';

interface GeneratedDesignViewerProps {
  design: DressDesign;
  onSaveToFavorites: (designId: string) => void;
  onRequestQuotations: (design: DressDesign, selectedVariation: DressDesignVariation, budget: number, neededBy: string, instructions: string) => void;
  onBackToStudio: () => void;
  onOpenSpecSheet: (variation: DressDesignVariation) => void;
}

export const GeneratedDesignViewer: React.FC<GeneratedDesignViewerProps> = ({
  design,
  onSaveToFavorites,
  onRequestQuotations,
  onBackToStudio,
  onOpenSpecSheet,
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
  const [imageGenerationStatus, setImageGenerationStatus] = useState<string | null>(null);
  const [imageModelUsed, setImageModelUsed] = useState<string | null>(null);

  const [targetBudget, setTargetBudget] = useState<number>(4999);
  const [neededByDate, setNeededByDate] = useState<string>('2026-10-15');
  const [specificInstructions, setSpecificInstructions] = useState<string>(
    'Hand-finished pearl embroidery with soft silk organza train and sweetheart neckline.'
  );

  const currentVar = design.variations[selectedVarIndex] || design.variations[0];

  const currentCustomKey = `${selectedVarIndex}-${activeAngle}`;
  const customImage = customImages[currentCustomKey];

  const currentImage = customImage || (
    activeAngle === 'back' && currentVar.backImageUrl ? currentVar.backImageUrl :
    activeAngle === 'side' && currentVar.sideImageUrl ? currentVar.sideImageUrl :
    activeAngle === 'detail' && (currentVar.detailImageUrl || currentVar.frontImageUrl) ? (currentVar.detailImageUrl || currentVar.frontImageUrl) :
    currentVar.frontImageUrl
  );

  const handleGenerateGeminiImage = async (customPromptToUse?: string) => {
    setIsGeneratingGeminiImage(true);
    setImageGenerationStatus('Synthesizing bespoke couture visual (100% Free)...');

    const promptText = (customPromptToUse || geminiPrompt).trim() || 
      `${currentVar.name || design.title}, luxury Indian haute couture fashion photography, ${activeAngle} angle view`;

    const isMenDesign = design.tags?.some(t => t.toLowerCase().includes('men')) || design.id.includes('men');

    try {
      const res = await fetch('/api/gemini/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          gender: isMenDesign ? 'men' : 'women',
          angle: activeAngle,
          dressType: currentVar.specs?.dressType || design.title,
          color: currentVar.specs?.color || (isMenDesign ? 'Midnight Obsidian' : 'Pearl Blush'),
          fabric: currentVar.specs?.fabric || (isMenDesign ? 'Pure Raw Silk' : 'Silk Organza'),
          aspectRatio: '3:4'
        })
      });

      const data = await res.json();
      if (data && data.imageUrl) {
        setCustomImages((prev) => ({
          ...prev,
          [currentCustomKey]: data.imageUrl
        }));
        setImageModelUsed('Free AI Visual Engine');
        setImageGenerationStatus('Custom bespoke visual generated successfully (100% Free)!');
        setShowGeminiStudio(false);
      } else {
        setImageGenerationStatus('Could not generate image. Please try another prompt.');
      }
    } catch (err: any) {
      console.warn('Image generation notice:', err);
      setImageGenerationStatus('Image request failed. Please check network connection.');
    } finally {
      setIsGeneratingGeminiImage(false);
    }
  };

  const handleBroadcastQuote = (e: React.FormEvent) => {
    e.preventDefault();
    onRequestQuotations(design, currentVar, targetBudget, neededByDate, specificInstructions);
    setShowQuoteModal(false);
    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#8D2434', '#FAF7F2', '#4A3728']
    });
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
    <div id="pearl-blush-reverie-screen" className="max-w-md mx-auto space-y-6 pb-24 text-[#2D2825] px-4 sm:px-1">
      
      {/* 1. TOP BAR: Back button, Title, and Action icons */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBackToStudio}
          className="w-10 h-10 -ml-1 rounded-full hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE]"
          title="Back to studio"
        >
          <ChevronLeft className="w-5 h-5 text-[#2D2825]" />
        </button>

        <h2 className="text-base font-semibold tracking-tight text-[#2D2825]">
          Design Details
        </h2>

        <div className="flex items-center gap-1.5 -mr-1">
          <button
            onClick={handleShare}
            className="w-10 h-10 rounded-full hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE]"
            title="Share concept"
          >
            <Share2 className="w-4 h-4 text-[#2D2825]" />
          </button>
          <button
            onClick={() => setIsSaved(!isSaved)}
            className="w-10 h-10 rounded-full hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE]"
            title={isSaved ? "Saved" : "Save to wardrobe"}
          >
            {isSaved ? (
              <BookmarkCheck className="w-4 h-4 text-[#8D2434]" />
            ) : (
              <Bookmark className="w-4 h-4 text-[#2D2825]" />
            )}
          </button>
        </div>
      </div>

      {/* 2. HERO IMAGE WITH 3:4 ASPECT RATIO & ANGLE TOGGLES */}
      <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F5EFEA] border border-[#ECE6DE] shadow-xs">
        <img
          src={currentImage}
          alt={design.title}
          referrerPolicy="no-referrer"
          className={`w-full h-full object-cover transition-transform duration-700 ${
            activeAngle === 'detail' ? 'scale-125 object-center' : 'scale-100 object-top'
          }`}
        />
        
        {/* Soft top gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/35 pointer-events-none" />

        {/* Loading Overlay when generating image */}
        {isGeneratingGeminiImage && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center p-6 text-center text-white space-y-3">
            <Loader2 className="w-8 h-8 text-[#FAF7F2] animate-spin" />
            <div className="text-sm font-semibold tracking-wide">Synthesizing Couture Visual</div>
            <p className="text-xs text-white/80 max-w-xs font-light">
              Crafting photorealistic bespoke dress visual with Free AI Visual Engine...
            </p>
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

        {/* Bottom controls bar on image (Clean responsive layout without overlap) */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-1.5 z-10">
          {/* Quick Trigger to open Free AI Studio */}
          <button
            onClick={() => setShowGeminiStudio(!showGeminiStudio)}
            className="px-2.5 sm:px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold bg-black/60 hover:bg-black/80 backdrop-blur-md text-white flex items-center gap-1.5 transition-all cursor-pointer border border-white/20 shadow-xs shrink-0"
          >
            <Wand2 className="w-3.5 h-3.5 text-[#E9D4D7]" />
            <span>{showGeminiStudio ? 'Close Studio' : 'Free AI Studio'}</span>
          </button>

          {/* Multi-angle indicator pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {(['front', 'back', 'side', 'detail'] as const).map((angle) => (
              <button
                key={angle}
                onClick={() => setActiveAngle(angle)}
                className={`px-2 sm:px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-medium backdrop-blur-md transition-all cursor-pointer whitespace-nowrap ${
                  activeAngle === angle
                    ? 'bg-white text-[#2D2825] shadow-xs font-semibold'
                    : 'bg-black/45 text-white/90 hover:bg-black/65'
                }`}
              >
                {angle === 'detail' ? 'Macro' : angle.charAt(0).toUpperCase() + angle.slice(1)}
              </button>
            ))}
          </div>
        </div>
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

      {/* 3. GARMENT SPECIFICATIONS & CONCEPT CARD */}
      <div className="bg-white rounded-2xl border border-[#ECE6DE] p-5 shadow-2xs space-y-4">
        
        {/* Title + Subtitle */}
        <div>
          <h3 className="font-semibold text-lg text-[#2D2825] leading-snug">
            {currentVar.name || design.title}
          </h3>
          <p className="text-xs text-[#7D726A] mt-1">
            {currentVar.specs?.fabric || currentVar.fabricDetails?.primary || 'Bespoke Pure Silk'} • {currentVar.specs?.sleeve || 'Tailored Sleeves'} • {currentVar.specs?.neckline || 'Custom Collar'}
          </p>
        </div>

        {/* Tailoring estimates tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3F6F1] border border-[#DCE6D7] text-xs font-semibold text-[#416035]">
          <Tag className="w-3.5 h-3.5 text-[#416035]" />
          <span>Tailoring estimates from ₹{(currentVar.estimatedPriceRange?.min || 25000).toLocaleString('en-IN')}</span>
        </div>

        {/* Editorial Idea */}
        <div className="pt-3 border-t border-[#ECE6DE] space-y-2">
          <div className="text-xs font-semibold text-[#2D2825] uppercase tracking-wider">The Concept</div>
          <p className="text-xs text-[#7D726A] leading-relaxed font-light">
            {currentVar.tagline || 'A bespoke atelier creation tailored to precise body proportions with master handcrafting.'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#7D726A] pt-1">
            <Calendar className="w-3.5 h-3.5 text-[#8D2434]" />
            <span>Recommended for: {currentVar.specs?.occasion || 'Grand Receptions & Ceremonies'}</span>
          </div>
        </div>

        {/* Bespoke Atelier Specifications */}
        <div className="pt-3 border-t border-[#ECE6DE]">
          <div className="text-xs font-semibold text-[#2D2825] uppercase tracking-wider mb-2.5">
            Bespoke Specifications
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">Fabric</span>
              <span className="font-medium text-[#2D2825] truncate block">
                {currentVar.specs?.fabric || currentVar.fabricDetails?.primary || 'Bespoke Pure Silk'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">Embellishment</span>
              <span className="font-medium text-[#2D2825] truncate block">
                {currentVar.fabricDetails?.embellishments || currentVar.specs?.pattern || 'Hand Zardozi & Resham'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">Neckline / Collar</span>
              <span className="font-medium text-[#2D2825] truncate block">
                {currentVar.specs?.neckline || 'Bespoke Cut'}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">Sleeve / Cuffs</span>
              <span className="font-medium text-[#2D2825] truncate block">
                {currentVar.specs?.sleeve || 'Tailored Cuffs'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. PRIMARY CTA + SECONDARY ACTIONS */}
      <div className="space-y-2.5">
        <button
          onClick={() => setShowQuoteModal(true)}
          className="w-full h-12 rounded-xl bg-[#8D2434] hover:bg-[#781E2C] active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Scissors className="w-4 h-4 text-white" />
          <span>Request Atelier Quotations</span>
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenSpecSheet(currentVar)}
            className="w-full h-11 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#ECE6DE] text-[#2D2825] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            title="Download Technical Spec Sheet (PDF)"
          >
            <Download className="w-3.5 h-3.5 text-[#8D2434]" />
            <span>Tech Spec Sheet</span>
          </button>

          <button
            onClick={handleShare}
            className="w-full h-11 rounded-xl bg-white hover:bg-[#FAF7F2] border border-[#ECE6DE] text-[#2D2825] text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#7D726A]" />
            <span>Share Concept</span>
          </button>
        </div>
      </div>

      {/* Share Toast Notification */}
      {showShareToast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-[#2D2825] text-white px-4 py-2 rounded-full text-xs shadow-xl flex items-center gap-2">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>Link copied to clipboard!</span>
        </div>
      )}

      {/* QUOTATION MODAL */}
      {showQuoteModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-3">
          <div className="bg-white w-full max-w-sm rounded-[24px] p-5 space-y-4 shadow-2xl border border-[#ECE6DE]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-[#2D2825]">
                Request Atelier Quotations
              </h3>
              <button
                onClick={() => setShowQuoteModal(false)}
                className="p-1.5 rounded-full hover:bg-black/5"
              >
                <X className="w-4 h-4 text-[#7D726A]" />
              </button>
            </div>

            <form onSubmit={handleBroadcastQuote} className="space-y-3 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-[#7D726A] mb-1">
                  Target Budget (INR)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7D726A]">₹</span>
                  <input
                    type="number"
                    value={targetBudget}
                    onChange={(e) => setTargetBudget(Number(e.target.value))}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-[#ECE6DE] text-xs font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7D726A] mb-1">
                  Required By Date
                </label>
                <input
                  type="date"
                  value={neededByDate}
                  onChange={(e) => setNeededByDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[#ECE6DE] text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-[#7D726A] mb-1">
                  Tailoring & Fit Instructions
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
                className="w-full py-3 rounded-xl bg-[#8D2434] text-white font-semibold text-xs shadow-md hover:bg-[#781E2C] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <Scissors className="w-4 h-4 text-white" />
                <span>Broadcast Request to Master Tailors</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
