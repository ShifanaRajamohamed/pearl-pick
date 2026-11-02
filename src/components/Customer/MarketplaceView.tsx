import React, { useState, useMemo, useEffect } from 'react';
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
import { ProductDetailModal } from './ProductDetailModal';

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
  onGenderChange?: (gender: 'women' | 'men') => void;
  onSelectProduct?: (product: MarketplaceProduct) => void;
  initialCategory?: string;
  showWishlistOnly?: boolean;
  activeStorefrontCategory?: string;
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

function resolveProductGender(product: MarketplaceProduct): 'women' | 'men' {
  if (product.gender === 'men' || product.gender === 'women') {
    return product.gender;
  }
  const tagsLower = (product.tags || []).map((t) => t.toLowerCase());
  if (
    product.categoryLabel === "Men's Bespoke" ||
    product.id.startsWith('prod-m-') ||
    tagsLower.includes('men') ||
    tagsLower.includes('menswear')
  ) {
    return 'men';
  }
  return 'women';
}

function doesProductMatchColorFamily(
  product: MarketplaceProduct,
  selectedColor: string
): boolean {
  if (selectedColor === 'All') return true;
  const hay = `${product.title} ${product.color || ''} ${product.specs?.color || ''} ${(product.tags || []).join(' ')} ${product.description || ''}`.toLowerCase();

  if (selectedColor.startsWith('Red')) {
    return (
      hay.includes('red') ||
      hay.includes('crimson') ||
      hay.includes('vermilion') ||
      hay.includes('ruby') ||
      hay.includes('maroon') ||
      hay.includes('burgundy') ||
      hay.includes('wine')
    );
  }
  if (selectedColor.startsWith('Pink')) {
    return (
      hay.includes('pink') ||
      hay.includes('blush') ||
      hay.includes('rose') ||
      hay.includes('plum') ||
      hay.includes('purple') ||
      hay.includes('rani')
    );
  }
  if (selectedColor.startsWith('Ivory')) {
    return (
      hay.includes('ivory') ||
      hay.includes('champagne') ||
      hay.includes('pearl') ||
      hay.includes('alabaster') ||
      hay.includes('ice') ||
      hay.includes('powder')
    );
  }
  if (selectedColor.startsWith('Emerald')) {
    return (
      hay.includes('emerald') ||
      hay.includes('green') ||
      hay.includes('mint') ||
      hay.includes('sage') ||
      hay.includes('forest')
    );
  }
  if (selectedColor.startsWith('Midnight')) {
    return (
      hay.includes('midnight') ||
      hay.includes('black') ||
      hay.includes('obsidian') ||
      hay.includes('navy') ||
      hay.includes('indigo') ||
      hay.includes('charcoal') ||
      hay.includes('cobalt') ||
      hay.includes('sapphire')
    );
  }
  if (selectedColor.startsWith('Gold')) {
    return (
      hay.includes('gold') ||
      hay.includes('ochre') ||
      hay.includes('saffron') ||
      hay.includes('champagne') ||
      hay.includes('zari') ||
      hay.includes('mustard')
    );
  }
  const colorKey = selectedColor.split('/')[0].trim().toLowerCase();
  return hay.includes(colorKey);
}

