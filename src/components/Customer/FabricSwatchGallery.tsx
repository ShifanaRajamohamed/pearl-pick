import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  Layers, 
  Info, 
  Maximize2, 
  SlidersHorizontal,
  Feather,
  ShieldCheck,
  X
} from 'lucide-react';

export interface FabricSwatch {
  id: string;
  name: string;
  category: 'Silk' | 'Brocade' | 'Sheer' | 'Satin & Velvet';
  weightGsm: number;
  drapeProfile: string;
  textureHand: string;
  imageUrl: string;
  colorTone: string;
  tailorRecommendation: string;
  promptSnippet: string;
  bestFor: string;
}

export const PREDEFINED_FABRICS: FabricSwatch[] = [
  {
    id: 'fab-mulberry-organza',
    name: 'Mulberry Silk Organza',
    category: 'Sheer',
    weightGsm: 120,
    drapeProfile: 'Crisp Architectural Sweep',
    textureHand: 'Translucent, sheer crystalline lustre',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&auto=format&fit=crop&q=80',
    colorTone: 'Pearl Blush & Ivory',
    tailorRecommendation: 'Requires micro-machine French seams and 70/10 Microtex needle.',
    promptSnippet: 'crafted in sheer Mulberry Silk Organza (120 GSM) with crisp architectural volume, translucent layered sweeps, and fluid train',
    bestFor: 'Tiered Gowns, Cascading Trains, Ethereal Sleeves'
  },
  {
    id: 'fab-banarasi-kincob',
    name: 'Banarasi Kincob Brocade',
    category: 'Brocade',
    weightGsm: 340,
    drapeProfile: 'Regal Rigid Structure',
    textureHand: 'Heavy gold zari warp with raised floral jaal',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=400&auto=format&fit=crop&q=80',
    colorTone: 'Royal Antique Gold & Crimson',
    tailorRecommendation: 'Needs pure cotton mulmul lining with canvas waist stay for weight balance.',
    promptSnippet: 'fashioned from majestic Banarasi Kincob Brocade (340 GSM) with authentic 24K gold zari floral arabesques and imperial structured drape',
    bestFor: 'Bridal Lehengas, Heritage Sherwanis, Corset Bodices'
  },
  {
    id: 'fab-chanderi-tissue',
    name: 'Chanderi Tissue Silk',
    category: 'Silk',
    weightGsm: 95,
    drapeProfile: 'Floating Gossamer Flare',
    textureHand: 'Fine metallic warp with sheer gold-silver glow',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&auto=format&fit=crop&q=80',
    colorTone: 'Gilded Champagne & Rose',
    tailorRecommendation: 'Use silk crepe lining; avoid heavy direct iron heat.',
    promptSnippet: 'tailored from gossamer Chanderi Tissue Silk (95 GSM) featuring subtle dual-tone metallic luminescence and floating festive flare',
    bestFor: 'Anarkali Kalis, Festive Dupattas, Evening Capes'
  },
  {
    id: 'fab-french-chantilly',
    name: 'French Chantilly Lace',
    category: 'Sheer',
    weightGsm: 115,
    drapeProfile: 'Soft Romantic Contour',
    textureHand: 'Delicate corded floral openwork with eyelash scallop',
    imageUrl: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=400&auto=format&fit=crop&q=80',
    colorTone: 'Muted Alabaster & Chalk White',
    tailorRecommendation: 'Hand-appliquéd seam junctions over sheer illusion tulle.',
    promptSnippet: 'overlaid with delicate French Chantilly Lace (115 GSM) boasting scalloped eyelash motifs, romantic floral openwork, and sheer contouring',
    bestFor: 'Bodice Overlays, Illusion Necklines, Cathedral Veils'
  },
  {
    id: 'fab-tussar-raw-silk',
    name: 'Tussar Wild Raw Silk',
    category: 'Silk',
    weightGsm: 220,
    drapeProfile: 'Muted Organic Body',
    textureHand: 'Textured slub grain with natural golden lustre',
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=400&auto=format&fit=crop&q=80',
    colorTone: 'Earthy Golden Sand & Ochre',
    tailorRecommendation: 'Preshrink fabric before cutting; use silk-finish thread.',
    promptSnippet: 'woven from rich Tussar Wild Raw Silk (220 GSM) with authentic organic slub texture, clean tailored seams, and warm golden sheen',
    bestFor: 'Tailored Trouser Suits, Draped Saree Gowns, Long Kurtas'
  },
  {
    id: 'fab-duchess-satin',
    name: 'Heavy Duchess Satin',
    category: 'Satin & Velvet',
    weightGsm: 280,
    drapeProfile: 'Architectural Sculptural Hold',
    textureHand: 'Dense, mirror-smooth low pearl sheen',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400&auto=format&fit=crop&q=80',
    colorTone: 'Lustrous Pearl & Deep Onyx',
    tailorRecommendation: 'Reinforce with horsehair braid in hem for dramatic sculptural sweep.',
    promptSnippet: 'sculpted in luminous Heavy Duchess Satin (280 GSM) featuring sharp box pleats, weighted sculptural drape, and mirror-smooth pearl sheen',
    bestFor: 'Ballroom Gowns, Basque Waistlines, Column Silhouettes'
  },
  {
    id: 'fab-liquid-velvet',
    name: 'Liquid Silk Velvet',
    category: 'Satin & Velvet',
    weightGsm: 360,
    drapeProfile: 'Fluid Light-Absorbing Pour',
    textureHand: 'Ultra-plush silk pile with deep tonal shift',
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&auto=format&fit=crop&q=80',
    colorTone: 'Midnight Navy & Burgundy Plum',
    tailorRecommendation: 'Sew with walking foot and directional pile alignment.',
    promptSnippet: 'draped in plush Liquid Silk Velvet (360 GSM) with light-absorbing deep pile, fluid body-skimming contour, and opulent evening presence',
    bestFor: 'Winter Wedding Lehengas, Corset Gowns, Royal Capes'
  },
  {
    id: 'fab-embroidered-georgette',
    name: 'Embroidered Micro-Georgette',
    category: 'Sheer',
    weightGsm: 140,
    drapeProfile: 'Bouncy Cascading Ruffle',
    textureHand: 'Fine crinkle crepe with scattered micro-sequins',
    imageUrl: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&auto=format&fit=crop&q=80',
    colorTone: 'Rosewater Pink & Mint Glaze',
    tailorRecommendation: 'Use narrow baby-hem rolled foot for bouncy edge movement.',
    promptSnippet: 'styled in fluid Embroidered Micro-Georgette (140 GSM) with subtle tone-on-tone crystal micro-sprinkles and fluttering cascading ruffles',
    bestFor: 'Saree Drapes, Fluted Skirts, Pre-Stitched Draped Gowns'
  }
];

