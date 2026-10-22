import React from 'react';
import { X, Printer, Download, Sparkles, Scissors, Layers, CheckCircle2 } from 'lucide-react';
import { DressDesignVariation, MeasurementSheet } from '../types';

interface SpecSheetExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  variation: DressDesignVariation | null;
  measurements: MeasurementSheet;
}

export const SpecSheetExportModal: React.FC<SpecSheetExportModalProps> = ({
  isOpen,
  onClose,
  variation,
  measurements,
}) => {
  if (!isOpen || !variation) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F5F2ED] rounded-[36px] sm:rounded-[44px] max-w-3xl w-full border border-[#4A3728]/10 shadow-2xl p-6 sm:p-8 space-y-6 my-8 print:p-0 print:border-none print:shadow-none">
        
        {/* Header & Print Actions */}
        <div className="flex items-center justify-between border-b border-[#4A3728]/10 pb-4 print:hidden">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#4A3728]" />
            <h2 className="font-serif text-lg sm:text-xl font-bold text-[#4A3728]">
              Haute Couture Technical Specification Sheet
            </h2>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-full bg-[#4A3728] text-[#F5F2ED] text-xs font-bold uppercase tracking-wider hover:scale-95 transition-all shadow-md cursor-pointer"
            >
              <Printer className="w-4 h-4 text-[#FBD7D1]" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white text-[#4A3728] flex items-center justify-center hover:bg-[#F5F2ED] transition-all border border-[#4A3728]/10 shadow-xs cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Spec Sheet Document Body */}
        <div className="space-y-6 text-xs text-[#4A3728] font-sans">
          
          {/* Document Title Banner */}
          <div className="flex items-center justify-between p-5 bg-white/80 backdrop-blur-md rounded-[28px] border border-[#4A3728]/10 shadow-xs">
            <div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-[#8C7A6B]">PEARL PICK! HAUTE COUTURE SPECIFICATION</span>
              <h1 className="font-serif text-2xl font-bold text-[#4A3728] mt-0.5">{variation.name}</h1>
              <p className="text-[#6B584C] text-xs font-light">Bespoke Pattern Reference Code: PP-{variation.id}</p>
            </div>
            <div className="text-right">
              <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider block">Generated On</span>
              <span className="font-bold text-[#4A3728]">{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Garment Visual & Key Attributes */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-start">
            <div className="sm:col-span-1 rounded-[24px] overflow-hidden border border-[#4A3728]/10 bg-white shadow-xs">
              <img
                src={variation.frontImageUrl}
                alt={variation.name}
                referrerPolicy="no-referrer"
                className="w-full h-64 object-cover"
              />
            </div>

            <div className="sm:col-span-2 space-y-3">
              <h3 className="font-serif text-base font-bold text-[#4A3728]">Architectural Blueprint</h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Silhouette:</span>
                  <span className="font-bold text-[#4A3728]">{variation.specs.dressType}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Occasion:</span>
                  <span className="font-bold text-[#4A3728]">{variation.specs.occasion}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Neckline:</span>
                  <span className="font-bold text-[#4A3728]">{variation.specs.neckline}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Sleeve Style:</span>
                  <span className="font-bold text-[#4A3728]">{variation.specs.sleeve}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Color Swatch:</span>
                  <span className="font-bold text-[#4A3728]">{variation.specs.color}</span>
                </div>
                <div className="p-3 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Embellishment:</span>
                  <span className="font-bold text-[#4A3728]">{variation.specs.pattern}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Textile & Yardage Calculations */}
          <div className="space-y-2 border-t border-[#4A3728]/10 pt-4">
            <h3 className="font-serif text-base font-bold text-[#4A3728] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-[#8C6547]" />
              <span>Bill of Materials (BOM) & Textile Mechanics</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Primary Shell:</span>
                <span className="font-bold text-[#4A3728]">{variation.fabricDetails.primary}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Internal Lining:</span>
                <span className="font-bold text-[#4A3728]">{variation.fabricDetails.lining}</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Required Yardage:</span>
                <span className="font-bold text-[#4A3728]">{variation.fabricDetails.estimatedYards} Yards</span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Textile Density:</span>
                <span className="font-bold text-[#4A3728]">{variation.fabricDetails.recommendedWeightGsm} GSM</span>
              </div>
            </div>
          </div>

          {/* 14-Point Measurement Profile */}
          <div className="space-y-2 border-t border-[#4A3728]/10 pt-4">
            <h3 className="font-serif text-base font-bold text-[#4A3728] flex items-center space-x-2">
              <Scissors className="w-4 h-4 text-[#8C6547]" />
              <span>Customer 14-Point Calibrated Dimensions ({measurements.unit})</span>
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">
                  {measurements.genderCategory === 'men' || measurements.chest ? 'Chest' : 'Bust'}
                </span>
                <span className="font-bold text-sm text-[#4A3728]">
                  {measurements.chest || measurements.bust}{measurements.unit === 'cm' ? 'cm' : '"'}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">
                  {measurements.genderCategory === 'men' || measurements.trouserWaist ? 'Waist' : 'Waist'}
                </span>
                <span className="font-bold text-sm text-[#4A3728]">
                  {measurements.trouserWaist || measurements.waist}{measurements.unit === 'cm' ? 'cm' : '"'}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">
                  {measurements.genderCategory === 'men' || measurements.seatHip ? 'Seat / Hip' : 'Low Hip'}
                </span>
                <span className="font-bold text-sm text-[#4A3728]">
                  {measurements.seatHip || measurements.lowHip}{measurements.unit === 'cm' ? 'cm' : '"'}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Shoulder</span>
                <span className="font-bold text-sm text-[#4A3728]">
                  {measurements.shoulderWidth || measurements.shoulderToShoulder}{measurements.unit === 'cm' ? 'cm' : '"'}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">
                  {measurements.genderCategory === 'men' || measurements.jacketLength ? 'Length' : 'Waist-Hem'}
                </span>
                <span className="font-bold text-sm text-[#4A3728]">
                  {measurements.jacketLength || measurements.waistToHem}{measurements.unit === 'cm' ? 'cm' : '"'}
                </span>
              </div>
              <div className="p-2.5 rounded-2xl bg-white border border-[#4A3728]/10 shadow-xs">
                <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block">Height</span>
                <span className="font-bold text-sm text-[#4A3728]">{measurements.height}{measurements.unit === 'cm' ? 'cm' : '"'}</span>
              </div>
            </div>
          </div>

          {/* Construction & Seam Instructions */}
          <div className="space-y-2 border-t border-[#4A3728]/10 pt-4">
            <h3 className="font-serif text-base font-bold text-[#4A3728]">Master Tailor Sewing Directives</h3>
            <ul className="list-disc list-inside space-y-1.5 text-xs text-[#594437] font-light leading-relaxed">
              {variation.tailorNotes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
