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
  Package
} from 'lucide-react';
import { DressDesign } from '../../types';
import { FabricSwatchGallery, PREDEFINED_FABRICS } from './FabricSwatchGallery';

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
  onGenderChange
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
    gender === 'men' ? 'French Tailored Cuffs' : 'Long'
  );
  const [neckStyle, setNeckStyle] = useState<string>(
    gender === 'men' ? 'Mandarin Bandhgala Collar' : 'Sweetheart'
  );
  const [showMoreOptions, setShowMoreOptions] = useState<boolean>(false);

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
        setSleeves('Long');
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

  // Quick Prompt Chips
  const promptSuggestions = gender === 'men'
    ? [
        { label: 'Royal Bandhgala', text: 'Royal midnight raw silk Bandhgala with gold dabka collar embroidery and lion buttons' },
        { label: 'Savile Row Tuxedo', text: 'Savile Row 3-piece tuxedo in deep Bordeaux wine velvet with Duchess satin peak lapels' },
        { label: 'Imperial Sherwani', text: 'Ivory mulberry silk sherwani with fine hand-worked Lucknowi Chikankari resham embroidery' },
        { label: 'Nehru Jacket Set', text: 'Golden ochre Banarasi brocade Nehru jacket over Egyptian cotton kurta and churidar' }
      ]
    : [
        { label: 'Pearl Blush Gown', text: 'Pastel silk organza gown with hand-finished pearl constellation and fluid train' },
        { label: 'Bridal Lehenga', text: 'Rani pink pure raw silk bridal lehenga with heavy 24K gold dabka and zardozi' },
        { label: 'Silk Anarkali', text: 'Moonlight ivory georgette Anarkali with intricate shadow work and scalloped organza dupatta' },
        { label: 'Saree Gown', text: 'Rosewater pre-pleated Kanjeevaram silk saree gown with Maggam work designer blouse' }
      ];

  // The latest generated or active concept (guaranteed to match current gender)
  const isLatestConceptMatching = latestConcept && (
    (gender === 'men' && (latestConcept.tags?.some(t => t.toLowerCase().includes('men')) || latestConcept.id.includes('men'))) ||
    (gender === 'women' && !latestConcept.id.includes('men') && !latestConcept.tags?.some(t => t.toLowerCase().includes('men')))
  );

  const activeConcept: DressDesign = (isLatestConceptMatching ? latestConcept : null) || (gender === 'men' ? {
    id: 'design-men-bandhgala',
    customerId: 'cust-1',
    customerName: 'Ananya Verma',
    title: 'The Royal Rajputana Jodhpuri Bandhgala',
    prompt: prompt,
    createdAt: '2026-09-10T14:00:00Z',
    isFavorite: true,
    selectedVariationIndex: 0,
    tags: ['Menswear', 'Bandhgala', 'Royal', 'Raw Silk', 'Bespoke', 'Groom'],
    variations: [
      {
        id: 'var-men-bandhgala-1',
        name: 'Royal Rajputana Obsidian Bandhgala',
        tagline: 'Imperial raw silk bandhgala with antique dabka zardozi needlework and bespoke breeches.',
        frontImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
        backImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
        sideImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
        detailImageUrl: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80',
        fabricDetails: {
          primary: 'Pure Banarasi Raw Silk & Floating Horsehair Canvas',
          lining: 'Cupro Breathable Anti-Static Lining',
          embellishments: '24K gold dabka collar embroidery, bespoke brass lion-crest buttons',
          estimatedYards: 5.5,
          recommendedWeightGsm: 340
        },
        tailorNotes: [
          'Hand-basted full horsehair canvas chest piece for lasting sculptural drape.',
          'Mandarin collar reinforced with Japanese collar canvas for upright regal posture.',
          'Twin side vents with 2-inch interior seam allowance on chest and waist.',
          'Tapered Jodhpur trousers with concealed inner ankle zips and horn buttons.'
        ],
        stylingTips: [
          'Pair with an antique pocket square, uncut emerald brooch, and velvet juttis.',
          'Ideal for royal wedding baraat, reception gala, and festive evening ceremonies.'
        ],
        colorPsychology: 'Midnight Obsidian communicates sovereign dignity, authority, and classical luxury.',
        estimatedCraftTimeDays: 14,
        estimatedPriceRange: { min: 32000, max: 48000, currency: 'INR' },
        specs: {
          dressType: 'Royal Jodhpuri Bandhgala',
          occasion: 'Groom & Royal Baraat',
          fabric: 'Pure Raw Silk',
          color: 'Kashi Midnight Obsidian',
          sleeve: 'French Tailored Cuffs',
          neckline: 'Mandarin Bandhgala',
          pattern: 'Hand Zardozi & Dabka Gold'
        }
      }
    ]
  } : {
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
        backImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
        sideImageUrl: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=80',
        detailImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
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
          pattern: 'Pearl & Kundan Beadwork' as any
        }
      }
    ]
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGenerationNotice('Consulting Gemini AI Atelier engine & synthesizing haute couture concept...');

    try {
      const res = await fetch('/api/gemini/generate-dress', {
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
          prompt,
          pattern: gender === 'men' ? 'Hand Zardozi & Dabka Gold' : 'Pearl & Kundan Beadwork',
          budget: gender === 'men' ? '₹38,000' : '₹35,000'
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data && data.variations && data.variations.length > 0) {
          setIsGenerating(false);
          setGenerationNotice(null);
          onDesignGenerated(data);
          return;
        }
      }
    } catch (err) {
      console.warn('Backend generation notice, falling back to curated concept:', err);
    }

    setIsGenerating(false);
    setGenerationNotice(null);

    // Dynamic cohesive assets guaranteeing matching Front, Back, Side, and Detail
    const menCohesiveSets = {
      bandhgala: {
        front: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
        back: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
        side: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
        detail: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80'
      },
      tuxedo: {
        front: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
        back: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
        side: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
        detail: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80'
      },
      sherwani: {
        front: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1000&auto=format&fit=crop&q=80',
        back: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1000&auto=format&fit=crop&q=80',
        side: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1000&auto=format&fit=crop&q=80',
        detail: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80'
      }
    };

    const womenCohesiveSets = {
      lehenga: {
        front: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
        back: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
        side: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
        detail: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'
      },
      gown: {
        front: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
        back: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
        side: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=80',
        detail: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80'
      },
      saree: {
        front: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
        back: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
        side: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=80',
        detail: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80'
      }
    };

    const dLower = dressType.toLowerCase();
    const assets = gender === 'men'
      ? (dLower.includes('tuxedo') || dLower.includes('suit') ? menCohesiveSets.tuxedo : dLower.includes('sherwani') ? menCohesiveSets.sherwani : menCohesiveSets.bandhgala)
      : (dLower.includes('gown') || dLower.includes('corset') ? womenCohesiveSets.gown : dLower.includes('saree') || dLower.includes('anarkali') ? womenCohesiveSets.saree : womenCohesiveSets.lehenga);

    const generatedDesign: DressDesign = {
      id: `design-${Date.now()}`,
      customerId: 'cust-1',
      customerName: 'Ananya Verma',
      title: `${color} ${dressType}`,
      prompt: prompt,
      createdAt: new Date().toISOString(),
      isFavorite: true,
      selectedVariationIndex: 0,
      tags: [gender === 'men' ? 'Menswear' : 'Womenswear', dressType, color, fabric, 'AI Bespoke'],
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
            title="Design History"
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

      {/* 2. DRESS PREVIEW (Clean Hero preview card with tap to inspect) */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-[#7D726A]">Concept Preview</span>
          <span className="text-[#8D2434] font-semibold truncate max-w-[200px]">{activeConcept.title}</span>
        </div>

        <div 
          onClick={() => onViewDesignDetails && onViewDesignDetails(activeConcept)}
          className="relative aspect-[16/10] rounded-[20px] overflow-hidden bg-[#F5EFEA] border border-[#ECE6DE] shadow-xs cursor-pointer group"
        >
          <img
            src={activeConcept.variations[0].frontImageUrl}
            alt={activeConcept.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover object-top group-hover:scale-102 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
          
          <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
            <span className="text-xs font-serif font-medium drop-shadow-sm truncate pr-2">
              {activeConcept.variations[0].name}
            </span>
            <div className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[10px] font-semibold text-[#2D2825] flex items-center gap-1 shadow-xs shrink-0">
              <Eye className="w-3 h-3 text-[#8D2434]" />
              <span>Inspect</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. PROMPT INPUT */}
      <div className="bg-white rounded-[20px] border border-[#ECE6DE] p-4 shadow-2xs space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-[#2D2825]">
            {gender === 'men' ? 'Describe your bespoke menswear vision' : 'Describe your couture dress vision'}
          </label>
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
          <span className="italic">Powered by Gemini AI Atelier Engine</span>
          <span>{prompt.length}/300</span>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 no-scrollbar">
          {promptSuggestions.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => setPrompt(item.text)}
              className="px-2.5 py-1 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] text-[10px] font-medium text-[#7D726A] hover:text-[#2D2825] hover:border-[#8D2434] transition-all whitespace-nowrap cursor-pointer shrink-0"
            >
              {item.label}
            </button>
          ))}
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
