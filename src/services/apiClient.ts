import {
  AuthUser,
  TailorProfile,
  MarketplaceProduct,
  MeasurementSheet,
  CartItem,
  DressDesign,
  QuotationRequest,
  Order,
  ChatMessage,
  DisputeRecord,
  ApprovalAuditLog,
  DesignerOrderStatus,
  Review
} from '../types';
import { CanonicalRole, AccountStatus, DesignerVerificationStatus } from '../types/rbac';

let inMemoryCsrfToken: string | null = null;
let onUnauthorizedOrSuspendedCallback: ((reason: 'UNAUTHENTICATED' | 'ACCOUNT_SUSPENDED') => void) | null = null;

export function setCsrfToken(token: string | null) {
  inMemoryCsrfToken = token;
}

export function getCsrfToken(): string | null {
  return inMemoryCsrfToken;
}

export function onSessionInvalidated(cb: (reason: 'UNAUTHENTICATED' | 'ACCOUNT_SUSPENDED') => void) {
  onUnauthorizedOrSuspendedCallback = cb;
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined)
  };

  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && inMemoryCsrfToken) {
    headers['X-CSRF-Token'] = inMemoryCsrfToken;
  }

  const res = await fetch(path, {
    ...options,
    credentials: 'include',
    headers
  });

  let data: any = null;
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    if (res.status === 403 && data?.code === 'ACCOUNT_SUSPENDED' && onUnauthorizedOrSuspendedCallback) {
      onUnauthorizedOrSuspendedCallback('ACCOUNT_SUSPENDED');
    }
    const err: any = new Error(data?.error || `Request failed with status ${res.status}`);
    err.status = res.status;
    err.code = data?.code;
    err.data = data;
    throw err;
  }

  if (data?.csrfToken) {
    inMemoryCsrfToken = data.csrfToken;
  }

  return data as T;
}

