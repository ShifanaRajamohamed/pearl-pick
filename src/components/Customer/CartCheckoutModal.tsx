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
  MapPin,
  Tag,
  Check,
  ChevronRight,
  Building,
  Home,
  Clock,
  RotateCcw,
  Percent
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
  onViewOrders?: () => void;
}

interface PromoCoupon {
  code: string;
  label: string;
  discountType: 'percentage' | 'fixed';
  discountValue: number;
  minOrder: number;
  maxDiscount?: number;
}

const AVAILABLE_COUPONS: PromoCoupon[] = [
  {
    code: 'PEARLFIRST',
    label: '15% OFF for new shoppers',
    discountType: 'percentage',
    discountValue: 15,
    minOrder: 1500,
    maxDiscount: 2500
  },
  {
    code: 'MYNTRA500',
    label: 'Flat ₹500 OFF on orders above ₹2,000',
    discountType: 'fixed',
    discountValue: 500,
    minOrder: 2000
  },
  {
    code: 'FESTIVE10',
    label: '10% OFF Festive Couture',
    discountType: 'percentage',
    discountValue: 10,
    minOrder: 3000,
    maxDiscount: 4000
  }
];

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
  customerName = 'Ananya Verma',
  onViewOrders
}) => {
  // Steps: 'cart' -> 'address' -> 'payment' -> 'success'
  const [step, setStep] = useState<'cart' | 'address' | 'payment' | 'success'>('cart');
  
  // Addresses
  const [savedAddresses, setSavedAddresses] = useState<string[]>([
    defaultAddress,
    'Tower 4, DLF Magnolias, Golf Course Road, Gurugram - 122002'
  ]);
  const [selectedAddressIndex, setSelectedAddressIndex] = useState(0);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddressInput, setNewAddressInput] = useState({
    name: customerName,
    phone: '+91 98201 54321',
    pincode: '400050',
    flat: '',
    street: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Home' as 'Home' | 'Office'
  });

  // Coupons
  const [appliedCoupon, setAppliedCoupon] = useState<PromoCoupon | null>(AVAILABLE_COUPONS[0]); // Default PEARLFIRST applied for a delightful first-time shopper experience!
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState<string | null>(null);

  // Delivery Pincode
  const [deliveryPincode, setDeliveryPincode] = useState('400050');
  const [pincodeCheckMode, setPincodeCheckMode] = useState(false);
  const [pincodeInputValue, setPincodeInputValue] = useState('400050');

  // Payment Selection
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'CARD' | 'NETBANKING' | 'COD'>('UPI');
  const [selectedUpiApp, setSelectedUpiApp] = useState<'gpay' | 'phonepe' | 'paytm' | 'id'>('gpay');
  const [customUpiId, setCustomUpiId] = useState('ananya.verma@okaxis');
  const [cardDetails, setCardDetails] = useState({
    number: '4532 •••• •••• 8912',
    name: customerName,
    expiry: '08/29',
    cvv: '•••'
  });
  const [selectedBank, setSelectedBank] = useState('HDFC Bank');
  const [codCaptcha, setCodCaptcha] = useState('7429');
  const [codInput, setCodInput] = useState('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [lastOrderRef, setLastOrderRef] = useState<string>('');
  const [lastOrderId, setLastOrderId] = useState<string>('');

  if (!isOpen) return null;

  // Pricing Calculations (Amazon / Myntra Style)
  const totalMRP = cartItems.reduce((sum, item) => {
    const original = item.product.originalPrice || Math.round(item.product.price * 1.25);
    return sum + original * item.quantity;
  }, 0);

  const subtotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const discountOnMRP = totalMRP - subtotal;

  // Coupon Calculation
  let couponDiscount = 0;
  if (appliedCoupon && subtotal >= appliedCoupon.minOrder) {
    if (appliedCoupon.discountType === 'percentage') {
      const calculated = (subtotal * appliedCoupon.discountValue) / 100;
      couponDiscount = appliedCoupon.maxDiscount ? Math.min(calculated, appliedCoupon.maxDiscount) : calculated;
    } else {
      couponDiscount = appliedCoupon.discountValue;
    }
  }

  const shippingFee = subtotal > 1999 || subtotal === 0 ? 0 : 199;
  const platformFee = 0; // FREE promotional
  const grandTotal = Math.max(0, subtotal - couponDiscount + shippingFee);
  const totalSavings = discountOnMRP + couponDiscount;

  const currentShippingAddress = savedAddresses[selectedAddressIndex] || defaultAddress;

  const handleApplyCoupon = (coupon: PromoCoupon) => {
    if (subtotal < coupon.minOrder) {
      setCouponError(`Minimum order amount of ₹${coupon.minOrder.toLocaleString('en-IN')} required for ${coupon.code}`);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponError(null);
  };

  const handleApplyCouponCode = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponInput.trim().toUpperCase();
    const found = AVAILABLE_COUPONS.find((c) => c.code === clean);
    if (found) {
      handleApplyCoupon(found);
      setCouponInput('');
    } else {
      setCouponError('Invalid coupon code. Try PEARLFIRST or MYNTRA500');
    }
  };

  const handleAddNewAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddressInput.flat || !newAddressInput.street) return;
    const formatted = `${newAddressInput.flat}, ${newAddressInput.street}, ${newAddressInput.city}, ${newAddressInput.state} - ${newAddressInput.pincode} (${newAddressInput.type})`;
    setSavedAddresses([...savedAddresses, formatted]);
    setSelectedAddressIndex(savedAddresses.length);
    setShowAddAddressForm(false);
  };

  const handleProceedToPayment = async () => {
    if (cartItems.length === 0) return;

    setIsProcessing(true);
    const orderId = `PP-ORD-${Date.now().toString().slice(-6)}`;
    const txnRef = `UTR${Date.now().toString().slice(-8)}`;
    setLastOrderId(orderId);
    setLastOrderRef(txnRef);

    try {
      await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: grandTotal,
          orderType: 'ready-to-wear',
          customerAgreed: true,
          designerAgreed: true
        })
      });
    } catch {
      // Proceed gracefully with mock transaction
    }

    setTimeout(() => {
      setIsProcessing(false);
      onCompleteCheckout(cartItems, currentShippingAddress, paymentMethod, txnRef);
      setStep('success');
    }, 700);
  };

  const handleCloseModal = () => {
    setStep('cart');
    onClose();
  };

  return (
    <div
      id="cart-checkout-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-end"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseModal();
      }}
    >
      <div className="bg-[#FAF7F2] w-full max-w-xl h-full flex flex-col justify-between shadow-2xl border-l border-[#E4D9D1] overflow-hidden animate-in slide-in-from-right duration-250">
        {/* TOP HEADER WITH MULTI-STEP BREADCRUMBS */}
        <div className="px-6 py-4 bg-white border-b border-[#E4D9D1] shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#2D2825] text-white flex items-center justify-center shadow-2xs">
                <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#2D2825] leading-tight">
                  {step === 'cart' && `Shopping Bag (${cartItems.reduce((a, b) => a + b.quantity, 0)})`}
                  {step === 'address' && 'Select Delivery Address'}
                  {step === 'payment' && 'Select Payment Option'}
                  {step === 'success' && 'Order Placed Successfully'}
                </h2>
                <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#7D726A] mt-0.5 font-bold">
                  <span className={step === 'cart' ? 'text-[#8D2434]' : 'text-[#7D726A]'}>1. Bag</span>
                  <span>→</span>
                  <span className={step === 'address' ? 'text-[#8D2434]' : 'text-[#7D726A]'}>2. Address</span>
                  <span>→</span>
                  <span className={step === 'payment' ? 'text-[#8D2434]' : 'text-[#7D726A]'}>3. Payment</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleCloseModal}
              className="w-8 h-8 rounded-full hover:bg-[#FAF7F2] flex items-center justify-center text-[#7D726A] hover:text-[#2D2825] transition-colors cursor-pointer border border-transparent hover:border-[#E4D9D1]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* BODY CONTAINER */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* ================= STEP 1: SHOPPING BAG ================= */}
          {step === 'cart' && (
            <>
              {cartItems.length === 0 ? (
                <div className="text-center py-20 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-white border border-[#E4D9D1] flex items-center justify-center mx-auto text-[#7D726A] shadow-xs">
                    <ShoppingBag className="w-8 h-8 text-[#8D2434]" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-serif text-lg font-bold text-[#2D2825]">Your Shopping Bag is Empty</h3>
                    <p className="text-xs text-[#7D726A] max-w-xs mx-auto">
                      Explore couture ready-to-wear pieces handcrafted by verified ateliers or create a 3-view custom piece.
                    </p>
                  </div>
                  <button
                    onClick={handleCloseModal}
                    className="px-6 py-2.5 rounded-full bg-[#2D2825] text-white text-xs font-bold uppercase tracking-wider hover:bg-[#8D2434] transition-colors cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {/* Delivery Pincode Bar (Myntra Style) */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#ECE6DE] flex items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Truck className="w-4 h-4 text-[#8D2434] shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-bold text-[#2D2825] block truncate">
                          Deliver to: <strong className="text-[#8D2434]">{deliveryPincode}</strong>
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold block truncate">
                          ⚡ Free Express Delivery by Tomorrow, 5 PM
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setPincodeCheckMode(!pincodeCheckMode)}
                      className="text-xs font-bold text-[#8D2434] hover:underline cursor-pointer shrink-0"
                    >
                      {pincodeCheckMode ? 'Done' : 'Change'}
                    </button>
                  </div>

                  {pincodeCheckMode && (
                    <div className="p-3 rounded-xl bg-white border border-[#D5C7B8] flex gap-2 animate-in fade-in duration-150">
                      <input
                        type="text"
                        maxLength={6}
                        value={pincodeInputValue}
                        onChange={(e) => setPincodeInputValue(e.target.value)}
                        placeholder="Enter 6-digit Pincode"
                        className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-[#D5C7B8] rounded-lg text-xs font-semibold text-[#2D2825]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (pincodeInputValue.length === 6) {
                            setDeliveryPincode(pincodeInputValue);
                            setPincodeCheckMode(false);
                          }
                        }}
                        className="px-3 py-1.5 rounded-lg bg-[#2D2825] text-white text-xs font-bold cursor-pointer"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {/* Cart Items List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs text-[#7D726A]">
                      <span className="font-semibold text-[#2D2825]">{cartItems.length} Item(s) in Bag</span>
                      <button
                        onClick={onClearCart}
                        className="text-[11px] font-semibold text-[#8D2434] hover:underline cursor-pointer"
                      >
                        Clear All
                      </button>
                    </div>

                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border border-[#ECE6DE] p-4 flex gap-4 shadow-2xs hover:border-[#D5C7B8] transition-all"
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
                                className="text-[#8E847D] hover:text-[#8D2434] p-1 cursor-pointer transition-colors"
                                title="Remove item"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            {/* Size selector pills */}
                            <div className="flex items-center gap-1.5 mt-2">
                              <span className="text-[10px] text-[#7D726A] font-semibold">Size:</span>
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
                            {/* Quantity Controls */}
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
                              <span className="font-serif text-sm font-bold text-[#2D2825] tabular-nums block">
                                ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                              {item.product.originalPrice && (
                                <span className="text-[10px] text-[#8E847D] line-through tabular-nums block">
                                  ₹{(item.product.originalPrice * item.quantity).toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Coupons & Promo Codes Section (Myntra Style) */}
                  <div className="p-4 rounded-2xl bg-white border border-[#ECE6DE] space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-[#8D2434]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                          Coupons & Promotions
                        </span>
                      </div>
                      {appliedCoupon && (
                        <button
                          type="button"
                          onClick={() => setAppliedCoupon(null)}
                          className="text-[11px] font-bold text-[#8D2434] hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    {/* Applied Coupon Banner */}
                    {appliedCoupon ? (
                      <div className="p-3 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-xs font-bold text-emerald-800">{appliedCoupon.code} Applied</span>
                            <p className="text-[11px] text-emerald-700">You saved ₹{couponDiscount.toLocaleString('en-IN')} with this coupon!</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-emerald-700">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    ) : (
                      <form onSubmit={handleApplyCouponCode} className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="Enter coupon code (e.g. PEARLFIRST)"
                          className="flex-1 px-3 py-2 bg-[#FAF7F2] border border-[#D5C7B8] rounded-xl text-xs font-semibold text-[#2D2825] uppercase tracking-wider placeholder:normal-case focus:outline-none focus:border-[#2D2825]"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-bold cursor-pointer"
                        >
                          Apply
                        </button>
                      </form>
                    )}

                    {couponError && (
                      <p className="text-xs text-[#8D2434] font-medium">{couponError}</p>
                    )}

                    {/* Quick Available Coupons List */}
                    {!appliedCoupon && (
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10px] uppercase font-bold text-[#7D726A]">Available for you:</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {AVAILABLE_COUPONS.map((cp) => (
                            <div
                              key={cp.code}
                              onClick={() => handleApplyCoupon(cp)}
                              className="p-2.5 rounded-xl border border-dashed border-[#D5C7B8] hover:border-[#8D2434] bg-[#FAF7F2] hover:bg-white cursor-pointer transition-all flex items-center justify-between"
                            >
                              <div>
                                <span className="text-xs font-bold text-[#8D2434] block">{cp.code}</span>
                                <span className="text-[10px] text-[#7D726A] block">{cp.label}</span>
                              </div>
                              <span className="text-[10px] font-bold text-[#2D2825] underline">Apply</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PRICE DETAILS (Myntra / Amazon Style Order Breakdown) */}
                  <div className="p-4 rounded-2xl bg-white border border-[#ECE6DE] space-y-2.5 shadow-2xs text-xs">
                    <span className="font-bold uppercase tracking-wider text-[11px] text-[#2D2825] block">
                      Price Details ({cartItems.length} Items)
                    </span>

                    <div className="flex justify-between text-[#7D726A]">
                      <span>Total MRP</span>
                      <span className="tabular-nums">₹{totalMRP.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount on MRP</span>
                      <span className="tabular-nums">-₹{discountOnMRP.toLocaleString('en-IN')}</span>
                    </div>

                    {appliedCoupon && couponDiscount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Coupon Discount ({appliedCoupon.code})</span>
                        <span className="tabular-nums">-₹{couponDiscount.toLocaleString('en-IN')}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#7D726A]">
                      <span>Delivery Fee</span>
                      <span className="text-emerald-700 font-bold">
                        {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                      </span>
                    </div>

                    <div className="flex justify-between text-[#7D726A]">
                      <span>Escrow Vault Protection Fee</span>
                      <span className="text-emerald-700 font-bold">FREE</span>
                    </div>

                    <div className="pt-2 border-t border-[#ECE6DE] flex justify-between items-baseline font-bold text-[#2D2825] text-sm">
                      <span>Total Amount</span>
                      <span className="font-serif text-lg tabular-nums">
                        ₹{grandTotal.toLocaleString('en-IN')}
                      </span>
                    </div>

                    {totalSavings > 0 && (
                      <div className="p-2.5 rounded-xl bg-[#F0FDF4] text-emerald-800 text-[11px] font-bold text-center border border-[#BBF7D0]">
                        🎉 You will save ₹{totalSavings.toLocaleString('en-IN')} on this order!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {/* ================= STEP 2: ADDRESS SELECTION ================= */}
          {step === 'address' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                  Select Delivery Address
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                  className="text-xs font-bold text-[#8D2434] hover:underline cursor-pointer"
                >
                  {showAddAddressForm ? 'Cancel' : '+ Add New Address'}
                </button>
              </div>

              {/* Add New Address Form Modal/Drawer */}
              {showAddAddressForm && (
                <form onSubmit={handleAddNewAddress} className="p-4 rounded-2xl bg-white border border-[#8D2434] space-y-3 shadow-sm animate-in fade-in duration-150">
                  <h4 className="text-xs font-bold text-[#2D2825] uppercase tracking-wider">New Delivery Address</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Full Name"
                      required
                      value={newAddressInput.name}
                      onChange={(e) => setNewAddressInput({ ...newAddressInput, name: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="10-digit Phone"
                      required
                      value={newAddressInput.phone}
                      onChange={(e) => setNewAddressInput({ ...newAddressInput, phone: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Flat, House no., Building, Apartment"
                    required
                    value={newAddressInput.flat}
                    onChange={(e) => setNewAddressInput({ ...newAddressInput, flat: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold"
                  />
                  <input
                    type="text"
                    placeholder="Area, Street, Sector, Village"
                    required
                    value={newAddressInput.street}
                    onChange={(e) => setNewAddressInput({ ...newAddressInput, street: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Pincode"
                      required
                      value={newAddressInput.pincode}
                      onChange={(e) => setNewAddressInput({ ...newAddressInput, pincode: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={newAddressInput.city}
                      onChange={(e) => setNewAddressInput({ ...newAddressInput, city: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold"
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={newAddressInput.state}
                      onChange={(e) => setNewAddressInput({ ...newAddressInput, state: e.target.value })}
                      className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <label className="flex items-center gap-1.5 text-xs text-[#2D2825] font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="addrType"
                        checked={newAddressInput.type === 'Home'}
                        onChange={() => setNewAddressInput({ ...newAddressInput, type: 'Home' })}
                      />
                      <span>Home (All day)</span>
                    </label>
                    <label className="flex items-center gap-1.5 text-xs text-[#2D2825] font-semibold cursor-pointer">
                      <input
                        type="radio"
                        name="addrType"
                        checked={newAddressInput.type === 'Office'}
                        onChange={() => setNewAddressInput({ ...newAddressInput, type: 'Office' })}
                      />
                      <span>Office (10 AM - 6 PM)</span>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#2D2825] text-white text-xs font-bold hover:bg-[#8D2434] transition-colors cursor-pointer"
                  >
                    Save & Deliver Here
                  </button>
                </form>
              )}

              {/* Saved Addresses Radio Cards */}
              <div className="space-y-3">
                {savedAddresses.map((addr, idx) => {
                  const isSelected = selectedAddressIndex === idx;
                  return (
                    <div
                      key={addr}
                      onClick={() => setSelectedAddressIndex(idx)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white shadow-2xs ${
                        isSelected
                          ? 'border-[#8D2434] ring-2 ring-[#8D2434]/15'
                          : 'border-[#ECE6DE] hover:border-[#D5C7B8]'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <input
                          type="radio"
                          name="selectedAddress"
                          checked={isSelected}
                          onChange={() => setSelectedAddressIndex(idx)}
                          className="mt-1 accent-[#8D2434] cursor-pointer"
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-[#2D2825]">{customerName}</span>
                            <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#FAF7F2] text-[#7D726A] border border-[#E4D9D1]">
                              {idx === 0 ? 'HOME' : 'OFFICE'}
                            </span>
                            {idx === 0 && (
                              <span className="text-[10px] font-bold text-emerald-700">DEFAULT</span>
                            )}
                          </div>
                          <p className="text-xs text-[#6E6359] leading-relaxed">{addr}</p>
                          <p className="text-[11px] text-[#7D726A] font-medium">Mobile: +91 98201 54321</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Assurance Strip */}
              <div className="p-3.5 rounded-2xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center gap-3">
                <Truck className="w-5 h-5 text-emerald-700 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-emerald-800">Express Atelier Courier Dispatch</p>
                  <p className="text-emerald-700 text-[11px]">Insured garment travel pouch with tamper-evident seal</p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PAYMENT METHOD (Myntra/Amazon) ================= */}
          {step === 'payment' && (
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#2D2825] block">
                Choose Payment Method
              </span>

              {/* Payment Methods Accordion */}
              <div className="space-y-2.5">
                {/* 1. UPI (Recommended) */}
                <div
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    paymentMethod === 'UPI'
                      ? 'border-[#8D2434] ring-2 ring-[#8D2434]/15'
                      : 'border-[#ECE6DE]'
                  }`}
                  onClick={() => setPaymentMethod('UPI')}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="payMethod"
                        checked={paymentMethod === 'UPI'}
                        onChange={() => setPaymentMethod('UPI')}
                        className="accent-[#8D2434] cursor-pointer"
                      />
                      <Smartphone className="w-5 h-5 text-[#8D2434]" />
                      <div>
                        <span className="text-xs font-bold text-[#2D2825] block">
                          UPI (Google Pay, PhonePe, Paytm, BHIM)
                        </span>
                        <span className="text-[11px] text-emerald-700 font-semibold block">
                          Instant Escrow Verification · ₹0 Convenience Fee
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#FAF7F2] text-[#8D2434]">
                      RECOMMENDED
                    </span>
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-4 pt-3 border-t border-[#ECE6DE] space-y-3 animate-in fade-in duration-150">
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'gpay', label: 'Google Pay' },
                          { id: 'phonepe', label: 'PhonePe' },
                          { id: 'paytm', label: 'Paytm UPI' }
                        ].map((app) => (
                          <button
                            key={app.id}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedUpiApp(app.id as any);
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer ${
                              selectedUpiApp === app.id
                                ? 'border-[#8D2434] bg-[#FAF7F2] text-[#8D2434]'
                                : 'border-[#E4D9D1] text-[#2D2825]'
                            }`}
                          >
                            {app.label}
                          </button>
                        ))}
                      </div>

                      <div className="relative">
                        <input
                          type="text"
                          value={customUpiId}
                          onChange={(e) => setCustomUpiId(e.target.value)}
                          placeholder="Or enter UPI ID (e.g. mobile@upi)"
                          className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold text-[#2D2825]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Credit / Debit Cards */}
                <div
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    paymentMethod === 'CARD'
                      ? 'border-[#8D2434] ring-2 ring-[#8D2434]/15'
                      : 'border-[#ECE6DE]'
                  }`}
                  onClick={() => setPaymentMethod('CARD')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === 'CARD'}
                      onChange={() => setPaymentMethod('CARD')}
                      className="accent-[#8D2434] cursor-pointer"
                    />
                    <CreditCard className="w-5 h-5 text-[#8D2434]" />
                    <div>
                      <span className="text-xs font-bold text-[#2D2825] block">
                        Credit / Debit Card
                      </span>
                      <span className="text-[11px] text-[#7D726A] block">
                        Visa, Mastercard, RuPay, Diners Club, Amex
                      </span>
                    </div>
                  </div>

                  {paymentMethod === 'CARD' && (
                    <div className="mt-4 pt-3 border-t border-[#ECE6DE] space-y-2.5 animate-in fade-in duration-150">
                      <input
                        type="text"
                        value={cardDetails.number}
                        onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                        placeholder="Card Number"
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold text-[#2D2825]"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={cardDetails.expiry}
                          onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                          placeholder="MM / YY"
                          className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold text-[#2D2825]"
                        />
                        <input
                          type="password"
                          value={cardDetails.cvv}
                          maxLength={3}
                          onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                          placeholder="CVV"
                          className="px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-semibold text-[#2D2825]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Net Banking */}
                <div
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    paymentMethod === 'NETBANKING'
                      ? 'border-[#8D2434] ring-2 ring-[#8D2434]/15'
                      : 'border-[#ECE6DE]'
                  }`}
                  onClick={() => setPaymentMethod('NETBANKING')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === 'NETBANKING'}
                      onChange={() => setPaymentMethod('NETBANKING')}
                      className="accent-[#8D2434] cursor-pointer"
                    />
                    <Building className="w-5 h-5 text-[#8D2434]" />
                    <div>
                      <span className="text-xs font-bold text-[#2D2825] block">
                        Net Banking
                      </span>
                      <span className="text-[11px] text-[#7D726A] block">
                        All Major Indian Banks Supported
                      </span>
                    </div>
                  </div>

                  {paymentMethod === 'NETBANKING' && (
                    <div className="mt-4 pt-3 border-t border-[#ECE6DE] animate-in fade-in duration-150">
                      <select
                        value={selectedBank}
                        onChange={(e) => setSelectedBank(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-bold text-[#2D2825]"
                      >
                        <option>HDFC Bank</option>
                        <option>ICICI Bank</option>
                        <option>State Bank of India (SBI)</option>
                        <option>Axis Bank</option>
                        <option>Kotak Mahindra Bank</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* 4. Cash on Delivery */}
                <div
                  className={`p-4 rounded-2xl border transition-all cursor-pointer bg-white ${
                    paymentMethod === 'COD'
                      ? 'border-[#8D2434] ring-2 ring-[#8D2434]/15'
                      : 'border-[#ECE6DE]'
                  }`}
                  onClick={() => setPaymentMethod('COD')}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="payMethod"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="accent-[#8D2434] cursor-pointer"
                    />
                    <Wallet className="w-5 h-5 text-[#8D2434]" />
                    <div>
                      <span className="text-xs font-bold text-[#2D2825] block">
                        Cash on Delivery (COD)
                      </span>
                      <span className="text-[11px] text-[#7D726A] block">
                        Pay upon doorstep arrival & inspection
                      </span>
                    </div>
                  </div>

                  {paymentMethod === 'COD' && (
                    <div className="mt-4 pt-3 border-t border-[#ECE6DE] space-y-2 animate-in fade-in duration-150">
                      <p className="text-xs text-[#6E6359]">
                        Enter the captcha code <strong className="text-[#2D2825]">{codCaptcha}</strong> to confirm COD:
                      </p>
                      <input
                        type="text"
                        value={codInput}
                        onChange={(e) => setCodInput(e.target.value)}
                        placeholder={`Enter ${codCaptcha}`}
                        className="w-32 px-3 py-1.5 rounded-xl bg-[#FAF7F2] border border-[#D5C7B8] text-xs font-bold text-[#2D2825]"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Escrow Buyer Protection Strip */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4D9D1] flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#8D2434] shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-[#2D2825]">100% Bharat Escrow Protection</p>
                  <p className="text-[#7D726A] text-[11px]">
                    Your payment is safely held in an RBI-compliant vault. Funds are only transferred to the master atelier after delivery approval.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: ORDER SUCCESS (Amazon Style) ================= */}
          {step === 'success' && (
            <div className="py-6 space-y-6 text-center animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-500 shadow-lg">
                <Check className="w-10 h-10 stroke-[3]" />
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#8D2434] font-bold">
                  Order Confirmed
                </span>
                <h3 className="font-serif text-2xl font-bold text-[#2D2825]">
                  Thank You for Your Order!
                </h3>
                <p className="text-xs text-[#7D726A]">
                  Order ID: <strong className="text-[#2D2825]">{lastOrderId}</strong> · Receipt: {lastOrderRef}
                </p>
              </div>

              {/* Amazon-style Delivery Tracker Bar */}
              <div className="p-4 rounded-2xl bg-white border border-[#ECE6DE] text-left space-y-4 shadow-sm">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-[#2D2825]">Estimated Delivery</span>
                  <span className="text-emerald-700 font-bold">Tomorrow by 5:00 PM</span>
                </div>

                {/* Stepper */}
                <div className="relative flex items-center justify-between pt-2">
                  <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-[#ECE6DE] z-0" />
                  <div className="absolute left-0 w-1/3 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 z-0" />

                  {[
                    { label: 'Ordered', done: true },
                    { label: 'Tailored', done: false },
                    { label: 'Shipped', done: false },
                    { label: 'Delivered', done: false }
                  ].map((st, i) => (
                    <div key={st.label} className="relative z-10 flex flex-col items-center">
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          st.done
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white border-2 border-[#ECE6DE] text-[#7D726A]'
                        }`}
                      >
                        {st.done ? '✓' : i + 1}
                      </div>
                      <span className="text-[10px] font-semibold text-[#2D2825] mt-1">{st.label}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#FAF7F2] text-xs text-[#7D726A] flex justify-between">
                  <span>Delivering to: <strong className="text-[#2D2825]">{currentShippingAddress.split(',')[0]}</strong></span>
                  <span>Amount: <strong className="text-[#2D2825]">₹{grandTotal.toLocaleString('en-IN')}</strong></span>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    handleCloseModal();
                    if (onViewOrders) onViewOrders();
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-bold uppercase tracking-wider cursor-pointer shadow-md"
                >
                  Track Order in My Orders Tab
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="w-full py-2.5 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E2] text-[#2D2825] text-xs font-bold border border-[#E4D9D1] cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>

        {/* STICKY BOTTOM CHECKOUT ACTION BAR */}
        {cartItems.length > 0 && step !== 'success' && (
          <div className="p-4 sm:p-5 bg-white border-t border-[#E4D9D1] flex items-center justify-between gap-4 shrink-0 shadow-lg">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#7D726A] block">
                Total Amount Payable
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold text-[#2D2825] tabular-nums">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
                {totalSavings > 0 && (
                  <span className="text-[10px] font-bold text-emerald-700">
                    Saved ₹{totalSavings.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
            </div>

            {step === 'cart' && (
              <button
                id="cart-proceed-to-address-btn"
                type="button"
                onClick={() => setStep('address')}
                className="py-3 px-6 rounded-xl bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
              >
                <span>Proceed to Address</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            {step === 'address' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="py-3 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#ECE6DE] text-[#2D2825] text-xs font-bold border border-[#E4D9D1] cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="cart-proceed-to-payment-btn"
                  type="button"
                  onClick={() => setStep('payment')}
                  className="py-3 px-6 rounded-xl bg-[#8D2434] hover:bg-[#6E1B28] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md transition-all active:scale-98"
                >
                  <span>Proceed to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {step === 'payment' && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setStep('address')}
                  className="py-3 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#ECE6DE] text-[#2D2825] text-xs font-bold border border-[#E4D9D1] cursor-pointer"
                >
                  Back
                </button>
                <button
                  id="cart-place-order-btn"
                  type="button"
                  disabled={isProcessing}
                  onClick={handleProceedToPayment}
                  className="py-3.5 px-7 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-lg transition-all active:scale-98 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span>Verifying Escrow...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Place Order (₹{grandTotal.toLocaleString('en-IN')})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
