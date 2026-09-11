export const SRS_DOCUMENT = {
  title: 'Software Requirement Specification (SRS) - PEARL PICK!',
  version: '1.0.0',
  date: 'August 2026',
  sections: [
    {
      id: 'srs-1',
      title: '1. Introduction & Executive Summary',
      content: `PEARL PICK! is a next-generation AI-powered custom dress design marketplace engineered for high-fashion bespoke garments. 
The platform bridges haute couture imagination and master artisan craftsmanship. Customers can ideate, customize, and generate photorealistic dress designs with full tailoring specifications using cutting-edge Generative AI. Verified master tailors can subsequently submit itemized quotations, discuss exact measurements via real-time fashion chat, and execute garment crafting backed by a secure milestone-based escrow mechanism.`
    },
    {
      id: 'srs-2',
      title: '2. Purpose, Scope & Objectives',
      content: `### Purpose
Eliminate the friction of custom tailoring: vague sketches, unexpected price surges, poor fit, and lack of trust between clients and bespoke artisans.

### Scope
- **Customer Portal**: Multi-step AI Dress Generator, 360-degree variation visualizer, verified tailor directory, quotation comparison matrix, interactive measurement sheet, style chat, and order tracking with white-glove delivery confirmation.
- **Tailor Atelier Portal**: Document verification, inquiry feed, itemized quotation engine, order milestone manager with photo proof, and earnings analytics.
- **Admin Control Center**: Identity/business license verification, escrow management, platform analytics, dispute resolution, and review moderation.

### Strategic Objectives
1. Reduce bespoke dress conceptualization time from 14 days to under 30 seconds using AI.
2. Ensure 99.2% sizing accuracy through 14-point digital measurement profiles and tailor validation.
3. Protect client funds via a 4-tier milestone escrow vault.`
    },
    {
      id: 'srs-3',
      title: '3. Functional Requirements',
      content: `### FR-1: Customer Authentication & Profile
- FR-1.1: Multi-role authentication (Customer, Tailor, Admin) using JWT tokenization.
- FR-1.2: Persistent customer wardrobe containing saved AI designs, favorite tailors, and measurement sheets.

### FR-2: AI Dress Design Generator
- FR-2.1: Multi-parameter prompt compilation (Dress Type, Occasion, Fabric, Swatch Color, Neckline, Sleeve, Pattern/Embellishment, and custom text prompt).
- FR-2.2: Generates multiple haute couture variations with fabric weight (GSM), yardage estimate, tailor stitching notes, and color psychology.
- FR-2.3: Exportable technical specification sheet (PNG / PDF spec sheet format).

### FR-3: Tailor Marketplace & Discovery
- FR-3.1: Geospatial and specialty filtering (Bridal, Red Carpet, Indo-Western, Contemporary).
- FR-3.2: Verified badge certification display, experience years, customer review breakdown, and past project showcase.

### FR-4: Quotation & Escrow System
- FR-4.1: 1-click quotation broadcast to verified tailors in customer's region.
- FR-4.2: Itemized quotes with transparent breakdown (Fabric, Stitching, Embroidery/Beading, Finishing).
- FR-4.3: Milestone-based escrow lock releasing funds on verifiable crafting stages.

### FR-5: Measurement & Style Chat
- FR-5.1: 14-point body dimension digital sheet with posture notes and unit converter (inches/cm).
- FR-5.2: Real-time messaging with fabric swatch previews and baste-fit photo attachments.

### FR-6: Tailor Verification & Admin Workflow
- FR-6.1: Tailor document upload (Govt ID, GST/Trade License, Master Tailor Certificate).
- FR-6.2: Admin review queue with 1-click Approve / Reject with revision notes.`
    },
    {
      id: 'srs-4',
      title: '4. Non-Functional Requirements',
      content: `### NFR-1: Performance & Latency
- AI Dress generation response time < 4.5 seconds for complete structured specs.
- Client First Contentful Paint (FCP) < 0.8s on 4G mobile networks.

### NFR-2: Security & Privacy
- All passwords hashed via Argon2id/Bcrypt.
- JWT tokens signed with RS256 algorithm and stored securely with HTTP-only cookies in production.
- Client measurements and private chat images encrypted in transit (TLS 1.3) and at rest (AES-256).

### NFR-3: Reliability & Scalability
- Clean architectural separation between UI, GraphQL gateway, and data persistence layers.
- 99.95% system uptime with graceful fallback generation engine.`
    }
  ]
};

