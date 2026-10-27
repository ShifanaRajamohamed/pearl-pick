import React, { useEffect } from 'react';
import { ShoppingBag, Heart, CheckCircle2, X, ArrowRight, Tag } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'cart' | 'wishlist' | 'coupon' | 'info';
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface ShoppingToastProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const ShoppingToast: React.FC<ShoppingToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'cart':
        return <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />;
      case 'wishlist':
        return <Heart className="w-4 h-4 text-[#8D2434] fill-[#8D2434]" />;
      case 'coupon':
        return <Tag className="w-4 h-4 text-emerald-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#8D2434]" />;
    }
  };

  return (
    <div
      id="shopping-toast"
      className="fixed bottom-20 sm:bottom-8 left-4 sm:left-8 z-50 max-w-sm sm:max-w-md bg-white border border-[#ECE6DE] rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3.5 animate-in slide-in-from-bottom-5 duration-200"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-[#FAF7F2] border border-[#E4D9D1] flex items-center justify-center shrink-0 shadow-2xs">
          {getIcon()}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-[#2D2825] truncate">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-[11px] text-[#7D726A] truncate">
              {toast.message}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {toast.actionLabel && toast.onAction && (
          <button
            type="button"
            onClick={() => {
              toast.onAction?.();
              onClose();
            }}
            className="px-3 py-1.5 rounded-xl bg-[#2D2825] hover:bg-[#1A1816] text-[#FAF7F2] text-[11px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors cursor-pointer"
          >
            <span>{toast.actionLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-[#8E847D] hover:text-[#2D2825] rounded-full cursor-pointer"
          title="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
