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
  X
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
  const [activeAngle, setActiveAngle] = useState<'front' | 'back' | 'side'>('front');

  const [targetBudget, setTargetBudget] = useState<number>(4999);
  const [neededByDate, setNeededByDate] = useState<string>('2026-10-15');
  const [specificInstructions, setSpecificInstructions] = useState<string>(
    'Hand-finished pearl embroidery with soft silk organza train and sweetheart neckline.'
  );

  const currentVar = design.variations[selectedVarIndex] || design.variations[0];

  const currentImage = 
    activeAngle === 'back' && currentVar.backImageUrl ? currentVar.backImageUrl :
    activeAngle === 'side' && currentVar.sideImageUrl ? currentVar.sideImageUrl :
    currentVar.frontImageUrl;

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
          className="w-full h-full object-cover object-top"
        />
        
        {/* Soft top gradient for text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-transparent to-black/25 pointer-events-none" />

        {/* Floating title & AI Concept badge */}
        <div className="absolute top-4 left-4 right-4 text-white z-10 space-y-1.5">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight drop-shadow-md">
            {design.title}
          </h1>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/20 text-[10px] font-medium tracking-wide text-white">
            <Sparkles className="w-3 h-3 text-[#E9D4D7]" />
            <span>AI Bespoke Concept</span>
          </div>
        </div>

        {/* Multi-angle indicator pills */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5 z-10">
          {(['front', 'back', 'side'] as const).map((angle) => (
            <button
              key={angle}
              onClick={() => setActiveAngle(angle)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-md transition-all cursor-pointer ${
                activeAngle === angle
                  ? 'bg-white text-[#2D2825] shadow-xs'
                  : 'bg-black/40 text-white hover:bg-black/60'
              }`}
            >
              {angle.charAt(0).toUpperCase() + angle.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* 3. GARMENT SPECIFICATIONS & CONCEPT CARD */}
      <div className="bg-white rounded-2xl border border-[#ECE6DE] p-5 shadow-2xs space-y-4">
        
        {/* Title + Subtitle */}
        <div>
          <h3 className="font-semibold text-lg text-[#2D2825] leading-snug">
            {currentVar.name || 'Pastel silk organza gown'}
          </h3>
          <p className="text-xs text-[#7D726A] mt-1">
            Pearl embroidery • Long sleeves • Sweetheart neckline
          </p>
        </div>

        {/* Tailoring estimates tag */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3F6F1] border border-[#DCE6D7] text-xs font-semibold text-[#416035]">
          <Tag className="w-3.5 h-3.5 text-[#416035]" />
          <span>Tailoring estimates from ₹4,999</span>
        </div>

        {/* Editorial Idea */}
        <div className="pt-3 border-t border-[#ECE6DE] space-y-2">
          <div className="text-xs font-semibold text-[#2D2825] uppercase tracking-wider">The Concept</div>
          <p className="text-xs text-[#7D726A] leading-relaxed font-light">
            {currentVar.tagline || 'A soft bridal silhouette with a hand-finished pearl constellation and a fluid train.'}
          </p>
          <div className="flex items-center gap-1.5 text-xs text-[#7D726A] pt-1">
            <Calendar className="w-3.5 h-3.5 text-[#8D2434]" />
            <span>Recommended for evening receptions & celebrations</span>
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
              <span className="font-medium text-[#2D2825]">Silk Organza & Tulle</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">Embellishment</span>
              <span className="font-medium text-[#2D2825]">Freshwater Pearls</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">Neckline</span>
              <span className="font-medium text-[#2D2825]">Sculpted Sweetheart</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
              <span className="text-[10px] text-[#7D726A] block">Sleeve Cut</span>
              <span className="font-medium text-[#2D2825]">Sheer Fitted Long</span>
            </div>
          </div>
        </div>
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