export const SDD_DOCUMENT = {
  title: 'Software Design Document (SDD) - PEARL PICK!',
  version: '1.0.0',
  architecture: `
+-------------------------------------------------------------------------------+
|                           CLIENT APPLICATION LAYER                            |
|  +-------------------------------------------------------------------------+  |
|  |             Ionic / Angular / React Cross-Platform Mobile UI            |  |
|  |   - Luxury Theme (Beige, Cream, Gold, Soft Pink)                        |  |
|  |   - MVVM Modular Architecture & Reusable Component Hierarchy            |  |
|  +-------------------------------------------------------------------------+  |
+---------------------------------------+---------------------------------------+
                                        | HTTPS / WSS / GraphQL
                                        v
+-------------------------------------------------------------------------------+
|                           BACKEND & API GATEWAY LAYER                         |
|  +-------------------------------------------------------------------------+  |
|  |                       Node.js + Express Server                          |  |
|  |   - GraphQL Execution Engine (/api/graphql)                             |  |
|  |   - JWT Authentication & Role-Based Access Control (RBAC)               |  |
|  |   - Gemini AI Couture Intelligence (@google/genai)                      |  |
|  |   - Real-time Chat & WebSockets Hub                                     |  |
|  +-------------------------------------------------------------------------+  |
+---------------------------------------+---------------------------------------+
                                        | Connection Pool (ORM / Drizzle / Knex)
                                        v
+-------------------------------------------------------------------------------+
|                            DATABASE & STORAGE LAYER                           |
|  +-------------------------------------------------------------------------+  |
|  |                          MySQL 8.0 Enterprise                           |  |
|  |   - Users, Customers, Tailors, DressDesigns, Quotations, Orders,        |  |
|  |     Milestones, Measurements, ChatMessages, Reviews, Notifications      |  |
|  |   - B-Tree Indexes, Foreign Key Cascades, Spatial Indexing (GIS)        |  |
|  +-------------------------------------------------------------------------+  |
+-------------------------------------------------------------------------------+
`,
  sequenceDiagram: `
CUSTOMER                       BACKEND (GraphQL & AI)                  TAILOR
   |                                     |                               |
   |--- 1. Select Dress Attributes ----->|                               |
   |    (Type, Fabric, Neck, Color)      |--- Call Gemini 3.7 Flash ---->|
   |                                     |<-- Structured Spec & Design --|
   |<-- 2. Receive 3 AI Variations ------|                               |
   |                                     |                               |
   |--- 3. Send Quotation Request ------>|--- 4. Notify Tailors -------->|
   |                                     |                               |
   |                                     |<-- 5. Submit Itemized Quote --|
   |<-- 6. Compare Quotes & Accept ------|                               |
   |                                     |                               |
   |--- 7. Confirm 14-pt Measurements -->|--- 8. Deliver Specs --------->|
   |                                     |                               |
   |<================ 9. Real-time Style & Fitting Chat ================>|
   |                                     |                               |
   |                                     |<-- 10. Update Milestones -----|
   |<-- 11. Tracking & Photo Proof ------|    (Fabric, Toile, Finish)    |
   |                                     |                               |
   |--- 12. Confirm Delivery & Rate ---->|--- 13. Release Escrow Vault ->|
`,
  erDiagramDescription: `
[USERS] 1 --- 1 [CUSTOMERS]
[USERS] 1 --- 1 [TAILORS]
[CUSTOMERS] 1 --- * [DRESS_DESIGNS]
[CUSTOMERS] 1 --- 1 [MEASUREMENTS]
[DRESS_DESIGNS] 1 --- * [QUOTATION_REQUESTS]
[QUOTATION_REQUESTS] 1 --- * [TAILOR_QUOTATIONS]
[TAILORS] 1 --- * [TAILOR_QUOTATIONS]
[TAILOR_QUOTATIONS] 1 --- 1 [ORDERS]
[ORDERS] 1 --- * [ORDER_MILESTONES]
[ORDERS] 1 --- 1 [REVIEWS]
[CUSTOMERS] 1 --- * [CHAT_MESSAGES] * --- 1 [TAILORS]
`
};

