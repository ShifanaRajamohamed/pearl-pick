import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// Use an isolated temporary SQLite database for tests
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pearl-pick-rbac-test-'));
const testDbPath = path.join(tmpDir, 'test_pearl_pick.sqlite');
process.env.PEARL_PICK_DB_PATH = testDbPath;
process.env.PEARL_PICK_TEST = 'true';

import { initDatabase, getDb, runRbacNormalizationMigration } from '../src/server/db';
import {
  normalizeRole,
  normalizeAccountStatus,
  normalizeVerificationStatus,
  sanitizeReturnUrl
} from '../src/types/rbac';
import { app } from '../server';

let server: http.Server;
let baseUrl = '';

interface TestSession {
  cookie: string;
  csrfToken: string;
  token: string;
  user: any;
}

async function apiRequest(
  method: string,
  endpoint: string,
  options: {
    body?: any;
    session?: TestSession;
    useCookieAuth?: boolean;
    omitCsrf?: boolean;
  } = {}
): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };

  if (options.session) {
    if (options.useCookieAuth) {
      headers['Cookie'] = options.session.cookie;
      if (!options.omitCsrf && options.session.csrfToken) {
        headers['X-CSRF-Token'] = options.session.csrfToken;
      }
    } else {
      headers['Authorization'] = `Bearer ${options.session.token}`;
    }
  }

  const res = await fetch(`${baseUrl}${endpoint}`, {
    method,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined
  });

  const data = await res.json().catch(() => ({}));
  return {
    status: res.status,
    data,
    headers: Object.fromEntries(res.headers.entries())
  };
}

