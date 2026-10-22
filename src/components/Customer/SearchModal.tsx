import React, { useState, useMemo } from 'react';
import { 
  Search, 
  X, 
  Sparkles, 
  Scissors, 
  ShoppingBag, 
  Layers, 
  ArrowUpRight,
  TrendingUp,
  Tag,
  Star
} from 'lucide-react';
import { TailorProfile, MarketplaceProduct, DressDesign } from '../../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  tailors: TailorProfile[];
  products: MarketplaceProduct[];
  designs: DressDesign[];
  onSelectTailor: (tailor: TailorProfile) => void;
  onSelectProduct: (product: MarketplaceProduct) => void;
  onSelectDesign: (design: DressDesign) => void;
  onSelectCategory?: (categoryName: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  tailors,
  products,
  designs,
  onSelectTailor,
  onSelectProduct,
  onSelectDesign,
  onSelectCategory
}) => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'tailors' | 'designs'>('all');

  const trendingSearches = [
    'Bridal Lehenga',
    'Banarasi Silk Anarkali',
    'Zardozi Handwork',
    'Velvet Evening Gown',
    'Ustad Rafiq Shahi Darzi',
    'Kanjeevaram Saree Gown',
    'Corset Tiered Dress',
    'Lucknowi Chikankari'
  ];

  const categories = [
    'Lehengas',
    'Anarkalis',
    'Couture Gowns',
    'Saree Gowns',
    'Shararas',
    'Indo-Western',
    'Corset Dresses'
  ];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { products: [], tailors: [], designs: [] };

    const matchedProducts = products.filter(p => 
      p.title.toLowerCase().includes(q) ||
      p.fabric.toLowerCase().includes(q) ||
      p.designerName.toLowerCase().includes(q) ||
      p.tags.some(t => t.toLowerCase().includes(q))
    );

    const matchedTailors = tailors.filter(t => 
      t.name.toLowerCase().includes(q) ||
      t.shopName.toLowerCase().includes(q) ||
      t.city.toLowerCase().includes(q) ||
      t.specialties.some(s => s.toLowerCase().includes(q))
    );

    const matchedDesigns = designs.filter(d => 
      d.title.toLowerCase().includes(q) ||
      d.prompt.toLowerCase().includes(q) ||
      d.tags.some(t => t.toLowerCase().includes(q))
    );

    return {
      products: matchedProducts,
      tailors: matchedTailors,
      designs: matchedDesigns
    };
  }, [query, products, tailors, designs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-10 sm:pt-16 px-4 bg-[#2D2825]/60 backdrop-blur-md animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-[#F9F6F2] rounded-[32px] border border-[#E4D9D1] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Input */}
        <div className="p-4 sm:p-5 bg-white border-b border-[#E4D9D1] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#B47B84] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dresses, master tailors, fabrics, designs..."
            autoFocus
            className="flex-1 bg-transparent text-[#2D2825] placeholder-[#726761] text-sm sm:text-base outline-none font-sans"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-[#726761] hover:bg-[#F3ECE6] hover:text-[#2D2825] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-[#F3ECE6] text-[#2D2825] hover:bg-[#E9D4D7] hover:text-[#B47B84] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Filters */}
        {query && (
          <div className="px-5 py-2.5 bg-[#F3ECE6]/60 border-b border-[#E4D9D1] flex items-center gap-2 overflow-x-auto text-xs font-semibold">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#4A3728] text-[#F9F6F2] shadow-xs'
                  : 'text-[#726761] hover:text-[#2D2825]'
              }`}
            >
              All Results
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'products'
                  ? 'bg-[#4A3728] text-[#F9F6F2] shadow-xs'
                  : 'text-[#726761] hover:text-[#2D2825]'
              }`}
            >
              Products ({results.products.length})
            </button>
            <button
              onClick={() => setActiveTab('tailors')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'tailors'
                  ? 'bg-[#4A3728] text-[#F9F6F2] shadow-xs'
                  : 'text-[#726761] hover:text-[#2D2825]'
              }`}
            >
              Master Tailors ({results.tailors.length})
            </button>
            <button
              onClick={() => setActiveTab('designs')}
              className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                activeTab === 'designs'
                  ? 'bg-[#4A3728] text-[#F9F6F2] shadow-xs'
                  : 'text-[#726761] hover:text-[#2D2825]'
              }`}
            >
              AI Designs ({results.designs.length})
            </button>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          {!query ? (
            <>
              {/* Trending Searches */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#726761] uppercase">
                  <TrendingUp className="w-3.5 h-3.5 text-[#B47B84]" />
                  <span>Trending Searches</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trendingSearches.map((item) => (
                    <button
                      key={item}
                      onClick={() => setQuery(item)}
                      className="px-3.5 py-2 rounded-full bg-white border border-[#E4D9D1] text-xs text-[#2D2825] hover:border-[#B47B84] hover:bg-[#E9D4D7]/40 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Tag className="w-3 h-3 text-[#B47B84]" />
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Popular Categories */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold tracking-wider text-[#726761] uppercase">
                  <Layers className="w-3.5 h-3.5 text-[#B47B84]" />
                  <span>Explore Categories</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => {
                        if (onSelectCategory) {
                          onSelectCategory(cat);
                        }
                        onClose();
                      }}
                      className="p-3 rounded-2xl bg-white border border-[#E4D9D1] text-left text-xs font-semibold text-[#2D2825] hover:border-[#4A3728] hover:shadow-xs transition-all flex items-center justify-between cursor-pointer"
                    >
                      <span>{cat}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#726761]" />
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {/* Products Results */}
              {(activeTab === 'all' || activeTab === 'products') && results.products.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#726761] flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-[#B47B84]" />
                    <span>Marketplace Pieces ({results.products.length})</span>
                  </h3>
                  <div className="space-y-2.5">
                    {results.products.map((prod) => (
                      <div
                        key={prod.id}
                        onClick={() => {
                          onSelectProduct(prod);
                          onClose();
                        }}
                        className="p-3 rounded-2xl bg-white border border-[#E4D9D1] hover:border-[#B47B84] hover:shadow-sm transition-all flex items-center gap-3.5 cursor-pointer"
                      >
                        <img
                          src={prod.images[0]}
                          alt={prod.title}
                          className="w-14 h-14 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="text-[10px] font-semibold text-[#B47B84] uppercase tracking-wider block">
                            {prod.categoryLabel}
                          </span>
                          <h4 className="font-serif text-sm font-bold text-[#2D2825] truncate">
                            {prod.title}
                          </h4>
                          <p className="text-xs text-[#726761] truncate font-light">
                            {prod.fabric} • By {prod.designerName}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-bold text-[#2D2825] text-sm">
                            ₹{prod.price.toLocaleString('en-IN')}
                          </p>
                          <span className="text-[10px] text-[#6E8765] font-semibold flex items-center justify-end gap-1">
                            <Star className="w-3 h-3 fill-current" /> {prod.rating}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailors Results */}
              {(activeTab === 'all' || activeTab === 'tailors') && results.tailors.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#726761] flex items-center gap-1.5">
                    <Scissors className="w-3.5 h-3.5 text-[#B47B84]" />
                    <span>Master Tailors & Ateliers ({results.tailors.length})</span>
                  </h3>
                  <div className="space-y-2.5">
                    {results.tailors.map((tailor) => (
                      <div
                        key={tailor.id}
                        onClick={() => {
                          onSelectTailor(tailor);
                          onClose();
                        }}
                        className="p-3 rounded-2xl bg-white border border-[#E4D9D1] hover:border-[#B47B84] hover:shadow-sm transition-all flex items-center gap-3.5 cursor-pointer"
                      >
                        <img
                          src={tailor.avatar}
                          alt={tailor.name}
                          className="w-12 h-12 rounded-full object-cover border border-[#E4D9D1]"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-serif text-sm font-bold text-[#2D2825] truncate">
                              {tailor.name}
                            </h4>
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#E9D4D7] text-[#B47B84]">
                              {tailor.badge}
                            </span>
                          </div>
                          <p className="text-xs text-[#726761] truncate font-light">
                            {tailor.shopName} • {tailor.city}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-xs font-semibold text-[#2D2825]">
                            From ₹{tailor.startingPrice.toLocaleString('en-IN')}
                          </p>
                          <span className="text-[10px] text-[#726761]">
                            {tailor.experienceYears}+ yrs exp
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Designs Results */}
              {(activeTab === 'all' || activeTab === 'designs') && results.designs.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#726761] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#B47B84]" />
                    <span>AI Designs & Variations ({results.designs.length})</span>
                  </h3>
                  <div className="space-y-2.5">
                    {results.designs.map((design) => (
                      <div
                        key={design.id}
                        onClick={() => {
                          onSelectDesign(design);
                          onClose();
                        }}
                        className="p-3 rounded-2xl bg-white border border-[#E4D9D1] hover:border-[#B47B84] hover:shadow-sm transition-all flex items-center gap-3.5 cursor-pointer"
                      >
                        <img
                          src={design.variations[0]?.frontImageUrl}
                          alt={design.title}
                          className="w-14 h-14 rounded-xl object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif text-sm font-bold text-[#2D2825] truncate">
                            {design.title}
                          </h4>
                          <p className="text-xs text-[#726761] truncate font-light">
                            {design.prompt}
                          </p>
                          <div className="flex gap-1.5 mt-1">
                            {design.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="text-[9px] px-2 py-0.5 rounded-full bg-[#F3ECE6] text-[#726761]">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {results.products.length === 0 && results.tailors.length === 0 && results.designs.length === 0 && (
                <div className="text-center py-12 space-y-3">
                  <p className="font-serif text-lg font-bold text-[#2D2825]">No matches found for "{query}"</p>
                  <p className="text-xs text-[#726761] max-w-sm mx-auto">
                    Try searching for bridal lehengas, Anarkalis, raw silk, or specific master tailors like Ustad Rafiq.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