export const GRAPHQL_DOCUMENTATION = {
  schema: `
type User {
  id: ID!
  email: String!
  role: String!
  name: String!
  avatar: String
}

type DressDesignVariation {
  id: ID!
  name: String!
  tagline: String!
  frontImageUrl: String!
  fabricDetails: FabricSpec!
  tailorNotes: [String!]!
  stylingTips: [String!]!
  colorPsychology: String!
  estimatedCraftTimeDays: Int!
  estimatedPriceRange: PriceRange!
  specs: DressSpecs!
}

type FabricSpec {
  primary: String!
  lining: String!
  embellishments: String
  estimatedYards: Float!
  recommendedWeightGsm: Int!
}

type PriceRange {
  min: Float!
  max: Float!
  currency: String!
}

type DressSpecs {
  dressType: String!
  occasion: String!
  fabric: String!
  color: String!
  sleeve: String!
  neckline: String!
  pattern: String!
}

type DressDesign {
  id: ID!
  customerId: ID!
  customerName: String!
  title: String!
  prompt: String!
  createdAt: String!
  isFavorite: Boolean!
  variations: [DressDesignVariation!]!
}

type TailorProfile {
  id: ID!
  name: String!
  shopName: String!
  city: String!
  experienceYears: Int!
  verificationStatus: String!
  rating: Float!
  reviewCount: Int!
  specialties: [String!]!
  bio: String!
  badge: String!
  startingPrice: Float!
  portfolio: [PortfolioWork!]!
}

type PortfolioWork {
  id: ID!
  title: String!
  category: String!
  imageUrl: String!
  completionTimeDays: Int!
  price: Float!
}

type TailorQuotation {
  id: ID!
  requestId: ID!
  tailorId: ID!
  tailorName: String!
  totalAmount: Float!
  estimatedDeliveryDays: Int!
  fabricIncluded: Boolean!
  tailorMessage: String!
  status: String!
}

type Query {
  me: User
  tailors(specialty: String, verifiedOnly: Boolean): [TailorProfile!]!
  tailor(id: ID!): TailorProfile
  myDesigns: [DressDesign!]!
  quotationRequests: [QuotationRequest!]!
  myOrders: [Order!]!
  adminStats: AdminStats!
}

type Mutation {
  generateDressDesign(input: GenerateDressInput!): DressDesign!
  requestQuotations(designId: ID!, budget: Float, neededBy: String, notes: String): QuotationRequest!
  submitQuotation(requestId: ID!, items: [QuotationItemInput!]!, deliveryDays: Int!, message: String!): TailorQuotation!
  acceptQuotation(quotationId: ID!): Order!
  updateMilestone(orderId: ID!, stage: String!, completed: Boolean!, photoUrl: String): Order!
  verifyTailor(tailorId: ID!, status: String!, notes: String): TailorProfile!
  sendMessage(orderId: ID!, receiverId: ID!, text: String!, attachment: AttachmentInput): ChatMessage!
  submitReview(orderId: ID!, overall: Float!, fit: Float!, craft: Float!, comment: String!): Review!
}
`,
  sampleQuery: `
# Sample GraphQL Query: Fetch Verified Tailors with Bridal Specialty
query GetTopBridalTailors {
  tailors(specialty: "Bridal & Wedding", verifiedOnly: true) {
    id
    name
    shopName
    rating
    reviewCount
    experienceYears
    badge
    startingPrice
    portfolio {
      title
      imageUrl
      price
    }
  }
}
`,
  sampleMutation: `
# Sample GraphQL Mutation: Generate AI Custom Dress Design
mutation GenerateCoutureDress {
  generateDressDesign(input: {
    dressType: "A-Line Evening Gown",
    occasion: "Red Carpet & Gala",
    fabric: "Silk Velvet",
    color: "Pearl Champagne",
    sleeve: "Off-Shoulder Draped",
    neckline: "Sweetheart",
    pattern: "Pearl & Swarovski Beadwork",
    prompt: "A royal cathedral gown with cascading pearls along corsetry"
  }) {
    id
    title
    variations {
      id
      name
      tagline
      fabricDetails {
        primary
        estimatedYards
        recommendedWeightGsm
      }
      tailorNotes
      estimatedPriceRange {
        min
        max
        currency
      }
    }
  }
}
`
};

