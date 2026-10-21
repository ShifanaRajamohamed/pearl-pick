import React, { useState } from 'react';
import { 
  Heart, 
  ChevronDown, 
  MessageCircle, 
  Check, 
  Sparkles, 
  X, 
  Ruler, 
  ShieldCheck, 
  Truck,
  Search
} from 'lucide-react';
import { MarketplaceProduct } from '../../types';

interface MarketplaceViewProps {
  products: MarketplaceProduct[];
  wishlistIds: string[];
  onToggleWishlist: (productId: string) => void;
  onBuyNow: (product: MarketplaceProduct, selectedSize: string) => void;
  onChatSeller: (designerName: string, product: MarketplaceProduct) => void;
  onRequestCustomStitch?: (product: MarketplaceProduct) => void;
  gender?: 'women' | 'men';
}

export const MarketplaceView: React.FC<MarketplaceViewProps> = ({
  products,
  wishlistIds,
  onToggleWishlist,
  onBuyNow,
  onChatSeller,
  onRequestCustomStitch,
  gender = 'women'
}) => {
  const [activeFilter, setActiveFilter] = useState<string>(gender === 'men' ? 'mens-bespoke' : 'all');
  const [selectedProduct, setSelectedProduct] = useState<MarketplaceProduct | null>(null);
  const [selectedSize, setSelectedSize] = useState<string>('M');
  const [showSortDropdown, setShowSortDropdown] = useState<boolean>(false);
  const [selectedSort, setSelectedSort] = useState<string>('Featured');

  const filterChips = [
    { id: 'all', label: 'All' },
    { id: 'mens-bespoke', label: "Men's Bespoke" },
    { id: 'womens-couture', label: "Women's Couture" },
    { id: 'ready-to-wear', label: 'Ready to wear' },
    { id: 'limited-edition', label: 'Limited edition' },
    { id: 'under-25000', label: 'Under ₹25,000' },
  ];

  const filteredProducts = products.filter((p) => {
    if (activeFilter === 'mens-bespoke') {
      return p.tags.some(t => t.toLowerCase().includes('men') || t.toLowerCase().includes('bandhgala') || t.toLowerCase().includes('tuxedo') || t.toLowerCase().includes('kurta')) || p.categoryLabel.toLowerCase().includes('men');
    }
    if (activeFilter === 'womens-couture') {
      return !p.tags.some(t => t.toLowerCase().includes('men') || t.toLowerCase().includes('bandhgala') || t.toLowerCase().includes('tuxedo')) && !p.categoryLabel.toLowerCase().includes('men');
    }
    if (activeFilter === 'ready-to-wear') return p.category === 'ready-to-wear' || p.tags.includes('Ready to wear');
    if (activeFilter === 'limited-edition') return p.category === 'limited-edition' || p.tags.includes('Limited edition');
    if (activeFilter === 'under-25000') return p.price < 25000;
    return true;
  });

  const getMonogram = (name: string) => {
    if (name.toLowerCase().includes('naira')) return 'N';
    if (name.toLowerCase().includes('mira') || name.toLowerCase().includes('house')) return 'M';
    if (name.toLowerCase().includes('draped')) return 'TD';
    if (name.toLowerCase().includes('meera')) return 'M';
    const words = name.split(' ');
    if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenProduct = (product: MarketplaceProduct) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0] || 'M');
  };

  return (
    <div id="marketplace-screen" className="max-w-md mx-auto space-y-6 sm:space-y-8 pb-24 text-[#2D2825] px-4 sm:px-1">
      
      {/* 1. HEADER: Title & Subtitle */}
      <div className="pt-1 space-y-1">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825] tracking-tight">
          Marketplace
        </h1>
        <p className="text-xs text-[#7D726A] font-light">
          Curated ready-to-stitch designer collections & couture pieces
        </p>
      </div>

      {/* 2. FILTER CHIPS HORIZONTAL SCROLL ROW */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {filterChips.map((chip) => {
          const isActive = activeFilter === chip.id;
          return (
            <button
              key={chip.id}
              onClick={() => setActiveFilter(chip.id)}
              className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer shadow-2xs ${
                isActive
                  ? 'bg-[#8D2434] text-white'
                  : 'bg-white border border-[#ECE6DE] text-[#2D2825] hover:border-[#8D2434]'
              }`}
            >
              {chip.label}
            </button>
          );
        })}

        {/* Sort Dropdown Chip */}
        <div className="relative shrink-0">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#ECE6DE] text-xs font-medium text-[#2D2825] hover:border-[#8D2434] transition-all cursor-pointer shadow-2xs whitespace-nowrap"
          >
            <span>Sort: {selectedSort}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#7D726A]" />
          </button>
          {showSortDropdown && (
            <div className="absolute top-full right-0 mt-1.5 z-30 bg-white rounded-xl border border-[#ECE6DE] shadow-xl p-1 w-40 text-xs">
              {['Featured', 'Price: Low to High', 'Price: High to Low', 'Top Rated'].map((sortOption) => (
                <button
                  key={sortOption}
                  onClick={() => {
                    setSelectedSort(sortOption);
                    setShowSortDropdown(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer ${
                    selectedSort === sortOption ? 'bg-[#FBECEF] text-[#8D2434]' : 'hover:bg-black/5 text-[#2D2825]'
                  }`}
                >
                  {sortOption}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 3. 2-COLUMN PRODUCT GRID (Uncluttered, Consistent 3:4 Aspect Ratio) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {filteredProducts.map((product) => {
          const isWishlisted = wishlistIds.includes(product.id);
          const isFeatured = product.category === 'featured' || product.tags.includes('Featured');

          return (
            <div
              key={product.id}
              onClick={() => handleOpenProduct(product)}
              className="group bg-white rounded-2xl border border-[#ECE6DE] overflow-hidden p-2.5 shadow-2xs hover:shadow-sm transition-all cursor-pointer flex flex-col justify-between"
            >
              {/* Image Container with Heart Button Overlay */}
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#F5EFEA]">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleWishlist(product.id);
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/85 backdrop-blur-xs flex items-center justify-center text-[#2D2825] hover:scale-110 active:scale-95 transition-all cursor-pointer shadow-xs"
                  title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      isWishlisted ? 'fill-[#8D2434] text-[#8D2434]' : 'text-[#2D2825]'
                    }`}
                  />
                </button>
              </div>

              {/* Title, Price & Tailor Info */}
              <div className="pt-2.5 pb-1 space-y-1">
                {/* Tailor / Atelier Row with Gold Check */}
                <div className="flex items-center gap-1.5 text-[10px] text-[#7D726A]">
                  <span className="font-medium truncate max-w-[100px] text-[#2D2825]">{product.designerName}</span>
                  <span className="w-3 h-3 rounded-full bg-[#E5A93C] text-white flex items-center justify-center text-[7px] font-bold shrink-0">
                    ✓
                  </span>
                </div>

                <h3 className="font-medium text-xs text-[#2D2825] line-clamp-1 leading-snug">
                  {product.title}
                </h3>
                
                <div className="font-semibold text-xs text-[#2D2825]">
                  ₹{product.price}
                </div>
                
                <div className="text-[10px] text-[#7D726A] line-clamp-1">
                  Size S–XL • {product.fabric}
                </div>
              </div>

              {/* Featured collection badge if applicable */}
              {isFeatured && (
                <div className="inline-flex items-center gap-1 text-[9px] font-medium text-[#8D2434] pt-1">
                  <Sparkles className="w-2.5 h-2.5 text-[#8D2434]" />
                  <span>Featured piece</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. PRODUCT DETAIL BOTTOM SHEET DRAWER */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-md rounded-t-[32px] sm:rounded-2xl max-h-[88vh] overflow-y-auto p-5 space-y-4 shadow-2xl border border-[#ECE6DE]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-[#3D2C22] text-white flex items-center justify-center text-[10px] font-serif font-bold">
                  {getMonogram(selectedProduct.designerName)}
                </div>
                <div>
                  <span className="text-xs font-semibold text-[#2D2825] flex items-center gap-1">
                    {selectedProduct.designerName}
                    <span className="w-3 h-3 rounded-full bg-[#E5A93C] text-white flex items-center justify-center text-[7px] font-bold">✓</span>
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedProduct(null)}
                className="w-8 h-8 rounded-full hover:bg-black/5 flex items-center justify-center cursor-pointer text-[#7D726A]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Product Image (Consistent 3:4 Aspect Ratio) */}
            <div className="relative aspect-[3/4] max-h-72 rounded-2xl overflow-hidden bg-[#F5EFEA] mx-auto">
              <img
                src={selectedProduct.images[0]}
                alt={selectedProduct.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Title & Price */}
            <div className="space-y-1 pt-1">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="font-serif text-lg font-bold text-[#2D2825]">
                  {selectedProduct.title}
                </h3>
                <div className="font-bold text-base text-[#2D2825] shrink-0">
                  ₹{selectedProduct.price}
                </div>
              </div>
              <p className="text-xs text-[#7D726A] leading-relaxed font-light">
                {selectedProduct.description}
              </p>
            </div>

            {/* Size Selector */}
            <div className="space-y-1.5 pt-1">
              <div className="text-xs font-semibold text-[#2D2825]">Select Size</div>
              <div className="flex gap-2">
                {(selectedProduct.sizes || ['XS', 'S', 'M', 'L', 'XL']).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      selectedSize === size
                        ? 'bg-[#8D2434] text-white border-[#8D2434]'
                        : 'bg-white border-[#ECE6DE] text-[#2D2825] hover:border-[#8D2434]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Guarantees */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#ECE6DE] text-[11px] text-[#7D726A]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Bharat Escrow Protected</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#8D2434]" />
                <span>Dispatch in 48 hours</span>
              </div>
            </div>

            {/* Single Primary CTA + Outlined Secondary Action */}
            <div className="space-y-2 pt-2">
              <button
                onClick={() => {
                  onBuyNow(selectedProduct, selectedSize);
                  setSelectedProduct(null);
                }}
                className="w-full h-12 rounded-xl bg-[#8D2434] text-white text-xs font-semibold hover:bg-[#781E2C] shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Buy Now • ₹{selectedProduct.price}</span>
              </button>

              <button
                onClick={() => {
                  onChatSeller(selectedProduct.designerName, selectedProduct);
                  setSelectedProduct(null);
                }}
                className="w-full h-11 rounded-xl border border-[#ECE6DE] text-xs font-semibold text-[#2D2825] hover:bg-[#FAF7F2] flex items-center justify-center gap-1.5 cursor-pointer transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-[#7D726A]" />
                <span>Chat with Designer</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
