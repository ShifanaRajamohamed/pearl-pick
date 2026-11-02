import express, { Request, Response } from 'express';
import {
  CanonicalRole,
  AccountStatus,
  DesignerVerificationStatus,
  normalizeRole,
  normalizeAccountStatus,
  normalizeVerificationStatus
} from '../types/rbac';
import {
  TailorProfile,
  DressDesign,
  QuotationRequest,
  TailorQuotation,
  Order,
  MeasurementSheet,
  MarketplaceProduct,
  ChatMessage,
  DisputeRecord,
  CartItem,
  DesignerOrderStatus,
  NegotiationOffer,
  MilestoneProgressPhoto,
  Review
} from '../types';
import { verifyPassword, hashPassword } from './crypto';
import {
  getDb,
  getUserById,
  getUserByPhoneOrEmail,
  mapUserRowToAuthUser,
  getDesignerProfileByUserId,
  getAllDesignerProfiles,
  getPublicVerifiedDesigners,
  createSessionRecord,
  deleteSessionByRawToken,
  deleteAllUserSessions,
  recordAuditLog,
  getAuditLogs,
  DbUserRow
} from './db';
import {
  authenticateSession,
  requireAuth,
  requireRole,
  requireVerifiedDesigner,
  setSessionCookie,
  clearSessionCookie
} from './auth';

export const VALID_ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  Pending: ['Accepted'],
  Accepted: ['Awaiting Payment'],
  'Awaiting Payment': ['In Production'],
  'In Production': ['Quality Check'],
  'Quality Check': ['Shipped'],
  Shipped: ['Delivered'],
  Delivered: []
};

