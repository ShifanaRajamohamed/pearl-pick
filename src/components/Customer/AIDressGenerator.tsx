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
  Wand2
} from 'lucide-react';
import { DressDesign } from '../../types';
import { FabricSwatchGallery, PREDEFINED_FABRICS } from './FabricSwatchGallery';
import { generateCohesiveCoutureAngles } from '../../services/coutureVisualEngine';

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

export const AIDressGenerator: React.FC<AIDressGeneratorProps> = ({
  onDesignGenerated,
  onOpenNotifications,
  onOpenHistory,
  onRequestTailor,
  onViewDesignDetails,
  initialPrompt,
  initialDressType,
  latestConcept,
  gender = 'women',
  onGenderChange,
  onOpenFabricLibrary
}) => {
  // Primary Attributes State
  const [dressType, setDressType] = useState<string>(
    initialDressType || (gender === 'men' ? 'Royal Jodhpuri Bandhgala' : 'Gown')
  );
  const [occasion, setOccasion] = useState<string>(
    gender === 'men' ? 'Groom & Royal Baraat' : 'Bridal'
  );
  const [fabric, setFabric] = useState<string>(
    gender === 'men' ? 'Pure Banarasi Raw Silk' : 'Silk Organza'
  );
  const [color, setColor] = useState<string>(
    gender === 'men' ? 'Kashi Midnight Obsidian' : 'Pearl blush'
  );
  
  // Secondary Attributes in "More Options"
  const [sleeves, setSleeves] = useState<string>(
    gender === 'men' ? 'French Tailored Cuffs' : 'Long sheer'
  );
  const [neckStyle, setNeckStyle] = useState<string>(
    gender === 'men' ? 'Mandarin Bandhgala Collar' : 'Sweetheart'
  );
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);
  const [previewAngle, setPreviewAngle] = useState<'front' | 'back' | 'side' | 'detail'>('front');

  // Upload States
  const [sketchFile, setSketchFile] = useState<string | null>(null);
  const [inspirationFile, setInspirationFile] = useState<string | null>(null);
  const sketchInputRef = useRef<HTMLInputElement>(null);
  const inspirationInputRef = useRef<HTMLInputElement>(null);

  // Active Dropdown
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  // Prompt state
  const defaultPrompt = gender === 'men'
    ? 'Midnight obsidian raw silk Bandhgala jacket with antique gold zardozi collar embroidery, brass lion-crest buttons, and tailored jodhpur breeches'
    : 'Pastel silk organza gown with hand-finished pearl constellation and fluid train';

  const [prompt, setPrompt] = useState<string>(initialPrompt || defaultPrompt);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<number>(0);

  // Structured Prompt Builder State: injects dress-type-specific style keywords ('couture', 'high-fashion', 'macro-detail', etc.)
  const DRESS_TYPE_STYLE_KEYWORDS: Record<string, string[]> = React.useMemo(() => ({
    // Women's Couture Dress Types
    'Gown': ['couture', 'high-fashion', 'macro-detail', 'floor-sweeping train', 'sculpted boned bodice', 'French bias drape', 'editorial runway lighting'],
    'Lehenga': ['couture', 'high-fashion', 'macro-detail', '16-kali royal flare', '24K zardozi border', 'sculpted choli', 'scalloped organza dupatta'],
    'Anarkali': ['couture', 'high-fashion', 'macro-detail', 'floor-grazing kalidar panels', 'Mughal jari work', 'architectural ghera', 'hand-knotted tassels'],
    'Saree Gown': ['couture', 'high-fashion', 'macro-detail', 'pre-pleated pallu drape', 'structured corset blouse', 'metallic kasab border', 'sculptural silhouette'],
    'Corset Dress': ['couture', 'high-fashion', 'macro-detail', 'spiral steel boning', 'contoured bustier', 'draped silk overskirt', 'atelier stitch precision'],
    'Empire Silhouette': ['couture', 'high-fashion', 'macro-detail', 'raised empire waistline', 'elongated columnar fall', 'pearl constellation applique', 'fluid chiffon train'],
    // Men's Bespoke Dress Types
    'Royal Jodhpuri Bandhgala': ['couture', 'high-fashion', 'macro-detail', 'stiffened mandarin collar', 'hand-padded roped shoulders', 'heritage horn buttons', 'bespoke equestrian cut'],
    'Savile Row 3-Piece Tuxedo': ['couture', 'high-fashion', 'macro-detail', 'floating horsehair canvas', 'satin-faced peak lapels', 'hand-felled barchetta pocket', 'razor-sharp bespoke drape'],
    'Imperial Awadh Sherwani': ['couture', 'high-fashion', 'macro-detail', '24K gold dabka zardozi', 'flared angarkha ghera', 'handloom Banarasi brocade', 'royal kantha stole'],
    'Bespoke Nehru Jacket & Kurta': ['couture', 'high-fashion', 'macro-detail', 'sculpted bandi silhouette', 'precision welt pocket', 'pintuck silk kurta', 'mother-of-pearl buttons'],
    'Italian Double-Breasted Blazer': ['couture', 'high-fashion', 'macro-detail', '6x2 double-breasted stance', 'wide Milanese peak lapel', 'AMF pick-stitched seams', 'Neapolitan shoulder'],
    'Designer Indo-Western Achkan': ['couture', 'high-fashion', 'macro-detail', 'asymmetrical overlap closure', 'architectural draped placket', 'tonal metallic resham', 'structured bespoke hemline'],
    'Luxury Linen Safari Suit': ['couture', 'high-fashion', 'macro-detail', 'bellows box-pleated pockets', 'belted Norfolk waist', 'Belgian linen weave', 'epaulette shoulder tailoring']
  }), []);

  const currentDressKeywords = React.useMemo(() => {
    return DRESS_TYPE_STYLE_KEYWORDS[dressType] || ['couture', 'high-fashion', 'macro-detail', 'bespoke tailoring', 'artisan handwork'];
  }, [DRESS_TYPE_STYLE_KEYWORDS, dressType]);

  const [selectedStyleKeywords, setSelectedStyleKeywords] = useState<string[]>(currentDressKeywords);
  const [autoInjectKeywords, setAutoInjectKeywords] = useState<boolean>(true);
  const [showStructuredBuilder, setShowStructuredBuilder] = useState<boolean>(true);

  // Sync active style keywords whenever dressType changes
  useEffect(() => {
    setSelectedStyleKeywords(DRESS_TYPE_STYLE_KEYWORDS[dressType] || ['couture', 'high-fashion', 'macro-detail', 'bespoke tailoring']);
  }, [dressType, DRESS_TYPE_STYLE_KEYWORDS]);

  // Build structured prompt that injects specific style keywords based on selected dressType
  const compiledStructuredPrompt = React.useMemo(() => {
    const baseVision = prompt.trim() || `${color} ${fabric} ${dressType}`;
    const activeTags = selectedStyleKeywords.length > 0
      ? selectedStyleKeywords
      : ['couture', 'high-fashion', 'macro-detail'];

    // Ensure core style keywords are always represented when auto-inject is enabled
    const mergedKeywords = autoInjectKeywords
      ? Array.from(new Set(['couture', 'high-fashion', 'macro-detail', ...activeTags]))
      : activeTags;

    const specsSegment = `[Silhouette: ${dressType} | Fabric: ${fabric} | Palette: ${color} | Neckline/Collar: ${neckStyle} | Sleeve: ${sleeves} | Occasion: ${occasion}]`;
    const keywordsSegment = mergedKeywords.length > 0
      ? `[Style Keywords: ${mergedKeywords.join(', ')}]`
      : '';

    return `${baseVision} ${specsSegment} ${keywordsSegment}`.trim();
  }, [prompt, dressType, fabric, color, neckStyle, sleeves, occasion, selectedStyleKeywords, autoInjectKeywords]);

  const toggleStyleKeyword = (kw: string) => {
    setSelectedStyleKeywords((prev) =>
      prev.includes(kw) ? prev.filter((item) => item !== kw) : [...prev, kw]
    );
  };

  const handleApplyStructuredToPrompt = () => {
    const topKeywords = Array.from(new Set(['couture', 'high-fashion', 'macro-detail', ...selectedStyleKeywords])).slice(0, 6);
    const enriched = `${color} ${fabric} ${dressType} with ${neckStyle.toLowerCase()} and ${sleeves.toLowerCase()} for ${occasion.toLowerCase()} — ${topKeywords.join(', ')}`;
    setPrompt(enriched.slice(0, 300));
  };

  // Update defaults when gender changes
  useEffect(() => {
    if (!initialPrompt) {
      if (gender === 'men') {
        setDressType('Royal Jodhpuri Bandhgala');
        setOccasion('Groom & Royal Baraat');
        setFabric('Pure Banarasi Raw Silk');
        setColor('Kashi Midnight Obsidian');
        setSleeves('French Tailored Cuffs');
        setNeckStyle('Mandarin Bandhgala Collar');
        setPrompt('Midnight obsidian raw silk Bandhgala jacket with antique gold zardozi collar embroidery, brass lion-crest buttons, and tailored jodhpur breeches');
      } else {
        setDressType('Gown');
        setOccasion('Bridal');
        setFabric('Silk Organza');
        setColor('Pearl blush');
        setSleeves('Long sheer');
        setNeckStyle('Sweetheart');
        setPrompt('Pastel silk organza gown with hand-finished pearl constellation and fluid train');
      }
    }
  }, [gender, initialPrompt]);

  // Options for Dropdowns - Gender Adaptive
  const optionsMap: Record<string, string[]> = {
    dressType: gender === 'men' 
      ? ['Royal Jodhpuri Bandhgala', 'Savile Row 3-Piece Tuxedo', 'Imperial Awadh Sherwani', 'Bespoke Nehru Jacket & Kurta', 'Italian Double-Breasted Blazer', 'Designer Indo-Western Achkan', 'Luxury Linen Safari Suit']
      : ['Gown', 'Lehenga', 'Anarkali', 'Saree Gown', 'Corset Dress', 'Empire Silhouette'],
    occasion: gender === 'men'
      ? ['Groom & Royal Baraat', 'Black Tie Gala & Red Carpet', 'Sangeet & Cocktail Night', 'Festive Puja & Diwali', 'Diplomatic & Corporate Luxury']
      : ['Bridal', 'Evening Reception', 'Cocktail', 'Festive', 'Red Carpet Gala'],
    fabric: gender === 'men'
      ? ['Pure Banarasi Raw Silk', 'Italian Super 150s Merino Wool', 'Dense Silk Velvet', 'Irish Herringbone Linen', 'Egyptian Giza Cotton', 'Cashmere Tweed Blend']
      : PREDEFINED_FABRICS.map((f) => f.name),
    color: gender === 'men'
      ? ['Kashi Midnight Obsidian', 'Bordeaux Wine Velvet', 'Imperial Emerald', 'Antique Gold & Ivory', 'Charcoal Slate', 'Morpankhi Peacock Blue']
      : ['Pearl blush', 'Ivory white', 'Midnight navy', 'Rani pink', 'Sage green', 'Antique gold'],
    sleeves: gender === 'men'
      ? ['French Tailored Cuffs', 'AMF Pick-Stitched 4-Button Cuff', 'Churidar Gathered Sleeves', 'Full Length Fitted Cuffs']
      : ['Long sheer', 'Cap sleeves', 'Elbow-length', 'Sleeveless', 'Flute sleeves', 'Sheer cape'],
    neckStyle: gender === 'men'
      ? ['Mandarin Bandhgala Collar', 'Satin Silk Peak Lapel', 'Classic British Notch Lapel', 'Silk Shawl Tuxedo Collar', 'Nehru Stand Collar', 'Angrakha Overlap Collar']
      : ['Sweetheart', 'Sculpted V-Neck', 'Square Cut', 'Boat neck', 'Halter', 'Illusion collar']
  };

  // Quick Prompt Chips with auto-synchronized attributes so preview updates immediately
  const promptSuggestions = gender === 'men'
    ? [
        { label: 'Royal Bandhgala', dressType: 'Royal Jodhpuri Bandhgala', color: 'Kashi Midnight Obsidian', fabric: 'Pure Banarasi Raw Silk', text: 'Royal midnight raw silk Bandhgala with gold dabka collar embroidery and lion buttons' },
        { label: 'Savile Row Tuxedo', dressType: 'Savile Row 3-Piece Tuxedo', color: 'Bordeaux Wine Velvet', fabric: 'Dense Silk Velvet', text: 'Savile Row 3-piece tuxedo in deep Bordeaux wine velvet with Duchess satin peak lapels' },
        { label: 'Imperial Sherwani', dressType: 'Imperial Awadh Sherwani', color: 'Antique Gold & Ivory', fabric: 'Pure Banarasi Raw Silk', text: 'Ivory mulberry silk sherwani with fine hand-worked Lucknowi Chikankari resham embroidery' },
        { label: 'Nehru Jacket Set', dressType: 'Bespoke Nehru Jacket & Kurta', color: 'Imperial Emerald', fabric: 'Pure Banarasi Raw Silk', text: 'Imperial emerald Banarasi brocade Nehru jacket over Egyptian cotton kurta and churidar' }
      ]
    : [
        { label: 'Pearl Blush Gown', dressType: 'Gown', color: 'Pearl blush', fabric: 'Silk Organza', text: 'Pastel silk organza gown with hand-finished pearl constellation and fluid train' },
        { label: 'Bridal Lehenga', dressType: 'Lehenga', color: 'Rani pink', fabric: 'Pure Banarasi Silk', text: 'Rani pink pure raw silk bridal lehenga with heavy 24K gold dabka and zardozi' },
        { label: 'Silk Anarkali', dressType: 'Anarkali', color: 'Ivory white', fabric: 'Chanderi Tissue', text: 'Moonlight ivory georgette Anarkali with intricate shadow work and scalloped organza dupatta' },
        { label: 'Saree Gown', dressType: 'Saree Gown', color: 'Antique gold', fabric: 'Kanjeevaram Zari Silk', text: 'Antique gold pre-pleated Kanjeevaram silk saree gown with Maggam work designer blouse' }
      ];

  // Dynamically generate 4-angle cohesive renders matching current selected studio attributes
  const liveAngles = React.useMemo(() => {
    return generateCohesiveCoutureAngles({
      gender,
      dressType,
      color,
      fabric,
      neckline: neckStyle,
      sleeve: sleeves,
      pattern: gender === 'men' ? 'Hand Zardozi & Dabka Gold' : 'Pearl & Kundan Beadwork',
      title: `${color} ${dressType}`,
      prompt: compiledStructuredPrompt
    });
  }, [gender, dressType, color, fabric, neckStyle, sleeves, compiledStructuredPrompt]);

  const activeConcept: DressDesign = React.useMemo(() => ({
    id: gender === 'men' ? `design-men-${dressType.toLowerCase().replace(/\s+/g, '-')}` : `design-women-${dressType.toLowerCase().replace(/\s+/g, '-')}`,
    customerId: 'cust-1',
    customerName: 'Ananya Verma',
    title: `${color} ${dressType}`,
    prompt: compiledStructuredPrompt,
    createdAt: new Date().toISOString(),
    isFavorite: true,
    selectedVariationIndex: 0,
    tags: [gender === 'men' ? 'Menswear' : 'Womenswear', dressType, color, fabric, occasion, ...selectedStyleKeywords.slice(0, 3)],
    variations: [
      {
        id: `var-live-${gender}`,
        name: `${color} ${dressType}`,
        tagline: `Bespoke ${dressType.toLowerCase()} in ${fabric.toLowerCase()} with ${neckStyle.toLowerCase()} and ${sleeves.toLowerCase()} for ${occasion.toLowerCase()}.`,
        frontImageUrl: liveAngles.front,
        backImageUrl: liveAngles.back,
        sideImageUrl: liveAngles.side,
        detailImageUrl: liveAngles.detail,
        fabricDetails: {
          primary: `${fabric} (Master Loom)`,
          lining: gender === 'men' ? 'Cupro Breathable Anti-Static Lining' : 'Breathable Silk Crepe & Mulmul',
          embellishments: gender === 'men' ? '24K gold dabka collar embroidery, bespoke brass lion-crest buttons' : 'Hand-finished pearl constellation, bugle glass beads, silver zardozi',
          estimatedYards: gender === 'men' ? 5.5 : 7.5,
          recommendedWeightGsm: gender === 'men' ? 340 : 180
        },
        tailorNotes: gender === 'men'
          ? [
              'Hand-basted full horsehair canvas chest piece for lasting sculptural drape.',
              `${neckStyle} reinforced with Japanese collar canvas for upright regal posture.`,
              'Twin side vents with 2-inch interior seam allowance on chest and waist.',
              `${sleeves} with functional horn buttons and hand-sewn buttonholes.`
            ]
          : [
              `Hand-finished embroidery across ${neckStyle.toLowerCase()} bodice and ${sleeves.toLowerCase()}.`,
              'Sculpted inner bodice with invisible boning structure and 2.5-inch margin.',
              'Fluid skirt sweep with horsehair braid hem for structured movement.',
              'Concealed back closure with silk loop micro-buttons.'
            ],
        stylingTips: gender === 'men'
          ? [
              'Pair with an antique pocket square, uncut emerald brooch, and velvet juttis.',
              `Ideal for ${occasion.toLowerCase()} and formal evening ceremonies.`
            ]
          : [
              'Pair with teardrop pearl earrings and a delicate polki choker.',
              `Tailored specifically for ${occasion.toLowerCase()} entrances.`
            ],
        colorPsychology: `${color} radiates sovereign poise, serenity, and timeless couture elegance.`,
        estimatedCraftTimeDays: 14,
        estimatedPriceRange: { min: gender === 'men' ? 28000 : 24000, max: gender === 'men' ? 46000 : 42000, currency: 'INR' },
        specs: {
          dressType: dressType as any,
          occasion: occasion as any,
          fabric: fabric as any,
          color: color,
          sleeve: sleeves as any,
          neckline: neckStyle as any,
          pattern: (gender === 'men' ? 'Hand Zardozi & Dabka Gold' : 'Pearl & Kundan Beadwork') as any
        }
      }
    ]
  }), [gender, dressType, occasion, fabric, color, sleeves, neckStyle, compiledStructuredPrompt, liveAngles, selectedStyleKeywords]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationStage(1);
    setGenerationNotice(`Injecting '${dressType}' couture keywords & initializing AI model...`);

    const stageTimer1 = setTimeout(() => {
      setGenerationStage(2);
      setGenerationNotice('Synthesizing 4-angle couture silhouette & drape proportions...');
    }, 380);

    const stageTimer2 = setTimeout(() => {
      setGenerationStage(3);
      setGenerationNotice('Rendering macro-detail embroidery weave & spec sheet...');
    }, 760);

    const minDelayPromise = new Promise((resolve) => setTimeout(resolve, 1100));

    try {
      const [res] = await Promise.all([
        fetch('/api/gemini/generate-dress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            gender,
            dressType,
            occasion,
            fabric,
            color,
            sleeve: sleeves,
            neckline: neckStyle,
            prompt: compiledStructuredPrompt,
            styleKeywords: selectedStyleKeywords,
            pattern: gender === 'men' ? 'Hand Zardozi & Dabka Gold' : 'Pearl & Kundan Beadwork',
            budget: gender === 'men' ? '₹38,000' : '₹35,000'
          })
        }),
        minDelayPromise
      ]);

      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);

      if (res.ok) {
        const data = await res.json();
        if (data && data.variations && data.variations.length > 0) {
          setIsGenerating(false);
          setGenerationStage(0);
          setGenerationNotice(null);
          onDesignGenerated(data);
          return;
        }
      }
    } catch (err) {
      clearTimeout(stageTimer1);
      clearTimeout(stageTimer2);
      console.warn('Backend generation notice, falling back to curated concept:', err);
    }

    setIsGenerating(false);
    setGenerationStage(0);
    setGenerationNotice(null);

    const assets = generateCohesiveCoutureAngles({
      gender,
      dressType,
      color,
      fabric,
      neckline: neckStyle,
      sleeve: sleeves,
      pattern: gender === 'men' ? 'Hand Zardozi & Dabka Gold' : 'Pearl & Kundan Beadwork',
      title: `${color} ${dressType}`,
      prompt: compiledStructuredPrompt
    });

    const generatedDesign: DressDesign = {
      id: `design-${Date.now()}`,
      customerId: 'cust-1',
      customerName: 'Ananya Verma',
      title: `${color} ${dressType}`,
      prompt: compiledStructuredPrompt,
      createdAt: new Date().toISOString(),
      isFavorite: true,
      selectedVariationIndex: 0,
      tags: [gender === 'men' ? 'Menswear' : 'Womenswear', dressType, color, fabric, 'AI Bespoke', ...selectedStyleKeywords.slice(0, 3)],
      variations: [
        {
          id: `var-${Date.now()}`,
          name: `${color} ${dressType}`,
          tagline: `Bespoke master tailor crafted ${dressType.toLowerCase()} in ${fabric.toLowerCase()} for ${occasion.toLowerCase()}.`,
          frontImageUrl: assets.front,
          backImageUrl: assets.back,
          sideImageUrl: assets.side,
          detailImageUrl: assets.detail,
          fabricDetails: {
            primary: `${fabric} (Master Handloom)`,
            lining: gender === 'men' ? 'Cupro Anti-Static Bemberg' : 'Breathable Mulberry Mulmul',
            embellishments: gender === 'men' ? 'Antique zardozi collar embroidery, lion crest buttons' : 'Hand-finished pearl constellation & resham work',
            estimatedYards: gender === 'men' ? 5.5 : 7.5,
            recommendedWeightGsm: gender === 'men' ? 340 : 180
          },
          tailorNotes: gender === 'men' 
            ? [
                'Full floating horsehair canvas chest piece for natural sculptural drape.',
                'Hand-basted shoulder pads aligned to posture profile.',
                '2-inch alteration allowance across chest, waist, and trousers.',
                'AMF pick stitching along lapel edges and pocket flaps.'
              ]
            : [
                'Invisible interior boning structure in bodice for supportive sculpt.',
                '2.5-inch side margin allowance inside choli/bodice.',
                'Horsehair braid hem along skirts for dramatic fluid sweep.'
              ],
          stylingTips: gender === 'men'
            ? ['Pair with an uncut polki brooch, pure silk pocket square, and handcrafted velvet mojaris.']
            : ['Pair with teardrop pearl earrings, antique gold choker, and embroidered potli bag.'],
          colorPsychology: `${color} communicates elevated majesty, serenity, and contemporary couture poise.`,
          estimatedCraftTimeDays: gender === 'men' ? 14 : 16,
          estimatedPriceRange: { min: gender === 'men' ? 28000 : 25000, max: gender === 'men' ? 48000 : 42000, currency: 'INR' },
          specs: {
            dressType: dressType as any,
            occasion: occasion as any,
            fabric: fabric as any,
            color: color,
            sleeve: sleeves as any,
            neckline: neckStyle as any,
            pattern: (gender === 'men' ? 'Hand Zardozi & Dabka Gold' : 'Pearl & Kundan Beadwork') as any
          }
        }
      ]
    };

    onDesignGenerated(generatedDesign);
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
    <div id="ai-dress-studio-screen" className="w-full max-w-md mx-auto space-y-5 sm:space-y-6 pb-24 text-[#2D2825] px-4 sm:px-5">
      
      {/* 1. SCREEN HEADER & GENDER TOGGLE */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#7D726A] font-semibold block">
            {gender === 'men' ? "Men's Bespoke Atelier" : "Women's Couture Atelier"}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2825]">
            AI Design Studio
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
          onClick={() => onGenderChange ? onGenderChange('women') : null}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
            gender === 'women'
              ? 'bg-white text-[#8D2434] shadow-xs'
              : 'text-[#7D726A] hover:text-[#2D2825]'
          }`}
        >
          Women's Couture
        </button>
        <button
          onClick={() => onGenderChange ? onGenderChange('men') : null}
          className={`flex-1 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-center ${
            gender === 'men'
              ? 'bg-[#2D2825] text-white shadow-xs'
              : 'text-[#7D726A] hover:text-[#2D2825]'
          }`}
        >
          Men's Bespoke Suiting
        </button>
      </div>

      {/* 2. LIVE 4-ANGLE COUTURE PREVIEW WITH SKELETON LOADER ANIMATION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${isGenerating ? 'bg-[#8D2434] animate-ping' : 'bg-emerald-600 animate-pulse'}`} />
            <span className="font-semibold text-[#2D2825]">
              {isGenerating ? 'AI Model Synthesizing Design...' : 'Live Atelier Preview'}
            </span>
          </div>
          <span className="text-[#8D2434] font-semibold truncate max-w-[200px]">{activeConcept.title}</span>
        </div>

        <div className="relative aspect-[4/4.6] rounded-[22px] overflow-hidden bg-[#F5EFEA] border border-[#ECE6DE] shadow-sm group">
          <img
            src={
              previewAngle === 'back' ? activeConcept.variations[0].backImageUrl :
              previewAngle === 'side' ? activeConcept.variations[0].sideImageUrl :
              previewAngle === 'detail' ? (activeConcept.variations[0].detailImageUrl || activeConcept.variations[0].frontImageUrl) :
              activeConcept.variations[0].frontImageUrl
            }
            alt={activeConcept.title}
            onClick={() => !isGenerating && onViewDesignDetails && onViewDesignDetails(activeConcept)}
            className={`w-full h-full object-cover object-top cursor-pointer transition-all duration-500 ${
              isGenerating ? 'scale-105 blur-xs opacity-35' : 'scale-100 opacity-100'
            }`}
          />

          {/* SKELETON LOADER ANIMATION WHILE AI MODEL PROCESSES NEW DESIGN */}
          {isGenerating && (
            <div
              data-testid="ai-generator-skeleton"
              className="absolute inset-0 z-20 bg-[#FAF7F2]/90 backdrop-blur-xs p-4 flex flex-col justify-between animate-in fade-in duration-200"
            >
              {/* Top Skeleton Header Bar */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="h-6 w-14 rounded-full bg-[#E6DDD3] animate-pulse" />
                  <div className="h-6 w-14 rounded-full bg-[#ECE6DE] animate-pulse" />
                  <div className="h-6 w-14 rounded-full bg-[#ECE6DE] animate-pulse" />
                </div>
                <div className="h-6 w-28 rounded-full bg-[#8D2434]/20 border border-[#8D2434]/30 animate-pulse" />
              </div>

              {/* Center Couture Mannequin & Garment Wireframe Skeleton */}
              <div className="my-auto flex flex-col items-center justify-center space-y-3.5 py-2">
                <div className="relative w-36 h-48 rounded-2xl bg-gradient-to-b from-[#ECE6DE] via-[#F5EFEA] to-[#E5DCD0] border border-[#D8CEC2] p-3 flex flex-col items-center justify-between shadow-inner overflow-hidden">
                  {/* Animated couture mannequin proportions */}
                  <div className="w-8 h-8 rounded-full bg-[#D8CEC2] animate-pulse" />
                  <div className="w-20 h-10 rounded-t-xl bg-[#D8CEC2]/90 animate-pulse" />
                  <div className="w-14 h-6 rounded-md bg-[#CFC3B4] animate-pulse" />
                  <div className="w-28 h-20 rounded-b-2xl bg-gradient-to-b from-[#D8CEC2] to-[#C7B9A8] animate-pulse" />
                  {/* Scanning beam indicator */}
                  <div className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-[#8D2434]/60 to-transparent animate-bounce" />
                </div>

                {/* Live AI Stage Progress Pills */}
                <div className="w-full max-w-[260px] bg-white/90 rounded-2xl border border-[#ECE6DE] p-3 shadow-xs space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold text-[#8D2434] uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3 h-3 animate-spin" />
                      <span>AI Couture Synthesis</span>
                    </span>
                    <span>Stage {generationStage || 1}/3</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-[#ECE6DE] overflow-hidden">
                    <div
                      className={`h-full bg-[#8D2434] rounded-full transition-all duration-300 ${
                        generationStage === 1 ? 'w-1/3' : generationStage === 2 ? 'w-2/3' : 'w-full'
                      }`}
                    />
                  </div>
                  <p className="text-[11px] font-medium text-[#2D2825] truncate">
                    {generationNotice || 'Synthesizing bespoke silhouette...'}
                  </p>
                  {/* Skeleton spec lines */}
                  <div className="space-y-1.5 pt-1">
                    <div className="h-2.5 w-full rounded-full bg-[#ECE6DE] animate-pulse" />
                    <div className="h-2.5 w-4/5 rounded-full bg-[#ECE6DE] animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Bottom 4-Angle Thumbnail Skeletons */}
              <div className="grid grid-cols-4 gap-2">
                {['Front', 'Back', 'Side', 'Macro'].map((label) => (
                  <div
                    key={label}
                    className="h-10 rounded-xl bg-[#E6DDD3]/90 border border-[#D8CEC2] p-1.5 flex flex-col justify-between animate-pulse"
                  >
                    <div className="h-2 w-8 rounded bg-[#CFC3B4]" />
                    <span className="text-[9px] font-bold text-[#7D726A]">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Top Angle Switcher Bar */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
            <div className="flex items-center gap-1 bg-black/55 backdrop-blur-md p-1 rounded-full border border-white/15">
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
                  {ang === 'detail' ? 'Macro' : ang.charAt(0).toUpperCase() + ang.slice(1)}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => onViewDesignDetails && onViewDesignDetails(activeConcept)}
              className="px-3 py-1.5 rounded-full bg-white/95 hover:bg-white text-[10px] font-bold text-[#2D2825] flex items-center gap-1 shadow-sm cursor-pointer"
            >
              <Eye className="w-3 h-3 text-[#8D2434]" />
              <span>Full Spec & Yardage</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. PROMPT INPUT & STRUCTURED PROMPT BUILDER */}
      <div className="bg-white rounded-[20px] border border-[#ECE6DE] p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#2D2825]">
            {gender === 'men' ? 'Describe your bespoke menswear vision' : 'Describe your couture dress vision'}
          </label>
          <span className="px-2 py-0.5 rounded-full bg-[#FBECEF] text-[#8D2434] text-[10px] font-bold">
            {dressType}
          </span>
        </div>
        <textarea
          rows={3}
          maxLength={300}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={gender === 'men' ? 'e.g. Royal raw silk bandhgala with antique brass buttons and jodhpur breeches...' : 'e.g. Pastel silk organza gown with hand-finished pearl constellation and fluid train...'}
          className="w-full text-xs text-[#2D2825] placeholder-[#7D726A] bg-transparent resize-none focus:outline-none leading-relaxed"
        />
        <div className="flex items-center justify-between text-[10px] text-[#7D726A] pt-1 border-t border-[#FAF7F2]">
          <span className="italic">Live Silhouette & Color Sync Active</span>
          <span>{prompt.length}/300</span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          {promptSuggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => {
                setPrompt(item.text);
                setDressType(item.dressType);
                setColor(item.color);
                setFabric(item.fabric);
              }}
              className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] text-[10px] font-medium text-[#7D726A] hover:text-[#2D2825] hover:border-[#8D2434] transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* STRUCTURED PROMPT BUILDER (Injects 'couture', 'high-fashion', 'macro-detail' & dress-type keywords) */}
        <div className="rounded-2xl bg-[#FAF7F2] border border-[#ECE6DE] p-3 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Wand2 className="w-3.5 h-3.5 text-[#8D2434]" />
              <span className="text-[11px] font-bold text-[#2D2825]">
                Structured Prompt Builder
              </span>
              <span className="px-1.5 py-0.5 rounded bg-[#8D2434]/10 text-[#8D2434] text-[9px] font-bold uppercase">
                Auto-Injected
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowStructuredBuilder(!showStructuredBuilder)}
              className="text-[10px] font-semibold text-[#8D2434] cursor-pointer hover:underline"
            >
              {showStructuredBuilder ? 'Compact' : 'Expand'}
            </button>
          </div>

          <p className="text-[10px] text-[#7D726A] leading-relaxed">
            Automatically injects <span className="font-semibold text-[#2D2825]">couture</span>, <span className="font-semibold text-[#2D2825]">high-fashion</span>, <span className="font-semibold text-[#2D2825]">macro-detail</span>, and <span className="font-semibold text-[#8D2434]">{dressType}</span> craft keywords to maximize AI design relevance.
          </p>

          {/* Keyword Chips for Selected Dress Type */}
          <div className="flex flex-wrap gap-1.5">
            {currentDressKeywords.map((kw) => {
              const isSelected = selectedStyleKeywords.includes(kw);
              return (
                <button
                  key={kw}
                  type="button"
                  onClick={() => toggleStyleKeyword(kw)}
                  className={`px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all cursor-pointer flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#2D2825] text-white shadow-2xs'
                      : 'bg-white text-[#7D726A] border border-[#ECE6DE] hover:border-[#8D2434]'
                  }`}
                >
                  <span>#{kw}</span>
                  {isSelected && <span className="text-[#E8C5CC] text-[9px]">✓</span>}
                </button>
              );
            })}
          </div>

          {showStructuredBuilder && (
            <div className="space-y-2 pt-1">
              <div className="p-2.5 rounded-xl bg-white border border-[#ECE6DE] text-[10px] text-[#5C534B] font-mono leading-relaxed break-words">
                <span className="text-[9px] uppercase font-sans font-bold text-[#8D2434] block mb-0.5">
                  Compiled AI Model Payload:
                </span>
                {compiledStructuredPrompt}
              </div>

              <div className="flex items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-[10px] font-medium text-[#2D2825] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoInjectKeywords}
                    onChange={(e) => setAutoInjectKeywords(e.target.checked)}
                    className="rounded border-[#ECE6DE] text-[#8D2434] focus:ring-[#8D2434]"
                  />
                  <span>Always inject core couture keywords</span>
                </label>

                <button
                  type="button"
                  onClick={handleApplyStructuredToPrompt}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-[#FBECEF] text-[#8D2434] border border-[#8D2434]/30 text-[10px] font-bold transition-colors cursor-pointer shrink-0"
                >
                  Write into Prompt Box
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. FABRIC SWATCH GALLERY (Women or Men) */}
      <FabricSwatchGallery
        selectedFabricName={fabric}
        onSelectFabric={(swatch) => {
          setFabric(swatch.name);
        }}
        currentPrompt={prompt}
        onUpdatePromptWithFabric={(newPrompt) => {
          setPrompt(newPrompt.slice(0, 300));
        }}
      />

      {/* 5. UPLOAD SKETCH & UPLOAD INSPIRATION IMAGE */}
      <div className="grid grid-cols-2 gap-2.5">
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
            <span className="text-[9px] text-[#7D726A] block">Hand sketch</span>
            <span className="text-xs font-semibold truncate block">
              {sketchFile ? 'Added ✓' : 'Upload Sketch'}
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
            <span className="text-[9px] text-[#7D726A] block">Reference</span>
            <span className="text-xs font-semibold truncate block">
              {inspirationFile ? 'Added ✓' : 'Inspiration'}
            </span>
          </div>
        </div>
      </div>

      {/* 6. PRIMARY ATTRIBUTES: Garment Type, Occasion, Fabric, Color */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Silhouette / Type */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'dressType' ? null : 'dressType')}
            className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <Package className="w-4 h-4 text-[#8D2434] shrink-0" />
              <div className="min-w-0">
                <div className="text-[9px] text-[#7D726A] leading-none">Garment Type</div>
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
                <div className="text-[9px] text-[#7D726A] leading-none">Occasion</div>
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
                <div className="text-[9px] text-[#7D726A] leading-none">Fabric</div>
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

        {/* Color Palette */}
        <div className="relative">
          <button
            onClick={() => setActiveDropdown(activeDropdown === 'color' ? null : 'color')}
            className="w-full bg-white rounded-[16px] border border-[#ECE6DE] p-3 text-left shadow-2xs hover:border-[#8D2434] transition-all flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-4 h-4 rounded-full border border-[#ECE6DE] bg-[#2D2825] shrink-0" />
              <div className="min-w-0">
                <div className="text-[9px] text-[#7D726A] leading-none">Color</div>
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

      {/* 7. SECONDARY ATTRIBUTES: Collar / Lapels & Sleeves / Cuffs */}
      <div className="bg-[#FAF7F2] rounded-[18px] border border-[#ECE6DE] p-3.5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#2D2825]">
            {gender === 'men' ? 'Tailoring Cut & Collar Details' : 'Neckline & Sleeve Styling'}
          </span>
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            className="text-[11px] font-semibold text-[#8D2434] cursor-pointer"
          >
            {showMoreOptions ? 'Hide' : 'Customize Details'}
          </button>
        </div>

        {showMoreOptions && (
          <div className="grid grid-cols-2 gap-2.5 pt-1 animate-in fade-in duration-200">
            {/* Neck / Lapel */}
            <div>
              <label className="text-[9px] uppercase font-bold text-[#7D726A] block mb-1">
                {gender === 'men' ? 'Collar / Lapel' : 'Neckline Style'}
              </label>
              <select
                value={neckStyle}
                onChange={(e) => setNeckStyle(e.target.value)}
                className="w-full bg-white border border-[#ECE6DE] rounded-xl p-2 text-xs text-[#2D2825] font-semibold focus:outline-none"
              >
                {optionsMap.neckStyle.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            {/* Sleeve / Cuff */}
            <div>
              <label className="text-[9px] uppercase font-bold text-[#7D726A] block mb-1">
                {gender === 'men' ? 'Cuff / Sleeve Stance' : 'Sleeve Style'}
              </label>
              <select
                value={sleeves}
                onChange={(e) => setSleeves(e.target.value)}
                className="w-full bg-white border border-[#ECE6DE] rounded-xl p-2 text-xs text-[#2D2825] font-semibold focus:outline-none"
              >
                {optionsMap.sleeves.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {onOpenFabricLibrary && (
          <div className="pt-2 border-t border-[#ECE6DE] flex items-center justify-between">
            <span className="text-[11px] text-[#7D726A]">
              Want to inspect high-res weaves & request a feeler swatch?
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

      {/* 8. GENERATE BUTTON */}
      <div className="space-y-2 pt-1">
        {generationNotice && (
          <p className="text-xs text-center text-[#8D2434] animate-pulse">
            {generationNotice}
          </p>
        )}

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 rounded-full bg-[#2D2825] hover:bg-[#1A1816] active:scale-[0.98] transition-all text-white font-semibold text-xs uppercase tracking-widest shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          <Sparkles className="w-4 h-4 text-[#E8C5CC]" />
          <span>
            {isGenerating 
              ? 'Synthesizing Couture...' 
              : gender === 'men' 
                ? 'Generate Bespoke Menswear' 
                : 'Generate Dream Dress'}
          </span>
        </button>
      </div>

    </div>
  );
};
