import React, { useState, useRef } from 'react';
import { 
  Sparkles, 
  RotateCcw, 
  Bell, 
  Calendar, 
  Layers, 
  Droplet, 
  Shirt, 
  Heart, 
  Bookmark, 
  BookmarkCheck, 
  Scissors, 
  ChevronDown, 
  Loader2, 
  Camera, 
  Upload, 
  PenTool, 
  Sliders, 
  Check, 
  Eye, 
  X,
  Package
} from 'lucide-react';
import { DressDesign, DressType, Occasion, FabricType, SleeveStyle, NeckDesign } from '../../types';
import { LUXURY_COLORS } from '../../data/mockData';

interface AIDressGeneratorProps {
  onDesignGenerated: (design: DressDesign) => void;
  onOpenNotifications?: () => void;
  onOpenHistory?: () => void;
  onRequestTailor?: (design: DressDesign) => void;
  onViewDesignDetails?: (design: DressDesign) => void;
  initialPrompt?: string;
  initialDressType?: string;
  latestConcept?: DressDesign;
}

export const AIDressGenerator: React.FC<AIDressGeneratorProps> = ({
  onDesignGenerated,
  onOpenNotifications,
  onOpenHistory,
  onRequestTailor,
  onViewDesignDetails,
  initialPrompt,
  initialDressType,
  latestConcept
}) => {
  // Primary Attributes State
  const [dressType, setDressType] = useState<string>(initialDressType || 'Gown');
  const [occasion, setOccasion] = useState<string>('Bridal');
  const [fabric, setFabric] = useState<string>('Silk Organza');
  const [color, setColor] = useState<string>('Pearl blush');
  
  // Secondary Attributes in "More Options"
  const [sleeves, setSleeves] = useState<string>('Long');
  const [neckStyle, setNeckStyle] = useState<string>('Sweetheart');
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);

  // Upload States
  const [sketchFile, setSketchFile] = useState<string | null>(null);
  const [inspirationFile, setInspirationFile] = useState<string | null>(null);
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const inspirationInputRef = useRef<HTMLInputElement>(null);

  // Active Dropdown
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Prompt state
  const [prompt, setPrompt] = useState<string>(
    initialPrompt || 'Pastel silk organza gown with hand-finished pearl constellation and fluid train'
  );

  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // Options for Dropdowns
  const optionsMap: Record<string, string[]> = {
    dressType: ['Gown', 'Lehenga', 'Anarkali', 'Saree Gown', 'Corset Dress', 'Empire Silhouette'],
    occasion: ['Bridal', 'Evening Reception', 'Cocktail', 'Festive', 'Red Carpet Gala'],
    fabric: ['Silk Organza', 'Pure Silk', 'Chiffon', 'French Tulle', 'Georgette', 'Brocade'],
    color: ['Pearl blush', 'Ivory white', 'Midnight navy', 'Rani pink', 'Sage green', 'Antique gold'],
    sleeves: ['Long sheer', 'Cap sleeves', 'Elbow-length', 'Sleeveless', 'Flute sleeves', 'Sheer cape'],
    neckStyle: ['Sweetheart', 'Sculpted V-Neck', 'Square Cut', 'Boat neck', 'Halter', 'Illusion collar']
  };

  // The latest generated or active concept matching reference Screen 2 & 3
  const activeConcept: DressDesign = latestConcept || {
    id: 'design-pearl-blush',
    customerId: 'cust-1',
    customerName: 'Aanya',
    title: 'Pearl Blush Reverie',
    prompt: prompt,
    createdAt: '2026-09-09T18:00:00Z',
    isFavorite: true,
    selectedVariationIndex: 0,
    tags: ['Evening', 'Bridal', 'Pearl blush', 'Silk', 'Gown'],
    variations: [
      {
        id: 'var-pearl-blush',
        name: 'Pastel silk organza gown',
        tagline: 'A soft bridal silhouette with a hand-finished pearl constellation and a fluid train.',
        frontImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
        backImageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000&auto=format&fit=crop&q=80',
        sideImageUrl: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=80',
        fabricDetails: {
          primary: `${fabric} with Mulmul Underlay`,
          lining: 'Breathable Silk Crepe',
          embellishments: 'Hand-finished pearl constellation, bugle glass beads, silver micro-sequins',
          estimatedYards: 7.5,
          recommendedWeightGsm: 180
        },
        tailorNotes: [
          'Hand-finished pearl constellation across bodice and sheer sleeves.',
          'Sweetheart neckline with invisible inner boning structure.',
          'Fluid train with horsehair braid hem for structured sweep.',
          'Concealed back closure with silk loop micro-buttons.'
        ],
        stylingTips: [
          'Pair with teardrop pearl earrings and a delicate diamond choker.',
          'Made for evening ceremonies and grand reception entrances.'
        ],
        colorPsychology: 'Pearl blush radiates timeless poise, serenity, and understated modern elegance.',
        estimatedCraftTimeDays: 14,
        estimatedPriceRange: { min: 4999, max: 7499, currency: 'INR' },
        specs: {
          dressType: dressType as any,
          occasion: occasion as any,
          fabric: fabric as any,
          color: color,
          sleeve: sleeves as any,
          neckline: neckStyle as any,
          pattern: 'Pearl embroidery'
        }
      }
    ]
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      const generatedDesign: DressDesign = {
        ...activeConcept,
        id: `design-${Date.now()}`,
        title: color === 'Pearl blush' ? 'Pearl Blush Reverie' : `${color} Atelier Creation`,
        prompt: prompt,
        createdAt: new Date().toISOString()
      };
      onDesignGenerated(generatedDesign);
    }, 1800);
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
    <div id="ai-dress-studio-screen" className="max-w-md mx-auto space-y-6 sm:space-y-8 pb-24 text-[#2D2825] px-5 sm:px-6">
      
      {/* 1. SCREEN HEADER */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#7D726A] font-medium block">
            Bespoke Creation
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2825]">
            AI Dress Studio
          </h1>
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={onOpenHistory}
            className="w-10 h-10 rounded-full hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE]"
            title="Design History"
          >
            <RotateCcw className="w-4 h-4 text-[#2D2825]" />
          </button>
          <button
            onClick={onOpenNotifications}
            className="relative w-10 h-10 rounded-full hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE]"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-[#2D2825]" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#8D2434] ring-2 ring-[#FAF7F2]" />
          </button>
        </div>
      </div>

      {/* 2. DRESS PREVIEW (Clean Hero preview card with tap to inspect) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#7D726A]">Concept Preview</span>
          <span className="text-[#8D2434] font-medium">{activeConcept.title}</span>
        </div>

        <div 
          onClick={() => onViewDesignDetails && onViewDesignDetails(activeConcept)}
          className="relative aspect-[16/10] rounded-[16px] overflow-hidden bg-[#F5EFEA] border border-[#ECE6DE] shadow-2xs cursor-pointer group"
        >
          <img
            src={activeConcept.variations[0].frontImageUrl}
            alt={activeConcept.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="text-xs font-serif font-medium drop-shadow-sm">
              {activeConcept.variations[0].name}
            </span>
            <div className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[10px] font-semibold text-[#2D2825] flex items-center gap-1 shadow-xs">
              <Eye className="w-3 h-3 text-[#8D2434]" />
              <span>Tap to inspect</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROMPT INPUT */}
      <div className="bg-white rounded-[16px] border border-[#ECE6DE] p-4 shadow-2xs space-y-2">
        <label className="block text-xs font-semibold text-[#2D2825]">
          Describe your dream dress
        </label>
        <textarea
          rows={3}
          maxLength={300}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe silhouettes, embroidery, neckline, or mood..."
          className="w-full text-xs text-[#2D2825] placeholder-[#7D726A] bg-transparent resize-none focus:outline-none leading-relaxed"
        />
        <div className="flex justify-end text-[10px] text-[#7D726A]">
          {prompt.length}/300
        </div>
      </div>

      {/* 4. UPLOAD SKETCH & UPLOAD INSPIRATION IMAGE */}
      <div className="grid grid-cols-2 gap-3">
        {/* Upload Sketch */}
        <input 
          type="file" 
          ref={sketchInputRef} 
          onChange={(e) => handleFileUpload(e, setSketchFile)} 
          accept="image/*" 
          className="hidden" 
        />
        <div 
          onClick={() => sketchInputRef.current?.click()}
          className={`p-3.5 rounded-[16px] border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
            sketchFile 
              ? 'bg-[#FBECEF] border-[#8D2434] text-[#8D2434]' 
              : 'bg-white border-[#ECE6DE] hover:border-[#8D2434] text-[#2D2825]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] flex items-center justify-center shrink-0">
            <PenTool className="w-3.5 h-3.5 text-[#8D2434]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-[#7D726A] block">Hand sketch</span>
            <span className="text-xs font-semibold truncate block">
              {sketchFile ? 'Sketch added ✓' : 'Upload Sketch'}
            </span>
          </div>
        </div>

        {/* Upload Inspiration Image */}
        <input 
          type="file" 
          ref={inspirationInputRef} 
          onChange={(e) => handleFileUpload(e, setInspirationFile)} 
          accept="image/*" 
          className="hidden" 
        />
        <div 
          onClick={() => inspirationInputRef.current?.click()}
          className={`p-3.5 rounded-[16px] border text-left cursor-pointer transition-all flex items-center gap-2.5 ${
            inspirationFile 
              ? 'bg-[#FBECEF] border-[#8D2434] text-[#8D2434]' 
              : 'bg-white border-[#ECE6DE] hover:border-[#8D2434] text-[#2D2825]'
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] flex items-center justify-center shrink-0">
            <Camera className="w-3.5 h-3.5 text-[#8D2434]" />
          </div>
          <div className="min-w-0 flex-1">
            <span className="text-[10px] text-[#7D726A] block">Reference photo</span>
            <span className="text-xs font-semibold truncate block">
              {inspirationFile ? 'Photo added ✓' : 'Inspiration Image'}
            </span>
          </div>
        </div>
      </div>

      {/* 5. PRIMARY ATTRIBUTES: Dress Type, Occasion, Fabric, Color */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Dress Type */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'dressType' ? null : 'dressType')}
            className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Package className="w-4 h-4 text-[#8D2434] shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-[#7D726A] leading-none">Dress Type</div>
                <div className="text-xs font-semibold text-[#2D2825] mt-1 truncate">{dressType}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7D726A] shrink-0 ml-1" />
          </button>
          {activeDropdown === 'dressType' && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1.5 max-h-48 overflow-y-auto">
              {optionsMap.dressType.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setDressType(opt); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    dressType === opt ? 'bg-[#FBECEF] text-[#8D2434]' : 'hover:bg-black/5 text-[#2D2825]'
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
            onClick={() => setActiveDropdown(activeDropdown === 'occasion' ? null : 'occasion')}
            className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-[#8D2434] shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-[#7D726A] leading-none">Occasion</div>
                <div className="text-xs font-semibold text-[#2D2825] mt-1 truncate">{occasion}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7D726A] shrink-0 ml-1" />
          </button>
          {activeDropdown === 'occasion' && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1.5 max-h-48 overflow-y-auto">
              {optionsMap.occasion.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setOccasion(opt); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    occasion === opt ? 'bg-[#FBECEF] text-[#8D2434]' : 'hover:bg-black/5 text-[#2D2825]'
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
            onClick={() => setActiveDropdown(activeDropdown === 'fabric' ? null : 'fabric')}
            className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Layers className="w-4 h-4 text-[#8D2434] shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-[#7D726A] leading-none">Fabric</div>
                <div className="text-xs font-semibold text-[#2D2825] mt-1 truncate">{fabric}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7D726A] shrink-0 ml-1" />
          </button>
          {activeDropdown === 'fabric' && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1.5 max-h-48 overflow-y-auto">
              {optionsMap.fabric.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setFabric(opt); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    fabric === opt ? 'bg-[#FBECEF] text-[#8D2434]' : 'hover:bg-black/5 text-[#2D2825]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Color */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
            className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Droplet className="w-4 h-4 text-[#8D2434] shrink-0" />
              <div className="min-w-0">
                <div className="text-[10px] text-[#7D726A] leading-none">Color</div>
                <div className="text-xs font-semibold text-[#2D2825] mt-1 truncate">{color}</div>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#7D726A] shrink-0 ml-1" />
          </button>
          {activeDropdown === 'color' && (
            <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1.5 max-h-48 overflow-y-auto">
              {optionsMap.color.map((opt) => (
                <button
                  key={opt}
                  onClick={() => { setColor(opt); setActiveDropdown(null); }}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                    color === opt ? 'bg-[#FBECEF] text-[#8D2434]' : 'hover:bg-black/5 text-[#2D2825]'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. "MORE OPTIONS" EXPANDABLE ACCORDION (Sleeves & Neckline) */}
      <div className="space-y-2.5">
        <button
          onClick={() => setShowMoreOptions(!showMoreOptions)}
          className="w-full py-2 flex items-center justify-center gap-1.5 text-xs font-medium text-[#7D726A] hover:text-[#8D2434] transition-colors cursor-pointer"
        >
          <span>{showMoreOptions ? 'Hide sleeve & neckline options' : 'More Options (Sleeves, Neckline)'}</span>
          <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showMoreOptions ? 'rotate-180' : ''}`} />
        </button>

        {showMoreOptions && (
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            {/* Sleeves */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'sleeves' ? null : 'sleeves')}
                className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Shirt className="w-4 h-4 text-[#8D2434] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#7D726A] leading-none">Sleeves</div>
                    <div className="text-xs font-semibold text-[#2D2825] mt-1 truncate">{sleeves}</div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#7D726A] shrink-0 ml-1" />
              </button>
              {activeDropdown === 'sleeves' && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1.5 max-h-48 overflow-y-auto">
                  {optionsMap.sleeves.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setSleeves(opt); setActiveDropdown(null); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                        sleeves === opt ? 'bg-[#FBECEF] text-[#8D2434]' : 'hover:bg-black/5 text-[#2D2825]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Neckline */}
            <div className="relative">
              <button
                onClick={() => setActiveDropdown(activeDropdown === 'neckStyle' ? null : 'neckStyle')}
                className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Heart className="w-4 h-4 text-[#8D2434] shrink-0" />
                  <div className="min-w-0">
                    <div className="text-[10px] text-[#7D726A] leading-none">Neckline</div>
                    <div className="text-xs font-semibold text-[#2D2825] mt-1 truncate">{neckStyle}</div>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[#7D726A] shrink-0 ml-1" />
              </button>
              {activeDropdown === 'neckStyle' && (
                <div className="absolute top-full left-0 right-0 z-30 mt-1 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1.5 max-h-48 overflow-y-auto">
                  {optionsMap.neckStyle.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => { setNeckStyle(opt); setActiveDropdown(null); }}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer ${
                        neckStyle === opt ? 'bg-[#FBECEF] text-[#8D2434]' : 'hover:bg-black/5 text-[#2D2825]'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 7. GENERATE BUTTON (Single primary CTA with 52px height) */}
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full h-[52px] rounded-[16px] bg-[#8D2434] hover:bg-[#781E2C] active:scale-[0.99] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-60"
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-4 h-4 text-white animate-spin" />
            <span>Generating bespoke concept...</span>
          </>
        ) : (
          <>
            <Sparkles className="w-4 h-4 text-white" />
            <span>Generate Bespoke Concept</span>
          </>
        )}
      </button>

    </div>
  );
};
