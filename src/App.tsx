/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
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
import { TailorVerificationModal } from './components/Tailor/TailorVerificationModal';
import { AdminDashboard } from './components/Admin/AdminDashboard';
import { SpecSheetExportModal } from './components/SpecSheetExportModal';
import { AuthModal } from './components/Auth/AuthModal';
import { UserProfileModal } from './components/Customer/UserProfileModal';
import { UPIPaymentModal } from './components/Customer/UPIPaymentModal';
import { FabricLibraryModal } from './components/Customer/FabricLibraryModal';
import { CartCheckoutModal } from './components/Customer/CartCheckoutModal';

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

import {
  INITIAL_TAILORS,
  INITIAL_DRESS_DESIGNS,
  INITIAL_QUOTATION_REQUESTS,
  INITIAL_ORDERS,
  INITIAL_MEASUREMENTS,
  INITIAL_CUSTOMER_PROFILE,
  INITIAL_CHAT_MESSAGES,
  INITIAL_ANALYTICS,
  DEMO_USERS,
  MARKETPLACE_PRODUCTS,
  INITIAL_NOTIFICATIONS
} from './data/mockData';
import { offlineSyncManager } from './services/offlineSync';
import { pushNotificationService, DevicePushNotification } from './services/pushNotificationService';

type PortalMode = 'storefront' | 'designer' | 'admin';

function resolveInitialPortal(): PortalMode {
  const path = window.location.pathname.toLowerCase();
  if (path.startsWith('/designer')) return 'designer';
  if (path.startsWith('/admin')) return 'admin';
  return 'storefront';
}

