import React, { useState, useRef } from 'react';
import {
  X,
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Sparkles,
  Check,
  ShieldCheck,
  Layers,
  MapPin,
  Droplets,
  Scissors,
  MessageCircle,
  Award,
  SlidersHorizontal,
  Info,
  RotateCcw
} from 'lucide-react';
import { HighEndFabric } from '../../types';

export const HIGH_END_FABRICS: HighEndFabric[] = [
  {
    id: 'lib-banarasi-katan',
    name: 'Royal Banarasi Katan Silk (Real Zari)',
    category: 'Brocade & Zari',
    weightGsm: 380,
    composition: '82% Pure Mulberry Filament Silk, 18% Electroplated Silver-Gold Zari',
    weaveStructure: 'Handwoven Kadwa Jacquard Brocade (3-Ply Twisted Warp)',
    threadCount: '420 EPI × 380 PPI (36 Momme Equivalent)',
    drapeProfile: 'Regal Architectural Hold & Sculptural Kali Flare',
    textureHand: 'Crisp, rich relief brocade with raised metallic floral jaal',
    origin: 'Madanpura & Sarai Mohana Weavers Cluster, Varanasi (GI Certified)',
    careInstructions: 'Specialist hydrocarbon dry clean only; wrap in unbleached mulmul cloth; store flat away from moisture.',
    pricePerMeterINR: 6800,
    colorTone: 'Shahi Rani Crimson & Antique 24K Gold',
    hex: '#9E1B34',
    imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1200&auto=format&fit=crop&q=90',
    highResMacroUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=2000&auto=format&fit=crop&q=95',
    tailorRecommendation: 'Interline with breathable organic cotton mulmul and add horsehair braid along the hem to accentuate 16-kali volume.',
    bestFor: 'Bridal Lehengas, Heritage Sherwanis, Structured Achkans',
    giCertified: true
  },
  {
    id: 'lib-mulberry-organza',
    name: 'Pure Mulberry Silk Tissue Organza',
    category: 'Sheer & Organza',
    weightGsm: 110,
    composition: '90% Gummed Twisted Mulberry Silk, 10% Fine Lurex Kora Filament',
    weaveStructure: 'Plain Open-Mesh Crisp Filament Weave',
    threadCount: '240 EPI × 220 PPI (12 Momme)',
    drapeProfile: 'Buoyant Architectural Cloud Sweep',
    textureHand: 'Whisper-light, glass-like translucency with subtle champagne reflection',
    origin: 'Chanderi & Maheshwar Handloom Guild, Madhya Pradesh',
    careInstructions: 'Dry clean only; steam press from reverse using silk organza press cloth at low temperature.',
    pricePerMeterINR: 3400,
    colorTone: 'Pearl Blush & Champagne Rose',
    hex: '#F3D6CE',
    imageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1200&auto=format&fit=crop&q=90',
    highResMacroUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=2000&auto=format&fit=crop&q=95',
    tailorRecommendation: 'Construct with 3mm micro French seams and 65/9 Microtex needle to keep sheer seams invisible.',
    bestFor: 'Cascading Bridal Veils, Tiered Couture Gowns, Scalloped Zardozi Dupattas',
    giCertified: true
  },
  {
    id: 'lib-kanjeevaram-korvai',
    name: 'Kanjeevaram Pure Zari Korvai Silk',
    category: 'Heritage Silk',
    weightGsm: 365,
    composition: '85% 3-Ply Twisted South Mulberry Silk, 15% Pure Silver-Gilt Zari',
    weaveStructure: '3-Shuttle Interlocked Korvai Temple Weave',
    threadCount: '440 EPI × 400 PPI (34 Momme)',
    drapeProfile: 'Statuesque Pleat Retention & Luminous Fall',
    textureHand: 'Dense, buttery smooth body with contrasting interlocked temple border',
    origin: 'Kanchipuram Silk Weavers Cooperative, Tamil Nadu (GI Certified)',
    careInstructions: 'Professional silk dry clean; refold along different crease lines every 3 months.',
    pricePerMeterINR: 7400,
    colorTone: 'Imperial Peacock Blue & Burnished Copper Gold',
    hex: '#0F4C5C',
    imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1200&auto=format&fit=crop&q=90',
    highResMacroUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=2000&auto=format&fit=crop&q=95',
    tailorRecommendation: 'Preserve temple border along bias train or structured waist belt; zero raw edge exposure.',
    bestFor: 'Pre-Pleated Saree Gowns, Corset Blouses, Royal Reception Ensembles',
    giCertified: true
  },
  {
    id: 'lib-liquid-silk-velvet',
    name: 'Royal Micro-Pile Liquid Silk Velvet',
    category: 'Satin & Velvet',
    weightGsm: 410,
    composition: '78% Mulberry Silk Backing, 22% Bemberg Cupro Cut Pile',
    weaveStructure: 'Double-Cloth Face-to-Face Cut Velveteen Pile (1.8mm Pile Height)',
    threadCount: '520 Pile Tufts per Sq. Inch',
    drapeProfile: 'Fluid Light-Absorbing Pour & Regal Gravity',
    textureHand: 'Ultra-plush, directional velvet nap with deep chiaroscuro shadow play',
    origin: 'Surat Artisanal Velvet Mills & Zardozi Guild, Gujarat',
    careInstructions: 'Never flat-iron; steam only from backing while suspended vertically on velvet needle board.',
    pricePerMeterINR: 5200,
    colorTone: 'Midnight Obsidian & Imperial Emerald',
    hex: '#19282F',
    imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1200&auto=format&fit=crop&q=90',
    highResMacroUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=2000&auto=format&fit=crop&q=95',
    tailorRecommendation: 'Cut all panels in strict single-nap direction (shading downward) and baste by hand before lockstitching.',
    bestFor: 'Royal Jodhpuri Bandhgalas, Winter Bridal Lehengas, Dinner Tuxedo Jackets',
    giCertified: false
  },
  {
    id: 'lib-loro-merino-wool',
    name: 'Italian Super 150s Merino & Silk Barathea',
    category: 'Savile Row Suiting',
    weightGsm: 270,
    composition: '88% Extrafine Australian Super 150s Merino Wool (16.0 Micron), 12% Como Silk',
    weaveStructure: '2/2 Twill & Pebble Barathea Cavalry Weave',
    threadCount: '310 EPI × 290 PPI',
    drapeProfile: 'Crisp Savile Row Chest Roll & Natural Crease Recovery',
    textureHand: 'Cool, dry worsted handfeel with subtle matte-silk luster',
    origin: 'Biella Mill Importing Guild — Curated for Connaught Place Bespoke Ateliers',
    careInstructions: 'Brush with natural boar-bristle garment brush after wear; rest 24h on contoured cedar hanger.',
    pricePerMeterINR: 8900,
    colorTone: 'Kashi Charcoal Obsidian & Midnight Slate',
    hex: '#23272B',
    imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1200&auto=format&fit=crop&q=90',
    highResMacroUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=2000&auto=format&fit=crop&q=95',
    tailorRecommendation: 'Pair with full floating horsehair chest canvas and hand-padded peak lapels for lifetime shape retention.',
    bestFor: 'Savile Row 3-Piece Tuxedos, Double-Breasted Blazers, Formal Bandhgalas',
    giCertified: false
  },
  {
    id: 'lib-lucknowi-georgette',
    name: 'Pure Khaddi Georgette with Resham Chikankari',
    category: 'Sheer & Organza',
    weightGsm: 145,
    composition: '100% High-Twist Crepe Mulberry Silk with Hand-Spun Cotton Tepchi Thread',
    weaveStructure: 'S- & Z-Alternating High-Twist Crinkle Crepe',
    threadCount: '260 EPI × 240 PPI (16 Momme)',
    drapeProfile: 'Fluid Kinetic Movement & Twirl-Ready Fall',
    textureHand: 'Fine pebbled crepe grain raised with 32-stitch hand shadow-work',
    origin: 'Chowk & Aminabad Karigar Guild, Lucknow (GI Certified)',
    careInstructions: 'Gentle cold dry-clean; roll in soft muslin; avoid hanging heavy mukaish-embellished panels.',
    pricePerMeterINR: 4600,
    colorTone: 'Noor Ivory & Dusty Rosewater',
    hex: '#F4ECE1',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1200&auto=format&fit=crop&q=90',
    highResMacroUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=2000&auto=format&fit=crop&q=95',
    tailorRecommendation: 'Line with pure silk crepe de chine dyed in the same dye vat to preserve tone-on-tone shadow depth.',
    bestFor: '24-Kali Anarkali Suits, Festive Shararas, Draped Cape Ensembles',
    giCertified: true
  },
  {
    id: 'lib-duchess-satin',
    name: 'Heavy Couture Bridal Duchess Satin',
    category: 'Satin & Velvet',
    weightGsm: 295,
    composition: '85% Mulberry Silk Warp, 15% Fine Twill Acetate Weft for Structural Memory',
    weaveStructure: '8-Harness High-Density Satin Float Weave',
    threadCount: '480 EPI × 320 PPI (30 Momme)',
    drapeProfile: 'Sculptural Fold Hold & Mirror-Smooth Sweep',
    textureHand: 'Substantial, cool pearl-like face with matte twill reverse',
    origin: 'Bangalore Silk Guild, Karnataka',
    careInstructions: 'Spot-treat immediately only by specialist; press on reverse with dry iron (no water droplets).',
    pricePerMeterINR: 4900,
    colorTone: 'Alabaster Pearl & Champagne Ivory',
    hex: '#F7F3EB',
    imageUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1200&auto=format&fit=crop&q=90',
    highResMacroUrl: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=2000&auto=format&fit=crop&q=95',
    tailorRecommendation: 'Pin only within seam allowances using extra-fine silk pins; reinforce bodice with spiral steel boning.',
    bestFor: 'Corset Evening Gowns, Tuxedo Peak Lapel Facings, Structured Drape Skirts',
    giCertified: false
  },
  {
    id: 'lib-bangalore-raw-silk',
    name: 'Bangalore Pure Matka Slub Raw Silk',
    category: 'Heritage Silk',
    weightGsm: 340,
    composition: '100% Un-degummed Dupion & Mulberry Raw Silk',
    weaveStructure: 'Balanced Plain Loom Weave with Natural Cross-Slub Character',
    threadCount: '340 EPI × 310 PPI (32 Momme)',
    drapeProfile: 'Crisp Tailored Precision & Heavy Zardozi Support',
    textureHand: 'Organic tactile slub grain with dual-tone shot-silk iridescence',
    origin: 'Doddaballapura & Ramanagara Silk Cluster, Karnataka (GI Certified)',
    careInstructions: 'Dry clean only; store away from direct sunlight to preserve natural vegetable & acid dye richness.',
    pricePerMeterINR: 4200,
    colorTone: 'Rani Gulabi & Emerald Shot Gold',
    hex: '#D4376A',
    imageUrl: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1200&auto=format&fit=crop&q=90',
    highResMacroUrl: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=2000&auto=format&fit=crop&q=95',
    tailorRecommendation: 'Ideal base fabric for heavy hand dabka and kundan work on adda frames without puckering.',
    bestFor: 'Bridal Cholis, Royal Groom Sherwanis, Kalidar Lehengas',
    giCertified: true
  }
];

