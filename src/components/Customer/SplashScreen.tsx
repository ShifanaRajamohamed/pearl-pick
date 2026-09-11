import React, { useState } from 'react';
import { 
  Sparkles, 
  Search,
  ChevronRight, 
  Heart, 
  MessageCircle, 
  Bell, 
  Wine, 
  Crown, 
  PartyPopper,
  Flame,
  ArrowRight
} from 'lucide-react';
import { DressDesign, TailorProfile } from '../../types';

interface SplashScreenProps {
  userName?: string;
  onStartGenerator: (prompt?: string, dressType?: any) => void;
  onExploreTailors: () => void;
  onExploreMarketplace: () => void;
  onOpenMeasurements: () => void;
  onSelectDesign: (design: DressDesign) => void;
  onSelectTailor: (tailor: TailorProfile) => void;
  onRequestStitching: (tailor: TailorProfile) => void;
  onSelectCategory: (categoryName: string) => void;
  onOpenNotifications?: () => void;
  onOpenSearch?: () => void;
  featuredDesigns: DressDesign[];
  verifiedTailors: TailorProfile[];
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  userName = 'Aanya',
  onStartGenerator,
  onExploreTailors,
  onExploreMarketplace,
  onOpenMeasurements,
  onSelectDesign,
  onSelectTailor,
  onRequestStitching,
  onSelectCategory,
  onOpenNotifications,
  onOpenSearch,
  featuredDesigns,
  verifiedTailors
}) => {
  const [likedDesignIds, setLikedDesignIds] = useState<string[]>([]);

  const toggleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedDesignIds((prev) => 
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const categories = [
    { id: 'bridal', label: 'Bridal', icon: Sparkles },
    { id: 'festive', label: 'Festive', icon: PartyPopper },
    { id: 'cocktail', label: 'Cocktail', icon: Wine },
    { id: 'reception', label: 'Reception', icon: Crown },
    { id: 'evening', label: 'Evening', icon: Flame }
  ];

  const trendingDresses = [
    {
      id: 'trend-1',
      title: 'Rosewater Pearl Saree Gown',
      price: 3299,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=700&auto=format&fit=crop&q=80',
    },
    {
      id: 'trend-2',
      title: 'Midnight Organza Anarkali',
      price: 1499,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=700&auto=format&fit=crop&q=80',
    }
  ];

  const recommendedTailorsList = [
    {
      id: 'tailor-meera',
      monogram: 'M',
      bgColor: 'bg-[#4A3728]',
      name: 'Meera Couture Studio',
      rating: '4.9',
      city: 'Jaipur',
      specialty: 'Bridal Lehengas & Hand Embroidery'
    },
    {
      id: 'tailor-draped-needle',
      monogram: 'TD',
      bgColor: 'bg-[#1F1A17]',
      name: 'The Draped Needle',
      rating: '4.8',
      city: 'Mumbai',
      specialty: 'Contemporary Corsets & Gowns'
    }
  ];

  const handleSelectTrending = (item: typeof trendingDresses[0]) => {
    const match = featuredDesigns.find((d) => d.title.toLowerCase().includes(item.title.toLowerCase().slice(0, 8)));
    if (match) {
      onSelectDesign(match);
    } else if (featuredDesigns[0]) {
      onSelectDesign(featuredDesigns[0]);
    } else {
      onStartGenerator(item.title);
    }
  };

  return (
    <div id="discover-screen" className="max-w-md mx-auto space-y-6 sm:space-y-8 pb-24 text-[#2D2825] px-5 sm:px-6">
      
      {/* 1. GREETING & NOTIFICATION BELL */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[11px] uppercase tracking-widest text-[#7D726A] font-medium block">
            Atelier Maison
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2825]">
            Good evening, {userName}
          </h1>
        </div>
        <button
          onClick={onOpenNotifications}
          className="relative w-11 h-11 rounded-full hover:bg-black/5 active:scale-95 transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE]"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-[#2D2825]" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-[#8D2434] ring-2 ring-[#FAF7F2]" />
        </button>
      </div>

      {/* 2. SEARCH BAR (Minimal luxury editorial search) */}
      <div 
        onClick={onOpenSearch || onExploreMarketplace}
        className="relative flex items-center w-full h-12 px-4 rounded-full bg-white border border-[#ECE6DE] text-xs text-[#7D726A] shadow-2xs hover:border-[#8D2434] transition-all cursor-pointer"
      >
        <Search className="w-4 h-4 text-[#7D726A] mr-2.5 shrink-0" />
        <span className="font-light truncate">Search couture, silks, silhouettes...</span>
      </div>

      {/* 3. EDITORIAL HERO BANNER */}
      <div className="relative overflow-hidden rounded-[16px] bg-gradient-to-r from-[#33251D] via-[#433227] to-[#543F33] text-white p-5 shadow-sm border border-[#433227]/30">
        <div className="flex items-center justify-between gap-4">
          <div className="space-y-3 z-10 max-w-[58%]">
            <h2 className="font-serif text-xl sm:text-2xl font-bold leading-tight tracking-tight text-[#FAF7F2]">
              Made for your next unforgettable entrance
            </h2>
            <button
              onClick={onExploreMarketplace}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-medium tracking-wide text-white transition-all cursor-pointer"
            >
              <span>Explore the Pearl Edit</span>
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <div className="relative w-28 aspect-[3/4] sm:w-32 rounded-[14px] overflow-hidden shrink-0 shadow-md border border-white/15 bg-black/20">
            <img
              src="https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80"
              alt="The Pearl Edit Gown"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>

      {/* 4. CATEGORIES (Horizontal pill scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.label);
                onStartGenerator(undefined, cat.label);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-[#ECE6DE] text-xs font-medium text-[#2D2825] hover:border-[#8D2434] hover:text-[#8D2434] active:scale-95 transition-all shadow-2xs whitespace-nowrap cursor-pointer"
            >
              <Icon className="w-3.5 h-3.5 text-[#8D2434]" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 5. AI DRESS STUDIO SHORTCUT (Clean editorial card with primary 52px CTA) */}
      <div className="bg-white rounded-[16px] border border-[#ECE6DE] p-5 shadow-2xs space-y-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#8D2434] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Bespoke Studio</span>
            </div>
            <h3 className="font-serif text-lg font-bold text-[#2D2825]">
              Design something only you could wear
            </h3>
            <p className="text-xs text-[#7D726A] font-light leading-relaxed">
              Turn a silhouette, textile, or vision into a production-ready dress concept.
            </p>
          </div>
        </div>

        <button
          onClick={() => onStartGenerator()}
          className="w-full h-[52px] rounded-[16px] bg-[#8D2434] hover:bg-[#781E2C] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-white" />
          <span>Launch AI Dress Studio</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* 6. TRENDING DRESSES (2-Column Grid, only image, title, price, rating, wishlist) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-[#2D2825]">
            Trending Dresses
          </h2>
          <button
            onClick={() => onExploreMarketplace()}
            className="text-xs font-medium text-[#8D2434] hover:underline cursor-pointer"
          >
            See all
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4">
          {trendingDresses.map((dress) => {
            const isLiked = likedDesignIds.includes(dress.id);

            return (
              <div
                key={dress.id}
                onClick={() => handleSelectTrending(dress)}
                className="group bg-white rounded-[16px] border border-[#ECE6DE] overflow-hidden p-2.5 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* 3:4 Aspect Ratio Image */}
                <div className="relative aspect-[3/4] rounded-[12px] overflow-hidden bg-[#F5EFEA]">
                  <img
                    src={dress.image}
                    alt={dress.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => toggleLike(dress.id, e)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-[#2D2825] hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs"
                    title={isLiked ? "Unlike" : "Like"}
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isLiked ? 'fill-[#8D2434] text-[#8D2434]' : 'text-[#2D2825]'
                      }`}
                    />
                  </button>
                </div>

                {/* Content: Title, Price, Rating */}
                <div className="pt-2.5 pb-1 space-y-0.5">
                  <h4 className="font-medium text-xs text-[#2D2825] line-clamp-1 leading-snug">
                    {dress.title}
                  </h4>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="font-semibold text-xs text-[#2D2825]">
                      ₹{dress.price}
                    </span>
                    <span className="text-[10px] text-[#7D726A] font-medium">
                      ★ {dress.rating}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 7. RECOMMENDED TAILORS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-[#2D2825]">
            Recommended Tailors
          </h2>
          <button
            onClick={onExploreTailors}
            className="text-xs font-medium text-[#8D2434] hover:underline cursor-pointer"
          >
            View all tailors
          </button>
        </div>

        <div className="space-y-2.5">
          {recommendedTailorsList.map((tailor) => {
            const fullTailor = verifiedTailors.find((t) => t.name.includes(tailor.name.split(' ')[0])) || verifiedTailors[0];

            return (
              <div
                key={tailor.id}
                onClick={() => onSelectTailor(fullTailor)}
                className="bg-white rounded-[16px] border border-[#ECE6DE] p-4 flex items-center justify-between gap-3 shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 rounded-full ${tailor.bgColor} text-white font-serif font-bold text-sm flex items-center justify-center shrink-0 shadow-2xs`}>
                    {tailor.monogram}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium text-xs sm:text-sm text-[#2D2825]">
                        {tailor.name}
                      </span>
                      <span className="w-3.5 h-3.5 rounded-full bg-[#E5A93C] text-white flex items-center justify-center text-[8px] font-bold">
                        ✓
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#7D726A] mt-0.5">
                      <span className="font-medium text-[#2D2825]">★ {tailor.rating}</span>
                      <span>•</span>
                      <span>{tailor.city}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestStitching(fullTailor);
                  }}
                  className="w-10 h-10 rounded-full border border-[#ECE6DE] hover:border-[#8D2434] hover:bg-[#FBECEF] text-[#2D2825] hover:text-[#8D2434] flex items-center justify-center transition-all cursor-pointer shrink-0"
                  title="Contact tailor"
                >
                  <MessageCircle className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