export function createApiRouter(): express.Router {
  const router = express.Router();

  // Attach session parser to all API routes
  router.use(authenticateSession);

  // ============================================================================
  // 1. PUBLIC CATALOG ENDPOINT (Guests & All Visitors)
  // ============================================================================
  router.get('/public/catalog', (_req: Request, res: Response) => {
    const db = getDb();
    const verifiedDesigners = getPublicVerifiedDesigners();
    const verifiedDesignerIds = new Set(verifiedDesigners.map((d) => d.id));

    const prodRows = db
      .prepare("SELECT data_json, designer_id, moderation_status FROM products WHERE moderation_status = 'APPROVED'")
      .all() as Array<{ data_json: string; designer_id: string; moderation_status: string }>;

    const approvedProducts: MarketplaceProduct[] = [];
    for (const r of prodRows) {
      if (!verifiedDesignerIds.has(r.designer_id)) continue;
      try {
        const prod = JSON.parse(r.data_json) as MarketplaceProduct;
        approvedProducts.push({
          ...prod,
          moderationStatus: 'APPROVED'
        });
      } catch {}
    }

    res.json({
      products: approvedProducts,
      designers: verifiedDesigners
    });
  });

  // ============================================================================
  // 2. AUTHENTICATION ENDPOINTS
  // ============================================================================
  router.post('/auth/login', (req: Request, res: Response) => {
    const { phoneOrEmail, password, role } = req.body || {};
    if (!phoneOrEmail || !password) {
      return res.status(400).json({ error: 'Credentials and password are required.' });
    }

    const userRow = getUserByPhoneOrEmail(String(phoneOrEmail));
    if (!userRow) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (!verifyPassword(String(password), userRow.password_hash)) {
      return res.status(401).json({ error: 'Invalid credentials.' });
    }

    if (role !== undefined && role !== null && String(role).trim() !== '') {
      const expectedRole = normalizeRole(role);
      if (!expectedRole || userRow.role !== expectedRole) {
        return res.status(403).json({
          error: `This account is registered under the ${userRow.role} role, not ${expectedRole || role}. Please use the appropriate login portal.`,
          code: 'ROLE_MISMATCH'
        });
      }
    }

    if (normalizeAccountStatus(userRow.account_status) === 'SUSPENDED') {
      deleteAllUserSessions(userRow.id);
      return res.status(403).json({
        error: 'This account has been suspended by Platform Administration.',
        code: 'ACCOUNT_SUSPENDED'
      });
    }

    const session = createSessionRecord(userRow.id);
    setSessionCookie(res, session.rawToken);

    const authUser = mapUserRowToAuthUser(userRow);
    const designerProfile =
      authUser.role === 'DESIGNER' ? getDesignerProfileByUserId(authUser.id) : null;

    return res.json({
      user: authUser,
      designerProfile,
      csrfToken: session.csrfToken,
      token: session.rawToken
    });
  });

  router.post('/auth/register', (req: Request, res: Response) => {
    const {
      name,
      phone,
      email,
      password,
      role,
      city,
      shopName,
      specialties,
      experienceYears,
      pricingRange,
      portfolioUrl,
      verificationId
    } = req.body || {};

    // Prevent role escalation: ADMIN registration is strictly forbidden
    const rawRoleStr = typeof role === 'string' ? role.trim().toUpperCase() : 'CUSTOMER';
    if (rawRoleStr === 'ADMIN') {
      return res.status(403).json({
        error: 'Admin accounts cannot be publicly registered.',
        code: 'ADMIN_REGISTRATION_FORBIDDEN'
      });
    }

    const canonicalRole: CanonicalRole =
      normalizeRole(role) === 'DESIGNER' ? 'DESIGNER' : 'CUSTOMER';

    if (!name || !phone || !password) {
      return res.status(400).json({ error: 'Name, mobile number, and password are required.' });
    }

    if (String(password).length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const cleanPhone = String(phone).replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      return res.status(400).json({ error: 'Please provide a valid 10-digit mobile number.' });
    }

    const normalizedEmail = String(email || `${cleanPhone}@pearlpick.in`).trim().toLowerCase();

    const db = getDb();
    const existing = db
      .prepare('SELECT id FROM users WHERE phone = ? OR LOWER(email) = LOWER(?)')
      .get(cleanPhone, normalizedEmail);
    if (existing) {
      return res.status(409).json({
        error: 'An account with this mobile number or email already exists.'
      });
    }

    const now = new Date().toISOString();
    const newId = `${canonicalRole === 'DESIGNER' ? 'tailor' : 'cust'}-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 6)}`;

    const avatarUrl =
      canonicalRole === 'DESIGNER'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80';

    // Always force ACTIVE accountStatus on registration; never trust client payload
    db.prepare(
      `INSERT INTO users (
        id, name, phone, email, role, account_status, password_hash,
        avatar, city, wallet_balance_inr, saved_addresses_json, designer_profile_id, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, 'ACTIVE', ?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      newId,
      String(name).trim(),
      cleanPhone,
      normalizedEmail,
      canonicalRole,
      hashPassword(String(password)),
      avatarUrl,
      String(city || 'Mumbai, Maharashtra').trim(),
      canonicalRole === 'DESIGNER' ? 0 : 45000,
      JSON.stringify([String(city || 'Mumbai, Maharashtra').trim()]),
      canonicalRole === 'DESIGNER' ? newId : null,
      now,
      now
    );

    let designerProfile: TailorProfile | null = null;

    if (canonicalRole === 'DESIGNER') {
      // New designer accounts MUST ALWAYS receive PENDING verification from the server
      const forcedVerificationStatus: DesignerVerificationStatus = 'PENDING';
      const parsedSpecialties = Array.isArray(specialties)
        ? specialties.map((s) => String(s).trim()).filter(Boolean)
        : typeof specialties === 'string' && specialties.trim()
        ? specialties.split(',').map((s) => s.trim()).filter(Boolean)
        : ['Bridal & Festive Couture'];

      const samplePortfolioUrl =
        typeof portfolioUrl === 'string' && portfolioUrl.trim()
          ? portfolioUrl.trim()
          : 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80';

      designerProfile = {
        id: newId,
        userId: newId,
        name: String(name).trim(),
        shopName: String(shopName || `${name} Bespoke Studio`).trim(),
        avatar: avatarUrl,
        coverImage: samplePortfolioUrl,
        city: String(city || 'Mumbai').split(',')[0].trim(),
        state: 'Maharashtra',
        country: 'India',
        experienceYears: Math.max(1, Number(experienceYears) || 5),
        verificationStatus: forcedVerificationStatus,
        accountStatus: 'ACTIVE',
        rating: 4.8,
        reviewCount: 0,
        completedOrders: 0,
        specialties: parsedSpecialties,
        bio: `Bespoke designer studio specializing in ${parsedSpecialties.join(', ')}.`,
        badge: 'Couturier',
        startingPrice: 8000,
        pricingRange: String(pricingRange || '₹8,000 – ₹45,000'),
        averageTurnaroundDays: 14,
        portfolio: [
          {
            id: `port-${Date.now()}`,
            title: 'Submitted Portfolio Sample',
            category: 'Bespoke Couture',
            imageUrl: samplePortfolioUrl,
            completionTimeDays: 14,
            price: 18000,
            description: parsedSpecialties.join(', '),
            customerRating: 5.0
          }
        ],
        shopAddress: String(city || 'Mumbai, Maharashtra'),
        phone: `+91 ${cleanPhone}`,
        equipment: ['Industrial Lockstitch', 'Hand Zardozi Adda Frame'],
        certifications: [String(verificationId || 'KYC-SUBMITTED')]
      };

      db.prepare(
        `INSERT INTO designer_profiles (
          id, user_id, name, shop_name, verification_status, rejection_reason, verified_at,
          city, state, experience_years, specialties_json, pricing_range, starting_price,
          bio, portfolio_json, verification_docs_json, rating, review_count, completed_orders,
          data_json, updated_at
        ) VALUES (?, ?, ?, ?, 'PENDING', NULL, NULL, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        newId,
        newId,
        designerProfile.name,
        designerProfile.shopName,
        designerProfile.city,
        designerProfile.state,
        designerProfile.experienceYears,
        JSON.stringify(designerProfile.specialties),
        designerProfile.pricingRange,
        designerProfile.startingPrice,
        designerProfile.bio,
        JSON.stringify(designerProfile.portfolio),
        JSON.stringify([]),
        designerProfile.rating,
        designerProfile.reviewCount,
        designerProfile.completedOrders,
        JSON.stringify(designerProfile),
        now
      );
    } else {
      db.prepare(
        'INSERT INTO customer_measurements (customer_id, data_json, updated_at) VALUES (?, ?, ?)'
      ).run(
        newId,
        JSON.stringify({
          id: `meas-${newId}`,
          customerId: newId,
          unit: 'inches',
          bust: 34,
          waist: 28,
          highHip: 35,
          lowHip: 38,
          shoulderToShoulder: 14.5,
          shoulderToWaist: 15,
          waistToHem: 41,
          hollowToFloor: 55,
          armhole: 16,
          bicep: 11.5,
          sleeveLength: 22,
          neckCircumference: 14,
          height: 65,
          fitPreference: 'Tailored / Regular',
          updatedAt: now
        }),
        now
      );
      db.prepare(
        'INSERT INTO customer_state (customer_id, wishlist_json, cart_json, updated_at) VALUES (?, ?, ?, ?)'
      ).run(newId, JSON.stringify([]), JSON.stringify([]), now);
    }

    const createdUserRow = getUserById(newId)!;
    const authUser = mapUserRowToAuthUser(createdUserRow);
    const session = createSessionRecord(newId);
    setSessionCookie(res, session.rawToken);

    return res.status(201).json({
      user: authUser,
      designerProfile,
      designerApplication: designerProfile,
      csrfToken: session.csrfToken,
      token: session.rawToken
    });
  });

  router.post('/auth/logout', (req: Request, res: Response) => {
    if (req.sessionToken) {
      deleteSessionByRawToken(req.sessionToken);
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  router.get('/auth/me', requireAuth, (req: Request, res: Response) => {
    res.json({
      user: req.authUser,
      designerProfile: req.designerProfile || null,
      csrfToken: req.csrfToken
    });
  });

  // Disable hardcoded OTP bypasses with a clear explanation
  router.post('/auth/send-otp', (_req: Request, res: Response) => {
    res.status(503).json({
      error:
        'SMS OTP delivery is not configured in this environment. Please sign in with your registered email/mobile number and password.',
      code: 'OTP_DISABLED'
    });
  });

  router.post('/auth/verify-otp', (_req: Request, res: Response) => {
    res.status(503).json({
      error:
        'SMS OTP verification is disabled. Please authenticate using your email/mobile number and password.',
      code: 'OTP_DISABLED'
    });
  });

  // ============================================================================
  // 3. CUSTOMER PROTECTED ENDPOINTS (CUSTOMER ROLE ONLY, STRICT OWNERSHIP)
  // ============================================================================
  router.get('/customer/bootstrap', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const db = getDb();
    const customerId = req.authUser!.id;

    const measRow = db
      .prepare('SELECT data_json FROM customer_measurements WHERE customer_id = ?')
      .get(customerId) as { data_json: string } | undefined;
    const measurements: MeasurementSheet | null = measRow ? JSON.parse(measRow.data_json) : null;

    const stateRow = db
      .prepare('SELECT wishlist_json, cart_json FROM customer_state WHERE customer_id = ?')
      .get(customerId) as { wishlist_json: string; cart_json: string } | undefined;
    const wishlistIds: string[] = stateRow ? JSON.parse(stateRow.wishlist_json || '[]') : [];
    const cartItems: CartItem[] = stateRow ? JSON.parse(stateRow.cart_json || '[]') : [];

    const designRows = db
      .prepare('SELECT data_json FROM designs WHERE customer_id = ? ORDER BY created_at DESC')
      .all(customerId) as Array<{ data_json: string }>;
    const designs: DressDesign[] = designRows.map((r) => JSON.parse(r.data_json));

    const requestRows = db
      .prepare('SELECT data_json FROM custom_requests WHERE customer_id = ? ORDER BY created_at DESC')
      .all(customerId) as Array<{ data_json: string }>;
    const quotationRequests: QuotationRequest[] = requestRows.map((r) => JSON.parse(r.data_json));

    const orderRows = db
      .prepare('SELECT data_json FROM orders WHERE customer_id = ? ORDER BY created_at DESC')
      .all(customerId) as Array<{ data_json: string }>;
    const orders: Order[] = orderRows.map((r) => JSON.parse(r.data_json));

    const convRows = db
      .prepare('SELECT data_json FROM conversations WHERE customer_id = ? ORDER BY created_at ASC')
      .all(customerId) as Array<{ data_json: string }>;
    const conversations: ChatMessage[] = convRows.map((r) => JSON.parse(r.data_json));

    res.json({
      profile: req.authUser,
      measurements,
      wishlistIds,
      cartItems,
      designs,
      quotationRequests,
      orders,
      conversations
    });
  });

  router.put('/customer/profile', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const db = getDb();
    const customerId = req.authUser!.id;
    const { name, city, avatar, savedAddresses } = req.body || {};

    const currentRow = getUserById(customerId)!;
    const nextName = typeof name === 'string' && name.trim() ? name.trim() : currentRow.name;
    const nextCity = typeof city === 'string' && city.trim() ? city.trim() : currentRow.city;
    const nextAvatar = typeof avatar === 'string' && avatar.trim() ? avatar.trim() : currentRow.avatar;
    const nextAddresses = Array.isArray(savedAddresses)
      ? JSON.stringify(savedAddresses.map((a) => String(a)))
      : currentRow.saved_addresses_json;

    // Never allow role, account_status, or wallet_balance_inr to be mutated via profile update
    db.prepare(
      'UPDATE users SET name = ?, city = ?, avatar = ?, saved_addresses_json = ?, updated_at = ? WHERE id = ?'
    ).run(nextName, nextCity, nextAvatar, nextAddresses, new Date().toISOString(), customerId);

    const updatedUser = mapUserRowToAuthUser(getUserById(customerId)!);
    res.json({ user: updatedUser });
  });

  router.put('/customer/measurements', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const db = getDb();
    const customerId = req.authUser!.id;
    const now = new Date().toISOString();
    const payload: MeasurementSheet = {
      ...req.body,
      id: req.body?.id || `meas-${customerId}`,
      customerId,
      updatedAt: now
    };

    db.prepare(
      `INSERT INTO customer_measurements (customer_id, data_json, updated_at)
       VALUES (?, ?, ?)
       ON CONFLICT(customer_id) DO UPDATE SET data_json = excluded.data_json, updated_at = excluded.updated_at`
    ).run(customerId, JSON.stringify(payload), now);

    res.json({ measurements: payload });
  });

  router.put('/customer/wishlist', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const db = getDb();
    const customerId = req.authUser!.id;
    const { wishlistIds } = req.body || {};
    if (!Array.isArray(wishlistIds)) {
      return res.status(400).json({ error: 'wishlistIds array is required.' });
    }

    const now = new Date().toISOString();
    const cleanIds = wishlistIds.map((id) => String(id));
    db.prepare(
      `INSERT INTO customer_state (customer_id, wishlist_json, cart_json, updated_at)
       VALUES (?, ?, '[]', ?)
       ON CONFLICT(customer_id) DO UPDATE SET wishlist_json = excluded.wishlist_json, updated_at = excluded.updated_at`
    ).run(customerId, JSON.stringify(cleanIds), now);

    res.json({ wishlistIds: cleanIds });
  });

  router.put('/customer/cart', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const db = getDb();
    const customerId = req.authUser!.id;
    const { cartItems } = req.body || {};
    if (!Array.isArray(cartItems)) {
      return res.status(400).json({ error: 'cartItems array is required.' });
    }

    const now = new Date().toISOString();
    db.prepare(
      `INSERT INTO customer_state (customer_id, wishlist_json, cart_json, updated_at)
       VALUES (?, '[]', ?, ?)
       ON CONFLICT(customer_id) DO UPDATE SET cart_json = excluded.cart_json, updated_at = excluded.updated_at`
    ).run(customerId, JSON.stringify(cartItems), now);

    res.json({ cartItems });
  });

  // Customer Saved AI Designs (Strict Ownership)
  router.get('/customer/designs', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const rows = getDb()
      .prepare('SELECT data_json FROM designs WHERE customer_id = ? ORDER BY created_at DESC')
      .all(req.authUser!.id) as Array<{ data_json: string }>;
    res.json({ designs: rows.map((r) => JSON.parse(r.data_json)) });
  });

  router.get('/customer/designs/:id', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const row = getDb()
      .prepare('SELECT customer_id, data_json FROM designs WHERE id = ?')
      .get(req.params.id) as { customer_id: string; data_json: string } | undefined;

    if (!row) {
      return res.status(404).json({ error: 'Design not found.' });
    }
    if (row.customer_id !== req.authUser!.id) {
      return res.status(403).json({ error: 'Forbidden: you do not own this design.' });
    }
    res.json({ design: JSON.parse(row.data_json) });
  });

  router.post('/customer/designs', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const customerId = req.authUser!.id;
    const now = new Date().toISOString();
    const raw = req.body || {};
    const id = raw.id && !String(raw.id).startsWith('design-') ? `design-${Date.now()}` : raw.id || `design-${Date.now()}`;

    const newDesign: DressDesign = {
      ...raw,
      id,
      customerId, // Derived strictly from authenticated session
      customerName: req.authUser!.name,
      title: String(raw.title || 'Bespoke AI Couture Design'),
      prompt: String(raw.prompt || ''),
      createdAt: now,
      isFavorite: Boolean(raw.isFavorite),
      variations: Array.isArray(raw.variations) ? raw.variations : [],
      selectedVariationIndex: Number(raw.selectedVariationIndex) || 0,
      tags: Array.isArray(raw.tags) ? raw.tags : []
    };

    getDb()
      .prepare(
        `INSERT INTO designs (id, customer_id, title, is_favorite, data_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON CONFLICT(id) DO UPDATE SET
           title = excluded.title,
           is_favorite = excluded.is_favorite,
           data_json = excluded.data_json,
           updated_at = excluded.updated_at
         WHERE designs.customer_id = ?`
      )
      .run(
        newDesign.id,
        customerId,
        newDesign.title,
        newDesign.isFavorite ? 1 : 0,
        JSON.stringify(newDesign),
        now,
        now,
        customerId
      );

    res.status(201).json({ design: newDesign });
  });

  router.patch('/customer/designs/:id', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const db = getDb();
    const row = db
      .prepare('SELECT customer_id, data_json FROM designs WHERE id = ?')
      .get(req.params.id) as { customer_id: string; data_json: string } | undefined;

    if (!row) {
      return res.status(404).json({ error: 'Design not found.' });
    }
    if (row.customer_id !== req.authUser!.id) {
      return res.status(403).json({ error: 'Forbidden: you do not own this design.' });
    }

    const existing = JSON.parse(row.data_json) as DressDesign;
    const updated: DressDesign = {
      ...existing,
      isFavorite:
        typeof req.body?.isFavorite === 'boolean' ? req.body.isFavorite : !existing.isFavorite
    };

    db.prepare('UPDATE designs SET is_favorite = ?, data_json = ?, updated_at = ? WHERE id = ?').run(
      updated.isFavorite ? 1 : 0,
      JSON.stringify(updated),
      new Date().toISOString(),
      req.params.id
    );

    res.json({ design: updated });
  });

  router.delete('/customer/designs/:id', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const db = getDb();
    const row = db
      .prepare('SELECT customer_id FROM designs WHERE id = ?')
      .get(req.params.id) as { customer_id: string } | undefined;

    if (!row) {
      return res.status(404).json({ error: 'Design not found.' });
    }
    if (row.customer_id !== req.authUser!.id) {
      return res.status(403).json({ error: 'Forbidden: you do not own this design.' });
    }

    db.prepare('DELETE FROM designs WHERE id = ?').run(req.params.id);
    res.json({ deleted: true, id: req.params.id });
  });

  // Customer Custom Design Requests & Negotiations
  router.get('/customer/requests', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const rows = getDb()
      .prepare('SELECT data_json FROM custom_requests WHERE customer_id = ? ORDER BY created_at DESC')
      .all(req.authUser!.id) as Array<{ data_json: string }>;
    res.json({ quotationRequests: rows.map((r) => JSON.parse(r.data_json)) });
  });

  router.get('/customer/requests/:id', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const row = getDb()
      .prepare('SELECT customer_id, data_json FROM custom_requests WHERE id = ?')
      .get(req.params.id) as { customer_id: string; data_json: string } | undefined;

    if (!row) return res.status(404).json({ error: 'Custom request not found.' });
    if (row.customer_id !== req.authUser!.id) {
      return res.status(403).json({ error: 'Forbidden: you do not own this custom request.' });
    }
    res.json({ quotationRequest: JSON.parse(row.data_json) });
  });

  router.post('/customer/requests', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const db = getDb();
    const customer = req.authUser!;
    const {
      designId,
      variation,
      targetBudget,
      neededByDate,
      specificInstructions,
      preferredTailorId,
      selectedStandardSize
    } = req.body || {};

    if (!variation || !targetBudget) {
      return res.status(400).json({ error: 'Design variation and targetBudget are required.' });
    }

    const designerId = String(preferredTailorId || 'tailor-1');
    const targetDesigner = getDesignerProfileByUserId(designerId);
    if (
      !targetDesigner ||
      targetDesigner.verificationStatus !== 'VERIFIED' ||
      targetDesigner.accountStatus !== 'ACTIVE'
    ) {
      return res.status(400).json({
        error: 'Custom design requests can only be submitted to ACTIVE, VERIFIED designers.'
      });
    }

    const now = new Date().toISOString();
    const reqId = `req-${Date.now()}`;
    const budgetNum = Number(targetBudget) || 15000;
    const initialDesignerQuoteAmount = Math.round(budgetNum * 1.15);

    const newRequest: QuotationRequest = {
      id: reqId,
      customerId: customer.id,
      customerName: customer.name,
      customerAvatar: customer.avatar,
      designId: designId || `design-${Date.now()}`,
      variation,
      selectedStandardSize,
      preferredTailorId: targetDesigner.id,
      preferredTailorName: targetDesigner.name,
      targetBudget: budgetNum,
      neededByDate: neededByDate || '2026-10-15',
      specificInstructions: String(specificInstructions || ''),
      createdAt: now,
      status: 'NEGOTIATING',
      quotations: [
        {
          id: `quote-${Date.now()}-1`,
          requestId: reqId,
          tailorId: targetDesigner.id,
          tailorName: targetDesigner.name,
          tailorShopName: targetDesigner.shopName,
          tailorAvatar: targetDesigner.avatar,
          tailorRating: targetDesigner.rating,
          totalAmount: initialDesignerQuoteAmount,
          currency: 'INR',
          estimatedDeliveryDays: 14,
          proposedDeliveryDate: neededByDate || '2026-10-15',
          tailorMessage: `We have reviewed your 3-view Front, Back & Side specifications for ${variation.name}.`,
          fabricIncluded: true,
          status: 'NEGOTIATING',
          customerAgreed: false,
          designerAgreed: true,
          negotiationHistory: [
            {
              id: `neg-${Date.now()}-1`,
              senderRole: 'customer',
              senderName: customer.name,
              amount: budgetNum,
              note: `Customer preferred budget (${selectedStandardSize ? `Size: ${selectedStandardSize}` : '14-Point Custom Fit'}).`,
              isFinalOffer: false,
              status: 'COUNTERED',
              timestamp: now
            },
            {
              id: `neg-${Date.now()}-2`,
              senderRole: 'tailor',
              senderName: targetDesigner.name,
              amount: initialDesignerQuoteAmount,
              note: `Initial estimate from ${targetDesigner.shopName}.`,
              isFinalOffer: false,
              status: 'PROPOSED',
              timestamp: now
            }
          ],
          items: [
            {
              id: 'item-1',
              description: `Pure ${variation.specs?.fabric || 'Couture Silk'}`,
              amount: Math.round(initialDesignerQuoteAmount * 0.45),
              category: 'Fabric'
            },
            {
              id: 'item-2',
              description: 'Master Pattern Drafting & Tailoring',
              amount: Math.round(initialDesignerQuoteAmount * 0.35),
              category: 'Stitching'
            },
            {
              id: 'item-3',
              description: `Artisanal ${variation.specs?.pattern || 'Hand Embroidery'}`,
              amount: Math.round(initialDesignerQuoteAmount * 0.15),
              category: 'Embroidery & Handwork'
            },
            {
              id: 'item-4',
              description: 'Steam Pressing & Couture Packaging',
              amount: Math.round(initialDesignerQuoteAmount * 0.05),
              category: 'Finishing'
            }
          ],
          milestones: [
            { title: 'Pattern Muslin & Fabric Sourced', percentage: 30, description: 'Fabric purchase & toile cut' },
            { title: 'First Baste Fitting', percentage: 40, description: 'Baste fitting & adjustments' },
            { title: 'Final Hand Finishing & Delivery', percentage: 30, description: 'Hand finishing and delivery' }
          ],
          createdAt: now
        }
      ]
    };

    db.prepare(
      `INSERT INTO custom_requests (id, customer_id, assigned_designer_id, status, data_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).run(
      newRequest.id,
      customer.id,
      targetDesigner.id,
      newRequest.status,
      JSON.stringify(newRequest),
      now,
      now
    );

    res.status(201).json({ quotationRequest: newRequest });
  });

  router.post('/customer/requests/:id/negotiate', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const db = getDb();
    const row = db
      .prepare('SELECT customer_id, data_json FROM custom_requests WHERE id = ?')
      .get(req.params.id) as { customer_id: string; data_json: string } | undefined;

    if (!row) return res.status(404).json({ error: 'Custom request not found.' });
    if (row.customer_id !== req.authUser!.id) {
      return res.status(403).json({ error: 'Forbidden: you do not own this custom request.' });
    }

    const requestObj = JSON.parse(row.data_json) as QuotationRequest;
    const { quoteId, action, amount, note } = req.body || {};

    const updatedQuotations = requestObj.quotations.map((q) => {
      if (quoteId && q.id !== quoteId) return q;
      if (action === 'agree') {
        const nextCustomerAgreed = true;
        const nextDesignerAgreed = Boolean(q.designerAgreed);
        const bothAgreed = nextCustomerAgreed && nextDesignerAgreed;
        const updatedHistory = (q.negotiationHistory || []).map((h, idx, arr) =>
          idx === arr.length - 1 ? { ...h, status: 'ACCEPTED' as const } : h
        );
        return {
          ...q,
          customerAgreed: nextCustomerAgreed,
          designerAgreed: nextDesignerAgreed,
          agreedAmount: bothAgreed ? q.totalAmount : q.agreedAmount,
          status: bothAgreed ? ('MUTUALLY_AGREED' as const) : q.status,
          negotiationHistory: updatedHistory
        };
      } else {
        const numAmount = Number(amount);
        if (!numAmount || numAmount <= 0) return q;
        const newOffer: NegotiationOffer = {
          id: `neg-${Date.now()}`,
          senderRole: 'customer',
          senderName: req.authUser!.name,
          amount: numAmount,
          note: String(note || 'Customer counteroffer'),
          message: String(note || 'Customer counteroffer'),
          isFinalOffer: false,
          status: 'PROPOSED',
          timestamp: new Date().toISOString()
        };
        const updatedHistory = (q.negotiationHistory || []).map((h) => ({
          ...h,
          status: 'COUNTERED' as const
        }));
        return {
          ...q,
          totalAmount: numAmount,
          status: 'NEGOTIATING' as const,
          customerAgreed: true,
          designerAgreed: false,
          negotiationHistory: [...updatedHistory, newOffer]
        };
      }
    });

    const updatedRequest: QuotationRequest = {
      ...requestObj,
      status: 'NEGOTIATING',
      quotations: updatedQuotations
    };

    db.prepare('UPDATE custom_requests SET status = ?, data_json = ?, updated_at = ? WHERE id = ?').run(
      updatedRequest.status,
      JSON.stringify(updatedRequest),
      new Date().toISOString(),
      req.params.id
    );

    res.json({ quotationRequest: updatedRequest });
  });

  // Customer Orders & Reviews (Strict Ownership)
  router.get('/customer/orders', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const rows = getDb()
      .prepare('SELECT data_json FROM orders WHERE customer_id = ? ORDER BY created_at DESC')
      .all(req.authUser!.id) as Array<{ data_json: string }>;
    res.json({ orders: rows.map((r) => JSON.parse(r.data_json)) });
  });

  router.get('/customer/orders/:id', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const row = getDb()
      .prepare('SELECT customer_id, data_json FROM orders WHERE id = ?')
      .get(req.params.id) as { customer_id: string; data_json: string } | undefined;

    if (!row) return res.status(404).json({ error: 'Order not found.' });
    if (row.customer_id !== req.authUser!.id) {
      return res.status(403).json({ error: 'Forbidden: you do not own this order.' });
    }
    res.json({ order: JSON.parse(row.data_json) });
  });

  router.post('/customer/orders', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const db = getDb();
    const customer = req.authUser!;
    const now = new Date().toISOString();
    const { orderType, items, shippingAddress, transactionId, requestId, quoteId } = req.body || {};

    if (orderType === 'tailor' || requestId) {
      const reqRow = db
        .prepare('SELECT customer_id, data_json FROM custom_requests WHERE id = ?')
        .get(requestId) as { customer_id: string; data_json: string } | undefined;

      if (!reqRow) return res.status(404).json({ error: 'Quotation request not found.' });
      if (reqRow.customer_id !== customer.id) {
        return res.status(403).json({ error: 'Forbidden: you do not own this quotation request.' });
      }

      const requestObj = JSON.parse(reqRow.data_json) as QuotationRequest;
      const quote =
        requestObj.quotations.find((q) => q.id === quoteId) || requestObj.quotations[0];
      if (!quote) {
        return res.status(400).json({ error: 'Quotation not found.' });
      }

      const targetDesigner = getDesignerProfileByUserId(quote.tailorId);
      if (!targetDesigner || targetDesigner.verificationStatus !== 'VERIFIED' || targetDesigner.accountStatus !== 'ACTIVE') {
        return res.status(403).json({
          error: 'Designer is no longer verified or active to accept new orders.'
        });
      }

      const finalPrice = quote.agreedAmount || quote.totalAmount;
      const ordId = `ord-${Date.now().toString().slice(-6)}`;
      const newOrder: Order = {
        id: ordId,
        orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
        orderType: 'tailor',
        customerId: customer.id,
        customerName: customer.name,
        tailorId: quote.tailorId,
        tailorName: quote.tailorName,
        tailorShopName: quote.tailorShopName || targetDesigner.shopName,
        tailorAvatar: quote.tailorAvatar || targetDesigner.avatar,
        design: requestObj.variation,
        variation: requestObj.variation,
        totalAmount: finalPrice,
        paidAmount: finalPrice,
        currency: 'INR',
        status: 'QUOTATION_ACCEPTED',
        designerOrderStatus: 'In Production',
        workflowStatus: 'In Production',
        currentStage: 'FABRIC_SOURCING',
        escrowStatus: 'SECURED_IN_ESCROW',
        escrowVaultId: transactionId || `BHARAT-ESCROW-${Date.now().toString().slice(-6)}`,
        milestones: (quote.milestones || []).map((m, idx) => ({
          id: `ms-${Date.now()}-${idx}`,
          orderId: ordId,
          stage: (idx === 0 ? 'FABRIC_SOURCING' : idx === 1 ? 'FIRST_FITTING' : 'FINAL_STITCHING') as any,
          title: m.title,
          label: m.title,
          description: m.description,
          status: idx === 0 ? 'IN_PROGRESS' : 'PENDING'
        })),
        estimatedDeliveryDate: quote.proposedDeliveryDate,
        orderDate: now,
        createdAt: now
      };

      db.prepare(
        `INSERT INTO orders (id, customer_id, designer_id, status, workflow_status, escrow_status, total_amount, data_json, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        newOrder.id,
        customer.id,
        newOrder.tailorId,
        newOrder.status || 'QUOTATION_ACCEPTED',
        newOrder.designerOrderStatus || 'In Production',
        newOrder.escrowStatus,
        newOrder.totalAmount,
        JSON.stringify(newOrder),
        now,
        now
      );

      const updatedReq: QuotationRequest = {
        ...requestObj,
        status: 'ACCEPTED',
        acceptedQuoteId: quote.id
      };
      db.prepare('UPDATE custom_requests SET status = ?, data_json = ?, updated_at = ? WHERE id = ?').run(
        'ACCEPTED',
        JSON.stringify(updatedReq),
        now,
        requestId
      );

      return res.status(201).json({ orders: [newOrder], quotationRequest: updatedReq });
    }

    // Ready-to-wear cart checkout
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart items are required for checkout.' });
    }

    const createdOrders: Order[] = [];
    const insertOrderStmt = db.prepare(
      `INSERT INTO orders (id, customer_id, designer_id, status, workflow_status, escrow_status, total_amount, data_json, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    );

    for (let idx = 0; idx < items.length; idx++) {
      const item = items[idx] as CartItem;
      const prodRow = db
        .prepare('SELECT data_json, designer_id, moderation_status FROM products WHERE id = ?')
        .get(item.product?.id) as { data_json: string; designer_id: string; moderation_status: string } | undefined;

      const authoritativeProduct: MarketplaceProduct = prodRow
        ? JSON.parse(prodRow.data_json)
        : item.product;
      const designerId = prodRow ? prodRow.designer_id : item.product?.designerId || 'tailor-1';
      const unitPrice = authoritativeProduct.price;
      const qty = Math.max(1, Number(item.quantity) || 1);
      const ordId = `ord-${Date.now().toString().slice(-5)}-${idx}`;

      const newOrder: Order = {
        id: ordId,
        orderNumber: `ORD-${Date.now().toString().slice(-5)}${idx}`,
        orderType: 'ready-to-wear',
        marketplaceItem: authoritativeProduct,
        selectedSize: item.selectedSize || 'M',
        customerId: customer.id,
        customerName: customer.name,
        tailorId: designerId,
        tailorName: authoritativeProduct.designerName,
        tailorShopName: authoritativeProduct.designerName,
        tailorAvatar: authoritativeProduct.designerAvatar || '',
        totalAmount: unitPrice * qty,
        paidAmount: unitPrice * qty,
        currency: 'INR',
        status: 'QUOTATION_ACCEPTED',
        designerOrderStatus: 'In Production',
        workflowStatus: 'In Production',
        currentStage: 'FABRIC_SOURCING',
        escrowStatus: 'SECURED_IN_ESCROW',
        escrowVaultId: transactionId || `BHARAT-ESCROW-${Date.now().toString().slice(-6)}`,
        shippingAddress: String(shippingAddress || customer.city),
        milestones: [
          {
            id: `ms-${Date.now()}-${idx}-1`,
            orderId: ordId,
            stage: 'FABRIC_SOURCING',
            title: `${authoritativeProduct.title} (Size ${item.selectedSize || 'M'} × ${qty})`,
            label: `${authoritativeProduct.title} (Size ${item.selectedSize || 'M'})`,
            description: `Atelier finishing & steam pressing in ${authoritativeProduct.fabric}`,
            status: 'IN_PROGRESS'
          },
          {
            id: `ms-${Date.now()}-${idx}-2`,
            orderId: ordId,
            stage: 'QUALITY_INSPECTION',
            title: 'Quality Check & Dispatch',
            label: 'Quality Check & Dispatch',
            description: `Shipping to: ${shippingAddress || customer.city}`,
            status: 'PENDING'
          }
        ],
        estimatedDeliveryDate: '2026-09-25',
        orderDate: now,
        createdAt: now
      };

      insertOrderStmt.run(
        newOrder.id,
        customer.id,
        designerId,
        newOrder.status || 'QUOTATION_ACCEPTED',
        newOrder.designerOrderStatus || 'In Production',
        newOrder.escrowStatus,
        newOrder.totalAmount,
        JSON.stringify(newOrder),
        now,
        now
      );
      createdOrders.push(newOrder);
    }

    // Clear server-side cart for customer
    db.prepare('UPDATE customer_state SET cart_json = ?, updated_at = ? WHERE customer_id = ?').run(
      '[]',
      now,
      customer.id
    );

    res.status(201).json({ orders: createdOrders });
  });

  router.post(
    '/customer/orders/:id/confirm-delivery',
    requireAuth,
    requireRole('CUSTOMER'),
    (req: Request, res: Response) => {
      const db = getDb();
      const row = db
        .prepare('SELECT customer_id, data_json FROM orders WHERE id = ?')
        .get(req.params.id) as { customer_id: string; data_json: string } | undefined;

      if (!row) return res.status(404).json({ error: 'Order not found.' });
      if (row.customer_id !== req.authUser!.id) {
        return res.status(403).json({ error: 'Forbidden: you do not own this order.' });
      }

      const order = JSON.parse(row.data_json) as Order;
      const updated: Order = {
        ...order,
        status: 'DELIVERED',
        designerOrderStatus: 'Delivered',
        workflowStatus: 'Delivered',
        escrowStatus: 'RELEASED'
      };

      db.prepare(
        'UPDATE orders SET status = ?, workflow_status = ?, escrow_status = ?, data_json = ?, updated_at = ? WHERE id = ?'
      ).run('DELIVERED', 'Delivered', 'RELEASED', JSON.stringify(updated), new Date().toISOString(), req.params.id);

      res.json({ order: updated });
    }
  );

  router.post(
    '/customer/orders/:id/review',
    requireAuth,
    requireRole('CUSTOMER'),
    (req: Request, res: Response) => {
      const db = getDb();
      const row = db
        .prepare('SELECT customer_id, designer_id, data_json FROM orders WHERE id = ?')
        .get(req.params.id) as { customer_id: string; designer_id: string; data_json: string } | undefined;

      if (!row) return res.status(404).json({ error: 'Order not found.' });
      if (row.customer_id !== req.authUser!.id) {
        return res.status(403).json({ error: 'Forbidden: you do not own this order.' });
      }

      const order = JSON.parse(row.data_json) as Order;
      const reviewData = req.body || {};
      const newReview: Review = {
        ...reviewData,
        id: `rev-${Date.now()}`,
        orderId: order.id,
        tailorId: row.designer_id,
        customerId: req.authUser!.id,
        customerName: req.authUser!.name,
        customerAvatar: req.authUser!.avatar,
        createdAt: new Date().toISOString()
      };

      const updatedOrder: Order = {
        ...order,
        status: 'DELIVERED',
        designerOrderStatus: 'Delivered',
        workflowStatus: 'Delivered',
        escrowStatus: 'RELEASED',
        reviewSubmitted: true
      };

      db.prepare(
        'UPDATE orders SET status = ?, workflow_status = ?, escrow_status = ?, data_json = ?, updated_at = ? WHERE id = ?'
      ).run(
        'DELIVERED',
        'Delivered',
        'RELEASED',
        JSON.stringify(updatedOrder),
        new Date().toISOString(),
        req.params.id
      );

      const dProfile = getDesignerProfileByUserId(row.designer_id);
      if (dProfile) {
        const ratingVal = Number(reviewData.overallRating || reviewData.ratingOverall || 5);
        const newCount = (dProfile.reviewCount || 0) + 1;
        const newAvg = Number(
          (((dProfile.rating * (dProfile.reviewCount || 1)) + ratingVal) / newCount).toFixed(1)
        );
        const updatedProfile: TailorProfile = {
          ...dProfile,
          rating: newAvg,
          reviewCount: newCount,
          reviews: [newReview, ...(dProfile.reviews || [])]
        };
        db.prepare(
          'UPDATE designer_profiles SET rating = ?, review_count = ?, data_json = ?, updated_at = ? WHERE id = ?'
        ).run(newAvg, newCount, JSON.stringify(updatedProfile), new Date().toISOString(), dProfile.id);
      }

      res.status(201).json({ order: updatedOrder, review: newReview });
    }
  );

  // ============================================================================
  // 4. DESIGNER ENDPOINTS (PENDING/REJECTED vs ACTIVE + VERIFIED)
  // ============================================================================

  // 4A. Accessible to PENDING, REJECTED, and VERIFIED designers (Own profile & application only)
  router.get('/designer/me', requireAuth, requireRole('DESIGNER'), (req: Request, res: Response) => {
    const profile = getDesignerProfileByUserId(req.authUser!.id);
    if (!profile) {
      return res.status(404).json({ error: 'Designer application profile not found.' });
    }
    res.json({
      user: req.authUser,
      profile,
      verificationStatus: profile.verificationStatus,
      rejectionReason: profile.rejectionReason || null
    });
  });

  router.put('/designer/application', requireAuth, requireRole('DESIGNER'), (req: Request, res: Response) => {
    const db = getDb();
    const profile = getDesignerProfileByUserId(req.authUser!.id);
    if (!profile) {
      return res.status(404).json({ error: 'Designer profile not found.' });
    }

    const {
      shopName,
      city,
      state,
      experienceYears,
      specialties,
      pricingRange,
      startingPrice,
      bio,
      portfolio,
      verificationDocuments,
      resubmit
    } = req.body || {};

    // Prevent self-verification or role/status tampering:
    // If designer was REJECTED or PENDING and submits edits, status becomes PENDING for admin review.
    // If already VERIFIED, remains VERIFIED.
    const nextVerificationStatus: DesignerVerificationStatus =
      profile.verificationStatus === 'VERIFIED'
        ? 'VERIFIED'
        : resubmit || profile.verificationStatus === 'REJECTED'
        ? 'PENDING'
        : normalizeVerificationStatus(profile.verificationStatus);

    const nextRejectionReason =
      nextVerificationStatus === 'PENDING' ? undefined : profile.rejectionReason;

    const parsedSpecialties = Array.isArray(specialties)
      ? specialties.map((s) => String(s).trim()).filter(Boolean)
      : typeof specialties === 'string'
      ? specialties.split(',').map((s) => s.trim()).filter(Boolean)
      : profile.specialties;

    const updatedProfile: TailorProfile = {
      ...profile,
      id: profile.id, // Immutable
      userId: profile.userId, // Immutable
      verificationStatus: nextVerificationStatus,
      rejectionReason: nextRejectionReason,
      shopName: typeof shopName === 'string' && shopName.trim() ? shopName.trim() : profile.shopName,
      city: typeof city === 'string' && city.trim() ? city.trim() : profile.city,
      state: typeof state === 'string' && state.trim() ? state.trim() : profile.state,
      experienceYears:
        experienceYears !== undefined ? Math.max(1, Number(experienceYears) || 1) : profile.experienceYears,
      specialties: parsedSpecialties,
      pricingRange:
        typeof pricingRange === 'string' && pricingRange.trim() ? pricingRange.trim() : profile.pricingRange,
      startingPrice:
        startingPrice !== undefined ? Math.max(500, Number(startingPrice) || 5000) : profile.startingPrice,
      bio: typeof bio === 'string' ? bio.trim() : profile.bio,
      portfolio: Array.isArray(portfolio) ? portfolio : profile.portfolio,
      verificationDocuments: Array.isArray(verificationDocuments)
        ? verificationDocuments
        : profile.verificationDocuments
    };

    const now = new Date().toISOString();
    db.prepare(
      `UPDATE designer_profiles
       SET shop_name = ?, verification_status = ?, rejection_reason = ?, city = ?, state = ?,
           experience_years = ?, specialties_json = ?, pricing_range = ?, starting_price = ?,
           bio = ?, portfolio_json = ?, verification_docs_json = ?, data_json = ?, updated_at = ?
       WHERE id = ?`
    ).run(
      updatedProfile.shopName,
      nextVerificationStatus,
      nextRejectionReason || null,
      updatedProfile.city,
      updatedProfile.state,
      updatedProfile.experienceYears,
      JSON.stringify(updatedProfile.specialties),
      updatedProfile.pricingRange || null,
      updatedProfile.startingPrice,
      updatedProfile.bio,
      JSON.stringify(updatedProfile.portfolio || []),
      JSON.stringify(updatedProfile.verificationDocuments || []),
      JSON.stringify(updatedProfile),
      now,
      profile.id
    );

    res.json({
      profile: updatedProfile,
      verificationStatus: updatedProfile.verificationStatus,
      rejectionReason: updatedProfile.rejectionReason || null
    });
  });

  // 4B. Accessible ONLY to ACTIVE, VERIFIED Designers (`requireVerifiedDesigner`)
  router.get('/designer/workspace', requireAuth, requireVerifiedDesigner, (req: Request, res: Response) => {
    const db = getDb();
    const designerId = req.designerProfile!.id;

    const prodRows = db
      .prepare('SELECT data_json FROM products WHERE designer_id = ? ORDER BY created_at DESC')
      .all(designerId) as Array<{ data_json: string }>;
    const products: MarketplaceProduct[] = prodRows.map((r) => JSON.parse(r.data_json));

    const reqRows = db
      .prepare('SELECT data_json FROM custom_requests WHERE assigned_designer_id = ? ORDER BY created_at DESC')
      .all(designerId) as Array<{ data_json: string }>;
    const incomingRequests: QuotationRequest[] = reqRows.map((r) => JSON.parse(r.data_json));

    const ordRows = db
      .prepare('SELECT data_json FROM orders WHERE designer_id = ? ORDER BY created_at DESC')
      .all(designerId) as Array<{ data_json: string }>;
    const activeOrders: Order[] = ordRows.map((r) => JSON.parse(r.data_json));

    const convRows = db
      .prepare('SELECT data_json FROM conversations WHERE designer_id = ? ORDER BY created_at ASC')
      .all(designerId) as Array<{ data_json: string }>;
    const conversations: ChatMessage[] = convRows.map((r) => JSON.parse(r.data_json));

    const totalEarningsINR = activeOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    res.json({
      profile: req.designerProfile,
      products,
      incomingRequests,
      activeOrders,
      conversations,
      earnings: {
        totalEarningsINR,
        completedOrdersCount: activeOrders.filter(
          (o) => o.status === 'DELIVERED' || o.workflowStatus === 'Delivered'
        ).length
      }
    });
  });

  router.post('/designer/products', requireAuth, requireVerifiedDesigner, (req: Request, res: Response) => {
    const db = getDb();
    const designer = req.designerProfile!;
    const raw = req.body || {};

    if (!raw.title || !raw.price) {
      return res.status(400).json({ error: 'Product title and price are required.' });
    }

    const now = new Date().toISOString();
    const prodId = `prod-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;

    const newProduct: MarketplaceProduct = {
      ...raw,
      id: prodId,
      designerId: designer.id, // Strictly derived from authenticated verified designer session
      designerName: designer.shopName || designer.name,
      designerAvatar: designer.avatar,
      title: String(raw.title).trim(),
      price: Math.max(100, Number(raw.price) || 1000),
      moderationStatus: 'APPROVED',
      inStock: (Number(raw.stockCount) ?? 5) > 0,
      stockCount: Number(raw.stockCount) ?? 5,
      images: Array.isArray(raw.images) && raw.images.length > 0 ? raw.images : [raw.frontImageUrl || ''],
      sizes: Array.isArray(raw.sizes) && raw.sizes.length > 0 ? raw.sizes : ['S', 'M', 'L']
    };

    db.prepare(
      `INSERT INTO products (id, designer_id, moderation_status, price, in_stock, data_json, created_at, updated_at)
       VALUES (?, ?, 'APPROVED', ?, ?, ?, ?, ?)`
    ).run(
      newProduct.id,
      designer.id,
      newProduct.price,
      newProduct.inStock ? 1 : 0,
      JSON.stringify(newProduct),
      now,
      now
    );

    res.status(201).json({ product: newProduct });
  });

  router.put('/designer/products/:id', requireAuth, requireVerifiedDesigner, (req: Request, res: Response) => {
    const db = getDb();
    const designer = req.designerProfile!;
    const row = db
      .prepare('SELECT designer_id, moderation_status, data_json FROM products WHERE id = ?')
      .get(req.params.id) as { designer_id: string; moderation_status: string; data_json: string } | undefined;

    if (!row) return res.status(404).json({ error: 'Product not found.' });
    if (row.designer_id !== designer.id) {
      return res.status(403).json({
        error: 'Forbidden: you cannot modify another designer’s product listing.'
      });
    }

    const existing = JSON.parse(row.data_json) as MarketplaceProduct;
    const raw = req.body || {};
    const updated: MarketplaceProduct = {
      ...existing,
      ...raw,
      id: existing.id,
      designerId: designer.id, // Immutable owner
      designerName: designer.shopName || designer.name,
      moderationStatus: existing.moderationStatus // Designers cannot override admin moderation status
    };

    db.prepare(
      'UPDATE products SET price = ?, in_stock = ?, data_json = ?, updated_at = ? WHERE id = ?'
    ).run(
      updated.price,
      updated.inStock ? 1 : 0,
      JSON.stringify(updated),
      new Date().toISOString(),
      existing.id
    );

    res.json({ product: updated });
  });

  router.delete('/designer/products/:id', requireAuth, requireVerifiedDesigner, (req: Request, res: Response) => {
    const db = getDb();
    const designer = req.designerProfile!;
    const row = db
      .prepare('SELECT designer_id FROM products WHERE id = ?')
      .get(req.params.id) as { designer_id: string } | undefined;

    if (!row) return res.status(404).json({ error: 'Product not found.' });
    if (row.designer_id !== designer.id) {
      return res.status(403).json({
        error: 'Forbidden: you cannot delete another designer’s product listing.'
      });
    }

    db.prepare('DELETE FROM products WHERE id = ?').run(req.params.id);
    res.json({ deleted: true, id: req.params.id });
  });

  // Designer Custom Request Inspection, Quotation & Negotiation (Ownership: assigned_designer_id === designer.id)
  router.get('/designer/requests/:id', requireAuth, requireVerifiedDesigner, (req: Request, res: Response) => {
    const row = getDb()
      .prepare('SELECT assigned_designer_id, data_json FROM custom_requests WHERE id = ?')
      .get(req.params.id) as { assigned_designer_id: string; data_json: string } | undefined;

    if (!row) return res.status(404).json({ error: 'Custom request not found.' });
    if (row.assigned_designer_id !== req.designerProfile!.id) {
      return res.status(403).json({
        error: 'Forbidden: this custom request is not assigned to your atelier.'
      });
    }

    res.json({ quotationRequest: JSON.parse(row.data_json) });
  });

  router.post('/designer/requests/:id/quote', requireAuth, requireVerifiedDesigner, (req: Request, res: Response) => {
    const db = getDb();
    const designer = req.designerProfile!;
    const row = db
      .prepare('SELECT assigned_designer_id, data_json FROM custom_requests WHERE id = ?')
      .get(req.params.id) as { assigned_designer_id: string; data_json: string } | undefined;

    if (!row) return res.status(404).json({ error: 'Custom request not found.' });
    if (row.assigned_designer_id !== designer.id) {
      return res.status(403).json({
        error: 'Forbidden: you can only submit quotations for requests assigned to your atelier.'
      });
    }

    const requestObj = JSON.parse(row.data_json) as QuotationRequest;
    const rawQuote = req.body || {};
    const totalAmount = Math.max(500, Number(rawQuote.totalAmount) || 5000);
    const now = new Date().toISOString();
    const quoteId = `quote-${Date.now()}`;

    const newQuote: TailorQuotation = {
      ...rawQuote,
      id: quoteId,
      requestId: requestObj.id,
      tailorId: designer.id,
      tailorName: designer.name,
      tailorShopName: designer.shopName,
      tailorAvatar: designer.avatar,
      tailorRating: designer.rating,
      totalAmount,
      currency: 'INR',
      status: 'NEGOTIATING',
      customerAgreed: false,
      designerAgreed: true,
      createdAt: now,
      negotiationHistory: [
        {
          id: `neg-${Date.now()}-init`,
          senderRole: 'customer',
          senderName: requestObj.customerName,
          amount: requestObj.targetBudget,
          note: 'Initial customer budget',
          status: 'COUNTERED',
          timestamp: requestObj.createdAt
        },
        {
          id: `neg-${Date.now()}-quote`,
          senderRole: 'tailor',
          senderName: designer.name,
          amount: totalAmount,
          note: String(rawQuote.tailorMessage || 'Designer itemized quotation'),
          status: 'PROPOSED',
          timestamp: now
        }
      ]
    };

    const updatedRequest: QuotationRequest = {
      ...requestObj,
      status: 'NEGOTIATING',
      quotations: [
        newQuote,
        ...requestObj.quotations.filter((q) => q.tailorId !== designer.id)
      ]
    };

    db.prepare('UPDATE custom_requests SET status = ?, data_json = ?, updated_at = ? WHERE id = ?').run(
      'NEGOTIATING',
      JSON.stringify(updatedRequest),
      now,
      requestObj.id
    );

    res.status(201).json({ quotationRequest: updatedRequest, quotation: newQuote });
  });

  router.post('/designer/requests/:id/status', requireAuth, requireVerifiedDesigner, (req: Request, res: Response) => {
    const db = getDb();
    const designer = req.designerProfile!;
    const row = db
      .prepare('SELECT assigned_designer_id, data_json FROM custom_requests WHERE id = ?')
      .get(req.params.id) as { assigned_designer_id: string; data_json: string } | undefined;

    if (!row) return res.status(404).json({ error: 'Custom request not found.' });
    if (row.assigned_designer_id !== designer.id) {
      return res.status(403).json({
        error: 'Forbidden: this request is not assigned to your atelier.'
      });
    }

    const requestObj = JSON.parse(row.data_json) as QuotationRequest;
    const { status, note } = req.body || {};
    const updated: QuotationRequest = {
      ...requestObj,
      status: status || 'MODIFICATION_REQUESTED',
      specificInstructions: note
        ? `${requestObj.specificInstructions || ''} | Designer Note: ${note}`
        : requestObj.specificInstructions
    };

    db.prepare('UPDATE custom_requests SET status = ?, data_json = ?, updated_at = ? WHERE id = ?').run(
      updated.status,
      JSON.stringify(updated),
      new Date().toISOString(),
      requestObj.id
    );

    res.json({ quotationRequest: updated });
  });

  router.post(
    '/designer/requests/:id/negotiate',
    requireAuth,
    requireVerifiedDesigner,
    (req: Request, res: Response) => {
      const db = getDb();
      const designer = req.designerProfile!;
      const row = db
        .prepare('SELECT assigned_designer_id, data_json FROM custom_requests WHERE id = ?')
        .get(req.params.id) as { assigned_designer_id: string; data_json: string } | undefined;

      if (!row) return res.status(404).json({ error: 'Custom request not found.' });
      if (row.assigned_designer_id !== designer.id) {
        return res.status(403).json({
          error: 'Forbidden: this request is not assigned to your atelier.'
        });
      }

      const requestObj = JSON.parse(row.data_json) as QuotationRequest;
      const { quoteId, action, amount, note, isFinalOffer } = req.body || {};

      const updatedQuotations = requestObj.quotations.map((q) => {
        if (quoteId && q.id !== quoteId) return q;
        if (q.tailorId !== designer.id) return q;

        if (action === 'agree') {
          const nextCustomerAgreed = Boolean(q.customerAgreed);
          const nextDesignerAgreed = true;
          const bothAgreed = nextCustomerAgreed && nextDesignerAgreed;
          const updatedHistory = (q.negotiationHistory || []).map((h, idx, arr) =>
            idx === arr.length - 1 ? { ...h, status: 'ACCEPTED' as const } : h
          );
          return {
            ...q,
            customerAgreed: nextCustomerAgreed,
            designerAgreed: nextDesignerAgreed,
            agreedAmount: bothAgreed ? q.totalAmount : q.agreedAmount,
            status: bothAgreed ? ('MUTUALLY_AGREED' as const) : q.status,
            negotiationHistory: updatedHistory
          };
        } else {
          const numAmount = Number(amount);
          if (!numAmount || numAmount <= 0) return q;
          const newOffer: NegotiationOffer = {
            id: `neg-${Date.now()}`,
            senderRole: 'tailor',
            senderName: designer.name,
            amount: numAmount,
            note: String(note || 'Designer revised offer'),
            message: String(note || 'Designer revised offer'),
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
            totalAmount: numAmount,
            status: 'NEGOTIATING' as const,
            customerAgreed: false,
            designerAgreed: true,
            negotiationHistory: [...updatedHistory, newOffer]
          };
        }
      });

      const updatedRequest: QuotationRequest = {
        ...requestObj,
        status: 'NEGOTIATING',
        quotations: updatedQuotations
      };

      db.prepare('UPDATE custom_requests SET status = ?, data_json = ?, updated_at = ? WHERE id = ?').run(
        updatedRequest.status,
        JSON.stringify(updatedRequest),
        new Date().toISOString(),
        requestObj.id
      );

      res.json({ quotationRequest: updatedRequest });
    }
  );

  // Designer Assigned Orders & Production Proofs (Ownership: designer_id === designer.id)
  router.get('/designer/orders/:id', requireAuth, requireVerifiedDesigner, (req: Request, res: Response) => {
    const row = getDb()
      .prepare('SELECT designer_id, data_json FROM orders WHERE id = ?')
      .get(req.params.id) as { designer_id: string; data_json: string } | undefined;

    if (!row) return res.status(404).json({ error: 'Order not found.' });
    if (row.designer_id !== req.designerProfile!.id) {
      return res.status(403).json({ error: 'Forbidden: this order is not assigned to your atelier.' });
    }
    res.json({ order: JSON.parse(row.data_json) });
  });

  router.post(
    '/designer/orders/:id/status',
    requireAuth,
    requireVerifiedDesigner,
    (req: Request, res: Response) => {
      const db = getDb();
      const designer = req.designerProfile!;
      const row = db
        .prepare('SELECT designer_id, workflow_status, data_json FROM orders WHERE id = ?')
        .get(req.params.id) as { designer_id: string; workflow_status: string; data_json: string } | undefined;

      if (!row) return res.status(404).json({ error: 'Order not found.' });
      if (row.designer_id !== designer.id) {
        return res.status(403).json({
          error: 'Forbidden: you cannot update an order assigned to another designer.'
        });
      }

      const order = JSON.parse(row.data_json) as Order;
      const currentWf = order.designerOrderStatus || order.workflowStatus || row.workflow_status || 'In Production';
      const nextStatus = req.body?.nextStatus as DesignerOrderStatus;

      const allowed = VALID_ORDER_STATUS_TRANSITIONS[currentWf] || [];
      if (!allowed.includes(nextStatus)) {
        return res.status(400).json({
          error: `Invalid status transition from "${currentWf}" to "${nextStatus}". Allowed next step: ${allowed.join(', ') || 'None'}`
        });
      }

      const updated: Order = {
        ...order,
        designerOrderStatus: nextStatus,
        workflowStatus: nextStatus,
        status:
          nextStatus === 'Delivered'
            ? 'DELIVERED'
            : nextStatus === 'Shipped'
            ? 'DISPATCHED'
            : 'IN_PRODUCTION',
        escrowStatus: nextStatus === 'Delivered' ? 'RELEASED' : order.escrowStatus
      };

      db.prepare(
        'UPDATE orders SET status = ?, workflow_status = ?, escrow_status = ?, data_json = ?, updated_at = ? WHERE id = ?'
      ).run(
        updated.status,
        nextStatus,
        updated.escrowStatus,
        JSON.stringify(updated),
        new Date().toISOString(),
        order.id
      );

      res.json({ order: updated });
    }
  );

  router.post(
    '/designer/orders/:id/milestone',
    requireAuth,
    requireVerifiedDesigner,
    (req: Request, res: Response) => {
      const db = getDb();
      const designer = req.designerProfile!;
      const row = db
        .prepare('SELECT designer_id, data_json FROM orders WHERE id = ?')
        .get(req.params.id) as { designer_id: string; data_json: string } | undefined;

      if (!row) return res.status(404).json({ error: 'Order not found.' });
      if (row.designer_id !== designer.id) {
        return res.status(403).json({
          error: 'Forbidden: you cannot upload production proofs for another designer’s order.'
        });
      }

      const order = JSON.parse(row.data_json) as Order;
      const { milestoneId, photoProofUrl, caption } = req.body || {};
      const now = new Date().toISOString();

      let nextPendingFound = false;
      const updatedMilestones = order.milestones.map((m, idx) => {
        const mKey = m.id || m.stage || String(idx);
        if (mKey === milestoneId) {
          const newPhoto: MilestoneProgressPhoto | null = photoProofUrl
            ? {
                id: `pp-${Date.now()}`,
                url: String(photoProofUrl),
                caption: String(caption || `Completed ${m.title || m.label || m.stage}`),
                uploadedAt: now,
                uploadedBy: designer.name,
                stageLabel: m.title || m.label || m.stage
              }
            : null;

          return {
            ...m,
            status: 'COMPLETED' as const,
            completed: true,
            completedAt: now,
            photoUrl: photoProofUrl || m.photoUrl,
            photoProof: photoProofUrl || m.photoProof,
            photoProofUrl: photoProofUrl || m.photoProofUrl,
            progressPhotos: newPhoto ? [...(m.progressPhotos || []), newPhoto] : m.progressPhotos
          };
        }
        if (m.status === 'PENDING' && !nextPendingFound) {
          nextPendingFound = true;
          return { ...m, status: 'IN_PROGRESS' as const };
        }
        return m;
      });

      const updatedOrder: Order = {
        ...order,
        milestones: updatedMilestones
      };

      db.prepare('UPDATE orders SET data_json = ?, updated_at = ? WHERE id = ?').run(
        JSON.stringify(updatedOrder),
        now,
        order.id
      );

      res.json({ order: updatedOrder });
    }
  );

  // ============================================================================
  // 5. PRIVATE CONVERSATIONS (Participating Customer, Assigned Designer, or Admin)
  // ============================================================================
  router.get('/conversations/:orderId', requireAuth, (req: Request, res: Response) => {
    const db = getDb();
    const user = req.authUser!;
    const orderId = req.params.orderId;

    const orderRow = db
      .prepare('SELECT customer_id, designer_id FROM orders WHERE id = ?')
      .get(orderId) as { customer_id: string; designer_id: string } | undefined;

    const reqRow = !orderRow
      ? (db
          .prepare('SELECT customer_id, assigned_designer_id as designer_id FROM custom_requests WHERE id = ?')
          .get(orderId) as { customer_id: string; designer_id: string } | undefined)
      : undefined;

    const participantRecord = orderRow || reqRow;
    if (!participantRecord) {
      return res.status(404).json({ error: 'Conversation thread not found.' });
    }

    const isParticipatingCustomer =
      user.role === 'CUSTOMER' && participantRecord.customer_id === user.id;
    const isAssignedDesigner =
      user.role === 'DESIGNER' &&
      req.designerProfile &&
      req.designerProfile.verificationStatus === 'VERIFIED' &&
      participantRecord.designer_id === req.designerProfile.id;
    const isAdmin = user.role === 'ADMIN';

    if (!isParticipatingCustomer && !isAssignedDesigner && !isAdmin) {
      return res.status(403).json({
        error: 'Forbidden: only the participating customer, assigned designer, or an admin may access this private conversation.'
      });
    }

    const rows = db
      .prepare('SELECT data_json FROM conversations WHERE order_id = ? ORDER BY created_at ASC')
      .all(orderId) as Array<{ data_json: string }>;

    res.json({ messages: rows.map((r) => JSON.parse(r.data_json)) });
  });

  router.post('/conversations', requireAuth, (req: Request, res: Response) => {
    const db = getDb();
    const user = req.authUser!;
    const { orderId, recipientId, content, type = 'TEXT', attachmentData } = req.body || {};

    if (!content || !String(content).trim()) {
      return res.status(400).json({ error: 'Message content is required.' });
    }

    let customerId = '';
    let designerId = '';

    if (orderId) {
      const orderRow = db
        .prepare('SELECT customer_id, designer_id FROM orders WHERE id = ?')
        .get(orderId) as { customer_id: string; designer_id: string } | undefined;
      if (orderRow) {
        customerId = orderRow.customer_id;
        designerId = orderRow.designer_id;
      }
    }

    if (!customerId || !designerId) {
      if (user.role === 'CUSTOMER') {
        customerId = user.id;
        designerId = String(recipientId || 'tailor-1');
      } else if (user.role === 'DESIGNER' && req.designerProfile) {
        if (req.designerProfile.verificationStatus !== 'VERIFIED') {
          return res.status(403).json({
            error: 'Only VERIFIED designers may message customers.'
          });
        }
        designerId = req.designerProfile.id;
        customerId = String(recipientId || 'cust-1');
      } else {
        return res.status(403).json({ error: 'Forbidden conversation participants.' });
      }
    }

    // Verify caller is actually the participating customer or assigned verified designer
    const isParticipatingCustomer = user.role === 'CUSTOMER' && customerId === user.id;
    const isAssignedDesigner =
      user.role === 'DESIGNER' &&
      req.designerProfile?.verificationStatus === 'VERIFIED' &&
      designerId === req.designerProfile.id;

    if (!isParticipatingCustomer && !isAssignedDesigner) {
      return res.status(403).json({
        error: 'Forbidden: you are not a participant in this conversation.'
      });
    }

    const now = new Date().toISOString();
    const msgId = `msg-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    const newMsg: ChatMessage = {
      id: msgId,
      orderId: orderId || 'ord-1',
      senderId: user.id,
      senderName: user.name,
      senderRole: user.role,
      receiverId: user.role === 'CUSTOMER' ? designerId : customerId,
      text: String(content).trim(),
      content: String(content).trim(),
      type,
      attachmentData,
      timestamp: now,
      isRead: false
    };

    db.prepare(
      `INSERT INTO conversations (id, order_id, customer_id, designer_id, sender_id, sender_role, data_json, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).run(
      msgId,
      newMsg.orderId,
      customerId,
      designerId,
      user.id,
      user.role,
      JSON.stringify(newMsg),
      now
    );

    res.status(201).json({ message: newMsg });
  });

  // ============================================================================
  // 6. ADMIN GOVERNANCE ENDPOINTS (ACTIVE ADMIN ONLY + MANDATORY AUDIT LOGGING)
  // ============================================================================
  router.get('/admin/dashboard', requireAuth, requireRole('ADMIN'), (_req: Request, res: Response) => {
    const db = getDb();

    const userRows = db
      .prepare('SELECT * FROM users ORDER BY created_at DESC')
      .all() as unknown as DbUserRow[];
    const users = userRows.map(mapUserRowToAuthUser);

    const tailors = getAllDesignerProfiles();

    const prodRows = db
      .prepare('SELECT data_json FROM products ORDER BY created_at DESC')
      .all() as Array<{ data_json: string }>;
    const products: MarketplaceProduct[] = prodRows.map((r) => JSON.parse(r.data_json));

    const ordRows = db
      .prepare('SELECT data_json FROM orders ORDER BY created_at DESC')
      .all() as Array<{ data_json: string }>;
    const orders: Order[] = ordRows.map((r) => JSON.parse(r.data_json));

    const dispRows = db
      .prepare('SELECT data_json FROM disputes ORDER BY created_at DESC')
      .all() as Array<{ data_json: string }>;
    const disputes: DisputeRecord[] = dispRows.map((r) => JSON.parse(r.data_json));

    const commRow = db
      .prepare("SELECT value FROM platform_settings WHERE key = 'commission_rate'")
      .get() as { value: string } | undefined;
    const commissionRate = commRow ? Number(commRow.value) || 8 : 8;

    const auditLogs = getAuditLogs();

    res.json({
      users,
      tailors,
      products,
      orders,
      disputes,
      auditLogs,
      commissionRate
    });
  });

  router.post(
    '/admin/designers/:id/verify',
    requireAuth,
    requireRole('ADMIN'),
    (req: Request, res: Response) => {
      const db = getDb();
      const admin = req.authUser!;
      const designerId = req.params.id;
      const { status, reason } = req.body || {};

      const profile = getDesignerProfileByUserId(designerId);
      if (!profile) {
        return res.status(404).json({ error: 'Designer profile not found.' });
      }

      const rawUpper = String(status || '').trim().toUpperCase();
      if (!['VERIFIED', 'REJECTED', 'PENDING', 'REVOKED', 'APPROVED'].includes(rawUpper)) {
        return res.status(400).json({
          error: 'status must be one of: VERIFIED, REJECTED, PENDING, or REVOKED.'
        });
      }

      const canonicalStatus: DesignerVerificationStatus =
        rawUpper === 'VERIFIED' || rawUpper === 'APPROVED'
          ? 'VERIFIED'
          : rawUpper === 'REJECTED' || rawUpper === 'REVOKED'
          ? 'REJECTED'
          : 'PENDING';

      const wasPreviouslyVerified = String(profile.verificationStatus) === 'VERIFIED';
      const auditAction =
        canonicalStatus === 'VERIFIED'
          ? 'VERIFIED'
          : rawUpper === 'REVOKED' || wasPreviouslyVerified
          ? 'REVOKED'
          : 'REJECTED';

      const effectiveReason =
        String(reason || '').trim() ||
        (canonicalStatus === 'VERIFIED'
          ? 'Designer portfolio and KYC credentials verified by Admin.'
          : auditAction === 'REVOKED'
          ? 'Designer verification revoked by Admin governance.'
          : 'Designer application rejected by Admin.');

      const now = new Date().toISOString();
      const updatedProfile: TailorProfile = {
        ...profile,
        verificationStatus: canonicalStatus,
        rejectionReason: canonicalStatus === 'REJECTED' ? effectiveReason : undefined,
        verifiedAt: canonicalStatus === 'VERIFIED' ? now : profile.verifiedAt,
        badge: canonicalStatus === 'VERIFIED' ? 'Master Atelier' : profile.badge
      };

      db.prepare(
        `UPDATE designer_profiles
         SET verification_status = ?, rejection_reason = ?, verified_at = ?, data_json = ?, updated_at = ?
         WHERE id = ?`
      ).run(
        canonicalStatus,
        canonicalStatus === 'REJECTED' ? effectiveReason : null,
        updatedProfile.verifiedAt || null,
        JSON.stringify(updatedProfile),
        now,
        profile.id
      );

      // Note: Existing orders are intentionally preserved for administrative review!
      const logEntry = recordAuditLog({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: 'ADMIN',
        targetId: profile.id,
        targetName: profile.name,
        action: auditAction,
        reason: effectiveReason
      });

      res.json({
        profile: updatedProfile,
        auditLog: logEntry
      });
    }
  );

  router.post(
    '/admin/users/:id/status',
    requireAuth,
    requireRole('ADMIN'),
    (req: Request, res: Response) => {
      const db = getDb();
      const admin = req.authUser!;
      const targetUserId = req.params.id;
      const { accountStatus, reason } = req.body || {};

      if (targetUserId === admin.id) {
        return res.status(400).json({ error: 'Admins cannot suspend their own account.' });
      }

      const targetRow = getUserById(targetUserId);
      if (!targetRow) {
        return res.status(404).json({ error: 'Target user account not found.' });
      }

      const nextStatus: AccountStatus = normalizeAccountStatus(accountStatus);
      const now = new Date().toISOString();

      db.prepare('UPDATE users SET account_status = ?, updated_at = ? WHERE id = ?').run(
        nextStatus,
        now,
        targetUserId
      );

      // Immediately invalidate all active sessions if account is suspended
      if (nextStatus === 'SUSPENDED') {
        deleteAllUserSessions(targetUserId);
      }

      // Sync designer profile JSON if user is a designer (keeping verification_status separate!)
      if (targetRow.role === 'DESIGNER') {
        const dProfile = getDesignerProfileByUserId(targetUserId);
        if (dProfile) {
          const updatedProfile: TailorProfile = {
            ...dProfile,
            accountStatus: nextStatus
          };
          db.prepare('UPDATE designer_profiles SET data_json = ?, updated_at = ? WHERE id = ?').run(
            JSON.stringify(updatedProfile),
            now,
            dProfile.id
          );
        }
      }

      const effectiveReason =
        String(reason || '').trim() ||
        (nextStatus === 'SUSPENDED'
          ? 'Account suspended by platform governance.'
          : 'Account reactivated by platform governance.');

      const logEntry = recordAuditLog({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: 'ADMIN',
        targetId: targetRow.id,
        targetName: targetRow.name,
        action: nextStatus === 'SUSPENDED' ? 'SUSPENDED' : 'REACTIVATED',
        reason: effectiveReason
      });

      res.json({
        user: mapUserRowToAuthUser(getUserById(targetUserId)!),
        auditLog: logEntry
      });
    }
  );

  router.post(
    '/admin/products/:id/moderate',
    requireAuth,
    requireRole('ADMIN'),
    (req: Request, res: Response) => {
      const db = getDb();
      const admin = req.authUser!;
      const productId = req.params.id;
      const { moderationStatus, reason } = req.body || {};

      if (!['APPROVED', 'FLAGGED', 'REMOVED'].includes(moderationStatus)) {
        return res.status(400).json({ error: 'Invalid moderationStatus.' });
      }

      const row = db
        .prepare('SELECT data_json FROM products WHERE id = ?')
        .get(productId) as { data_json: string } | undefined;
      if (!row) return res.status(404).json({ error: 'Product not found.' });

      const prod = JSON.parse(row.data_json) as MarketplaceProduct;
      const updated: MarketplaceProduct = {
        ...prod,
        moderationStatus
      };

      db.prepare('UPDATE products SET moderation_status = ?, data_json = ?, updated_at = ? WHERE id = ?').run(
        moderationStatus,
        JSON.stringify(updated),
        new Date().toISOString(),
        productId
      );

      const logEntry = recordAuditLog({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: 'ADMIN',
        targetId: prod.id,
        targetName: prod.title,
        action: 'PRODUCT_MODERATED',
        reason: String(reason || `Product moderation status set to ${moderationStatus}.`)
      });

      res.json({ product: updated, auditLog: logEntry });
    }
  );

  router.post(
    '/admin/disputes/:id/resolve',
    requireAuth,
    requireRole('ADMIN'),
    (req: Request, res: Response) => {
      const db = getDb();
      const admin = req.authUser!;
      const disputeId = req.params.id;
      const { resolution, reason } = req.body || {};

      if (!['RESOLVED_REFUND', 'RESOLVED_RELEASE'].includes(resolution)) {
        return res.status(400).json({ error: 'Invalid dispute resolution.' });
      }

      const row = db
        .prepare('SELECT data_json FROM disputes WHERE id = ?')
        .get(disputeId) as { data_json: string } | undefined;
      if (!row) return res.status(404).json({ error: 'Dispute not found.' });

      const dispute = JSON.parse(row.data_json) as DisputeRecord;
      const effectiveReason = String(reason || 'Resolved by Admin Escrow Arbitration.');
      const updated: DisputeRecord = {
        ...dispute,
        status: resolution,
        resolutionNote: effectiveReason
      };

      db.prepare('UPDATE disputes SET status = ?, data_json = ?, updated_at = ? WHERE id = ?').run(
        resolution,
        JSON.stringify(updated),
        new Date().toISOString(),
        disputeId
      );

      const logEntry = recordAuditLog({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: 'ADMIN',
        targetId: dispute.id,
        targetName: `Dispute #${dispute.id} (${dispute.orderNumber})`,
        action: 'DISPUTE_RESOLVED',
        reason: `${resolution}: ${effectiveReason}`
      });

      res.json({ dispute: updated, auditLog: logEntry });
    }
  );

  router.post(
    '/admin/orders/:id/release-escrow',
    requireAuth,
    requireRole('ADMIN'),
    (req: Request, res: Response) => {
      const db = getDb();
      const admin = req.authUser!;
      const orderId = req.params.id;
      const { reason } = req.body || {};

      const row = db
        .prepare('SELECT data_json FROM orders WHERE id = ?')
        .get(orderId) as { data_json: string } | undefined;
      if (!row) return res.status(404).json({ error: 'Order not found.' });

      const order = JSON.parse(row.data_json) as Order;
      const updated: Order = {
        ...order,
        escrowStatus: 'RELEASED'
      };

      db.prepare('UPDATE orders SET escrow_status = ?, data_json = ?, updated_at = ? WHERE id = ?').run(
        'RELEASED',
        JSON.stringify(updated),
        new Date().toISOString(),
        orderId
      );

      const logEntry = recordAuditLog({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: 'ADMIN',
        targetId: order.id,
        targetName: `Order #${order.orderNumber || order.id}`,
        action: 'ESCROW_RELEASED',
        reason: String(reason || 'Escrow funds released to designer by Admin.')
      });

      res.json({ order: updated, auditLog: logEntry });
    }
  );

  router.post(
    '/admin/settings/commission',
    requireAuth,
    requireRole('ADMIN'),
    (req: Request, res: Response) => {
      const db = getDb();
      const admin = req.authUser!;
      const { commissionRate, reason } = req.body || {};
      const rate = Math.max(1, Math.min(35, Number(commissionRate) || 8));

      db.prepare(
        `INSERT INTO platform_settings (key, value) VALUES ('commission_rate', ?)
         ON CONFLICT(key) DO UPDATE SET value = excluded.value`
      ).run(String(rate));

      const logEntry = recordAuditLog({
        actorId: admin.id,
        actorName: admin.name,
        actorRole: 'ADMIN',
        targetId: 'platform_commission',
        targetName: 'Platform Commission Rate',
        action: 'COMMISSION_UPDATED',
        reason: String(reason || `Commission rate updated to ${rate}%.`)
      });

      res.json({ commissionRate: rate, auditLog: logEntry });
    }
  );

  // Legacy transition & payment validation endpoints (now protected by requireAuth)
  router.post('/orders/validate-transition', requireAuth, requireVerifiedDesigner, (req: Request, res: Response) => {
    const { orderId, currentStatus, nextStatus } = req.body || {};
    const allowed = VALID_ORDER_STATUS_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(nextStatus)) {
      return res.status(400).json({
        valid: false,
        error: `Invalid status transition from "${currentStatus}" to "${nextStatus}". Allowed next step: ${allowed.join(', ') || 'None (Terminal State)'}`
      });
    }
    return res.json({
      valid: true,
      orderId,
      previousStatus: currentStatus,
      workflowStatus: nextStatus,
      updatedAt: new Date().toISOString()
    });
  });

  router.post('/payments/verify', requireAuth, requireRole('CUSTOMER'), (req: Request, res: Response) => {
    const { amount, quotationId, orderType, customerAgreed, designerAgreed } = req.body || {};
    if (orderType === 'tailor' && (!customerAgreed || !designerAgreed)) {
      return res.status(400).json({
        verified: false,
        error:
          'Both Customer and Designer must explicitly agree on the final negotiated price before payment can be processed.'
      });
    }
    return res.json({
      verified: true,
      escrowVaultId: `BHARAT-ESCROW-${Date.now().toString().slice(-6)}`,
      transactionReference: `UTR${Date.now().toString().slice(-8)}`,
      amountVerified: amount,
      quotationId,
      timestamp: new Date().toISOString()
    });
  });

  return router;
}