export const MYSQL_SCHEMA_SQL = `-- =============================================================================
-- PEARL PICK! — High-Fashion Custom Dress Marketplace Database DDL
-- Target Engine: MySQL 8.0+ | Character Set: utf8mb4 | Collation: utf8mb4_unicode_ci
-- =============================================================================

CREATE DATABASE IF NOT EXISTS \`pearl_pick_db\` 
DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE \`pearl_pick_db\`;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS \`users\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`email\` VARCHAR(191) NOT NULL UNIQUE,
  \`password_hash\` VARCHAR(255) NOT NULL,
  \`role\` ENUM('customer', 'tailor', 'admin') NOT NULL DEFAULT 'customer',
  \`full_name\` VARCHAR(150) NOT NULL,
  \`phone_number\` VARCHAR(30),
  \`avatar_url\` VARCHAR(500),
  \`is_active\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_users_role\` (\`role\`),
  INDEX \`idx_users_email\` (\`email\`)
) ENGINE=InnoDB;

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS \`customers\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`user_id\` VARCHAR(36) NOT NULL UNIQUE,
  \`preferred_currency\` VARCHAR(10) NOT NULL DEFAULT 'USD',
  \`shipping_address\` TEXT,
  \`city\` VARCHAR(100),
  \`country\` VARCHAR(100),
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_customers_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Tailors Table
CREATE TABLE IF NOT EXISTS \`tailors\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`user_id\` VARCHAR(36) NOT NULL UNIQUE,
  \`shop_name\` VARCHAR(200) NOT NULL,
  \`cover_image_url\` VARCHAR(500),
  \`city\` VARCHAR(100) NOT NULL,
  \`state\` VARCHAR(100),
  \`country\` VARCHAR(100) NOT NULL,
  \`experience_years\` INT NOT NULL DEFAULT 1,
  \`verification_status\` ENUM('PENDING', 'VERIFIED', 'REJECTED') NOT NULL DEFAULT 'PENDING',
  \`verified_at\` TIMESTAMP NULL,
  \`rating_average\` DECIMAL(3,2) NOT NULL DEFAULT 5.00,
  \`review_count\` INT NOT NULL DEFAULT 0,
  \`completed_orders_count\` INT NOT NULL DEFAULT 0,
  \`badge\` VARCHAR(50) DEFAULT 'Verified Pro',
  \`starting_price\` DECIMAL(10,2) NOT NULL DEFAULT 250.00,
  \`average_turnaround_days\` INT NOT NULL DEFAULT 14,
  \`bio\` TEXT,
  \`shop_address\` TEXT,
  \`equipment_list\` JSON,
  \`certifications_list\` JSON,
  \`id_proof_url\` VARCHAR(500),
  \`business_license_url\` VARCHAR(500),
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_tailors_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_tailors_verification\` (\`verification_status\`),
  INDEX \`idx_tailors_city\` (\`city\`)
) ENGINE=InnoDB;

-- 4. Customer Measurement Profiles
CREATE TABLE IF NOT EXISTS \`measurements\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`customer_id\` VARCHAR(36) NOT NULL UNIQUE,
  \`unit\` ENUM('inches', 'cm') NOT NULL DEFAULT 'inches',
  \`bust\` DECIMAL(5,2) NOT NULL,
  \`waist\` DECIMAL(5,2) NOT NULL,
  \`high_hip\` DECIMAL(5,2) NOT NULL,
  \`low_hip\` DECIMAL(5,2) NOT NULL,
  \`shoulder_to_shoulder\` DECIMAL(5,2) NOT NULL,
  \`shoulder_to_waist\` DECIMAL(5,2) NOT NULL,
  \`waist_to_hem\` DECIMAL(5,2) NOT NULL,
  \`hollow_to_floor\` DECIMAL(5,2) NOT NULL,
  \`armhole\` DECIMAL(5,2) NOT NULL,
  \`bicep\` DECIMAL(5,2) NOT NULL,
  \`sleeve_length\` DECIMAL(5,2) NOT NULL,
  \`neck_circumference\` DECIMAL(5,2) NOT NULL,
  \`height\` DECIMAL(5,2) NOT NULL,
  \`fit_preference\` ENUM('Snug', 'Tailored / Regular', 'Relaxed / Flowing') NOT NULL DEFAULT 'Tailored / Regular',
  \`posture_notes\` TEXT,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_measurements_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Dress Designs Table
CREATE TABLE IF NOT EXISTS \`dress_designs\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`customer_id\` VARCHAR(36) NOT NULL,
  \`title\` VARCHAR(255) NOT NULL,
  \`prompt\` TEXT NOT NULL,
  \`dress_type\` VARCHAR(100) NOT NULL,
  \`occasion\` VARCHAR(100) NOT NULL,
  \`fabric_type\` VARCHAR(100) NOT NULL,
  \`color_name\` VARCHAR(100) NOT NULL,
  \`color_hex\` VARCHAR(20) NOT NULL,
  \`sleeve_style\` VARCHAR(100) NOT NULL,
  \`neck_design\` VARCHAR(100) NOT NULL,
  \`pattern_style\` VARCHAR(100) NOT NULL,
  \`variations_json\` JSON NOT NULL,
  \`is_favorite\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_dress_designs_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_dress_designs_customer\` (\`customer_id\`)
) ENGINE=InnoDB;

-- 6. Quotation Requests Table
CREATE TABLE IF NOT EXISTS \`quotation_requests\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`customer_id\` VARCHAR(36) NOT NULL,
  \`dress_design_id\` VARCHAR(36) NOT NULL,
  \`selected_variation_id\` VARCHAR(36) NOT NULL,
  \`target_budget\` DECIMAL(10,2),
  \`needed_by_date\` DATE NOT NULL,
  \`specific_instructions\` TEXT,
  \`status\` ENUM('OPEN', 'QUOTATIONS_RECEIVED', 'ACCEPTED', 'CLOSED') NOT NULL DEFAULT 'OPEN',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_quotation_req_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_quotation_req_design\` FOREIGN KEY (\`dress_design_id\`) REFERENCES \`dress_designs\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Tailor Quotations Table
CREATE TABLE IF NOT EXISTS \`tailor_quotations\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`request_id\` VARCHAR(36) NOT NULL,
  \`tailor_id\` VARCHAR(36) NOT NULL,
  \`total_amount\` DECIMAL(10,2) NOT NULL,
  \`currency\` VARCHAR(10) NOT NULL DEFAULT 'USD',
  \`estimated_delivery_days\` INT NOT NULL,
  \`proposed_delivery_date\` DATE NOT NULL,
  \`fabric_included\` BOOLEAN NOT NULL DEFAULT TRUE,
  \`tailor_message\` TEXT,
  \`items_breakdown_json\` JSON NOT NULL,
  \`milestones_json\` JSON NOT NULL,
  \`status\` ENUM('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED') NOT NULL DEFAULT 'PENDING',
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_quotes_request\` FOREIGN KEY (\`request_id\`) REFERENCES \`quotation_requests\`(\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_quotes_tailor\` FOREIGN KEY (\`tailor_id\`) REFERENCES \`tailors\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_quotes_request\` (\`request_id\`)
) ENGINE=InnoDB;

-- 8. Orders Table
CREATE TABLE IF NOT EXISTS \`orders\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`order_number\` VARCHAR(50) NOT NULL UNIQUE,
  \`customer_id\` VARCHAR(36) NOT NULL,
  \`tailor_id\` VARCHAR(36) NOT NULL,
  \`quotation_id\` VARCHAR(36) NOT NULL UNIQUE,
  \`current_stage\` ENUM(
    'QUOTATION_ACCEPTED',
    'MEASUREMENTS_CONFIRMED',
    'FABRIC_SOURCING',
    'PATTERN_MAKING',
    'FIRST_FITTING',
    'FINAL_STITCHING',
    'QUALITY_INSPECTION',
    'SHIPPED',
    'DELIVERED',
    'COMPLETED',
    'CANCELLED'
  ) NOT NULL DEFAULT 'QUOTATION_ACCEPTED',
  \`total_amount\` DECIMAL(10,2) NOT NULL,
  \`paid_amount\` DECIMAL(10,2) NOT NULL,
  \`escrow_status\` ENUM('SECURED_IN_ESCROW', 'PARTIALLY_RELEASED', 'RELEASED_TO_TAILOR', 'REFUNDED') NOT NULL DEFAULT 'SECURED_IN_ESCROW',
  \`tracking_number\` VARCHAR(100),
  \`carrier_name\` VARCHAR(100),
  \`estimated_delivery\` DATE NOT NULL,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  \`updated_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_orders_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`),
  CONSTRAINT \`fk_orders_tailor\` FOREIGN KEY (\`tailor_id\`) REFERENCES \`tailors\`(\`id\`),
  CONSTRAINT \`fk_orders_quotation\` FOREIGN KEY (\`quotation_id\`) REFERENCES \`tailor_quotations\`(\`id\`)
) ENGINE=InnoDB;

-- 9. Order Milestones Table
CREATE TABLE IF NOT EXISTS \`order_milestones\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`order_id\` VARCHAR(36) NOT NULL,
  \`stage_name\` VARCHAR(50) NOT NULL,
  \`label\` VARCHAR(150) NOT NULL,
  \`description\` TEXT,
  \`is_completed\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`photo_proof_url\` VARCHAR(500),
  \`completed_at\` TIMESTAMP NULL,
  CONSTRAINT \`fk_milestones_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Chat Messages Table
CREATE TABLE IF NOT EXISTS \`chat_messages\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`order_id\` VARCHAR(36),
  \`sender_id\` VARCHAR(36) NOT NULL,
  \`receiver_id\` VARCHAR(36) NOT NULL,
  \`message_text\` TEXT NOT NULL,
  \`attachment_type\` ENUM('image', 'measurement', 'quotation', 'swatch'),
  \`attachment_payload_json\` JSON,
  \`is_read\` BOOLEAN NOT NULL DEFAULT FALSE,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_chat_sender\` FOREIGN KEY (\`sender_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_chat_receiver\` FOREIGN KEY (\`receiver_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
  INDEX \`idx_chat_order\` (\`order_id\`)
) ENGINE=InnoDB;

-- 11. Reviews Table
CREATE TABLE IF NOT EXISTS \`reviews\` (
  \`id\` VARCHAR(36) PRIMARY KEY,
  \`order_id\` VARCHAR(36) NOT NULL UNIQUE,
  \`tailor_id\` VARCHAR(36) NOT NULL,
  \`customer_id\` VARCHAR(36) NOT NULL,
  \`overall_rating\` DECIMAL(3,2) NOT NULL,
  \`fit_rating\` DECIMAL(3,2) NOT NULL,
  \`craftsmanship_rating\` DECIMAL(3,2) NOT NULL,
  \`timeliness_rating\` DECIMAL(3,2) NOT NULL,
  \`comment\` TEXT NOT NULL,
  \`photos_json\` JSON,
  \`tailor_reply\` TEXT,
  \`created_at\` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT \`fk_reviews_order\` FOREIGN KEY (\`order_id\`) REFERENCES \`orders\`(\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_reviews_tailor\` FOREIGN KEY (\`tailor_id\`) REFERENCES \`tailors\`(\`id\`) ON DELETE CASCADE,
  CONSTRAINT \`fk_reviews_customer\` FOREIGN KEY (\`customer_id\`) REFERENCES \`customers\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB;
`;

