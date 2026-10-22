/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Signal, Wifi, BatteryMedium, Sparkles, Smartphone, Monitor } from 'lucide-react';
import { Navbar } from './components/Navbar';
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
import { DocumentationPortal } from './components/Documentation/DocumentationPortal';
import { SpecSheetExportModal } from './components/SpecSheetExportModal';
import { AuthModal } from './components/Auth/AuthModal';
import { UserProfileModal } from './components/Customer/UserProfileModal';
import { UPIPaymentModal } from './components/Customer/UPIPaymentModal';
import { PWAInstallButton } from './components/PWAInstallButton';

import { 
  UserRole, 
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
  DressType
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

export default function App() {
  // Authentication & Profile State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(DEMO_USERS[0]);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [upiModalOpen, setUpiModalOpen] = useState<boolean>(false);
  const [selectedQuoteForPayment, setSelectedQuoteForPayment] = useState<{
    request: QuotationRequest;
    quote: TailorQuotation;
  } | null>(null);

  // Navigation & Role State
  const [currentRole, setCurrentRole] = useState<UserRole>('customer');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [gender, setGender] = useState<'women' | 'men'>('women');
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(true);
  const [showDocs, setShowDocs] = useState<boolean>(false);

  const handleGenderChange = (newGender: 'women' | 'men') => {
    setGender(newGender);
    if (activeDesign) {
      const isCurrentMen = activeDesign.tags.some((t) => t.toLowerCase().includes('men')) || activeDesign.id.includes('men');
      if ((newGender === 'men' && !isCurrentMen) || (newGender === 'women' && isCurrentMen)) {
        const matchingDesign = designs.find((d) => 
          newGender === 'men' 
            ? (d.tags.some((t) => t.toLowerCase().includes('men')) || d.id.includes('men'))
            : (!d.id.includes('men') && !d.tags.some((t) => t.toLowerCase().includes('men')))
        );
        setActiveDesign(matchingDesign || null);
      }
    }
  };

  // Domain State
  const [designs, setDesigns] = useState<DressDesign[]>(INITIAL_DRESS_DESIGNS);
  const [activeDesign, setActiveDesign] = useState<DressDesign | null>(null);
  const [tailors, setTailors] = useState<TailorProfile[]>(INITIAL_TAILORS);
  const [selectedTailor, setSelectedTailor] = useState<TailorProfile | null>(null);
  const [quotationRequests, setQuotationRequests] = useState<QuotationRequest[]>(INITIAL_QUOTATION_REQUESTS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [measurements, setMeasurements] = useState<MeasurementSheet>(INITIAL_MEASUREMENTS);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(INITIAL_CUSTOMER_PROFILE);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>(INITIAL_ANALYTICS);

  // Marketplace & Notifications State
  const [products, setProducts] = useState<MarketplaceProduct[]>(MARKETPLACE_PRODUCTS);
  const [wishlistProductIds, setWishlistProductIds] = useState<string[]>(['prod-1', 'prod-3']);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [searchModalOpen, setSearchModalOpen] = useState<boolean>(false);
  const [notificationsModalOpen, setNotificationsModalOpen] = useState<boolean>(false);

  // Generator prefill state
  const [generatorPrefill, setGeneratorPrefill] = useState<{ prompt?: string; dressType?: DressType }>({});

  // Modals State
  const [measurementsModalOpen, setMeasurementsModalOpen] = useState<boolean>(false);
  const [tailorVerificationModalOpen, setTailorVerificationModalOpen] = useState<boolean>(false);
  const [specSheetOpen, setSpecSheetOpen] = useState<boolean>(false);
  const [specSheetVariation, setSpecSheetVariation] = useState<DressDesignVariation | null>(null);
  const [chatOpen, setChatOpen] = useState<boolean>(false);
  const [activeChatRecipient, setActiveChatRecipient] = useState<{ id: string; name: string; avatar?: string }>({
    id: INITIAL_TAILORS[0].id,
    name: INITIAL_TAILORS[0].name,
    avatar: INITIAL_TAILORS[0].avatar
  });

  // Offline Cache Restoration on Mount
  useEffect(() => {
    const cached = offlineSyncManager.getCachedSnapshots();
    if (cached['designs']?.data && Array.isArray(cached['designs'].data)) {
      setDesigns(cached['designs'].data);
    }
    if (cached['orders']?.data && Array.isArray(cached['orders'].data)) {
      setOrders(cached['orders'].data);
    }
    if (cached['measurements']?.data) {
      setMeasurements(cached['measurements'].data);
    }
    if (cached['quotationRequests']?.data && Array.isArray(cached['quotationRequests'].data)) {
      setQuotationRequests(cached['quotationRequests'].data);
    }
  }, []);

  // Save snapshots for offline availability
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

  // Authentication Handlers
  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentRole(user.role);
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
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('customer');
    setActiveTab('home');
  };

  // Handlers for Customer Journey
  const handleDesignGenerated = (newDesign: DressDesign) => {
    setDesigns([newDesign, ...designs]);
    setActiveDesign(newDesign);
    setActiveTab('design-viewer');
    setAnalytics((prev) => ({
      ...prev,
      totalDressDesignsGenerated: prev.totalDressDesignsGenerated + 1
    }));
    // Sync offline
    offlineSyncManager.enqueue('DESIGN_SAVED', `Couture: ${newDesign.title}`, newDesign);
  };

  const handleToggleFavorite = (designId: string) => {
    setDesigns((prev) =>
      prev.map((d) => (d.id === designId ? { ...d, isFavorite: !d.isFavorite } : d))
    );
    if (activeDesign && activeDesign.id === designId) {
      setActiveDesign({ ...activeDesign, isFavorite: !activeDesign.isFavorite });
    }
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
    specificInstructions: string
  ) => {
    const newRequest: QuotationRequest = {
      id: `req-${Date.now()}`,
      customerId: customerProfile.id,
      customerName: customerProfile.name,
      customerAvatar: customerProfile.avatar,
      designId: design.id,
      variation: variation,
      measurementsId: measurements.id,
      targetBudget,
      neededByDate,
      specificInstructions,
      createdAt: new Date().toISOString(),
      status: 'OPEN',
      quotations: [
        {
          id: `quote-${Date.now()}-1`,
          requestId: `req-${Date.now()}`,
          tailorId: tailors[0].id,
          tailorName: tailors[0].name,
          tailorShopName: tailors[0].shopName,
          tailorAvatar: tailors[0].avatar,
          tailorRating: tailors[0].rating,
          totalAmount: targetBudget,
          currency: 'INR',
          estimatedDeliveryDays: 14,
          proposedDeliveryDate: neededByDate,
          tailorMessage: 'We have reserved Banarasi Katan silk and authentic dabka zardozi for this piece. Hand-finished internal lining included.',
          fabricIncluded: true,
          status: 'PENDING',
          items: [
            { id: 'item-1', description: `Pure ${variation.specs.fabric}`, amount: Math.round(targetBudget * 0.45), category: 'Fabric' },
            { id: 'item-2', description: 'Master Pattern Drafting & Tailoring', amount: Math.round(targetBudget * 0.35), category: 'Stitching' },
            { id: 'item-3', description: `Artisanal ${variation.specs.pattern}`, amount: Math.round(targetBudget * 0.15), category: 'Embroidery & Handwork' },
            { id: 'item-4', description: 'Steam Pressing & Couture Packaging', amount: Math.round(targetBudget * 0.05), category: 'Finishing' }
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

    setQuotationRequests([newRequest, ...quotationRequests]);
    setActiveTab('quotes');
    offlineSyncManager.enqueue('QUOTE_REQUESTED', `Quotation broadcast for ${design.title}`, newRequest);
  };

  const handleAcceptQuotation = (request: QuotationRequest, quote: TailorQuotation) => {
    setSelectedQuoteForPayment({ request, quote });
    setUpiModalOpen(true);
  };

  const handleCompleteEscrowPayment = (method: string, txnId: string) => {
    if (!selectedQuoteForPayment) return;
    const { request, quote } = selectedQuoteForPayment;

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
      totalAmount: quote.totalAmount,
      paidAmount: quote.totalAmount,
      currency: quote.currency || 'INR',
      status: 'QUOTATION_ACCEPTED',
      currentStage: 'FABRIC_SOURCING',
      escrowStatus: 'SECURED_IN_ESCROW',
      escrowVaultId: `BHARAT-ESCROW-${Date.now().toString().slice(-6)}`,
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

    // Add success notification
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Bharat Escrow Payment Confirmed',
        description: `Order #${newOrder.id} confirmed with ${quote.tailorName}. Funds locked safely in Escrow.`,
        timestamp: 'Just now',
        type: 'ORDER_UPDATE',
        isRead: false,
        actionUrl: '/orders'
      },
      ...prev
    ]);
  };

  const handleAdvanceMilestone = (orderId: string, milestoneId: string, note?: string, photoUrl?: string) => {
    setOrders((prev) =>
      prev.map((order) => {
        if (order.id !== orderId) return order;

        let nextPendingFound = false;
        const updatedMilestones = order.milestones.map((m) => {
          if (m.id === milestoneId) {
            return {
              ...m,
              status: 'COMPLETED' as const,
              completedAt: new Date().toISOString(),
              tailorNote: note,
              photoProofUrl: photoUrl
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
  };

  const handleSubmitReview = (orderId: string, tailorId: string, reviewData: Omit<Review, 'id' | 'createdAt'>) => {
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
              rating: Number((((t.rating * (t.reviewCount || 1)) + ratingVal) / ((t.reviewCount || 1) + 1)).toFixed(1)),
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
              escrowStatus: 'RELEASED'
            }
          : o
      )
    );
    offlineSyncManager.enqueue('ORDER_UPDATED', `Order #${orderId} verified and delivered`, { orderId, status: 'DELIVERED' });
  };

  const handleSendMessage = (content: string, type: 'TEXT' | 'IMAGE' | 'MEASUREMENT_CARD' | 'FABRIC_SWATCH' = 'TEXT') => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      orderId: orders[0]?.id || 'ord-1',
      senderId: currentRole === 'customer' ? customerProfile?.id || 'cust-1' : activeChatRecipient?.id || 'tailor-1',
      senderName: currentRole === 'customer' ? customerProfile?.name || 'Customer' : activeChatRecipient?.name || 'Master Tailor',
      senderRole: currentRole === 'customer' ? 'customer' : 'tailor',
      text: content,
      content,
      type,
      timestamp: new Date().toISOString(),
      isRead: true
    };
    setChatMessages((prev) => [...prev, newMsg]);
    offlineSyncManager.enqueue('CHAT_SENT', `Atelier Message: "${content.slice(0, 24)}..."`, newMsg);
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

  const handleOpenSpecSheet = (variation: DressDesignVariation) => {
    setSpecSheetVariation(variation);
    setSpecSheetOpen(true);
  };

  // Tailor KYC Application Submission
  const handleTailorSubmitKYC = (docs: TailorVerificationDocument[], notes: string) => {
    setTailors((prev) =>
      prev.map((t) =>
        t.id === tailors[0].id
          ? {
              ...t,
              verificationStatus: 'UNDER_REVIEW',
              verificationDocuments: docs
            }
          : t
      )
    );
  };

  // Admin Actions
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
  };

  const handleReleaseEscrow = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, escrowStatus: 'RELEASED' } : o))
    );
  };

  const handleSaveMeasurements = (newMeasurements: MeasurementSheet) => {
    setMeasurements(newMeasurements);
    offlineSyncManager.enqueue('MEASUREMENTS_UPDATED', `14-Point Digital Measurement Sheet`, newMeasurements);
  };

  // Wishlist & Notifications Handlers
  const handleToggleWishlist = (productId: string) => {
    setWishlistProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
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
    const newOrder: Order = {
      id: `ord-${Date.now().toString().slice(-6)}`,
      orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
      orderType: 'ready-to-wear',
      customerId: customerProfile.id,
      customerName: customerProfile.name,
      tailorId: 'tailor-meera',
      tailorName: product.designerName,
      tailorShopName: product.designerName,
      tailorAvatar: product.designerAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
      totalAmount: product.price,
      paidAmount: product.price,
      currency: 'INR',
      status: 'QUOTATION_ACCEPTED',
      currentStage: 'FABRIC_SOURCING',
      escrowStatus: 'SECURED_IN_ESCROW',
      escrowVaultId: `BHARAT-ESCROW-${Date.now().toString().slice(-6)}`,
      milestones: [
        {
          id: `ms-${Date.now()}-1`,
          orderId: `ord-${Date.now().toString().slice(-6)}`,
          stage: 'FABRIC_SOURCING',
          title: `Garment Preparation (${selectedSize})`,
          label: `Garment Preparation (${selectedSize})`,
          description: `Custom finishing in size ${selectedSize}`,
          status: 'IN_PROGRESS'
        },
        {
          id: `ms-${Date.now()}-2`,
          orderId: `ord-${Date.now().toString().slice(-6)}`,
          stage: 'FINAL_STITCHING',
          title: 'Quality Check & Packaging',
          label: 'Quality Check & Packaging',
          description: 'Luxury packaging and dispatch inspection',
          status: 'PENDING'
        }
      ],
      estimatedDeliveryDate: '2026-09-20',
      orderDate: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setOrders([newOrder, ...orders]);
    setActiveTab('orders');
    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        title: 'Garment Order Confirmed',
        message: `Your order for ${product.title} (Size: ${selectedSize}) has been received by ${product.designerName}.`,
        timestamp: 'Just now',
        isRead: false,
        type: 'ORDER'
      },
      ...prev
    ]);
  };

  return (
    <div className={`min-h-screen bg-[#F7F4EE] text-[#2D2825] font-sans selection:bg-[#E9D4D7] selection:text-[#4A3728] ${isMobileFrame ? 'sm:py-6 sm:px-4 flex items-center justify-center' : ''}`}>
      {/* Outer Shell Wrapper (Adaptive Mobile Frame or Full Desktop) */}
      <div 
        className={
          isMobileFrame 
            ? 'w-full max-w-md min-h-screen sm:min-h-[840px] sm:max-h-[92vh] sm:rounded-[36px] shadow-2xl border-x sm:border-[6px] sm:border-[#2D2825] bg-[#FAF7F2] relative overflow-hidden flex flex-col justify-between transition-all' 
            : 'w-full min-h-screen bg-[#FAF7F2] flex flex-col justify-between transition-all'
        }
      >
        
        {/* Mobile Phone Simulated Status Bar: ONLY shown on desktop when simulating a phone chassis */}
        {isMobileFrame && (
          <div className="hidden sm:flex items-center justify-between px-6 pt-2.5 pb-1 text-[#2D2825] select-none text-xs font-semibold shrink-0 bg-[#F9F6F2]">
            <span>9:41</span>
            <div className="w-16 h-3.5 bg-black/10 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-black/20" />
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <Signal className="w-3.5 h-3.5" />
              <Wifi className="w-3.5 h-3.5" />
              <BatteryMedium className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Navigation Bar */}
        <Navbar
          currentRole={currentRole}
          setCurrentRole={setCurrentRole}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            if (tab !== 'design-viewer') setActiveDesign(null);
          }}
          isMobileFrame={isMobileFrame}
          setIsMobileFrame={setIsMobileFrame}
          gender={gender}
          setGender={handleGenderChange}
          savedDesignsCount={designs.length}
          activeOrdersCount={orders.filter((o) => o.status !== 'DELIVERED').length}
          unreadNotificationsCount={notifications.filter((n) => !n.isRead).length}
          openMeasurements={() => setMeasurementsModalOpen(true)}
          openSearch={() => setSearchModalOpen(true)}
          openNotifications={() => setNotificationsModalOpen(true)}
          showDocs={showDocs}
          setShowDocs={setShowDocs}
          currentUser={currentUser}
          onOpenAuth={() => setAuthModalOpen(true)}
          onOpenProfile={() => setProfileModalOpen(true)}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className={`w-full ${isMobileFrame ? 'px-3 sm:px-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'} pt-2 pb-24 flex-1 overflow-y-auto`}>
          
          {/* Documentation Portal View */}
          {showDocs ? (
            <DocumentationPortal />
          ) : currentRole === 'tailor' ? (
            /* Tailor Role Workspace */
            <TailorDashboard
              currentTailor={tailors[0]}
              incomingRequests={quotationRequests}
              activeOrders={orders}
              onOpenVerificationModal={() => setTailorVerificationModalOpen(true)}
              onSubmitQuote={(requestId, quote) => {
                setQuotationRequests((prev) =>
                  prev.map((r) =>
                    r.id === requestId
                      ? {
                          ...r,
                          quotations: [
                            {
                              ...quote,
                              id: `quote-${Date.now()}`,
                              createdAt: new Date().toISOString()
                            },
                            ...r.quotations
                          ]
                        }
                      : r
                  )
                );
              }}
              onAdvanceMilestone={handleAdvanceMilestone}
              onOpenChat={handleOpenChat}
            />
          ) : currentRole === 'admin' ? (
            /* Admin Role Workspace */
            <AdminDashboard
              tailors={tailors}
              orders={orders}
              analytics={analytics}
              onApproveTailor={handleApproveTailor}
              onRejectTailor={handleRejectTailor}
              onReleaseEscrow={handleReleaseEscrow}
            />
          ) : (
            /* Customer Role Journey */
            <>
              {activeTab === 'home' && (
                <SplashScreen
                  userName={currentUser?.name || 'Aanya'}
                  gender={gender}
                  onGenderChange={handleGenderChange}
                  onStartGenerator={handleStartCustomizerFromPrompt}
                  onExploreTailors={() => setActiveTab('tailors')}
                  onExploreMarketplace={() => setActiveTab('marketplace')}
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
                  featuredDesigns={designs}
                  verifiedTailors={tailors}
                />
              )}

              {activeTab === 'generator' && (
                <AIDressGenerator 
                  key={`${generatorPrefill.prompt || ''}-${generatorPrefill.dressType || ''}-${gender}`}
                  gender={gender}
                  onGenderChange={handleGenderChange}
                  onDesignGenerated={handleDesignGenerated}
                  onOpenNotifications={() => setNotificationsModalOpen(true)}
                  onOpenHistory={() => setActiveTab('wardrobe')}
                  onRequestTailor={(design) => {
                    setActiveDesign(design);
                    setActiveTab('design-viewer');
                  }}
                  onViewDesignDetails={(design) => {
                    setActiveDesign(design);
                    setActiveTab('design-viewer');
                  }}
                  initialPrompt={generatorPrefill.prompt}
                  initialDressType={generatorPrefill.dressType}
                  latestConcept={
                    activeDesign && (
                      (gender === 'men' && (activeDesign.tags?.some((t) => t.toLowerCase().includes('men')) || activeDesign.id.includes('men'))) ||
                      (gender === 'women' && !activeDesign.id.includes('men') && !activeDesign.tags?.some((t) => t.toLowerCase().includes('men')))
                    )
                      ? activeDesign
                      : (gender === 'men' ? designs.find((d) => d.id.includes('men')) || designs[0] : designs.find((d) => !d.id.includes('men')) || designs[0])
                  }
                />
              )}

              {activeTab === 'marketplace' && (
                <MarketplaceView
                  gender={gender}
                  products={products}
                  wishlistIds={wishlistProductIds}
                  onToggleWishlist={handleToggleWishlist}
                  onBuyNow={handleBuyMarketplaceProduct}
                  onChatSeller={(designerName, product) => {
                    const tailor = tailors.find((t) => t.name.toLowerCase().includes(designerName.toLowerCase().slice(0, 4))) || tailors[0];
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

              {activeTab === 'design-viewer' && (
                (activeDesign || designs[0]) ? (
                  <GeneratedDesignViewer
                    design={activeDesign || designs[0]}
                    onSaveToFavorites={handleToggleFavorite}
                    onRequestQuotations={handleBroadcastQuotationRequest}
                    onBackToStudio={() => {
                      setActiveDesign(null);
                      setActiveTab('generator');
                    }}
                    onOpenSpecSheet={handleOpenSpecSheet}
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
                )
              )}

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
                  tailors={tailors}
                  selectedTailor={selectedTailor}
                  onSelectTailor={setSelectedTailor}
                  onContactTailor={(tailor) => handleOpenChat(tailor.id, tailor.name)}
                />
              )}

              {activeTab === 'quotes' && (
                <QuotationComparison
                  quotationRequests={quotationRequests}
                  onAcceptQuotation={handleAcceptQuotation}
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
                />
              )}

              {activeTab === 'profile' && (
                <CustomerProfileView
                  profile={customerProfile}
                  measurements={measurements}
                  savedDesigns={designs}
                  orders={orders}
                  onOpenMeasurementsModal={() => setMeasurementsModalOpen(true)}
                  onNavigateToStudio={() => setActiveTab('generator')}
                  onNavigateToOrders={() => setActiveTab('orders')}
                />
              )}
            </>
          )}

        </main>

        {/* In-App PWA Install Banner (Chromium/Android Chrome & iOS Safari) */}
        <div className={`${isMobileFrame ? 'absolute bottom-16 left-3 right-3' : 'fixed bottom-18 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6'} z-40 max-w-sm pointer-events-auto`}>
          <PWAInstallButton variant="banner" />
        </div>

        {/* Mobile Bottom Navigation (Visible when not in Docs) */}
        {!showDocs && currentRole === 'customer' && (
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'design-viewer') setActiveDesign(null);
            }}
            activeOrdersCount={orders.filter((o) => o.status !== 'DELIVERED').length}
            isMobileFrame={isMobileFrame}
          />
        )}

        {/* Search Modal */}
        <SearchModal
          isOpen={searchModalOpen}
          onClose={() => setSearchModalOpen(false)}
          products={products}
          tailors={tailors}
          designs={designs}
          onSelectProduct={(p) => {
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
          onSelectCategory={(catName) => {
            handleStartCustomizerFromPrompt(
              `Exquisite bespoke ${catName} crafted with hand zardozi work and pure textile`,
              catName as any
            );
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
            if (notif.actionUrl === '/orders') setActiveTab('orders');
            else if (notif.actionUrl === '/quotes') setActiveTab('quotes');
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

        {/* Tailor Verification KYC Modal */}
        <TailorVerificationModal
          isOpen={tailorVerificationModalOpen}
          onClose={() => setTailorVerificationModalOpen(false)}
          onSubmitDocuments={handleTailorSubmitKYC}
        />

        {/* Style Chat Modal */}
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
        />

        {/* Spec Sheet Export Modal */}
        <SpecSheetExportModal
          isOpen={specSheetOpen}
          onClose={() => setSpecSheetOpen(false)}
          variation={specSheetVariation}
          measurements={measurements}
        />

        {/* User Authentication Modal */}
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
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
            setAuthModalOpen(true);
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
            quote={selectedQuoteForPayment.quote}
            designName={selectedQuoteForPayment.request.variation?.name || 'Couture Garment'}
            designImage={selectedQuoteForPayment.request.variation?.frontImageUrl || ''}
            onPaymentSuccess={handleCompleteEscrowPayment}
          />
        )}

      </div>

    </div>
  );
}
