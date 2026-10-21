import React from 'react';
import { 
  Printer, 
  X, 
  CheckCircle2, 
  ShieldCheck, 
  Award, 
  Sparkles, 
  Calendar, 
  Download, 
  MapPin, 
  FileText
} from 'lucide-react';
import { Order } from '../../types';

interface PrintableOrderSummaryProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintableOrderSummary: React.FC<PrintableOrderSummaryProps> = ({
  order,
  isOpen,
  onClose
}) => {
  if (!isOpen || !order) return null;

  const variation = order.variation || order.design;
  const isDelivered = order.status === 'DELIVERED';
  const orderDate = new Date(order.orderDate || order.createdAt || Date.now()).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div 
      id="printable-order-modal"
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex justify-center items-start p-2 sm:p-6"
    >
      <div className="relative w-full max-w-3xl bg-white rounded-[20px] sm:rounded-[24px] shadow-2xl border border-[#ECE6DE] my-4 overflow-hidden">
        
        {/* Top Floating Control Bar (Hidden when printing via .no-print) */}
        <div className="no-print sticky top-0 z-30 bg-[#2D2825] text-white px-5 py-3.5 flex items-center justify-between border-b border-[#3D3530]">
          <div className="flex items-center gap-2">
            <Printer className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide">
              Printable Order Summary & Invoice
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleTriggerPrint}
              className="px-4 py-1.5 rounded-full bg-[#8D2434] hover:bg-[#781E2C] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* PRINTABLE DOCUMENT BODY (Targeted by #printable-order-document in print CSS) */}
        <div id="printable-order-document" className="p-6 sm:p-10 bg-white text-[#2D2825] space-y-8 font-sans">
          
          {/* 1. Atelier Official Letterhead Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-6 border-b-2 border-[#2D2825] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#2D2825]">
                  PEARL PICK!
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#FAF7F2] border border-[#ECE6DE] text-[#8D2434]">
                  Haute Couture Atelier
                </span>
              </div>
              <p className="text-xs text-[#7D726A] mt-1 font-light tracking-wide">
                Bespoke Tailoring Specifications, Craftsmanship Record & Escrow Receipt
              </p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-1 bg-[#FAF7F2] text-[#8D2434] border-[#F2D1D7]">
                {isDelivered ? '✓ Delivered & Fit Verified' : '● Tailoring In Production'}
              </span>
              <p className="text-xs font-mono font-semibold text-[#2D2825]">
                Order #{order.id}
              </p>
              <p className="text-[11px] text-[#7D726A]">
                Date: {orderDate}
              </p>
            </div>
          </div>

          {/* 2. Client & Master Tailor Dossiers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE]">
            {/* Client Section */}
            <div className="space-y-1 text-xs">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7D726A] block">
                Commissioned By
              </span>
              <h4 className="font-bold text-sm text-[#2D2825]">
                {order.customerName || 'Aanya Sharma'}
              </h4>
              <p className="text-[#7D726A] font-light">
                Delivery: White Glove Bespoke Courier Service
              </p>
              <p className="text-[#7D726A] font-light">
                Status: Insured Doorstep Delivery
              </p>
            </div>

            {/* Master Darzi Atelier Section */}
            <div className="space-y-1 text-xs sm:border-l sm:border-[#ECE6DE] sm:pl-6">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#7D726A] block">
                Master Atelier & Guild Tailor
              </span>
              <h4 className="font-bold text-sm text-[#2D2825] flex items-center gap-1.5">
                <span>{order.tailorName}</span>
                <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
              </h4>
              <p className="text-[#7D726A] font-light">
                Studio: Heritage Needlework Guild, Studio 4A
              </p>
              <p className="text-[#7D726A] font-light font-mono text-[11px]">
                Escrow Vault: {order.escrowVaultId || 'NPCI-ESCROW-2026-8801'}
              </p>
            </div>
          </div>

          {/* 3. Garment Technical Specifications */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#2D2825] pb-1 border-b border-[#ECE6DE] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8D2434]" />
              <span>Garment Specifications & Textile Profile</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#ECE6DE]">
                <span className="text-[10px] text-[#7D726A] block">Silhouette / Design</span>
                <span className="font-semibold text-[#2D2825] truncate block mt-0.5">
                  {variation?.name || 'Bespoke Haute Couture Creation'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#ECE6DE]">
                <span className="text-[10px] text-[#7D726A] block">Primary Fabric & Weight</span>
                <span className="font-semibold text-[#2D2825] truncate block mt-0.5">
                  {variation?.specs?.fabric || 'Mulberry Silk Organza (120 GSM)'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#ECE6DE]">
                <span className="text-[10px] text-[#7D726A] block">Color & Palette</span>
                <span className="font-semibold text-[#2D2825] truncate block mt-0.5">
                  {variation?.specs?.color || 'Pearl Blush & Champagne'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#ECE6DE]">
                <span className="text-[10px] text-[#7D726A] block">Neckline & Cut</span>
                <span className="font-semibold text-[#2D2825] truncate block mt-0.5">
                  {variation?.specs?.neckline || 'Regal Paan Neckline'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#ECE6DE]">
                <span className="text-[10px] text-[#7D726A] block">Sleeves & Hem Finish</span>
                <span className="font-semibold text-[#2D2825] truncate block mt-0.5">
                  {variation?.specs?.sleeve || 'Elbow Sheer with Horsehair Braid'}
                </span>
              </div>

              <div className="p-3 bg-white rounded-lg border border-[#ECE6DE]">
                <span className="text-[10px] text-[#7D726A] block">Internal Architecture</span>
                <span className="font-semibold text-[#2D2825] truncate block mt-0.5">
                  {variation?.specs?.lining || 'Mulmul Lining with 1.25" Grosgrain Stay'}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Milestone Craftsmanship Ledger */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#2D2825] pb-1 border-b border-[#ECE6DE] flex items-center justify-between">
              <span>Production Milestones Sign-off Ledger</span>
              <span className="text-xs font-sans font-normal text-[#7D726A]">
                {order.milestones?.filter((m) => m.status === 'COMPLETED' || m.completed).length} of {order.milestones?.length} Stages Completed
              </span>
            </h3>

            <div className="border border-[#ECE6DE] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] text-[#7D726A] font-semibold border-b border-[#ECE6DE]">
                    <th className="py-2.5 px-3">Stage #</th>
                    <th className="py-2.5 px-3">Craftsmanship Milestone</th>
                    <th className="py-2.5 px-3">Sign-off Status</th>
                    <th className="py-2.5 px-3 text-right">Completion Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECE6DE]">
                  {order.milestones?.map((m, idx) => {
                    const isDone = m.status === 'COMPLETED' || m.completed;
                    return (
                      <tr key={m.id || idx} className="hover:bg-[#FAF7F2]/50">
                        <td className="py-2 px-3 font-mono font-medium text-[#7D726A]">
                          0{idx + 1}
                        </td>
                        <td className="py-2 px-3 font-medium text-[#2D2825]">
                          {m.title || m.label || m.stage}
                          <p className="text-[10px] text-[#7D726A] font-light">
                            {m.description}
                          </p>
                        </td>
                        <td className="py-2 px-3">
                          <span className={`inline-flex items-center gap-1 font-semibold text-[11px] ${
                            isDone ? 'text-emerald-700' : 'text-[#8D2434]'
                          }`}>
                            {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                            {isDone ? 'Verified & Completed' : 'In Progress'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right text-[#7D726A] font-mono">
                          {m.completedAt
                            ? new Date(m.completedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                            : 'Pending'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Itemized Financial & Escrow Ledger */}
          <div className="space-y-3">
            <h3 className="font-serif text-base font-bold text-[#2D2825] pb-1 border-b border-[#ECE6DE]">
              Itemized Atelier & Escrow Ledger
            </h3>

            <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#ECE6DE] space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-[#ECE6DE]">
                <span className="text-[#7D726A]">Pure Luxury Fabric & Lining Sourcing</span>
                <span className="font-medium text-[#2D2825]">₹12,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ECE6DE]">
                <span className="text-[#7D726A]">Master Pattern Making, Cutting & Basting</span>
                <span className="font-medium text-[#2D2825]">₹6,500</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ECE6DE]">
                <span className="text-[#7D726A]">Hand Zardozi & Artisan Embellishment</span>
                <span className="font-medium text-[#2D2825]">₹14,000</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ECE6DE]">
                <span className="text-[#7D726A]">Corsetry Assembly, Horsehair Hem & Hand Finishing</span>
                <span className="font-medium text-[#2D2825]">₹5,500</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#ECE6DE]">
                <span className="text-[#7D726A]">Insured White Glove Courier & Archival Garment Bag</span>
                <span className="font-medium text-emerald-700">Complimentary</span>
              </div>

              <div className="flex justify-between pt-2 text-sm font-bold text-[#2D2825]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#8D2434]" />
                  <span>Total Escrow Amount:</span>
                </div>
                <span>₹{Number(order.totalAmount || 38000).toLocaleString('en-IN')}</span>
              </div>

              <div className="pt-2 text-[11px] text-[#7D726A] flex items-center justify-between border-t border-[#ECE6DE]">
                <span>Escrow Protection:</span>
                <span className="font-semibold text-emerald-800">
                  {isDelivered ? 'Funds Safely Disbursed Upon Fit Approval' : '100% Protected in Bharat Escrow Vault'}
                </span>
              </div>
            </div>
          </div>

          {/* 6. Guarantee Terms & Atelier Stamp */}
          <div className="pt-4 border-t-2 border-[#2D2825] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 text-xs text-[#7D726A]">
            <div className="space-y-0.5 max-w-sm">
              <span className="font-bold text-[#2D2825] block">
                Bespoke Fit Guarantee
              </span>
              <p className="font-light text-[11px] leading-relaxed">
                Every Pearl Pick! garment is backed by a 14-day complimentary alteration window. Crafted to your unique measurements under guild supervision.
              </p>
            </div>

            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l sm:border-[#ECE6DE] pt-2 sm:pt-0 sm:pl-4">
              <div className="font-serif italic text-base text-[#2D2825] font-bold">
                {order.tailorName}
              </div>
              <span className="text-[10px] text-[#7D726A] block">
                Master Couturier & Atelier Sign-off
              </span>
              <span className="text-[9px] font-mono text-[#D4AF37] block mt-0.5">
                STAMP: PP-ATELIER-VERIFIED-2026
              </span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
