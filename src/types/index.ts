export type UserRole = 'customer' | 'tailor' | 'admin';

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatar: string;
  city: string;
  savedAddresses?: string[];
  walletBalanceINR: number;
}

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type DressType = 
  | 'Bridal Lehenga & Choli'
  | 'Royal Anarkali Suit'
  | 'Banarasi Silk Anarkali'
  | 'Kanjeevaram Saree Gown'
  | 'Designer Blouse & Dupatta'
  | 'Indo-Western Lehanga'
  | 'Indo-Western Gown'
  | 'Haldi & Mehendi Sharara'
  | 'Sharara & Gharara Set'
  | 'Royal Sherwani & Churidar'
  | 'Embroidered Kurta Pajama'
  | 'A-Line Evening Gown'
  | 'Mermaid Silhouette'
  | 'Ball Gown'
  | 'Cocktail Dress'
  | 'Silk Slip Dress'
  | 'Modern Blazer Dress'
  | 'Halter Draped Gown'
  | 'Contemporary Qipao'
  | 'Boho Maxi Dress'
  | 'Corset Tiered Dress';

export type Occasion = 
  | 'Indian Wedding & Reception'
  | 'Sangeet & Cocktail Night'
  | 'Mehendi & Haldi Celebration'
  | 'Mehendi & Haldi Ceremony'
  | 'Festive & Diwali Gala'
  | 'Festive Puja & Diwali'
  | 'Bridal & Wedding'
  | 'Red Carpet & Gala'
  | 'Cocktail Soirée'
  | 'Festive & Celebration'
  | 'Prom & Graduation'
  | 'High Tea & Garden Party'
  | 'Corporate Luxury';

export type FabricType = 
  | 'Banarasi Katan Silk'
  | 'Pure Kanjeevaram Silk'
  | 'Silk Velvet'
  | 'Pure Raw Silk'
  | 'Lucknowi Chikankari Georgette'
  | 'Chanderi Brocade'
  | 'Mulberry Silk'
  | 'French Chantilly Lace'
  | 'Silk Organza'
  | 'Heavy Crepe de Chine'
  | 'Duchess Satin'
  | 'Banarasi Brocade'
  | 'Tulle & Mesh'
  | 'Pure Chiffon'
  | 'Linen Satin Blend';

export type SleeveStyle = 
  | 'Sleeveless / Bandeau'
  | 'Bishop Puff Sleeves'
  | 'Cap Sleeves'
  | 'Off-Shoulder Draped'
  | 'Illusion Lace Long Sleeves'
  | 'Bell Sleeves'
  | 'French Tailored Cuffs'
  | 'Kimono Drapes'
  | 'Elbow-Length Embroidered'
  | 'Churidar Gathered Sleeves'
  | 'Full Length Fitted Churidaar'
  | 'Sleeveless Halter Choli'
  | 'Regal Cape Sleeves'
  | 'Cape & Drape Sleeves';

export type NeckDesign = 
  | 'Sweetheart'
  | 'Plunging Deep V-Neck'
  | 'High Halter Neck'
  | 'Queen Anne'
  | 'Mandarin Collar'
  | 'Boat / Bateau Neck'
  | 'Illusion Boat Neck'
  | 'Asymmetrical Draped'
  | 'Cowl Neck'
  | 'Regal Paan Neck'
  | 'Angrakha Wrap V-Neck'
  | 'Angrakha Overlap Neck'
  | 'Deep V-Plunge with Dori'
  | 'Mandarin Bandhgala';

export type PatternStyle = 
  | 'Hand Zardozi & Dabka Gold'
  | 'Real Gota Patti & Mirror Work'
  | 'Mirror & Gota Patti Artisan Work'
  | 'Lucknowi Resham Threadwork'
  | 'Pearl & Kundan Beadwork'
  | 'Banarasi Zari Weave'
  | 'Kashmiri Tilla Embroidery'
  | 'Kashmiri Tilla & Aari Embroidery'
  | 'Cutdana & Sequins Work'
  | 'Pearl & Swarovski Beadwork'
  | 'Hand Zardozi Gold Embroidery'
  | 'Minimalist Clean Monochrome'
  | 'Hand-Painted Floral Botanicals'
  | 'Sunburst Pleating'
  | 'Jacquard Brocade Weave'
  | 'Cutout Geometry & Crystal Edging';

export interface ColorOption {
  name: string;
  hex: string;
  accentHex?: string;
  family: string;
  description: string;
}

export interface CustomizationSpecs {
  dressType: DressType;
  occasion: Occasion;
  fabric: FabricType;
  color: string;
  sleeve: SleeveStyle;
  neckline: NeckDesign;
  pattern: PatternStyle;
  waistStyle?: string;
  backDesign?: string;
  length?: string;
  embroidery?: string;
  accessories?: string;
  borderDesign?: string;
  lining?: string;
  fit?: string;
  style?: string;
  budget?: string;
}

