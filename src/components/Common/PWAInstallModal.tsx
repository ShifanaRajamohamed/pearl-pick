import React, { useState, useEffect } from 'react';
import {
  X,
  Smartphone,
  Copy,
  Check,
  Share2,
  ExternalLink,
  QrCode,
  Download,
  Sparkles,
  AlertTriangle,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import QRCode from 'qrcode';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Canonical preview deployment URL
const CANONICAL_PWA_URL = 'https://ais-pre-4m7piucn6w2akl7ztxsjh5-462348171336.asia-southeast1.run.app';

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, isInIframe, isInAppBrowser, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'qr' | 'troubleshoot'>('android');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [installSuccess, setInstallSuccess] = useState<boolean>(false);

  // Determine current active mobile URL
  const pwaUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('run.app') ? window.location.origin : CANONICAL_PWA_URL)
    : CANONICAL_PWA_URL;

  // Auto-detect tab based on user agent if on mobile
  useEffect(() => {
    if (isIOS) setActiveTab('ios');
    else if (isAndroid) setActiveTab('android');
    else setActiveTab('qr');
  }, [isIOS, isAndroid, isOpen]);

  // Generate QR code for mobile scanning
  useEffect(() => {
    if (!isOpen) return;
    QRCode.toDataURL(pwaUrl, {
      width: 240,
      margin: 1.5,
      color: {
        dark: '#2D2825',
        light: '#FFFFFF'
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => setQrCodeDataUrl(url))
      .catch((err) => console.error('Failed to generate QR code', err));
  }, [pwaUrl, isOpen]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(pwaUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PEARL PICK — Bespoke Couture & Tailor Marketplace',
          text: 'Install PEARL PICK on your phone for custom AI dress designing, 14-point body fit, and verified designer couture.',
          url: pwaUrl
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDirectInstall = async () => {
    const outcome = await install();
    if (outcome) {
      setInstallSuccess(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full border border-[#ECE6DE] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#2D2825] to-[#403630] text-white p-5 sm:p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF7F2] text-[#2D2825] flex items-center justify-center font-serif text-xl font-bold shadow-md shrink-0 border border-[#D4AF37]/40">
              P
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                  Install as Real App
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#8D2434] text-[#FAF7F2] text-[10px] font-bold uppercase tracking-wider">
                  Standalone
                </span>
              </div>
              <p className="text-xs text-[#E4D9D1] mt-0.5 truncate">
                Full-screen app with icon, no browser URL bar
              </p>
            </div>
          </div>

          {/* Quick Features Strip */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-white/15 text-[11px] text-[#FAF7F2]/90">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>Full Screen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#8D2434] bg-white rounded-full p-0.5 shrink-0" />
              <span>App Icon</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Offline Cache</span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
          {/* In-App Browser Warning Alert */}
          {isInAppBrowser && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>In-App Browser Detected (WhatsApp / Gmail)</span>
              </div>
              <p className="text-[11px] text-amber-800/90 leading-relaxed">
                You opened this link inside an in-app viewer. In-app viewers can only create web links.
                To install as a real app:
              </p>
              <div className="p-2 rounded-xl bg-white border border-amber-200/80 font-medium text-[11px] text-amber-900 flex items-center gap-2">
                <span className="font-bold">1. Tap ⋮ (top right)</span>
                <ArrowRight className="w-3 h-3 text-amber-600" />
                <span className="font-bold">2. Tap &quot;Open in Chrome&quot; or &quot;Open in Safari&quot;</span>
              </div>
            </div>
          )}

          {/* 1-Click Direct Install Button (If Chrome/Edge triggers beforeinstallprompt) */}
          {isInstallable && (
            <button
              onClick={handleDirectInstall}
              className="w-full py-3.5 px-4 rounded-2xl bg-[#8D2434] hover:bg-[#721C29] text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer animate-pulse"
            >
              <Download className="w-4 h-4" />
              <span>⚡ Tap Here to Install App on This Phone</span>
            </button>
          )}

          {installSuccess && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>PEARL PICK installed successfully! Look in your App Drawer / Home Screen.</span>
            </div>
          )}

          {/* Direct Mobile PWA Link Bar */}
          <div className="bg-[#FAF7F2] rounded-2xl p-3.5 border border-[#ECE6DE] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#2D2825] flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#8D2434]" />
                Direct Mobile App Link:
              </span>
              <span className="text-[10px] text-[#7D726A] font-medium">Open in Chrome or Safari</span>
            </div>

            <div className="flex items-center gap-2 bg-white rounded-xl p-2 border border-[#E0D8CE]">
              <input
                type="text"
                readOnly
                value={pwaUrl}
                className="bg-transparent text-xs text-[#2D2825] font-mono select-all flex-1 outline-hidden truncate px-1"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-semibold transition-all shrink-0 flex items-center gap-1 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
              {typeof navigator !== 'undefined' && 'share' in navigator && (
                <button
                  type="button"
                  onClick={handleNativeShare}
                  className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#D5C7B8] hover:bg-[#F3EFE9] text-xs font-semibold text-[#2D2825] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5 text-[#8D2434]" />
                  <span>Share to Phone</span>
                </button>
              )}

              <a
                href={pwaUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2 px-3 rounded-xl bg-white border border-[#D5C7B8] hover:bg-[#F3EFE9] text-xs font-semibold text-[#2D2825] flex items-center justify-center gap-1.5 transition-colors text-center"
              >
                <ExternalLink className="w-3.5 h-3.5 text-[#7D726A]" />
                <span>Open in Tab</span>
              </a>
            </div>
          </div>

          {/* Interactive Mode Tabs */}
          <div className="flex items-center p-1 bg-[#F5F1EB] rounded-xl border border-[#ECE6DE] text-xs font-bold">
            <button
              onClick={() => setActiveTab('android')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-white text-[#2D2825] shadow-xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              <span>Android</span>
            </button>
            <button
              onClick={() => setActiveTab('ios')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-white text-[#2D2825] shadow-xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              <span>iPhone (iOS)</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'qr'
                  ? 'bg-white text-[#2D2825] shadow-xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              <QrCode className="w-3.5 h-3.5 text-[#8D2434]" />
              <span>QR Code</span>
            </button>
            <button
              onClick={() => setActiveTab('troubleshoot')}
              className={`flex-1 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer ${
                activeTab === 'troubleshoot'
                  ? 'bg-white text-[#8D2434] shadow-xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Fix Link Issue</span>
            </button>
          </div>

          {/* Tab 1: Android Instructions (Crucial step-by-step to avoid shortcut link) */}
          {activeTab === 'android' && (
            <div className="space-y-2.5 text-xs text-[#6E6359]">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#2D2825] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-bold text-[#2D2825]">Open specifically in Google Chrome</p>
                  <p className="text-[11px] text-[#7D726A] mt-0.5">
                    Do not use the in-app WhatsApp or Instagram browser. Paste the link into the standalone Google Chrome app.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#2D2825] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-bold text-[#2D2825]">Tap the 3 dots (⋮) in Chrome&apos;s top-right</p>
                  <p className="text-[11px] text-[#7D726A] mt-0.5">
                    Look for the option named <strong className="text-[#8D2434]">&quot;Install app&quot;</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#8D2434] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-bold text-[#2D2825]">Select &quot;Install app&quot; (NOT &quot;Add shortcut&quot;)</p>
                  <p className="text-[11px] text-[#7D726A] mt-0.5 leading-relaxed">
                    Tap <strong className="text-[#2D2825]">&quot;Install&quot;</strong> in the confirmation popup. Android will create an authentic standalone application in your app drawer without the URL bar!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: iPhone iOS Instructions */}
          {activeTab === 'ios' && (
            <div className="space-y-2.5 text-xs text-[#6E6359]">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#2D2825] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <p className="font-bold text-[#2D2825]">Open specifically in Apple Safari</p>
                  <p className="text-[11px] text-[#7D726A] mt-0.5">
                    Apple iOS only supports full standalone installation inside Safari (not Chrome for iOS).
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#2D2825] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <p className="font-bold text-[#2D2825]">Tap the Share Icon</p>
                  <p className="text-[11px] text-[#7D726A] mt-0.5">
                    Tap the square icon with an arrow pointing up at the bottom toolbar.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-[#8D2434] text-white flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <p className="font-bold text-[#2D2825]">Select &quot;Add to Home Screen&quot;</p>
                  <p className="text-[11px] text-[#7D726A] mt-0.5">
                    Scroll down and tap <strong>&quot;Add to Home Screen&quot; (+)</strong>, then tap <strong>&quot;Add&quot;</strong> in the top-right. It will open as a full-screen app with no Safari address bar!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: QR Code */}
          {activeTab === 'qr' && (
            <div className="text-center space-y-3 py-1">
              <p className="text-xs text-[#7D726A]">
                Point your phone camera at this QR code to open directly in your phone browser:
              </p>
              <div className="inline-block p-3 bg-white rounded-2xl border-2 border-[#8D2434]/20 shadow-md">
                {qrCodeDataUrl ? (
                  <img
                    src={qrCodeDataUrl}
                    alt="Scan PWA QR Code"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain rounded-lg"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-50 text-xs text-gray-400">
                    Generating QR...
                  </div>
                )}
              </div>
              <p className="text-[11px] text-[#7D726A] font-light">
                Opens directly in Safari or Chrome without needing to type the address
              </p>
            </div>
          )}

          {/* Tab 4: Troubleshooting Link vs App */}
          {activeTab === 'troubleshoot' && (
            <div className="space-y-2.5 text-xs text-[#6E6359]">
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] space-y-1">
                <p className="font-bold text-[#2D2825]">Why did it save as a link / shortcut?</p>
                <p className="text-[11px] text-[#7D726A] leading-relaxed">
                  1. <strong>In-App Browser</strong>: If the link was opened inside WhatsApp, Instagram, or Gmail, the system blocks app installation and only creates a bookmark. You must tap <span className="font-semibold text-[#8D2434]">⋮ &gt; Open in Chrome</span> first.
                </p>
                <p className="text-[11px] text-[#7D726A] leading-relaxed">
                  2. <strong>Chrome &quot;Add shortcut&quot; vs &quot;Install app&quot;</strong>: On Android, choose <strong>&quot;Install app&quot;</strong> instead of &quot;Add shortcut&quot;. &quot;Install app&quot; builds the real standalone application package.
                </p>
                <p className="text-[11px] text-[#7D726A] leading-relaxed">
                  3. <strong>Apple iPhone</strong>: Only <strong>Apple Safari</strong> can create standalone web apps on iOS. Chrome on iOS will only create a browser bookmark.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1">
                <p className="font-bold">How to verify it is running as an app:</p>
                <p className="text-[11px] text-emerald-800 leading-relaxed">
                  Once installed, launch PEARL PICK from your phone&apos;s home screen. The browser URL bar and back/forward buttons will disappear, giving you the full immersive mobile app experience.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#FAF7F2] border-t border-[#ECE6DE] flex items-center justify-between gap-3">
          <div className="text-[11px] text-[#7D726A]">
            Standalone PWA • Manifest &amp; Offline Cache
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#2D2825] text-white text-xs font-bold hover:bg-[#1A1816] transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