async function loginAs(phoneOrEmail: string, password: string): Promise<TestSession> {
  const res = await fetch(`${baseUrl}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phoneOrEmail, password })
  });
  const data = await res.json();
  assert.equal(
    res.status,
    200,
    `Expected login for ${phoneOrEmail} to succeed, got ${res.status}: ${JSON.stringify(data)}`
  );
  const setCookie = res.headers.get('set-cookie') || '';
  const cookiePair = setCookie.split(';')[0];
  return {
    cookie: cookiePair,
    csrfToken: data.csrfToken,
    token: data.token,
    user: data.user
  };
}

describe('PEARL PICK — RBAC, Verification, Ownership & Session Security Suite', () => {
  before(async () => {
    initDatabase(testDbPath);
    server = http.createServer(app);
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve());
    });
    const addr = server.address();
    if (addr && typeof addr === 'object') {
      baseUrl = `http://127.0.0.1:${addr.port}`;
    }
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => server.close(() => resolve()));
    }
    try {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    } catch {}
  });

  it('1. Normalizes legacy roles, account statuses, verification statuses, and sanitizes return URLs', () => {
    assert.equal(normalizeRole('customer'), 'CUSTOMER');
    assert.equal(normalizeRole('tailor'), 'DESIGNER');
    assert.equal(normalizeRole('designer'), 'DESIGNER');
    assert.equal(normalizeRole('admin'), 'ADMIN');

    assert.equal(normalizeAccountStatus('active'), 'ACTIVE');
    assert.equal(normalizeAccountStatus('SUSPENDED'), 'SUSPENDED');

    assert.equal(normalizeVerificationStatus('VERIFIED'), 'VERIFIED');
    assert.equal(normalizeVerificationStatus('PENDING_APPROVAL'), 'PENDING');
    assert.equal(normalizeVerificationStatus('UNDER_REVIEW'), 'PENDING');
    assert.equal(normalizeVerificationStatus('REJECTED'), 'REJECTED');

    // Open redirect sanitizer
    assert.equal(sanitizeReturnUrl('/orders'), '/orders');
    assert.equal(sanitizeReturnUrl('https://evil.example.com/phish'), '/');
    assert.equal(sanitizeReturnUrl('//evil.example.com'), '/');
    assert.equal(sanitizeReturnUrl('javascript:alert(1)'), '/');

    // Database migration normalization for legacy values
    const db = getDb();
    db.prepare(`
      INSERT INTO users (
        id, name, phone, email, role, account_status, password_hash,
        avatar, city, wallet_balance_inr, saved_addresses_json, designer_profile_id, created_at, updated_at
      ) VALUES (
        'legacy-u1', 'Legacy Tailor', '9000000099', 'legacy@atelier.in', 'tailor', 'active', 'hash',
        '', 'Mumbai', 0, '[]', 'legacy-u1', '2026-01-01', '2026-01-01'
      )
    `).run();
    db.prepare(`
      INSERT INTO designer_profiles (
        id, user_id, name, shop_name, verification_status, rejection_reason, verified_at,
        city, state, experience_years, specialties_json, pricing_range, starting_price,
        bio, portfolio_json, verification_docs_json, rating, review_count, completed_orders,
        data_json, updated_at
      ) VALUES (
        'legacy-u1', 'legacy-u1', 'Legacy Tailor', 'Legacy House', 'SUSPENDED', NULL, NULL,
        'Mumbai', 'MH', 5, '[]', '', 5000, '', '[]', '[]', 4.5, 1, 1,
        '{"id":"legacy-u1","verificationStatus":"SUSPENDED"}', '2026-01-01'
      )
    `).run();

    runRbacNormalizationMigration();

    const migratedUser = db
      .prepare(`SELECT role, account_status FROM users WHERE id = 'legacy-u1'`)
      .get() as any;
    const migratedDesigner = db
      .prepare(`SELECT verification_status FROM designer_profiles WHERE id = 'legacy-u1'`)
      .get() as any;
    assert.equal(migratedUser.role, 'DESIGNER');
    assert.equal(migratedUser.account_status, 'SUSPENDED');
    assert.equal(migratedDesigner.verification_status, 'REJECTED');
  });

  it('2. Allows guests to browse public catalog (approved products & verified designers only) and returns 401 on protected APIs', async () => {
    const pub = await apiRequest('GET', '/api/public/catalog');
    assert.equal(pub.status, 200);
    assert.ok(Array.isArray(pub.data.products));
    assert.ok(Array.isArray(pub.data.designers));
    // Every designer in public catalog must be VERIFIED
    for (const d of pub.data.designers) {
      assert.equal(d.verificationStatus, 'VERIFIED');
    }

    // Guest attempting protected endpoints must receive 401
    const cBoot = await apiRequest('GET', '/api/customer/bootstrap');
    assert.equal(cBoot.status, 401);

    const dWork = await apiRequest('GET', '/api/designer/workspace');
    assert.equal(dWork.status, 401);

    const aDash = await apiRequest('GET', '/api/admin/dashboard');
    assert.equal(aDash.status, 401);

    const conv = await apiRequest('GET', '/api/conversations/ord-8801');
    assert.equal(conv.status, 401);
  });

  it('3. Rejects hardcoded OTP bypasses and wrong/demo passwords', async () => {
    const otpSend = await apiRequest('POST', '/api/auth/send-otp', {
      body: { phone: '9820154321' }
    });
    assert.equal(otpSend.status, 503);

    const otpVerify = await apiRequest('POST', '/api/auth/verify-otp', {
      body: { phone: '9820154321', otp: '4829' }
    });
    assert.equal(otpVerify.status, 503);

    const badPass = await apiRequest('POST', '/api/auth/login', {
      body: { phoneOrEmail: 'ananya.verma@mumbai.in', password: 'WrongPassword999' }
    });
    assert.equal(badPass.status, 401);
  });

  it('4. Prevents role escalation via public registration or profile updates', async () => {
    // Public registration as ADMIN must be forbidden (403)
    const adminReg = await apiRequest('POST', '/api/auth/register', {
      body: {
        name: 'Attacker Admin',
        phone: '9111222333',
        email: 'attacker@evil.com',
        password: 'Password123!',
        role: 'ADMIN'
      }
    });
    assert.equal(adminReg.status, 403);

    // Designer registration supplying verificationStatus='VERIFIED' must still receive PENDING
    const designerReg = await apiRequest('POST', '/api/auth/register', {
      body: {
        name: 'New Designer',
        phone: '9222333444',
        email: 'new.designer@atelier.in',
        password: 'DesignerPass123!',
        role: 'DESIGNER',
        shopName: 'New Designer Studio',
        verificationStatus: 'VERIFIED',
        accountStatus: 'ACTIVE'
      }
    });
    assert.equal(designerReg.status, 201);
    assert.equal(designerReg.data.user.role, 'DESIGNER');
    assert.equal(designerReg.data.designerProfile.verificationStatus, 'PENDING');

    // Customer profile update attempting to escalate role to ADMIN must stay CUSTOMER
    const customerSession = await loginAs('ananya.verma@mumbai.in', 'password123');
    const profUpdate = await apiRequest('PUT', '/api/customer/profile', {
      session: customerSession,
      body: {
        name: 'Ananya Verma',
        role: 'ADMIN',
        accountStatus: 'ACTIVE'
      }
    });
    assert.equal(profUpdate.status, 200);
    assert.equal(profUpdate.data.user.role, 'CUSTOMER');
  });

  it('5. Enforces strict role isolation across CUSTOMER, DESIGNER, and ADMIN endpoints', async () => {
    const customerSession = await loginAs('ananya.verma@mumbai.in', 'password123');
    const designerSession = await loginAs('rafiq.ahmed@darzicouture.in', 'darzi123');
    const adminSession = await loginAs('vikram@pearlpick.in', 'admin123');

    // Customer attempting Designer & Admin endpoints -> 403
    assert.equal(
      (await apiRequest('GET', '/api/designer/me', { session: customerSession })).status,
      403
    );
    assert.equal(
      (await apiRequest('GET', '/api/designer/workspace', { session: customerSession })).status,
      403
    );
    assert.equal(
      (await apiRequest('GET', '/api/admin/dashboard', { session: customerSession })).status,
      403
    );
    assert.equal(
      (
        await apiRequest('POST', '/api/admin/designers/tailor-3/verify', {
          session: customerSession,
          body: { status: 'VERIFIED', reason: 'Escalate attempt' }
        })
      ).status,
      403
    );

    // Designer attempting Customer & Admin endpoints -> 403
    assert.equal(
      (await apiRequest('GET', '/api/customer/bootstrap', { session: designerSession })).status,
      403
    );
    assert.equal(
      (await apiRequest('GET', '/api/admin/dashboard', { session: designerSession })).status,
      403
    );
    assert.equal(
      (
        await apiRequest('POST', '/api/admin/designers/tailor-3/verify', {
          session: designerSession,
          body: { status: 'VERIFIED', reason: 'Self approve attempt' }
        })
      ).status,
      403
    );

    // Admin attempting Customer & Designer workspace endpoints -> 403
    assert.equal(
      (await apiRequest('GET', '/api/customer/bootstrap', { session: adminSession })).status,
      403
    );
    assert.equal(
      (await apiRequest('GET', '/api/designer/workspace', { session: adminSession })).status,
      403
    );
  });

  it('6. Restricts PENDING and REJECTED designers from verified-only selling, quoting, and order mutations', async () => {
    // Meera (tailor-3) is PENDING; Kabir (tailor-rejected-1) is REJECTED
    const pendingDesigner = await loginAs('meera@kanjeevaramstudio.in', 'darzi123');
    const rejectedDesigner = await loginAs('kabir@malhotradrapes.in', 'darzi123');

    // Both can view their own application via GET /api/designer/me
    const pendingMe = await apiRequest('GET', '/api/designer/me', { session: pendingDesigner });
    assert.equal(pendingMe.status, 200);
    assert.equal(pendingMe.data.profile.verificationStatus, 'PENDING');

    const rejectedMe = await apiRequest('GET', '/api/designer/me', { session: rejectedDesigner });
    assert.equal(rejectedMe.status, 200);
    assert.equal(rejectedMe.data.profile.verificationStatus, 'REJECTED');
    assert.ok(rejectedMe.data.profile.rejectionReason);

    // Both can edit/resubmit their own application via PUT /api/designer/application
    const updateApp = await apiRequest('PUT', '/api/designer/application', {
      session: rejectedDesigner,
      body: {
        shopName: 'Malhotra Experimental Drapes Updated',
        resubmit: true
      }
    });
    assert.equal(updateApp.status, 200);
    assert.equal(updateApp.data.profile.verificationStatus, 'PENDING');

    // Neither can access verified workspace, publish products, submit quotes, or mutate orders (must return 403)
    assert.equal(
      (await apiRequest('GET', '/api/designer/workspace', { session: pendingDesigner })).status,
      403
    );
    assert.equal(
      (
        await apiRequest('POST', '/api/designer/products', {
          session: pendingDesigner,
          body: { title: 'Unauthorized Dress', price: 12000 }
        })
      ).status,
      403
    );
    assert.equal(
      (
        await apiRequest('POST', '/api/designer/requests/req-201/quote', {
          session: pendingDesigner,
          body: { totalAmount: 9000 }
        })
      ).status,
      403
    );
    assert.equal(
      (
        await apiRequest('POST', '/api/designer/orders/ord-8801/status', {
          session: pendingDesigner,
          body: { nextStatus: 'Shipped' }
        })
      ).status,
      403
    );
  });

  it('7. Enforces resource ownership so customers and designers cannot access or mutate another user’s records by changing IDs', async () => {
    const customerA = await loginAs('ananya.verma@mumbai.in', 'password123');
    const customerB = await loginAs('riya.kapoor@delhi.in', 'password123');

    // Customer A saves a private design
    const savedDesignRes = await apiRequest('POST', '/api/customer/designs', {
      session: customerA,
      body: {
        id: 'design-cust-a-private',
        title: 'Ananya Private Bridal Lehenga',
        prompt: 'Crimson silk bridal lehenga',
        dressType: 'Lehenga',
        createdAt: new Date().toISOString(),
        isFavorite: false,
        tags: ['Bridal'],
        variations: []
      }
    });
    assert.equal(savedDesignRes.status, 201);

    // Customer B attempts to favorite or delete Customer A's design -> 403
    const favAttempt = await apiRequest('PATCH', '/api/customer/designs/design-cust-a-private', {
      session: customerB,
      body: { isFavorite: true }
    });
    assert.equal(favAttempt.status, 403);

    const delAttempt = await apiRequest('DELETE', '/api/customer/designs/design-cust-a-private', {
      session: customerB
    });
    assert.equal(delAttempt.status, 403);

    // Customer B attempts to negotiate on Customer A's custom request (req-201) -> 403
    const negAttempt = await apiRequest('POST', '/api/customer/requests/req-201/negotiate', {
      session: customerB,
      body: { quoteId: 'quote-301', action: 'counter', amount: 3000, note: 'Hijack attempt' }
    });
    assert.equal(negAttempt.status, 403);

    // Customer B attempts to confirm delivery on Customer A's order (ord-8801) -> 403
    const confirmAttempt = await apiRequest(
      'POST',
      '/api/customer/orders/ord-8801/confirm-delivery',
      {
        session: customerB
      }
    );
    assert.equal(confirmAttempt.status, 403);

    // Customer B attempts to read or post a message into Customer A's private order conversation (ord-8801) -> 403
    const readChatAttempt = await apiRequest('GET', '/api/conversations/ord-8801', {
      session: customerB
    });
    assert.equal(readChatAttempt.status, 403);

    const chatAttempt = await apiRequest('POST', '/api/conversations', {
      session: customerB,
      body: { orderId: 'ord-8801', recipientId: 'tailor-1', content: 'Snooping message' }
    });
    assert.equal(chatAttempt.status, 403);

    // Verified Designer B (Arjun Mehta, tailor-2) attempts to mutate Verified Designer A's (Rafiq, tailor-1) product & order -> 403
    const designerA = await loginAs('rafiq.ahmed@darzicouture.in', 'darzi123');
    const designerB = await loginAs('arjun.mehta@royalatelier.in', 'darzi123');

    const prodCreate = await apiRequest('POST', '/api/designer/products', {
      session: designerA,
      body: {
        title: 'Rafiq Exclusive Zardozi Sherwani',
        price: 42000,
        fabric: 'Banarasi Brocade'
      }
    });
    assert.equal(prodCreate.status, 201);
    const createdProductId = prodCreate.data.product.id;
    assert.ok(createdProductId);

    // Designer B tries to update or delete Designer A's product -> 403
    assert.equal(
      (
        await apiRequest('PUT', `/api/designer/products/${createdProductId}`, {
          session: designerB,
          body: { title: 'Hijacked Title', price: 100 }
        })
      ).status,
      403
    );
    assert.equal(
      (
        await apiRequest('DELETE', `/api/designer/products/${createdProductId}`, {
          session: designerB
        })
      ).status,
      403
    );

    // Designer B tries to advance Designer A's assigned order (ord-8801) -> 403
    assert.equal(
      (
        await apiRequest('POST', '/api/designer/orders/ord-8801/status', {
          session: designerB,
          body: { nextStatus: 'Quality Check' }
        })
      ).status,
      403
    );
  });

  it('8. Supports Admin approval, verification revocation (preserving existing orders), account suspension, and audit logging', async () => {
    const adminSession = await loginAs('vikram@pearlpick.in', 'admin123');
    const meeraSession = await loginAs('meera@kanjeevaramstudio.in', 'darzi123');

    // Initially Meera (tailor-3) is PENDING and blocked from workspace
    assert.equal(
      (await apiRequest('GET', '/api/designer/workspace', { session: meeraSession })).status,
      403
    );

    // Admin approves Meera (tailor-3)
    const approveRes = await apiRequest('POST', '/api/admin/designers/tailor-3/verify', {
      session: adminSession,
      body: { status: 'VERIFIED', reason: 'Verified Kanjeevaram portfolio and GST credentials.' }
    });
    assert.equal(approveRes.status, 200);
    assert.equal(approveRes.data.profile.verificationStatus, 'VERIFIED');

    // Meera can now immediately access the verified workspace & create a product
    const wsAfterApprove = await apiRequest('GET', '/api/designer/workspace', {
      session: meeraSession
    });
    assert.equal(wsAfterApprove.status, 200);

    const createProd = await apiRequest('POST', '/api/designer/products', {
      session: meeraSession,
      body: { title: 'Meera Temple Border Kanjeevaram Saree', price: 36000 }
    });
    assert.equal(createProd.status, 201);

    // Now Admin revokes Rafiq's (tailor-1) verification
    const revokeRes = await apiRequest('POST', '/api/admin/designers/tailor-1/verify', {
      session: adminSession,
      body: { status: 'REVOKED', reason: 'Revoked verification pending quality audit.' }
    });
    assert.equal(revokeRes.status, 200);
    assert.equal(revokeRes.data.profile.verificationStatus, 'REJECTED');

    // Rafiq immediately loses access to selling & order mutations (403)
    const rafiqSession = await loginAs('rafiq.ahmed@darzicouture.in', 'darzi123');
    assert.equal(
      (
        await apiRequest('POST', '/api/designer/products', {
          session: rafiqSession,
          body: { title: 'Post-revocation product', price: 15000 }
        })
      ).status,
      403
    );
    assert.equal(
      (
        await apiRequest('POST', '/api/designer/orders/ord-8801/status', {
          session: rafiqSession,
          body: { nextStatus: 'Quality Check' }
        })
      ).status,
      403
    );

    // Existing order ord-8801 is preserved for administrative review
    const adminDash = await apiRequest('GET', '/api/admin/dashboard', { session: adminSession });
    assert.equal(adminDash.status, 200);
    const preservedOrder = adminDash.data.orders.find((o: any) => o.id === 'ord-8801');
    assert.ok(
      preservedOrder,
      'Existing order ord-8801 must be preserved after designer verification revocation'
    );

    // Re-approve tailor-1 so seed state remains clean
    await apiRequest('POST', '/api/admin/designers/tailor-1/verify', {
      session: adminSession,
      body: { status: 'VERIFIED', reason: 'Quality audit passed; verification restored.' }
    });

    // Admin suspends Meera's user account (tailor-3)
    const suspendRes = await apiRequest('POST', '/api/admin/users/tailor-3/status', {
      session: adminSession,
      body: { accountStatus: 'SUSPENDED', reason: 'Suspended for policy compliance review.' }
    });
    assert.equal(suspendRes.status, 200);
    assert.equal(suspendRes.data.user.accountStatus, 'SUSPENDED');

    // Meera's existing session is immediately invalidated / blocked
    const meeraCheck = await apiRequest('GET', '/api/designer/me', { session: meeraSession });
    assert.ok(meeraCheck.status === 401 || meeraCheck.status === 403);

    // Meera cannot log in while suspended (403)
    const meeraLoginAttempt = await apiRequest('POST', '/api/auth/login', {
      body: { phoneOrEmail: 'meera@kanjeevaramstudio.in', password: 'darzi123' }
    });
    assert.equal(meeraLoginAttempt.status, 403);

    // Verify audit logs recorded actor, target, action, reason, and timestamp
    const dashAfter = await apiRequest('GET', '/api/admin/dashboard', { session: adminSession });
    const latestLogs = dashAfter.data.auditLogs as any[];
    assert.ok(
      latestLogs.some((l) => l.action === 'REVOKED' && l.actorId === 'admin-1' && l.reason)
    );
    assert.ok(
      latestLogs.some((l) => l.action === 'SUSPENDED' && l.actorId === 'admin-1' && l.reason)
    );
  });

  it('9. Enforces CSRF on cookie-authenticated mutations and invalidates sessions on logout', async () => {
    const customerSession = await loginAs('ananya.verma@mumbai.in', 'password123');

    // Cookie-authenticated PUT without X-CSRF-Token must fail with 403
    const csrfMissing = await apiRequest('PUT', '/api/customer/profile', {
      session: customerSession,
      useCookieAuth: true,
      omitCsrf: true,
      body: { name: 'CSRF Bypass Attempt' }
    });
    assert.equal(csrfMissing.status, 403);

    // Cookie-authenticated PUT with valid X-CSRF-Token succeeds
    const csrfValid = await apiRequest('PUT', '/api/customer/profile', {
      session: customerSession,
      useCookieAuth: true,
      omitCsrf: false,
      body: { name: 'Ananya Verma' }
    });
    assert.equal(csrfValid.status, 200);

    // Logout invalidates session
    const logoutRes = await apiRequest('POST', '/api/auth/logout', {
      session: customerSession,
      useCookieAuth: true
    });
    assert.equal(logoutRes.status, 200);

    const meAfterLogout = await apiRequest('GET', '/api/auth/me', {
      session: customerSession
    });
    assert.equal(meAfterLogout.status, 401);
  });
});
