import React from 'react';
import { Home, Sparkles, ShoppingBag, Package, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeOrdersCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  activeOrdersCount,
}) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'generator', label: 'AI', icon: Sparkles },
    { id: 'marketplace', label: 'Marketplace', icon: ShoppingBag },
    { id: 'orders', label: 'Orders', icon: Package, badge: activeOrdersCount },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  return (
    <div 
      id="mobile-bottom-nav" 
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#ECE6DE] pt-2 pb-2 safe-area-pb shadow-lg"
    >
      <div className="flex items-center justify-around max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`mobile-nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className="flex flex-col items-center justify-center flex-1 py-1 relative transition-colors cursor-pointer group"
            >
              <div className="relative flex items-center justify-center">
                <Icon 
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-[#2D2825] stroke-[2.2]' : 'text-[#8E847D] stroke-[1.6] group-hover:text-[#2D2825]'
                  }`} 
                />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-[#8D2434] text-white text-[9px] font-bold flex items-center justify-center border border-white">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-1 transition-colors ${
                isActive ? 'font-bold text-[#2D2825]' : 'font-medium text-[#8E847D]'
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
      <div className="w-28 h-1 bg-[#2D2825]/30 rounded-full mx-auto mt-2" />
    </div>
  );
};
