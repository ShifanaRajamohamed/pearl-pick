import { Request, Response, NextFunction } from 'express';
import { CanonicalRole } from '../types/rbac';
import { AuthUser, TailorProfile } from '../types';
import {
  getSessionByRawToken,
  getUserById,
  mapUserRowToAuthUser,
  getDesignerProfileByUserId,
  deleteAllUserSessions,
  deleteSessionByRawToken
} from './db';

export const SESSION_COOKIE_NAME = 'pp_session';

declare global {
  namespace Express {
    interface Request {
      authUser?: AuthUser;
      designerProfile?: TailorProfile | null;
      sessionToken?: string;
      csrfToken?: string;
      authViaCookie?: boolean;
    }
  }
}

export function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  const pairs = cookieHeader.split(';');
  for (const pair of pairs) {
    const idx = pair.indexOf('=');
    if (idx < 0) continue;
    const key = pair.slice(0, idx).trim();
    const val = pair.slice(idx + 1).trim();
    try {
      cookies[key] = decodeURIComponent(val);
    } catch {
      cookies[key] = val;
    }
  }
  return cookies;
}

export function setSessionCookie(res: Response, rawToken: string, maxAgeSeconds = 7 * 24 * 3600): void {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(rawToken)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAgeSeconds}`
  ];
  if (isProd) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

export function clearSessionCookie(res: Response): void {
  const isProd = process.env.NODE_ENV === 'production';
  const parts = [
    `${SESSION_COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0'
  ];
  if (isProd) {
    parts.push('Secure');
  }
  res.setHeader('Set-Cookie', parts.join('; '));
}

/**
 * Extracts session from HttpOnly cookie (or Bearer token), validates against SQLite,
 * and loads live user + designer profile state.
 */
export function authenticateSession(req: Request, _res: Response, next: NextFunction): void {
  const cookies = parseCookies(req.headers.cookie);
  const cookieToken = cookies[SESSION_COOKIE_NAME];
  const authHeader = req.headers.authorization;
  const bearerToken =
    authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.slice(7).trim()
      : undefined;

  const rawToken = cookieToken || bearerToken;
  if (!rawToken) {
    return next();
  }

  const session = getSessionByRawToken(rawToken);
  if (!session) {
    return next();
  }

  const userRow = getUserById(session.user_id);
  if (!userRow) {
    deleteSessionByRawToken(rawToken);
    return next();
  }

  const authUser = mapUserRowToAuthUser(userRow);
  req.authUser = authUser;
  req.sessionToken = rawToken;
  req.csrfToken = session.csrf_token;
  req.authViaCookie = Boolean(cookieToken && !bearerToken);

  if (authUser.role === 'DESIGNER') {
    req.designerProfile = getDesignerProfileByUserId(authUser.id);
  }

  next();
}

/**
 * Enforces valid authentication, active account status, and CSRF protection on cookie-authenticated mutations.
 * - Returns 401 if unauthenticated or session expired.
 * - Returns 403 and invalidates all sessions if account is SUSPENDED.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.authUser) {
    res.status(401).json({
      error: 'Authentication required. Please sign in to continue.',
      code: 'UNAUTHENTICATED'
    });
    return;
  }

  // Recheck live account status on every protected request
  if (req.authUser.accountStatus === 'SUSPENDED') {
    deleteAllUserSessions(req.authUser.id);
    clearSessionCookie(res);
    res.status(403).json({
      error: 'Your account has been suspended by platform administration.',
      code: 'ACCOUNT_SUSPENDED'
    });
    return;
  }

  // Enforce CSRF token on state-changing requests when using cookie authentication
  const method = req.method.toUpperCase();
  const isMutation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  if (isMutation && req.authViaCookie) {
    const incomingCsrf = req.headers['x-csrf-token'];
    if (!incomingCsrf || incomingCsrf !== req.csrfToken) {
      res.status(403).json({
        error: 'Invalid or missing CSRF token.',
        code: 'CSRF_INVALID'
      });
      return;
    }
  }

  next();
}

/**
 * Enforces canonical role membership ('CUSTOMER' | 'DESIGNER' | 'ADMIN').
 * Returns 403 for authenticated users lacking role permission.
 */
export function requireRole(...allowedRoles: CanonicalRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.authUser) {
      res.status(401).json({
        error: 'Authentication required.',
        code: 'UNAUTHENTICATED'
      });
      return;
    }

    if (req.authUser.accountStatus === 'SUSPENDED') {
      deleteAllUserSessions(req.authUser.id);
      clearSessionCookie(res);
      res.status(403).json({
        error: 'Your account has been suspended by platform administration.',
        code: 'ACCOUNT_SUSPENDED'
      });
      return;
    }

    if (!allowedRoles.includes(req.authUser.role)) {
      res.status(403).json({
        error: `Forbidden: requires role ${allowedRoles.join(' or ')}.`,
        code: 'FORBIDDEN_ROLE'
      });
      return;
    }

    next();
  };
}

/**
 * Enforces that the authenticated user is an ACTIVE DESIGNER whose live
 * designer profile has verificationStatus === 'VERIFIED'.
 * PENDING and REJECTED designers receive 403 Forbidden.
 */
export function requireVerifiedDesigner(req: Request, res: Response, next: NextFunction): void {
  if (!req.authUser) {
    res.status(401).json({
      error: 'Authentication required.',
      code: 'UNAUTHENTICATED'
    });
    return;
  }

  if (req.authUser.accountStatus === 'SUSPENDED') {
    deleteAllUserSessions(req.authUser.id);
    clearSessionCookie(res);
    res.status(403).json({
      error: 'Your account has been suspended by platform administration.',
      code: 'ACCOUNT_SUSPENDED'
    });
    return;
  }

  if (req.authUser.role !== 'DESIGNER') {
    res.status(403).json({
      error: 'Forbidden: requires DESIGNER role.',
      code: 'FORBIDDEN_ROLE'
    });
    return;
  }

  const profile = getDesignerProfileByUserId(req.authUser.id);
  req.designerProfile = profile;

  if (!profile || profile.verificationStatus !== 'VERIFIED') {
    res.status(403).json({
      error:
        'Only ACTIVE, VERIFIED designers may access selling, quotation, product, and order fulfillment operations.',
      code: 'DESIGNER_NOT_VERIFIED',
      verificationStatus: profile?.verificationStatus || 'PENDING',
      rejectionReason: profile?.rejectionReason
    });
    return;
  }

  next();
}
