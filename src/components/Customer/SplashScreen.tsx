import React from 'react';
import {
  Sparkles,
  Heart,
  ShoppingBag,
  ArrowRight,
  Star,
  CheckCircle2,
  Scissors,
  Layers
} from 'lucide-react';
import { DressDesign, TailorProfile, MarketplaceProduct } from '../../types';
import { StorefrontCategory } from '../Navbar';
import { DesignerSpotlight } from './DesignerSpotlight';

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
}) => {

  const categoryCards: {
    id: StorefrontCategory;
    title: string;
    subtitle: string;
    image: string;
  }[] = [
    {
      id: 'women',
      title: 'Women',
      subtitle: 'Couture Gowns, Sarees & Lehengas',
      image:
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=700&auto=format&fit=crop&q=80',
    },
    {
      id: 'men',
      title: 'Men',
      subtitle: 'Bandhgalas, Sherwanis & Bespoke Suits',
      image:
        'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop&q=80',
    },
    {
      id: 'ethnic',
      title: 'Ethnic',
      subtitle: 'Handloom Banarasi, Kanjeevaram & Chikankari',
      image:
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=700&auto=format&fit=crop&q=80',
    },
    {
      id: 'festive',
      title: 'Festive & Bridal',
      subtitle: 'Wedding Trousseau, Sangeet & Reception',
      image:
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80',
    },
    {
      id: 'collections',
      title: 'Collections',
      subtitle: 'Limited-Edition Runway & Atelier Capsules',
      image:
        'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=700&auto=format&fit=crop&q=80',
    },
  ];

  const approvedProducts = products.filter(
    (p) => !p.moderationStatus || p.moderationStatus === 'APPROVED'
  );
  const featuredProducts = approvedProducts.slice(0, 4);
  const trendingProducts =
    approvedProducts.slice(4, 8).length > 0
      ? approvedProducts.slice(4, 8)
      : approvedProducts.slice(0, 4);

  return (
    <div id="storefront-homepage" className="w-full space-y-14 pb-8 text-[#2D2825]">
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
                    ? 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'
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
                  {gender === 'men' ? 'Royal Jodhpuri Bandhgala' : 'Ivory Pearl Zardozi Lehenga'}
                </p>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden aspect-[3/4] h-full">
              <img
                src={
                  gender === 'men'
                    ? 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80'
                    : 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'
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
                  {gender === 'men' ? 'Savile Row 3-Piece Tuxedo' : 'Banarasi Silk Anarkali'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

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
                onClick={() => onExploreMarketplace()}
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

              {featuredDesigns[0] && (
                <button
                  type="button"
                  onClick={() => onSelectDesign(featuredDesigns[0])}
                  className="px-5 py-3.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E2] border border-[#E4D9D1] text-xs font-bold text-[#2D2825] transition-all cursor-pointer"
                >
                  Inspect Sample 3-View Design Sheet
                </button>
              )}
            </div>
          </div>

          {/* 3-Panel Preview Showcase */}
          <div className="lg:col-span-6 grid grid-cols-3 gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#ECE6DE]">
            {featuredDesigns[0]?.variations[0] ? (
              <>
                <div
                  onClick={() => onSelectDesign(featuredDesigns[0])}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border border-[#E4D9D1]">
                    <img
                      src={featuredDesigns[0].variations[0].frontImageUrl}
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
                  onClick={() => onSelectDesign(featuredDesigns[0])}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border border-[#E4D9D1]">
                    <img
                      src={
                        featuredDesigns[0].variations[0].backImageUrl ||
                        featuredDesigns[0].variations[0].frontImageUrl
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
                  onClick={() => onSelectDesign(featuredDesigns[0])}
                  className="space-y-1.5 cursor-pointer group"
                >
                  <div className="aspect-[3/4] rounded-xl overflow-hidden bg-white border border-[#E4D9D1]">
                    <img
                      src={
                        featuredDesigns[0].variations[0].sideImageUrl ||
                        featuredDesigns[0].variations[0].frontImageUrl
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
                onClick={() => onExploreMarketplace()}
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
    </div>
  );
};
