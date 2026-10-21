import React from 'react';
import { Home, Sparkles, ShoppingBag, Package, User, Scissors } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeOrdersCount: number;
  isMobileFrame?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  activeOrdersCount,
  isMobileFrame = false,
}) => {
  const navItems = [
    { id: 'home', label: 'Explore', icon: Home },
    { id: 'generator', label: 'AI Studio', icon: Sparkles },
    { id: 'marketplace', label: 'Market', icon: ShoppingBag },
    { id: 'tailors', label: 'Tailors', icon: Scissors },
    { id: 'orders', label: 'Orders', icon: Package, badge: activeOrdersCount },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <nav 
      id="mobile-bottom-nav" 
      aria-label="Mobile Navigation"
      className={`${
        isMobileFrame 
          ? 'sticky sm:sticky bottom-0 left-0 right-0 w-full' 
          : 'fixed bottom-0 left-0 right-0'
      } z-40 bg-[#FAF7F2]/95 backdrop-blur-xl border-t border-[#ECE6DE] pt-2 pb-1.5 shadow-lg select-none`}
    >
      <div className="flex items-center justify-around w-full max-w-md mx-auto px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 relative transition-all cursor-pointer group active:scale-95"
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  className={`w-4.5 h-4.5 sm:w-5 sm:h-5 transition-colors ${
                    isActive ? 'text-[#8D2434] stroke-[2.3]' : 'text-[#7D726A] stroke-[1.7] group-hover:text-[#2D2825]'
                  }`} 
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-3.5 h-3.5 rounded-full bg-[#8D2434] text-white text-[8px] font-bold flex items-center justify-center border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[9px] sm:text-[10px] tracking-tight mt-0.5 transition-colors whitespace-nowrap ${
                isActive ? 'font-bold text-[#8D2434]' : 'font-medium text-[#7D726A]'
              }`}>
                {item.label}
              </span>
              {isActive && (
                <div className="w-1 h-1 rounded-full bg-[#8D2434] mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
      <div className="w-24 h-1 bg-[#2D2825]/20 rounded-full mx-auto mt-1 sm:hidden" />
    </nav>
  );
};
