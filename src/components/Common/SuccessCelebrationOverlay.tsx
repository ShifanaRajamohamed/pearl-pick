import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  PackageCheck, 
  Award, 
  X, 
  ArrowRight, 
  Lock,
  Printer
} from 'lucide-react';
import confetti from 'canvas-confetti';

export type CelebrationType = 'DELIVERED' | 'ESCROW_PAYMENT_CONFIRMED';

export interface SuccessCelebrationOverlayProps {
  isOpen: boolean;
  type: CelebrationType;
  onClose: () => void;
  orderId?: string;
  garmentTitle?: string;
  tailorName?: string;
  amount?: number;
  vaultId?: string;
  onPrimaryAction?: () => void;
  primaryActionLabel?: string;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
}

export function fireCelebrationConfetti() {
  confetti({
    particleCount: 90,
    spread: 80,
    origin: { y: 0.55 },
    colors: ['#8D2434', '#D4AF37', '#1B4332', '#F9F6F2', '#B47B84', '#FBECEF']
  });

  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 50,
      origin: { x: 0.15, y: 0.65 },
      colors: ['#D4AF37', '#8D2434', '#FAF7F2']
    });
  }, 220);

  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 50,
      origin: { x: 0.85, y: 0.65 },
      colors: ['#1B4332', '#D4AF37', '#8D2434']
    });
  }, 380);
}

export const SuccessCelebrationOverlay: React.FC<SuccessCelebrationOverlayProps> = ({
  isOpen,
  type,
  onClose,
  orderId = 'PP-IN-2026-8801',
  garmentTitle = 'Pastel Silk Organza Gown',
  tailorName = 'Ustad Rafiq Ansari',
  amount = 38000,
  vaultId = 'NPCI-ESCROW-2026-8801',
  onPrimaryAction,
  primaryActionLabel,
  onSecondaryAction,
  secondaryActionLabel
}) => {
  useEffect(() => {
    if (isOpen) {
      fireCelebrationConfetti();
    }
  }, [isOpen, type]);

  if (!isOpen) return null;

  const isDelivered = type === 'DELIVERED';

  return (
    <div
      id="celebration-overlay-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        id="celebration-overlay-card"
        initial={{ opacity: 0, scale: 0.85, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="relative w-full max-w-md bg-white rounded-[24px] border border-[#ECE6DE] shadow-2xl overflow-hidden p-6 sm:p-7 text-center space-y-5 my-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF7F2] hover:bg-[#ECE6DE] text-[#7D726A] flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Ambient Top Glow */}
        <div className={`absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 rounded-full blur-3xl pointer-events-none ${
          isDelivered ? 'bg-[#8D2434]/15' : 'bg-emerald-500/15'
        }`} />

        {/* Animated Badge Icon */}
        <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.2, 1] }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg ${
              isDelivered 
                ? 'bg-gradient-to-tr from-[#8D2434] via-[#A83244] to-[#D4AF37] text-white' 
                : 'bg-gradient-to-tr from-[#1B4332] via-[#2D6A4F] to-[#52B788] text-white'
            }`}
          >
            {isDelivered ? (
              <PackageCheck className="w-10 h-10 text-white" />
            ) : (
              <ShieldCheck className="w-10 h-10 text-white" />
            )}
          </motion.div>

          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
            className="absolute -top-1 -right-1 text-[#D4AF37]"
          >
            <Sparkles className="w-6 h-6 fill-[#D4AF37]" />
          </motion.div>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-1.5 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-[#FAF7F2] border border-[#ECE6DE] text-[#7D726A]">
            <Award className="w-3 h-3 text-[#D4AF37]" />
            {isDelivered ? 'Couture Delivery Confirmed' : 'Bharat Escrow Secured'}
          </div>

          <h2 className="font-serif text-2xl font-bold text-[#2D2825] tracking-tight">
            {isDelivered ? 'Garment Delivered & Verified!' : 'Payment Locked in Escrow!'}
          </h2>

          <p className="text-xs text-[#7D726A] max-w-sm mx-auto font-light leading-relaxed">
            {isDelivered
              ? `Your bespoke creation has arrived and been verified. Escrow balance of ₹${amount.toLocaleString('en-IN')} is safely disbursed to ${tailorName}.`
              : `₹${amount.toLocaleString('en-IN')} is locked securely under 100% Buyer Protection in Bharat Escrow Vault.`}
          </p>
        </div>

        {/* Order / Vault Credential Card */}
        <div className="bg-[#FAF7F2] rounded-[18px] border border-[#ECE6DE] p-4 text-left space-y-2.5">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-[#ECE6DE]">
            <span className="text-[#7D726A] font-light">
              {isDelivered ? 'Order Identifier' : 'Escrow Vault ID'}
            </span>
            <span className="font-mono font-bold text-[#2D2825]">
              {isDelivered ? `#${orderId}` : vaultId}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#7D726A] font-light">Garment</span>
            <span className="font-medium text-[#2D2825] truncate max-w-[200px]">
              {garmentTitle}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#7D726A] font-light">Master Tailor</span>
            <span className="font-medium text-[#2D2825]">{tailorName}</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-2 border-t border-[#ECE6DE]">
            <span className="text-[#7D726A] font-light">Amount</span>
            <span className="font-bold text-sm text-[#2D2825]">
              ₹{amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Trust Note */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#7D726A]">
          <Lock className="w-3.5 h-3.5 text-[#8D2434]" />
          <span>
            {isDelivered 
              ? 'Guaranteed bespoke fit • Handcrafted warranty active' 
              : 'Zero upfront risk: Funds released only upon doorstep fit approval'}
          </span>
        </div>

        {/* Actions */}
        <div className="pt-2 flex flex-col gap-2">
          <button
            onClick={() => {
              if (onPrimaryAction) {
                onPrimaryAction();
              } else {
                onClose();
              }
            }}
            className="w-full py-3.5 rounded-[16px] bg-[#2D2825] hover:bg-[#1A1715] active:scale-[0.99] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <span>{primaryActionLabel || (isDelivered ? 'Rate Tailoring Craft' : 'Track Order Progress')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          {onSecondaryAction && (
            <button
              onClick={onSecondaryAction}
              className="w-full py-2.5 text-xs font-medium text-[#7D726A] hover:text-[#2D2825] transition-colors cursor-pointer"
            >
              {secondaryActionLabel || 'Dismiss'}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
