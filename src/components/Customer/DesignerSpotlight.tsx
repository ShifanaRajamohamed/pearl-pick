import React, { useState, useEffect, useMemo } from 'react';
import {
  Star,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ArrowRight,
  Sparkles,
  Clock
} from 'lucide-react';
import { TailorProfile, MarketplaceProduct } from '../../types';

export interface DesignerSpotlightProps {
  tailors: TailorProfile[];
  products?: MarketplaceProduct[];
  onViewPortfolio: (tailor: TailorProfile) => void;
  onRequestStitching?: (tailor: TailorProfile) => void;
  onExploreAllTailors?: () => void;
}

export const DesignerSpotlight: React.FC<DesignerSpotlightProps> = ({
  tailors,
  products = [],
  onViewPortfolio,
  onRequestStitching,
  onExploreAllTailors
}) => {
  // Filter verified tailors from the tailors state
  const verifiedTailors = useMemo(() => {
    const list = tailors.filter((t) => t.verificationStatus === 'VERIFIED');
    return list.length > 0 ? list : tailors;
  }, [tailors]);

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Auto-rotate carousel every 5 seconds unless paused on hover
  useEffect(() => {
    if (verifiedTailors.length <= 1 || isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % verifiedTailors.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [verifiedTailors.length, isPaused]);

  if (verifiedTailors.length === 0) {
    return null;
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + verifiedTailors.length) % verifiedTailors.length);
  };

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % verifiedTailors.length);
  };

  // Resolve top-rated product/portfolio item for each verified tailor
  const getTopProductForTailor = (tailor: TailorProfile) => {
    const sortedPortfolio = [...(tailor.portfolio || [])].sort(
      (a, b) => (b.customerRating || 5) - (a.customerRating || 5)
    );

    if (sortedPortfolio.length > 0) {
      const top = sortedPortfolio[0];
      return {
        title: top.title,
        category: top.category,
        imageUrl: top.imageUrl,
        price: top.price,
        rating: top.customerRating || tailor.rating,
        turnaroundDays: top.completionTimeDays || tailor.averageTurnaroundDays
      };
    }

    const matchingProduct = products.find(
      (p) =>
        p.designerName.toLowerCase().includes(tailor.name.split(' ')[0].toLowerCase()) ||
        p.designerName.toLowerCase().includes(tailor.shopName.split(' ')[0].toLowerCase())
    );

    if (matchingProduct) {
      return {
        title: matchingProduct.title,
        category: matchingProduct.categoryLabel,
        imageUrl: matchingProduct.frontImageUrl || matchingProduct.images[0],
        price: matchingProduct.price,
        rating: matchingProduct.rating,
        turnaroundDays: matchingProduct.leadTimeDays || tailor.averageTurnaroundDays
      };
    }

    return {
      title: `${tailor.specialties[0] || 'Bespoke Couture'} Signature Creation`,
      category: tailor.badge,
      imageUrl: tailor.coverImage,
      price: tailor.startingPrice,
      rating: tailor.rating,
      turnaroundDays: tailor.averageTurnaroundDays
    };
  };

  // Compute visible 3-card rotating window from verifiedTailors
  const visibleCards = useMemo(() => {
    const count = Math.min(3, verifiedTailors.length);
    const items: { tailor: TailorProfile; originalIndex: number }[] = [];
    for (let i = 0; i < count; i++) {
      const idx = (activeIndex + i) % verifiedTailors.length;
      items.push({ tailor: verifiedTailors[idx], originalIndex: idx });
    }
    return items;
  }, [verifiedTailors, activeIndex]);

  return (
    <section
      id="designer-spotlight"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="rounded-3xl bg-white border border-[#E4D9D1] p-6 sm:p-8 lg:p-10 shadow-2xs space-y-6"
    >
      {/* Header & Carousel Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#ECE6DE] pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-[#8D2434] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#8D2434]" />
            <span>Designer Spotlight · Verified Master Tailors</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825] mt-1">
            Featured Couturiers & Signature Creations
          </h2>
          <p className="text-xs text-[#7D726A] mt-1">
            Rotating showcase of verified master tailors, their top-rated garment creations, and direct portfolio access.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          {/* Carousel Indicator Dots */}
          <div className="flex items-center gap-1.5 mr-1">
            {verifiedTailors.map((t, idx) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveIndex(idx)}
                aria-label={`Spotlight ${t.shopName}`}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  idx === activeIndex
                    ? 'w-6 bg-[#8D2434]'
                    : 'w-2 bg-[#D6C7B8] hover:bg-[#8D2434]/60'
                }`}
              />
            ))}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous Designer"
              className="w-9 h-9 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2] hover:bg-[#2D2825] text-[#2D2825] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next Designer"
              className="w-9 h-9 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2] hover:bg-[#2D2825] text-[#2D2825] hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {onExploreAllTailors && (
            <button
              type="button"
              onClick={onExploreAllTailors}
              className="hidden sm:inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#8D2434] hover:underline ml-1 cursor-pointer"
            >
              <span>All Tailors ({verifiedTailors.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Rotating Carousel Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {visibleCards.map(({ tailor, originalIndex }, cardPosition) => {
          const topProduct = getTopProductForTailor(tailor);
          const isLeadSpotlight = cardPosition === 0;

          return (
            <div
              key={`${tailor.id}-${originalIndex}`}
              className={`group rounded-2xl border overflow-hidden transition-all flex flex-col justify-between ${
                isLeadSpotlight
                  ? 'bg-[#FAF7F2] border-[#8D2434]/40 shadow-md'
                  : 'bg-white border-[#ECE6DE] shadow-2xs hover:shadow-md'
              }`}
            >
              <div>
                {/* Top Product Image (3:4 Aspect Ratio) */}
                <div
                  onClick={() => onViewPortfolio(tailor)}
                  className="relative aspect-[3/4] bg-[#EFE9E2] overflow-hidden cursor-pointer"
                >
                  <img
                    src={topProduct.imageUrl}
                    alt={topProduct.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />

                  {/* Top Bar: Tailor Rating & Verified Badge */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
                    <div className="px-2.5 py-1 rounded-md bg-white/95 backdrop-blur-xs text-[#2D2825] text-xs font-bold flex items-center gap-1 shadow-2xs tabular-nums">
                      <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
                      <span>{tailor.rating}</span>
                      <span className="text-[10px] text-[#7D726A] font-normal">
                        ({tailor.reviewCount})
                      </span>
                    </div>

                    <div className="px-2.5 py-1 rounded-md bg-[#2D2825]/90 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      <span>{tailor.badge}</span>
                    </div>
                  </div>

                  {/* Bottom Overlay: Top Product Showcase Info */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 text-white space-y-1">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#E8C5CC] font-bold">
                      <span>Top Creation · {topProduct.category}</span>
                      <span className="flex items-center gap-1 tabular-nums">
                        <Clock className="w-3 h-3" />
                        {topProduct.turnaroundDays}d
                      </span>
                    </div>
                    <h4 className="font-serif text-base font-bold leading-snug line-clamp-1">
                      {topProduct.title}
                    </h4>
                    <p className="text-xs font-bold text-[#D4AF37] tabular-nums">
                      ₹{topProduct.price.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Tailor Profile Info */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={tailor.avatar}
                      alt={tailor.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-full object-cover border border-[#E4D9D1] shrink-0"
                    />
                    <div className="min-w-0">
                      <h3 className="font-serif text-base font-bold text-[#2D2825] truncate">
                        {tailor.shopName}
                      </h3>
                      <p className="text-xs text-[#7D726A] flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-[#8D2434] shrink-0" />
                        <span>
                          {tailor.name} · {tailor.city}
                        </span>
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-[#6E6359] line-clamp-2 leading-relaxed">
                    {tailor.bio}
                  </p>

                  {/* Unboxed Specialties Line */}
                  <p className="text-[11px] font-medium text-[#2D2825] truncate">
                    {tailor.specialties.slice(0, 3).join(' · ')}
                  </p>
                </div>
              </div>

              {/* Action Footer with Direct 'View Portfolio' Button */}
              <div className="px-4 pb-4 pt-2 border-t border-[#ECE6DE] flex items-center justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-[#7D726A] block">
                    Stitching From
                  </span>
                  <span className="text-sm font-bold text-[#2D2825] tabular-nums">
                    ₹{tailor.startingPrice.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {onRequestStitching && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestStitching(tailor);
                      }}
                      className="p-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#FBECEF] border border-[#E4D9D1] text-[#8D2434] transition-colors cursor-pointer"
                      title="Commission Custom Dress"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => onViewPortfolio(tailor)}
                    className="px-4 py-2.5 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>View Portfolio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
