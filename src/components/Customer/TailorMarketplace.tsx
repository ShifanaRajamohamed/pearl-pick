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
  gender?: 'women' | 'men';
}

export const TailorMarketplace: React.FC<TailorMarketplaceProps> = ({
  tailors,
  selectedTailor,
  onSelectTailor,
  onContactTailor,
  gender = 'women'
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>(
    gender === 'men' ? "Men's Bespoke Suiting" : 'All'
  );
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(true);

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

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div>
        <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold">Atelier Marketplace</span>
        <h1 className="font-serif text-3xl font-bold text-[#4A3728]">Verified Master Tailors & Couturiers</h1>
        <p className="text-xs text-[#6B584C] mt-1 font-light">Discover vetted master pattern makers, artisans, and couture studios for bespoke garment tailoring.</p>
      </div>

      {/* Search & Specialty Filters */}
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] border border-[#4A3728]/10 p-5 shadow-sm space-y-4">
        
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by tailor name, atelier, specialty, or city..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full bg-[#F5F2ED]/60 border border-[#4A3728]/10 text-xs text-[#4A3728] placeholder-[#8C7A6B] focus:outline-none focus:border-[#4A3728] font-light"
            />
          </div>

          <button
            onClick={() => setVerifiedOnly(!verifiedOnly)}
            className={`flex items-center space-x-1.5 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider border transition-all shrink-0 cursor-pointer ${
              verifiedOnly
                ? 'bg-[#4A3728] text-[#FBD7D1] border-[#4A3728] shadow-xs'
                : 'bg-[#F5F2ED]/60 text-[#6B584C] border-[#4A3728]/10 hover:bg-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified Ateliers Only</span>
          </button>
        </div>

        {/* Specialty Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          <span className="text-[10px] text-[#8C7A6B] uppercase font-bold tracking-wider shrink-0">Specialty:</span>
          {specialties.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedSpecialty(s)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                selectedSpecialty === s
                  ? 'bg-[#4A3728] text-[#F5F2ED] shadow-xs'
                  : 'bg-[#F5F2ED]/60 text-[#6B584C] hover:bg-white border border-[#4A3728]/5'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

      </div>

      {/* Tailor Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTailors.map((tailor) => (
          <div
            key={tailor.id}
            onClick={() => onSelectTailor(tailor)}
            className="group rounded-[32px] bg-white/80 backdrop-blur-md border border-[#4A3728]/10 overflow-hidden shadow-xs hover:shadow-xl hover:shadow-[#4A3728]/5 transition-all cursor-pointer flex flex-col justify-between"
          >
            {/* Atelier Cover Banner */}
            <div className="relative h-36 overflow-hidden bg-[#F5F2ED]">
              <img
                src={tailor.coverImage}
                alt={tailor.shopName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
              
              <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                <span className="text-xs font-bold tracking-wide flex items-center space-x-1">
                  <MapPin className="w-3 h-3 text-[#FBD7D1]" />
                  <span>{tailor.city}, {tailor.country}</span>
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20">
                  {tailor.badge}
                </span>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center space-x-3 -mt-9 relative z-10 mb-2">
                  <div className="relative">
                    <img
                      src={tailor.avatar}
                      alt={tailor.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md bg-white"
                    />
                    {tailor.verificationStatus === 'VERIFIED' && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#4A3728] text-[#FBD7D1] flex items-center justify-center border-2 border-white shadow-xs">
                        <CheckCircle2 className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                  <div className="pt-5">
                    <h3 className="font-serif text-base font-bold text-[#4A3728] group-hover:text-[#8C6547] transition-colors line-clamp-1">
                      {tailor.name}
                    </h3>
                    <p className="text-xs text-[#8C7A6B] line-clamp-1">{tailor.shopName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 text-xs mb-3 font-medium">
                  <div className="flex items-center text-[#D4A373] font-bold">
                    <Star className="w-3.5 h-3.5 fill-current mr-1" />
                    <span>{tailor.rating}</span>
                  </div>
                  <span className="text-[#8C7A6B]">({tailor.reviewCount} reviews)</span>
                  <span className="text-[#8C7A6B]">•</span>
                  <span className="text-[#4A3728] font-bold">{tailor.completedOrders} bespoke orders</span>
                </div>

                <p className="text-xs text-[#6B584C] line-clamp-2 leading-relaxed mb-3 font-light">
                  {tailor.bio}
                </p>

                <div className="flex flex-wrap gap-1">
                  {tailor.specialties.map((s, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F5F2ED] text-[#6B584C] border border-[#4A3728]/5">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-[#4A3728]/10 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider">Starting Price</span>
                  <p className="text-sm font-bold text-[#4A3728]">₹{tailor.startingPrice.toLocaleString('en-IN')}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTailor(tailor);
                  }}
                  className="px-4 py-2 rounded-full bg-[#4A3728] text-[#F5F2ED] text-[11px] font-bold uppercase tracking-wider hover:scale-95 transition-all flex items-center space-x-1 cursor-pointer"
                >
                  <span>View Atelier</span>
                  <ChevronRight className="w-3 h-3 text-[#FBD7D1]" />
                </button>
              </div>

            </div>
          </div>
        ))}
      </div>

      {/* Detailed Tailor Profile Modal */}
      {selectedTailor && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F5F2ED] rounded-[36px] sm:rounded-[44px] max-w-3xl w-full border border-[#4A3728]/10 shadow-2xl overflow-hidden my-8 space-y-6">
            
            {/* Modal Cover */}
            <div className="relative h-48 sm:h-56 bg-black">
              <img
                src={selectedTailor.coverImage}
                alt={selectedTailor.shopName}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover opacity-80"
              />
              <button
                onClick={() => onSelectTailor(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/80 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between text-white">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedTailor.avatar}
                    alt={selectedTailor.name}
                    referrerPolicy="no-referrer"
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 border-white shadow-lg bg-white"
                  />
                  <div>
                    <h2 className="font-serif text-xl sm:text-2xl font-bold">{selectedTailor.name}</h2>
                    <p className="text-xs sm:text-sm text-[#F5F2ED]/90">{selectedTailor.shopName}</p>
                    <div className="flex items-center space-x-2 mt-1 text-xs font-medium">
                      <span className="flex items-center text-[#D4A373] font-bold">
                        <Star className="w-3.5 h-3.5 fill-current mr-1" />
                        {selectedTailor.rating}
                      </span>
                      <span>({selectedTailor.reviewCount} reviews)</span>
                      <span>•</span>
                      <span>{selectedTailor.experienceYears} Years Experience</span>
                    </div>
                  </div>
                </div>

                <span className="hidden sm:inline-block px-3.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider border border-white/20">
                  {selectedTailor.badge}
                </span>
              </div>
            </div>

            <div className="p-6 sm:p-8 space-y-6 text-xs">
              
              {/* Studio Bio & Address */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-[#4A3728]">About the Atelier</h3>
                <p className="text-[#6B584C] text-xs sm:text-sm leading-relaxed font-light">{selectedTailor.bio}</p>
                <div className="p-4 rounded-[24px] bg-white border border-[#4A3728]/10 flex items-center justify-between shadow-xs">
                  <div className="flex items-center space-x-2 text-[#4A3728]">
                    <MapPin className="w-4 h-4 text-[#8C6547]" />
                    <span>{selectedTailor.shopAddress}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-[#4A3728]">
                    <Phone className="w-4 h-4 text-[#8C6547]" />
                    <span>{selectedTailor.phone}</span>
                  </div>
                </div>
              </div>

              {/* Equipment & Master Certifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-5 rounded-[24px] bg-white border border-[#4A3728]/10 space-y-2 shadow-xs">
                  <h4 className="font-bold text-[#4A3728] uppercase text-[10px] tracking-wider">Studio Equipment</h4>
                  <ul className="list-disc list-inside space-y-1 text-[#6B584C] font-light">
                    {selectedTailor.equipment.map((eq, i) => (
                      <li key={i}>{eq}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-5 rounded-[24px] bg-white border border-[#4A3728]/10 space-y-2 shadow-xs">
                  <h4 className="font-bold text-[#4A3728] uppercase text-[10px] tracking-wider">Credentials & Certificates</h4>
                  <ul className="list-disc list-inside space-y-1 text-[#6B584C] font-light">
                    {selectedTailor.certifications.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Portfolio Works */}
              <div className="space-y-3">
                <h3 className="font-serif text-base font-bold text-[#4A3728]">Previous Haute Couture Works</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedTailor.portfolio.map((work) => (
                    <div key={work.id} className="rounded-[20px] overflow-hidden bg-white border border-[#4A3728]/10 shadow-xs">
                      <img
                        src={work.imageUrl}
                        alt={work.title}
                        referrerPolicy="no-referrer"
                        className="w-full h-36 object-cover"
                      />
                      <div className="p-3">
                        <h5 className="font-bold text-[#4A3728] truncate">{work.title}</h5>
                        <p className="text-[10px] text-[#8C7A6B]">{work.category} • ~{work.completionTimeDays} days</p>
                        <p className="text-xs font-bold text-[#4A3728] mt-1">₹{work.price.toLocaleString('en-IN')}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contact / Inquire Action */}
              <div className="pt-4 border-t border-[#4A3728]/10 flex items-center space-x-3">
                <button
                  onClick={() => onContactTailor(selectedTailor)}
                  className="flex-1 py-4 rounded-full bg-[#4A3728] text-[#F5F2ED] font-bold text-xs uppercase tracking-widest hover:scale-95 transition-all flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#FBD7D1]" />
                  <span>Start Fit Consultation & Direct Chat</span>
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
