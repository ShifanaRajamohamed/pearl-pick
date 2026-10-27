import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Sparkles,
  Package,
  Ruler,
  FileText,
  Layers,
  LogOut,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { AuthUser } from '../types';

export type StorefrontCategory = 'women' | 'men' | 'ethnic' | 'festive' | 'collections';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeCategory?: StorefrontCategory;
  onSelectStorefrontCategory?: (category: StorefrontCategory) => void;
  gender: 'women' | 'men';
  setGender: (g: 'women' | 'men') => void;
  savedDesignsCount: number;
  activeOrdersCount: number;
  wishlistCount?: number;
  cartCount?: number;
  openMeasurements: () => void;
  openSearch: () => void;
  openFabricLibrary?: () => void;
  openCart?: () => void;
  openWishlist?: () => void;
  currentUser: AuthUser | null;
  onOpenCustomerAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeCategory,
  onSelectStorefrontCategory,
  setGender,
  savedDesignsCount,
  activeOrdersCount,
  wishlistCount = 0,
  cartCount = 0,
  openMeasurements,
  openSearch,
  openFabricLibrary,
  openCart,
  openWishlist,
  currentUser,
  onOpenCustomerAuth,
  onLogout,
}) => {
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryNav = (cat: StorefrontCategory) => {
    if (cat === 'women') setGender('women');
    if (cat === 'men') setGender('men');
    if (onSelectStorefrontCategory) {
      onSelectStorefrontCategory(cat);
    } else {
      setActiveTab('marketplace');
    }
    setMobileMenuOpen(false);
  };

  return (
    <header
      id="main-header"
      className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#ECE6DE] shadow-2xs transition-all"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* LEFT: MOBILE MENU BUTTON + BRAND LOGO + DESKTOP CATEGORIES */}
        <div className="flex items-center gap-2 sm:gap-5 xl:gap-7 min-w-0 flex-1 lg:flex-initial">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="xl:hidden p-1.5 -ml-1 text-[#2D2825] hover:text-[#8D2434] cursor-pointer shrink-0"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* BRAND LOGO — Responsive sizing so it never collides with right icons */}
          <div
            id="brand-logo-container"
            onClick={() => {
              setActiveTab('home');
              setMobileMenuOpen(false);
            }}
            className="flex items-center gap-2 cursor-pointer select-none min-w-0 shrink-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#2D2825] text-white flex items-center justify-center shadow-2xs border border-[#D4AF37]/40 shrink-0">
              <span className="font-serif text-xs sm:text-sm font-bold tracking-wider text-[#FAF7F2]">
                P
              </span>
            </div>
            <div className="min-w-0">
              <span className="font-serif text-sm sm:text-lg font-bold tracking-tight text-[#2D2825] block leading-none whitespace-nowrap">
                PEARL PICK
              </span>
              <span className="hidden sm:block text-[8px] uppercase tracking-[0.18em] text-[#8D2434] font-semibold mt-0.5 whitespace-nowrap">
                Couture & Studio
              </span>
            </div>
          </div>

          {/* DESKTOP CATEGORY NAVIGATION (Myntra / Zara Structure) */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 h-20 shrink-0 ml-2">
            {[
              { id: 'women' as StorefrontCategory, label: 'WOMEN' },
              { id: 'men' as StorefrontCategory, label: 'MEN' },
              { id: 'ethnic' as StorefrontCategory, label: 'ETHNIC' },
              { id: 'festive' as StorefrontCategory, label: 'FESTIVE' },
              { id: 'collections' as StorefrontCategory, label: 'COLLECTIONS' },
            ].map((cat) => {
              const isSelected =
                activeTab === 'marketplace' && activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryNav(cat.id)}
                  className={`h-full px-1 text-[11px] font-bold tracking-wider uppercase transition-all border-b-[3px] cursor-pointer flex items-center whitespace-nowrap ${
                    isSelected
                      ? 'border-[#8D2434] text-[#8D2434]'
                      : 'border-transparent text-[#2D2825] hover:text-[#8D2434] hover:border-[#8D2434]/40'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setActiveTab('tailors')}
              className={`h-full px-1 text-[11px] font-bold tracking-wider uppercase transition-all border-b-[3px] cursor-pointer flex items-center whitespace-nowrap ${
                activeTab === 'tailors'
                  ? 'border-[#8D2434] text-[#8D2434]'
                  : 'border-transparent text-[#2D2825] hover:text-[#8D2434] hover:border-[#8D2434]/40'
              }`}
            >
              DESIGNERS
            </button>

            {/* AI DESIGN STUDIO PROMINENT TAB */}
            <button
              type="button"
              id="nav-ai-studio-link"
              onClick={() => setActiveTab('generator')}
              className={`h-full px-1 text-[11px] font-bold tracking-wider uppercase transition-all border-b-[3px] cursor-pointer flex items-center gap-1 whitespace-nowrap ${
                activeTab === 'generator' || activeTab === 'design-viewer'
                  ? 'border-[#8D2434] text-[#8D2434]'
                  : 'border-transparent text-[#2D2825] hover:text-[#8D2434] hover:border-[#8D2434]/40'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#8D2434] shrink-0" />
              <span>AI STUDIO</span>
              <span className="text-[8px] font-extrabold uppercase px-1 py-0.5 rounded bg-[#FBECEF] text-[#8D2434] tracking-wider -mt-2">
                NEW
              </span>
            </button>
          </nav>
        </div>

        {/* CENTER: SEARCH BAR (Desktop / Tablet) */}
        <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm xl:max-w-md mx-2 min-w-[180px]">
          <div
            onClick={openSearch}
            className="w-full h-10 px-3.5 rounded-lg bg-[#F5F3EF] hover:bg-[#EFECE6] border border-transparent focus-within:border-[#D6C7B8] focus-within:bg-white flex items-center gap-2.5 text-xs text-[#6E6359] cursor-pointer transition-all"
          >
            <Search className="w-4 h-4 text-[#7D726A] shrink-0" />
            <span className="truncate">
              Search for dresses, designers, fabrics...
            </span>
          </div>
        </div>

        {/* RIGHT: MYNTRA-STYLE PROFILE, WISHLIST & SHOPPING BAG ICONS */}
        <div className="flex items-center gap-3 sm:gap-5 shrink-0">
          {/* Mobile Search Icon */}
          <button
            type="button"
            onClick={openSearch}
            className="md:hidden flex flex-col items-center justify-center text-[#2D2825] hover:text-[#8D2434] cursor-pointer px-1 py-1"
            title="Search"
          >
            <Search className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] font-semibold mt-0.5 leading-none">Search</span>
          </button>

          {/* 1. PROFILE DROPDOWN TRIGGER */}
          <div className="relative" ref={dropdownRef}>
            <button
              id="nav-profile-menu-btn"
              type="button"
              onClick={() => setProfileMenuOpen((prev) => !prev)}
              className="flex flex-col items-center justify-center text-[#2D2825] hover:text-[#8D2434] transition-colors cursor-pointer group px-1 py-1"
            >
              <div className="relative">
                <User className="w-5 h-5 stroke-[1.8]" />
                {currentUser && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                )}
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold tracking-tight mt-0.5 leading-none max-w-[64px] truncate">
                {currentUser ? currentUser.name.split(' ')[0] : 'Profile'}
              </span>
            </button>

            {/* MYNTRA-STYLE PROFILE DROPDOWN MENU */}
            {profileMenuOpen && (
              <div
                id="profile-dropdown-panel"
                className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-[#ECE6DE] py-4 px-5 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {/* Welcome Header */}
                <div className="pb-3.5 border-b border-[#ECE6DE]">
                  {currentUser ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        referrerPolicy="no-referrer"
                        className="w-10 h-10 rounded-full object-cover border border-[#E4D9D1]"
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#2D2825] truncate">
                          Hello, {currentUser.name}
                        </p>
                        <p className="text-[11px] text-[#7D726A] truncate">
                          {currentUser.phone || currentUser.email}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-[#2D2825]">Welcome</p>
                      <p className="text-[11px] text-[#7D726A] mt-0.5">
                        To access account, saved designs & manage orders
                      </p>
                      <button
                        id="dropdown-login-signup-btn"
                        type="button"
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onOpenCustomerAuth();
                        }}
                        className="mt-3 w-full py-2 px-4 rounded-lg border border-[#8D2434] text-[#8D2434] hover:bg-[#8D2434] hover:text-white text-xs font-bold tracking-wider uppercase transition-all cursor-pointer"
                      >
                        LOGIN / SIGNUP
                      </button>
                    </div>
                  )}
                </div>

                {/* Menu Links */}
                <div className="py-2.5 space-y-1 border-b border-[#ECE6DE]">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setActiveTab('profile');
                    }}
                    className="w-full flex items-center justify-between py-2 px-2 rounded-lg text-xs text-[#2D2825] hover:bg-[#FAF7F2] hover:text-[#8D2434] font-medium transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <User className="w-4 h-4 text-[#7D726A]" />
                      My Profile
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#7D726A]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setActiveTab('orders');
                    }}
                    className="w-full flex items-center justify-between py-2 px-2 rounded-lg text-xs text-[#2D2825] hover:bg-[#FAF7F2] hover:text-[#8D2434] font-medium transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Package className="w-4 h-4 text-[#7D726A]" />
                      My Orders
                    </span>
                    {activeOrdersCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-[#FBECEF] text-[#8D2434] text-[10px] font-bold">
                        {activeOrdersCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      if (openWishlist) openWishlist();
                      else setActiveTab('marketplace');
                    }}
                    className="w-full flex items-center justify-between py-2 px-2 rounded-lg text-xs text-[#2D2825] hover:bg-[#FAF7F2] hover:text-[#8D2434] font-medium transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Heart className="w-4 h-4 text-[#7D726A]" />
                      Wishlist
                    </span>
                    {wishlistCount > 0 && (
                      <span className="text-[11px] font-semibold text-[#7D726A]">
                        {wishlistCount}
                      </span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setActiveTab('wardrobe');
                    }}
                    className="w-full flex items-center justify-between py-2 px-2 rounded-lg text-xs text-[#2D2825] hover:bg-[#FAF7F2] hover:text-[#8D2434] font-medium transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-[#8D2434]" />
                      Saved AI Designs
                    </span>
                    <span className="text-[11px] font-semibold text-[#7D726A]">
                      {savedDesignsCount}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      setActiveTab('quotes');
                    }}
                    className="w-full flex items-center justify-between py-2 px-2 rounded-lg text-xs text-[#2D2825] hover:bg-[#FAF7F2] hover:text-[#8D2434] font-medium transition-colors cursor-pointer"
                  >
                    <span className="flex items-center gap-2.5">
                      <FileText className="w-4 h-4 text-[#7D726A]" />
                      Custom Quotes & Bargaining
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#7D726A]" />
                  </button>
                </div>

                {/* Measurements & Fabric Library */}
                <div className="py-2 space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      setProfileMenuOpen(false);
                      openMeasurements();
                    }}
                    className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg text-xs text-[#6E6359] hover:bg-[#FAF7F2] hover:text-[#2D2825] transition-colors cursor-pointer"
                  >
                    <Ruler className="w-4 h-4 text-[#7D726A]" />
                    Saved Body Measurements
                  </button>

                  {openFabricLibrary && (
                    <button
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        openFabricLibrary();
                      }}
                      className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg text-xs text-[#6E6359] hover:bg-[#FAF7F2] hover:text-[#2D2825] transition-colors cursor-pointer"
                    >
                      <Layers className="w-4 h-4 text-[#7D726A]" />
                      Fabric Swatch Library
                    </button>
                  )}
                </div>

                {/* Logout Button (Only when authenticated) */}
                {currentUser && (
                  <div className="pt-2 border-t border-[#ECE6DE]">
                    <button
                      id="dropdown-logout-btn"
                      type="button"
                      onClick={() => {
                        setProfileMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2.5 py-2 px-2 rounded-lg text-xs font-bold text-[#8D2434] hover:bg-[#FBECEF] transition-colors cursor-pointer"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. WISHLIST ICON */}
          <button
            id="nav-wishlist-btn"
            type="button"
            onClick={() => {
              if (openWishlist) openWishlist();
              else setActiveTab('marketplace');
            }}
            className="relative flex flex-col items-center justify-center text-[#2D2825] hover:text-[#8D2434] transition-colors cursor-pointer px-1 py-1"
          >
            <div className="relative">
              <Heart className="w-5 h-5 stroke-[1.8]" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#2D2825] text-white text-[9px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-tight mt-0.5 leading-none">
              Wishlist
            </span>
          </button>

          {/* 3. SHOPPING BAG ICON */}
          <button
            id="nav-cart-btn"
            type="button"
            onClick={openCart}
            className="relative flex flex-col items-center justify-center text-[#2D2825] hover:text-[#8D2434] transition-colors cursor-pointer px-1 py-1"
          >
            <div className="relative">
              <ShoppingBag className="w-5 h-5 stroke-[1.8]" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-[#8D2434] text-white text-[9px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold tracking-tight mt-0.5 leading-none">
              Bag
            </span>
          </button>
        </div>
      </div>

      {/* MOBILE / TABLET DRAWER MENU */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-t border-[#ECE6DE] px-4 py-4 space-y-2 shadow-lg">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {[
              { id: 'women' as StorefrontCategory, label: 'Women' },
              { id: 'men' as StorefrontCategory, label: 'Men' },
              { id: 'ethnic' as StorefrontCategory, label: 'Ethnic Wear' },
              { id: 'festive' as StorefrontCategory, label: 'Festive & Bridal' },
              { id: 'collections' as StorefrontCategory, label: 'Collections' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryNav(cat.id)}
                className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] text-left text-xs font-bold text-[#2D2825] hover:text-[#8D2434] cursor-pointer"
              >
                {cat.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setActiveTab('tailors');
                setMobileMenuOpen(false);
              }}
              className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] text-left text-xs font-bold text-[#2D2825] hover:text-[#8D2434] cursor-pointer"
            >
              Designers
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('generator');
              setMobileMenuOpen(false);
            }}
            className="w-full py-3 px-4 rounded-xl bg-[#2D2825] text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#D4AF37]" />
            AI Dress Design Studio
          </button>
        </div>
      )}
    </header>
  );
};