export const UI_DOCUMENTATION = [
  {
    screen: 'Splash & Welcome Showcase',
    purpose: 'Onboard users into luxury haute couture experience with fast access to AI Studio and verified tailors.',
    components: ['Luxury Hero Carousel', 'Direct Action Badges', 'Top Haute Couture Trends', 'Role Switcher'],
    actions: ['Start AI Dress Generator', 'Browse Verified Tailors', 'Switch Role (Customer/Tailor/Admin)']
  },
  {
    screen: 'AI Dress Design Studio',
    purpose: 'Interactive multi-step bespoke dress configuration.',
    components: ['Dress Type Selector', 'Fabric & Weight Swatches', 'Neckline & Sleeve Modifiers', 'Color Palette with Psychology', 'AI Prompt Enhancer'],
    actions: ['Customize parameters', 'Enhance prompt with Gemini AI', 'Generate multiple haute couture variations']
  },
  {
    screen: 'AI Generated Variations Gallery',
    purpose: 'Visual presentation of AI generated dress concepts with full tailor specs.',
    components: ['High-res 360 viewer', 'Tailor notes & pattern rules', 'Fabric yardage & GSM specs', 'Spec Sheet Exporter (PDF/PNG)'],
    actions: ['Save to Wardrobe', 'Request Quotations from Verified Tailors', 'Download Specs']
  },
  {
    screen: 'Tailor Marketplace & Profiles',
    purpose: 'Discovery and vetting of master dressmakers and couture ateliers.',
    components: ['Specialty filter (Bridal, Gala, Ethnic)', 'Verified Badge Inspection', 'Portfolio work catalog with prices', 'Equipment and certification audit'],
    actions: ['View studio address', 'Send custom request', 'Read verified reviews']
  },
  {
    screen: 'Quotation Comparison Portal',
    purpose: 'Transparent itemized comparison of competing tailor bids.',
    components: ['Cost breakdown (Fabric vs Stitching vs Handwork)', 'Estimated delivery timeline', 'Milestone escrow schedule', 'Accept Quote CTA'],
    actions: ['Compare quotes side-by-side', 'Accept quotation into escrow vault', 'Open direct chat with tailor']
  },
  {
    screen: 'Style & Measurement Chat',
    purpose: 'Real-time one-to-one consultation, fabric swatch review, and fit calibration.',
    components: ['Live chat feed', '14-point Measurement Card drawer', 'Fabric swatch inspector', 'Baste-fit photo preview'],
    actions: ['Send message', 'Attach measurements', 'Request fabric samples']
  },
  {
    screen: 'Order Milestones & Delivery Confirmation',
    purpose: 'Live tracking of garment crafting from paper pattern to final delivery.',
    components: ['Visual 9-stage milestone stepper', 'Photo proof viewer', 'Escrow status badge', 'Digital unboxing and review form'],
    actions: ['Track progress', 'Confirm dress delivery', 'Submit 5-star rating and fit review']
  },
  {
    screen: 'Tailor Atelier Dashboard',
    purpose: 'Manage incoming bespoke inquiries, submit bids, and track production pipeline.',
    components: ['Inquiry inbox', 'Itemized Quotation Maker', 'Order Milestone updater with photo upload', 'Earnings ledger'],
    actions: ['Submit quote', 'Advance order stage', 'View atelier payout balance']
  },
  {
    screen: 'Admin Control Center',
    purpose: 'Platform oversight, tailor credential verification, and marketplace metrics.',
    components: ['GMV & Order volume charts', 'Tailor Verification queue with document viewer', 'Escrow dispute monitor', 'Review moderation'],
    actions: ['Approve / Reject tailors', 'Release or refund escrow', 'Export platform analytics']
  }
];

