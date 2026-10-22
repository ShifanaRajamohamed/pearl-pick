import React, { useState } from 'react';
import { 
  Sparkles, 
  Search,
  ChevronRight, 
  Heart, 
  Bell, 
  Crown, 
  Flame,
  ArrowRight,
  ShieldCheck,
  Award
} from 'lucide-react';
import { DressDesign, TailorProfile } from '../../types';
import { FashionAdviceSection } from './FashionAdviceSection';

interface SplashScreenProps {
  userName?: string;
  gender?: 'women' | 'men';
  onGenderChange?: (gender: 'women' | 'men') => void;
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
  gender = 'women',
  onGenderChange,
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

  const categories = gender === 'men' 
    ? [
        { id: 'bandhgalas', label: 'Bandhgalas', icon: Crown },
        { id: 'tuxedos', label: 'Savile Row Tuxedos', icon: Flame },
        { id: 'sherwanis', label: 'Royal Sherwanis', icon: Sparkles },
        { id: 'bundis', label: 'Nehru Jackets', icon: Award },
        { id: 'suits', label: 'Italian Blazers', icon: ShieldCheck }
      ]
    : [
        { id: 'bridal', label: 'Bridal Lehengas', icon: Sparkles },
        { id: 'gowns', label: 'Couture Gowns', icon: Flame },
        { id: 'anarkalis', label: 'Anarkali Suits', icon: Crown },
        { id: 'sarees', label: 'Saree Gowns', icon: Award },
        { id: 'cocktail', label: 'Cocktail Fusion', icon: ShieldCheck }
      ];

