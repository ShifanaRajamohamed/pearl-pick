/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { BellRing, X, CheckCircle2, Scissors, ShieldCheck, ArrowLeft, LogOut } from 'lucide-react';
import { Navbar, StorefrontCategory } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { SplashScreen } from './components/Customer/SplashScreen';
import { AIDressGenerator } from './components/Customer/AIDressGenerator';
import { GeneratedDesignViewer } from './components/Customer/GeneratedDesignViewer';
import { DesignGallery } from './components/Customer/DesignGallery';
import { TailorMarketplace } from './components/Customer/TailorMarketplace';
import { QuotationComparison } from './components/Customer/QuotationComparison';
import { OrderTrackingView } from './components/Customer/OrderTrackingView';
import { CustomerProfileView } from './components/Customer/CustomerProfile';
import { MeasurementSheetModal } from './components/Customer/MeasurementSheetModal';
import { StyleChatModal } from './components/Customer/StyleChatModal';
import { MarketplaceView } from './components/Customer/MarketplaceView';
import { SearchModal } from './components/Customer/SearchModal';
import { NotificationsModal } from './components/Customer/NotificationsModal';
import { TailorDashboard } from './components/Tailor/TailorDashboard';
import { DesignerApplicationWorkspace } from './components/Tailor/DesignerApplicationWorkspace';
import { TailorVerificationModal } from './components/Tailor/TailorVerificationModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { SpecSheetExportModal } from './components/SpecSheetExportModal';
import { AuthModal } from './components/Auth/AuthModal';
import { RequireRole, RequireVerifiedDesigner } from './components/Auth/RouteGuards';
import { UserProfileModal } from './components/Customer/UserProfileModal';
import { UPIPaymentModal } from './components/Customer/UPIPaymentModal';
import { FabricLibraryModal } from './components/Customer/FabricLibraryModal';
import { CartCheckoutModal } from './components/Customer/CartCheckoutModal';
import { ProductDetailModal } from './components/Customer/ProductDetailModal';
import { ShoppingToast, ToastData } from './components/Customer/ShoppingToast';
import { WishlistView } from './components/Customer/WishlistView';

import {
  DressDesign,
  DressDesignVariation,
  TailorProfile,
  QuotationRequest,
  TailorQuotation,
  Order,
  MeasurementSheet,
  CustomerProfile,
  ChatMessage,
  Review,
  TailorVerificationDocument,
  AnalyticsSummary,
  AuthUser,
  MarketplaceProduct,
  NotificationItem,
  DressType,
  MilestoneProgressPhoto,
  MilestoneRating,
  HighEndFabric,
  CartItem,
  DesignerOrderStatus,
  DisputeRecord,
  ApprovalAuditLog,
  NegotiationOffer
} from './types';
import { normalizeRole, sanitizeReturnUrl } from './types/rbac';

import {
  INITIAL_TAILORS,
  INITIAL_DRESS_DESIGNS,
  INITIAL_MEASUREMENTS,
  INITIAL_CUSTOMER_PROFILE,
  INITIAL_CHAT_MESSAGES,
  INITIAL_ANALYTICS,
  MARKETPLACE_PRODUCTS,
  INITIAL_NOTIFICATIONS
} from './data/mockData';
import { apiClient } from './services/apiClient';
import { pushNotificationService, DevicePushNotification } from './services/pushNotificationService';

type PortalMode = 'storefront' | 'designer' | 'admin';

function resolveRouteStateFromPath(pathname: string): {
  portal: PortalMode;
  tab?: string;
} {
  const path = pathname.toLowerCase();
  if (path.startsWith('/designer')) return { portal: 'designer' };
  if (path.startsWith('/admin')) return { portal: 'admin' };
  if (path === '/orders') return { portal: 'storefront', tab: 'orders' };
  if (path === '/quotes') return { portal: 'storefront', tab: 'quotes' };
  if (path === '/wardrobe') return { portal: 'storefront', tab: 'wardrobe' };
  if (path === '/profile') return { portal: 'storefront', tab: 'profile' };
  if (path === '/wishlist') return { portal: 'storefront', tab: 'wishlist' };
  if (path === '/marketplace') return { portal: 'storefront', tab: 'marketplace' };
  if (path === '/studio') return { portal: 'storefront', tab: 'generator' };
  return { portal: 'storefront' };
}