// Helper to guarantee normalized fabricType, weightGsm, origin, and gender for any product
function resolveProductTextileMeta(product: MarketplaceProduct): {
  fabricType: string;
  weightGsm: number;
  origin: string;
  giCertified: boolean;
  gender: 'women' | 'men';
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

  const rawOrigin = (product.origin || product.specs?.origin || '').toLowerCase();
  let origin = 'Varanasi, Uttar Pradesh';
  if (rawOrigin.includes('varanasi') || rawOrigin.includes('banaras')) {
    origin = 'Varanasi, Uttar Pradesh';
  } else if (rawOrigin.includes('kanchipuram') || rawOrigin.includes('kanjeevaram')) {
    origin = 'Kanchipuram, Tamil Nadu';
  } else if (rawOrigin.includes('lucknow')) {
    origin = 'Lucknow, Uttar Pradesh';
  } else if (rawOrigin.includes('chanderi')) {
    origin = 'Chanderi, Madhya Pradesh';
  } else if (rawOrigin.includes('jaipur')) {
    origin = 'Jaipur, Rajasthan';
  } else if (rawOrigin.includes('mumbai')) {
    origin = 'Mumbai, Maharashtra';
  } else if (rawOrigin.includes('como') || rawOrigin.includes('italy')) {
    origin = 'Como, Italy';
  } else if (product.origin) {
    origin = product.origin;
  }

  const giCertified =
    product.giCertified !== undefined
      ? product.giCertified
      : ['Banarasi Katan Silk', 'Pure Kanjeevaram Silk', 'Chanderi Brocade'].includes(fabricType);

  return {
    fabricType,
    weightGsm,
    origin,
    giCertified,
    gender: resolveProductGender(product)
  };
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
  cartCount = 0,
  gender,
  onGenderChange,
  onSelectProduct,
  initialCategory,
  showWishlistOnly = false,
  activeStorefrontCategory
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sectionMode, setSectionMode] = useState<'all' | 'women' | 'men'>(() => {
    if (initialCategory === "Men's Bespoke" || activeStorefrontCategory === 'men') return 'men';
    if (activeStorefrontCategory === 'women') return 'women';
    return 'all';
  });
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'All');
  const [onlyWishlisted, setOnlyWishlisted] = useState<boolean>(showWishlistOnly);
  const [selectedFabricTypes, setSelectedFabricTypes] = useState<string[]>([]);
  const [selectedGsmBrackets, setSelectedGsmBrackets] = useState<string[]>([]);
  const [maxGsmSlider, setMaxGsmSlider] = useState<number>(450);
  const [selectedOrigins, setSelectedOrigins] = useState<string[]>([]);
  const [onlyGiCertified, setOnlyGiCertified] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string>('All');
  const [selectedPriceBand, setSelectedPriceBand] = useState<string>('All');
  const [selectedSort, setSelectedSort] = useState<string>('Featured');
  const [cardAngleMap, setCardAngleMap] = useState<Record<string, 0 | 1 | 2>>({});

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
      if (initialCategory === "Men's Bespoke") {
        setSectionMode('men');
      }
    }
  }, [initialCategory]);

  useEffect(() => {
    if (activeStorefrontCategory === 'women') {
      setSectionMode('women');
      if (selectedCategory === "Men's Bespoke") {
        setSelectedCategory('All');
      }
    } else if (activeStorefrontCategory === 'men') {
      setSectionMode('men');
    } else if (
      activeStorefrontCategory === 'featured' ||
      activeStorefrontCategory === 'ethnic' ||
      activeStorefrontCategory === 'festive' ||
      activeStorefrontCategory === 'collections'
    ) {
      setSectionMode('all');
    }
  }, [activeStorefrontCategory]);

  useEffect(() => {
    if (gender === 'men' && activeStorefrontCategory === 'men') {
      setSectionMode('men');
    } else if (gender === 'women' && activeStorefrontCategory === 'women') {
      setSectionMode('women');
    }
  }, [gender, activeStorefrontCategory]);

  useEffect(() => {
    if (showWishlistOnly !== undefined) {
      setOnlyWishlisted(showWishlistOnly);
    }
  }, [showWishlistOnly]);

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

  // Enrich visible products with resolved textile metadata & gender
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
          resolvedGiCertified: meta.giCertified,
          resolvedGender: meta.gender
        };
      });
  }, [products]);

  const sectionCounts = useMemo(() => {
    let women = 0;
    let men = 0;
    enrichedProducts.forEach((p) => {
      if (p.resolvedGender === 'men') men++;
      else women++;
    });
    return { all: enrichedProducts.length, women, men };
  }, [enrichedProducts]);

  // Base products scoped by the active Section (All Store vs Women's Section Alone vs Men's Section Alone)
  const sectionScopedProducts = useMemo(() => {
    if (sectionMode === 'women') {
      return enrichedProducts.filter((p) => p.resolvedGender === 'women');
    }
    if (sectionMode === 'men') {
      return enrichedProducts.filter((p) => p.resolvedGender === 'men');
    }
    return enrichedProducts;
  }, [enrichedProducts, sectionMode]);

  // Facet counts for sidebar options (reflecting active gender section)
  const facetCounts = useMemo(() => {
    const fabricMap: Record<string, number> = {};
    const gsmMap: Record<string, number> = {};
    const originMap: Record<string, number> = {};

    sectionScopedProducts.forEach((p) => {
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
  }, [sectionScopedProducts]);

  const filteredProducts = useMemo(() => {
    const list = sectionScopedProducts.filter((p) => {
      const hay = `${p.title} ${p.designerName} ${p.fabric} ${p.resolvedFabricType} ${p.resolvedOrigin} ${p.description} ${p.categoryLabel} ${(p.tags || []).join(' ')} ${p.specs?.color || ''} ${p.color || ''} ${p.occasion || ''} ${p.style || ''}`.toLowerCase();

      if (searchQuery.trim() && !hay.includes(searchQuery.toLowerCase())) {
        return false;
      }

      if (onlyWishlisted && !wishlistIds.includes(p.id)) {
        return false;
      }

      if (selectedCategory !== 'All') {
        if (selectedCategory === "Men's Bespoke") {
          if (p.resolvedGender !== 'men') return false;
        } else {
          const catLower = selectedCategory.toLowerCase();
          const matchesCategoryLabel = (p.categoryLabel || '').toLowerCase() === catLower;
          const matchesTag = (p.tags || []).some((t) => t.toLowerCase() === catLower);
          const matchesOccasion = (p.occasion || '').toLowerCase().includes(catLower);
          if (!matchesCategoryLabel && !matchesTag && !matchesOccasion && !hay.includes(catLower)) {
            return false;
          }
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
        if (!doesProductMatchColorFamily(p, selectedColor)) return false;
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
    sectionScopedProducts,
    searchQuery,
    selectedCategory,
    selectedFabricTypes,
    selectedGsmBrackets,
    maxGsmSlider,
    selectedOrigins,
    onlyGiCertified,
    selectedColor,
    selectedPriceBand,
    selectedSort,
    onlyWishlisted,
    wishlistIds
  ]);

  const handleOpenProduct = (product: MarketplaceProduct) => {
    if (onSelectProduct) {
      onSelectProduct(product);
    } else {
      setSelectedProduct(product);
      setSelectedSize(product.sizes?.[0] || 'M');
      setActivePhotoIndex(0);
    }
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
      {/* 1. HEADER & SECTION SWITCHER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pt-2 border-b border-[#E4D9D1] pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D2434] block mb-1">
            APPROVED DESIGNER COLLECTIONS & HERITAGE LOOMS
          </span>
          <h1 className="font-serif text-2xl sm:text-4xl font-bold text-[#2D2825] tracking-tight">
            {sectionMode === 'women'
              ? "Women's Couture & Heritage Dresses"
              : sectionMode === 'men'
              ? "Men's Bespoke Suits, Bandhgalas & Achkans"
              : 'Ready-to-Wear & Bespoke Editions'}
          </h1>
          <p className="text-xs sm:text-sm text-[#7D726A] font-light mt-1">
            {sectionMode === 'women'
              ? "Exclusively showing Women's sarees, bridal lehengas, velvet midis, and couture evening gowns with Front, Back & Side views."
              : sectionMode === 'men'
              ? "Exclusively showing Men's 3-piece bespoke suits, bandhgala tuxedos, achkans, and ceremonial tailoring with Front, Back & Side views."
              : 'Filter by department (Women or Men), heritage fabric type, textile weight (GSM), weave origin, and silhouette.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {/* Dedicated Department Switcher: All Store | Women's Section Alone | Men's Section Alone */}
          <div className="inline-flex items-center p-1 rounded-xl bg-[#EFE9E2] border border-[#E0D6CC]">
            <button
              type="button"
              onClick={() => {
                setSectionMode('all');
                if (selectedCategory === "Men's Bespoke") setSelectedCategory('All');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sectionMode === 'all'
                  ? 'bg-[#2D2825] text-white shadow-2xs'
                  : 'text-[#6E6359] hover:text-[#2D2825]'
              }`}
            >
              All ({sectionCounts.all})
            </button>
            <button
              type="button"
              onClick={() => {
                setSectionMode('women');
                if (selectedCategory === "Men's Bespoke") setSelectedCategory('All');
                if (onGenderChange) onGenderChange('women');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sectionMode === 'women'
                  ? 'bg-[#8D2434] text-white shadow-2xs'
                  : 'text-[#6E6359] hover:text-[#2D2825]'
              }`}
            >
              Women&apos;s Section ({sectionCounts.women})
            </button>
            <button
              type="button"
              onClick={() => {
                setSectionMode('men');
                if (selectedCategory === "Men's Bespoke") setSelectedCategory('All');
                if (onGenderChange) onGenderChange('men');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                sectionMode === 'men'
                  ? 'bg-[#2D2825] text-white shadow-2xs'
                  : 'text-[#6E6359] hover:text-[#2D2825]'
              }`}
            >
              Men&apos;s Section ({sectionCounts.men})
            </button>
          </div>

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
            placeholder="Search by dress, suit, fabric (Banarasi, Velvet), GSM, or origin..."
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
          {categories
            .filter((cat) => (sectionMode === 'women' ? cat !== "Men's Bespoke" : true))
            .map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  if (cat === "Men's Bespoke") {
                    setSectionMode('men');
                    if (onGenderChange) onGenderChange('men');
                  }
                  if (onlyWishlisted) setOnlyWishlisted(false);
                }}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat && !onlyWishlisted
                    ? 'bg-[#2D2825] text-white shadow-2xs'
                    : 'bg-white border border-[#ECE6DE] text-[#2D2825] hover:border-[#8D2434]'
                }`}
              >
                {cat}
              </button>
            ))}

          {/* Quick Wishlist Filter Pill */}
          <button
            type="button"
            onClick={() => setOnlyWishlisted((prev) => !prev)}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
              onlyWishlisted
                ? 'bg-[#8D2434] text-white shadow-2xs'
                : 'bg-white border border-[#ECE6DE] text-[#2D2825] hover:border-[#8D2434]'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${onlyWishlisted ? 'fill-white text-white' : 'text-[#8D2434]'}`} />
            <span>Wishlist {wishlistIds.length > 0 ? `(${wishlistIds.length})` : ''}</span>
          </button>
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
              <span className="tabular-nums">{sectionScopedProducts.length}</span>{' '}
              {sectionMode === 'women'
                ? "Women's couture pieces"
                : sectionMode === 'men'
                ? "Men's bespoke pieces"
                : 'curated editions'}
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
                const angles = getProductAngles(product);
                const activeAngleIdx = cardAngleMap[product.id] ?? 0;
                const activeCardImage = angles[activeAngleIdx]?.url || product.frontImageUrl || product.images[0];

                return (
                  <div
                    key={product.id}
                    onClick={() => handleOpenProduct(product)}
                    className="group bg-white rounded-2xl border border-[#ECE6DE] overflow-hidden p-3 shadow-2xs hover:-translate-y-0.5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* 3:4 Editorial Product Image with Interactive Front / Back / Side Switcher */}
                      <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F5EFEA]">
                        <img
                          src={activeCardImage}
                          alt={`${product.title} — ${angles[activeAngleIdx]?.label || 'Front View'}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Department & Category Pill */}
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1">
                          <span className="px-2 py-0.5 rounded-md bg-[#2D2825]/85 backdrop-blur-xs text-white text-[9px] font-bold uppercase tracking-wider">
                            {product.resolvedGender === 'men' ? "Men's" : "Women's"} · {product.categoryLabel}
                          </span>
                        </div>

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

                        {/* Interactive Front / Back / Side View Toggle Pill Bar */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute bottom-2.5 inset-x-2.5 flex items-center justify-between bg-white/92 backdrop-blur-xs rounded-lg p-1 border border-[#E4D9D1] shadow-xs"
                        >
                          {(['Front', 'Back', 'Side'] as const).map((viewName, vIdx) => {
                            const isCurrent = activeAngleIdx === vIdx;
                            return (
                              <button
                                key={viewName}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setCardAngleMap((prev) => ({
                                    ...prev,
                                    [product.id]: vIdx as 0 | 1 | 2
                                  }));
                                }}
                                className={`flex-1 py-1 rounded-md text-[10px] font-bold transition-all cursor-pointer ${
                                  isCurrent
                                    ? 'bg-[#2D2825] text-white shadow-2xs'
                                    : 'text-[#6E6359] hover:text-[#2D2825]'
                                }`}
                              >
                                {viewName}
                              </button>
                            );
                          })}
                        </div>
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

      {/* 4. CONTIGUOUS PRODUCT DETAIL MODULE (PDP MODAL) */}
      <ProductDetailModal
        product={selectedProduct}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        isWishlisted={Boolean(selectedProduct && wishlistIds.includes(selectedProduct.id))}
        onToggleWishlist={onToggleWishlist}
        onAddToCart={(prod, sz) => {
          if (onAddToCart) onAddToCart(prod, sz);
          setSelectedProduct(null);
          if (onOpenCart) onOpenCart();
        }}
        onBuyNow={(prod, sz) => {
          onBuyNow(prod, sz);
          setSelectedProduct(null);
        }}
        onRequestCustomStitch={onRequestCustomStitch}
        onChatSeller={onChatSeller}
      />
    </div>
  );
};
