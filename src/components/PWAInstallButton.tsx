import React, { useState } from 'react';
import { Smartphone, Download, Share, QrCode } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallModal } from './Common/PWAInstallModal';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'pill' | 'link' | 'navbar';
  className?: string;
  showIconOnlyOnMobile?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
  showIconOnlyOnMobile = false,
}) => {
  const { isInstalled } = usePWAInstall();
  const [modalOpen, setModalOpen] = useState<boolean>(false);

  // If already running as an installed standalone PWA, hide completely
  if (isInstalled) {
    return null;
  }

  // Variant: Top Navigation Bar Button (high aesthetic, non-intrusive)
  if (variant === 'navbar') {
    return (
      <>
        <button
          type="button"
          id="nav-pwa-install-btn"
          onClick={() => setModalOpen(true)}
          className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#FAF7F2] hover:bg-[#F0EAE1] text-[#2D2825] border border-[#D5C7B8] shadow-2xs transition-all cursor-pointer ${className}`}
          title="Install PEARL PICK on your phone or get the mobile PWA link"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#8D2434] transition-transform group-hover:scale-110" />
          <span className={showIconOnlyOnMobile ? 'hidden sm:inline' : ''}>
            Install App
          </span>
          <span className="hidden md:inline px-1 py-0.2 rounded text-[9px] font-bold bg-[#8D2434]/10 text-[#8D2434]">
            PWA
          </span>
        </button>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  // Variant: Pill button for menus
  if (variant === 'pill') {
    return (
      <>
        <button
          type="button"
          id="btn-pwa-install-pill"
          onClick={() => setModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2D2825] text-[#FAF7F2] hover:bg-[#1A1816] transition-all cursor-pointer shadow-2xs ${className}`}
          title="Install Pearl Pick App on Android or iOS"
        >
          <Download className="w-3.5 h-3.5 text-[#E8C5CC]" />
          <span>Install App</span>
        </button>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  // Variant: Floating / Mobile Banner
  if (variant === 'banner') {
    return (
      <>
        <div
          id="pwa-install-banner"
          className={`bg-white/95 backdrop-blur-md border border-[#ECE6DE] rounded-2xl p-3 shadow-md flex items-center justify-between gap-3 ${className}`}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-[#2D2825] text-white flex items-center justify-center font-serif text-sm font-bold shrink-0 shadow-2xs">
              P
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-xs font-bold text-[#2D2825] block truncate">
                  Pearl Pick Mobile App
                </span>
                <span className="px-1 py-0.2 rounded-sm bg-[#8D2434]/15 text-[#8D2434] text-[8px] font-bold">
                  PWA
                </span>
              </div>
              <span className="text-[10px] text-[#7D726A] block truncate font-light">
                Install on phone for full screen experience
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 rounded-full bg-[#8D2434] text-white text-[11px] font-bold hover:bg-[#721C29] transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1 shadow-xs"
            >
              <Smartphone className="w-3 h-3" />
              <span>Get Link</span>
            </button>
          </div>
        </div>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  // Variant: Simple text link (for footer / navigation lists)
  if (variant === 'link') {
    return (
      <>
        <button
          type="button"
          id="btn-pwa-install-link"
          onClick={() => setModalOpen(true)}
          className={`inline-flex items-center gap-1.5 text-xs text-[#6E6359] hover:text-[#8D2434] transition-colors cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#8D2434]" />
          <span>Install on Mobile Phone (PWA Link & QR)</span>
        </button>
        <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
      </>
    );
  }

  // Default button variant
  return (
    <>
      <button
        type="button"
        id="btn-pwa-install"
        onClick={() => setModalOpen(true)}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] transition-all cursor-pointer shadow-xs ${className}`}
      >
        <Smartphone className="w-4 h-4 text-[#E8C5CC]" />
        <span>Install App on Mobile Phone</span>
      </button>
      <PWAInstallModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
};
