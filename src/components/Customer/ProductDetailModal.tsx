import React, { useState } from 'react';
import {
  X,
  Heart,
  ShoppingBag,
  ShieldCheck,
  Star,
  Truck,
  RotateCcw,
  Scissors,
  MessageCircle,
  Copy,
  Check,
  Award,
  Layers,
  MapPin,
  Ruler,
  Tag,
  Share2,
  CheckCircle2
} from 'lucide-react';
import { MarketplaceProduct } from '../../types';

interface ProductDetailModalProps {
  product: MarketplaceProduct | null;
  isOpen: boolean;
  onClose: () => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: MarketplaceProduct, selectedSize: string) => void;
  onBuyNow: (product: MarketplaceProduct, selectedSize: string) => void;
  onRequestCustomStitch?: (product: MarketplaceProduct) => void;
  onChatSeller?: (designerName: string, product: MarketplaceProduct) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  isOpen,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
  onBuyNow,
  onRequestCustomStitch,
  onChatSeller
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [pincode, setPincode] = useState('400050');
  const [pincodeStatus, setPincodeStatus] = useState<{
    checked: boolean;
    valid: boolean;
    deliveryDate: string;
    codAvailable: boolean;
  }>({
    checked: true,
    valid: true,
    deliveryDate: 'Delivery by Thursday, 29 Oct',
    codAvailable: true
  });
  const [pincodeInput, setPincodeInput] = useState('400050');
  const [copiedCoupon, setCopiedCoupon] = useState<string | null>(null);
  const [showSizeChart, setShowSizeChart] = useState(false);
  const [showShareToast, setShowShareToast] = useState(false);

  if (!isOpen || !product) return null;

  // Multi-angle photo resolution
  const photoAngles = [
    { label: 'Front View', url: product.frontImageUrl || product.images[0] },
    {
      label: 'Back View',
      url:
        product.backImageUrl ||
        product.images[1] ||
        'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1000&auto=format&fit=crop&q=80'
    },
    {
      label: 'Side Silhouette',
      url:
        product.sideImageUrl ||
        product.images[2] ||
        product.images[0]
    },
    {
      label: 'Textile Detail',
      url:
        product.images[3] ||
        'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=1000&auto=format&fit=crop&q=80'
    }
  ];

  const currentPhoto = photoAngles[activePhotoIndex]?.url || product.images[0];
  const discountPercent = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 20;

  const handlePincodeCheck = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = pincodeInput.trim();
    if (clean.length === 6 && /^\d+$/.test(clean)) {
      setPincode(clean);
      setPincodeStatus({
        checked: true,
        valid: true,
        deliveryDate: 'Express Delivery in 2-3 Business Days',
        codAvailable: true
      });
    } else {
      setPincodeStatus({
        checked: true,
        valid: false,
        deliveryDate: 'Please enter a valid 6-digit Indian PIN code',
        codAvailable: false
      });
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(null), 2500);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.title,
        text: `Check out ${product.title} by ${product.designerName} on Pearl Pick`,
        url: window.location.href
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareToast(true);
      setTimeout(() => setShowShareToast(false), 2000);
    }
  };

  // Mock verified reviews
  const mockReviews = product.reviews && product.reviews.length > 0 ? product.reviews : [
    {
      id: 'rev-1',
      userName: 'Kavita Sengupta',
      rating: 5,
      comment: 'The drape and embroidery work exceeded all expectations. Looks exactly like a bespoke runway piece!',
      date: '18 Oct 2026'
    },
    {
      id: 'rev-2',
      userName: 'Priya Mehra',
      rating: 5,
      comment: 'Authentic pure silk with genuine GI weave origin. Delivered neatly packaged in atelier garment box.',
      date: '12 Oct 2026'
    },
    {
      id: 'rev-3',
      userName: 'Rohit Kulkarni',
      rating: 4.8,
      comment: 'Fitting was spot-on thanks to the 2-inch alteration margin inside. Will definitely order again.',
      date: '04 Oct 2026'
    }
  ];

  return (
    <div
      id="product-detail-modal-backdrop"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white w-full max-w-5xl rounded-3xl overflow-hidden shadow-2xl border border-[#ECE6DE] my-auto max-h-[94vh] flex flex-col relative">
        {/* Top Floating Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/90 hover:bg-[#FAF7F2] text-[#2D2825] shadow-md flex items-center justify-center transition-all cursor-pointer border border-[#E4D9D1]"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content Scroll Container */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 lg:grid-cols-12 divide-y lg:divide-y-0 lg:divide-x divide-[#ECE6DE]">
          {/* LEFT: Multi-Angle Gallery & Previews (5 cols) */}
          <div className="lg:col-span-5 p-5 bg-[#FAF7F2] flex flex-col justify-between space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#F5EFEA] border border-[#E4D9D1] group shadow-inner">
              <img
                src={currentPhoto}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
              />

              {/* Angle Label Badge */}
              <div className="absolute top-3 left-3 px-3 py-1 rounded-md bg-[#2D2825]/90 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{photoAngles[activePhotoIndex]?.label}</span>
              </div>

              {/* Wishlist Button */}
              <button
                type="button"
                onClick={() => onToggleWishlist(product.id)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-[#2D2825] hover:text-[#8D2434] shadow-md transition-transform active:scale-90 cursor-pointer"
                title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
              >
                <Heart
                  className={`w-4.5 h-4.5 ${
                    isWishlisted ? 'fill-[#8D2434] text-[#8D2434]' : 'text-[#2D2825]'
                  }`}
                />
              </button>

              {/* Discount / Bestseller Badge */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-[#8D2434] text-white text-[10px] font-bold tracking-wider uppercase shadow-xs">
                  {discountPercent}% OFF
                </span>
                {product.giCertified && (
                  <span className="px-2.5 py-1 rounded-lg bg-[#2D2825] text-[#D4AF37] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs">
                    <Award className="w-3 h-3" />
                    <span>GI Certified</span>
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-2">
              {photoAngles.map((angle, idx) => (
                <button
                  key={angle.label}
                  type="button"
                  onClick={() => setActivePhotoIndex(idx)}
                  className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                    activePhotoIndex === idx
                      ? 'border-[#8D2434] ring-2 ring-[#8D2434]/20 scale-102'
                      : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={angle.url}
                    alt={angle.label}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-[#2D2825]/75 text-[8px] font-semibold text-white text-center py-0.5 truncate">
                    {angle.label.split(' ')[0]}
                  </div>
                </button>
              ))}
            </div>

            {/* Atelier Verification Trust Card */}
            <div className="p-3.5 rounded-2xl bg-white border border-[#ECE6DE] flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FAF7F2] border border-[#E4D9D1] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-emerald-700" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#2D2825] truncate">
                  Master Atelier Verification
                </p>
                <p className="text-[11px] text-[#7D726A] truncate">
                  Hand-stitched in {product.origin || 'India'} with authentic handloom certification
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT: Product Details, Sizing, Delivery & Actions (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              {/* Brand & Title */}
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#8D2434]">
                    {product.designerName}
                  </span>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex items-center gap-1 text-[11px] text-[#7D726A] hover:text-[#2D2825] cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </button>
                </div>

                <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825] mt-1 leading-snug">
                  {product.title}
                </h1>

                {/* Star Rating Badge (Myntra style) */}
                <div className="flex items-center gap-2 mt-2">
                  <div className="px-2.5 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E4D9D1] flex items-center gap-1.5 text-xs font-bold text-[#2D2825]">
                    <span>{product.rating}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span className="text-[#8E847D] font-normal">| {product.reviewCount} Ratings</span>
                  </div>
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Verified Buyer Favorite
                  </span>
                </div>
              </div>

              {/* Price Details Block (Myntra/Amazon style) */}
              <div className="p-4 rounded-2xl bg-[#FAF7F2] border border-[#E4D9D1] space-y-1.5">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl font-bold text-[#2D2825] tabular-nums">
                    ₹{product.price.toLocaleString('en-IN')}
                  </span>
                  {product.originalPrice && (
                    <span className="text-base text-[#7D726A] line-through tabular-nums">
                      ₹{product.originalPrice.toLocaleString('en-IN')}
                    </span>
                  )}
                  <span className="text-sm font-bold text-[#8D2434]">
                    ({discountPercent}% OFF)
                  </span>
                </div>
                <p className="text-[11px] text-[#7D726A]">
                  Inclusive of all taxes · Protected by <strong className="text-[#2D2825]">Bharat Escrow Vault</strong>
                </p>
              </div>

              {/* Available Coupons & Bank Offers (Myntra Style) */}
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                  <Tag className="w-4 h-4 text-[#8D2434]" />
                  <span>Coupons & Available Offers</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {/* Coupon 1 */}
                  <div className="p-3 rounded-xl bg-white border border-[#D5C7B8] flex items-center justify-between gap-2 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#8D2434]">PEARLFIRST</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#FBECEF] text-[#8D2434] font-bold">15% OFF</span>
                      </div>
                      <p className="text-[10px] text-[#7D726A] mt-0.5">Extra 15% off on first order</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCoupon('PEARLFIRST')}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#ECE6DE] text-[10px] font-bold text-[#2D2825] border border-[#E4D9D1] cursor-pointer flex items-center gap-1"
                    >
                      {copiedCoupon === 'PEARLFIRST' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCoupon === 'PEARLFIRST' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>

                  {/* Coupon 2 */}
                  <div className="p-3 rounded-xl bg-white border border-[#D5C7B8] flex items-center justify-between gap-2 shadow-2xs">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-[#2D2825]">HDFC10</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#E8F0FE] text-[#1A73E8] font-bold">BANK OFFER</span>
                      </div>
                      <p className="text-[10px] text-[#7D726A] mt-0.5">10% Instant Discount on HDFC</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopyCoupon('HDFC10')}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF7F2] hover:bg-[#ECE6DE] text-[10px] font-bold text-[#2D2825] border border-[#E4D9D1] cursor-pointer flex items-center gap-1"
                    >
                      {copiedCoupon === 'HDFC10' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedCoupon === 'HDFC10' ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Size Selector with Size Chart (Myntra Style) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                    Select Size
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeChart(true)}
                    className="text-xs font-semibold text-[#8D2434] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Ruler className="w-3.5 h-3.5" />
                    <span>Size Chart & Fit Guide</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {(product.sizes?.length ? product.sizes : ['XS', 'S', 'M', 'L', 'XL', 'Custom Fit']).map(
                    (size) => {
                      const isSelected = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => setSelectedSize(size)}
                          className={`min-w-12 h-11 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer border flex items-center justify-center ${
                            isSelected
                              ? 'bg-[#2D2825] text-white border-[#2D2825] shadow-xs'
                              : 'bg-white text-[#2D2825] border-[#E4D9D1] hover:border-[#8D2434]'
                          }`}
                        >
                          {size}
                        </button>
                      );
                    }
                  )}
                </div>
                <p className="text-[11px] text-[#7D726A]">
                  Includes standard 2-inch internal alteration margins for precision fit.
                </p>
              </div>

              {/* Delivery Pincode Checker (Amazon & Myntra style) */}
              <div className="space-y-2 pt-1 border-t border-[#ECE6DE]">
                <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                  <Truck className="w-4 h-4 text-[#8D2434]" />
                  <span>Delivery Options & Pincode Check</span>
                </div>

                <form onSubmit={handlePincodeCheck} className="flex gap-2 max-w-sm">
                  <div className="relative flex-1">
                    <MapPin className="w-4 h-4 text-[#7D726A] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      maxLength={6}
                      value={pincodeInput}
                      onChange={(e) => setPincodeInput(e.target.value)}
                      placeholder="Enter 6-digit Pincode"
                      className="w-full pl-9 pr-3 py-2 bg-[#FAF7F2] border border-[#D5C7B8] rounded-xl text-xs text-[#2D2825] font-semibold focus:outline-none focus:border-[#2D2825]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-bold cursor-pointer"
                  >
                    Check
                  </button>
                </form>

                {pincodeStatus.checked && (
                  <div className="space-y-1 pt-1 text-xs">
                    {pincodeStatus.valid ? (
                      <>
                        <p className="text-emerald-700 font-bold flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 shrink-0" />
                          <span>{pincodeStatus.deliveryDate} to {pincode}</span>
                        </p>
                        <div className="flex flex-wrap gap-3 text-[11px] text-[#7D726A] pt-0.5">
                          <span>✓ Free Express Shipping</span>
                          <span>✓ Cash on Delivery Available</span>
                          <span>✓ 7-Day Easy Return & Alteration</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-[#8D2434] font-semibold text-xs">
                        {pincodeStatus.deliveryDate}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Textile & Craftsmanship Specifications */}
              <div className="space-y-2 pt-2 border-t border-[#ECE6DE]">
                <span className="text-xs font-bold uppercase tracking-wider text-[#2D2825] block">
                  Product Details & Heritage Specifications
                </span>
                <p className="text-xs text-[#5A4638] leading-relaxed">
                  {product.description}
                </p>

                <div className="grid grid-cols-2 gap-2.5 p-3 rounded-2xl bg-[#FAF7F2] border border-[#E4D9D1] text-xs">
                  <div>
                    <span className="text-[10px] uppercase text-[#7D726A] font-bold block">Fabric</span>
                    <span className="font-semibold text-[#2D2825]">{product.fabricType || product.fabric}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#7D726A] font-bold block">Weight (GSM)</span>
                    <span className="font-semibold text-[#2D2825]">{product.weightGsm || 220} GSM</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#7D726A] font-bold block">Weave Origin</span>
                    <span className="font-semibold text-[#2D2825]">{product.origin || 'Varanasi, Uttar Pradesh'}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-[#7D726A] font-bold block">Embroidery / Work</span>
                    <span className="font-semibold text-[#2D2825]">{product.specs?.work || 'Hand-Finished Detailing'}</span>
                  </div>
                </div>
              </div>

              {/* Customer Reviews Snippet */}
              <div className="space-y-2 pt-2 border-t border-[#ECE6DE]">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#2D2825]">
                    Customer Reviews ({mockReviews.length})
                  </span>
                  <span className="text-xs text-amber-600 font-bold">4.8 / 5.0 ★</span>
                </div>
                <div className="space-y-2">
                  {mockReviews.slice(0, 2).map((rev) => (
                    <div key={rev.id} className="p-3 rounded-xl bg-white border border-[#ECE6DE] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#2D2825]">{rev.userName}</span>
                        <span className="text-[10px] text-[#7D726A]">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-amber-500 text-amber-500" />
                        ))}
                      </div>
                      <p className="text-[11px] text-[#5A4638]">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* STICKY BOTTOM ACTIONS (Myntra / Amazon Style) */}
            <div className="pt-5 border-t border-[#ECE6DE] space-y-2.5">
              <div className="grid grid-cols-2 gap-3">
                <button
                  id="pdp-add-to-bag-btn"
                  type="button"
                  onClick={() => {
                    onAddToCart(product, selectedSize);
                    onClose();
                  }}
                  className="py-3.5 px-4 rounded-xl bg-[#2D2825] hover:bg-[#1A1816] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98"
                >
                  <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
                  <span>Add to Bag</span>
                </button>

                <button
                  id="pdp-buy-now-btn"
                  type="button"
                  onClick={() => {
                    onBuyNow(product, selectedSize);
                    onClose();
                  }}
                  className="py-3.5 px-4 rounded-xl bg-[#8D2434] hover:bg-[#6E1B28] text-white text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Buy Now (Escrow)</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {onRequestCustomStitch && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onRequestCustomStitch(product);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E2] text-[#2D2825] border border-[#E4D9D1] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5 text-[#8D2434]" />
                    <span>Customize in AI Studio</span>
                  </button>
                )}

                {onChatSeller && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onChatSeller(product.designerName, product);
                    }}
                    className="py-2.5 px-3 rounded-xl bg-[#FAF7F2] hover:bg-[#EFE9E2] text-[#2D2825] border border-[#E4D9D1] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#8D2434]" />
                    <span>Message Atelier</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Share Feedback Toast */}
        {showShareToast && (
          <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 bg-[#2D2825] text-white text-xs py-2 px-4 rounded-full shadow-xl flex items-center gap-2 animate-in fade-in duration-200">
            <Check className="w-3.5 h-3.5 text-emerald-400" />
            <span>Product link copied to clipboard!</span>
          </div>
        )}

        {/* Size Chart Modal */}
        {showSizeChart && (
          <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#ECE6DE] shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg font-bold text-[#2D2825]">Standard Indian Couture Size Chart</h3>
                  <p className="text-[11px] text-[#7D726A]">Measurements in inches (all garments include 2-inch margins)</p>
                </div>
                <button
                  onClick={() => setShowSizeChart(false)}
                  className="w-7 h-7 rounded-full bg-[#FAF7F2] text-[#7D726A] flex items-center justify-center hover:bg-[#ECE6DE] cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-[#FAF7F2] text-[#2D2825] font-bold">
                    <tr>
                      <th className="p-2.5 rounded-l-lg">Size</th>
                      <th className="p-2.5">Bust</th>
                      <th className="p-2.5">Waist</th>
                      <th className="p-2.5">Hip</th>
                      <th className="p-2.5 rounded-r-lg">Length</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7F2] text-[#6E6359]">
                    <tr><td className="p-2.5 font-bold text-[#2D2825]">XS (32)</td><td className="p-2.5">32-33&quot;</td><td className="p-2.5">25-26&quot;</td><td className="p-2.5">35-36&quot;</td><td className="p-2.5">54&quot;</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#2D2825]">S (34)</td><td className="p-2.5">34-35&quot;</td><td className="p-2.5">27-28&quot;</td><td className="p-2.5">37-38&quot;</td><td className="p-2.5">55&quot;</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#2D2825]">M (36)</td><td className="p-2.5">36-37&quot;</td><td className="p-2.5">29-30&quot;</td><td className="p-2.5">39-40&quot;</td><td className="p-2.5">55&quot;</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#2D2825]">L (38)</td><td className="p-2.5">38-39&quot;</td><td className="p-2.5">31-32&quot;</td><td className="p-2.5">41-42&quot;</td><td className="p-2.5">56&quot;</td></tr>
                    <tr><td className="p-2.5 font-bold text-[#2D2825]">XL (40)</td><td className="p-2.5">40-42&quot;</td><td className="p-2.5">33-35&quot;</td><td className="p-2.5">43-45&quot;</td><td className="p-2.5">56&quot;</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF7F2] text-xs text-[#7D726A] space-y-1">
                <p className="font-semibold text-[#2D2825]">Need made-to-measure tailoring?</p>
                <p>Select &quot;Custom Fit&quot; or use our 14-Point Measurement Sheet to provide your exact body contours.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowSizeChart(false)}
                className="w-full py-2.5 rounded-full bg-[#2D2825] text-white text-xs font-bold cursor-pointer"
              >
                Close Fit Guide
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
