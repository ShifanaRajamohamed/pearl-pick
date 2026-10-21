import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  ShieldCheck, 
  CheckCircle2, 
  Smartphone, 
  QrCode, 
  Lock, 
  ArrowRight,
  Sparkles,
  IndianRupee
} from 'lucide-react';
import { TailorQuotation } from '../../types';
import { fireCelebrationConfetti, SuccessCelebrationOverlay } from '../Common/SuccessCelebrationOverlay';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quotation: TailorQuotation;
  onPaymentSuccess: (vaultId: string) => void;
}

export const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({
  isOpen,
  onClose,
  quotation,
  onPaymentSuccess
}) => {
  const [paymentMode, setPaymentMode] = useState<'apps' | 'qr' | 'upi_id'>('apps');
  const [selectedApp, setSelectedApp] = useState('gpay');
  const [upiIdInput, setUpiIdInput] = useState('ananya@okhdfcbank');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [vaultId, setVaultId] = useState('');

  const [showCelebrationOverlay, setShowCelebrationOverlay] = useState(false);

  if (!isOpen) return null;

  const handlePayNow = () => {
    setIsProcessing(true);
    const newVaultId = `NPCI-ESCROW-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setVaultId(newVaultId);

    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      setShowCelebrationOverlay(true);
      fireCelebrationConfetti();
    }, 1200);
  };

  const handleCelebrationProceed = () => {
    setShowCelebrationOverlay(false);
    onPaymentSuccess(vaultId);
    onClose();
  };

  return (
    <div 
      id="upi-payment-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <motion.div 
        id="upi-payment-modal-card"
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-md bg-[#FFFDF9] rounded-2xl shadow-2xl border border-[#E8DFC8] overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-[#1B4332] via-[#2D6A4F] to-[#1B4332] p-5 text-white">
          {!isProcessing && !isSuccess && (
            <button 
              id="close-upi-modal-btn"
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-bold tracking-widest uppercase px-2 py-0.5 rounded bg-white/20 text-white flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-300" />
              NPCI UPI SECURED ESCROW
            </span>
          </div>

          <div className="flex justify-between items-end mt-2">
            <div>
              <div className="text-xs text-white/80">Total Payable to Escrow</div>
              <div className="text-2xl font-bold font-serif text-[#D4AF37] flex items-center">
                ₹{quotation.totalAmount.toLocaleString('en-IN')}
              </div>
            </div>
            <div className="text-right text-[11px] text-white/80">
              <div>Master Darzi:</div>
              <div className="font-semibold text-white">{quotation.tailorName}</div>
            </div>
          </div>
        </div>

        {/* Modal content */}
        <div className="p-5 space-y-4">
          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#3D2C24]">Escrow Vault Locked!</h3>
              <p className="text-xs text-[#5A4638] max-w-xs mx-auto">
                ₹{quotation.totalAmount.toLocaleString('en-IN')} has been safely deposited in escrow vault <span className="font-mono font-bold text-emerald-700">{vaultId}</span>. Funds are only released as master tailor completes milestones.
              </p>
              <div className="text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg inline-block font-semibold">
                Order PP-IN-2026-8801 is now active!
              </div>
            </div>
          ) : (
            <>
              {/* Tabs: UPI Apps / QR Code / UPI ID */}
              <div className="grid grid-cols-3 gap-1 bg-[#FAF7F2] p-1 rounded-xl border border-[#E8DFC8]">
                <button
                  id="tab-upi-apps"
                  type="button"
                  onClick={() => setPaymentMode('apps')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    paymentMode === 'apps' ? 'bg-white shadow-sm text-[#3D2C24]' : 'text-[#8C7A6B]'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  UPI Apps
                </button>
                <button
                  id="tab-upi-qr"
                  type="button"
                  onClick={() => setPaymentMode('qr')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    paymentMode === 'qr' ? 'bg-white shadow-sm text-[#3D2C24]' : 'text-[#8C7A6B]'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  Scan QR
                </button>
                <button
                  id="tab-upi-id"
                  type="button"
                  onClick={() => setPaymentMode('upi_id')}
                  className={`py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1 ${
                    paymentMode === 'upi_id' ? 'bg-white shadow-sm text-[#3D2C24]' : 'text-[#8C7A6B]'
                  }`}
                >
                  VPA / ID
                </button>
              </div>

              {paymentMode === 'apps' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5A4638]">Choose your UPI App</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'gpay', name: 'Google Pay', icon: '🟢' },
                      { id: 'phonepe', name: 'PhonePe', icon: '🟣' },
                      { id: 'paytm', name: 'Paytm UPI', icon: '🔵' },
                      { id: 'bhim', name: 'BHIM UPI', icon: '🟠' }
                    ].map((app) => (
                      <button
                        key={app.id}
                        id={`app-btn-${app.id}`}
                        type="button"
                        onClick={() => setSelectedApp(app.id)}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 transition-all ${
                          selectedApp === app.id
                            ? 'border-[#1B4332] bg-[#1B4332]/5 ring-1 ring-[#1B4332]'
                            : 'border-[#E8DFC8] bg-white hover:bg-[#FAF7F2]'
                        }`}
                      >
                        <span className="text-lg">{app.icon}</span>
                        <span className="text-xs font-semibold text-[#3D2C24]">{app.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMode === 'qr' && (
                <div className="p-4 bg-white rounded-xl border border-[#E8DFC8] text-center space-y-2">
                  <div className="w-36 h-36 mx-auto bg-gray-100 rounded-lg p-2 flex items-center justify-center border-2 border-dashed border-[#1B4332]/40">
                    <QrCode className="w-28 h-28 text-[#1B4332]" />
                  </div>
                  <p className="text-[11px] text-[#5A4638]">
                    Scan using any UPI App (GPay, PhonePe, Paytm, CRED)
                  </p>
                  <div className="text-[10px] font-mono text-[#8C7A6B]">
                    UPI ID: pearlpick.escrow@icici
                  </div>
                </div>
              )}

              {paymentMode === 'upi_id' && (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-[#5A4638]">Enter Your UPI ID (VPA)</label>
                  <input 
                    type="text"
                    value={upiIdInput}
                    onChange={(e) => setUpiIdInput(e.target.value)}
                    placeholder="yourname@okaxis"
                    className="w-full px-3 py-2.5 text-xs font-medium border border-[#D9CEBA] bg-white rounded-xl outline-none focus:ring-2 focus:ring-[#1B4332]/30"
                  />
                  <p className="text-[11px] text-[#8C7A6B]">
                    A payment request will be sent to your UPI app for approval.
                  </p>
                </div>
              )}

              {/* Escrow guarantee notice */}
              <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] text-[11px] text-[#5A4638] space-y-1">
                <div className="font-bold flex items-center gap-1 text-[#1B4332]">
                  <Lock className="w-3.5 h-3.5" />
                  100% Buyer Protection & Milestone Releases
                </div>
                <p>
                  Your money is not paid directly to the tailor. It stays protected in the Pearl Pick! Escrow Vault until you verify fabric sourcing, first fitting, and final delivery.
                </p>
              </div>

              {/* Submit button */}
              <button
                id="execute-upi-pay-btn"
                type="button"
                disabled={isProcessing}
                onClick={handlePayNow}
                className="w-full py-3.5 bg-[#1B4332] hover:bg-[#143225] text-white rounded-xl text-xs font-semibold tracking-wider uppercase transition-all shadow-md flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin text-sm">⏳</span>
                    Locking Escrow ₹{quotation.totalAmount.toLocaleString('en-IN')}...
                  </>
                ) : (
                  <>
                    Pay & Lock Escrow ₹{quotation.totalAmount.toLocaleString('en-IN')}
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </motion.div>

      {/* Success Celebration Overlay with Confetti */}
      <SuccessCelebrationOverlay
        isOpen={showCelebrationOverlay}
        type="ESCROW_PAYMENT_CONFIRMED"
        amount={quotation.totalAmount}
        vaultId={vaultId}
        tailorName={quotation.tailorName}
        garmentTitle="Custom Bespoke Commission"
        onClose={handleCelebrationProceed}
        onPrimaryAction={handleCelebrationProceed}
        primaryActionLabel="Track Order Progress"
        onSecondaryAction={handleCelebrationProceed}
        secondaryActionLabel="Close Receipt"
      />
    </div>
  );
};
