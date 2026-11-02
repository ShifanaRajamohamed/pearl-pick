# PEARL PICK! — AI Fashion Design Studio & Bespoke Couture Marketplace

**PEARL PICK!** is a full-stack luxury Indian & international couture e-commerce platform, 3-View AI Dress Design Studio, and bespoke tailoring marketplace. Designed with the functional shopping navigation of **Myntra Luxe / Ajio Luxe** and the editorial minimalism of **Zara Atelier / Sabyasachi**, the platform connects fashion patrons directly with verified master designers (*Ustads*, *Darzis*, and couture ateliers) for both **Ready-to-Wear (RTW) luxury collections** and **made-to-measure AI-designed bespoke garments**.

---

## Table of Contents

1. [Project Overview & Core Philosophy](#1-project-overview--core-philosophy)
2. [Three-Role Architecture & Access Control](#2-three-role-architecture--access-control)
3. [End-to-End Feature Breakdown](#3-end-to-end-feature-breakdown)
   - [Public Storefront & Customer Experience](#a-public-storefront--customer-experience)
   - [3-View AI Custom Dress Design Studio](#b-3-view-ai-custom-dress-design-studio)
   - [Custom Dress Ordering, Quotations & Price Negotiation](#c-custom-dress-ordering-quotations--price-negotiation)
   - [Designer / Tailor Partner Portal (`/designer/login`)](#d-designer--tailor-partner-portal-designerlogin)
   - [Governance & Admin Portal (`/admin/login`)](#e-governance--admin-portal-adminlogin)
4. [Technical Stack & System Architecture](#4-technical-stack--system-architecture)
5. [Project Directory Structure](#5-project-directory-structure)
6. [Backend API Reference (`server.ts`)](#6-backend-api-reference-serverts)
7. [AI Visual Synthesis & Prompt-to-Couture Engine](#7-ai-visual-synthesis--prompt-to-couture-engine)
8. [Data Models & Persistence Layer](#8-data-models--persistence-layer)
9. [Demo Credentials & Role Testing Guide](#9-demo-credentials--role-testing-guide)
10. [Local Setup, Build & Deployment](#10-local-setup-build--deployment)

---

## 1. Project Overview & Core Philosophy

Traditional e-commerce platforms force customers to choose between off-the-rack garments with generic sizing or unorganized local tailoring with zero design visualization or payment protection. **PEARL PICK!** bridges both worlds in a single cohesive platform:

1. **Public Luxury E-Commerce Storefront (No Login Required to Browse)**:
   - Visitors immediately land on a luxury fashion shopping homepage featuring curated departments (**Women**, **Men**, **Ethnic**, **Festive**, **Collections**), circular atelier category medallions, a rotating **Designer Spotlight** carousel, **Featured Dresses**, and **Trending & Recommended** pieces.
   - Visitors can freely explore product catalogs, granular fabric filters (GSM weight, handloom origin, weave type), and verified designer portfolios without hitting a login wall.
   - Authentication is only prompted contextually when saving AI designs, wishlisting items to an account, submitting custom tailoring requests, or completing checkout.

2. **3-View AI Custom Dress Design Studio**:
   - Customers configure garment category, occasion, heritage fabric, colour palette (including 24K zari/accent pairings), sleeve cut, neckline, silhouette, embroidery detailing, and a free-form natural language prompt.
   - Generates **three coordinated fashion views** (**1. Front View**, **2. Back View**, **3. Side Profile**) plus an embroidery/weave macro detail view, ensuring consistent colour, fabric drape, neckline, and silhouette across all panels.

3. **Two-Way Quotation & Price Bargaining Engine**:
   - Customers submit their 3-view AI design sheet, 14-point body measurements (or standard sizing), and target budget to verified designers.
   - Designers respond with itemized quotations (fabric cost, embroidery labor, stitching charges, delivery timeline).
   - Both parties can negotiate prices via an integrated real-time **Counter-Offer & Messaging Thread** before locking the final agreed price into **Bharat Escrow Vault** protection.

4. **Milestone-Driven Production & Quality Rating Loop**:
   - Every custom order progresses through a 7-stage server-validated production pipeline with photo proofs and customer milestone ratings for **Quality** and **Timeliness**, giving tailors actionable improvement telemetry.

---

## 2. Three-Role Architecture & Access Control

The platform enforces strict role separation across three distinct portals, each with its own authentication flow, session token, password hashing (`crypto.scryptSync`), and permissions:

| Role | Entry Route / Trigger | Registration Policy | Core Capabilities |
| :--- | :--- | :--- | :--- |
| **1. Customer** | Public Storefront (`/`) & Profile Dropdown Login Modal | Publicly registerable via Email/Password or 4-digit Mobile OTP (`4829`) | Browse RTW catalog, filter by Fabric/GSM/Origin, use 3-View AI Dress Studio, manage Wishlist & Shopping Bag, submit 14-point Measurements, negotiate quotes with Tailors, pay via UPI/Card/NetBanking/Escrow, track & rate order milestones. |
| **2. Designer / Tailor** | `/designer/login` (or Footer *"Become a Designer / Sell With Us"*) | Public application submission; requires **Admin Approval** (`VERIFIED`) before selling products or accepting custom orders | Manage Ready-to-Wear product listings, maintain Couture Portfolio, review incoming customer AI customization requests, send itemized price quotations, negotiate budgets, chat with customers, upload milestone photo proofs, track earnings & payouts. |
| **3. Admin** | `/admin/login` (or Footer *"Admin Governance"*) | **Strictly Non-Registerable** (Pre-provisioned governance accounts only) | Verify/Approve/Reject designer applications, manage customers & tailors (suspend/activate), moderate marketplace products (`APPROVED` / `REJECTED`), monitor all RTW & bespoke orders, resolve customer disputes/refunds, inspect platform GMV & analytics. |

> **Strict UI Isolation**: Designer management tools and Admin governance tabs are never exposed on the customer shopping navigation bar. Customers remain in the shopping experience after signing in and are returned to the exact page or action they were performing prior to login.

---

## 3. End-to-End Feature Breakdown

### A. Public Storefront & Customer Experience

- **Myntra/Zara-Inspired Navigation (`Navbar.tsx`)**:
  - Department links for **Women**, **Men**, **Ethnic**, **Festive**, **Collections**, and a highlighted **AI Design Studio** CTA.
  - Global instant **Search Bar** (searches across dress titles, fabrics, designers, origins, and occasions).
  - **Profile Hover Dropdown**: Quick access to *Login / Sign Up*, *My Profile & Measurements*, *My Orders & Tracking*, *Wishlist*, *Saved AI Designs*, *Custom Quotes & Bargaining*, and *Logout*.
  - **Wishlist Drawer & View (`WishlistView.tsx`)** and **Shopping Bag Drawer (`CartCheckoutModal.tsx`)** with live badge counters.
- **Homepage Sections (`SplashScreen.tsx`)**:
  - **Live Privilege Strip**: Pincode delivery estimator (`Mumbai 400050`), promo code (`PEARLFIRST`), and flash sale countdown timer.
  - **Luxury Atelier Medallion Bar**: 9 fine-line vector couture medallions (*All Store*, *Women's Couture*, *Men's Bespoke*, *Heritage Silks*, *Bridal & Festive*, *Runway Capsules*, *AI Design Studio*, *Master Tailors*, *Privilege Edit*).
  - **Editorial Hero Banner**: Dynamic Women's Couture / Men's Bespoke lookbook toggle with direct CTAs to shop RTW or launch the AI Studio.
  - **Shop By Category Grid**: 5 department cards with curated imagery.
  - **Designer Spotlight Carousel (`DesignerSpotlight.tsx`)**: Interactive rotating showcase of verified master tailors, their star ratings, signature collection pieces, and direct **View Portfolio** and **Commission Custom** actions.
  - **Featured Dresses & Trending Grids**: 3:4 aspect ratio product cards with Myntra-style bottom-left rating pills, wishlist heart toggles, fabric/GSM/origin metadata, discount percentages, **Add to Bag**, and one-click **Customize in AI Studio**.
  - **Recently Viewed History**: Persistent horizontal carousel tracking products inspected by the customer.
- **Granular Marketplace & Filtering (`MarketplaceView.tsx`)**:
  - **Left Filtering Sidebar**:
    - **Category**: All, Bridal, Festive, Party, Traditional, Casual, Western.
    - **Fabric Type Checkboxes**: Silk, Cotton, Chiffon, Velvet, Organza, Georgette, Brocade, Satin, Crepe, Linen, Net, Tissue.
    - **Weight Ranges (GSM)**: Light (`< 150 GSM`), Medium (`150 – 280 GSM`), Heavy (`> 280 GSM`).
    - **Heritage Origin Filters**: Varanasi (Banaras), Kanchipuram, Lucknow, Jaipur, Surat, Kolkata, Kashmir, Hyderabad, Mumbai, Milan / Como.
    - **Colour Swatches**, **Occasion**, **Price Range Slider**, and **Sort Order** (Featured, Price Low-High, Price High-Low, Top Rated, Newest).
  - **Product Detail Modal (`ProductDetailModal.tsx`)**: Multi-angle gallery, size selector (`XS` to `XXL` + `Custom Tailored`), fabric & GSM specifications, verified designer badge, delivery pincode checker, and instant Add to Bag.

---

### B. 3-View AI Custom Dress Design Studio

Located in `AIDressGenerator.tsx` and `GeneratedDesignViewer.tsx`:

1. **Multi-Dimensional Configuration**:
   - **Gender Toggle**: Women's Haute Couture vs. Men's Bespoke Tailoring.
   - **Dress Category & Silhouette**: Lehenga Choli, Anarkali Suit, Draped Couture Saree, Red Carpet Evening Gown, Indo-Western Cape Set, Sharara Set, Royal Sherwani, Jodhpuri Bandhgala, Savile Row Tuxedo, etc.
   - **Occasion**: Wedding, Reception, Sangeet, Cocktail Gala, Festival, Red Carpet, Formal.
   - **Fabric Library (`FabricLibraryModal.tsx` & `FabricSwatchGallery.tsx`)**: Mulberry Silk, Kanjeevaram Silk, Banarasi Brocade, Silk Velvet, Organza, Chiffon, Georgette, Pashmina, English Wool.
   - **Colour Palette & Custom Shades**: 20+ royal Indian & international palettes with primary + metallic zari accent hex codes.
   - **Structural Detailing**: Neckline (Sweetheart, Plunging V, Mandarin Collar, Queen Anne, Off-Shoulder), Sleeves (Sleeveless, Bell, Bishop, Cape, Full Zardozi, French Cuffs), Waistline, Back Design, Hem Length, Embroidery Technique (*Zardozi*, *Chikankari*, *Gota Patti*, *Mirror Work*, *Chantilly Lace*), and Budget Range.
   - **AI Prompt Enhancer**: One-click Gemini-powered prompt enrichment that turns brief ideas into technical couture specifications.
2. **Coordinated 3-View Presentation Sheet**:
   - Displays **1. Front View**, **2. Back View**, and **3. Side Profile** (plus a **4. Fabric & Embroidery Macro View**) in a coordinated fashion design presentation board.
   - **Studio Actions**:
     - Regenerate individual or all views while preserving garment consistency.
     - Modify prompt or structural parameters on the fly.
     - Save design to personal lookbook (`DesignGallery.tsx`).
     - Download individual high-resolution PNG views.
     - **Download Combined 3-View Fashion Design Poster** (HTML5 Canvas composite export with title, specifications, fabric swatch metadata, and all 3 views).
     - **Export Technical Spec Sheet (`SpecSheetExportModal.tsx`)** for tailors.
     - **Send to Designer for Quotation** or **Place Custom Dress Order**.

---

### C. Custom Dress Ordering, Quotations & Price Negotiation

1. **14-Point Measurement Vault (`MeasurementSheetModal.tsx`)**:
   - Supports multiple saved measurement profiles (e.g., *Self*, *Bridal Trousseau Fit*, *Relaxed Festive Fit*) in inches or centimeters, covering Bust/Chest, Waist, Hips, Shoulder Width, Armhole, Sleeve Length, Neck Depth, Kurta/Blouse Length, Skirt/Trouser Length, and Posture Notes—or selection of a standard size (`XS`–`XXL`).
2. **Quotation Comparison & Bargaining (`QuotationComparison.tsx` & `StyleChatModal.tsx`)**:
   - Side-by-side comparison of quotes from verified tailors showing itemized breakdowns (Fabric Cost, Embroidery & Zardozi Labor, Master Cutting & Stitching, Lining & Trim, Delivery Days).
   - **Interactive Price Negotiation**:
     - Customer proposes a counter-offer budget with notes.
     - Designer can **Accept Counter-Offer**, **Propose Revised Quote**, or **Reject** with explanation.
     - Live status badges: `PENDING_DESIGNER_QUOTE` → `QUOTED` → `COUNTER_OFFERED` → `PRICE_AGREED`.
3. **Escrow Checkout & Multi-Modal Payment (`CartCheckoutModal.tsx` & `UPIPaymentModal.tsx`)**:
   - Supports both Ready-to-Wear shopping bag items and agreed Custom Tailoring orders.
   - Payment methods: **UPI QR & Intent (GPay, PhonePe, Paytm, BHIM)**, **Credit/Debit Cards**, **NetBanking**, and **Pearl Pick Privilege Wallet**.
   - Generates a server-verified **Bharat Escrow Vault ID** (`BHARAT-ESCROW-XXXXXX`) and UTR reference.
4. **7-Stage Order Tracking & Milestone Ratings (`OrderTrackingView.tsx`)**:
   - Tracks orders through: `Pending` → `Accepted` → `Awaiting Payment` → `In Production` → `Quality Check` → `Shipped` → `Delivered`.
   - **Granular Craftsmanship Milestones**:
     1. *14-Point Measurement Verification & Pattern Drafting*
     2. *Loom Fabric Sourcing & Zari Dyeing*
     3. *Hand Zardozi / Ari Embroidery Framing*
     4. *Baste Stitching & Muslin Trial Fitting*
     5. *Final Couture Finishing, Steaming & 18-Point QC*
   - **Customer Milestone Rating Prompt**: Completed milestones prompt the customer to rate **Craftsmanship Quality (1–5 stars)** and **Timeliness (1–5 stars)** with written feedback, feeding directly into the tailor's performance metrics.
   - Includes **Printable Tax Invoice & Technical Dossier (`PrintableOrderSummary.tsx`)**.

---

### D. Designer / Tailor Partner Portal (`/designer/login`)

Implemented in `TailorDashboard.tsx` and `TailorVerificationModal.tsx`:

- **Onboarding & Verification Gate**:
  - Unverified or newly registered designers see a dedicated **Verification Status Banner** (`PENDING` or `REJECTED`) and can submit their GI Craft Certificate, Atelier Address, Experience Years, Specialties, and Portfolio samples.
  - Selling ready-made products and accepting custom orders are locked until an Admin approves the profile (`VERIFIED`).
- **6 Dedicated Workspace Tabs**:
  1. **Overview & KPIs**: Total revenue, active bespoke commissions, pending quote requests, average milestone quality & timeliness scores, and recent activity feed.
  2. **My Products (RTW Catalog Management)**: Create, edit, restock, or delete ready-to-wear dresses with title, category, fabric type, GSM weight, origin, sizes, price, and multi-angle imagery. New products enter `PENDING` moderation status until approved by Admin (or `APPROVED` for verified senior ateliers).
  3. **Portfolio Management**: Upload and curate past couture creations to showcase on the public Designer Spotlight and Tailor Marketplace.
  4. **Custom Requests & Bargaining**: Inspect incoming customer 3-view AI designs, 14-point measurement sheets, and target budgets. Submit itemized quotations, respond to customer counter-offers, or accept agreed prices.
  5. **Orders & Production Pipeline**: Advance orders through server-validated stages (`Pending` → `Accepted` → `Awaiting Payment` → `In Production` → `Quality Check` → `Shipped` → `Delivered`), upload milestone inspection photos, and view customer milestone ratings.
  6. **Messages & Earnings**: Real-time chat threads with patrons (`StyleChatModal.tsx`) and itemized escrow payout ledger (gross order value, 10% platform commission, net designer payout).

---

### E. Governance & Admin Portal (`/admin/login`)

Implemented in `AdminDashboard.tsx`:

- **Restricted Governance Login**: Public registration is disabled; only pre-provisioned administrator credentials can authenticate.
- **6 Governance Modules**:
  1. **Executive Analytics & Revenue**: Platform GMV, net commission revenue, conversion funnels, category distribution charts (`Recharts`), and regional artisan heatmaps.
  2. **Designer Verification Queue**: Review pending tailor applications, inspect craft credentials and portfolios, and **Approve (`VERIFIED`)**, **Reject (`REJECTED`)**, or **Revoke** verification status in real time.
  3. **User & Partner Directory**: Search and manage all registered Customers and Designers/Tailors; toggle account status between `ACTIVE` and `SUSPENDED`.
  4. **Product Moderation Queue**: Inspect ready-to-wear dresses uploaded by designers and mark them `APPROVED` (live on storefront) or `REJECTED` (hidden from public catalog).
  5. **Global Orders & Escrow Ledger**: Monitor every RTW and bespoke order across the platform, inspect escrow vault statuses, and override stuck workflow states if required.
  6. **Disputes, Refunds & Quality Escalations**: Mediate customer-tailor disputes, inspect milestone photo evidence, and issue partial or full escrow refunds.

---

## 4. Technical Stack & System Architecture

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 19 + TypeScript + Vite 6 | Modular SPA with strict typing, custom hooks, and responsive luxury layouts |
| **Styling & Design System** | Tailwind CSS v4 (`@tailwindcss/vite`) | Custom luxury palette (`#FAF7F2` Warm Ivory, `#2D2825` Deep Espresso, `#8D2434` Imperial Burgundy, `#D4AF37` Antique Zari Gold) |
| **Typography** | Google Fonts (`Cormorant Garamond` + `Plus Jakarta Sans` + `JetBrains Mono`) | High-contrast editorial serif headers paired with crisp geometric sans-serif UI controls and tabular numeric pricing |
| **Animations & Icons** | `motion` (Framer Motion v12) + `lucide-react` + Bespoke Couture SVGs | Smooth modal transitions, carousel animations, and 1.4px architectural vector iconography |
| **Data Visualization** | `recharts` + `d3` | Admin GMV analytics, tailor earnings charts, and milestone quality metrics |
| **Backend Runtime** | Node.js + Express (`server.ts` via `tsx`) | Unified full-stack server running on Port `3000` with Vite middleware mounted in development and static bundle serving in production |
| **AI & Generative Engine** | `@google/genai` SDK + `coutureVisualEngine.ts` | Prompt enhancement, structured visual blueprint extraction, daily fashion intelligence with Google Search grounding, and multi-angle 3-View dress synthesis |
| **Offline & PWA Support** | Service Worker (`public/sw.js`) + `offlineSync.ts` | Offline action queue, local state persistence, and installable Progressive Web App manifest |

---

## 5. Project Directory Structure

```text
/
├── index.html                        # HTML entry point with SEO, OpenGraph, and Google Fonts
├── metadata.json                     # AI Studio applet metadata and capability declarations
├── package.json                      # Scripts and dependencies
├── server.ts                         # Full-stack Express server, Auth, Gemini AI routes & Order validation
├── vite.config.ts                    # Vite bundler & Tailwind v4 configuration
├── public/
│   ├── manifest.json                 # PWA Web App Manifest
│   ├── sw.js                         # Offline-first Service Worker
│   └── assets/                       # Static icons and user-uploaded reference assets
└── src/
    ├── main.tsx                      # React DOM root mount & Service Worker registration
    ├── App.tsx                       # Central state orchestrator, route controller & role switcher
    ├── index.css                     # Tailwind CSS v4 imports & custom luxury utility classes
    ├── types/
    │   └── index.ts                  # Comprehensive TypeScript interfaces for all entities
    ├── data/
    │   └── mockData.ts               # Seeded luxury products, verified tailors, orders, quotes & palettes
    ├── services/
    │   ├── coutureVisualEngine.ts    # Multi-angle (Front/Back/Side/Detail) prompt-to-couture synthesizer
    │   ├── offlineSync.ts            # Offline mutation queue & LocalStorage synchronization
    │   └── pushNotificationService.ts# Browser notification dispatcher for quotes & order milestones
    └── components/
        ├── Navbar.tsx                # Myntra/Zara-style public storefront header & profile menu
        ├── Footer.tsx                # Luxury footer with subtle Designer & Admin portal links
        ├── MobileBottomNav.tsx       # Responsive mobile navigation bar
        ├── SpecSheetExportModal.tsx  # Technical tailor dossier exporter
        ├── Auth/
        │   └── LoginModal.tsx        # Dedicated Customer (Email/OTP), Designer & Admin auth flows
        ├── Customer/
        │   ├── SplashScreen.tsx      # Public shopping homepage with medallions, spotlight & grids
        │   ├── DesignerSpotlight.tsx # Rotating carousel of verified tailors & signature pieces
        │   ├── MarketplaceView.tsx   # Granular sidebar filter (Fabric, GSM, Origin) & product grid
        │   ├── ProductDetailModal.tsx# Multi-image RTW product modal with size & pincode check
        │   ├── AIDressGenerator.tsx  # Interactive AI Custom Dress Studio configurator
        │   ├── GeneratedDesignViewer.tsx # 3-View (Front/Back/Side) presentation sheet & poster export
        │   ├── QuotationComparison.tsx   # Quote comparison & two-way price negotiation UI
        │   ├── CartCheckoutModal.tsx # Multi-step shopping bag, address, coupon & checkout drawer
        │   ├── UPIPaymentModal.tsx   # Bharat Escrow UPI / Card / NetBanking payment gateway
        │   ├── OrderTrackingView.tsx # 7-stage tracker with milestone Quality & Timeliness ratings
        │   ├── MeasurementSheetModal.tsx # 14-point anatomical measurement vault
        │   ├── TailorMarketplace.tsx # Directory of verified master tailors & portfolios
        │   ├── WishlistView.tsx      # Saved RTW products & quick move-to-bag view
        │   ├── DesignGallery.tsx     # Saved AI dress designs lookbook
        │   ├── StyleChatModal.tsx    # Real-time customer-designer chat & counter-offer drawer
        │   ├── FabricLibraryModal.tsx# Interactive encyclopedia of heritage fabrics & GSM weights
        │   ├── FashionAdviceSection.tsx  # AI-grounded runway trend & tailoring intelligence
        │   └── PrintableOrderSummary.tsx # Print-ready GST invoice & measurement spec sheet
        ├── Tailor/
        │   ├── TailorDashboard.tsx   # Complete Seller & Bespoke Atelier portal
        │   └── TailorVerificationModal.tsx # Craft credential & portfolio verification modal
        └── Admin/
            └── AdminDashboard.tsx    # Platform governance, approvals, moderation & dispute center
```

---

## 6. Backend API Reference (`server.ts`)

All backend routes are served from `server.ts` on port `3000` under `/api/*`:

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Returns service health status and server timestamp. |
| `POST` | `/api/auth/login` | Role-aware authentication (`customer`, `tailor`, `admin`) using `scrypt` password hashing. Blocks suspended accounts and unauthorized admin logins. |
| `POST` | `/api/auth/register` | Registers new `customer` or `tailor` accounts (initializes tailors with `PENDING_APPROVAL` status). Strictly forbids `admin` registration (`403 Forbidden`). |
| `POST` | `/api/auth/send-otp` | Dispatches a 4-digit mobile login OTP for Myntra-style passwordless customer sign-in. |
| `POST` | `/api/auth/verify-otp` | Verifies the 4-digit OTP and returns a signed customer session object and token. |
| `POST` | `/api/gemini/enhance-prompt` | Uses Gemini (`gemini-3.1-flash-lite` with fallback chain) to expand a customer's brief idea into a rich haute couture technical specification. |
| `POST` | `/api/gemini/generate-image` | Generates a prompt-faithful couture visual for a specific angle (`front`, `back`, `side`, `detail`), combining Gemini visual blueprint extraction with the deterministic Couture Visual Engine. |
| `POST` | `/api/gemini/generate-dress` | Full 3-View AI Dress Studio pipeline: parses the customer's natural language prompt, extracts exact hex colour palettes and structural specs via Gemini, and returns 2 complete design variations with coordinated Front, Back, Side, and Detail visuals, fabric yardage/GSM specs, and tailor notes. |
| `POST` | `/api/gemini/style-advice` | Returns recommended fabrics (with GSM weights), luxury colour harmonies, and seam/corsetry advice for a given dress type and occasion. |
| `GET` | `/api/fashion-advice` | Fetches live runway and bespoke tailoring intelligence grounded with Google Search (`?refresh=true` supported), backed by a 30-minute in-memory cache and circuit-breaker fallback. |
| `POST` | `/api/orders/validate-transition` | Enforces strict state-machine transitions for order fulfillment (`Pending` → `Accepted` → `Awaiting Payment` → `In Production` → `Quality Check` → `Shipped` → `Delivered`). |
| `POST` | `/api/payments/verify` | Validates mutual customer-designer price agreement and issues a verified `BHARAT-ESCROW` vault ID and UTR transaction reference. |

---

## 7. AI Visual Synthesis & Prompt-to-Couture Engine

To guarantee that customer prompts never produce random or mismatched stock images—and that all three views (**Front**, **Back**, and **Side**) depict the **exact same dress**—the platform uses a hybrid two-stage pipeline (`server.ts` + `src/services/coutureVisualEngine.ts`):

1. **Natural Language Prompt Parser & Gemini Visual Blueprint Extractor**:
   - Extracts explicit garment attributes directly from the customer's text prompt (e.g., *"emerald green velvet mermaid gown with sweetheart neckline, long sheer bishop sleeves, and gold zardozi border"*).
   - Queries Gemini (`extractVisualBlueprintWithGemini`) to resolve custom colour shades into a 5-part hex palette (`primaryHex`, `secondaryHex`, `accentHex`, `deepShadeHex`, `highlightHex`), silhouette geometry (`ballgown`, `mermaid`, `aline`, `anarkali`, `lehenga`, `saree`, `column`, `menswear`), neckline cut, sleeve structure, and surface embroidery motif.
2. **Coordinated Multi-View Synthesis (`generateCohesiveCoutureAngles`)**:
   - Attempts native Gemini image synthesis when available and pairs it with deterministic multi-angle parametric couture rendering for **1. Front View**, **2. Back View**, **3. Side Profile**, and **4. Macro Weave/Embroidery Detail**.
   - Ensures 100% consistency in fabric sheen, colour hex values, hemline length, sleeve style, neckline, and zardozi/lace detailing across all views presented on the design sheet and downloadable poster.

---

## 8. Data Models & Persistence Layer

All core entities (`src/types/index.ts`) are persisted automatically in `localStorage` with real-time cross-role synchronization (so actions taken by a Customer immediately appear in the Tailor and Admin portals without data loss on page reload):

- ` pearl_pick_products_v2`: Ready-to-wear marketplace catalog with `fabricType`, `weightGsm`, `origin`, `moderationStatus`, sizes, and ratings.
- `pearl_pick_designs_v2`: Saved 3-View AI dress designs and variations.
- `pearl_pick_tailors_v2`: Tailor profiles, `verificationStatus` (`VERIFIED`, `PENDING`, `REJECTED`), specialties, portfolios, and rating metrics.
- `pearl_pick_quotes_v2`: Custom dress quotation requests, itemized price breakdowns, and `negotiationHistory` logs.
- `pearl_pick_orders_v2`: Active and completed RTW and custom orders, 7-stage `workflowStatus`, `milestones` array, and customer `Quality` & `Timeliness` ratings.
- `pearl_pick_Wishlist_v2` & `pearl_pick_cart_v2`: Customer wishlist IDs and shopping bag line items.
- `pearl_pick_measurements_v2`: Saved 14-point customer measurement sheets.

---

## 9. Demo Credentials & Role Testing Guide

You can test all three portals using the built-in quick-fill credentials on each login screen or by entering them manually:

### 1. Customer Portal (Click **Profile → Login / Sign Up** in top navbar)
- **Email / Phone**: `ananya.verma@mumbai.in` or `9820154321`
- **Password**: `password123`
- **Mobile OTP Login**: Enter any 10-digit mobile number and use OTP **`4829`**.

### 2. Designer / Tailor Portal (Click **"Become a Designer / Sell With Us"** in footer or `/designer/login`)
- **Verified Master Tailor Account**:
  - **Email / Phone**: `rafiq.ahmed@darzicouture.in` or `9811234567`
  - **Password**: `darzi123`
- **Pending Verification Designer Account** (to test Admin approval gating):
  - **Email / Phone**: `meera@kanjeevaramstudio.in` or `9845011223`
  - **Password**: `darzi123`

### 3. Admin Governance Portal (Click **"Admin Governance"** in footer or `/admin/login`)
- **Email / Phone**: `vikram@pearlpick.in` or `9999000001`
- **Password**: `admin123`

---

## 10. Local Setup, Build & Deployment

### Prerequisites
- **Node.js** `>= 20.x`
- **Gemini API Key** (set as `GEMINI_API_KEY` in `.env` for live Gemini prompt enhancement, blueprint extraction, and search-grounded fashion advice)

### Installation & Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   Copy `.env.example` to `.env` and add your Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Start the full-stack development server** (runs Express + Vite middleware on `http://localhost:3000`):
   ```bash
   npm run dev
   ```

4. **Type-check the codebase**:
   ```bash
   npm run lint
   ```

5. **Build for production** (compiles the Vite frontend to `dist/` and bundles `server.ts` to `dist/server.cjs`):
   ```bash
   npm run build
   npm start
   ```
