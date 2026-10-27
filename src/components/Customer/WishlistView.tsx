import React, { useState } from 'react';
import {
  Heart,
  ShoppingBag,
  Trash2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Star,
  Layers,
  ChevronRight,
  Eye,
  CheckCircle2,
  Tag
} from 'lucide-react';
import { MarketplaceProduct } from '../../types';

interface WishlistViewProps {
  wishlistIds: string[];
  products: MarketplaceProduct[];
  onToggleWishlist: (productId: string) => void;
  onAddToCart: (product: MarketplaceProduct, selectedSize: string) => void;
  onSelectProduct: (product: MarketplaceProduct) => void;
  onExploreMarketplace: () => void;
  onOpenStudio?: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
}

export const WishlistView: React.FC<WishlistViewProps> = ({
  wishlistIds,
  products,
  onToggleWishlist,
  onAddToCart,
  onSelectProduct,
  onExploreMarketplace,
  onOpenStudio,
  onOpenCart,
  cartCount = 0
}) => {
  // Local size selection state per product ID
  const [selectedSizes, setSelectedSizes] = useState<Record<string, string>>({});
  // Feedback state for recently moved items
  const [movedItems, setMovedItems] = useState<Record<string, boolean>>({});

  const wishlistedProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleSelectSize = (productId: string, size: string) => {
    setSelectedSizes((prev) => ({ ...prev, [productId]: size }));
  };

  const handleMoveToBag = (product: MarketplaceProduct) => {
    const chosenSize = selectedSizes[product.id] || 'M';
    onAddToCart(product, chosenSize);
    setMovedItems((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setMovedItems((prev) => ({ ...prev, [product.id]: false }));
    }, 2200);
  };

  const handleMoveAllToBag = () => {
    wishlistedProducts.forEach((product) => {
      const chosenSize = selectedSizes[product.id] || 'M';
      onAddToCart(product, chosenSize);
    });
  };

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'Custom'];

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Top Header / Breadcrumb Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#ECE6DE] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#7D726A] font-semibold tracking-wider uppercase mb-1">
            <button
              type="button"
              onClick={onExploreMarketplace}
              className="hover:text-[#8D2434] transition-colors cursor-pointer"
            >
              Marketplace
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-[#B4A89C]" />
            <span className="text-[#2D2825]">Wishlist</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825]">
              My Wishlist
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-[#FBECEF] text-[#8D2434] text-xs font-bold">
              {wishlistedProducts.length} {wishlistedProducts.length === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#7D726A] mt-1 font-light">
            Curated haute couture, bespoke lehengas, and master-crafted silks saved for your wardrobe.
          </p>
        </div>

        {wishlistedProducts.length > 0 && (
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={handleMoveAllToBag}
              className="py-2.5 px-4 rounded-xl bg-[#2D2825] hover:bg-black text-white text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-[#D4AF37]" />
              <span>Move All to Bag</span>
            </button>
            {onOpenCart && cartCount > 0 && (
              <button
                type="button"
                onClick={onOpenCart}
                className="py-2.5 px-3.5 rounded-xl border border-[#ECE6DE] bg-white hover:bg-[#FAF7F2] text-[#2D2825] text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <span>Bag ({cartCount})</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Main Wishlist Content */}
      {wishlistedProducts.length === 0 ? (
        /* Empty State: Myntra / Amazon Style */
        <div className="text-center py-16 sm:py-24 px-4 bg-white/70 backdrop-blur-xs rounded-3xl border border-[#ECE6DE] shadow-xs max-w-2xl mx-auto space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-[#FBECEF] border border-[#F2D1D7] flex items-center justify-center text-[#8D2434] shadow-inner">
            <Heart className="w-10 h-10 stroke-[1.5]" />
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#2D2825]">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs sm:text-sm text-[#7D726A] max-w-md mx-auto leading-relaxed">
              Explore our verified master atelier marketplace, hand-woven Banarasi silks, and designer couture gowns to bookmark your dream silhouettes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={onExploreMarketplace}
              className="w-full sm:w-auto py-3 px-6 rounded-xl bg-[#8D2434] hover:bg-[#741C2A] text-white text-xs font-bold tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {onOpenStudio && (
              <button
                type="button"
                onClick={onOpenStudio}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-white border border-[#D5C7BC] hover:border-[#8D2434] text-[#2D2825] hover:text-[#8D2434] text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                <span>Create with AI Studio</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Wishlist Items Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {wishlistedProducts.map((product) => {
            const currentSize = selectedSizes[product.id] || 'M';
            const isMoved = movedItems[product.id];
            const originalPrice = Math.round(product.price * 1.25);
            const savings = originalPrice - product.price;

            return (
              <div
                key={product.id}
                className="group bg-white rounded-2xl border border-[#ECE6DE] overflow-hidden shadow-2xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image Section */}
                <div className="relative aspect-3/4 overflow-hidden bg-[#FAF7F2]">
                  <img
                    src={product.images[0]}
                    alt={product.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Top Badges */}
                  <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#8D2434] text-white shadow-2xs">
                      20% OFF
                    </span>
                    {product.giCertified && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-600 text-white shadow-2xs flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" /> GI Certified
                      </span>
                    )}
                  </div>

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => onToggleWishlist(product.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-[#7D726A] hover:text-[#8D2434] flex items-center justify-center shadow-xs transition-colors z-10 cursor-pointer"
                    title="Remove from Wishlist"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Quick View Button on Hover */}
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="w-full py-2 px-3 rounded-xl bg-white/95 backdrop-blur-xs text-[#2D2825] hover:text-[#8D2434] text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Quick View Details</span>
                    </button>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    {/* Atelier & Rating */}
                    <div className="flex items-center justify-between text-[11px] text-[#7D726A] mb-1">
                      <span className="font-semibold text-[#8D2434] uppercase tracking-wider truncate max-w-[65%]">
                        {product.designerName}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-[#2D2825] bg-[#FAF7F2] px-1.5 py-0.5 rounded-md">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        {product.rating || '4.9'}
                      </span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onSelectProduct(product)}
                      className="font-serif text-sm font-bold text-[#2D2825] line-clamp-1 hover:text-[#8D2434] transition-colors cursor-pointer"
                      title={product.title}
                    >
                      {product.title}
                    </h3>

                    {/* Fabric & Origin */}
                    <p className="text-[11px] text-[#7D726A] line-clamp-1 mt-0.5 font-light">
                      {product.fabric} • {product.origin || 'Varanasi, UP'}
                    </p>

                    {/* Price & Savings */}
                    <div className="flex items-baseline gap-2 mt-2">
                      <span className="font-serif text-base font-bold text-[#2D2825]">
                        ₹{product.price.toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs text-[#A89F91] line-through font-light">
                        ₹{originalPrice.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700">
                        Save ₹{savings.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Size Selector Strip */}
                  <div className="pt-2 border-t border-[#F2ECE6] space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-semibold text-[#7D726A]">
                      <span>SELECT SIZE</span>
                      <span className="text-[#8D2434] uppercase">{currentSize}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {availableSizes.map((size) => (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSelectSize(product.id, size)}
                          className={`flex-1 py-1 text-[10px] font-bold rounded-lg border transition-all cursor-pointer ${
                            currentSize === size
                              ? 'border-[#2D2825] bg-[#2D2825] text-white'
                              : 'border-[#E0D6CC] bg-white text-[#5C5248] hover:border-[#8D2434]'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleMoveToBag(product)}
                      className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                        isMoved
                          ? 'bg-emerald-700 text-white'
                          : 'bg-[#8D2434] hover:bg-[#741C2A] text-white'
                      }`}
                    >
                      {isMoved ? (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Added to Bag!</span>
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-4 h-4" />
                          <span>Move to Bag</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Suggested Pieces / Cross-Sell (Amazon / Myntra Style) */}
      {wishlistedProducts.length > 0 && products.length > wishlistedProducts.length && (
        <div className="pt-10 border-t border-[#ECE6DE] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-lg font-bold text-[#2D2825]">
                More Master Atelier Pieces You May Love
              </h2>
              <p className="text-xs text-[#7D726A]">
                Hand-curated additions to match your saved wardrobe style
              </p>
            </div>
            <button
              type="button"
              onClick={onExploreMarketplace}
              className="text-xs font-bold text-[#8D2434] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {products
              .filter((p) => !wishlistIds.includes(p.id))
              .slice(0, 6)
              .map((item) => (
                <div
                  key={item.id}
                  onClick={() => onSelectProduct(item)}
                  className="bg-white rounded-xl border border-[#ECE6DE] p-2.5 hover:shadow-sm hover:border-[#8D2434] transition-all cursor-pointer group"
                >
                  <div className="relative aspect-3/4 rounded-lg overflow-hidden bg-[#FAF7F2] mb-2">
                    <img
                      src={item.images[0]}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <p className="text-[10px] font-semibold text-[#8D2434] uppercase truncate">
                    {item.designerName}
                  </p>
                  <h4 className="font-serif text-xs font-bold text-[#2D2825] truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs font-bold text-[#2D2825] mt-1">
                    ₹{item.price.toLocaleString('en-IN')}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
