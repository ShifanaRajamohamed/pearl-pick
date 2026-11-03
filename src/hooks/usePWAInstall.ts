import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [isInIframe, setIsInIframe] = useState(false);
  const [isInAppBrowser, setIsInAppBrowser] = useState(false);

  useEffect(() => {
    // Detect standalone mode (already installed & running without browser chrome)
    const isStandalone =
      typeof window !== 'undefined' &&
      (window.matchMedia('(display-mode: standalone)').matches ||
        window.matchMedia('(display-mode: fullscreen)').matches ||
        window.matchMedia('(display-mode: minimal-ui)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true ||
        window.location.search.includes('source=pwa'));
    setIsInstalled(Boolean(isStandalone));

    // Detect device & environment
    if (typeof window !== 'undefined') {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const iosDetected = /iphone|ipad|ipod/.test(userAgent);
      const androidDetected = /android/i.test(userAgent);
      setIsIOS(iosDetected);
      setIsAndroid(androidDetected);

      // Check for in-app webviews (WhatsApp, Instagram, Facebook, Gmail, Slack, Telegram, etc.)
      const inApp =
        /instagram|fbav|fban|line|gsa|wv|micromessenger|tiktok|twitter|threads|snapchat|pinterest|linkedin/i.test(
          userAgent
        ) ||
        (androidDetected && !/chrome\/[0-9]+/i.test(userAgent)) ||
        (iosDetected && !/safari/i.test(userAgent));
      setIsInAppBrowser(Boolean(inApp));

      try {
        setIsInIframe(window.self !== window.top);
      } catch {
        setIsInIframe(true);
      }
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser default mini-infobar
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
        return true;
      }
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
    return false;
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    isAndroid,
    isInIframe,
    isInAppBrowser,
    install,
  };
}
