import React, { useState, useMemo } from 'react';
import {
  Heart,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  X,
  ShieldCheck,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Star,
  Check,
  Scissors,
  Layers,
  MapPin,
  Scale,
  RotateCcw,
  Award
} from 'lucide-react';
import { MarketplaceProduct } from '../../types';

interface MarketplaceViewProps {
  products: MarketplaceProduct[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart?: (product: MarketplaceProduct, selectedSize: string) => void;
  onBuyNow: (product: MarketplaceProduct, selectedSize: string) => void;
  onChatSeller: (designerName: string, product: MarketplaceProduct) => void;
  onRequestCustomStitch?: (product: MarketplaceProduct) => void;
  onOpenCart?: () => void;
  cartCount?: number;
  gender?: 'women' | 'men';
}

interface GsmBracket {
  id: string;
  label: string;
  sublabel: string;
  min: number;
  max: number;
}

const GSM_BRACKETS: GsmBracket[] = [
  {
    id: 'Light',
    label: 'Light',
    sublabel: 'Under 180 GSM (Chiffon, Organza, Sheer Net)',
    min: 0,
    max: 179
  },
  {
    id: 'Medium',
    label: 'Medium',
    sublabel: '180 – 300 GSM (Mulberry Silk, Cotton, Satin, Crepe)',
    min: 180,
    max: 300
  },
  {
    id: 'Heavy',
    label: 'Heavy',
    sublabel: '301+ GSM (Banarasi Katan, Kanjeevaram, Velvet)',
    min: 301,
    max: 999
  }
];

const FABRIC_TYPES = [
  'Silk',
  'Cotton',
  'Chiffon',
  'Velvet',
  'Organza',
  'Brocade',
  'Satin',
  'Crepe'
];

const ORIGINS = [
  'Varanasi, Uttar Pradesh',
  'Kanchipuram, Tamil Nadu',
  'Lucknow, Uttar Pradesh',
  'Chanderi, Madhya Pradesh',
  'Jaipur, Rajasthan',
  'Mumbai, Maharashtra',
  'Como, Italy'
];

function doesProductMatchFabricType(
  product: MarketplaceProduct & { resolvedFabricType?: string },
  fabricLabel: string
): boolean {
  const target = fabricLabel.toLowerCase();
  const hay = `${product.fabric || ''} ${product.fabricType || ''} ${product.resolvedFabricType || ''} ${product.description || ''} ${(product.tags || []).join(' ')}`.toLowerCase();

  if (target === 'chiffon') {
    return (
      hay.includes('chiffon') ||
      hay.includes('net') ||
      hay.includes('georgette') ||
      hay.includes('sheer')
    );
  }
  if (target === 'cotton') {
    return hay.includes('cotton') || hay.includes('chanderi') || hay.includes('handloom');
  }
  return hay.includes(target);
}

// Helper to guarantee normalized fabricType, weightGsm, and origin for any product
function resolveProductTextileMeta(product: MarketplaceProduct): {
  fabricType: string;
  weightGsm: number;
  origin: string;
  giCertified: boolean;
} {
  const rawFabric = (product.fabricType || product.fabric || '').toLowerCase();

  let fabricType = product.fabricType || 'Mulberry Silk';
  if (!product.fabricType) {
    if (rawFabric.includes('banarasi')) fabricType = 'Banarasi Katan Silk';
    else if (rawFabric.includes('kanjeevaram') || rawFabric.includes('kanchipuram'))
      fabricType = 'Pure Kanjeevaram Silk';
    else if (rawFabric.includes('velvet')) fabricType = 'Silk Velvet';
    else if (rawFabric.includes('chanderi')) fabricType = 'Chanderi Brocade';
    else if (rawFabric.includes('satin')) fabricType = 'Duchess Satin';
    else if (rawFabric.includes('raw silk')) fabricType = 'Pure Raw Silk';
    else if (rawFabric.includes('crepe') || rawFabric.includes('net') || rawFabric.includes('organza'))
      fabricType = 'Crepe & Organza';
    else fabricType = 'Mulberry Silk';
  }

  let weightGsm = product.weightGsm || product.specs?.weightGsm || 240;
  if (!product.weightGsm && !product.specs?.weightGsm) {
    if (fabricType === 'Silk Velvet') weightGsm = 420;
    else if (fabricType === 'Pure Kanjeevaram Silk') weightGsm = 385;
    else if (fabricType === 'Banarasi Katan Silk') weightGsm = 350;
    else if (fabricType === 'Pure Raw Silk') weightGsm = 320;
    else if (fabricType === 'Duchess Satin') weightGsm = 280;
    else if (fabricType === 'Chanderi Brocade') weightGsm = 195;
    else if (fabricType === 'Crepe & Organza') weightGsm = 120;
  }

  let origin = product.origin || product.specs?.origin || 'Varanasi, Uttar Pradesh';
  if (!product.origin && !product.specs?.origin) {
    if (fabricType === 'Pure Kanjeevaram Silk') origin = 'Kanchipuram, Tamil Nadu';
    else if (fabricType === 'Chanderi Brocade') origin = 'Chanderi, Madhya Pradesh';
    else if (fabricType === 'Duchess Satin') origin = 'Como, Italy';
    else if (fabricType === 'Silk Velvet') origin = 'Mumbai, Maharashtra';
    else if (fabricType === 'Mulberry Silk') origin = 'Lucknow, Uttar Pradesh';
    else if (fabricType === 'Pure Raw Silk') origin = 'Jaipur, Rajasthan';
  }

  const giCertified =
    product.giCertified !== undefined
      ? product.giCertified
      : ['Banarasi Katan Silk', 'Pure Kanjeevaram Silk', 'Chanderi Brocade'].includes(fabricType);

  return { fabricType, weightGsm, origin, giCertified };
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onChatSeller,
  onRequestCustomStitch,
  onOpenCart,
  cartCount = 0
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedFabricTypes, setSelectedFabricTypes] = useState<string[]>([]);
  const [selectedGsmBrackets, setSelectedGsmBrackets] = useState<string[]>([]);
  const [maxGsmSlider, setMaxGsmSlider] = useState<number>(450);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [onlyGiCertified, setOnlyGiCertified] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [selectedPriceBand, setSelectedPriceBand] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('Featured');

