export type CanonicalRole = 'CUSTOMER' | 'DESIGNER' | 'ADMIN';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED';

export type DesignerVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

/**
 * Compatibility mapping for legacy role strings ('customer', 'tailor', 'admin')
 * to canonical RBAC roles ('CUSTOMER', 'DESIGNER', 'ADMIN').
 * Guests are unauthenticated visitors and never map to a stored role.
 */
export function normalizeRole(rawRole: unknown): CanonicalRole | null {
  if (typeof rawRole !== 'string') return null;
  const upper = rawRole.trim().toUpperCase();
  if (upper === 'CUSTOMER') return 'CUSTOMER';
  if (upper === 'DESIGNER' || upper === 'TAILOR') return 'DESIGNER';
  if (upper === 'ADMIN') return 'ADMIN';
  return null;
}

/**
 * Compatibility mapping for account status.
 * Keeps account status ('ACTIVE' | 'SUSPENDED') strictly separate from designer verification.
 */
export function normalizeAccountStatus(rawStatus: unknown): AccountStatus {
  if (typeof rawStatus !== 'string') return 'ACTIVE';
  const upper = rawStatus.trim().toUpperCase();
  if (upper === 'SUSPENDED') return 'SUSPENDED';
  return 'ACTIVE';
}

/**
 * Compatibility mapping for designer verification status.
 * Canonical values: 'PENDING' | 'VERIFIED' | 'REJECTED'.
 */
export function normalizeVerificationStatus(rawStatus: unknown): DesignerVerificationStatus {
  if (typeof rawStatus !== 'string') return 'PENDING';
  const upper = rawStatus.trim().toUpperCase();
  if (upper === 'VERIFIED' || upper === 'APPROVED') return 'VERIFIED';
  if (upper === 'REJECTED' || upper === 'REVOKED' || upper === 'SUSPENDED') return 'REJECTED';
  return 'PENDING';
}

/**
 * Sanitizes a return URL to prevent open redirects and cross-portal privilege confusion.
 */
export function sanitizeReturnUrl(
  rawUrl: unknown,
  portal: 'storefront' | 'designer' | 'admin' = 'storefront'
): string {
  const defaultFallback =
    portal === 'admin' ? '/admin' : portal === 'designer' ? '/designer' : '/';

  if (typeof rawUrl !== 'string' || !rawUrl.trim()) {
    return defaultFallback;
  }

  const trimmed = rawUrl.trim();
  // Must start with a single '/' and never '//' or '/\' or contain protocol schemes
  if (!trimmed.startsWith('/') || trimmed.startsWith('//') || trimmed.startsWith('/\\')) {
    return defaultFallback;
  }

  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return defaultFallback;
  }

  const lower = trimmed.toLowerCase();
  if (portal === 'storefront') {
    if (lower.startsWith('/admin') || lower.startsWith('/designer')) {
      return '/';
    }
    return trimmed;
  }

  if (portal === 'designer') {
    if (!lower.startsWith('/designer') || lower.startsWith('/designer/login') || lower.startsWith('/designer/register')) {
      return '/designer';
    }
    return trimmed;
  }

  if (portal === 'admin') {
    if (!lower.startsWith('/admin') || lower.startsWith('/admin/login')) {
      return '/admin';
    }
    return trimmed;
  }

  return defaultFallback;
}
