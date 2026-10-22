import { 
  DressDesign, 
  TailorProfile, 
  QuotationRequest, 
  Order, 
  ChatMessage, 
  Review, 
  AdminAnalytics,
  ColorOption,
  MeasurementSheet,
  CustomerProfile,
  AnalyticsSummary,
  AuthUser,
  MarketplaceProduct,
  NotificationItem
} from '../types';

export const DEMO_USERS: AuthUser[] = [
  {
    id: 'cust-1',
    name: 'Ananya Verma',
    phone: '+91 98201 54321',
    email: 'ananya.verma@mumbai.in',
    role: 'customer',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    city: 'Mumbai, Maharashtra',
    savedAddresses: [
      'Flat 802, Sea Green Apartments, Carter Road, Bandra West, Mumbai - 400050',
      'Tower 4, DLF Magnolias, Golf Course Road, Gurugram - 122002'
    ],
    walletBalanceINR: 52000
  },
  {
    id: 'tailor-1',
    name: 'Ustad Rafiq Ahmed',
    phone: '+91 98112 34567',
    email: 'rafiq.ahmed@darzicouture.in',
    role: 'tailor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    city: 'Old Delhi, Delhi NCR',
    savedAddresses: ['Atelier 42, Kinari Bazaar, Chandni Chowk, Old Delhi - 110006'],
    walletBalanceINR: 145000
  },
  {
    id: 'admin-1',
    name: 'Vikramaditya Singhania',
    phone: '+91 99990 00001',
    email: 'vikram@pearlpick.in',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    city: 'New Delhi, Delhi NCR',
    savedAddresses: ['Pearl Pick HQ, Barakhamba Road, Connaught Place, New Delhi - 110001'],
    walletBalanceINR: 850000
  }
];

export const LUXURY_COLORS: ColorOption[] = [
  { name: 'Sindoor Red', hex: '#C72C48', accentHex: '#D4AF37', family: 'Reds', description: 'Traditional sacred crimson with regal 24K gold zardozi sheen' },
  { name: 'Rani Gulabi Pink', hex: '#E75480', accentHex: '#FAD2E1', family: 'Pinks', description: 'Vibrant royal fuchsia celebrated across royal Rajasthan and bridal trousseaus' },
  { name: 'Imperial Emerald', hex: '#1B4332', accentHex: '#2D6A4F', family: 'Jewel Tones', description: 'Deep velvet forest emerald reminiscent of Mughal royalty and jade jewelry' },
  { name: 'Morpankhi Peacock Blue', hex: '#0F4C81', accentHex: '#3A506B', family: 'Blues', description: 'Dramatic iridescent peacock feather blue with silver zari highlights' },
  { name: 'Haldi Golden Ochre', hex: '#E5A93B', accentHex: '#FFE6A7', family: 'Earth', description: 'Radiant turmeric gold crafted for festive mehendi and auspicious rituals' },
  { name: 'Antique Gold & Ivory', hex: '#F7F3E9', accentHex: '#D4AF37', family: 'Neutrals', description: 'Crisp timeless Kanjeevaram off-white with antique zari borders' },
  { name: 'Mehendi Green', hex: '#556B2F', accentHex: '#8FBC8F', family: 'Greens', description: 'Earthy organic sage olive green popular for sangeet celebrations' },
  { name: 'Bordeaux Wine Velvet', hex: '#581845', accentHex: '#900C3F', family: 'Reds', description: 'Rich deep wine with opulent micro-pile for winter wedding receptions' },
  { name: 'Kashi Midnight Obsidian', hex: '#1A181B', accentHex: '#BFA054', family: 'Dark', description: 'Modern Indo-Western black silk paired with metallic antique gold accents' },
  { name: 'Lavender Gulmarg Mist', hex: '#D8BFD8', accentHex: '#E6E6FA', family: 'Pastels', description: 'Soft modern pastel lilac with translucent resham threadwork' },
];

export const DRESS_TYPE_OPTIONS = [
  'Bridal Lehenga & Choli',
  'Royal Anarkali Suit',
  'Kanjeevaram Saree Gown',
  'Designer Blouse & Dupatta',
  'Indo-Western Lehanga',
  'Haldi & Mehendi Sharara',
  'Royal Sherwani & Churidar',
  'Embroidered Kurta Pajama',
  'A-Line Evening Gown',
  'Mermaid Silhouette',
  'Ball Gown',
  'Cocktail Dress',
  'Silk Slip Dress',
  'Modern Blazer Dress',
  'Halter Draped Gown',
  'Contemporary Qipao',
  'Boho Maxi Dress',
  'Corset Tiered Dress',
] as const;

export const OCCASION_OPTIONS = [
  'Indian Wedding & Reception',
  'Sangeet & Cocktail Night',
  'Mehendi & Haldi Celebration',
  'Festive & Diwali Gala',
  'Bridal & Wedding',
  'Red Carpet & Gala',
  'Cocktail Soirée',
  'Festive & Celebration',
  'Prom & Graduation',
  'High Tea & Garden Party',
  'Corporate Luxury',
] as const;

export const FABRIC_OPTIONS = [
  'Banarasi Katan Silk',
  'Pure Kanjeevaram Silk',
  'Silk Velvet',
  'Pure Raw Silk',
  'Lucknowi Chikankari Georgette',
  'Chanderi Brocade',
  'Mulberry Silk',
  'French Chantilly Lace',
  'Silk Organza',
  'Heavy Crepe de Chine',
  'Duchess Satin',
  'Banarasi Brocade',
  'Tulle & Mesh',
  'Pure Chiffon',
  'Linen Satin Blend',
] as const;

export const SLEEVE_OPTIONS = [
  'Elbow-Length Embroidered',
  'Churidar Gathered Sleeves',
  'Regal Cape Sleeves',
  'Bishop Puff Sleeves',
  'Sleeveless / Bandeau',
  'Off-Shoulder Draped',
  'Illusion Lace Long Sleeves',
  'Bell Sleeves',
  'Cap Sleeves',
  'French Tailored Cuffs',
  'Kimono Drapes',
] as const;

export const NECK_OPTIONS = [
  'Regal Paan Neck',
  'Deep Sweetheart',
  'Angrakha Wrap V-Neck',
  'Mandarin Bandhgala',
  'Boat / Bateau Neck',
  'Plunging Deep V-Neck',
  'Queen Anne',
  'High Halter Neck',
  'Asymmetrical Draped',
  'Cowl Neck',
] as const;

export const PATTERN_OPTIONS = [
  'Hand Zardozi & Dabka Gold',
  'Real Gota Patti & Mirror Work',
  'Lucknowi Resham Threadwork',
  'Pearl & Kundan Beadwork',
  'Banarasi Zari Weave',
  'Kashmiri Tilla Embroidery',
  'Pearl & Swarovski Beadwork',
  'Hand Zardozi Gold Embroidery',
  'Minimalist Clean Monochrome',
  'Hand-Painted Floral Botanicals',
  'Sunburst Pleating',
  'Jacquard Brocade Weave',
  'Cutout Geometry & Crystal Edging',
] as const;

export const WAIST_STYLE_OPTIONS = [
  'Corseted Basque',
  'High Empire',
  'Cinched Sabyasachi Belted',
  'Natural Classical',
  'Asymmetric Drop Waist',
  'Internal Boned Bodice',
] as const;

export const BACK_DESIGN_OPTIONS = [
  'Deep U with Latkan Dori',
  'Sheer Illusion Lace',
  'Regal Keyhole with Pearl Button',
  'Criss-Cross Tie Drapes',
  'Royal Backless with Tassels',
  'High Boat Back with Potli Loops',
] as const;

export const LENGTH_OPTIONS = [
  'Floor-Sweeping (44")',
  'Ankle-Length (39")',
  'Dramatic Trailing Court (52")',
  'Asymmetric High-Low',
  'Tea Length (36")',
] as const;

export const EMBROIDERY_OPTIONS = [
  'Authentic 24K Dabka Zardozi',
  'Real Gota Patti & Mirror Work',
  'Lucknowi Resham Threadwork',
  'Kashmiri Tilla Hand Needlework',
  'Pearl & Swarovski Micro-Beadwork',
  'Minimalist Hand-Corded Seams',
] as const;

export const ACCESSORIES_OPTIONS = [
  'Matching Embroidered Dupatta & Potli',
  'Beaded Waist Belt (Kamarbandh)',
  'Artisan Fabric Latkans with Pearls',
  'Detachable Organza Cape Drape',
  'Minimal Tissue Scallop Veil',
] as const;

export const BORDER_DESIGN_OPTIONS = [
  'Scalloped Zari Temple Border',
  'Broad 4-Inch Contrast Velvet Border',
  'Micro Gota Kinari Piping',
  'Pearl Scalloped Edging',
  'Raw Edge Self-Fringed',
] as const;

export const LINING_OPTIONS = [
  'Pure Cotton Mulmul (Breathable)',
  'Premium Butter Crepe',
  'Pure Shantoon Silk',
  'Cupro Habotai',
] as const;

export const FIT_OPTIONS = [
  'Snug Bespoke Corseted',
  'Tailored Classical Regular',
  'Flared Dramatic 16-Kali',
  'Fluid Relaxed Bias-Cut',
] as const;

export const STYLE_OPTIONS = [
  'Royal Heritage Rajputana',
  'Minimalist Modern Luxury',
  'Indo-Western Red Carpet',
  'Bohemian Mughal Romance',
] as const;