export const PROJECT_SRS = {
  title: 'PEARL PICK! Software Requirement Specification',
  overview: 'PEARL PICK! is an AI-powered custom dress design marketplace connecting customers with master verified tailors for bespoke garments. Customers generate designs with fabric details, receive competitive itemized bids, and track garment creation with milestone-based escrow.',
  functionalRequirements: [
    {
      module: 'AI Design Studio',
      title: 'Haute Couture AI Dress Generation',
      features: [
        'Multi-attribute design generation (silhouettes, necklines, sleeves, fabrics)',
        'Fabric weight (GSM) & yardage estimation',
        'Color psychology breakdown and tailoring technical notes'
      ]
    },
    {
      module: 'Tailor Marketplace',
      title: 'Verified Artisan Directory & Discovery',
      features: [
        'KYC credential and trade license verification badges',
        'Filter by craftsmanship specialty (Bridal, Red Carpet, Silk)',
        'Past customer reviews and portfolio showcase'
      ]
    },
    {
      module: 'Escrow & Quotations',
      title: 'Itemized Bidding & Secure Milestone Escrow',
      features: [
        '1-click broadcast of design requests to local tailors',
        'Itemized cost breakdown (Fabric, Stitching, Handwork, Finishing)',
        'Escrow vault securing funds until delivery confirmation'
      ]
    },
    {
      module: 'Measurements & Orders',
      title: 'Digital Measurement Sheet & Production Stepper',
      features: [
        '14-point body dimension sheet with posture notes',
        '9-stage production timeline with live photo verification',
        'Real-time style chat for fabric swatches and fittings'
      ]
    }
  ],
  nonFunctionalRequirements: [
    { category: 'Performance', description: 'Design generation completes in under 3.5s with responsive mobile rendering.' },
    { category: 'Security', description: 'Bank-grade escrow encryption, signed JWTs, and secure measurement privacy.' },
    { category: 'Reliability', description: '99.9% uptime with offline-first client caching and atomic milestone transitions.' },
    { category: 'Usability', description: 'Adheres to WCAG AA accessibility with responsive mobile and desktop viewports.' }
  ]
};

