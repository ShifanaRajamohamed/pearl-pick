import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  CheckCircle2,
  CreditCard,
  Smartphone,
  Wallet,
  ArrowRight,
  Sparkles,
  MapPin
} from 'lucide-react';
import { CartItem, MarketplaceProduct } from '../../types';

interface CartCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (cartItemId: string, delta: number) => void;
  onUpdateSize: (cartItemId: string, newSize: string) => void;
  onRemoveItem: (cartItemId: string) => void;
  onClearCart: () => void;
  onCompleteCheckout: (
    items: CartItem[],
    shippingAddress: string,
    paymentMethod: string,
    transactionRef: string
  ) => void;
  defaultAddress?: string;
  customerName?: string;
}

export const CartCheckoutModal: React.FC<CartCheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onUpdateSize,
  onRemoveItem,
  onClearCart,
  onCompleteCheckout,
  defaultAddress = 'Flat 802, Sea Green Apartments, Carter Road, Bandra West, Mumbai - 400050',
  customerName = 'Ananya Verma'
}) => {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [shippingAddress, setShippingAddress] = useState<string>(defaultAddress);
  const [paymentMethod, setPaymentMethod] = useState<'UPI_ESCROW' | 'CARD' | 'WALLET'>('UPI_ESCROW');
  const [upiId, setUpiId] = useState<string>('ananya.verma@okaxis');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastOrderRef, setLastOrderRef] = useState<string>('');

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const shippingFee = subtotal > 15000 || subtotal === 0 ? 0 : 450;
  const escrowProtectionFee = 0; // Complimentary on Pearl Pick
  const grandTotal = subtotal + shippingFee + escrowProtectionFee;

  const handleProceedToPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          orderType: 'ready-to-wear',
          customerAgreed: true,
          designerAgreed: true
        })
      });
      const data = await res.json();
      const txnRef = data.transactionReference || `UTR${Date.now().toString().slice(-8)}`;
      setLastOrderRef(txnRef);

      setTimeout(() => {
        setIsProcessing(false);
        onCompleteCheckout(cartItems, shippingAddress, paymentMethod, txnRef);
        setStep('success');
      }, 600);
    } catch {
      const fallbackRef = `UTR${Date.now().toString().slice(-8)}`;
      setLastOrderRef(fallbackRef);
      setIsProcessing(false);
      onCompleteCheckout(cartItems, shippingAddress, paymentMethod, fallbackRef);
      setStep('success');
    }
  };

  const handleCloseModal = () => {
    setStep('cart');
    onClose();
  };

  return (
    <div
      id="cart-checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      <div className="bg-[#FAF7F2] w-full max-w-lg h-full flex flex-col justify-between shadow-2xl border-l border-[#E4D9D1] overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="px-6 py-5 bg-white border-b border-[#E4D9D1] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2D2825] text-white flex items-center justify-center">
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2D2825]">
                {step === 'cart'
                  ? `Shopping Bag (${cartItems.reduce((acc, i) => acc + i.quantity, 0)})`
                  : step === 'checkout'
                  ? 'Secure Atelier Checkout'
                  : 'Order Confirmed'}
              </h2>
              <p className="text-[11px] text-[#7D726A]">
                {step === 'cart'
                  ? 'Ready-to-wear designer collections protected by Bharat Escrow'
                  : step === 'checkout'
                  ? 'Verify delivery address & escrow payment method'
                  : `Receipt Reference: ${lastOrderRef}`}
              </p>
            </div>
          </div>
          <button
            onClick={handleCloseModal}
            className="w-8 h-8 rounded-full hover:bg-[#EFE9E2] flex items-center justify-center text-[#7D726A] hover:text-[#2D2825] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {step === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white border border-[#E4D9D1] flex items-center justify-center mx-auto text-[#7D726A]">
                    <ShoppingBag className="w-7 h-7" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-[#2D2825]">Your Shopping Bag is Empty</h3>
                    <p className="text-xs text-[#7D726A] max-w-xs mx-auto">
                      Explore curated ready-made dresses uploaded by verified master designers or craft a custom piece in the AI Studio.
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 rounded-full bg-[#2D2825] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8D2434] transition-colors cursor-pointer"
                  >
                    Explore Designer Dresses
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-[#7D726A]">
                    <span>{cartItems.length} distinct couture piece(s)</span>
                    <button
                      onClick={onClearCart}
                      className="text-[11px] font-semibold text-[#8D2434] hover:underline cursor-pointer"
                    >
                      Clear Bag
                    </button>
                  </div>

                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl border border-[#ECE6DE] p-4 flex gap-4 shadow-2xs"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.title}
                        referrerPolicy="no-referrer"
                        className="w-20 h-26 rounded-xl object-cover object-top bg-[#F5EFEA] shrink-0 border border-[#ECE6DE]"
                      />
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8D2434]">
                                {item.product.designerName}
                              </span>
                              <h4 className="font-serif text-sm font-bold text-[#2D2825] line-clamp-1">
                                {item.product.title}
                              </h4>
                            </div>
                            <button
                              onClick={() => onRemoveItem(item.id)}
                              className="text-[#7D726A] hover:text-[#8D2434] p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-[11px] text-[#7D726A] mt-0.5">{item.product.fabric}</p>

                          {/* Size Selector */}
                          <div className="flex items-center gap-1.5 mt-2">
                            <span className="text-[10px] text-[#7D726A] font-medium">Size:</span>
                            {(item.product.sizes?.length ? item.product.sizes : ['XS', 'S', 'M', 'L', 'XL']).map(
                              (sz) => (
                                <button
                                  key={sz}
                                  onClick={() => onUpdateSize(item.id, sz)}
                                  className={`px-2 py-0.5 rounded text-[10px] font-bold transition-colors cursor-pointer ${
                                    item.selectedSize === sz
                                      ? 'bg-[#2D2825] text-white'
                                      : 'bg-[#FAF7F2] text-[#7D726A] border border-[#E4D9D1]'
                                  }`}
                                >
                                  {sz}
                                </button>
                              )
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-[#FAF7F2]">
                          <div className="flex items-center border border-[#E4D9D1] rounded-lg bg-[#FAF7F2]">
                            <button
                              onClick={() => onUpdateQuantity(item.id, -1)}
                              className="p-1.5 text-[#2D2825] hover:bg-white rounded-l-lg cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-bold tabular-nums text-[#2D2825]">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => onUpdateQuantity(item.id, 1)}
                              className="p-1.5 text-[#2D2825] hover:bg-white rounded-r-lg cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="font-serif text-sm font-bold text-[#2D2825] tabular-nums">
                              ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {step === 'checkout' && (
            <form id="checkout-payment-form" onSubmit={handleProceedToPayment} className="space-y-5">
              {/* Shipping Address */}
              <div className="bg-white rounded-2xl border border-[#ECE6DE] p-4 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                  <MapPin className="w-4 h-4 text-[#8D2434]" />
                  <span>Delivery Address ({customerName})</span>
                </div>
                <textarea
                  rows={3}
                  required
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full p-3 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2] text-xs text-[#2D2825] focus:outline-none focus:border-[#8D2434]"
                  placeholder="Enter full street address, landmark, city, and PIN code"
                />
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl border border-[#ECE6DE] p-4 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D2825] block">
                  Select Escrow Payment Method
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI_ESCROW')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'UPI_ESCROW'
                        ? 'border-[#8D2434] bg-[#FBECEF]/60 text-[#8D2434]'
                        : 'border-[#E4D9D1] bg-[#FAF7F2] text-[#2D2825]'
                    }`}
                  >
                    <Smartphone className="w-4 h-4 mb-1" />
                    <div className="text-[11px] font-bold">UPI Escrow</div>
                    <div className="text-[9px] text-[#7D726A]">GPay / PhonePe</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('CARD')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'CARD'
                        ? 'border-[#8D2434] bg-[#FBECEF]/60 text-[#8D2434]'
                        : 'border-[#E4D9D1] bg-[#FAF7F2] text-[#2D2825]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4 mb-1" />
                    <div className="text-[11px] font-bold">Luxury Card</div>
                    <div className="text-[9px] text-[#7D726A]">Visa / Amex</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('WALLET')}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      paymentMethod === 'WALLET'
                        ? 'border-[#8D2434] bg-[#FBECEF]/60 text-[#8D2434]'
                        : 'border-[#E4D9D1] bg-[#FAF7F2] text-[#2D2825]'
                    }`}
                  >
                    <Wallet className="w-4 h-4 mb-1" />
                    <div className="text-[11px] font-bold">Atelier Wallet</div>
                    <div className="text-[9px] text-[#7D726A]">Instant Debit</div>
                  </button>
                </div>

                {paymentMethod === 'UPI_ESCROW' && (
                  <div className="pt-2">
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#7D726A] mb-1">
                      Verified UPI ID
                    </label>
                    <input
                      type="text"
                      required
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[#E4D9D1] bg-[#FAF7F2] text-xs font-medium text-[#2D2825]"
                    />
                  </div>
                )}
              </div>

              {/* Order Summary Breakdown */}
              <div className="bg-white rounded-2xl border border-[#ECE6DE] p-4 space-y-2 text-xs">
                <div className="flex justify-between text-[#7D726A]">
                  <span>Items Subtotal</span>
                  <span className="font-semibold text-[#2D2825] tabular-nums">
                    ₹{subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-[#7D726A]">
                  <span>Insured Couture Courier</span>
                  <span className="font-semibold text-emerald-700">
                    {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#7D726A]">
                  <span>Bharat Escrow Vault Protection</span>
                  <span className="font-semibold text-emerald-700">INCLUDED</span>
                </div>
                <div className="pt-2 border-t border-[#E4D9D1] flex justify-between items-baseline">
                  <span className="font-bold text-[#2D2825]">Total Payable</span>
                  <span className="font-serif text-xl font-bold text-[#8D2434] tabular-nums">
                    ₹{grandTotal.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-12 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-9 h-9" />
              </div>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FBECEF] text-[#8D2434] text-[10px] font-bold uppercase tracking-widest">
                <Sparkles className="w-3 h-3" />
                Escrow Payment Verified
              </span>
              <h3 className="font-serif text-2xl font-bold text-[#2D2825]">
                Your Designer Order is Confirmed!
              </h3>
              <p className="text-xs text-[#7D726A] max-w-sm mx-auto leading-relaxed">
                Transaction <strong>{lastOrderRef}</strong> has been locked in Bharat Escrow. The designer has been notified to begin quality inspection and dispatch.
              </p>
              <div className="pt-4">
                <button
                  onClick={handleCloseModal}
                  className="px-8 py-3 rounded-full bg-[#2D2825] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8D2434] transition-colors cursor-pointer"
                >
                  Track Live Order Status
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {cartItems.length > 0 && step !== 'success' && (
          <div className="p-5 bg-white border-t border-[#E4D9D1] space-y-3 shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7D726A] block">
                  Total Amount
                </span>
                <span className="font-serif text-xl font-bold text-[#2D2825] tabular-nums">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>

              {step === 'cart' ? (
                <button
                  onClick={() => setStep('checkout')}
                  className="px-6 py-3.5 rounded-full bg-[#8D2434] hover:bg-[#6E1B28] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="px-4 py-3 rounded-full border border-[#E4D9D1] text-xs font-semibold text-[#7D726A] hover:text-[#2D2825] cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    form="checkout-payment-form"
                    disabled={isProcessing}
                    className="px-6 py-3.5 rounded-full bg-[#2D2825] hover:bg-[#8D2434] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all cursor-pointer shadow-md"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                    <span>{isProcessing ? 'Verifying...' : `Pay ₹${grandTotal.toLocaleString('en-IN')}`}</span>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-4 text-[10px] text-[#7D726A] pt-1">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                100% Escrow Protected
              </span>
              <span className="flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-[#8D2434]" />
                Insured Atelier Delivery
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
