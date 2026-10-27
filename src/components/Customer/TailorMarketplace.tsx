import React, { useState } from 'react';
import { 
  Scissors, 
  Star, 
  CheckCircle2, 
  MapPin, 
  Clock, 
  DollarSign, 
  Search, 
  Filter, 
  ShieldCheck, 
  Award, 
  Phone, 
  Send,
  X,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { TailorProfile, PortfolioWork } from '../../types';

interface TailorMarketplaceProps {
  tailors: TailorProfile[];
  selectedTailor: TailorProfile | null;
  onSelectTailor: (tailor: TailorProfile | null) => void;
  onContactTailor: (tailor: TailorProfile) => void;
  onRequestCustomQuote?: (tailor: TailorProfile) => void;
  gender?: 'women' | 'men';
}

export const TailorMarketplace: React.FC<TailorMarketplaceProps> = ({
  tailors,
  selectedTailor,
  onSelectTailor,
  onContactTailor,
  onRequestCustomQuote,
  gender = 'women'
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);

  const specialties = [
    'All',
    "Men's Bespoke Suiting",
    'Royal Sherwanis & Bandhgalas',
    'Bridal & Wedding',
    'Red Carpet Gowns',
    'Indo-Western Lehanga',
    'Savile Row Tailoring'
  ];

  const filteredTailors = tailors.filter((t) => {
    if (verifiedOnly && t.verificationStatus !== 'VERIFIED') return false;
    if (selectedSpecialty !== 'All' && !t.specialties.some(s => s.toLowerCase().includes(selectedSpecialty.toLowerCase()))) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.name.toLowerCase().includes(q) ||
        t.shopName.toLowerCase().includes(q) ||
        t.city.toLowerCase().includes(q) ||
        t.bio.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const formatINR = (val: number) => {
    const inrVal = val < 2000 ? val * 50 : val;
    return `₹${inrVal.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-md mx-auto space-y-5 pb-20">
      
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold">Atelier Marketplace</span>
        <h1 className="font-serif text-2xl font-bold text-[#4A3728]">Verified Master Tailors</h1>
        <p className="text-xs text-[#6B584C] mt-1 font-light">Discover vetted master pattern makers, artisans, and couture studios for bespoke garment tailoring.</p>
      </div>

      {/* Search & Specialty Filters */}
      <div className="bg-white/90 backdrop-blur-md rounded-[24px] border border-[#4A3728]/10 p-4 shadow-2xs space-y-3">
        
        <div className="flex gap-2 items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tailor, atelier, or city..."
              className="w-full pl-9 pr-3 py-2 rounded-full bg-[#F5F2ED]/80 border border-[#4A3728]/10 text-xs text-[#4A3728] placeholder-[#8C7A6B] focus:outline-none focus:border-[#4A3728]"
            />
          </div>

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center space-x-1 px-3 py-2 rounded-full text-[10px] font-bold uppercase tracking-wider border transition-all shrink-0 cursor-pointer ${
              verifiedOnly
                ? 'bg-[#4A3728] text-[#FBD7D1] border-[#4A3728] shadow-xs'
                : 'bg-[#F5F2ED]/80 text-[#6B584C] border-[#4A3728]/10 hover:bg-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </button>
        </div>

        {/* Specialty Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 no-scrollbar">
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s)}
              className={`px-3 py-1 rounded-full text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedSpecialty === s
                  ? 'bg-[#8D2434] text-white shadow-xs'
                  : 'bg-[#F5F2ED]/80 text-[#6B584C] hover:bg-white border border-[#4A3728]/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

      </div>

      {/* Tailor List (Mobile-First Cards) */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTailors.map((tailor) => (
          <div
            key={tailor.id}
            onClick={() => onSelectTailor(tailor)}
            className="group rounded-[24px] bg-white border border-[#ECE6DE] overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Atelier Cover Banner */}
            <div className="relative h-32 overflow-hidden bg-[#F5F2ED]">
              <img
                src={tailor.coverImage}
                alt={tailor.shopName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
              
              <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-white">
                <span className="text-xs font-bold tracking-wide flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#FBD7D1]" />
                  <span>{tailor.city}</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                  {tailor.badge}
                </span>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center space-x-3 -mt-8 relative z-10 mb-2">
                  <div className="relative">
                    <img
                      src={tailor.avatar}
                      alt={tailor.name}
                      referrerPolicy="no-referrer"
                      className="w-13 h-13 rounded-full object-cover border-2 border-white shadow-md bg-white"
                    />
                    {tailor.verificationStatus === 'VERIFIED' && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 rounded-full bg-[#4A3728] text-[#FBD7D1] flex items-center justify-center border-2 border-white shadow-xs">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                      </div>
                    )}
                  </div>
                  <div className="pt-4">
                    <h3 className="font-serif text-base font-bold text-[#2D2825] line-clamp-1">
                      {tailor.name}
                    </h3>
                    <p className="text-xs text-[#7D726A] line-clamp-1">{tailor.shopName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2.5 text-xs mb-2 font-medium">
                  <div className="flex items-center text-[#D4A373] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    <span>{tailor.rating}</span>
                  </div>
                  <span className="text-[#8C7A6B]">({tailor.reviewCount} reviews)</span>
                  <span className="text-[#8C7A6B]">•</span>
                  <span className="text-[#4A3728] font-bold">{tailor.completedOrders} bespoke orders</span>
                </div>

                <p className="text-xs text-[#6B584C] line-clamp-2 leading-relaxed mb-2.5 font-light">
                  {tailor.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {tailor.specialties.map((s, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#FAF7F2] text-[#6B584C] border border-[#ECE6DE]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#ECE6DE] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider block">Starting Stitching</span>
                  <p className="text-sm font-bold text-[#2D2825]">{formatINR(tailor.startingPrice)}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onContactTailor(tailor);
                    }}
                    className="px-3 py-2 rounded-full bg-[#FAF7F2] hover:bg-[#ECE6DE] text-[#2D2825] border border-[#ECE6DE] text-[11px] font-semibold transition-all cursor-pointer"
                  >
                    Chat
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTailor(tailor);
                    }}
                    className="px-3.5 py-2 rounded-full bg-[#8D2434] text-white text-[11px] font-semibold transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <span>View Atelier</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Detailed Tailor Profile Modal */}
      {selectedTailor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-[#FAF7F2] rounded-[28px] max-w-md w-full max-h-[90vh] overflow-y-auto border border-[#ECE6DE] shadow-2xl space-y-5">
            
            {/* Modal Cover */}
            <div className="relative h-44 bg-black">
              <img
                src={selectedTailor.coverImage}
                alt={selectedTailor.shopName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80"
              />
              <button
                onClick={() => onSelectTailor(null)}
                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between text-white">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedTailor.avatar}
                    alt={selectedTailor.name}
                    referrerPolicy="no-referrer"
                    className="w-15 h-15 rounded-full object-cover border-2 border-white shadow-lg bg-white"
                  />
                  <div>
                    <h2 className="font-serif text-lg font-bold">{selectedTailor.name}</h2>
                    <p className="text-xs text-[#F5F2ED]/90">{selectedTailor.shopName}</p>
                    <div className="flex items-center space-x-2 mt-0.5 text-[11px] font-medium">
                      <span className="flex items-center text-[#D4A373] font-bold">
                        <Star className="w-3 h-3 fill-current mr-0.5" />
                        {selectedTailor.rating}
                      </span>
                      <span>({selectedTailor.reviewCount} reviews)</span>
                      <span>•</span>
                      <span>{selectedTailor.experienceYears} yrs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-5 space-y-5 text-xs">
              
              {/* Studio Bio & Address */}
              <div className="space-y-2.5">
                <h3 className="font-serif text-sm font-bold text-[#2D2825]">About the Atelier</h3>
                <p className="text-[#6B584C] text-xs leading-relaxed font-light">{selectedTailor.bio}</p>
                <div className="p-3.5 rounded-2xl bg-white border border-[#ECE6DE] space-y-1.5 shadow-2xs">
                  <div className="flex items-center space-x-2 text-[#2D2825]">
                    <MapPin className="w-3.5 h-3.5 text-[#8D2434] shrink-0" />
                    <span className="truncate">{selectedTailor.shopAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#2D2825]">
                    <Phone className="w-3.5 h-3.5 text-[#8D2434] shrink-0" />
                    <span>{selectedTailor.phone}</span>
                  </div>
                </div>
              </div>

              {/* Equipment & Master Certifications */}
              <div className="grid grid-cols-1 gap-3">
                <div className="p-4 rounded-2xl bg-white border border-[#ECE6DE] space-y-1.5 shadow-2xs">
                  <h4 className="font-bold text-[#2D2825] uppercase text-[10px] tracking-wider">Studio Equipment & Craft</h4>
                  <ul className="list-disc list-inside space-y-1 text-[#6B584C] font-light">
                    {selectedTailor.equipment.map((eq, i) => (
                      <li key={i}>{eq}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-[#ECE6DE] space-y-1.5 shadow-2xs">
                  <h4 className="font-bold text-[#2D2825] uppercase text-[10px] tracking-wider">Credentials & Certificates</h4>
                  <ul className="list-disc list-inside space-y-1 text-[#6B584C] font-light">
                    {selectedTailor.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Portfolio Works */}
              <div className="space-y-2.5">
                <h3 className="font-serif text-sm font-bold text-[#2D2825]">Signature Bespoke Portfolio</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {selectedTailor.portfolio.map((work) => (
                    <div key={work.id} className="rounded-2xl overflow-hidden bg-white border border-[#ECE6DE] shadow-2xs">
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-28 object-cover"
                      />
                      <div className="p-2.5">
                        <h5 className="font-bold text-[#2D2825] truncate text-[11px]">{work.title}</h5>
                        <p className="text-[10px] text-[#7D726A]">{work.category} • ~{work.completionTimeDays}d</p>
                        <p className="text-xs font-bold text-[#8D2434] mt-0.5">{formatINR(work.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact / Inquire Action */}
              <div className="pt-3 border-t border-[#ECE6DE] flex flex-col gap-2">
                <button
                  onClick={() => {
                    const t = selectedTailor;
                    onSelectTailor(null);
                    onContactTailor(t);
                  }}
                  className="w-full py-3.5 rounded-xl bg-[#2D2825] text-white font-semibold text-xs uppercase tracking-wider hover:bg-black transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-[#E8C5CC]" />
                  <span>Start Fit Consultation & Direct Chat</span>
                </button>
                {onRequestCustomQuote && (
                  <button
                    onClick={() => {
                      const t = selectedTailor;
                      onSelectTailor(null);
                      onRequestCustomQuote(t);
                    }}
                    className="w-full py-3 rounded-xl bg-[#8D2434] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#781E2C] transition-all flex items-center justify-center space-x-2 shadow-sm cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                    <span>Design & Request Custom Quote</span>
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
