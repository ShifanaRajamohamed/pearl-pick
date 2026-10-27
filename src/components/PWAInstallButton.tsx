import React, { useState } from 'react';
import { Download, Smartphone, X, CheckCircle2, Share, ExternalLink, MoreVertical, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'button' | 'banner' | 'pill' | 'link';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInIframe, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [isBannerDismissed, setIsBannerDismissed] = useState(false);

  // If already running as an installed standalone PWA, hide completely
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const outcome = await install();
      if (!outcome) {
        if (isAndroid || (!isIOS && !isInstallable)) {
          setShowAndroidGuide(true);
        }
      }
    } else if (isIOS) {
      setShowIOSGuide(true);
    } else {
      // Android Chrome or desktop when beforeinstallprompt has not fired yet or running in iframe
      setShowAndroidGuide(true);
    }
  };

  const [copiedLink, setCopiedLink] = useState(false);

  const copyPWALink = async () => {
    try {
      const url = window.location.origin;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  // Shared Modals Component
  const renderModals = () => (
    <>
      {/* Android & Desktop Guide Modal */}
      {showAndroidGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 border border-[#ECE6DE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#2D2825] text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
                  P
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#2D2825] leading-tight">
                    {isAndroid ? 'Install on Android' : 'Install Pearl Pick App (PWA)'}
                  </h3>
                  <p className="text-[11px] text-[#7D726A]">Bespoke Atelier Home Screen Web App</p>
                </div>
              </div>
              <button
                onClick={() => setShowAndroidGuide(false)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#7D726A] flex items-center justify-center hover:bg-[#ECE6DE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#7D726A] space-y-2.5 font-light leading-relaxed">
              {isAndroid ? (
                <>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                    <MoreVertical className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                    <span>
                      1. In Chrome, tap the <strong className="text-[#2D2825] font-semibold">three vertical dots (⋮)</strong> menu in the top-right corner.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                    <Download className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                    <span>
                      2. Select <strong className="text-[#2D2825] font-semibold">Install app</strong> or <strong className="text-[#2D2825] font-semibold">Add to Home screen</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                    <CheckCircle2 className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                    <span>
                      3. Tap <strong className="text-[#2D2825] font-semibold">Install</strong>. Pearl Pick will be added to your app drawer for instant offline access!
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                    <Download className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                    <span>
                      1. In Chrome or Edge, click the <strong className="text-[#2D2825] font-semibold">Install icon (⊕)</strong> on the right side of the URL address bar.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                    <MoreVertical className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                    <span>
                      2. Or click the browser menu <strong className="text-[#2D2825] font-semibold">(⋮) &gt; &apos;Save and share&apos; &gt; &apos;Install Pearl Pick&apos;</strong>.
                    </span>
                  </div>
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                    <CheckCircle2 className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                    <span>
                      3. Pearl Pick opens in its own clean window like a native desktop app!
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Quick Share / Copy PWA Link Button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={copyPWALink}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] hover:bg-[#F3EFE9] text-xs font-semibold text-[#2D2825] transition-all cursor-pointer"
              >
                {copiedLink ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">PWA Link Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <Share className="w-3.5 h-3.5 text-[#8D2434]" />
                    <span>Copy PWA Link ({typeof window !== 'undefined' ? window.location.origin : 'App URL'})</span>
                  </>
                )}
              </button>
            </div>

            {isInIframe && (
              <a
                href={typeof window !== 'undefined' ? window.location.href : '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-full bg-[#FAF7F2] text-[#2D2825] border border-[#ECE6DE] text-xs font-semibold hover:bg-[#ECE6DE] transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open in Full Browser Tab</span>
              </a>
            )}

            <button
              onClick={() => setShowAndroidGuide(false)}
              className="w-full py-2.5 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}

      {/* iOS Safari Guide Modal */}
      {showIOSGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[24px] max-w-sm w-full p-6 border border-[#ECE6DE] shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-[#2D2825] text-white flex items-center justify-center font-serif text-sm font-bold shadow-xs">
                  P
                </div>
                <div>
                  <h3 className="font-serif text-base font-bold text-[#2D2825] leading-tight">
                    Install Pearl Pick on iOS
                  </h3>
                  <p className="text-[11px] text-[#7D726A]">Apple Safari Web App</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#7D726A] flex items-center justify-center hover:bg-[#ECE6DE] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[#7D726A] space-y-2.5 font-light leading-relaxed">
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <Share className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                <span>
                  1. Tap the <strong className="text-[#2D2825] font-semibold">Share</strong> button in the Safari bottom toolbar.
                </span>
              </div>
              <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
                <Download className="w-4 h-4 text-[#8D2434] shrink-0 mt-0.5" />
                <span>
                  2. Scroll down and select <strong className="text-[#2D2825] font-semibold">Add to Home Screen</strong>.
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
              type="button"
              onClick={copyPWALink}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] hover:bg-[#F3EFE9] text-xs font-semibold text-[#2D2825] transition-all cursor-pointer"
            >
              {copiedLink ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700 font-bold">PWA Link Copied!</span>
                </>
              ) : (
                <>
                  <Share className="w-3.5 h-3.5 text-[#8D2434]" />
                  <span>Copy PWA Link</span>
                </>
              )}
            </button>

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

  // Variant: Pill button for headers / menus
  if (variant === 'pill') {
    return (
      <>
        <button
          id="btn-pwa-install-pill"
          onClick={handleInstallClick}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#2D2825] text-[#FAF7F2] hover:bg-[#1A1816] transition-all cursor-pointer shadow-2xs ${className}`}
          title="Install Pearl Pick App on Android or iOS"
        >
          <Download className="w-3.5 h-3.5 text-[#E8C5CC]" />
          <span>Install App</span>
        </button>
        {renderModals()}
      </>
    );
  }

  // Variant: Floating / Docked Mobile Banner
  if (variant === 'banner') {
    if (isBannerDismissed) return null;

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
              <div className="flex items-center gap-1.5">
                <span className="font-serif text-sm font-bold text-[#2D2825] block truncate">
                  Install Pearl Pick
                </span>
                <span className="px-1.5 py-0.2 rounded-sm bg-[#416035]/15 text-[#416035] text-[9px] font-bold">
                  PWA
                </span>
              </div>
              <span className="text-[11px] text-[#7D726A] block truncate font-light">
                Add to your Android or iOS home screen
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1"
            >
              <Download className="w-3 h-3 text-[#E8C5CC]" />
              <span>Install</span>
            </button>
            <button
              onClick={() => setIsBannerDismissed(true)}
              className="p-1 text-[#8E847D] hover:text-[#2D2825] rounded-full cursor-pointer"
              title="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        {renderModals()}
      </>
    );
  }

  // Variant: Simple text link (for footer / navigation lists)
  if (variant === 'link') {
    return (
      <>
        <button
          id="btn-pwa-install-link"
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 text-xs text-[#6E6359] hover:text-[#8D2434] transition-colors cursor-pointer ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-[#8D2434]" />
          <span>Install Web App (PWA)</span>
        </button>
        {renderModals()}
      </>
    );
  }

  // Default button variant
  return (
    <>
      <button
        id="btn-pwa-install"
        onClick={handleInstallClick}
        className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-full bg-[#2D2825] text-white text-xs font-semibold hover:bg-[#1A1816] transition-all cursor-pointer shadow-xs ${className}`}
      >
        <Smartphone className="w-4 h-4 text-[#E8C5CC]" />
        <span>Install App on Device</span>
      </button>
      {renderModals()}
    </>
  );
};
