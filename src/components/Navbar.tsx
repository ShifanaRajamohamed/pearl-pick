import React from 'react';
import { 
  Sparkles, 
  Scissors, 
  ShoppingBag, 
  Search, 
  Bell, 
  User, 
  Monitor, 
  Smartphone, 
  BookOpen, 
  LogIn,
  Package
} from 'lucide-react';
import { UserRole, AuthUser } from '../types';
import { OfflineSyncBadge } from './OfflineSyncBadge';

interface NavbarProps {
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  gender: 'women' | 'men';
  setGender: (g: 'women' | 'men') => void;
  savedDesignsCount: number;
  activeOrdersCount: number;
  unreadNotificationsCount: number;
  openMeasurements: () => void;
  openSearch: () => void;
  openNotifications: () => void;
  showDocs: boolean;
  setShowDocs: (val: boolean) => void;
  currentUser: AuthUser | null;
  onOpenAuth: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setCurrentRole,
  activeTab,
  setActiveTab,
  isMobileFrame,
  setIsMobileFrame,
  gender,
  setGender,
  savedDesignsCount,
  activeOrdersCount,
  unreadNotificationsCount,
  openMeasurements,
  openSearch,
  openNotifications,
  showDocs,
  setShowDocs,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onLogout
}) => {
  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#F9F6F2]/95 backdrop-blur-xl border-b border-[#E4D9D1] transition-all">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-2">
          
          {/* 1. BRAND LOGO IDENTITY */}
          <div 
            id="brand-logo-container"
            className="flex items-center gap-2 cursor-pointer select-none shrink-0" 
            onClick={() => { setShowDocs(false); setActiveTab('home'); }}
          >
            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#2D2825] text-white shadow-2xs">
              <span className="font-serif text-sm font-bold tracking-wider">P</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-base sm:text-lg font-bold tracking-tight text-[#2D2825] whitespace-nowrap">
                PEARL PICK
              </span>
              {!isMobileFrame && (
                <span className="text-[9px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded-full bg-[#FBECEF] text-[#8D2434] border border-[#E8C5CC] hidden lg:inline-flex">
                  Bespoke Atelier
                </span>
              )}
            </div>
          </div>

          {/* 2. GENDER SEGMENTED SWITCHER (WOMEN / MEN) */}
          <div 
            id="gender-toggle-bar"
            className="flex items-center p-0.5 rounded-full bg-[#EFE9E2] border border-[#E0D6CC] shadow-inner shrink-0"
          >
            <button
              id="gender-btn-women"
              onClick={() => setGender('women')}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                gender === 'women'
                  ? 'bg-white text-[#8D2434] shadow-xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              Women
            </button>
            <button
              id="gender-btn-men"
              onClick={() => setGender('men')}
              className={`px-2.5 sm:px-3 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                gender === 'men'
                  ? 'bg-[#2D2825] text-white shadow-xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              Men
            </button>
          </div>

          {/* 3. CENTER NAVIGATION (Desktop full layout only when frame is OFF) */}
          {!isMobileFrame && (
            <nav className="hidden lg:flex items-center space-x-1">
              {!showDocs && currentRole === 'customer' && (
                <>
                  <button
                    id="nav-btn-home"
                    onClick={() => setActiveTab('home')}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'home' 
                        ? 'bg-[#2D2825] text-[#FAF7F2] shadow-xs' 
                        : 'text-[#7D726A] hover:text-[#2D2825] hover:bg-white'
                    }`}
                  >
                    Explore
                  </button>
                  <button
                    id="nav-btn-studio"
                    onClick={() => setActiveTab('generator')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'generator' 
                        ? 'bg-[#2D2825] text-[#FAF7F2] shadow-xs' 
                        : 'text-[#7D726A] hover:text-[#2D2825] hover:bg-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#8D2434]" />
                    <span>AI Studio</span>
                  </button>
                  <button
                    id="nav-btn-marketplace"
                    onClick={() => setActiveTab('marketplace')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'marketplace' 
                        ? 'bg-[#2D2825] text-[#FAF7F2] shadow-xs' 
                        : 'text-[#7D726A] hover:text-[#2D2825] hover:bg-white'
                    }`}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 text-[#8D2434]" />
                    <span>Marketplace</span>
                  </button>
                  <button
                    id="nav-btn-tailors"
                    onClick={() => setActiveTab('tailors')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'tailors' 
                        ? 'bg-[#2D2825] text-[#FAF7F2] shadow-xs' 
                        : 'text-[#7D726A] hover:text-[#2D2825] hover:bg-white'
                    }`}
                  >
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Master Tailors</span>
                  </button>
                  <button
                    id="nav-btn-orders"
                    onClick={() => setActiveTab('orders')}
                    className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                      activeTab === 'orders' 
                        ? 'bg-[#2D2825] text-[#FAF7F2] shadow-xs' 
                        : 'text-[#7D726A] hover:text-[#2D2825] hover:bg-white'
                    }`}
                  >
                    <span>Orders</span>
                    {activeOrdersCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-[#8D2434] text-white text-[10px] flex items-center justify-center font-bold">
                        {activeOrdersCount}
                      </span>
                    )}
                  </button>
                </>
              )}

              {!showDocs && currentRole === 'tailor' && (
                <div className="flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-[#ECE6DE] shadow-xs">
                  <Scissors className="w-4 h-4 text-[#8D2434]" />
                  <span className="text-xs font-bold text-[#2D2825]">Master Tailor Workspace</span>
                </div>
              )}
            </nav>
          )}

          {/* 4. RIGHT ACTION ICONS: Clean touch targets (Search, Bell, Profile) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Search Icon Button */}
            <button
              id="nav-search-btn"
              onClick={openSearch}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#ECE6DE] text-[#2D2825] hover:text-[#8D2434] hover:bg-[#F7F4EE] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              title="Search"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {/* Notification Bell Button */}
            <button
              id="nav-notifications-btn"
              onClick={openNotifications}
              className="relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white border border-[#ECE6DE] text-[#2D2825] hover:text-[#8D2434] hover:bg-[#F7F4EE] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 rounded-full bg-[#8D2434] ring-2 ring-white" />
              )}
            </button>

            {/* Offline Sync Badge - Desktop only */}
            {!isMobileFrame && (
              <div className="hidden lg:inline-block">
                <OfflineSyncBadge />
              </div>
            )}

            {/* Documentation Portal Toggle - Desktop only */}
            {!isMobileFrame && (
              <button
                id="btn-toggle-docs"
                onClick={() => setShowDocs(!showDocs)}
                className={`hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                  showDocs 
                    ? 'bg-[#2D2825] text-white border-[#2D2825] shadow-xs' 
                    : 'bg-white text-[#2D2825] border-[#ECE6DE] hover:bg-[#F7F4EE]'
                }`}
                title="View Architecture & Docs"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Docs</span>
              </button>
            )}

            {/* Mobile Simulation Frame Toggle - Only shown on tablets/desktop where viewport allows switching */}
            <button
              id="btn-toggle-frame"
              onClick={() => setIsMobileFrame(!isMobileFrame)}
              className={`hidden sm:flex w-8 h-8 sm:w-9 sm:h-9 rounded-full border transition-all cursor-pointer items-center justify-center ${
                isMobileFrame 
                  ? 'bg-[#2D2825] text-white border-[#2D2825]' 
                  : 'bg-white text-[#2D2825] border-[#ECE6DE] hover:bg-[#F7F4EE]'
              }`}
              title={isMobileFrame ? "Switch to Full Desktop View" : "Switch to Mobile Phone Preview"}
            >
              {isMobileFrame ? <Monitor className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Role Switcher Pill - Desktop only */}
            {!isMobileFrame && (
              <div className="hidden lg:flex items-center bg-white p-0.5 rounded-full border border-[#ECE6DE] shadow-2xs">
                <button
                  id="role-customer-btn"
                  onClick={() => { setCurrentRole('customer'); setShowDocs(false); }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    currentRole === 'customer' && !showDocs
                      ? 'bg-[#2D2825] text-[#FAF7F2] shadow-xs'
                      : 'text-[#7D726A] hover:text-[#2D2825]'
                  }`}
                >
                  Customer
                </button>
                <button
                  id="role-tailor-btn"
                  onClick={() => { setCurrentRole('tailor'); setShowDocs(false); }}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all cursor-pointer ${
                    currentRole === 'tailor' && !showDocs
                      ? 'bg-[#2D2825] text-[#FAF7F2] shadow-xs font-bold'
                      : 'text-[#7D726A] hover:text-[#2D2825]'
                  }`}
                >
                  Tailor
                </button>
              </div>
            )}

            {/* User Profile Avatar / Sign In */}
            {currentUser ? (
              <button
                id="nav-user-profile-btn"
                onClick={onOpenProfile}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border border-[#E4D9D1] hover:border-[#8D2434] transition-all cursor-pointer overflow-hidden shadow-2xs shrink-0 flex items-center justify-center bg-white p-0.5"
                title={`${currentUser.name} - Open Profile`}
              >
                <img 
                  src={currentUser.avatar} 
                  alt={currentUser.name} 
                  referrerPolicy="no-referrer"
                  className="w-full h-full rounded-full object-cover"
                />
              </button>
            ) : (
              <button
                id="nav-login-btn"
                onClick={onOpenAuth}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] shadow-sm transition-all cursor-pointer shrink-0"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>
        </div>
      </div>
    </header>
  );
};
