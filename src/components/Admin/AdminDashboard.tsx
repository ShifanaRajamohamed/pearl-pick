import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  TrendingUp, 
  Package, 
  Star,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TailorProfile, Order, AnalyticsSummary } from '../../types';

interface AdminDashboardProps {
  tailors: TailorProfile[];
  orders: Order[];
  analytics: AnalyticsSummary;
  onApproveTailor: (tailorId: string) => void;
  onRejectTailor: (tailorId: string, reason: string) => void;
  onReleaseEscrow: (orderId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  tailors,
  orders,
  analytics,
  onApproveTailor,
  onRejectTailor,
  onReleaseEscrow,
}) => {
  const [selectedTailorForInspection, setSelectedTailorForInspection] = useState<TailorProfile | null>(null);
  const [activeAdminTab, setActiveAdminTab] = useState<'verification' | 'orders' | 'analytics'>('verification');

  const pendingTailors = tailors.filter((t) => t.verificationStatus === 'PENDING' || t.verificationStatus === 'UNDER_REVIEW');
  const verifiedTailors = tailors.filter((t) => t.verificationStatus === 'VERIFIED');

  const handleApprove = (tailorId: string) => {
    onApproveTailor(tailorId);
    setSelectedTailorForInspection(null);
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#4A3728', '#B47B84', '#E9D4D7']
    });
  };

  const handleReject = (tailorId: string) => {
    onRejectTailor(tailorId, 'Incomplete proof of master atelier equipment and certification.');
    setSelectedTailorForInspection(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3.5 py-1 rounded-full bg-[#E9D4D7] text-[#4A3728] border border-[#B47B84]/30 text-[10px] font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-[#B47B84]" />
            <span>Marketplace Trust & Governance</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-[#2D2825]">
            Marketplace Admin Control Center
          </h1>
          <p className="text-xs text-[#726761] mt-0.5 font-light">
            Verify master tailor applications, monitor Bharat Escrow funds, and track AI platform metrics.
          </p>
        </div>

        {/* Admin Subtabs */}
        <div className="flex items-center bg-white p-1.5 rounded-full border border-[#E4D9D1] text-xs font-semibold shadow-xs">
          <button
            onClick={() => setActiveAdminTab('verification')}
            className={`px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeAdminTab === 'verification'
                ? 'bg-[#4A3728] text-[#F9F6F2] shadow-xs'
                : 'text-[#726761] hover:text-[#2D2825]'
            }`}
          >
            KYC Verifications ({pendingTailors.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('orders')}
            className={`px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeAdminTab === 'orders'
                ? 'bg-[#4A3728] text-[#F9F6F2] shadow-xs'
                : 'text-[#726761] hover:text-[#2D2825]'
            }`}
          >
            Escrow & Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveAdminTab('analytics')}
            className={`px-4 py-2 rounded-full transition-all text-xs font-bold uppercase tracking-wider cursor-pointer ${
              activeAdminTab === 'analytics'
                ? 'bg-[#4A3728] text-[#F9F6F2] shadow-xs'
                : 'text-[#726761] hover:text-[#2D2825]'
            }`}
          >
            Platform Analytics
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-[24px] bg-white border border-[#E4D9D1] shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#726761]">Gross Marketplace Value</span>
          <p className="font-serif text-2xl font-bold text-[#2D2825] mt-1">
            ₹{(analytics?.totalGrossMarketplaceValue ?? 1845000).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[#4A3728] font-bold flex items-center space-x-1 mt-1">
            <TrendingUp className="w-3 h-3 text-[#B47B84]" />
            <span>+24.8% this month</span>
          </span>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#E4D9D1] shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#726761]">Escrow Vault Volume</span>
          <p className="font-serif text-2xl font-bold text-[#2D2825] mt-1">
            ₹{(analytics?.activeEscrowVaultVolume ?? 420000).toLocaleString('en-IN')}
          </p>
          <span className="text-[10px] text-[#726761] block mt-1 font-light">100% insured balance</span>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#E4D9D1] shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#726761]">AI Dress Generations</span>
          <p className="font-serif text-2xl font-bold text-[#2D2825] mt-1">
            {(analytics?.totalDressDesignsGenerated ?? 8450).toLocaleString()}
          </p>
          <span className="text-[10px] text-[#B47B84] font-bold block mt-1 flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" />
            <span>Flux + Gemini 2.5</span>
          </span>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#E4D9D1] shadow-xs">
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#726761]">Verified Ateliers</span>
          <p className="font-serif text-2xl font-bold text-[#2D2825] mt-1">
            {analytics?.verifiedTailorsCount ?? verifiedTailors.length} of {tailors.length}
          </p>
          <span className="text-[10px] text-[#726761] block mt-1 font-light">Strict vetting standard</span>
        </div>
      </div>

      {/* Tab 1: Tailor Verification Queue */}
      {activeAdminTab === 'verification' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-[#2D2825]">
              Pending Tailor Verification Applications ({pendingTailors.length})
            </h2>
          </div>

          {pendingTailors.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-[32px] border border-[#E4D9D1] space-y-2 shadow-xs">
              <CheckCircle2 className="w-10 h-10 text-[#6E8765] mx-auto" />
              <h3 className="font-serif text-base font-bold text-[#2D2825]">All Atelier Applications Reviewed</h3>
              <p className="text-xs text-[#726761] font-light">The master tailor verification queue is clear.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingTailors.map((tailor) => (
                <div key={tailor.id} className="bg-white rounded-[32px] border border-[#E4D9D1] p-6 shadow-xs space-y-4">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={tailor.avatar}
                      alt={tailor.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-full object-cover border-2 border-[#E4D9D1] shadow-xs"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-serif text-base font-bold text-[#2D2825]">{tailor.name}</h3>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E9D4D7] text-[#4A3728] border border-[#B47B84]/30">
                          {tailor.verificationStatus}
                        </span>
                      </div>
                      <p className="text-xs text-[#726761] font-light">{tailor.shopName} • {tailor.city}, {tailor.country}</p>
                      <p className="text-[11px] text-[#2D2825] mt-0.5 font-medium">{tailor.experienceYears} Years Atelier Experience</p>
                    </div>
                  </div>

                  <div className="p-4 rounded-[20px] bg-[#F9F6F2] text-xs text-[#2D2825] space-y-1.5 border border-[#E4D9D1]">
                    <span className="font-bold text-[#4A3728] uppercase text-[9px] tracking-wider block">Specialties & Equipment</span>
                    <p className="line-clamp-2 font-light">{tailor.specialties.join(', ')}</p>
                    <p className="text-[11px] text-[#726761] font-light">{tailor.equipment.join(' • ')}</p>
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <button
                      onClick={() => handleApprove(tailor.id)}
                      className="flex-1 py-3 rounded-full bg-[#4A3728] hover:bg-[#38291E] text-[#F9F6F2] font-bold text-xs uppercase tracking-wider hover:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#E9D4D7]" />
                      <span>Approve & Grant Master Badge</span>
                    </button>
                    <button
                      onClick={() => handleReject(tailor.id)}
                      className="px-4 py-3 rounded-full bg-[#F3ECE6] text-[#726761] border border-[#E4D9D1] font-bold text-xs uppercase tracking-wider hover:bg-white hover:text-[#2D2825] transition-all cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List of Already Verified Tailors */}
          <div className="pt-6 border-t border-[#E4D9D1]">
            <h3 className="font-serif text-lg font-bold text-[#2D2825] mb-3">
              Currently Verified Master Ateliers ({verifiedTailors.length})
            </h3>
            <div className="bg-white rounded-[28px] border border-[#E4D9D1] divide-y divide-[#E4D9D1] overflow-hidden text-xs shadow-xs">
              {verifiedTailors.map((t) => (
                <div key={t.id} className="p-4 flex items-center justify-between">
                  <div className="flex items-center space-x-3.5">
                    <img src={t.avatar} alt={t.name} referrerPolicy="no-referrer" className="w-10 h-10 rounded-full object-cover border border-[#E4D9D1]" />
                    <div>
                      <h4 className="font-bold text-[#2D2825]">{t.name} ({t.shopName})</h4>
                      <p className="text-[11px] text-[#726761] font-light">{t.city} • Rating: {t.rating} ★ • {t.completedOrders} orders</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#E9D4D7] text-[#4A3728] border border-[#B47B84]/30">
                    Verified Active
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Orders & Escrow Management */}
      {activeAdminTab === 'orders' && (
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-[#2D2825]">Bharat Escrow Vault & Order Oversight</h2>
          <div className="bg-white rounded-[28px] border border-[#E4D9D1] divide-y divide-[#E4D9D1] overflow-hidden text-xs shadow-xs">
            {orders.map((order) => {
              const dressVar = order.variation || order.design;
              return (
                <div key={order.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <img 
                      src={dressVar?.frontImageUrl || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'} 
                      alt={dressVar?.name || 'Order Item'} 
                      referrerPolicy="no-referrer" 
                      className="w-16 h-16 rounded-2xl object-cover border border-[#E4D9D1]" 
                    />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#726761]">Order #{order.id}</span>
                      <h4 className="font-serif text-base font-bold text-[#2D2825]">{dressVar?.name || 'Bespoke Order'}</h4>
                      <p className="text-[#726761] font-light">Customer: <strong className="font-bold text-[#2D2825]">{order.customerName}</strong> • Tailor: <strong className="font-bold text-[#2D2825]">{order.tailorName}</strong></p>
                      <p className="text-[11px] text-[#726761] font-light">Escrow Vault: {order.escrowVaultId || 'VAULT-001'} ({order.escrowStatus})</p>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-[#E4D9D1] sm:pl-6">
                    <span className="text-[9px] text-[#726761] uppercase tracking-wider font-bold">Total Escrow</span>
                    <p className="font-serif text-xl font-bold text-[#2D2825]">₹{order.totalAmount.toLocaleString('en-IN')}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#E9D4D7] text-[#4A3728] border border-[#B47B84]/30">
                      {order.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Platform Analytics */}
      {activeAdminTab === 'analytics' && (
        <div className="space-y-6">
          <h2 className="font-serif text-xl font-bold text-[#2D2825]">Haute Couture Platform Metrics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-[#E4D9D1] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#2D2825]">Top Generating Dress Categories</h3>
              <div className="space-y-3.5 text-xs">
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-[#2D2825]">
                    <span>Bridal Lehengas & Sets</span>
                    <span>44%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F9F6F2] rounded-full overflow-hidden border border-[#E4D9D1]">
                    <div className="w-[44%] h-full bg-[#4A3728] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-[#2D2825]">
                    <span>Evening & Gala Gowns</span>
                    <span>32%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F9F6F2] rounded-full overflow-hidden border border-[#E4D9D1]">
                    <div className="w-[32%] h-full bg-[#B47B84] rounded-full" />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between font-semibold mb-1 text-[#2D2825]">
                    <span>Indo-Western & Corset Couture</span>
                    <span>24%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#F9F6F2] rounded-full overflow-hidden border border-[#E4D9D1]">
                    <div className="w-[24%] h-full bg-[#E9D4D7] rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[32px] p-6 sm:p-7 border border-[#E4D9D1] shadow-xs space-y-4">
              <h3 className="font-serif text-base font-bold text-[#2D2825]">Escrow Security & Fulfillment</h3>
              <div className="space-y-3 text-xs text-[#2D2825]">
                <div className="p-3.5 rounded-2xl bg-[#F9F6F2] flex justify-between items-center border border-[#E4D9D1]">
                  <span className="font-light text-[#726761]">Dispute Rate:</span>
                  <span className="font-bold text-[#6E8765]">0.04% (Benchmark: 1.8%)</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F9F6F2] flex justify-between items-center border border-[#E4D9D1]">
                  <span className="font-light text-[#726761]">Average Turnaround Time:</span>
                  <span className="font-bold text-[#2D2825]">14.2 Days</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F9F6F2] flex justify-between items-center border border-[#E4D9D1]">
                  <span className="font-light text-[#726761]">Customer Fit Satisfaction:</span>
                  <span className="font-bold text-[#2D2825]">99.6% First-Time Fit</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
