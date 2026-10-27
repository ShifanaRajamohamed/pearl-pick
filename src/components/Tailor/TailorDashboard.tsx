import React, { useState } from 'react';
import {
  Scissors,
  Clock,
  CheckCircle2,
  ShieldCheck,
  FileText,
  Plus,
  MessageCircle,
  Star,
  TrendingUp,
  Package,
  Handshake,
  AlertTriangle,
  Trash2,
  Edit3,
  Send,
  ArrowRight,
  Image as ImageIcon,
  Check,
  XCircle,
  RefreshCw,
  Briefcase
} from 'lucide-react';
import {
  TailorProfile,
  QuotationRequest,
  Order,
  TailorQuotation,
  MarketplaceProduct,
  DesignerOrderStatus,
  NegotiationOffer
} from '../../types';

interface TailorDashboardProps {
  currentTailor: TailorProfile;
  allTailors?: TailorProfile[];
  onSelectActiveTailor?: (tailor: TailorProfile) => void;
  incomingRequests: QuotationRequest[];
  activeOrders: Order[];
  products?: MarketplaceProduct[];
  onAddProduct?: (product: MarketplaceProduct) => void;
  onUpdateProduct?: (product: MarketplaceProduct) => void;
  onDeleteProduct?: (productId: string) => void;
  onOpenVerificationModal: () => void;
  onUpdateTailorProfile?: (updated: TailorProfile) => void;
  onSubmitQuote: (requestId: string, quote: Omit<TailorQuotation, 'id' | 'createdAt'>) => void;
  onUpdateRequestStatus?: (
    requestId: string,
    status: 'OPEN' | 'QUOTATIONS_RECEIVED' | 'ACCEPTED' | 'REJECTED' | 'MODIFICATION_REQUESTED' | 'CLOSED',
    note?: string
  ) => void;
  onSendCounterOffer?: (
    requestId: string,
    quotationId: string,
    amount: number,
    message: string,
    senderRole: 'customer' | 'tailor',
    isFinalOffer?: boolean
  ) => void;
  onAgreeToPrice?: (requestId: string, quotationId: string, party: 'customer' | 'tailor') => void;
  onAdvanceMilestone: (orderId: string, milestoneId: string, photoProofUrl?: string) => void;
  onAdvanceOrderStatus?: (orderId: string, nextStatus: DesignerOrderStatus) => void;
  onOpenChat: (customerId: string, customerName: string) => void;
}

const ORDERED_WORKFLOW_STEPS: DesignerOrderStatus[] = [
  'Pending',
  'Accepted',
  'Awaiting Payment',
  'In Production',
  'Quality Check',
  'Shipped',
  'Delivered'
];

