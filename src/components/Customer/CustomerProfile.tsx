import React from 'react';
import { 
  User, 
  Ruler, 
  MapPin, 
  Heart, 
  Package, 
  ShieldCheck, 
  Sparkles, 
  Edit3, 
  CheckCircle2,
  Clock
} from 'lucide-react';
import { CustomerProfile as CustomerProfileType, MeasurementSheet, Order, DressDesign } from '../../types';
import { PWAInstallButton } from '../PWAInstallButton';

interface CustomerProfileProps {
  profile: CustomerProfileType;
  measurements: MeasurementSheet;
  savedDesigns: DressDesign[];
  orders: Order[];
  onOpenMeasurementsModal: () => void;
  onNavigateToStudio: () => void;
  onNavigateToOrders: () => void;
}

export const CustomerProfileView: React.FC<CustomerProfileProps> = ({
  profile,
  measurements,
  savedDesigns,
  orders,
  onOpenMeasurementsModal,
  onNavigateToStudio,
  onNavigateToOrders,
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Profile Header */}
      <div className="bg-white/80 backdrop-blur-md rounded-[36px] p-6 sm:p-8 border border-[#4A3728]/10 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <img
            src={profile.avatar}
            alt={profile.name}
            referrerPolicy="no-referrer"
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#4A3728]/20 shadow-xs"
          />
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3728]">
                {profile.name}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#F5F2ED] text-[#4A3728] border border-[#4A3728]/10">
                {profile.preferredCurrency} Member
              </span>
            </div>
            <p className="text-xs text-[#8C7A6B] mt-0.5">{profile.email} • {profile.phone}</p>
            <p className="text-xs text-[#6B584C] mt-1 flex items-center space-x-1 font-light">
              <MapPin className="w-3.5 h-3.5 text-[#8C6547]" />
              <span>{profile.deliveryAddress}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <PWAInstallButton variant="button" />
          <button
            onClick={onOpenMeasurementsModal}
            className="flex items-center justify-center space-x-2 px-5 py-2.5 rounded-full bg-[#4A3728] text-[#F5F2ED] text-xs font-bold uppercase tracking-wider hover:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Ruler className="w-4 h-4 text-[#FBD7D1]" />
            <span>14-Point Measurements</span>
          </button>
        </div>
      </div>

      {/* Wardrobe & Activity Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-[24px] bg-white/80 backdrop-blur-md border border-[#4A3728]/10 shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C7A6B]">Saved AI Designs</span>
          <p className="font-serif text-2xl font-bold text-[#4A3728] mt-1">{savedDesigns.length}</p>
          <span className="text-[10px] text-[#8C7A6B] block mt-1 font-light">Couture portfolio</span>
        </div>

        <div className="p-5 rounded-[24px] bg-white/80 backdrop-blur-md border border-[#4A3728]/10 shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C7A6B]">Active Atelier Orders</span>
          <p className="font-serif text-2xl font-bold text-[#4A3728] mt-1">{orders.length}</p>
          <span className="text-[10px] text-[#4A3728] font-bold block mt-1">In progress</span>
        </div>

        <div className="p-5 rounded-[24px] bg-white/80 backdrop-blur-md border border-[#4A3728]/10 shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C7A6B]">Measurement Status</span>
          <p className="font-serif text-lg font-bold text-[#4A3728] mt-1">Calibrated</p>
          <span className="text-[10px] text-[#8C7A6B] block mt-1 font-light">14-Point Verified</span>
        </div>

        <div className="p-5 rounded-[24px] bg-white/80 backdrop-blur-md border border-[#4A3728]/10 shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C7A6B]">Escrow Protection</span>
          <p className="font-serif text-lg font-bold text-[#4A3728] mt-1">Insured</p>
          <span className="text-[10px] text-[#8C7A6B] block mt-1 font-light">100% Guaranteed Fit</span>
        </div>
      </div>

      {/* 14-Point Measurement Summary Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] p-6 sm:p-7 border border-[#4A3728]/10 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#4A3728] flex items-center space-x-2">
              <Ruler className="w-4 h-4 text-[#8C6547]" />
              <span>Digital Tailoring Fit Profile ({measurements.unit})</span>
            </h2>
            <p className="text-xs text-[#8C7A6B] font-light">Last updated: {new Date(measurements.updatedAt).toLocaleDateString()}</p>
          </div>

          <button
            onClick={onOpenMeasurementsModal}
            className="text-xs font-bold uppercase tracking-wider text-[#4A3728] hover:text-[#8C6547] flex items-center space-x-1 cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Recalibrate</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 text-xs">
          <div className="p-3 rounded-2xl bg-[#F5F2ED]/60 border border-[#4A3728]/10">
            <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider block">Full Bust</span>
            <span className="text-sm font-bold text-[#4A3728]">{measurements.bust}"</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F5F2ED]/60 border border-[#4A3728]/10">
            <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider block">Natural Waist</span>
            <span className="text-sm font-bold text-[#4A3728]">{measurements.waist}"</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F5F2ED]/60 border border-[#4A3728]/10">
            <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider block">Low Hip / Seat</span>
            <span className="text-sm font-bold text-[#4A3728]">{measurements.lowHip}"</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F5F2ED]/60 border border-[#4A3728]/10">
            <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider block">Shoulders</span>
            <span className="text-sm font-bold text-[#4A3728]">{measurements.shoulderToShoulder}"</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F5F2ED]/60 border border-[#4A3728]/10">
            <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider block">Hollow to Floor</span>
            <span className="text-sm font-bold text-[#4A3728]">{measurements.hollowToFloor}"</span>
          </div>
          <div className="p-3 rounded-2xl bg-[#F5F2ED]/60 border border-[#4A3728]/10">
            <span className="text-[9px] text-[#8C7A6B] uppercase font-bold tracking-wider block">Height</span>
            <span className="text-sm font-bold text-[#4A3728]">{measurements.height}"</span>
          </div>
        </div>

        {measurements.postureNotes && (
          <div className="p-4 rounded-2xl bg-[#F5F2ED]/60 border border-[#4A3728]/10 text-xs text-[#6B584C] font-light">
            <strong className="font-bold text-[#4A3728]">Fit & Posture Notes:</strong> {measurements.postureNotes}
          </div>
        )}
      </div>

    </div>
  );
};
