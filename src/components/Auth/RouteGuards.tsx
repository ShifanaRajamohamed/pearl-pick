import React from 'react';
import { ShieldAlert, Lock, LogOut, ArrowLeft, Loader2 } from 'lucide-react';
import { AuthUser, TailorProfile } from '../../types';
import { CanonicalRole } from '../../types/rbac';

interface RequireAuthProps {
  currentUser: AuthUser | null;
  isLoadingAuth: boolean;
  unauthenticatedFallback: React.ReactNode;
  onLogout: () => void;
  children: React.ReactNode;
}

/**
 * Reusable Route Guard 1: RequireAuth
 * - Waits for server session validation (`isLoadingAuth`) before rendering protected content.
 * - Blocks unauthenticated guests and renders `unauthenticatedFallback`.
 * - Blocks SUSPENDED accounts immediately.
 */
export const RequireAuth: React.FC<RequireAuthProps> = ({
  currentUser,
  isLoadingAuth,
  unauthenticatedFallback,
  onLogout,
  children
}) => {
  if (isLoadingAuth) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
        <Loader2 className="w-8 h-8 text-[#8D2434] animate-spin mb-3" />
        <p className="font-serif text-base font-bold text-[#2D2825]">
          Verifying Session Security...
        </p>
        <p className="text-xs text-[#7D726A] mt-1">
          Validating credentials and role permissions with the server.
        </p>
      </div>
    );
  }

  if (!currentUser) {
    return <>{unauthenticatedFallback}</>;
  }

  if (currentUser.accountStatus === 'SUSPENDED') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-red-200 p-8 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-50 text-red-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-[#2D2825]">Account Suspended</h2>
          <p className="text-xs text-[#5A4638] leading-relaxed">
            Your account ({currentUser.email}) has been suspended by Platform Administration.
            Protected actions and workspaces are restricted.
          </p>
          <button
            type="button"
            onClick={onLogout}
            className="w-full py-3 rounded-xl bg-[#2D2825] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

interface RequireRoleProps {
  currentUser: AuthUser | null;
  isLoadingAuth: boolean;
  allowedRoles: CanonicalRole[];
  unauthenticatedFallback: React.ReactNode;
  onNavigateHome: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

/**
 * Reusable Route Guard 2: RequireRole
 * - Enforces that the authenticated user has one of `allowedRoles` ('CUSTOMER' | 'DESIGNER' | 'ADMIN').
 * - Prevents cross-role workspace access (e.g., CUSTOMER or DESIGNER attempting /admin).
 */
export const RequireRole: React.FC<RequireRoleProps> = ({
  currentUser,
  isLoadingAuth,
  allowedRoles,
  unauthenticatedFallback,
  onNavigateHome,
  onLogout,
  children
}) => {
  return (
    <RequireAuth
      currentUser={currentUser}
      isLoadingAuth={isLoadingAuth}
      unauthenticatedFallback={unauthenticatedFallback}
      onLogout={onLogout}
    >
      {currentUser && !allowedRoles.includes(currentUser.role) ? (
        <div className="min-h-[70vh] flex items-center justify-center p-6 bg-[#FAF7F2]">
          <div className="max-w-md w-full bg-white rounded-3xl border border-[#ECE6DE] p-8 text-center space-y-4 shadow-sm">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-800 flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8D2434] block">
              403 FORBIDDEN • ROLE ACCESS DENIED
            </span>
            <h2 className="font-serif text-2xl font-bold text-[#2D2825]">
              Insufficient Role Permissions
            </h2>
            <p className="text-xs text-[#5A4638] leading-relaxed">
              You are currently signed in as <strong>{currentUser.name}</strong> with the{' '}
              <strong>{currentUser.role}</strong> role. This workspace is restricted to{' '}
              <strong>{allowedRoles.join(', ')}</strong> accounts.
            </p>
            <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
              <button
                type="button"
                onClick={onNavigateHome}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E2] border border-[#E4D9D1] text-xs font-bold text-[#2D2825] flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Permitted Area</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#8D2434] hover:bg-[#731D2A] text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out & Switch Account</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
    </RequireAuth>
  );
};

interface RequireVerifiedDesignerProps {
  currentUser: AuthUser | null;
  designerProfile: TailorProfile | null;
  isLoadingAuth: boolean;
  unauthenticatedFallback: React.ReactNode;
  unverifiedFallback: React.ReactNode;
  onNavigateHome: () => void;
  onLogout: () => void;
  children: React.ReactNode;
}

/**
 * Reusable Route Guard 3: RequireVerifiedDesigner
 * - Enforces DESIGNER role + ACTIVE account status + VERIFIED designer verification status.
 * - Renders `unverifiedFallback` (restricted Application & Verification Status view) when
 *   designer verificationStatus is PENDING or REJECTED.
 */
export const RequireVerifiedDesigner: React.FC<RequireVerifiedDesignerProps> = ({
  currentUser,
  designerProfile,
  isLoadingAuth,
  unauthenticatedFallback,
  unverifiedFallback,
  onNavigateHome,
  onLogout,
  children
}) => {
  return (
    <RequireRole
      currentUser={currentUser}
      isLoadingAuth={isLoadingAuth}
      allowedRoles={['DESIGNER']}
      unauthenticatedFallback={unauthenticatedFallback}
      onNavigateHome={onNavigateHome}
      onLogout={onLogout}
    >
      {!designerProfile || designerProfile.verificationStatus !== 'VERIFIED' ? (
        <>{unverifiedFallback}</>
      ) : (
        <>{children}</>
      )}
    </RequireRole>
  );
};