  const trendingDresses = gender === 'men'
    ? [
        {
          id: 'trend-men-1',
          title: 'The Royal Rajputana Bandhgala',
          price: 32000,
          rating: 4.96,
          image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=700&auto=format&fit=crop&q=80',
        },
        {
          id: 'trend-men-2',
          title: 'Savile Row Bordeaux Velvet Dinner Suit',
          price: 42000,
          rating: 4.94,
          image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=700&auto=format&fit=crop&q=80',
        }
      ]
    : [
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

  const recommendedTailorsList = gender === 'men'
    ? [
        {
          id: 'tailor-singhania',
          monogram: 'S',
          bgColor: 'bg-[#2D2825]',
          name: 'Master R. K. Singhania & Sons',
          rating: '4.98',
          city: 'Connaught Place, New Delhi',
          specialty: "Men's Bespoke Suiting & Royal Bandhgalas"
        },
        {
          id: 'tailor-salim-chishti',
          monogram: 'SC',
          bgColor: 'bg-[#4A3728]',
          name: 'Darzi-e-Khaas by Salim Chishti',
          rating: '4.96',
          city: 'Aminabad, Lucknow',
          specialty: 'Royal Sherwanis & Hand Chikankari'
        }
      ]
    : [
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
    <div id="discover-screen" className="w-full max-w-md mx-auto space-y-5 sm:space-y-6 pb-24 text-[#2D2825] px-4 sm:px-5">
      
      {/* 1. GREETING & NOTIFICATION BELL */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#7D726A] font-semibold block">
            {gender === 'men' ? "Men's Bespoke Maison" : "Haute Couture Maison"}
          </span>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#2D2825]">
            Good evening, {userName}
          </h1>
        </div>
        <button
          onClick={onOpenNotifications}
          className="relative w-10 h-10 rounded-full bg-white hover:bg-[#FAF7F2] active:scale-95 transition-all cursor-pointer text-[#2D2825] flex items-center justify-center border border-[#ECE6DE] shadow-2xs"
          title="Notifications"
        >
          <Bell className="w-4 h-4 text-[#2D2825]" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#8D2434] ring-2 ring-white" />
        </button>
      </div>

      {/* 2. GENDER SEGMENTED CONTROLLER IN HERO */}
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

      {/* 3. SEARCH BAR */}
      <div 
        onClick={onOpenSearch || onExploreMarketplace}
        className="relative flex items-center w-full h-11 px-4 rounded-full bg-white border border-[#ECE6DE] text-xs text-[#7D726A] shadow-2xs hover:border-[#8D2434] transition-all cursor-pointer"
      >
        <Search className="w-4 h-4 text-[#7D726A] mr-2.5 shrink-0" />
        <span className="font-light truncate">
          {gender === 'men' ? 'Search Bandhgalas, Savile Row suits, sherwanis...' : 'Search lehengas, gowns, silks, master karigars...'}
        </span>
      </div>

      {/* 4. EDITORIAL HERO BANNER */}
      <div className="relative overflow-hidden rounded-[20px] bg-gradient-to-r from-[#2D2825] via-[#3D3531] to-[#4F4640] text-white p-4 sm:p-5 shadow-sm border border-[#2D2825]/30">
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-2.5 z-10 max-w-[62%]">
            <span className="text-[9px] uppercase tracking-widest text-[#E8C5CC] font-bold block">
              {gender === 'men' ? 'Bespoke Craftsmanship' : 'Haute Couture Trousseau'}
            </span>
            <h2 className="font-serif text-lg sm:text-xl font-bold leading-tight tracking-tight text-[#FAF7F2]">
              {gender === 'men' 
                ? 'Hand-canvassed Savile Row suits & royal Bandhgalas' 
                : 'Made for your next unforgettable entrance'}
            </h2>
            <button
              onClick={onExploreMarketplace}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-white/25 bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-medium tracking-wide text-white transition-all cursor-pointer"
            >
              <span>{gender === 'men' ? "Explore Men's Edit" : 'Explore the Pearl Edit'}</span>
              <ChevronRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>

          <div className="relative w-24 sm:w-28 aspect-[3/4] rounded-[14px] overflow-hidden shrink-0 shadow-md border border-white/15 bg-black/20">
            <img
              src={gender === 'men' 
                ? "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80"
                : "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80"
              }
              alt="Editorial Bespoke"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-700"
            />
          </div>
        </div>
      </div>

      {/* 5. CATEGORIES (Horizontal pill scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {categories.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => {
                onSelectCategory(cat.label);
                onStartGenerator(undefined, cat.label as any);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-[#ECE6DE] text-xs font-medium text-[#2D2825] hover:border-[#8D2434] hover:text-[#8D2434] active:scale-95 transition-all shadow-2xs whitespace-nowrap cursor-pointer shrink-0"
            >
              <Icon className="w-3.5 h-3.5 text-[#8D2434]" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* 6. AI STUDIO SHORTCUT CTA */}
      <div className="bg-white rounded-[20px] border border-[#ECE6DE] p-4 sm:p-5 shadow-2xs space-y-3.5">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-semibold text-[#8D2434] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{gender === 'men' ? "Men's Tailoring Studio" : "Bespoke Couture Studio"}</span>
          </div>
          <h3 className="font-serif text-lg font-bold text-[#2D2825]">
            {gender === 'men' 
              ? 'Draft a bespoke suit or sherwani tailored to your exact frame' 
              : 'Design something only you could wear'}
          </h3>
          <p className="text-xs text-[#7D726A] font-light leading-relaxed">
            {gender === 'men'
              ? 'Select lapel widths, floating horsehair canvas, pure silks, and generate technical cutting patterns.'
              : 'Turn a silhouette, textile, or dream vision into a production-ready couture concept.'}
          </p>
        </div>

        <button
          onClick={() => onStartGenerator()}
          className="w-full h-12 rounded-[16px] bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-[#E8C5CC]" />
          <span>{gender === 'men' ? "Launch Men's AI Studio" : "Launch AI Dress Studio"}</span>
          <ArrowRight className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* 7. TRENDING PIECES (2-Column Grid) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-[#2D2825]">
            {gender === 'men' ? 'Trending Menswear' : 'Trending Couture'}
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
                    className="w-full h-full object-cover object-top group-hover:scale-103 transition-transform duration-500"
                  />
                  <button
                    onClick={(e) => toggleLike(dress.id, e)}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-[#2D2825] hover:text-[#8D2434] transition-colors shadow-2xs"
                  >
                    <Heart
                      className={`w-3.5 h-3.5 ${
                        isLiked ? 'fill-[#8D2434] text-[#8D2434]' : 'text-[#2D2825]'
                      }`}
                    />
                  </button>
                </div>

                {/* Details */}
                <div className="pt-2 space-y-1">
                  <h3 className="font-serif text-xs font-semibold text-[#2D2825] line-clamp-1 leading-tight group-hover:text-[#8D2434] transition-colors">
                    {dress.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs pt-0.5">
                    <span className="font-bold text-[#2D2825]">
                      ₹{dress.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#7D726A] flex items-center gap-0.5">
                      ★ {dress.rating}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 8. RECOMMENDED VERIFIED MASTER TAILORS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-[#2D2825]">
            {gender === 'men' ? 'Master Tailoring Ateliers' : 'Verified Master Tailors'}
          </h2>
          <button
            onClick={onExploreTailors}
            className="text-xs font-medium text-[#8D2434] hover:underline cursor-pointer"
          >
            Explore all
          </button>
        </div>

        <div className="space-y-2.5">
          {recommendedTailorsList.map((tailor) => {
            const fullTailor = verifiedTailors.find((t) => t.id === tailor.id) || verifiedTailors[0];

            return (
              <div
                key={tailor.id}
                onClick={() => onSelectTailor(fullTailor)}
                className="bg-white rounded-[18px] border border-[#ECE6DE] p-3.5 shadow-2xs hover:border-[#8D2434] transition-all cursor-pointer flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-full ${tailor.bgColor} text-white font-serif font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs`}>
                    {tailor.monogram}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-serif text-xs font-bold text-[#2D2825] truncate">
                        {tailor.name}
                      </span>
                      <span className="text-[10px] text-[#416035] font-semibold bg-[#416035]/10 px-1.5 py-0.2 rounded">
                        ★ {tailor.rating}
                      </span>
                    </div>
                    <span className="text-[11px] text-[#7D726A] font-light block truncate">
                      {tailor.specialty} • {tailor.city}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestStitching(fullTailor);
                  }}
                  className="px-3 py-1.5 rounded-full bg-[#FAF7F2] border border-[#ECE6DE] text-[#2D2825] hover:bg-[#8D2434] hover:text-white hover:border-[#8D2434] text-xs font-semibold transition-all shrink-0 cursor-pointer"
                >
                  Book Tailor
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 9. FASHION ADVICE SECTION */}
      <FashionAdviceSection 
        onApplyTipToGenerator={(prompt, category) => onStartGenerator(prompt, category as any)} 
        onOpenGenerator={(prompt, category) => onStartGenerator(prompt, category as any)} 
      />

    </div>
  );
};