export default function App() {
  // Server-Validated Authentication & RBAC Session State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState<boolean>(true);
  const [portalMode, setPortalMode] = useState<PortalMode>(
    () => resolveRouteStateFromPath(window.location.pathname).portal
  );

  // Auth & Checkout Modals
  const [customerAuthModalOpen, setCustomerAuthModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [upiModalOpen, setUpiModalOpen] = useState<boolean>(false);
  const [cartModalOpen, setCartModalOpen] = useState<boolean>(false);
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState<{
    request: QuotationRequest;
    quote: TailorQuotation;
  } | null>(null);

  // Pending action or return URL queued when an unauthenticated visitor requests a protected customer page/action
  const pendingAuthActionRef = useRef<((user: AuthUser) => void) | null>(null);
  const pendingReturnTabRef = useRef<string | null>(null);

  // Storefront Navigation & Category State
  const [activeTab, setActiveTab] = useState<string>(
    () => resolveRouteStateFromPath(window.location.pathname).tab || 'home'
  );
  const [activeCategory, setActiveCategory] = useState<StorefrontCategory | undefined>(undefined);
  const [gender, setGender] = useState<'women' | 'men'>('women');

  // Public & Role-Specific Domain State (Backed by Server SQLite Authority)
  const [designs, setDesigns] = useState<DressDesign[]>(INITIAL_DRESS_DESIGNS);
  const [activeDesign, setActiveDesign] = useState<DressDesign | null>(null);
  const [tailors, setTailors] = useState<TailorProfile[]>(
    INITIAL_TAILORS.filter((t) => t.verificationStatus === 'VERIFIED')
  );
  const [ownDesignerProfile, setOwnDesignerProfile] = useState<TailorProfile | null>(null);
  const [selectedTailor, setSelectedTailor] = useState<TailorProfile | null>(null);
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [measurements, setMeasurements] = useState<MeasurementSheet>(INITIAL_MEASUREMENTS);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(INITIAL_CUSTOMER_PROFILE);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(INITIAL_ANALYTICS);
  const [adminUsers, setAdminUsers] = useState<AuthUser[]>([]);

  // Marketplace, Shopping Bag & Notifications State
  // Note: localStorage is strictly restricted to non-sensitive UI preferences (recent views) and guest cart items.
  const [products, setProducts] = useState<MarketplaceProduct[]>(
    MARKETPLACE_PRODUCTS.filter((p) => p.moderationStatus !== 'REMOVED' && p.moderationStatus !== 'FLAGGED')
  );
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const guestCart = localStorage.getItem('pearl_pick_guest_cart');
      return guestCart ? JSON.parse(guestCart) : [];
    } catch {
      return [];
    }
  });
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [selectedMarketplaceProduct, setSelectedMarketplaceProduct] =
    useState<MarketplaceProduct | null>(null);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('pearl_pick_recent_views');
      return stored
        ? JSON.parse(stored)
        : [MARKETPLACE_PRODUCTS[0]?.id, MARKETPLACE_PRODUCTS[1]?.id].filter(Boolean);
    } catch {
      return [MARKETPLACE_PRODUCTS[0]?.id, MARKETPLACE_PRODUCTS[1]?.id].filter(Boolean);
    }
  });

  // Save guest cart to localStorage only when unauthenticated
  useEffect(() => {
    if (!currentUser) {
      try {
        localStorage.setItem('pearl_pick_guest_cart', JSON.stringify(cartItems));
      } catch {}
    }
  }, [cartItems, currentUser]);

  const handleSelectProduct = (product: MarketplaceProduct | null) => {
    setSelectedMarketplaceProduct(product);
    if (product) {
      setRecentlyViewedIds((prev) => {
        const next = [product.id, ...prev.filter((id) => id !== product.id)].slice(0, 8);
        try {
          localStorage.setItem('pearl_pick_recent_views', JSON.stringify(next));
        } catch {}
        return next;
      });
    }
  };

  const recentlyViewedProducts = useMemo(() => {
    return recentlyViewedIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is MarketplaceProduct => Boolean(p));
  }, [recentlyViewedIds, products]);

  const [shoppingToast, setShoppingToast] = useState<ToastData | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState<boolean>(false);

  // Admin Governance State
  const [commissionRate, setCommissionRate] = useState<number>(8);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([]);
  const [auditLogs, setAuditLogs] = useState<ApprovalAuditLog[]>([]);

  // Generator prefill state
  const [generatorPrefill, setGeneratorPrefill] = useState<{
    prompt?: string;
    dressType?: DressType;
  }>({});

  // Modals State
  const [measurementsModalOpen, setMeasurementsModalOpen] = useState<boolean>(false);
  const [fabricLibraryOpen, setFabricLibraryOpen] = useState<boolean>(false);
  const [tailorVerificationModalOpen, setTailorVerificationModalOpen] = useState<boolean>(false);
  const [specSheetOpen, setSpecSheetOpen] = useState<boolean>(false);
  const [specSheetVariation, setSpecSheetVariation] = useState<DressDesignVariation | null>(null);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [activeChatRecipient, setActiveChatRecipient] = useState<{
    id: string;
    name: string;
    avatar?: string;
  }>({
    id: INITIAL_TAILORS[0].id,
    name: INITIAL_TAILORS[0].name,
    avatar: INITIAL_TAILORS[0].avatar
  });
  const [activePushBanner, setActivePushBanner] = useState<DevicePushNotification | null>(null);

  // Sync URL path changes (/designer/login, /designer/register, /admin/login, /orders, /)
  useEffect(() => {
    const handlePopState = () => {
      const resolved = resolveRouteStateFromPath(window.location.pathname);
      setPortalMode(resolved.portal);
      if (resolved.tab) {
        setActiveTab(resolved.tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPortal = useCallback((nextPortal: PortalMode, explicitPath?: string) => {
    setPortalMode(nextPortal);
    try {
      if (explicitPath) {
        window.history.pushState({}, '', sanitizeReturnUrl(explicitPath, nextPortal));
      } else if (nextPortal === 'designer') {
        window.history.pushState({}, '', '/designer/login');
      } else if (nextPortal === 'admin') {
        window.history.pushState({}, '', '/admin/login');
      } else {
        window.history.pushState({}, '', '/');
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Load Public Catalog (Approved Products & Verified Designers)
  const refreshPublicCatalog = useCallback(async () => {
    try {
      const catalog = await apiClient.getPublicCatalog();
      if (catalog.products) setProducts(catalog.products);
      if (catalog.designers) setTailors(catalog.designers);
    } catch {
      // Fallback to initial public catalog if offline
    }
  }, []);

  // Load Role-Specific Workspace Data from Server
  const hydrateRoleWorkspace = useCallback(async (user: AuthUser) => {
    const role = normalizeRole(user.role);
    if (role === 'CUSTOMER') {
      try {
        const data = await apiClient.getCustomerBootstrap();
        setCustomerProfile({
          ...INITIAL_CUSTOMER_PROFILE,
          id: data.profile.id,
          name: data.profile.name,
          email: data.profile.email,
          phone: data.profile.phone,
          avatar: data.profile.avatar,
          city: data.profile.city
        });
        if (data.measurements) setMeasurements(data.measurements);
        if (data.designs && data.designs.length > 0) setDesigns(data.designs);
        if (data.wishlistIds) setWishlistProductIds(data.wishlistIds);
        if (data.cartItems && data.cartItems.length > 0) {
          setCartItems(data.cartItems);
        }
        if (data.quotationRequests) setQuotationRequests(data.quotationRequests);
        if (data.orders) setOrders(data.orders);
        if (data.conversations) setChatMessages(data.conversations);
      } catch (err) {
        console.warn('Customer bootstrap error:', err);
      }
    } else if (role === 'DESIGNER') {
      try {
        const meData = await apiClient.getDesignerMe();
        setOwnDesignerProfile(meData.profile);

        if (
          meData.profile.verificationStatus === 'VERIFIED' &&
          meData.user.accountStatus === 'ACTIVE'
        ) {
          const ws = await apiClient.getVerifiedDesignerWorkspace();
          setOwnDesignerProfile(ws.profile);
          setProducts(ws.products);
          setQuotationRequests(ws.incomingRequests);
          setOrders(ws.activeOrders);
          setChatMessages(ws.conversations);
        } else {
          // Ensure unverified/revoked designers do not retain protected workspace data in state
          setQuotationRequests([]);
          setOrders([]);
        }
      } catch (err) {
        console.warn('Designer bootstrap error:', err);
      }
    } else if (role === 'ADMIN') {
      try {
        const adm = await apiClient.getAdminDashboard();
        setTailors(adm.tailors);
        setAdminUsers(adm.users);
        setProducts(adm.products);
        setOrders(adm.orders);
        setDisputes(adm.disputes);
        setAuditLogs(adm.auditLogs);
        setCommissionRate(adm.commissionRate);
      } catch (err) {
        console.warn('Admin bootstrap error:', err);
      }
    }
  }, []);

  // Initial Session Verification on Mount (Prevents flashing unauthorized views)
  useEffect(() => {
    let mounted = true;
    (async () => {
      setIsLoadingAuth(true);
      await refreshPublicCatalog();
      try {
        const me = await apiClient.getMe();
        if (!mounted) return;
        setCurrentUser(me.user);
        if (me.designerProfile) {
          setOwnDesignerProfile(me.designerProfile);
        }
        await hydrateRoleWorkspace(me.user);
      } catch {
        if (!mounted) return;
        setCurrentUser(null);
      } finally {
        if (mounted) {
          setIsLoadingAuth(false);
        }
      }
    })();
    return () => {
      mounted = false;
    };
  }, [hydrateRoleWorkspace, refreshPublicCatalog]);

  // Protected action wrapper for Customer shopping & studio flows
  const requireCustomerAuth = (action: (user: AuthUser) => void, returnTab?: string) => {
    if (currentUser && normalizeRole(currentUser.role) === 'CUSTOMER') {
      action(currentUser);
    } else {
      pendingAuthActionRef.current = action;
      if (returnTab) {
        pendingReturnTabRef.current = returnTab;
      }
      setCustomerAuthModalOpen(true);
    }
  };

  const handleGenderChange = (newGender: 'women' | 'men') => {
    setGender(newGender);
    if (activeDesign) {
      const isCurrentMen =
        activeDesign.tags.some((t) => t.toLowerCase().includes('men')) ||
        activeDesign.id.includes('men');
      if ((newGender === 'men' && !isCurrentMen) || (newGender === 'women' && isCurrentMen)) {
        const matchingDesign = designs.find((d) =>
          newGender === 'men'
            ? d.tags.some((t) => t.toLowerCase().includes('men')) || d.id.includes('men')
            : !d.id.includes('men') && !d.tags.some((t) => t.toLowerCase().includes('men'))
        );
        setActiveDesign(matchingDesign || null);
      }
    }
  };

  // Subscribe to real-time Milestone Push Notification Service
  useEffect(() => {
    const unsubscribe = pushNotificationService.subscribe((pushAlert) => {
      setActivePushBanner(pushAlert);
      setNotifications((prev) => [
        {
          id: pushAlert.id,
          title: pushAlert.title,
          message: pushAlert.body,
          type: 'tailor_accepted',
          timestamp: 'Just now',
          isRead: false,
          actionTab: 'orders'
        },
        ...prev
      ]);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!activePushBanner) return;
    const timer = setTimeout(() => {
      setActivePushBanner(null);
    }, 6500);
    return () => clearTimeout(timer);
  }, [activePushBanner]);

  // Storefront Tab Navigation with Auth Guards for Personal Account Views
  const handleNavigateStorefrontTab = (tab: string) => {
    const protectedTabs = ['orders', 'profile', 'wardrobe', 'quotes'];
    if (protectedTabs.includes(tab)) {
      if (!currentUser || normalizeRole(currentUser.role) !== 'CUSTOMER') {
        requireCustomerAuth(() => {
          setActiveTab(tab);
          if (tab !== 'design-viewer') setActiveDesign(null);
          try {
            window.history.pushState({}, '', sanitizeReturnUrl(`/${tab}`, 'storefront'));
          } catch {}
        }, tab);
        return;
      }
      try {
        window.history.pushState({}, '', sanitizeReturnUrl(`/${tab}`, 'storefront'));
      } catch {}
    } else if (tab === 'home') {
      try {
        window.history.pushState({}, '', '/');
      } catch {}
    }
    setActiveTab(tab);
    if (tab !== 'design-viewer') setActiveDesign(null);
  };

  const handleSelectStorefrontCategory = (category: StorefrontCategory) => {
    setActiveCategory(category);
    if (category === 'women') handleGenderChange('women');
    if (category === 'men') handleGenderChange('men');
    setActiveTab('marketplace');
  };

  // Authentication Handlers
  const handleLoginSuccess = async (user: AuthUser, newTailorApplication?: TailorProfile) => {
    setCurrentUser(user);
    if (newTailorApplication) {
      setOwnDesignerProfile(newTailorApplication);
    }

    await hydrateRoleWorkspace(user);

    const role = normalizeRole(user.role);
    if (role === 'CUSTOMER') {
      setPortalMode('storefront');
      if (pendingReturnTabRef.current) {
        const targetTab = pendingReturnTabRef.current;
        pendingReturnTabRef.current = null;
        setActiveTab(targetTab);
        try {
          window.history.pushState({}, '', sanitizeReturnUrl(`/${targetTab}`, 'storefront'));
        } catch {}
      } else {
        try {
          const params = new URLSearchParams(window.location.search);
          const returnUrl = sanitizeReturnUrl(params.get('returnUrl'), 'storefront');
          if (returnUrl !== '/') {
            const resolved = resolveRouteStateFromPath(returnUrl);
            if (resolved.tab) setActiveTab(resolved.tab);
            window.history.pushState({}, '', returnUrl);
          }
        } catch {}
      }

      if (pendingAuthActionRef.current) {
        const queued = pendingAuthActionRef.current;
        pendingAuthActionRef.current = null;
        queued(user);
      }
    } else if (role === 'DESIGNER') {
      navigateToPortal('designer', '/designer');
    } else if (role === 'ADMIN') {
      navigateToPortal('admin', '/admin');
    }
  };

  const handleLogout = async () => {
    try {
      await apiClient.logout();
    } catch {}
    setCurrentUser(null);
    setOwnDesignerProfile(null);
    setQuotationRequests([]);
    setOrders([]);
    setWishlistProductIds([]);
    await refreshPublicCatalog();
    if (portalMode !== 'storefront') {
      navigateToPortal('storefront', '/');
    } else {
      try {
        window.history.pushState({}, '', '/');
      } catch {}
    }
    setActiveTab('home');
  };

  // Persist customer cart & wishlist to backend when logged in as CUSTOMER
  const syncCustomerStateToServer = useCallback(
    async (nextWishlist: string[], nextCart: CartItem[]) => {
      if (currentUser && normalizeRole(currentUser.role) === 'CUSTOMER') {
        try {
          await Promise.all([
            apiClient.saveCustomerWishlist(nextWishlist),
            apiClient.saveCustomerCart(nextCart)
          ]);
        } catch (err) {
          console.warn('Failed to persist customer state:', err);
        }
      }
    },
    [currentUser]
  );

  // Shopping Bag Handlers
  const handleAddToCart = (product: MarketplaceProduct, selectedSize: string = 'M') => {
    setCartItems((prev) => {
      const existing = prev.find(
        (item) => item.product.id === product.id && item.selectedSize === selectedSize
      );
      const next = existing
        ? prev.map((item) =>
            item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
          )
        : [
            ...prev,
            {
              id: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
              product,
              selectedSize,
              quantity: 1,
              addedAt: new Date().toISOString()
            }
          ];
      void syncCustomerStateToServer(wishlistProductIds, next);
      return next;
    });

    setShoppingToast({
      id: `toast-${Date.now()}`,
      type: 'cart',
      title: 'Added to Shopping Bag!',
      message: `${product.title} (Size: ${selectedSize})`,
      actionLabel: 'VIEW BAG',
      onAction: () => setCartModalOpen(true)
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) => {
      const next = prev
        .map((item) =>
          item.id === cartItemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0);
      void syncCustomerStateToServer(wishlistProductIds, next);
      return next;
    });
  };

  const handleUpdateCartSize = (cartItemId: string, newSize: string) => {
    setCartItems((prev) => {
      const next = prev.map((item) =>
        item.id === cartItemId ? { ...item, selectedSize: newSize } : item
      );
      void syncCustomerStateToServer(wishlistProductIds, next);
      return next;
    });
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => {
      const next = prev.filter((item) => item.id !== cartItemId);
      void syncCustomerStateToServer(wishlistProductIds, next);
      return next;
    });
  };

  const handleCompleteCartCheckout = (
    items: CartItem[],
    shippingAddress: string,
    paymentMethod: string,
    transactionId: string
  ) => {
    requireCustomerAuth(async () => {
      const itemsToProcess = items && items.length > 0 ? items : cartItems;
      try {
        const res = await apiClient.createCustomerOrder({
          orderType: 'ready-to-wear',
          items: itemsToProcess,
          shippingAddress,
          paymentMethod,
          transactionId
        });
        setOrders((prev) => [...res.orders, ...prev]);
        setCartItems([]);
        setCartModalOpen(false);
        setActiveTab('orders');
        setShoppingToast({
          message: `Order Confirmed! ${res.orders.length} couture piece(s) placed. Tracking live.`,
          productTitle: res.orders[0]?.marketplaceItem?.title || 'Couture Order',
          actionLabel: 'VIEW ORDER',
          onAction: () => setActiveTab('orders')
        });
      } catch (err: any) {
        setShoppingToast({
          message: err?.message || 'Unable to complete checkout. Please sign in as a customer.',
          productTitle: 'Checkout Notice'
        });
      }
    }, 'orders');
  };

  // Handlers for AI Dress Studio & Custom Ordering (Protected on save/request)
  const handleDesignGenerated = async (newDesign: DressDesign) => {
    setDesigns((prev) => [newDesign, ...prev.filter((d) => d.id !== newDesign.id)]);
    setActiveDesign(newDesign);
    setActiveTab('design-viewer');

    if (currentUser && currentUser.role === 'CUSTOMER') {
      try {
        const res = await apiClient.saveCustomerDesign(newDesign);
        setDesigns((prev) => [res.design, ...prev.filter((d) => d.id !== newDesign.id && d.id !== res.design.id)]);
        setActiveDesign(res.design);
      } catch {
        // Keep local activeDesign in state if server persistence fails
      }
    }
  };

  const handleSaveUpdatedDesign = async (updatedDesign: DressDesign) => {
    setDesigns((prev) => {
      const exists = prev.some((d) => d.id === updatedDesign.id);
      return exists ? prev.map((d) => (d.id === updatedDesign.id ? updatedDesign : d)) : [updatedDesign, ...prev];
    });
    setActiveDesign(updatedDesign);

    if (currentUser && currentUser.role === 'CUSTOMER') {
      try {
        const res = await apiClient.saveCustomerDesign(updatedDesign);
        setDesigns((prev) => prev.map((d) => (d.id === updatedDesign.id ? res.design : d)));
        setActiveDesign(res.design);
      } catch {}
    }
  };

  const handleToggleFavorite = (designId: string) => {
    requireCustomerAuth(async () => {
      const targetDesign =
        designs.find((d) => d.id === designId) ||
        (activeDesign && activeDesign.id === designId ? activeDesign : null);
      try {
        const res = await apiClient.toggleCustomerDesignFavorite(designId);
        setDesigns((prev) => prev.map((d) => (d.id === designId ? res.design : d)));
        if (activeDesign && activeDesign.id === designId) {
          setActiveDesign(res.design);
        }
      } catch {
        // If design was generated as guest before login, save it to the customer's wardrobe first
        if (targetDesign) {
          try {
            const saved = await apiClient.saveCustomerDesign({
              ...targetDesign,
              isFavorite: !targetDesign.isFavorite
            });
            setDesigns((prev) => {
              const exists = prev.some((d) => d.id === designId);
              return exists
                ? prev.map((d) => (d.id === designId ? saved.design : d))
                : [saved.design, ...prev];
            });
            if (activeDesign && activeDesign.id === designId) {
              setActiveDesign(saved.design);
            }
            return;
          } catch {}
        }
        setDesigns((prev) =>
          prev.map((d) => (d.id === designId ? { ...d, isFavorite: !d.isFavorite } : d))
        );
      }
    });
  };

  const handleDeleteDesign = async (designId: string) => {
    try {
      await apiClient.deleteCustomerDesign(designId);
    } catch {}
    setDesigns((prev) => prev.filter((d) => d.id !== designId));
    if (activeDesign?.id === designId) {
      setActiveDesign(null);
      setActiveTab('wardrobe');
    }
  };

  const handleBroadcastQuotationRequest = (
    design: DressDesign,
    variation: DressDesignVariation,
    targetBudget: number,
    neededByDate: string,
    specificInstructions: string,
    preferredTailorId?: string,
    selectedStandardSize?: string
  ) => {
    requireCustomerAuth(async () => {
      try {
        await apiClient.saveCustomerDesign(design).catch(() => {});
        const res = await apiClient.createCustomerRequest({
          designId: design.id,
          variation,
          selectedStandardSize,
          preferredTailorId: preferredTailorId || tailors[0]?.id,
          targetBudget,
          neededByDate,
          specificInstructions
        });
        setQuotationRequests((prev) => [res.quotationRequest, ...prev]);
        setActiveTab('quotes');
      } catch (err: any) {
        setShoppingToast({
          message: err?.message || 'Could not submit quotation request.',
          productTitle: 'Custom Request'
        });
      }
    }, 'quotes');
  };

  // Multi-Round Price Negotiation Handlers (Server-Enforced Ownership)
  const handleSendCounterOffer = async (
    requestId: string,
    quoteId: string,
    amount: number,
    note: string,
    senderRole: 'customer' | 'tailor',
    isFinalOffer?: boolean
  ) => {
    try {
      if (senderRole === 'customer') {
        const res = await apiClient.negotiateCustomerRequest(requestId, {
          quoteId,
          action: 'counter',
          amount,
          note
        });
        setQuotationRequests((prev) =>
          prev.map((r) => (r.id === requestId ? res.quotationRequest : r))
        );
      } else {
        const res = await apiClient.negotiateDesignerRequest(requestId, {
          quoteId,
          action: 'counter',
          amount,
          note,
          isFinalOffer
        });
        setQuotationRequests((prev) =>
          prev.map((r) => (r.id === requestId ? res.quotationRequest : r))
        );
      }
    } catch (err: any) {
      setShoppingToast({
        message: err?.message || 'Failed to send counter-offer.',
        productTitle: 'Negotiation'
      });
    }
  };

  const handleAgreeToPrice = async (
    requestId: string,
    quoteId: string,
    party: 'customer' | 'tailor'
  ) => {
    try {
      if (party === 'customer') {
        const res = await apiClient.negotiateCustomerRequest(requestId, {
          quoteId,
          action: 'agree'
        });
        setQuotationRequests((prev) =>
          prev.map((r) => (r.id === requestId ? res.quotationRequest : r))
        );
      } else {
        const res = await apiClient.negotiateDesignerRequest(requestId, {
          quoteId,
          action: 'agree'
        });
        setQuotationRequests((prev) =>
          prev.map((r) => (r.id === requestId ? res.quotationRequest : r))
        );
      }
    } catch (err: any) {
      setShoppingToast({
        message: err?.message || 'Failed to confirm price agreement.',
        productTitle: 'Negotiation'
      });
    }
  };

  const handleUpdateRequestStatus = (
    requestId: string,
    status: QuotationRequest['status'],
    modificationNote?: string
  ) => {
    setQuotationRequests((prev) =>
      prev.map((r) =>
        r.id === requestId
          ? {
              ...r,
              status,
              specificInstructions: modificationNote
                ? `${r.specificInstructions || ''} | Designer Note: ${modificationNote}`
                : r.specificInstructions
            }
          : r
      )
    );
  };

  const handleAcceptQuotation = (request: QuotationRequest, quote: TailorQuotation) => {
    requireCustomerAuth(() => {
      setSelectedQuoteForPayment({ request, quote });
      setUpiModalOpen(true);
    }, 'quotes');
  };

  const handleCompleteEscrowPayment = async (method: string, txnId: string) => {
    if (!selectedQuoteForPayment) return;
    const { request, quote } = selectedQuoteForPayment;
    try {
      const res = await apiClient.createCustomerOrder({
        orderType: 'tailor',
        requestId: request.id,
        quoteId: quote.id,
        paymentMethod: method,
        transactionId: txnId
      });
      setOrders((prev) => [...res.orders, ...prev]);
      setQuotationRequests((prev) =>
        prev.map((r) =>
          r.id === request.id
            ? { ...r, status: 'ACCEPTED', acceptedQuoteId: quote.id }
            : r
        )
      );
      setActiveTab('orders');
      setSelectedQuoteForPayment(null);
      setUpiModalOpen(false);
    } catch (err: any) {
      setShoppingToast({
        message: err?.message || 'Payment verification failed.',
        productTitle: 'Escrow Checkout'
      });
    }
  };

  // Enforced 7-Step Designer Order Status Transition Handler
  const handleAdvanceOrderStatus = async (orderId: string, nextStatus: DesignerOrderStatus) => {
    try {
      const res = await apiClient.advanceDesignerOrderStatus(orderId, nextStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
    } catch (err: any) {
      setShoppingToast({
        message: err?.message || 'Unauthorized order status update.',
        productTitle: 'Order Update'
      });
    }
  };

  const handleAdvanceMilestone = async (
    orderId: string,
    milestoneId: string,
    photoProofUrl?: string
  ) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const targetMilestone = targetOrder?.milestones.find(
      (m, idx) => (m.id || m.stage || String(idx)) === milestoneId
    );

    try {
      const res = await apiClient.completeDesignerOrderMilestone(
        orderId,
        milestoneId,
        photoProofUrl
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));

      if (targetOrder) {
        const milestoneTitle =
          targetMilestone?.title ||
          targetMilestone?.label ||
          targetMilestone?.stage ||
          'First Fitting Complete';
        pushNotificationService.sendMilestonePushNotification({
          orderId: targetOrder.id,
          orderNumber: targetOrder.orderNumber || targetOrder.id,
          garmentTitle:
            targetOrder.variation?.name || targetOrder.design?.name || 'Bespoke Garment',
          tailorName: targetOrder.tailorName,
          tailorAvatar: targetOrder.tailorAvatar,
          milestoneId,
          milestoneTitle,
          status: 'COMPLETED',
          photoUrl: photoProofUrl || targetMilestone?.photoUrl || targetMilestone?.photoProof
        });
      }
    } catch (err: any) {
      setShoppingToast({
        message: err?.message || 'Unauthorized milestone update.',
        productTitle: 'Production Proof'
      });
    }
  };

  const handleUploadMilestonePhoto = (
    orderId: string,
    milestoneId: string,
    photo: Omit<MilestoneProgressPhoto, 'id' | 'uploadedAt'>,
    markStatus?: 'IN_PROGRESS' | 'COMPLETED'
  ) => {
    const createdPhoto: MilestoneProgressPhoto = {
      ...photo,
      id: `pp-${Date.now()}`,
      uploadedAt: new Date().toISOString()
    };

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedMilestones = order.milestones.map((m, idx) => {
          const mKey = m.id || m.stage || `ms-${idx}`;
          if (mKey !== milestoneId) return m;
          const nextStatus = markStatus || m.status || 'IN_PROGRESS';
          const isNowCompleted = nextStatus === 'COMPLETED' || m.completed;
          return {
            ...m,
            status: nextStatus,
            completed: isNowCompleted,
            completedAt: isNowCompleted ? m.completedAt || new Date().toISOString() : m.completedAt,
            photoUrl: createdPhoto.url,
            photoProof: createdPhoto.url,
            photoProofUrl: createdPhoto.url,
            tailorNote: createdPhoto.caption,
            progressPhotos: [...(m.progressPhotos || []), createdPhoto]
          };
        });
        return { ...order, milestones: updatedMilestones };
      })
    );
  };

  const handleRateOrderMilestone = (
    orderId: string,
    milestoneId: string,
    rating: MilestoneRating
  ) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;
        const updatedMilestones = order.milestones.map((m, idx) => {
          const mKey = m.id || m.stage || `ms-${idx}`;
          if (mKey !== milestoneId) return m;
          return { ...m, customerRating: rating };
        });
        return { ...order, milestones: updatedMilestones };
      })
    );
  };

  const handleSubmitReview = (
    orderId: string,
    _tailorId: string,
    reviewData: Omit<Review, 'id' | 'createdAt'>
  ) => {
    requireCustomerAuth(async () => {
      try {
        const res = await apiClient.submitCustomerOrderReview(orderId, reviewData);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
        await refreshPublicCatalog();
      } catch (err: any) {
        setShoppingToast({
          message: err?.message || 'Could not submit review.',
          productTitle: 'Order Review'
        });
      }
    }, 'orders');
  };

  const handleConfirmOrderDelivery = (orderId: string) => {
    requireCustomerAuth(async () => {
      try {
        const res = await apiClient.confirmCustomerOrderDelivery(orderId);
        setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      } catch (err: any) {
        setShoppingToast({
          message: err?.message || 'Could not confirm order delivery.',
          productTitle: 'Order Delivery'
        });
      }
    }, 'orders');
  };

  const handleSendMessage = async (
    content: string,
    type: 'TEXT' | 'IMAGE' | 'MEASUREMENT_CARD' | 'FABRIC_SWATCH' = 'TEXT'
  ) => {
    if (!currentUser) {
      setCustomerAuthModalOpen(true);
      return;
    }
    try {
      const res = await apiClient.sendMessage({
        orderId: orders[0]?.id || 'ord-1',
        recipientId: activeChatRecipient?.id || 'tailor-1',
        content,
        type
      });
      setChatMessages((prev) => [...prev, res.message]);
    } catch {
      // Fallback local echo if offline
    }
  };

  const handleOpenChat = (recipientId: string, recipientName: string) => {
    const tailor = tailors.find((t) => t.id === recipientId);
    setActiveChatRecipient({
      id: recipientId,
      name: recipientName,
      avatar: tailor?.avatar
    });
    setChatOpen(true);
  };

  const handleRequestSwatchFromLibrary = (fabric: HighEndFabric, customNote?: string) => {
    requireCustomerAuth(async () => {
      const messageBody = customNote
        ? `Swatch Request for ${fabric.name} (${fabric.weightGsm} GSM) — "${customNote}"`
        : `Please share a physical feeler swatch & daylight macro video of ${fabric.name} (${fabric.weightGsm} GSM, ${fabric.colorTone}).`;

      try {
        const res = await apiClient.sendMessage({
          orderId: orders[0]?.id || 'ord-1',
          recipientId: activeChatRecipient?.id || 'tailor-1',
          content: messageBody,
          type: 'FABRIC_SWATCH',
          attachmentData: {
            title: `${fabric.name} — ${fabric.colorTone}`,
            hex: fabric.hex,
            weight: `${fabric.weightGsm} GSM`,
            composition: fabric.composition,
            origin: fabric.origin,
            imageUrl: fabric.imageUrl,
            pricePerMeterINR: fabric.pricePerMeterINR
          }
        });
        setChatMessages((prev) => [...prev, res.message]);
      } catch {}
      setFabricLibraryOpen(false);
      setChatOpen(true);
    });
  };

  const handleOpenSpecSheet = (variation: DressDesignVariation) => {
    setSpecSheetVariation(variation);
    setSpecSheetOpen(true);
  };

  // Designer Product Showcase CRUD (Verified Designers Only — Enforced on Server)
  const handleAddProduct = async (newProduct: Omit<MarketplaceProduct, 'id'>) => {
    try {
      const res = await apiClient.createDesignerProduct(newProduct);
      setProducts((prev) => [res.product, ...prev]);
    } catch (err: any) {
      setShoppingToast({
        message: err?.message || 'Only verified designers can publish products.',
        productTitle: 'Product Showcase'
      });
    }
  };

  const handleUpdateProduct = async (updated: MarketplaceProduct) => {
    try {
      const res = await apiClient.updateDesignerProduct(updated.id, updated);
      setProducts((prev) => prev.map((p) => (p.id === updated.id ? res.product : p)));
    } catch (err: any) {
      setShoppingToast({
        message: err?.message || 'Unable to update product.',
        productTitle: 'Product Showcase'
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      await apiClient.deleteDesignerProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch (err: any) {
      setShoppingToast({
        message: err?.message || 'Unable to delete product.',
        productTitle: 'Product Showcase'
      });
    }
  };

  const handleUpdateTailorProfile = async (updated: TailorProfile) => {
    try {
      const res = await apiClient.updateDesignerApplication({
        shopName: updated.shopName,
        city: updated.city,
        state: updated.state,
        experienceYears: updated.experienceYears,
        specialties: updated.specialties,
        bio: updated.bio,
        pricingRange: updated.pricingRange,
        startingPrice: updated.startingPrice,
        portfolio: updated.portfolio
      });
      setOwnDesignerProfile(res.profile);
    } catch {}
  };

  const handleTailorSubmitKYC = async (docs: TailorVerificationDocument[]) => {
    try {
      const res = await apiClient.updateDesignerApplication({
        verificationDocuments: docs,
        resubmit: true
      });
      setOwnDesignerProfile(res.profile);
    } catch {}
  };

  // Admin Governance Actions (Server-Enforced & Audited)
  const handleApproveTailor = async (tailorId: string) => {
    try {
      const res = await apiClient.verifyAdminDesigner(
        tailorId,
        'VERIFIED',
        'Application, portfolio & verification approved by Admin.'
      );
      setTailors((prev) => prev.map((t) => (t.id === tailorId ? res.profile : t)));
      setAuditLogs((prev) => [res.auditLog, ...prev]);
    } catch {}
  };

  const handleRejectTailor = async (tailorId: string, reason: string) => {
    try {
      const res = await apiClient.verifyAdminDesigner(tailorId, 'REJECTED', reason);
      setTailors((prev) => prev.map((t) => (t.id === tailorId ? res.profile : t)));
      setAuditLogs((prev) => [res.auditLog, ...prev]);
    } catch {}
  };

  const handleRevokeTailor = async (tailorId: string, reason: string) => {
    try {
      const res = await apiClient.verifyAdminDesigner(tailorId, 'REVOKED', reason);
      setTailors((prev) => prev.map((t) => (t.id === tailorId ? res.profile : t)));
      setAuditLogs((prev) => [res.auditLog, ...prev]);
    } catch {}
  };

  const handleRequestTailorInfo = async (tailorId: string, message: string) => {
    try {
      const res = await apiClient.verifyAdminDesigner(tailorId, 'PENDING', message);
      setTailors((prev) => prev.map((t) => (t.id === tailorId ? res.profile : t)));
      setAuditLogs((prev) => [res.auditLog, ...prev]);
    } catch {}
  };

  const handleToggleSuspendTailor = async (tailorId: string) => {
    const target = tailors.find((t) => t.id === tailorId);
    const matchingUser = adminUsers.find(
      (u) => u.tailorProfileId === tailorId || u.id === tailorId
    );
    const userId = matchingUser?.id || tailorId;
    const nextStatus = target?.accountStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';

    try {
      await apiClient.updateAdminUserStatus(
        userId,
        nextStatus,
        nextStatus === 'SUSPENDED'
          ? 'Designer account suspended by platform governance.'
          : 'Designer account reactivated by platform governance.'
      );
      const adm = await apiClient.getAdminDashboard();
      setTailors(adm.tailors);
      setAdminUsers(adm.users);
      setAuditLogs(adm.auditLogs);
    } catch {}
  };

  const handleToggleSuspendUser = async (
    userId: string,
    currentStatus: 'ACTIVE' | 'SUSPENDED'
  ) => {
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    try {
      await apiClient.updateAdminUserStatus(
        userId,
        nextStatus,
        nextStatus === 'SUSPENDED'
          ? 'Account suspended by platform administrator.'
          : 'Account reactivated by platform administrator.'
      );
      const adm = await apiClient.getAdminDashboard();
      setTailors(adm.tailors);
      setAdminUsers(adm.users);
      setAuditLogs(adm.auditLogs);
    } catch {}
  };

  const handleModerateProduct = async (
    productId: string,
    status: 'APPROVED' | 'FLAGGED' | 'REMOVED'
  ) => {
    try {
      const res = await apiClient.moderateAdminProduct(
        productId,
        status,
        `Product listing marked ${status} by admin.`
      );
      setProducts((prev) => prev.map((p) => (p.id === productId ? res.product : p)));
      setAuditLogs((prev) => [res.auditLog, ...prev]);
    } catch {}
  };

  const handleResolveDispute = async (
    disputeId: string,
    resolution: 'RESOLVED_REFUND' | 'RESOLVED_RELEASE',
    note: string
  ) => {
    try {
      const res = await apiClient.resolveAdminDispute(disputeId, resolution, note);
      setDisputes((prev) => prev.map((d) => (d.id === disputeId ? res.dispute : d)));
      setAuditLogs((prev) => [res.auditLog, ...prev]);
    } catch {}
  };

  const handleReleaseEscrow = async (orderId: string) => {
    try {
      const res = await apiClient.releaseAdminOrderEscrow(
        orderId,
        'Escrow funds released by platform administrator.'
      );
      setOrders((prev) => prev.map((o) => (o.id === orderId ? res.order : o)));
      setAuditLogs((prev) => [res.auditLog, ...prev]);
    } catch {}
  };

  const handleUpdateCommissionRate = async (newRate: number) => {
    try {
      const res = await apiClient.updateAdminCommissionRate(
        newRate,
        `Updated marketplace commission fee to ${newRate}%.`
      );
      setCommissionRate(res.commissionRate);
      setAuditLogs((prev) => [res.auditLog, ...prev]);
    } catch {}
  };

  const handleSaveMeasurements = (newMeasurements: MeasurementSheet) => {
    requireCustomerAuth(async () => {
      try {
        const res = await apiClient.saveCustomerMeasurements(newMeasurements);
        setMeasurements(res.measurements);
      } catch {
        setMeasurements(newMeasurements);
      }
    });
  };

  const handleToggleWishlist = (productId: string) => {
    requireCustomerAuth(() => {
      setWishlistProductIds((prev) => {
        const next = prev.includes(productId)
          ? prev.filter((id) => id !== productId)
          : [...prev, productId];
        void syncCustomerStateToServer(next, cartItems);
        return next;
      });
    }, 'wishlist');
  };

  const handleMarkNotificationAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const handleStartCustomizerFromPrompt = (prompt?: string, dressType?: any) => {
    setGeneratorPrefill({ prompt, dressType });
    setActiveTab('generator');
  };

  const handleRequestStitchingForTailor = (tailor: TailorProfile) => {
    setSelectedTailor(tailor);
    setActiveTab('tailors');
  };

  const handleBuyMarketplaceProduct = (product: MarketplaceProduct, selectedSize: string) => {
    handleAddToCart(product, selectedSize);
  };

  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // ============================================================================
  // PORTAL 1: DEDICATED DESIGNER / TAILOR SELLER PORTAL (/designer/login, /designer/register, /designer)
  // ============================================================================
  if (portalMode === 'designer') {
    const designerLoginFallback = (
      <AuthModal
        isOpen={true}
        onClose={() => navigateToPortal('storefront', '/')}
        onLoginSuccess={handleLoginSuccess}
        initialRole="DESIGNER"
        isFullPagePortal={true}
        onBackToStorefront={() => navigateToPortal('storefront', '/')}
      />
    );

    const activeDesignerProfile =
      ownDesignerProfile ||
      tailors.find((t) => t.id === currentUser?.tailorProfileId) ||
      INITIAL_TAILORS[0];

    return (
      <RequireRole
        user={currentUser}
        isLoading={isLoadingAuth}
        allowedRoles={['DESIGNER']}
        unauthenticatedFallback={designerLoginFallback}
        onReturnToStorefront={() => navigateToPortal('storefront', '/')}
        onLogout={handleLogout}
      >
        <div className="min-h-screen bg-[#FAF7F2] text-[#2D2825] font-sans flex flex-col">
          {/* Dedicated Seller Portal Top Bar */}
          <header className="sticky top-0 z-40 bg-[#2D2825] text-white border-b border-white/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37] flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-[#D4AF37]" />
                </div>
                <div>
                  <span className="font-serif text-base font-bold tracking-tight block leading-none">
                    PEARL PICK SELLER STUDIO
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-[#D4AF37] block mt-0.5">
                    {activeDesignerProfile.verificationStatus === 'VERIFIED'
                      ? 'Authorized Master Designer Workspace'
                      : `Application Status: ${activeDesignerProfile.verificationStatus}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateToPortal('storefront', '/')}
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>View Shopping Website</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-rose-600/90 hover:bg-rose-600 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
            <RequireVerifiedDesigner
              user={currentUser}
              designerProfile={activeDesignerProfile}
              isLoading={isLoadingAuth}
              unauthenticatedFallback={designerLoginFallback}
              onReturnToStorefront={() => navigateToPortal('storefront', '/')}
              onLogout={handleLogout}
              unverifiedFallback={
                <DesignerApplicationWorkspace
                  designerProfile={activeDesignerProfile}
                  onUpdateProfile={(updated) => setOwnDesignerProfile(updated)}
                  onOpenKycModal={() => setTailorVerificationModalOpen(true)}
                  onLogout={handleLogout}
                />
              }
            >
              <TailorDashboard
                currentTailor={activeDesignerProfile}
                incomingRequests={quotationRequests}
                activeOrders={orders}
                products={products}
                onOpenVerificationModal={() => setTailorVerificationModalOpen(true)}
                onSubmitQuote={async (requestId, quote) => {
                  try {
                    const res = await apiClient.submitDesignerQuote(requestId, quote);
                    setQuotationRequests((prev) =>
                      prev.map((r) => (r.id === requestId ? res.quotationRequest : r))
                    );
                  } catch (err: any) {
                    setShoppingToast({
                      message: err?.message || 'Only verified designers can submit quotes.',
                      productTitle: 'Quotation Submission'
                    });
                  }
                }}
                onUpdateRequestStatus={handleUpdateRequestStatus}
                onSendCounterOffer={(reqId, quoteId, amount, note, _role, isFinal) =>
                  handleSendCounterOffer(reqId, quoteId, amount, note, 'tailor', isFinal)
                }
                onAgreeToPrice={(reqId, quoteId) => handleAgreeToPrice(reqId, quoteId, 'tailor')}
                onAdvanceMilestone={handleAdvanceMilestone}
                onAdvanceOrderStatus={handleAdvanceOrderStatus}
                onOpenChat={handleOpenChat}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                onDeleteProduct={handleDeleteProduct}
                onUpdateTailorProfile={handleUpdateTailorProfile}
              />
            </RequireVerifiedDesigner>
          </main>

          <TailorVerificationModal
            isOpen={tailorVerificationModalOpen}
            onClose={() => setTailorVerificationModalOpen(false)}
            onSubmitDocuments={handleTailorSubmitKYC}
          />

          <StyleChatModal
            isOpen={chatOpen}
            onClose={() => setChatOpen(false)}
            tailorName={activeDesignerProfile.name}
            tailorAvatar={activeDesignerProfile.avatar}
            customerName={activeChatRecipient?.name || 'Customer'}
            customerAvatar={activeChatRecipient?.avatar}
            measurements={measurements}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            onOpenFabricLibrary={() => setFabricLibraryOpen(true)}
          />
        </div>
      </RequireRole>
    );
  }

  // ============================================================================
  // PORTAL 2: DEDICATED ADMIN GOVERNANCE PORTAL (/admin/login, /admin/*)
  // ============================================================================
  if (portalMode === 'admin') {
    const adminLoginFallback = (
      <AuthModal
        isOpen={true}
        onClose={() => navigateToPortal('storefront', '/')}
        onLoginSuccess={handleLoginSuccess}
        initialRole="ADMIN"
        isFullPagePortal={true}
        onBackToStorefront={() => navigateToPortal('storefront', '/')}
      />
    );

    return (
      <RequireRole
        user={currentUser}
        isLoading={isLoadingAuth}
        allowedRoles={['ADMIN']}
        unauthenticatedFallback={adminLoginFallback}
        onReturnToStorefront={() => navigateToPortal('storefront', '/')}
        onLogout={handleLogout}
      >
        <div className="min-h-screen bg-[#FAF7F2] text-[#2D2825] font-sans flex flex-col">
          <header className="sticky top-0 z-40 bg-[#8D2434] text-white border-b border-white/15">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <span className="font-serif text-base font-bold tracking-tight block leading-none">
                    PEARL PICK GOVERNANCE
                  </span>
                  <span className="text-[10px] uppercase tracking-widest text-white/80 block mt-0.5">
                    Authorized Admin Console
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => navigateToPortal('storefront', '/')}
                  className="px-3 py-1.5 rounded-lg bg-white/15 hover:bg-white/25 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>View Shopping Website</span>
                </button>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 py-1.5 rounded-lg bg-black/30 hover:bg-black/45 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </header>

          <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1">
            <AdminDashboard
              tailors={tailors}
              orders={orders}
              products={products}
              customers={adminUsers}
              disputes={disputes}
              auditLogs={auditLogs}
              commissionRate={commissionRate}
              analytics={analytics}
              onApproveTailor={handleApproveTailor}
              onRejectTailor={handleRejectTailor}
              onRevokeTailor={handleRevokeTailor}
              onRequestTailorInfo={handleRequestTailorInfo}
              onToggleSuspendTailor={handleToggleSuspendTailor}
              onToggleSuspendUser={handleToggleSuspendUser}
              onModerateProduct={handleModerateProduct}
              onResolveDispute={handleResolveDispute}
              onUpdateCommissionRate={handleUpdateCommissionRate}
              onReleaseEscrow={handleReleaseEscrow}
            />
          </main>
        </div>
      </RequireRole>
    );
  }

  // ============================================================================
  // PORTAL 3: PUBLIC & CUSTOMER E-COMMERCE SHOPPING WEBSITE (/)
  // ============================================================================
  const customerLoginFallback = (
    <div className="max-w-md mx-auto my-12 bg-white rounded-3xl border border-[#E4D9D1] p-8 text-center space-y-4 shadow-xs">
      <h2 className="font-serif text-2xl font-bold text-[#2D2825]">Customer Sign-In Required</h2>
      <p className="text-xs text-[#7D726A] leading-relaxed">
        Please sign in with a Customer account to access your saved designs, body measurements, custom quotations, and orders.
      </p>
      <button
        type="button"
        onClick={() => setCustomerAuthModalOpen(true)}
        className="w-full py-3 rounded-xl bg-[#8D2434] hover:bg-[#701B28] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
      >
        Sign In / Create Customer Account
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2825] font-sans selection:bg-[#E9D4D7] selection:text-[#4A3728] flex flex-col justify-between">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={handleNavigateStorefrontTab}
        activeCategory={activeCategory}
        onSelectStorefrontCategory={handleSelectStorefrontCategory}
        gender={gender}
        setGender={handleGenderChange}
        savedDesignsCount={designs.length}
        activeOrdersCount={orders.filter((o) => o.status !== 'DELIVERED').length}
        wishlistCount={wishlistProductIds.length}
        cartCount={totalCartCount}
        openMeasurements={() => {
          requireCustomerAuth(() => setMeasurementsModalOpen(true));
        }}
        openSearch={() => setSearchModalOpen(true)}
        openFabricLibrary={() => setFabricLibraryOpen(true)}
        openCart={() => setCartModalOpen(true)}
        openWishlist={() => setActiveTab('wishlist')}
        currentUser={currentUser}
        onOpenCustomerAuth={() => setCustomerAuthModalOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Storefront Content */}
      <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16 flex-1">
        {activeTab === 'home' && (
          <SplashScreen
            userName={currentUser?.name}
            gender={gender}
            onGenderChange={handleGenderChange}
            onStartGenerator={handleStartCustomizerFromPrompt}
            onExploreTailors={() => setActiveTab('tailors')}
            onExploreMarketplace={(cat) => {
              if (cat) handleSelectStorefrontCategory(cat);
              else setActiveTab('marketplace');
            }}
            onOpenMeasurements={() => {
              requireCustomerAuth(() => setMeasurementsModalOpen(true));
            }}
            onSelectDesign={(design) => {
              setActiveDesign(design);
              setActiveTab('design-viewer');
            }}
            onSelectTailor={(tailor) => {
              setSelectedTailor(tailor);
              setActiveTab('tailors');
            }}
            onRequestStitching={handleRequestStitchingForTailor}
            onSelectCategory={(catName) => {
              handleStartCustomizerFromPrompt(
                `Exquisite bespoke ${catName} crafted with hand zardozi work and pure textile`,
                catName as any
              );
            }}
            onOpenNotifications={() => setNotificationsModalOpen(true)}
            onOpenSearch={() => setSearchModalOpen(true)}
            featuredDesigns={designs}
            tailors={tailors.filter((t) => t.verificationStatus === 'VERIFIED')}
            verifiedTailors={tailors.filter((t) => t.verificationStatus === 'VERIFIED')}
            products={products.filter(
              (p) => p.moderationStatus !== 'REMOVED' && p.moderationStatus !== 'FLAGGED'
            )}
            wishlistIds={wishlistProductIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => handleSelectProduct(p)}
            recentlyViewedProducts={recentlyViewedProducts}
          />
        )}

        {/* Sub-Navigation for AI Dress Studio, 3-View Sheet & Saved Designs */}
        {(activeTab === 'generator' || activeTab === 'design-viewer' || activeTab === 'wardrobe') && (
          <div className="max-w-lg mx-auto mb-6">
            <div className="flex items-center p-1 rounded-2xl bg-[#EFE9E2] border border-[#E0D6CC] text-xs font-bold">
              <button
                type="button"
                onClick={() => setActiveTab('generator')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'generator'
                    ? 'bg-[#2D2825] text-white shadow-2xs'
                    : 'text-[#7D726A] hover:text-[#2D2825]'
                }`}
              >
                AI Dress Studio
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('design-viewer')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'design-viewer'
                    ? 'bg-[#8D2434] text-white shadow-2xs'
                    : 'text-[#7D726A] hover:text-[#2D2825]'
                }`}
              >
                3-View Design Sheet
              </button>
              <button
                type="button"
                onClick={() => handleNavigateStorefrontTab('wardrobe')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'wardrobe'
                    ? 'bg-white text-[#2D2825] shadow-2xs'
                    : 'text-[#7D726A] hover:text-[#2D2825]'
                }`}
              >
                Saved Designs ({designs.length})
              </button>
            </div>
          </div>
        )}

        {/* Sub-Navigation for Orders & Quotations */}
        {(activeTab === 'orders' || activeTab === 'quotes') && (
          <div className="max-w-lg mx-auto mb-6">
            <div className="flex items-center p-1 rounded-2xl bg-[#EFE9E2] border border-[#E0D6CC] text-xs font-bold">
              <button
                type="button"
                onClick={() => handleNavigateStorefrontTab('orders')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'orders'
                    ? 'bg-[#2D2825] text-white shadow-2xs'
                    : 'text-[#7D726A] hover:text-[#2D2825]'
                }`}
              >
                My Orders ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => handleNavigateStorefrontTab('quotes')}
                className={`flex-1 py-2 rounded-xl transition-all cursor-pointer ${
                  activeTab === 'quotes'
                    ? 'bg-[#8D2434] text-white shadow-2xs'
                    : 'text-[#7D726A] hover:text-[#2D2825]'
                }`}
              >
                Custom Quotes & Negotiation ({quotationRequests.length})
              </button>
            </div>
          </div>
        )}

        {activeTab === 'generator' && (
          <AIDressGenerator
            key={`${generatorPrefill.prompt || ''}-${generatorPrefill.dressType || ''}-${gender}`}
            gender={gender}
            onGenderChange={handleGenderChange}
            onDesignGenerated={handleDesignGenerated}
            onOpenNotifications={() => setNotificationsModalOpen(true)}
            onOpenHistory={() => handleNavigateStorefrontTab('wardrobe')}
            onRequestTailor={(design) => {
              setActiveDesign(design);
              setActiveTab('design-viewer');
            }}
            onViewDesignDetails={(design) => {
              setActiveDesign(design);
              setActiveTab('design-viewer');
            }}
            onOpenFabricLibrary={() => setFabricLibraryOpen(true)}
            initialPrompt={generatorPrefill.prompt}
            initialDressType={generatorPrefill.dressType}
            latestConcept={
              activeDesign &&
              ((gender === 'men' &&
                (activeDesign.tags?.some((t) => t.toLowerCase().includes('men')) ||
                  activeDesign.id.includes('men'))) ||
                (gender === 'women' &&
                  !activeDesign.id.includes('men') &&
                  !activeDesign.tags?.some((t) => t.toLowerCase().includes('men'))))
                ? activeDesign
                : gender === 'men'
                ? designs.find((d) => d.id.includes('men')) || designs[0]
                : designs.find((d) => !d.id.includes('men')) || designs[0]
            }
          />
        )}

        {activeTab === 'marketplace' && (
          <MarketplaceView
            gender={gender}
            onGenderChange={handleGenderChange}
            activeStorefrontCategory={activeCategory}
            products={products.filter(
              (p) => p.moderationStatus !== 'REMOVED' && p.moderationStatus !== 'FLAGGED'
            )}
            wishlistIds={wishlistProductIds}
            cartCount={totalCartCount}
            initialCategory={
              activeCategory === 'men'
                ? 'All'
                : activeCategory === 'festive'
                ? 'Festive'
                : activeCategory === 'ethnic'
                ? 'Traditional'
                : activeCategory === 'collections'
                ? 'Bridal'
                : 'All'
            }
            onToggleWishlist={handleToggleWishlist}
            onBuyNow={handleBuyMarketplaceProduct}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => handleSelectProduct(p)}
            onOpenCart={() => setCartModalOpen(true)}
            onChatSeller={(designerName) => {
              const tailor =
                tailors.find((t) =>
                  t.name.toLowerCase().includes(designerName.toLowerCase().slice(0, 4))
                ) || tailors[0];
              handleOpenChat(tailor.id, tailor.name);
            }}
            onRequestCustomStitch={(product) => {
              handleStartCustomizerFromPrompt(
                `Custom bespoke edition of ${product.title} with exact body fit and hand embroidery`,
                product.category as any
              );
            }}
          />
        )}

        {activeTab === 'wishlist' && (
          <WishlistView
            wishlistIds={wishlistProductIds}
            products={products}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
            onSelectProduct={(p) => handleSelectProduct(p)}
            onExploreMarketplace={() => setActiveTab('marketplace')}
            onOpenStudio={() => setActiveTab('generator')}
            onOpenCart={() => setCartModalOpen(true)}
            cartCount={totalCartCount}
          />
        )}

        {activeTab === 'design-viewer' &&
          (activeDesign || designs[0] ? (
            <GeneratedDesignViewer
              design={activeDesign || designs[0]}
              measurements={measurements}
              tailors={tailors.filter((t) => t.verificationStatus === 'VERIFIED')}
              onSaveToFavorites={handleToggleFavorite}
              onRequestQuotations={handleBroadcastQuotationRequest}
              onBackToStudio={() => {
                setActiveDesign(null);
                setActiveTab('generator');
              }}
              onOpenSpecSheet={handleOpenSpecSheet}
              onOpenMeasurements={() => {
                requireCustomerAuth(() => setMeasurementsModalOpen(true));
              }}
              onSaveUpdatedDesign={handleSaveUpdatedDesign}
            />
          ) : (
            <DesignGallery
              designs={designs}
              onSelectDesign={(design) => {
                setActiveDesign(design);
                setActiveTab('design-viewer');
              }}
              onDeleteDesign={handleDeleteDesign}
              onToggleFavorite={handleToggleFavorite}
              onStartNewDesign={() => {
                setActiveDesign(null);
                setActiveTab('generator');
              }}
            />
          ))}

        {activeTab === 'wardrobe' && (
          <RequireRole
            user={currentUser}
            isLoading={isLoadingAuth}
            allowedRoles={['CUSTOMER']}
            unauthenticatedFallback={customerLoginFallback}
            onReturnToStorefront={() => setActiveTab('home')}
            onLogout={handleLogout}
          >
            <DesignGallery
              designs={designs}
              onSelectDesign={(design) => {
                setActiveDesign(design);
                setActiveTab('design-viewer');
              }}
              onDeleteDesign={handleDeleteDesign}
              onToggleFavorite={handleToggleFavorite}
              onStartNewDesign={() => {
                setActiveDesign(null);
                setActiveTab('generator');
              }}
            />
          </RequireRole>
        )}

        {activeTab === 'tailors' && (
          <TailorMarketplace
            gender={gender}
            tailors={tailors.filter((t) => t.verificationStatus === 'VERIFIED')}
            selectedTailor={selectedTailor}
            onSelectTailor={setSelectedTailor}
            onContactTailor={(tailor) => handleOpenChat(tailor.id, tailor.name)}
            onRequestCustomQuote={(tailor) => {
              setSelectedTailor(null);
              handleStartCustomizerFromPrompt(
                `Bespoke couture piece crafted with Master Tailor ${tailor.name} (${tailor.shopName})`,
                gender === 'men' ? ('Royal Jodhpuri Bandhgala' as any) : ('Lehenga' as any)
              );
            }}
          />
        )}

        {activeTab === 'quotes' && (
          <RequireRole
            user={currentUser}
            isLoading={isLoadingAuth}
            allowedRoles={['CUSTOMER']}
            unauthenticatedFallback={customerLoginFallback}
            onReturnToStorefront={() => setActiveTab('home')}
            onLogout={handleLogout}
          >
            <QuotationComparison
              quotationRequests={quotationRequests}
              onAcceptQuotation={handleAcceptQuotation}
              onSendCounterOffer={(reqId, quoteId, amount, note) =>
                handleSendCounterOffer(reqId, quoteId, amount, note, 'customer', false)
              }
              onAgreeToPrice={(reqId, quoteId) => handleAgreeToPrice(reqId, quoteId, 'customer')}
              onOpenChat={handleOpenChat}
              onNavigateToStudio={() => setActiveTab('generator')}
            />
          </RequireRole>
        )}

        {activeTab === 'orders' && (
          <RequireRole
            user={currentUser}
            isLoading={isLoadingAuth}
            allowedRoles={['CUSTOMER']}
            unauthenticatedFallback={customerLoginFallback}
            onReturnToStorefront={() => setActiveTab('home')}
            onLogout={handleLogout}
          >
            <OrderTrackingView
              orders={orders}
              onOpenChat={handleOpenChat}
              onSubmitReview={handleSubmitReview}
              onConfirmDelivery={handleConfirmOrderDelivery}
              onUploadMilestonePhoto={handleUploadMilestonePhoto}
              onRateMilestone={handleRateOrderMilestone}
              onOpenFabricLibrary={() => setFabricLibraryOpen(true)}
            />
          </RequireRole>
        )}

        {activeTab === 'profile' && (
          <RequireRole
            user={currentUser}
            isLoading={isLoadingAuth}
            allowedRoles={['CUSTOMER']}
            unauthenticatedFallback={customerLoginFallback}
            onReturnToStorefront={() => setActiveTab('home')}
            onLogout={handleLogout}
          >
            <CustomerProfileView
              profile={{
                ...customerProfile,
                name: currentUser?.name || customerProfile.name,
                email: currentUser?.email || customerProfile.email,
                phone: currentUser?.phone || customerProfile.phone,
                avatar: currentUser?.avatar || customerProfile.avatar
              }}
              measurements={measurements}
              savedDesigns={designs}
              orders={orders}
              onOpenMeasurementsModal={() => setMeasurementsModalOpen(true)}
              onNavigateToStudio={() => setActiveTab('generator')}
              onNavigateToOrders={() => handleNavigateStorefrontTab('orders')}
            />
          </RequireRole>
        )}
      </main>

      {/* Consumer E-Commerce Footer */}
      <Footer
        onSelectCategory={handleSelectStorefrontCategory}
        onNavigateTab={handleNavigateStorefrontTab}
        onOpenDesignerPortal={() => navigateToPortal('designer', '/designer/login')}
        onOpenAdminPortal={() => navigateToPortal('admin', '/admin/login')}
      />

      {/* Real-Time Milestone Push Notification Banner */}
      {activePushBanner && (
        <div
          id="live-device-push-banner"
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md bg-[#2D2825]/95 backdrop-blur-md text-white rounded-2xl p-3.5 border border-[#D4AF37]/40 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300"
        >
          <div className="flex items-start gap-3">
            {activePushBanner.photoUrl ? (
              <img
                src={activePushBanner.photoUrl}
                alt={activePushBanner.milestoneTitle}
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover border border-white/20 shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-[#8D2434] flex items-center justify-center shrink-0">
                <BellRing className="w-5 h-5 text-[#FAF7F2]" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[9px] uppercase tracking-widest font-bold text-[#D4AF37] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  PEARL PICK • MILESTONE UPDATE
                </span>
                <button
                  onClick={() => setActivePushBanner(null)}
                  className="text-white/60 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <h4 className="font-serif text-xs sm:text-sm font-bold text-[#FAF7F2] truncate mt-0.5">
                {activePushBanner.title}
              </h4>
              <p className="text-[11px] text-white/80 line-clamp-2 mt-0.5 leading-snug font-light">
                {activePushBanner.body}
              </p>
              <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-white/10">
                <span className="text-[10px] text-white/60">
                  From {activePushBanner.tailorName}
                </span>
                <button
                  onClick={() => {
                    handleNavigateStorefrontTab('orders');
                    setActivePushBanner(null);
                  }}
                  className="px-2.5 py-1 rounded-full bg-[#8D2434] hover:bg-[#A62B3E] text-white text-[10px] font-semibold cursor-pointer transition-colors"
                >
                  Track Live Milestone →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={activeTab}
        setActiveTab={handleNavigateStorefrontTab}
        activeOrdersCount={orders.filter((o) => o.status !== 'DELIVERED').length}
      />

      {/* Shopping Bag & Checkout Drawer */}
      <CartCheckoutModal
        isOpen={cartModalOpen}
        onClose={() => setCartModalOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onUpdateSize={handleUpdateCartSize}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => {
          setCartItems([]);
          void syncCustomerStateToServer(wishlistProductIds, []);
        }}
        onCompleteCheckout={handleCompleteCartCheckout}
        onViewOrders={() => {
          setCartModalOpen(false);
          handleNavigateStorefrontTab('orders');
        }}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        products={products}
        tailors={tailors}
        designs={designs}
        onSelectProduct={(p) => {
          handleSelectProduct(p);
          setSearchModalOpen(false);
        }}
        onSelectTailor={(t) => {
          setSelectedTailor(t);
          setActiveTab('tailors');
          setSearchModalOpen(false);
        }}
        onSelectDesign={(d) => {
          setActiveDesign(d);
          setActiveTab('design-viewer');
          setSearchModalOpen(false);
        }}
        onSelectCategory={() => {
          setActiveTab('marketplace');
          setSearchModalOpen(false);
        }}
      />

      {/* Notifications Modal */}
      <NotificationsModal
        isOpen={notificationsModalOpen}
        onClose={() => setNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAsRead={handleMarkNotificationAsRead}
        onMarkAllAsRead={handleMarkAllNotificationsAsRead}
        onClearAll={handleClearNotifications}
        onNotificationClick={(notif) => {
          if (notif.actionUrl === '/orders') handleNavigateStorefrontTab('orders');
          else if (notif.actionUrl === '/quotes') handleNavigateStorefrontTab('quotes');
          setNotificationsModalOpen(false);
        }}
      />

      {/* Measurement Profile Modal */}
      <MeasurementSheetModal
        isOpen={measurementsModalOpen}
        onClose={() => setMeasurementsModalOpen(false)}
        measurements={measurements}
        onSaveMeasurements={handleSaveMeasurements}
        initialGender={gender}
      />

      {/* Style Chat Modal */}
      <StyleChatModal
        isOpen={chatOpen}
        onClose={() => setChatOpen(false)}
        tailorName={activeChatRecipient?.name || 'Master Tailor'}
        tailorAvatar={activeChatRecipient?.avatar}
        customerName={currentUser?.name || customerProfile?.name || 'Customer'}
        customerAvatar={currentUser?.avatar || customerProfile?.avatar}
        measurements={measurements}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        onOpenFabricLibrary={() => setFabricLibraryOpen(true)}
      />

      {/* High-End Fabric Library Modal */}
      <FabricLibraryModal
        isOpen={fabricLibraryOpen}
        onClose={() => setFabricLibraryOpen(false)}
        tailorName={activeChatRecipient?.name || orders[0]?.tailorName || 'Ustad Rafiq Ahmed'}
        onRequestSwatch={handleRequestSwatchFromLibrary}
        onApplyFabricToStudio={(fab) => {
          handleStartCustomizerFromPrompt(
            `Bespoke couture piece crafted in ${fab.name} (${fab.weightGsm} GSM, ${fab.composition}) in ${fab.colorTone}`
          );
        }}
      />

      {/* Spec Sheet Export Modal */}
      <SpecSheetExportModal
        isOpen={specSheetOpen}
        onClose={() => setSpecSheetOpen(false)}
        variation={specSheetVariation}
        measurements={measurements}
      />

      {/* Customer Authentication Modal */}
      <AuthModal
        isOpen={customerAuthModalOpen}
        onClose={() => {
          pendingAuthActionRef.current = null;
          pendingReturnTabRef.current = null;
          setCustomerAuthModalOpen(false);
        }}
        onLoginSuccess={handleLoginSuccess}
        initialRole="CUSTOMER"
        onSwitchToDesignerPortal={() => {
          setCustomerAuthModalOpen(false);
          navigateToPortal('designer', '/designer/login');
        }}
      />

      {/* User Profile & Wallet Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        user={currentUser}
        onUpdateUser={async (updated) => {
          try {
            const res = await apiClient.updateCustomerProfile({
              name: updated.name,
              city: updated.city,
              avatar: updated.avatar,
              savedAddresses: updated.savedAddresses
            });
            setCurrentUser(res.user);
          } catch {
            setCurrentUser(updated);
          }
        }}
        onLogout={handleLogout}
        onSwitchUser={() => {
          setProfileModalOpen(false);
          setCustomerAuthModalOpen(true);
        }}
      />

      {/* UPI Escrow Payment Modal */}
      {selectedQuoteForPayment && (
        <UPIPaymentModal
          isOpen={upiModalOpen}
          onClose={() => {
            setUpiModalOpen(false);
            setSelectedQuoteForPayment(null);
          }}
          quote={{
            ...selectedQuoteForPayment.quote,
            totalAmount:
              selectedQuoteForPayment.quote.agreedAmount ||
              selectedQuoteForPayment.quote.totalAmount
          }}
          designName={selectedQuoteForPayment.request.variation?.name || 'Couture Garment'}
          designImage={selectedQuoteForPayment.request.variation?.frontImageUrl || ''}
          onPaymentSuccess={handleCompleteEscrowPayment}
        />
      )}

      {/* Global Product Details View */}
      <ProductDetailModal
        product={selectedMarketplaceProduct}
        isOpen={Boolean(selectedMarketplaceProduct)}
        onClose={() => setSelectedMarketplaceProduct(null)}
        isWishlisted={Boolean(
          selectedMarketplaceProduct &&
            wishlistProductIds.includes(selectedMarketplaceProduct.id)
        )}
        onToggleWishlist={handleToggleWishlist}
        onAddToCart={handleAddToCart}
        onBuyNow={(prod, size) => {
          handleAddToCart(prod, size);
          setSelectedMarketplaceProduct(null);
          setCartModalOpen(true);
        }}
        onRequestCustomStitch={(prod) => {
          setSelectedMarketplaceProduct(null);
          handleStartCustomizerFromPrompt(
            `Custom couture variation of ${prod.title} in ${prod.fabric}`,
            prod.category as any
          );
        }}
        onChatSeller={(designerName) => {
          setSelectedMarketplaceProduct(null);
          const tailor =
            tailors.find((t) =>
              t.name.toLowerCase().includes(designerName.toLowerCase().slice(0, 4))
            ) || tailors[0];
          handleOpenChat(tailor.id, tailor.name);
        }}
      />

      {/* Global Shopping Action Toast Notification */}
      <ShoppingToast
        toast={shoppingToast}
        onClose={() => setShoppingToast(null)}
      />
    </div>
  );
}