export const BUDGET_TIERS = [
  { label: 'Boutique Prêt (₹12,000 - ₹20,000)', value: '₹16,000' },
  { label: 'Couture Festive (₹22,000 - ₹40,000)', value: '₹32,000' },
  { label: 'Royal Bridal Trousseau (₹45,000 - ₹95,000+)', value: '₹65,000' },
] as const;

export const PROMPT_SUGGESTIONS = [
  'Minimal',
  'Royal',
  'Modern',
  'Traditional',
  'Elegant',
  'Luxury',
  'Bridal',
  'Cocktail',
  'Office Wear',
  'Party Wear',
] as const;

export const INITIAL_MEASUREMENTS: MeasurementSheet = {
  unit: 'inches',
  genderCategory: 'all',
  bust: 35.0,
  waist: 28.0,
  highHip: 36.0,
  lowHip: 39.0,
  shoulderToShoulder: 15.0,
  shoulderToWaist: 15.5,
  waistToHem: 42.5,
  hollowToFloor: 56.0,
  armhole: 15.5,
  bicep: 11.0,
  sleeveLength: 12.5,
  neckCircumference: 14.0,
  height: 65.0,
  blouseLength: 14.5,
  frontNeckDepth: 7.5,
  backNeckDepth: 9.5,
  lehengaLength: 42.0,
  churidarLength: 40.0,
  // Men's Bespoke Measurement Defaults
  chest: 40.0,
  jacketLength: 30.5,
  collarSize: 16.0,
  shoulderWidth: 18.0,
  trouserWaist: 33.0,
  trouserInseam: 31.5,
  trouserOutseam: 41.0,
  seatHip: 40.0,
  thighCircumference: 24.0,
  trouserBottomOpening: 15.0,
  postureProfile: 'Normal Posture',
  fitPreference: 'Tailored / Regular',
  postureNotes: 'Bespoke fit allowance: Leave 2-inch side margin inside coat/choli for future alterations.',
  updatedAt: '2026-08-20T10:30:00Z',
};

export const INITIAL_TAILORS: TailorProfile[] = [
  {
    id: 'tailor-meera',
    userId: 'user-tailor-meera',
    name: 'Meera Couture Studio',
    shopName: 'Meera Couture Studio',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000&auto=format&fit=crop&q=80',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    distanceKm: 3.2,
    experienceYears: 18,
    verificationStatus: 'VERIFIED',
    verifiedAt: '2025-01-15',
    rating: 4.9,
    reviewCount: 312,
    completedOrders: 820,
    specialties: ['Rosewater Saree Gowns', 'Bridal Couture', 'Hand Embroidery', 'Zari & Pearls'],
    bio: 'Jaipur premier boutique crafting regal bridal ensembles and bespoke pearl creations.',
    badge: 'Couturier',
    startingPrice: 3299,
    averageTurnaroundDays: 10,
    shopAddress: 'B-14 Civil Lines, Jaipur - 302006',
    phone: '+91 98290 11223',
    equipment: ['Multi-Needle Embroidery Rigs', 'Silk Steam Dummies'],
    certifications: ['Rajasthan Fashion Guild Master'],
    reviews: [],
    portfolio: []
  },
  {
    id: 'tailor-draped-needle',
    userId: 'user-tailor-draped',
    name: 'The Draped Needle',
    shopName: 'The Draped Needle Atelier',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000&auto=format&fit=crop&q=80',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    distanceKm: 4.8,
    experienceYears: 24,
    verificationStatus: 'VERIFIED',
    verifiedAt: '2025-02-01',
    rating: 4.8,
    reviewCount: 284,
    completedOrders: 710,
    specialties: ['Midnight Velvet & Silk', 'Organza Anarkali', 'Embroidered Jackets'],
    bio: 'Bespoke Mumbai atelier specializing in modern silhouettes with traditional Indian zardozi and pearl finishing.',
    badge: 'Couturier',
    startingPrice: 2999,
    averageTurnaroundDays: 12,
    shopAddress: 'Linking Road, Bandra West, Mumbai - 400050',
    phone: '+91 98201 44556',
    equipment: ['Industrial Lockstitch', 'Aari Hoops'],
    certifications: ['NIFT Alumnus Guild'],
    reviews: [],
    portfolio: []
  },
  {
    id: 'tailor-1',
    userId: 'user-tailor-1',
    name: 'Ustad Rafiq Ahmed & Sons',
    shopName: 'Atelier Rafiq Shahi Darzi (Est. 1974)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
    city: 'Old Delhi',
    state: 'Delhi NCR',
    country: 'India',
    distanceKm: 2.8,
    experienceYears: 36,
    verificationStatus: 'VERIFIED',
    verifiedAt: '2025-01-10',
    rating: 4.98,
    reviewCount: 384,
    completedOrders: 940,
    specialties: ['Bridal Lehenga & Choli', 'Hand Zardozi & Dabka Gold', 'Royal Anarkali Suit', 'Raw Silk Couture'],
    bio: 'Third-generation Chandni Chowk master couturier and karigar head. Renowned for heavyweight bridal kalidar lehengas, authentic Lucknowi zardozi embroidery, and precision padded bridal cholis with generous 2.5-inch alteration margins.',
    badge: 'Master Artisan',
    startingPrice: 18500,
    averageTurnaroundDays: 16,
    shopAddress: 'Shop 42-44, Kinari Bazaar, Near Paranthe Wali Gali, Chandni Chowk, Old Delhi - 110006',
    phone: '+91 98112 34567',
    equipment: ['Traditional Heavy Zari Addas', 'Juki Industrial Lockstitch', 'Steam Dummy Forms', 'Fabric Shrinkage Rig'],
    certifications: ['National Master Karigar Award 2017', 'Ministry of Textiles Certified Heritage Artisan'],
    reviews: [
      {
        id: 'rev-1',
        orderId: 'ord-100',
        tailorId: 'tailor-1',
        customerId: 'cust-1',
        customerName: 'Ananya Verma',
        customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        dressTitle: 'Rani Pink Zardozi Bridal Lehenga',
        overallRating: 5,
        ratingOverall: 5,
        fitRating: 5,
        ratingFit: 5,
        craftsmanshipRating: 5,
        ratingCraft: 5,
        timelinessRating: 5,
        ratingPunctuality: 5,
        comment: 'Ustad Rafiq made my dream wedding lehenga! The 16-panel flare and genuine dabka work took everyone’s breath away. The choli fit like a glove without a single pinch.',
        photos: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'],
        createdAt: '2026-08-10T12:00:00Z'
      }
    ],
    portfolio: [
      {
        id: 'port-1',
        title: 'Shahi Rani Pink Dabka Lehenga',
        category: 'Bridal',
        imageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80',
        completionTimeDays: 18,
        price: 45000,
        description: 'Pure raw silk with 16 panels, 24K gold dabka & nakshi work with double can-can skirt.',
        customerRating: 5.0
      },
      {
        id: 'port-2',
        title: 'Mughal Velvet Floor-Length Anarkali',
        category: 'Festive & Sangeet',
        imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80',
        completionTimeDays: 12,
        price: 28000,
        description: 'Rich wine velvet with antique zardozi border, accompanied by pure organza dupatta.',
        customerRating: 4.9
      }
    ]
  },
  {
    id: 'tailor-2',
    userId: 'user-tailor-2',
    name: 'Suta & Silks by Priya Sundaram',
    shopName: 'Suta Bespoke Bridal Atelier',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&auto=format&fit=crop&q=80',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    distanceKm: 5.4,
    experienceYears: 22,
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-11-18',
    rating: 4.96,
    reviewCount: 295,
    completedOrders: 680,
    specialties: ['Kanjeevaram Saree Gown', 'Designer Blouse & Dupatta', 'Pearl & Kundan Beadwork', 'Pure Silk Weaves'],
    bio: 'T. Nagar bridal specialist transforming pure handwoven Kanchipuram silks into contemporary pleated gowns and sculpted Maggam-work designer blouses with temple jewelry motifs.',
    badge: 'Bridal Specialist',
    startingPrice: 14000,
    averageTurnaroundDays: 14,
    shopAddress: '18 Usman Road, Panagal Park, T. Nagar, Chennai - 600017',
    phone: '+91 94440 12389',
    equipment: ['Aari Needle Frames', 'Japanese High Tension Stitches', 'Silk Steam Press'],
    certifications: ['South Indian Master Weavers Guild', 'Certified Silk Mark Artisan'],
    reviews: [
      {
        id: 'rev-2',
        orderId: 'ord-102',
        tailorId: 'tailor-2',
        customerId: 'cust-1',
        customerName: 'Ananya Verma',
        customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        dressTitle: 'Peacock Blue Kanjeevaram Pre-Pleated Gown',
        overallRating: 5,
        ratingOverall: 5,
        fitRating: 5,
        ratingFit: 5,
        craftsmanshipRating: 5,
        ratingCraft: 5,
        timelinessRating: 5,
        ratingPunctuality: 5,
        comment: 'Priya akka draped and stitched the Kanjeevaram saree into a royal modern gown. Received non-stop compliments at the reception!',
        photos: ['https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80'],
        createdAt: '2026-07-28T14:30:00Z'
      }
    ],
    portfolio: [
      {
        id: 'port-3',
        title: 'Peacock Blue Kanjeevaram Gown',
        category: 'Reception & Saree Gown',
        imageUrl: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80',
        completionTimeDays: 15,
        price: 36000,
        description: 'Pure zari korvai border Kanjeevaram silk tailored into a dramatic structured gala gown.',
        customerRating: 5.0
      }
    ]
  },
  {
    id: 'tailor-3',
    userId: 'user-tailor-3',
    name: 'Atelier Bandra by Farhan Khan',
    shopName: 'Farhan Khan Haute Couture Studio',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    distanceKm: 4.1,
    experienceYears: 19,
    verificationStatus: 'VERIFIED',
    verifiedAt: '2025-02-01',
    rating: 4.94,
    reviewCount: 412,
    completedOrders: 1120,
    specialties: ['Indo-Western Lehanga', 'Sangeet & Cocktail Night', 'Corset Tiered Dress', 'Celebrity Styling'],
    bio: 'Bandra-based Bollywood celebrity designer atelier blending structured European corsetry with rich Indian resham and mirror work for high-glamour sangeet and reception looks.',
    badge: 'Couturier',
    startingPrice: 22000,
    averageTurnaroundDays: 12,
    shopAddress: '72 Waterfield Road, Off Linking Road, Bandra West, Mumbai - 400050',
    phone: '+91 98205 77890',
    equipment: ['Brother Direct Drive Lockstitch', 'Laser Sequin Applicator', '3D Bodice Form'],
    certifications: ['NIFT Mumbai Alumnus', 'FDCI Registered Designer'],
    reviews: [],
    portfolio: [
      {
        id: 'port-4',
        title: 'Obsidian Indo-Western Draped Corset Gown',
        category: 'Cocktail & Sangeet',
        imageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
        completionTimeDays: 10,
        price: 42000,
        description: 'Structured 12-bone boned corset with flowing pleated organza cape and antique mirror work.',
        customerRating: 4.9
      }
    ]
  },
  {
    id: 'tailor-4',
    userId: 'user-tailor-4',
    name: 'Jaipuriya Karigars by Mahendra',
    shopName: 'Mahendra Royal Heritage Ateliers',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1000&auto=format&fit=crop&q=80',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    distanceKm: 8.5,
    experienceYears: 28,
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-09-12',
    rating: 4.95,
    reviewCount: 180,
    completedOrders: 510,
    specialties: ['Real Gota Patti & Mirror Work', 'Haldi & Mehendi Sharara', 'Royal Sherwani & Churidar'],
    bio: 'Masters of Johari Bazaar Jaipur specializing in pure silver gota patti, danka, and hand-embroidered festive sharara and lehenga sets.',
    badge: 'Master Artisan',
    startingPrice: 16500,
    averageTurnaroundDays: 15,
    shopAddress: 'Shop 108, Johari Bazaar, Pink City, Jaipur - 302003',
    phone: '+91 94140 33211',
    equipment: ['Gota Beating Anvils', 'Specialized Metallic Thread Rig'],
    certifications: ['Rajasthan Heritage Craft Society Master'],
    reviews: [],
    portfolio: []
  },
  {
    id: 'tailor-singhania',
    userId: 'user-tailor-singhania',
    name: 'Master R. K. Singhania & Sons',
    shopName: 'Singhania & Sons Bespoke Tailors (Est. 1968)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
    city: 'New Delhi',
    state: 'Delhi NCR',
    country: 'India',
    distanceKm: 2.1,
    experienceYears: 42,
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-08-10',
    rating: 4.98,
    reviewCount: 460,
    completedOrders: 1250,
    specialties: ["Men's Bespoke Suiting", 'Royal Jodhpuri Bandhgalas', 'Savile Row Floating Canvas', 'Silk Velvet Tuxedos'],
    bio: 'Historic Connaught Place tailoring house recognized for hand-canvassed Savile Row suits, royal Jodhpuri bandhgalas, and Italian Super 150s bespoke tailoring.',
    badge: 'Master Artisan',
    startingPrice: 24000,
    averageTurnaroundDays: 14,
    shopAddress: 'F-Block, Inner Circle, Connaught Place, New Delhi - 110001',
    phone: '+91 98100 88234',
    equipment: ['Floating Horsehair Canvas Press', 'High-Tension Baste Machine', 'German Hand-Stitch Rig'],
    certifications: ['British Bespoke Tailors Guild Associate', 'Master Cutter Federation of India'],
    reviews: [],
    portfolio: [
      {
        id: 'port-singhania-1',
        title: 'Midnight Obsidian Royal Bandhgala',
        category: "Men's Couture",
        imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=800&auto=format&fit=crop&q=80',
        completionTimeDays: 14,
        price: 38000,
        description: 'Pure raw silk with antique gold zardozi embroidered mandarin collar, lion crest buttons, and bespoke Jodhpur breeches.',
        customerRating: 5.0
      },
      {
        id: 'port-singhania-2',
        title: 'Bordeaux Silk Velvet Dinner Suit',
        category: "Men's Black Tie",
        imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&auto=format&fit=crop&q=80',
        completionTimeDays: 12,
        price: 45000,
        description: 'Silk velvet evening jacket with Duchess satin peak lapels, double-breasted vest, and grosgrain tailored trousers.',
        customerRating: 4.95
      }
    ]
  },
  {
    id: 'tailor-salim-chishti',
    userId: 'user-tailor-salim',
    name: 'Darzi-e-Khaas by Ustad Salim Chishti',
    shopName: 'Atelier Salim Chishti Awadh (Est. 1982)',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    coverImage: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1000&auto=format&fit=crop&q=80',
    city: 'Lucknow',
    state: 'Uttar Pradesh',
    country: 'India',
    distanceKm: 4.9,
    experienceYears: 38,
    verificationStatus: 'VERIFIED',
    verifiedAt: '2024-10-05',
    rating: 4.96,
    reviewCount: 310,
    completedOrders: 920,
    specialties: ['Royal Sherwanis', 'Hand Chikankari Kurtas', 'Zardozi Safas & Stoles', 'Bespoke Achkans'],
    bio: 'Renowned Aminabad royal couturier crafting regal sherwanis with pure gold dabka, Lucknowi shadow work, and heritage angrakha plackets for grooms across India.',
    badge: 'Master Artisan',
    startingPrice: 19500,
    averageTurnaroundDays: 16,
    shopAddress: 'Nazirabad Chowk, Aminabad, Lucknow - 226018',
    phone: '+91 94150 99441',
    equipment: ['Traditional Awadhi Addas', 'Natural Indigo Dye Vats', 'Fine Needles No. 12'],
    certifications: ['Uttar Pradesh Handloom Board Master Award'],
    reviews: [],
    portfolio: [
      {
        id: 'port-salim-1',
        title: 'Ivory Awadh Hand-Embroidered Sherwani',
        category: "Men's Royal Wedding",
        imageUrl: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&auto=format&fit=crop&q=80',
        completionTimeDays: 18,
        price: 52000,
        description: 'Mulberry raw silk sherwani featuring 200,000 hand-sewn resham stitches, freshwater seed pearls, and chanderi stole.',
        customerRating: 5.0
      }
    ]
  }
];

