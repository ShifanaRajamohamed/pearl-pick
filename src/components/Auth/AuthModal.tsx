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
import { DEMO_USERS } from '../../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser, newDesignerApplication?: TailorProfile) => void;
  initialRole?: UserRole;
  isFullPagePortal?: boolean;
  onSwitchToDesignerPortal?: () => void;
  onBackToStorefront?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'customer',
  isFullPagePortal = false,
  onSwitchToDesignerPortal,
  onBackToStorefront,
}) => {
  const [selectedPortal, setSelectedPortal] = useState<UserRole>(initialRole);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loginMethod, setLoginMethod] = useState<'otp' | 'password'>('otp');

  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpHint, setOtpHint] = useState('');

  // Credentials
  const [mobileOrEmail, setMobileOrEmail] = useState('9820154321');
  const [password, setPassword] = useState('password123');
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
    setSelectedPortal(initialRole);
    setErrorMessage('');
    setStatusBanner('');
    setOtpSent(false);
    setOtpCode('');
    if (initialRole === 'admin') {
      setMode('login');
      setLoginMethod('password');
      setMobileOrEmail('admin@pearlpick.in');
      setPassword('admin123');
    } else if (initialRole === 'tailor') {
      setLoginMethod('password');
      setMobileOrEmail('9811234567');
      setPassword('darzi123');
    } else {
      setMobileOrEmail('9820154321');
      setPassword('password123');
    }
  }, [initialRole, isOpen]);

  if (!isOpen) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusBanner('');
    const cleanPhone = mobileOrEmail.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number to receive OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      setIsLoading(false);
      if (!res.ok) {
        setErrorMessage(data.error || 'Could not send OTP.');
        return;
      }
      setOtpSent(true);
      setOtpHint(data.otpHint || '4829');
      setOtpCode(data.otpHint || '4829');
      setStatusBanner(`OTP sent to +91 ${cleanPhone}. (Verification code: ${data.otpHint || '4829'})`);
    } catch {
      setIsLoading(false);
      setOtpSent(true);
      setOtpHint('4829');
      setOtpCode('4829');
      setStatusBanner(`OTP sent to +91 ${cleanPhone}. (Verification code: 4829)`);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    const cleanPhone = mobileOrEmail.replace(/\D/g, '').slice(-10);
    if (!otpCode || otpCode.trim().length < 4) {
      setErrorMessage('Please enter the 4-digit OTP.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, otp: otpCode.trim(), name: fullName || undefined }),
      });
      const data = await res.json();
      setIsLoading(false);
      if (!res.ok) {
        setErrorMessage(data.error || 'Invalid OTP.');
        return;
      }
      if (data.token) {
        try {
          localStorage.setItem('pearl_pick_session_token', data.token);
          localStorage.setItem('pearl_pick_session_user', JSON.stringify(data.user));
        } catch {}
      }
      onLoginSuccess(data.user);
      onClose();
    } catch {
      setIsLoading(false);
      const fallbackUser = DEMO_USERS[0];
      onLoginSuccess(fallbackUser);
      onClose();
    }
  };

  const handlePasswordOrRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setStatusBanner('');

    if (selectedPortal === 'admin' && mode === 'signup') {
      setErrorMessage('Admin accounts cannot be publicly registered.');
      return;
    }

    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters.');
      return;
    }

    setIsLoading(true);
    try {
      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
      const cleanPhone = mobileOrEmail.replace(/\D/g, '').slice(-10);
      const payload =
        mode === 'login'
          ? {
              phoneOrEmail: mobileOrEmail.includes('@') ? mobileOrEmail.trim() : cleanPhone,
              password,
              role: selectedPortal,
            }
          : {
              name: fullName || (selectedPortal === 'tailor' ? 'Aarav Singhania' : 'Diya Sengupta'),
              phone: cleanPhone || '9820154321',
              email: email || `${cleanPhone || 'member'}@pearlpick.in`,
              password,
              role: selectedPortal,
              city,
              shopName: selectedPortal === 'tailor' ? shopName : undefined,
              specialties:
                selectedPortal === 'tailor'
                  ? specialization.split(',').map((s) => s.trim())
                  : undefined,
              experienceYears: selectedPortal === 'tailor' ? Number(experienceYears) : undefined,
              pricingRange: selectedPortal === 'tailor' ? pricingRange : undefined,
              portfolioUrl: selectedPortal === 'tailor' ? portfolioUrl : undefined,
              verificationId: selectedPortal === 'tailor' ? verificationId : undefined,
            };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setIsLoading(false);

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed. Please check your credentials.');
        return;
      }

      if (data.token) {
        try {
          localStorage.setItem('pearl_pick_session_token', data.token);
          localStorage.setItem('pearl_pick_session_user', JSON.stringify(data.user));
        } catch {}
      }

      let createdTailor: TailorProfile | undefined;
      if (data.designerApplication) {
        createdTailor = {
          id: data.designerApplication.id,
          userId: data.designerApplication.userId,
          name: data.designerApplication.name,
          shopName: data.designerApplication.shopName,
          avatar: data.user.avatar,
          coverImage: portfolioUrl,
          city: data.designerApplication.city,
          state: data.designerApplication.state || 'Maharashtra',
          country: 'India',
          experienceYears: data.designerApplication.experienceYears,
          verificationStatus: 'PENDING',
          rating: 4.8,
          reviewCount: 1,
          completedOrders: 0,
          specialties: data.designerApplication.specialties,
          bio: `Bespoke designer studio specializing in ${specialization}.`,
          badge: 'Couturier',
          startingPrice: 8500,
          pricingRange,
          averageTurnaroundDays: 14,
          portfolio: [
            {
              id: `port-${Date.now()}`,
              title: 'Signature Bridal & Couture Piece',
              category: 'Bridal Couture',
              imageUrl: portfolioUrl,
              completionTimeDays: 14,
              price: 24000,
              description: specialization,
              customerRating: 5.0,
            },
          ],
          shopAddress: city,
          phone: data.user.phone,
          equipment: ['Industrial Juki Lockstitch', 'Hand Zardozi Adda Frame'],
          certifications: [verificationId],
        };
      }

      onLoginSuccess(data.user, createdTailor);
      onClose();
    } catch {
      setIsLoading(false);
      const fallback =
        DEMO_USERS.find((u) => u.role === selectedPortal) || DEMO_USERS[0];
      onLoginSuccess(fallback);
      onClose();
    }
  };

  const cardContent = (
    <div className="w-full max-w-md bg-white rounded-2xl border border-[#ECE6DE] shadow-2xl overflow-hidden text-[#2D2825]">
      {/* Top Promotional / Portal Banner */}
      {selectedPortal === 'customer' ? (
        <div className="relative bg-[#FAF7F2] border-b border-[#ECE6DE] px-6 py-5 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#8D2434] block">
              PEARL PICK ACCOUNT
            </span>
            <h2 className="font-serif text-xl font-bold text-[#2D2825] mt-0.5">
              {mode === 'login' ? 'Login or Sign Up' : 'Create Customer Account'}
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
      ) : selectedPortal === 'tailor' ? (
        <div className="bg-[#2D2825] text-white px-6 py-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#D4AF37]">
              <Scissors className="w-3.5 h-3.5" />
              <span>Designer & Tailor Seller Portal (/designer/login)</span>
            </div>
            <h2 className="font-serif text-xl font-bold text-white mt-1">
              {mode === 'login' ? 'Designer Partner Login' : 'Apply as a Verified Designer'}
            </h2>
            <p className="text-xs text-white/75 mt-0.5">
              Manage collections, respond to custom dress requests & negotiate quotes
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
              Restricted to platform governance & designer verification officers
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

        {/* Mode Switcher (Login vs Sign Up) — Hidden for Admin */}
        {selectedPortal !== 'admin' && (
          <div className="flex items-center p-1 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] text-xs font-bold">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login'
                  ? 'bg-white text-[#2D2825] shadow-2xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              {selectedPortal === 'tailor' ? 'Designer Login' : 'Existing Customer Login'}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#2D2825] text-white shadow-2xs'
                  : 'text-[#7D726A] hover:text-[#2D2825]'
              }`}
            >
              {selectedPortal === 'tailor' ? 'Submit Designer Application' : 'New Customer Sign Up'}
            </button>
          </div>
        )}

        {/* CUSTOMER LOGIN METHOD TOGGLE: OTP vs PASSWORD (like Myntra) */}
        {selectedPortal === 'customer' && mode === 'login' && (
          <div className="flex items-center gap-4 border-b border-[#ECE6DE] pb-2 text-xs">
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
              <span>Login with Mobile OTP</span>
            </button>
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
              <span>Email / Password</span>
            </button>
          </div>
        )}

        {/* OTP LOGIN FLOW (Customer) */}
        {selectedPortal === 'customer' && mode === 'login' && loginMethod === 'otp' ? (
          <form onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6E6359] mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center rounded-xl border border-[#D6C7B8] bg-white overflow-hidden focus-within:border-[#8D2434]">
                <span className="px-3 py-2.5 bg-[#FAF7F2] text-xs font-bold text-[#6E6359] border-r border-[#ECE6DE]">
                  +91
                </span>
                <input
                  type="tel"
                  value={mobileOrEmail}
                  onChange={(e) => {
                    setMobileOrEmail(e.target.value);
                    setOtpSent(false);
                  }}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3 py-2.5 text-sm text-[#2D2825] focus:outline-none"
                  required
                />
              </div>
            </div>

            {otpSent && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#6E6359]">
                    Enter 4-Digit OTP
                  </label>
                  {otpHint && (
                    <span className="text-[11px] text-[#8D2434] font-semibold">
                      Demo OTP: {otpHint}
                    </span>
                  )}
                </div>
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="4829"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D6C7B8] text-sm font-bold tracking-[0.3em] text-center focus:outline-none focus:border-[#8D2434]"
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#8D2434] hover:bg-[#731D2A] text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
            >
              {isLoading
                ? 'Please wait...'
                : otpSent
                ? 'Verify OTP & Continue Shopping'
                : 'Continue with OTP'}
            </button>
          </form>
        ) : (
          /* EMAIL / MOBILE + PASSWORD OR SIGNUP FORM */
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
                      selectedPortal === 'tailor' ? 'Master Karigar / Designer Name' : 'Your Full Name'
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
                placeholder="9820154321 or email@domain.com"
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
                  placeholder="••••••••"
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

            {/* DESIGNER / TAILOR APPLICATION FIELDS */}
            {selectedPortal === 'tailor' && mode === 'signup' && (
              <div className="p-3.5 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] space-y-3">
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8D2434]">
                  Atelier & Verification Details (Requires Admin Approval)
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
                  ? selectedPortal === 'admin'
                    ? 'Sign In to Admin Portal'
                    : selectedPortal === 'tailor'
                    ? 'Sign In to Designer Portal'
                    : 'Sign In'
                  : selectedPortal === 'tailor'
                  ? 'Submit Application for Admin Approval'
                  : 'Create Account & Continue'}
              </span>
            </button>
          </form>
        )}

        {/* Quick Demo Credentials Helper for Immediate Testing */}
        <div className="pt-3 border-t border-[#ECE6DE] space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-wider text-[#7D726A]">
            Instant Demo Fill ({selectedPortal === 'customer' ? 'Customer' : selectedPortal === 'tailor' ? 'Designer' : 'Admin'})
          </p>
          {selectedPortal === 'customer' && (
            <button
              type="button"
              onClick={() => {
                onLoginSuccess(DEMO_USERS[0]);
                onClose();
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE9E2] border border-[#E4D9D1] text-xs font-semibold text-[#2D2825] flex items-center justify-between cursor-pointer"
            >
              <span>One-Tap Sign In as Ananya Verma (Customer)</span>
              <span className="text-[10px] font-bold text-[#8D2434]">Instant Login →</span>
            </button>
          )}

          {selectedPortal === 'tailor' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onLoginSuccess(DEMO_USERS[1]);
                  onClose();
                }}
                className="py-2 px-2.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE9E2] border border-[#E4D9D1] text-[11px] font-semibold text-[#2D2825] text-left cursor-pointer"
              >
                <span className="block font-bold">Ustad Rafiq Ahmed</span>
                <span className="text-[10px] text-emerald-700">Approved Designer →</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode('signup');
                  setStatusBanner('Fill application below to test Pending Admin Approval flow.');
                }}
                className="py-2 px-2.5 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE9E2] border border-[#E4D9D1] text-[11px] font-semibold text-[#2D2825] text-left cursor-pointer"
              >
                <span className="block font-bold">New Applicant</span>
                <span className="text-[10px] text-amber-700">Test Approval Gate →</span>
              </button>
            </div>
          )}

          {selectedPortal === 'admin' && (
            <button
              type="button"
              onClick={() => {
                onLoginSuccess(DEMO_USERS[2]);
                onClose();
              }}
              className="w-full py-2 px-3 rounded-lg bg-[#FAF7F2] hover:bg-[#EFE9E2] border border-[#E4D9D1] text-xs font-semibold text-[#2D2825] flex items-center justify-between cursor-pointer"
            >
              <span>Authorize as Vikramaditya Rao (Admin Governance)</span>
              <span className="text-[10px] font-bold text-[#8D2434]">Sign In →</span>
            </button>
          )}
        </div>

        {/* Footer links for switching between Storefront and Seller Portal */}
        <div className="pt-2 border-t border-[#ECE6DE] flex items-center justify-between text-[11px] text-[#7D726A]">
          {selectedPortal === 'customer' ? (
            <button
              type="button"
              onClick={() => {
                if (onSwitchToDesignerPortal) {
                  onSwitchToDesignerPortal();
                } else {
                  setSelectedPortal('tailor');
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
            <Lock className="w-3 h-3" /> SSL Secured
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