export interface DressDesignVariation {
  id: string;
  name: string;
  tagline: string;
  frontImageUrl: string;
  backImageUrl?: string;
  sideImageUrl?: string;
  fabricDetails: {
    primary: string;
    lining: string;
    embellishments: string;
    estimatedYards: number;
    recommendedWeightGsm: number;
  };
  tailorNotes: string[];
  stylingTips: string[];
  colorPsychology: string;
  estimatedCraftTimeDays: number;
  estimatedPriceRange: {
    min: number;
    max: number;
    currency: string;
  };
  specs: CustomizationSpecs;
}

export interface DressDesign {
  id: string;
  customerId: string;
  customerName: string;
  title: string;
  prompt: string;
  createdAt: string;
  isFavorite: boolean;
  variations: DressDesignVariation[];
  selectedVariationIndex: number;
  tags: string[];
}

export interface PortfolioWork {
  id: string;
  title: string;
  category: string;
  imageUrl: string;
  completionTimeDays: number;
  price: number;
  description: string;
  customerRating: number;
}

export interface TailorProfile {
  id: string;
  userId: string;
  name: string;
  shopName: string;
  avatar: string;
  coverImage: string;
  city: string;
  state: string;
  country: string;
  distanceKm?: number;
  experienceYears: number;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  rating: number;
  reviewCount: number;
  completedOrders: number;
  specialties: string[];
  bio: string;
  badge: 'Master Artisan' | 'Bridal Specialist' | 'Couturier' | 'Verified Pro';
  startingPrice: number;
  averageTurnaroundDays: number;
  portfolio: PortfolioWork[];
  shopAddress: string;
  phone: string;
  equipment: string[];
  certifications: string[];
  idProofUrl?: string;
  businessLicenseUrl?: string;
  reviews?: Review[];
}

export interface QuotationItem {
  id: string;
  description: string;
  amount: number;
  category: 'Fabric' | 'Stitching' | 'Embroidery & Handwork' | 'Lining & Accessories' | 'Rush Fee' | 'Finishing';
}

export interface TailorQuotation {
  id: string;
  requestId: string;
  tailorId: string;
  tailorName: string;
  tailorShopName: string;
  tailorAvatar: string;
  tailorRating: number;
  items: QuotationItem[];
  totalAmount: number;
  currency: string;
  estimatedDeliveryDays: number;
  proposedDeliveryDate: string;
  fabricIncluded: boolean;
  tailorMessage: string;
  milestones: {
    title: string;
    percentage: number;
    description: string;
  }[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';
  createdAt: string;
}

export interface QuotationRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  dressDesignId?: string;
  designId?: string;
  measurementsId?: string;
  variation: DressDesignVariation;
  targetBudget: number;
  neededByDate: string;
  specificInstructions: string;
  city?: string;
  createdAt: string;
  status: 'OPEN' | 'QUOTATIONS_RECEIVED' | 'ACCEPTED' | 'CLOSED';
  quotations: TailorQuotation[];
}

export type OrderStage = 
  | 'QUOTATION_ACCEPTED'
  | 'MEASUREMENTS_CONFIRMED'
  | 'FABRIC_SOURCING'
  | 'PATTERN_MAKING'
  | 'FIRST_FITTING'
  | 'FINAL_STITCHING'
  | 'QUALITY_INSPECTION'
  | 'SHIPPED'
  | 'DELIVERED'
  | 'COMPLETED'
  | 'CANCELLED';

export type EscrowStatus = 'SECURED_IN_ESCROW' | 'PARTIALLY_RELEASED' | 'RELEASED_TO_TAILOR' | 'REFUNDED' | 'LOCKED';

export type OrderProgressStatus = 'IN_PRODUCTION' | 'FITTING_STAGE' | 'READY_FOR_DISPATCH' | 'SHIPPED' | 'DELIVERED' | 'COMPLETED' | 'CANCELLED';

export interface OrderMilestone {
  id?: string;
  orderId?: string;
  stage: OrderStage | 'MEASUREMENTS_VERIFIED' | 'FABRIC_SOURCED' | 'QUOTATION_ACCEPTED' | 'PATTERN_MAKING' | 'FIRST_FITTING' | 'FINAL_STITCHING' | 'QUALITY_INSPECTION' | 'SHIPPED' | 'DELIVERED';
  title?: string;
  label?: string;
  description: string;
  status?: MilestoneStatus;
  completed?: boolean;
  completedAt?: string;
  photoUrl?: string;
  photoProof?: string;
  payoutReleased?: boolean;
}

