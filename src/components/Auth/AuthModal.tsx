import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Smartphone, 
  Lock, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  ArrowRight, 
  UserCheck,
  Scissors,
  Crown,
  UserPlus,
  LogIn,
  Wifi,
  WifiOff
} from 'lucide-react';
import { AuthUser, UserRole } from '../../types';
import { DEMO_USERS } from '../../data/mockData';
import { offlineSyncManager } from '../../services/offlineSync';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthUser) => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialRole = 'customer'
}) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [mobileNumber, setMobileNumber] = useState('9820154321');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Sign up fields
  const [fullName, setFullName] = useState('Ananya Verma');
  const [city, setCity] = useState('Mumbai, Maharashtra');
  const [role, setRole] = useState<UserRole>(initialRole);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleMobilePasswordLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const cleanNumber = mobileNumber.replace(/\D/g, '');
    if (cleanNumber.length < 10) {
      setErrorMessage('Please enter a valid 10-digit Indian mobile number');
      return;
    }
    if (!password || password.length < 4) {
      setErrorMessage('Password must be at least 4 characters');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // Check against demo accounts or existing registered users
      const cleanTarget = cleanNumber.slice(-10);
      const matchedUser = DEMO_USERS.find(u => u.phone.replace(/\D/g, '').endsWith(cleanTarget));

      if (matchedUser) {
        if (rememberMe) {
          try {
            localStorage.setItem('pearl_pick_saved_mobile', cleanTarget);
          } catch {}
        }
        onLoginSuccess(matchedUser);
        onClose();
        return;
      }

      // If logging in with any other valid 10-digit number & password, generate authenticated session
      const newUser: AuthUser = {
        id: `user-${cleanTarget}`,
        name: fullName || 'Couture Patron',
        phone: `+91 ${cleanTarget}`,
        email: `${cleanTarget}@pearlpick.in`,
        role: role,
        avatar: role === 'tailor'
          ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80'
          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        city: city || 'Mumbai, Maharashtra',
        walletBalanceINR: role === 'tailor' ? 120000 : 50000
      };

      // If offline, enqueue offline authentication action
      if (!offlineSyncManager.effectiveOnline) {
        offlineSyncManager.enqueue(
          'ORDER_UPDATED',
          `Mobile Login Session (${cleanTarget})`,
          { userId: newUser.id, phone: newUser.phone, loginTime: new Date().toISOString() }
        );
      }

      onLoginSuccess(newUser);
      onClose();
    }, 600);
  };

  const handleQuickFill = (user: AuthUser, demoPass: string) => {
    const rawNumber = user.phone.replace(/\D/g, '').slice(-10);
    setMobileNumber(rawNumber);
    setPassword(demoPass);
    setRole(user.role);
    setErrorMessage('');
  };

  return (
    <div 
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/65 backdrop-blur-sm overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div 
        id="auth-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 12 }}
        className="w-full max-w-md bg-[#FFFDF9] rounded-3xl shadow-2xl border border-[#E8DFC8] overflow-hidden my-auto relative"
      >
        {/* Top Decorative Banner */}
        <div className="relative bg-gradient-to-br from-[#3D2C24] via-[#523B30] to-[#251A14] p-5 sm:p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#D4AF37]/10 rounded-full blur-2xl pointer-events-none" />
          
          <button 
            id="close-auth-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#D4AF37] flex items-center justify-center shadow-md">
              <Sparkles className="w-4 h-4 text-[#3D2C24]" />
            </div>
            <span className="text-[11px] font-bold tracking-widest uppercase text-[#D4AF37]">
              PEARL PICK! BESPOKE ATELIER
            </span>
          </div>

          <h2 className="text-2xl font-serif font-bold text-[#FAF7F2]">
            {mode === 'login' ? 'Mobile Number & Password' : 'Create Couture Account'}
          </h2>
          <p className="text-xs text-[#FAF7F2]/80 mt-1">
            {mode === 'login' 
              ? 'Enter your registered Indian mobile number and password to access your designs.'
              : 'Join India’s premier master tailoring network with bespoke measurements & escrow.'}
          </p>

          {/* Offline indicator in header */}
          {!offlineSyncManager.effectiveOnline && (
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full text-[11px] text-amber-200">
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline Login Mode — Accessing cached credentials</span>
            </div>
          )}
        </div>

        {/* Quick Demo Credentials Bar */}
        <div className="bg-[#F5EFEB] px-4 py-2.5 border-b border-[#E8DFC8] flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">
            1-Tap Demo Credentials:
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              id="demo-login-customer"
              onClick={() => handleQuickFill(DEMO_USERS[0], 'password123')}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white hover:bg-[#3D2C24] hover:text-white border border-[#D9CEBA] font-semibold text-[#5A4638] transition-all"
              title="Ananya Verma (Customer)"
            >
              👩 Customer
            </button>
            <button
              type="button"
              id="demo-login-darzi"
              onClick={() => handleQuickFill(DEMO_USERS[1], 'darzi123')}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white hover:bg-[#D4AF37] hover:text-[#3D2C24] border border-[#D9CEBA] font-semibold text-[#5A4638] transition-all"
              title="Ustad Rafiq Ahmed (Master Darzi)"
            >
              🪡 Darzi
            </button>
            <button
              type="button"
              id="demo-login-admin"
              onClick={() => handleQuickFill(DEMO_USERS[2], 'admin123')}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white hover:bg-[#C72C48] hover:text-white border border-[#D9CEBA] font-semibold text-[#5A4638] transition-all"
              title="Vikramaditya (Super Admin)"
            >
              👑 Admin
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 sm:p-6">
          {errorMessage && (
            <div className="p-3 mb-4 text-xs text-[#C72C48] bg-[#C72C48]/10 rounded-xl border border-[#C72C48]/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#C72C48]"></span>
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleMobilePasswordLogin} className="space-y-4">
            {/* If Sign Up mode, show Name & City */}
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-[#5A4638] mb-1">
                    Full Name
                  </label>
                  <input
                    id="signup-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Diya Sengupta"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-sm text-[#3D2C24] focus:outline-none focus:ring-2 focus:ring-[#C72C48]/30"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-[#5A4638] mb-1">
                      Account Type
                    </label>
                    <select
                      id="signup-role-select"
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-xs font-medium text-[#3D2C24] focus:outline-none"
                    >
                      <option value="customer">Customer</option>
                      <option value="tailor">Master Darzi</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#5A4638] mb-1">
                      City
                    </label>
                    <input
                      id="signup-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. New Delhi"
                      className="w-full px-3 py-2.5 rounded-xl border border-[#D9CEBA] bg-white text-xs text-[#3D2C24] focus:outline-none"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Mobile Number Input */}
            <div>
              <label className="block text-xs font-semibold text-[#5A4638] mb-1">
                Indian Mobile Number
              </label>
              <div className="flex rounded-xl border border-[#D9CEBA] bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-[#C72C48]/30 focus-within:border-[#C72C48]">
                <span className="px-3.5 py-2.5 bg-[#FAF7F2] border-r border-[#D9CEBA] text-xs font-bold text-[#5A4638] flex items-center gap-1.5 select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </span>
                <input 
                  id="auth-mobile-input"
                  type="tel"
                  required
                  maxLength={10}
                  value={mobileNumber}
                  onChange={(e) => setMobileNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="98201 54321"
                  className="w-full px-3.5 py-2.5 text-sm font-semibold tracking-wider text-[#3D2C24] bg-transparent outline-none"
                />
              </div>
              <p className="text-[10px] text-[#8C7A6B] mt-1">
                Enter 10-digit mobile number (Demo: 9820154321)
              </p>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-[#5A4638]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => alert("For testing, demo passwords are: 'password123', 'darzi123', 'admin123'")}
                  className="text-[10px] text-[#C72C48] hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative flex rounded-xl border border-[#D9CEBA] bg-white overflow-hidden shadow-xs focus-within:ring-2 focus-within:ring-[#C72C48]/30 focus-within:border-[#C72C48]">
                <span className="px-3 py-2.5 text-[#8C7A6B]">
                  <Lock className="w-4 h-4" />
                </span>
                <input 
                  id="auth-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your account password"
                  className="w-full px-2 py-2.5 text-sm text-[#3D2C24] bg-transparent outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-3 py-2.5 text-[#8C7A6B] hover:text-[#3D2C24]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Security */}
            <div className="flex items-center justify-between pt-1 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-[#6B584C]">
                <input 
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-[#D9CEBA] text-[#C72C48] focus:ring-[#C72C48]"
                />
                <span className="text-[11px] font-medium">Keep me signed in (Offline sync ready)</span>
              </label>
            </div>

            {/* Submit CTA */}
            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2 ${
                isLoading 
                  ? 'bg-[#8C7A6B] text-white cursor-wait' 
                  : 'bg-[#C72C48] hover:bg-[#A91E38] text-white active:scale-[0.99]'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{mode === 'login' ? 'Sign In with Mobile' : 'Create Account & Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle between Login and Signup */}
          <div className="mt-5 text-center border-t border-[#E8DFC8] pt-4">
            {mode === 'login' ? (
              <p className="text-xs text-[#8C7A6B]">
                Don't have a Couture account yet?{' '}
                <button
                  type="button"
                  id="switch-to-signup-btn"
                  onClick={() => { setMode('signup'); setErrorMessage(''); }}
                  className="font-bold text-[#C72C48] hover:underline ml-1"
                >
                  Register in 30 Seconds
                </button>
              </p>
            ) : (
              <p className="text-xs text-[#8C7A6B]">
                Already registered with us?{' '}
                <button
                  type="button"
                  id="switch-to-login-btn"
                  onClick={() => { setMode('login'); setErrorMessage(''); }}
                  className="font-bold text-[#C72C48] hover:underline ml-1"
                >
                  Sign In with Mobile & Password
                </button>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