export const INITIAL_DESIGNS: DressDesign[] = [
  {
    id: 'design-men-bandhgala',
    customerId: 'cust-1',
    customerName: 'Ananya Verma',
    title: 'The Royal Rajputana Jodhpuri Bandhgala',
    prompt: 'Midnight obsidian pure raw silk bandhgala jacket with hand-embroidered antique gold zardozi mandarin collar, lion-crest brass buttons, floating canvas chest, and tailored jodhpur breeches.',
    createdAt: '2026-09-10T14:00:00Z',
    isFavorite: true,
    selectedVariationIndex: 0,
    tags: ['Menswear', 'Bandhgala', 'Royal', 'Raw Silk', 'Bespoke', 'Groom'],
    variations: [
      {
        id: 'var-men-bandhgala-1',
        name: 'Royal Rajputana Obsidian Bandhgala',
        tagline: 'Imperial raw silk bandhgala with antique dabka zardozi needlework and bespoke breeches.',
        frontImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
        backImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
        sideImageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
        detailImageUrl: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80',
        fabricDetails: {
          primary: 'Pure Banarasi Raw Silk & Floating Horsehair Canvas',
          lining: 'Cupro Breathable Anti-Static Lining',
          embellishments: '24K gold dabka collar embroidery, bespoke brass lion-crest buttons',
          estimatedYards: 5.5,
          recommendedWeightGsm: 340
        },
        tailorNotes: [
          'Hand-basted full horsehair canvas chest piece for lasting sculptural drape.',
          'Mandarin collar reinforced with Japanese collar canvas for upright regal posture.',
          'Twin side vents with 2-inch interior seam allowance on chest and waist.',
          'Tapered Jodhpur trousers with concealed inner ankle zips and horn buttons.'
        ],
        stylingTips: [
          'Pair with an antique pocket square, uncut emerald brooch, and velvet juttis.',
          'Ideal for royal wedding baraat, reception gala, and festive evening ceremonies.'
        ],
        colorPsychology: 'Midnight Obsidian communicates sovereign dignity, authority, and classical luxury.',
        estimatedCraftTimeDays: 14,
        estimatedPriceRange: { min: 32000, max: 48000, currency: 'INR' },
        specs: {
          dressType: 'Royal Jodhpuri Bandhgala',
          occasion: 'Groom & Royal Baraat',
          fabric: 'Pure Raw Silk',
          color: 'Kashi Midnight Obsidian',
          sleeve: 'French Tailored Cuffs',
          neckline: 'Mandarin Bandhgala',
          pattern: 'Hand Zardozi & Dabka Gold'
        }
      }
    ]
  },
  {
    id: 'design-men-tuxedo',
    customerId: 'cust-1',
    customerName: 'Ananya Verma',
    title: 'Savile Row Bordeaux Velvet Dinner Suit',
    prompt: 'Bespoke 3-piece tuxedo in deep Bordeaux wine silk velvet, lustrous silk satin peak lapels, tailored grosgrain side-stripe trousers, and floating horsehair canvas interior.',
    createdAt: '2026-09-08T11:00:00Z',
    isFavorite: false,
    selectedVariationIndex: 0,
    tags: ['Menswear', 'Tuxedo', 'Black Tie', 'Velvet', 'Savile Row', 'Red Carpet'],
    variations: [
      {
        id: 'var-men-tuxedo-1',
        name: 'Bordeaux Velvet Peak Lapel Tuxedo',
        tagline: 'Deep wine velvet dinner jacket featuring silk satin peak lapels and tailored evening trousers.',
        frontImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
        backImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
        sideImageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
        detailImageUrl: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80',
        fabricDetails: {
          primary: 'Italian Silk Velvet (420 GSM) with Duchess Satin Facing',
          lining: 'Bemberg Silk Jacquard',
          embellishments: 'Satin silk covered buttons, AMF hand-pick lapel stitching',
          estimatedYards: 6.0,
          recommendedWeightGsm: 420
        },
        tailorNotes: [
          'Single-button stance with hand-rolled satin peak lapel.',
          'Full floating canvas with natural horsehair chest felt.',
          'Trousers feature high-rise waistband with side adjusters and satin side braid.'
        ],
        stylingTips: [
          'Pair with a pleated Egyptian cotton shirt, silk bow tie, and patent leather oxfords.'
        ],
        colorPsychology: 'Bordeaux wine velvet radiates warmth, sophisticated confidence, and evening opulence.',
        estimatedCraftTimeDays: 12,
        estimatedPriceRange: { min: 38000, max: 55000, currency: 'INR' },
        specs: {
          dressType: 'Savile Row 3-Piece Tuxedo',
          occasion: 'Black Tie Gala & Red Carpet',
          fabric: 'Silk Velvet',
          color: 'Bordeaux Wine Velvet',
          sleeve: 'French Tailored Cuffs',
          neckline: 'Mandarin Collar',
          pattern: 'Minimalist Clean Monochrome'
        }
      }
    ]
  },
  {
    id: 'design-pearl-blush',
    customerId: 'cust-1',
    customerName: 'Aanya',
    title: 'Pearl Blush Reverie',
    prompt: 'Elegant pastel pink bridal gown with pearl embroidery and long sleeves.',
    createdAt: '2026-09-09T18:00:00Z',
    isFavorite: true,
    selectedVariationIndex: 0,
    tags: ['Evening', 'Bridal', 'Pearl blush', 'Silk', 'Gown'],
    variations: [
      {
        id: 'var-pearl-blush',
        name: 'Pastel silk organza gown',
        tagline: 'A soft bridal silhouette with a hand-finished pearl constellation and a fluid train.',
        frontImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
        backImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
        sideImageUrl: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=80',
        detailImageUrl: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80',
        fabricDetails: {
          primary: 'Pure Silk Organza with Mulmul Underlay',
          lining: 'Breathable Silk Crepe',
          embellishments: 'Hand-finished pearl constellation, bugle glass beads, silver micro-sequins',
          estimatedYards: 7.5,
          recommendedWeightGsm: 180
        },
        tailorNotes: [
          'Hand-finished pearl constellation across bodice and sheer sleeves.',
          'Sweetheart neckline with invisible inner boning structure.',
          'Fluid train with horsehair braid hem for structured sweep.',
          'Concealed back closure with silk loop micro-buttons.'
        ],
        stylingTips: [
          'Pair with teardrop pearl earrings and a delicate diamond choker.',
          'Made for evening ceremonies and grand reception entrances.'
        ],
        colorPsychology: 'Pearl blush radiates timeless poise, serenity, and understated modern elegance.',
        estimatedCraftTimeDays: 14,
        estimatedPriceRange: { min: 4999, max: 7499, currency: 'INR' },
        specs: {
          dressType: 'A-Line Evening Gown',
          occasion: 'Cocktail Soirée',
          fabric: 'Pure Raw Silk',
          color: 'Pearl Blush & Ivory',
          sleeve: 'Illusion Lace Long Sleeves',
          neckline: 'Sweetheart',
          pattern: 'Pearl & Kundan Beadwork'
        }
      }
    ]
  },
  {
    id: 'design-101',
    customerId: 'cust-1',
    customerName: 'Ananya Verma',
    title: 'Aura of Rani Zardozi Bridal Lehenga',
    prompt: 'A royal bridal kalidar lehenga in Rani Pink pure raw silk with heavy antique gold dabka and zardozi embroidery, sweetheart neck choli with elbow-length sleeves, and sheer organza dupatta with scalloped borders.',
    createdAt: '2026-08-16T14:20:00Z',
    isFavorite: true,
    selectedVariationIndex: 0,
    tags: ['Indian Wedding', 'Rani Pink', 'Zardozi Gold', 'Bridal Lehenga'],
    variations: [
      {
        id: 'var-1',
        name: 'The Maharani 16-Kali Kalidar',
        tagline: 'Sculpted sweetheart choli with 16-panel hand-worked raw silk skirt & double can-can',
        frontImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
        backImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
        sideImageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
        detailImageUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
        fabricDetails: {
          primary: 'Pure Raw Silk (Bangalore Weave 360 GSM)',
          lining: 'Pure Cotton Mulmul for comfort + Satin Interlining',
          embellishments: 'Hand Zardozi, Dabka, Nakshi, Kundan stones & micro-sequin border',
          estimatedYards: 8.5,
          recommendedWeightGsm: 360
        },
        tailorNotes: [
          'Cut 16 individual kalis on true grain to ensure flawless circular swirl flare.',
          'Incorporate reinforced 12-bone padded internal cups in choli with 2.5-inch side alteration margins.',
          'Install double-layer can-can mesh with satin dust cover along the inner hem.'
        ],
        stylingTips: [
          'Pair with a traditional Kundan or Polki choker, mathapatti, and emerald drop earrings.',
          'Drape primary dupatta pleated over left shoulder and secondary sheer veil over head.'
        ],
        colorPsychology: 'Rani Pink is an auspicious royal Indian shade celebrating feminine radiance and majesty.',
        estimatedCraftTimeDays: 16,
        estimatedPriceRange: { min: 32000, max: 48000, currency: 'INR' },
        specs: {
          dressType: 'Bridal Lehenga & Choli',
          occasion: 'Indian Wedding & Reception',
          fabric: 'Pure Raw Silk',
          color: 'Rani Gulabi Pink',
          sleeve: 'Elbow-Length Embroidered',
          neckline: 'Sweetheart',
          pattern: 'Hand Zardozi & Dabka Gold'
        }
      },
      {
        id: 'var-2',
        name: 'The Royal Heritage Anarkali Ensemble',
        tagline: 'Floor-length flared gown with Angrakha overlap neckline and antique Banarasi border',
        frontImageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
        fabricDetails: {
          primary: 'Pure Banarasi Katan Silk with Zari motifs',
          lining: 'Habotai Silk Breathable Lining',
          embellishments: 'Resham threadwork with pearl drops',
          estimatedYards: 6.5,
          recommendedWeightGsm: 320
        },
        tailorNotes: [
          'Angrakha front flap secured with handcrafted handmade latkans.',
          'Churidar sleeves with 12 gathers (churis) at wrist with micro-hook enclosure.'
        ],
        stylingTips: ['Antique gold chandbali earrings and embroidered juttis.'],
        colorPsychology: 'Deep rich pink symbolizes love, joy, and celebration in Indian weddings.',
        estimatedCraftTimeDays: 12,
        estimatedPriceRange: { min: 24000, max: 36000, currency: 'INR' },
        specs: {
          dressType: 'Royal Anarkali Suit',
          occasion: 'Sangeet & Cocktail Night',
          fabric: 'Banarasi Katan Silk',
          color: 'Rani Gulabi Pink',
          sleeve: 'Churidar Gathered Sleeves',
          neckline: 'Angrakha Wrap V-Neck',
          pattern: 'Banarasi Zari Weave'
        }
      }
    ]
  },
  {
    id: 'design-102',
    customerId: 'cust-1',
    customerName: 'Ananya Verma',
    title: 'Emerald Mughal Velvet Sangeet Gown',
    prompt: 'A regal floor-length gown in Imperial Emerald silk velvet with antique zardozi work, boat neck, and sheer organza cape sleeves for a royal Sangeet celebration.',
    createdAt: '2026-08-14T09:15:00Z',
    isFavorite: false,
    selectedVariationIndex: 0,
    tags: ['Sangeet', 'Emerald', 'Silk Velvet', 'Zardozi'],
    variations: [
      {
        id: 'var-3',
        name: 'Maharani Emerald Gala Column',
        tagline: 'Sculpted deep velvet with zardozi collar and floor-sweeping organza cape',
        frontImageUrl: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=80',
        fabricDetails: {
          primary: 'Pure Silk Velvet (380 GSM)',
          lining: 'Cupro Anti-Static Breathable Lining',
          embellishments: 'Real zardozi gold bullion with emerald crystal stones',
          estimatedYards: 6.0,
          recommendedWeightGsm: 380
        },
        tailorNotes: [
          'Pre-treat velvet to prevent pile crushing during pressing.',
          'Reinforce boat neckline with bias canvas so it rests flat across collarbones.'
        ],
        stylingTips: ['Polki diamond choker and emerald cocktail ring.'],
        colorPsychology: 'Imperial emerald represents prosperity, eternal life, and noble luxury.',
        estimatedCraftTimeDays: 14,
        estimatedPriceRange: { min: 28000, max: 42000, currency: 'INR' },
        specs: {
          dressType: 'A-Line Evening Gown',
          occasion: 'Sangeet & Cocktail Night',
          fabric: 'Silk Velvet',
          color: 'Imperial Emerald',
          sleeve: 'Regal Cape Sleeves',
          neckline: 'Boat / Bateau Neck',
          pattern: 'Hand Zardozi & Dabka Gold'
        }
      }
    ]
  }
];

