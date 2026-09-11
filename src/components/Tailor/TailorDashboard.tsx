import React, { useState } from 'react';
import { 
  Scissors, 
  Sparkles, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  ShieldCheck, 
  FileText, 
  Plus, 
  Upload, 
  MessageCircle, 
  Star,
  Layers,
  ChevronRight,
  TrendingUp,
  Award
} from 'lucide-react';
import { 
  TailorProfile, 
  QuotationRequest, 
  Order, 
  OrderMilestone, 
  TailorQuotation 
} from '../../types';

interface TailorDashboardProps {
  currentTailor: TailorProfile;
  incomingRequests: QuotationRequest[];
  activeOrders: Order[];
  onOpenVerificationModal: () => void;
  onSubmitQuote: (requestId: string, quote: Omit<TailorQuotation, 'id' | 'createdAt'>) => void;
  onAdvanceMilestone: (orderId: string, milestoneId: string, photoProofUrl?: string) => void;
  onOpenChat: (customerId: string, customerName: string) => void;
}

export const TailorDashboard: React.FC<TailorDashboardProps> = ({
  currentTailor,
  incomingRequests,
  activeOrders,
  onOpenVerificationModal,
  onSubmitQuote,
  onAdvanceMilestone,
  onOpenChat,
}) => {
  const [selectedRequestForQuote, setSelectedRequestForQuote] = useState<QuotationRequest | null>(null);
  
  // Custom Quotation form state
  const [fabricAmount, setFabricAmount] = useState<number>(320);
  const [stitchingAmount, setStitchingAmount] = useState<number>(290);
  const [handworkAmount, setHandworkAmount] = useState<number>(140);
  const [finishingAmount, setFinishingAmount] = useState<number>(60);
  const [deliveryDays, setDeliveryDays] = useState<number>(14);
  const [tailorProposalNote, setTailorProposalNote] = useState<string>(
    'We will construct this with French seams, internal 12-bone corsetry, and provide a complimentary baste muslin fitting.'
  );

  // Photo proof mock state for milestone advance
  const [photoProofInput, setPhotoProofInput] = useState<string>(
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=800&auto=format&fit=crop&q=80'
  );

  const totalQuoteAmount = fabricAmount + stitchingAmount + handworkAmount + finishingAmount;

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequestForQuote) return;

    const newQuote: Omit<TailorQuotation, 'id' | 'createdAt'> = {
      requestId: selectedRequestForQuote.id,
      tailorId: currentTailor.id,
      tailorName: currentTailor.name,
      tailorShopName: currentTailor.shopName,
      tailorAvatar: currentTailor.avatar,
      tailorRating: currentTailor.rating,
      totalAmount: totalQuoteAmount,
      currency: 'USD',
      estimatedDeliveryDays: deliveryDays,
      proposedDeliveryDate: new Date(Date.now() + deliveryDays * 86400000).toISOString().split('T')[0],
      tailorMessage: tailorProposalNote,
      fabricIncluded: true,
      status: 'PENDING',
      items: [
        { id: `item-1`, description: `Premium ${selectedRequestForQuote.variation.specs.fabric} + Lining`, amount: fabricAmount, category: 'Fabric' },
        { id: `item-2`, description: `Master Pattern Drafting & Seam Construction`, amount: stitchingAmount, category: 'Stitching' },
        { id: `item-3`, description: `Hand ${selectedRequestForQuote.variation.specs.pattern}`, amount: handworkAmount, category: 'Embroidery & Handwork' },
        { id: `item-4`, description: `Hand-rolled Hems, Pressing & Couture Packaging`, amount: finishingAmount, category: 'Finishing' }
      ],
      milestones: [
        { title: 'Pattern Muslin & Fabric Sourced', percentage: 30, description: 'Fabric purchase and toile preparation' },
        { title: 'First Baste Fit Verification', percentage: 40, description: 'First fitting and seam assembly' },
        { title: 'Final Hand Finishing & Delivery', percentage: 30, description: 'Finishing, quality check, and packaging' }
      ]
    };

    onSubmitQuote(selectedRequestForQuote.id, newQuote);
    setSelectedRequestForQuote(null);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16">
      
      {/* Tailor Atelier Header Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-[32px] sm:rounded-[40px] p-6 sm:p-8 border border-[#4A3728]/10 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <img
              src={currentTailor.avatar}
              alt={currentTailor.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#4A3728]/20 shadow-xs"
            />
            {currentTailor.verificationStatus === 'VERIFIED' && (
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#4A3728] text-[#FBD7D1] flex items-center justify-center border-2 border-white shadow-xs">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3728]">
                {currentTailor.shopName}
              </h1>
              <span className="text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FBD7D1]/50 text-[#4A3728] border border-[#FBD7D1]">
                {currentTailor.verificationStatus}
              </span>
            </div>
            <p className="text-xs text-[#8C7A6B] mt-0.5 font-light">Master Tailor: {currentTailor.name} • {currentTailor.city}</p>
            <div className="flex items-center space-x-3 mt-2 text-xs text-[#594437]">
              <span className="flex items-center text-[#4A3728] font-bold">
                <Star className="w-3.5 h-3.5 fill-[#4A3728] mr-1" />
                {currentTailor.rating} ({currentTailor.reviewCount} reviews)
              </span>
              <span>•</span>
              <span className="font-light">{currentTailor.completedOrders} completed bespoke dresses</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 w-full md:w-auto">
          <button
            onClick={onOpenVerificationModal}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 px-5 py-3 rounded-full bg-[#F5F2ED] text-[#4A3728] border border-[#4A3728]/10 text-xs font-bold uppercase tracking-wider hover:bg-white transition-all shadow-xs cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-[#4A3728]" />
            <span>Update KYC Documents</span>
          </button>
        </div>
      </div>

      {/* Atelier Performance Statistics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-[24px] bg-white border border-[#4A3728]/10 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B]">Monthly Atelier Earnings</span>
          <p className="font-serif text-2xl font-bold text-[#4A3728] mt-1">$4,850.00</p>
          <span className="text-[10px] text-[#4A3728] font-semibold flex items-center space-x-1 mt-1">
            <TrendingUp className="w-3 h-3 text-[#4A3728]" />
            <span>+18.4% vs last month</span>
          </span>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#4A3728]/10 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B]">Active Escrow in Vault</span>
          <p className="font-serif text-2xl font-bold text-[#4A3728] mt-1">$1,620.00</p>
          <span className="text-[10px] text-[#8C7A6B] block mt-1 font-light">2 Garments in pipeline</span>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#4A3728]/10 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B]">Broadcast RFQs Available</span>
          <p className="font-serif text-2xl font-bold text-[#4A3728] mt-1">{incomingRequests.length}</p>
          <span className="text-[10px] text-[#4A3728] font-bold block mt-1">Ready for bidding</span>
        </div>

        <div className="p-5 rounded-[24px] bg-white border border-[#4A3728]/10 shadow-xs">
          <span className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B]">Avg Fit Precision Score</span>
          <p className="font-serif text-2xl font-bold text-[#4A3728] mt-1">4.98 / 5.0</p>
          <span className="text-[10px] text-[#8C7A6B] block mt-1 font-light">Top 1% Tier Atelier</span>
        </div>
      </div>

      {/* Section 1: Incoming Broadcast Dress Requests (RFQs) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3728]">
              Customer Dress Design Broadcasts ({incomingRequests.length})
            </h2>
            <p className="text-xs text-[#8C7A6B] font-light">Submit competitive itemized bids to customer design requests.</p>
          </div>
        </div>

        {incomingRequests.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-[32px] border border-[#4A3728]/10 text-xs text-[#8C7A6B] font-light">
            No pending broadcast quotation requests at this time.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {incomingRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-[32px] border border-[#4A3728]/10 p-6 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start space-x-3.5">
                    <img
                      src={req.variation.frontImageUrl}
                      alt={req.variation.name}
                      referrerPolicy="no-referrer"
                      className="w-20 h-20 rounded-2xl object-cover border border-[#4A3728]/10"
                    />
                    <div className="flex-1">
                      <span className="text-[9px] font-bold text-[#8C7A6B] uppercase tracking-wider">Customer: {req.customerName}</span>
                      <h3 className="font-serif text-base font-bold text-[#4A3728]">{req.variation.name}</h3>
                      <p className="text-xs text-[#6B584C] font-light">{req.variation.specs.dressType} • {req.variation.specs.fabric}</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#F5F2ED] text-xs text-[#594437] space-y-1 border border-[#4A3728]/5">
                    <p className="font-light"><strong className="font-bold text-[#4A3728]">Target Budget:</strong> ${req.targetBudget}</p>
                    <p className="font-light"><strong className="font-bold text-[#4A3728]">Delivery Deadline:</strong> {req.neededByDate}</p>
                    <p className="italic text-[#8C7A6B] font-light mt-1">"{req.specificInstructions}"</p>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedRequestForQuote(req)}
                  className="w-full py-3.5 rounded-full bg-[#4A3728] text-[#F5F2ED] font-bold text-xs uppercase tracking-wider hover:scale-95 transition-all flex items-center justify-center space-x-2 cursor-pointer shadow-xs"
                >
                  <FileText className="w-3.5 h-3.5 text-[#FBD7D1]" />
                  <span>Create Itemized Quotation</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Active Atelier Production Orders & Milestone Advancement */}
      <div className="space-y-4 pt-6 border-t border-[#4A3728]/10">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-[#4A3728]">
            Active Atelier Production Orders ({activeOrders.length})
          </h2>
          <p className="text-xs text-[#8C7A6B] font-light">Advance milestones, attach construction photo proofs, and trigger escrow releases.</p>
        </div>

        <div className="space-y-6">
          {activeOrders.map((order) => {
            const dressVar = order.variation || order.design;
            return (
              <div key={order.id} className="bg-white rounded-[32px] sm:rounded-[40px] border border-[#4A3728]/10 p-6 sm:p-7 shadow-xs space-y-6">
                
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#4A3728]/10">
                  <div className="flex items-center space-x-3.5">
                    <img
                      src={dressVar?.frontImageUrl || 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80'}
                      alt={dressVar?.name || 'Order Gown'}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-[#4A3728]/10"
                    />
                    <div>
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#8C7A6B]">Order #{order.id}</span>
                      <h3 className="font-serif text-lg font-bold text-[#4A3728]">{dressVar?.name || 'Bespoke Order'}</h3>
                      <p className="text-xs text-[#6B584C] font-light">Customer: <strong className="font-bold text-[#4A3728]">{order.customerName}</strong> • Escrow: <strong className="font-bold text-[#4A3728]">${order.totalAmount}</strong></p>
                    </div>
                  </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => onOpenChat(order.customerId, order.customerName)}
                    className="px-4 py-2 rounded-full bg-[#F5F2ED] text-[#4A3728] border border-[#4A3728]/10 text-xs font-bold uppercase tracking-wider hover:bg-white transition-all flex items-center space-x-2 shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-[#4A3728]" />
                    <span>Client Chat</span>
                  </button>
                </div>
              </div>

              {/* Milestones List */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                  Milestone Progression & Photo Proofs
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                  {order.milestones.map((m, mIdx) => {
                    const isDone = m.status === 'COMPLETED' || m.completed;
                    const isInProgress = m.status === 'IN_PROGRESS' || (!isDone && mIdx === order.milestones.findIndex(x => !x.completed && x.status !== 'COMPLETED'));
                    const milestoneKey = m.id || m.stage || `milestone-${order.id}-${mIdx}`;
                    const title = m.title || m.label || m.stage || `Stage ${mIdx + 1}`;
                    const displayStatus = isDone ? 'COMPLETED' : isInProgress ? 'IN_PROGRESS' : 'PENDING';
                    const proofUrl = m.photoProof || m.photoUrl;

                    return (
                      <div
                        key={milestoneKey}
                        className={`p-4 sm:p-5 rounded-[24px] border text-xs space-y-3 flex flex-col justify-between transition-all ${
                          isDone
                            ? 'bg-[#F5F2ED] border-[#4A3728]/20 shadow-xs'
                            : isInProgress
                            ? 'bg-white border-[#4A3728] shadow-sm'
                            : 'bg-white/60 border-[#4A3728]/10'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-[#4A3728]">{title}</span>
                            <span className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                              isDone ? 'bg-[#4A3728] text-[#FBD7D1]' : isInProgress ? 'bg-[#FBD7D1] text-[#4A3728]' : 'bg-[#F5F2ED] text-[#8C7A6B]'
                            }`}>
                              {displayStatus}
                            </span>
                          </div>
                          <p className="text-xs text-[#6B584C] font-light leading-relaxed">{m.description}</p>
                          {proofUrl && (
                            <img
                              src={proofUrl}
                              alt="Proof"
                              referrerPolicy="no-referrer"
                              className="w-full h-24 rounded-2xl object-cover mt-2 border border-[#4A3728]/10"
                            />
                          )}
                        </div>

                        {!isDone && (
                          <button
                            onClick={() => onAdvanceMilestone(order.id, m.id || m.stage || String(mIdx), photoProofInput)}
                            className="w-full py-2.5 rounded-full bg-[#4A3728] text-[#F5F2ED] font-bold text-[10px] uppercase tracking-wider hover:scale-95 transition-all flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 text-[#FBD7D1]" />
                            <span>Mark Complete & Upload Proof</span>
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          );
        })}
        </div>
      </div>

      {/* Itemized Quotation Creation Modal */}
      {selectedRequestForQuote && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#F5F2ED] rounded-[36px] sm:rounded-[44px] max-w-lg w-full border border-[#4A3728]/10 shadow-2xl p-6 sm:p-8 space-y-6 my-8">
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-[#4A3728]">
                  Create Itemized Quotation
                </h3>
                <p className="text-xs text-[#8C7A6B] font-light">
                  For {selectedRequestForQuote.customerName} • {selectedRequestForQuote.variation.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequestForQuote(null)}
                className="text-xs font-bold text-[#8C7A6B] hover:text-[#4A3728] uppercase tracking-wider cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleQuoteSubmit} className="space-y-4 text-xs">
              
              <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-[24px] border border-[#4A3728]/10 shadow-xs">
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block mb-1">Fabric & Lining ($)</label>
                  <input
                    type="number"
                    value={fabricAmount}
                    onChange={(e) => setFabricAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#F5F2ED] border border-[#4A3728]/10 text-[#4A3728] font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block mb-1">Master Stitching ($)</label>
                  <input
                    type="number"
                    value={stitchingAmount}
                    onChange={(e) => setStitchingAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#F5F2ED] border border-[#4A3728]/10 text-[#4A3728] font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block mb-1">Hand Embroidery ($)</label>
                  <input
                    type="number"
                    value={handworkAmount}
                    onChange={(e) => setHandworkAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#F5F2ED] border border-[#4A3728]/10 text-[#4A3728] font-bold focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="text-[9px] uppercase font-bold tracking-wider text-[#8C7A6B] block mb-1">Finishing & Steam ($)</label>
                  <input
                    type="number"
                    value={finishingAmount}
                    onChange={(e) => setFinishingAmount(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-[#F5F2ED] border border-[#4A3728]/10 text-[#4A3728] font-bold focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="p-4 rounded-[24px] bg-white border border-[#4A3728]/10 flex items-center justify-between shadow-xs">
                <span className="font-bold text-[#4A3728] uppercase text-[10px] tracking-wider">Total Bid Amount:</span>
                <span className="font-serif text-2xl font-bold text-[#4A3728]">${totalQuoteAmount} USD</span>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A6B] block mb-1">Turnaround Days</label>
                <input
                  type="number"
                  value={deliveryDays}
                  onChange={(e) => setDeliveryDays(Number(e.target.value))}
                  className="w-full p-3 rounded-2xl bg-white border border-[#4A3728]/10 text-[#4A3728] font-bold focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-[#8C7A6B] block mb-1">Tailor Message to Client</label>
                <textarea
                  value={tailorProposalNote}
                  onChange={(e) => setTailorProposalNote(e.target.value)}
                  rows={3}
                  className="w-full p-3.5 rounded-2xl bg-white border border-[#4A3728]/10 text-[#4A3728] text-xs focus:outline-none focus:border-[#4A3728] resize-none font-light leading-relaxed"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[#4A3728] text-[#F5F2ED] font-bold text-xs uppercase tracking-widest shadow-md hover:scale-95 transition-all cursor-pointer"
              >
                Submit Itemized Bid to Customer
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