export const TailorDashboard: React.FC<TailorDashboardProps> = ({
  currentTailor,
  allTailors = [],
  onSelectActiveTailor,
  incomingRequests,
  activeOrders,
  products = [],
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onOpenVerificationModal,
  onUpdateTailorProfile,
  onSubmitQuote,
  onUpdateRequestStatus,
  onSendCounterOffer,
  onAgreeToPrice,
  onAdvanceMilestone,
  onAdvanceOrderStatus,
  onOpenChat
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'requests' | 'negotiations' | 'products' | 'orders' | 'portfolio'
  >('requests');

  const [selectedRequestForQuote, setSelectedRequestForQuote] = useState<QuotationRequest | null>(
    null
  );

  // Itemized Quotation Form (INR)
  const [fabricAmount, setFabricAmount] = useState<number>(2400);
  const [stitchingAmount, setStitchingAmount] = useState<number>(1800);
  const [handworkAmount, setHandworkAmount] = useState<number>(950);
  const [finishingAmount, setFinishingAmount] = useState<number>(350);
  const [deliveryDays, setDeliveryDays] = useState<number>(14);
  const [tailorProposalNote, setTailorProposalNote] = useState<string>(
    'We will construct this garment with French seams, internal 12-bone corsetry, and a 2.5-inch alteration margin.'
  );

  // Negotiation Counteroffer States
  const [counterOfferAmount, setCounterOfferAmount] = useState<Record<string, string>>({});
  const [counterOfferMessage, setCounterOfferMessage] = useState<Record<string, string>>({});
  const [isFinalOfferCheck, setIsFinalOfferCheck] = useState<Record<string, boolean>>({});

  // Product Showcase Upload / Edit Form State
  const [showProductForm, setShowProductForm] = useState<boolean>(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [prodTitle, setProdTitle] = useState<string>('Royal Zardozi Silk Organza Anarkali');
  const [prodCategory, setProdCategory] = useState<string>('Festive');
  const [prodFabric, setProdFabric] = useState<string>('Silk Organza');
  const [prodColor, setProdColor] = useState<string>('Champagne Ivory');
  const [prodPrice, setProdPrice] = useState<number>(18500);
  const [prodStock, setProdStock] = useState<number>(8);
  const [prodSizes, setProdSizes] = useState<string>('XS, S, M, L, XL');
  const [prodFrontImg, setProdFrontImg] = useState<string>(
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
  );
  const [prodBackImg, setProdBackImg] = useState<string>(
    'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'
  );
  const [prodSideImg, setProdSideImg] = useState<string>(
    'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&auto=format&fit=crop&q=80'
  );
  const [prodDescription, setProdDescription] = useState<string>(
    'Handcrafted couture ensemble featuring 24K gold dabka embroidery, pure silk mulmul lining, and scalloped zari borders.'
  );

  // Designer Application / Profile Editor State
  const [profileShopName, setProfileShopName] = useState<string>(currentTailor.shopName);
  const [profileSpecialties, setProfileSpecialties] = useState<string>(
    currentTailor.specialties.join(', ')
  );
  const [profileExperience, setProfileExperience] = useState<number>(currentTailor.experienceYears);
  const [profileCity, setProfileCity] = useState<string>(currentTailor.city);
  const [profilePricingRange, setProfilePricingRange] = useState<string>(
    currentTailor.pricingRange || `₹${currentTailor.startingPrice.toLocaleString('en-IN')} – ₹85,000`
  );
  const [profileBio, setProfileBio] = useState<string>(currentTailor.bio);
  const [profileSavedBanner, setProfileSavedBanner] = useState<boolean>(false);

  // Photo proof input for milestone advance
  const [photoProofInput] = useState<string>(
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80'
  );

  const isApproved = currentTailor.verificationStatus === 'VERIFIED';

  const totalQuoteAmount = fabricAmount + stitchingAmount + handworkAmount + finishingAmount;

  const openQuoteModalForRequest = (req: QuotationRequest) => {
    setSelectedRequestForQuote(req);
    const base = req.targetBudget || 4000;
    const suggestedTotal = Math.round(base * 1.25);
    setFabricAmount(Math.round(suggestedTotal * 0.45));
    setStitchingAmount(Math.round(suggestedTotal * 0.3));
    setHandworkAmount(Math.round(suggestedTotal * 0.18));
    setFinishingAmount(Math.round(suggestedTotal * 0.07));
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForQuote || !isApproved) return;

    const initialHistory: NegotiationOffer[] = [
      {
        id: `neg-cust-${Date.now() - 1000}`,
        quotationId: `quote-${Date.now()}`,
        senderRole: 'customer',
        senderName: selectedRequestForQuote.customerName,
        amount: selectedRequestForQuote.targetBudget,
        message: 'Customer initial preferred budget.',
        status: 'COUNTERED',
        timestamp: 'Just now'
      },
      {
        id: `neg-tailor-${Date.now()}`,
        quotationId: `quote-${Date.now()}`,
        senderRole: 'tailor',
        senderName: currentTailor.name,
        amount: totalQuoteAmount,
        message: tailorProposalNote,
        status: 'PROPOSED',
        timestamp: 'Just now'
      }
    ];

    const newQuote: Omit<TailorQuotation, 'id' | 'createdAt'> = {
      requestId: selectedRequestForQuote.id,
      tailorId: currentTailor.id,
      tailorName: currentTailor.name,
      tailorShopName: currentTailor.shopName,
      tailorAvatar: currentTailor.avatar,
      tailorRating: currentTailor.rating,
      totalAmount: totalQuoteAmount,
      initialQuoteAmount: totalQuoteAmount,
      finalAgreedAmount: totalQuoteAmount,
      customerAgreed: false,
      designerAgreed: true,
      negotiationHistory: initialHistory,
      currency: 'INR',
      estimatedDeliveryDays: deliveryDays,
      proposedDeliveryDate: new Date(Date.now() + deliveryDays * 86400000)
        .toISOString()
        .split('T')[0],
      tailorMessage: tailorProposalNote,
      fabricIncluded: true,
      status: 'NEGOTIATING',
      items: [
        {
          id: 'item-1',
          description: `Premium ${selectedRequestForQuote.variation.specs.fabric} + Lining`,
          amount: fabricAmount,
          category: 'Fabric'
        },
        {
          id: 'item-2',
          description: 'Master Pattern Drafting & Seam Construction',
          amount: stitchingAmount,
          category: 'Stitching'
        },
        {
          id: 'item-3',
          description: `Hand ${selectedRequestForQuote.variation.specs.pattern}`,
          amount: handworkAmount,
          category: 'Embroidery & Handwork'
        },
        {
          id: 'item-4',
          description: 'Hand-rolled Hems, Steam Pressing & Couture Packaging',
          amount: finishingAmount,
          category: 'Finishing'
        }
      ],
      milestones: [
        {
          title: 'Pattern Muslin & Fabric Sourced',
          percentage: 30,
          description: 'Fabric purchase and toile preparation'
        },
        {
          title: 'First Baste Fit Verification',
          percentage: 40,
          description: 'First fitting and seam assembly'
        },
        {
          title: 'Final Hand Finishing & Delivery',
          percentage: 30,
          description: 'Finishing, quality check, and packaging'
        }
      ]
    };

    onSubmitQuote(selectedRequestForQuote.id, newQuote);
    setSelectedRequestForQuote(null);
    setActiveTab('negotiations');
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isApproved) return;

    const sizesList = prodSizes
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const productPayload: MarketplaceProduct = {
      id: editingProductId || `prod-designer-${Date.now()}`,
      title: prodTitle,
      category: 'designer',
      categoryLabel: `${prodCategory} Couture`,
      designerId: currentTailor.id,
      designerName: currentTailor.shopName || currentTailor.name,
      designerAvatar: currentTailor.avatar,
      price: Number(prodPrice),
      images: [prodFrontImg, prodBackImg, prodSideImg].filter(Boolean),
      frontImageUrl: prodFrontImg,
      backImageUrl: prodBackImg,
      sideImageUrl: prodSideImg,
      sizes: sizesList.length ? sizesList : ['S', 'M', 'L'],
      fabric: prodFabric,
      color: prodColor,
      occasion: prodCategory,
      style: 'Royal Heritage',
      stockCount: Number(prodStock),
      moderationStatus: 'APPROVED',
      description: prodDescription,
      rating: 4.9,
      reviewCount: 12,
      tags: [prodCategory, prodFabric, prodColor, 'Designer Showcase'],
      inStock: Number(prodStock) > 0,
      leadTimeDays: 7,
      specs: {
        color: prodColor,
        length: 'Floor Length (44")',
        washCare: 'Dry Clean Only',
        work: 'Hand Zardozi & Resham'
      }
    };

    if (editingProductId && onUpdateProduct) {
      onUpdateProduct(productPayload);
    } else if (onAddProduct) {
      onAddProduct(productPayload);
    }

    setShowProductForm(false);
    setEditingProductId(null);
  };

  const handleEditExistingProduct = (prod: MarketplaceProduct) => {
    setEditingProductId(prod.id);
    setProdTitle(prod.title);
    setProdCategory(prod.occasion || 'Festive');
    setProdFabric(prod.fabric);
    setProdColor(prod.color || prod.specs?.color || 'Champagne');
    setProdPrice(prod.price);
    setProdStock(prod.stockCount ?? 5);
    setProdSizes((prod.sizes || ['S', 'M', 'L']).join(', '));
    setProdFrontImg(prod.frontImageUrl || prod.images[0] || '');
    setProdBackImg(prod.backImageUrl || prod.images[1] || prod.images[0] || '');
    setProdSideImg(prod.sideImageUrl || prod.images[2] || prod.images[0] || '');
    setProdDescription(prod.description);
    setShowProductForm(true);
  };

  const getOrderWorkflowStatus = (order: Order): DesignerOrderStatus => {
    if (order.workflowStatus) return order.workflowStatus;
    if (order.status === 'DELIVERED' || order.status === 'COMPLETED') return 'Delivered';
    if (order.status === 'SHIPPED') return 'Shipped';
    if (order.currentStage === 'QUALITY_INSPECTION') return 'Quality Check';
    return 'In Production';
  };

  const getNextValidWorkflowStatus = (current: DesignerOrderStatus): DesignerOrderStatus | null => {
    const idx = ORDERED_WORKFLOW_STEPS.indexOf(current);
    if (idx >= 0 && idx < ORDERED_WORKFLOW_STEPS.length - 1) {
      return ORDERED_WORKFLOW_STEPS[idx + 1];
    }
    return null;
  };

  const totalRevenueINR = activeOrders.reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20 px-2 sm:px-4">
      {/* Top Designer Profile & Approval Switcher Bar */}
      <div className="bg-white rounded-3xl p-6 border border-[#E4D9D1] shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentTailor.avatar}
              alt={currentTailor.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#E4D9D1]"
            />
            {isApproved && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-700 text-white flex items-center justify-center border-2 border-white">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2825]">
                {currentTailor.shopName}
              </h1>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-3 py-0.5 rounded-full border ${
                  isApproved
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : currentTailor.verificationStatus === 'REJECTED' ||
                      currentTailor.verificationStatus === 'SUSPENDED'
                    ? 'bg-red-50 text-red-800 border-red-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {currentTailor.verificationStatus === 'VERIFIED'
                  ? 'APPROVED DESIGNER'
                  : `STATUS: ${currentTailor.verificationStatus}`}
              </span>
            </div>
            <p className="text-xs text-[#7D726A] mt-0.5">
              Master Designer: <strong className="text-[#2D2825]">{currentTailor.name}</strong> •{' '}
              {currentTailor.city}, {currentTailor.state} • {currentTailor.experienceYears} Yrs Experience
            </p>
            <div className="flex items-center gap-3 mt-1.5 text-xs text-[#5A4638]">
              <span className="flex items-center text-[#2D2825] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37] mr-1" />
                {currentTailor.rating} ({currentTailor.reviewCount} reviews)
              </span>
              <span>•</span>
              <span>{currentTailor.completedOrders} bespoke orders completed</span>
            </div>
          </div>
        </div>

        {/* Switch Active Designer Profile (Approved vs Pending Demo) + KYC Button */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto justify-end">
          {allTailors.length > 1 && onSelectActiveTailor && (
            <div className="flex items-center gap-2 bg-[#FAF7F2] px-3 py-2 rounded-2xl border border-[#E4D9D1]">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D726A]">
                Test Designer Account:
              </span>
              <select
                value={currentTailor.id}
                onChange={(e) => {
                  const found = allTailors.find((t) => t.id === e.target.value);
                  if (found) onSelectActiveTailor(found);
                }}
                className="text-xs font-bold text-[#2D2825] bg-transparent outline-none cursor-pointer"
              >
                {allTailors.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.verificationStatus})
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={onOpenVerificationModal}
            className="px-4 py-2.5 rounded-xl bg-[#2D2825] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8D2434] transition-all cursor-pointer flex items-center gap-2"
          >
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Verification & KYC</span>
          </button>
        </div>
      </div>

      {/* Pending / Unapproved Designer Gate Banner */}
      {!isApproved && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-serif text-base font-bold text-amber-950">
                Designer Application Pending Admin Approval ({currentTailor.verificationStatus})
              </h3>
              <p className="text-xs text-amber-900/80 mt-0.5 leading-relaxed">
                Per marketplace governance rules, designers must submit their portfolio & verification dossier and receive Admin approval before publishing ready-made products or sending quotations to customers. Switch to the <strong>Admin</strong> role in the top bar to approve <strong>{currentTailor.name}</strong>!
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('portfolio')}
            className="px-4 py-2.5 rounded-xl bg-amber-800 text-white text-xs font-bold uppercase tracking-wider shrink-0 cursor-pointer"
          >
            Complete Application Dossier
          </button>
        </div>
      )}

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-[#E4D9D1]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7D726A]">
            Atelier Order Volume
          </span>
          <p className="font-serif text-2xl font-bold text-[#2D2825] mt-1 tabular-nums">
            ₹{totalRevenueINR.toLocaleString('en-IN')}
          </p>
          <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            <span>Protected in Bharat Escrow</span>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E4D9D1]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7D726A]">
            Customer 3-View Requests
          </span>
          <p className="font-serif text-2xl font-bold text-[#2D2825] mt-1 tabular-nums">
            {incomingRequests.length}
          </p>
          <span className="text-[11px] text-[#8D2434] font-semibold block mt-1">
            Awaiting quotation / negotiation
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E4D9D1]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7D726A]">
            Showcase Products
          </span>
          <p className="font-serif text-2xl font-bold text-[#2D2825] mt-1 tabular-nums">
            {products.length}
          </p>
          <span className="text-[11px] text-[#7D726A] block mt-1">
            Ready-made & custom collections
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-[#E4D9D1]">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#7D726A]">
            Active Production Pipeline
          </span>
          <p className="font-serif text-2xl font-bold text-[#2D2825] mt-1 tabular-nums">
            {activeOrders.length}
          </p>
          <span className="text-[11px] text-[#7D726A] block mt-1">
            Strict 7-stage quality workflow
          </span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-[#E4D9D1]">
        {[
          { id: 'requests', label: `Customer Design Requests (${incomingRequests.length})`, icon: Scissors },
          { id: 'negotiations', label: 'Price Negotiations & Bids', icon: Handshake },
          { id: 'products', label: `Product Showcase (${products.length})`, icon: Package },
          { id: 'orders', label: `Production & Orders (${activeOrders.length})`, icon: Clock },
          { id: 'portfolio', label: 'Application & Portfolio Dossier', icon: Briefcase }
        ].map((tab) => {
          const Icon = tab.icon;
          const isAct = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-xl text-xs font-bold flex items-center gap-2 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                isAct
                  ? 'border-[#8D2434] text-[#8D2434] bg-white'
                  : 'border-transparent text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: CUSTOMER DESIGN REQUESTS (3-VIEW AI INSPECTOR) */}
      {activeTab === 'requests' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2D2825]">
                Incoming AI Custom Dress Requests
              </h2>
              <p className="text-xs text-[#7D726A]">
                Examine coordinated Front, Back, and Side views, review customer budgets and measurements, and send itemized quotations.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-3xl border border-[#E4D9D1] p-6 shadow-xs space-y-5"
              >
                <div className="flex flex-col lg:flex-row gap-6 justify-between">
                  {/* 3 Coordinated Views (Front, Back, Side) */}
                  <div className="grid grid-cols-3 gap-3 sm:w-96 shrink-0">
                    <div className="space-y-1">
                      <img
                        src={req.variation.frontImageUrl}
                        alt="Front View"
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[3/4] rounded-xl object-cover object-top border border-[#E4D9D1] bg-[#FAF7F2]"
                      />
                      <span className="text-[10px] font-bold text-center block text-[#2D2825]">
                        Front View
                      </span>
                    </div>
                    <div className="space-y-1">
                      <img
                        src={req.variation.backImageUrl || req.variation.frontImageUrl}
                        alt="Back View"
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[3/4] rounded-xl object-cover object-top border border-[#E4D9D1] bg-[#FAF7F2]"
                      />
                      <span className="text-[10px] font-bold text-center block text-[#2D2825]">
                        Back View
                      </span>
                    </div>
                    <div className="space-y-1">
                      <img
                        src={req.variation.sideImageUrl || req.variation.frontImageUrl}
                        alt="Side View"
                        referrerPolicy="no-referrer"
                        className="w-full aspect-[3/4] rounded-xl object-cover object-top border border-[#E4D9D1] bg-[#FAF7F2]"
                      />
                      <span className="text-[10px] font-bold text-center block text-[#2D2825]">
                        Side View
                      </span>
                    </div>
                  </div>

                  {/* Specifications & Customer Budget */}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D2434]">
                            Request #{req.id} • Customer: {req.customerName}
                          </span>
                          <h3 className="font-serif text-xl font-bold text-[#2D2825]">
                            {req.variation.name}
                          </h3>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-[#FAF7F2] border border-[#E4D9D1] text-xs font-bold text-[#2D2825]">
                          Status: {req.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs bg-[#FAF7F2] p-3.5 rounded-2xl border border-[#E4D9D1]">
                        <div>
                          <span className="text-[10px] text-[#7D726A] uppercase block">Silhouette</span>
                          <span className="font-bold text-[#2D2825]">{req.variation.specs.dressType}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7D726A] uppercase block">Primary Fabric</span>
                          <span className="font-bold text-[#2D2825]">{req.variation.specs.fabric}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7D726A] uppercase block">Colour & Work</span>
                          <span className="font-bold text-[#2D2825]">{req.variation.specs.color}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-[#7D726A] uppercase block">Customer Budget</span>
                          <span className="font-serif text-base font-bold text-[#8D2434] tabular-nums">
                            ₹{req.targetBudget.toLocaleString('en-IN')}
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl bg-white border border-[#E4D9D1] text-xs space-y-1">
                        <span className="text-[10px] font-bold uppercase text-[#7D726A] block">
                          Customer Customization & Fit Notes (Deadline: {req.neededByDate})
                        </span>
                        <p className="text-[#2D2825] italic">"{req.specificInstructions}"</p>
                      </div>
                    </div>

                    {/* Designer Decision Buttons: Send Quotation, Request Modifications, Reject, Chat */}
                    <div className="flex flex-wrap items-center gap-2.5 pt-2">
                      <button
                        disabled={!isApproved}
                        onClick={() => openQuoteModalForRequest(req)}
                        className="px-5 py-3 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer"
                      >
                        <FileText className="w-4 h-4 text-[#D4AF37]" />
                        <span>Accept & Send Quotation</span>
                      </button>

                      {onUpdateRequestStatus && (
                        <>
                          <button
                            disabled={!isApproved}
                            onClick={() =>
                              onUpdateRequestStatus(
                                req.id,
                                'MODIFICATION_REQUESTED',
                                'Designer requested fabric/embroidery clarification.'
                              )
                            }
                            className="px-4 py-3 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E2] disabled:opacity-40 text-[#2D2825] border border-[#E4D9D1] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <RefreshCw className="w-3.5 h-3.5 text-[#8D2434]" />
                            <span>Request Modifications</span>
                          </button>

                          <button
                            disabled={!isApproved}
                            onClick={() =>
                              onUpdateRequestStatus(
                                req.id,
                                'REJECTED',
                                'Declined due to schedule capacity.'
                              )
                            }
                            className="px-4 py-3 rounded-xl bg-white hover:bg-red-50 disabled:opacity-40 text-red-700 border border-[#E4D9D1] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => onOpenChat(req.customerId, req.customerName)}
                        className="px-4 py-3 rounded-xl bg-white hover:bg-[#FAF7F2] text-[#2D2825] border border-[#E4D9D1] text-xs font-bold flex items-center gap-1.5 cursor-pointer ml-auto"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#8D2434]" />
                        <span>Message Customer</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: PRICE NEGOTIATION & BARGAINING CONSOLE */}
      {activeTab === 'negotiations' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2D2825]">
              Active Price Negotiations & Quotations
            </h2>
            <p className="text-xs text-[#7D726A]">
              Respond to customer counteroffers, propose final offers, or lock mutual price agreement so the customer can complete escrow payment.
            </p>
          </div>

          {incomingRequests.map((req) =>
            req.quotations.map((quote) => {
              const history = quote.negotiationHistory || [
                {
                  id: 'h-1',
                  quotationId: quote.id,
                  senderRole: 'customer' as const,
                  senderName: req.customerName,
                  amount: req.targetBudget,
                  message: 'Customer target budget',
                  status: 'COUNTERED' as const,
                  timestamp: '10:15 AM'
                },
                {
                  id: 'h-2',
                  quotationId: quote.id,
                  senderRole: 'tailor' as const,
                  senderName: quote.tailorName,
                  amount: quote.totalAmount,
                  message: quote.tailorMessage,
                  status: 'PROPOSED' as const,
                  timestamp: '10:45 AM'
                }
              ];
              const isBothAgreed = Boolean(quote.customerAgreed && quote.designerAgreed);
              const activePrice = quote.finalAgreedAmount || quote.totalAmount;

              return (
                <div
                  key={quote.id}
                  className="bg-white rounded-3xl border border-[#E4D9D1] p-6 space-y-5 shadow-xs"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E4D9D1] pb-4">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D2434]">
                        Quotation #{quote.id} • Client: {req.customerName}
                      </span>
                      <h3 className="font-serif text-lg font-bold text-[#2D2825]">
                        {req.variation.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-[#7D726A] font-bold block">
                          Customer Budget
                        </span>
                        <span className="font-mono text-sm font-bold text-[#7D726A] tabular-nums">
                          ₹{req.targetBudget.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] uppercase text-[#8D2434] font-bold block">
                          Current Negotiated Offer
                        </span>
                        <span className="font-serif text-xl font-bold text-[#8D2434] tabular-nums">
                          ₹{activePrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Negotiation History */}
                  <div className="space-y-2 max-h-56 overflow-y-auto bg-[#FAF7F2] p-4 rounded-2xl border border-[#E4D9D1]">
                    {history.map((h, i) => (
                      <div
                        key={h.id || i}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          h.senderRole === 'tailor'
                            ? 'bg-white border-[#E4D9D1]'
                            : 'bg-[#FBECEF]/60 border-[#8D2434]/30'
                        }`}
                      >
                        <div>
                          <span className="font-bold text-[#2D2825]">
                            {h.senderRole === 'tailor'
                              ? `Designer (${h.senderName})`
                              : `Customer (${h.senderName})`}
                          </span>
                          {h.isFinalOffer && (
                            <span className="ml-2 px-2 py-0.5 rounded bg-[#8D2434] text-white text-[9px] font-bold uppercase">
                              Final Offer
                            </span>
                          )}
                          <span className="text-[10px] text-[#7D726A] ml-2">• {h.timestamp}</span>
                          <p className="text-[#5A4638] mt-0.5">{h.message}</p>
                        </div>
                        <span className="font-serif text-base font-bold text-[#2D2825] tabular-nums">
                          ₹{h.amount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Designer Counteroffer / Final Offer Controls */}
                  {!isBothAgreed ? (
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                      <div className="relative sm:w-40">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#7D726A]">
                          ₹
                        </span>
                        <input
                          type="number"
                          value={counterOfferAmount[quote.id] || ''}
                          onChange={(e) =>
                            setCounterOfferAmount((prev) => ({
                              ...prev,
                              [quote.id]: e.target.value
                            }))
                          }
                          placeholder="e.g. 4800"
                          className="w-full pl-7 pr-3 py-2.5 rounded-xl border border-[#D9CEBA] text-xs font-bold text-[#2D2825] tabular-nums"
                        />
                      </div>

                      <input
                        type="text"
                        value={counterOfferMessage[quote.id] || ''}
                        onChange={(e) =>
                          setCounterOfferMessage((prev) => ({
                            ...prev,
                            [quote.id]: e.target.value
                          }))
                        }
                        placeholder="Designer note (e.g. Final offer ₹4,800 including hand zardozi)"
                        className="flex-1 px-3 py-2.5 rounded-xl border border-[#D9CEBA] text-xs text-[#2D2825]"
                      />

                      <label className="flex items-center gap-1.5 text-xs text-[#5A4638] cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={Boolean(isFinalOfferCheck[quote.id])}
                          onChange={(e) =>
                            setIsFinalOfferCheck((prev) => ({
                              ...prev,
                              [quote.id]: e.target.checked
                            }))
                          }
                        />
                        <span className="font-semibold">Final Offer</span>
                      </label>

                      <button
                        type="button"
                        disabled={!isApproved}
                        onClick={() => {
                          if (!onSendCounterOffer) return;
                          const amt = Number(counterOfferAmount[quote.id]);
                          if (!amt || amt <= 0) return;
                          onSendCounterOffer(
                            req.id,
                            quote.id,
                            amt,
                            counterOfferMessage[quote.id] ||
                              `Designer ${isFinalOfferCheck[quote.id] ? 'Final Offer' : 'Revised Offer'}: ₹${amt.toLocaleString('en-IN')}`,
                            'tailor',
                            Boolean(isFinalOfferCheck[quote.id])
                          );
                          setCounterOfferAmount((prev) => ({ ...prev, [quote.id]: '' }));
                          setCounterOfferMessage((prev) => ({ ...prev, [quote.id]: '' }));
                        }}
                        className="px-4 py-2.5 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Designer Offer</span>
                      </button>

                      {onAgreeToPrice && (
                        <button
                          type="button"
                          disabled={!isApproved}
                          onClick={() => onAgreeToPrice(req.id, quote.id, 'tailor')}
                          className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shrink-0"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept ₹{activePrice.toLocaleString('en-IN')}</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-semibold flex items-center justify-between">
                      <span>
                        ✓ Both Customer and Designer have agreed on the final price of ₹
                        {activePrice.toLocaleString('en-IN')}.
                      </span>
                      <span className="uppercase text-[10px] font-bold">Ready for Customer Payment</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: PRODUCT SHOWCASE MANAGEMENT */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="font-serif text-xl font-bold text-[#2D2825]">
                Designer Product Showcase & Inventory
              </h2>
              <p className="text-xs text-[#7D726A]">
                Upload ready-made collections with Front, Back, and Side photographs, manage inventory, and edit listings.
              </p>
            </div>
            <button
              disabled={!isApproved}
              onClick={() => {
                setEditingProductId(null);
                setShowProductForm(!showProductForm);
              }}
              className="px-5 py-2.5 rounded-full bg-[#8D2434] hover:bg-[#6E1B28] disabled:opacity-40 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer self-start"
            >
              <Plus className="w-4 h-4" />
              <span>{showProductForm ? 'Close Form' : 'Upload New Dress Collection'}</span>
            </button>
          </div>

          {/* Upload / Edit Product Form */}
          {showProductForm && (
            <form
              onSubmit={handleSaveProduct}
              className="bg-white rounded-3xl border border-[#E4D9D1] p-6 space-y-4 shadow-sm"
            >
              <h3 className="font-serif text-lg font-bold text-[#2D2825]">
                {editingProductId ? 'Edit Dress Listing' : 'Upload New Ready-Made / Showcase Dress'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">Dress Title</label>
                  <input
                    type="text"
                    required
                    value={prodTitle}
                    onChange={(e) => setProdTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">Category & Occasion</label>
                  <select
                    value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                  >
                    <option value="Bridal">Bridal</option>
                    <option value="Festive">Festive</option>
                    <option value="Party">Party & Evening</option>
                    <option value="Traditional">Traditional</option>
                    <option value="Western">Western Couture</option>
                    <option value="Casual">Casual Luxury</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">Primary Fabric</label>
                  <input
                    type="text"
                    required
                    value={prodFabric}
                    onChange={(e) => setProdFabric(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">Colour Shade</label>
                  <input
                    type="text"
                    required
                    value={prodColor}
                    onChange={(e) => setProdColor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">Price (INR)</label>
                  <input
                    type="number"
                    required
                    value={prodPrice}
                    onChange={(e) => setProdPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2] font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">Available Sizes</label>
                  <input
                    type="text"
                    required
                    value={prodSizes}
                    onChange={(e) => setProdSizes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">Inventory Stock Count</label>
                  <input
                    type="number"
                    required
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2] font-bold tabular-nums"
                  />
                </div>
              </div>

              {/* Front, Back & Side Product Photographs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">
                    1. Front Photograph URL
                  </label>
                  <input
                    type="url"
                    required
                    value={prodFrontImg}
                    onChange={(e) => setProdFrontImg(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">
                    2. Back Photograph URL
                  </label>
                  <input
                    type="url"
                    required
                    value={prodBackImg}
                    onChange={(e) => setProdBackImg(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">
                    3. Side Photograph URL
                  </label>
                  <input
                    type="url"
                    required
                    value={prodSideImg}
                    onChange={(e) => setProdSideImg(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div className="text-xs">
                <label className="block font-bold text-[#2D2825] mb-1">Garment Description</label>
                <textarea
                  rows={2}
                  required
                  value={prodDescription}
                  onChange={(e) => setProdDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-[#E4D9D1] text-xs font-bold text-[#7D726A] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
                >
                  {editingProductId ? 'Save Product Changes' : 'Publish to Customer Marketplace'}
                </button>
              </div>
            </form>
          )}

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl border border-[#E4D9D1] p-4 flex flex-col justify-between space-y-3 shadow-2xs"
              >
                <div className="flex gap-3">
                  <img
                    src={prod.frontImageUrl || prod.images[0]}
                    alt={prod.title}
                    referrerPolicy="no-referrer"
                    className="w-20 h-26 rounded-xl object-cover object-top border border-[#E4D9D1] shrink-0"
                  />
                  <div className="space-y-1 min-w-0 flex-1">
                    <span className="text-[10px] font-bold uppercase text-[#8D2434] block">
                      {prod.fabric} • Stock: {prod.stockCount ?? 6}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-[#2D2825] line-clamp-1">
                      {prod.title}
                    </h4>
                    <p className="font-serif text-base font-bold text-[#2D2825] tabular-nums">
                      ₹{prod.price.toLocaleString('en-IN')}
                    </p>
                    <p className="text-[11px] text-[#7D726A]">
                      Sizes: {(prod.sizes || ['S', 'M', 'L']).join(', ')}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#FAF7F2]">
                  <button
                    onClick={() => handleEditExistingProduct(prod)}
                    className="px-3 py-1.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE9E2] text-[#2D2825] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  {onDeleteProduct && (
                    <button
                      onClick={() => onDeleteProduct(prod.id)}
                      className="px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVE PRODUCTION ORDERS & STRICT STATUS TRANSITIONS */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          <div>
            <h2 className="font-serif text-xl font-bold text-[#2D2825]">
              Order Production & Delivery Pipeline
            </h2>
            <p className="text-xs text-[#7D726A]">
              Strict workflow transitions: Pending → Accepted → Awaiting Payment → In Production → Quality Check → Shipped → Delivered
            </p>
          </div>

          <div className="space-y-6">
            {activeOrders.map((order) => {
              const dressVar = order.variation || order.design;
              const currentWf = getOrderWorkflowStatus(order);
              const nextWf = getNextValidWorkflowStatus(currentWf);

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl border border-[#E4D9D1] p-6 shadow-xs space-y-5"
                >
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E4D9D1]">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={
                          dressVar?.frontImageUrl ||
                          'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'
                        }
                        alt={dressVar?.name || 'Order Gown'}
                        referrerPolicy="no-referrer"
                        className="w-16 h-20 rounded-xl object-cover border border-[#E4D9D1]"
                      />
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D2434]">
                          Order #{order.id} • {order.orderType === 'ready-to-wear' ? 'Ready-Made Dress' : 'Custom AI Bespoke Order'}
                        </span>
                        <h3 className="font-serif text-lg font-bold text-[#2D2825]">
                          {dressVar?.name || 'Bespoke Garment'}
                        </h3>
                        <p className="text-xs text-[#7D726A]">
                          Customer: <strong className="text-[#2D2825]">{order.customerName}</strong> • Escrow Amount:{' '}
                          <strong className="text-[#2D2825] tabular-nums">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </strong>
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => onOpenChat(order.customerId, order.customerName)}
                        className="px-4 py-2.5 rounded-xl bg-[#FAF7F2] text-[#2D2825] border border-[#E4D9D1] text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-[#8D2434]" />
                        <span>Customer Chat</span>
                      </button>

                      {nextWf && onAdvanceOrderStatus && (
                        <button
                          onClick={() => onAdvanceOrderStatus(order.id, nextWf)}
                          className="px-4 py-2.5 rounded-xl bg-[#8D2434] hover:bg-[#6E1B28] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <span>Advance to: {nextWf}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* 7-Step Valid Status Pipeline Bar */}
                  <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#E4D9D1]">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#7D726A] mb-3">
                      Enforced Order Status Pipeline (Current: <span className="text-[#8D2434]">{currentWf}</span>)
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-7 gap-2">
                      {ORDERED_WORKFLOW_STEPS.map((stepName, idx) => {
                        const currIdx = ORDERED_WORKFLOW_STEPS.indexOf(currentWf);
                        const isCompleted = idx <= currIdx;
                        const isCurrent = idx === currIdx;
                        return (
                          <div
                            key={stepName}
                            className={`p-2 rounded-xl border text-center text-[10px] font-bold transition-all ${
                              isCurrent
                                ? 'bg-[#8D2434] text-white border-[#8D2434] shadow-2xs'
                                : isCompleted
                                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                                : 'bg-white text-[#7D726A] border-[#E4D9D1] opacity-60'
                            }`}
                          >
                            <div className="truncate">
                              {idx + 1}. {stepName}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Milestones & Photo Proof Upload */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {order.milestones.map((m, mIdx) => {
                      const isDone = m.status === 'COMPLETED' || m.completed;
                      const title = m.title || m.label || m.stage || `Stage ${mIdx + 1}`;
                      return (
                        <div
                          key={m.id || mIdx}
                          className={`p-4 rounded-2xl border text-xs flex flex-col justify-between space-y-3 ${
                            isDone ? 'bg-[#FAF7F2] border-emerald-300' : 'bg-white border-[#E4D9D1]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-[#2D2825]">{title}</span>
                              <span
                                className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                  isDone
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-[#FAF7F2] text-[#7D726A] border border-[#E4D9D1]'
                                }`}
                              >
                                {isDone ? 'COMPLETED' : m.status || 'PENDING'}
                              </span>
                            </div>
                            <p className="text-[#7D726A] text-[11px]">{m.description}</p>
                            {m.customerRating && (
                              <div className="mt-2 p-2 rounded-lg bg-amber-50 border border-amber-200 text-[10px] text-amber-950">
                                ★ Customer Rated: Quality {m.customerRating.qualityRating}/5 • Timeliness{' '}
                                {m.customerRating.timelinessRating}/5
                              </div>
                            )}
                          </div>

                          {!isDone && (
                            <button
                              onClick={() =>
                                onAdvanceMilestone(
                                  order.id,
                                  m.id || m.stage || String(mIdx),
                                  photoProofInput
                                )
                              }
                              className="w-full py-2 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white font-bold text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span>Complete & Upload Photo Proof</span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 5: DESIGNER APPLICATION, PORTFOLIO & PROFILE DOSSIER */}
      {activeTab === 'portfolio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E4D9D1] p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#2D2825]">
              Designer Registration & Verification Profile
            </h2>
            <p className="text-xs text-[#7D726A]">
              Keep your business details, specialization, pricing range, and verification credentials up to date for Admin review.
            </p>

            {profileSavedBanner && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-semibold flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>Atelier profile & application details updated!</span>
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (onUpdateTailorProfile) {
                  onUpdateTailorProfile({
                    ...currentTailor,
                    shopName: profileShopName,
                    specialties: profileSpecialties.split(',').map((s) => s.trim()),
                    experienceYears: Number(profileExperience),
                    city: profileCity,
                    pricingRange: profilePricingRange,
                    bio: profileBio
                  });
                }
                setProfileSavedBanner(true);
                setTimeout(() => setProfileSavedBanner(false), 2500);
              }}
              className="space-y-3.5 text-xs"
            >
              <div>
                <label className="block font-bold text-[#2D2825] mb-1">
                  Atelier / Business Name
                </label>
                <input
                  type="text"
                  value={profileShopName}
                  onChange={(e) => setProfileShopName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">
                    Experience (Years)
                  </label>
                  <input
                    type="number"
                    value={profileExperience}
                    onChange={(e) => setProfileExperience(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#2D2825] mb-1">
                    Service Location
                  </label>
                  <input
                    type="text"
                    value={profileCity}
                    onChange={(e) => setProfileCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#2D2825] mb-1">
                  Specializations (comma separated)
                </label>
                <input
                  type="text"
                  value={profileSpecialties}
                  onChange={(e) => setProfileSpecialties(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2825] mb-1">
                  Pricing Range (INR)
                </label>
                <input
                  type="text"
                  value={profilePricingRange}
                  onChange={(e) => setProfilePricingRange(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#2D2825] mb-1">
                  Craftsmanship Bio & Equipment
                </label>
                <textarea
                  rows={3}
                  value={profileBio}
                  onChange={(e) => setProfileBio(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-[#2D2825] hover:bg-[#8D2434] text-white font-bold uppercase tracking-wider cursor-pointer"
              >
                Save Atelier Application Details
              </button>
            </form>
          </div>

          <div className="lg:col-span-6 bg-white rounded-3xl border border-[#E4D9D1] p-6 space-y-4">
            <h2 className="font-serif text-xl font-bold text-[#2D2825]">
              Completed Custom Designs & Portfolio ({currentTailor.portfolio.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentTailor.portfolio.map((work) => (
                <div
                  key={work.id}
                  className="rounded-2xl border border-[#E4D9D1] overflow-hidden bg-[#FAF7F2]"
                >
                  <img
                    src={work.imageUrl}
                    alt={work.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-44 object-cover object-top"
                  />
                  <div className="p-3.5 space-y-1 text-xs">
                    <span className="text-[10px] font-bold uppercase text-[#8D2434]">
                      {work.category}
                    </span>
                    <h4 className="font-serif font-bold text-[#2D2825]">{work.title}</h4>
                    <p className="text-[11px] text-[#7D726A] line-clamp-2">{work.description}</p>
                    <div className="pt-1 flex items-center justify-between font-bold text-[#2D2825]">
                      <span>₹{work.price.toLocaleString('en-IN')}</span>
                      <span>{work.completionTimeDays} Days</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Itemized Quotation Modal (INR) */}
      {selectedRequestForQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-[#E4D9D1] shadow-2xl p-6 sm:p-8 space-y-5 my-8">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D2434] block">
                  DESIGNER QUOTATION BUILDER
                </span>
                <h3 className="font-serif text-xl font-bold text-[#2D2825]">
                  Send Quotation to {selectedRequestForQuote.customerName}
                </h3>
                <p className="text-xs text-[#7D726A]">
                  Customer Budget: ₹{selectedRequestForQuote.targetBudget.toLocaleString('en-IN')}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequestForQuote(null)}
                className="text-xs font-bold text-[#7D726A] hover:text-[#2D2825] uppercase cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-[#FAF7F2] p-4 rounded-2xl border border-[#E4D9D1]">
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#7D726A] block mb-1">
                    Fabric & Lining (₹)
                  </label>
                  <input
                    type="number"
                    value={fabricAmount}
                    onChange={(e) => setFabricAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#7D726A] block mb-1">
                    Master Stitching (₹)
                  </label>
                  <input
                    type="number"
                    value={stitchingAmount}
                    onChange={(e) => setStitchingAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#7D726A] block mb-1">
                    Hand Embroidery (₹)
                  </label>
                  <input
                    type="number"
                    value={handworkAmount}
                    onChange={(e) => setHandworkAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold tabular-nums"
                    required
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-[#7D726A] block mb-1">
                    Finishing & Packaging (₹)
                  </label>
                  <input
                    type="number"
                    value={finishingAmount}
                    onChange={(e) => setFinishingAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-white border border-[#E4D9D1] text-[#2D2825] font-bold tabular-nums"
                    required
                  />
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4D9D1] flex items-center justify-between">
                <span className="font-bold text-[#2D2825] uppercase text-[10px] tracking-wider">
                  Total Quotation Amount:
                </span>
                <span className="font-serif text-2xl font-bold text-[#8D2434] tabular-nums">
                  ₹{totalQuoteAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#7D726A] block mb-1">
                  Estimated Production Timeline (Days)
                </label>
                <input
                  type="number"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E4D9D1] text-[#2D2825] font-bold tabular-nums"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[#7D726A] block mb-1">
                  Tailor Proposal & Fabric Notes
                </label>
                <textarea
                  value={tailorProposalNote}
                  onChange={(e) => setTailorProposalNote(e.target.value)}
                  rows={3}
                  className="w-full p-3 rounded-xl bg-[#FAF7F2] border border-[#E4D9D1] text-[#2D2825] text-xs"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-[#8D2434] hover:bg-[#6E1B28] text-white font-bold text-xs uppercase tracking-widest shadow-md cursor-pointer"
              >
                Send Quotation & Open Price Negotiation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