export const INITIAL_QUOTATION_REQUESTS: QuotationRequest[] = [
  {
    id: 'req-201',
    customerId: 'cust-1',
    customerName: 'Ananya Verma',
    customerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    dressDesignId: 'design-101',
    variation: INITIAL_DESIGNS[0].variations[0],
    targetBudget: 38000,
    neededByDate: '2026-09-28',
    specificInstructions: 'I need this for my wedding reception. Padded cups in choli with 2.5-inch side margin for alteration. Double can-can flare is mandatory.',
    city: 'Mumbai',
    createdAt: '2026-08-16T15:00:00Z',
    status: 'QUOTATIONS_RECEIVED',
    quotations: [
      {
        id: 'quote-301',
        requestId: 'req-201',
        tailorId: 'tailor-1',
        tailorName: 'Ustad Rafiq Ahmed & Sons',
        tailorShopName: 'Atelier Rafiq Shahi Darzi (Est. 1974)',
        tailorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
        tailorRating: 4.98,
        items: [
          { id: 'qi-1', description: 'Pure Bangalore Raw Silk (8.5 meters) & Mulmul Breathable Lining', amount: 16000, category: 'Fabric' },
          { id: 'qi-2', description: 'Master Pattern Drafting, 16-Kali Flare, Padded Choli & Margin', amount: 11000, category: 'Stitching' },
          { id: 'qi-3', description: 'Handmade Zardozi & Dabka Zari Work along 16 panels & waist', amount: 9000, category: 'Embroidery & Handwork' },
          { id: 'qi-4', description: 'Double Can-Can Netting, Custom Latkans, Finishing & Packaging', amount: 2000, category: 'Finishing' }
        ],
        totalAmount: 38000,
        currency: 'INR',
        estimatedDeliveryDays: 14,
        proposedDeliveryDate: '2026-09-10',
        fabricIncluded: true,
        tailorMessage: 'Namaste Ananya ji! We have crafted bridal lehengas for over 40 years in Chandni Chowk. We will source pure raw silk with authentic gold dabka. 2.5-inch inside margin guaranteed.',
        milestones: [
          { title: 'Raw Silk & Kali Pattern Validation', percentage: 30, description: 'Pattern draft made to measurements & fabric tested for pre-shrinkage' },
          { title: 'First Toile & Choli Baste Fitting', percentage: 30, description: 'Baste fitting proof photo uploaded or video call validation' },
          { title: 'Zardozi Handwork & Secure Courier Dispatch', percentage: 40, description: 'Final quality inspection and express insured dispatch' }
        ],
        status: 'ACCEPTED',
        createdAt: '2026-08-16T16:30:00Z'
      },
      {
        id: 'quote-302',
        requestId: 'req-201',
        tailorId: 'tailor-3',
        tailorName: 'Atelier Bandra by Farhan Khan',
        tailorShopName: 'Farhan Khan Haute Couture Studio',
        tailorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
        tailorRating: 4.94,
        items: [
          { id: 'qi-5', description: 'Raw Silk & Pure Organza Fabric Sourcing', amount: 18000, category: 'Fabric' },
          { id: 'qi-6', description: 'Couture Bodice Boning & Kali Assembly', amount: 14000, category: 'Stitching' },
          { id: 'qi-7', description: 'Mirror & Zardozi Handwork Embellishment', amount: 10000, category: 'Embroidery & Handwork' }
        ],
        totalAmount: 42000,
        currency: 'INR',
        estimatedDeliveryDays: 12,
        proposedDeliveryDate: '2026-09-08',
        fabricIncluded: true,
        tailorMessage: 'Hello Ananya. We can craft this in our Bandra studio with high-fashion finish. In-person fitting available in Mumbai.',
        milestones: [
          { title: 'Fabric & Pattern Validation', percentage: 35, description: 'Advance fabric procurement' },
          { title: 'Stitching & Handwork', percentage: 35, description: 'Choli and lehenga assembly' },
          { title: 'Final Delivery', percentage: 30, description: 'Doorstep courier delivery' }
        ],
        status: 'PENDING',
        createdAt: '2026-08-16T17:15:00Z'
      }
    ]
  }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-8801',
    orderNumber: 'PP-IN-2026-8801',
    customerId: 'cust-1',
    customerName: 'Ananya Verma',
    tailorId: 'tailor-1',
    tailorName: 'Ustad Rafiq Ahmed & Sons',
    tailorShopName: 'Atelier Rafiq Shahi Darzi (Est. 1974)',
    tailorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    design: INITIAL_DESIGNS[0].variations[0],
    variation: INITIAL_DESIGNS[0].variations[0],
    quotation: INITIAL_QUOTATION_REQUESTS[0].quotations[0],
    measurements: INITIAL_MEASUREMENTS,
    currentStage: 'FIRST_FITTING',
    milestones: [
      { id: 'm-1', stage: 'QUOTATION_ACCEPTED', title: 'Quotation Accepted & Escrow Locked', label: 'Quotation Accepted', description: '₹38,000 held safely in Pearl Pick! NPCI UPI Escrow Vault', status: 'COMPLETED', completed: true, completedAt: '2026-08-16T18:00:00Z' },
      { id: 'm-2', stage: 'MEASUREMENTS_CONFIRMED', title: '14-Point Measurements Verified', label: 'Measurements Verified', description: 'Master Rafiq validated blouse bust 35", waist 28", and 2.5" alteration allowance', status: 'COMPLETED', completed: true, completedAt: '2026-08-16T19:20:00Z' },
      { id: 'm-3', stage: 'FABRIC_SOURCING', title: 'Pure Raw Silk Cut & Inspected', label: 'Raw Silk Sourced', description: 'Rani Gulabi pure raw silk fabric inspected for weave consistency and luster', status: 'COMPLETED', completed: true, completedAt: '2026-08-17T09:00:00Z', photoUrl: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', photoProof: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80' },
      { id: 'm-4', stage: 'PATTERN_MAKING', title: '16-Kali Pattern Drafting', label: 'Pattern Drafting', description: 'Individual paper pattern calibrated to Ananya’s height and waist measurement', status: 'COMPLETED', completed: true, completedAt: '2026-08-17T14:30:00Z' },
      { id: 'm-5', stage: 'FIRST_FITTING', title: 'Baste Fitting / Toile Ready', label: 'First Fitting Ready', description: 'Choli structure assembled with baste stitches; video confirmation photo shared in chat', status: 'IN_PROGRESS', completed: false },
      { id: 'm-6', stage: 'FINAL_STITCHING', title: 'Hand Zardozi Gold Work & Double Can-Can', label: 'Zardozi & Stitching', description: '4 Karigars hand-embroidering dabka floral motifs across 16 panels', status: 'PENDING', completed: false },
      { id: 'm-7', stage: 'QUALITY_INSPECTION', title: 'Master Darzi Quality Check', label: 'Quality Check', description: 'Checking stitch tolerance, zipper, hook alignment, and can-can fullness', status: 'PENDING', completed: false },
      { id: 'm-8', stage: 'SHIPPED', title: 'BlueDart Express Insured Dispatch', label: 'Courier Shipped', description: 'Packed in signature velvet keepsake box with garment bag', status: 'PENDING', completed: false },
      { id: 'm-9', stage: 'DELIVERED', title: 'Delivery & Fit Verification', label: 'Delivered', description: 'Customer confirms perfect fit; Escrow balance released to Ustad Rafiq', status: 'PENDING', completed: false }
    ],
    totalAmount: 38000,
    paidAmount: 38000,
    escrowStatus: 'SECURED_IN_ESCROW',
    estimatedDelivery: '2026-09-10',
    createdAt: '2026-08-16T18:00:00Z',
    trackingNumber: 'BD-IN-94829104',
    carrier: 'BlueDart Couture Express Air',
    reviewSubmitted: false
  }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    orderId: 'ord-8801',
    senderId: 'tailor-1',
    senderName: 'Ustad Rafiq Ahmed',
    senderRole: 'tailor',
    receiverId: 'cust-1',
    text: 'Namaste Ananya ji! Khushamdeed to Atelier Rafiq. We have received your order for the Rani Zardozi Bridal Lehenga. The measurements look very well proportioned!',
    timestamp: '2026-08-16T18:05:00Z',
    isRead: true
  },
  {
    id: 'msg-2',
    orderId: 'ord-8801',
    senderId: 'cust-1',
    senderName: 'Ananya Verma',
    senderRole: 'customer',
    receiverId: 'tailor-1',
    text: 'Namaste Master ji! Thank you so much. Could you please confirm that the choli back neck depth is 9.5 inches with handmade dori latkans?',
    timestamp: '2026-08-16T18:15:00Z',
    isRead: true
  },
  {
    id: 'msg-3',
    orderId: 'ord-8801',
    senderId: 'tailor-1',
    senderName: 'Ustad Rafiq Ahmed',
    senderRole: 'tailor',
    receiverId: 'cust-1',
    type: 'AUDIO_VOICE_NOTE',
    text: 'Ji Ananya ji, maine audio note bheja hai aur fabric swatch bhi attach kiya hai. 9.5 inch back neck with handmade zardozi tassels confirm kar diya hai.',
    audioUrl: 'voice-rafiq-sample',
    duration: '0:34',
    timestamp: '2026-08-17T09:10:00Z',
    attachmentType: 'swatch',
    attachmentData: {
      title: 'Bangalore Pure Raw Silk — Rani Pink',
      hex: '#E75480',
      weight: '360 GSM',
      composition: '100% Pure Mulberry Raw Silk with Gold Zari',
      origin: 'Bangalore Weavers Cluster, Karnataka'
    },
    isRead: true
  },
  {
    id: 'msg-4',
    orderId: 'ord-8801',
    senderId: 'cust-1',
    senderName: 'Ananya Verma',
    senderRole: 'customer',
    receiverId: 'tailor-1',
    text: 'The silk color and gold dabka shine look majestic! Exactly what I imagined for my wedding reception.',
    timestamp: '2026-08-17T09:25:00Z',
    isRead: true
  },
  {
    id: 'msg-5',
    orderId: 'ord-8801',
    senderId: 'tailor-1',
    senderName: 'Ustad Rafiq Ahmed',
    senderRole: 'tailor',
    receiverId: 'cust-1',
    text: 'We are currently assembling the 16-panel kali cut with can-can mesh for the First Fitting. I will share the baste fit photo proof shortly!',
    timestamp: '2026-08-17T14:40:00Z',
    isRead: false
  }
];