export const PROJECT_SDD = {
  title: 'PEARL PICK! Software Design & Architecture Document',
  architectureLayers: [
    { layer: 'Presentation Layer', responsibility: 'Interactive UI, responsive mobile shell, theme styling, and state management.', technologies: 'React 19, Tailwind CSS, Lucide Icons' },
    { layer: 'Application Service Layer', responsibility: 'Business rules, quotation orchestration, escrow state machine, and prompt synthesis.', technologies: 'TypeScript, Express, Node.js' },
    { layer: 'AI Intelligence Engine', responsibility: 'Couture generation, tailoring specs compilation, and fabric advice.', technologies: '@google/genai (Gemini 2.5 Flash)' },
    { layer: 'Data & Persistence Layer', responsibility: 'Relational data modeling, transactions, audit trails, and document storage.', technologies: 'MySQL 8.0 / Cloud SQL' }
  ],
  dataFlowSteps: [
    { step: 1, title: 'AI Generation', detail: 'Customer inputs silhouette and fabric preferences; Gemini outputs structured specs and photorealistic variations.' },
    { step: 2, title: 'Quotation Broadcast', detail: 'Design spec sheet is broadcast to top verified tailors who submit itemized bids with production milestones.' },
    { step: 3, title: 'Escrow Lock', detail: 'Customer accepts a quotation; payment is locked securely in the escrow vault before crafting begins.' },
    { step: 4, title: 'Crafting & Fittings', detail: 'Tailor progresses through fabric sourcing, toile fitting, and hand embroidery with photo updates.' },
    { step: 5, title: 'Delivery & Release', detail: 'Customer inspects delivered garment and confirms satisfaction; funds are automatically released to the artisan.' }
  ]
};