export const apiClient = {
  // Public Catalog
  getPublicCatalog: () =>
    apiRequest<{ products: MarketplaceProduct[]; designers: TailorProfile[] }>('/api/public/catalog'),

  // Auth & Session
  getMe: () =>
    apiRequest<{ user: AuthUser; designerProfile: TailorProfile | null; csrfToken: string }>('/api/auth/me'),

  login: (payload: { phoneOrEmail: string; password: string; role?: CanonicalRole }) =>
    apiRequest<{
      user: AuthUser;
      designerProfile: TailorProfile | null;
      csrfToken: string;
      token: string;
    }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  register: (payload: {
    name: string;
    phone: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'DESIGNER';
    city?: string;
    shopName?: string;
    specialties?: string[];
    experienceYears?: number;
    pricingRange?: string;
    portfolioUrl?: string;
    verificationId?: string;
  }) =>
    apiRequest<{
      user: AuthUser;
      designerProfile: TailorProfile | null;
      csrfToken: string;
      token: string;
    }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  logout: () =>
    apiRequest<{ ok: boolean }>('/api/auth/logout', {
      method: 'POST'
    }),

  // Customer Protected API
  getCustomerBootstrap: () =>
    apiRequest<{
      profile: AuthUser;
      measurements: MeasurementSheet | null;
      wishlistIds: string[];
      cartItems: CartItem[];
      designs: DressDesign[];
      quotationRequests: QuotationRequest[];
      orders: Order[];
      conversations: ChatMessage[];
    }>('/api/customer/bootstrap'),

  updateCustomerProfile: (payload: {
    name?: string;
    city?: string;
    avatar?: string;
    savedAddresses?: string[];
  }) =>
    apiRequest<{ user: AuthUser }>('/api/customer/profile', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  saveCustomerMeasurements: (measurements: MeasurementSheet) =>
    apiRequest<{ measurements: MeasurementSheet }>('/api/customer/measurements', {
      method: 'PUT',
      body: JSON.stringify(measurements)
    }),

  saveCustomerWishlist: (wishlistIds: string[]) =>
    apiRequest<{ wishlistIds: string[] }>('/api/customer/wishlist', {
      method: 'PUT',
      body: JSON.stringify({ wishlistIds })
    }),

  saveCustomerCart: (cartItems: CartItem[]) =>
    apiRequest<{ cartItems: CartItem[] }>('/api/customer/cart', {
      method: 'PUT',
      body: JSON.stringify({ cartItems })
    }),

  saveCustomerDesign: (design: DressDesign) =>
    apiRequest<{ design: DressDesign }>('/api/customer/designs', {
      method: 'POST',
      body: JSON.stringify(design)
    }),

  toggleCustomerDesignFavorite: (designId: string, isFavorite?: boolean) =>
    apiRequest<{ design: DressDesign }>(`/api/customer/designs/${encodeURIComponent(designId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ isFavorite })
    }),

  deleteCustomerDesign: (designId: string) =>
    apiRequest<{ deleted: boolean; id: string }>(`/api/customer/designs/${encodeURIComponent(designId)}`, {
      method: 'DELETE'
    }),

  createCustomerRequest: (payload: {
    designId: string;
    variation: any;
    targetBudget: number;
    neededByDate: string;
    specificInstructions: string;
    preferredTailorId?: string;
    selectedStandardSize?: string;
  }) =>
    apiRequest<{ quotationRequest: QuotationRequest }>('/api/customer/requests', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  negotiateCustomerRequest: (
    requestId: string,
    payload: { quoteId: string; action: 'counter' | 'agree'; amount?: number; note?: string }
  ) =>
    apiRequest<{ quotationRequest: QuotationRequest }>(
      `/api/customer/requests/${encodeURIComponent(requestId)}/negotiate`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),

  createCustomerOrder: (payload: {
    orderType: 'tailor' | 'ready-to-wear';
    items?: CartItem[];
    shippingAddress?: string;
    paymentMethod?: string;
    transactionId?: string;
    requestId?: string;
    quoteId?: string;
  }) =>
    apiRequest<{ orders: Order[]; quotationRequest?: QuotationRequest }>('/api/customer/orders', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  confirmCustomerOrderDelivery: (orderId: string) =>
    apiRequest<{ order: Order }>(`/api/customer/orders/${encodeURIComponent(orderId)}/confirm-delivery`, {
      method: 'POST'
    }),

  submitCustomerOrderReview: (orderId: string, review: Omit<Review, 'id' | 'createdAt'>) =>
    apiRequest<{ order: Order; review: Review }>(
      `/api/customer/orders/${encodeURIComponent(orderId)}/review`,
      {
        method: 'POST',
        body: JSON.stringify(review)
      }
    ),

  // Designer API (PENDING / REJECTED / VERIFIED)
  getDesignerMe: () =>
    apiRequest<{
      user: AuthUser;
      profile: TailorProfile;
      verificationStatus: DesignerVerificationStatus;
      rejectionReason: string | null;
    }>('/api/designer/me'),

  updateDesignerApplication: (payload: Partial<TailorProfile> & { resubmit?: boolean }) =>
    apiRequest<{
      profile: TailorProfile;
      verificationStatus: DesignerVerificationStatus;
      rejectionReason: string | null;
    }>('/api/designer/application', {
      method: 'PUT',
      body: JSON.stringify(payload)
    }),

  // Verified Designer Workspace API
  getVerifiedDesignerWorkspace: () =>
    apiRequest<{
      profile: TailorProfile;
      products: MarketplaceProduct[];
      incomingRequests: QuotationRequest[];
      activeOrders: Order[];
      conversations: ChatMessage[];
      earnings: { totalEarningsINR: number; completedOrdersCount: number };
    }>('/api/designer/workspace'),

  createDesignerProduct: (product: Partial<MarketplaceProduct>) =>
    apiRequest<{ product: MarketplaceProduct }>('/api/designer/products', {
      method: 'POST',
      body: JSON.stringify(product)
    }),

  updateDesignerProduct: (productId: string, product: Partial<MarketplaceProduct>) =>
    apiRequest<{ product: MarketplaceProduct }>(
      `/api/designer/products/${encodeURIComponent(productId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(product)
      }
    ),

  deleteDesignerProduct: (productId: string) =>
    apiRequest<{ deleted: boolean; id: string }>(
      `/api/designer/products/${encodeURIComponent(productId)}`,
      {
        method: 'DELETE'
      }
    ),

  submitDesignerQuote: (requestId: string, quote: any) =>
    apiRequest<{ quotationRequest: QuotationRequest }>(
      `/api/designer/requests/${encodeURIComponent(requestId)}/quote`,
      {
        method: 'POST',
        body: JSON.stringify(quote)
      }
    ),

  updateDesignerRequestStatus: (requestId: string, status: string, note?: string) =>
    apiRequest<{ quotationRequest: QuotationRequest }>(
      `/api/designer/requests/${encodeURIComponent(requestId)}/status`,
      {
        method: 'POST',
        body: JSON.stringify({ status, note })
      }
    ),

  negotiateDesignerRequest: (
    requestId: string,
    payload: {
      quoteId: string;
      action: 'counter' | 'agree';
      amount?: number;
      note?: string;
      isFinalOffer?: boolean;
    }
  ) =>
    apiRequest<{ quotationRequest: QuotationRequest }>(
      `/api/designer/requests/${encodeURIComponent(requestId)}/negotiate`,
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    ),

  advanceDesignerOrderStatus: (orderId: string, nextStatus: DesignerOrderStatus) =>
    apiRequest<{ order: Order }>(`/api/designer/orders/${encodeURIComponent(orderId)}/status`, {
      method: 'POST',
      body: JSON.stringify({ nextStatus })
    }),

  completeDesignerOrderMilestone: (orderId: string, milestoneId: string, photoProofUrl?: string) =>
    apiRequest<{ order: Order }>(`/api/designer/orders/${encodeURIComponent(orderId)}/milestone`, {
      method: 'POST',
      body: JSON.stringify({ milestoneId, photoProofUrl })
    }),

  // Conversations
  sendMessage: (payload: {
    orderId?: string;
    recipientId?: string;
    content: string;
    type?: string;
    attachmentData?: any;
  }) =>
    apiRequest<{ message: ChatMessage }>('/api/conversations', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Admin Governance API
  getAdminDashboard: () =>
    apiRequest<{
      users: AuthUser[];
      tailors: TailorProfile[];
      products: MarketplaceProduct[];
      orders: Order[];
      disputes: DisputeRecord[];
      auditLogs: ApprovalAuditLog[];
      commissionRate: number;
    }>('/api/admin/dashboard'),

  verifyAdminDesigner: (
    designerId: string,
    status: 'VERIFIED' | 'REJECTED' | 'PENDING' | 'REVOKED',
    reason: string
  ) =>
    apiRequest<{ profile: TailorProfile; auditLog: ApprovalAuditLog }>(
      `/api/admin/designers/${encodeURIComponent(designerId)}/verify`,
      {
        method: 'POST',
        body: JSON.stringify({ status, reason })
      }
    ),

  updateAdminUserStatus: (userId: string, accountStatus: AccountStatus, reason: string) =>
    apiRequest<{ user: AuthUser; auditLog: ApprovalAuditLog }>(
      `/api/admin/users/${encodeURIComponent(userId)}/status`,
      {
        method: 'POST',
        body: JSON.stringify({ accountStatus, reason })
      }
    ),

  moderateAdminProduct: (
    productId: string,
    moderationStatus: 'APPROVED' | 'FLAGGED' | 'REMOVED',
    reason?: string
  ) =>
    apiRequest<{ product: MarketplaceProduct; auditLog: ApprovalAuditLog }>(
      `/api/admin/products/${encodeURIComponent(productId)}/moderate`,
      {
        method: 'POST',
        body: JSON.stringify({ moderationStatus, reason })
      }
    ),

  resolveAdminDispute: (
    disputeId: string,
    resolution: 'RESOLVED_REFUND' | 'RESOLVED_RELEASE',
    reason: string
  ) =>
    apiRequest<{ dispute: DisputeRecord; auditLog: ApprovalAuditLog }>(
      `/api/admin/disputes/${encodeURIComponent(disputeId)}/resolve`,
      {
        method: 'POST',
        body: JSON.stringify({ resolution, reason })
      }
    ),

  releaseAdminOrderEscrow: (orderId: string, reason?: string) =>
    apiRequest<{ order: Order; auditLog: ApprovalAuditLog }>(
      `/api/admin/orders/${encodeURIComponent(orderId)}/release-escrow`,
      {
        method: 'POST',
        body: JSON.stringify({ reason })
      }
    ),

  updateAdminCommissionRate: (commissionRate: number, reason?: string) =>
    apiRequest<{ commissionRate: number; auditLog: ApprovalAuditLog }>(
      '/api/admin/settings/commission',
      {
        method: 'POST',
        body: JSON.stringify({ commissionRate, reason })
      }
    )
};