export interface MeasurementSheet {
  id?: string;
  customerId?: string;
  unit: 'inches' | 'cm';
  bust: number;
  waist: number;
  highHip: number;
  lowHip: number;
  shoulderToShoulder: number;
  shoulderToWaist: number;
  waistToHem: number;
  hollowToFloor: number;
  armhole: number;
  bicep: number;
  sleeveLength: number;
  neckCircumference: number;
  height: number;
  blouseLength?: number;
  frontNeckDepth?: number;
  backNeckDepth?: number;
  lehengaLength?: number;
  churidarLength?: number;
  fitPreference: 'Snug' | 'Tailored / Regular' | 'Relaxed / Flowing';
  postureNotes?: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber?: string;
  orderType?: 'tailor' | 'ready-to-wear';
  marketplaceItem?: MarketplaceProduct;
  selectedSize?: string;
  customerId: string;
  customerName: string;
  tailorId: string;
  tailorName: string;
  tailorShopName: string;
  tailorAvatar: string;
  design?: DressDesignVariation;
  variation?: DressDesignVariation;
  designId?: string;
  quotation?: TailorQuotation;
  quotationId?: string;
  measurements?: MeasurementSheet;
  measurementsSnapshot?: MeasurementSheet;
  currentStage?: OrderStage;
  status?: OrderProgressStatus | OrderStage;
  milestones: OrderMilestone[];
  totalAmount: number;
  paidAmount?: number;
  depositAmount?: number;
  balanceAmount?: number;
  currency?: string;
  escrowStatus: EscrowStatus;
  escrowVaultId?: string;
  estimatedDelivery?: string;
  estimatedDeliveryDate?: string;
  orderDate?: string;
  createdAt?: string;
  trackingNumber?: string;
  carrier?: string;
  reviewSubmitted?: boolean;
}

export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

export interface CustomerProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  city?: string;
  avatar: string;
  savedAddresses?: string[];
  loyaltyTier?: string;
  totalOrders?: number;
  memberSince?: string;
}

export interface TailorVerificationDocument {
  id: string;
  tailorId?: string;
  type: string;
  name?: string;
  fileUrl: string;
  uploadedAt: string;
  status?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verificationStatus?: 'PENDING' | 'VERIFIED' | 'REJECTED';
  notes?: string;
}

export interface ChatMessage {
  id: string;
  orderId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  receiverId?: string;
  text?: string;
  content?: string;
  type?: 'TEXT' | 'IMAGE' | 'MEASUREMENT_CARD' | 'FABRIC_SWATCH' | 'AUDIO_VOICE_NOTE';
  timestamp: string;
  attachmentType?: 'image' | 'measurement' | 'quotation' | 'swatch' | 'audio';
  attachmentData?: any;
  attachments?: string[];
  audioUrl?: string;
  duration?: string;
  isRead: boolean;
}

export interface Review {
  id: string;
  orderId?: string;
  tailorId?: string;
  customerId: string;
  customerName: string;
  customerAvatar: string;
  dressTitle: string;
  overallRating?: number;
  ratingOverall?: number;
  fitRating?: number;
  ratingFit?: number;
  craftsmanshipRating?: number;
  ratingCraft?: number;
  timelinessRating?: number;
  ratingPunctuality?: number;
  comment: string;
  photos: string[];
  tailorReply?: string;
  createdAt: string;
}

export interface AdminAnalytics {
  totalGMV: number;
  totalOrders: number;
  activeOrders: number;
  completedOrders: number;
  totalCustomers: number;
  totalTailors: number;
  pendingTailorVerifications: number;
  totalDesignsGenerated: number;
  avgRating: number;
  monthlyRevenue: { month: string; gmv: number; commission: number }[];
  categoryDistribution: { category: string; count: number; percentage: number }[];
  totalGrossMarketplaceValue?: number;
  activeEscrowVaultVolume?: number;
  totalDressDesignsGenerated?: number;
  verifiedTailorsCount?: number;
  totalEscrowLocked?: number;
  activeDisputesCount?: number;
}

export type AnalyticsSummary = AdminAnalytics & {
  totalGrossMarketplaceValue?: number;
  activeEscrowVaultVolume?: number;
  totalDressDesignsGenerated: number;
  verifiedTailorsCount: number;
  totalEscrowLocked: number;
  activeDisputesCount: number;
};

export interface MarketplaceProduct {
  id: string;
  title: string;
  category: 'ready-to-wear' | 'featured' | 'designer' | 'premium' | 'limited-edition' | 'curated-resale';
  categoryLabel: string;
  designerName: string;
  designerAvatar?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  sizes: string[];
  fabric: string;
  description: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  inStock: boolean;
  leadTimeDays?: number;
  specs?: {
    color?: string;
    length?: string;
    washCare?: string;
    work?: string;
  };
  reviews?: {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'design_ready' | 'quote_received' | 'tailor_accepted' | 'order_delivered' | 'system';
  timestamp: string;
  isRead: boolean;
  actionTab?: string;
  actionId?: string;
}

export interface AIMeasurementScan {
  frontPhotoUrl?: string;
  sidePhotoUrl?: string;
  heightCm: number;
  detectedMetrics: {
    shoulder: number;
    bust: number;
    waist: number;
    hip: number;
    arm: number;
    leg: number;
    dressLength: number;
  };
  confidenceScore: number;
  calibratedAt: string;
}