export const GRAPHQL_SCHEMA = GRAPHQL_DOCUMENTATION.schema;
export const MYSQL_DDL_SCHEMA = MYSQL_SCHEMA_SQL;
export const UI_SPECIFICATIONS = UI_DOCUMENTATION;

export const INSTALLATION_GUIDE = {
  steps: [
    { title: '1. Prerequisites & Environment', description: 'Install Node.js v20+, npm v9+, and MySQL 8.0+ on your development machine.', commands: ['node --version', 'npm --version', 'mysql --version'] },
    { title: '2. Clone & Install Dependencies', description: 'Clone the repository and install all required full-stack dependencies.', commands: ['git clone https://github.com/your-org/pearl-pick.git', 'cd pearl-pick', 'npm install'] },
    { title: '3. Database Setup', description: 'Execute the MySQL DDL script to create tables, indexes, and foreign keys.', commands: ['mysql -u root -p < database/schema.sql'] },
    { title: '4. Start Development Server', description: 'Launch the development server with Hot Module Replacement and API proxying.', commands: ['npm run dev'] },
    { title: '5. Mobile Packaging with Capacitor', description: 'Bundle the web application into native Android APK / iOS projects.', commands: ['npm run build', 'npx cap add android', 'npx cap sync android', 'npx cap open android'] }
  ]
};