  // Mobile sidebar drawer toggle
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);

  // Accordion states inside the luxury sidebar
  const [openSections, setOpenSections] = useState<{
    fabric: boolean;
    gsm: boolean;
    origin: boolean;
    priceColor: boolean;
  }>({
    fabric: true,
    gsm: true,
    origin: true,
    priceColor: true
  });

  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [activePhotoIndex, setActivePhotoIndex] = useState<number>(0);
  const [addedFeedbackId, setAddedFeedbackId] = useState<string | null>(null);

  const categories = [
    'All',
    'Bridal',
    'Festive',
    'Party',
    'Traditional',
    'Western',
    'Casual',
    "Men's Bespoke"
  ];
  const colors = [
    'All',
    'Red / Crimson',
    'Pink / Blush',
    'Ivory / Champagne',
    'Emerald / Green',
    'Midnight / Black',
    'Gold / Ochre'
  ];
  const priceBands = [
    { id: 'All', label: 'Any Price' },
    { id: 'under-15000', label: 'Under ₹15,000' },
    { id: '15000-30000', label: '₹15,000 – ₹30,000' },
    { id: 'above-30000', label: 'Above ₹30,000' }
  ];

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleArrayValue = (list: string[], value: string, setter: (next: string[]) => void) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  // Enrich visible products with resolved textile metadata
  const enrichedProducts = useMemo(() => {
    return products
      .filter((p) => p.moderationStatus !== 'REMOVED' && p.moderationStatus !== 'FLAGGED')
      .map((p) => {
        const meta = resolveProductTextileMeta(p);
        return {
          ...p,
          resolvedFabricType: meta.fabricType,
          resolvedWeightGsm: meta.weightGsm,
          resolvedOrigin: meta.origin,
          resolvedGiCertified: meta.giCertified
        };
      });
  }, [products]);

  // Facet counts for sidebar options
  const facetCounts = useMemo(() => {
    const fabricMap: Record<string, number> = {};
    const gsmMap: Record<string, number> = {};
    const originMap: Record<string, number> = {};

    enrichedProducts.forEach((p) => {
      FABRIC_TYPES.forEach((ft) => {
        if (doesProductMatchFabricType(p, ft)) {
          fabricMap[ft] = (fabricMap[ft] || 0) + 1;
        }
      });

      originMap[p.resolvedOrigin] = (originMap[p.resolvedOrigin] || 0) + 1;

      GSM_BRACKETS.forEach((b) => {
        if (p.resolvedWeightGsm >= b.min && p.resolvedWeightGsm <= b.max) {
          gsmMap[b.id] = (gsmMap[b.id] || 0) + 1;
        }
      });
    });

    return { fabricMap, gsmMap, originMap };
  }, [enrichedProducts]);

  const filteredProducts = useMemo(() => {
    const list = enrichedProducts.filter((p) => {
      const hay = `${p.title} ${p.designerName} ${p.fabric} ${p.resolvedFabricType} ${p.resolvedOrigin} ${p.description} ${p.categoryLabel} ${(p.tags || []).join(' ')} ${p.specs?.color || ''} ${p.color || ''} ${p.occasion || ''} ${p.style || ''}`.toLowerCase();

      if (searchQuery.trim() && !hay.includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (selectedCategory !== 'All') {
        if (selectedCategory === "Men's Bespoke") {
          const isMen =
            hay.includes('men') ||
            hay.includes('bandhgala') ||
            hay.includes('tuxedo') ||
            hay.includes('sherwani') ||
            hay.includes('kurta');
          if (!isMen) return false;
        } else if (!hay.includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // 1. Granular Fabric Type filter (Silk, Cotton, Chiffon, Velvet, Organza, Brocade, Satin, Crepe)
      if (selectedFabricTypes.length > 0) {
        const matchesFabric = selectedFabricTypes.some((ft) =>
          doesProductMatchFabricType(p, ft)
        );
        if (!matchesFabric) return false;
      }

      // 2. Weight Ranges (Light, Medium, Heavy) + GSM ceiling slider
      if (p.resolvedWeightGsm > maxGsmSlider) {
        return false;
      }
      if (selectedGsmBrackets.length > 0) {
        const matchesGsm = selectedGsmBrackets.some((bId) => {
          const bracket = GSM_BRACKETS.find((b) => b.id === bId);
          if (!bracket) return false;
          return p.resolvedWeightGsm >= bracket.min && p.resolvedWeightGsm <= bracket.max;
        });
        if (!matchesGsm) return false;
      }

      // 3. Origin filter
      if (selectedOrigins.length > 0) {
        const matchesOrigin = selectedOrigins.some(
          (orig) => p.resolvedOrigin.toLowerCase() === orig.toLowerCase()
        );
        if (!matchesOrigin) return false;
      }

      // 4. GI Certified heritage toggle
      if (onlyGiCertified && !p.resolvedGiCertified) {
        return false;
      }

      // 5. Colour & Price Band
      if (selectedColor !== 'All') {
        const colorKey = selectedColor.split('/')[0].trim().toLowerCase();
        if (!hay.includes(colorKey)) return false;
      }

      if (selectedPriceBand === 'under-15000' && p.price >= 15000) return false;
      if (selectedPriceBand === '15000-30000' && (p.price < 15000 || p.price > 30000)) return false;
      if (selectedPriceBand === 'above-30000' && p.price <= 30000) return false;

      return true;
    });

    if (selectedSort === 'Price: Low to High') {
      return [...list].sort((a, b) => a.price - b.price);
    }
    if (selectedSort === 'Price: High to Low') {
      return [...list].sort((a, b) => b.price - a.price);
    }
    if (selectedSort === 'Weight: Heavy to Light (GSM)') {
      return [...list].sort((a, b) => b.resolvedWeightGsm - a.resolvedWeightGsm);
    }
    if (selectedSort === 'Weight: Light to Heavy (GSM)') {
      return [...list].sort((a, b) => a.resolvedWeightGsm - b.resolvedWeightGsm);
    }
    if (selectedSort === 'Top Rated') {
      return [...list].sort((a, b) => b.rating - a.rating);
    }
    return list;
  }, [
    enrichedProducts,
    searchQuery,
    selectedCategory,
    selectedFabricTypes,
    selectedGsmBrackets,
    maxGsmSlider,
    selectedOrigins,
    onlyGiCertified,
    selectedColor,
    selectedPriceBand,
    selectedSort
  ]);

  const handleOpenProduct = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes?.[0] || 'M');
    setActivePhotoIndex(0);
  };

  const handleQuickAddToCart = (e: React.MouseEvent, product: MarketplaceProduct) => {
    e.stopPropagation();
    const defaultSz = product.sizes?.[0] || 'M';
    if (onAddToCart) {
      onAddToCart(product, defaultSz);
    } else {
      onBuyNow(product, defaultSz);
    }
    setAddedFeedbackId(product.id);
    setTimeout(() => setAddedFeedbackId(null), 1600);
  };

  const getProductAngles = (product: MarketplaceProduct) => {
    const imgs = [
      product.frontImageUrl || product.images[0],
      product.backImageUrl || product.images[1] || product.images[0],
      product.sideImageUrl || product.images[2] || product.images[0]
    ].filter(Boolean);
    return [
      { label: 'Front View', url: imgs[0] },
      { label: 'Back View', url: imgs[1] || imgs[0] },
      { label: 'Side View', url: imgs[2] || imgs[0] }
    ];
  };

  const activeFiltersCount =
    (selectedCategory !== 'All' ? 1 : 0) +
    selectedFabricTypes.length +
    selectedGsmBrackets.length +
    (maxGsmSlider < 450 ? 1 : 0) +
    selectedOrigins.length +
    (onlyGiCertified ? 1 : 0) +
    (selectedColor !== 'All' ? 1 : 0) +
    (selectedPriceBand !== 'All' ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedFabricTypes([]);
    setSelectedGsmBrackets([]);
    setMaxGsmSlider(450);
    setSelectedOrigins([]);
    setOnlyGiCertified(false);
    setSelectedColor('All');
    setSelectedPriceBand('All');
  };

  const renderFilterSidebarContent = () => (
    <div className="space-y-6">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-[#ECE6DE] pb-3.5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-[#8D2434]" />
          <h2 className="font-serif text-base font-bold text-[#2D2825] tracking-tight">
            Atelier Filters
          </h2>
          {activeFiltersCount > 0 && (
            <span className="text-xs font-bold text-[#8D2434] tabular-nums">
              ({activeFiltersCount})
            </span>
          )}
        </div>
        {activeFiltersCount > 0 && (
          <button
            type="button"
            onClick={resetAllFilters}
            className="text-[11px] font-bold uppercase tracking-wider text-[#8D2434] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        )}
      </div>

      {/* GI Certified Heritage Provenance Toggle */}
      <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#E4D9D1] flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#8D2434] shrink-0" />
            <span className="text-xs font-bold text-[#2D2825]">GI-Certified Handloom</span>
          </div>
          <p className="text-[11px] text-[#7D726A] mt-0.5 leading-snug">
            Verified Silk Mark & regional weave provenance
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={onlyGiCertified}
          onClick={() => setOnlyGiCertified(!onlyGiCertified)}
          className={`w-10 h-5.5 rounded-full transition-colors p-0.5 cursor-pointer shrink-0 ${
            onlyGiCertified ? 'bg-[#8D2434]' : 'bg-[#D6C7B8]'
          }`}
        >
          <div
            className={`w-4.5 h-4.5 rounded-full bg-white shadow-2xs transition-transform ${
              onlyGiCertified ? 'translate-x-4.5' : 'translate-x-0'
            }`}
          />
        </button>
      </div>

      {/* SECTION 1: FABRIC TYPE */}
      <div className="border-b border-[#ECE6DE] pb-5">
        <button
          type="button"
          onClick={() => toggleSection('fabric')}
          className="w-full flex items-center justify-between text-left py-1 cursor-pointer"
        >
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D2825]">
            <Layers className="w-3.5 h-3.5 text-[#8D2434]" />
            <span>Fabric Type</span>
          </span>
          {openSections.fabric ? (
            <ChevronUp className="w-4 h-4 text-[#7D726A]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#7D726A]" />
          )}
        </button>

        {openSections.fabric && (
          <div className="mt-3 space-y-2">
            {FABRIC_TYPES.map((fabric) => {
              const isChecked = selectedFabricTypes.includes(fabric);
              const count = facetCounts.fabricMap[fabric] || 0;
              return (
                <label
                  key={fabric}
                  onClick={() =>
                    toggleArrayValue(selectedFabricTypes, fabric, setSelectedFabricTypes)
                  }
                  className="flex items-center justify-between gap-2 py-1 px-1.5 rounded-lg hover:bg-[#FAF7F2] cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-[#8D2434] border-[#8D2434] text-white'
                          : 'border-[#C8B9A6] bg-white group-hover:border-[#8D2434]'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                    <span
                      className={`text-xs truncate ${
                        isChecked ? 'font-bold text-[#2D2825]' : 'text-[#5A4638]'
                      }`}
                    >
                      {fabric}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7D726A] tabular-nums shrink-0">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: FABRIC WEIGHT (GSM) */}
      <div className="border-b border-[#ECE6DE] pb-5">
        <button
          type="button"
          onClick={() => toggleSection('gsm')}
          className="w-full flex items-center justify-between text-left py-1 cursor-pointer"
        >
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D2825]">
            <Scale className="w-3.5 h-3.5 text-[#8D2434]" />
            <span>Fabric Weight (GSM)</span>
          </span>
          {openSections.gsm ? (
            <ChevronUp className="w-4 h-4 text-[#7D726A]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#7D726A]" />
          )}
        </button>

        {openSections.gsm && (
          <div className="mt-3 space-y-3">
            {/* GSM Brackets */}
            <div className="space-y-2">
              {GSM_BRACKETS.map((bracket) => {
                const isChecked = selectedGsmBrackets.includes(bracket.id);
                const count = facetCounts.gsmMap[bracket.id] || 0;
                return (
                  <div
                    key={bracket.id}
                    onClick={() =>
                      toggleArrayValue(selectedGsmBrackets, bracket.id, setSelectedGsmBrackets)
                    }
                    className="flex items-start justify-between gap-2 py-1.5 px-1.5 rounded-lg hover:bg-[#FAF7F2] cursor-pointer select-none group"
                  >
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div
                        className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                          isChecked
                            ? 'bg-[#8D2434] border-[#8D2434] text-white'
                            : 'border-[#C8B9A6] bg-white group-hover:border-[#8D2434]'
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                      </div>
                      <div className="min-w-0">
                        <p
                          className={`text-xs leading-tight ${
                            isChecked ? 'font-bold text-[#2D2825]' : 'font-medium text-[#2D2825]'
                          }`}
                        >
                          {bracket.label}
                        </p>
                        <p className="text-[10px] text-[#7D726A] mt-0.5 leading-snug">
                          {bracket.sublabel}
                        </p>
                      </div>
                    </div>
                    <span className="text-[11px] text-[#7D726A] tabular-nums shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Fine-Grained Max GSM Range Slider */}
            <div className="pt-2 px-1.5">
              <div className="flex items-center justify-between text-[11px] mb-1.5">
                <span className="text-[#7D726A] font-medium">Max Weight Ceiling</span>
                <span className="font-bold text-[#2D2825] tabular-nums">
                  Up to {maxGsmSlider} GSM
                </span>
              </div>
              <input
                type="range"
                min={100}
                max={450}
                step={10}
                value={maxGsmSlider}
                onChange={(e) => setMaxGsmSlider(Number(e.target.value))}
                className="w-full accent-[#8D2434] cursor-pointer h-1.5 bg-[#ECE6DE] rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-[#7D726A] tabular-nums mt-1">
                <span>100 GSM (Sheer)</span>
                <span>280 GSM</span>
                <span>450 GSM (Heavy)</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 3: TEXTILE ORIGIN & PROVENANCE */}
      <div className="border-b border-[#ECE6DE] pb-5">
        <button
          type="button"
          onClick={() => toggleSection('origin')}
          className="w-full flex items-center justify-between text-left py-1 cursor-pointer"
        >
          <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D2825]">
            <MapPin className="w-3.5 h-3.5 text-[#8D2434]" />
            <span>Weave Origin</span>
          </span>
          {openSections.origin ? (
            <ChevronUp className="w-4 h-4 text-[#7D726A]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#7D726A]" />
          )}
        </button>

        {openSections.origin && (
          <div className="mt-3 space-y-2">
            {ORIGINS.map((origin) => {
              const isChecked = selectedOrigins.includes(origin);
              const count = facetCounts.originMap[origin] || 0;
              return (
                <label
                  key={origin}
                  onClick={() => toggleArrayValue(selectedOrigins, origin, setSelectedOrigins)}
                  className="flex items-center justify-between gap-2 py-1 px-1.5 rounded-lg hover:bg-[#FAF7F2] cursor-pointer select-none group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0 ${
                        isChecked
                          ? 'bg-[#8D2434] border-[#8D2434] text-white'
                          : 'border-[#C8B9A6] bg-white group-hover:border-[#8D2434]'
                      }`}
                    >
                      {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                    </div>
                    <span
                      className={`text-xs truncate ${
                        isChecked ? 'font-bold text-[#2D2825]' : 'text-[#5A4638]'
                      }`}
                    >
                      {origin}
                    </span>
                  </div>
                  <span className="text-[11px] text-[#7D726A] tabular-nums shrink-0">
                    {count}
                  </span>
                </label>
              );
            })}
          </div>
        )}
      </div>

      {/* SECTION 4: PRICE & COLOUR PALETTE */}
      <div>
        <button
          type="button"
          onClick={() => toggleSection('priceColor')}
          className="w-full flex items-center justify-between text-left py-1 cursor-pointer"
        >
          <span className="text-xs font-bold uppercase tracking-wider text-[#2D2825]">
            Price & Colour Shade
          </span>
          {openSections.priceColor ? (
            <ChevronUp className="w-4 h-4 text-[#7D726A]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#7D726A]" />
          )}
        </button>

        {openSections.priceColor && (
          <div className="mt-3 space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7D726A] mb-1.5">
                Price Tier
              </label>
              <div className="space-y-1.5">
                {priceBands.map((pb) => (
                  <button
                    key={pb.id}
                    type="button"
                    onClick={() => setSelectedPriceBand(pb.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors cursor-pointer flex items-center justify-between ${
                      selectedPriceBand === pb.id
                        ? 'bg-[#2D2825] text-white font-bold'
                        : 'bg-[#FAF7F2] text-[#2D2825] hover:bg-[#EFE9E2]'
                    }`}
                  >
                    <span>{pb.label}</span>
                    {selectedPriceBand === pb.id && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7D726A] mb-1.5">
                Colour Family
              </label>
              <select
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E4D9D1] text-xs font-medium text-[#2D2825] focus:outline-none focus:border-[#8D2434]"
              >
                {colors.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      id="marketplace-screen"
      className="max-w-7xl mx-auto space-y-6 pb-24 text-[#2D2825] px-2 sm:px-4"
    >
      {/* 1. HEADER & CART BAR */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2 border-b border-[#E4D9D1] pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D2434] block mb-1">
            APPROVED DESIGNER COLLECTIONS & HERITAGE LOOMS
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#2D2825] tracking-tight">
            Ready-to-Wear & Bespoke Editions
          </h1>
          <p className="text-xs sm:text-sm text-[#7D726A] font-light mt-1">
            Filter by heritage fabric type, textile weight (GSM), weave origin, and silhouette.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          {/* Mobile Filter Drawer Trigger */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(true)}
            className="lg:hidden px-4 py-2.5 rounded-xl border border-[#E4D9D1] bg-white text-[#2D2825] text-xs font-bold flex items-center gap-2 cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#8D2434]" />
            <span>
              Filters {activeFiltersCount > 0 ? `(${activeFiltersCount})` : ''}
            </span>
          </button>

          {onOpenCart && (
            <button
              type="button"
              onClick={onOpenCart}
              className="px-4 py-2.5 rounded-xl bg-[#8D2434] hover:bg-[#6E1B28] text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-2xs"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Shopping Bag ({cartCount})</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. SEARCH + DEPARTMENT BAR + SORT */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#7D726A] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by dress, fabric (Banarasi, Velvet), GSM, or origin..."
            className="w-full pl-10 pr-8 py-2.5 rounded-xl bg-white border border-[#E4D9D1] text-xs text-[#2D2825] focus:outline-none focus:border-[#8D2434]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7D726A] hover:text-[#2D2825]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Interactive Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#2D2825] text-white shadow-2xs'
                  : 'bg-white border border-[#ECE6DE] text-[#2D2825] hover:border-[#8D2434]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort Select */}
        <div className="shrink-0">
          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-white border border-[#E4D9D1] text-xs font-semibold text-[#2D2825] focus:outline-none cursor-pointer"
          >
            <option value="Featured">Sort: Featured</option>
            <option value="Top Rated">Sort: Top Rated</option>
            <option value="Price: Low to High">Price: Low to High</option>
            <option value="Price: High to Low">Price: High to Low</option>
            <option value="Weight: Heavy to Light (GSM)">Weight: Heavy to Light (GSM)</option>
            <option value="Weight: Light to Heavy (GSM)">Weight: Light to Heavy (GSM)</option>
          </select>
        </div>
      </div>

      {/* 3. MAIN LUXURY STOREFRONT LAYOUT: GRANULAR FILTER SIDEBAR + PRODUCT GRID */}
      <div className="flex flex-col lg:flex-row items-start gap-7">
        {/* LEFT GRANULAR FILTERING SIDEBAR (Desktop Sticky) */}
        <aside
          id="marketplace-filter-sidebar"
          className="hidden lg:block w-72 xl:w-80 shrink-0 bg-white rounded-2xl border border-[#ECE6DE] p-5 sticky top-24 shadow-2xs"
        >
          {renderFilterSidebarContent()}
        </aside>

        {/* MOBILE SLIDE-OVER FILTER DRAWER */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-50 lg:hidden bg-black/60 backdrop-blur-xs flex justify-end"
            onClick={(e) => {
              if (e.target === e.currentTarget) setMobileSidebarOpen(false);
            }}
          >
            <div className="w-full max-w-sm bg-white h-full overflow-y-auto p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#ECE6DE]">
                  <span className="font-serif text-lg font-bold text-[#2D2825]">
                    Refine Collection
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileSidebarOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-[#FAF7F2] text-[#2D2825]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {renderFilterSidebarContent()}
              </div>
              <div className="pt-4 mt-6 border-t border-[#ECE6DE] flex items-center gap-3 sticky bottom-0 bg-white py-3">
                <button
                  type="button"
                  onClick={resetAllFilters}
                  className="flex-1 py-3 rounded-xl border border-[#E4D9D1] text-xs font-bold text-[#2D2825]"
                >
                  Clear All
                </button>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-[#8D2434] text-white text-xs font-bold"
                >
                  Show {filteredProducts.length} Pieces
                </button>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT PRODUCT COLLECTION AREA */}
        <div className="flex-1 min-w-0 w-full space-y-4">
          {/* Active Filter Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 bg-white rounded-xl border border-[#ECE6DE] px-4 py-2.5">
            <p className="text-xs text-[#6E6359]">
              Showing <span className="font-bold text-[#2D2825] tabular-nums">{filteredProducts.length}</span> of{' '}
              <span className="tabular-nums">{enrichedProducts.length}</span> curated editions
            </p>

            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {selectedFabricTypes.map((ft) => (
                  <button
                    key={ft}
                    type="button"
                    onClick={() =>
                      toggleArrayValue(selectedFabricTypes, ft, setSelectedFabricTypes)
                    }
                    className="px-2.5 py-1 rounded-md bg-[#FAF7F2] hover:bg-[#FBECEF] border border-[#E4D9D1] text-[11px] font-medium text-[#2D2825] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{ft}</span>
                    <X className="w-3 h-3 text-[#8D2434]" />
                  </button>
                ))}
                {selectedGsmBrackets.map((bId) => {
                  const b = GSM_BRACKETS.find((item) => item.id === bId);
                  return (
                    <button
                      key={bId}
                      type="button"
                      onClick={() =>
                        toggleArrayValue(selectedGsmBrackets, bId, setSelectedGsmBrackets)
                      }
                      className="px-2.5 py-1 rounded-md bg-[#FAF7F2] hover:bg-[#FBECEF] border border-[#E4D9D1] text-[11px] font-medium text-[#2D2825] flex items-center gap-1 cursor-pointer"
                    >
                      <span>{b?.label}</span>
                      <X className="w-3 h-3 text-[#8D2434]" />
                    </button>
                  );
                })}
                {selectedOrigins.map((orig) => (
                  <button
                    key={orig}
                    type="button"
                    onClick={() => toggleArrayValue(selectedOrigins, orig, setSelectedOrigins)}
                    className="px-2.5 py-1 rounded-md bg-[#FAF7F2] hover:bg-[#FBECEF] border border-[#E4D9D1] text-[11px] font-medium text-[#2D2825] flex items-center gap-1 cursor-pointer"
                  >
                    <span>{orig.split(',')[0]}</span>
                    <X className="w-3 h-3 text-[#8D2434]" />
                  </button>
                ))}
                {onlyGiCertified && (
                  <button
                    type="button"
                    onClick={() => setOnlyGiCertified(false)}
                    className="px-2.5 py-1 rounded-md bg-[#FAF7F2] hover:bg-[#FBECEF] border border-[#E4D9D1] text-[11px] font-medium text-[#2D2825] flex items-center gap-1 cursor-pointer"
                  >
                    <span>GI-Certified</span>
                    <X className="w-3 h-3 text-[#8D2434]" />
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#ECE6DE] p-12 text-center space-y-3">
              <p className="font-serif text-lg font-bold text-[#2D2825]">
                No Matching Couture Pieces Found
              </p>
              <p className="text-xs text-[#7D726A] max-w-md mx-auto">
                No garments match your current combination of fabric type, weight (GSM), and origin filters.
              </p>
              <button
                type="button"
                onClick={resetAllFilters}
                className="px-5 py-2.5 rounded-xl bg-[#2D2825] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filteredProducts.map((product) => {
                const isWishlisted = wishlistIds.includes(product.id);
                const isJustAdded = addedFeedbackId === product.id;

                return (
                  <div
                    key={product.id}
                    onClick={() => handleOpenProduct(product)}
                    className="group bg-white rounded-2xl border border-[#ECE6DE] overflow-hidden p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* 3:4 Editorial Product Image */}
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F5EFEA]">
                        <img
                          src={product.frontImageUrl || product.images[0]}
                          alt={product.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleWishlist(product.id);
                          }}
                          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#2D2825] hover:scale-110 transition-all cursor-pointer shadow-xs"
                          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              isWishlisted ? 'fill-[#8D2434] text-[#8D2434]' : 'text-[#2D2825]'
                            }`}
                          />
                        </button>
                      </div>

                      {/* Clean Unboxed Metadata */}
                      <div className="pt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] uppercase tracking-wider text-[#7D726A] font-medium">
                          <span className="truncate">{product.designerName}</span>
                          <span className="flex items-center gap-0.5 text-[#2D2825] font-bold shrink-0 tabular-nums">
                            <Star className="w-3 h-3 fill-[#D4AF37] text-[#D4AF37]" />
                            {product.rating}
                          </span>
                        </div>

                        <h3 className="font-semibold text-sm sm:text-base text-[#2D2825] line-clamp-1">
                          {product.title}
                        </h3>

                        {/* Clean Unboxed Textile Metadata: Fabric Type · Weight (GSM) · Origin */}
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#6E6359]">
                          <span className="font-medium text-[#2D2825]">
                            {product.resolvedFabricType}
                          </span>
                          <span aria-hidden="true">·</span>
                          <span className="tabular-nums">{product.resolvedWeightGsm} GSM</span>
                          <span aria-hidden="true">·</span>
                          <span className="truncate">{product.resolvedOrigin.split(',')[0]}</span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-bold text-sm sm:text-[15px] text-[#2D2825] tabular-nums">
                              ₹{product.price.toLocaleString('en-IN')}
                            </span>
                            {product.originalPrice && (
                              <span className="text-[11px] text-[#7D726A] line-through tabular-nums">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                            )}
                          </div>
                          {product.resolvedGiCertified && (
                            <span className="text-[10px] font-semibold text-[#8D2434]">
                              GI Loom
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="button"
                        onClick={(e) => handleQuickAddToCart(e, product)}
                        className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          isJustAdded
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#FAF7F2] hover:bg-[#2D2825] text-[#2D2825] hover:text-white border border-[#E4D9D1]'
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added to Bag</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Add to Bag</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 4. CONTIGUOUS PRODUCT DETAIL MODULE (PDP MODAL WITH FRONT, BACK & SIDE VIEWS + TEXTILE SPECS) */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedProduct(null);
          }}
        >
          {(() => {
            const meta = resolveProductTextileMeta(selectedProduct);
            return (
              <div className="bg-white w-full max-w-4xl rounded-3xl overflow-hidden shadow-2xl border border-[#ECE6DE] grid grid-cols-1 md:grid-cols-2 my-auto max-h-[92vh] overflow-y-auto">
                {/* Left Column: Multi-Angle Gallery (Front, Back, Side) */}
                <div className="p-5 bg-[#FAF7F2] flex flex-col justify-between space-y-3">
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F5EFEA] border border-[#E4D9D1]">
                    <img
                      src={
                        getProductAngles(selectedProduct)[activePhotoIndex]?.url ||
                        selectedProduct.images[0]
                      }
                      alt={selectedProduct.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top"
                    />
                    <span className="absolute top-3 left-3 px-3 py-1 rounded-md bg-[#2D2825]/85 text-white text-[10px] font-bold uppercase tracking-wider">
                      {getProductAngles(selectedProduct)[activePhotoIndex]?.label || 'Front View'}
                    </span>
                  </div>

                  {/* 3-View Thumbnail Strip */}
                  <div className="grid grid-cols-3 gap-2.5">
                    {getProductAngles(selectedProduct).map((angleObj, idx) => (
                      <button
                        key={angleObj.label}
                        type="button"
                        onClick={() => setActivePhotoIndex(idx)}
                        className={`p-1.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 bg-white ${
                          activePhotoIndex === idx
                            ? 'border-[#8D2434] ring-2 ring-[#8D2434]/15'
                            : 'border-[#E4D9D1] opacity-75 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={angleObj.url}
                          alt={angleObj.label}
                          referrerPolicy="no-referrer"
                          className="w-10 h-12 rounded-lg object-cover object-top shrink-0"
                        />
                        <span className="text-[10px] font-bold text-[#2D2825] leading-tight">
                          {angleObj.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Right Column: Contiguous Purchase Module */}
                <div className="p-6 flex flex-col justify-between space-y-5">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#8D2434]">
                          {selectedProduct.designerName} · Verified Atelier
                        </span>
                        <h2 className="font-serif text-2xl font-bold text-[#2D2825] mt-0.5">
                          {selectedProduct.title}
                        </h2>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedProduct(null)}
                        className="w-8 h-8 rounded-full hover:bg-[#FAF7F2] flex items-center justify-center text-[#7D726A] cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-baseline gap-3">
                      <span className="font-serif text-2xl font-bold text-[#2D2825] tabular-nums">
                        ₹{selectedProduct.price.toLocaleString('en-IN')}
                      </span>
                      {selectedProduct.originalPrice && (
                        <span className="text-sm text-[#7D726A] line-through tabular-nums">
                          ₹{selectedProduct.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      <span className="text-xs font-semibold text-emerald-700">
                        In Stock · Ships in {selectedProduct.leadTimeDays || 5} Days
                      </span>
                    </div>

                    <p className="text-xs text-[#5A4638] leading-relaxed">
                      {selectedProduct.description}
                    </p>

                    {/* Granular Textile & Provenance Specifications Grid */}
                    <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#E4D9D1] text-xs">
                      <div>
                        <span className="text-[10px] uppercase text-[#7D726A] font-bold block">
                          Fabric Type
                        </span>
                        <span className="font-semibold text-[#2D2825]">{meta.fabricType}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#7D726A] font-bold block">
                          Weight (GSM)
                        </span>
                        <span className="font-semibold text-[#2D2825] tabular-nums">
                          {meta.weightGsm} GSM ({meta.weightGsm >= 300 ? 'Structured' : 'Fluid Drape'})
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#7D726A] font-bold block">
                          Weave Origin
                        </span>
                        <span className="font-semibold text-[#2D2825]">{meta.origin}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-[#7D726A] font-bold block">
                          Craftsmanship
                        </span>
                        <span className="font-semibold text-[#2D2825]">
                          {selectedProduct.specs?.work || 'Hand-Finished Atelier Detailing'}
                        </span>
                      </div>
                    </div>

                    {/* Size Selector */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#2D2825] uppercase tracking-wider text-[11px]">
                          Select Size
                        </span>
                        <span className="text-[11px] text-[#8D2434] font-medium">
                          Includes 2-inch internal alteration margin
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {(selectedProduct.sizes?.length
                          ? selectedProduct.sizes
                          : ['XS', 'S', 'M', 'L', 'XL']
                        ).map((size) => (
                          <button
                            key={size}
                            type="button"
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                              selectedSize === size
                                ? 'bg-[#2D2825] text-white border-[#2D2825]'
                                : 'bg-white text-[#2D2825] border-[#E4D9D1] hover:border-[#2D2825]'
                            }`}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Primary CTAs */}
                  <div className="space-y-2.5 pt-4 border-t border-[#E4D9D1]">
                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (onAddToCart) {
                            onAddToCart(selectedProduct, selectedSize);
                          }
                          setSelectedProduct(null);
                          if (onOpenCart) onOpenCart();
                        }}
                        className="py-3.5 px-4 rounded-xl bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
                      >
                        <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                        <span>Add to Bag</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onBuyNow(selectedProduct, selectedSize);
                          setSelectedProduct(null);
                        }}
                        className="py-3.5 px-4 rounded-xl bg-[#8D2434] hover:bg-[#6E1B28] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Buy Ready-Made</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      {onRequestCustomStitch && (
                        <button
                          type="button"
                          onClick={() => {
                            const prod = selectedProduct;
                            setSelectedProduct(null);
                            onRequestCustomStitch(prod);
                          }}
                          className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E2] text-[#2D2825] border border-[#E4D9D1] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Scissors className="w-3.5 h-3.5 text-[#8D2434]" />
                          <span>Customize in AI Studio</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          const prod = selectedProduct;
                          setSelectedProduct(null);
                          onChatSeller(prod.designerName, prod);
                        }}
                        className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E2] text-[#2D2825] border border-[#E4D9D1] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#8D2434]" />
                        <span>Message Designer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};