interface FabricLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  tailorName?: string;
  onRequestSwatch: (fabric: HighEndFabric, customNote?: string) => void;
  onApplyFabricToStudio?: (fabric: HighEndFabric) => void;
}

export const FabricLibraryModal: React.FC<FabricLibraryModalProps> = ({
  isOpen,
  onClose,
  tailorName = 'Master Tailor',
  onRequestSwatch,
  onApplyFabricToStudio
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFabric, setSelectedFabric] = useState<HighEndFabric>(HIGH_END_FABRICS[0]);
  
  // High-res Zoom & Loupe states
  const [zoomLevel, setZoomLevel] = useState<number>(2.5);
  const [isHoveringImage, setIsHoveringImage] = useState<boolean>(false);
  const [zoomCursorPos, setZoomCursorPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isLockedZoom, setIsLockedZoom] = useState<boolean>(false);
  const [isFullscreenLightbox, setIsFullscreenLightbox] = useState<boolean>(false);

  // Swatch Request states
  const [customSwatchNote, setCustomSwatchNote] = useState<string>('');
  const [requestedFabricIds, setRequestedFabricIds] = useState<string[]>([]);
  const [swatchSuccessToast, setSwatchSuccessToast] = useState<string | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const categories = [
    'All',
    'Heritage Silk',
    'Brocade & Zari',
    'Sheer & Organza',
    'Satin & Velvet',
    'Savile Row Suiting'
  ];

  const filteredFabrics = HIGH_END_FABRICS.filter((fab) => {
    const matchesCategory = selectedCategory === 'All' || fab.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      fab.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fab.composition.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fab.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fab.bestFor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCursorPos({ x, y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current || e.touches.length === 0) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = Math.max(0, Math.min(100, ((touch.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((touch.clientY - rect.top) / rect.height) * 100));
    setZoomCursorPos({ x, y });
  };

  const handleRequestSwatchClick = () => {
    onRequestSwatch(selectedFabric, customSwatchNote.trim() || undefined);
    setRequestedFabricIds((prev) => (prev.includes(selectedFabric.id) ? prev : [...prev, selectedFabric.id]));
    setSwatchSuccessToast(`Swatch request for "${selectedFabric.name}" added to your chat with ${tailorName}!`);
    setCustomSwatchNote('');
    setTimeout(() => {
      setSwatchSuccessToast(null);
    }, 4500);
  };

  const isAlreadyRequested = requestedFabricIds.includes(selectedFabric.id);

  return (
    <div
      id="fabric-library-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="fabric-library-modal"
        className="bg-[#FAF7F2] rounded-[28px] max-w-5xl w-full max-h-[92vh] border border-[#E4D9D1] shadow-2xl flex flex-col overflow-hidden my-auto"
      >
        {/* Modal Header */}
        <div className="px-5 py-4 bg-gradient-to-r from-[#2D2825] via-[#3D332E] to-[#2D2825] text-white flex items-center justify-between border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#8D2434] border border-[#D4AF37]/40 flex items-center justify-center shadow-sm">
              <Layers className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg sm:text-xl font-bold text-[#FAF7F2]">
                  Atelier High-End Fabric Library
                </h2>
                <span className="text-[10px] uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 font-semibold hidden sm:inline-block">
                  Macro Weave Inspector
                </span>
              </div>
              <p className="text-xs text-[#FAF7F2]/75 font-light">
                Inspect high-resolution textile weaves, verify fiber compositions, and request physical feeler swatches in tailor chat.
              </p>
            </div>
          </div>

          <button
            id="close-fabric-library-btn"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close Fabric Library"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="px-5 py-3 bg-white border-b border-[#ECE6DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#2D2825] text-[#FAF7F2] border-[#2D2825] shadow-2xs'
                    : 'bg-[#FAF7F2] text-[#7D726A] border-[#ECE6DE] hover:border-[#8D2434] hover:text-[#2D2825]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64 shrink-0">
            <Search className="w-3.5 h-3.5 text-[#8E847D] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search silk, zari, Varanasi, GSM..."
              className="w-full pl-8 pr-7 py-1.5 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] text-xs text-[#2D2825] placeholder-[#8E847D] focus:outline-none focus:border-[#8D2434]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8E847D] hover:text-[#2D2825]"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Toast Notification when Swatch is Requested */}
        {swatchSuccessToast && (
          <div className="mx-5 mt-3 px-4 py-2.5 rounded-2xl bg-emerald-900 text-white text-xs flex items-center justify-between gap-3 shadow-md animate-fade-in shrink-0">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-300 shrink-0" />
              <span className="font-medium">{swatchSuccessToast}</span>
            </div>
            <button
              onClick={onClose}
              className="px-3 py-1 rounded-full bg-white text-emerald-950 font-bold text-[11px] hover:bg-emerald-50 transition-colors cursor-pointer shrink-0"
            >
              View in Chat →
            </button>
          </div>
        )}

        {/* Main Split Body: Left Swatch Selector List + Right High-Res Zoom Inspector & Composition Details */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Left Column (5 cols on lg): Curated High-End Fabrics List */}
          <div className="lg:col-span-5 space-y-2.5 max-h-[340px] lg:max-h-[600px] overflow-y-auto pr-1">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#7D726A]">
                Available Couture Textiles ({filteredFabrics.length})
              </span>
              <span className="text-[10px] text-[#8E847D]">Tap to inspect macro weave</span>
            </div>

            {filteredFabrics.map((fab) => {
              const isSelected = selectedFabric.id === fab.id;
              const isRequested = requestedFabricIds.includes(fab.id);

              return (
                <div
                  key={fab.id}
                  onClick={() => {
                    setSelectedFabric(fab);
                    setIsLockedZoom(false);
                  }}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                    isSelected
                      ? 'bg-white border-[#8D2434] ring-2 ring-[#8D2434]/15 shadow-sm'
                      : 'bg-white/75 border-[#ECE6DE] hover:bg-white hover:border-[#8D2434]/40'
                  }`}
                >
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden border border-[#ECE6DE] shrink-0 bg-[#FAF7F2]">
                    <img
                      src={fab.imageUrl}
                      alt={fab.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-white text-[9px] font-mono">
                      {fab.weightGsm} GSM
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-1">
                      <h4 className="font-serif text-xs sm:text-sm font-bold text-[#2D2825] truncate">
                        {fab.name}
                      </h4>
                      {fab.giCertified && (
                        <span className="px-1.5 py-0.5 rounded bg-[#FBECEF] text-[#8D2434] text-[9px] font-bold shrink-0">
                          GI Tag
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-[#7D726A] truncate mt-0.5">
                      {fab.composition}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[#F4EFEA]">
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-black/20 shrink-0"
                          style={{ backgroundColor: fab.hex }}
                        />
                        <span className="text-[10px] text-[#7D726A] truncate max-w-[120px]">
                          {fab.colorTone}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isRequested && (
                          <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            Swatch Requested
                          </span>
                        )}
                        <span className="text-xs font-bold text-[#2D2825]">
                          ₹{fab.pricePerMeterINR.toLocaleString('en-IN')}/m
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column (7 cols on lg): Zoomable High-Res Image & Composition Details */}
          <div className="lg:col-span-7 bg-white rounded-[24px] border border-[#ECE6DE] p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
            
            {/* Interactive High-Resolution Zoomable Weave Viewer */}
            <div className="space-y-2.5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D2434] block">
                    {selectedFabric.category} • {selectedFabric.origin.split(',')[0]}
                  </span>
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2D2825]">
                    {selectedFabric.name}
                  </h3>
                </div>

                {/* Zoom Controls Bar */}
                <div className="flex items-center gap-1.5 bg-[#FAF7F2] px-2.5 py-1 rounded-full border border-[#ECE6DE]">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(1.5, Number((z - 0.5).toFixed(1))))}
                    className="p-1 text-[#7D726A] hover:text-[#2D2825] cursor-pointer"
                    title="Decrease Zoom"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <span className="text-[11px] font-mono font-bold text-[#2D2825] px-1">
                    {zoomLevel}x Macro
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(4.5, Number((z + 0.5).toFixed(1))))}
                    className="p-1 text-[#7D726A] hover:text-[#2D2825] cursor-pointer"
                    title="Increase Zoom"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <div className="h-3 w-px bg-[#ECE6DE] mx-0.5" />
                  <button
                    onClick={() => setIsLockedZoom(!isLockedZoom)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold transition-colors cursor-pointer ${
                      isLockedZoom
                        ? 'bg-[#8D2434] text-white'
                        : 'text-[#7D726A] hover:text-[#2D2825]'
                    }`}
                  >
                    {isLockedZoom ? 'Zoom Locked' : 'Hover Loupe'}
                  </button>
                  <button
                    onClick={() => setIsFullscreenLightbox(true)}
                    className="p-1 text-[#7D726A] hover:text-[#8D2434] cursor-pointer"
                    title="Fullscreen High-Res View"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* High-Resolution Image Viewport with Interactive Zoom */}
              <div
                ref={imageContainerRef}
                onMouseEnter={() => setIsHoveringImage(true)}
                onMouseLeave={() => setIsHoveringImage(false)}
                onMouseMove={handleMouseMove}
                onTouchMove={handleTouchMove}
                onClick={() => setIsLockedZoom(!isLockedZoom)}
                className="relative aspect-16/9 w-full rounded-2xl overflow-hidden border border-[#ECE6DE] bg-[#1E1B19] cursor-crosshair select-none group"
              >
                {/* Base High-Res Image (scales smoothly when locked or hovered) */}
                <img
                  src={selectedFabric.highResMacroUrl}
                  alt={selectedFabric.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-150 ease-out"
                  style={
                    isHoveringImage || isLockedZoom
                      ? {
                          transform: `scale(${zoomLevel})`,
                          transformOrigin: `${zoomCursorPos.x}% ${zoomCursorPos.y}%`
                        }
                      : undefined
                  }
                />

                {/* Top-Left Metadata Overlay */}
                <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                  <span className="px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] font-mono flex items-center gap-1.5 border border-white/15">
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-white/40"
                      style={{ backgroundColor: selectedFabric.hex }}
                    />
                    {selectedFabric.weightGsm} GSM • {selectedFabric.threadCount.split('(')[0]}
                  </span>
                  {selectedFabric.giCertified && (
                    <span className="px-2.5 py-1 rounded-full bg-[#D4AF37]/90 text-[#2D2825] text-[10px] font-bold flex items-center gap-1 shadow-xs">
                      <Award className="w-3 h-3" />
                      Authentic GI Handloom
                    </span>
                  )}
                </div>

                {/* Interactive Magnifier Reticle / Hint */}
                <div className="absolute bottom-3 right-3 px-3 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] flex items-center gap-1.5 pointer-events-none border border-white/15">
                  <ZoomIn className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>
                    {isHoveringImage || isLockedZoom
                      ? `Inspecting Weave at ${zoomLevel}x (${Math.round(zoomCursorPos.x)}%, ${Math.round(zoomCursorPos.y)}%)`
                      : 'Hover, drag, or tap to zoom high-res fiber grain'}
                  </span>
                </div>
              </div>
            </div>

            {/* Comprehensive Composition & Technical Specification Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#ECE6DE]">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#8E847D] block">
                  Fiber Composition
                </span>
                <p className="font-semibold text-[#2D2825] leading-snug">
                  {selectedFabric.composition}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#8E847D] block">
                  Weave & Thread Density
                </span>
                <p className="font-semibold text-[#2D2825] leading-snug">
                  {selectedFabric.weaveStructure} • {selectedFabric.threadCount}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#ECE6DE]/80">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#8E847D] block">
                  Drape & Tactile Handfeel
                </span>
                <p className="text-[#5A4638] leading-snug">
                  <strong className="text-[#2D2825]">{selectedFabric.drapeProfile}:</strong> {selectedFabric.textureHand}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-[#ECE6DE]/80">
                <span className="text-[10px] uppercase tracking-wider font-bold text-[#8E847D] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#8D2434]" />
                  Weaving Cluster Origin
                </span>
                <p className="text-[#2D2825] font-medium leading-snug">
                  {selectedFabric.origin}
                </p>
              </div>

              <div className="sm:col-span-2 pt-2 border-t border-[#ECE6DE]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-start gap-1.5 text-[11px] text-[#5A4638]">
                  <Droplets className="w-3.5 h-3.5 text-[#8D2434] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#2D2825]">Care:</strong> {selectedFabric.careInstructions}
                  </span>
                </div>
              </div>
            </div>

            {/* Master Tailor Note */}
            <div className="p-3 rounded-xl bg-[#FFFDF9] border border-[#E8DFC8] flex items-start gap-2.5 text-xs">
              <Scissors className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-[#2D2825] text-[11px] block">
                  Master Tailor Construction Advisory ({selectedFabric.bestFor})
                </span>
                <p className="text-[11px] text-[#5A4638] font-light mt-0.5">
                  {selectedFabric.tailorRecommendation}
                </p>
              </div>
            </div>

            {/* Swatch Request & Action Footer */}
            <div className="pt-2 border-t border-[#F4EFEA] space-y-2.5">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={customSwatchNote}
                  onChange={(e) => setCustomSwatchNote(e.target.value)}
                  placeholder={`Optional note for ${tailorName} (e.g., compare under natural daylight, send 4x4" feeler swatch)...`}
                  className="flex-1 px-3.5 py-2.5 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] text-xs text-[#2D2825] placeholder-[#8E847D] focus:outline-none focus:border-[#8D2434]"
                />
                <div className="text-right sm:px-2 shrink-0">
                  <span className="text-[10px] text-[#8E847D] block">Atelier Price</span>
                  <span className="text-sm font-bold text-[#2D2825]">
                    ₹{selectedFabric.pricePerMeterINR.toLocaleString('en-IN')}{' '}
                    <span className="text-[10px] font-normal text-[#7D726A]">/ meter</span>
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  id="request-swatch-chat-btn"
                  onClick={handleRequestSwatchClick}
                  className="flex-1 py-3 px-5 rounded-full bg-[#8D2434] hover:bg-[#741C2A] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>
                    {isAlreadyRequested
                      ? `Send Another Swatch Request to ${tailorName}`
                      : `Request Swatch in Chat with ${tailorName}`}
                  </span>
                </button>

                {onApplyFabricToStudio && (
                  <button
                    onClick={() => {
                      onApplyFabricToStudio(selectedFabric);
                      onClose();
                    }}
                    className="py-3 px-4 rounded-full bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Use in AI Studio</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Fullscreen High-Res Macro Lightbox */}
      {isFullscreenLightbox && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4"
          onClick={() => setIsFullscreenLightbox(false)}
        >
          <div
            className="max-w-4xl w-full space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between text-white">
              <div>
                <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] font-bold">
                  High-Resolution Macro Inspection • {selectedFabric.weightGsm} GSM
                </span>
                <h3 className="font-serif text-xl font-bold">{selectedFabric.name}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoomLevel((z) => (z >= 4 ? 1.5 : Number((z + 0.75).toFixed(2))))}
                  className="px-3 py-1.5 rounded-full bg-white/15 hover:bg-white/25 text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ZoomIn className="w-4 h-4 text-[#D4AF37]" />
                  <span>Zoom: {zoomLevel}x</span>
                </button>
                <button
                  onClick={() => setIsFullscreenLightbox(false)}
                  className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = ((e.clientX - rect.left) / rect.width) * 100;
                const y = ((e.clientY - rect.top) / rect.height) * 100;
                setZoomCursorPos({ x, y });
              }}
              className="relative aspect-16/10 w-full rounded-2xl overflow-hidden border border-white/20 bg-black cursor-crosshair"
            >
              <img
                src={selectedFabric.highResMacroUrl}
                alt={selectedFabric.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover transition-transform duration-150"
                style={{
                  transform: `scale(${zoomLevel})`,
                  transformOrigin: `${zoomCursorPos.x}% ${zoomCursorPos.y}%`
                }}
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/80 bg-white/10 p-3 rounded-xl">
              <span><strong>Composition:</strong> {selectedFabric.composition}</span>
              <span><strong>Weave:</strong> {selectedFabric.weaveStructure}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
