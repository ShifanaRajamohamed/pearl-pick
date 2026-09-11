import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  LogOut, 
  Wallet, 
  MapPin, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Crown, 
  Plus, 
  Check, 
  Sparkles,
  Scissors
} from 'lucide-react';
import { AuthUser } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user?: AuthUser | null;
  currentUser?: AuthUser | null;
  onLogout: () => void;
  onSwitchUser?: () => void;
  onUpdateUser?: (updated: AuthUser) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  currentUser,
  onLogout,
  onSwitchUser,
  onUpdateUser
}) => {
  const activeUser = currentUser || user;

  const [walletAmount, setWalletAmount] = useState<number>(activeUser?.walletBalanceINR ?? 0);
  const [addMoneyInput, setAddMoneyInput] = useState('');
  const [showAddMoney, setShowAddMoney] = useState(false);
  const [addresses, setAddresses] = useState<string[]>(
    activeUser?.savedAddresses || [
      'Flat 802, Sea Green Apartments, Carter Road, Bandra West, Mumbai - 400050',
      'Tower 4, DLF Magnolias, Golf Course Road, Gurugram - 122002'
    ]
  );
  const [newAddress, setNewAddress] = useState('');
  const [showNewAddress, setShowNewAddress] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState('');

  // Sync state if activeUser changes
  React.useEffect(() => {
    if (activeUser) {
      setWalletAmount(activeUser.walletBalanceINR ?? 0);
      if (activeUser.savedAddresses) {
        setAddresses(activeUser.savedAddresses);
      }
    }
  }, [activeUser?.id, activeUser?.walletBalanceINR]);

  if (!isOpen || !activeUser) return null;

  const handleAddFunds = () => {
    const amount = Number(addMoneyInput);
    if (!amount || amount <= 0) return;
    const newTotal = (walletAmount || 0) + amount;
    setWalletAmount(newTotal);
    setAddMoneyInput('');
    setShowAddMoney(false);
    setShowSuccessToast(`₹${amount.toLocaleString('en-IN')} added via UPI!`);
    
    if (onUpdateUser && activeUser) {
      onUpdateUser({
        ...activeUser,
        walletBalanceINR: newTotal
      });
    }

    setTimeout(() => setShowSuccessToast(''), 2500);
  };

  const handleAddAddress = () => {
    if (!newAddress.trim()) return;
    const updatedAddresses = [...addresses, newAddress.trim()];
    setAddresses(updatedAddresses);
    setNewAddress('');
    setShowNewAddress(false);
    setShowSuccessToast('Delivery address saved!');

    if (onUpdateUser && activeUser) {
      onUpdateUser({
        ...activeUser,
        savedAddresses: updatedAddresses
      });
    }

    setTimeout(() => setShowSuccessToast(''), 2500);
  };

  return (
    <div 
      id="profile-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div 
        id="profile-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-lg bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#E8DFC8] overflow-hidden my-auto"
      >
        {/* Header with User Info */}
        <div className="relative bg-gradient-to-r from-[#3D2C24] via-[#5A3828] to-[#2E1D16] p-6 text-white">
          <button 
            id="close-profile-modal-btn"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <div className="relative">
              <img 
                src={activeUser.avatar} 
                alt={activeUser.name} 
                className="w-16 h-16 rounded-full object-cover border-2 border-[#D4AF37] shadow-lg"
              />
              <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                <Check className="w-3 h-3 text-white" />
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-serif font-bold text-white">{activeUser.name}</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#D4AF37] text-[#3D2C24]">
                  {activeUser.role === 'customer' ? 'Bespoke Client' : activeUser.role === 'tailor' ? 'Master Darzi' : 'Super Admin'}
                </span>
              </div>
              <p className="text-xs text-[#FAF7F2]/80 mt-0.5 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                {activeUser.city}
              </p>
              <div className="flex items-center gap-3 text-[11px] text-[#FAF7F2]/70 mt-1">
                <span className="flex items-center gap-1">
                  <Phone className="w-3 h-3" />
                  {activeUser.phone}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {activeUser.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-5">
          {showSuccessToast && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              {showSuccessToast}
            </div>
          )}

          {/* Pearl Pick! Escrow Wallet */}
          <div className="bg-[#FAF7F2] p-4 rounded-xl border border-[#E8DFC8]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-[#C72C48]/10 flex items-center justify-center text-[#C72C48]">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#8C7A6B] uppercase tracking-wider">
                    NPCI UPI Escrow Wallet
                  </div>
                  <div className="text-xl font-bold text-[#3D2C24]">
                    ₹{(walletAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <button
                id="toggle-add-money-btn"
                onClick={() => setShowAddMoney(!showAddMoney)}
                className="px-3 py-1.5 bg-[#C72C48] text-white text-xs font-semibold rounded-lg hover:bg-[#A91E38] transition-colors flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add via UPI
              </button>
            </div>

            {showAddMoney && (
              <div className="mt-3 pt-3 border-t border-[#E8DFC8] flex gap-2">
                <input 
                  type="number"
                  placeholder="Amount in ₹ (e.g. 10000)"
                  value={addMoneyInput}
                  onChange={(e) => setAddMoneyInput(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs border border-[#D9CEBA] bg-white rounded-lg outline-none"
                />
                <button
                  id="confirm-add-money-btn"
                  onClick={handleAddFunds}
                  className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700"
                >
                  Pay via UPI
                </button>
              </div>
            )}
          </div>

          {/* Saved Addresses (India) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5A4638] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#C72C48]" />
                Saved Delivery Addresses in India
              </span>
              <button
                id="add-address-toggle-btn"
                onClick={() => setShowNewAddress(!showNewAddress)}
                className="text-xs text-[#C72C48] font-semibold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3 h-3" />
                Add Address
              </button>
            </div>

            <div className="space-y-2">
              {addresses.map((addr, index) => (
                <div 
                  key={index}
                  className="p-3 bg-white border border-[#E8DFC8] rounded-xl text-xs text-[#3D2C24] flex items-start justify-between"
                >
                  <div>
                    <span className="inline-block px-1.5 py-0.5 bg-[#FAF7F2] border border-[#D9CEBA] text-[10px] font-bold text-[#8C7A6B] rounded mr-2 mb-1">
                      {index === 0 ? 'Primary' : `Address ${index + 1}`}
                    </span>
                    <p className="font-medium leading-relaxed">{addr}</p>
                  </div>
                </div>
              ))}

              {showNewAddress && (
                <div className="p-3 bg-white border border-[#D4AF37] rounded-xl space-y-2">
                  <textarea 
                    rows={2}
                    placeholder="Enter full street, apartment/house, landmark, city, and 6-digit Pincode"
                    value={newAddress}
                    onChange={(e) => setNewAddress(e.target.value)}
                    className="w-full text-xs p-2 border border-[#D9CEBA] rounded-lg outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setShowNewAddress(false)}
                      className="px-3 py-1 text-xs text-[#8C7A6B] hover:text-[#3D2C24]"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddAddress}
                      className="px-3 py-1 bg-[#C72C48] text-white text-xs font-semibold rounded-lg hover:bg-[#A91E38]"
                    >
                      Save Address
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Switch User & Logout */}
          <div className="pt-4 border-t border-[#E8DFC8] grid grid-cols-2 gap-3">
            <button
              id="profile-switch-user-btn"
              type="button"
              onClick={() => {
                onClose();
                if (onSwitchUser) {
                  onSwitchUser();
                }
              }}
              className="py-2.5 px-4 rounded-xl border border-[#3D2C24] text-[#3D2C24] hover:bg-[#3D2C24] hover:text-white text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Switch Profile
            </button>

            <button
              id="profile-logout-btn"
              type="button"
              onClick={() => {
                onLogout();
                onClose();
              }}
              className="py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-semibold tracking-wider transition-all flex items-center justify-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