export default function App() {
  // Public Website by default — No user logged in initially
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [portalMode, setPortalMode] = useState<PortalMode>(resolveInitialPortal);

  // Auth & Checkout Modals
  const [customerAuthModalOpen, setCustomerAuthModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [upiModalOpen, setUpiModalOpen] = useState<boolean>(false);
  const [cartModalOpen, setCartModalOpen] = useState<boolean>(false);
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState<{
    request: QuotationRequest;
    quote: TailorQuotation;
  } | null>(null);

  // Pending action queued when an unauthenticated visitor clicks a protected action
  const pendingAuthActionRef = useRef<((user: AuthUser) => void) | null>(null);

  // Storefront Navigation & Category State
  const [activeTab, setActiveTab] = useState<string>('home');
  const [activeCategory, setActiveCategory] = useState<StorefrontCategory | undefined>(undefined);
  const [gender, setGender] = useState<'women' | 'men'>('women');

  // Sync URL path changes (/designer/login, /admin/login, /)
  useEffect(() => {
    const handlePopState = () => {
      setPortalMode(resolveInitialPortal());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigateToPortal = (nextPortal: PortalMode) => {
    setPortalMode(nextPortal);
    try {
      if (nextPortal === 'designer') {
        window.history.pushState({}, '', '/designer/login');
      } else if (nextPortal === 'admin') {
        window.history.pushState({}, '', '/admin/login');
      } else {
        window.history.pushState({}, '', '/');
      }
    } catch {}
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Protected action wrapper for Customer shopping & studio flows
  const requireCustomerAuth = (action: (user: AuthUser) => void) => {
    if (currentUser) {
      action(currentUser);
    } else {
      pendingAuthActionRef.current = action;
      setCustomerAuthModalOpen(true);
    }
  };

  // Seed initial negotiation history so the multi-round bargaining workflow is inspectable
  const seededQuotationRequests: QuotationRequest[] = INITIAL_QUOTATION_REQUESTS.map((req, rIdx) => {
    if (rIdx !== 0) return req;
    return {
      ...req,
      targetBudget: req.targetBudget || 4000,
      quotations: req.quotations.map((q, qIdx) => {
        if (qIdx !== 0) return q;
        return {
          ...q,
          totalAmount: 4800,
          customerAgreed: false,
          designerAgreed: true,
          negotiationHistory: [
            {
              id: 'neg-seed-1',
              senderRole: 'customer',
              senderName: req.customerName || 'Ananya Verma',
              amount: 4000,
              note: 'Customer initial target budget for custom Banarasi silk tailoring.',
              isFinalOffer: false,
              status: 'COUNTERED',
              timestamp: '2026-08-18T09:15:00.000Z'
            },
            {
              id: 'neg-seed-2',
              senderRole: 'tailor',
              senderName: q.tailorName,
              amount: 5500,
              note: 'Designer quotation including hand dabka zardozi border and pure silk lining.',
              isFinalOffer: false,
              status: 'COUNTERED',
              timestamp: '2026-08-18T11:30:00.000Z'
            },
            {
              id: 'neg-seed-3',
              senderRole: 'customer',
              senderName: req.customerName || 'Ananya Verma',
              amount: 4500,
              note: 'Customer counteroffer — can we simplify the back tassel detailing to fit ₹4,500?',
              isFinalOffer: false,
              status: 'COUNTERED',
              timestamp: '2026-08-18T14:10:00.000Z'
            },
            {
              id: 'neg-seed-4',
              senderRole: 'tailor',
              senderName: q.tailorName,
              amount: 4800,
              note: 'Designer final offer: ₹4,800 with full front & sleeve zardozi intact. Ready to begin.',
              isFinalOffer: true,
              status: 'PROPOSED',
              timestamp: '2026-08-18T16:00:00.000Z'
            }
          ]
        };
      })
    };
  });

  // Domain State
  const [designs, setDesigns] = useState<DressDesign[]>(INITIAL_DRESS_DESIGNS);
  const [activeDesign, setActiveDesign] = useState<DressDesign | null>(null);
  const [tailors, setTailors] = useState<TailorProfile[]>(INITIAL_TAILORS);
  const [activeTailorId, setActiveTailorId] = useState<string>(INITIAL_TAILORS[0].id);
  const [selectedTailor, setSelectedTailor] = useState<TailorProfile | null>(null);
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>(seededQuotationRequests);
  const [orders, setOrders] = useState<Order[]>(
    INITIAL_ORDERS.map((o, idx) => ({
      ...o,
      designerOrderStatus: o.designerOrderStatus || (idx === 0 ? 'In Production' : 'Quality Check')
    }))
  );
  const [measurements, setMeasurements] = useState<MeasurementSheet>(INITIAL_MEASUREMENTS);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(INITIAL_CUSTOMER_PROFILE);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(INITIAL_ANALYTICS);

  // Marketplace, Shopping Bag & Notifications State
  const [products, setProducts] = useState<MarketplaceProduct[]>(
    MARKETPLACE_PRODUCTS.map((p) => ({
      ...p,
      moderationStatus: p.moderationStatus || 'APPROVED',
      stockCount: p.stockCount ?? 5,
      backImageUrl: p.backImageUrl || p.images?.[0],
      sideImageUrl: p.sideImageUrl || p.images?.[0]
    }))
  );
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState<boolean>(false);

  // Admin Governance State
  const [commissionRate, setCommissionRate] = useState<number>(8);
  const [disputes, setDisputes] = useState<DisputeRecord[]>([
    {
      id: 'disp-101',
      orderId: INITIAL_ORDERS[0]?.id || 'ord-8801',
      orderNumber: INITIAL_ORDERS[0]?.orderNumber || 'ORD-8801',
      customerName: 'Ananya Verma',
      tailorName: 'Ustad Rafiq Ahmed',
      reason: 'Sleeve embroidery shade slightly deeper gold than digital swatch.',
      amountINR: 18500,
      status: 'OPEN',
      createdAt: '2026-08-19'
    }
  ]);
  const [auditLogs, setAuditLogs] = useState<ApprovalAuditLog[]>([
    {
      id: 'log-1',
      tailorId: 'tailor-1',
      tailorName: 'Ustad Rafiq Ahmed',
      action: 'APPROVED',
      adminNote: 'Verified Master Artisan Card, GSTIN, and bridal zardozi portfolio.',
      timestamp: '2026-08-10 11:20 AM'
    }
  ]);

  // Generator prefill state
  const [generatorPrefill, setGeneratorPrefill] = useState<{ prompt?: string; dressType?: DressType }>({});

  // Modals State
  const [measurementsModalOpen, setMeasurementsModalOpen] = useState<boolean>(false);
  const [fabricLibraryOpen, setFabricLibraryOpen] = useState<boolean>(false);
  const [tailorVerificationModalOpen, setTailorVerificationModalOpen] = useState<boolean>(false);
  const [specSheetOpen, setSpecSheetOpen] = useState<boolean>(false);
  const [specSheetVariation, setSpecSheetVariation] = useState<DressDesignVariation | null>(null);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [activeChatRecipient, setActiveChatRecipient] = useState<{ id: string; name: string; avatar?: string }>({
    id: INITIAL_TAILORS[0].id,
    name: INITIAL_TAILORS[0].name,
    avatar: INITIAL_TAILORS[0].avatar
  });
  const [activePushBanner, setActivePushBanner] = useState<DevicePushNotification | null>(null);

  const currentTailorProfile = tailors.find((t) => t.id === activeTailorId) || tailors[0];

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

  // Save snapshots for persistence
  useEffect(() => {
    offlineSyncManager.saveSnapshot('designs', designs);
  }, [designs]);

  useEffect(() => {
    offlineSyncManager.saveSnapshot('orders', orders);
  }, [orders]);

  useEffect(() => {
    offlineSyncManager.saveSnapshot('measurements', measurements);
  }, [measurements]);

  useEffect(() => {
    offlineSyncManager.saveSnapshot('quotationRequests', quotationRequests);
  }, [quotationRequests]);

  // Storefront Tab Navigation with Auth Guards for Personal Account Views
  const handleNavigateStorefrontTab = (tab: string) => {
    const protectedTabs = ['orders', 'profile', 'wardrobe', 'quotes'];
    if (protectedTabs.includes(tab) && !currentUser) {
      requireCustomerAuth(() => {
        setActiveTab(tab);
        if (tab !== 'design-viewer') setActiveDesign(null);
      });
      return;
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
  const handleLoginSuccess = (user: AuthUser, newTailorApplication?: TailorProfile) => {
    if (newTailorApplication) {
      setTailors((prev) => [newTailorApplication, ...prev]);
      setActiveTailorId(newTailorApplication.id);
    } else if (user.tailorProfileId) {
      setActiveTailorId(user.tailorProfileId);
    }

    setCurrentUser(user);

    if (user.role === 'customer') {
      setCustomerProfile((prev) => ({
        ...prev,
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        city: user.city
      }));

      // If the customer had a pending action (e.g., Add to Bag, Save Design, Generate Dress, View Orders), resume it immediately!
      if (pendingAuthActionRef.current) {
        const queued = pendingAuthActionRef.current;
        pendingAuthActionRef.current = null;
        queued(user);
      }
    } else if (user.role === 'tailor') {
      navigateToPortal('designer');
    } else if (user.role === 'admin') {
      navigateToPortal('admin');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('pearl_pick_session_token');
      localStorage.removeItem('pearl_pick_session_user');
    } catch {}
    if (portalMode !== 'storefront') {
      navigateToPortal('storefront');
    }
    setActiveTab('home');
  };

  // Shopping Bag Handlers (Require customer authentication when adding to account bag)
  const handleAddToCart = (product: MarketplaceProduct, selectedSize: string) => {
    requireCustomerAuth(() => {
      setCartItems((prev) => {
        const existing = prev.find(
          (item) => item.product.id === product.id && item.selectedSize === selectedSize
        );
        if (existing) {
          return prev.map((item) =>
            item.id === existing.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        }
        return [
          ...prev,
          {
            id: `cart-${Date.now()}`,
            product,
            selectedSize,
            quantity: 1,
            addedAt: new Date().toISOString()
          }
        ];
      });
      setCartModalOpen(true);
    });
  };

  const handleUpdateCartQuantity = (cartItemId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((item) =>
          item.id === cartItemId ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const handleUpdateCartSize = (cartItemId: string, newSize: string) => {
    setCartItems((prev) =>
      prev.map((item) => (item.id === cartItemId ? { ...item, selectedSize: newSize } : item))
    );
  };

  const handleRemoveCartItem = (cartItemId: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== cartItemId));
  };

  const handleCompleteCartCheckout = (
    paymentMethod: string,
    shippingAddress: string,
    transactionId: string
  ) => {
    const newOrders: Order[] = cartItems.map((item, idx) => ({
      id: `ord-${Date.now().toString().slice(-5)}-${idx}`,
      orderNumber: `ORD-${Date.now().toString().slice(-5)}${idx}`,
      orderType: 'ready-to-wear',
      customerId: customerProfile.id,
      customerName: currentUser?.name || customerProfile.name,
      tailorId: item.product.designerId || 'tailor-1',
      tailorName: item.product.designerName,
      tailorShopName: item.product.designerName,
      tailorAvatar: item.product.designerAvatar || tailors[0].avatar,
      totalAmount: item.product.price * item.quantity,
      paidAmount: item.product.price * item.quantity,
      currency: 'INR',
      status: 'QUOTATION_ACCEPTED',
      designerOrderStatus: 'In Production',
      currentStage: 'FABRIC_SOURCING',
      escrowStatus: 'SECURED_IN_ESCROW',
      escrowVaultId: transactionId,
      shippingAddress,
      milestones: [
        {
          id: `ms-${Date.now()}-${idx}-1`,
          orderId: `ord-${Date.now().toString().slice(-5)}-${idx}`,
          stage: 'FABRIC_SOURCING',
          title: `${item.product.title} (Size ${item.selectedSize} × ${item.quantity})`,
          label: `${item.product.title} (Size ${item.selectedSize})`,
          description: `Atelier finishing & steam pressing in ${item.product.fabric}`,
          status: 'IN_PROGRESS'
        },
        {
          id: `ms-${Date.now()}-${idx}-2`,
          orderId: `ord-${Date.now().toString().slice(-5)}-${idx}`,
          stage: 'QUALITY_INSPECTION',
          title: 'Quality Check & Dispatch',
          label: 'Quality Check & Dispatch',
          description: `Shipping to: ${shippingAddress}`,
          status: 'PENDING'
        }
      ],
      estimatedDeliveryDate: '2026-09-25',
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    }));

    setOrders((prev) => [...newOrders, ...prev]);
    setCartItems([]);
    setCartModalOpen(false);
    setActiveTab('orders');
  };

  // Handlers for AI Dress Studio & Custom Ordering (Protected on generate/save/order)
  const handleDesignGenerated = (newDesign: DressDesign) => {
    requireCustomerAuth(() => {
      setDesigns((prev) => [newDesign, ...prev]);
      setActiveDesign(newDesign);
      setActiveTab('design-viewer');
      setAnalytics((prev) => ({
        ...prev,
        totalDressDesignsGenerated: prev.totalDressDesignsGenerated + 1
      }));
      offlineSyncManager.enqueue('DESIGN_SAVED', `Couture: ${newDesign.title}`, newDesign);
    });
  };

  const handleToggleFavorite = (designId: string) => {
    requireCustomerAuth(() => {
      setDesigns((prev) =>
        prev.map((d) => (d.id === designId ? { ...d, isFavorite: !d.isFavorite } : d))
      );
      if (activeDesign && activeDesign.id === designId) {
        setActiveDesign({ ...activeDesign, isFavorite: !activeDesign.isFavorite });
      }
    });
  };

  const handleDeleteDesign = (designId: string) => {
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
    requireCustomerAuth((authedUser) => {
      const chosenTailor = tailors.find((t) => t.id === preferredTailorId) || tailors[0];
      const reqId = `req-${Date.now()}`;
      const initialDesignerQuoteAmount = Math.round(targetBudget * 1.15);

      const newRequest: QuotationRequest = {
        id: reqId,
        customerId: authedUser.id,
        customerName: authedUser.name,
        customerAvatar: authedUser.avatar,
        designId: design.id,
        variation: variation,
        measurementsId: measurements.id,
        selectedStandardSize,
        preferredTailorId: chosenTailor.id,
        preferredTailorName: chosenTailor.name,
        targetBudget,
        neededByDate,
        specificInstructions,
        createdAt: new Date().toISOString(),
        status: 'NEGOTIATING',
        quotations: [
          {
            id: `quote-${Date.now()}-1`,
            requestId: reqId,
            tailorId: chosenTailor.id,
            tailorName: chosenTailor.name,
            tailorShopName: chosenTailor.shopName,
            tailorAvatar: chosenTailor.avatar,
            tailorRating: chosenTailor.rating,
            totalAmount: initialDesignerQuoteAmount,
            currency: 'INR',
            estimatedDeliveryDays: 14,
            proposedDeliveryDate: neededByDate,
            tailorMessage: `We have reviewed your 3-view Front, Back & Side specifications for ${variation.name}. Our quotation includes hand-selected ${variation.specs.fabric} and bespoke finishing.`,
            fabricIncluded: true,
            status: 'NEGOTIATING',
            customerAgreed: false,
            designerAgreed: true,
            negotiationHistory: [
              {
                id: `neg-${Date.now()}-1`,
                senderRole: 'customer',
                senderName: authedUser.name,
                amount: targetBudget,
                note: `Customer preferred budget (${selectedStandardSize ? `Size: ${selectedStandardSize}` : '14-Point Custom Fit'}).`,
                isFinalOffer: false,
                status: 'COUNTERED',
                timestamp: new Date(Date.now() - 60000).toISOString()
              },
              {
                id: `neg-${Date.now()}-2`,
                senderRole: 'tailor',
                senderName: chosenTailor.name,
                amount: initialDesignerQuoteAmount,
                note: `Initial quotation from ${chosenTailor.shopName} including pure ${variation.specs.fabric} & handwork.`,
                isFinalOffer: false,
                status: 'PROPOSED',
                timestamp: new Date().toISOString()
              }
            ],
            items: [
              { id: 'item-1', description: `Pure ${variation.specs.fabric}`, amount: Math.round(initialDesignerQuoteAmount * 0.45), category: 'Fabric' },
              { id: 'item-2', description: 'Master Pattern Drafting & Tailoring', amount: Math.round(initialDesignerQuoteAmount * 0.35), category: 'Stitching' },
              { id: 'item-3', description: `Artisanal ${variation.specs.pattern}`, amount: Math.round(initialDesignerQuoteAmount * 0.15), category: 'Embroidery & Handwork' },
              { id: 'item-4', description: 'Steam Pressing & Couture Packaging', amount: Math.round(initialDesignerQuoteAmount * 0.05), category: 'Finishing' }
            ],
            milestones: [
              { title: 'Pattern Muslin & Fabric Sourced', percentage: 30, description: 'Fabric purchase & toile cut' },
              { title: 'First Baste Fitting', percentage: 40, description: 'Baste fitting & adjustments' },
              { title: 'Final Hand Finishing & Delivery', percentage: 30, description: 'Hand finishing and delivery' }
            ],
            createdAt: new Date().toISOString()
          }
        ]
      };

      setQuotationRequests((prev) => [newRequest, ...prev]);
      setActiveTab('quotes');
      offlineSyncManager.enqueue('QUOTE_REQUESTED', `Quotation broadcast for ${design.title}`, newRequest);
    });
  };

  // Multi-Round Price Negotiation Handlers
  const handleSendCounterOffer = (
    requestId: string,
    quoteId: string,
    amount: number,
    note: string,
    senderRole: 'customer' | 'tailor',
    isFinalOffer?: boolean
  ) => {
    setQuotationRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          status: 'NEGOTIATING',
          quotations: req.quotations.map((q) => {
            if (q.id !== quoteId) return q;
            const newOffer: NegotiationOffer = {
              id: `neg-${Date.now()}`,
              senderRole,
              senderName:
                senderRole === 'customer'
                  ? currentUser?.name || req.customerName || customerProfile.name
                  : q.tailorName,
              amount,
              note,
              isFinalOffer: Boolean(isFinalOffer),
              status: 'PROPOSED',
              timestamp: new Date().toISOString()
            };
            const updatedHistory = (q.negotiationHistory || []).map((h) => ({
              ...h,
              status: 'COUNTERED' as const
            }));
            return {
              ...q,
              totalAmount: amount,
              status: 'NEGOTIATING',
              customerAgreed: senderRole === 'customer',
              designerAgreed: senderRole === 'tailor',
              negotiationHistory: [...updatedHistory, newOffer]
            };
          })
        };
      })
    );
  };

  const handleAgreeToPrice = (requestId: string, quoteId: string, party: 'customer' | 'tailor') => {
    setQuotationRequests((prev) =>
      prev.map((req) => {
        if (req.id !== requestId) return req;
        return {
          ...req,
          quotations: req.quotations.map((q) => {
            if (q.id !== quoteId) return q;
            const nextCustomerAgreed = party === 'customer' ? true : Boolean(q.customerAgreed);
            const nextDesignerAgreed = party === 'tailor' ? true : Boolean(q.designerAgreed);
            const bothAgreed = nextCustomerAgreed && nextDesignerAgreed;
            const updatedHistory = (q.negotiationHistory || []).map((h, idx, arr) =>
              idx === arr.length - 1 ? { ...h, status: 'ACCEPTED' as const } : h
            );
            return {
              ...q,
              customerAgreed: nextCustomerAgreed,
              designerAgreed: nextDesignerAgreed,
              agreedAmount: bothAgreed ? q.totalAmount : q.agreedAmount,
              status: bothAgreed ? 'MUTUALLY_AGREED' : q.status,
              negotiationHistory: updatedHistory
            };
          })
        };
      })
    );
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
    });
  };

  const handleCompleteEscrowPayment = (_method: string, txnId: string) => {
    if (!selectedQuoteForPayment) return;
    const { request, quote } = selectedQuoteForPayment;
    const finalPrice = quote.agreedAmount || quote.totalAmount;

    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      orderType: 'tailor',
      customerId: request.customerId,
      customerName: request.customerName,
      tailorId: quote.tailorId,
      tailorName: quote.tailorName,
      tailorShopName: quote.tailorShopName || 'Master Atelier',
      tailorAvatar: quote.tailorAvatar,
      design: request.variation,
      variation: request.variation,
      totalAmount: finalPrice,
      paidAmount: finalPrice,
      currency: quote.currency || 'INR',
      status: 'QUOTATION_ACCEPTED',
      designerOrderStatus: 'In Production',
      currentStage: 'FABRIC_SOURCING',
      escrowStatus: 'SECURED_IN_ESCROW',
      escrowVaultId: txnId || `BHARAT-ESCROW-${Date.now().toString().slice(-6)}`,
      milestones: quote.milestones.map((m, idx) => ({
        id: `ms-${Date.now()}-${idx}`,
        orderId: `ord-${Date.now().toString().slice(-6)}`,
        stage: (idx === 0 ? 'FABRIC_SOURCING' : idx === 1 ? 'FIRST_FITTING' : 'FINAL_STITCHING') as any,
        title: m.title,
        label: m.title,
        description: m.description,
        status: idx === 0 ? 'IN_PROGRESS' : 'PENDING'
      })),
      estimatedDeliveryDate: quote.proposedDeliveryDate,
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setOrders([newOrder, ...orders]);
    setQuotationRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? {
              ...r,
              status: 'ACCEPTED',
              acceptedQuoteId: quote.id
            }
          : r
      )
    );

    setActiveTab('orders');
    setSelectedQuoteForPayment(null);
    setUpiModalOpen(false);
  };

  // Enforced 7-Step Designer Order Status Transition Handler
  const handleAdvanceOrderStatus = (orderId: string, nextStatus: DesignerOrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        return {
          ...o,
          designerOrderStatus: nextStatus,
          status:
            nextStatus === 'Delivered'
              ? 'DELIVERED'
              : nextStatus === 'Shipped'
              ? 'DISPATCHED'
              : 'IN_PRODUCTION',
          escrowStatus: nextStatus === 'Delivered' ? 'RELEASED' : o.escrowStatus
        };
      })
    );
  };

  const handleAdvanceMilestone = (orderId: string, milestoneId: string, photoProofUrl?: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const targetMilestone = targetOrder?.milestones.find(
      (m, idx) => (m.id || m.stage || String(idx)) === milestoneId
    );

    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        let nextPendingFound = false;
        const updatedMilestones = order.milestones.map((m, idx) => {
          const mKey = m.id || m.stage || String(idx);
          if (mKey === milestoneId) {
            const newPhoto: MilestoneProgressPhoto | null = photoProofUrl
              ? {
                  id: `pp-${Date.now()}`,
                  url: photoProofUrl,
                  caption: `Completed ${m.title || m.label || m.stage} — verified in atelier.`,
                  uploadedAt: new Date().toISOString(),
                  uploadedBy: order.tailorName,
                  stageLabel: m.title || m.label || m.stage
                }
              : null;

            return {
              ...m,
              status: 'COMPLETED' as const,
              completed: true,
              completedAt: new Date().toISOString(),
              photoUrl: photoProofUrl || m.photoUrl,
              photoProof: photoProofUrl || m.photoProof,
              photoProofUrl: photoProofUrl || m.photoProofUrl,
              progressPhotos: newPhoto
                ? [...(m.progressPhotos || []), newPhoto]
                : m.progressPhotos
            };
          }
          if (m.status === 'PENDING' && !nextPendingFound) {
            nextPendingFound = true;
            return {
              ...m,
              status: 'IN_PROGRESS' as const
            };
          }
          return m;
        });

        return {
          ...order,
          milestones: updatedMilestones
        };
      })
    );

    if (targetOrder) {
      const milestoneTitle =
        targetMilestone?.title || targetMilestone?.label || targetMilestone?.stage || 'First Fitting Complete';
      pushNotificationService.sendMilestonePushNotification({
        orderId: targetOrder.id,
        orderNumber: targetOrder.orderNumber || targetOrder.id,
        garmentTitle: targetOrder.variation?.name || targetOrder.design?.name || 'Bespoke Garment',
        tailorName: targetOrder.tailorName,
        tailorAvatar: targetOrder.tailorAvatar,
        milestoneId,
        milestoneTitle,
        status: 'COMPLETED',
        photoUrl: photoProofUrl || targetMilestone?.photoUrl || targetMilestone?.photoProof
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

    const targetOrder = orders.find((o) => o.id === orderId);

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
            completedAt: isNowCompleted ? (m.completedAt || new Date().toISOString()) : m.completedAt,
            photoUrl: createdPhoto.url,
            photoProof: createdPhoto.url,
            photoProofUrl: createdPhoto.url,
            tailorNote: createdPhoto.caption,
            progressPhotos: [...(m.progressPhotos || []), createdPhoto]
          };
        });

        return {
          ...order,
          milestones: updatedMilestones
        };
      })
    );

    if (targetOrder) {
      pushNotificationService.sendMilestonePushNotification({
        orderId: targetOrder.id,
        orderNumber: targetOrder.orderNumber || targetOrder.id,
        garmentTitle: targetOrder.variation?.name || targetOrder.design?.name || 'Bespoke Garment',
        tailorName: photo.uploadedBy || targetOrder.tailorName,
        tailorAvatar: targetOrder.tailorAvatar,
        milestoneId,
        milestoneTitle: photo.stageLabel || 'Milestone Update',
        status: markStatus || 'COMPLETED',
        note: photo.caption,
        photoUrl: createdPhoto.url
      });
    }
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
          return {
            ...m,
            customerRating: rating
          };
        });
        return {
          ...order,
          milestones: updatedMilestones
        };
      })
    );
  };

  const handleSubmitReview = (
    orderId: string,
    tailorId: string,
    reviewData: Omit<Review, 'id' | 'createdAt'>
  ) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };

    const ratingVal = reviewData.overallRating || reviewData.ratingOverall || 5;

    setTailors((prev) =>
      prev.map((t) =>
        t.id === tailorId
          ? {
              ...t,
              rating: Number(
                (((t.rating * (t.reviewCount || 1)) + ratingVal) / ((t.reviewCount || 1) + 1)).toFixed(1)
              ),
              reviewCount: (t.reviewCount || 0) + 1,
              reviews: [newReview, ...(t.reviews || [])]
            }
          : t
      )
    );

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'DELIVERED',
              designerOrderStatus: 'Delivered',
              escrowStatus: 'RELEASED'
            }
          : o
      )
    );
  };

  const handleConfirmOrderDelivery = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: 'DELIVERED',
              designerOrderStatus: 'Delivered',
              escrowStatus: 'RELEASED'
            }
          : o
      )
    );
  };

  const handleSendMessage = (
    content: string,
    type: 'TEXT' | 'IMAGE' | 'MEASUREMENT_CARD' | 'FABRIC_SWATCH' = 'TEXT'
  ) => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      orderId: orders[0]?.id || 'ord-1',
      senderId:
        portalMode === 'storefront'
          ? currentUser?.id || customerProfile?.id || 'cust-1'
          : activeChatRecipient?.id || 'tailor-1',
      senderName:
        portalMode === 'storefront'
          ? currentUser?.name || customerProfile?.name || 'Customer'
          : activeChatRecipient?.name || 'Master Tailor',
      senderRole: portalMode === 'storefront' ? 'customer' : 'tailor',
      text: content,
      content,
      type,
      timestamp: new Date().toISOString(),
      isRead: true
    };
    setChatMessages((prev) => [...prev, newMsg]);
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
    requireCustomerAuth((authedUser) => {
      const messageBody = customNote
        ? `Swatch Request for ${fabric.name} (${fabric.weightGsm} GSM) — "${customNote}"`
        : `Please share a physical feeler swatch & daylight macro video of ${fabric.name} (${fabric.weightGsm} GSM, ${fabric.colorTone}).`;

      const swatchMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        orderId: orders[0]?.id || 'ord-8801',
        senderId: authedUser.id,
        senderName: authedUser.name,
        senderRole: 'customer',
        receiverId: activeChatRecipient?.id || 'tailor-1',
        text: messageBody,
        content: messageBody,
        type: 'FABRIC_SWATCH',
        attachmentType: 'swatch',
        attachmentData: {
          title: `${fabric.name} — ${fabric.colorTone}`,
          hex: fabric.hex,
          weight: `${fabric.weightGsm} GSM`,
          composition: fabric.composition,
          origin: fabric.origin,
          imageUrl: fabric.imageUrl,
          pricePerMeterINR: fabric.pricePerMeterINR
        },
        timestamp: new Date().toISOString(),
        isRead: true
      };

      setChatMessages((prev) => [...prev, swatchMsg]);
      setFabricLibraryOpen(false);
      setChatOpen(true);
    });
  };

  const handleOpenSpecSheet = (variation: DressDesignVariation) => {
    setSpecSheetVariation(variation);
    setSpecSheetOpen(true);
  };

  // Designer Product Showcase CRUD
  const handleAddProduct = (newProduct: Omit<MarketplaceProduct, 'id'>) => {
    const created: MarketplaceProduct = {
      ...newProduct,
      id: `prod-${Date.now()}`
    };
    setProducts((prev) => [created, ...prev]);
  };

  const handleUpdateProduct = (updated: MarketplaceProduct) => {
    setProducts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleUpdateTailorProfile = (updated: TailorProfile) => {
    setTailors((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  };

  const handleTailorSubmitKYC = (docs: TailorVerificationDocument[]) => {
    setTailors((prev) =>
      prev.map((t) =>
        t.id === currentTailorProfile.id
          ? {
              ...t,
              verificationStatus: 'UNDER_REVIEW',
              verificationDocuments: docs
            }
          : t
      )
    );
  };

  // Admin Governance Actions
  const appendAuditLog = (
    tailorId: string,
    action: ApprovalAuditLog['action'],
    adminNote: string
  ) => {
    const t = tailors.find((item) => item.id === tailorId);
    setAuditLogs((prev) => [
      {
        id: `log-${Date.now()}`,
        tailorId,
        tailorName: t?.name || 'Designer',
        action,
        adminNote,
        timestamp: new Date().toLocaleString()
      },
      ...prev
    ]);
  };

  const handleApproveTailor = (tailorId: string) => {
    setTailors((prev) =>
      prev.map((t) =>
        t.id === tailorId
          ? {
              ...t,
              verificationStatus: 'VERIFIED',
              badge: 'Master Atelier'
            }
          : t
      )
    );
    appendAuditLog(tailorId, 'APPROVED', 'Application, portfolio & verification approved by Admin.');
    setAnalytics((prev) => ({
      ...prev,
      verifiedTailorsCount: prev.verifiedTailorsCount + 1
    }));
  };

  const handleRejectTailor = (tailorId: string, reason: string) => {
    setTailors((prev) =>
      prev.map((t) =>
        t.id === tailorId
          ? {
              ...t,
              verificationStatus: 'REJECTED'
            }
          : t
      )
    );
    appendAuditLog(tailorId, 'REJECTED', reason);
  };

  const handleRequestTailorInfo = (tailorId: string, message: string) => {
    setTailors((prev) =>
      prev.map((t) =>
        t.id === tailorId
          ? {
              ...t,
              verificationStatus: 'INFO_REQUESTED'
            }
          : t
      )
    );
    appendAuditLog(tailorId, 'INFO_REQUESTED', message);
  };

  const handleToggleSuspendTailor = (tailorId: string) => {
    const target = tailors.find((t) => t.id === tailorId);
    const willSuspend = target?.verificationStatus !== 'SUSPENDED';
    setTailors((prev) =>
      prev.map((t) =>
        t.id === tailorId
          ? {
              ...t,
              verificationStatus: willSuspend ? 'SUSPENDED' : 'VERIFIED'
            }
          : t
      )
    );
    appendAuditLog(
      tailorId,
      willSuspend ? 'SUSPENDED' : 'REACTIVATED',
      willSuspend ? 'Account suspended by platform governance.' : 'Account reactivated.'
    );
  };

  const handleModerateProduct = (productId: string, status: 'APPROVED' | 'FLAGGED' | 'REMOVED') => {
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, moderationStatus: status } : p))
    );
  };

  const handleResolveDispute = (
    disputeId: string,
    resolution: 'RESOLVED_REFUND' | 'RESOLVED_RELEASE',
    note: string
  ) => {
    setDisputes((prev) =>
      prev.map((d) =>
        d.id === disputeId ? { ...d, status: resolution, resolutionNote: note } : d
      )
    );
  };

  const handleReleaseEscrow = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, escrowStatus: 'RELEASED' } : o))
    );
  };

  const handleSaveMeasurements = (newMeasurements: MeasurementSheet) => {
    requireCustomerAuth(() => {
      setMeasurements(newMeasurements);
      offlineSyncManager.enqueue(
        'MEASUREMENTS_UPDATED',
        '14-Point Digital Measurement Sheet',
        newMeasurements
      );
    });
  };

  const handleToggleWishlist = (productId: string) => {
    requireCustomerAuth(() => {
      setWishlistProductIds((prev) =>
        prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
      );
    });
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
  // PORTAL 1: DEDICATED DESIGNER / TAILOR SELLER PORTAL (/designer/login)
  // ============================================================================
  if (portalMode === 'designer') {
    const isDesignerAuthenticated = currentUser?.role === 'tailor';

    if (!isDesignerAuthenticated) {
      return (
        <AuthModal
          isOpen={true}
          onClose={() => navigateToPortal('storefront')}
          onLoginSuccess={handleLoginSuccess}
          initialRole="tailor"
          isFullPagePortal={true}
          onBackToStorefront={() => navigateToPortal('storefront')}
        />
      );
    }

    return (
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
                  Designer & Master Tailor Portal
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigateToPortal('storefront')}
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
          <TailorDashboard
            currentTailor={currentTailorProfile}
            allTailors={tailors}
            onSwitchTailor={(id) => setActiveTailorId(id)}
            incomingRequests={quotationRequests}
            activeOrders={orders}
            products={products}
            onOpenVerificationModal={() => setTailorVerificationModalOpen(true)}
            onSubmitQuote={(requestId, quote) => {
              setQuotationRequests((prev) =>
                prev.map((r) =>
                  r.id === requestId
                    ? {
                        ...r,
                        status: 'NEGOTIATING',
                        quotations: [
                          {
                            ...quote,
                            id: `quote-${Date.now()}`,
                            customerAgreed: false,
                            designerAgreed: true,
                            negotiationHistory: [
                              {
                                id: `neg-${Date.now()}-init`,
                                senderRole: 'customer',
                                senderName: r.customerName || 'Customer',
                                amount: r.targetBudget,
                                note: 'Initial customer budget',
                                status: 'COUNTERED',
                                timestamp: r.createdAt
                              },
                              {
                                id: `neg-${Date.now()}-quote`,
                                senderRole: 'tailor',
                                senderName: quote.tailorName,
                                amount: quote.totalAmount,
                                note: quote.tailorMessage,
                                status: 'PROPOSED',
                                timestamp: new Date().toISOString()
                              }
                            ],
                            createdAt: new Date().toISOString()
                          },
                          ...r.quotations
                        ]
                      }
                    : r
                )
              );
            }}
            onUpdateRequestStatus={handleUpdateRequestStatus}
            onSendCounterOffer={(reqId, quoteId, amount, note, isFinal) =>
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
        </main>

        <TailorVerificationModal
          isOpen={tailorVerificationModalOpen}
          onClose={() => setTailorVerificationModalOpen(false)}
          onSubmitDocuments={handleTailorSubmitKYC}
        />

        <StyleChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          tailorName={activeChatRecipient?.name || 'Master Tailor'}
          tailorAvatar={activeChatRecipient?.avatar}
          customerName={customerProfile?.name || 'Customer'}
          customerAvatar={customerProfile?.avatar}
          measurements={measurements}
          messages={chatMessages}
          onSendMessage={handleSendMessage}
          onOpenFabricLibrary={() => setFabricLibraryOpen(true)}
        />
      </div>
    );
  }

  // ============================================================================
  // PORTAL 2: DEDICATED ADMIN GOVERNANCE PORTAL (/admin/login)
  // ============================================================================
  if (portalMode === 'admin') {
    const isAdminAuthenticated = currentUser?.role === 'admin';

    if (!isAdminAuthenticated) {
      return (
        <AuthModal
          isOpen={true}
          onClose={() => navigateToPortal('storefront')}
          onLoginSuccess={handleLoginSuccess}
          initialRole="admin"
          isFullPagePortal={true}
          onBackToStorefront={() => navigateToPortal('storefront')}
        />
      );
    }

    return (
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
                onClick={() => navigateToPortal('storefront')}
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
            customers={DEMO_USERS}
            disputes={disputes}
            auditLogs={auditLogs}
            commissionRate={commissionRate}
            analytics={analytics}
            onApproveTailor={handleApproveTailor}
            onRejectTailor={handleRejectTailor}
            onRequestTailorInfo={handleRequestTailorInfo}
            onToggleSuspendTailor={handleToggleSuspendTailor}
            onModerateProduct={handleModerateProduct}
            onResolveDispute={handleResolveDispute}
            onUpdateCommissionRate={setCommissionRate}
            onReleaseEscrow={handleReleaseEscrow}
          />
        </main>
      </div>
    );
  }

  // ============================================================================
  // PORTAL 3: PUBLIC & CUSTOMER E-COMMERCE SHOPPING WEBSITE (/)
  // ============================================================================
  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#2D2825] font-sans selection:bg-[#E9D4D7] selection:text-[#4A3728] flex flex-col justify-between">
      {/* Myntra / Zara E-Commerce Top Navigation Bar */}
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
        openMeasurements={() => setMeasurementsModalOpen(true)}
        openSearch={() => setSearchModalOpen(true)}
        openFabricLibrary={() => setFabricLibraryOpen(true)}
        openCart={() => setCartModalOpen(true)}
        openWishlist={() => setActiveTab('marketplace')}
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
            onOpenMeasurements={() => setMeasurementsModalOpen(true)}
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
            tailors={tailors}
            verifiedTailors={tailors.filter((t) => t.verificationStatus === 'VERIFIED')}
            products={products}
            wishlistIds={wishlistProductIds}
            onToggleWishlist={handleToggleWishlist}
            onAddToCart={handleAddToCart}
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
            products={products}
            wishlistIds={wishlistProductIds}
            cartCount={totalCartCount}
            onToggleWishlist={handleToggleWishlist}
            onBuyNow={handleBuyMarketplaceProduct}
            onAddToCart={handleAddToCart}
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
              onOpenMeasurements={() => setMeasurementsModalOpen(true)}
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
        )}

        {activeTab === 'orders' && (
          <OrderTrackingView
            orders={orders}
            onOpenChat={handleOpenChat}
            onSubmitReview={handleSubmitReview}
            onConfirmDelivery={handleConfirmOrderDelivery}
            onUploadMilestonePhoto={handleUploadMilestonePhoto}
            onRateMilestone={handleRateOrderMilestone}
            onOpenFabricLibrary={() => setFabricLibraryOpen(true)}
          />
        )}

        {activeTab === 'profile' && (
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
        )}
      </main>

      {/* Consumer E-Commerce Footer (with subtle "Become a Designer / Sell With Us" & "Admin Portal" links) */}
      <Footer
        onSelectCategory={handleSelectStorefrontCategory}
        onNavigateTab={handleNavigateStorefrontTab}
        onOpenDesignerPortal={() => navigateToPortal('designer')}
        onOpenAdminPortal={() => navigateToPortal('admin')}
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
                    setActiveTab('orders');
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
        onCompletePurchase={handleCompleteCartCheckout}
      />

      {/* Search Modal */}
      <SearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        products={products}
        tailors={tailors}
        designs={designs}
        onSelectProduct={() => {
          setActiveTab('marketplace');
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

      {/* Clean Customer Authentication Modal (Myntra-Style OTP & Email/Password) */}
      <AuthModal
        isOpen={customerAuthModalOpen}
        onClose={() => {
          pendingAuthActionRef.current = null;
          setCustomerAuthModalOpen(false);
        }}
        onLoginSuccess={handleLoginSuccess}
        initialRole="customer"
        onSwitchToDesignerPortal={() => {
          setCustomerAuthModalOpen(false);
          navigateToPortal('designer');
        }}
      />

      {/* User Profile & Wallet Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        currentUser={currentUser}
        user={currentUser}
        onUpdateUser={(updated) => setCurrentUser(updated)}
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
    </div>
  );
}