export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    orderId: 'ord-prev-1',
    tailorId: 'tailor-1',
    customerId: 'cust-2',
    customerName: 'Kritika Sen',
    customerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    dressTitle: 'Shahi Rani Pink Dabka Lehenga',
    overallRating: 5.0,
    fitRating: 5.0,
    craftsmanshipRating: 5.0,
    timelinessRating: 5.0,
    comment: 'Ustad Rafiq is a gem. The AI studio created a bespoke kalidar silhouette that 2 other tailors told me was too intricate to cut. Rafiq saheb crafted it flawlessly in 16 days. The 2-inch inner margin gave me complete peace of mind!',
    photos: ['https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80'],
    tailorReply: 'Bahut bahut shukriya Kritika beti! May your wedding day be blessed with joy.',
    createdAt: '2026-08-01T12:00:00Z'
  }
];

export const INITIAL_ADMIN_ANALYTICS: AdminAnalytics = {
  totalGMV: 1845000,
  totalGrossMarketplaceValue: 1845000,
  activeEscrowVaultVolume: 1845000,
  totalOrders: 328,
  activeOrders: 42,
  completedOrders: 286,
  totalCustomers: 1240,
  totalTailors: 58,
  pendingTailorVerifications: 4,
  totalDesignsGenerated: 8450,
  totalDressDesignsGenerated: 8450,
  avgRating: 4.94,
  monthlyRevenue: [
    { month: 'Mar', gmv: 224000, commission: 26880 },
    { month: 'Apr', gmv: 268000, commission: 32160 },
    { month: 'May', gmv: 312000, commission: 37440 },
    { month: 'Jun', gmv: 345000, commission: 41400 },
    { month: 'Jul', gmv: 382000, commission: 45840 },
    { month: 'Aug', gmv: 421000, commission: 50520 }
  ],
  categoryDistribution: [
    { category: 'Bridal Lehengas & Cholis', count: 142, percentage: 43 },
    { category: 'Royal Anarkalis & Shararas', count: 88, percentage: 27 },
    { category: 'Kanjeevaram Saree Gowns & Blouses', count: 56, percentage: 17 },
    { category: 'Indo-Western & Cocktail Fusion', count: 42, percentage: 13 }
  ]
};

