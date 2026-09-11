import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'pill';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // If already running as an installed PWA, hide completely
  if (isInstalled) {
    return null;
  }

  // Variant: Pill button for headers / menus
  if (variant === 'pill') {
    if (!isInstallable && !isIOS) return null;

    return (
      <>
        <button
          id="btn-pwa-install-pill"
          onClick={() => (isIOS ? setShowIOSGuide(true) : install())}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2D2825] text-[#FAF7F2] hover:bg-[#1A1816] transition-all cursor-pointer shadow-2xs ${className}`}
          title="Install Pearl Pick App on your device"
        >
          <Download className="w-3.5 h-3.5 text-[#E8C5CC]" />
          <span>Install App</span>
        </button>

        {/* iOS Guide Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] max-w-sm w-full p-6 border border-[#ECE6DE] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2D2825] text-white flex items-center justify-center font-serif text-sm font-bold">
                    P
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#2D2825]">
                    Install Pearl Pick on iOS
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#7D726A] flex items-center justify-center hover:bg-[#ECE6DE]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-[#7D726A] space-y-3 font-light leading-relaxed">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                  <Share className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                  <span>
                    1. Tap the <strong className="text-[#2D2825]">Share</strong> button in the Safari bottom toolbar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                  <Download className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                  <span>
                    2. Scroll down and select <strong className="text-[#2D2825]">Add to Home Screen</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                  <CheckCircle2 className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                  <span>
                    3. Launch from your home screen for full standalone experience.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Variant: Floating / Docked Mobile Banner
  if (variant === 'banner') {
    if (isBannerDismissed) return null;
    if (!isInstallable && !isIOS) return null;

    return (
      <>
        <div 
          id="pwa-install-banner"
          className={`bg-white/95 backdrop-blur-md border border-[#ECE6DE] rounded-[18px] p-3.5 shadow-md flex items-center justify-between gap-3 ${className}`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#2D2825] text-white flex items-center justify-center font-serif text-base font-bold shrink-0 shadow-2xs">
              P
            </div>
            <div className="min-w-0">
              <span className="font-serif text-sm font-bold text-[#2D2825] block truncate">
                Install Pearl Pick
              </span>
              <span className="text-[11px] text-[#7D726A] block truncate font-light">
                Add to your home screen for instant offline access
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => (isIOS ? setShowIOSGuide(true) : install())}
              className="px-3 py-1.5 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] transition-colors cursor-pointer whitespace-nowrap"
            >
              Install
            </button>
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="p-1 text-[#8E847D] hover:text-[#2D2825] rounded-full"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* iOS Guide Modal */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-[24px] max-w-sm w-full p-6 border border-[#ECE6DE] shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2D2825] text-white flex items-center justify-center font-serif text-sm font-bold">
                    P
                  </div>
                  <h3 className="font-serif text-base font-bold text-[#2D2825]">
                    Install Pearl Pick on iOS
                  </h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#7D726A] flex items-center justify-center hover:bg-[#ECE6DE]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="text-xs text-[#7D726A] space-y-3 font-light leading-relaxed">
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                  <Share className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                  <span>
                    1. Tap the <strong className="text-[#2D2825]">Share</strong> button in the Safari bottom toolbar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                  <Download className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                  <span>
                    2. Scroll down and select <strong className="text-[#2D2825]">Add to Home Screen</strong>.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                  <CheckCircle2 className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                  <span>
                    3. Launch from your home screen for full standalone experience.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-full py-2.5 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Default button variant
  return (
    <>
      <button
        id="btn-pwa-install"
        onClick={() => (isIOS ? setShowIOSGuide(true) : install())}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] transition-all cursor-pointer shadow-xs ${className}`}
      >
        <Smartphone className="w-4 h-4 text-[#E8C5CC]" />
        <span>Install App on Device</span>
      </button>

      {/* iOS Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 border border-[#ECE6DE] shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#2D2825] text-white flex items-center justify-center font-serif text-sm font-bold">
                  P
                </div>
                <h3 className="font-serif text-base font-bold text-[#2D2825]">
                  Install Pearl Pick on iOS
                </h3>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#7D726A] flex items-center justify-center hover:bg-[#ECE6DE]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#7D726A] space-y-3 font-light leading-relaxed">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <Share className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                <span>
                  1. Tap the <strong className="text-[#2D2825]">Share</strong> button in the Safari bottom toolbar.
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <Download className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                <span>
                  2. Scroll down and select <strong className="text-[#2D2825]">Add to Home Screen</strong>.
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <CheckCircle2 className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                <span>
                  3. Launch from your home screen for full standalone experience.
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowIOSGuide(false)}
              className="w-full py-2.5 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