interface FabricSwatchGalleryProps {
  selectedFabricName: string;
  onSelectFabric: (fabric: FabricSwatch) => void;
  currentPrompt: string;
  onUpdatePromptWithFabric: (newPrompt: string) => void;
}

export const FabricSwatchGallery: React.FC<FabricSwatchGalleryProps> = ({
  selectedFabricName,
  onSelectFabric,
  currentPrompt,
  onUpdatePromptWithFabric
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [inspectingFabric, setInspectingFabric] = useState<FabricSwatch | null>(null);
  const [appliedNotification, setAppliedNotification] = useState<string | null>(null);

  const categories = ['All', 'Silk', 'Brocade', 'Sheer', 'Satin & Velvet'];

  const filteredSwatches = activeCategory === 'All'
    ? PREDEFINED_FABRICS
    : PREDEFINED_FABRICS.filter((f) => f.category === activeCategory);

  const currentSelectedSwatch = PREDEFINED_FABRICS.find(
    (f) => f.name.toLowerCase() === selectedFabricName.toLowerCase()
  ) || PREDEFINED_FABRICS[0];

  const handleSwatchClick = (swatch: FabricSwatch) => {
    onSelectFabric(swatch);

    // Intelligently influence or update prompt
    let updated = currentPrompt;
    
    // Check if prompt already has a fabric reference or replace it smoothly
    const fabricNamesPattern = /(?:crafted in|tailored from|styled in|woven from|fashioned from|sculpted in|featuring|overlaid with)\s+[^,.]+(?:GSM\)[^,.]*)?/i;
    
    if (fabricNamesPattern.test(updated)) {
      updated = updated.replace(fabricNamesPattern, swatch.promptSnippet);
    } else {
      updated = `${updated.trim().replace(/\.$/, '')}, ${swatch.promptSnippet}.`;
    }

    onUpdatePromptWithFabric(updated);
    setAppliedNotification(`Prompt influenced by ${swatch.name}!`);
    setTimeout(() => setAppliedNotification(null), 3000);
  };

  return (
    <div className="bg-white rounded-[20px] border border-[#ECE6DE] p-4 sm:p-5 shadow-2xs space-y-3.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#FAF7F2] border border-[#ECE6DE] flex items-center justify-center text-[#8D2434]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-serif text-sm sm:text-base font-bold text-[#2D2825] flex items-center gap-1.5">
              <span>Fabric Swatch Gallery</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#FAF7F2] text-[#7D726A] border border-[#ECE6DE]">
                {PREDEFINED_FABRICS.length} Materials
              </span>
            </h3>
            <p className="text-[11px] text-[#7D726A] font-light">
              Tap a textile to explore weave specs & dynamically influence the AI design prompt.
            </p>
          </div>
        </div>

        {currentSelectedSwatch && (
          <button
            onClick={() => setInspectingFabric(currentSelectedSwatch)}
            className="text-[11px] text-[#8D2434] hover:underline flex items-center gap-1 font-medium cursor-pointer"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Inspect Weave</span>
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all border cursor-pointer ${
              activeCategory === cat
                ? 'bg-[#2D2825] text-white border-[#2D2825]'
                : 'bg-[#FAF7F2] text-[#7D726A] border-[#ECE6DE] hover:border-[#8D2434]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Visual Swatch Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {filteredSwatches.map((swatch) => {
          const isSelected = selectedFabricName.toLowerCase().includes(swatch.name.toLowerCase()) ||
                             swatch.name.toLowerCase().includes(selectedFabricName.toLowerCase());

          return (
            <div
              key={swatch.id}
              onClick={() => handleSwatchClick(swatch)}
              className={`group relative rounded-xl border p-2.5 text-left cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'bg-[#FBECEF]/40 border-[#8D2434] ring-2 ring-[#8D2434]/20 shadow-xs'
                  : 'bg-white border-[#ECE6DE] hover:border-[#8D2434]/60 hover:shadow-xs'
              }`}
            >
              {/* Swatch Thumbnail Preview */}
              <div className="relative aspect-video rounded-lg overflow-hidden bg-[#FAF7F2] border border-[#ECE6DE] mb-2">
                <img
                  src={swatch.imageUrl}
                  alt={swatch.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                
                {/* GSM Badge */}
                <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-xs text-[9px] font-mono text-white">
                  {swatch.weightGsm} GSM
                </span>

                {isSelected && (
                  <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#8D2434] text-white flex items-center justify-center shadow-sm">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Swatch Title & Drape */}
              <div className="space-y-0.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#2D2825] truncate">
                    {swatch.name}
                  </h4>
                </div>
                <p className="text-[10px] text-[#7D726A] truncate font-light">
                  {swatch.drapeProfile}
                </p>
                <div className="flex items-center justify-between pt-1 text-[9px]">
                  <span className="text-[#8D2434] font-medium truncate">
                    {swatch.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setInspectingFabric(swatch);
                    }}
                    className="text-[#7D726A] hover:text-[#2D2825] underline cursor-pointer"
                  >
                    Specs
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Prompt Influence Feedback Banner */}
      {appliedNotification && (
        <div className="bg-[#FAF7F2] border border-[#F2D1D7] rounded-xl p-2.5 flex items-center justify-between text-xs text-[#8D2434] animate-fade-in">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#8D2434] shrink-0" />
            <span className="font-medium">{appliedNotification}</span>
          </div>
          <span className="text-[10px] text-[#7D726A]">Synchronized</span>
        </div>
      )}

      {/* Selected Material Prompt Influence Bar */}
      {currentSelectedSwatch && (
        <div className="bg-[#FAF7F2] rounded-xl border border-[#ECE6DE] p-3 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#7D726A] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              Material AI Directive
            </span>
            <span className="font-semibold text-[#8D2434] text-[11px]">
              {currentSelectedSwatch.name}
            </span>
          </div>
          <p className="text-[11px] text-[#2D2825] font-light italic leading-relaxed line-clamp-2">
            "{currentSelectedSwatch.promptSnippet}"
          </p>
        </div>
      )}

      {/* Fabric Inspection Modal */}
      {inspectingFabric && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-md w-full p-6 border border-[#ECE6DE] shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-[#8D2434] font-bold">
                  {inspectingFabric.category} Specification
                </span>
                <h3 className="font-serif text-lg font-bold text-[#2D2825]">
                  {inspectingFabric.name}
                </h3>
              </div>
              <button
                onClick={() => setInspectingFabric(null)}
                className="w-8 h-8 rounded-full bg-[#FAF7F2] text-[#7D726A] flex items-center justify-center hover:bg-[#ECE6DE] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Visual preview */}
            <div className="relative aspect-video rounded-xl overflow-hidden border border-[#ECE6DE]">
              <img
                src={inspectingFabric.imageUrl}
                alt={inspectingFabric.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 text-white text-[10px] font-mono">
                {inspectingFabric.weightGsm} GSM
              </div>
            </div>

            {/* Technical Specs List */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-1 border-b border-[#F4EFEA]">
                <span className="text-[#7D726A]">Drape Profile:</span>
                <span className="font-medium text-[#2D2825]">{inspectingFabric.drapeProfile}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F4EFEA]">
                <span className="text-[#7D726A]">Tactile Hand:</span>
                <span className="font-medium text-[#2D2825] text-right">{inspectingFabric.textureHand}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#F4EFEA]">
                <span className="text-[#7D726A]">Ideal For:</span>
                <span className="font-medium text-[#2D2825] text-right">{inspectingFabric.bestFor}</span>
              </div>
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#ECE6DE] text-[11px] text-[#2D2825]">
                <strong className="block text-[#8D2434] font-semibold mb-0.5">Master Tailor Recommendation:</strong>
                {inspectingFabric.tailorRecommendation}
              </div>
            </div>

            <button
              onClick={() => {
                handleSwatchClick(inspectingFabric);
                setInspectingFabric(null);
              }}
              className="w-full py-3 rounded-xl bg-[#8D2434] text-white text-xs font-semibold hover:bg-[#781E2C] transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply {inspectingFabric.name} to AI Prompt</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
