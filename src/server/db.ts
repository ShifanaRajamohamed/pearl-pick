import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import {
  CanonicalRole,
  AccountStatus,
  DesignerVerificationStatus,
  normalizeRole,
  normalizeAccountStatus,
  normalizeVerificationStatus
} from '../types/rbac';
import {
  AuthUser,
  TailorProfile,
  DressDesign,
  QuotationRequest,
  Order,
  MeasurementSheet,
  MarketplaceProduct,
  ChatMessage,
  DisputeRecord,
  ApprovalAuditLog,
  CartItem
} from '../types';
import {
  INITIAL_TAILORS,
  INITIAL_DRESS_DESIGNS,
  INITIAL_QUOTATION_REQUESTS,
  INITIAL_ORDERS,
  INITIAL_MEASUREMENTS,
  INITIAL_CHAT_MESSAGES,
  MARKETPLACE_PRODUCTS
} from '../data/mockData';
import { hashPassword, hashToken, generateRandomToken } from './crypto';

export interface DbUserRow {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: CanonicalRole;
  account_status: AccountStatus;
  password_hash: string;
  avatar: string;
  city: string;
  wallet_balance_inr: number;
  saved_addresses_json: string;
  designer_profile_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbSessionRow {
  token_hash: string;
  user_id: string;
  csrf_token: string;
  expires_at: number;
  created_at: string;
}

let dbInstance: DatabaseSync | null = null;
let currentDbPath: string = '';

export function getDbPath(): string {
  return (
    currentDbPath ||
    process.env.PEARL_PICK_DB_PATH ||
    path.join(process.cwd(), 'data', 'pearl_pick.sqlite')
  );
}

export function getDb(): DatabaseSync {
  if (!dbInstance) {
    initDatabase();
  }
  return dbInstance!;
}

export function initDatabase(customPath?: string): DatabaseSync {
  const targetPath =
    customPath ||
    process.env.PEARL_PICK_DB_PATH ||
    path.join(process.cwd(), 'data', 'pearl_pick.sqlite');

  if (dbInstance && currentDbPath === targetPath) {
    return dbInstance;
  }

  if (dbInstance) {
    try {
      dbInstance.close();
    } catch {}
    dbInstance = null;
  }

  if (targetPath !== ':memory:') {
    const dir = path.dirname(targetPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  currentDbPath = targetPath;
  const db = new DatabaseSync(targetPath);
  dbInstance = db;

  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL UNIQUE,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL,
      account_status TEXT NOT NULL DEFAULT 'ACTIVE',
      password_hash TEXT NOT NULL,
      avatar TEXT NOT NULL,
      city TEXT NOT NULL,
      wallet_balance_inr INTEGER NOT NULL DEFAULT 0,
      saved_addresses_json TEXT NOT NULL DEFAULT '[]',
      designer_profile_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      csrf_token TEXT NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS designer_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      shop_name TEXT NOT NULL,
      verification_status TEXT NOT NULL DEFAULT 'PENDING',
      rejection_reason TEXT,
      verified_at TEXT,
      city TEXT NOT NULL,
      state TEXT NOT NULL,
      experience_years INTEGER NOT NULL DEFAULT 1,
      specialties_json TEXT NOT NULL DEFAULT '[]',
      pricing_range TEXT,
      starting_price INTEGER NOT NULL DEFAULT 5000,
      bio TEXT,
      portfolio_json TEXT NOT NULL DEFAULT '[]',
      verification_docs_json TEXT NOT NULL DEFAULT '[]',
      rating REAL NOT NULL DEFAULT 4.8,
      review_count INTEGER NOT NULL DEFAULT 0,
      completed_orders INTEGER NOT NULL DEFAULT 0,
      data_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customer_measurements (
      customer_id TEXT PRIMARY KEY,
      data_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS customer_state (
      customer_id TEXT PRIMARY KEY,
      wishlist_json TEXT NOT NULL DEFAULT '[]',
      cart_json TEXT NOT NULL DEFAULT '[]',
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS designs (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      title TEXT NOT NULL,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      designer_id TEXT NOT NULL,
      moderation_status TEXT NOT NULL DEFAULT 'APPROVED',
      price INTEGER NOT NULL,
      in_stock INTEGER NOT NULL DEFAULT 1,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS custom_requests (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      assigned_designer_id TEXT NOT NULL,
      status TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      designer_id TEXT NOT NULL,
      status TEXT NOT NULL,
      workflow_status TEXT NOT NULL,
      escrow_status TEXT NOT NULL,
      total_amount INTEGER NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS conversations (
      id TEXT PRIMARY KEY,
      order_id TEXT,
      customer_id TEXT NOT NULL,
      designer_id TEXT NOT NULL,
      sender_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS disputes (
      id TEXT PRIMARY KEY,
      order_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      designer_id TEXT NOT NULL,
      status TEXT NOT NULL,
      data_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      actor_role TEXT NOT NULL,
      target_id TEXT NOT NULL,
      target_name TEXT NOT NULL,
      action TEXT NOT NULL,
      reason TEXT NOT NULL,
      timestamp TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS platform_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);

  runRbacNormalizationMigration(db);
  seedDatabaseIfEmpty(db);
  syncCatalogData(db);

  return db;
}

/**
 * Explicit migration normalizing any legacy roles ('customer', 'tailor', 'admin')
 * and legacy statuses ('PENDING_APPROVAL', 'UNDER_REVIEW', 'INFO_REQUESTED', 'SUSPENDED' on verification)
 * to the canonical RBAC model:
 * - Role: CUSTOMER | DESIGNER | ADMIN
 * - AccountStatus: ACTIVE | SUSPENDED
 * - DesignerVerificationStatus: PENDING | VERIFIED | REJECTED
 */
export function runRbacNormalizationMigration(db: DatabaseSync = getDb()): {
  migratedUsers: number;
  migratedDesigners: number;
} {
  let migratedUsers = 0;
  let migratedDesigners = 0;

  const userRows = db.prepare('SELECT id, role, account_status FROM users').all() as Array<{
    id: string;
    role: string;
    account_status: string;
  }>;

  const updateUserStmt = db.prepare(
    'UPDATE users SET role = ?, account_status = ?, updated_at = ? WHERE id = ?'
  );

  for (const row of userRows) {
    const canonicalRole = normalizeRole(row.role) || 'CUSTOMER';
    const canonicalStatus = normalizeAccountStatus(row.account_status);
    if (canonicalRole !== row.role || canonicalStatus !== row.account_status) {
      updateUserStmt.run(canonicalRole, canonicalStatus, new Date().toISOString(), row.id);
      migratedUsers++;
    }
  }

  const designerRows = db
    .prepare('SELECT id, user_id, verification_status, data_json FROM designer_profiles')
    .all() as Array<{
    id: string;
    user_id: string;
    verification_status: string;
    data_json: string;
  }>;

  const updateDesignerStmt = db.prepare(
    'UPDATE designer_profiles SET verification_status = ?, data_json = ?, updated_at = ? WHERE id = ?'
  );
  const suspendUserStmt = db.prepare(
    'UPDATE users SET account_status = ?, updated_at = ? WHERE id = ?'
  );

  for (const dRow of designerRows) {
    const rawVer = dRow.verification_status;
    // If legacy verification_status was 'SUSPENDED', move suspension to user.account_status
    if (rawVer === 'SUSPENDED') {
      suspendUserStmt.run('SUSPENDED', new Date().toISOString(), dRow.user_id);
    }
    const canonicalVer = normalizeVerificationStatus(rawVer);
    let parsed: TailorProfile | null = null;
    try {
      parsed = JSON.parse(dRow.data_json);
    } catch {}

    if (canonicalVer !== rawVer || (parsed && parsed.verificationStatus !== canonicalVer)) {
      if (parsed) {
        parsed.verificationStatus = canonicalVer;
      }
      updateDesignerStmt.run(
        canonicalVer,
        parsed ? JSON.stringify(parsed) : dRow.data_json,
        new Date().toISOString(),
        dRow.id
      );
      migratedDesigners++;
    }
  }

  return { migratedUsers, migratedDesigners };
}

function seedDatabaseIfEmpty(db: DatabaseSync) {
  const countRow = db.prepare('SELECT COUNT(*) as cnt FROM users').get() as { cnt: number };
  if (countRow && countRow.cnt > 0) {
    return;
  }

  const now = new Date().toISOString();
  const adminPassword = process.env.ADMIN_INITIAL_PASSWORD || 'admin123';

  const insertUser = db.prepare(`
    INSERT INTO users (
      id, name, phone, email, role, account_status, password_hash,
      avatar, city, wallet_balance_inr, saved_addresses_json, designer_profile_id, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // 1. Seed Customers
  insertUser.run(
    'cust-1',
    'Ananya Verma',
    '9820154321',
    'ananya.verma@mumbai.in',
    'CUSTOMER',
    'ACTIVE',
    hashPassword('password123'),
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    'Mumbai, Maharashtra',
    52000,
    JSON.stringify([
      'Flat 802, Sea Green Apartments, Carter Road, Bandra West, Mumbai - 400050',
      'Tower 4, DLF Magnolias, Golf Course Road, Gurugram - 122002'
    ]),
    null,
    now,
    now
  );

  insertUser.run(
    'cust-2',
    'Riya Kapoor',
    '9820911223',
    'riya.kapoor@delhi.in',
    'CUSTOMER',
    'ACTIVE',
    hashPassword('password123'),
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
    'New Delhi, Delhi NCR',
    34000,
    JSON.stringify(['14 Jor Bagh, New Delhi - 110003']),
    null,
    now,
    now
  );

  // 2. Seed Designers (linked to INITIAL_TAILORS)
  const insertDesigner = db.prepare(`
    INSERT INTO designer_profiles (
      id, user_id, name, shop_name, verification_status, rejection_reason, verified_at,
      city, state, experience_years, specialties_json, pricing_range, starting_price,
      bio, portfolio_json, verification_docs_json, rating, review_count, completed_orders,
      data_json, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const designerPhones: Record<string, { phone: string; email: string; status: DesignerVerificationStatus; rejectionReason?: string }> = {
    'tailor-1': {
      phone: '9811234567',
      email: 'rafiq.ahmed@darzicouture.in',
      status: 'VERIFIED'
    },
    'tailor-2': {
      phone: '9830011223',
      email: 'arjun.mehta@royalatelier.in',
      status: 'VERIFIED'
    },
    'tailor-3': {
      phone: '9845011223',
      email: 'meera@kanjeevaramstudio.in',
      status: 'PENDING'
    },
    'tailor-4': {
      phone: '9822099887',
      email: 'zoya.hasan@lucknowchikankari.in',
      status: 'VERIFIED'
    }
  };

  for (const tailor of INITIAL_TAILORS) {
    const meta = designerPhones[tailor.id] || {
      phone: tailor.phone.replace(/\D/g, '').slice(-10) || '9811000000',
      email: `${tailor.id}@pearlpick.in`,
      status: normalizeVerificationStatus(tailor.verificationStatus)
    };
    const canonicalVer = meta.status;
    const normalizedTailor: TailorProfile = {
      ...tailor,
      userId: tailor.id,
      verificationStatus: canonicalVer,
      rejectionReason: meta.rejectionReason,
      accountStatus: 'ACTIVE'
    };

    insertUser.run(
      tailor.id,
      tailor.name,
      meta.phone,
      meta.email,
      'DESIGNER',
      'ACTIVE',
      hashPassword('darzi123'),
      tailor.avatar,
      `${tailor.city}, ${tailor.state}`,
      75000,
      JSON.stringify([tailor.shopAddress]),
      tailor.id,
      now,
      now
    );

    insertDesigner.run(
      tailor.id,
      tailor.id,
      tailor.name,
      tailor.shopName,
      canonicalVer,
      meta.rejectionReason || null,
      canonicalVer === 'VERIFIED' ? now : null,
      tailor.city,
      tailor.state,
      tailor.experienceYears,
      JSON.stringify(tailor.specialties || []),
      tailor.pricingRange || `₹${tailor.startingPrice.toLocaleString('en-IN')} – ₹75,000`,
      tailor.startingPrice,
      tailor.bio,
      JSON.stringify(tailor.portfolio || []),
      JSON.stringify(tailor.verificationDocuments || []),
      tailor.rating,
      tailor.reviewCount,
      tailor.completedOrders,
      JSON.stringify(normalizedTailor),
      now
    );
  }

  // Also seed a REJECTED designer account so REJECTED designer workflows are immediately testable
  const rejectedDesignerProfile: TailorProfile = {
    id: 'tailor-rejected-1',
    userId: 'tailor-rejected-1',
    name: 'Kabir Malhotra',
    shopName: 'Malhotra Experimental Drapes',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
    coverImage: '/assets/catalog/w-plum-silk-evening-gown-front.jpg',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    experienceYears: 5,
    verificationStatus: 'REJECTED',
    rejectionReason: 'GSTIN certificate image was illegible and portfolio lacked back/side garment construction views.',
    accountStatus: 'ACTIVE',
    rating: 4.5,
    reviewCount: 0,
    completedOrders: 0,
    specialties: ['Contemporary Gowns', 'Silk Drapes'],
    bio: 'Contemporary evening wear studio.',
    badge: 'Couturier',
    startingPrice: 9500,
    pricingRange: '₹9,500 – ₹45,000',
    averageTurnaroundDays: 14,
    portfolio: [],
    shopAddress: 'Koregaon Park, Pune',
    phone: '+91 98765 00009',
    equipment: ['Juki Industrial Lockstitch'],
    certifications: ['GSTIN-PENDING']
  };

  insertUser.run(
    'tailor-rejected-1',
    rejectedDesignerProfile.name,
    '9876500009',
    'kabir@malhotradrapes.in',
    'DESIGNER',
    'ACTIVE',
    hashPassword('darzi123'),
    rejectedDesignerProfile.avatar,
    'Pune, Maharashtra',
    0,
    JSON.stringify([rejectedDesignerProfile.shopAddress]),
    'tailor-rejected-1',
    now,
    now
  );

  insertDesigner.run(
    'tailor-rejected-1',
    'tailor-rejected-1',
    rejectedDesignerProfile.name,
    rejectedDesignerProfile.shopName,
    'REJECTED',
    rejectedDesignerProfile.rejectionReason || null,
    null,
    rejectedDesignerProfile.city,
    rejectedDesignerProfile.state,
    rejectedDesignerProfile.experienceYears,
    JSON.stringify(rejectedDesignerProfile.specialties),
    rejectedDesignerProfile.pricingRange || '₹9,500 – ₹45,000',
    rejectedDesignerProfile.startingPrice,
    rejectedDesignerProfile.bio,
    JSON.stringify(rejectedDesignerProfile.portfolio),
    JSON.stringify([]),
    rejectedDesignerProfile.rating,
    rejectedDesignerProfile.reviewCount,
    rejectedDesignerProfile.completedOrders,
    JSON.stringify(rejectedDesignerProfile),
    now
  );

  // 3. Seed Provisioned Admin Account (No public registration permitted)
  insertUser.run(
    'admin-1',
    'Vikramaditya Singhania',
    '9999000001',
    'vikram@pearlpick.in',
    'ADMIN',
    'ACTIVE',
    hashPassword(adminPassword),
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
    'New Delhi, Delhi NCR',
    850000,
    JSON.stringify(['Pearl Pick HQ, Barakhamba Road, Connaught Place, New Delhi - 110001']),
    null,
    now,
    now
  );

  // 4. Seed Customer Measurements & State
  db.prepare(
    'INSERT INTO customer_measurements (customer_id, data_json, updated_at) VALUES (?, ?, ?)'
  ).run('cust-1', JSON.stringify({ ...INITIAL_MEASUREMENTS, customerId: 'cust-1' }), now);

  db.prepare(
    'INSERT INTO customer_state (customer_id, wishlist_json, cart_json, updated_at) VALUES (?, ?, ?, ?)'
  ).run('cust-1', JSON.stringify([]), JSON.stringify([]), now);

  // 5. Seed Saved AI Dress Designs (owned by cust-1)
  const insertDesign = db.prepare(`
    INSERT INTO designs (id, customer_id, title, is_favorite, data_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const design of INITIAL_DRESS_DESIGNS) {
    const ownerId = design.customerId || 'cust-1';
    const normalizedDesign: DressDesign = {
      ...design,
      customerId: ownerId
    };
    insertDesign.run(
      design.id,
      ownerId,
      design.title,
      design.isFavorite ? 1 : 0,
      JSON.stringify(normalizedDesign),
      design.createdAt || now,
      now
    );
  }

  // 6. Seed Marketplace Products (owned by verified designers)
  const insertProduct = db.prepare(`
    INSERT INTO products (id, designer_id, moderation_status, price, in_stock, data_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const prod of MARKETPLACE_PRODUCTS) {
    const designerId = prod.designerId || 'tailor-1';
    const modStatus = prod.moderationStatus || 'APPROVED';
    const fullProd: MarketplaceProduct = {
      ...prod,
      designerId,
      moderationStatus: modStatus,
      stockCount: prod.stockCount ?? 5,
      backImageUrl: prod.backImageUrl || prod.images?.[0],
      sideImageUrl: prod.sideImageUrl || prod.images?.[0]
    };
    insertProduct.run(
      prod.id,
      designerId,
      modStatus,
      prod.price,
      prod.inStock ? 1 : 0,
      JSON.stringify(fullProd),
      now,
      now
    );
  }

  // 7. Seed Custom Quotation Requests (owned by cust-1, assigned to tailor-1)
  const insertRequest = db.prepare(`
    INSERT INTO custom_requests (id, customer_id, assigned_designer_id, status, data_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (let i = 0; i < INITIAL_QUOTATION_REQUESTS.length; i++) {
    const req = INITIAL_QUOTATION_REQUESTS[i];
    const assignedDesignerId =
      req.preferredTailorId || req.quotations?.[0]?.tailorId || 'tailor-1';
    const seededReq: QuotationRequest = {
      ...req,
      customerId: req.customerId || 'cust-1',
      preferredTailorId: assignedDesignerId
    };
    insertRequest.run(
      req.id,
      seededReq.customerId,
      assignedDesignerId,
      seededReq.status,
      JSON.stringify(seededReq),
      req.createdAt || now,
      now
    );
  }

  // 8. Seed Orders (owned by cust-1, assigned to respective designer)
  const insertOrder = db.prepare(`
    INSERT INTO orders (id, customer_id, designer_id, status, workflow_status, escrow_status, total_amount, data_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (let idx = 0; idx < INITIAL_ORDERS.length; idx++) {
    const o = INITIAL_ORDERS[idx];
    const wfStatus = o.designerOrderStatus || (idx === 0 ? 'In Production' : 'Quality Check');
    const fullOrder: Order = {
      ...o,
      customerId: o.customerId || 'cust-1',
      tailorId: o.tailorId || 'tailor-1',
      designerOrderStatus: wfStatus,
      workflowStatus: wfStatus
    };
    insertOrder.run(
      fullOrder.id,
      fullOrder.customerId,
      fullOrder.tailorId,
      fullOrder.status || 'IN_PRODUCTION',
      wfStatus,
      fullOrder.escrowStatus || 'SECURED_IN_ESCROW',
      fullOrder.totalAmount,
      JSON.stringify(fullOrder),
      fullOrder.createdAt || now,
      now
    );
  }

  // 9. Seed Conversations (owned by participating customer & assigned designer)
  const insertMessage = db.prepare(`
    INSERT INTO conversations (id, order_id, customer_id, designer_id, sender_id, sender_role, data_json, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const msg of INITIAL_CHAT_MESSAGES) {
    const canonicalSenderRole = normalizeRole(msg.senderRole) || 'CUSTOMER';
    const normalizedMsg: ChatMessage = {
      ...msg,
      senderRole: canonicalSenderRole
    };
    insertMessage.run(
      msg.id,
      msg.orderId || 'ord-1',
      'cust-1',
      'tailor-1',
      msg.senderId,
      canonicalSenderRole,
      JSON.stringify(normalizedMsg),
      msg.timestamp || now
    );
  }

  // 10. Seed Initial Dispute & Audit Log & Platform Commission
  const initialDispute: DisputeRecord = {
    id: 'disp-101',
    orderId: INITIAL_ORDERS[0]?.id || 'ord-1',
    orderNumber: INITIAL_ORDERS[0]?.orderNumber || 'ORD-8801',
    customerName: 'Ananya Verma',
    designerName: 'Ustad Rafiq Ahmed',
    tailorName: 'Ustad Rafiq Ahmed',
    reason: 'Sleeve embroidery shade slightly deeper gold than digital swatch.',
    amountINR: 18500,
    status: 'OPEN',
    createdAt: '2026-08-19'
  };
  db.prepare(`
    INSERT INTO disputes (id, order_id, customer_id, designer_id, status, data_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    initialDispute.id,
    initialDispute.orderId,
    'cust-1',
    'tailor-1',
    initialDispute.status,
    JSON.stringify(initialDispute),
    now,
    now
  );

  db.prepare(`
    INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, target_id, target_name, action, reason, timestamp)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'log-1',
    'admin-1',
    'Vikramaditya Singhania',
    'ADMIN',
    'tailor-1',
    'Ustad Rafiq Ahmed',
    'VERIFIED',
    'Verified Master Artisan Card, GSTIN, and bridal zardozi portfolio.',
    now
  );

  db.prepare('INSERT INTO platform_settings (key, value) VALUES (?, ?)').run(
    'commission_rate',
    '8'
  );
}

/**
 * Synchronizes the curated 36-garment storefront catalog (22 Women's, 14 Men's),
 * 6 4-angle studio designs, and designer portfolio images into an existing SQLite DB
 * so stale or broken external image URLs are replaced with verified local studio views.
 */
function syncCatalogData(db: DatabaseSync) {
  const now = new Date().toISOString();

  // 1. Upsert all 36 MARKETPLACE_PRODUCTS into products table
  const upsertProduct = db.prepare(`
    INSERT INTO products (id, designer_id, moderation_status, price, in_stock, data_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      designer_id = excluded.designer_id,
      price = excluded.price,
      in_stock = excluded.in_stock,
      data_json = excluded.data_json,
      updated_at = excluded.updated_at
  `);

  const validCatalogIds = new Set(MARKETPLACE_PRODUCTS.map((p) => p.id));

  for (const prod of MARKETPLACE_PRODUCTS) {
    // Ensure catalog items are linked to a VERIFIED designer so /api/public/catalog serves all 36
    const designerId =
      prod.designerId && prod.designerId !== 'tailor-3' ? prod.designerId : 'tailor-1';
    const modStatus = prod.moderationStatus || 'APPROVED';
    const fullProd: MarketplaceProduct = {
      ...prod,
      designerId,
      moderationStatus: modStatus,
      stockCount: prod.stockCount ?? 5,
      frontImageUrl: prod.frontImageUrl || prod.images?.[0],
      backImageUrl: prod.backImageUrl || prod.images?.[1] || prod.images?.[0],
      sideImageUrl: prod.sideImageUrl || prod.images?.[2] || prod.images?.[0],
      detailImageUrl: prod.detailImageUrl || prod.images?.[3] || prod.images?.[0]
    };
    upsertProduct.run(
      prod.id,
      designerId,
      modStatus,
      prod.price,
      prod.inStock ? 1 : 0,
      JSON.stringify(fullProd),
      now,
      now
    );
  }

  // Remove any legacy seeded prod-* rows that are not part of the 36-item catalog
  const existingProdRows = db
    .prepare('SELECT id, data_json FROM products')
    .all() as Array<{ id: string; data_json: string }>;
  const deleteProdStmt = db.prepare('DELETE FROM products WHERE id = ?');
  for (const row of existingProdRows) {
    if (row.id.startsWith('prod-') && !validCatalogIds.has(row.id)) {
      deleteProdStmt.run(row.id);
    }
  }

  // 2. Upsert the 6 curated 4-view studio DressDesigns
  const upsertDesign = db.prepare(`
    INSERT INTO designs (id, customer_id, title, is_favorite, data_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      data_json = excluded.data_json,
      updated_at = excluded.updated_at
  `);
  for (const design of INITIAL_DRESS_DESIGNS) {
    const ownerId = design.customerId || 'cust-1';
    const normalizedDesign: DressDesign = {
      ...design,
      customerId: ownerId
    };
    upsertDesign.run(
      design.id,
      ownerId,
      design.title,
      design.isFavorite ? 1 : 0,
      JSON.stringify(normalizedDesign),
      design.createdAt || now,
      now
    );
  }

  // 3. Refresh portfolio & cover images for seeded INITIAL_TAILORS while preserving RBAC status
  const selectDesignerStmt = db.prepare(
    'SELECT id, verification_status, rejection_reason, verified_at, data_json FROM designer_profiles WHERE id = ?'
  );
  const updateDesignerPortfolioStmt = db.prepare(
    'UPDATE designer_profiles SET portfolio_json = ?, data_json = ?, updated_at = ? WHERE id = ?'
  );

  for (const tailor of INITIAL_TAILORS) {
    const existing = selectDesignerStmt.get(tailor.id) as
      | {
          id: string;
          verification_status: string;
          rejection_reason: string | null;
          verified_at: string | null;
          data_json: string;
        }
      | undefined;
    if (existing) {
      try {
        const parsed = JSON.parse(existing.data_json) as TailorProfile;
        const updatedProfile: TailorProfile = {
          ...parsed,
          coverImage: tailor.coverImage,
          portfolio: tailor.portfolio,
          specialties: tailor.specialties,
          verificationStatus: normalizeVerificationStatus(existing.verification_status),
          rejectionReason: existing.rejection_reason || undefined
        };
        updateDesignerPortfolioStmt.run(
          JSON.stringify(tailor.portfolio || []),
          JSON.stringify(updatedProfile),
          now,
          tailor.id
        );
      } catch {}
    }
  }
}

// ============================================================================
// Repository Helpers
// ============================================================================

export function mapUserRowToAuthUser(row: DbUserRow): AuthUser {
  const db = getDb();
  let designerVerificationStatus: DesignerVerificationStatus | undefined;
  let rejectionReason: string | undefined;

  if (row.role === 'DESIGNER') {
    const dRow = db
      .prepare('SELECT verification_status, rejection_reason FROM designer_profiles WHERE user_id = ?')
      .get(row.id) as { verification_status: string; rejection_reason: string | null } | undefined;
    if (dRow) {
      designerVerificationStatus = normalizeVerificationStatus(dRow.verification_status);
      rejectionReason = dRow.rejection_reason || undefined;
    } else {
      designerVerificationStatus = 'PENDING';
    }
  }

  let savedAddresses: string[] = [];
  try {
    savedAddresses = JSON.parse(row.saved_addresses_json || '[]');
  } catch {}

  const cleanPhone = row.phone.replace(/\D/g, '').slice(-10);

  return {
    id: row.id,
    name: row.name,
    phone: cleanPhone ? `+91 ${cleanPhone}` : row.phone,
    email: row.email,
    role: normalizeRole(row.role) || 'CUSTOMER',
    accountStatus: normalizeAccountStatus(row.account_status),
    avatar: row.avatar,
    city: row.city,
    savedAddresses,
    walletBalanceINR: row.wallet_balance_inr,
    tailorProfileId: row.designer_profile_id || (row.role === 'DESIGNER' ? row.id : undefined),
    designerVerificationStatus,
    rejectionReason
  };
}

export function getUserById(userId: string): DbUserRow | undefined {
  return getDb().prepare('SELECT * FROM users WHERE id = ?').get(userId) as unknown as
    | DbUserRow
    | undefined;
}

export function getUserByPhoneOrEmail(phoneOrEmail: string): DbUserRow | undefined {
  const trimmed = String(phoneOrEmail || '').trim();
  const cleanPhone = trimmed.replace(/\D/g, '').slice(-10);
  if (cleanPhone.length === 10 && !trimmed.includes('@')) {
    return getDb()
      .prepare('SELECT * FROM users WHERE phone = ? OR LOWER(email) = LOWER(?)')
      .get(cleanPhone, trimmed) as unknown as DbUserRow | undefined;
  }
  return getDb()
    .prepare('SELECT * FROM users WHERE LOWER(email) = LOWER(?) OR phone = ?')
    .get(trimmed, trimmed) as unknown as DbUserRow | undefined;
}

export function getDesignerProfileByUserId(userId: string): TailorProfile | null {
  const row = getDb()
    .prepare(
      `SELECT dp.*, u.account_status as user_account_status
       FROM designer_profiles dp
       JOIN users u ON u.id = dp.user_id
       WHERE dp.user_id = ? OR dp.id = ?`
    )
    .get(userId, userId) as unknown as
    | {
        id: string;
        user_id: string;
        verification_status: string;
        rejection_reason: string | null;
        verified_at: string | null;
        data_json: string;
        user_account_status: string;
      }
    | undefined;

  if (!row) return null;
  try {
    const parsed = JSON.parse(row.data_json) as TailorProfile;
    return {
      ...parsed,
      id: row.id,
      userId: row.user_id,
      verificationStatus: normalizeVerificationStatus(row.verification_status),
      rejectionReason: row.rejection_reason || undefined,
      verifiedAt: row.verified_at || parsed.verifiedAt,
      accountStatus: normalizeAccountStatus(row.user_account_status)
    };
  } catch {
    return null;
  }
}

export function getAllDesignerProfiles(): TailorProfile[] {
  const rows = getDb()
    .prepare(
      `SELECT dp.*, u.account_status as user_account_status
       FROM designer_profiles dp
       JOIN users u ON u.id = dp.user_id
       ORDER BY dp.rating DESC`
    )
    .all() as unknown as Array<{
    id: string;
    user_id: string;
    verification_status: string;
    rejection_reason: string | null;
    verified_at: string | null;
    data_json: string;
    user_account_status: string;
  }>;

  const result: TailorProfile[] = [];
  for (const row of rows) {
    try {
      const parsed = JSON.parse(row.data_json) as TailorProfile;
      result.push({
        ...parsed,
        id: row.id,
        userId: row.user_id,
        verificationStatus: normalizeVerificationStatus(row.verification_status),
        rejectionReason: row.rejection_reason || undefined,
        verifiedAt: row.verified_at || parsed.verifiedAt,
        accountStatus: normalizeAccountStatus(row.user_account_status)
      });
    } catch {}
  }
  return result;
}

export function getPublicVerifiedDesigners(): TailorProfile[] {
  return getAllDesignerProfiles()
    .filter((d) => d.verificationStatus === 'VERIFIED' && d.accountStatus === 'ACTIVE')
    .map((d) => ({
      ...d,
      // Strip private KYC documents & internal admin notes from public responses
      verificationDocuments: undefined,
      idProofUrl: undefined,
      businessLicenseUrl: undefined,
      adminNotes: undefined,
      rejectionReason: undefined
    }));
}

export function createSessionRecord(userId: string, ttlMs = 7 * 24 * 60 * 60 * 1000): {
  rawToken: string;
  csrfToken: string;
  expiresAt: number;
} {
  const rawToken = generateRandomToken(32);
  const csrfToken = generateRandomToken(24);
  const tokenHash = hashToken(rawToken);
  const expiresAt = Date.now() + ttlMs;
  const now = new Date().toISOString();

  getDb()
    .prepare(
      'INSERT INTO sessions (token_hash, user_id, csrf_token, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    )
    .run(tokenHash, userId, csrfToken, expiresAt, now);

  return { rawToken, csrfToken, expiresAt };
}

export function getSessionByRawToken(rawToken: string): DbSessionRow | undefined {
  if (!rawToken) return undefined;
  const tokenHash = hashToken(rawToken);
  const row = getDb()
    .prepare('SELECT * FROM sessions WHERE token_hash = ?')
    .get(tokenHash) as unknown as DbSessionRow | undefined;

  if (!row) return undefined;
  if (Date.now() > row.expires_at) {
    getDb().prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
    return undefined;
  }
  return row;
}

export function deleteSessionByRawToken(rawToken: string): void {
  if (!rawToken) return;
  const tokenHash = hashToken(rawToken);
  getDb().prepare('DELETE FROM sessions WHERE token_hash = ?').run(tokenHash);
}

export function deleteAllUserSessions(userId: string): void {
  getDb().prepare('DELETE FROM sessions WHERE user_id = ?').run(userId);
}

export function recordAuditLog(params: {
  actorId: string;
  actorName: string;
  actorRole: CanonicalRole;
  targetId: string;
  targetName: string;
  action: ApprovalAuditLog['action'];
  reason: string;
}): ApprovalAuditLog {
  const id = `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const timestamp = new Date().toISOString();

  getDb()
    .prepare(
      `INSERT INTO audit_logs (id, actor_id, actor_name, actor_role, target_id, target_name, action, reason, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .run(
      id,
      params.actorId,
      params.actorName,
      params.actorRole,
      params.targetId,
      params.targetName,
      params.action,
      params.reason,
      timestamp
    );

  return {
    id,
    actorId: params.actorId,
    actorName: params.actorName,
    actorRole: params.actorRole,
    targetId: params.targetId,
    targetName: params.targetName,
    tailorId: params.targetId,
    tailorName: params.targetName,
    action: params.action,
    adminName: params.actorName,
    reason: params.reason,
    note: params.reason,
    adminNote: params.reason,
    timestamp
  };
}

export function getAuditLogs(): ApprovalAuditLog[] {
  const rows = getDb()
    .prepare('SELECT * FROM audit_logs ORDER BY timestamp DESC')
    .all() as Array<{
    id: string;
    actor_id: string;
    actor_name: string;
    actor_role: CanonicalRole;
    target_id: string;
    target_name: string;
    action: ApprovalAuditLog['action'];
    reason: string;
    timestamp: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    actorId: r.actor_id,
    actorName: r.actor_name,
    actorRole: r.actor_role,
    targetId: r.target_id,
    targetName: r.target_name,
    tailorId: r.target_id,
    tailorName: r.target_name,
    action: r.action,
    adminName: r.actor_name,
    reason: r.reason,
    note: r.reason,
    adminNote: r.reason,
    timestamp: r.timestamp
  }));
}
