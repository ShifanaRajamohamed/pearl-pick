import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Scissors,
  LogIn,
  AlertCircle,
  CheckCircle2,
  Building2,
  MapPin,
  Briefcase,
  Image as ImageIcon,
  FileCheck,
  Smartphone,
  Mail,
  ArrowLeft
} from 'lucide-react';
import { AuthUser, UserRole, TailorProfile } from '../../types';
import { CanonicalRole, normalizeRole } from '../../types/rbac';
import { apiClient, setCsrfToken } from '../../services/apiClient';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, designerProfile?: TailorProfile | null) => void;
  initialRole?: UserRole;
  initialMode?: 'login' | 'signup';
  isFullPagePortal?: boolean;
  onSwitchToDesignerPortal?: () => void;
  onBackToStorefront?: () => void;
  onChangeDesignerMode?: (mode: 'login' | 'signup') => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'CUSTOMER',
  initialMode = 'login',
  isFullPagePortal = false,
  onSwitchToDesignerPortal,
  onBackToStorefront,
  onChangeDesignerMode
}) => {
  const resolvedInitialRole: CanonicalRole = normalizeRole(initialRole) || 'CUSTOMER';
  const [selectedPortal, setSelectedPortal] = useState<CanonicalRole>(resolvedInitialRole);
  const [mode, setMode] = useState<'login' | 'signup'>(
    resolvedInitialRole === 'ADMIN' ? 'login' : initialMode
  );
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');

  // Credentials (no hardcoded admin passwords embedded in frontend code)
  const [mobileOrEmail, setMobileOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Common Sign up fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('Mumbai, Maharashtra');

  // Designer / Tailor specific application fields
  const [shopName, setShopName] = useState('House of Zari & Drape');
  const [specialization, setSpecialization] = useState(
    'Bridal Lehengas, Hand Zardozi & Custom Couture Gowns'
  );
  const [experienceYears, setExperienceYears] = useState('12');
  const [pricingRange, setPricingRange] = useState('₹8,500 – ₹65,000');
  const [portfolioUrl, setPortfolioUrl] = useState(
    'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=800&auto=format&fit=crop&q=80'
  );
  const [verificationId, setVerificationId] = useState('GSTIN-27AADCB2230M1Z2');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [statusBanner, setStatusBanner] = useState('');

  useEffect(() => {
    const nextRole = normalizeRole(initialRole) || 'CUSTOMER';
    setSelectedPortal(nextRole);
    setMode(nextRole === 'ADMIN' ? 'login' : initialMode);
    setLoginMethod('password');
    setErrorMessage('');
    setStatusBanner('');
    setPassword('');
    if (nextRole === 'ADMIN') {
      setMobileOrEmail('');
    } else if (nextRole === 'DESIGNER') {
      setMobileOrEmail('');
    } else {
      setMobileOrEmail('');
    }
  }, [initialRole, initialMode, isOpen]);

  if (!isOpen) return null;

  const handleModeSwitch = (nextMode: 'login' | 'signup') => {
    if (selectedPortal === 'ADMIN') return;
    setMode(nextMode);
    setErrorMessage('');
    setStatusBanner('');
    if (selectedPortal === 'DESIGNER' && onChangeDesignerMode) {
      onChangeDesignerMode(nextMode);
    }
  };

  const handlePasswordOrRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusBanner('');

    if (selectedPortal === 'ADMIN' && mode === 'signup') {
      setErrorMessage('Admin accounts cannot be publicly registered.');
      return;
    }

    if (!mobileOrEmail.trim()) {
      setErrorMessage('Please enter your registered email address or 10-digit mobile number.');
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const cleanPhone = mobileOrEmail.replace(/\D/g, '').slice(-10);
      if (mode === 'login') {
        const data = await apiClient.login({
          phoneOrEmail: mobileOrEmail.includes('@') ? mobileOrEmail.trim() : cleanPhone || mobileOrEmail.trim(),
          password,
          role: selectedPortal
        });
        setCsrfToken(data.csrfToken);
        setIsLoading(false);
        onLoginSuccess(data.user, data.designerProfile);
        onClose();
      } else {
        if (selectedPortal === 'ADMIN') {
          setIsLoading(false);
          setErrorMessage('Admin registration is disabled.');
          return;
        }
        const data = await apiClient.register({
          name: fullName.trim(),
          phone: cleanPhone,
          email: email.trim() || `${cleanPhone}@pearlpick.in`,
          password,
          role: selectedPortal === 'DESIGNER' ? 'DESIGNER' : 'CUSTOMER',
          city,
          shopName: selectedPortal === 'DESIGNER' ? shopName : undefined,
          specialties:
            selectedPortal === 'DESIGNER'
              ? specialization.split(',').map((s) => s.trim()).filter(Boolean)
              : undefined,
          experienceYears: selectedPortal === 'DESIGNER' ? Number(experienceYears) : undefined,
          pricingRange: selectedPortal === 'DESIGNER' ? pricingRange : undefined,
          portfolioUrl: selectedPortal === 'DESIGNER' ? portfolioUrl : undefined,
          verificationId: selectedPortal === 'DESIGNER' ? verificationId : undefined
        });
        setCsrfToken(data.csrfToken);
        setIsLoading(false);
        onLoginSuccess(data.user, data.designerProfile);
        onClose();
      }
    } catch (err: any) {
      setIsLoading(false);
      setErrorMessage(err?.message || 'Authentication failed. Please check your credentials.');
    }
  };

  const cardContent = (
    <div className="w-full max-w-md bg-white rounded-2xl border border-[#ECE6DE] shadow-2xl overflow-hidden text-[#2D2825]">
      {/* Top Portal Banner */}
      {selectedPortal === 'CUSTOMER' ? (
        <div className="relative bg-[#FAF7F2] border-b border-[#ECE6DE] px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8D2434] block">
              PEARL PICK ACCOUNT
            </span>
            <h2 className="font-serif text-xl font-bold text-[#2D2825] mt-0.5">
              {mode === 'login' ? 'Customer Sign In' : 'Create Customer Account'}
            </h2>
            <p className="text-xs text-[#7D726A] mt-0.5">
              Save AI dress designs, manage wishlist & track custom orders
            </p>
          </div>
          {!isFullPagePortal && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white border border-[#ECE6DE] flex items-center justify-center text-[#7D726A] hover:text-[#2D2825] cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : selectedPortal === 'DESIGNER' ? (
        <div className="bg-[#2D2825] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              <Scissors className="w-3.5 h-3.5" />
              <span>
                Designer & Tailor Portal ({mode === 'signup' ? '/designer/register' : '/designer/login'})
              </span>
            </div>
            <h2 className="font-serif text-xl font-bold text-white mt-1">
              {mode === 'login' ? 'Designer Partner Login' : 'Register as a Designer'}
            </h2>
            <p className="text-xs text-white/75 mt-0.5">
              New designer accounts receive PENDING status until verified by Admin
            </p>
          </div>
          {!isFullPagePortal && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="bg-[#8D2434] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#FAF7F2]/90">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrative Governance (/admin/login)</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-white mt-1">
              Authorized Admin Sign In
            </h2>
            <p className="text-xs text-white/80 mt-0.5">
              Restricted to server-provisioned administrator accounts
            </p>
          </div>
          {!isFullPagePortal && (
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white/80 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Body */}
      <div className="p-6 space-y-4 max-h-[78vh] overflow-y-auto">
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {statusBanner && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{statusBanner}</span>
          </div>
        )}

        {/* Mode Switcher (Login vs Sign Up) — Strictly Hidden for Admin */}
        {selectedPortal !== 'ADMIN' && (
          <div className="flex items-center p-1 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] text-xs font-bold">
            <button
              type="button"
              onClick={() => handleModeSwitch('login')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#2D2825] shadow-2xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              {selectedPortal === 'DESIGNER' ? 'Designer Login' : 'Customer Login'}
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch('signup')}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#2D2825] text-white shadow-2xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              {selectedPortal === 'DESIGNER' ? 'Designer Registration' : 'New Customer Sign Up'}
            </button>
          </div>
        )}

        {/* CUSTOMER LOGIN METHOD TOGGLE: PASSWORD vs DISABLED OTP NOTICE */}
        {selectedPortal === 'CUSTOMER' && mode === 'login' && (
          <div className="flex items-center gap-4 border-b border-[#ECE6DE] pb-2 text-xs">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('password');
                setErrorMessage('');
              }}
              className={`pb-1.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                loginMethod === 'password'
                  ? 'border-[#8D2434] text-[#8D2434]'
                  : 'border-transparent text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Email / Mobile + Password</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('otp');
                setErrorMessage('');
              }}
              className={`pb-1.5 font-bold flex items-center gap-1.5 border-b-2 transition-colors cursor-pointer ${
                loginMethod === 'otp'
                  ? 'border-[#8D2434] text-[#8D2434]'
                  : 'border-transparent text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile OTP (Unavailable)</span>
            </button>
          </div>
        )}

        {selectedPortal === 'CUSTOMER' && mode === 'login' && loginMethod === 'otp' ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">SMS OTP Delivery Not Configured</p>
                <p className="mt-1 text-amber-900/90 leading-relaxed">
                  Real SMS OTP delivery is not configured in this environment, so OTP login is disabled for security. Please sign in using your email or 10-digit mobile number and password.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setLoginMethod('password')}
              className="w-full py-2.5 rounded-lg bg-[#2D2825] text-white text-xs font-bold uppercase tracking-wider cursor-pointer"
            >
              Switch to Password Login
            </button>
          </div>
        ) : (
          <form onSubmit={handlePasswordOrRegisterSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6359] mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={
                      selectedPortal === 'DESIGNER'
                        ? 'Master Karigar / Designer Name'
                        : 'Your Full Name'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6C7B8] text-xs focus:outline-none focus:border-[#8D2434]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6359] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6C7B8] text-xs focus:outline-none focus:border-[#8D2434]"
                    required
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6359] mb-1">
                {mode === 'login' ? 'Email or 10-Digit Mobile Number' : '10-Digit Mobile Number'}
              </label>
              <input
                type="text"
                value={mobileOrEmail}
                onChange={(e) => setMobileOrEmail(e.target.value)}
                placeholder="email@domain.com or 10-digit mobile"
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6C7B8] text-xs focus:outline-none focus:border-[#8D2434]"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6359] mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[#D6C7B8] text-xs focus:outline-none focus:border-[#8D2434]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7D726A] hover:text-[#2D2825] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6359] mb-1">
                  City / Location
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#7D726A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-[#D6C7B8] text-xs focus:outline-none focus:border-[#8D2434]"
                    required
                  />
                </div>
              </div>
            )}

            {/* DESIGNER APPLICATION FIELDS */}
            {selectedPortal === 'DESIGNER' && mode === 'signup' && (
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8D2434]">
                  Atelier & Verification Details (Assigned PENDING Until Admin Approval)
                </p>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6E6359] mb-1">
                    Boutique / Atelier Name
                  </label>
                  <div className="relative">
                    <Building2 className="w-3.5 h-3.5 text-[#7D726A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={shopName}
                      onChange={(e) => setShopName(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D6C7B8] bg-white text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6E6359] mb-1">
                    Specializations (comma separated)
                  </label>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-[#D6C7B8] bg-white text-xs"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6E6359] mb-1">
                      Experience (Years)
                    </label>
                    <div className="relative">
                      <Briefcase className="w-3.5 h-3.5 text-[#7D726A] absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="number"
                        min={1}
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-2 rounded-lg border border-[#D6C7B8] bg-white text-xs"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#6E6359] mb-1">
                      Pricing Range
                    </label>
                    <input
                      type="text"
                      value={pricingRange}
                      onChange={(e) => setPricingRange(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-lg border border-[#D6C7B8] bg-white text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6E6359] mb-1">
                    Portfolio Sample Image URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-3.5 h-3.5 text-[#7D726A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D6C7B8] bg-white text-xs"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#6E6359] mb-1">
                    GSTIN / Artisan Verification ID
                  </label>
                  <div className="relative">
                    <FileCheck className="w-3.5 h-3.5 text-[#7D726A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={verificationId}
                      onChange={(e) => setVerificationId(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#D6C7B8] bg-white text-xs"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>
                {isLoading
                  ? 'Authenticating...'
                  : mode === 'login'
                  ? selectedPortal === 'ADMIN'
                    ? 'Sign In to Admin Portal'
                    : selectedPortal === 'DESIGNER'
                    ? 'Sign In to Designer Portal'
                    : 'Sign In'
                  : selectedPortal === 'DESIGNER'
                  ? 'Submit Application (Pending Approval)'
                  : 'Create Account & Continue'}
              </span>
            </button>
          </form>
        )}

        {/* Footer links for switching between Storefront and Seller Portal */}
        <div className="pt-2 border-t border-[#ECE6DE] flex items-center justify-between text-[11px] text-[#7D726A]">
          {selectedPortal === 'CUSTOMER' ? (
            <button
              type="button"
              onClick={() => {
                if (onSwitchToDesignerPortal) {
                  onSwitchToDesignerPortal();
                } else {
                  setSelectedPortal('DESIGNER');
                  setLoginMethod('password');
                }
              }}
              className="hover:text-[#8D2434] underline cursor-pointer"
            >
              Are you a designer or tailor? Sell With Us (/designer/login)
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                if (onBackToStorefront) onBackToStorefront();
                else onClose();
              }}
              className="inline-flex items-center gap-1 hover:text-[#2D2825] font-semibold cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Pearl Pick Shopping Storefront</span>
            </button>
          )}
          <span className="flex items-center gap-1">
            <Lock className="w-3 h-3" /> HttpOnly Session
          </span>
        </div>
      </div>
    </div>
  );

  if (isFullPagePortal) {
    return (
      <div className="min-h-screen bg-[#FAF7F2] flex flex-col items-center justify-center p-4">
        {cardContent}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {cardContent}
    </div>
  );
};
