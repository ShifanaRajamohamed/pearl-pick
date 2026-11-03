import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Heart,
  ShoppingBag,
  ArrowRight,
  Star,
  CheckCircle2,
  Scissors,
  Layers,
  Clock,
  Truck,
  Tag,
  Flame,
  MapPin,
  Percent,
  Award,
  Smartphone
} from 'lucide-react';
import { DressDesign, TailorProfile, MarketplaceProduct } from '../../types';
import { StorefrontCategory } from '../Navbar';
import { DesignerSpotlight } from './DesignerSpotlight';
import { PWAInstallButton } from '../PWAInstallButton';

interface SplashScreenProps {
  userName?: string;
  gender?: 'women' | 'men';
  onGenderChange?: (gender: 'women' | 'men') => void;
  onStartGenerator: (prompt?: string, dressType?: any) => void;
  onExploreTailors: () => void;
  onExploreMarketplace: (category?: StorefrontCategory) => void;
  onOpenMeasurements: () => void;
  onSelectDesign: (design: DressDesign) => void;
  onSelectTailor: (tailor: TailorProfile) => void;
  onRequestStitching: (tailor: TailorProfile) => void;
  onSelectCategory: (categoryName: string) => void;
  onOpenNotifications?: () => void;
  onOpenSearch?: () => void;
  featuredDesigns: DressDesign[];
  tailors?: TailorProfile[];
  verifiedTailors: TailorProfile[];
  products?: MarketplaceProduct[];
  wishlistIds?: string[];
  onToggleWishlist?: (productId: string) => void;
  onAddToCart?: (product: MarketplaceProduct, size: string) => void;
  onSelectProduct?: (product: MarketplaceProduct) => void;
  recentlyViewedProducts?: MarketplaceProduct[];
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  gender = 'women',
  onGenderChange,
  onStartGenerator,
  onExploreTailors,
  onExploreMarketplace,
  onSelectDesign,
  onSelectTailor,
  onRequestStitching,
  featuredDesigns,
  tailors,
  verifiedTailors,
  products = [],
  wishlistIds = [],
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  recentlyViewedProducts = [],
}) => {

  const categoryCards: {
    id: StorefrontCategory;
    title: string;
    subtitle: string;
    image: string;
  }[] = [
    {
      id: 'women',
      title: "Women's Section",
      subtitle: 'Couture Gowns, Sarees & Lehengas',
      image: '/assets/catalog/w-wine-organza-floral-gown-front.jpg',
    },
    {
      id: 'men',
      title: "Men's Section",
      subtitle: 'Bandhgalas, Achkans & Bespoke Suits',
      image: '/assets/catalog/m-navy-3piece-suit-front.jpg',
    },
    {
      id: 'ethnic',
      title: 'Ethnic & Handloom',
      subtitle: 'Banarasi, Kanjeevaram & Chikankari',
      image: '/assets/catalog/w-purple-banarasi-saree-front.jpg',
    },
    {
      id: 'festive',
      title: 'Festive & Bridal',
      subtitle: 'Wedding Trousseau, Sangeet & Reception',
      image: '/assets/catalog/w-crimson-kanjeevaram-saree-front.jpg',
    },
    {
      id: 'collections',
      title: 'Runway Capsules',
      subtitle: 'Velvet, Guipure Lace & Atelier Editions',
      image: '/assets/catalog/w-emerald-lace-gown-front.jpg',
    },
  ];

  const approvedProducts = products.filter(
    (p) => !p.moderationStatus || p.moderationStatus === 'APPROVED'
  );
  const genderFilteredProducts = approvedProducts.filter((p) => {
    const isMen =
      p.gender === 'men' ||
      p.categoryLabel === "Men's Bespoke" ||
      p.id.startsWith('prod-m-') ||
      (p.tags || []).some((t) => t.toLowerCase() === 'men' || t.toLowerCase() === 'menswear');
    return gender === 'men' ? isMen : !isMen;
  });
  const activeGenderProducts =
    genderFilteredProducts.length > 0 ? genderFilteredProducts : approvedProducts;
  const featuredProducts = activeGenderProducts.slice(0, 4);
  const trendingProducts =
    activeGenderProducts.slice(4, 8).length > 0
      ? activeGenderProducts.slice(4, 8)
      : activeGenderProducts.slice(0, 4);

  const activeFeaturedDesign =
    featuredDesigns.find((d) =>
      gender === 'men'
        ? d.gender === 'men' || d.id.includes('men') || d.tags?.some((t) => t.toLowerCase() === 'men')
        : d.gender === 'women' || (!d.id.includes('men') && !d.tags?.some((t) => t.toLowerCase() === 'men'))
    ) || featuredDesigns[0];

  // Live Flash Sale Countdown Timer (Myntra/Amazon style)
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 28, seconds: 15 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 5, minutes: 59, seconds: 59 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div id="storefront-homepage" className="w-full space-y-10 sm:space-y-12 pb-8 text-[#2D2825]">
      {/* 0. MYNTRA / AMAZON LUXE STRIP: Delivery Pincode & Live Offers */}
      <div className="rounded-2xl bg-white border border-[#ECE6DE] p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#2D2825]">
          <MapPin className="w-4 h-4 text-[#8D2434]" />
          <span>Deliver to <strong className="font-bold">Mumbai 400050</strong></span>
          <span className="text-[#8E847D] hidden sm:inline">|</span>
          <span className="text-emerald-700 font-semibold hidden sm:flex items-center gap-1">
            <Truck className="w-3.5 h-3.5" />
            Free Express Shipping on all prepaid orders
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#D5C7B8] text-[11px] font-bold text-[#8D2434]">
            <Tag className="w-3 h-3" />
            <span>Code <strong className="underline">PEARLFIRST</strong> (15% OFF)</span>
          </div>

          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#8D2434] text-white text-[11px] font-bold shadow-xs tabular-nums">
            <Flame className="w-3.5 h-3.5 text-[#FBECEF]" />
            <span>Sale Ends: {String(timeLeft.hours).padStart(2, '0')}h : {String(timeLeft.minutes).padStart(2, '0')}m : {String(timeLeft.seconds).padStart(2, '0')}s</span>
          </div>
        </div>
      </div>

      {/* 0.1 LUXURY ATELIER CIRCULAR CATEGORY MEDALLION BAR */}
      <div className="overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center justify-between gap-4 sm:gap-6 min-w-max px-1">
          {[
            {
              label: 'All Store',
              sub: 'Maison',
              cat: undefined,
              accent: false,
              renderIcon: () => (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="3" width="7" height="7" rx="1" />
                  <rect x="14" y="14" width="7" height="7" rx="1" />
                  <rect x="3" y="14" width="7" height="7" rx="1" />
                </svg>
              ),
            },
            {
              label: "Women's Couture",
              sub: 'Gowns & Drapes',
              cat: 'women' as StorefrontCategory,
              accent: false,
              renderIcon: () => (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3L10.5 7.5L8 11L5 21H19L16 11L13.5 7.5L15 3" />
                  <path d="M9.5 7.5H14.5" />
                  <path d="M8 14.5C10.5 15.5 13.5 15.5 16 14.5" />
                </svg>
              ),
            },
            {
              label: "Men's Bespoke",
              sub: 'Sherwani & Suits',
              cat: 'men' as StorefrontCategory,
              accent: false,
              renderIcon: () => (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 4L9 3H15L18 4L20 9L17 11V21H7V11L4 9L6 4Z" />
                  <path d="M9 3L12 10L15 3" />
                  <path d="M12 10V21" />
                </svg>
              ),
            },
            {
              label: 'Heritage Silks',
              sub: 'Handloom Weaves',
              cat: 'ethnic' as StorefrontCategory,
              accent: false,
              renderIcon: () => (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L19 9L12 16L5 9L12 2Z" />
                  <path d="M5 13L12 20L19 13" />
                  <circle cx="12" cy="9" r="1.5" />
                </svg>
              ),
            },
            {
              label: 'Bridal & Festive',
              sub: 'Royal Trousseau',
              cat: 'festive' as StorefrontCategory,
              accent: false,
              renderIcon: () => (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 18H21" />
                  <path d="M4 15L2 7L8.5 11L12 4L15.5 11L22 7L20 15H4Z" />
                </svg>
              ),
            },
            {
              label: 'Runway Capsules',
              sub: 'Limited Editions',
              cat: 'collections' as StorefrontCategory,
              accent: false,
              renderIcon: () => (
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 3H18L22 9L12 21L2 9L6 3Z" />
                  <path d="M2 9H22" />
                  <path d="M12 3L8 9L12 21L16 9L12 3Z" />
                </svg>
              ),
            },
            {
              label: 'AI Design Studio',
              sub: '3-View Bespoke',
              action: () => onStartGenerator(),
              accent: true,
              renderIcon: () => <Sparkles className="w-5 h-5" strokeWidth={1.5} />,
            },
            {
              label: 'Master Tailors',
              sub: 'Verified Ateliers',
              action: onExploreTailors,
              accent: false,
              renderIcon: () => <Scissors className="w-5 h-5" strokeWidth={1.5} />,
            },
            {
              label: 'Privilege Edit',
              sub: 'Up to 50% Off',
              cat: 'featured' as any,
              accent: false,
              renderIcon: () => <Percent className="w-5 h-5" strokeWidth={1.5} />,
            },
          ].map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                if (item.action) item.action();
                else onExploreMarketplace(item.cat);
              }}
              className="flex flex-col items-center gap-1.5 group cursor-pointer focus:outline-none"
            >
              <div
                className={`w-15 h-15 sm:w-16 sm:h-16 rounded-full p-1 transition-all duration-300 shadow-2xs group-hover:shadow-md group-hover:-translate-y-0.5 ${
                  item.accent
                    ? 'bg-gradient-to-tr from-[#8D2434] via-[#B43B4E] to-[#D4AF37]'
                    : 'bg-white border border-[#D8CEC3] group-hover:border-[#8D2434]'
                }`}
              >
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center transition-colors duration-300 ${
                    item.accent
                      ? 'bg-[#1F1B18] text-[#FAF7F2] group-hover:bg-[#8D2434]'
                      : 'bg-[#FAF7F2] border border-[#ECE6DE] text-[#2D2825] group-hover:bg-[#8D2434] group-hover:text-white group-hover:border-[#8D2434]'
                  }`}
                >
                  {item.renderIcon()}
                </div>
              </div>
              <div className="text-center">
                <span className="block text-[11px] font-bold text-[#2D2825] group-hover:text-[#8D2434] transition-colors whitespace-nowrap leading-tight">
                  {item.label}
                </span>
                <span className="block text-[9px] uppercase tracking-wider text-[#8E847D] font-medium whitespace-nowrap mt-0.5">
                  {item.sub}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 1. EDITORIAL FASHION COLLECTION HERO BANNER (Zara / Myntra Luxe Style) */}
      <section className="relative rounded-3xl overflow-hidden bg-[#1F1B18] text-white border border-[#E4D9D1]">
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[420px] lg:min-h-[480px]">
          {/* Left Editorial Copy */}
          <div className="lg:col-span-7 p-8 sm:p-12 lg:p-14 flex flex-col justify-between z-10">
            <div className="space-y-4 max-w-xl">
              <p className="text-[11px] uppercase tracking-[0.22em] text-[#E8C5CC] font-semibold">
                Autumn / Festive Couture Edit 2026
              </p>

              <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-[#FAF7F2] leading-[1.12]">
                {gender === 'men'
                  ? 'Architectural Bespoke Suiting & Royal Heritage Wear'
                  : 'Timeless Indian Couture & Custom-Crafted Silhouettes'}
              </h1>

              <p className="text-sm sm:text-base text-white/80 font-light leading-relaxed">
                Shop ready-to-wear collections from verified master designers, or create your own custom dress in our 3-View AI Design Studio and commission a tailor to your exact measurements.
              </p>
            </div>

            <div className="pt-8 flex flex-wrap items-center gap-3.5">
              <button
                id="hero-shop-collections-btn"
                type="button"
                onClick={() => onExploreMarketplace()}
                className="px-6 py-3.5 rounded-xl bg-white text-[#2D2825] hover:bg-[#FAF7F2] text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <ShoppingBag className="w-4 h-4 text-[#8D2434]" />
                <span>Shop Ready-To-Wear</span>
              </button>

              <button
                id="hero-launch-ai-studio-btn"
                type="button"
                onClick={() => onStartGenerator()}
                className="px-6 py-3.5 rounded-xl bg-[#8D2434] hover:bg-[#A1293B] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#FAF7F2]" />
                <span>AI Custom Dress Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Quick Women / Men Toggle */}
              {onGenderChange && (
                <div className="flex items-center bg-white/10 p-1 rounded-xl border border-white/15 ml-auto">
                  <button
                    type="button"
                    onClick={() => onGenderChange('women')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      gender === 'women'
                        ? 'bg-white text-[#2D2825]'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    Women
                  </button>
                  <button
                    type="button"
                    onClick={() => onGenderChange('men')}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                      gender === 'men'
                        ? 'bg-white text-[#2D2825]'
                        : 'text-white/75 hover:text-white'
                    }`}
                  >
                    Men
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Lookbook Visuals */}
          <div className="lg:col-span-5 relative grid grid-cols-2 gap-2 p-3 sm:p-4 bg-[#2A2421]">
            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] h-full">
              <img
                src={
                  gender === 'men'
                    ? '/assets/catalog/m-navy-3piece-suit-front.jpg'
                    : '/assets/catalog/w-purple-banarasi-saree-front.jpg'
                }
                alt="Editorial Collection Primary"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-xl p-2.5 text-white">
                <p className="text-[10px] uppercase tracking-wider text-[#D4AF37] font-bold">
                  Signature Look
                </p>
                <p className="text-xs font-serif font-semibold truncate">
                  {gender === 'men'
                    ? 'Midnight Navy 3-Piece Bespoke Suit'
                    : 'Royal Purple Banarasi Katan Silk Saree'}
                </p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] h-full">
              <img
                src={
                  gender === 'men'
                    ? '/assets/catalog/m-obsidian-bandhgala-tux-front.jpg'
                    : '/assets/catalog/w-wine-organza-floral-gown-front.jpg'
                }
                alt="Editorial Collection Secondary"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute bottom-3 left-3 right-3 bg-black/60 backdrop-blur-md rounded-xl p-2.5 text-white">
                <p className="text-[10px] uppercase tracking-wider text-[#E8C5CC] font-bold">
                  Bespoke Studio
                </p>
                <p className="text-xs font-serif font-semibold truncate">
                  {gender === 'men'
                    ? 'Obsidian Peak-Lapel Bandhgala Tuxedo'
                    : 'Rose-Wine 3D Floral Organza Gown'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PWA Mobile Link & Instant Installation Strip */}
      <div className="rounded-3xl bg-gradient-to-r from-[#2D2825] via-[#3E352F] to-[#2D2825] text-white p-4 sm:p-5 shadow-sm border border-[#D5C7B8]/40 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
            <Smartphone className="w-5 h-5 text-[#D4AF37]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-serif text-sm sm:text-base font-bold text-white truncate">
                Install PEARL PICK on Your Mobile Phone
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#8D2434] text-[#FAF7F2] text-[9px] font-bold uppercase tracking-wider">
                PWA
              </span>
            </div>
            <p className="text-xs text-[#E4D9D1] font-light truncate mt-0.5">
              Scan QR code or copy direct PWA link for full-screen offline experience on iOS & Android.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
          <PWAInstallButton
            variant="button"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#8D2434] hover:bg-[#A1293B] text-white font-bold text-xs shadow-md"
          />
        </div>
      </div>

      {/* 2. SHOP BY CATEGORY (WOMEN, MEN, ETHNIC, FESTIVE, COLLECTIONS) */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D2434] font-bold block">
              Curated Departments
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825] mt-0.5">
              Shop By Category
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onExploreMarketplace()}
            className="text-xs font-bold uppercase tracking-wider text-[#8D2434] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {categoryCards.map((cat) => (
            <div
              key={cat.id}
              onClick={() => {
                if (cat.id === 'women' && onGenderChange) onGenderChange('women');
                if (cat.id === 'men' && onGenderChange) onGenderChange('men');
                onExploreMarketplace(cat.id);
              }}
              className="group relative rounded-2xl overflow-hidden aspect-[4/5] bg-[#EFE9E2] border border-[#E4D9D1] cursor-pointer shadow-2xs hover:shadow-md transition-all"
            >
              <img
                src={cat.image}
                alt={cat.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <h3 className="font-serif text-lg font-bold tracking-tight">
                  {cat.title}
                </h3>
                <p className="text-[11px] text-white/80 line-clamp-1 mt-0.5">
                  {cat.subtitle}
                </p>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#E8C5CC] mt-2 group-hover:translate-x-1 transition-transform">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. DESIGNER SPOTLIGHT — ROTATING CAROUSEL OF VERIFIED TAILORS & TOP-RATED COLLECTION ITEMS */}
      <DesignerSpotlight
        tailors={tailors && tailors.length > 0 ? tailors : verifiedTailors}
        products={products}
        onViewPortfolio={onSelectTailor}
        onRequestStitching={onRequestStitching}
        onExploreAllTailors={onExploreTailors}
      />

      {/* 4. FEATURED DRESSES (Myntra-Style E-Commerce Product Grid) */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D2434] font-bold block">
              Ready-To-Wear & Designer Editions
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825] mt-0.5">
              Featured Dresses
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onExploreMarketplace()}
            className="text-xs font-bold uppercase tracking-wider text-[#8D2434] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Explore All Dresses ({approvedProducts.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            const discountPercent = product.originalPrice
              ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
              : null;

            return (
              <div
                key={product.id}
                onClick={() => {
                  if (onSelectProduct) onSelectProduct(product);
                  else onExploreMarketplace();
                }}
                className="group bg-white rounded-2xl border border-[#ECE6DE] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                <div>
                  {/* 3:4 Product Image */}
                  <div className="relative aspect-[3/4] bg-[#F5F2EB] overflow-hidden">
                    <img
                      src={product.images?.[0] || product.frontImageUrl}
                      alt={product.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Rating overlay (Bottom-Left like Myntra) */}
                    <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded bg-white/90 backdrop-blur-xs text-[11px] font-bold text-[#2D2825] flex items-center gap-1 shadow-2xs tabular-nums">
                      <span>{product.rating}</span>
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span className="text-[#7D726A] font-normal">| {product.reviewCount}</span>
                    </div>

                    {/* Wishlist Heart Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onToggleWishlist) onToggleWishlist(product.id);
                      }}
                      className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#2D2825] hover:text-[#8D2434] shadow-2xs transition-colors cursor-pointer"
                      title="Add to Wishlist"
                    >
                      <Heart
                        className={`w-4 h-4 ${
                          isWishlisted ? 'fill-[#8D2434] text-[#8D2434]' : 'text-[#2D2825]'
                        }`}
                      />
                    </button>
                  </div>

                  {/* Product Metadata */}
                  <div className="p-4 space-y-1.5">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#2D2825] truncate">
                      {product.designerName}
                    </p>
                    <h3 className="text-sm text-[#6E6359] font-normal line-clamp-1 group-hover:text-[#8D2434] transition-colors">
                      {product.title}
                    </h3>
                    <p className="text-[11px] text-[#7D726A] truncate">
                      {product.fabricType || product.fabric}
                      {product.weightGsm ? ` · ${product.weightGsm} GSM` : ''}
                      {product.origin ? ` · ${product.origin.split(',')[0]}` : ''}
                    </p>

                    <div className="pt-1 flex items-baseline gap-2 tabular-nums">
                      <span className="text-sm font-bold text-[#2D2825]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      {product.originalPrice && (
                        <span className="text-xs text-[#7D726A] line-through">
                          ₹{product.originalPrice.toLocaleString('en-IN')}
                        </span>
                      )}
                      {discountPercent && discountPercent > 0 && (
                        <span className="text-[11px] font-bold text-[#8D2434]">
                          ({discountPercent}% OFF)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="px-4 pb-4 pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) {
                        onAddToCart(product, product.sizes[0] || 'M');
                      } else {
                        onExploreMarketplace();
                      }
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add to Bag</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStartGenerator(
                        `Custom bespoke version of ${product.title} crafted in ${product.fabric}`,
                        product.category as any
                      );
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#FBECEF] border border-[#E4D9D1] text-[#8D2434] text-xs font-bold transition-colors cursor-pointer"
                    title="Customize this style in AI Studio"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. PROMINENT AI DRESS DESIGN STUDIO BANNER */}
      <section className="rounded-3xl bg-white border border-[#E4D9D1] p-6 sm:p-10 shadow-2xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-6 space-y-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#8D2434] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Custom Dress Design Studio</span>
            </p>

            <h2 className="font-serif text-2xl sm:text-4xl font-bold text-[#2D2825] leading-tight">
              Design Your Own Dress in 3 Coordinated Views — Front, Back & Side
            </h2>

            <p className="text-xs sm:text-sm text-[#6E6359] leading-relaxed">
              Configure silhouette, neckline, sleeves, heritage fabric, colour palette, and embroidery. Our AI Studio generates a coordinated 3-panel fashion presentation sheet that you can send directly to verified designers for price quotations and custom tailoring.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <Layers className="w-4 h-4 text-[#8D2434] mb-1" />
                <p className="text-xs font-bold text-[#2D2825]">1. Configure & Prompt</p>
                <p className="text-[11px] text-[#7D726A] mt-0.5">
                  Fabric, neckline, sleeves & custom details
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <Sparkles className="w-4 h-4 text-[#8D2434] mb-1" />
                <p className="text-xs font-bold text-[#2D2825]">2. 3-View Generation</p>
                <p className="text-[11px] text-[#7D726A] mt-0.5">
                  Consistent Front, Back & Side dress sheet
                </p>
              </div>
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] col-span-2 sm:col-span-1">
                <Scissors className="w-4 h-4 text-[#8D2434] mb-1" />
                <p className="text-xs font-bold text-[#2D2825]">3. Negotiate & Order</p>
                <p className="text-[11px] text-[#7D726A] mt-0.5">
                  Compare quotes, bargain price & track milestones
                </p>
              </div>
            </div>

            <div className="pt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onStartGenerator()}
                className="px-6 py-3.5 rounded-xl bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Open AI Dress Studio</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {activeFeaturedDesign && (
                <button
                  type="button"
                  onClick={() => onSelectDesign(activeFeaturedDesign)}
                  className="px-5 py-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E2] border border-[#E4D9D1] text-xs font-bold text-[#2D2825] transition-all cursor-pointer"
                >
                  Inspect Sample 3-View Design Sheet
                </button>
              )}
            </div>
          </div>

          {/* 3-Panel Preview Showcase */}
          <div className="lg:col-span-6 grid grid-cols-3 gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE6DE]">
            {activeFeaturedDesign?.variations[0] ? (
              <>
                <div
                  onClick={() => onSelectDesign(activeFeaturedDesign)}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border border-[#E4D9D1]">
                    <img
                      src={activeFeaturedDesign.variations[0].frontImageUrl}
                      alt="Front View"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-center text-[#2D2825]">
                    1. Front View
                  </p>
                </div>

                <div
                  onClick={() => onSelectDesign(activeFeaturedDesign)}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border border-[#E4D9D1]">
                    <img
                      src={
                        activeFeaturedDesign.variations[0].backImageUrl ||
                        activeFeaturedDesign.variations[0].frontImageUrl
                      }
                      alt="Back View"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-center text-[#2D2825]">
                    2. Back View
                  </p>
                </div>

                <div
                  onClick={() => onSelectDesign(activeFeaturedDesign)}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border border-[#E4D9D1]">
                    <img
                      src={
                        activeFeaturedDesign.variations[0].sideImageUrl ||
                        activeFeaturedDesign.variations[0].frontImageUrl
                      }
                      alt="Side View"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-center text-[#2D2825]">
                    3. Side Profile
                  </p>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </section>

      {/* 6. TRENDING & RECOMMENDED PRODUCTS */}
      <section className="space-y-5">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D2434] font-bold block">
              Most Wishlisted This Week
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825] mt-0.5">
              Trending & Recommended
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onExploreMarketplace('festive')}
            className="text-xs font-bold uppercase tracking-wider text-[#8D2434] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>Shop Festive Edit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {trendingProducts.map((product) => {
            const isWishlisted = wishlistIds.includes(product.id);
            return (
              <div
                key={`trend-${product.id}`}
                onClick={() => {
                  if (onSelectProduct) onSelectProduct(product);
                  else onExploreMarketplace();
                }}
                className="group bg-white rounded-2xl border border-[#ECE6DE] overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between cursor-pointer"
              >
                <div className="relative aspect-[3/4] bg-[#F5F2EB] overflow-hidden">
                  <img
                    src={product.images?.[0] || product.frontImageUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onToggleWishlist) onToggleWishlist(product.id);
                    }}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[#2D2825] hover:text-[#8D2434] shadow-2xs cursor-pointer"
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        isWishlisted ? 'fill-[#8D2434] text-[#8D2434]' : 'text-[#2D2825]'
                      }`}
                    />
                  </button>
                </div>

                <div className="p-4 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#2D2825] truncate">
                      {product.designerName}
                    </span>
                    <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-0.5">
                      <CheckCircle2 className="w-3 h-3" /> In Stock
                    </span>
                  </div>
                  <h3 className="text-sm text-[#6E6359] line-clamp-1">{product.title}</h3>
                  <p className="text-[11px] text-[#7D726A] truncate">
                    {product.fabricType || product.fabric}
                    {product.weightGsm ? ` · ${product.weightGsm} GSM` : ''}
                  </p>
                  <div className="pt-1 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#2D2825] tabular-nums">
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onAddToCart) onAddToCart(product, product.sizes[0] || 'M');
                      }}
                      className="text-xs font-bold text-[#8D2434] hover:underline cursor-pointer"
                    >
                      + Add to Bag
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 7. RECENTLY VIEWED PRODUCTS (Amazon / Myntra Style) */}
      {recentlyViewedProducts && recentlyViewedProducts.length > 0 && (
        <section className="space-y-4 pt-6 border-t border-[#ECE6DE]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D2434] font-bold block">
                Inspired By Your Browsing History
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2825] mt-0.5">
                Recently Viewed Pieces
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onExploreMarketplace()}
              className="text-xs font-bold text-[#8D2434] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-4 overflow-x-auto pb-3 no-scrollbar">
            {recentlyViewedProducts.map((product) => (
              <div
                key={`recent-${product.id}`}
                onClick={() => {
                  if (onSelectProduct) onSelectProduct(product);
                  else onExploreMarketplace();
                }}
                className="w-44 sm:w-48 shrink-0 bg-white rounded-xl border border-[#ECE6DE] p-2.5 hover:shadow-sm hover:border-[#8D2434] transition-all cursor-pointer group"
              >
                <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-[#FAF7F2] mb-2">
                  <img
                    src={product.images?.[0] || product.frontImageUrl}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <p className="text-[10px] font-semibold text-[#8D2434] uppercase truncate">
                  {product.designerName}
                </p>
                <h4 className="font-serif text-xs font-bold text-[#2D2825] truncate">
                  {product.title}
                </h4>
                <div className="flex items-baseline justify-between mt-1">
                  <span className="text-xs font-bold text-[#2D2825]">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-current" /> {product.rating || '4.9'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
