import React, { useState } from 'react';
import { Sparkles, Heart, Trash2, ArrowRight, Plus, Eye, Scissors } from 'lucide-react';
import { DressDesign } from '../../types';

interface DesignGalleryProps {
  designs: DressDesign[];
  onSelectDesign: (design: DressDesign) => void;
  onDeleteDesign: (designId: string) => void;
  onToggleFavorite: (designId: string) => void;
  onStartNewDesign: () => void;
}

export const DesignGallery: React.FC<DesignGalleryProps> = ({
  designs,
  onSelectDesign,
  onDeleteDesign,
  onToggleFavorite,
  onStartNewDesign,
}) => {
  const [filterFavorites, setFilterFavorites] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<string>('All');

  const allTags = ['All', 'Gala', 'Bridal', 'Velvet', 'Champagne Pearl', 'Emerald'];

  const filteredDesigns = designs.filter((d) => {
    if (filterFavorites && !d.isFavorite) return false;
    if (selectedTag !== 'All' && !d.tags.some(t => t.toLowerCase().includes(selectedTag.toLowerCase()))) {
      return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase tracking-widest text-[#8C7A6B] font-bold">Personal Wardrobe</span>
          <h1 className="font-serif text-3xl font-bold text-[#4A3728]">Saved AI Dress Designs</h1>
          <p className="text-xs text-[#6B584C] mt-1 font-light">Your curated collection of AI-generated haute couture creations.</p>
        </div>

        <button
          onClick={onStartNewDesign}
          className="flex items-center space-x-2 px-6 py-3 rounded-full bg-[#4A3728] text-[#F5F2ED] text-xs font-bold uppercase tracking-wider hover:scale-95 transition-all shadow-md cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#FBD7D1]" />
          <span>Create New Design</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-full bg-white/80 backdrop-blur-md border border-[#4A3728]/10 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5 pl-2">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(tag)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider transition-all cursor-pointer ${
                selectedTag === tag
                  ? 'bg-[#4A3728] text-[#FBD7D1] shadow-xs'
                  : 'bg-[#F5F2ED]/60 text-[#6B584C] hover:bg-[#F5F2ED]'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>

        <button
          onClick={() => setFilterFavorites(!filterFavorites)}
          className={`flex items-center space-x-1.5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
            filterFavorites
              ? 'bg-[#FBD7D1] text-[#4A3728] border border-[#FBD7D1]'
              : 'bg-[#F5F2ED] text-[#6B584C] border border-[#4A3728]/10 hover:text-[#4A3728]'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${filterFavorites ? 'fill-current' : ''}`} />
          <span>Favorites Only</span>
        </button>
      </div>

      {/* Designs Grid */}
      {filteredDesigns.length === 0 ? (
        <div className="text-center py-20 bg-white/80 backdrop-blur-md rounded-[36px] border border-[#4A3728]/10 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#F5F2ED] flex items-center justify-center mx-auto text-[#4A3728] shadow-xs">
            <Sparkles className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#4A3728]">No Dress Designs Found</h3>
          <p className="text-xs text-[#6B584C] max-w-sm mx-auto font-light">
            {filterFavorites
              ? "You haven't marked any designs as favorite yet."
              : "Start by generating your first bespoke gown in the AI Studio."}
          </p>
          <button
            onClick={onStartNewDesign}
            className="px-6 py-3 rounded-full bg-[#4A3728] text-[#F5F2ED] text-xs font-bold uppercase tracking-wider hover:scale-95 transition-all shadow-md cursor-pointer"
          >
            Open AI Studio
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDesigns.map((design) => {
            const currentVar = design.variations[0];
            return (
              <div
                key={design.id}
                className="group relative rounded-[28px] bg-white border border-[#4A3728]/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                {/* Image Showcase */}
                <div className="relative h-64 overflow-hidden bg-[#F5F2ED]">
                  <img
                    src={currentVar.frontImageUrl}
                    alt={design.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-[10px] font-bold uppercase tracking-wider text-[#4A3728] border border-[#4A3728]/10 shadow-xs">
                    {currentVar.specs.dressType}
                  </div>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleFavorite(design.id);
                    }}
                    className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-xs ${
                      design.isFavorite
                        ? 'bg-[#FBD7D1]/90 text-[#4A3728] border-[#FBD7D1]'
                        : 'bg-white/90 text-[#8C7A6B] border-[#4A3728]/10 hover:text-[#4A3728]'
                    }`}
                  >
                    <Heart className={`w-3.5 h-3.5 ${design.isFavorite ? 'fill-current' : ''}`} />
                  </button>
                </div>

                {/* Details */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider">
                      {currentVar.specs.fabric} • {currentVar.specs.color}
                    </span>
                    <h3 className="font-serif text-base font-bold text-[#4A3728] group-hover:text-[#8C6547] transition-colors line-clamp-1">
                      {design.title}
                    </h3>
                    <p className="text-xs text-[#6B584C] mt-1 line-clamp-2 leading-relaxed font-light">
                      {currentVar.tagline}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-[#4A3728]/10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider">Est. Craft Price</span>
                      <p className="text-xs font-bold text-[#4A3728]">
                        ${currentVar.estimatedPriceRange.min} - ${currentVar.estimatedPriceRange.max}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => onSelectDesign(design)}
                        className="flex items-center space-x-1 px-4 py-2 rounded-full bg-[#4A3728] text-[#F5F2ED] text-xs font-bold uppercase tracking-wider hover:bg-[#3D2C24] transition-all cursor-pointer shadow-xs"
                      >
                        <span>Inspect</span>
                        <ArrowRight className="w-3 h-3 text-[#FBD7D1]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