export const INITIAL_DRESS_DESIGNS: DressDesign[] = INITIAL_DESIGNS;

export const INITIAL_CUSTOMER_PROFILE: CustomerProfile = {
  id: 'cust-1',
  name: 'Ananya Verma',
  email: 'ananya.verma@mumbai.in',
  phone: '+91 98201 54321',
  city: 'Mumbai, Maharashtra',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  savedAddresses: [
    'Flat 802, Sea Green Apartments, Carter Road, Bandra West, Mumbai - 400050',
    'Tower 4, DLF Magnolias, Golf Course Road, Gurugram - 122002'
  ],
  loyaltyTier: 'Royal Patola Platinum',
  totalOrders: 3,
  memberSince: 'January 2025'
};

export const INITIAL_ANALYTICS: AnalyticsSummary = {
  ...INITIAL_ADMIN_ANALYTICS,
  totalGrossMarketplaceValue: 1845000,
  activeEscrowVaultVolume: 1845000,
  totalDressDesignsGenerated: 8450,
  verifiedTailorsCount: 54,
  totalEscrowLocked: 1845000,
  activeDisputesCount: 0
};

export const HOME_CATEGORIES = [
  { id: 'cat-lehengas', name: 'Lehengas', dressType: 'Bridal Lehenga & Choli', image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&auto=format&fit=crop&q=80', count: '180+ Designs' },
  { id: 'cat-bandhgalas', name: 'Royal Bandhgalas', dressType: 'Royal Jodhpuri Bandhgala', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&auto=format&fit=crop&q=80', count: '46+ Designs' },
  { id: 'cat-tuxedos', name: 'Savile Row Tuxedos', dressType: 'Savile Row 3-Piece Tuxedo', image: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600&auto=format&fit=crop&q=80', count: '38+ Designs' },
  { id: 'cat-sherwanis', name: 'Royal Sherwanis', dressType: 'Royal Sherwani & Churidar', image: 'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=600&auto=format&fit=crop&q=80', count: '52+ Designs' },
  { id: 'cat-bundis', name: 'Nehru Jackets & Kurtas', dressType: 'Embroidered Kurta & Bundi Jacket', image: 'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=600&auto=format&fit=crop&q=80', count: '65+ Designs' },
  { id: 'cat-anarkalis', name: 'Anarkalis', dressType: 'Royal Anarkali Suit', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=600&auto=format&fit=crop&q=80', count: '124+ Designs' },
  { id: 'cat-gowns', name: 'Couture Gowns', dressType: 'A-Line Evening Gown', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&auto=format&fit=crop&q=80', count: '96+ Designs' },
  { id: 'cat-sarees', name: 'Saree Gowns', dressType: 'Kanjeevaram Saree Gown', image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=600&auto=format&fit=crop&q=80', count: '85+ Designs' },
  { id: 'cat-shararas', name: 'Shararas & Ghararas', dressType: 'Sharara & Gharara Set', image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80', count: '72+ Designs' },
  { id: 'cat-indowestern', name: 'Indo-Western', dressType: 'Indo-Western Lehanga', image: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=600&auto=format&fit=crop&q=80', count: '64+ Designs' },
  { id: 'cat-corset', name: 'Corset Dresses', dressType: 'Corset Tiered Dress', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&auto=format&fit=crop&q=80', count: '48+ Designs' },
];

export const POPULAR_COLLECTIONS = [
  {
    id: 'col-rajputana',
    title: 'The Rajputana Heritage Trousseau',
    tagline: 'Pure raw silk, real gota patti, and hand-embroidered 16-kali flair.',
    designer: 'Atelier Rafiq & Smt. Gayatri Devi',
    piecesCount: 12,
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=900&auto=format&fit=crop&q=80',
    tags: ['Bridal', 'Royal Heritage', 'Hand-Stitched'],
    startingPrice: 38000,
  },
  {
    id: 'col-mughal',
    title: 'Noor-e-Awadh Chikan & Organza',
    tagline: 'Hand-dyed pastels, pearl-crusted decolletage, and whisper-weight drapes.',
    designer: 'Maestro Irfan Qureshi Studio',
    piecesCount: 8,
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=900&auto=format&fit=crop&q=80',
    tags: ['Lucknowi', 'Chikankari', 'Pastel Trousseau'],
    startingPrice: 28000,
  },
  {
    id: 'col-noir',
    title: 'Midnight Noir Velvet & Zari',
    tagline: 'Architectural corsetry blended with opulent hand-couched metallic threadwork.',
    designer: 'Meera Kapoor Couture Bandra',
    piecesCount: 14,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=900&auto=format&fit=crop&q=80',
    tags: ['Red Carpet', 'Silk Velvet', 'Cocktail'],
    startingPrice: 32000,
  },
  {
    id: 'col-kanjeevaram',
    title: 'Varnam: Contemporary Kanjeevaram',
    tagline: 'Pure zari temple border weaves sculpted into fluid modern red-carpet silhouettes.',
    designer: 'K. V. Ramanathan Silks & Tailoring',
    piecesCount: 10,
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=900&auto=format&fit=crop&q=80',
    tags: ['Kanjeevaram', 'Heritage', 'Temple Zari'],
    startingPrice: 42000,
  }
];

export const SUGGESTED_FABRICS = [
  {
    id: 'fab-katan',
    name: 'Banarasi Katan Silk',
    weight: '380 GSM',
    weave: 'Pure Handspun Mulberry Warp & Weft',
    description: 'Crisp handfeel with natural luminous sheen and heavy drape, optimal for structured kalidar lehengas.',
    recommendedFor: 'Royal Bridal & Receptions',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'fab-rawsilk',
    name: 'Pure Matka Raw Silk',
    weight: '340 GSM',
    weave: 'Organic Slub Textured Weave',
    description: 'Subtle slub grain texture that absorbs deep jewel tones and provides exceptional structural hold for corsets.',
    recommendedFor: 'Bridal Bodices & Cholis',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'fab-organza',
    name: 'Silk Tissue Organza',
    weight: '75 GSM',
    weave: 'Whisper Sheer Metallic Sheen',
    description: 'Glass-like translucency with ethereal volume, ideal for scalloped dupattas and sheer trailing capes.',
    recommendedFor: 'Dupattas & Flowing Overlays',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=500&auto=format&fit=crop&q=80'
  },
  {
    id: 'fab-velvet',
    name: 'Royal Silk Micro-Velvet',
    weight: '420 GSM',
    weave: 'Dense Plush Pile on Silk Base',
    description: 'Ultra-luxurious tactile softness that reflects low evening light with dramatic depth and warmth.',
    recommendedFor: 'Winter Galas & Sangeet Nights',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=500&auto=format&fit=crop&q=80'
  }
];

export const STYLE_INSPIRATIONS = [
  {
    id: 'insp-1',
    title: 'Emerald Zardozi 16-Kali Kalidar',
    designer: 'Atelier Rafiq',
    likes: 1420,
    dressType: 'Bridal Lehenga & Choli' as const,
    fabric: 'Banarasi Katan Silk' as const,
    color: 'Emerald & Antique Gold',
    prompt: 'Emerald green bridal lehenga with heavy golden zardozi embroidery, sweetheart neckline, long sleeves and Banarasi silk.',
    image: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'insp-2',
    title: 'Ivory Resham Anarkali with Scalloped Dupatta',
    designer: 'Irfan Qureshi',
    likes: 980,
    dressType: 'Royal Anarkali Suit' as const,
    fabric: 'Lucknowi Chikankari Georgette' as const,
    color: 'Moonlight Ivory',
    prompt: 'Ivory pure georgette Anarkali with intricate Lucknowi shadow work, scalloped tissue organza dupatta and churidar.',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'insp-3',
    title: 'Sapphire Velvet Corset Evening Gown',
    designer: 'Meera Kapoor Couture',
    likes: 1850,
    dressType: 'A-Line Evening Gown' as const,
    fabric: 'Silk Velvet' as const,
    color: 'Sapphire Royal Blue',
    prompt: 'Deep sapphire silk velvet evening gown with boned sweetheart corset bodice, crystal embroidered side slit and dramatic train.',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'insp-4',
    title: 'Ruby Kanjeevaram Pre-Draped Saree Gown',
    designer: 'K. V. Ramanathan',
    likes: 1120,
    dressType: 'Kanjeevaram Saree Gown' as const,
    fabric: 'Pure Kanjeevaram Silk' as const,
    color: 'Crimson Vermilion',
    prompt: 'Crimson red Kanjeevaram silk saree gown with real gold temple zari borders, sculpted shoulder pallu drape and hand-embroidered blouse.',
    image: 'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'insp-5',
    title: 'Champagne Gota Patti Tiered Sharara',
    designer: 'Master Darzi Gwalior',
    likes: 890,
    dressType: 'Sharara & Gharara Set' as const,
    fabric: 'Chanderi Brocade' as const,
    color: 'Champagne Gold',
    prompt: 'Champagne gold Chanderi sharara set with real gota patti motifs on 3-tiered flare, short kurti and gossamer dupatta.',
    image: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'insp-6',
    title: 'Blush Rose Corseted Lehenga',
    designer: 'Vogue Studio Bandra',
    likes: 2130,
    dressType: 'Bridal Lehenga & Choli' as const,
    fabric: 'Mulberry Silk' as const,
    color: 'Blush Rose',
    prompt: 'Pastel blush pink bridal lehenga with tone-on-tone resham floral embroidery, structured corset blouse and pearl-crusted border.',
    image: 'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=800&auto=format&fit=crop&q=80'
  }
];

export const EXCLUSIVE_OFFERS = [
  {
    id: 'off-1',
    code: 'BHARATVIP',
    title: '100% Guaranteed Fit Escrow',
    subtitle: 'Zero upfront risk. Funds held securely in Bharat Escrow until your final doorstep fitting trial.',
    badge: 'PEARL GUARANTEE',
  },
  {
    id: 'off-2',
    code: 'ATELIER15',
    title: 'Complimentary Swatch Courier',
    subtitle: 'Order bespoke stitching and receive curated physical silk swatches delivered to your address before cutting begins.',
    badge: 'LIMITED PRIVILEGE',
  }
];

export const MARKETPLACE_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'prod-saffron-peplum',
    title: 'Saffron Silk Peplum Set',
    category: 'featured',
    categoryLabel: 'Featured collection',
    designerName: 'Naira Atelier',
    designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    price: 3299,
    originalPrice: 4299,
    images: [
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: 'Marigold silk',
    description: 'Sculpted peplum top with flute pleating and matching high-waist flared skirt in luminous marigold silk.',
    rating: 4.95,
    reviewCount: 42,
    tags: ['Ready to wear', 'Featured', 'Marigold silk', 'Festive'],
    inStock: true,
    leadTimeDays: 3,
    specs: {
      color: 'Marigold Saffron',
      length: 'Floor Length Skirt + Peplum Top',
      washCare: 'Dry Clean Specialist',
      work: 'Silk thread contouring'
    }
  },
  {
    id: 'prod-ivory-coord',
    title: 'Ivory Pearl Co-ord',
    category: 'featured',
    categoryLabel: 'Featured collection',
    designerName: 'House of Mira',
    designerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    price: 1499,
    originalPrice: 2199,
    images: [
      'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L'],
    fabric: 'Ivory crepe',
    description: 'Minimalist luxury crop bodice paired with structured wide-leg palazzo or slit skirt in fine ivory crepe.',
    rating: 4.92,
    reviewCount: 38,
    tags: ['Ready to wear', 'Featured', 'Ivory crepe', 'Limited edition'],
    inStock: true,
    leadTimeDays: 2,
    specs: {
      color: 'Warm Ivory',
      length: 'Cropped Bustier + Midi Skirt',
      washCare: 'Gentle Machine / Dry Clean',
      work: 'Subtle seed pearl piping'
    }
  },
  {
    id: 'prod-rosewater-anarkali',
    title: 'Rose Water Anarkali',
    category: 'ready-to-wear',
    categoryLabel: 'Ready-to-Wear',
    designerName: 'Meera Couture',
    designerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    price: 3499,
    originalPrice: 4500,
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: 'Net & pearls',
    description: 'Romantic floor-length Anarkali draped in soft pastel net with hand-finished freshwater pearl clusters.',
    rating: 4.96,
    reviewCount: 51,
    tags: ['Ready to wear', 'Net & pearls', 'Pastel pink'],
    inStock: true,
    leadTimeDays: 3,
    specs: {
      color: 'Rose Water Blush',
      length: 'Floor Length (52")',
      washCare: 'Delicate Dry Clean',
      work: 'Pearl constellation embroidery'
    }
  },
  {
    id: 'prod-midnight-jacket',
    title: 'Midnight Embroidered Jacket',
    category: 'ready-to-wear',
    categoryLabel: 'Ready-to-Wear',
    designerName: 'The Draped Needle',
    designerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    price: 2999,
    originalPrice: 3899,
    images: [
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['S', 'M', 'L', 'XL'],
    fabric: 'Silk blend',
    description: 'Regal structured evening jacket in midnight navy silk blend with dense gold and zardozi threadwork.',
    rating: 4.91,
    reviewCount: 34,
    tags: ['Ready to wear', 'Silk blend', 'Midnight navy', 'Limited edition'],
    inStock: true,
    leadTimeDays: 4,
    specs: {
      color: 'Midnight Navy & Gold',
      length: 'Hip Length Fitted Jacket',
      washCare: 'Professional Steam Clean',
      work: 'Heavy zardozi and metallic zari'
    }
  },
  {
    id: 'prod-1',
    title: 'The Noorani Gold Banarasi Silk Lehenga',
    category: 'designer',
    categoryLabel: 'Designer Couture',
    designerName: 'Ustad Rafiq Shahi Darzi',
    designerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    price: 48000,
    originalPrice: 58000,
    images: [
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'Custom Stitch to Measure'],
    fabric: 'Pure Banarasi Katan Silk with 24K Gold Zari Weave',
    description: 'An architectural 16-panel bridal masterpiece woven on traditional handlooms in Varanasi. Embellished with hand-worked dabka zardozi motifs along the 4-inch scalloped border and accompanied by a pure silk organza dupatta.',
    rating: 4.96,
    reviewCount: 38,
    tags: ['Bridal', 'Banarasi', 'Zari', 'Handloom'],
    inStock: true,
    leadTimeDays: 5,
    specs: {
      color: 'Royal Crimson & Antique Gold',
      length: 'Floor Length (43")',
      washCare: 'Dry Clean Specialist Only',
      work: 'Hand Zardozi & Resham Embroidery'
    },
    reviews: [
      {
        id: 'rev-1',
        userName: 'Radhika Singhania',
        rating: 5,
        comment: 'The stitching precision was beyond anything I have purchased in luxury boutiques. Ustad Rafiq even left generous 2.5-inch alteration margins!',
        date: '14 Feb 2026'
      },
      {
        id: 'rev-2',
        userName: 'Pooja Kashyap',
        rating: 5,
        comment: 'Breathable mulmul lining makes this comfortable to wear through 8 hours of wedding rituals.',
        date: '28 Jan 2026'
      }
    ]
  },
  {
    id: 'prod-2',
    title: 'Opaline Rose Resham Kalidar Suit',
    category: 'ready-to-wear',
    categoryLabel: 'Ready-to-Wear',
    designerName: 'Irfan Qureshi Studio',
    designerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    price: 24500,
    originalPrice: 29000,
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['S', 'M', 'L', 'Custom Stitch to Measure'],
    fabric: 'Pure Mulberry Silk Georgette',
    description: 'A diaphanous 28-kali Anarkali suit finished with micro-pearl edging on the decolletage and sleeves. Pre-stitched and ready to ship within 24 hours or customizable to your 14-point fit sheet.',
    rating: 4.88,
    reviewCount: 29,
    tags: ['Festive', 'Pastel', 'Mulberry Silk'],
    inStock: true,
    leadTimeDays: 2,
    specs: {
      color: 'Opaline Dusty Rose',
      length: 'Floor Length (54")',
      washCare: 'Delicate Dry Clean',
      work: 'Fine Chikankari Shadow Work'
    }
  },
  {
    id: 'prod-3',
    title: 'Sapphire Night Velvet Sculpted Gown',
    category: 'featured',
    categoryLabel: 'Featured Collection',
    designerName: 'Meera Kapoor Couture',
    designerAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    price: 36000,
    originalPrice: 42000,
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'L', 'Custom Stitch to Measure'],
    fabric: 'Dense Silk Micro-Velvet (420 GSM)',
    description: 'Internal Parisian boned corsetry with sweetheart decolletage and a sculpted fluid mermaid flare. Features concealed side zipper and padded bust support.',
    rating: 4.92,
    reviewCount: 44,
    tags: ['Red Carpet', 'Velvet', 'Corsetry'],
    inStock: true,
    leadTimeDays: 4,
    specs: {
      color: 'Midnight Sapphire',
      length: 'Floor Sweeping with 18" Court Train',
      washCare: 'Professional Steam Clean',
      work: 'Tonal Bugle Beadwork'
    }
  },
  {
    id: 'prod-4',
    title: 'Kanjeevaram Temple Zari Saree Gown',
    category: 'premium',
    categoryLabel: 'Premium Fashion',
    designerName: 'K. V. Ramanathan Silks',
    designerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    price: 52000,
    originalPrice: 65000,
    images: [
      'https://images.unsplash.com/photo-1617627143750-d86bc21e42bb?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['S', 'M', 'L', 'Custom Stitch to Measure'],
    fabric: 'Authentic 3-Ply Kanchipuram Silk with Certified Pure Zari',
    description: 'Pre-pleated modern saree gown that zips on in 30 seconds with no safety pins needed. Preserves the authentic heavy gold Korvai borders woven by master weavers.',
    rating: 4.98,
    reviewCount: 52,
    tags: ['Kanjeevaram', 'Pre-Pleated', 'Heritage Zari'],
    inStock: true,
    leadTimeDays: 7,
    specs: {
      color: 'Vermilion Red & Gold',
      length: 'Ankle Length (40")',
      washCare: 'Pure Silk Specialist Clean',
      work: 'Korvai Pure Zari Temple Motifs'
    }
  },
  {
    id: 'prod-5',
    title: 'Emerald Gota Patti Festive Sharara Set',
    category: 'limited-edition',
    categoryLabel: 'Limited Edition',
    designerName: 'Gwalior Darzi Atelier',
    designerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    price: 29500,
    originalPrice: 34000,
    images: [
      'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['XS', 'S', 'M', 'Custom Stitch to Measure'],
    fabric: 'Pure Chanderi Brocade & Organza',
    description: 'Limited edition of only 15 handcrafted sets. Real hammered gota patti ribbons stitched onto flared 3-tier sharara pants paired with a tailored keyhole kurti.',
    rating: 4.85,
    reviewCount: 16,
    tags: ['Gota Patti', 'Limited Run', 'Chanderi'],
    inStock: true,
    leadTimeDays: 3,
    specs: {
      color: 'Deep Emerald Green',
      length: 'Sharara 42", Kurti 34"',
      washCare: 'Gentle Dry Clean',
      work: 'Hand Hammered Gota Patti'
    }
  },
  {
    id: 'prod-6',
    title: 'Ivory Pearl Decolletage Cocktail Gown',
    category: 'curated-resale',
    categoryLabel: 'Curated Ready Pieces',
    designerName: 'Atelier Rafiq & Pearl Pick Master Certified',
    designerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    price: 27000,
    originalPrice: 48000,
    images: [
      'https://images.unsplash.com/photo-1518049362265-d5b2a6467637?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['S (Bust 34-36)', 'M (Bust 36-38)'],
    fabric: 'Duchess Satin with Freshwater Seed Pearls',
    description: 'Flawlessly tailored pearl-studded corset bodice with a flowing bias-cut satin skirt. Inspected and certified by Pearl Pick quality auditors to ensure pristine garment integrity and verified sizing.',
    rating: 4.91,
    reviewCount: 22,
    tags: ['Cocktail', 'Pearls', 'Duchess Satin', 'Certified'],
    inStock: true,
    leadTimeDays: 1,
    specs: {
      color: 'Champagne Pearl Ivory',
      length: 'Floor Length (56")',
      washCare: 'Dry Clean Only',
      work: 'Hand-sewn Freshwater Seed Pearls'
    }
  },
  {
    id: 'prod-men-bandhgala',
    title: 'The Royal Rajputana Raw Silk Bandhgala',
    category: 'ready-to-wear',
    categoryLabel: "Men's Bespoke",
    designerName: 'Master R. K. Singhania & Sons',
    designerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    price: 32000,
    originalPrice: 38000,
    images: [
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['38 Regular', '40 Regular', '42 Regular', 'Bespoke to Measure'],
    fabric: 'Pure Banarasi Raw Silk & Floating Canvas',
    description: 'Impeccably structured Bandhgala coat in midnight obsidian raw silk with hand-embroidered antique gold collar, brass monogram buttons, and tapered Jodhpur breeches.',
    rating: 4.96,
    reviewCount: 38,
    tags: ["Men's Bespoke", 'Bandhgala', 'Raw Silk', 'Royal'],
    inStock: true,
    leadTimeDays: 5,
    specs: {
      color: 'Midnight Obsidian & Antique Gold',
      length: 'Coat 30", Trouser 41"',
      washCare: 'Dry Clean Only',
      work: 'Hand Zardozi Collar & Crest Buttons'
    }
  },
  {
    id: 'prod-men-tuxedo',
    title: 'Savile Row Bordeaux Silk Velvet Tuxedo',
    category: 'featured',
    categoryLabel: "Men's Black Tie",
    designerName: 'Singhania & Sons Bespoke',
    designerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    price: 42000,
    originalPrice: 50000,
    images: [
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['38 Regular', '40 Regular', '42 Regular', 'Bespoke to Measure'],
    fabric: 'Dense Silk Velvet (420 GSM) & Duchess Satin',
    description: 'Full floating horsehair canvas dinner jacket with satin silk peak lapels, double-breasted vest, and tailored trousers with satin side piping.',
    rating: 4.94,
    reviewCount: 26,
    tags: ["Men's Bespoke", 'Tuxedo', 'Black Tie', 'Velvet'],
    inStock: true,
    leadTimeDays: 7,
    specs: {
      color: 'Bordeaux Velvet & Black Satin',
      length: 'Jacket 30.5", Inseam 32"',
      washCare: 'Specialist Velvet Dry Clean',
      work: 'Hand-Rolled Peak Lapels & AMF Stitching'
    }
  },
  {
    id: 'prod-men-bundi',
    title: 'Artisan Banarasi Brocade Bundi & Kurta Set',
    category: 'ready-to-wear',
    categoryLabel: "Men's Festive",
    designerName: 'Darzi-e-Khaas by Salim Chishti',
    designerAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
    price: 16500,
    originalPrice: 19500,
    images: [
      'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?w=1000&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=1000&auto=format&fit=crop&q=80'
    ],
    sizes: ['S (38)', 'M (40)', 'L (42)', 'XL (44)', 'Custom Fit'],
    fabric: 'Banarasi Brocade & Egyptian Giza Cotton',
    description: 'Golden ochre handwoven brocade Nehru jacket with real mother-of-pearl buttons paired with a breathable fine cotton kurta and churidar pants.',
    rating: 4.89,
    reviewCount: 31,
    tags: ["Men's Bespoke", 'Nehru Jacket', 'Festive', 'Kurta Pajama'],
    inStock: true,
    leadTimeDays: 3,
    specs: {
      color: 'Golden Ochre & Ivory',
      length: 'Jacket 28", Kurta 42"',
      washCare: 'Dry Clean for Bundi, Gentle Wash for Kurta',
      work: 'Fine Zari Weave & Mother of Pearl'
    }
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'AI Dream Dress Ready',
    message: 'Your bespoke design "The Maharani 16-Kali Kalidar" is ready to preview with technical tailoring notes.',
    type: 'design_ready',
    timestamp: '10 mins ago',
    isRead: false,
    actionTab: 'studio'
  },
  {
    id: 'notif-2',
    title: 'Quotation Received',
    message: 'Ustad Rafiq Ahmed & Sons sent a custom quotation of ₹35,000 for your wedding lehenga stitching.',
    type: 'quote_received',
    timestamp: '2 hours ago',
    isRead: false,
    actionTab: 'quotations'
  },
  {
    id: 'notif-3',
    title: 'Tailor Accepted Request',
    message: 'Maestro Irfan Qureshi accepted your bridal order. Payment is safely held in Bharat Escrow Vault.',
    type: 'tailor_accepted',
    timestamp: '1 day ago',
    isRead: true,
    actionTab: 'orders'
  },
  {
    id: 'notif-4',
    title: 'Dress Delivered Successfully',
    message: 'Your Banarasi Silk Anarkali has arrived! Please confirm fitting and release final tailor milestone.',
    type: 'order_delivered',
    timestamp: '3 days ago',
    isRead: true,
    actionTab: 'orders'
  }
];

